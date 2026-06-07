import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import axiosInstance from "../api/axiosInstance.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function PaymentSubmit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isApproved = user?.isVerifiedStudent && user?.status === "active";
  const [searchParams] = useSearchParams();
  const defaultCourseId = searchParams.get("courseId") || "";
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    courseId: defaultCourseId,
    method: "bkash",
    transactionId: "",
    phoneNumber: user?.phone || "",
    amount: ""
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCourses() {
      try {
        const response = await axiosInstance.get("/api/courses");

        if (!isMounted) {
          return;
        }

        setCourses(response.data.courses.filter((course) => course.type === "paid"));
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(requestError.response?.data?.message || "Unable to load paid courses");
      }
    }

    loadCourses();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!user?.phone) {
      return;
    }

    setForm((current) => {
      if (current.phoneNumber) {
        return current;
      }

      return {
        ...current,
        phoneNumber: user.phone
      };
    });
  }, [user?.phone]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        ...form,
        amount: Number(form.amount)
      };

      const response = await axiosInstance.post("/api/payments", payload);
      setMessage(response.data.message);
      window.setTimeout(() => navigate("/dashboard"), 1000);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to submit payment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="stack page-gap">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Manual payment</p>
          <h2>Submit your transaction details for admin review.</h2>
          <p>
            Supported methods are bKash, Nagad, and Rocket.{" "}
            {isApproved
              ? "Once the payment is verified, the course is assigned to your account."
              : "Newly registered students can submit payment immediately after login, and admin review will activate the account after verification."}
          </p>
        </div>
      </section>

      <form className="content-panel stack form-panel" onSubmit={handleSubmit}>
        <label className="field">
          <span>Course</span>
          <select className="input" name="courseId" onChange={handleChange} value={form.courseId}>
            <option value="">Select a paid course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Method</span>
          <select className="input" name="method" onChange={handleChange} value={form.method}>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="rocket">Rocket</option>
          </select>
        </label>

        <label className="field">
          <span>Phone number used for payment</span>
          <input className="input" name="phoneNumber" onChange={handleChange} value={form.phoneNumber} />
        </label>

        <label className="field">
          <span>Transaction ID</span>
          <input className="input" name="transactionId" onChange={handleChange} value={form.transactionId} />
        </label>

        <label className="field">
          <span>Amount</span>
          <input className="input" min="0" name="amount" onChange={handleChange} type="number" value={form.amount} />
        </label>

        {error ? <p className="error-text">{error}</p> : null}
        {message ? <p className="success-text">{message}</p> : null}

        <div className="button-row">
          <button className="button button-primary" disabled={submitting} type="submit">
            {submitting ? "Submitting..." : "Submit payment"}
          </button>
        </div>
      </form>
    </div>
  );
}
