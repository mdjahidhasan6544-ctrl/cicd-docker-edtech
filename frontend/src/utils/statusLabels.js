const STATUS_LABELS = {
  active: "Active",
  approved: "Approved",
  banned: "Banned",
  confirmed: "Confirmed",
  not_submitted: "No payment",
  pending: "Pending",
  rejected: "Rejected",
  temp_banned: "Temp banned",
  verified: "Confirmed"
};

export function formatStatusLabel(value = "") {
  if (!value) {
    return "";
  }

  if (STATUS_LABELS[value]) {
    return STATUS_LABELS[value];
  }

  return value
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getStatusTone(value = "") {
  if (["active", "approved", "confirmed", "verified"].includes(value)) {
    return "pill-success";
  }

  if (value === "pending") {
    return "pill-warning";
  }

  if (value === "not_submitted") {
    return "pill-secondary";
  }

  return "pill-danger";
}
