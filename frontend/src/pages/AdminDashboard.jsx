import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import axiosInstance from "../api/axiosInstance.js";
import { buildAdminInsights, teacherProfile } from "../utils/academyData.js";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      try {
        const response = await axiosInstance.get("/api/admin/summary");

        if (!isMounted) {
          return;
        }

        setStats(response.data.stats);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(requestError.response?.data?.message || "Unable to load admin summary");
      }
    }

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  const insights = buildAdminInsights(stats);

  return (
    <div className="stack page-gap">
      <section className="academy-hero academy-hero-tight">
        <div className="academy-hero-copy">
          <p className="eyebrow">Solo teacher operations</p>
          <h2>Run student approvals, curriculum delivery, and Cambridge performance tracking from one console.</h2>
          <p>
            {teacherProfile.experience}. {teacherProfile.subjects.join(", ")} are organized
            around one calm workflow: approve, publish, teach, review, and refine.
          </p>
        </div>

        <div className="academy-hero-grid">
          <article className="hero-metric">
            <span>{stats?.pendingStudents ?? "--"}</span>
            <p>Pending students</p>
          </article>
          <article className="hero-metric">
            <span>{stats?.pendingPayments ?? "--"}</span>
            <p>Pending payments</p>
          </article>
          <article className="hero-metric">
            <span>{insights.completionRate}%</span>
            <p>Estimated completion health</p>
          </article>
          <article className="hero-metric hero-metric-wide">
            <p className="eyebrow">Teaching note</p>
            <strong>{insights.conversionHealth}</strong>
            <p>{insights.liveOpsSummary}</p>
          </article>
        </div>
      </section>

      {error ? <div className="content-panel error-text">{error}</div> : null}

      <div className="stats-grid">
        <article className="stat-card">
          <span>{stats?.pendingStudents ?? "--"}</span>
          <p>Pending students</p>
        </article>
        <article className="stat-card">
          <span>{stats?.pendingPayments ?? "--"}</span>
          <p>Pending payments</p>
        </article>
        <article className="stat-card">
          <span>{stats?.totalCourses ?? "--"}</span>
          <p>Total courses</p>
        </article>
        <article className="stat-card">
          <span>{stats?.publishedLiveClasses ?? "--"}</span>
          <p>Published live classes</p>
        </article>
      </div>

      <section className="dashboard-grid">
        <article className="content-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Next actions</p>
              <h3>Move through the queue</h3>
            </div>
          </div>
          <div className="button-row">
            <Link className="button button-primary" to="/admin/students">
              Review students
            </Link>
            <Link className="button button-secondary" to="/admin/payments">
              Review payments
            </Link>
            <Link className="button button-secondary" to="/admin/courses">
              Manage curriculum
            </Link>
          </div>
        </article>

        <article className="content-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Topic weakness insights</p>
              <h3>Recurring friction points</h3>
            </div>
          </div>
          <div className="stack">
            {insights.weakestTopics.map((topic) => (
              <div className="recommendation-row" key={topic}>
                <strong>{topic}</strong>
                <p>Review this chapter in quizzes, worked examples, and live sessions.</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
