import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAdminDpsById,
  approveDpsApplication,
  rejectDpsApplication,
} from "../../services/adminService";
import {
  getDpsStatusMeta,
  formatTaka,
  formatDate,
  formatDateTime,
  DPS_STATUS,
} from "../../utils/dpsUtils";

export default function AdminDPSDetails() {
  const { shopId, id: dpsId } = useParams();
  const navigate = useNavigate();

  const [dps, setDps] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    loadDps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId, dpsId]);

  async function loadDps() {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminDpsById(shopId, dpsId);
      setDps(data);
    } catch (err) {
      console.error("Load admin DPS details failed:", err);
      setError("তথ্য লোড করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    setActionError("");
    setActionLoading(true);
    try {
      await approveDpsApplication(shopId, dpsId);
      await loadDps();
    } catch (err) {
      console.error("Approve failed:", err);
      setActionError((err && err.message) || "অনুমোদন করতে সমস্যা হয়েছে।");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      setActionError("বাতিলের কারণ অবশ্যই লিখতে হবে।");
      return;
    }
    setActionError("");
    setActionLoading(true);
    try {
      await rejectDpsApplication(shopId, dpsId, rejectReason.trim());
      setShowRejectBox(false);
      await loadDps();
    } catch (err) {
      console.error("Reject failed:", err);
      setActionError((err && err.message) || "বাতিল করতে সমস্যা হয়েছে।");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return <div style={styles.centerMessage}>লোড হচ্ছে...</div>;
  }

  if (error || !dps) {
    return (
      <div style={styles.centerMessage}>
        {error || "এই আবেদন পাওয়া যায়নি।"}
        <br />
        <button style={styles.backLink} onClick={() => navigate("/admin/dps")}>
          ← তালিকায় ফিরে যান
        </button>
      </div>
    );
  }

  const meta = getDpsStatusMeta(dps.status);
  const customer = dps.customer || {};
  const nominee = dps.nominee || {};
  const plan = dps.plan || {};
  const review = dps.review || {};
  const consent = dps.consent || {};
  const isPending = dps.status === DPS_STATUS.PENDING;

  return (
    <div style={styles.pageWrapper}>
      <button style={styles.backButton} onClick={() => navigate("/admin/dps")}>
        ← তালিকায় ফিরে যান
      </button>

      <div style={styles.headerCard}>
        <div style={{ ...styles.statusBadge, color: meta.color, backgroundColor: meta.bg }}>
          {meta.label}
        </div>
        <div style={styles.customerNameBig}>{customer.name || "নাম নেই"}</div>
        <div style={styles.subMuted}>দোকান আইডি: {shopId}</div>
        <div style={styles.subMuted}>আবেদন: {formatDateTime(dps.createdAt)}</div>
      </div>

      {review.status && review.status !== "pending" && (
        <div style={styles.reviewedBox}>
          <strong>{review.status === "approved" ? "অনুমোদন করেছেন" : "বাতিল করেছেন"}:</strong>{" "}
          {review.reviewedBy} • {formatDateTime(review.reviewedAt)}
          {review.rejectionReason && (
            <div style={{ marginTop: "4px" }}>কারণ: {review.rejectionReason}</div>
          )}
        </div>
      )}

      <Section title="সম্মতি">
        <InfoRow label="সম্মতির সময়" value={formatDateTime(consent.agreedAt)} />
      </Section>

      <Section title="গ্রাহকের তথ্য">
        <InfoRow label="নাম" value={customer.name} />
        <InfoRow label="মোবাইল" value={customer.phone} />
        <InfoRow label="ঠিকানা" value={customer.address || "—"} />
        <InfoRow label="পরিচয়পত্র" value={`${customer.nidType || ""} • ${customer.nidNumber || ""}`} />
        <DocThumbRow docs={customer.documents} onPreview={setPreviewImage} />
      </Section>

      <Section title="নমিনির তথ্য">
        <InfoRow label="নাম" value={nominee.name} />
        <InfoRow label="সম্পর্ক" value={nominee.relation} />
        <InfoRow label="মোবাইল" value={nominee.phone || "—"} />
        <InfoRow label="পরিচয়পত্র" value={`${nominee.nidType || ""} • ${nominee.nidNumber || ""}`} />
        <DocThumbRow docs={nominee.documents} onPreview={setPreviewImage} />
      </Section>

      <Section title="DPS প্ল্যান">
        <InfoRow label="মাসিক কিস্তি" value={formatTaka(plan.installmentAmount)} />
        <InfoRow label="মেয়াদ" value={`${plan.durationMonths} মাস`} />
        <InfoRow label="কিস্তির তারিখ" value={`প্রতি মাসের ${plan.installmentDay} তারিখ`} />
        <InfoRow label="শুরুর তারিখ" value={formatDate(plan.startDate)} />
        <InfoRow label="মোট লক্ষ্যমাত্রা" value={formatTaka(Number(plan.installmentAmount || 0) * Number(plan.durationMonths || 0))} />
      </Section>

      {actionError && <div style={styles.errorBox}>{actionError}</div>}

      {isPending && (
        <div style={styles.actionCard}>
          {!showRejectBox ? (
            <div style={styles.actionButtonRow}>
              <button style={styles.approveButton} disabled={actionLoading} onClick={handleApprove}>
                {actionLoading ? "..." : "✓ অনুমোদন করুন"}
              </button>
              <button
                style={styles.rejectButton}
                disabled={actionLoading}
                onClick={() => setShowRejectBox(true)}
              >
                ✕ বাতিল করুন
              </button>
            </div>
          ) : (
            <div>
              <label style={styles.fieldLabel}>বাতিলের কারণ *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={styles.textarea}
                rows={3}
                placeholder="যেমন: NID ছবি স্পষ্ট নয়, আবার আপলোড করতে বলুন।"
              />
              <div style={styles.actionButtonRow}>
                <button style={styles.rejectButton} disabled={actionLoading} onClick={handleReject}>
                  {actionLoading ? "..." : "বাতিল নিশ্চিত করুন"}
                </button>
                <button
                  style={styles.cancelButton}
                  disabled={actionLoading}
                  onClick={() => {
                    setShowRejectBox(false);
                    setRejectReason("");
                    setActionError("");
                  }}
                >
                  বাতিল করুন (ফিরে যান)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {previewImage && (
        <div style={styles.previewOverlay} onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="Document preview" style={styles.previewImageFull} />
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={styles.infoValue}>{value || "—"}</span>
    </div>
  );
}

function DocThumbRow({ docs, onPreview }) {
  if (!docs) return null;
  return (
    <div style={styles.docThumbRow}>
      {docs.nidFront && (
        <img src={docs.nidFront} alt="NID front" style={styles.docThumb} onClick={() => onPreview(docs.nidFront)} />
      )}
      {docs.nidBack && (
        <img src={docs.nidBack} alt="NID back" style={styles.docThumb} onClick={() => onPreview(docs.nidBack)} />
      )}
    </div>
  );
}

const styles = {
  pageWrapper: { padding: "16px", maxWidth: "600px", margin: "0 auto", paddingBottom: "60px" },
  centerMessage: { padding: "40px 16px", textAlign: "center", color: "#64748B" },
  backButton: {
    border: "none",
    background: "transparent",
    color: "#1A56C4",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
    marginBottom: "12px",
  },
  backLink: {
    border: "none",
    background: "transparent",
    color: "#1A56C4",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "10px",
  },
  headerCard: {
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: "16px",
    padding: "18px",
    marginBottom: "12px",
  },
  statusBadge: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: 700,
    padding: "6px 10px",
    borderRadius: "20px",
    marginBottom: "8px",
  },
  customerNameBig: { fontSize: "18px", fontWeight: 700, color: "#0F172A" },
  subMuted: { fontSize: "11px", color: "#94A3B8", marginTop: "2px" },
  reviewedBox: {
    background: "#F1F5F9",
    color: "#334155",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "12px",
    marginBottom: "12px",
  },
  section: {
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: "14px",
    padding: "16px",
    marginBottom: "14px",
  },
  sectionTitle: { fontSize: "14px", fontWeight: 700, color: "#0F3D91", marginBottom: "10px" },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    padding: "6px 0",
    borderBottom: "1px solid #F1F5F9",
  },
  infoLabel: { color: "#64748B" },
  infoValue: { color: "#0F172A", fontWeight: 600, textAlign: "right", maxWidth: "60%" },
  docThumbRow: { display: "flex", gap: "10px", marginTop: "10px" },
  docThumb: {
    width: "110px",
    height: "72px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "1px solid #E2E8F0",
    cursor: "pointer",
  },
  errorBox: {
    background: "#FEF2F2",
    color: "#DC2626",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    marginBottom: "12px",
  },
  actionCard: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: "14px",
    padding: "16px",
  },
  actionButtonRow: { display: "flex", gap: "10px", marginTop: "8px" },
  approveButton: {
    flex: 1,
    padding: "13px",
    borderRadius: "10px",
    border: "none",
    background: "#16A34A",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  rejectButton: {
    flex: 1,
    padding: "13px",
    borderRadius: "10px",
    border: "none",
    background: "#DC2626",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  cancelButton: {
    flex: 1,
    padding: "13px",
    borderRadius: "10px",
    border: "1px solid #CBD5E1",
    background: "#fff",
    color: "#475569",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  fieldLabel: { display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px", fontWeight: 600 },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #CBD5E1",
    fontSize: "13px",
    boxSizing: "border-box",
    resize: "vertical",
    fontFamily: "inherit",
  },
  previewOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.85)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  previewImageFull: { maxWidth: "100%", maxHeight: "90vh", borderRadius: "8px" },
};