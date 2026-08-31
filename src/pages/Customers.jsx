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
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
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
  const [isAdding, setIsAdding] = useState(false);

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
    if (!name.trim() || !phone.trim()) {
      alert("সব তথ্য দিন");
      return;
    }

    setIsAdding(true);

    const cleanPhone = phone.trim();

    const customersRef = collection(
      db,
      "shops",
      user.uid,
      "customers"
    );

    // ===============================
    // HARD DUPLICATE CHECK
    // ===============================

    const snapshot = await getDocs(customersRef);

    const alreadyExists = snapshot.docs.some((item) => {
      const existingPhone = String(item.data().phone || "").trim();
      return existingPhone === cleanPhone;
    });

    if (alreadyExists) {
      alert("এই ফোন নম্বরের Customer আগে থেকেই আছে।");
      setIsAdding(false);
      return;
    }

    // ===============================
    // CREATE CUSTOMER
    // PHONE = UNIQUE DOCUMENT ID
    // ===============================

    const customerRef = doc(
      db,
      "shops",
      user.uid,
      "customers",
      cleanPhone
    );

    const customerSnap = await getDoc(customerRef);

    if (customerSnap.exists()) {
      alert("এই ফোন নম্বরের Customer আগে থেকেই আছে।");
      setIsAdding(false);
      return;
    }

    await setDoc(customerRef, {
      name: name.trim(),
      phone: cleanPhone,
      due: 0,
      createdAt: serverTimestamp(),
      createdDate: new Date().toISOString().split("T")[0],
    });

    // ===============================
    // GLOBAL CUSTOMER
    // ===============================

    // ===============================
    // SHOP LINK
    // ===============================

    // ===============================
    // ACTIVITY
    // ===============================

    await logActivity(user.uid, {
      action: "Add Customer",
      customerName: name.trim(),
      customerId: cleanPhone,
    });

    await loadCustomers();

    setName("");
    setPhone("");

    alert("Customer Added");
  } catch (error) {
    console.error(error);
    alert(error.message);
  } finally {
    setIsAdding(false);
  }
};
const handleDeleteCustomer = async (customer) => {
  if (!window.confirm(`"${customer.name}" delete করবেন?`)) return;

  await deleteDoc(
    doc(db, "shops", user.uid, "customers", customer.id)
  );

  await loadCustomers();
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
          background: var(--bg, #F3F4F6);
          color: var(--text, #111827);
          font-family: system-ui, -apple-system, sans-serif;
          padding: 18px 14px 96px;
        }
        @media (min-width: 640px) { .hc-root { padding: 26px 22px 96px; } }

        .hc-wrap { max-width: 900px; margin: 0 auto; }

        .hc-title { margin: 0; font-size: 20px; font-weight: 800; color: var(--text, #111827); }
        @media (min-width: 640px) { .hc-title { font-size: 25px; } }
        .hc-subtitle { margin: 4px 0 18px; color: var(--text-muted, #6B7280); font-size: 12.5px; opacity: 0.85; }
        @media (min-width: 640px) { .hc-subtitle { font-size: 14px; margin-bottom: 22px; } }

        .hc-card {
          background: var(--card, #fff);
          color: var(--text, #111827);
          border-radius: 16px;
          border: 1px solid var(--border, rgba(127,127,127,0.18));
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          padding: 16px;
          margin-bottom: 16px;
        }
        @media (min-width: 640px) { .hc-card { padding: 22px; margin-bottom: 20px; } }

        .hc-card-title {
          font-size: 13.5px; font-weight: 700; color: var(--text, #111827); margin-bottom: 3px;
        }
        .hc-card-desc {
          font-size: 11.5px;
          color: var(--text-muted, #6B7280);
          opacity: 0.85;
          margin-bottom: 12px;
        }

        .hc-input {
          padding: 12px 14px;
          height: 46px;
          border-radius: 11px;
          border: 1.5px solid var(--border, rgba(127,127,127,0.22));
          background: var(--input-bg, rgba(127,127,127,0.06));
          font-size: 14px;
          color: var(--text, #111827);
          outline: none;
          width: 100%;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        }
        .hc-input::placeholder { color: var(--text-muted, #9CA3AF); opacity: 0.8; }
        .hc-input:focus {
          border-color: #2563EB;
          background: var(--card, #fff);
          box-shadow: 0 0 0 3px rgba(37,99,235,0.18);
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
          padding: 12px 18px;
          height: 46px;
          border-radius: 11px;
          border: none;
          background: #2563EB;
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          width: 100%;
          box-shadow: 0 5px 14px rgba(37,99,235,0.3);
          transition: background 0.15s ease, transform 0.12s ease, opacity 0.15s ease;
        }
        .hc-btn-primary:hover:not(:disabled) { background: #1D4ED8; }
        .hc-btn-primary:active:not(:disabled) { transform: scale(0.98); }
        .hc-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
        @media (min-width: 560px) { .hc-btn-primary { width: auto; white-space: nowrap; } }

        /* ============ Search / Filter / Sort ============ */
        .hc-search-wrap { position: relative; margin-bottom: 12px; max-width: 320px; }
        .hc-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted, #9CA3AF);
          pointer-events: none;
        }
        .hc-search {
          width: 100%;
          padding: 9px 12px 9px 34px;
          height: 38px;
          border-radius: 10px;
          border: 1.5px solid var(--border, rgba(127,127,127,0.22));
          background: var(--input-bg, rgba(127,127,127,0.06));
          color: var(--text, #111827);
          font-size: 13px;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        }
        .hc-search::placeholder { color: var(--text-muted, #9CA3AF); opacity: 0.8; }
        .hc-search:focus {
          border-color: #2563EB;
          background: var(--card, #fff);
          box-shadow: 0 0 0 3px rgba(37,99,235,0.18);
        }

        .hc-filter-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .hc-btn-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .hc-sort-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        @media (min-width: 560px) {
          .hc-sort-row { margin-left: auto; }
        }

        .hc-chip {
          padding: 7px 14px;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: 1.5px solid var(--border, rgba(127,127,127,0.22));
          background: var(--input-bg, rgba(127,127,127,0.05));
          color: var(--text, #374151);
          transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.1s ease;
          white-space: nowrap;
        }
        .hc-chip:active { transform: scale(0.97); }
        .hc-chip.active {
          background: #2563EB;
          border-color: #2563EB;
          color: #fff;
        }

        /* ============ Customers list ============ */
        .hc-list-label {
          font-size: 15px;
          font-weight: 800;
          color: var(--text, #111827);
          margin: 4px 0 2px;
        }
        .hc-list-desc {
          font-size: 11.5px;
          color: var(--text-muted, #6B7280);
          opacity: 0.85;
          margin: 0 0 12px;
        }

        .hc-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 640px) { .hc-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1000px) { .hc-grid { grid-template-columns: repeat(3, 1fr); } }

        .hc-customer-card {
          background: var(--card, #fff);
          color: var(--text, #111827);
          border-radius: 16px;
          border: 1px solid var(--border, rgba(127,127,127,0.18));
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          padding: 15px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        @media (hover: hover) {
          .hc-customer-card:hover { box-shadow: 0 8px 20px rgba(0,0,0,0.12); }
        }
        .hc-customer-card:active { transform: scale(0.99); }

        .hc-avatar {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: rgba(37,99,235,0.14);
          color: #2563EB;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 16px;
          flex-shrink: 0;
        }
        .hc-avatar.photo { object-fit: cover; }

        .hc-info { flex: 1; min-width: 0; }
        .hc-name {
          font-size: 15px; font-weight: 700; color: var(--text, #111827);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .hc-phone { font-size: 12px; color: var(--text-muted, #6B7280); opacity: 0.85; margin-top: 1px; }

        .hc-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          margin-top: 6px;
        }
        .hc-badge.due { background: rgba(220,38,38,0.14); color: #EF4444; }
        .hc-badge.paid { background: rgba(22,163,74,0.14); color: #22C55E; }

        .hc-details-btn {
          padding: 9px 14px;
          border-radius: 10px;
          border: 1.5px solid var(--border, rgba(127,127,127,0.22));
          background: var(--input-bg, rgba(127,127,127,0.05));
          color: var(--text, #111827);
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
        }
        .hc-details-btn:hover { background: rgba(37,99,235,0.12); border-color: #2563EB; color: #2563EB; }
        .hc-details-btn:active { transform: scale(0.97); }

        .hc-empty {
          text-align: center;
          color: var(--text-muted, #9CA3AF);
          opacity: 0.85;
          font-size: 13.5px;
          padding: 34px 16px;
        }
      `}</style>

      <div className="hc-wrap">
        <h1 className="hc-title">{t("customers")}</h1>
        <p className="hc-subtitle">Manage every customer's account and credit in one place</p>

        {/* Search */}
<div className="hc-card">
  <input
    type="text"
    placeholder={`🔍 ${t("search")}`}
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="hc-search"
  />
</div>
        </div>

        {/* Customer List */}
        <div className="hc-list-label">
  {t("customers")}
</div>
        <p className="hc-list-desc">View customer details, balance and account status.</p>

        {visibleCustomers.length === 0 ? (
          <div className="hc-card hc-empty">{t("customers")}</div>
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

      <BottomNavigation onCustomerAdded={loadCustomers} />
    </div>
  );
}

export default Customers;