import { useContext, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../context/AuthContext";

function FloatingReportButton() {
  const { user } = useContext(AuthContext);

  const [transactionId, setTransactionId] = useState("");
  const [reason, setReason] = useState("Wrong Due");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);

const submitReport = async () => {
  if (!transactionId.trim()) {
    alert("Transaction ID required");
    return;
  }

  await addDoc(collection(db, "reports"), {
  transactionId,
  reason,
  description,

  customerId: user.uid,
  customerName: user.displayName || "Customer",
  phone: user.phoneNumber || "",

  shopId: "",          // পরে Auto Load করবো
  shopName: "",        // পরে Auto Load করবো

  screenshot: "",      // পরে Image Upload করবো

  status: "pending",

  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

  alert("Report submitted.");

  setTransactionId("");
  setReason("Wrong Due");
  setDescription("");
  setOpen(false);
};

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          right: "20px",
          bottom: "90px",
          width: "58px",
          height: "58px",
          borderRadius: "50%",
          border: "none",
          background: "#DC2626",
          color: "#fff",
          fontSize: "26px",
          cursor: "pointer",
          boxShadow: "0 6px 20px rgba(0,0,0,.25)",
          zIndex: 999,
        }}
      >
        ⚠
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "95%",
              maxWidth: "420px",
              background: "#fff",
              borderRadius: "16px",
              padding: "20px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              Report Problem
            </h2>

            <input
  placeholder="Transaction ID"
  value={transactionId}
  onChange={(e) => setTransactionId(e.target.value)}
  style={input}
/>

            <select
  value={reason}
  onChange={(e) => setReason(e.target.value)}
  style={input}
>
              <option>Wrong Due</option>
              <option>Wrong Payment</option>
              <option>Duplicate Transaction</option>
              <option>Customer Complaint</option>
              <option>Other</option>
            </select>

            <textarea
  rows="4"
  placeholder="Describe your problem..."
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  style={input}
/>

            <input
              type="file"
              accept="image/*"
              style={input}
            />

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "15px",
              }}
            >
              <button
                onClick={() => setOpen(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  border: "none",
                  borderRadius: "10px",
                  background: "#E5E7EB",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
  onClick={submitReport}
  style={{  
                  flex: 1,
                  padding: "12px",
                  border: "none",
                  borderRadius: "10px",
                  background: "#2563EB",
                  color: "#fff",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const input = {
  width: "100%",
  padding: "12px",
  marginTop: "12px",
  borderRadius: "10px",
  border: "1px solid #D1D5DB",
  fontSize: "14px",
  boxSizing: "border-box",
};

export default FloatingReportButton;