import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { IoPower } from "react-icons/io5";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { useEffect } from "react";
import BottomNavigation from "../components/BottomNavigation";
import overviewIcon from "../assets/icons/overview.svg";
import staffIcon from "../assets/icons/staff.svg";

import customersIcon from "../assets/icons/customers.svg";
import shopIcon from "../assets/icons/shop.svg";
import settingsIcon from "../assets/icons/settings.svg";

const NAV_CARDS = [
  {
    key: "customers",
    title: "Customers",
   icon: customersIcon,
    path: "/customers",
  },
  {
    key: "shop-profile",
    title: "Shop Profile",
    icon: shopIcon,
    path: "/shop-profile",
  },
  {
    key: "settings",
    title: "Settings",
    icon: settingsIcon,
    path: "/settings",
  },
  {
    key: "business-overview",
    title: "Overview",
    icon: overviewIcon,
    path: "/business-overview",
  },
  {
    key: "staff-management",
    title: "Staff",
    icon: staffIcon,
    path: "/staff-management",
  },
];

function Dashboard() {
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pressedKey, setPressedKey] = useState(null);

const [totalCustomers, setTotalCustomers] = useState(0);
const [totalDue, setTotalDue] = useState(0);

  useEffect(() => {
  if (!user) return;

  const createShop = async () => {
    const shopRef = doc(db, "shops", user.uid);

    const shopSnap = await getDoc(shopRef);

    if (!shopSnap.exists()) {
      await setDoc(shopRef, {
        ownerEmail: user.email,
        createdAt: new Date(),
      });

      console.log("Shop Created");
    }
  };

  createShop();
loadDashboardStats();
}, [user]);

const loadDashboardStats = async () => {
  const snap = await getDocs(
    collection(db, "shops", user.uid, "customers")
  );

  let due = 0;

  snap.forEach((doc) => {
    due += Number(doc.data().due || 0);
  });

  setTotalCustomers(snap.size);
  setTotalDue(due);
};

  if (loading) {
    return <h2 style={{ padding: "30px", fontFamily: "system-ui" }}>Loading...</h2>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="hd-root">
      <style>{`
        * { box-sizing: border-box; }
        .hd-root {
          min-height: 100vh;
          width: 100%;
          background: var(--bg);
          font-family: system-ui, -apple-system, sans-serif;
        }

        /* ===== Header ===== */
        .hd-header {
          background: linear-gradient(135deg, #111827 0%, #1E3A8A 100%);
          color: #fff;
          padding: 14px 16px;
        }
        @media (min-width: 640px) { .hd-header { padding: 18px 28px; } }

        .hd-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 720px;
          margin: 0 auto;
        }

        .hd-brand { font-size: 15px; font-weight: 800; letter-spacing: 0.2px; }
        @media (min-width: 640px) { .hd-brand { font-size: 18px; } }
        .hd-brand-sub { font-size: 10px; color: #93C5FD; margin-top: 1px; }
        @media (min-width: 640px) { .hd-brand-sub { font-size: 12px; } }

        /* compact profile chip */
        .hd-profile {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.08);
          border-radius: 999px;
          padding: 5px 12px 5px 5px;
        }
        .hd-avatar {
          width: 26px; height: 26px;
          border-radius: 50%;
          background: #2563EB;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; flex-shrink: 0;
        }
        .hd-email {
          font-size: 11px;
          max-width: 110px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        @media (min-width: 640px) { .hd-email { font-size: 12.5px; max-width: 200px; } }

        /* ===== Body ===== */
        .hd-body {
          max-width: 720px;
          margin: 0 auto;
          padding: 18px 16px 32px;
        }
        @media (min-width: 640px) { .hd-body { padding: 24px 24px 40px; } }

        .hd-welcome { font-size: 13px; color: #6B7280; margin: 0 0 14px; }

        /* ===== Feature grid ===== */
        .hd-grid {
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 28px 18px;
  margin-top: 25px;
}
        @media (min-width: 640px) {
          .hd-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; }
        }
        @media (min-width: 900px) {
          .hd-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; }
        }

        .hd-tile {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: .2s;
}

.hd-tile:hover{
  transform: translateY(-2px);
}
        .hd-tile:active,
        .hd-tile.pressed {
          transform: scale(0.95);
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .hd-tile-icon{
  width:64px;
  height:64px;
  display:flex;
  align-items:center;
  justify-content:center;
}
        @media (min-width: 640px) {
          .hd-tile-icon { font-size: 30px; width: 54px; height: 54px; }
        }
        .hd-tile-title {
          font-size: 12px;
          font-weight: 700;
          color: var(--text);
          text-align: center;
        }
        @media (min-width: 640px) { .hd-tile-title { font-size: 13.5px; } }

        .hd-tile.logout .hd-tile-icon { background: #FEF2F2; }
        .hd-tile.logout .hd-tile-title { color: #DC2626; }
      `}</style>

      <div className="hd-header">
        <div className="hd-header-row">
          <div>
            <div className="hd-brand">Smart Halkhata</div>
            <div className="hd-brand-sub">Shop Dashboard</div>
          </div>

          <div className="hd-profile">
            <div className="hd-avatar">{(user.email || "?").charAt(0).toUpperCase()}</div>
            <div className="hd-email">{user.email}</div>
          </div>
        </div>
      </div>

      <div className="hd-body">
        <p className="hd-welcome">
  Welcome back 👋 — quick access to everything below
</p>

<div
  style={{
    background: "var(--card)",
    borderRadius: "16px",
    padding: "18px",
    marginBottom: "18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,.08)",
  }}
>
  <div>
    <div
      style={{
        fontSize: "13px",
        color: "var(--text)",
      }}
    >
      Total Due
    </div>

    <div
      style={{
        fontSize: "28px",
        fontWeight: "800",
        color: "#DC2626",
      }}
    >
      ৳{totalDue.toLocaleString()}
    </div>
  </div>

  <div style={{ textAlign: "right" }}>
    <div
      style={{
        fontSize: "13px",
        color: "#6B7280",
      }}
    >
      Customers
    </div>

    <div
      style={{
        fontSize: "28px",
        fontWeight: "800",
        color: "#16A34A",
      }}
    >
      {totalCustomers}
    </div>
  </div>
</div>

        <div className="hd-grid">
          {NAV_CARDS.map((card) => (
            <div
              key={card.key}
              className={`hd-tile ${pressedKey === card.key ? "pressed" : ""}`}
              onClick={() => navigate(card.path)}
              onTouchStart={() => setPressedKey(card.key)}
              onTouchEnd={() => setPressedKey(null)}
              onMouseDown={() => setPressedKey(card.key)}
              onMouseUp={() => setPressedKey(null)}
              onMouseLeave={() => setPressedKey(null)}
            >
              <div className="hd-tile-icon">
  <img
    src={card.icon}
    alt={card.title}
    style={{
      width: "48px",
      height: "48px",
      objectFit: "contain",
    }}
  />
</div>
              <div className="hd-tile-title">{card.title}</div>
            </div>
          ))}

          <div
            className={`hd-tile logout ${pressedKey === "logout" ? "pressed" : ""}`}
            onClick={logout}
            onTouchStart={() => setPressedKey("logout")}
            onTouchEnd={() => setPressedKey(null)}
            onMouseDown={() => setPressedKey("logout")}
            onMouseUp={() => setPressedKey(null)}
            onMouseLeave={() => setPressedKey(null)}
          >
            <div className="hd-tile-icon">
  <IoPower
    size={48}
    color="#EF4444"
  />
</div>
            <div className="hd-tile-title">Logout</div>
          </div>
        </div>
           </div>

<BottomNavigation />
    </div>
  );
}

export default Dashboard;