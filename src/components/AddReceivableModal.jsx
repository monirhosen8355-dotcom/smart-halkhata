import { useState } from "react";

function AddReceivableModal({ open, onClose }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999999,
      }}
    >
      <div
        style={{
          width: "92%",
          maxWidth: "420px",
          background: "#fff",
          borderRadius: "18px",
          padding: "22px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>
          💰 Add Receivable
        </h2>

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "12px",
            border: "1px solid #ddd",
            borderRadius: "10px",
          }}
        />

        <input
          placeholder="Note (Optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "10px",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <button onClick={onClose}>
            Cancel
          </button>

          <button
            onClick={() => {
              alert("Next Step");
            }}
          >
            Add Receivable
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddReceivableModal;