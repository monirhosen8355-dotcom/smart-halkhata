import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

function ReportDetails() {
  const navigate = useNavigate();
const { id } = useParams();
const { state } = useLocation();

const [report, setReport] = useState(state || null);

useEffect(() => {
  if (!state) {
    loadReport();
  }
}, []);

const updateStatus = async (status) => {
  await updateDoc(doc(db, "reports", id), {
  status,
  updatedAt: new Date(),
}); 

  alert(
  status === "solved"
    ? "Report marked as solved."
    : "Report rejected."
);
navigate("/reports");
};

const loadReport = async () => {
  const snap = await getDoc(doc(db, "reports", id));

  if (snap.exists()) {
    setReport({
      id: snap.id,
      ...snap.data(),
    });
  }
};

  if (!report) {
  return (
    <h2
      style={{
        padding: "30px",
        fontFamily: "system-ui",
      }}
    >
      Loading...
    </h2>
  );
}

return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        padding: "20px",
        paddingBottom: "40px",
        fontFamily: "system-ui",
      }}
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          border: "none",
          background: "transparent",
          fontSize: "16px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        ← Back
      </button>

      <div
        style={{
          background: "var(--card)",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,.08)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Report Details</h2>

        <Info title="Report ID" value={report.id} />
<Info title="Transaction ID" value={report.transactionId} />
<Info title="Customer" value={report.customerName} />
<Info title="Shop" value={report.shopName} />
<Info title="Phone" value={report.phone || "-"} />
<Info title="Reason" value={report.reason} />
<Info
  title="Status"
  value={
    report.status === "pending"
      ? "🟥 Pending"
      : report.status === "solved"
      ? "🟩 Solved"
      : "⬛ Rejected"
  }
/>

        <div style={{ marginTop: "18px" }}>
          <strong>Description</strong>

          <div
            style={{
              marginTop: "8px",
              background: "#F9FAFB",
              borderRadius: "10px",
              padding: "14px",
            }}
          >
            {report.description || "No description"}
          </div>
        </div>

        <div style={{ marginTop: "18px" }}>
          <strong>Screenshot</strong>

          <div
            style={{
              marginTop: "10px",
              height: "180px",
              border: "2px dashed #D1D5DB",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6B7280",
            }}
          >
            {report.screenshot ? (
  <img
    src={report.screenshot}
    alt="Screenshot"
    style={{
      width: "100%",
      borderRadius: "10px",
    }}
  />
) : (
  "No Screenshot"
)}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "25px",
          }}
        >
          {report.status === "pending" && (
  <>
    <button
      onClick={() => updateStatus("solved")}
      style={{
        flex: 1,
        padding: "13px",
        border: "none",
        borderRadius: "10px",
        background: "#16A34A",
        color: "#fff",
        fontWeight: "700",
        cursor: "pointer",
      }}
    >
      Mark as Solved
    </button>

    <button
      onClick={() => updateStatus("rejected")}
      style={{
        flex: 1,
        padding: "13px",
        border: "none",
        borderRadius: "10px",
        background: "#DC2626",
        color: "#fff",
        fontWeight: "700",
        cursor: "pointer",
      }}
    >
      Reject
    </button>
  </>
)}
        </div>
      </div>
    </div>
  );
}

function Info({ title, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        borderBottom: "1px solid #E5E7EB",
        padding: "12px 0",
      }}
    >
      <strong>{title}</strong>
      <span>{value}</span>
    </div>
  );
}

export default ReportDetails;