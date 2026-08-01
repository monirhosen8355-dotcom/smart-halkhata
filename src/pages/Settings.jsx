import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

function Settings() {
  const { user } = useContext(AuthContext);

  const [settings, setSettings] = useState({
    darkMode: false,
    currency: "Tk",
    dateFormat: "DD-MM-YYYY",
    timeFormat: "12h",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) loadSettings();
  }, [user]);

  const loadSettings = async () => {
    const ref = doc(db, "shops", user.uid, "settings", "preferences");
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      setSettings({
        darkMode: data.darkMode ?? false,
        currency: data.currency || "Tk",
        dateFormat: data.dateFormat || "DD-MM-YYYY",
        timeFormat: data.timeFormat || "12h",
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const ref = doc(db, "shops", user.uid, "settings", "preferences");
      await setDoc(ref, settings, { merge: true });
      alert("Settings saved");
    } catch (error) {
      console.error(error);
      alert("Save failed: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <h2 style={{ padding: "30px", fontFamily: "system-ui" }}>Loading...</h2>;

  const cardBase = {
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
  };

  const selectStyle = {
    padding: "11px 14px",
    borderRadius: "10px",
    border: "1px solid #E5E7EB",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    background: "#fff",
    color: "#111827",
  };

  const sectionRow = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 0",
    borderBottom: "1px solid #F3F4F6",
    flexWrap: "wrap",
    gap: "14px",
  };

  const sectionHeading = {
    fontSize: "12.5px",
    fontWeight: 800,
    color: "#2563EB",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    margin: "24px 0 4px",
  };

  const labelBlock = (title, desc) => (
    <div style={{ minWidth: "180px" }}>
      <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#111827" }}>{title}</div>
      <div style={{ fontSize: "12.5px", color: "#6B7280", marginTop: "3px" }}>{desc}</div>
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F3F4F6",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "32px 20px",
      }}
    >
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ margin: 0, fontSize: "24px", color: "#111827" }}>
            Settings
          </h1>
          <p style={{ margin: "6px 0 0", color: "#6B7280", fontSize: "14px" }}>
            Configure how Smart Halkhata looks and displays data
          </p>
        </div>

        {/* Settings Card */}
        <div style={{ ...cardBase, padding: "8px 28px 28px" }}>
          {/* Appearance section */}
          <div style={sectionHeading}>Appearance</div>

          <div style={sectionRow}>
            {labelBlock("Dark Mode", "Switch to a darker color theme")}
            <div
              onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
              style={{
                width: "50px",
                height: "28px",
                borderRadius: "999px",
                background: settings.darkMode ? "#2563EB" : "#E5E7EB",
                position: "relative",
                cursor: "pointer",
                transition: "background 0.2s ease",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "#fff",
                  position: "absolute",
                  top: "3px",
                  left: settings.darkMode ? "25px" : "3px",
                  transition: "left 0.2s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
              />
            </div>
          </div>

          {/* Regional Settings section */}
          <div style={sectionHeading}>Regional Settings</div>

          <div style={sectionRow}>
            {labelBlock("Currency", "Symbol used across receipts and totals")}
            <select
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              style={{ ...selectStyle, maxWidth: "160px" }}
            >
              <option value="Tk">Tk</option>
              <option value="৳">৳</option>
            </select>
          </div>

          <div style={sectionRow}>
            {labelBlock("Date Format", "How dates appear throughout the app")}
            <select
              value={settings.dateFormat}
              onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
              style={{ ...selectStyle, maxWidth: "160px" }}
            >
              <option value="DD-MM-YYYY">DD-MM-YYYY</option>
              <option value="MM-DD-YYYY">MM-DD-YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div style={{ ...sectionRow, borderBottom: "none" }}>
            {labelBlock("Time Format", "12-hour or 24-hour clock display")}
            <select
              value={settings.timeFormat}
              onChange={(e) => setSettings({ ...settings, timeFormat: e.target.value })}
              style={{ ...selectStyle, maxWidth: "160px" }}
            >
              <option value="12h">12 hour</option>
              <option value="24h">24 hour</option>
            </select>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: "100%",
            marginTop: "20px",
            padding: "14px",
            borderRadius: "12px",
            border: "none",
            background: "#2563EB",
            color: "#fff",
            fontWeight: 700,
            fontSize: "15px",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.6 : 1,
            boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
          }}
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

export default Settings;