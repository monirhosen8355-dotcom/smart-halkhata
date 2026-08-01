import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

function Login() {
  const { register, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 780 : false
  );

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Forgot password
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetStatus, setResetStatus] = useState(null); // { type: 'success'|'error', message }

  // Signup fields
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
    const handleResize = () => setIsMobile(window.innerWidth < 780);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^01[0-9]{9}$/;

  const switchMode = (nextMode) => {
    if (nextMode === mode) return;
    setErrors({});
    setResetStatus(null);
    setMode(nextMode);
    if (!isMobile) setIsAnimating(true);
  };

  const handleLogin = async () => {
    const newErrors = {};
    if (!emailRegex.test(email)) newErrors.email = "Enter a valid email address";
    if (!password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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
    if (signupPassword !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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
      setResetStatus({
        type: "error",
        message: 'Enter your email address above, then click "Forgot password?" again.',
      });
      return;
    }

    if (!emailRegex.test(targetEmail)) {
      setResetStatus({ type: "error", message: "That email address doesn't look valid." });
      return;
    }

    setIsSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setResetStatus({
        type: "success",
        message: `Password reset email sent to ${targetEmail}. Check your inbox.`,
      });
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
    fontSize: "13.5px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  });

  const errorText = {
    fontSize: "12px",
    color: "#DC2626",
    marginTop: "4px",
  };

  const labelStyle = {
    fontSize: "12px",
    fontWeight: 700,
    color: "#6B7280",
    marginBottom: "5px",
    display: "block",
  };

  const primaryBtn = {
    width: "100%",
    padding: "13px",
    borderRadius: "10px",
    border: "none",
    background: "#2563EB",
    color: "#fff",
    fontWeight: 700,
    fontSize: "14.5px",
    cursor: isSubmitting ? "not-allowed" : "pointer",
    opacity: isSubmitting ? 0.6 : 1,
    boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
    transition: "opacity 0.2s ease",
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

  const brandingContent = (
    <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "0.3px" }}>
          Smart Halkhata
        </div>
        <div style={{ fontSize: "13px", color: "#93C5FD", marginTop: "4px" }}>
          Shop Management Software
        </div>
      </div>

      <div>
        <div style={{ fontSize: "26px", fontWeight: 700, lineHeight: 1.35, maxWidth: "360px" }}>
          Run your shop's credit ledger like a bank runs its ledger.
        </div>
        <p style={{ fontSize: "14px", color: "#CBD5E1", marginTop: "14px", maxWidth: "340px" }}>
          Track customer dues, payments, and history — all in one secure, premium platform built for modern shops.
        </p>
      </div>
    </div>
  );

  const brandClass = isAnimating
    ? mode === "signup" ? "brand-anim-to-signup" : "brand-anim-to-login"
    : mode === "signup" ? "brand-idle-signup" : "brand-idle-login";

  const authClass = isAnimating
    ? mode === "signup" ? "auth-anim-to-signup" : "auth-anim-to-login"
    : mode === "signup" ? "auth-idle-signup" : "auth-idle-login";

  const brandingPanelStyle = isMobile
    ? {
        width: "100%",
        minHeight: "220px",
        background: "linear-gradient(160deg, #111827 0%, #1E3A8A 100%)",
        color: "#fff",
        padding: "36px 28px",
        position: "relative",
        overflow: "hidden",
      }
    : {
        position: "absolute",
        top: 0,
        left: 0,
        width: "50%",
        height: "100%",
        background: "linear-gradient(160deg, #111827 0%, #1E3A8A 100%)",
        color: "#fff",
        padding: "48px",
        overflow: "hidden",
        boxSizing: "border-box",
      };

  const authPanelWrapperStyle = isMobile
    ? {
        width: "100%",
        padding: "32px 20px",
        boxSizing: "border-box",
      }
    : {
        position: "absolute",
        top: 0,
        left: "50%",
        width: "50%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        boxSizing: "border-box",
      };

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: "#F3F4F6",
        position: isMobile ? "static" : "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes floatShapeA {
          0%   { transform: translate(0px, 0px) scale(1); }
          50%  { transform: translate(20px, -24px) scale(1.06); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes floatShapeB {
          0%   { transform: translate(0px, 0px) rotate(20deg); }
          50%  { transform: translate(-16px, 18px) rotate(28deg); }
          100% { transform: translate(0px, 0px) rotate(20deg); }
        }
        @keyframes floatShapeC {
          0%   { transform: translate(0px, 0px); }
          50%  { transform: translate(14px, 14px); }
          100% { transform: translate(0px, 0px); }
        }
        .shape-a { animation: floatShapeA 7s ease-in-out infinite; }
        .shape-b { animation: floatShapeB 9s ease-in-out infinite; }
        .shape-c { animation: floatShapeC 6s ease-in-out infinite; }

        @keyframes brandToSignup {
          0%   { transform: translateX(0%) scale(1); }
          40%  { transform: translateX(0%) scale(0.9); }
          60%  { transform: translateX(100%) scale(0.9); }
          100% { transform: translateX(100%) scale(1); }
        }
        @keyframes brandToLogin {
          0%   { transform: translateX(100%) scale(1); }
          40%  { transform: translateX(100%) scale(0.9); }
          60%  { transform: translateX(0%) scale(0.9); }
          100% { transform: translateX(0%) scale(1); }
        }
        @keyframes authToSignup {
          0%   { transform: translateX(0%) scale(1); }
          40%  { transform: translateX(0%) scale(0.9); }
          60%  { transform: translateX(-100%) scale(0.9); }
          100% { transform: translateX(-100%) scale(1); }
        }
        @keyframes authToLogin {
          0%   { transform: translateX(-100%) scale(1); }
          40%  { transform: translateX(-100%) scale(0.9); }
          60%  { transform: translateX(0%) scale(0.9); }
          100% { transform: translateX(0%) scale(1); }
        }

        .brand-idle-login  { transform: translateX(0%) scale(1); }
        .brand-idle-signup { transform: translateX(100%) scale(1); }
        .brand-anim-to-signup { animation: brandToSignup 700ms cubic-bezier(0.65,0,0.35,1) forwards; }
        .brand-anim-to-login  { animation: brandToLogin 700ms cubic-bezier(0.65,0,0.35,1) forwards; }

        .auth-idle-login  { transform: translateX(0%) scale(1); }
        .auth-idle-signup { transform: translateX(-100%) scale(1); }
        .auth-anim-to-signup { animation: authToSignup 700ms cubic-bezier(0.65,0,0.35,1) forwards; }
        .auth-anim-to-login  { animation: authToLogin 700ms cubic-bezier(0.65,0,0.35,1) forwards; }
      `}</style>

      {/* Branding panel */}
      <div
        style={brandingPanelStyle}
        className={isMobile ? "" : brandClass}
        onAnimationEnd={() => setIsAnimating(false)}
      >
        <div className="shape-a" style={{ position: "absolute", width: "280px", height: "280px", borderRadius: "50%", background: "rgba(37,99,235,0.25)", top: "-100px", right: "-80px" }} />
        <div className="shape-b" style={{ position: "absolute", width: "180px", height: "180px", borderRadius: "40px", background: "rgba(255,255,255,0.06)", bottom: "60px", left: "-40px" }} />
        <div className="shape-c" style={{ position: "absolute", width: "120px", height: "120px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)", bottom: "-30px", right: "60px" }} />
        {brandingContent}
      </div>

      {/* Auth card panel */}
      <div style={authPanelWrapperStyle} className={isMobile ? "" : authClass}>
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            background: "#fff",
            borderRadius: "20px",
            border: "1px solid #E5E7EB",
            boxShadow: "0 12px 32px rgba(0,0,0,0.06)",
            padding: "34px 30px",
          }}
        >
          {mode === "login" ? (
            <>
              <h2 style={{ margin: 0, fontSize: "22px", color: "#111827" }}>Welcome back</h2>
              <p style={{ margin: "6px 0 24px", fontSize: "13.5px", color: "#6B7280" }}>
                Sign in to your shop account to continue
              </p>

              {errors.form && (
                <div style={{ background: "#FEF2F2", color: "#DC2626", fontSize: "12.5px", padding: "10px 12px", borderRadius: "8px", marginBottom: "14px" }}>
                  {errors.form}
                </div>
              )}

              {resetStatus && (
                <div
                  style={{
                    background: resetStatus.type === "success" ? "#F0FDF4" : "#FEF2F2",
                    color: resetStatus.type === "success" ? "#16A34A" : "#DC2626",
                    fontSize: "12.5px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    marginBottom: "14px",
                  }}
                >
                  {resetStatus.message}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
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
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ ...inputStyle(errors.password), paddingRight: "50px" }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={eyeToggle}>
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.password && <div style={errorText}>{errors.password}</div>}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12.5px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "#374151", cursor: "pointer" }}>
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                    Remember me
                  </label>
                  <span
                    onClick={isSendingReset ? undefined : handleForgotPassword}
                    style={{
                      color: "#2563EB",
                      fontWeight: 600,
                      cursor: isSendingReset ? "not-allowed" : "pointer",
                      opacity: isSendingReset ? 0.6 : 1,
                    }}
                  >
                    {isSendingReset ? "Sending..." : "Forgot password?"}
                  </span>
                </div>

                <button onClick={handleLogin} disabled={isSubmitting} style={{ ...primaryBtn, marginTop: "4px" }}>
                  {isSubmitting ? "Please wait..." : "Login"}
                </button>
              </div>

              <p style={{ fontSize: "13px", color: "#6B7280", textAlign: "center", marginTop: "22px" }}>
                Don't have an account?{" "}
                <span onClick={() => switchMode("signup")} style={{ color: "#2563EB", fontWeight: 700, cursor: "pointer" }}>
                  Create Account
                </span>
              </p>
            </>
          ) : (
            <>
              <h2 style={{ margin: 0, fontSize: "22px", color: "#111827" }}>Create your account</h2>
              <p style={{ margin: "6px 0 20px", fontSize: "13.5px", color: "#6B7280" }}>
                Set up your shop in a few seconds
              </p>

              {errors.form && (
                <div style={{ background: "#FEF2F2", color: "#DC2626", fontSize: "12.5px", padding: "10px 12px", borderRadius: "8px", marginBottom: "14px" }}>
                  {errors.form}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
                    <input
                      type={showSignupPassword ? "text" : "password"}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      style={{ ...inputStyle(errors.signupPassword), paddingRight: "50px" }}
                    />
                    <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)} style={eyeToggle}>
                      {showSignupPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.signupPassword && <div style={errorText}>{errors.signupPassword}</div>}
                </div>

                <div>
                  <label style={labelStyle}>Confirm Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ ...inputStyle(errors.confirmPassword), paddingRight: "50px" }}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={eyeToggle}>
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.confirmPassword && <div style={errorText}>{errors.confirmPassword}</div>}
                </div>

                <button onClick={handleRegister} disabled={isSubmitting} style={{ ...primaryBtn, marginTop: "4px" }}>
                  {isSubmitting ? "Please wait..." : "Create Account"}
                </button>
              </div>

              <p style={{ fontSize: "13px", color: "#6B7280", textAlign: "center", marginTop: "20px" }}>
                Already have an account?{" "}
                <span onClick={() => switchMode("login")} style={{ color: "#2563EB", fontWeight: 700, cursor: "pointer" }}>
                  Login
                </span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;