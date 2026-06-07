import { useEffect, useState } from "react";

import axiosInstance from "../api/axiosInstance.js";
import { formatStatusLabel, getStatusTone } from "../utils/statusLabels.js";

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString() : "Not available";
}

function formatAmount(value) {
  return Number.isFinite(value) ? value.toLocaleString() : value;
}

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function loadStudents() {
    try {
      const response = await axiosInstance.get("/api/admin/students");
      setStudents(response.data.students);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load students");
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  async function updateStudent(studentId, payload) {
    setBusyId(studentId);
    setError("");

    try {
      await axiosInstance.patch(`/api/admin/students/${studentId}`, payload);
      await loadStudents();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update student");
    } finally {
      setBusyId("");
    }
  }

  async function removeDevice(deviceId, userId) {
    setBusyId(deviceId);
    setError("");

    try {
      await axiosInstance.delete(`/api/admin/devices/${deviceId}`);
      await loadStudents();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to remove device");
    } finally {
      setBusyId("");
    }
  }

  const [confirming, setConfirming] = useState({ id: "", action: null, payload: null, message: "" });

  function requestAction(student, action, payload, message) {
    setConfirming({ id: student.id, action, payload, message });
  }

  function cancelAction() {
    setConfirming({ id: "", action: null, payload: null, message: "" });
  }

  async function executeAction() {
    const { id, payload } = confirming;
    cancelAction();
    await updateStudent(id, payload);
  }

  return (
    <div className="stack page-gap">
      <section className="section-heading">
        <div>
          <p className="eyebrow">Student access</p>
          <h2>Approve students, review profile details, and track payment progress in one place.</h2>
        </div>
      </section>

      {error ? <div className="content-panel error-text">{error}</div> : null}

      <div className="stack">
        {students.map((student) => {
          const isApproved = student.isVerifiedStudent && student.status === "active";
          const isPendingReview = !student.isVerifiedStudent || student.status === "pending";
          const isBanned = student.status === "banned";

          return (
            <div className="content-panel stack" key={student.id}>
              <div className="section-heading">
                <div>
                  <h3>{student.name}</h3>
                  <p>
                    {student.email} | {student.studentId}
                  </p>
                </div>
                <div className="button-row">
                   <span className={`pill ${getStatusTone(student.paymentStatus)}`}>
                    Payments: {formatStatusLabel(student.paymentStatus)}
                  </span>
                </div>
              </div>

              {/* Action Segment / Status Controller */}
              <div className="state-panel stack" style={{ padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="button-row" style={{ justifyContent: "space-between", width: "100%" }}>
                  <div className="stack" style={{ gap: "0.25rem" }}>
                    <p className="eyebrow" style={{ marginBottom: 0 }}>Current Status</p>
                    <div className="button-row">
                      <span className={`pill ${getStatusTone(student.approvalStatus)}`}>
                        {formatStatusLabel(student.approvalStatus)}
                      </span>
                      <span className={`pill ${getStatusTone(student.status)}`}>
                        {formatStatusLabel(student.status)}
                      </span>
                    </div>
                  </div>

                  <div className="button-row">
                    {confirming.id === student.id ? (
                      <div className="button-row" style={{ background: "rgba(239, 68, 68, 0.1)", padding: "0.5rem 1rem", borderRadius: "12px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                        <span style={{ fontSize: "0.9rem", color: "#fca5a5" }}>{confirming.message}</span>
                        <button className="button button-danger" style={{ minHeight: "2rem", padding: "0 0.75rem" }} onClick={executeAction}>Confirm</button>
                        <button className="button button-secondary" style={{ minHeight: "2rem", padding: "0 0.75rem" }} onClick={cancelAction}>Cancel</button>
                      </div>
                    ) : (
                      <>
                        <div className="button-group" style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            className={`button ${isApproved ? "button-secondary" : "button-primary"}`}
                            disabled={busyId === student.id}
                            onClick={() =>
                              isApproved 
                                ? requestAction(student, "pending", { isVerifiedStudent: false, status: "pending" }, `Revoke access for ${student.name}?`)
                                : requestAction(student, "approve", { isVerifiedStudent: true, status: "active" }, `Approve ${student.name}?`)
                            }
                            type="button"
                          >
                            {busyId === student.id ? "..." : (isApproved ? "Revoke Access" : "Approve Student")}
                          </button>

                          {isBanned ? (
                            <button
                              className="button button-secondary"
                              disabled={busyId === student.id}
                              onClick={() => requestAction(student, "unban", { status: student.isVerifiedStudent ? "active" : "pending" }, `Unban ${student.name}?`)}
                              type="button"
                            >
                              Unban
                            </button>
                          ) : (
                            <button
                              className="button button-danger"
                              disabled={busyId === student.id}
                              onClick={() => requestAction(student, "ban", { status: "banned" }, `Ban ${student.name}?`)}
                              type="button"
                            >
                              Ban
                            </button>
                          )}
                        </div>

                        <div className="button-group" style={{ display: "flex", gap: "0.5rem", borderLeft: "1px solid var(--line)", paddingLeft: "0.5rem" }}>
                          <button
                            className="button button-secondary"
                            disabled={busyId === student.id}
                            onClick={() => requestAction(student, "reset_devices", { resetDevices: true }, `Reset all devices for ${student.name}?`)}
                            type="button"
                            title="Reset Devices"
                          >
                            Reset Devices
                          </button>

                          <button
                            className="button button-danger"
                            disabled={busyId === student.id}
                            onClick={() => requestAction(student, "full_reset", { status: "pending", isVerifiedStudent: false, resetDevices: true }, `Perform Full Reset for ${student.name}?`)}
                            type="button"
                            title="Full Account Reset"
                          >
                            Full Reset
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

            <div className="stack">
              <p className="eyebrow">Student profile details</p>
              <div className="detail-grid">
                <div className="detail-item">
                  <span>Phone</span>
                  <strong>{student.phone || "Not provided"}</strong>
                </div>
                <div className="detail-item">
                  <span>Institution</span>
                  <strong>{student.institution || "Not provided"}</strong>
                </div>
                <div className="detail-item">
                  <span>Class / Level</span>
                  <strong>{student.classLevel || "Not provided"}</strong>
                </div>
                <div className="detail-item">
                  <span>Registered devices</span>
                  <strong>{student.deviceCount}</strong>
                </div>
                <div className="detail-item detail-item-wide">
                  <span>Address</span>
                  <strong>{student.address || "Not provided"}</strong>
                </div>
              </div>
            </div>

            <div className="stack">
              <p className="eyebrow">Payment details</p>
              {student.payments.length ? (
                student.payments.map((payment) => (
                  <div className="payment-row" key={payment.id}>
                    <div>
                      <strong>{payment.courseTitle}</strong>
                      <p>
                        {payment.method.toUpperCase()} | Phone: {payment.phoneNumber || "Not provided"} | TXN: {payment.transactionId}
                      </p>
                    </div>
                    <div className="button-row">
                      <span className="muted-copy">Amount: {formatAmount(payment.amount)}</span>
                      <span className="muted-copy">Updated: {formatDateTime(payment.updatedAt)}</span>
                      <span className={`pill ${getStatusTone(payment.displayStatus)}`}>
                        {formatStatusLabel(payment.displayStatus)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="muted-copy">No payment records submitted yet.</p>
              )}
            </div>

            <div className="stack">
              <p className="eyebrow">Registered devices</p>
              {student.devices.length ? (
                student.devices.map((device) => (
                  <div className="device-row" key={device.id}>
                    <div>
                      <strong>{device.ip || "Unknown IP"}</strong>
                      <p>{device.userAgent || "Unknown device"}</p>
                    </div>
                    <div className="button-row">
                      <span className="muted-copy">{formatDateTime(device.lastSeen)}</span>
                      <button
                        className="button button-secondary"
                        disabled={busyId === device.id}
                        onClick={() => removeDevice(device.id)}
                        type="button"
                      >
                        {busyId === device.id ? "..." : "Remove"}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="muted-copy">No devices recorded.</p>
              )}
            </div>
            </div>
          );
        })}
        {!students.length ? <div className="content-panel">No students found.</div> : null}
      </div>
    </div>
  );
}
