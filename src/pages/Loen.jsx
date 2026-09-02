import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Loen() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setChecking(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          background: "var(--bg)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "280px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              margin: "0 auto 18px",
              border: "5px solid rgba(37, 99, 235, 0.15)",
              borderTop: "5px solid #2563EB",
              borderRadius: "50%",
              animation: "loanSpin 0.9s linear infinite",
              boxSizing: "border-box",
            }}
          />

          <div
            style={{
              fontSize: "17px",
              fontWeight: "800",
              color: "var(--text, #111827)",
              lineHeight: "1.5",
            }}
          >
            আপনার অ্যাকাউন্ট চেক করা হচ্ছে
          </div>

          <div
            style={{
              marginTop: "6px",
              fontSize: "12px",
              color: "var(--muted, #6B7280)",
            }}
          >
            অনুগ্রহ করে অপেক্ষা করুন...
          </div>

          <style>
            {`
              @keyframes loanSpin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        padding: "18px 12px 30px",
        background: "var(--bg)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "390px",
          margin: "0 auto",
          padding: "22px 16px",
          borderRadius: "20px",
          background: "linear-gradient(135deg, #2563EB, #7C3AED)",
          color: "#fff",
          textAlign: "center",
          boxShadow: "0 12px 28px rgba(37, 99, 235, 0.18)",
          boxSizing: "border-box",
        }}
      >
        {/* Person + X Icon */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "12px",
          }}
        >
          <svg
            width="72"
            height="72"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="43"
              cy="29"
              r="17"
              fill="none"
              stroke="#EC4899"
              strokeWidth="5"
            />

            <path
              d="M15 82C15 62 26 50 43 50C55 50 64 56 69 67"
              fill="none"
              stroke="#EC4899"
              strokeWidth="5"
              strokeLinecap="round"
            />

            <path
              d="M67 48L87 58V72C87 84 77 91 67 95C57 91 47 84 47 72V58L67 48Z"
              fill="#EC4899"
            />

            <path
              d="M60 64L74 78M74 64L60 78"
              stroke="#fff"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h2
          style={{
            margin: 0,
            fontSize: "20px",
            lineHeight: "1.45",
            fontWeight: "800",
            color: "#fff",
          }}
        >
          লোন নিতে আগ্রহী হওয়ায় আপনাকে ধন্যবাদ
        </h2>

        <div
          style={{
            marginTop: "18px",
            padding: "15px 13px",
            borderRadius: "14px",
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.22)",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              fontSize: "16px",
              fontWeight: "700",
              lineHeight: "1.7",
              color: "#fff",
            }}
          >
            বর্তমানে লোন সুবিধা
            <br />
            উপলব্ধ নয়।
          </div>

          <div
            style={{
              marginTop: "9px",
              fontSize: "12.5px",
              fontWeight: "600",
              lineHeight: "1.75",
              color: "#fff",
              opacity: 0.92,
            }}
          >
            লোন সেবা পেতে আপনার কমপক্ষে ৩ মাস মেয়াদি একটি DPS থাকতে হবে।
            <br />
            লোন সেবা সম্পর্কে বিস্তারিত জানতে আমাদের সাথে যোগাযোগ করুন।
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          style={{
            marginTop: "17px",
            padding: "11px 22px",
            border: "none",
            borderRadius: "10px",
            background: "#fff",
            color: "#2563EB",
            fontSize: "14px",
            fontWeight: "800",
            cursor: "pointer",
            boxShadow: "0 6px 16px rgba(0,0,0,0.14)",
          }}
        >
          ড্যাশবোর্ডে ফিরে যান
        </button>
      </div>
    </div>
  );
}

export default Loen;
