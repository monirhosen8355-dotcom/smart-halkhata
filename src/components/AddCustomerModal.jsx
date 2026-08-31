import { useState, useContext } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase";
import { AuthContext } from "../context/AuthContext";

function AddCustomerModal({ open, onClose, onSuccess }) {
  const { user } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nameFocused, setNameFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const handleAddCustomer = async () => {
    try {
      if (!name.trim() || !phone.trim()) {
        alert("সব তথ্য দিন");
        return;
      }

      setIsSubmitting(true);

      const cleanPhone = phone.trim();

      // ===============================
      // DUPLICATE CHECK
      // ===============================

      const duplicateQuery = query(
        collection(db, "shops", user.uid, "customers"),
        where("phone", "==", cleanPhone)
      );

      const duplicateSnap = await getDocs(duplicateQuery);

      if (!duplicateSnap.empty) {
        alert("এই ফোন নম্বরের Customer আগে থেকেই আছে।");
        setIsSubmitting(false);
        return;
      }

      // ===============================
      // ADD CUSTOMER
      // ===============================

      await addDoc(
        collection(db, "shops", user.uid, "customers"),
        {
          name: name.trim(),
          phone: cleanPhone,
          due: 0,
          createdAt: serverTimestamp(),
          createdDate: new Date().toISOString().split("T")[0],
        }
      );

      setName("");
      setPhone("");

      onSuccess?.();
      onClose();

      alert("Customer Added");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="acm-overlay" onClick={onClose}>
      <style>{`
        * { box-sizing: border-box; }

        .acm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(11, 17, 32, 0.55);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          padding: 16px;
          animation: acmFadeIn 0.2s ease;
        }
        @keyframes acmFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .acm-modal {
          width: 100%;
          max-width: 420px;
          background: #fff;
          border-radius: 24px;
          box-shadow:
            0 24px 60px rgba(15, 23, 42, 0.25),
            0 4px 14px rgba(15, 23, 42, 0.08);
          padding: 22px;
          max-height: 92vh;
          overflow-y: auto;
          animation: acmRiseIn 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @media (min-width: 480px) { .acm-modal { padding: 28px; } }

        @keyframes acmRiseIn {
          from { opacity: 0; transform: translateY(14px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ============ Header ============ */
        .acm-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 22px;
        }

        .acm-icon-badge {
          flex-shrink: 0;
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
          border: 1px solid #DBEAFE;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .acm-header-text { flex: 1; min-width: 0; padding-top: 1px; }
        .acm-title {
          margin: 0;
          font-size: 17px;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.2px;
        }
        .acm-subtitle {
          margin: 3px 0 0;
          font-size: 12.5px;
          color: #6B7280;
        }

        .acm-close-btn {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border-radius: 9px;
          border: none;
          background: #F3F4F6;
          color: #6B7280;
          font-size: 16px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease, transform 0.12s ease;
        }
        .acm-close-btn:hover { background: #E5E7EB; color: #374151; }
        .acm-close-btn:active { transform: scale(0.94); }

        /* ============ Fields ============ */
        .acm-field { margin-bottom: 16px; }

        .acm-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 700;
          color: #374151;
          margin-bottom: 7px;
        }

        .acm-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .acm-input-icon {
          position: absolute;
          left: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9CA3AF;
          pointer-events: none;
          transition: color 0.15s ease;
        }
        .acm-input-icon.is-focused { color: #2563EB; }

        .acm-input {
          width: 100%;
          height: 48px;
          padding: 0 14px 0 42px;
          border-radius: 12px;
          border: 1.5px solid #E5E7EB;
          font-size: 14px;
          color: #111827;
          background: #F9FAFB;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        }
        .acm-input::placeholder { color: #9CA3AF; }
        .acm-input:focus {
          border-color: #2563EB;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.10);
        }

        /* ============ Buttons ============ */
        .acm-actions {
          display: flex;
          gap: 10px;
          margin-top: 22px;
        }
        @media (max-width: 380px) {
          .acm-actions { flex-direction: column-reverse; }
        }

        .acm-btn {
          flex: 1;
          height: 48px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition: transform 0.12s ease, box-shadow 0.15s ease, opacity 0.15s ease, background 0.15s ease;
        }

        .acm-btn-cancel {
          background: #F3F4F6;
          border: 1.5px solid #E5E7EB;
          color: #374151;
        }
        .acm-btn-cancel:hover { background: #E5E7EB; }
        .acm-btn-cancel:active { transform: scale(0.98); }

        .acm-btn-primary {
          background: #2563EB;
          border: none;
          color: #fff;
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
        }
        .acm-btn-primary:hover:not(:disabled) {
          background: #1D4ED8;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.38);
        }
        .acm-btn-primary:active:not(:disabled) { transform: translateY(0) scale(0.98); }
        .acm-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
      `}</style>

      <div className="acm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="acm-header">
          <div className="acm-icon-badge">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="3.5" stroke="#2563EB" strokeWidth="1.8" />
              <path d="M5 20c0-3.5 3.13-6 7-6s7 2.5 7 6" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>

          <div className="acm-header-text">
            <h2 className="acm-title">Add Customer</h2>
            <p className="acm-subtitle">Create a new customer account</p>
          </div>

          <button className="acm-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Customer Name */}
        <div className="acm-field">
          <label className="acm-label">Customer Name</label>
          <div className="acm-input-wrap">
            <span className={`acm-input-icon ${nameFocused ? "is-focused" : ""}`}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="3.3" stroke="currentColor" strokeWidth="1.8" />
                <path d="M5.5 19.5c0-3.3 2.9-5.7 6.5-5.7s6.5 2.4 6.5 5.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <input
              className="acm-input"
              placeholder="Enter customer name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="acm-field">
          <label className="acm-label">Phone Number</label>
          <div className="acm-input-wrap">
            <span className={`acm-input-icon ${phoneFocused ? "is-focused" : ""}`}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6.5 3.5h2.2l1.3 4-1.9 1.3a10.5 10.5 0 0 0 4.6 4.6l1.3-1.9 4 1.3v2.2c0 1-1 1.9-2 1.8-7-.6-11-4.6-11.6-11.6-.1-1 .8-1.9 1.8-1.7Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <input
              className="acm-input"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => setPhoneFocused(false)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="acm-actions">
          <button className="acm-btn acm-btn-cancel" onClick={onClose}>
            Cancel
          </button>

          <button
            className="acm-btn acm-btn-primary"
            onClick={handleAddCustomer}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Please wait..."
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
                Add Customer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddCustomerModal;