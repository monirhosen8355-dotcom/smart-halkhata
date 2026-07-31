import { useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";
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
const deleteAllTransactions = async () => {
  if (!window.confirm("Delete all transactions?")) return;

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

  for (const item of snapshot.docs) {
    await deleteDoc(item.ref);
  }

  await loadTransactions();

  alert("All Transactions Deleted");
};
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

    setPayment("");

    await loadCustomer();
    await loadTransactions();
  };

  if (!customer) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: "30px" }}>
      <h1>{customer.name}</h1>

      <p>{customer.phone}</p>

      <h2>Due: ৳{customer.due}</h2>

      <hr />

      <input
        type="number"
        placeholder="Add Due Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button onClick={handleAddDue}>
        Add Due
      </button>

      

      <br />
      <br />

      <input
        type="number"
        placeholder="Receive Payment"
        value={payment}
        onChange={(e) => setPayment(e.target.value)}
      />

      <button onClick={handlePayment}>
        Receive Payment
      </button>

      <hr />

      <h2>Transaction History</h2>

      {transactions.map((transaction) => {
  const dateInfo = formatDateTime(
    transaction.createdAt
  );

  return (
        
        <div
  key={transaction.id}
  onClick={() => setSelectedTransaction(transaction)}
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#1E222D",
    padding: "14px 18px",
    borderRadius: "14px",
    marginBottom: "10px",
    cursor: "pointer",
    border: "1px solid #2D3445",
  }}
>
          <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  }}
>
  {/* Left Side */}
  <div>
    <div
      style={{
        fontSize: "18px",
        fontWeight: "600",
        color: "#fff",
      }}
    >
      {transaction.type === "payment"
        ? "💰 Payment Received"
        : "➕ Due Added"}
    </div>

    <div
      style={{
        color: "#A8AFBF",
        marginTop: "6px",
        fontSize: "14px",
      }}
    >
      {dateInfo.date} • {dateInfo.time.slice(0, 5)}
    </div>
  </div>

  {/* Right Side */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "16px",
    }}
  >
    <span
      style={{
        fontSize: "22px",
        fontWeight: "700",
        color:
          transaction.type === "payment"
            ? "#4ADE80"
            : "#FB7185",
      }}
    >
      {transaction.type === "payment"
        ? "+"
        : "-"}
      ৳{transaction.amount}
    </span>

    <span
      style={{
        color: "#888",
        fontSize: "24px",
      }}
    >
      ›
    </span>
  </div>
</div>
        </div>
      );
})}
{selectedTransaction && (
  <div
    onClick={() => setSelectedTransaction(null)}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.55)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
    }}
  >
   <div
  onClick={(e) => e.stopPropagation()}
  style={{
    width: "430px",
    maxWidth: "95%",
    background: "#1E222D",
    borderRadius: "18px",
    padding: "25px",
    border: "1px solid #2D3445",
    color: "#fff",
    boxShadow: "0 20px 60px rgba(0,0,0,.35)",
  }}
>
  <div
  style={{
    position: "relative",
    textAlign: "center",
    paddingBottom: "20px",
    marginBottom: "25px",
    overflow: "hidden",
  }}
>
  {/* Flower Top Left */}
  <div
    style={{
      position: "absolute",
      top: "-40px",
      left: "-40px",
      fontSize: "90px",
      opacity: ".15",
      transform: "rotate(-20deg)",
    }}
  >
    🌸
  </div>

  {/* Flower Top Right */}
  <div
    style={{
      position: "absolute",
      top: "-35px",
      right: "-35px",
      fontSize: "90px",
      opacity: ".15",
      transform: "rotate(20deg)",
    }}
  >
    🌸
  </div>

  {/* Big Tick */}
  <div
    style={{
      width: "95px",
      height: "95px",
      margin: "0 auto 18px",
      borderRadius: "50%",
      background:
        "linear-gradient(180deg,#4ADE80,#16A34A)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "55px",
      color: "#fff",
      boxShadow: "0 0 35px rgba(74,222,128,.45)",
    }}
  >
    ✓
  </div>

  <h2
    style={{
      margin: 0,
      color: "#fff",
      fontSize: "32px",
      fontWeight: "700",
    }}
  >
    {selectedTransaction.type === "payment"
      ? "Payment Received"
      : "Due Added"}
  </h2>
</div>

  {(() => {
  const info = formatDateTime(selectedTransaction.createdAt);

  return (
    <>
      <div
        style={{
          background: "#22C55E",
          color: "#fff",
          padding: "10px",
          borderRadius: "10px",
          textAlign: "center",
          fontWeight: "700",
          marginBottom: "20px",
        }}
      >
        ✔ Success
      </div>

     <div
  style={{
    textAlign: "center",
    marginTop: "30px",
  }}
>
  <div
    style={{
      color: "#A8AFBF",
      fontSize: "18px",
      fontWeight: "600",
    }}
  >
    Amount
  </div>

  <div
    style={{
      fontSize: "68px",
      fontWeight: "800",
      color: "#fff",
      margin: "8px 0 28px",
      letterSpacing: "1px",
    }}
  >
    ৳{selectedTransaction.amount}
  </div>

  <p>
    <strong>Transaction ID</strong><br />
    <span
     onClick={async () => {
  try {
    await navigator.clipboard.writeText(
      selectedTransaction.transactionId
    );
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
      style={{
        cursor: "pointer",
        color: "#60A5FA",
        fontWeight: "700",
        fontSize: "20px",
      }}
    >
      {selectedTransaction.transactionId} 📋
    </span>
  </p>

  <p>
    <strong>Date</strong><br />
    {info?.date}
  </p>

  <p>
    <strong>Time</strong><br />
    {info?.time}
  </p>
</div>

      <button
        onClick={() => setSelectedTransaction(null)}
        style={{
          marginTop: "25px",
          width: "100%",
          padding: "12px",
          border: "none",
          borderRadius: "10px",
          background: "#2563EB",
          color: "#fff",
          cursor: "pointer",
        }}
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
  );
}

export default CustomerDetails;