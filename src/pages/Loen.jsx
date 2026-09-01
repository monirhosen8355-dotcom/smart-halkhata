import React from "react";
import { useNavigate } from "react-router-dom";

function Loen() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "30px 18px",
        background: "var(--bg)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "580px",
          margin: "0 auto",
          padding: "28px",
          borderRadius: "24px",
          background: "linear-gradient(135deg,#2563EB,#7C3AED)",
          color: "#fff",
          textAlign: "center",
          boxShadow: "0 15px 35px rgba(37,99,235,.22)",
        }}
      >
        {/* Person + X Icon */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "18px",
          }}
        >
          <svg
            width="100"
            height="100"
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
            margin: "0",
            fontSize: "24px",
            lineHeight: "1.6",
            fontWeight: "800",
            color: "#fff",
          }}
        >
          লোন নিতে আগ্রহী হওয়ায় আপনাকে
          <br />
          ধন্যবাদ
        </h2>

        <div
  style={{
    marginTop: "24px",
    padding: "18px 16px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.22)",
  }}
>
  <div
    style={{
      fontSize: "18px",
      fontWeight: "700",
      lineHeight: "1.8",
      color: "#fff",
    }}
  >
    বর্তমানে লোন সুবিধা
    <br />
    উপলব্ধ নয়।
  </div>

  <div
    style={{
      marginTop: "12px",
      fontSize: "14px",
      fontWeight: "600",
      lineHeight: "1.8",
      color: "#fff",
      opacity: 0.9,
    }}
  >
    লোন সেবা পেতে আপনার কমপক্ষে ৩ মাস মেয়াদি একটি DPS থাকতে হবে।
    লোন সেবা সম্পর্কে বিস্তারিত জানতে আমাদের সাথে যোগাযোগ করুন।
  </div>
</div>

        {/* Dashboard Button */}
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            marginTop: "22px",
            padding: "13px 28px",
            border: "none",
            borderRadius: "12px",
            background: "#fff",
            color: "#2563EB",
            fontSize: "16px",
            fontWeight: "800",
            cursor: "pointer",
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          }}
        >
          ড্যাশবোর্ডে ফিরে যান
        </button>
      </div>
    </div>
  );
}

export default Loen;  