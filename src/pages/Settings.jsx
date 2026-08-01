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

  if (!user) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: "30px" }}>
      <h1>Settings</h1>

      <div style={{ marginBottom: "15px" }}>
        <label>
          <input
            type="checkbox"
            checked={settings.darkMode}
            onChange={(e) =>
              setSettings({ ...settings, darkMode: e.target.checked })
            }
          />{" "}
          Dark Mode
        </label>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Currency: </label>
        <select
          value={settings.currency}
          onChange={(e) =>
            setSettings({ ...settings, currency: e.target.value })
          }
        >
          <option value="Tk">Tk</option>
          <option value="৳">৳</option>
        </select>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Date Format: </label>
        <select
          value={settings.dateFormat}
          onChange={(e) =>
            setSettings({ ...settings, dateFormat: e.target.value })
          }
        >
          <option value="DD-MM-YYYY">DD-MM-YYYY</option>
          <option value="MM-DD-YYYY">MM-DD-YYYY</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
        </select>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Time Format: </label>
        <select
          value={settings.timeFormat}
          onChange={(e) =>
            setSettings({ ...settings, timeFormat: e.target.value })
          }
        >
          <option value="12h">12 hour</option>
          <option value="24h">24 hour</option>
        </select>
      </div>

      <button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}

export default Settings;