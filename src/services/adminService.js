// =====================================================================
// adminService.js
// -----------------------------------------------------------------------
// Admin Panel-এর জন্য সব Firestore/Cloud Functions call এখানে।
// এই file-এর কোনো ফাংশন সরাসরি DPS status/balance বদলায় না —
// approve/reject সবসময় Cloud Functions (approveDps/rejectDps) call করে,
// যেগুলো admin custom claim যাচাই করে।
// =====================================================================

import { db, functions } from "../firebase";
import {
  collectionGroup,
  doc,
  getDoc,
  onSnapshot,
  query,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { DPS_STATUS } from "../utils/dpsUtils";

// ---------------------------------------------------------------------
// Internal helper: turn a savings-subcollection doc snapshot into a
// plain object that also carries which shop it belongs to.
// -----------------------------------------------------------------------
// প্রতিটা DPS doc আসলে shops/{shopId}/savings/{dpsId} পথে থাকে, তাই
// doc.ref.parent.parent.id থেকে shopId বের করে নিতে হয় — নিজের data-তে
// shopId সেভ থাকে না।
// ---------------------------------------------------------------------
function mapDpsDoc(docSnap) {
  const shopId = docSnap.ref.parent.parent ? docSnap.ref.parent.parent.id : null;
  return { id: docSnap.id, shopId, ...docSnap.data() };
}

function isRealApplication(dps) {
  return dps.status !== "draft_uploading" && dps.status !== "draft_failed";
}

// ---------------------------------------------------------------------
// Realtime: all DPS applications across every shop (for AdminDPS.jsx)
// ---------------------------------------------------------------------

export function subscribeToAllDpsApplications(onData, onError) {
  const savingsGroup = collectionGroup(db, "savings");

  return onSnapshot(
    savingsGroup,
    (snap) => {
      const list = snap.docs
        .map(mapDpsDoc)
        .filter(isRealApplication)
        .sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;
          return bTime - aTime;
        });

      onData(list);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

// ---------------------------------------------------------------------
// Realtime: dashboard stats, derived from the same collectionGroup feed
// (for AdminDashboard.jsx)
// ---------------------------------------------------------------------

export function subscribeToAdminDashboardStats(onData, onError) {
  const savingsGroup = collectionGroup(db, "savings");

  return onSnapshot(
    savingsGroup,
    (snap) => {
      const list = snap.docs
        .map(mapDpsDoc)
        .filter(isRealApplication);

      const stats = {
        total: list.length,
        pending: 0,
        active: 0,
        rejected: 0,
        matured: 0,
        totalDeposited: 0,
      };

      list.forEach((dps) => {
        if (dps.status === DPS_STATUS.PENDING) stats.pending += 1;
        if (dps.status === DPS_STATUS.ACTIVE) stats.active += 1;
        if (dps.status === DPS_STATUS.REJECTED) stats.rejected += 1;
        if (dps.status === DPS_STATUS.MATURED) stats.matured += 1;

        if (
          dps.status === DPS_STATUS.ACTIVE ||
          dps.status === DPS_STATUS.MATURED
        ) {
          stats.totalDeposited += Number(
            (dps.payment && dps.payment.totalPaid) || 0
          );
        }
      });

      onData(stats);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

// ---------------------------------------------------------------------
// Fetch: one DPS application by shopId + dpsId (for AdminDPSDetails.jsx)
// ---------------------------------------------------------------------

export async function getAdminDpsById(shopId, dpsId) {
  const dpsRef = doc(db, "shops", shopId, "savings", dpsId);
  const snap = await getDoc(dpsRef);
  if (!snap.exists()) return null;
  return { id: snap.id, shopId, ...snap.data() };
}

// ---------------------------------------------------------------------
// Cloud Function calls: approve / reject
// -----------------------------------------------------------------------
// এই দুটোই functions/index.js-এ requireAdmin() দিয়ে সুরক্ষিত — admin
// claim ছাড়া কল করলে সার্ভার নিজেই "permission-denied" error ফেরত দেবে।
// ---------------------------------------------------------------------

export async function approveDpsApplication(shopId, dpsId) {
  const callable = httpsCallable(functions, "approveDps");
  const result = await callable({ shopId, dpsId });
  return result.data;
}

export async function rejectDpsApplication(shopId, dpsId, reason) {
  const callable = httpsCallable(functions, "rejectDps");
  const result = await callable({ shopId, dpsId, reason });
  return result.data;
}