import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { subscribeToAllDpsApplications } from "../../services/adminService";
import { getDpsStatusMeta, formatTaka, formatDateTime, DPS_STATUS } from "../../utils/dpsUtils";

const FILTERS = [
  { value: "all", label: "সব" },
  { value: DPS_STATUS.PENDING, label: "অপেক্ষমাণ" },
  { value: DPS_STATUS.ACTIVE, label: "সক্রিয়" },
  { value: DPS_STATUS.MATURED, label: "মেয়াদপূর্ণ" },
  { value: DPS_STATUS.REJECTED, label: "বাতিল" },
];

export default function AdminDPS() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [allDps, setAllDps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");

  const activeFilter = searchParams.get("status") || "all";

  useEffect(() => {
    setLoading(true);
    setError("");

    const unsubscribe = subscribeToAllDpsApplications(
      (list) => {
        setAllDps(list);
        setLoading(false);
      },
      (err) => {
        console.error("Admin DPS list failed:", err);
        setError("তালিকা লোড করতে সমস্যা হয়েছে।");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  function handleFilterChange(value) {
    if (value === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ status: value });
    }
  }

  async function handleLogout() {
    await signOut(auth);
    navigate("/admin/login");
  }

  const filteredList = useMemo(() => {
    let list = allDps;

    if (activeFilter !== "all") {
      list = list.filter((d) => d.status === activeFilter);
    }

    const term = searchText.trim().toLowerCase();
    if (term) {
      list = list.filter((d) => {
        const name = (d.customer && d.customer.name) || "";
        const phone = (d.customer && d.customer.phone) || "";
        const shopId = d.shopId || "";
        return (
          name.toLowerCase().includes(term) ||
          phone.toLowerCase().includes(term) ||
          shopId.toLowerCase().includes(term)
        );
      });
    }

    return list;
  }, [allDps, activeFilter, searchText]);

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.topBar}>
        <button style={styles.backButton} onClick={() => navigate("/admin")}>
          ← Dashboard
        </button>
        <button style={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </div>

      <h1 style={styles.heading}>সব DPS আবেদন</h1>

      <input
        type="text"
        placeholder="নাম, ফোন বা দোকান আইডি দিয়ে খুঁজুন..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={styles.searchInput}
      />

      <div style={styles.filterRow}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            style={{
              ...styles.filterChip,
              ...(activeFilter === f.value ? styles.filterChipActive : {}),
            }}
            onClick={() => handleFilterChange(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}
      {loading && <div style={styles.emptyState}>লোড হচ্ছে...</div>}

      {!loading && filteredList.length === 0 && (
        <div style={styles.emptyState}>কোনো আবেদন পাওয়া যায়নি।</div>
      )}

      {!loading &&
        filteredList.map((dps) => {
          const meta = getDpsStatusMeta(dps.status);
          return (
            <div
              key={`${dps.shopId}_${dps.id}`}
              style={styles.row}
              onClick={() => navigate(`/admin/dps/${dps.shopId}/${dps.id}`)}
            >
              <div style={styles.rowLeft}>
                <div style={styles.rowName}>{(dps.customer && dps.customer.name) || "নাম নেই"}</div>
                <div style={styles.rowSub}>
                  {dps.plan
                    ? `${formatTaka(dps.plan.installmentAmount)} / মাস • ${dps.plan.durationMonths} মাস`
                    : "—"}
                </div>
                <div style={styles.rowMuted}>
                  দোকান: {dps.shopId} • {formatDateTime(dps.createdAt)}
                </div>
              </div>
              <div style={{ ...styles.statusBadge, color: meta.color, backgroundColor: meta.bg }}>
                {meta.label}
              </div>
            </div>
          );
        })}
    </div>
  );
}

const styles = {
  pageWrapper: { padding: "16px", maxWidth: "640px", margin: "0 auto", paddingBottom: "48px" },
  topBar: { display: "flex", justifyContent: "space-between", marginBottom: "12px" },
  backButton: {
    border: "none",
    background: "transparent",
    color: "#1A56C4",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
  },
  logoutButton: {
    border: "1px solid #E2E8F0",
    background: "#fff",
    color: "#475569",
    fontSize: "12px",
    fontWeight: 600,
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  heading: { fontSize: "18px", fontWeight: 700, color: "#0F172A", marginBottom: "12px" },
  searchInput: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "10px",
    border: "1px solid #CBD5E1",
    fontSize: "13px",
    boxSizing: "border-box",
    marginBottom: "10px",
  },
  filterRow: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" },
  filterChip: {
    border: "1px solid #E2E8F0",
    background: "#fff",
    color: "#475569",
    fontSize: "12px",
    fontWeight: 600,
    padding: "7px 12px",
    borderRadius: "20px",
    cursor: "pointer",
  },
  filterChipActive: {
    background: "#0F172A",
    color: "#fff",
    borderColor: "#0F172A",
  },
  errorBox: {
    background: "#FEF2F2",
    color: "#DC2626",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    marginBottom: "12px",
  },
  emptyState: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: "13px",
    padding: "24px 12px",
    background: "#F8FAFC",
    borderRadius: "12px",
  },
  row: {
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: "14px",
    padding: "14px",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    gap: "8px",
  },
  rowLeft: { flex: 1, minWidth: 0 },
  rowName: { fontSize: "14px", fontWeight: 600, color: "#0F172A" },
  rowSub: { fontSize: "12px", color: "#475569", marginTop: "2px" },
  rowMuted: { fontSize: "11px", color: "#94A3B8", marginTop: "2px" },
  statusBadge: {
    fontSize: "11px",
    fontWeight: 700,
    padding: "6px 10px",
    borderRadius: "20px",
    whiteSpace: "nowrap",
  },
};