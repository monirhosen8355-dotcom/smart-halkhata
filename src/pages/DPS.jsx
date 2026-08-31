import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  getDpsList,
  subscribeToDpsList,
  getDpsNotifications,
  subscribeToDpsNotifications,
  markNotificationRead,
} from "../services/dpsService";
import {
  getDpsStatusMeta,
  formatTaka,
  formatDateTime,
  DPS_STATUS,
} from "../utils/dpsUtils";

const CONSENT_STORAGE_KEY = "smartHalkhata_dpsConsentGiven";
const CONSENT_TEXT =
  "আমি নিশ্চিত করছি যে আমি এই DPS/Savings সেবার শর্তাবলী পড়েছি এবং সম্মত আছি। " +
  "আমি বুঝি যে গ্রাহকের তথ্য, NID এবং নমিনির তথ্য যাচাইয়ের জন্য Admin-এর কাছে পাঠানো হবে, " +
  "এবং Admin অনুমোদনের পরই DPS সক্রিয় হবে।";

export default function DPS() {
  const navigate = useNavigate();
  const shopId = auth.currentUser?.uid;

  const [consentGiven, setConsentGiven] = useState(
    () => localStorage.getItem(CONSENT_STORAGE_KEY) === "true"
  );

  const [dpsList, setDpsList] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!consentGiven || !shopId) return;

    setLoading(true);
    setError("");

    const unsubscribeDps = subscribeToDpsList(shopId, (list) => {
      setDpsList(list);
      setLoading(false);
    });

    const unsubscribeNotif = subscribeToDpsNotifications(shopId, (list) => {
      setNotifications(list);
    });

    return () => {
      unsubscribeDps();
      unsubscribeNotif();
    };
  }, [consentGiven, shopId]);

  function handleAgreeConsent() {
    localStorage.setItem(CONSENT_STORAGE_KEY, "true");
    setConsentGiven(true);
  }

  async function handleDismissNotification(notificationId) {
    if (!shopId) return;
    try {
      await markNotificationRead(shopId, notificationId);
    } catch (err) {
      console.error("Notification mark-as-read failed:", err);
    }
  }

  // -----------------------------------------------------------------
  // CONSENT SCREEN
  // -----------------------------------------------------------------
  if (!consentGiven) {
    return (
      <div style={styles.consentWrapper}>
        <div style={styles.consentCard}>
          <div style={styles.consentIconCircle}>৳</div>
          <h1 style={styles.consentTitle}>DPS / Savings সেবা</h1>
          <p style={styles.consentSubtitle}>শুরু করার আগে অনুগ্রহ করে শর্তাবলী পড়ুন</p>

          <div style={styles.consentBox}>
            <p style={styles.consentBoxText}>{CONSENT_TEXT}</p>
            <ul style={styles.consentList}>
              <li>গ্রাহক ও নমিনির সঠিক তথ্য এবং NID প্রদান করতে হবে।</li>
              <li>প্রতিটি আবেদন Admin কর্তৃক যাচাই ও অনুমোদন সাপেক্ষে সক্রিয় হবে।</li>
              <li>আবেদন বাতিল হলে কারণ জানানো হবে।</li>
              <li>DPS ব্যালেন্স আপনার দোকানের সাধারণ বাকি/হিসাবের সাথে কখনো মেশানো হবে না।</li>
            </ul>
          </div>

          <button style={styles.consentButton} onClick={handleAgreeConsent}>
            আমি সম্মত, শুরু করছি
          </button>
          <button style={styles.consentBackButton} onClick={() => navigate(-1)}>
            পিছনে যান
          </button>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // DASHBOARD
  // -----------------------------------------------------------------
  const activeCount = dpsList.filter((d) => d.status === DPS_STATUS.ACTIVE).length;
  const pendingCount = dpsList.filter(
  (d) => d.status === DPS_STATUS.PENDING_ADMIN_APPROVAL
).length;
  const rejectedCount = dpsList.filter((d) => d.status === DPS_STATUS.REJECTED).length;
  const maturedCount = dpsList.filter((d) => d.status === DPS_STATUS.MATURED).length;

  const totalBalance = dpsList.reduce((sum, d) => {
    if (d.status === DPS_STATUS.ACTIVE || d.status === DPS_STATUS.MATURED) {
      return sum + Number((d.payment && d.payment.totalPaid) || 0);
    }
    return sum;
  }, 0);

  const unreadNotifications = notifications.filter((n) => !n.isRead);

  return (
    <div style={styles.pageWrapper}>
      {/* Notification banners */}
      {unreadNotifications.length > 0 && (
        <div style={styles.notifStack}>
          {unreadNotifications.map((notif) => (
            <div key={notif.id} style={styles.notifBanner}>
              <div>
                <div style={styles.notifTitle}>{notif.title}</div>
                <div style={styles.notifMessage}>{notif.message}</div>
              </div>
              <button
                style={styles.notifDismiss}
                onClick={() => handleDismissNotification(notif.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Balance card */}
      <div style={styles.balanceCard}>
        <div style={styles.balanceLabel}>মোট DPS জমা</div>
        <div style={styles.balanceAmount}>{formatTaka(totalBalance)}</div>
        <div style={styles.statRow}>
          <StatPill label="সক্রিয়" value={activeCount} color="#16A34A" />
          <StatPill label="অপেক্ষমাণ" value={pendingCount} color="#D97706" />
          <StatPill label="বাতিল" value={rejectedCount} color="#DC2626" />
          <StatPill label="মেয়াদপূর্ণ" value={maturedCount} color="#2563EB" />
        </div>
      </div>

      {/* New DPS button */}
      <button style={styles.newDpsButton} onClick={() => navigate("/dps/create")}>
        + নতুন DPS আবেদন
      </button>

      {/* Error */}
      {error && <div style={styles.errorBox}>{error}</div>}

      {/* DPS list */}
      <div style={styles.listSection}>
        <h2 style={styles.listHeading}>সকল DPS আবেদন</h2>

        {loading && <div style={styles.emptyState}>লোড হচ্ছে...</div>}

        {!loading && dpsList.length === 0 && (
          <div style={styles.emptyState}>
            এখনো কোনো DPS আবেদন করা হয়নি। উপরের বাটনে চেপে প্রথম আবেদন করুন।
          </div>
        )}

        {!loading &&
          dpsList.map((dps) => {
            const meta = getDpsStatusMeta(dps.status);
            return (
              <div
                key={dps.id}
                style={styles.dpsRow}
                onClick={() => navigate(`/dps/${dps.id}`)}
              >
                <div style={styles.dpsRowLeft}>
                  <div style={styles.dpsCustomerName}>
                    {(dps.customer && dps.customer.name) || "নাম নেই"}
                  </div>
                  <div style={styles.dpsSubText}>
                    {dps.plan
                      ? `${formatTaka(dps.plan.installmentAmount)} / মাস • ${dps.plan.durationMonths} মাস`
                      : "—"}
                  </div>
                  <div style={styles.dpsSubTextMuted}>
                    আবেদন: {formatDateTime(dps.createdAt)}
                  </div>
                </div>
                <div
                  style={{
                    ...styles.statusBadge,
                    color: meta.color,
                    backgroundColor: meta.bg,
                  }}
                >
                  {meta.label}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div style={styles.statPill}>
      <div style={{ ...styles.statPillValue, color }}>{value}</div>
      <div style={styles.statPillLabel}>{label}</div>
    </div>
  );
}

const styles = {
  // Consent screen
  consentWrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0F3D91 0%, #1A56C4 100%)",
    padding: "24px",
  },
  consentCard: {
    background: "#FFFFFF",
    borderRadius: "20px",
    padding: "32px 24px",
    maxWidth: "440px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
  },
  consentIconCircle: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #1A56C4, #0F3D91)",
    color: "#fff",
    fontSize: "28px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  consentTitle: { fontSize: "22px", fontWeight: 700, color: "#0F172A", margin: "0 0 4px" },
  consentSubtitle: { fontSize: "14px", color: "#64748B", margin: "0 0 20px" },
  consentBox: {
    background: "#F1F5F9",
    borderRadius: "14px",
    padding: "16px",
    textAlign: "left",
    marginBottom: "24px",
  },
  consentBoxText: { fontSize: "14px", color: "#334155", lineHeight: 1.6, margin: "0 0 12px" },
  consentList: { fontSize: "13px", color: "#475569", lineHeight: 1.8, margin: 0, paddingLeft: "18px" },
  consentButton: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #1A56C4, #0F3D91)",
    color: "#fff",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: "10px",
  },
  consentBackButton: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #E2E8F0",
    background: "#fff",
    color: "#64748B",
    fontSize: "14px",
    cursor: "pointer",
  },

  // Dashboard
  pageWrapper: {
    padding: "16px",
    maxWidth: "560px",
    margin: "0 auto",
    fontFamily: "inherit",
  },
  notifStack: { marginBottom: "16px", display: "flex", flexDirection: "column", gap: "8px" },
  notifBanner: {
    background: "#EFF6FF",
    border: "1px solid #BFDBFE",
    borderRadius: "12px",
    padding: "12px 14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "8px",
  },
  notifTitle: { fontSize: "13px", fontWeight: 700, color: "#1E3A8A" },
  notifMessage: { fontSize: "12px", color: "#334155", marginTop: "2px" },
  notifDismiss: {
    border: "none",
    background: "transparent",
    color: "#94A3B8",
    fontSize: "14px",
    cursor: "pointer",
    padding: "0 4px",
  },
  balanceCard: {
    background: "linear-gradient(135deg, #0F3D91 0%, #1A56C4 100%)",
    borderRadius: "18px",
    padding: "22px 20px",
    color: "#fff",
    marginBottom: "16px",
    boxShadow: "0 10px 30px rgba(15,61,145,0.3)",
  },
  balanceLabel: { fontSize: "13px", opacity: 0.85 },
  balanceAmount: { fontSize: "32px", fontWeight: 700, margin: "4px 0 16px" },
  statRow: { display: "flex", justifyContent: "space-between", gap: "8px" },
  statPill: {
    background: "rgba(255,255,255,0.15)",
    borderRadius: "10px",
    padding: "8px 6px",
    textAlign: "center",
    flex: 1,
  },
  statPillValue: { fontSize: "16px", fontWeight: 700 },
  statPillLabel: { fontSize: "10px", color: "#E2E8F0", marginTop: "2px" },
  newDpsButton: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "#16A34A",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: "20px",
  },
  errorBox: {
    background: "#FEF2F2",
    color: "#DC2626",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    marginBottom: "12px",
  },
  listSection: { marginBottom: "40px" },
  listHeading: { fontSize: "15px", fontWeight: 700, color: "#0F172A", marginBottom: "10px" },
  emptyState: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: "13px",
    padding: "24px 12px",
    background: "#F8FAFC",
    borderRadius: "12px",
  },
  dpsRow: {
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: "14px",
    padding: "14px",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  },
  dpsRowLeft: { flex: 1 },
  dpsCustomerName: { fontSize: "14px", fontWeight: 600, color: "#0F172A" },
  dpsSubText: { fontSize: "12px", color: "#475569", marginTop: "2px" },
  dpsSubTextMuted: { fontSize: "11px", color: "#94A3B8", marginTop: "2px" },
  statusBadge: {
    fontSize: "11px",
    fontWeight: 700,
    padding: "6px 10px",
    borderRadius: "20px",
    whiteSpace: "nowrap",
  },
};