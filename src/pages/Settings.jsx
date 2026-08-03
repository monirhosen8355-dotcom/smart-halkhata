import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import BottomNavigation from "../components/BottomNavigation";

function Settings() {
  const { user } = useContext(AuthContext);

  const [settings, setSettings] = useState({
  // Appearance
  darkMode: false,

  // Shop Information
  shopName: "",
  ownerName: "",
  phone: "",
  address: "",

  // Receipt
  showLogo: true,
  showPhone: true,
  showAddress: true,
  receiptFooter: "Thank you. Visit Again.",

  // Notification
  dueNotification: true,
  paymentNotification: true,
  soundNotification: true,

  // Language
  language: "English",

  // Regional
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

  shopName: data.shopName || "",
  ownerName: data.ownerName || "",
  phone: data.phone || "",
  address: data.address || "",

  showLogo: data.showLogo ?? true,
  showPhone: data.showPhone ?? true,
  showAddress: data.showAddress ?? true,
  receiptFooter: data.receiptFooter || "Thank you. Visit Again.",

  dueNotification: data.dueNotification ?? true,
  paymentNotification: data.paymentNotification ?? true,
  soundNotification: data.soundNotification ?? true,

  language: data.language || "English",

  currency: data.currency || "Tk",
  dateFormat: data.dateFormat || "DD-MM-YYYY",
  timeFormat: data.timeFormat || "12h",
});
    }
  };

  const handleSave = async () => {
    document.documentElement.setAttribute(
  "data-theme",
  settings.darkMode ? "dark" : "light"
);
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
    color: "var(--text)",
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
      <div style={{ fontSize: "12.5px", color: "var(--text)",marginTop: "3px" }}>{desc}</div>
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "32px 20px 120px",
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
                  background: "var(--card)",
                  position: "absolute",
                  top: "3px",
                  left: settings.darkMode ? "25px" : "3px",
                  transition: "left 0.2s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
              />
            </div>
          </div>
                {/* Shop Information */}
<div style={sectionHeading}>Shop Information</div>

<div style={sectionRow}>
  {labelBlock("Shop Name", "Your business name")}
  <input
    value={settings.shopName}
    onChange={(e) =>
      setSettings({ ...settings, shopName: e.target.value })
    }
    className="cd-input"
    style={{ ...selectStyle, maxWidth: "220px" }}
  />
</div>

<div style={sectionRow}>
  {labelBlock("Owner Name", "Shop owner's full name")}
  <input
    value={settings.ownerName}
    onChange={(e) =>
      setSettings({ ...settings, ownerName: e.target.value })
    }
    className="cd-input"
    style={{ ...selectStyle, maxWidth: "220px" }}
  />
</div>

<div style={sectionRow}>
  {labelBlock("Phone Number", "Business contact number")}
  <input
    value={settings.phone}
    onChange={(e) =>
      setSettings({ ...settings, phone: e.target.value })
    }
    className="cd-input"
    style={{ ...selectStyle, maxWidth: "220px" }}
  />
</div>

<div style={sectionRow}>
  {labelBlock("Shop Address", "Business address")}
  <input
    value={settings.address}
    onChange={(e) =>
      setSettings({ ...settings, address: e.target.value })
    }
    className="cd-input"
    style={{ ...selectStyle, maxWidth: "220px" }}
  />
</div>

{/* Receipt Settings */}
<div style={sectionHeading}>Receipt Settings</div>

<div style={sectionRow}>
  {labelBlock("Show Shop Logo", "Display logo on receipt")}
  <input
    type="checkbox"
    checked={settings.showLogo}
    onChange={(e) =>
      setSettings({ ...settings, showLogo: e.target.checked })
    }
  />
</div>

<div style={sectionRow}>
  {labelBlock("Show Phone", "Display phone on receipt")}
  <input
    type="checkbox"
    checked={settings.showPhone}
    onChange={(e) =>
      setSettings({ ...settings, showPhone: e.target.checked })
    }
  />
</div>

<div style={sectionRow}>
  {labelBlock("Show Address", "Display address on receipt")}
  <input
    type="checkbox"
    checked={settings.showAddress}
    onChange={(e) =>
      setSettings({ ...settings, showAddress: e.target.checked })
    }
  />
</div>

<div style={sectionRow}>
  {labelBlock("Receipt Footer", "Message shown below receipt")}
  <input
    value={settings.receiptFooter}
    onChange={(e) =>
      setSettings({
        ...settings,
        receiptFooter: e.target.value,
      })
    }
    className="cd-input"
    style={{ ...selectStyle, maxWidth: "260px" }}
  />
</div>

{/* Notification */}
<div style={sectionHeading}>Notifications</div>

<div style={sectionRow}>
  {labelBlock("Due Notification", "Notify when due is added")}
  <input
    type="checkbox"
    checked={settings.dueNotification}
    onChange={(e) =>
      setSettings({
        ...settings,
        dueNotification: e.target.checked,
      })
    }
  />
</div>

<div style={sectionRow}>
  {labelBlock("Payment Notification", "Notify when payment received")}
  <input
    type="checkbox"
    checked={settings.paymentNotification}
    onChange={(e) =>
      setSettings({
        ...settings,
        paymentNotification: e.target.checked,
      })
    }
  />
</div>

<div style={sectionRow}>
  {labelBlock("Notification Sound", "Play sound")}
  <input
    type="checkbox"
    checked={settings.soundNotification}
    onChange={(e) =>
      setSettings({
        ...settings,
        soundNotification: e.target.checked,
      })
    }
  />
</div>

{/* Language */}
<div style={sectionHeading}>Language</div>

<div style={sectionRow}>
  {labelBlock("Language", "Application language")}
  <select
    value={settings.language}
    onChange={(e) =>
      setSettings({
        ...settings,
        language: e.target.value,
      })
    }
    style={{ ...selectStyle, maxWidth: "180px" }}
  >
    <option>English</option>
    <option>বাংলা</option>
  </select>
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
    {/* Security */}
<div style={sectionHeading}>Security</div>

<div style={sectionRow}>
  {labelBlock("Change Password", "Update your account password")}
  <button
    style={{
      padding: "10px 18px",
      border: "none",
      borderRadius: "10px",
      background: "#2563EB",
      color: "#fff",
      fontWeight: 700,
      cursor: "pointer",
    }}
    onClick={() => alert("Coming Soon")}
  >
    Change
  </button>
</div>

{/* About */}
<div style={sectionHeading}>About</div>

<div style={sectionRow}>
  {labelBlock("App Version", "Current installed version")}
  <strong>v1.0.0</strong>
</div>

<div style={sectionRow}>
  {labelBlock("Privacy Policy", "Read our privacy policy")}
  <button
    style={{
      padding: "8px 14px",
      borderRadius: "8px",
      border: "1px solid #E5E7EB",
      cursor: "pointer",
    }}
  >
    Open
  </button>
</div>

<div style={{ ...sectionRow, borderBottom: "none" }}>
  {labelBlock("Terms & Conditions", "Application terms")}
  <button
    style={{
      padding: "8px 14px",
      borderRadius: "8px",
      border: "1px solid #E5E7EB",
      cursor: "pointer",
    }}
  >
    Open
  </button>
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

      <BottomNavigation />
    </div>
  );
}

export default Settings;