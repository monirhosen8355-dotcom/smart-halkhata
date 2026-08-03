import { useState, useContext } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../context/AuthContext";

function AddCustomerModal({ open, onClose, onSuccess }) {
  const { user } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
          👤 Add Customer
        </h2>

        <input
  placeholder="Customer Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "12px",
            border: "1px solid #ddd",
            borderRadius: "10px",
          }}
        />

        <input
  placeholder="Phone Number"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
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
  onClick={async () => {
    if (!name.trim() || !phone.trim()) {
      alert("সব তথ্য দিন");
      return;
    }

    await addDoc(
      collection(db, "shops", user.uid, "customers"),
      {
        name,
        phone,
        due: 0,
        createdAt: serverTimestamp(),
        createdDate: new Date().toISOString().split("T")[0],
      }
    );

    setName("");
    setPhone("");
    onSuccess?.();

onClose();

alert("Customer Added");
  }}
>
  Add Customer
</button>
        </div>
      </div>
    </div>
  );
}

export default AddCustomerModal;