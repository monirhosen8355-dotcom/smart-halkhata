import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
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
import reportsIcon from "../assets/icons/reports.svg";

import customersIcon from "../assets/icons/customers.svg";
import shopIcon from "../assets/icons/shop.svg";
import settingsIcon from "../assets/icons/settings.svg";
import notificationIcon from "../assets/icons/notification.svg";

const getNavCards = (t) => [
  {
    key: "customers",
    title: t("customers"),
   icon: customersIcon,
    path: "/customers",
  },
  {
    key: "shop-profile",
    title: t("shopProfile"),
    icon: shopIcon,
    path: "/shop-profile",
  },
  {
  key: "settings",
  title: t("settings"),
  icon: settingsIcon,
  path: "/settings",
},
{
  key: "notifications",
  title: "Notification",
  icon: notificationIcon,
  path: "/notifications",
},
  {
    key: "business-overview",
    title: t("overview"),
    icon: overviewIcon,
    path: "/business-overview",
  },
  {
  key: "staff-management",
  title: t("staff"),
  icon: staffIcon,
  path: "/staff-management",
},
{
  key: "reports",
  title: "Reports",
  icon: reportsIcon,
  path: "/reports",
},
];

function Dashboard() {
  const { user, loading, logout } = useContext(AuthContext);
const { t } = useLanguage();
  const navigate = useNavigate();
const [pressedKey, setPressedKey] = useState(null);
const [showBalance, setShowBalance] = useState(false);
const [showProfile, setShowProfile] = useState(false);

useEffect(() => {
  if (!showBalance) return;

  const timer = setTimeout(() => {
    setShowBalance(false);
  }, 4000);

  return () => clearTimeout(timer);
}, [showBalance]);
const [totalCustomers, setTotalCustomers] = useState(0);
const [totalDue, setTotalDue] = useState(0);

const [shopName, setShopName] = useState("");

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

const shopSnap = await getDoc(doc(db, "shops", user.uid));

if (shopSnap.exists()) {
  setShopName(shopSnap.data().shopName || "");
}
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
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg,#0F172A,#1D4ED8,#2563EB);
  background-size: 300% 300%;
  animation: gradientMove 15s ease infinite;
  color: #fff;
  padding: 16px;
}

.hd-header::before{
  content:"";
  position:absolute;
  width:320px;
  height:320px;
  border-radius:50%;
  background:rgba(255,255,255,.08);
  top:-180px;
  left:-100px;
  filter:blur(10px);
  animation: bubble1 18s linear infinite;
}

.hd-header::after{
  content:"";
  position:absolute;
  width:260px;
  height:260px;
  border-radius:50%;
  background:rgba(255,255,255,.05);
  right:-80px;
  bottom:-140px;
  filter:blur(12px);
  animation:bubble2 20s linear infinite;
}

@keyframes gradientMove{
  0%{background-position:0% 50%;}
  50%{background-position:100% 50%;}
  100%{background-position:0% 50%;}
}

@keyframes bubble1{
  0%{transform:translate(0,0);}
  50%{transform:translate(40px,30px);}
  100%{transform:translate(0,0);}
}

@keyframes bubble2{
  0%{transform:translate(0,0);}
  50%{transform:translate(-35px,-20px);}
  100%{transform:translate(0,0);}
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
  transition: .22s ease;
}

.hd-tile:hover{
  transform: translateY(-3px);
}

.hd-tile:active,
.hd-tile.pressed{
  transform: scale(.95);
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
  transition:.22s;
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
              @keyframes fadeIn{
          from{
            opacity:0;
            transform:translateX(-15px);
          }
          to{
            opacity:1;
            transform:translateX(0);
          }
        }
      `}</style>

      <div className="hd-header">
       <div
  className="hd-header-row"
  style={{
    position: "relative",
    minHeight: "72px",
  }}
>
 <div
  onClick={() => setShowProfile(true)}
  style={{
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    zIndex: 2,
    transition: ".25s",
  }}
>
  <div
  style={{
    width: "54px",
    height: "54px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#60A5FA,#2563EB)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "900",
    fontSize: "22px",
    overflow: "hidden",
    border: "3px solid rgba(255,255,255,.35)",
    boxShadow:
      "0 10px 30px rgba(37,99,235,.45), inset 0 1px 2px rgba(255,255,255,.25)",
    transition: "all .25s ease",
  }}
>
    {(user.email || "?").charAt(0).toUpperCase()}
  </div>
</div>

  <div
  onClick={() => setShowBalance(!showBalance)}
  style={{
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(255,255,255,.12)",
    backdropFilter: "blur(12px)",
    padding: "8px 16px",
    borderRadius: "999px",
    cursor: "pointer",
    transition: ".35s",
    width: showBalance ? "180px" : "130px",
    overflow: "hidden",
  }}
>
    <span style={{ color: "#fff", fontSize: "13px" }}>👁</span>

    <span
  style={{
    color: "#fff",
    fontWeight: "700",
    whiteSpace: "nowrap",
  }}
>
  {showBalance ? `৳${totalDue.toLocaleString()}` : "মোট বাকি"}
</span>
  </div>

  <>
</> 
</div>
      </div>

     <div className="hd-body">
<div className="hd-grid">
          {getNavCards(t).map((card) => (
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
  width: "52px",
  height: "52px",
  objectFit: "contain",
  transition: ".25s",
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
            <div className="hd-tile-title">{t("logout")}</div>
          </div>
        </div>
           </div>

{showProfile && (
  <div
    onClick={() => setShowProfile(false)}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.45)",
      zIndex: 9999,
      display: "flex",
      alignItems: "flex-end",
    }}
  >
    <div
  onClick={(e) => e.stopPropagation()}
  style={{
    width: "100%",
    background: "rgba(255,255,255,.95)",
    backdropFilter: "blur(25px)",
    WebkitBackdropFilter: "blur(25px)",
    borderRadius: "28px 28px 0 0",
    padding: "24px",
    animation: "fadeUp .25s ease",
    boxShadow: "0 -20px 60px rgba(0,0,0,.25)",
  }}
>
  <div
    style={{
      width: "55px",
      height: "5px",
      borderRadius: "999px",
      background: "#CBD5E1",
      margin: "0 auto 18px",
    }}
  />
      <div
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "#2563EB",
          color: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "24px",
          fontWeight: "700",
          margin: "0 auto",
        }}
      >
        {(user.email || "?").charAt(0).toUpperCase()}
      </div>

      <h3
  style={{
    textAlign: "center",
    marginTop: "15px",
    marginBottom: "5px",
    color: "var(--text)",
    fontSize: "20px",
    fontWeight: "700",
  }}
>
  {user.displayName || "User"}
</h3>

<div
  style={{
    textAlign: "center",
    color: "#64748B",
    fontSize: "14px",
    lineHeight: "26px",
    marginBottom: "20px",
  }}
>
  <div>📧 {user.email}</div>
  <div>📞 {user.phoneNumber || "Not Added"}</div>
  <div>🏪 {shopName || "No Shop Name"}</div>
</div>

     <button
  onClick={() => {
    setShowProfile(false);
    navigate("/shop-profile");
  }}
        className="cd-btn"
        style={{
          background: "#2563EB",
          marginTop: "20px",
        }}
      >
        Shop Profile
      </button>

      <button
  onClick={() => {
    setShowProfile(false);
    logout();
  }}
        className="cd-btn"
        style={{
          background: "#DC2626",
          marginTop: "10px",
        }}
      >
        Logout
      </button>
    </div>
  </div>
)}

<BottomNavigation />
    </div>
  );
}

export default Dashboard;