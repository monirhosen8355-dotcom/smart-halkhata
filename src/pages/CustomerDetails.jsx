import { useParams } from "react-router-dom";
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
    id += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  return id;
};

const formatDateTime = (timestamp) => {
  if (!timestamp) return null;

  const date = timestamp.toDate();

  return {
    day: date.toLocaleDateString("en-US", {
      weekday: "long",
    }),

    date: date.toLocaleDateString("en-US", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
}),

    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };
};

function CustomerDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [customer, setCustomer] = useState(null);
  const [amount, setAmount] = useState("");
  const [payment, setPayment] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] =
  useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isEditingTransaction, setIsEditingTransaction] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [hoveredTxn, setHoveredTxn] = useState(null);

  useEffect(() => {
    if (user) {
      loadCustomer();
      loadTransactions();
    }
  }, [user]);

  // =====================
  // Load Customer
  // =====================
  const loadCustomer = async () => {
    const ref = doc(
      db,
      "shops",
      user.uid,
      "customers",
      id
    );

    const snap = await getDoc(ref);

    if (snap.exists()) {
      setCustomer(snap.data());
    }
  };

  // =====================
  // Load Transactions
  // =====================
  const loadTransactions = async () => {
    const q = query(
      collection(
        db,
        "shops",
        user.uid,
        "customers",
        id,
        "transactions"
      ),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setTransactions(data);
  };

  // =====================
  // Edit Customer
  // =====================
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

  // =====================
  // Customer Photo
  // =====================
  const handleUploadPhoto = async () => {
    if (!photoFile) return;

    setUploadingPhoto(true);

    try {
      const storageRef = ref(
        storage,
        `shops/${user.uid}/customers/${id}/photo.jpg`
      );

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

  // =====================
  // Delete All Transactions
  // =====================
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

  // =====================
  // Delete Single Transaction
  // =====================
  const handleDeleteTransaction = async (transaction) => {
    if (!window.confirm("Delete this transaction?")) return;

    const delta =
      transaction.type === "due" ? -transaction.amount : transaction.amount;

    const customerRef = doc(db, "shops", user.uid, "customers", id);
    await updateDoc(customerRef, {
      due: Number(customer.due) + delta,
    });

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

  // =====================
  // Edit Transaction
  // =====================
  const handleEditTransaction = async (transaction, newAmount) => {
    const amt = Number(newAmount);
    if (!amt || amt <= 0) return;

    const oldDelta = transaction.type === "due" ? transaction.amount : -transaction.amount;
    const newDelta = transaction.type === "due" ? amt : -amt;
    const dueAfterEdit = Number(customer.due) - oldDelta + newDelta;

    const customerRef = doc(db, "shops", user.uid, "customers", id);
    await updateDoc(customerRef, { due: dueAfterEdit });

    const txnRef = doc(
      db,
      "shops",
      user.uid,
      "customers",
      id,
      "transactions",
      transaction.id
    );
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

  // =====================
  // PDF Receipt
  // =====================
  const handleDownloadPDF = (transaction) => {
    const info = formatDateTime(transaction.createdAt);
    const receipt = new jsPDF();

    receipt.setFontSize(16);
    receipt.text("Payment Receipt", 20, 20);

    receipt.setFontSize(12);
    receipt.text(`Customer: ${customer.name}`, 20, 35);
    receipt.text(`Phone: ${customer.phone}`, 20, 43);
    receipt.text(
      `Type: ${transaction.type === "payment" ? "Payment Received" : "Due Added"}`,
      20,
      51
    );
    receipt.text(`Amount: Tk ${transaction.amount}`, 20, 59);
    receipt.text(`Transaction ID: ${transaction.transactionId}`, 20, 67);
    receipt.text(`Date: ${info?.date || ""}`, 20, 75);
    receipt.text(`Time: ${info?.time || ""}`, 20, 83);

    receipt.save(`receipt-${transaction.transactionId}.pdf`);
  };

  // =====================
  // Excel Export
  // =====================
  const handleExportExcel = () => {
    const rows = transactions.map((transaction) => {
      const info = formatDateTime(transaction.createdAt);

      return {
        "Transaction ID": transaction.transactionId,
        Type: transaction.type === "payment" ? "Payment Received" : "Due Added",
        Amount: transaction.amount,
        Balance: transaction.balance,
        Status: transaction.status,
        Date: info?.date || "",
        Time: info?.time || "",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, `${customer.name}-transactions.xlsx`);
  };

  // =====================
  // Excel Import
  // =====================
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
          transactionId:
            String(row["Transaction ID"] || "").trim() ||
            generateTransactionId(),
          createdAt: importedDate
            ? Timestamp.fromDate(importedDate)
            : serverTimestamp(),
        });
      }

      if (validEntries.length === 0) {
        alert("No valid rows found to import.");
        setIsImporting(false);
        return;
      }

      const batch = writeBatch(db);
      const txnCollectionRef = collection(
        db,
        "shops",
        user.uid,
        "customers",
        id,
        "transactions"
      );

      validEntries.forEach((entry) => {
        const newDocRef = doc(txnCollectionRef);
        batch.set(newDocRef, entry);
      });

      const customerRef = doc(db, "shops", user.uid, "customers", id);
      batch.update(customerRef, { due: runningDue });

      await batch.commit();

      await loadCustomer();
      await loadTransactions();

      alert(
        `Imported ${validEntries.length} transaction(s). Skipped ${skippedCount} invalid row(s).`
      );
    } catch (error) {
      console.error(error);
      alert("Import failed: " + error.message);
    } finally {
      setIsImporting(false);
    }
  };

  // =====================
  // Add Due
  // =====================
  const handleAddDue = async () => {
    if (!amount || Number(amount) <= 0) return;

    const customerRef = doc(
      db,
      "shops",
      user.uid,
      "customers",
      id
    );

    await updateDoc(customerRef, {
      due: Number(customer.due) + Number(amount),
    });

    await addDoc(
      collection(
        db,
        "shops",
        user.uid,
        "customers",
        id,
        "transactions"
      ),
      {
  type: "due",
  amount: Number(amount),
  balance: Number(customer.due) + Number(amount),
  status: "Success",
  transactionId: generateTransactionId(),
  createdAt: serverTimestamp(),
}
    );

    await logActivity(user.uid, {
      action: "Add Due",
      customerName: customer.name,
      customerId: id,
      amount: Number(amount),
    });

    setAmount("");

    await loadCustomer();
    await loadTransactions();
  };

  // =====================
  // Receive Payment
  // =====================
  const handlePayment = async () => {
    if (!payment || Number(payment) <= 0) return;
    if (Number(payment) > Number(customer.due)) {
      alert("Payment cannot be greater than due amount.");
      return;
    }

    const customerRef = doc(
      db,
      "shops",
      user.uid,
      "customers",
      id
    );

    await updateDoc(customerRef, {
      due: Number(customer.due) - Number(payment),
    });

    await addDoc(
      collection(
        db,
        "shops",
        user.uid,
        "customers",
        id,
        "transactions"
      ),
      {
  type: "payment",
  amount: Number(payment),
  balance: Number(customer.due) - Number(payment),
  status: "Success",
  transactionId: generateTransactionId(),
  createdAt: serverTimestamp(),
}
    );

    await logActivity(user.uid, {
      action: "Receive Payment",
      customerName: customer.name,
      customerId: id,
      amount: Number(payment),
    });

    setPayment("");

    await loadCustomer();
    await loadTransactions();
  };

  if (!customer) return <h2 style={{ padding: "30px", fontFamily: "system-ui" }}>Loading...</h2>;

  const cardBase = {
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
  };

  const inputStyle = {
    padding: "11px 14px",
    borderRadius: "10px",
    border: "1px solid #E5E7EB",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  const primaryBtn = (bg) => ({
    padding: "11px 20px",
    borderRadius: "10px",
    border: "none",
    background: bg,
    color: "#fff",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  });

  const hasDue = Number(customer.due) > 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F3F4F6",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "32px 20px",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Profile Card */}
        <div style={{ ...cardBase, padding: "28px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap" }}>
            {customer.photoUrl ? (
              <img
                src={customer.photoUrl}
                alt={customer.name}
                style={{
                  width: "84px",
                  height: "84px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: "84px",
                  height: "84px",
                  borderRadius: "50%",
                  background: "#EFF6FF",
                  color: "#2563EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "30px",
                  flexShrink: 0,
                }}
              >
                {(customer.name || "?").charAt(0).toUpperCase()}
              </div>
            )}

            <div style={{ flex: 1, minWidth: "200px" }}>
              {isEditingCustomer ? (
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Name"
                    style={{ ...inputStyle, flex: "1 1 160px" }}
                  />
                  <input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Phone"
                    style={{ ...inputStyle, flex: "1 1 160px" }}
                  />
                  <button onClick={handleUpdateCustomer} style={primaryBtn("#2563EB")}>
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingCustomer(false)}
                    style={primaryBtn("#6B7280")}
                  >
                    Cancel
                  </button>

                  <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "6px" }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPhotoFile(e.target.files[0])}
                    />
                    <button
                      onClick={handleUploadPhoto}
                      disabled={!photoFile || uploadingPhoto}
                      style={{
                        ...primaryBtn("#059669"),
                        opacity: !photoFile || uploadingPhoto ? 0.5 : 1,
                        cursor: !photoFile || uploadingPhoto ? "not-allowed" : "pointer",
                      }}
                    >
                      {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <h1 style={{ margin: 0, fontSize: "22px", color: "#111827" }}>
                      {customer.name}
                    </h1>
                    <button
                      onClick={() => {
                        setEditName(customer.name);
                        setEditPhone(customer.phone);
                        setIsEditingCustomer(true);
                      }}
                      style={{
                        padding: "5px 12px",
                        borderRadius: "8px",
                        border: "1px solid #E5E7EB",
                        background: "#fff",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                        color: "#374151",
                      }}
                    >
                      Edit
                    </button>
                  </div>
                  <p style={{ margin: "4px 0 12px", color: "#6B7280", fontSize: "14px" }}>
                    {customer.phone}
                  </p>
                  <div
                    style={{
                      display: "inline-block",
                      padding: "6px 16px",
                      borderRadius: "999px",
                      fontSize: "13.5px",
                      fontWeight: 700,
                      background: hasDue ? "#FEF2F2" : "#F0FDF4",
                      color: hasDue ? "#DC2626" : "#16A34A",
                    }}
                  >
                    {hasDue ? `Due ৳${customer.due}` : "Fully Paid"}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div style={{ ...cardBase, padding: "20px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "12px" }}>
              ➕ Add Due
            </div>
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ ...inputStyle, marginBottom: "10px" }}
            />
            <button onClick={handleAddDue} style={{ ...primaryBtn("#DC2626"), width: "100%" }}>
              Add Due
            </button>
          </div>

          <div style={{ ...cardBase, padding: "20px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "12px" }}>
              💰 Receive Payment
            </div>
            <input
              type="number"
              placeholder="Amount"
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
              style={{ ...inputStyle, marginBottom: "10px" }}
            />
            <button onClick={handlePayment} style={{ ...primaryBtn("#16A34A"), width: "100%" }}>
              Receive Payment
            </button>
          </div>
        </div>

        {/* Export Section */}
        <div
          style={{
            ...cardBase,
            padding: "18px 20px",
            marginBottom: "20px",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <button onClick={handleExportExcel} style={primaryBtn("#059669")}>
            📊 Export Excel
          </button>

          <label
            style={{
              ...primaryBtn("#2563EB"),
              opacity: isImporting ? 0.6 : 1,
              cursor: isImporting ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {isImporting ? "Importing..." : "📥 Import Excel"}
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              disabled={isImporting}
              style={{ display: "none" }}
            />
          </label>

          <button
            onClick={handleDeleteAllTransactions}
            style={{ ...primaryBtn("#fff"), color: "#DC2626", border: "1px solid #FCA5A5" }}
          >
            🗑 Delete All Transactions
          </button>
        </div>

        {/* Transaction List */}
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#6B7280", marginBottom: "12px" }}>
          Transaction History
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {transactions.map((transaction) => {
            const dateInfo = formatDateTime(transaction.createdAt);
            const isHovered = hoveredTxn === transaction.id;

            return (
              <div
                key={transaction.id}
                onClick={() => setSelectedTransaction(transaction)}
                onMouseEnter={() => setHoveredTxn(transaction.id)}
                onMouseLeave={() => setHoveredTxn(null)}
                style={{
                  ...cardBase,
                  padding: "16px 20px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: isHovered
                    ? "0 10px 20px rgba(0,0,0,0.08)"
                    : "0 2px 6px rgba(0,0,0,0.04)",
                  transform: isHovered ? "translateY(-2px)" : "translateY(0)",
                  transition: "all 0.18s ease",
                }}
              >
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                    {transaction.type === "payment" ? "💰 Payment Received" : "➕ Due Added"}
                  </div>
                  <div style={{ color: "#9CA3AF", marginTop: "4px", fontSize: "12.5px" }}>
                    {dateInfo?.date} • {dateInfo?.time?.slice(0, 5)}
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      marginTop: "6px",
                      padding: "3px 10px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: 700,
                      background: "#F0FDF4",
                      color: "#16A34A",
                    }}
                  >
                    ✔ {transaction.status}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span
                    style={{
                      fontSize: "19px",
                      fontWeight: 800,
                      color: transaction.type === "payment" ? "#16A34A" : "#DC2626",
                    }}
                  >
                    {transaction.type === "payment" ? "+" : "-"}৳{transaction.amount}
                  </span>
                  <span style={{ color: "#D1D5DB", fontSize: "22px" }}>›</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Receipt / Edit / Delete Modal */}
        {selectedTransaction && (
          <div
            onClick={() => setSelectedTransaction(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(17,24,39,0.55)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 999,
              padding: "16px",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "420px",
                maxWidth: "100%",
                background: "#fff",
                borderRadius: "20px",
                padding: "28px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    margin: "0 auto 14px",
                    borderRadius: "50%",
                    background:
                      selectedTransaction.type === "payment" ? "#16A34A" : "#DC2626",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "36px",
                    color: "#fff",
                  }}
                >
                  {selectedTransaction.type === "payment" ? "✓" : "৳"}
                </div>
                <h2 style={{ margin: 0, fontSize: "20px", color: "#111827" }}>
                  {selectedTransaction.type === "payment" ? "Payment Received" : "Due Added"}
                </h2>
              </div>

              {(() => {
                const info = formatDateTime(selectedTransaction.createdAt);

                return (
                  <>
                    <div style={{ textAlign: "center", marginBottom: "20px" }}>
                      <div style={{ color: "#6B7280", fontSize: "13px", fontWeight: 600 }}>Amount</div>
                      <div style={{ fontSize: "42px", fontWeight: 800, color: "#111827", margin: "4px 0" }}>
                        ৳{selectedTransaction.amount}
                      </div>
                    </div>

                    <div style={{ fontSize: "13.5px", color: "#374151", lineHeight: 1.9 }}>
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
                    </div>

                    {isEditingTransaction ? (
                      <div style={{ marginTop: "18px" }}>
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          style={{ ...inputStyle, marginBottom: "10px" }}
                        />
                        <button
                          onClick={() => handleEditTransaction(selectedTransaction, editAmount)}
                          style={{ ...primaryBtn("#16A34A"), width: "100%" }}
                        >
                          Save Changes
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                        <button
                          onClick={() => {
                            setIsEditingTransaction(true);
                            setEditAmount(selectedTransaction.amount);
                          }}
                          style={{ ...primaryBtn("#2563EB"), flex: 1 }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(selectedTransaction)}
                          style={{ ...primaryBtn("#DC2626"), flex: 1 }}
                        >
                          Delete
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => handleDownloadPDF(selectedTransaction)}
                      style={{ ...primaryBtn("#111827"), width: "100%", marginTop: "10px" }}
                    >
                      Download PDF Receipt
                    </button>

                    <button
                      onClick={() => setSelectedTransaction(null)}
                      style={{ ...primaryBtn("#F3F4F6"), color: "#374151", width: "100%", marginTop: "10px" }}
                    >
                      Close
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerDetails;