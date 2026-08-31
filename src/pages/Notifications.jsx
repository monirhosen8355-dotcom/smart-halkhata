import BottomNavigation from "../components/BottomNavigation";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";

function Notifications() {
  const { user } = useContext(AuthContext);

  const [mode, setMode] = useState("single");
  const [target, setTarget] = useState("all");
  const [loading, setLoading] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const [push, setPush] = useState(true);
  const [sms, setSms] = useState(false);
  const [history, setHistory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [shopName, setShopName] = useState("");

  useEffect(() => {
    if (!user) return;

    loadShop();
    loadCustomers();
    loadHistory();
  }, [user]);

  const loadShop = async () => {
    const snap = await getDoc(doc(db, "shops", user.uid));

    if (snap.exists()) {
      setShopName(snap.data().shopName || "Shop");
    }
  };

  const loadCustomers = async () => {
    const snap = await getDocs(
      collection(db, "shops", user.uid, "customers")
    );

    setCustomers(
      snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );
  };

  const loadHistory = async () => {
    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    setHistory(
      snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );
  };

  const sendNotification = async () => {
    setLoading(true);
    if (!title.trim()) {
      alert("Enter notification title.");
      setLoading(false);
      return;
    }

    if (!message.trim()) {
      alert("Enter notification message.");
      setLoading(false);
      return;
    }

    if (mode === "single") {
      if (!selectedCustomer) {
        alert("Select a customer.");
        setLoading(false);
        return;
      }

      const customer = customers.find((c) => c.id === selectedCustomer);

      if (!customer) {
        alert("Customer not found.");
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "notifications"), {
        senderId: user.uid,
        shopName,
        mode: "single",
        customerId: customer.id,
        customerName: customer.name || "",
        customerPhone: customer.phone || "",
        title,
        body: message,
        push,
        sms,
        isRead: false,
        status: "pending",
        createdAt: serverTimestamp(),
      });
    } else {
      const filteredCustomers = customers.filter((customer) => {
        if (target === "all") return true;
        if (target === "due") return Number(customer.due || 0) > 0;
        if (target === "paid") return Number(customer.due || 0) <= 0;
        return true;
      });

      for (const customer of filteredCustomers) {
        await addDoc(collection(db, "notifications"), {
          senderId: user.uid,
          shopName,
          mode: "all",
          customerId: customer.id,
          customerName: customer.name || "",
          customerPhone: customer.phone || "",
          title,
          body: message,
          push,
          sms,
          isRead: false,
          status: "pending",
          createdAt: serverTimestamp(),
        });
      }
    }

    if (mode === "single") {
      alert("Notification sent successfully.");
    } else {
      alert("Notification sent to customers.");
    }

    setSelectedCustomer("");
    setTitle("");
    setMessage("");

    loadHistory();
    setLoading(false);
  };

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
            background: mode === "single" ? "#2563EB" : "#E5E7EB",
            color: mode === "single" ? "#fff" : "#111827",
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
            background: mode === "all" ? "#2563EB" : "#E5E7EB",
            color: mode === "all" ? "#fff" : "#111827",
            cursor: "pointer",
          }}
        >
          👥 All
        </button>
      </div>

      <div style={card}>
        {mode === "all" && (
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            style={input}
          >
            <option value="all">All Customers</option>
            <option value="due">Due Customers</option>
            <option value="paid">Paid Customers</option>
          </select>
        )}

        {mode === "single" && (
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            style={input}
          >
            <option value="">Select Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} ({customer.phone})
              </option>
            ))}
          </select>
        )}

        <input
          placeholder="Notification Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={input}
        />

        <textarea
          rows="6"
          placeholder="Write notification..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{
            ...input,
            resize: "none",
          }}
        />

        <div
          style={{
            marginTop: "15px",
            padding: "12px",
            background: "#F9FAFB",
            borderRadius: "10px",
            border: "1px solid #E5E7EB",
          }}
        >
          <div
            style={{
              fontWeight: "700",
              marginBottom: "8px",
            }}
          >
            Preview
          </div>

          <div
            style={{
              fontWeight: "600",
              color: "#2563EB",
            }}
          >
            🔔 Smart Halkhata
          </div>

          <div
            style={{
              marginTop: "8px",
              whiteSpace: "pre-wrap",
            }}
          >
            {message || "Notification preview..."}
          </div>
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            justifySpaceBetween: "space-between",
            marginTop: "15px",
            padding: "12px",
            background: "#F9FAFB",
            borderRadius: "10px",
          }}
        >
          <input
            type="checkbox"
            checked={push}
            onChange={(e) => setPush(e.target.checked)}
          />
          <span>📲 Push Notification</span>
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "10px",
            padding: "12px",
            background: "#F9FAFB",
            borderRadius: "10px",
          }}
        >
          <input
            type="checkbox"
            checked={sms}
            onChange={(e) => setSms(e.target.checked)}
          />
          <span>✉️ SMS Notification</span>
        </label>

        <button
          onClick={sendNotification}
          disabled={loading}
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
          {loading
            ? "Sending..."
            : mode === "single"
            ? "Send Notification"
            : "Send To All Customers"}
        </button>
      </div>

      <div
        style={{
          ...card,
          marginTop: "25px",
        }}
      >
        <h3>Notification History ({history.length})</h3>

        {history.length === 0 ? (
          <p>No notifications found.</p>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              style={{
                padding: "12px 0",
                borderBottom: "1px solid #E5E7EB",
              }}
            >
              <strong>{item.title}</strong>

              <div
                style={{
                  fontSize: "12px",
                  color: "#9CA3AF",
                  marginTop: "4px",
                }}
              >
                {item.customerName || "All Customers"}
              </div>

              <div
                style={{
                  marginTop: "5px",
                  color: "#6B7280",
                }}
              >
                {item.body || item.message}
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}

const card = {
  background: "#fff",
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "0 2px 8px rgba(0,0,0,.08)",
};

const input = {
  width: "100%",
  padding: "12px",
  border: "1px solid #D1D5DB",
  borderRadius: "10px",
  marginTop: "12px",
  boxSizing: "border-box",
};

export default Notifications;