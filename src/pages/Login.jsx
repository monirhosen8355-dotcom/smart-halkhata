import { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

function Login() {
  const { register, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(
  localStorage.getItem("rememberMe") === "true"
);

  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetStatus, setResetStatus] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});

  // ---- one-time intro animation sequence: book opens, then the form rises ----
  const [bookOpen, setBookOpen] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
  const savedEmail = localStorage.getItem("rememberedEmail");

  if (savedEmail) {
    setEmail(savedEmail);
  }

  const t1 = setTimeout(() => setBookOpen(true), 260);
    const t2 = setTimeout(() => setFormVisible(true), 260 + 950);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^01[0-9]{9}$/;

  const switchMode = (nextMode) => {
    if (nextMode === mode) return;
    setErrors({});
    setResetStatus(null);
    setMode(nextMode);
  };

  const handleLogin = async () => {
    const newErrors = {};
    if (!emailRegex.test(email)) newErrors.email = "Enter a valid email address";
    if (!password) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    setErrors({});
    setIsSubmitting(true);
    try {
  await login(email, password);

  if (rememberMe) {
    localStorage.setItem("rememberMe", "true");
    localStorage.setItem("rememberedEmail", email);
  } else {
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("rememberedEmail");
  }

  navigate("/dashboard");
} catch (error) {
      setErrors({ form: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async () => {
    const newErrors = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!shopName.trim()) newErrors.shopName = "Shop name is required";
    if (!phoneRegex.test(phone)) newErrors.phone = "Enter a valid phone number (01XXXXXXXXX)";
    if (!emailRegex.test(signupEmail)) newErrors.signupEmail = "Enter a valid email address";
    if (!signupPassword || signupPassword.length < 6)
      newErrors.signupPassword = "Password must be at least 6 characters";
    if (signupPassword !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    setErrors({});
    setIsSubmitting(true);
    try {
      await register(signupEmail, signupPassword);
      switchMode("login");
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setResetStatus(null);
    const targetEmail = email.trim();

    if (!targetEmail) {
      setResetStatus({ type: "error", message: 'Enter your email above, then tap "Forgot password?" again.' });
      return;
    }
    if (!emailRegex.test(targetEmail)) {
      setResetStatus({ type: "error", message: "That email address doesn't look valid." });
      return;
    }

    setIsSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setResetStatus({ type: "success", message: `Reset email sent to ${targetEmail}.` });
    } catch (error) {
      setResetStatus({ type: "error", message: error.message });
    } finally {
      setIsSendingReset(false);
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

  const primaryBtn = {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "#2563EB",
    color: "#fff",
    fontWeight: 700,
    fontSize: "15px",
    cursor: isSubmitting ? "not-allowed" : "pointer",
    opacity: isSubmitting ? 0.6 : 1,
    boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
  };

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

  const pageTitle = mode === "login" ? "স্মার্ট হালখাতা" : "Welcome স্মার্ট হালখাতা";
  const pageSub = mode === "login" ? "লগইন করুন" : "রেজিস্টার করুন";

  return (
    <div className="halkhata-login-root">
      <style>{`
        * { box-sizing: border-box; }

        .halkhata-login-root {
          min-height: 100vh;
          min-height: 100dvh;
          width: 100%;
          overflow-x: hidden;
          font-family: system-ui, -apple-system, sans-serif;
          background: #F3F4F6;
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 900px) {
          .halkhata-login-root { flex-direction: row; }
        }

        /* ============ HERO ============ */
        .hl-hero {
          position: relative;
          background: linear-gradient(160deg, #0B1120 0%, #1E3A8A 100%);
          color: #fff;
          overflow: hidden;
          flex-shrink: 0;
          padding: 18px 20px 22px;
        }
        @media (min-width: 900px) {
          .hl-hero {
            width: 46%;
            min-height: 100vh;
            padding: 48px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
        }

        .hl-hero::before {
          content: "";
          position: absolute;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(37,99,235,0.35) 0%, rgba(37,99,235,0) 70%);
          top: -90px;
          right: -60px;
          pointer-events: none;
        }
        .hl-hero::after {
          content: "";
          position: absolute;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(147,197,253,0.18) 0%, rgba(147,197,253,0) 70%);
          bottom: -70px;
          left: -40px;
          pointer-events: none;
        }

        .hl-hero-top {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .hl-brand-row { display: flex; align-items: center; gap: 10px; }
        .hl-logo-mark {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(37,99,235,0.45);
          flex-shrink: 0;
        }
        @media (min-width: 900px) { .hl-logo-mark { width: 40px; height: 40px; font-size: 16px; border-radius: 11px; } }

        .hl-heading { font-size: 16px; font-weight: 800; line-height: 1.1; }
        @media (min-width: 900px) { .hl-heading { font-size: 21px; } }
        .hl-sub { font-size: 10px; color: #93C5FD; margin-top: 2px; }
        @media (min-width: 900px) { .hl-sub { font-size: 12.5px; margin-top: 3px; } }

        .hl-desc {
          position: relative;
          z-index: 1;
          display: none;
        }
        @media (min-width: 900px) {
          .hl-desc { display: block; font-size: 14px; color: #CBD5E1; margin-top: 20px; max-width: 340px; font-weight: 400; text-align: center; }
        }

        /* ============ ANIMATED BOOK (pure CSS, no images) ============ */
        .hl-book-scene {
          position: relative;
          z-index: 1;
          width: 190px;
          height: 132px;
          margin: 14px auto 4px;
          perspective: 1100px;
        }
        @media (min-width: 900px) {
          .hl-book-scene { width: 260px; height: 180px; margin: 26px auto 6px; }
        }

        .hl-book {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          animation: hlBookFloat 5s ease-in-out infinite;
        }
        @keyframes hlBookFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .hl-book-pages {
          position: absolute;
          inset: 0;
          border-radius: 6px;
          background:
            repeating-linear-gradient(to bottom, #F8FAFC 0px, #F8FAFC 2px, #E9EEF5 2px, #E9EEF5 3px);
          box-shadow: 0 16px 30px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .hl-book-pages::before {
          content: "";
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 8%;
          transform: translateX(-50%);
          background: linear-gradient(to right, rgba(0,0,0,0.10), transparent 50%, rgba(0,0,0,0.10));
        }

        .hl-book-page-text {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 0 14%;
        }
        .hl-book-page-title {
          color: #12224B;
          font-weight: 800;
          font-size: 13px;
          letter-spacing: 0.2px;
          animation: hlTextIn 480ms ease both;
        }
        .hl-book-page-sub {
          color: #2563EB;
          font-size: 10.5px;
          font-weight: 700;
          margin-top: 4px;
          animation: hlTextIn 480ms ease both 60ms;
        }
        @media (min-width: 900px) {
          .hl-book-page-title { font-size: 17px; }
          .hl-book-page-sub { font-size: 13px; margin-top: 6px; }
        }
        @keyframes hlTextIn {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hl-book-cover {
          position: absolute;
          inset: 0;
          border-radius: 6px;
          background: linear-gradient(135deg, #16255A 0%, #0B1638 100%);
          box-shadow: 0 18px 30px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.06);
          transform-origin: left center;
          transform-style: preserve-3d;
          transition: transform 950ms cubic-bezier(0.65, 0, 0.35, 1);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hl-book-scene.opened .hl-book-cover {
          transform: rotateY(-150deg);
        }

        .hl-book-cover-emblem {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .hl-book-cover-mark {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          border: 1.5px solid #D4AF37;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #D4AF37;
          font-weight: 800;
          font-size: 12px;
        }
        .hl-book-cover-name {
          color: #E5E7EB;
          font-size: 9px;
          letter-spacing: 1.2px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .hl-gold-corner {
          position: absolute;
          width: 16px;
          height: 16px;
          border: 1.5px solid #D4AF37;
          opacity: 0.85;
        }
        .hl-gold-corner.tl { top: 8px; left: 8px; border-right: none; border-bottom: none; }
        .hl-gold-corner.br { bottom: 8px; right: 8px; border-left: none; border-top: none; }

        /* ============ CARD AREA ============ */
        .hl-card-area {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 8px 16px 32px;
          width: 100%;
          position: relative;
        }
        @media (min-width: 900px) {
          .hl-card-area {
            width: 54%;
            align-items: center;
            padding: 40px 24px;
          }
        }

        .hl-flip-perspective {
          width: 100%;
          max-width: 400px;
          perspective: 1400px;
          margin-top: 0;
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .hl-flip-perspective.hl-mounted {
          opacity: 1;
          transform: translateY(0);
        }

        .hl-flip-card {
          position: relative;
          display: grid;
          transform-style: preserve-3d;
          transition: transform 700ms cubic-bezier(0.65, 0, 0.35, 1);
          will-change: transform;
        }
        .hl-flip-card.is-signup { transform: rotateY(-180deg); }

        .hl-face {
          grid-area: 1 / 1;
          background: #fff;
          border-radius: 20px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 12px 32px rgba(0,0,0,0.08);
          padding: 20px 18px;
          backface-visibility: hidden;
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 900px) { .hl-face { padding: 34px 30px; } }
        .hl-face-back { transform: rotateY(180deg); }

        .hl-face::before {
          content: "";
          position: absolute;
          top: -40px;
          right: -40px;
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(37,99,235,0.06) 0%, rgba(37,99,235,0) 70%);
          pointer-events: none;
        }

        /* ============ inputs / buttons micro-interactions ============ */
        .hl-input {
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .hl-input:focus {
          border-color: #2563EB !important;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
        }

        .hl-btn-primary {
          transition: transform 0.12s ease, box-shadow 0.15s ease, opacity 0.15s ease;
        }
        .hl-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(37,99,235,0.35);
        }
        .hl-btn-primary:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
        }

        .hl-link {
          transition: opacity 0.15s ease;
        }
        .hl-link:hover { opacity: 0.75; }

        .hl-eye-toggle {
          transition: color 0.15s ease;
        }
        .hl-eye-toggle:hover { color: #374151; }

        /* keep form usable when mobile keyboard opens */
        @media (max-height: 640px) and (max-width: 899px) {
          .hl-hero { padding-top: 12px; padding-bottom: 12px; }
          .hl-book-scene { width: 150px; height: 104px; margin: 8px auto 2px; }
        }
      `}</style>

      {/* HERO */}
      <div className="hl-hero">
        <div className="hl-hero-top">
          <div className="hl-brand-row">
            <div className="hl-logo-mark">SH</div>
            <div>
              <div className="hl-heading">Smart Halkhata</div>
              <div className="hl-sub">Shop Management Software</div>
            </div>
          </div>
        </div>

        <div className={`hl-book-scene ${bookOpen ? "opened" : ""}`}>
          <div className="hl-book">
            <div className="hl-book-pages">
              <div className="hl-book-page-text">
                <div className="hl-book-page-title" key={`t-${mode}`}>{pageTitle}</div>
                <div className="hl-book-page-sub" key={`s-${mode}`}>{pageSub}</div>
              </div>
            </div>
            <div className="hl-book-cover">
              <div className="hl-gold-corner tl" />
              <div className="hl-gold-corner br" />
              <div className="hl-book-cover-emblem">
                <div className="hl-book-cover-mark">SH</div>
                <div className="hl-book-cover-name">হালখাতা</div>
              </div>
            </div>
          </div>
        </div>

        <p className="hl-desc">
          Track customer dues, payments, and history — all in one secure, premium platform built for modern shops.
        </p>
      </div>

      {/* AUTH CARD */}
      <div className="hl-card-area">
        <div className={`hl-flip-perspective ${formVisible ? "hl-mounted" : ""}`}>
          <div className={`hl-flip-card ${mode === "signup" ? "is-signup" : ""}`}>

            {/* LOGIN FACE */}
            <div className="hl-face">
              <h2 style={{ margin: 0, fontSize: "20px", color: "#111827", position: "relative", zIndex: 1 }}>
                Welcome back
              </h2>
              <p style={{ margin: "6px 0 18px", fontSize: "13px", color: "#6B7280" }}>
                Sign in to your shop account to continue
              </p>

              {errors.form && (
                <div style={{ background: "#FEF2F2", color: "#DC2626", fontSize: "12.5px", padding: "10px 12px", borderRadius: "8px", marginBottom: "14px" }}>
                  {errors.form}
                </div>
              )}
              {resetStatus && (
                <div style={{ background: resetStatus.type === "success" ? "#F0FDF4" : "#FEF2F2", color: resetStatus.type === "success" ? "#16A34A" : "#DC2626", fontSize: "12.5px", padding: "10px 12px", borderRadius: "8px", marginBottom: "14px" }}>
                  {resetStatus.message}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    className="hl-input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle(errors.email)}
                  />
                  {errors.email && <div style={errorText}>{errors.email}</div>}
                </div>

                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="hl-input"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ ...inputStyle(errors.password), paddingRight: "50px" }}
                    />
                    <button type="button" className="hl-eye-toggle" onClick={() => setShowPassword(!showPassword)} style={eyeToggle}>
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.password && <div style={errorText}>{errors.password}</div>}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", flexWrap: "wrap", gap: "8px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "#374151" }}>
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                    Remember me
                  </label>
                  <span
                    className="hl-link"
                    onClick={isSendingReset ? undefined : handleForgotPassword}
                    style={{ color: "#2563EB", fontWeight: 600, cursor: isSendingReset ? "not-allowed" : "pointer", opacity: isSendingReset ? 0.6 : 1 }}
                  >
                    {isSendingReset ? "Sending..." : "Forgot password?"}
                  </span>
                </div>

                <button className="hl-btn-primary" onClick={handleLogin} disabled={isSubmitting} style={primaryBtn}>
                  {isSubmitting ? "Please wait..." : "Login"}
                </button>
              </div>

              <p style={{ fontSize: "12.5px", color: "#6B7280", textAlign: "center", marginTop: "18px" }}>
                Don't have an account?{" "}
                <span className="hl-link" onClick={() => switchMode("signup")} style={{ color: "#2563EB", fontWeight: 700, cursor: "pointer" }}>
                  Create Account
                </span>
              </p>
            </div>

            {/* SIGNUP FACE */}
            <div className="hl-face hl-face-back">
              <h2 style={{ margin: 0, fontSize: "20px", color: "#111827", position: "relative", zIndex: 1 }}>
                Create your account
              </h2>
              <p style={{ margin: "6px 0 14px", fontSize: "13px", color: "#6B7280" }}>
                Set up your shop in a few seconds
              </p>

              {errors.form && (
                <div style={{ background: "#FEF2F2", color: "#DC2626", fontSize: "12.5px", padding: "10px 12px", borderRadius: "8px", marginBottom: "14px" }}>
                  {errors.form}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>First Name</label>
                    <input className="hl-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle(errors.firstName)} />
                    {errors.firstName && <div style={errorText}>{errors.firstName}</div>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Last Name</label>
                    <input className="hl-input" value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle(errors.lastName)} />
                    {errors.lastName && <div style={errorText}>{errors.lastName}</div>}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Shop Name</label>
                  <input className="hl-input" value={shopName} onChange={(e) => setShopName(e.target.value)} style={inputStyle(errors.shopName)} />
                  {errors.shopName && <div style={errorText}>{errors.shopName}</div>}
                </div>

                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input className="hl-input" placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle(errors.phone)} />
                  {errors.phone && <div style={errorText}>{errors.phone}</div>}
                </div>

                <div>
                  <label style={labelStyle}>Email</label>
                  <input className="hl-input" type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} style={inputStyle(errors.signupEmail)} />
                  {errors.signupEmail && <div style={errorText}>{errors.signupEmail}</div>}
                </div>

                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="hl-input"
                      type={showSignupPassword ? "text" : "password"}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      style={{ ...inputStyle(errors.signupPassword), paddingRight: "50px" }}
                    />
                    <button type="button" className="hl-eye-toggle" onClick={() => setShowSignupPassword(!showSignupPassword)} style={eyeToggle}>
                      {showSignupPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.signupPassword && <div style={errorText}>{errors.signupPassword}</div>}
                </div>

                <div>
                  <label style={labelStyle}>Confirm Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="hl-input"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ ...inputStyle(errors.confirmPassword), paddingRight: "50px" }}
                    />
                    <button type="button" className="hl-eye-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={eyeToggle}>
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.confirmPassword && <div style={errorText}>{errors.confirmPassword}</div>}
                </div>

                <button className="hl-btn-primary" onClick={handleRegister} disabled={isSubmitting} style={primaryBtn}>
                  {isSubmitting ? "Please wait..." : "Create Account"}
                </button>
              </div>

              <p style={{ fontSize: "12.5px", color: "#6B7280", textAlign: "center", marginTop: "14px" }}>
                Already have an account?{" "}
                <span className="hl-link" onClick={() => switchMode("login")} style={{ color: "#2563EB", fontWeight: 700, cursor: "pointer" }}>
                  Login
                </span>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;