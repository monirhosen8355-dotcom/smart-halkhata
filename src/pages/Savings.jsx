import React from "react";
import { useNavigate } from "react-router-dom";

function Savings() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "30px 18px 110px",
        background: "var(--bg)",
        fontFamily: "system-ui, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "580px",
          padding: "34px 22px",
          borderRadius: "24px",
          background: "var(--card, #ffffff)",
          border: "1px solid var(--border, #e5e7eb)",
          boxShadow: "0 15px 35px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        {/* Rotating Settings Icon */}
        <div
          style={{
            width: "130px",
            height: "130px",
            margin: "0 auto 24px",
            borderRadius: "50%",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "0",
              borderRadius: "50%",
              border: "7px solid #E5E7EB",
              borderTopColor: "#2563EB",
              borderRightColor: "#7C3AED",
              animation: "savingsRotate 1.8s linear infinite",
            }}
          />

          {/* Settings Icon */}
          <div
            style={{
              fontSize: "58px",
              lineHeight: "1",
              animation: "savingsRotateReverse 1.8s linear infinite",
            }}
          >
            ⚙️
          </div>

          {/* Percentage */}
          <div
            style={{
              position: "absolute",
              inset: "0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "17px",
              fontWeight: "900",
              color: "#2563EB",
              paddingTop: "76px",
            }}
          >
            67%
          </div>
        </div>

        {/* Main Text */}
        <h2
          style={{
            margin: "0",
            fontSize: "23px",
            fontWeight: "800",
            color: "var(--text, #111827)",
            lineHeight: "1.5",
          }}
        >
          সিস্টেম মেইনটেন্যান্সের কাজ চলছে
        </h2>

        <p
          style={{
            margin: "12px auto 0",
            maxWidth: "450px",
            fontSize: "14px",
            lineHeight: "1.8",
            color: "var(--text, #6B7280)",
            opacity: 0.75,
          }}
        >
          Savings সিস্টেম প্রস্তুত করার কাজ চলছে।
          <br />
          কাজ সম্পন্ন হলে সুবিধাটি ব্যবহার করা যাবে।
        </p>

        {/* Home Button */}
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          style={{
            marginTop: "26px",
            padding: "13px 28px",
            border: "none",
            borderRadius: "13px",
            background: "linear-gradient(135deg, #2563EB, #7C3AED)",
            color: "#fff",
            fontSize: "15px",
            fontWeight: "800",
            cursor: "pointer",
            boxShadow: "0 8px 20px rgba(37,99,235,0.22)",
          }}
        >
          ← হোমে ফিরে যান
        </button>

        <style>{`
          @keyframes savingsRotate {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @keyframes savingsRotateReverse {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(-360deg);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default Savings;