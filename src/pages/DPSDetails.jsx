import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  subscribeToDps,
  subscribeToInstallments,
  collectInstallment,
} from "../services/dpsService";
import {
  getDpsStatusMeta,
  getInstallmentStatusMeta,
  formatTaka,
  formatDate,
  formatDateTime,
  DPS_STATUS,
} from "../utils/dpsUtils";

export default function DPSDetails() {
  const { id: dpsId } = useParams();
  const navigate = useNavigate();
  const shopId = auth.currentUser?.uid;

  const [dps, setDps] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collectingId, setCollectingId] = useState(null);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (!shopId || !dpsId) return;

    setLoading(true);
    const unsubscribeDps = subscribeToDps(shopId, dpsId, (data) => {
      setDps(data);
      setLoading(false);
    });
    const unsubscribeInstallments = subscribeToInstallments(shopId, dpsId, (list) => {
      setInstallments(list);
    });

    return () => {
      unsubscribeDps();
      unsubscribeInstallments();
    };
  }, [shopId, dpsId]);

  async function handleCollect(installment) {
    if (!shopId || !dpsId) return;
    setError("");
    setCollectingId(installment.id);
    try {
      await collectInstallment(shopId, dpsId, installment.id, "Cash");
    } catch (err) {
      console.error("Collect installment failed:", err);
      setError(
        (err && err.message) || "কিস্তি সংগ্রহ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।"
      );
    } finally {
      setCollectingId(null);
    }
  }

  if (loading) {
    return <div style={styles.centerMessage}>লোড হচ্ছে...</div>;
  }

  if (!dps) {
    return (
      <div style={styles.centerMessage}>
        এই DPS পাওয়া যায়নি।
        <br />
        <button style={styles.backLink} onClick={() => navigate("/dps")}>
          ← Savings-এ ফিরে যান
        </button>
      </div>
    );
  }

  const meta = getDpsStatusMeta(dps.status);
  const payment = dps.payment || {};
  const plan = dps.plan || {};
  const customer = dps.customer || {};
  const nominee = dps.nominee || {};

  const totalTarget = Number(plan.installmentAmount || 0) * Number(plan.durationMonths || 0);
  const progressPercent =
    totalTarget > 0 ? Math.min(100, Math.round((Number(payment.totalPaid || 0) / totalTarget) * 100)) : 0;

  return (
    <div style={styles.pageWrapper}>
      <button style={styles.backButton} onClick={() => navigate("/dps")}>
        ← Savings-এ ফিরে যান
      </button>

      {/* Status header */}
      <div style={styles.headerCard}>
        <div
          style={{
            ...styles.statusBadge,
            color: meta.color,
            backgroundColor: meta.bg,
          }}
        >
          {meta.label}
        </div>
        <div style={styles.customerNameBig}>{customer.name || "নাম নেই"}</div>
        <div style={styles.subMuted}>আবেদন: {formatDateTime(dps.createdAt)}</div>
      </div>

      {/* Rejected reason */}
      {dps.status === DPS_STATUS.REJECTED && dps.review && dps.review.rejectionReason && (
        <div style={styles.rejectedBox}>
          <strong>বাতিলের কারণ:</strong> {dps.review.rejectionReason}
        </div>
      )}

      {/* Pending notice */}
      {dps.status === DPS_STATUS.PENDING && (
        <div style={styles.pendingBox}>
          এই আবেদনটি Admin যাচাই করছেন। অনুমোদন হলে এখানে notification আসবে।
        </div>
      )}

      {error && <div style={styles.errorBox}>{error}</div>}

      {/* Progress / balance */}
      {(dps.status === DPS_STATUS.ACTIVE || dps.status === DPS_STATUS.MATURED) && (
        <div style={styles.progressCard}>
          <div style={styles.progressTopRow}>
            <div>
              <div style={styles.progressLabel}>জমা হয়েছে</div>
              <div style={styles.progressAmount}>{formatTaka(payment.totalPaid)}</div>
            </div>
            <div style={styles.progressTargetWrap}>
              <div style={styles.progressLabel}>লক্ষ্যমাত্রা</div>
              <div style={styles.progressTarget}>{formatTaka(totalTarget)}</div>
            </div>
          </div>
          <div style={styles.progressBarTrack}>
            <div style={{ ...styles.progressBarFill, width: `${progressPercent}%` }} />
          </div>
          <div style={styles.progressStatsRow}>
            <span>{payment.paidInstallments || 0} / {plan.totalInstallments || plan.durationMonths} কিস্তি পরিশোধিত</span>
            <span>{progressPercent}%</span>
          </div>
        </div>
      )}

      {/* Plan info */}
      <Section title="DPS প্ল্যান">
        <InfoRow label="মাসিক কিস্তি" value={formatTaka(plan.installmentAmount)} />
        <InfoRow label="মেয়াদ" value={`${plan.durationMonths} মাস`} />
        <InfoRow label="কিস্তির তারিখ" value={`প্রতি মাসের ${plan.installmentDay} তারিখ`} />
        <InfoRow label="শুরুর তারিখ" value={formatDate(plan.startDate)} />
        <InfoRow label="মেয়াদপূর্তি" value={formatDate(plan.maturityDate) || "Admin অনুমোদনের পর নির্ধারিত হবে"} />
      </Section>

      {/* Customer info */}
      <Section title="গ্রাহকের তথ্য">
        <InfoRow label="নাম" value={customer.name} />
        <InfoRow label="মোবাইল" value={customer.phone} />
        <InfoRow label="ঠিকানা" value={customer.address || "—"} />
        <InfoRow label="পরিচয়পত্র" value={`${customer.nidType} • ${customer.nidNumber}`} />
        <DocThumbRow
          docs={customer.documents}
          onPreview={setPreviewImage}
        />
      </Section>

      {/* Nominee info */}
      <Section title="নমিনির তথ্য">
        <InfoRow label="নাম" value={nominee.name} />
        <InfoRow label="সম্পর্ক" value={nominee.relation} />
        <InfoRow label="মোবাইল" value={nominee.phone || "—"} />
        <InfoRow label="পরিচয়পত্র" value={`${nominee.nidType} • ${nominee.nidNumber}`} />
        <DocThumbRow
          docs={nominee.documents}
          onPreview={setPreviewImage}
        />
      </Section>

      {/* Installment schedule */}
      {installments.length > 0 && (
        <Section title="কিস্তির সময়সূচি">
          {installments.map((inst) => {
            const instMeta = getInstallmentStatusMeta(inst.status);
            const isNextDue =
              inst.status === "pending" &&
              installments.find((i) => i.status === "pending")?.id === inst.id;
            return (
              <div key={inst.id} style={styles.installmentRow}>
                <div>
                  <div style={styles.installmentNumber}>কিস্তি #{inst.number}</div>
                  <div style={styles.subMuted}>{formatDate(inst.dueDate)}</div>
                </div>
                <div style={styles.installmentRight}>
                  <div style={styles.installmentAmount}>{formatTaka(inst.amount)}</div>
                  <div
                    style={{
                      ...styles.smallBadge,
                      color: instMeta.color,
                      backgroundColor: instMeta.bg,
                    }}
                  >
                    {isNextDue ? "পরবর্তী কিস্তি" : instMeta.label}
                  </div>
                </div>
                {dps.status === DPS_STATUS.ACTIVE && inst.status === "pending" && (
                  <button
                    style={styles.collectButton}
                    disabled={collectingId === inst.id}
                    onClick={() => handleCollect(inst)}
                  >
                    {collectingId === inst.id ? "..." : "সংগ্রহ করা হয়েছে"}
                  </button>
                )}
              </div>
            );
          })}
        </Section>
      )}

      {/* Image preview modal */}
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
        <img
          src={docs.nidFront}
          alt="NID front"
          style={styles.docThumb}
          onClick={() => onPreview(docs.nidFront)}
        />
      )}
      {docs.nidBack && (
        <img
          src={docs.nidBack}
          alt="NID back"
          style={styles.docThumb}
          onClick={() => onPreview(docs.nidBack)}
        />
      )}
    </div>
  );
}

const styles = {
  pageWrapper: { padding: "16px", maxWidth: "560px", margin: "0 auto", paddingBottom: "48px" },
  centerMessage: { padding: "40px 16px", textAlign: "center", color: "#64748B" },
  backButton: {
    border: "none",
    background: "transparent",
    color: "#1A56C4",
    fontSize: "14px",
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
  rejectedBox: {
    background: "#FEF2F2",
    color: "#B91C1C",
    padding: "12px 14px",
    borderRadius: "12px",
    fontSize: "13px",
    marginBottom: "12px",
  },
  pendingBox: {
    background: "#FFFBEB",
    color: "#92400E",
    padding: "12px 14px",
    borderRadius: "12px",
    fontSize: "13px",
    marginBottom: "12px",
  },
  errorBox: {
    background: "#FEF2F2",
    color: "#DC2626",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    marginBottom: "12px",
  },
  progressCard: {
    background: "linear-gradient(135deg, #0F3D91 0%, #1A56C4 100%)",
    borderRadius: "16px",
    padding: "18px",
    color: "#fff",
    marginBottom: "16px",
  },
  progressTopRow: { display: "flex", justifyContent: "space-between", marginBottom: "10px" },
  progressTargetWrap: { textAlign: "right" },
  progressLabel: { fontSize: "11px", opacity: 0.85 },
  progressAmount: { fontSize: "22px", fontWeight: 700 },
  progressTarget: { fontSize: "16px", fontWeight: 600 },
  progressBarTrack: {
    height: "8px",
    background: "rgba(255,255,255,0.25)",
    borderRadius: "8px",
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", background: "#fff", borderRadius: "8px" },
  progressStatsRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    marginTop: "8px",
    opacity: 0.9,
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
    width: "90px",
    height: "60px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "1px solid #E2E8F0",
    cursor: "pointer",
  },
  installmentRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #F1F5F9",
    flexWrap: "wrap",
    gap: "8px",
  },
  installmentNumber: { fontSize: "13px", fontWeight: 600, color: "#0F172A" },
  installmentRight: { textAlign: "right" },
  installmentAmount: { fontSize: "13px", fontWeight: 700, color: "#0F172A" },
  smallBadge: {
    fontSize: "10px",
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: "12px",
    marginTop: "4px",
    display: "inline-block",
  },
  collectButton: {
    border: "1px solid #16A34A",
    background: "#F0FDF4",
    color: "#16A34A",
    fontSize: "11px",
    fontWeight: 700,
    padding: "6px 10px",
    borderRadius: "8px",
    cursor: "pointer",
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
  previewImageFull: {
    maxWidth: "100%",
    maxHeight: "90vh",
    borderRadius: "8px",
  },
};