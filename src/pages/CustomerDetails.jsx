import { useParams } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";
import { useContext, useEffect, useState } from "react";
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

const PAYMENT_METHODS = ["Cash", "bKash", "Nagad", "Bank", "Other"];

function CustomerDetails() {
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
    if (!window.confirm("Delete all transactions? This cannot be undone.")) return;

    const snapshot = await getDocs(
      collection(db, "shops", user.uid, "customers", id, "transactions")
    );
    for (const item of snapshot.docs) {
      await deleteDoc(item.ref);
    }

    const customerRef = doc(db, "shops", user.uid, "customers", id);
    await updateDoc(customerRef, { due: 0 });

    await logActivity(user.uid, {
      action: "Delete All Transactions",
      customerName: customer.name,
      customerId: id,
    });

    await loadCustomer();
    await loadTransactions();
    alert("All transactions deleted");
  };

  const handleDeleteTransaction = async (transaction) => {
    if (!window.confirm("Delete this transaction?")) return;

    const delta = transaction.type === "due" ? -transaction.amount : transaction.amount;

    const customerRef = doc(db, "shops", user.uid, "customers", id);
    await updateDoc(customerRef, { due: Number(customer.due) + delta });

    await deleteDoc(
      doc(db, "shops", user.uid, "customers", id, "transactions", transaction.id)
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

  const sendCustomerNotification = async (
  type,
  amount,
  totalDue
) => {
  await addDoc(
    collection(db, "notifications"),
    {
      customerId: customer.id,
      shopId: user.uid,
      shopName: profile.shopName,

      type,
      amount,
      totalDue,

      title: "Smart Halkhata",

      message:
        type === "due"
          ? `${profile.shopName} এ আপনার নামে ৳${amount} টাকা বাকি লেখা হয়েছে।`
          : `${profile.shopName} এ আপনার ৳${amount} টাকা জমা হয়েছে।`,

      createdAt: serverTimestamp(),
      isRead: false,
    }
  );
};

const handleAddDue = async () => {
    if (!amount || Number(amount) <= 0) return;

    const customerRef = doc(db, "shops", user.uid, "customers", id);
    await updateDoc(customerRef, { due: Number(customer.due) + Number(amount) });

    await addDoc(
      collection(db, "shops", user.uid, "customers", id, "transactions"),
      {
        type: "due",
        amount: Number(amount),
        balance: Number(customer.due) + Number(amount),
        status: "Success",
        note: dueNote.trim(),
        transactionId: generateTransactionId(),
        createdAt: serverTimestamp(),
createdDate: new Date().toISOString().split("T")[0],
      }
    );

    await logActivity(user.uid, {
      action: "Add Due",
      customerName: customer.name,
      customerId: id,
      amount: Number(amount),
    });

    setAmount("");
    setDueNote("");

    await loadCustomer();
    await loadTransactions();
  };

  const handlePayment = async () => {
    if (!payment || Number(payment) <= 0) return;
    if (Number(payment) > Number(customer.due)) {
      alert("Payment cannot be greater than due amount.");
      return;
    }

    const customerRef = doc(db, "shops", user.uid, "customers", id);
    await updateDoc(customerRef, { due: Number(customer.due) - Number(payment) });

    await addDoc(
      collection(db, "shops", user.uid, "customers", id, "transactions"),
      {
        type: "payment",
        amount: Number(payment),
        balance: Number(customer.due) - Number(payment),
        status: "Success",
        paymentMethod,
        note: paymentNote.trim(),
        transactionId: generateTransactionId(),
        createdAt: serverTimestamp(),
createdDate: new Date().toISOString().split("T")[0],
      }
    );

    await logActivity(user.uid, {
      action: "Receive Payment",
      customerName: customer.name,
      customerId: id,
      amount: Number(payment),
    });

    setPayment("");
    setPaymentMethod("Cash");
    setPaymentNote("");

    await loadCustomer();
    await loadTransactions();
  };

  if (!customer) return <h2 style={{ padding: "30px", fontFamily: "system-ui" }}>Loading...</h2>;

  const hasDue = Number(customer.due) > 0;

  return (
    <div className="cd-root">
      <style>{`
        * { box-sizing: border-box; }
        .cd-root {
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
          background: var(--bg);
          font-family: system-ui, -apple-system, sans-serif;
          padding: 16px 12px 110px;
        }
        @media (min-width: 640px) { .cd-root { padding: 24px 20px 40px; } }

        .cd-wrap { max-width: 720px; margin: 0 auto; }

        .cd-card {
          background: var(--card);
          border-radius: 16px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
          padding: 16px;
          margin-bottom: 14px;
        }
        @media (min-width: 640px) { .cd-card { padding: 22px; margin-bottom: 18px; } }

        .cd-profile-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .cd-avatar {
          width: 60px; height: 60px; border-radius: 50%;
          background: #EFF6FF; color: #2563EB;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 22px; flex-shrink: 0; object-fit: cover;
        }
        @media (min-width: 640px) { .cd-avatar { width: 76px; height: 76px; font-size: 28px; } }
        .cd-name { margin: 0; font-size: 17px; color: var(--text); }
        @media (min-width: 640px) { .cd-name { font-size: 20px; } }
        .cd-phone { margin: 3px 0 8px; color: var(--text); font-size: 12.5px; }
        .cd-due-badge {
          display: inline-block; padding: 5px 14px; border-radius: 999px;
          font-size: 12.5px; font-weight: 700;
        }
        .cd-due-badge.due { background: #FEF2F2; color: #DC2626; }
        .cd-due-badge.paid { background: #F0FDF4; color: #16A34A; }

        .cd-input {
          padding: 11px 13px; border-radius: 10px; border: 1px solid #E5E7EB;
          font-size: 13.5px; outline: none; width: 100%;
        }
        .cd-select { background: var(--card);}

        .cd-btn {
          padding: 12px; border-radius: 10px; border: none; color: #fff;
          font-weight: 700; font-size: 14px; cursor: pointer; width: 100%;
        }
        .cd-btn.small { padding: 9px 14px; font-size: 12.5px; width: auto; }
        .cd-btn.outline { background: var(--card); border: 1px solid #E5E7EB; color: var(--text); }
        .cd-btn.danger-outline { background: var(--card); border: 1px solid #FCA5A5; color: #DC2626; }

        .cd-field-label {
          font-size: 11.5px; font-weight: 700; color: var(--text);
          margin-bottom: 5px; display: block;
        }

        .cd-action-grid {
          display: grid; grid-template-columns: 1fr; gap: 14px;
        }
        @media (min-width: 640px) { .cd-action-grid { grid-template-columns: 1fr 1fr; } }

        .cd-field-stack { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }

        .cd-export-row {
          display: flex; gap: 8px; flex-wrap: wrap;
        }
        .cd-export-row > * { flex: 1 1 auto; min-width: 130px; }

        .cd-txn-list { display: flex; flex-direction: column; gap: 10px; }
        .cd-txn-card {
         background: var(--card); border-radius: 14px; border: 1px solid #E5E7EB;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
          padding: 14px; cursor: pointer;
        }
        .cd-txn-top {
          display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;
        }
        .cd-txn-type { font-size: 14px; font-weight: 700; color: var(--text); }
        .cd-txn-amount { font-size: 18px; font-weight: 800; white-space: nowrap; }
        .cd-txn-amount.in { color: #16A34A; }
        .cd-txn-amount.out { color: #DC2626; }
        .cd-txn-datetime { font-size: 11px; color: #9CA3AF; margin-top: 3px; }

        .cd-txn-badges { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
        .cd-mini-badge {
          font-size: 10.5px; font-weight: 700; padding: 3px 9px; border-radius: 999px;
        }
        .cd-mini-badge.status { background: #F0FDF4; color: #16A34A; }
        .cd-mini-badge.method { background: #EFF6FF; color: #2563EB; }
        .cd-txn-note { font-size: 12px; color: var(--text); margin-top: 7px; }

        .cd-empty { text-align: center; color: #9CA3AF; font-size: 13px; padding: 26px 16px; }

        .cd-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,.65);
          display: flex; align-items: center; justify-content: center;
          z-index: 999; padding: 14px;
        }
        .cd-modal {
          width: 100%; max-width: 400px; background: var(--card); border-radius: 20px;
          padding: 24px 20px; border: 1px solid #E5E7EB;
          box-shadow: 0 24px 60px rgba(0,0,0,0.25);
          max-height: 90vh; overflow-y: auto;
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
                    <button onClick={handleUpdateCustomer} className="cd-btn small" style={{ background: "#2563EB" }}>Save</button>
                    <button onClick={() => setIsEditingCustomer(false)} className="cd-btn small outline">Cancel</button>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} style={{ fontSize: "12px" }} />
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
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <h1 className="cd-name">{customer.name}</h1>
                    <button
                      onClick={() => { setEditName(customer.name); setEditPhone(customer.phone); setIsEditingCustomer(true); }}
                      className="cd-btn small outline"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="cd-phone">{customer.phone}</p>
                  <span className={`cd-due-badge ${hasDue ? "due" : "paid"}`}>
                    {hasDue ? `Due ৳${customer.due}` : "Fully Paid"}
                  </span>
                  <div
  style={{
    display: "flex",
    gap: "8px",
    marginTop: "10px",
    flexWrap: "wrap",
  }}
>
  <span className="cd-mini-badge method">
    📄 {transactions.length} TRX
  </span>

  <span className="cd-mini-badge status">
    💰 ৳{transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0)}
  </span>
</div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="cd-action-grid">
          <div className="cd-card">
            <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#111827", marginBottom: "10px" }}>➕ Unpaid Balance</div>
            <div className="cd-field-stack">
              <div>
                <label className="cd-field-label">Amount</label>
                <input type="number" placeholder="৳ 0" value={amount} onChange={(e) => setAmount(e.target.value)} className="cd-input" />
              </div>
              <div>
                <label className="cd-field-label">Note (optional)</label>
                <input placeholder="e.g. Rice 25kg, Cement" value={dueNote} onChange={(e) => setDueNote(e.target.value)} className="cd-input" />
              </div>
            </div>
            <button onClick={handleAddDue} className="cd-btn" style={{ background: "#DC2626" }}>Unpaid Balance</button>
          </div>

          <div className="cd-card">
            <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#111827", marginBottom: "10px" }}>💰 Receive Payment</div>
            <div className="cd-field-stack">
              <div>
                <label className="cd-field-label">Amount</label>
                <input type="number" placeholder="৳ 0" value={payment} onChange={(e) => setPayment(e.target.value)} className="cd-input" />
              </div>
              <div>
                <label className="cd-field-label">Payment Method</label>
                <select
  value={paymentMethod}
  onChange={(e) => setPaymentMethod(e.target.value)}
  className="cd-input"
  style={{
    background: "#FFFFFF",
    color: "#111827",
    border: "1px solid #D1D5DB",
    height: "48px",
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
                <label className="cd-field-label">Note (optional)</label>
                <input placeholder="e.g. Paid by bKash, Invoice 1005" value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} className="cd-input" />
              </div>
            </div>
            <button onClick={handlePayment} className="cd-btn" style={{ background: "#16A34A" }}>Receive Payment</button>
          </div>
        </div>

        <div className="cd-card">
          <div className="cd-export-row">
            <button onClick={handleExportExcel} className="cd-btn small" style={{ background: "#059669" }}>📊 Export Excel</button>

            <label className="cd-btn small" style={{ background: "#2563EB", opacity: isImporting ? 0.6 : 1, cursor: isImporting ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              {isImporting ? "Importing..." : "📥 Import Excel"}
              <input type="file" accept=".xlsx,.xls" onChange={handleImportExcel} disabled={isImporting} style={{ display: "none" }} />
            </label>

            <button onClick={handleDeleteAllTransactions} className="cd-btn small danger-outline">🗑 Delete All</button>
          </div>
        </div>
        <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#6B7280", margin: "4px 0 10px" }}>
          <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    gap: "10px",
    flexWrap: "wrap",
  }}
>
  <h3 style={{ margin: 0 }}>Transaction History</h3>

  <input
    type="text"
    placeholder="Search Transaction ID, Note, Amount..."
    value={searchTransaction}
    onChange={(e) => setSearchTransaction(e.target.value)}
    className="cd-input"
    style={{
      width: "260px",
      maxWidth: "100%",
    }}
  />
</div>

<div
  style={{
    display: "flex",
    gap: "8px",
    marginBottom: "15px",
    flexWrap: "wrap",
  }}
>
  <button
    onClick={() => setTransactionFilter("all")}
    className="cd-btn small"
    style={{
      background:
        transactionFilter === "all" ? "#2563EB" : "#E5E7EB",
      color:
        transactionFilter === "all" ? "#fff" : "#111827",
    }}
  >
    All
  </button>

  <button
    onClick={() => setTransactionFilter("payment")}
    className="cd-btn small"
    style={{
      background:
        transactionFilter === "payment" ? "#16A34A" : "#E5E7EB",
      color:
        transactionFilter === "payment" ? "#fff" : "#111827",
    }}
  >
    Payment
  </button>

  <button
    onClick={() => setTransactionFilter("due")}
    className="cd-btn small"
    style={{
      background:
        transactionFilter === "due" ? "#DC2626" : "#E5E7EB",
      color:
        transactionFilter === "due" ? "#fff" : "#111827",
    }}
  >
    Due
  </button>
</div>
        </div>

<select
  value={dateFilter}
  onChange={(e) => setDateFilter(e.target.value)}
  className="cd-input"
  style={{
    marginBottom: "15px",
    maxWidth: "220px",
  }}
>
  <option value="all">📅 All Dates</option>
  <option value="today">Today</option>
  <option value="7days">Last 7 Days</option>
  <option value="30days">Last 30 Days</option>
</select>

{transactions.length === 0 ? (
          <div className="cd-card cd-empty">No transactions yet.</div>
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
    matchDate =
      txDate.toDateString() === now.toDateString();
  }

  if (dateFilter === "7days") {
    matchDate =
      now - txDate <= 7 * 24 * 60 * 60 * 1000;
  }

  if (dateFilter === "30days") {
    matchDate =
      now - txDate <= 30 * 24 * 60 * 60 * 1000;
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
                <div key={transaction.id} className="cd-txn-card" onClick={() => setSelectedTransaction(transaction)}>
                  <div className="cd-txn-top">
                    <div>
                      <div className="cd-txn-type">{isPayment ? "💰 Payment Received" : "➕  ADuedded"}</div>
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
                      <div style={{ color: "var(--text)", fontSize: "12px", fontWeight: 600 }}>Amount</div>
                      <div style={{ fontSize: "36px", fontWeight: 800, color: "var(--text)", margin: "3px 0" }}>
                        ৳{selectedTransaction.amount}
                      </div>
                    </div>

                    <div style={{ fontSize: "13px", color: "var(--text)", lineHeight: 1.9 }}>
                      <div>
                        <strong>Transaction ID:</strong>{" "}
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
                      <div><strong>Date:</strong> {info?.date}</div>
                      <div><strong>Time:</strong> {info?.time}</div>
                      {selectedTransaction.paymentMethod && (
                        <div><strong>Payment Method:</strong> {selectedTransaction.paymentMethod}</div>
                      )}
                      {selectedTransaction.note && (
                        <div><strong>Note:</strong> {selectedTransaction.note}</div>
                      )}
                    </div>
                    

                    <button onClick={() => handleDownloadPDF(selectedTransaction)} className="cd-btn" style={{ background: "#111827", marginTop: "10px" }}>
                      Download PDF Receipt
                    </button>

                    <button onClick={() => setSelectedTransaction(null)} className="cd-btn outline" style={{ marginTop: "10px" }}>
                      Close
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