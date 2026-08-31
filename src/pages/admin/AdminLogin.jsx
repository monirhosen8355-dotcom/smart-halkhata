import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../firebase";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("ইমেইল এবং পাসওয়ার্ড দিন।");
      return;
    }

    setSubmitting(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);

      // forceRefresh: true — সদ্য বসানো admin claim যেন miss না হয়
      const tokenResult = await credential.user.getIdTokenResult(true);

      if (tokenResult.claims && tokenResult.claims.admin === true) {
        navigate("/admin");
      } else {
        setError("এই একাউন্টের Admin অনুমতি নেই।");
        await signOut(auth);
      }
    } catch (err) {
      console.error("Admin login failed:", err);
      setError(mapAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.iconCircle}>A</div>
        <h1 style={styles.title}>Admin Panel</h1>
        <p style={styles.subtitle}>Smart Halkhata — DPS Administration</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.fieldLabel}>ইমেইল</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              autoComplete="username"
              disabled={submitting}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.fieldLabel}>পাসওয়ার্ড</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              autoComplete="current-password"
              disabled={submitting}
            />
          </div>
          <button type="submit" style={styles.submitButton} disabled={submitting}>
            {submitting ? "যাচাই করা হচ্ছে..." : "Admin Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

function mapAuthError(err) {
  const code = err && err.code;
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
    return "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।";
  }
  if (code === "auth/too-many-requests") {
    return "অনেকবার ভুল চেষ্টা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।";
  }
  return "লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।";
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
    padding: "24px",
  },
  card: {
    background: "#fff",
    borderRadius: "18px",
    padding: "32px 24px",
    maxWidth: "380px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
  },
  iconCircle: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #0F172A, #334155)",
    color: "#fff",
    fontSize: "22px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 14px",
  },
  title: { fontSize: "20px", fontWeight: 700, color: "#0F172A", margin: "0 0 2px" },
  subtitle: { fontSize: "12px", color: "#64748B", margin: "0 0 20px" },
  errorBox: {
    background: "#FEF2F2",
    color: "#DC2626",
    padding: "10px 12px",
    borderRadius: "10px",
    fontSize: "12px",
    marginBottom: "14px",
    textAlign: "left",
  },
  field: { marginBottom: "14px", textAlign: "left" },
  fieldLabel: { display: "block", fontSize: "12px", color: "#475569", marginBottom: "4px", fontWeight: 600 },
  input: {
    width: "100%",
    padding: "11px 12px",
    borderRadius: "10px",
    border: "1px solid #CBD5E1",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  submitButton: {
    width: "100%",
    padding: "13px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #0F172A, #334155)",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "6px",
  },
};