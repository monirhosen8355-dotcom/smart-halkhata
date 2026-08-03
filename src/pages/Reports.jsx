import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import BottomNavigation from "../components/BottomNavigation";

function Reports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    const snap = await getDocs(collection(db, "reports"));

    const list = [];

    let pending = 0;
    let solved = 0;

    snap.forEach((doc) => {
      const data = {
        id: doc.id,
        ...doc.data(),
      };

      list.push(data);

      if (data.status === "pending") pending++;

      if (data.status === "solved") solved++;
    });

    list.sort(
      (a, b) =>
        (b.createdAt?.seconds || 0) -
        (a.createdAt?.seconds || 0)
    );

    setReports(list);
    setPendingCount(pending);
    setSolvedCount(solved);
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
      <h1
        style={{
          margin: 0,
          color: "var(--text)",
        }}
      >
        📥 Received Reports
      </h1>

      <p
        style={{
          color: "#6B7280",
          marginTop: "6px",
          marginBottom: "20px",
        }}
      >
        Reports submitted by customers
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <Card
  title="🟥 Pending"
  value={pendingCount}
  color="#DC2626"
/>

<Card
  title="🟩 Solved"
  value={solvedCount}
  color="#16A34A"
/>
      </div>

      <div
        style={{
          background: "var(--card)",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,.08)",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: "20px",
          }}
        >
          Received Reports
        </h3>

        {reports.length === 0 ? (
  <div
    style={{
      textAlign: "center",
      color: "#6B7280",
      padding: "50px 20px",
    }}
  >
    No reports received.
  </div>
) : (
  reports.map((report) => (
    <div
      key={report.id}
      style={{
        border: "1px solid #E5E7EB",
        borderRadius: "14px",
        padding: "16px",
        marginBottom: "14px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <strong>{report.id}</strong>

        <span
          style={{
            background:
              report.status === "pending"
                ? "#FEF2F2"
                : "#DCFCE7",
            color:
              report.status === "pending"
                ? "#DC2626"
                : "#16A34A",
            padding: "4px 10px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: "700",
          }}
        >
          {report.status}
        </span>
      </div>

      <div style={{ marginBottom: "8px" }}>
        <b>Transaction ID :</b> {report.transactionId}
      </div>

      <div style={{ marginBottom: "8px" }}>
        <b>Customer :</b> {report.customerName}
      </div>

      <div style={{ marginBottom: "8px" }}>
        <b>Shop :</b> {report.shopName}
      </div>

      <div style={{ marginBottom: "15px" }}>
        <b>Reason :</b> {report.reason}
      </div>

      <button
        onClick={() =>
 navigate(`/report-details/${report.id}`, {
  state: report,
})
}
        style={{
          width: "100%",
          padding: "12px",
          border: "none",
          borderRadius: "10px",
          background: "#2563EB",
          color: "#fff",
          fontWeight: "700",
          cursor: "pointer",
        }}
      >
        View Report
      </button>
    </div>
  ))
)}
      </div>

      <BottomNavigation />
    </div>
  );
}
function Card({ title, value, color }) {
  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,.08)",
      }}
    >
      <div
        style={{
          color: "#6B7280",
          fontSize: "14px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: "10px",
          fontSize: "32px",
          fontWeight: "800",
          color,
        }}
      >
        {value}
      </div>
    </div>
  );
}
export default Reports;