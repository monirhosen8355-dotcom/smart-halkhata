// =====================================================================
// dpsUtils.js
// DPS status, validation, schedule, money and date helpers
// =====================================================================

export const NID_TYPES = [
  "NID",
  "Birth Certificate",
  "Passport",
];

export const NOMINEE_RELATIONS = [
  "পিতা",
  "মাতা",
  "স্বামী",
  "স্ত্রী",
  "ভাই",
  "বোন",
  "সন্তান",
  "অন্যান্য",
];

export const DPS_DURATIONS_MONTHS = [6, 12, 24, 36, 48];

export const DPS_STATUS = {
  PENDING: "pending_admin_approval",
  ACTIVE: "active",
  REJECTED: "rejected",
  MATURED: "matured",
};

export function isValidPhone(phone) {
  return /^01\d{9}$/.test(String(phone || "").trim());
}

export function isValidNidNumber(nidNumber) {
  const value = String(nidNumber || "").trim();
  return /^\d{10,17}$/.test(value);
}

export function isAllowedImageFile(file) {
  if (!file) return false;

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  const maxSize = 5 * 1024 * 1024;

  return (
    allowedTypes.includes(file.type) &&
    file.size <= maxSize
  );
}

export function getDpsStatusMeta(status) {
  switch (status) {
    case DPS_STATUS.PENDING:
      return {
        label: "অপেক্ষমাণ",
        color: "#D97706",
        bg: "#FEF3C7",
      };

    case DPS_STATUS.ACTIVE:
      return {
        label: "সক্রিয়",
        color: "#16A34A",
        bg: "#DCFCE7",
      };

    case DPS_STATUS.REJECTED:
      return {
        label: "বাতিল",
        color: "#DC2626",
        bg: "#FEE2E2",
      };

    case DPS_STATUS.MATURED:
      return {
        label: "মেয়াদপূর্ণ",
        color: "#2563EB",
        bg: "#DBEAFE",
      };

    default:
      return {
        label: status || "অজানা",
        color: "#64748B",
        bg: "#F1F5F9",
      };
  }
}

export function formatTaka(amount) {
  const value = Number(amount || 0);

  return `৳${value.toLocaleString("bn-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function toDate(value) {
  if (!value) return null;

  if (value?.toDate) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value) {
  const date = toDate(value);

  if (!date) return "—";

  return date.toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value) {
  const date = toDate(value);

  if (!date) return "—";

  return date.toLocaleString("bn-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function calculateMaturityDate(plan = {}) {
  if (!plan.startDate || !plan.durationMonths) {
    return null;
  }

  const date = new Date(plan.startDate);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setMonth(
    date.getMonth() + Number(plan.durationMonths)
  );

  return date;
}

export function calculateTotalTarget(plan = {}) {
  const installmentAmount = Number(
    plan.installmentAmount || 0
  );

  const durationMonths = Number(
    plan.durationMonths || 0
  );

  return installmentAmount * durationMonths;
}

export function previewInstallmentSchedule(plan = {}) {
  const amount = Number(plan.installmentAmount || 0);
  const duration = Number(plan.durationMonths || 0);

  if (!amount || !duration || !plan.startDate) {
    return [];
  }

  const startDate = new Date(plan.startDate);

  if (Number.isNaN(startDate.getTime())) {
    return [];
  }

  const installmentDay = Number(
    plan.installmentDay || 5
  );

  const schedule = [];

  for (let i = 0; i < duration; i++) {
    const date = new Date(startDate);

    date.setMonth(date.getMonth() + i);

    const lastDay = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).getDate();

    date.setDate(
      Math.min(installmentDay, lastDay)
    );

    schedule.push({
      installmentNumber: i + 1,
      amount,
      date,
    });
  }

  return schedule;
}
export function getInstallmentMeta(status) {
  switch (status) {
    case "paid":
      return {
        label: "পরিশোধিত",
        color: "#16A34A",
        bg: "#DCFCE7",
      };

    case "due":
      return {
        label: "বকেয়া",
        color: "#DC2626",
        bg: "#FEE2E2",
      };

    case "upcoming":
      return {
        label: "আসন্ন",
        color: "#2563EB",
        bg: "#DBEAFE",
      };

    case "missed":
      return {
        label: "অনাদায়ী",
        color: "#D97706",
        bg: "#FEF3C7",
      };

    default:
      return {
        label: status || "অজানা",
        color: "#64748B",
        bg: "#F1F5F9",
      };
  }
}
// Alias kept for compatibility with DPSDetails.jsx, which imports this name.
export const getInstallmentStatusMeta = getInstallmentMeta;