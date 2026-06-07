import { useEffect, useState } from "react";

import axiosInstance from "../api/axiosInstance.js";
import { formatStatusLabel, getStatusTone } from "../utils/statusLabels.js";

function formatAmount(value) {
  return Number.isFinite(value) ? value.toLocaleString() : value;
}

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function loadPayments(nextFilter = filter) {
    try {
      const response = await axiosInstance.get("/api/admin/payments", {
        params: nextFilter ? { status: nextFilter } : {}
      });
      setPayments(response.data.payments);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load payments");
    }
  }

  useEffect(() => {
    loadPayments(filter);
  }, [filter]);

  async function updatePayment(paymentId, action) {
    setBusyId(paymentId);
    setError("");

    try {
      await axiosInstance.patch(`/api/admin/payments/${paymentId}`, { action });
      await loadPayments(filter);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update payment");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="stack page-gap">
      <section className="section-heading">
        <div>
          <p className="eyebrow">Payment queue</p>
          <h2>Verify or reject submitted transactions.</h2>
        </div>
        <select className="input compact-input" onChange={(event) => setFilter(event.target.value)} value={filter}>
          <option value="pending">Pending</option>
          <option value="verified">Confirmed</option>
          <option value="rejected">Rejected</option>
        </select>
      </section>

      {error ? <div className="content-panel error-text">{error}</div> : null}

      <div className="stack">
        {payments.map((payment) => (
          <article className="content-panel" key={payment._id}>
            <div className="section-heading">
              <div>
                <h3>{payment.courseId?.title}</h3>
                <p>
                  {payment.userId?.name} | {payment.userId?.studentId}
                </p>
              </div>
              <span className={`pill ${getStatusTone(payment.status)}`}>{formatStatusLabel(payment.status)}</span>
            </div>

            <div className="split-details">
              <p>Method: {payment.method}</p>
              <p>Phone: {payment.phoneNumber || "Not provided"}</p>
              <p>Transaction ID: {payment.transactionId}</p>
              <p>Amount: {formatAmount(payment.amount)}</p>
            </div>

            {payment.status === "pending" ? (
              <div className="button-row">
                <button
                  className="button button-primary"
                  disabled={busyId === payment._id}
                  onClick={() => updatePayment(payment._id, "verify")}
                  type="button"
                >
                  Verify
                </button>
                <button
                  className="button button-danger"
                  disabled={busyId === payment._id}
                  onClick={() => updatePayment(payment._id, "reject")}
                  type="button"
                >
                  Reject
                </button>
              </div>
            ) : null}
          </article>
        ))}
        {!payments.length ? <div className="content-panel">No payments found for this filter.</div> : null}
      </div>
    </div>
  );
}
