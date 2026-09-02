import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Navigate, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";import BottomNavigation from "../components/BottomNavigation";

function Settings() {
  const { user, loading, logout } = useContext(AuthContext);
  const { language, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();

  // Shop identity — shared with ShopProfile.jsx, lives at shops/{uid}
  const [shopName, setShopName] = useState("");

  // App preferences — lives at shops/{uid}/settings/preferences
  const [darkMode, setDarkMode] = useState(false);

  const [savingField, setSavingField] = useState(null); // "shopName" | "darkMode" | "language" | null

    useEffect(() => {
    if (user) loadAll();
  }, [user]);

  const loadAll = async () => {
    const shopRef = doc(db, "shops", user.uid);
    const shopSnap = await getDoc(shopRef);

    if (shopSnap.exists()) {
      setShopName(shopSnap.data().shopName || "");
    }

    const prefsRef = doc(
      db,
      "shops",
      user.uid,
      "settings",
      "preferences"
    );

    const prefsSnap = await getDoc(prefsRef);

    if (prefsSnap.exists()) {
      const data = prefsSnap.data();
      setDarkMode(data.darkMode ?? false);
    }
  };

  const saveShopName = async (value) => {
    setSavingField("shopName");
    try {
      const shopRef = doc(db, "shops", user.uid);
      await setDoc(shopRef, { shopName: value }, { merge: true });
    } catch (error) {
      console.error(error);
      alert("Failed to save shop name: " + error.message);
    } finally {
      setSavingField(null);
    }
  };

  const toggleDarkMode = async () => {
    const next = !darkMode;
    setDarkMode(next);

    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");

    setSavingField("darkMode");
    try {
      const prefsRef = doc(db, "shops", user.uid, "settings", "preferences");
      await setDoc(prefsRef, { darkMode: next }, { merge: true });
    } catch (error) {
      console.error(error);
      alert("Failed to save dark mode: " + error.message);
    } finally {
      setSavingField(null);
    }
  };

  if (loading) {
    return <h2 style={{ padding: "30px", fontFamily: "system-ui" }}>Loading...</h2>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="se-root">
      <style>{`
        * { box-sizing: border-box; }
        .se-root {
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
          background: var(--bg);
          font-family: system-ui, -apple-system, sans-serif;
          padding: 16px 12px 110px;
        }
        @media (min-width: 640px) { .se-root { padding: 24px 20px 40px; } }

        .se-wrap { max-width: 560px; margin: 0 auto; }

        .se-title { margin: 0; font-size: 22px; color: #111827; }
        @media (min-width: 640px) { .se-title { font-size: 26px; } }
        .se-subtitle { margin: 4px 0 20px; color: #6B7280; font-size: 12.5px; }

        .se-card {
          background: var(--card);
          border-radius: 16px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
          overflow: hidden;
          margin-bottom: 20px;
        }

        .se-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 18px;
          border-bottom: 1px solid #F3F4F6;
          gap: 12px;
        }
        .se-row:last-child { border-bottom: none; }

        .se-row-clickable { cursor: pointer; }
        .se-row-clickable:active { background: #F9FAFB; }

        .se-row-title { font-size: 14.5px; font-weight: 700; color: var(--text); }
        .se-row-desc { font-size: 11.5px; color: #9CA3AF; margin-top: 2px; }

        .se-arrow { font-size: 18px; color: #D1D5DB; flex-shrink: 0; }

        .se-switch {
          width: 48px; height: 27px; border-radius: 999px;
          position: relative; cursor: pointer;
          transition: background 0.2s ease; flex-shrink: 0;
        }
        .se-switch-dot {
          width: 21px; height: 21px; border-radius: 50%; background: #fff;
          position: absolute; top: 3px; transition: left 0.2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .se-select {
          padding: 9px 12px; border-radius: 9px; border: 1px solid #E5E7EB;
          font-size: 13.5px; outline: none; background: var(--card); color: var(--text);
          max-width: 140px; width: 100%;
        }

        .se-input {
          padding: 9px 12px; border-radius: 9px; border: 1px solid #E5E7EB;
          font-size: 13.5px; outline: none; background: var(--card); color: var(--text);
          max-width: 180px; width: 100%; text-align: right;
        }

        .se-saving { font-size: 10.5px; color: #2563EB; margin-left: 6px; white-space: nowrap; }

        .se-version-card {
          text-align: center;
          padding: 22px 16px;
          margin-bottom: 20px;
        }
        .se-version-brand { font-size: 13px; font-weight: 700; color: #9CA3AF; letter-spacing: 0.3px; }
        .se-version-number { font-size: 11px; color: #C1C5CC; margin-top: 3px; }

        .se-logout-btn {
          width: 100%;
          padding: 15px;
          border-radius: 14px;
          border: none;
          background: #DC2626;
          color: #fff;
          font-weight: 800;
          font-size: 15px;
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(220,38,38,0.25);
        }
      `}</style>

      <div className="se-wrap">
        <h1 className="se-title">Settings</h1>
        <p className="se-subtitle">Manage your account and app preferences</p>

        <div className="se-card">
          <div
            className="se-row se-row-clickable"
            onClick={() => navigate("/change-password")}
          >
            <div>
              <div className="se-row-title">Change Password</div>
              <div className="se-row-desc">Update your account password</div>
            </div>
            <span className="se-arrow">›</span>
          </div>

          <div className="se-row">
            <div className="se-row-title">Dark Mode</div>
            <div
              className="se-switch"
              onClick={toggleDarkMode}
              style={{ background: darkMode ? "#2563EB" : "#E5E7EB" }}
            >
              <div className="se-switch-dot" style={{ left: darkMode ? "24px" : "3px" }} />
            </div>
          </div>

          <div className="se-row">
            <div className="se-row-title">Language</div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <select
                value={language}
                onChange={(e) => { setSavingField("language"); changeLanguage(e.target.value).finally(() => setSavingField(null)); }}
                className="se-select"
              >
                <option>English</option>
                <option>বাংলা</option>
              </select>
              {savingField === "language" && <span className="se-saving">Saving...</span>}
            </div>
          </div>

          <div className="se-row">
            <div className="se-row-title">Shop Name</div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                onBlur={(e) => saveShopName(e.target.value)}
                placeholder="Your shop name"
                className="se-input"
              />
              {savingField === "shopName" && <span className="se-saving">Saving...</span>}
            </div>
          </div>
        </div>
        <div className="se-card se-version-card">
          <div className="se-version-brand">Smart Halkhata</div>
          <div className="se-version-number">Version 1.0.0</div>
        </div>

        <button onClick={logout} className="se-logout-btn">
          Logout
        </button>
      </div>

      <BottomNavigation />
    </div>
  );
}

export default Settings;