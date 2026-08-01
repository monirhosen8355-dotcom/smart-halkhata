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

  if (!user) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: "30px" }}>
      <h1>Shop Profile</h1>

      {profile.logoUrl && (
        <img
          src={profile.logoUrl}
          alt="Shop logo"
          style={{
            width: "90px",
            height: "90px",
            borderRadius: "12px",
            objectFit: "cover",
            marginBottom: "15px",
          }}
        />
      )}

      {isEditing ? (
        <div>
          <input
            placeholder="Shop Name"
            value={profile.shopName}
            onChange={(e) =>
              setProfile({ ...profile, shopName: e.target.value })
            }
          />
          <br />
          <br />

          <input
            placeholder="Owner Name"
            value={profile.ownerName}
            onChange={(e) =>
              setProfile({ ...profile, ownerName: e.target.value })
            }
          />
          <br />
          <br />

          <input
            placeholder="Phone"
            value={profile.phone}
            onChange={(e) =>
              setProfile({ ...profile, phone: e.target.value })
            }
          />
          <br />
          <br />

          <input
            placeholder="Address"
            value={profile.address}
            onChange={(e) =>
              setProfile({ ...profile, address: e.target.value })
            }
          />
          <br />
          <br />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files[0])}
          />
          <br />
          <br />

          <button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>{" "}
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div>
          <p><strong>Shop Name:</strong> {profile.shopName || "—"}</p>
          <p><strong>Owner Name:</strong> {profile.ownerName || "—"}</p>
          <p><strong>Phone:</strong> {profile.phone || "—"}</p>
          <p><strong>Address:</strong> {profile.address || "—"}</p>

          <button onClick={() => setIsEditing(true)}>Edit</button>
        </div>
      )}
    </div>
  );
}

export default ShopProfile;