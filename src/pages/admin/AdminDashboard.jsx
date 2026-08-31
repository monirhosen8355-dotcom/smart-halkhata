import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { subscribeToAdminDashboardStats } from "../../services/adminService";
import { formatTaka } from "../../utils/dpsUtils";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    pending: 0,
    active: 0,
    rejected: 0,
    matured: 0,
    total: 0,
    totalDeposited: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    const unsubscribe = subscribeToAdminDashboardStats(
      (data) => {
        setStats(data);
        setLoading(false);
      },
      (err) => {
        console.error("Admin dashboard stats failed:", err);
        setError("তথ্য লোড করতে সমস্যা হয়েছে।");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  async function handleLogout() {
    await signOut(auth);
    navigate("/admin/login");
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.topBar}>
        <div>
          <div style={styles.topBarTitle}>Admin Dashboard</div>
          <div style={styles.topBarSubtitle}>Smart Halkhata — DPS Overview</div>
        </div>
        <button style={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {/* Total deposited hero card */}
      <div style={styles.heroCard}>
        <div style={styles.heroLabel}>মোট জমাকৃত টাকা (সব দোকান)</div>
        <div style={styles.heroAmount}>{loading ? "..." : formatTaka(stats.totalDeposited)}</div>
      </div>

      {/* Stat grid */}
      <div style={styles.statGrid}>
        <StatCard label="মোট আবেদন" value={stats.total} color="#334155" loading={loading} />
        <StatCard label="অপেক্ষমাণ" value={stats.pending} color="#D97706" loading={loading} onClick={() => navigate("/admin/dps?status=pending_admin_approval")} />
        <StatCard label="সক্রিয়" value={stats.active} color="#16A34A" loading={loading} onClick={() => navigate("/admin/dps?status=active")} />
        <StatCard label="মেয়াদপূর্ণ" value={stats.matured} color="#2563EB" loading={loading} onClick={() => navigate("/admin/dps?status=matured")} />
        <StatCard label="বাতিল" value={stats.rejected} color="#DC2626" loading={loading} onClick={() => navigate("/admin/dps?status=rejected")} />
      </div>

      <button style={styles.viewAllButton} onClick={() => navigate("/admin/dps")}>
        সব DPS আবেদন দেখুন →
      </button>

      {stats.pending > 0 && !loading && (
        <div style={styles.pendingAlert} onClick={() => navigate("/admin/dps?status=pending_admin_approval")}>
          ⚠️ {stats.pending}টি আবেদন অনুমোদনের অপেক্ষায় আছে — এখনই দেখুন
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, loading, onClick }) {
  return (
    <div style={{ ...styles.statCard, cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
      <div style={{ ...styles.statCardValue, color }}>{loading ? "..." : value}</div>
      <div style={styles.statCardLabel}>{label}</div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    padding: "16px",
    maxWidth: "640px",
    margin: "0 auto",
    paddingBottom: "48px",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },
  topBarTitle: { fontSize: "19px", fontWeight: 700, color: "#0F172A" },
  topBarSubtitle: { fontSize: "12px", color: "#64748B" },
  logoutButton: {
    border: "1px solid #E2E8F0",
    background: "#fff",
    color: "#475569",
    fontSize: "12px",
    fontWeight: 600,
    padding: "8px 14px",
    borderRadius: "10px",
    cursor: "pointer",
  },
  errorBox: {
    background: "#FEF2F2",
    color: "#DC2626",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    marginBottom: "14px",
  },
  heroCard: {
    background: "linear-gradient(135deg, #0F172A 0%, #334155 100%)",
    borderRadius: "18px",
    padding: "22px 20px",
    color: "#fff",
    marginBottom: "16px",
  },
  heroLabel: { fontSize: "12px", opacity: 0.8 },
  heroAmount: { fontSize: "30px", fontWeight: 700, marginTop: "4px" },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "16px",
  },
  statCard: {
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: "14px",
    padding: "16px",
    textAlign: "center",
  },
  statCardValue: { fontSize: "24px", fontWeight: 700 },
  statCardLabel: { fontSize: "12px", color: "#64748B", marginTop: "4px" },
  viewAllButton: {
    width: "100%",
    padding: "13px",
    borderRadius: "12px",
    border: "1px solid #1A56C4",
    background: "#EFF6FF",
    color: "#1A56C4",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: "14px",
  },
  pendingAlert: {
    background: "#FFFBEB",
    border: "1px solid #FDE68A",
    color: "#92400E",
    padding: "12px 14px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "center",
  },
};