import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { db, storage } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

  const cardBase = {
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
  };

  const inputStyle = {
    padding: "11px 14px",
    borderRadius: "10px",
    border: "1px solid #E5E7EB",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  const labelStyle = {
    fontSize: "12.5px",
    fontWeight: 700,
    color: "#6B7280",
    marginBottom: "6px",
    display: "block",
  };

  const primaryBtn = (bg, color = "#fff") => ({
    padding: "11px 24px",
    borderRadius: "10px",
    border: "none",
    background: bg,
    color,
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
  });

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
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ margin: 0, fontSize: "24px", color: "#111827" }}>
            Shop Profile
          </h1>
          <p style={{ margin: "6px 0 0", color: "#6B7280", fontSize: "14px" }}>
            This information appears on receipts and customer notifications
          </p>
        </div>

        <div style={{ ...cardBase, padding: "32px" }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            {profile.logoUrl ? (
              <img
                src={profile.logoUrl}
                alt="Shop logo"
                style={{
                  width: "110px",
                  height: "110px",
                  borderRadius: "20px",
                  objectFit: "cover",
                  border: "1px solid #E5E7EB",
                }}
              />
            ) : (
              <div
                style={{
                  width: "110px",
                  height: "110px",
                  borderRadius: "20px",
                  background: "#EFF6FF",
                  color: "#2563EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "34px",
                  fontWeight: 700,
                  margin: "0 auto",
                }}
              >
                {(profile.shopName || "S").charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {isEditing ? (
            <div>
              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>Shop Name</label>
                <input
                  placeholder="Shop Name"
                  value={profile.shopName}
                  onChange={(e) => setProfile({ ...profile, shopName: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>Owner Name</label>
                <input
                  placeholder="Owner Name"
                  value={profile.ownerName}
                  onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>Phone</label>
                <input
                  placeholder="Phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>Address</label>
                <input
                  placeholder="Address"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Shop Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files[0])}
                  style={{ fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    ...primaryBtn("#2563EB"),
                    flex: 1,
                    opacity: saving ? 0.6 : 1,
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  style={{ ...primaryBtn("#F3F4F6", "#374151"), flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                {[
                  ["Shop Name", profile.shopName],
                  ["Owner Name", profile.ownerName],
                  ["Phone", profile.phone],
                  ["Address", profile.address],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingBottom: "12px",
                      borderBottom: "1px solid #F3F4F6",
                      flexWrap: "wrap",
                      gap: "4px",
                    }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#6B7280" }}>
                      {label}
                    </span>
                    <span style={{ fontSize: "14.5px", color: "#111827", fontWeight: 600 }}>
                      {value || "—"}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setIsEditing(true)}
                style={{ ...primaryBtn("#111827"), width: "100%" }}
              >
                Edit Shop Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShopProfile;