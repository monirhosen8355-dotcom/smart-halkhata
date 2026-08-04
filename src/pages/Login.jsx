import { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

function Login() {
  const { register, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [isBursting, setIsBursting] = useState(false);
  const burstTimer = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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

  useEffect(() => {
    return () => clearTimeout(burstTimer.current);
  }, []);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^01[0-9]{9}$/;

  const switchMode = (nextMode) => {
    if (nextMode === mode) return;
    setErrors({});
    setResetStatus(null);
    setMode(nextMode);
    setIsBursting(true);
    clearTimeout(burstTimer.current);
    burstTimer.current = setTimeout(() => setIsBursting(false), 750);
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
    boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
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

  return (
    <div className="halkhata-login-root">
      <style>{`
        * { box-sizing: border-box; }
        .halkhata-login-root {
          min-height: 100vh;
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
          height: 30vh;
          min-height: 210px;
          max-height: 280px;
          padding: 18px 20px;
        }
        @media (min-width: 900px) {
          .hl-hero {
            width: 46%;
            height: auto;
            min-height: 100vh;
            max-height: none;
            padding: 48px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
        }

        .hl-heading { font-size: 17px; font-weight: 800; }
        @media (min-width: 900px) { .hl-heading { font-size: 22px; } }
        .hl-sub { font-size: 10.5px; color: #93C5FD; margin-top: 2px; }
        @media (min-width: 900px) { .hl-sub { font-size: 13px; margin-top: 4px; } }

        .hl-tagline {
          font-size: 13px; font-weight: 700; line-height: 1.35;
          max-width: 180px; position: relative; z-index: 2;
        }
        @media (min-width: 900px) { .hl-tagline { font-size: 26px; max-width: 360px; } }
        .hl-desc { display: none; }
        @media (min-width: 900px) {
          .hl-desc { display: block; font-size: 14px; color: #CBD5E1; margin-top: 14px; max-width: 340px; }
        }

        /* ============ LEDGER BOOK (pure CSS) ============ */
        .hl-ledger-stage {
  position: absolute;
  right: 20px;
  bottom: 20px;
  width: 320px;
  display: flex;
  justify-content: center;
  align-items: center;
}

@media (max-width:900px){
  .hl-ledger-stage{
    width:220px;
    right:0;
    bottom:0;
  }
}
          position: absolute;
          right: 8px;
          bottom: -10px;
          width: clamp(180px, 46vw, 220px);
          height: clamp(180px, 46vw, 220px);
          perspective: 1000px;
        }
        @media (min-width: 900px) {
          .hl-ledger-stage {
            right: 20px;
            bottom: 40px;
            width: clamp(260px, 22vw, 320px);
            height: clamp(260px, 22vw, 320px);
          }
        }

        .hl-ledger {
          position: relative;
          width: 100%;
          height: 78%;
          top: 10%;
          transform: rotate(-20deg);
          transform-style: preserve-3d;
        }

        /* page block behind cover, giving thickness */
        .hl-ledger-pages {
          position: absolute;
          inset: 3% 0% 3% 6%;
          background: repeating-linear-gradient(
            to bottom,
            #F8FAFC 0px, #F8FAFC 2px,
            #E2E8F0 2px, #E2E8F0 3px
          );
          border-radius: 3px;
          box-shadow: 0 1px 0 #fff inset, 2px 2px 4px rgba(0,0,0,0.25);
        }

        /* navy cover */
        .hl-ledger-cover {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #12224B 0%, #0B1638 100%);
          border-radius: 6px;
          box-shadow:
            0 18px 30px rgba(0,0,0,0.45),
            inset 0 0 0 1px rgba(255,255,255,0.06);
        }
        /* spine highlight */
        .hl-ledger-cover::before {
          content: "";
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 14%;
          background: linear-gradient(to right, rgba(0,0,0,0.35), transparent);
        }
        /* gold corner accents */
        .hl-gold-corner {
          position: absolute;
          width: 22%;
          height: 22%;
          border: 2px solid #D4AF37;
          opacity: 0.85;
        }
        .hl-gold-corner.tl { top: 6%; left: 6%; border-right: none; border-bottom: none; border-radius: 3px 0 0 0; }
        .hl-gold-corner.br { bottom: 6%; right: 6%; border-left: none; border-top: none; border-radius: 0 0 3px 0; }

        /* gold title bar */
        .hl-ledger-title {
          position: absolute;
          top: 38%;
          left: 22%;
          right: 12%;
          height: 12%;
          border-top: 1.5px solid #D4AF37;
          border-bottom: 1.5px solid #D4AF37;
        }

        /* the flipping page on the right edge, opening/closing */
        .hl-flip-page {
          position: absolute;
          top: 4%;
          right: -2%;
          width: 46%;
          height: 92%;
          background: linear-gradient(120deg, #FFFFFF, #E8ECF3);
          border-radius: 0 4px 4px 0;
          transform-origin: left center;
          backface-visibility: hidden;
          box-shadow: 1px 0 6px rgba(0,0,0,0.25);
          animation: hlPageIdle 5s ease-in-out infinite;
        }
        .hl-flip-page.burst { animation: hlPageBurst 700ms cubic-bezier(0.65,0,0.35,1) 1; }

        @keyframes hlPageIdle {
          0%   { transform: rotateY(0deg); }
          20%  { transform: rotateY(-155deg); }
          55%  { transform: rotateY(-155deg); }
          75%  { transform: rotateY(0deg); }
          100% { transform: rotateY(0deg); }
        }
        @keyframes hlPageBurst {
          0%   { transform: rotateY(0deg); }
          50%  { transform: rotateY(-175deg); }
          100% { transform: rotateY(0deg); }
        }

        /* ============ CARD AREA ============ */
        .hl-card-area {
          flex: 1;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 20px 16px 32px;
          width: 100%;
        }
        @media (min-width: 900px) {
          .hl-card-area { align-items: center; padding: 40px 24px; width: 54%; }
        }

        .hl-flip-perspective {
          width: 100%;
          max-width: 400px;
          perspective: 1400px;
          margin-top: 4px;
        }
        @media (min-width: 900px) { .hl-flip-perspective { margin-top: 0; } }

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
          padding: 22px 18px;
          backface-visibility: hidden;
        }
        @media (min-width: 900px) { .hl-face { padding: 34px 30px; } }
        .hl-face-back { transform: rotateY(180deg); }
      `}</style>

      {/* HERO */}
      <div className="hl-hero">
        <div>
          <div className="hl-heading">Smart Halkhata</div>
          <div className="hl-sub">Shop Management Software</div>
        </div>

        <div className="hl-tagline">
          Run your shop's ledger like a bank runs its books.
          <p className="hl-desc">
            Track customer dues, payments, and history — all in one secure, premium platform built for modern shops.
          </p>
        </div>

        <div className="hl-ledger-stage">
  <img
    src="https://bonsure.co/load/img/ind2.png"
    alt="Smart Halkhata"
    style={{
      width: "100%",
      maxWidth: "320px",
      height: "auto",
      objectFit: "contain",
    }}
  />
</div>
      </div>

      {/* AUTH CARD */}
      <div className="hl-card-area">
        <div className="hl-flip-perspective">
          <div className={`hl-flip-card ${mode === "signup" ? "is-signup" : ""}`}>

            {/* LOGIN FACE */}
            <div className="hl-face">
              <h2 style={{ margin: 0, fontSize: "20px", color: "#111827" }}>Welcome back</h2>
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
                  <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle(errors.email)} />
                  {errors.email && <div style={errorText}>{errors.email}</div>}
                </div>

                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...inputStyle(errors.password), paddingRight: "50px" }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={eyeToggle}>
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
                  <span onClick={isSendingReset ? undefined : handleForgotPassword} style={{ color: "#2563EB", fontWeight: 600, cursor: isSendingReset ? "not-allowed" : "pointer", opacity: isSendingReset ? 0.6 : 1 }}>
                    {isSendingReset ? "Sending..." : "Forgot password?"}
                  </span>
                </div>

                <button onClick={handleLogin} disabled={isSubmitting} style={primaryBtn}>
                  {isSubmitting ? "Please wait..." : "Login"}
                </button>
              </div>

              <p style={{ fontSize: "12.5px", color: "#6B7280", textAlign: "center", marginTop: "18px" }}>
                Don't have an account?{" "}
                <span onClick={() => switchMode("signup")} style={{ color: "#2563EB", fontWeight: 700, cursor: "pointer" }}>
                  Create Account
                </span>
              </p>
            </div>

            {/* SIGNUP FACE */}
            <div className="hl-face hl-face-back">
              <h2 style={{ margin: 0, fontSize: "20px", color: "#111827" }}>Create your account</h2>
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
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle(errors.firstName)} />
                    {errors.firstName && <div style={errorText}>{errors.firstName}</div>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Last Name</label>
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle(errors.lastName)} />
                    {errors.lastName && <div style={errorText}>{errors.lastName}</div>}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Shop Name</label>
                  <input value={shopName} onChange={(e) => setShopName(e.target.value)} style={inputStyle(errors.shopName)} />
                  {errors.shopName && <div style={errorText}>{errors.shopName}</div>}
                </div>

                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle(errors.phone)} />
                  {errors.phone && <div style={errorText}>{errors.phone}</div>}
                </div>

                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} style={inputStyle(errors.signupEmail)} />
                  {errors.signupEmail && <div style={errorText}>{errors.signupEmail}</div>}
                </div>

                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input type={showSignupPassword ? "text" : "password"} value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} style={{ ...inputStyle(errors.signupPassword), paddingRight: "50px" }} />
                    <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)} style={eyeToggle}>
                      {showSignupPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.signupPassword && <div style={errorText}>{errors.signupPassword}</div>}
                </div>

                <div>
                  <label style={labelStyle}>Confirm Password</label>
                  <div style={{ position: "relative" }}>
                    <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ ...inputStyle(errors.confirmPassword), paddingRight: "50px" }} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={eyeToggle}>
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.confirmPassword && <div style={errorText}>{errors.confirmPassword}</div>}
                </div>

                <button onClick={handleRegister} disabled={isSubmitting} style={primaryBtn}>
                  {isSubmitting ? "Please wait..." : "Create Account"}
                </button>
              </div>

              <p style={{ fontSize: "12.5px", color: "#6B7280", textAlign: "center", marginTop: "14px" }}>
                Already have an account?{" "}
                <span onClick={() => switchMode("login")} style={{ color: "#2563EB", fontWeight: 700, cursor: "pointer" }}>
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