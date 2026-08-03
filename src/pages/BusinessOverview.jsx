import { useContext, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import BottomNavigation from "../components/BottomNavigation";

function BusinessOverview() {
  const { user } = useContext(AuthContext);

 const [totalCustomers, setTotalCustomers] = useState(0);
const [totalDue, setTotalDue] = useState(0);

const [todayDue, setTodayDue] = useState(0);
const [todayCollection, setTodayCollection] = useState(0);
const [paidToday, setPaidToday] = useState(0);
const [totalReceived, setTotalReceived] = useState(0);
const [lastUpdated, setLastUpdated] = useState("");

const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!user) return;

    loadOverview();
  }, [user]);

  const loadOverview = async () => {
      const snap = await getDocs(
      collection(db, "shops", user.uid, "customers")
    );

    let due = 0;

let todayDueAmount = 0;
let todayCollectionAmount = 0;
let paidCount = 0;
let received = 0;

    for (const customerDoc of snap.docs) {
  const customer = customerDoc.data();

  due += Number(customer.due || 0);

  const txSnap = await getDocs(
    collection(
      db,
      "shops",
      user.uid,
      "customers",
      customerDoc.id,
      "transactions"
    )
  );

  txSnap.forEach((tx) => {
    const t = tx.data();

    const amount = Number(t.amount || 0);

    // Total Received
    if (t.type === "payment") {
      received += amount;
    }

    // Today's Report
    if (t.createdDate === today) {
      if (t.type === "due") {
        todayDueAmount += amount;
      }

      if (t.type === "payment") {
        todayCollectionAmount += amount;
        paidCount++;
      }
    }
  });
}

    setTotalCustomers(snap.size);

setTotalDue(due);

setTodayDue(todayDueAmount);

setTodayCollection(todayCollectionAmount);

setPaidToday(paidCount);

setTotalReceived(received);

setLastUpdated(
  new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        padding: "20px",
paddingBottom: "110px",
fontFamily: "system-ui",
      }}
    >
      <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "10px",
  }}
>
  <div>
    <h1 style={{ margin: 0 }}>📊 Business Overview</h1>

    <div
      style={{
        color: "var(--text)",
        fontSize: "13px",
        marginTop: "5px",
      }}
    >
      Last Updated : {lastUpdated}
    </div>
  </div>

  <button
    onClick={loadOverview}
    style={{
      background: "#2563EB",
      color: "#fff",
      border: "none",
      padding: "10px 18px",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: 700,
    }}
  >
    🔄 Refresh
  </button>
</div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "15px",
          marginTop: "20px",
        }}
      >
        <Card
title="💰 Total Due"
value={`৳${totalDue.toLocaleString()}`}
/>
        <Card
  title="✅ Total Received"
  value={`৳${totalReceived.toLocaleString()}`}
/>
        <Card
  title="📈 Today's Collection"
  value={`৳${todayCollection.toLocaleString()}`}
/>
        <Card
title="👥 Total Customers"
value={totalCustomers}
/>
        <Card
  title="🟢 Paid Today"
  value={paidToday}
/>
        <Card
  title="🔴 Due Today"
  value={`৳${todayDue.toLocaleString()}`}
/>
           </div>

      <BottomNavigation />
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div
      style={{
        background: "var(--card)",
        padding: "20px",
        borderRadius: "16px",
        boxShadow: "0 2px 8px rgba(0,0,0,.08)",
      }}
    >
      <div style={{ color: "var(--text)", fontSize: "14px" }}>{title}</div>

      <h2
  style={{
    margin: "10px 0 0",
    fontSize: "30px",
    fontWeight: "800",
    color:
      title === "💰 Total Due"
        ? "#DC2626"
        : title === "✅ Total Received"
        ? "#16A34A"
        : title === "📈 Today's Collection"
        ? "#2563EB"
        : title === "👥 Total Customers"
        ? "#7C3AED"
        : title === "🟢 Paid Today"
        ? "#16A34A"
        : "#DC2626",
  }}
>
  {value}
</h2>
    </div>
  );
}

export default BusinessOverview;