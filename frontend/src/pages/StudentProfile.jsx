import { useEffect, useState } from "react";

import axiosInstance from "../api/axiosInstance.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formatStatusLabel, getStatusTone } from "../utils/statusLabels.js";

const initialProfileForm = {
  name: "",
  email: "",
  phone: "",
  institution: "",
  classLevel: "",
  address: ""
};

const initialPasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
};

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString() : "Not available";
}

function formatAmount(value) {
  return Number.isFinite(value) ? value.toLocaleString() : value;
}

export default function StudentProfile() {
  const { syncUser, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState(initialProfileForm);
  const [passwordForm, setPasswordForm] = useState(initialPasswordForm);
  const [approvalStatus, setApprovalStatus] = useState("pending");
  const [paymentStatus, setPaymentStatus] = useState("not_submitted");
  const [payments, setPayments] = useState([]);
  const [profileError, setProfileError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const response = await axiosInstance.get("/api/profile");
        const nextProfile = response.data.profile;

        if (!isMounted) {
          return;
        }

        setProfileForm({
          name: nextProfile.name || "",
          email: nextProfile.email || "",
          phone: nextProfile.phone || "",
          institution: nextProfile.institution || "",
          classLevel: nextProfile.classLevel || "",
          address: nextProfile.address || ""
        });
        setApprovalStatus(nextProfile.approvalStatus || "pending");
        setPaymentStatus(nextProfile.paymentStatus || "not_submitted");
        setPayments(nextProfile.payments || []);
        syncUser(nextProfile);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setProfileError(error.response?.data?.message || "Unable to load profile");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleProfileChange(event) {
    setProfileForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  function handlePasswordChange(event) {
    setPasswordForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function submitProfile(event) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileError("");
    setProfileMessage("");

    try {
      const response = await axiosInstance.patch("/api/profile", profileForm);
      setProfileMessage(response.data.message);
      syncUser(response.data.profile);
    } catch (error) {
      setProfileError(error.response?.data?.message || "Unable to update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function submitPassword(event) {
    event.preventDefault();
    setSavingPassword(true);
    setPasswordError("");
    setPasswordMessage("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation do not match");
      setSavingPassword(false);
      return;
    }

    try {
      const response = await axiosInstance.post("/api/profile/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordMessage(response.data.message);
      setPasswordForm(initialPasswordForm);
    } catch (error) {
      setPasswordError(error.response?.data?.message || "Unable to change password");
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return <div className="content-panel">Loading profile...</div>;
  }

  return (
    <div className="stack page-gap">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Student profile</p>
          <h2>Keep your account details current and track approval and payment progress from one page.</h2>
          <p>Your student ID stays fixed, and your latest payment review status appears here after admin action.</p>
        </div>
      </section>

      <div className="admin-grid profile-grid">
        <form className="content-panel stack" onSubmit={submitProfile}>
          <div>
            <p className="eyebrow">Profile details</p>
            <h3>{user?.name || "Student account"}</h3>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <span>Student ID</span>
              <strong>{user?.studentId || ""}</strong>
            </div>
            <div className="detail-item">
              <span>Approval status</span>
              <strong>
                <span className={`pill ${getStatusTone(approvalStatus)}`}>{formatStatusLabel(approvalStatus)}</span>
              </strong>
            </div>
            <div className="detail-item">
              <span>Payment status</span>
              <strong>
                <span className={`pill ${getStatusTone(paymentStatus)}`}>{formatStatusLabel(paymentStatus)}</span>
              </strong>
            </div>
          </div>

          <label className="field">
            <span>Name</span>
            <input className="input" name="name" onChange={handleProfileChange} value={profileForm.name} />
          </label>

          <label className="field">
            <span>Email</span>
            <input className="input" name="email" onChange={handleProfileChange} type="email" value={profileForm.email} />
          </label>

          <label className="field">
            <span>Phone</span>
            <input className="input" name="phone" onChange={handleProfileChange} value={profileForm.phone} />
          </label>

          <label className="field">
            <span>Institution</span>
            <input className="input" name="institution" onChange={handleProfileChange} value={profileForm.institution} />
          </label>

          <label className="field">
            <span>Class / Level</span>
            <input className="input" name="classLevel" onChange={handleProfileChange} value={profileForm.classLevel} />
          </label>

          <label className="field">
            <span>Address</span>
            <textarea className="input textarea" name="address" onChange={handleProfileChange} value={profileForm.address} />
          </label>

          <div className="stack">
            <p className="eyebrow">Payment records</p>
            {payments.length ? (
              payments.map((payment) => (
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
              <p className="muted-copy">No payment records available yet.</p>
            )}
          </div>

          {profileError ? <p className="error-text">{profileError}</p> : null}
          {profileMessage ? <p className="success-text">{profileMessage}</p> : null}

          <button className="button button-primary" disabled={savingProfile} type="submit">
            {savingProfile ? "Saving..." : "Save profile"}
          </button>
        </form>

        <form className="content-panel stack" onSubmit={submitPassword}>
          <div>
            <p className="eyebrow">Password</p>
            <h3>Change password</h3>
          </div>

          <label className="field">
            <span>Current password</span>
            <input
              className="input"
              name="currentPassword"
              onChange={handlePasswordChange}
              type="password"
              value={passwordForm.currentPassword}
            />
          </label>

          <label className="field">
            <span>New password</span>
            <input
              className="input"
              name="newPassword"
              onChange={handlePasswordChange}
              type="password"
              value={passwordForm.newPassword}
            />
          </label>

          <label className="field">
            <span>Confirm new password</span>
            <input
              className="input"
              name="confirmPassword"
              onChange={handlePasswordChange}
              type="password"
              value={passwordForm.confirmPassword}
            />
          </label>

          {passwordError ? <p className="error-text">{passwordError}</p> : null}
          {passwordMessage ? <p className="success-text">{passwordMessage}</p> : null}

          <button className="button button-primary" disabled={savingPassword} type="submit">
            {savingPassword ? "Updating..." : "Change password"}
          </button>
        </form>
      </div>
    </div>
  );
}
