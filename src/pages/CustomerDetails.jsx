import { useParams } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";
import { useContext, useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { AuthContext } from "../context/AuthContext";
import { db, storage } from "../firebase";
import { logActivity } from "../utils/logActivity";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  writeBatch,
  Timestamp,
  increment,
} from "firebase/firestore";

const generateTransactionId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 12; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

const formatDateTime = (timestamp) => {
  if (!timestamp) return null;
  const date = timestamp.toDate();
  return {
    day: date.toLocaleDateString("en-US", { weekday: "long" }),
    date: date.toLocaleDateString("en-US", {
      weekday: "short", day: "2-digit", month: "short", year: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    }),
  };
};

function CustomerDetails() {
  const { t, language } = useLanguage();
  const PAYMENT_METHODS =
  language === "বাংলা"
    ? ["নগদ", "বিকাশ", "নগদ (Nagad)", "ব্যাংক", "বিন্যান্স", "কার্ড", "অন্যান্য"]
    : ["Cash", "bKash", "Nagad", "Bank", "Binance", "Card", "Other"];
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [customer, setCustomer] = useState(null);
  const [amount, setAmount] = useState("");
  const [dueNote, setDueNote] = useState("");
  const [payment, setPayment] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentNote, setPaymentNote] = useState("");
  const [transactions, setTransactions] = useState([]);
const [searchTransaction, setSearchTransaction] = useState("");
const [transactionFilter, setTransactionFilter] = useState("all");
const [dateFilter, setDateFilter] = useState("all");
const [sortBy, setSortBy] = useState("newest");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isEditingTransaction, setIsEditingTransaction] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showAddDueModal, setShowAddDueModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadCustomer();
      loadTransactions();
    }
  }, [user]);

  const loadCustomer = async () => {
    const ref = doc(db, "shops", user.uid, "customers", id);
    const snap = await getDoc(ref);
    if (snap.exists()) setCustomer(snap.data());
  };

  const loadTransactions = async () => {
    const q = query(
      collection(db, "shops", user.uid, "customers", id, "transactions"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setTransactions(data);
  };

  const handleUpdateCustomer = async () => {
    if (!editName.trim() || !editPhone.trim()) return;

    const customerRef = doc(db, "shops", user.uid, "customers", id);
    await updateDoc(customerRef, {
      name: editName.trim(),
      phone: editPhone.trim(),
    });

    await logActivity(user.uid, {
      action: "Edit Customer",
      customerName: editName.trim(),
      customerId: id,
    });

    setIsEditingCustomer(false);
    await loadCustomer();
  };

  const handleUploadPhoto = async () => {
    if (!photoFile) return;
    setUploadingPhoto(true);
    try {
      const storageRef = ref(storage, `shops/${user.uid}/customers/${id}/photo.jpg`);
      await uploadBytes(storageRef, photoFile);
      const photoUrl = await getDownloadURL(storageRef);

      const customerRef = doc(db, "shops", user.uid, "customers", id);
      await updateDoc(customerRef, { photoUrl });

      setPhotoFile(null);
      await loadCustomer();
      alert("Photo uploaded");
    } catch (error) {
      console.error(error);
      alert("Upload failed: " + error.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

 const handleDeleteAllTransactions = async () => {
  if (
    !window.confirm(
      "Delete all transactions? This cannot be undone."
    )
  ) {
    return;
  }

  const snapshot = await getDocs(
    collection(
      db,
      "shops",
      user.uid,
      "customers",
      id,
      "transactions"
    )
  );

  const batch = writeBatch(db);

  snapshot.docs.forEach((item) => {
    batch.delete(item.ref);
  });

  await batch.commit();

  // History delete হবে,
  // কিন্তু customer-এর current due/balance অপরিবর্তিত থাকবে।

  await logActivity(user.uid, {
    action: "Delete All Transactions",
    customerName: customer.name,
    customerId: id,
  });

  await loadCustomer();
  await loadTransactions();

  alert("All transactions deleted");
};
const handleDeleteCustomer = async () => {
  if (!window.confirm(`"${customer.name}" delete করবেন?`)) return;

  const snapshot = await getDocs(
    collection(
      db,
      "shops",
      user.uid,
      "customers",
      id,
      "transactions"
    )
  );

  const batch = writeBatch(db);

  snapshot.docs.forEach((item) => {
    batch.delete(item.ref);
  });

  batch.delete(
    doc(db, "shops", user.uid, "customers", id)
  );

  await batch.commit();

  window.location.href = "/customers";
};
  const handleDeleteTransaction = async (transaction) => {
    if (!window.confirm("Delete this transaction?")) return;

    await deleteDoc(
  doc(
    db,
    "shops",
    user.uid,
    "customers",
    id,
    "transactions",
    transaction.id
  )
);

    await logActivity(user.uid, {
      action: "Delete Transaction",
      customerName: customer.name,
      customerId: id,
      amount: transaction.amount,
    });

    setSelectedTransaction(null);
    await loadCustomer();
    await loadTransactions();
  };

  const handleEditTransaction = async (transaction, newAmount) => {
    const amt = Number(newAmount);
    if (!amt || amt <= 0) return;

    const oldDelta = transaction.type === "due" ? transaction.amount : -transaction.amount;
    const newDelta = transaction.type === "due" ? amt : -amt;
    const dueAfterEdit = Number(customer.due) - oldDelta + newDelta;

    const customerRef = doc(db, "shops", user.uid, "customers", id);
    await updateDoc(customerRef, { due: dueAfterEdit });

    const txnRef = doc(db, "shops", user.uid, "customers", id, "transactions", transaction.id);
    await updateDoc(txnRef, {
      amount: amt,
      balance: dueAfterEdit,
      editedAt: serverTimestamp(),
    });

    await logActivity(user.uid, {
      action: "Edit Transaction",
      customerName: customer.name,
      customerId: id,
      amount: amt,
    });

    setSelectedTransaction(null);
    await loadCustomer();
    await loadTransactions();
  };

  const handleDownloadPDF = (transaction) => {
    const info = formatDateTime(transaction.createdAt);
    const receipt = new jsPDF();

    receipt.setFontSize(16);
    receipt.text("Payment Receipt", 20, 20);

    receipt.setFontSize(12);
    receipt.text(`Customer: ${customer.name}`, 20, 35);
    receipt.text(`Phone: ${customer.phone}`, 20, 43);
    receipt.text(
      `Type: ${transaction.type === "payment" ? "Payment Received" : "Due Added"}`, 20, 51
    );
    receipt.text(`Amount: Tk ${transaction.amount}`, 20, 59);
    receipt.text(`Transaction ID: ${transaction.transactionId}`, 20, 67);
    receipt.text(`Date: ${info?.date || ""}`, 20, 75);
    receipt.text(`Time: ${info?.time || ""}`, 20, 83);

    let y = 91;
    if (transaction.note) {
      receipt.text(`Note: ${transaction.note}`, 20, y);
      y += 8;
    }
    if (transaction.paymentMethod) {
      receipt.text(`Payment Method: ${transaction.paymentMethod}`, 20, y);
      y += 8;
    }

    receipt.save(`receipt-${transaction.transactionId}.pdf`);
  };

  const handleExportExcel = () => {
    const rows = transactions.map((transaction) => {
      const info = formatDateTime(transaction.createdAt);
      return {
        "Transaction ID": transaction.transactionId,
        Type: transaction.type === "payment" ? "Payment Received" : "Due Added",
        Amount: transaction.amount,
        Balance: transaction.balance,
        Status: transaction.status,
        Note: transaction.note || "",
        "Payment Method": transaction.paymentMethod || "",
        Date: info?.date || "",
        Time: info?.time || "",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, `${customer.name}-transactions.xlsx`);
  };

  const parseImportedDate = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return;

    setIsImporting(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      let runningDue = Number(customer.due) || 0;
      const validEntries = [];
      let skippedCount = 0;

      for (const row of rows) {
        const rawType = String(row["Type"] || "").trim().toLowerCase();
        const amount = Number(row["Amount"]);
        const isDue = rawType.includes("due");
        const isPayment = rawType.includes("payment");

        if ((!isDue && !isPayment) || !amount || amount <= 0) {
          skippedCount++;
          continue;
        }

        runningDue = isDue ? runningDue + amount : runningDue - amount;
        const importedDate = parseImportedDate(row["Date"]);

        validEntries.push({
          type: isDue ? "due" : "payment",
          amount,
          balance: runningDue,
          status: "Success",
          note: row["Note"] || "",
          paymentMethod: row["Payment Method"] || "",
          transactionId: String(row["Transaction ID"] || "").trim() || generateTransactionId(),
          createdAt: importedDate ? Timestamp.fromDate(importedDate) : serverTimestamp(),
        });
      }

      if (validEntries.length === 0) {
        alert("No valid rows found to import.");
        setIsImporting(false);
        return;
      }

      const batch = writeBatch(db);
      const txnCollectionRef = collection(db, "shops", user.uid, "customers", id, "transactions");

      validEntries.forEach((entry) => {
        const newDocRef = doc(txnCollectionRef);
        batch.set(newDocRef, entry);
      });

      const customerRef = doc(db, "shops", user.uid, "customers", id);
      batch.update(customerRef, { due: runningDue });

      await batch.commit();
      await loadCustomer();
      await loadTransactions();

      alert(`Imported ${validEntries.length} transaction(s). Skipped ${skippedCount} invalid row(s).`);
    } catch (error) {
      console.error(error);
      alert("Import failed: " + error.message);
    } finally {
      setIsImporting(false);
    }
  };

const handleAddDue = async () => {
  if (!amount || Number(amount) <= 0) return;

  const value = Number(amount);
  const newBalance = Number(customer.due) + value;
  const transactionId = generateTransactionId();

  const customerRef = doc(db, "shops", user.uid, "customers", id);

  await updateDoc(customerRef, {
    due: newBalance,
  });

  await addDoc(
    collection(db, "shops", user.uid, "customers", id, "transactions"),
    {
      type: "due",
      amount: value,
      balance: newBalance,
      status: "Success",
      note: dueNote.trim(),
      transactionId,
      createdAt: serverTimestamp(),
      createdDate: new Date().toISOString().split("T")[0],
    }
  );

  await logActivity(user.uid, {
    action: "Add Due",
    customerName: customer.name,
    customerId: id,
    amount: value,
  });

  setAmount("");
  setDueNote("");
  setShowAddDueModal(false);

  await loadCustomer();
  await loadTransactions();
};

  const handlePayment = async () => {
  
  if (!payment || Number(payment) <= 0) return;

  const value = Number(payment);

  if (value > Number(customer.due)) {
    alert("Payment cannot be greater than due amount.");
    return;
  }

  const newBalance = Number(customer.due) - value;
  const transactionId = generateTransactionId();

  const customerRef = doc(db, "shops", user.uid, "customers", id);

  await updateDoc(customerRef, {
    due: newBalance,
  });

  await addDoc(
    collection(db, "shops", user.uid, "customers", id, "transactions"),
    {
      type: "payment",
      amount: value,
      balance: newBalance,
      status: "Success",
      paymentMethod,
      note: paymentNote.trim(),
      transactionId,
      createdAt: serverTimestamp(),
      createdDate: new Date().toISOString().split("T")[0],
    }
  );

  await logActivity(user.uid, {
    action: "Receive Payment",
    customerName: customer.name,
    customerId: id,
    amount: value,
  });

  setPayment("" );
  setPaymentMethod("Cash");
  setPaymentNote("");
  setShowPaymentModal(false);

  await loadCustomer();
  await loadTransactions();
};

  if (!customer) return <h2 style={{ padding: "30px", fontFamily: "system-ui", color: "var(--text)" }}>Loading...</h2>;

  const hasDue = Number(customer.due) > 0;
  const totalReceived = transactions
    .filter((tx) => tx.type === "payment")
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  return (
    <div className="cd-root">
      <style>{`
        * { box-sizing: border-box; }
        .cd-root {
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
          background: var(--bg, #F3F4F6);
          color: var(--text, #111827);
          font-family: system-ui, -apple-system, sans-serif;
          padding: 16px 12px 110px;
        }
        @media (min-width: 640px) { .cd-root { padding: 24px 20px 60px; } }

        .cd-wrap { max-width: 720px; margin: 0 auto; }

        .cd-card {
          background: var(--card, #fff);
          color: var(--text, #111827);
          border-radius: 18px;
          border: 1px solid var(--border, rgba(127,127,127,0.18));
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          padding: 16px;
          margin-bottom: 14px;
        }
        @media (min-width: 640px) { .cd-card { padding: 22px; margin-bottom: 18px; } }

        .cd-card-title {
          font-size: 13.5px; font-weight: 700; color: var(--text, #111827); margin-bottom: 12px;
          display: flex; align-items: center; gap: 6px;
        }

        /* ============ Profile ============ */
        .cd-profile-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .cd-avatar {
          width: 58px; height: 58px; border-radius: 50%;
          background: rgba(37,99,235,0.14); color: #2563EB;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 21px; flex-shrink: 0; object-fit: cover;
        }
        @media (min-width: 640px) { .cd-avatar { width: 72px; height: 72px; font-size: 26px; } }

        .cd-name-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .cd-name { margin: 0; font-size: 17px; font-weight: 800; color: var(--text, #111827); }
        @media (min-width: 640px) { .cd-name { font-size: 20px; } }
        .cd-phone { margin: 3px 0 9px; color: var(--text-muted, #6B7280); opacity: 0.9; font-size: 12.5px; }

        .cd-due-badge {
          display: inline-block; padding: 5px 14px; border-radius: 999px;
          font-size: 12.5px; font-weight: 700;
        }
        .cd-due-badge.due { background: rgba(220,38,38,0.14); color: #EF4444; }
        .cd-due-badge.paid { background: rgba(22,163,74,0.14); color: #22C55E; }

        .cd-mini-badge {
          font-size: 10.5px; font-weight: 700; padding: 4px 10px; border-radius: 999px;
        }
        .cd-mini-badge.status { background: rgba(22,163,74,0.14); color: #22C55E; }
        .cd-mini-badge.method { background: rgba(37,99,235,0.14); color: #60A5FA; }

        /* ============ Inputs / buttons ============ */
        .cd-input {
          padding: 11px 13px; height: 44px; border-radius: 11px;
          border: 1.5px solid var(--border, rgba(127,127,127,0.22));
          background: var(--input-bg, rgba(127,127,127,0.06));
          color: var(--text, #111827);
          font-size: 13.5px; outline: none; width: 100%;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        }
        .cd-input::placeholder { color: var(--text-muted, #9CA3AF); opacity: 0.8; }
        .cd-input:focus {
          border-color: #2563EB;
          background: var(--card, #fff);
          box-shadow: 0 0 0 3px rgba(37,99,235,0.18);
        }

        .cd-btn {
          padding: 12px; border-radius: 11px; border: none; color: #fff;
          font-weight: 700; font-size: 13.5px; cursor: pointer; width: 100%;
          transition: opacity 0.15s ease, transform 0.12s ease;
        }
        .cd-btn:active { transform: scale(0.98); }
        .cd-btn.small { padding: 9px 14px; font-size: 12.5px; width: auto; }
        .cd-btn.outline {
          background: var(--input-bg, rgba(127,127,127,0.06));
          border: 1.5px solid var(--border, rgba(127,127,127,0.22));
          color: var(--text, #111827);
        }
        .cd-btn.danger-outline {
          background: var(--input-bg, rgba(220,38,38,0.06));
          border: 1.5px solid rgba(220,38,38,0.4);
          color: #EF4444;
        }

        .cd-field-label {
          font-size: 11.5px; font-weight: 700; color: var(--text-muted, #6B7280); opacity: 0.9;
          margin-bottom: 5px; display: block;
        }

        .cd-field-stack { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }

        /* ============ Quick action row (Add Due / Receive Payment buttons) ============ */
        .cd-quick-row {
          display: flex;
          gap: 10px;
        }
        .cd-quick-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 14px 10px;
          border-radius: 14px;
          border: none;
          font-weight: 700;
          font-size: 13.5px;
          cursor: pointer;
          color: #fff;
          box-shadow: 0 5px 14px rgba(0,0,0,0.15);
          transition: transform 0.12s ease, box-shadow 0.15s ease;
          white-space: nowrap;
        }
        .cd-quick-btn:active { transform: scale(0.97); }
        .cd-quick-btn.due { background: #DC2626; }
        .cd-quick-btn.payment { background: #16A34A; }
        @media (min-width: 480px) { .cd-quick-btn { padding: 15px 14px; font-size: 14.5px; } }

        .cd-export-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .cd-export-row > * { flex: 1 1 auto; min-width: 130px; }

        /* ============ Summary strip ============ */
        .cd-summary-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
        }
        @media (min-width: 480px) { .cd-summary-grid { grid-template-columns: repeat(3, 1fr); } }
        .cd-summary-box {
          border-radius: 13px;
          border: 1px solid var(--border, rgba(127,127,127,0.18));
          background: var(--input-bg, rgba(127,127,127,0.04));
          padding: 12px;
        }
        .cd-summary-label {
          font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;
          color: var(--text-muted, #6B7280); opacity: 0.85; margin-bottom: 4px;
        }
        .cd-summary-value { font-size: 16px; font-weight: 800; }
        .cd-summary-value.due { color: #EF4444; }
        .cd-summary-value.received { color: #22C55E; }
        .cd-summary-value.count { color: var(--text, #111827); }

        /* ============ Transaction list ============ */
        .cd-list-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 12px; gap: 10px; flex-wrap: wrap;
        }
        .cd-list-title { margin: 0; font-size: 15px; font-weight: 800; color: var(--text, #111827); }
        .cd-search-input { width: 220px; max-width: 100%; }

        .cd-chip-row { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
        .cd-chip {
          padding: 8px 14px; border-radius: 9px; font-size: 12px; font-weight: 700;
          cursor: pointer; border: 1.5px solid var(--border, rgba(127,127,127,0.22));
          background: var(--input-bg, rgba(127,127,127,0.05)); color: var(--text, #374151);
          transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
        }
        .cd-chip.active-all { background: #2563EB; border-color: #2563EB; color: #fff; }
        .cd-chip.active-payment { background: #16A34A; border-color: #16A34A; color: #fff; }
        .cd-chip.active-due { background: #DC2626; border-color: #DC2626; color: #fff; }

        .cd-date-select { max-width: 220px; margin-bottom: 14px; }

        .cd-txn-list { display: flex; flex-direction: column; gap: 10px; }
        .cd-txn-card {
          position: relative;
          background: var(--card, #fff); border-radius: 15px;
          border: 1px solid var(--border, rgba(127,127,127,0.18));
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          padding: 14px; padding-left: 16px; cursor: pointer;
          transition: box-shadow 0.15s ease, transform 0.12s ease;
        }
        .cd-txn-card::before {
          content: ""; position: absolute; left: 0; top: 10px; bottom: 10px; width: 3px; border-radius: 3px;
        }
        .cd-txn-card.payment::before { background: #22C55E; }
        .cd-txn-card.due::before { background: #EF4444; }
        @media (hover: hover) { .cd-txn-card:hover { box-shadow: 0 8px 20px rgba(0,0,0,0.1); } }
        .cd-txn-card:active { transform: scale(0.99); }

        .cd-txn-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
        .cd-txn-type { font-size: 13.5px; font-weight: 700; color: var(--text, #111827); }
        .cd-txn-amount { font-size: 17px; font-weight: 800; white-space: nowrap; }
        .cd-txn-amount.in { color: #22C55E; }
        .cd-txn-amount.out { color: #EF4444; }
        .cd-txn-datetime { font-size: 11px; color: var(--text-muted, #9CA3AF); opacity: 0.85; margin-top: 3px; }

        .cd-txn-badges { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
        .cd-txn-note { font-size: 12px; color: var(--text-muted, #4B5563); opacity: 0.9; margin-top: 7px; }

        .cd-empty { text-align: center; color: var(--text-muted, #9CA3AF); opacity: 0.85; font-size: 13px; padding: 26px 16px; }

        /* ============ Modal ============ */
        .cd-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,.6);
          backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 999; padding: 14px;
        }
        .cd-modal {
          width: 100%; max-width: 400px; background: var(--card, #fff); color: var(--text, #111827);
          border-radius: 22px; padding: 24px 20px;
          border: 1px solid var(--border, rgba(127,127,127,0.18));
          box-shadow: 0 24px 60px rgba(0,0,0,0.3);
          max-height: 90vh; overflow-y: auto;
        }
        .cd-modal-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px;
        }
        .cd-modal-title {
          margin: 0; font-size: 16px; font-weight: 800; color: var(--text, #111827);
          display: flex; align-items: center; gap: 7px;
        }
        .cd-modal-close {
          width: 30px; height: 30px; border-radius: 9px; border: none;
          background: var(--input-bg, rgba(127,127,127,0.08));
          color: var(--text, #111827); font-size: 15px; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
      `}</style>

      <div className="cd-wrap">
        <div className="cd-card">
          <div className="cd-profile-row">
            {customer.photoUrl ? (
              <img src={customer.photoUrl} alt={customer.name} className="cd-avatar" />
            ) : (
              <div className="cd-avatar">{(customer.name || "?").charAt(0).toUpperCase()}</div>
            )}

            <div style={{ flex: 1, minWidth: "180px" }}>
              {isEditingCustomer ? (
                <div className="cd-field-stack">
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Name" className="cd-input" />
                  <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Phone" className="cd-input" />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={handleUpdateCustomer} className="cd-btn small" style={{ background: "#2563EB" }}>{t("save")}</button>
                    <button onClick={() => setIsEditingCustomer(false)} className="cd-btn small outline">{t("cancel")}</button>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} style={{ fontSize: "12px", color: "var(--text)" }} />
                    <button
                      onClick={handleUploadPhoto}
                      disabled={!photoFile || uploadingPhoto}
                      className="cd-btn small"
                      style={{ background: "#059669", opacity: !photoFile || uploadingPhoto ? 0.5 : 1 }}
                    >
                      {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="cd-name-row">
                    <h1 className="cd-name">{customer.name}</h1>
                    <button
                      onClick={() => { setEditName(customer.name); setEditPhone(customer.phone); setIsEditingCustomer(true); }}
                      className="cd-btn small outline"
                    >
                     {t("edit")}
                    </button>
                    <button
                      onClick={handleDeleteCustomer}
                      className="cd-btn small"
                      style={{ background: "#DC2626", color: "#fff", border: "none" }}
                    >
                      Delete
                    </button>
                  </div>
                  <p className="cd-phone">{customer.phone}</p>
                  <span className={`cd-due-badge ${hasDue ? "due" : "paid"}`}>
                   {hasDue ? `${t("due")} ৳${customer.due}`: t("fullyPaid")}
                  </span>
                  <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                    <span className="cd-mini-badge method">📄 {transactions.length} TRX</span>
                    <span className="cd-mini-badge status">
                      💰 ৳{transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Compact financial summary */}
        <div className="cd-card">
          <div className="cd-summary-grid">
            <div className="cd-summary-box">
              <div className="cd-summary-label">{t("due")}</div>
              <div className="cd-summary-value due">৳{customer.due}</div>
            </div>
            <div className="cd-summary-box">
              <div className="cd-summary-label">Received</div>
              <div className="cd-summary-value received">৳{totalReceived}</div>
            </div>
            <div className="cd-summary-box" style={{ gridColumn: "1 / -1", maxWidth: "160px" }}>
              <div className="cd-summary-label">Transactions</div>
              <div className="cd-summary-value count">{transactions.length}</div>
            </div>
          </div>
        </div>

        {/* Quick action buttons — Add Due / Receive Payment */}
        <div className="cd-card">
          <div className="cd-quick-row">
            <button className="cd-quick-btn due" onClick={() => setShowAddDueModal(true)}>
              ➕ {t("addDue")}
            </button>
            <button className="cd-quick-btn payment" onClick={() => setShowPaymentModal(true)}>
              💰 {t("receivePayment")}
            </button>
          </div>
        </div>

        <div className="cd-card">
          <div className="cd-export-row">
            <button onClick={handleExportExcel} className="cd-btn small" style={{ background: "#059669" }}>📊 Export Excel</button>

            <label className="cd-btn small" style={{ background: "#2563EB", opacity: isImporting ? 0.6 : 1, cursor: isImporting ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              {isImporting ? "Importing..." : "📥 Import Excel"}
              <input type="file" accept=".xlsx,.xls" onChange={handleImportExcel} disabled={isImporting} style={{ display: "none" }} />
            </label>

            <button onClick={handleDeleteAllTransactions} className="cd-btn small danger-outline">{t("delete")}</button>
          </div>
        </div>

        <div className="cd-card">
          <div className="cd-list-header">
            <h3 className="cd-list-title">{t("transactionHistory")}</h3>
            <input
              type="text"
              placeholder={t("search")}
              value={searchTransaction}
              onChange={(e) => setSearchTransaction(e.target.value)}
              className="cd-input cd-search-input"
            />
          </div>

          <div className="cd-chip-row">
            <button
              onClick={() => setTransactionFilter("all")}
              className={`cd-chip ${transactionFilter === "all" ? "active-all" : ""}`}
            >
              All
            </button>
            <button
              onClick={() => setTransactionFilter("payment")}
              className={`cd-chip ${transactionFilter === "payment" ? "active-payment" : ""}`}
            >
              Payment
            </button>
            <button
              onClick={() => setTransactionFilter("due")}
              className={`cd-chip ${transactionFilter === "due" ? "active-due" : ""}`}
            >
              Due
            </button>
          </div>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="cd-input cd-date-select"
          >
            <option value="all">📅 All Dates</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>

          {transactions.length === 0 ? (
            <div className="cd-empty">{t("noTransactions")}</div>
          ) : (
            <div className="cd-txn-list">
              {transactions
                .filter((transaction) => {
                  const keyword = searchTransaction.trim().toLowerCase();

                  const matchSearch =
                    keyword === "" ||
                    transaction.transactionId?.toLowerCase().includes(keyword) ||
                    transaction.note?.toLowerCase().includes(keyword) ||
                    transaction.paymentMethod?.toLowerCase().includes(keyword) ||
                    String(transaction.amount).includes(keyword);

                  const matchFilter =
                    transactionFilter === "all" ||
                    transaction.type === transactionFilter;

                  let matchDate = true;

                  if (dateFilter !== "all" && transaction.createdAt) {
                    const txDate = transaction.createdAt.toDate();
                    const now = new Date();

                    if (dateFilter === "today") {
                      matchDate = txDate.toDateString() === now.toDateString();
                    }

                    if (dateFilter === "7days") {
                      matchDate = now - txDate <= 7 * 24 * 60 * 60 * 1000;
                    }

                    if (dateFilter === "30days") {
                      matchDate = now - txDate <= 30 * 24 * 60 * 60 * 1000;
                    }
                  }

                  return matchSearch && matchFilter && matchDate;
                })
                .sort((a, b) => {
                  if (sortBy === "newest") {
                    return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
                  }

                  if (sortBy === "oldest") {
                    return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
                  }

                  if (sortBy === "high") {
                    return Number(b.amount) - Number(a.amount);
                  }

                  if (sortBy === "low") {
                    return Number(a.amount) - Number(b.amount);
                  }

                  return 0;
                })
                .map((transaction) => {
                  const dateInfo = formatDateTime(transaction.createdAt);
                  const isPayment = transaction.type === "payment";

                  return (
                    <div
                      key={transaction.id}
                      className={`cd-txn-card ${isPayment ? "payment" : "due"}`}
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      <div className="cd-txn-top">
                        <div>
                          <div className="cd-txn-type">
                            {isPayment ? `💰 ${t("paymentReceived")}` : `➕ ${t("dueAdded")}`}
                          </div>
                          <div className="cd-txn-datetime">{dateInfo?.date} • {dateInfo?.time?.slice(0, 5)}</div>
                        </div>
                        <div className={`cd-txn-amount ${isPayment ? "in" : "out"}`}>
                          {isPayment ? "+" : "-"}৳{transaction.amount}
                        </div>
                      </div>

                      <div className="cd-txn-badges">
                        <span className="cd-mini-badge status">✔ {transaction.status}</span>
                        {isPayment && transaction.paymentMethod && (
                          <span className="cd-mini-badge method">{transaction.paymentMethod}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Add Due modal */}
        {showAddDueModal && (
          <div className="cd-modal-overlay" onClick={() => setShowAddDueModal(false)}>
            <div className="cd-modal" onClick={(e) => e.stopPropagation()}>
              <div className="cd-modal-header">
                <h2 className="cd-modal-title">➕ {t("addDue")}</h2>
                <button className="cd-modal-close" onClick={() => setShowAddDueModal(false)}>✕</button>
              </div>

              <div className="cd-field-stack">
                <div>
                  <label className="cd-field-label">{t("amount")}</label>
                  <input type="number" placeholder="৳ 0" value={amount} onChange={(e) => setAmount(e.target.value)} className="cd-input" />
                </div>
                <div>
                  <label className="cd-field-label">{t("note")}</label>
                  <input placeholder="e.g. Rice 25kg, Cement" value={dueNote} onChange={(e) => setDueNote(e.target.value)} className="cd-input" />
                </div>
              </div>
              <button onClick={handleAddDue} className="cd-btn" style={{ background: "#DC2626" }}>
                {t("addDue")}
              </button>
            </div>
          </div>
        )}

        {/* Receive Payment modal */}
        {showPaymentModal && (
          <div className="cd-modal-overlay" onClick={() => setShowPaymentModal(false)}>
            <div className="cd-modal" onClick={(e) => e.stopPropagation()}>
              <div className="cd-modal-header">
                <h2 className="cd-modal-title">💰 {t("receivePayment")}</h2>
                <button className="cd-modal-close" onClick={() => setShowPaymentModal(false)}>✕</button>
              </div>

              <div className="cd-field-stack">
                <div>
                  <label className="cd-field-label">{t("amount")}</label>
                  <input type="number" placeholder="৳ 0" value={payment} onChange={(e) => setPayment(e.target.value)} className="cd-input" />
                </div>
                <div>
                  <label className="cd-field-label">{t("paymentMethod")}</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="cd-input"
                    style={{
                      background: "#FFFFFF",
                      color: "#111827",
                      border: "1px solid #D1D5DB",
                      height: "44px",
                      appearance: "auto",
                      WebkitAppearance: "menulist",
                    }}
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option
                        key={m}
                        value={m}
                        style={{
                          background: "#FFFFFF",
                          color: "#111827",
                        }}
                      >
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="cd-field-label">{t("note")}</label>
                  <input placeholder="e.g. Paid by bKash, Invoice 1005" value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} className="cd-input" />
                </div>
              </div>
              <button onClick={handlePayment} className="cd-btn" style={{ background: "#16A34A" }}>
                {t("receivePayment")}
              </button>
            </div>
          </div>
        )}

        {selectedTransaction && (
          <div className="cd-modal-overlay" onClick={() => setSelectedTransaction(null)}>
            <div className="cd-modal" onClick={(e) => e.stopPropagation()}>
              <div style={{ textAlign: "center", marginBottom: "18px" }}>
                <div style={{
                  width: "64px", height: "64px", margin: "0 auto 12px", borderRadius: "50%",
                  background: selectedTransaction.type === "payment" ? "#16A34A" : "#DC2626",
                  display: "flex", justifyContent: "center", alignItems: "center", fontSize: "30px", color: "#fff",
                }}>
                  {selectedTransaction.type === "payment" ? "✓" : "৳"}
                </div>
                <h2 style={{ margin: 0, fontSize: "18px", color: "var(--text)" }}>
                  {selectedTransaction.type === "payment" ? "Payment Received" : "Due Added"}
                </h2>
              </div>

              {(() => {
                const info = formatDateTime(selectedTransaction.createdAt);
                return (
                  <>
                    <div style={{ textAlign: "center", marginBottom: "18px" }}>
                      <div style={{ color: "var(--text)", fontSize: "12px", fontWeight: 600, opacity: 0.75 }}>Amount</div>
                      <div style={{ fontSize: "36px", fontWeight: 800, color: "var(--text)", margin: "3px 0" }}>
                        ৳{selectedTransaction.amount}
                      </div>
                    </div>

                    <div style={{ fontSize: "13px", color: "var(--text)", lineHeight: 1.9 }}>
                      <div>
                        <strong>{t("transactionId")}:</strong>{" "}
                        <span
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(selectedTransaction.transactionId);
                              alert("Transaction ID Copied");
                            } catch (err) {
                              const textArea = document.createElement("textarea");
                              textArea.value = selectedTransaction.transactionId;
                              document.body.appendChild(textArea);
                              textArea.select();
                              document.execCommand("copy");
                              document.body.removeChild(textArea);
                              alert("Transaction ID Copied");
                            }
                          }}
                          style={{ cursor: "pointer", color: "#2563EB", fontWeight: 700 }}
                        >
                          {selectedTransaction.transactionId} 📋
                        </span>
                      </div>
                      <div><strong>{t("date")}:</strong> {info?.date}</div>
                      <div><strong>{t("time")}:</strong> {info?.time}</div>
                      {selectedTransaction.paymentMethod && (
                        <div><strong>{t("paymentMethod")}:</strong> {selectedTransaction.paymentMethod}</div>
                      )}
                      {selectedTransaction.note && (
                        <div><strong>Note:</strong> {selectedTransaction.note}</div>
                      )}
                    </div>

                    <button onClick={() => handleDownloadPDF(selectedTransaction)} className="cd-btn" style={{ background: "#111827", marginTop: "14px" }}>
                      {t("downloadReceipt")}
                    </button>

                    <button onClick={() => setSelectedTransaction(null)} className="cd-btn outline" style={{ marginTop: "10px" }}>
                     {t("close")}
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}

export default CustomerDetails;