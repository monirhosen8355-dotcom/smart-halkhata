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

const today = new Date().toISOString().split("T")[0];

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

    if (t.type === "payment") {
      received += Number(t.amount || 0);
    }

    if (t.createdDate === today) {
      if (t.type === "due") {
        todayDueAmount += Number(t.amount || 0);
      }

      if (t.type === "payment") {
        todayCollectionAmount += Number(t.amount || 0);
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
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F3F4F6",
        padding: "20px",
paddingBottom: "110px",
fontFamily: "system-ui",
      }}
    >
      <h1>📊 Business Overview</h1>

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
        background: "#fff",
        padding: "20px",
        borderRadius: "16px",
        boxShadow: "0 2px 8px rgba(0,0,0,.08)",
      }}
    >
      <div style={{ color: "#6B7280", fontSize: "14px" }}>{title}</div>

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