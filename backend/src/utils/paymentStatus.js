export function summarizePaymentStatus(payments = []) {
  if (payments.some((payment) => payment.status === "pending")) {
    return "pending";
  }

  if (payments.some((payment) => payment.status === "verified")) {
    return "confirmed";
  }

  if (payments.some((payment) => payment.status === "rejected")) {
    return "rejected";
  }

  return "not_submitted";
}

export function serializePayment(payment) {
  return {
    id: payment._id.toString(),
    courseTitle: payment.courseId?.title || "Unknown course",
    method: payment.method,
    transactionId: payment.transactionId,
    phoneNumber: payment.phoneNumber || "",
    amount: payment.amount,
    status: payment.status,
    displayStatus: payment.status === "verified" ? "confirmed" : payment.status,
    updatedAt: payment.updatedAt,
    createdAt: payment.createdAt
  };
}
