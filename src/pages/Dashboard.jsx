import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Navigate, useNavigate } from "react-router-dom";
import { IoPower, IoInformationCircleOutline } from "react-icons/io5";
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
import NatureHeader from "../components/NatureHeader";
import AvatarPicker from "../components/AvatarPicker";
import overviewIcon from "../assets/icons/overview.svg";
import staffIcon from "../assets/icons/staff.svg";
import reportsIcon from "../assets/icons/reports.svg";

import customersIcon from "../assets/icons/customers.svg";
import shopIcon from "../assets/icons/shop.svg";
import settingsIcon from "../assets/icons/settings.svg";
import notificationIcon from "../assets/icons/notification.svg";
import supportIcon from "../assets/icons/support.svg";
import avatar1 from "../assets/avatars/avatar1.png";

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

const ABOUT_CARD = {
  key: "about",
  title: "About",
  path: "/about",
};

function Dashboard() {
  const { user, loading, logout } = useContext(AuthContext);
const { t } = useLanguage();
  const navigate = useNavigate();
const [pressedKey, setPressedKey] = useState(null);
const [showBalance, setShowBalance] = useState(false);
const [showProfile, setShowProfile] = useState(false);
const [showAvatars, setShowAvatars] = useState(false);

const drawerStyle = {
  position: "fixed",
  top: 0,
  left: showProfile ? 0 : "-340px",
  width: "340px",
  maxWidth: "85%",
  height: "100vh",
  background: "var(--card)",
  boxShadow: "0 0 40px rgba(0,0,0,.25)",
  transition: "left .35s ease",
  zIndex: 99999,
  overflowY: "auto",
};

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
const [shopLogo, setShopLogo] = useState("");

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
setShopLogo(shopSnap.data().logoUrl || "");
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
  border-bottom-left-radius: 28px;
  border-bottom-right-radius: 28px;
  box-shadow: 0 10px 35px rgba(37,99,235,.28);
  position: relative;
overflow: hidden;
}
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

        .hd-tile{
  background:transparent;
  border:none;
  box-shadow:none;
  padding:8px 0;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:10px;
  cursor:pointer;
  transition:.22s ease;
}
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
  transform:translateY(-2px);
}

.hd-tile:active,
.hd-tile.pressed{
  transform:scale(.95);
}
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
        @keyframes balanceFloat{
  0%{
    transform:translateX(-50%) translateY(0);
  }
  50%{
    transform:translateX(-50%) translateY(-3px);
  }
  100%{
    transform:translateX(-50%) translateY(0);
  }
}
  .hd-bg-wave{
position:absolute;
border-radius:50%;
filter:blur(70px);
pointer-events:none;
opacity:.28;
animation:waveMove 16s linear infinite;
}

.wave1{
width:260px;
height:260px;
background:#7DD3FC;
left:-60px;
top:-100px;
}

.wave2{
width:340px;
height:340px;
background:#60A5FA;
right:-120px;
top:-120px;
animation-duration:22s;
}

.wave3{
width:220px;
height:220px;
background:#93C5FD;
left:45%;
top:-80px;
animation-duration:18s;
}

@keyframes waveMove{

0%{
transform:translate(0,0) scale(1);
}

25%{
transform:translate(40px,15px) scale(1.08);
}

50%{
transform:translate(-25px,30px) scale(.96);
}

75%{
transform:translate(30px,-15px) scale(1.05);
}

100%{
transform:translate(0,0) scale(1);
}

}
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
  <NatureHeader />

<div className="hd-bg-wave wave1"></div>
<div className="hd-bg-wave wave2"></div>
<div className="hd-bg-wave wave3"></div>
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
    <div
style={{
position:"relative",
width:"100%",
height:"100%",
}}
>
{shopLogo ? (
  <img
    src={shopLogo}
    alt="Profile"
    style={{
      width:"100%",
      height:"100%",
      objectFit:"cover",
      borderRadius:"50%",
    }}
  />
) : (
  (user.email || "?").charAt(0).toUpperCase()
)}

</div>
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
    background:
"linear-gradient(135deg,rgba(255,255,255,.18),rgba(255,255,255,.08))",
backdropFilter:"blur(18px)",
border:"1px solid rgba(255,255,255,.18)",
boxShadow:"0 10px 25px rgba(0,0,0,.15)",
animation:"balanceFloat 4s ease-in-out infinite",
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
            width: "48px",
            height: "48px",
            objectFit: "contain",
            transition: ".25s",
          }}
        />
      </div>

      <div className="hd-tile-title">{card.title}</div>
    </div>
  ))}

  <div
      key={ABOUT_CARD.key}
            className={`hd-tile ${pressedKey === ABOUT_CARD.key ? "pressed" : ""}`}
            onClick={() => navigate(ABOUT_CARD.path)}
            onTouchStart={() => setPressedKey(ABOUT_CARD.key)}
            onTouchEnd={() => setPressedKey(null)}
            onMouseDown={() => setPressedKey(ABOUT_CARD.key)}
            onMouseUp={() => setPressedKey(null)}
            onMouseLeave={() => setPressedKey(null)}
          >
            <div className="hd-tile-icon">
              <IoInformationCircleOutline size={48} color="#2563EB" />
            </div>
            <div className="hd-tile-title">{ABOUT_CARD.title}</div>
          </div>

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
      <IoPower size={48} color="#EF4444" />
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
      zIndex: 99998,
    }}
  />
)}

<div
  style={{
    ...drawerStyle,
    display: "flex",
    flexDirection: "column",
    background:
"linear-gradient(135deg,#1E3A8A 0%,#2563EB 40%,#3B82F6 100%)",
    color: "#fff",
  }}
>
  <div
  style={{
    padding: "30px 22px",
    background:
      "linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.02))",
    borderBottom: "1px solid rgba(255,255,255,.12)",
    position: "sticky",
    top: 0,
    backdropFilter: "blur(18px)",
    zIndex: 5,
  }}
>
   <div
  style={{
    width: "95px",
    height: "95px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#60A5FA,#2563EB)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "34px",
    fontWeight: "800",
    border: "4px solid rgba(255,255,255,.25)",
    boxShadow: "0 15px 35px rgba(0,0,0,.25)",
    margin: "10px auto 20px",
    position: "relative",
overflow: "visible",
  }}
    >
      {shopLogo ? (
  <img
    src={shopLogo}
    alt="Profile"
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: "50%",
    }}
  />
) : (
  <img
    src={avatar1}
    alt="Profile"
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: "50%",
    }}
  />
)}
<div
  onClick={(e) => {
    e.stopPropagation();
    setShowProfile(false);
    navigate("/shop-profile?avatar=1");
  }}
  style={{
    position: "absolute",
    right: "-6px",
    bottom: "-6px",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "#22C55E",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "14px",
    cursor: "pointer",
    border: "3px solid #fff",
    zIndex: 999,
  }}
>
  ✏️
</div>
    </div>

    <div
style={{
display:"flex",
justifyContent:"center",
alignItems:"center",
gap:"8px",
marginTop:"10px",
}}

>
<h2
style={{
margin:0,
fontSize:"28px",
fontWeight:"800",
}}
>
{shopName || "My Shop"}
</h2>

<div
style={{
background:"#22C55E",
width:"24px",
height:"24px",
borderRadius:"50%",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:"13px",
}}
>
✓
</div>
</div>

<p
  style={{
    marginTop: "6px",
    color: "rgba(255,255,255,.75)",
    fontSize: "13px",
  }}
>
  {user.email}
</p>

<div
  style={{
    marginTop: "30px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  }}
>

{[
  ["👤","Edit Profile","/shop-profile"],
  ["🏪","Shop Information","/shop-profile"],
  ["📞","Phone Number","/shop-profile"],
  ["🔔","Notifications","/notifications"],
  ["🌙","Dark Mode","/settings"],
  ["🌐","Language","/settings"],
  ["🔐","Change Password","/change-password"],
  ["📊","Reports","/reports"],
  ["⚙️","Settings","/settings"],
  ["❓","Help & Support","/help-support"],
  ["ℹ️","About App","/about"],
].map(([icon,title,path])=>(
<div
key={title}
onClick={()=>{
  if(path){
    setShowProfile(false);
    navigate(path);
  }else{
    setShowProfile(false);
    navigate("/about");
}
}}
style={{
display:"flex",
alignItems:"center",
justifyContent:"space-between",
padding:"14px 16px",
borderRadius:"16px",
background:"rgba(255,255,255,.10)",
backdropFilter:"blur(14px)",
border:"1px solid rgba(255,255,255,.15)",
cursor:"pointer",
transition:".25s",
boxShadow:"0 6px 20px rgba(0,0,0,.10)",
}}
onMouseEnter={(e)=>{
e.currentTarget.style.transform="translateX(6px)";
e.currentTarget.style.background="rgba(255,255,255,.18)";
}}
onMouseLeave={(e)=>{
e.currentTarget.style.transform="translateX(0px)";
e.currentTarget.style.background="rgba(255,255,255,.10)";
}}
onMouseDown={(e)=>{
e.currentTarget.style.transform="scale(.97)";
}}
onMouseUp={(e)=>{
e.currentTarget.style.transform="translateX(6px)";
}}
>
<div
style={{
display:"flex",
alignItems:"center",
gap:"12px",
fontWeight:"700",
}}
>
<span style={{fontSize:"20px"}}>{icon}</span>
<span>{title}</span>
</div>

<div
style={{
fontSize:"20px",
opacity:.7,
}}
>
➜
</div>
</div>
))
}

<div
  style={{
    background: "rgba(255,255,255,.12)",
    borderRadius: "16px",
    padding: "14px 16px",
  }}
>
  <div style={{ fontSize: "12px", opacity: .7 }}>🏪 Shop</div>
  <div style={{ fontWeight: "700", marginTop: "4px" }}>
    {shopName || "No Shop"}
  </div>
</div>

<div
  style={{
    background: "rgba(255,255,255,.12)",
    borderRadius: "16px",
    padding: "14px 16px",
  }}
>
  <div style={{ fontSize: "12px", opacity: .7 }}>📧 Email</div>
  <div
    style={{
      fontWeight: "700",
      marginTop: "4px",
      wordBreak: "break-word",
    }}
  >
    {user.email}
  </div>
</div>
  <button
    onClick={() => {
      setShowProfile(false);
      navigate("/shop-profile");
    }}
    style={{
      height: "52px",
      border: "none",
      borderRadius: "14px",
      background: "rgba(255,255,255,.15)",
      color: "#fff",
      fontWeight: "700",
      cursor: "pointer",
    }}
  >
    👤 Profile
  </button>

  <button
  onClick={logout}
  style={{
    marginTop: "18px",
    height: "54px",
    border: "none",
    borderRadius: "16px",
    background: "#DC2626",
    color: "#fff",
    fontWeight: "800",
    fontSize: "16px",
    cursor: "pointer",

  }}
>
  🚪 Logout
</button>
</div>
  </div>
</div>

<BottomNavigation />
    </div>
  );
}

export default Dashboard;