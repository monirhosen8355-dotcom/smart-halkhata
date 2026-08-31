import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { createDpsApplication } from "../services/dpsService";
import {
  NID_TYPES,
  NOMINEE_RELATIONS,
  DPS_DURATIONS_MONTHS,
  isValidPhone,
  isValidNidNumber,
  isAllowedImageFile,
  previewInstallmentSchedule,
  calculateMaturityDate,
  calculateTotalTarget,
  formatTaka,
  formatDate,
} from "../utils/dpsUtils";

const CONSENT_TEXT =
  "আমি নিশ্চিত করছি যে উপরে দেওয়া তথ্য সঠিক এবং আমি গ্রাহক ও নমিনির সম্মতিতে এই আবেদন জমা দিচ্ছি। " +
  "আমি বুঝি যে Admin যাচাই ও অনুমোদনের পরই এই DPS সক্রিয় হবে।";

const todayIsoDate = () => new Date().toISOString().slice(0, 10);

export default function DPSCreate() {
  const navigate = useNavigate();
  const shopId = auth.currentUser?.uid;

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    nidType: NID_TYPES[0],
    nidNumber: "",
  });

  const [nominee, setNominee] = useState({
    name: "",
    relation: NOMINEE_RELATIONS[0],
    phone: "",
    nidType: NID_TYPES[0],
    nidNumber: "",
  });

  const [plan, setPlan] = useState({
    installmentAmount: "",
    durationMonths: DPS_DURATIONS_MONTHS[0],
    installmentDay: "5",
    startDate: todayIsoDate(),
  });

  const [files, setFiles] = useState({
    customerNidFront: null,
    customerNidBack: null,
    nomineeNidFront: null,
    nomineeNidBack: null,
  });

  const [consentChecked, setConsentChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  const schedulePreview = useMemo(() => previewInstallmentSchedule(plan), [plan]);
  const maturityDate = useMemo(() => calculateMaturityDate(plan), [plan]);
  const totalTarget = useMemo(() => calculateTotalTarget(plan), [plan]);

  function handleFileChange(key, fileList) {
    const file = fileList && fileList[0];
    if (!file) return;

    if (!isAllowedImageFile(file)) {
      setErrors((prev) => ({
        ...prev,
        [key]: "শুধু JPG/PNG/WEBP ছবি, সর্বোচ্চ ৫ মেগাবাইট।",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, [key]: null }));
    setFiles((prev) => ({ ...prev, [key]: file }));
  }

  function validate() {
    const newErrors = {};

    if (!customer.name.trim()) newErrors.customerName = "গ্রাহকের নাম দিন।";
    if (!isValidPhone(customer.phone)) newErrors.customerPhone = "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।";
    if (!isValidNidNumber(customer.nidNumber)) newErrors.customerNid = "সঠিক NID/জন্মনিবন্ধন নম্বর দিন।";

    if (!nominee.name.trim()) newErrors.nomineeName = "নমিনির নাম দিন।";
    if (!isValidNidNumber(nominee.nidNumber)) newErrors.nomineeNid = "সঠিক NID/জন্মনিবন্ধন নম্বর দিন।";
    if (nominee.phone && !isValidPhone(nominee.phone)) newErrors.nomineePhone = "সঠিক মোবাইল নম্বর দিন অথবা খালি রাখুন।";

    const amount = Number(plan.installmentAmount);
    if (!amount || amount <= 0) newErrors.installmentAmount = "সঠিক মাসিক কিস্তির পরিমাণ দিন।";

    const day = Number(plan.installmentDay);
    if (!day || day < 1 || day > 28) newErrors.installmentDay = "১ থেকে ২৮-এর মধ্যে একটি তারিখ দিন।";

    if (!plan.startDate) newErrors.startDate = "শুরুর তারিখ দিন।";

    if (!consentChecked) newErrors.consent = "আবেদন জমা দেওয়ার আগে সম্মতি প্রয়োজন।";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!shopId) {
      setFormError("আপনি লগইন করা নেই। অনুগ্রহ করে আবার লগইন করুন।");
      return;
    }

    if (!validate()) {
      setFormError("অনুগ্রহ করে চিহ্নিত ঘরগুলো ঠিক করুন।");
      return;
    }

    setSubmitting(true);
    try {
      const dpsId = await createDpsApplication(shopId, {
  customer,
  nominee,
  plan,
  consent: {
    agreedAt: new Date(),
    agreedText: CONSENT_TEXT,
  },
});
      navigate(`/dps/${dpsId}`);
    } catch (err) {
      console.error("DPS application submit failed:", err);
      setFormError(
        err && err.message
          ? err.message
          : "আবেদন জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.pageWrapper}>
      <button style={styles.backButton} onClick={() => navigate(-1)}>
        ← পিছনে
      </button>
      <h1 style={styles.heading}>নতুন DPS আবেদন</h1>

      {formError && <div style={styles.errorBox}>{formError}</div>}

      <form onSubmit={handleSubmit}>
        {/* ---------------- CUSTOMER INFO ---------------- */}
        <Section title="গ্রাহকের তথ্য">
          <TextField
            label="নাম *"
            value={customer.name}
            onChange={(v) => setCustomer((p) => ({ ...p, name: v }))}
            error={errors.customerName}
          />
          <TextField
            label="মোবাইল নম্বর *"
            value={customer.phone}
            onChange={(v) => setCustomer((p) => ({ ...p, phone: v }))}
            error={errors.customerPhone}
            placeholder="01XXXXXXXXX"
          />
          <TextField
            label="ঠিকানা"
            value={customer.address}
            onChange={(v) => setCustomer((p) => ({ ...p, address: v }))}
          />
          <SelectField
            label="পরিচয়পত্রের ধরন *"
            value={customer.nidType}
            options={NID_TYPES}
            onChange={(v) => setCustomer((p) => ({ ...p, nidType: v }))}
          />
          <TextField
            label="NID/জন্মনিবন্ধন নম্বর *"
            value={customer.nidNumber}
            onChange={(v) => setCustomer((p) => ({ ...p, nidNumber: v }))}
            error={errors.customerNid}
          />
        </Section>

        {/* ---------------- NOMINEE INFO ---------------- */}
        <Section title="নমিনির তথ্য">
          <TextField
            label="নাম *"
            value={nominee.name}
            onChange={(v) => setNominee((p) => ({ ...p, name: v }))}
            error={errors.nomineeName}
          />
          <SelectField
            label="সম্পর্ক *"
            value={nominee.relation}
            options={NOMINEE_RELATIONS}
            onChange={(v) => setNominee((p) => ({ ...p, relation: v }))}
          />
          <TextField
            label="মোবাইল নম্বর"
            value={nominee.phone}
            onChange={(v) => setNominee((p) => ({ ...p, phone: v }))}
            error={errors.nomineePhone}
            placeholder="01XXXXXXXXX (ঐচ্ছিক)"
          />
          <SelectField
            label="পরিচয়পত্রের ধরন *"
            value={nominee.nidType}
            options={NID_TYPES}
            onChange={(v) => setNominee((p) => ({ ...p, nidType: v }))}
          />
          <TextField
            label="NID/জন্মনিবন্ধন নম্বর *"
            value={nominee.nidNumber}
            onChange={(v) => setNominee((p) => ({ ...p, nidNumber: v }))}
            error={errors.nomineeNid}
          />
        </Section>

        {/* ---------------- DPS PLAN ---------------- */}
        <Section title="DPS প্ল্যান">
          <TextField
            label="মাসিক কিস্তি (৳) *"
            value={plan.installmentAmount}
            onChange={(v) => setPlan((p) => ({ ...p, installmentAmount: v }))}
            error={errors.installmentAmount}
            type="number"
            placeholder="যেমন: 1000"
          />
          <SelectField
            label="মেয়াদ (মাস) *"
            value={String(plan.durationMonths)}
            options={DPS_DURATIONS_MONTHS.map(String)}
            onChange={(v) => setPlan((p) => ({ ...p, durationMonths: Number(v) }))}
          />
          <TextField
            label="প্রতি মাসের কিস্তির তারিখ (১-২৮) *"
            value={plan.installmentDay}
            onChange={(v) => setPlan((p) => ({ ...p, installmentDay: v }))}
            error={errors.installmentDay}
            type="number"
          />
          <TextField
            label="শুরুর তারিখ *"
            value={plan.startDate}
            onChange={(v) => setPlan((p) => ({ ...p, startDate: v }))}
            error={errors.startDate}
            type="date"
          />

          {schedulePreview.length > 0 && (
            <div style={styles.previewBox}>
              <div style={styles.previewRow}>
                <span>মোট কিস্তি সংখ্যা</span>
                <strong>{schedulePreview.length}</strong>
              </div>
              <div style={styles.previewRow}>
                <span>মোট জমার লক্ষ্যমাত্রা</span>
                <strong>{formatTaka(totalTarget)}</strong>
              </div>
              <div style={styles.previewRow}>
                <span>সম্ভাব্য মেয়াদপূর্তি</span>
                <strong>{formatDate(maturityDate)}</strong>
              </div>
            </div>
          )}
        </Section>

        {/* ---------------- CONSENT ---------------- */}
        <Section title="সম্মতি">
          <label style={styles.consentLabel}>
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              style={styles.consentCheckbox}
            />
            <span>{CONSENT_TEXT}</span>
          </label>
          {errors.consent && <div style={styles.fieldError}>{errors.consent}</div>}
        </Section>

        <button type="submit" style={styles.submitButton} disabled={submitting}>
          {submitting ? "জমা দেওয়া হচ্ছে..." : "আবেদন জমা দিন"}
        </button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------
// Small reusable field components
// ---------------------------------------------------------------------

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      {children}
    </div>
  );
}

function TextField({ label, value, onChange, error, type = "text", placeholder }) {
  return (
    <div style={styles.field}>
      <label style={styles.fieldLabel}>{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...styles.input, ...(error ? styles.inputError : {}) }}
      />
      {error && <div style={styles.fieldError}>{error}</div>}
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <div style={styles.field}>
      <label style={styles.fieldLabel}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.input}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function FileField({ label, onChange, fileName, error }) {
  return (
    <div style={styles.field}>
      <label style={styles.fieldLabel}>{label}</label>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => onChange(e.target.files)}
        style={styles.fileInput}
      />
      {fileName && <div style={styles.fileName}>নির্বাচিত: {fileName}</div>}
      {error && <div style={styles.fieldError}>{error}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------

const styles = {
  pageWrapper: {
    padding: "16px",
    maxWidth: "560px",
    margin: "0 auto",
    paddingBottom: "48px",
  },
  backButton: {
    border: "none",
    background: "transparent",
    color: "#1A56C4",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
    marginBottom: "8px",
  },
  heading: { fontSize: "20px", fontWeight: 700, color: "#0F172A", marginBottom: "16px" },
  errorBox: {
    background: "#FEF2F2",
    color: "#DC2626",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    marginBottom: "14px",
  },
  section: {
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: "14px",
    padding: "16px",
    marginBottom: "16px",
  },
  sectionTitle: { fontSize: "15px", fontWeight: 700, color: "#0F3D91", marginBottom: "12px" },
  field: { marginBottom: "12px" },
  fieldLabel: { display: "block", fontSize: "12px", color: "#475569", marginBottom: "4px", fontWeight: 600 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #CBD5E1",
    fontSize: "14px",
    boxSizing: "border-box",
    background: "#fff",
  },
  inputError: { borderColor: "#DC2626" },
  fieldError: { color: "#DC2626", fontSize: "11px", marginTop: "4px" },
  fileInput: { width: "100%", fontSize: "13px" },
  fileName: { fontSize: "11px", color: "#16A34A", marginTop: "4px" },
  previewBox: {
    background: "#F0F9FF",
    borderRadius: "10px",
    padding: "12px",
    marginTop: "6px",
  },
  previewRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#0F3D91",
    padding: "4px 0",
  },
  consentLabel: {
    display: "flex",
    gap: "10px",
    fontSize: "12px",
    color: "#334155",
    lineHeight: 1.6,
    cursor: "pointer",
  },
  consentCheckbox: { marginTop: "3px", flexShrink: 0 },
  submitButton: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #1A56C4, #0F3D91)",
    color: "#fff",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
  },
};