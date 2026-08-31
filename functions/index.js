const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const logger = require("firebase-functions/logger");

initializeApp();
const db = getFirestore();

setGlobalOptions({ region: "us-central1", maxInstances: 10 });

// =====================================================================
// HELPERS
// =====================================================================

function requireAuth(request) {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Login required.");
  }
}

function isAdmin(request) {
  return request.auth && request.auth.token && request.auth.token.admin === true;
}

function requireAdmin(request) {
  requireAuth(request);
  if (!isAdmin(request)) {
    throw new HttpsError("permission-denied", "Admin access required.");
  }
}

function requireString(value, fieldName) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpsError("invalid-argument", `${fieldName} is required.`);
  }
  return value.trim();
}

function generateTransactionId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 12; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Adds `months` calendar months to a Date, clamping the day-of-month to
// the shorter month when needed (e.g. Jan 31 + 1 month -> Feb 28/29).
function addMonthsClamped(baseDate, months, targetDay) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth() + months;
  const candidate = new Date(year, month, 1);
  const lastDayOfTargetMonth = new Date(
    candidate.getFullYear(),
    candidate.getMonth() + 1,
    0
  ).getDate();
  const day = Math.min(targetDay, lastDayOfTargetMonth);
  return new Date(candidate.getFullYear(), candidate.getMonth(), day, 12, 0, 0);
}

// Builds the full installment schedule for a DPS plan.
// plan = { installmentAmount, durationMonths, installmentDay, startDate (Timestamp|Date|string) }
function buildInstallmentSchedule(plan) {
  const amount = Number(plan.installmentAmount);
  const totalInstallments = Number(plan.durationMonths);
  const installmentDay = Number(plan.installmentDay);

  if (!amount || amount <= 0) {
    throw new HttpsError("failed-precondition", "Invalid installment amount on this DPS plan.");
  }
  if (!totalInstallments || totalInstallments <= 0) {
    throw new HttpsError("failed-precondition", "Invalid duration on this DPS plan.");
  }
  if (!installmentDay || installmentDay < 1 || installmentDay > 28) {
    throw new HttpsError("failed-precondition", "Invalid installment day on this DPS plan.");
  }

  let startDate;
  if (plan.startDate instanceof Timestamp) {
    startDate = plan.startDate.toDate();
  } else if (plan.startDate && typeof plan.startDate.toDate === "function") {
    startDate = plan.startDate.toDate();
  } else {
    startDate = new Date(plan.startDate);
  }

  if (isNaN(startDate.getTime())) {
    throw new HttpsError("failed-precondition", "Invalid start date on this DPS plan.");
  }

  const schedule = [];
  for (let i = 0; i < totalInstallments; i++) {
    const dueDate = addMonthsClamped(startDate, i, installmentDay);
    schedule.push({
      number: i + 1,
      dueDate: Timestamp.fromDate(dueDate),
      amount,
      status: "pending",
      paidAt: null,
      transactionId: null,
      method: null,
    });
  }

  return schedule;
}

async function writeAuditLog(shopId, entry) {
  await db.collection("shops").doc(shopId).collection("dpsAuditLog").add({
    ...entry,
    createdAt: FieldValue.serverTimestamp(),
  });
}

async function writeDpsNotification(shopId, entry) {
  await db.collection("shops").doc(shopId).collection("dpsNotifications").add({
    ...entry,
    isRead: false,
    createdAt: FieldValue.serverTimestamp(),
  });
}

// =====================================================================
// setAdminClaim
// -----------------------------------------------------------------------
// Grants (or revokes) the admin custom claim on a user.
//
// Two ways to call this successfully:
//   1. An existing admin calls it (request.auth.token.admin === true) to
//      promote/demote another user.
//   2. Nobody is an admin yet, so a one-time bootstrap secret is used
//      instead. Set this secret with:
//        firebase functions:secrets:set ADMIN_BOOTSTRAP_SECRET
//      or in functions/.env as ADMIN_BOOTSTRAP_SECRET=<a long random value>
//      Once your first admin exists, stop using the secret path — future
//      admins should be added by an existing admin, not the secret.
// =====================================================================
exports.setAdminClaim = onCall(async (request) => {
  requireAuth(request);

  const uid = requireString(request.data && request.data.uid, "uid");
  const grant = request.data && request.data.grant !== false; // default true
  const secret = request.data && request.data.secret;

  const callerIsAdmin = isAdmin(request);

  if (!callerIsAdmin) {
    const bootstrapSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
    if (!bootstrapSecret || !secret || secret !== bootstrapSecret) {
      throw new HttpsError(
        "permission-denied",
        "Only an existing admin, or a valid bootstrap secret, can set admin claims."
      );
    }
  }

  const auth = getAuth();
  const targetUser = await auth.getUser(uid).catch(() => null);
  if (!targetUser) {
    throw new HttpsError("not-found", "No user found with that uid.");
  }

  const existingClaims = targetUser.customClaims || {};
  await auth.setCustomUserClaims(uid, { ...existingClaims, admin: grant });

  logger.info("Admin claim updated", {
    targetUid: uid,
    grant,
    actorUid: request.auth.uid,
    viaBootstrapSecret: !callerIsAdmin,
  });

  return { success: true, uid, admin: grant };
});

// =====================================================================
// approveDps
// -----------------------------------------------------------------------
// Admin-only. Moves a pending DPS application to active, generates its
// full installment schedule, notifies the shop, and writes an audit log.
// =====================================================================
exports.approveDps = onCall(async (request) => {
  requireAdmin(request);

  const shopId = requireString(request.data && request.data.shopId, "shopId");
  const dpsId = requireString(request.data && request.data.dpsId, "dpsId");

  const dpsRef = db.collection("shops").doc(shopId).collection("savings").doc(dpsId);

  const result = await db.runTransaction(async (tx) => {
    const dpsSnap = await tx.get(dpsRef);
    if (!dpsSnap.exists) {
      throw new HttpsError("not-found", "DPS application not found.");
    }

    const dpsData = dpsSnap.data();

    if (dpsData.status !== "pending_admin_approval") {
      throw new HttpsError(
        "failed-precondition",
        `This application is already "${dpsData.status}" and cannot be approved again.`
      );
    }

    const plan = dpsData.plan || {};
    const schedule = buildInstallmentSchedule(plan);
    const totalTarget = Number(plan.installmentAmount) * schedule.length;

    const installmentsCol = dpsRef.collection("installments");
    schedule.forEach((installment) => {
      const instRef = installmentsCol.doc(String(installment.number).padStart(3, "0"));
      tx.set(instRef, installment);
    });

    tx.update(dpsRef, {
      status: "active",
      "review.status": "approved",
      "review.reviewedBy": request.auth.uid,
      "review.reviewedAt": FieldValue.serverTimestamp(),
      "review.rejectionReason": null,
      "plan.totalInstallments": schedule.length,
      "plan.maturityDate": schedule[schedule.length - 1].dueDate,
      "payment.paidInstallments": 0,
      "payment.totalPaid": 0,
      "payment.remainingAmount": totalTarget,
      "payment.nextInstallmentDate": schedule[0].dueDate,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { totalInstallments: schedule.length, firstDueDate: schedule[0].dueDate };
  });

  await writeDpsNotification(shopId, {
    dpsId,
    type: "dps_approved",
    title: "DPS আবেদন অনুমোদিত হয়েছে",
    message: "আপনার DPS আবেদনটি Admin কর্তৃক অনুমোদিত হয়েছে এবং এখন সক্রিয়।",
  });

  await writeAuditLog(shopId, {
    action: "DPS_APPROVED",
    dpsId,
    actor: request.auth.uid,
    actorType: "admin",
    metadata: { totalInstallments: result.totalInstallments },
  });

  logger.info("DPS approved", { shopId, dpsId, admin: request.auth.uid });

  return { success: true, ...result };
});

// =====================================================================
// rejectDps
// -----------------------------------------------------------------------
// Admin-only. Moves a pending DPS application to rejected with a
// required reason, notifies the shop, and writes an audit log.
// =====================================================================
exports.rejectDps = onCall(async (request) => {
  requireAdmin(request);

  const shopId = requireString(request.data && request.data.shopId, "shopId");
  const dpsId = requireString(request.data && request.data.dpsId, "dpsId");
  const reason = requireString(request.data && request.data.reason, "reason");

  const dpsRef = db.collection("shops").doc(shopId).collection("savings").doc(dpsId);

  await db.runTransaction(async (tx) => {
    const dpsSnap = await tx.get(dpsRef);
    if (!dpsSnap.exists) {
      throw new HttpsError("not-found", "DPS application not found.");
    }

    const dpsData = dpsSnap.data();

    if (dpsData.status !== "pending_admin_approval") {
      throw new HttpsError(
        "failed-precondition",
        `This application is already "${dpsData.status}" and cannot be rejected again.`
      );
    }

    tx.update(dpsRef, {
      status: "rejected",
      "review.status": "rejected",
      "review.reviewedBy": request.auth.uid,
      "review.reviewedAt": FieldValue.serverTimestamp(),
      "review.rejectionReason": reason,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  await writeDpsNotification(shopId, {
    dpsId,
    type: "dps_rejected",
    title: "DPS আবেদন বাতিল করা হয়েছে",
    message: reason,
  });

  await writeAuditLog(shopId, {
    action: "DPS_REJECTED",
    dpsId,
    actor: request.auth.uid,
    actorType: "admin",
    metadata: { reason },
  });

  logger.info("DPS rejected", { shopId, dpsId, admin: request.auth.uid, reason });

  return { success: true };
});

// =====================================================================
// collectInstallment
// -----------------------------------------------------------------------
// Called by the shop owner (or an admin) to record a manually collected
// installment payment (e.g. cash collected in person). This is NOT
// automatic debit — it requires an authenticated, explicit action, and
// all balance math happens server-side inside a transaction so the
// client can never forge a "paid" state or a balance number.
// =====================================================================
exports.collectInstallment = onCall(async (request) => {
  requireAuth(request);

  const shopId = requireString(request.data && request.data.shopId, "shopId");
  const dpsId = requireString(request.data && request.data.dpsId, "dpsId");
  const installmentId = requireString(request.data && request.data.installmentId, "installmentId");
  const method = (request.data && request.data.method) || "Cash";

  const callerIsAdmin = isAdmin(request);
  const callerIsOwner = request.auth.uid === shopId;

  if (!callerIsAdmin && !callerIsOwner) {
    throw new HttpsError("permission-denied", "You do not have access to this shop's DPS.");
  }

  const dpsRef = db.collection("shops").doc(shopId).collection("savings").doc(dpsId);
  const installmentRef = dpsRef.collection("installments").doc(installmentId);

  const result = await db.runTransaction(async (tx) => {
    const [dpsSnap, installmentSnap] = await Promise.all([tx.get(dpsRef), tx.get(installmentRef)]);

    if (!dpsSnap.exists) {
      throw new HttpsError("not-found", "DPS not found.");
    }
    if (!installmentSnap.exists) {
      throw new HttpsError("not-found", "Installment not found.");
    }

    const dpsData = dpsSnap.data();
    const installmentData = installmentSnap.data();

    if (dpsData.status !== "active") {
      throw new HttpsError("failed-precondition", "This DPS is not active.");
    }
    if (installmentData.status === "paid") {
      throw new HttpsError("failed-precondition", "This installment is already paid.");
    }

    const transactionId = generateTransactionId();
    const paidAt = FieldValue.serverTimestamp();

    tx.update(installmentRef, {
      status: "paid",
      paidAt,
      transactionId,
      method,
    });

    const currentPayment = dpsData.payment || {};
    const newPaidInstallments = Number(currentPayment.paidInstallments || 0) + 1;
    const newTotalPaid = Number(currentPayment.totalPaid || 0) + Number(installmentData.amount);
    const totalInstallments = Number(dpsData.plan && dpsData.plan.totalInstallments);
    const remainingAmount = Math.max(0, Number(currentPayment.remainingAmount || 0) - Number(installmentData.amount));

    const allPaid = totalInstallments > 0 && newPaidInstallments >= totalInstallments;

    const updates = {
      "payment.paidInstallments": newPaidInstallments,
      "payment.totalPaid": newTotalPaid,
      "payment.remainingAmount": remainingAmount,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (allPaid) {
      updates.status = "matured";
      updates["payment.nextInstallmentDate"] = null;
    } else {
      // find next pending installment's due date
      const nextInstallmentsQuery = await dpsRef
        .collection("installments")
        .where("status", "==", "pending")
        .orderBy("number", "asc")
        .limit(1)
        .get();

      if (!nextInstallmentsQuery.empty) {
        updates["payment.nextInstallmentDate"] = nextInstallmentsQuery.docs[0].data().dueDate;
      }
    }

    tx.update(dpsRef, updates);

    return { transactionId, allPaid, newPaidInstallments, newTotalPaid };
  });

  await writeAuditLog(shopId, {
    action: result.allPaid ? "DPS_MATURED" : "INSTALLMENT_PAYMENT_SUCCESS",
    dpsId,
    actor: request.auth.uid,
    actorType: callerIsAdmin ? "admin" : "shop_owner",
    metadata: {
      installmentId,
      transactionId: result.transactionId,
      method,
    },
  });

  if (result.allPaid) {
    await writeDpsNotification(shopId, {
      dpsId,
      type: "dps_matured",
      title: "DPS মেয়াদ পূর্ণ হয়েছে",
      message: "আপনার DPS-এর সকল কিস্তি পরিশোধ সম্পন্ন হয়েছে।",
    });
  }

  logger.info("Installment collected", {
    shopId,
    dpsId,
    installmentId,
    actor: request.auth.uid,
    matured: result.allPaid,
  });

  return { success: true, ...result };
});