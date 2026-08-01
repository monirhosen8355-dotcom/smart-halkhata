import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useEffect } from "react";

const NAV_CARDS = [
  {
    key: "customers",
    title: "Customers",
    desc: "View, add and manage customer accounts",
    icon: "👥",
    path: "/customers",
    accent: "#2563EB",
  },
  {
    key: "shop-profile",
    title: "Shop Profile",
    desc: "Manage your shop details and logo",
    icon: "🏬",
    path: "/shop-profile",
    accent: "#7C3AED",
  },
  {
    key: "settings",
    title: "Settings",
    desc: "Dark mode, currency, date & time format",
    icon: "⚙️",
    path: "/settings",
    accent: "#D97706",
  },
  {
    key: "staff-management",
    title: "Staff Management",
    desc: "Add and manage staff accounts",
    icon: "🧑‍💼",
    path: "/staff-management",
    accent: "#059669",
  },
];

function Dashboard() {
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [hoveredKey, setHoveredKey] = useState(null);

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
    return <h2>Loading...</h2>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const cardStyle = (accent, isHovered) => ({
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid #E5E7EB",
    boxShadow: isHovered
      ? "0 12px 24px rgba(0,0,0,0.10)"
      : "0 2px 6px rgba(0,0,0,0.04)",
    transform: isHovered ? "translateY(-4px)" : "translateY(0)",
    transition: "all 0.2s ease",
    cursor: "pointer",
    borderTop: `4px solid ${accent}`,
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F3F4F6",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#111827",
          color: "#fff",
          padding: "24px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <div style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "0.3px" }}>
            Smart Halkhata
          </div>
          <div style={{ fontSize: "13px", color: "#9CA3AF", marginTop: "2px" }}>
            Shop Management Dashboard
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "13px", color: "#9CA3AF" }}>Logged in as</div>
          <div style={{ fontSize: "14px", fontWeight: 600 }}>{user.email}</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "32px", maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ margin: 0, fontSize: "26px", color: "#111827" }}>
            Welcome back 👋
          </h1>
          <p style={{ margin: "6px 0 0", color: "#6B7280", fontSize: "14px" }}>
            Here's a quick way to get to everything in your shop.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
          }}
        >
          {NAV_CARDS.map((card) => (
            <div
              key={card.key}
              onClick={() => navigate(card.path)}
              onMouseEnter={() => setHoveredKey(card.key)}
              onMouseLeave={() => setHoveredKey(null)}
              style={cardStyle(card.accent, hoveredKey === card.key)}
            >
              <div style={{ fontSize: "32px", marginBottom: "10px" }}>{card.icon}</div>
              <div style={{ fontSize: "17px", fontWeight: 700, color: "#111827" }}>
                {card.title}
              </div>
              <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "6px" }}>
                {card.desc}
              </div>
            </div>
          ))}

          <div
            onClick={logout}
            onMouseEnter={() => setHoveredKey("logout")}
            onMouseLeave={() => setHoveredKey(null)}
            style={cardStyle("#DC2626", hoveredKey === "logout")}
          >
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>🚪</div>
            <div style={{ fontSize: "17px", fontWeight: 700, color: "#DC2626" }}>
              Logout
            </div>
            <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "6px" }}>
              Sign out of your account
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;