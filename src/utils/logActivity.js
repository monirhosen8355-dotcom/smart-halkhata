import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export async function logActivity(shopUid, { action, customerName, customerId, amount = null }) {
  await addDoc(collection(db, "shops", shopUid, "activityLog"), {
    action,
    customerName,
    customerId,
    amount,
    createdAt: serverTimestamp(),
  });
}