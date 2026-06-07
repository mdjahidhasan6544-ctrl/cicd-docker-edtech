import { useEffect, useMemo, useState } from "react";

import axiosInstance from "../api/axiosInstance.js";
import { buildPracticeCatalog, decorateCourse } from "../utils/academyData.js";

export default function PracticeHub() {
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadPracticeData() {
      try {
        const response = await axiosInstance.get("/api/courses");

        if (!isMounted) {
          return;
        }

        setCourses(
          response.data.courses
            .map((course, index) => decorateCourse(course, index))
            .filter((course) => course.isAccessible)
        );
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(requestError.response?.data?.message || "Unable to load practice hub");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPracticeData();

    return () => {
      isMounted = false;
    };
  }, []);

  const practiceCatalog = useMemo(() => buildPracticeCatalog(courses), [courses]);
  const filteredCatalog =
    filter === "all"
      ? practiceCatalog
      : practiceCatalog.filter((item) => item.subject === filter);
  const availableSubjects = [...new Set(practiceCatalog.map((item) => item.subject))];

  return (
    <div className="stack page-gap">
      <section className="academy-hero academy-hero-tight">
        <div className="academy-hero-copy">
          <p className="eyebrow">Practice hub</p>
          <h2>Run topic quizzes, chapter checks, and past-paper style drills from one study surface.</h2>
          <p>
            Timed and untimed practice are organized by subject, level, session, and paper code
            so students can move from learning to exam readiness without context switching.
          </p>
        </div>
      </section>

      <section className="content-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Filters</p>
            <h3>Subject and paper selection</h3>
          </div>
        </div>
        <div className="button-row">
          <button
            className={`button ${filter === "all" ? "button-primary" : "button-secondary"}`}
            onClick={() => setFilter("all")}
            type="button"
          >
            All subjects
          </button>
          {availableSubjects.map((subject) => (
            <button
              className={`button ${filter === subject ? "button-primary" : "button-secondary"}`}
              key={subject}
              onClick={() => setFilter(subject)}
              type="button"
            >
              {subject}
            </button>
          ))}
        </div>
      </section>

      {loading ? <div className="content-panel">Loading practice sets...</div> : null}
      {error ? <div className="content-panel error-text">{error}</div> : null}

      {!loading && !error ? (
        <section className="practice-grid">
          {filteredCatalog.map((item) => (
            <article className="content-panel practice-card" key={item.id}>
              <div className="button-row">
                <span className="pill pill-secondary">{item.subject}</span>
                <span className="pill pill-warning">{item.mode}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div className="course-meta-grid">
                <div>
                  <span>Level</span>
                  <strong>{item.level}</strong>
                </div>
                <div>
                  <span>Chapter</span>
                  <strong>{item.chapter}</strong>
                </div>
                <div>
                  <span>Session</span>
                  <strong>{item.session}</strong>
                </div>
                <div>
                  <span>Paper code</span>
                  <strong>{item.paperCode}</strong>
                </div>
              </div>
              <div className="button-row">
                <button className="button button-primary" type="button">
                  Start {item.mode.toLowerCase()}
                </button>
                <button className="button button-secondary" type="button">
                  Retry incorrect
                </button>
              </div>
            </article>
          ))}
          {filteredCatalog.length === 0 ? (
            <div className="content-panel">No practice sets available for this subject yet.</div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
