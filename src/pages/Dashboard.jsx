import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useEffect } from "react";
import BottomNavigation from "../components/BottomNavigation";

const NAV_CARDS = [
  { key: "customers", title: "Customers", icon: "👥", path: "/customers" },
  { key: "shop-profile", title: "Shop Profile", icon: "🏬", path: "/shop-profile" },
  { key: "settings", title: "Settings", icon: "⚙️", path: "/settings" },
  { key: "staff-management", title: "Staff", icon: "🧑‍💼", path: "/staff-management" },
];

function Dashboard() {
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pressedKey, setPressedKey] = useState(null);

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
}, [user]);

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
          background: #F3F4F6;
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
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 640px) {
          .hd-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; }
        }
        @media (min-width: 900px) {
          .hd-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; }
        }

        .hd-tile {
          aspect-ratio: 1 / 1;
          background: #fff;
          border-radius: 16px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          user-select: none;
        }
        .hd-tile:active,
        .hd-tile.pressed {
          transform: scale(0.95);
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .hd-tile-icon {
          font-size: 26px;
          width: 46px; height: 46px;
          border-radius: 12px;
          background: #EFF6FF;
          display: flex; align-items: center; justify-content: center;
        }
        @media (min-width: 640px) {
          .hd-tile-icon { font-size: 30px; width: 54px; height: 54px; }
        }
        .hd-tile-title {
          font-size: 12px;
          font-weight: 700;
          color: #111827;
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
        <p className="hd-welcome">Welcome back 👋 — quick access to everything below</p>

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
              <div className="hd-tile-icon">{card.icon}</div>
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
            <div className="hd-tile-icon">🚪</div>
            <div className="hd-tile-title">Logout</div>
          </div>
        </div>
           </div>

      <BottomNavigation />
    </div>
  );
}

export default Dashboard;