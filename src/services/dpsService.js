// =====================================================================
// dpsService.js
// -----------------------------------------------------------------------
// সব Firestore/Storage call এক জায়গায় — DPS/Savings-সংক্রান্ত।
// এই file কখনো status/balance নিজে বদলায় না (approve/reject/collect
// শুধুই Cloud Functions করে) — এখানে শুধু: create application,
// document upload, data fetch।
// =====================================================================

import { db, storage, functions } from "../firebase";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { httpsCallable } from "firebase/functions";
import { isAllowedImageFile } from "../utils/dpsUtils";

// ---------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------

// docType উদাহরণ: "customerNidFront", "customerNidBack", "nomineeNidFront",
// "nomineeNidBack"
export async function uploadDpsDocument(shopId, dpsId, docType, file) {
  if (!isAllowedImageFile(file)) {
    throw new Error(
      "শুধুমাত্র JPG/PNG/WEBP ছবি আপলোড করা যাবে, সর্বোচ্চ সাইজ ৫ মেগাবাইট।"
    );
  }

  const extension = file.name.split(".").pop();
const path = `shops/${shopId}/dps/${dpsId}/${docType}/${docType}.${extension}`;  
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return { path, url };
}

// ---------------------------------------------------------------------
// Create a new DPS application
// -----------------------------------------------------------------------
// ধাপ:
//   1. প্রথমে savings collection-এ একটা খালি doc বানাই (যাতে dpsId পাই,
//      সেই dpsId দিয়েই Storage-এ document upload হবে)
//   2. সব document upload করি (customer NID front/back, nominee NID
//      front/back)
//   3. সবশেষে সম্পূর্ণ তথ্য দিয়ে doc update করি, status:
//      "pending_admin_approval"
//
// formData শেপ (DPSCreate.jsx থেকে আসবে):
// {
//   customer: { name, phone, address, nidType, nidNumber },
//   nominee: { name, relation, phone, nidType, nidNumber },
//   plan: { installmentAmount, durationMonths, installmentDay, startDate },
//   files: {
//     customerNidFront, customerNidBack,
//     nomineeNidFront, nomineeNidBack   // File objects
//   },
//   consent: { agreedAt: Date, agreedText: string }
// }
// ---------------------------------------------------------------------

export async function createDpsApplication(shopId, formData) {
  const savingsCol = collection(db, "shops", shopId, "savings");

  const dpsRef = doc(savingsCol);
  const dpsId = dpsRef.id;

  await setDoc(dpsRef, {
    shopId,
    status: "pending_admin_approval",

    customer: {
      name: formData.customer.name,
      phone: formData.customer.phone,
      address: formData.customer.address || "",
      nidType: formData.customer.nidType,
      nidNumber: formData.customer.nidNumber,
      documents: {
        nidFront: "",
        nidBack: "",
      },
    },

    nominee: {
      name: formData.nominee.name,
      relation: formData.nominee.relation,
      phone: formData.nominee.phone || "",
      nidType: formData.nominee.nidType,
      nidNumber: formData.nominee.nidNumber,
      documents: {
        nidFront: "",
        nidBack: "",
      },
    },

    plan: {
      installmentAmount: Number(formData.plan.installmentAmount),
      durationMonths: Number(formData.plan.durationMonths),
      installmentDay: Number(formData.plan.installmentDay),
      startDate: formData.plan.startDate,
      totalInstallments: null,
      maturityDate: null,
    },

    payment: {
      paidInstallments: 0,
      totalPaid: 0,
      remainingAmount: 0,
      nextInstallmentDate: null,
    },

    review: {
      status: "pending",
      reviewedBy: null,
      reviewedAt: null,
      rejectionReason: null,
    },

    autoDebit: {
      status: "pending_provider_setup",
    },

    consent: {
      agreedAt: formData.consent.agreedAt || serverTimestamp(),
      agreedText: formData.consent.agreedText,
    },

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return dpsId;
}   

// ---------------------------------------------------------------------
// Fetch: DPS list for one shop (shop-owner side)
// ---------------------------------------------------------------------

export async function getDpsList(shopId) {
  const savingsCol = collection(db, "shops", shopId, "savings");
  const q = query(savingsCol, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((dps) => dps.status !== "draft_uploading" && dps.status !== "draft_failed");
}

// Realtime version — DPS.jsx-এ list live update দেখানোর জন্য চাইলে ব্যবহার করা যায়
export function subscribeToDpsList(shopId, callback) {
  const savingsCol = collection(db, "shops", shopId, "savings");
  const q = query(savingsCol, orderBy("createdAt", "desc"));

  return onSnapshot(q, (snap) => {
    const list = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((dps) => dps.status !== "draft_uploading" && dps.status !== "draft_failed");
    callback(list);
  });
}

// ---------------------------------------------------------------------
// Fetch: one DPS by id
// ---------------------------------------------------------------------

export async function getDpsById(shopId, dpsId) {
  const dpsRef = doc(db, "shops", shopId, "savings", dpsId);
  const snap = await getDoc(dpsRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export function subscribeToDps(shopId, dpsId, callback) {
  const dpsRef = doc(db, "shops", shopId, "savings", dpsId);
  return onSnapshot(dpsRef, (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
}

// ---------------------------------------------------------------------
// Fetch: installment schedule for one DPS
// ---------------------------------------------------------------------

export async function getInstallments(shopId, dpsId) {
  const installmentsCol = collection(db, "shops", shopId, "savings", dpsId, "installments");
  const q = query(installmentsCol, orderBy("number", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribeToInstallments(shopId, dpsId, callback) {
  const installmentsCol = collection(db, "shops", shopId, "savings", dpsId, "installments");
  const q = query(installmentsCol, orderBy("number", "asc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// ---------------------------------------------------------------------
// Notifications (shop-owner side)
// ---------------------------------------------------------------------

export async function getDpsNotifications(shopId, max = 10) {
  const notifCol = collection(db, "shops", shopId, "dpsNotifications");
  const q = query(notifCol, orderBy("createdAt", "desc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribeToDpsNotifications(shopId, callback, max = 10) {
  const notifCol = collection(db, "shops", shopId, "dpsNotifications");
  const q = query(notifCol, orderBy("createdAt", "desc"), limit(max));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function markNotificationRead(shopId, notificationId) {
  const notifRef = doc(db, "shops", shopId, "dpsNotifications", notificationId);
  await updateDoc(notifRef, { isRead: true });
}

// ---------------------------------------------------------------------
// Cloud Function call: collect an installment payment
// -----------------------------------------------------------------------
// এটাই একমাত্র জায়গা যেখান থেকে shop owner কোনো installment "paid" করতে
// পারে — বাকি সব logic (balance আপডেট, matured check) সার্ভারে হয়।
// ---------------------------------------------------------------------

export async function collectInstallment(shopId, dpsId, installmentId, method = "Cash") {
  const callable = httpsCallable(functions, "collectInstallment");
  const result = await callable({ shopId, dpsId, installmentId, method });
  return result.data;
}