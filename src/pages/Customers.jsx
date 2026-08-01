import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";
import { logActivity } from "../utils/logActivity";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

function Customers() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const { user } = useContext(AuthContext);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [reminders, setReminders] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredFilter, setHoveredFilter] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    loadCustomers();
  }, [user]);

  const loadCustomers = async () => {
    if (!user) return;

    const snapshot = await getDocs(
      collection(db, "shops", user.uid, "customers")
    );

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setCustomers(data);

    await syncReminders(data);
  };

  const syncReminders = async (customerList) => {
    const dueCustomers = customerList.filter((c) => Number(c.due) > 0);

    const existingSnap = await getDocs(
      collection(db, "shops", user.uid, "notifications")
    );
    const existingMap = {};
    existingSnap.docs.forEach((d) => {
      existingMap[d.id] = { id: d.id, ...d.data() };
    });

    for (const customer of dueCustomers) {
      const ref = doc(db, "shops", user.uid, "notifications", customer.id);

      if (!existingMap[customer.id]) {
        await setDoc(ref, {
          customerId: customer.id,
          customerName: customer.name,
          due: customer.due,
          read: false,
          createdAt: new Date().toISOString(),
        });
      } else if (existingMap[customer.id].due !== customer.due) {
        await updateDoc(ref, { due: customer.due, read: false });
      }
    }

    const freshSnap = await getDocs(
      collection(db, "shops", user.uid, "notifications")
    );

    setReminders(
      freshSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((r) => r.due > 0)
    );
  };

  const markReminderRead = async (customerId) => {
    const ref = doc(db, "shops", user.uid, "notifications", customerId);
    await updateDoc(ref, { read: true });
    setReminders((prev) =>
      prev.map((r) => (r.id === customerId ? { ...r, read: true } : r))
    );
  };

  const handleAddCustomer = async () => {
    try {
      if (!name || !phone) {
        alert("সব তথ্য দিন");
        return;
      }

      const newCustomerRef = await addDoc(
        collection(db, "shops", user.uid, "customers"),
        {
          name,
          phone,
          due: 0,
          createdAt: serverTimestamp(),
        }
      );

      await logActivity(user.uid, {
        action: "Add Customer",
        customerName: name,
        customerId: newCustomerRef.id,
      });

      await loadCustomers();

      setName("");
      setPhone("");

      alert("Customer Added");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const filterBtnStyle = (isActive, isHovered) => ({
    padding: "9px 18px",
    borderRadius: "10px",
    border: isActive ? "1px solid #2563EB" : "1px solid #E5E7EB",
    background: isActive ? "#2563EB" : isHovered ? "#F3F4F6" : "#fff",
    color: isActive ? "#fff" : "#374151",
    fontSize: "13.5px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s ease",
  });

  const initials = (customerName) =>
    (customerName || "?").trim().charAt(0).toUpperCase();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F3F4F6",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "32px 20px",
      }}
    >
      <div style={{ maxWidth: "980px", margin: "0 auto" }}>
        {/* Top section */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ margin: 0, fontSize: "26px", color: "#111827" }}>
            Customers
          </h1>
          <p style={{ margin: "6px 0 0", color: "#6B7280", fontSize: "14px" }}>
            Manage every customer's account and credit in one place
          </p>
        </div>

        {/* Add Customer card */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid #E5E7EB",
            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            marginBottom: "28px",
          }}
        >
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827", marginBottom: "16px" }}>
            + Add New Customer
          </div>
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              placeholder="Customer Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                flex: "1 1 200px",
                padding: "11px 14px",
                borderRadius: "10px",
                border: "1px solid #E5E7EB",
                fontSize: "14px",
                outline: "none",
              }}
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                flex: "1 1 200px",
                padding: "11px 14px",
                borderRadius: "10px",
                border: "1px solid #E5E7EB",
                fontSize: "14px",
                outline: "none",
              }}
            />
            <button
              onClick={handleAddCustomer}
              style={{
                padding: "11px 22px",
                borderRadius: "10px",
                border: "none",
                background: "#2563EB",
                color: "#fff",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Add Customer
            </button>
          </div>
        </div>

        {/* Due Reminders */}
        {reminders.length > 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "20px 24px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              marginBottom: "28px",
            }}
          >
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827", marginBottom: "12px" }}>
              🔔 Due Reminders
            </div>
            {reminders.map((r) => (
              <div
                key={r.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid #F3F4F6",
                  opacity: r.read ? 0.5 : 1,
                }}
              >
                <span style={{ fontSize: "14px", color: "#374151" }}>
                  {r.customerName} — Due ৳{r.due}
                </span>
                {!r.read && (
                  <button
                    onClick={() => markReminderRead(r.id)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "8px",
                      border: "1px solid #E5E7EB",
                      background: "#fff",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      color: "#374151",
                    }}
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Search / Filter / Sort */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "20px 24px",
            border: "1px solid #E5E7EB",
            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            marginBottom: "24px",
          }}
        >
          <input
            type="text"
            placeholder="🔍 Search by name or phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px 16px",
              borderRadius: "10px",
              border: "1px solid #E5E7EB",
              fontSize: "14px",
              outline: "none",
              marginBottom: "16px",
            }}
          />

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
            {["all", "due", "paid"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                onMouseEnter={() => setHoveredFilter(status)}
                onMouseLeave={() => setHoveredFilter(null)}
                style={filterBtnStyle(filterStatus === status, hoveredFilter === status)}
              >
                {status === "all" ? "All" : status === "due" ? "Due" : "Paid"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {["newest", "oldest"].map((order) => (
              <button
                key={order}
                onClick={() => setSortOrder(order)}
                onMouseEnter={() => setHoveredFilter(order)}
                onMouseLeave={() => setHoveredFilter(null)}
                style={filterBtnStyle(sortOrder === order, hoveredFilter === order)}
              >
                {order === "newest" ? "Newest" : "Oldest"}
              </button>
            ))}
          </div>
        </div>

        {/* Customer List */}
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#6B7280", marginBottom: "14px" }}>
          Customer List
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          {customers
            .filter((customer) => {
              const term = searchTerm.trim().toLowerCase();
              if (!term) return true;
              return (
                customer.name?.toLowerCase().includes(term) ||
                customer.phone?.toLowerCase().includes(term)
              );
            })
            .filter((customer) => {
              if (filterStatus === "due") return Number(customer.due) > 0;
              if (filterStatus === "paid") return Number(customer.due) === 0;
              return true;
            })
            .sort((a, b) => {
              const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
              const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
              return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
            })
            .map((customer) => {
              const hasDue = Number(customer.due) > 0;
              const isHovered = hoveredCard === customer.id;

              return (
                <div
                  key={customer.id}
                  onMouseEnter={() => setHoveredCard(customer.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    background: "#fff",
                    borderRadius: "16px",
                    padding: "20px",
                    border: "1px solid #E5E7EB",
                    boxShadow: isHovered
                      ? "0 12px 24px rgba(0,0,0,0.10)"
                      : "0 2px 6px rgba(0,0,0,0.04)",
                    transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                    {customer.photoUrl ? (
                      <img
                        src={customer.photoUrl}
                        alt={customer.name}
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          background: "#EFF6FF",
                          color: "#2563EB",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "18px",
                          flexShrink: 0,
                        }}
                      >
                        {initials(customer.name)}
                      </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "15.5px", fontWeight: 700, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {customer.name}
                      </div>
                      <div style={{ fontSize: "13px", color: "#6B7280" }}>
                        {customer.phone}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "inline-block",
                      padding: "5px 12px",
                      borderRadius: "999px",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      background: hasDue ? "#FEF2F2" : "#F0FDF4",
                      color: hasDue ? "#DC2626" : "#16A34A",
                      marginBottom: "16px",
                    }}
                  >
                    {hasDue ? `Due ৳${customer.due}` : "Paid"}
                  </div>

                  <button
                    onClick={() => navigate(`/customer/${customer.id}`)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "10px",
                      border: "none",
                      background: "#111827",
                      color: "#fff",
                      fontSize: "13.5px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    View Details
                  </button>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default Customers;