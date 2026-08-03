import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { db, storage } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import BottomNavigation from "../components/BottomNavigation";

function ShopProfile() {
  const { user } = useContext(AuthContext);

  const [profile, setProfile] = useState({
    shopName: "",
    ownerName: "",
    phone: "",
    address: "",
    logoUrl: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    const ref = doc(db, "shops", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      setProfile({
        shopName: data.shopName || "",
        ownerName: data.ownerName || "",
        phone: data.phone || "",
        address: data.address || "",
        logoUrl: data.logoUrl || "",
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      let logoUrl = profile.logoUrl;

      if (logoFile) {
        const storageRef = ref(storage, `shops/${user.uid}/logo.jpg`);
        await uploadBytes(storageRef, logoFile);
        logoUrl = await getDownloadURL(storageRef);
      }

      const shopRef = doc(db, "shops", user.uid);
      await setDoc(
        shopRef,
        {
          shopName: profile.shopName,
          ownerName: profile.ownerName,
          phone: profile.phone,
          address: profile.address,
          logoUrl,
        },
        { merge: true }
      );

      setProfile((prev) => ({ ...prev, logoUrl }));
      setLogoFile(null);
      setIsEditing(false);
      alert("Shop profile saved");
    } catch (error) {
      console.error(error);
      alert("Save failed: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <h2 style={{ padding: "30px", fontFamily: "system-ui" }}>Loading...</h2>;

  return (
    <div className="sp-root">
      <style>{`
        * { box-sizing: border-box; }
        .sp-root {
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
          background: var(--bg);
          font-family: system-ui, -apple-system, sans-serif;
          padding: 16px 12px 120px;
        }
        @media (min-width: 640px) {
  .sp-root {
    padding: 24px 20px 140px;
  }
}

        .sp-wrap { max-width: 620px; margin: 0 auto; }

        .sp-title { margin: 0; font-size: 22px; color: #111827; }
        @media (min-width: 640px) { .sp-title { font-size: 26px; } }
        .sp-subtitle { margin: 4px 0 16px; color: var(--text); font-size: 12.5px; }
        @media (min-width: 640px) { .sp-subtitle { font-size: 14px; margin-bottom: 22px; } }

        .sp-card {
          background: var(--card);
          border-radius: 16px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
          padding: 20px 16px;
        }
        @media (min-width: 640px) { .sp-card { padding: 32px; } }

        .sp-logo-wrap { text-align: center; margin-bottom: 22px; }
        .sp-logo {
          width: 84px; height: 84px; border-radius: 18px;
          object-fit: cover; border: 1px solid #E5E7EB;
        }
        @media (min-width: 640px) { .sp-logo { width: 110px; height: 110px; border-radius: 20px; } }
        .sp-logo-fallback {
          width: 84px; height: 84px; border-radius: 18px;
          background: #EFF6FF; color: #2563EB;
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; font-weight: 700; margin: 0 auto;
        }
        @media (min-width: 640px) {
          .sp-logo-fallback { width: 110px; height: 110px; border-radius: 20px; font-size: 34px; }
        }

        .sp-label {
          font-size: 11.5px; font-weight: 700; color: #6B7280;
          margin-bottom: 5px; display: block;
        }
        .sp-input {
          padding: 11px 13px; border-radius: 10px; border: 1px solid #E5E7EB;
          font-size: 13.5px; outline: none; width: 100%;
        }
        .sp-field { margin-bottom: 14px; }

        .sp-btn {
          padding: 12px; border-radius: 10px; border: none; color: #fff;
          font-weight: 700; font-size: 14px; cursor: pointer; flex: 1;
        }
        .sp-btn.outline { background: #F3F4F6; color: #374151; }
        .sp-btn-row { display: flex; gap: 10px; }

        .sp-view-row {
          display: flex; justify-content: space-between; align-items: center;
          padding-bottom: 12px; margin-bottom: 12px; border-bottom: 1px solid #F3F4F6;
          gap: 8px; flex-wrap: wrap;
        }
        .sp-view-row:last-of-type { border-bottom: none; margin-bottom: 20px; }
        .sp-view-label { font-size: 12.5px; font-weight: 700; color: #6B7280; }
        .sp-view-value { font-size: 13.5px; color: var(--text); font-weight: 600; word-break: break-word; text-align: right; }
      `}</style>

      <div className="sp-wrap">
        <h1 className="sp-title">Shop Profile</h1>
        <p className="sp-subtitle">This information appears on receipts and customer notifications</p>

        <div className="sp-card">
          <div className="sp-logo-wrap">
            {profile.logoUrl ? (
              <img src={profile.logoUrl} alt="Shop logo" className="sp-logo" />
            ) : (
              <div className="sp-logo-fallback">
                {(profile.shopName || "S").charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {isEditing ? (
            <div>
              <div className="sp-field">
                <label className="sp-label">Shop Name</label>
                <input
                  placeholder="Shop Name"
                  value={profile.shopName}
                  onChange={(e) => setProfile({ ...profile, shopName: e.target.value })}
                  className="sp-input"
                />
              </div>

              <div className="sp-field">
                <label className="sp-label">Owner Name</label>
                <input
                  placeholder="Owner Name"
                  value={profile.ownerName}
                  onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })}
                  className="sp-input"
                />
              </div>

              <div className="sp-field">
                <label className="sp-label">Phone</label>
                <input
                  placeholder="Phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="sp-input"
                />
              </div>

              <div className="sp-field">
                <label className="sp-label">Address</label>
                <input
                  placeholder="Address"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="sp-input"
                />
              </div>

              <div className="sp-field">
                <label className="sp-label">Shop Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files[0])}
                  style={{ fontSize: "12.5px" }}
                />
              </div>

              <div className="sp-btn-row">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="sp-btn"
                  style={{ background: "#2563EB", opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer" }}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button onClick={() => setIsEditing(false)} className="sp-btn outline">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              {[
                ["Shop Name", profile.shopName],
                ["Owner Name", profile.ownerName],
                ["Phone", profile.phone],
                ["Address", profile.address],
              ].map(([label, value]) => (
                <div key={label} className="sp-view-row">
                  <span className="sp-view-label">{label}</span>
                  <span className="sp-view-value">{value || "—"}</span>
                </div>
              ))}

              <button onClick={() => setIsEditing(true)} className="sp-btn" style={{ background: "#111827", width: "100%" }}>
                Edit Shop Profile
              </button>
            </div>
          )}
        </div>
      </div>
          <BottomNavigation />
    </div>
  );
}

export default ShopProfile;