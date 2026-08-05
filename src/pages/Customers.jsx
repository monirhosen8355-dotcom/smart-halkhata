import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { db } from "../firebase";
import { logActivity } from "../utils/logActivity";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";
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
const { t } = useLanguage();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [reminders, setReminders] = useState([]);
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
createdDate: new Date().toISOString().split("T")[0],
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

  const initials = (customerName) =>
    (customerName || "?").trim().charAt(0).toUpperCase();

  const visibleCustomers = customers
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
    });

  return (
    <div className="hc-root">
      <style>{`
        * { box-sizing: border-box; }
        .hc-root {
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
          background: "var(--bg)",
          font-family: system-ui, -apple-system, sans-serif;
          padding: 16px 12px 32px;
        }
        @media (min-width: 640px) { .hc-root { padding: 24px 20px 40px; } }

        .hc-wrap { max-width: 780px; margin: 0 auto; }

        .hc-title { margin: 0; font-size: 20px; color: #111827; }
        @media (min-width: 640px) { .hc-title { font-size: 26px; } }
        .hc-subtitle { margin: 4px 0 16px; color: #6B7280; font-size: 12.5px; }
        @media (min-width: 640px) { .hc-subtitle { font-size: 14px; margin-bottom: 22px; } }

        .hc-card {
          background: "var(--card)",
          border-radius: 16px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
          padding: 16px;
          margin-bottom: 16px;
        }
        @media (min-width: 640px) { .hc-card { padding: 22px; margin-bottom: 20px; } }

        .hc-card-title {
          font-size: 13.5px; font-weight: 700; color: "var(--text)", margin-bottom: 12px;
        }

        .hc-input {
          padding: 11px 13px;
          border-radius: 10px;
          border: 1px solid #E5E7EB;
          font-size: 13.5px;
          outline: none;
          width: 100%;
        }

        .hc-add-row {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        @media (min-width: 560px) {
          .hc-add-row { flex-direction: row; flex-wrap: wrap; align-items: center; }
          .hc-add-row .hc-input { flex: 1 1 160px; }
        }

        .hc-btn-primary {
          padding: 11px 18px;
          border-radius: 10px;
          border: none;
          background: #2563EB;
          color: #fff;
          font-weight: 700;
          font-size: 13.5px;
          cursor: pointer;
          width: 100%;
        }
        @media (min-width: 560px) { .hc-btn-primary { width: auto; white-space: nowrap; } }

        .hc-reminder-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 9px 0;
          border-bottom: 1px solid #F3F4F6;
          gap: 8px;
        }
        .hc-reminder-row:last-child { border-bottom: none; }
        .hc-reminder-text { font-size: 12.5px; color: #374151; }
        .hc-reminder-btn {
          padding: 5px 11px;
          border-radius: 8px;
          border: 1px solid #E5E7EB;
          background: #fff;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          color: #374151;
          white-space: nowrap;
        }

        .hc-search {
          width: 100%;
          padding: 11px 14px;
          border-radius: 10px;
          border: 1px solid #E5E7EB;
          font-size: 13.5px;
          outline: none;
          margin-bottom: 12px;
        }

        .hc-btn-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .hc-btn-row + .hc-btn-row { margin-top: 10px; }

        .hc-chip {
          padding: 7px 14px;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid #E5E7EB;
          background: #fff;
          color: #374151;
        }
        .hc-chip.active {
          background: #2563EB;
          border-color: #2563EB;
          color: #fff;
        }

        .hc-list-label {
          font-size: 12.5px;
          font-weight: 700;
          color: "var(--text)",
          margin: 4px 0 10px;
        }

        .hc-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }
        @media (min-width: 560px) { .hc-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 900px) { .hc-grid { grid-template-columns: repeat(3, 1fr); } }

        .hc-customer-card {
          background: #fff;
          border-radius: 14px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
          padding: 13px 14px;
          display: flex;
          align-items: center;
          gap: 11px;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .hc-customer-card:active { transform: scale(0.98); }

        .hc-avatar {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: #EFF6FF;
          color: #2563EB;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 15px;
          flex-shrink: 0;
        }
        .hc-avatar.photo { object-fit: cover; }

        .hc-info { flex: 1; min-width: 0; }
        .hc-name {
          font-size: 14px; font-weight: 700; color: #111827;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .hc-phone { font-size: 11.5px; color: #6B7280; }

        .hc-badge {
          display: inline-block;
          padding: 3px 9px;
          border-radius: 999px;
          font-size: 10.5px;
          font-weight: 700;
          margin-top: 4px;
        }
        .hc-badge.due { background: #FEF2F2; color: #DC2626; }
        .hc-badge.paid { background: #F0FDF4; color: #16A34A; }

        .hc-details-btn {
          padding: 7px 12px;
          border-radius: 9px;
          border: none;
          background: #111827;
          color: #fff;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          flex-shrink: 0;
        }

        .hc-empty {
          text-align: center;
          color: #9CA3AF;
          font-size: 13px;
          padding: 30px 16px;
        }
      `}</style>

      <div className="hc-wrap">
        <h1 className="hc-title">{t("customers")}</h1>
        <p className="hc-subtitle">Manage every customer's account and credit in one place</p>

        {/* Add Customer */}
        <div className="hc-card">
          <div className="hc-card-title">
  + {t("addCustomer")}
</div>
          <div className="hc-add-row">
            <input
              type="text"
              placeholder={t("customers")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="hc-input"
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="hc-input"
            />
            <button onClick={handleAddCustomer} className="hc-btn-primary">
              Add Customer
            </button>
          </div>
        </div>

        {/* Search / Filter / Sort */}
        <div className="hc-card">
          <input
            type="text"
            placeholder={`🔍 ${t("search")}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="hc-search"
          />

          <div className="hc-btn-row">
            {["all", "due", "paid"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`hc-chip ${filterStatus === status ? "active" : ""}`}
              >
                {
status === "all"
? t("all")
: status === "due"
? t("due")
: t("paid")
}
              </button>
            ))}
          </div>

          <div className="hc-btn-row">
            {["newest", "oldest"].map((order) => (
              <button
                key={order}
                onClick={() => setSortOrder(order)}
                className={`hc-chip ${sortOrder === order ? "active" : ""}`}
              >
                {
order === "newest"
? t("newest")
: t("oldest")
}
              </button>
            ))}
          </div>
        </div>

        {/* Customer List */}
        <div className="hc-list-label">
  {t("customers")}
</div>

        {visibleCustomers.length === 0 ? (
          <div className="hc-card hc-empty">t("customers")</div>
        ) : (
          <div className="hc-grid">
            {visibleCustomers.map((customer) => {
              const hasDue = Number(customer.due) > 0;

              return (
                <div key={customer.id} className="hc-customer-card">
                  {customer.photoUrl ? (
                    <img src={customer.photoUrl} alt={customer.name} className="hc-avatar photo" />
                  ) : (
                    <div className="hc-avatar">{initials(customer.name)}</div>
                  )}

                  <div className="hc-info">
                    <div className="hc-name">{customer.name}</div>
                    <div className="hc-phone">{customer.phone}</div>
                    <span className={`hc-badge ${hasDue ? "due" : "paid"}`}>
                      {hasDue ? `${t("due")} ৳${customer.due}` : t("paid")}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate(`/customer/${customer.id}`)}
                    className="hc-details-btn"
                  >
                    {t("edit")}
                  </button>
                </div>
              );
            })}
          </div>
        )}
            </div>

      <BottomNavigation onCustomerAdded={loadCustomers} />
    </div>
  );
}

export default Customers;