import { useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import BottomNavigation from "../components/BottomNavigation";

import avatar1 from "../assets/avatars/avatar1.png";
import avatar2 from "../assets/avatars/avatar2.png";
import avatar3 from "../assets/avatars/avatar3.png";
import avatar4 from "../assets/avatars/avatar4.png";
import avatar5 from "../assets/avatars/avatar5.png";
import avatar6 from "../assets/avatars/avatar6.png";
import avatar7 from "../assets/avatars/avatar7.png";
import avatar8 from "../assets/avatars/avatar8.png";
import avatar9 from "../assets/avatars/avatar9.png";
import avatar10 from "../assets/avatars/avatar10.png";

function ShopProfile() {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const [profile, setProfile] = useState({
    shopName: "",
    ownerName: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    area: "",
    district: "",
    businessCategory: "",
    description: "",
    bkash: "",
    nagad: "",
    bankAccount: "",
    note: "",
    logoUrl: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAvatars, setShowAvatars] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("");

  const avatars = [
    avatar1,
    avatar2,
    avatar3,
    avatar4,
    avatar5,
    avatar6,
    avatar7,
    avatar8,
    avatar9,
    avatar10,
  ];

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get("avatar") === "1") {
      setIsEditing(true);
      setShowAvatars(true);
    }
  }, [location]);

  const loadProfile = async () => {
    try {
      const shopRef = doc(db, "shops", user.uid);
      const snap = await getDoc(shopRef);

      if (snap.exists()) {
        const data = snap.data();

        const loaded = {
          shopName: data.shopName || "",
          ownerName: data.ownerName || "",
          phone: data.phone || "",
          whatsapp: data.whatsapp || "",
          email: data.email || "",
          address: data.address || "",
          area: data.area || "",
          district: data.district || "",
          businessCategory: data.businessCategory || "",
          description: data.description || "",
          bkash: data.bkash || "",
          nagad: data.nagad || "",
          bankAccount: data.bankAccount || "",
          note: data.note || "",
          logoUrl: data.logoUrl || "",
        };

        setProfile(loaded);
        setSelectedAvatar(loaded.logoUrl || "");
      }
    } catch (error) {
      console.error("Profile loading failed:", error);
    }
  };

  const handleChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const shopRef = doc(db, "shops", user.uid);

      await setDoc(
        shopRef,
        {
          shopName: profile.shopName,
          ownerName: profile.ownerName,
          phone: profile.phone,
          whatsapp: profile.whatsapp,
          email: profile.email,
          address: profile.address,
          area: profile.area,
          district: profile.district,
          businessCategory: profile.businessCategory,
          description: profile.description,
          bkash: profile.bkash,
          nagad: profile.nagad,
          bankAccount: profile.bankAccount,
          note: profile.note,
          logoUrl: profile.logoUrl,
        },
        { merge: true }
      );

      setIsEditing(false);
      alert("Profile saved successfully");
    } catch (error) {
      console.error(error);
      alert("Save failed: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const getInitial = () => {
    return (
      profile.shopName ||
      profile.ownerName ||
      "S"
    )
      .charAt(0)
      .toUpperCase();
  };

  const displayValue = (value) => {
    return value || "Not provided";
  };

  if (!user) {
    return (
      <h2 style={{ padding: "30px", fontFamily: "system-ui" }}>
        Loading...
      </h2>
    );
  }

  return (
    <div className="sp-root">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .sp-root {
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
          background: var(--bg);
          color: var(--text);
          font-family: system-ui, -apple-system, sans-serif;
          padding: 16px 12px 120px;
        }

        .sp-wrap {
          max-width: 700px;
          margin: 0 auto;
        }

        .sp-title {
          margin: 0;
          font-size: 23px;
          font-weight: 800;
        }

        .sp-subtitle {
          margin: 5px 0 20px;
          font-size: 13px;
          opacity: .6;
        }

        .sp-card {
          background: var(--card);
          border: 1px solid #E5E7EB;
          border-radius: 20px;
          padding: 20px 16px;
          box-shadow: 0 5px 18px rgba(0,0,0,.05);
        }

        @media (min-width: 640px) {
          .sp-card {
            padding: 30px;
          }
        }

        .sp-logo-wrap {
          position: relative;
          text-align: center;
          margin-bottom: 28px;
        }

        .sp-logo,
        .sp-logo-fallback {
          width: 100px;
          height: 100px;
          border-radius: 22px;
        }

        .sp-logo {
          object-fit: cover;
          border: 1px solid #E5E7EB;
        }

        .sp-logo-fallback {
          background: #EFF6FF;
          color: #2563EB;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: auto;
          font-size: 36px;
          font-weight: 800;
        }

        .sp-edit-avatar {
          position: absolute;
          right: calc(50% - 58px);
          bottom: -5px;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 50%;
          background: #22C55E;
          color: white;
          cursor: pointer;
          font-size: 15px;
          box-shadow: 0 4px 10px rgba(0,0,0,.25);
        }

        .sp-section {
          border-top: 1px solid #E5E7EB;
          padding-top: 22px;
          margin-top: 24px;
        }

        .sp-section:first-of-type {
          border-top: none;
          padding-top: 0;
          margin-top: 0;
        }

        .sp-section-title {
          margin: 0 0 15px;
          font-size: 15px;
          font-weight: 800;
        }

        .sp-section-desc {
          margin: -8px 0 15px;
          font-size: 11.5px;
          opacity: .55;
        }

        .sp-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0 14px;
        }

        @media (min-width: 600px) {
          .sp-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .sp-field {
          margin-bottom: 15px;
        }

        .sp-label {
          display: block;
          margin-bottom: 6px;
          font-size: 11.5px;
          font-weight: 700;
          color: #6B7280;
        }

        .sp-optional {
          margin-left: 5px;
          font-size: 9.5px;
          font-weight: 500;
          opacity: .7;
        }

        .sp-input,
        .sp-textarea {
          width: 100%;
          padding: 12px 13px;
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          outline: none;
          background: var(--card);
          color: var(--text);
          font-family: inherit;
          font-size: 13.5px;
        }

        .sp-input:focus,
        .sp-textarea:focus {
          border-color: #2563EB;
          box-shadow: 0 0 0 3px rgba(37,99,235,.08);
        }

        .sp-textarea {
          min-height: 90px;
          resize: vertical;
        }

        .sp-buttons {
          display: flex;
          gap: 10px;
          margin-top: 8px;
        }

        .sp-btn {
          flex: 1;
          padding: 13px;
          border: none;
          border-radius: 11px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
        }

        .sp-save {
          background: #2563EB;
          color: white;
        }

        .sp-cancel {
          background: #F3F4F6;
          color: #374151;
        }

        .sp-view-section {
          margin-top: 5px;
        }

        .sp-view-group {
          margin-bottom: 24px;
        }

        .sp-view-title {
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 800;
        }

        .sp-view-row {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 12px 0;
          border-bottom: 1px solid #F3F4F6;
        }

        .sp-view-label {
          min-width: 110px;
          color: #6B7280;
          font-size: 12px;
          font-weight: 700;
        }

        .sp-view-value {
          flex: 1;
          text-align: right;
          word-break: break-word;
          font-size: 13px;
          font-weight: 600;
        }

        .sp-not-provided {
          opacity: .4;
        }

        .sp-description {
          padding: 13px;
          border-radius: 11px;
          background: var(--bg);
          font-size: 13px;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .sp-edit-btn {
          width: 100%;
          margin-top: 4px;
          padding: 14px;
          border: none;
          border-radius: 11px;
          background: #111827;
          color: white;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
        }

        .sp-avatar-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: flex-end;
          background: rgba(0,0,0,.45);
        }

        .sp-avatar-panel {
          width: 100%;
          max-height: 70vh;
          overflow-y: auto;
          padding: 20px;
          background: white;
          border-radius: 24px 24px 0 0;
        }

        .sp-avatar-title {
          margin: 0 0 18px;
          text-align: center;
          color: #111827;
          font-size: 17px;
          font-weight: 800;
        }

        .sp-avatar-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          max-width: 500px;
          margin: auto;
        }

        .sp-avatar {
          width: 75px;
          height: 75px;
          margin: auto;
          border-radius: 50%;
          object-fit: cover;
          cursor: pointer;
        }
      `}</style>

      <div className="sp-wrap">
        <h1 className="sp-title">Profile</h1>

        <p className="sp-subtitle">
          আপনার ব্যক্তিগত বা ব্যবসায়িক তথ্য এখানে সংরক্ষণ করুন
        </p>

        <div className="sp-card">

          {/* PROFILE IMAGE */}
          <div className="sp-logo-wrap">
            {isEditing && (
              <button
                type="button"
                className="sp-edit-avatar"
                onClick={() => setShowAvatars(true)}
              >
                ✏️
              </button>
            )}

            {profile.logoUrl ? (
              <img
                src={profile.logoUrl}
                alt="Profile"
                className="sp-logo"
              />
            ) : (
              <div className="sp-logo-fallback">
                {getInitial()}
              </div>
            )}
          </div>

          {/* AVATAR SELECTOR */}
          {showAvatars && (
            <div
              className="sp-avatar-overlay"
              onClick={() => setShowAvatars(false)}
            >
              <div
                className="sp-avatar-panel"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="sp-avatar-title">
                  Choose Profile Picture
                </h3>

                <div className="sp-avatar-grid">
                  {avatars.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Avatar ${index + 1}`}
                      className="sp-avatar"
                      onClick={() => {
                        setSelectedAvatar(img);
                        setProfile((prev) => ({
                          ...prev,
                          logoUrl: img,
                        }));
                        setShowAvatars(false);
                      }}
                      style={{
                        border:
                          selectedAvatar === img
                            ? "3px solid #2563EB"
                            : "2px solid #E5E7EB",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {isEditing ? (
            <>

              {/* BASIC INFORMATION */}
              <div className="sp-section">
                <h3 className="sp-section-title">
                  👤 Basic Information
                </h3>

                <p className="sp-section-desc">
                  আপনার নাম ও ব্যবসার পরিচয়
                </p>

                <div className="sp-grid">
                  <div className="sp-field">
                    <label className="sp-label">
                      Shop / Business Name
                      <span className="sp-optional">Optional</span>
                    </label>

                    <input
                      className="sp-input"
                      placeholder="যেমন: Rahman Store"
                      value={profile.shopName}
                      onChange={(e) =>
                        handleChange("shopName", e.target.value)
                      }
                    />
                  </div>

                  <div className="sp-field">
                    <label className="sp-label">
                      Owner Name
                      <span className="sp-optional">Optional</span>
                    </label>

                    <input
                      className="sp-input"
                      placeholder="আপনার নাম"
                      value={profile.ownerName}
                      onChange={(e) =>
                        handleChange("ownerName", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* CONTACT */}
              <div className="sp-section">
                <h3 className="sp-section-title">
                  📞 Contact Information
                </h3>

                <p className="sp-section-desc">
                  যোগাযোগের তথ্য
                </p>

                <div className="sp-grid">
                  <div className="sp-field">
                    <label className="sp-label">
                      Phone Number
                      <span className="sp-optional">Optional</span>
                    </label>

                    <input
                      type="tel"
                      className="sp-input"
                      placeholder="01XXXXXXXXX"
                      value={profile.phone}
                      onChange={(e) =>
                        handleChange("phone", e.target.value)
                      }
                    />
                  </div>

                  <div className="sp-field">
                    <label className="sp-label">
                      WhatsApp Number
                      <span className="sp-optional">Optional</span>
                    </label>

                    <input
                      type="tel"
                      className="sp-input"
                      placeholder="01XXXXXXXXX"
                      value={profile.whatsapp}
                      onChange={(e) =>
                        handleChange("whatsapp", e.target.value)
                      }
                    />
                  </div>

                  <div className="sp-field">
                    <label className="sp-label">
                      Email Address
                      <span className="sp-optional">Optional</span>
                    </label>

                    <input
                      type="email"
                      className="sp-input"
                      placeholder="example@email.com"
                      value={profile.email}
                      onChange={(e) =>
                        handleChange("email", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* ADDRESS */}
              <div className="sp-section">
                <h3 className="sp-section-title">
                  📍 Address
                </h3>

                <p className="sp-section-desc">
                  আপনার অবস্থান বা ব্যবসার ঠিকানা
                </p>

                <div className="sp-grid">
                  <div className="sp-field">
                    <label className="sp-label">
                      Full Address
                      <span className="sp-optional">Optional</span>
                    </label>

                    <input
                      className="sp-input"
                      placeholder="বাড়ি / রোড / বাজার"
                      value={profile.address}
                      onChange={(e) =>
                        handleChange("address", e.target.value)
                      }
                    />
                  </div>

                  <div className="sp-field">
                    <label className="sp-label">
                      Area / Village
                      <span className="sp-optional">Optional</span>
                    </label>

                    <input
                      className="sp-input"
                      placeholder="এলাকা / গ্রাম"
                      value={profile.area}
                      onChange={(e) =>
                        handleChange("area", e.target.value)
                      }
                    />
                  </div>

                  <div className="sp-field">
                    <label className="sp-label">
                      District
                      <span className="sp-optional">Optional</span>
                    </label>

                    <input
                      className="sp-input"
                      placeholder="জেলা"
                      value={profile.district}
                      onChange={(e) =>
                        handleChange("district", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* BUSINESS */}
              <div className="sp-section">
                <h3 className="sp-section-title">
                  🏪 Business Information
                </h3>

                <p className="sp-section-desc">
                  ব্যবসার ধরন ও সংক্ষিপ্ত পরিচয়
                </p>

                <div className="sp-field">
                  <label className="sp-label">
                    Business Category
                    <span className="sp-optional">Optional</span>
                  </label>

                  <input
                    className="sp-input"
                    placeholder="যেমন: Grocery, Clothing, Electronics"
                    value={profile.businessCategory}
                    onChange={(e) =>
                      handleChange(
                        "businessCategory",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="sp-field">
                  <label className="sp-label">
                    Business Description
                    <span className="sp-optional">Optional</span>
                  </label>

                  <textarea
                    className="sp-textarea"
                    placeholder="আপনার ব্যবসা সম্পর্কে সংক্ষেপে লিখুন..."
                    value={profile.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* PAYMENT */}
              <div className="sp-section">
                <h3 className="sp-section-title">
                  💳 Payment Information
                </h3>

                <p className="sp-section-desc">
                  কাস্টমারের কাছ থেকে পেমেন্ট নেওয়ার তথ্য
                </p>

                <div className="sp-grid">
                  <div className="sp-field">
                    <label className="sp-label">
                      bKash Number
                      <span className="sp-optional">Optional</span>
                    </label>

                    <input
                      type="tel"
                      className="sp-input"
                      placeholder="bKash নম্বর"
                      value={profile.bkash}
                      onChange={(e) =>
                        handleChange("bkash", e.target.value)
                      }
                    />
                  </div>

                  <div className="sp-field">
                    <label className="sp-label">
                      Nagad Number
                      <span className="sp-optional">Optional</span>
                    </label>

                    <input
                      type="tel"
                      className="sp-input"
                      placeholder="Nagad নম্বর"
                      value={profile.nagad}
                      onChange={(e) =>
                        handleChange("nagad", e.target.value)
                      }
                    />
                  </div>

                  <div className="sp-field">
                    <label className="sp-label">
                      Bank / Account
                      <span className="sp-optional">Optional</span>
                    </label>

                    <input
                      className="sp-input"
                      placeholder="Bank / Account information"
                      value={profile.bankAccount}
                      onChange={(e) =>
                        handleChange(
                          "bankAccount",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* NOTE */}
              <div className="sp-section">
                <h3 className="sp-section-title">
                  📝 Additional Note
                </h3>

                <p className="sp-section-desc">
                  প্রয়োজনীয় অতিরিক্ত কোনো তথ্য
                </p>

                <textarea
                  className="sp-textarea"
                  placeholder="যেমন: ব্যবসার সময়, বিশেষ নির্দেশনা ইত্যাদি..."
                  value={profile.note}
                  onChange={(e) =>
                    handleChange("note", e.target.value)
                  }
                />
              </div>

              {/* SAVE */}
              <div className="sp-buttons">
                <button
                  type="button"
                  className="sp-btn sp-save"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Profile"}
                </button>

                <button
                  type="button"
                  className="sp-btn sp-cancel"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (

            /* VIEW MODE */
            <div className="sp-view-section">

              <div className="sp-view-group">
                <div className="sp-view-title">
                  👤 Basic Information
                </div>

                {[
                  ["Shop / Business Name", profile.shopName],
                  ["Owner Name", profile.ownerName],
                  ["Phone", profile.phone],
                  ["WhatsApp", profile.whatsapp],
                  ["Email", profile.email],
                ].map(([label, value]) => (
                  <div className="sp-view-row" key={label}>
                    <span className="sp-view-label">{label}</span>
                    <span
                      className={
                        value
                          ? "sp-view-value"
                          : "sp-view-value sp-not-provided"
                      }
                    >
                      {displayValue(value)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="sp-view-group">
                <div className="sp-view-title">
                  📍 Address
                </div>

                {[
                  ["Full Address", profile.address],
                  ["Area / Village", profile.area],
                  ["District", profile.district],
                ].map(([label, value]) => (
                  <div className="sp-view-row" key={label}>
                    <span className="sp-view-label">{label}</span>
                    <span
                      className={
                        value
                          ? "sp-view-value"
                          : "sp-view-value sp-not-provided"
                      }
                    >
                      {displayValue(value)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="sp-view-group">
                <div className="sp-view-title">
                  🏪 Business Information
                </div>

                <div className="sp-view-row">
                  <span className="sp-view-label">
                    Category
                  </span>

                  <span
                    className={
                      profile.businessCategory
                        ? "sp-view-value"
                        : "sp-view-value sp-not-provided"
                    }
                  >
                    {displayValue(profile.businessCategory)}
                  </span>
                </div>

                <div style={{ marginTop: "12px" }}>
                  <div
                    className="sp-view-label"
                    style={{ marginBottom: "8px" }}
                  >
                    Description
                  </div>

                  <div className="sp-description">
                    {profile.description || (
                      <span className="sp-not-provided">
                        Not provided
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="sp-view-group">
                <div className="sp-view-title">
                  💳 Payment Information
                </div>

                {[
                  ["bKash", profile.bkash],
                  ["Nagad", profile.nagad],
                  ["Bank / Account", profile.bankAccount],
                ].map(([label, value]) => (
                  <div className="sp-view-row" key={label}>
                    <span className="sp-view-label">{label}</span>
                    <span
                      className={
                        value
                          ? "sp-view-value"
                          : "sp-view-value sp-not-provided"
                      }
                    >
                      {displayValue(value)}
                    </span>
                  </div>
                ))}
              </div>

              {profile.note && (
                <div className="sp-view-group">
                  <div className="sp-view-title">
                    📝 Additional Note
                  </div>

                  <div className="sp-description">
                    {profile.note}
                  </div>
                </div>
              )}

              <button
                type="button"
                className="sp-edit-btn"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
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