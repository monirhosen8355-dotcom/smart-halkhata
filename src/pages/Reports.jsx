import { useState } from "react";
import BottomNavigation from "../components/BottomNavigation";

function Reports() {
  const [message, setMessage] = useState("");

  const SUPPORT_EMAIL = "monirhossen978889@gmail.com";
  const SUPPORT_PHONE = "01897889723";
  const TELEGRAM_USERNAME = "bdtearninig66  ";
  const WHATSAPP_NUMBER = "8801897889723";

  const handleSubmitReport = () => {
    if (!message.trim()) {
      alert("Please describe the problem before submitting.");
      return;
    }

    const subject = encodeURIComponent("Smart Halkhata - Support Request");
    const body = encodeURIComponent(message.trim());
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  const supportOptions = [
    {
      icon: "📞",
      title: "Call",
      value: SUPPORT_PHONE,
      href: `tel:${SUPPORT_PHONE}`,
    },
    {
      icon: "✉️",
      title: "Email",
      value: SUPPORT_EMAIL,
      href: `mailto:${SUPPORT_EMAIL}`,
    },
    {
      icon: "✈️",
      title: "Telegram",
      value: TELEGRAM_USERNAME,
      href: "https://t.me/bdtearning66",
    },
    {
      icon: "💬",
      title: "WhatsApp",
      value: SUPPORT_PHONE,
      href: `https://wa.me/${WHATSAPP_NUMBER}`,
    },
  ];

  return (
    <div className="rp-root">
      <style>{`
        * { box-sizing: border-box; }
        .rp-root {
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
          background: var(--bg, #F3F4F6);
          color: var(--text, #111827);
          font-family: system-ui, -apple-system, sans-serif;
          padding: 18px 14px 100px;
        }
        @media (min-width: 640px) { .rp-root { padding: 26px 22px 100px; } }

        .rp-wrap { max-width: 760px; margin: 0 auto; }

        .rp-header-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }
        .rp-header-icon {
          flex-shrink: 0;
          width: 38px;
          height: 38px;
          border-radius: 11px;
          background: rgba(37,99,235,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }
        .rp-title { margin: 0; font-size: 19px; font-weight: 800; color: var(--text, #111827); }
        @media (min-width: 640px) { .rp-title { font-size: 23px; } }
        .rp-subtitle { margin: 3px 0 0; color: var(--text-muted, #6B7280); opacity: 0.85; font-size: 12.5px; }
        @media (min-width: 640px) { .rp-subtitle { font-size: 13.5px; } }

        .rp-card {
          background: var(--card, #fff);
          border-radius: 18px;
          border: 1px solid var(--border, rgba(127,127,127,0.18));
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          padding: 18px;
          margin-bottom: 16px;
        }
        @media (min-width: 640px) { .rp-card { padding: 24px; margin-bottom: 20px; } }

        .rp-card-intro {
          font-size: 13px;
          line-height: 1.55;
          color: var(--text-muted, #4B5563);
          opacity: 0.9;
          margin: 0 0 16px;
        }

        .rp-label {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--text, #111827);
          margin-bottom: 8px;
        }

        .rp-textarea {
          width: 100%;
          min-height: 120px;
          max-height: 260px;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1.5px solid var(--border, rgba(127,127,127,0.22));
          background: var(--input-bg, rgba(127,127,127,0.06));
          color: var(--text, #111827);
          font-size: 13.5px;
          font-family: inherit;
          outline: none;
          resize: vertical;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        }
        .rp-textarea::placeholder { color: var(--text-muted, #9CA3AF); opacity: 0.8; }
        .rp-textarea:focus {
          border-color: #2563EB;
          background: var(--card, #fff);
          box-shadow: 0 0 0 3px rgba(37,99,235,0.18);
        }

        .rp-submit-btn {
          margin-top: 14px;
          width: 100%;
          padding: 13px;
          border: none;
          border-radius: 12px;
          background: #2563EB;
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          box-shadow: 0 5px 14px rgba(37,99,235,0.3);
          transition: background 0.15s ease, transform 0.12s ease;
        }
        .rp-submit-btn:hover { background: #1D4ED8; }
        .rp-submit-btn:active { transform: scale(0.98); }

        .rp-section-title {
          margin: 0 0 3px;
          font-size: 15px;
          font-weight: 800;
          color: var(--text, #111827);
        }
        .rp-section-subtitle {
          margin: 0 0 16px;
          font-size: 12.5px;
          color: var(--text-muted, #6B7280);
          opacity: 0.85;
        }

        .rp-support-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }
        @media (min-width: 560px) { .rp-support-grid { grid-template-columns: repeat(2, 1fr); } }

        .rp-support-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 14px;
          border-radius: 13px;
          border: 1.5px solid var(--border, rgba(127,127,127,0.2));
          background: var(--input-bg, rgba(127,127,127,0.04));
          text-decoration: none;
          color: var(--text, #111827);
          transition: background 0.15s ease, border-color 0.15s ease, transform 0.12s ease;
        }
        .rp-support-item:hover { background: rgba(37,99,235,0.1); border-color: #2563EB; }
        .rp-support-item:active { transform: scale(0.98); }

        .rp-support-icon {
          flex-shrink: 0;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(37,99,235,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
        }

        .rp-support-info { min-width: 0; }
        .rp-support-title { font-size: 13px; font-weight: 700; color: var(--text, #111827); }
        .rp-support-value {
          font-size: 12px;
          color: var(--text-muted, #6B7280);
          opacity: 0.85;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .rp-notice {
          margin-top: 16px;
          padding: 13px 14px;
          border-radius: 12px;
          background: rgba(37,99,235,0.08);
          border: 1px solid rgba(37,99,235,0.18);
        }
        .rp-notice-title {
          font-size: 12px;
          font-weight: 800;
          color: #2563EB;
          margin-bottom: 3px;
        }
        .rp-notice-text {
          font-size: 12px;
          line-height: 1.5;
          color: var(--text-muted, #4B5563);
          opacity: 0.9;
        }
      `}</style>

      <div className="rp-wrap">
        {/* Header */}
        <div className="rp-header-row">
          <div className="rp-header-icon">🛟</div>
          <div>
            <h1 className="rp-title">Help &amp; Support</h1>
            <p className="rp-subtitle">Need help? Report a problem or contact our support team.</p>
          </div>
        </div>

        {/* Report a Problem */}
        <div className="rp-card">
          <p className="rp-card-intro">
            Found a technical issue or another problem while using Smart Halkhata?
            Tell us what happened and our support team will review it.
          </p>

          <div className="rp-label">Report a Problem</div>
          <textarea
            className="rp-textarea"
            placeholder="Write your problem here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button className="rp-submit-btn" onClick={handleSubmitReport}>
            Submit Report
          </button>
        </div>

        {/* Contact Support */}
        <div className="rp-card">
          <h3 className="rp-section-title">Contact Support</h3>
          <p className="rp-section-subtitle">Choose any option to contact our support team.</p>

          <div className="rp-support-grid">
            {supportOptions.map((option) => (
  <a
    key={option.title}
    href={option.href}
    target={option.href.startsWith("http") ? "_blank" : undefined}
    rel={option.href.startsWith("http") ? "noopener noreferrer" : undefined}
    className="rp-support-item"
  >
    <span className="rp-support-icon">{option.icon}</span>

    <span className="rp-support-info">
      <div className="rp-support-title">{option.title}</div>
      <div className="rp-support-value">{option.value}</div>
    </span>
  </a>
))}
          </div>

          <div className="rp-notice">
            <div className="rp-notice-title">Notice</div>
            <div className="rp-notice-text">
              For urgent account or payment-related issues, please contact support directly.
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}

export default Reports;