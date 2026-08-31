import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "../firebase";
import BottomNavigation from "../components/BottomNavigation";

function ChangePassword() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // { type: "success" | "error", message }
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdatePassword = async () => {
    const newErrors = {};
    if (!currentPassword) newErrors.currentPassword = "Current password is required";
    if (!newPassword) newErrors.newPassword = "New password is required";
    else if (newPassword.length < 6) newErrors.newPassword = "New password must be at least 6 characters";
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your new password";
    else if (newPassword !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setStatus(null);
      return;
    }

    setErrors({});
    setStatus(null);
    setIsSubmitting(true);

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setStatus({ type: "success", message: "Password updated successfully." });
    } catch (error) {
      let message = error.message;
      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        message = "Current password is incorrect.";
      } else if (error.code === "auth/too-many-requests") {
        message = "Too many attempts. Try again later.";
      }
      setStatus({ type: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = (hasError) => ({
    padding: "12px 14px",
    borderRadius: "10px",
    border: `1px solid ${hasError ? "#FCA5A5" : "#E5E7EB"}`,
    fontSize: "14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  });

  const errorText = { fontSize: "12px", color: "#DC2626", marginTop: "4px" };
  const labelStyle = { fontSize: "12px", fontWeight: 700, color: "#6B7280", marginBottom: "5px", display: "block" };

  const eyeToggle = {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    fontSize: "12px",
    color: "#6B7280",
    fontWeight: 700,
    background: "none",
    border: "none",
  };

  if (!user) return <h2 style={{ padding: "30px", fontFamily: "system-ui" }}>Loading...</h2>;

  return (
    <div className="cp-root">
      <style>{`
        * { box-sizing: border-box; }
        .cp-root {
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
          background: #F3F4F6;
          font-family: system-ui, -apple-system, sans-serif;
          padding: 16px 12px 110px;
        }
        @media (min-width: 640px) { .cp-root { padding: 24px 20px 40px; } }

        .cp-wrap { max-width: 480px; margin: 0 auto; }

        .cp-back {
          background: none; border: none; color: #2563EB;
          font-size: 13px; font-weight: 700; cursor: pointer;
          padding: 0; margin-bottom: 14px;
        }

        .cp-title { margin: 0; font-size: 22px; color: #111827; }
        @media (min-width: 640px) { .cp-title { font-size: 26px; } }
        .cp-subtitle { margin: 4px 0 20px; color: #6B7280; font-size: 12.5px; }

        .cp-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
          padding: 20px 18px;
        }
        @media (min-width: 640px) { .cp-card { padding: 28px; } }

        .cp-field { margin-bottom: 16px; }

        .cp-btn {
          width: 100%; padding: 14px; border-radius: 10px; border: none;
          background: #2563EB; color: #fff; font-weight: 700; font-size: 14.5px;
          cursor: pointer; box-shadow: 0 4px 12px rgba(37,99,235,0.25);
        }
      `}</style>

      <div className="cp-wrap">
        <button className="cp-back" onClick={() => navigate("/settings")}>← Back to Settings</button>

        <h1 className="cp-title">Change Password</h1>
        <p className="cp-subtitle">Update the password for your Smart Halkhata account</p>

        <div className="cp-card">
          {status && (
            <div
              style={{
                background: status.type === "success" ? "#F0FDF4" : "#FEF2F2",
                color: status.type === "success" ? "#16A34A" : "#DC2626",
                fontSize: "12.5px",
                padding: "10px 12px",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            >
              {status.message}
            </div>
          )}

          <div className="cp-field">
            <label style={labelStyle}>Current Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{ ...inputStyle(errors.currentPassword), paddingRight: "50px" }}
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} style={eyeToggle}>
                {showCurrent ? "Hide" : "Show"}
              </button>
            </div>
            {errors.currentPassword && <div style={errorText}>{errors.currentPassword}</div>}
          </div>

          <div className="cp-field">
            <label style={labelStyle}>New Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ ...inputStyle(errors.newPassword), paddingRight: "50px" }}
              />
              <button type="button" onClick={() => setShowNew(!showNew)} style={eyeToggle}>
                {showNew ? "Hide" : "Show"}
              </button>
            </div>
            {errors.newPassword && <div style={errorText}>{errors.newPassword}</div>}
          </div>

          <div className="cp-field">
            <label style={labelStyle}>Confirm New Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ ...inputStyle(errors.confirmPassword), paddingRight: "50px" }}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={eyeToggle}>
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
            {errors.confirmPassword && <div style={errorText}>{errors.confirmPassword}</div>}
          </div>

          <button onClick={handleUpdatePassword} disabled={isSubmitting} className="cp-btn" style={{ opacity: isSubmitting ? 0.6 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }}>
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}

export default ChangePassword;