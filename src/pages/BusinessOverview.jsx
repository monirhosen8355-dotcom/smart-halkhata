import { useContext, useEffect, useState, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { db, auth } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import BottomNavigation from "../components/BottomNavigation";

const ZERO_STATS = {
  totalCustomers: 0,
  totalDue: 0,
  todayDue: 0,
  todayCollection: 0,
  paidToday: 0,
  totalReceived: 0,
};

function formatDateTime(date) {
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function BusinessOverview() {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState(ZERO_STATS);
  const [lastUpdated, setLastUpdated] = useState("");
  const [lastCleared, setLastCleared] = useState("");
  const [isCleared, setIsCleared] = useState(false);

  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [showClearModal, setShowClearModal] = useState(false);
  const [clearPassword, setClearPassword] = useState("");
  const [clearing, setClearing] = useState(false);
  const [clearError, setClearError] = useState(null);

  const clearedKey = user ? `overviewCleared_${user.uid}` : null;

  const loadOverview = useCallback(
    async ({ silent = false } = {}) => {
      if (!user) return;

      if (silent) setRefreshing(true);
      setLoadError(null);

      try {
        const snap = await getDocs(
          collection(db, "shops", user.uid, "customers")
        );

        let due = 0;
        let todayDueAmount = 0;
        let todayCollectionAmount = 0;
        let paidCount = 0;
        let received = 0;

        const today = new Date().toISOString().split("T")[0];

        for (const customerDoc of snap.docs) {
          const customer = customerDoc.data();
          due += Number(customer.due || 0);

          const txSnap = await getDocs(
            collection(
              db,
              "shops",
              user.uid,
              "customers",
              customerDoc.id,
              "transactions"
            )
          );

          txSnap.forEach((tx) => {
            const t = tx.data();
            const amount = Number(t.amount || 0);

            if (t.type === "payment") {
              received += amount;
            }

            if (t.createdDate === today) {
              if (t.type === "due") todayDueAmount += amount;
              if (t.type === "payment") {
                todayCollectionAmount += amount;
                paidCount++;
              }
            }
          });
        }

        setStats({
          totalCustomers: snap.size,
          totalDue: due,
          todayDue: todayDueAmount,
          todayCollection: todayCollectionAmount,
          paidToday: paidCount,
          totalReceived: received,
        });

        setLastUpdated(formatDateTime(new Date()));

        // An explicit successful load means fresh data now exists —
        // exit the "cleared" state so Refresh can never silently
        // restore stale numbers behind a stuck "cleared" banner.
        if (clearedKey) localStorage.removeItem(clearedKey);
        setIsCleared(false);
      } catch (err) {
        console.error(err);
        setLoadError(
          "Could not load business overview. Please check your connection and try again."
        );
      } finally {
        setInitialLoading(false);
        setRefreshing(false);
      }
    },
    [user, clearedKey]
  );

  useEffect(() => {
    if (!user) return;

    const cleared = localStorage.getItem(clearedKey);

    if (cleared) {
      setLastCleared(cleared);
      setIsCleared(true);
      setStats(ZERO_STATS);
      setInitialLoading(false);
    } else {
      loadOverview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleRefreshClick = () => {
    if (refreshing) return;
    loadOverview({ silent: true });
  };

  const openClearModal = () => {
    setClearPassword("");
    setClearError(null);
    setShowClearModal(true);
  };

  const closeClearModal = () => {
    if (clearing) return;
    setShowClearModal(false);
  };

  const handleConfirmClear = async () => {
    if (!clearPassword) {
      setClearError("Enter your password to confirm.");
      return;
    }

    setClearing(true);
    setClearError(null);

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        clearPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      const now = formatDateTime(new Date());
      localStorage.setItem(clearedKey, now);

      setLastCleared(now);
      setIsCleared(true);
      setStats(ZERO_STATS);
      setShowClearModal(false);
      setClearPassword("");
    } catch (err) {
      console.error(err);
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setClearError("Incorrect password. Nothing was cleared.");
      } else {
        setClearError("Could not verify your identity. Nothing was cleared.");
      }
    } finally {
      setClearing(false);
    }
  };

  const cards = [
    { key: "totalDue", title: "Total Due", icon: "💰", value: `৳${stats.totalDue.toLocaleString()}`, accent: "#DC2626", bg: "linear-gradient(135deg,#FEF2F2,#FFF)" },
    { key: "totalReceived", title: "Total Received", icon: "✅", value: `৳${stats.totalReceived.toLocaleString()}`, accent: "#16A34A", bg: "linear-gradient(135deg,#F0FDF4,#FFF)" },
    { key: "todayCollection", title: "Today's Collection", icon: "📈", value: `৳${stats.todayCollection.toLocaleString()}`, accent: "#2563EB", bg: "linear-gradient(135deg,#EFF6FF,#FFF)" },
    { key: "totalCustomers", title: "Total Customers", icon: "👥", value: stats.totalCustomers, accent: "#7C3AED", bg: "linear-gradient(135deg,#F5F3FF,#FFF)" },
    { key: "paidToday", title: "Paid Today", icon: "🟢", value: stats.paidToday, accent: "#16A34A", bg: "linear-gradient(135deg,#F0FDF4,#FFF)" },
    { key: "dueToday", title: "Due Today", icon: "🔴", value: `৳${stats.todayDue.toLocaleString()}`, accent: "#DC2626", bg: "linear-gradient(135deg,#FEF2F2,#FFF)" },
  ];

  return (
    <div className="bo-root">
      <style>{`
        * { box-sizing: border-box; }
        .bo-root {
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
          background: var(--bg);
          color: var(--text);
          font-family: system-ui, -apple-system, sans-serif;
          padding: 16px 12px 110px;
        }
        @media (min-width: 640px) { .bo-root { padding: 24px 20px 110px; } }

        .bo-wrap { max-width: 900px; margin: 0 auto; }

        .bo-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .bo-title { margin: 0; font-size: 20px; font-weight: 800; }
        @media (min-width: 640px) { .bo-title { font-size: 24px; } }

        .bo-meta { font-size: 12.5px; color: var(--text); opacity: 0.65; margin-top: 6px; }
        .bo-meta.cleared { color: #DC2626; opacity: 1; font-weight: 700; }

        .bo-actions { display: flex; gap: 8px; flex-wrap: wrap; }

        .bo-btn {
          border: none;
          border-radius: 10px;
          padding: 10px 16px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: transform 0.12s ease, opacity 0.15s ease, box-shadow 0.15s ease;
        }
        .bo-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .bo-btn:not(:disabled):hover { transform: translateY(-1px); }
        .bo-btn-refresh { background: #2563EB; color: #fff; box-shadow: 0 4px 12px rgba(37,99,235,0.25); }
        .bo-btn-clear { background: #fff; color: #DC2626; border: 1px solid #FCA5A5; }
        .bo-btn-primary-modal { background: #DC2626; color: #fff; }
        .bo-btn-ghost { background: var(--card, #F3F4F6); color: var(--text); }

        .bo-spin {
          width: 13px; height: 13px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          animation: bo-spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes bo-spin { to { transform: rotate(360deg); } }

        .bo-banner {
          background: #FEF2F2; border: 1px solid #FCA5A5; color: #DC2626;
          padding: 12px 14px; border-radius: 12px; font-size: 13px;
          margin-bottom: 16px; display: flex; gap: 8px; align-items: flex-start;
        }
        .bo-banner.notice {
          background: #FFFBEB; border-color: #FDE68A; color: #92400E;
        }

        .bo-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 560px) { .bo-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; } }
        @media (min-width: 900px) { .bo-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; } }

        .bo-card {
          background: var(--card, #fff);
          border-radius: 18px;
          padding: 18px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.04);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        @media (min-width: 900px) {
          .bo-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(0,0,0,0.09); }
        }

        .bo-card-icon {
          width: 38px; height: 38px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; margin-bottom: 10px;
        }
        .bo-card-title { font-size: 12.5px; color: var(--text); opacity: 0.7; font-weight: 600; }
        .bo-card-value { margin-top: 6px; font-size: 22px; font-weight: 800; }
        @media (min-width: 640px) { .bo-card-value { font-size: 26px; } }

        .bo-skeleton {
          background: linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.10) 37%, rgba(0,0,0,0.06) 63%);
          background-size: 400% 100%;
          animation: bo-shimmer 1.4s ease infinite;
          border-radius: 8px;
        }
        @keyframes bo-shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }

        .bo-modal-overlay {
          position: fixed; inset: 0; background: rgba(17,24,39,0.55);
          display: flex; align-items: center; justify-content: center;
          z-index: 999; padding: 16px;
        }
        .bo-modal {
          width: 100%; max-width: 400px; background: #fff; border-radius: 20px;
          padding: 24px; box-shadow: 0 24px 60px rgba(0,0,0,0.25);
        }
        .bo-modal-title { font-size: 17px; font-weight: 800; color: #111827; margin: 0 0 10px; }
        .bo-modal-text { font-size: 13px; color: #4B5563; line-height: 1.6; margin: 0 0 6px; }
        .bo-modal-safe {
          background: #F0FDF4; border: 1px solid #BBF7D0; color: #166534;
          font-size: 12.5px; padding: 10px 12px; border-radius: 10px; margin: 12px 0;
        }
        .bo-input {
          width: 100%; padding: 11px 13px; border-radius: 10px;
          border: 1px solid #E5E7EB; font-size: 13.5px; outline: none;
          box-sizing: border-box; margin-top: 12px;
        }
        .bo-modal-btn-row { display: flex; gap: 10px; margin-top: 18px; }
        .bo-modal-btn-row .bo-btn { flex: 1; justify-content: center; padding: 12px; }
      `}</style>

      <div className="bo-wrap">
        <div className="bo-header">
          <div>
            <h1 className="bo-title">📊 Business Overview</h1>
            <div className="bo-meta">
              Last Updated: {lastUpdated || "—"}
            </div>
            <div className={`bo-meta ${lastCleared ? "cleared" : ""}`}>
              Last Data Clear: {lastCleared || "Never"}
            </div>
          </div>

          <div className="bo-actions">
            <button className="bo-btn bo-btn-clear" onClick={openClearModal}>
              🗑️ Clear Data
            </button>
            <button
              className="bo-btn bo-btn-refresh"
              onClick={handleRefreshClick}
              disabled={refreshing}
            >
              {refreshing ? <span className="bo-spin" /> : "🔄"} Refresh
            </button>
          </div>
        </div>

        {loadError && <div className="bo-banner">⚠️ {loadError}</div>}

        {isCleared && !loadError && (
          <div className="bo-banner notice">
            ℹ️ Business Overview has been cleared. Your customers and their
            transaction history are untouched — press Refresh to load current data.
          </div>
        )}

        <div className="bo-grid">
          {cards.map((card) =>
            initialLoading ? (
              <div key={card.key} className="bo-card">
                <div className="bo-skeleton" style={{ width: 38, height: 38, borderRadius: 10, marginBottom: 10 }} />
                <div className="bo-skeleton" style={{ width: "70%", height: 12, marginBottom: 8 }} />
                <div className="bo-skeleton" style={{ width: "50%", height: 22 }} />
              </div>
            ) : (
              <div key={card.key} className="bo-card">
                <div className="bo-card-icon" style={{ background: card.bg }}>
                  {card.icon}
                </div>
                <div className="bo-card-title">{card.title}</div>
                <div className="bo-card-value" style={{ color: card.accent }}>
                  {card.value}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {showClearModal && (
        <div className="bo-modal-overlay" onClick={closeClearModal}>
          <div className="bo-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="bo-modal-title">Clear Business Overview?</h3>
            <p className="bo-modal-text">
              This will clear the Business Overview report data only.
            </p>
            <div className="bo-modal-safe">
              ✅ Customers and customer transaction history will NOT be deleted.
            </div>

            <p className="bo-modal-text" style={{ marginTop: 10 }}>
              Enter your password to confirm.
            </p>
            <input
              type="password"
              className="bo-input"
              placeholder="Password"
              value={clearPassword}
              onChange={(e) => setClearPassword(e.target.value)}
              disabled={clearing}
            />

            {clearError && (
              <div className="bo-banner" style={{ marginTop: 12, marginBottom: 0 }}>
                {clearError}
              </div>
            )}

            <div className="bo-modal-btn-row">
              <button className="bo-btn bo-btn-ghost" onClick={closeClearModal} disabled={clearing}>
                Cancel
              </button>
              <button
                className="bo-btn bo-btn-primary-modal"
                onClick={handleConfirmClear}
                disabled={clearing}
              >
                {clearing ? <span className="bo-spin" /> : "🗑️"} Clear Data
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}

export default BusinessOverview;