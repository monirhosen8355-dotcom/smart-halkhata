import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function PageLoader() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 650);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!loading) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "rgba(255, 255, 255, 0.35)",
backdropFilter: "blur(8px)",
WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          width: "62px",
          height: "62px",
          borderRadius: "18px",
          background:
            "linear-gradient(135deg, #E2136E, #7C3AED)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontSize: "25px",
          fontWeight: 900,
          animation: "loaderPulse 1s infinite",
        }}
      >
        S
      </div>

      <div
        style={{
          marginTop: "18px",
          fontSize: "22px",
          fontWeight: 900,
          color: "#111827",
        }}
      >
        Smart Halkhata
      </div>

      <div
        style={{
          marginTop: "7px",
          fontSize: "12px",
          color: "#6B7280",
        }}
      >
        Loading...
      </div>

      <style>
        {`
          @keyframes loaderPulse {
            0% {
              transform: scale(0.92);
              opacity: 0.7;
            }
            50% {
              transform: scale(1);
              opacity: 1;
            }
            100% {
              transform: scale(0.92);
              opacity: 0.7;
            }
          }
        `}
      </style>
    </div>
  );
}

export default PageLoader;