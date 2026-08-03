import BottomNavigation from "../components/BottomNavigation";

import { useState } from "react";

function Notifications() {
  const [mode, setMode] = useState("single");
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        padding: "20px",
        paddingBottom: "100px",
        fontFamily: "system-ui",
      }}
    >
      <h1
        style={{
          margin: 0,
          color: "var(--text)",
        }}
      >
        🔔 Notifications
      </h1>

      <p
        style={{
          color: "#6B7280",
          marginTop: "6px",
          marginBottom: "20px",
        }}
      >
        Send notification to customers
      </p>

      <div
  style={{
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  }}
>
  <button
    onClick={() => setMode("single")}
    style={{
      flex: 1,
      padding: "12px",
      border: "none",
      borderRadius: "10px",
      background:
        mode === "single"
          ? "#2563EB"
          : "#E5E7EB",
      color:
        mode === "single"
          ? "#fff"
          : "#111827",
      cursor: "pointer",
    }}
  >
    👤 Single
  </button>

  <button
    onClick={() => setMode("all")}
    style={{
      flex: 1,
      padding: "12px",
      border: "none",
      borderRadius: "10px",
      background:
        mode === "all"
          ? "#2563EB"
          : "#E5E7EB",
      color:
        mode === "all"
          ? "#fff"
          : "#111827",
      cursor: "pointer",
    }}
  >
    👥 All
  </button>
</div>

<div
  style={{
    background: "#fff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,.08)",
  }}
>
  {mode === "single" && (
    <>
      <input
        placeholder="Customer Phone Number"
        style={input}
      />
    </>
  )}

  <input
    placeholder="Notification Title"
    style={input}
  />

  <textarea
    rows="5"
    placeholder="Write notification..."
    style={input}
  />

  <label
    style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginTop: "15px",
    }}
  >
    <input type="checkbox" defaultChecked />
    Push Notification
  </label>

  <label
    style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginTop: "10px",
    }}
  >
    <input type="checkbox" />
    SMS
  </label>

  <button
    style={{
      marginTop: "20px",
      width: "100%",
      padding: "14px",
      border: "none",
      borderRadius: "12px",
      background: "#2563EB",
      color: "#fff",
      fontWeight: "700",
      cursor: "pointer",
    }}
  >
    {mode === "single"
      ? "Send Notification"
      : "Send To All Customers"}
  </button>
</div>

      <BottomNavigation />
    </div>
  );
}
const input = {
  width: "100%",
  padding: "12px",
  border: "1px solid #D1D5DB",
  borderRadius: "10px",
  marginTop: "12px",
  boxSizing: "border-box",
};
const btn = {
  width: "100%",
  padding: "18px",
  border: "none",
  borderRadius: "14px",
  background: "#2563EB",
  color: "#fff",
  fontWeight: "700",
  fontSize: "16px",
  cursor: "pointer",
};

export default Notifications;