import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import axiosInstance from "../api/axiosInstance.js";
import { decorateCourse, decorateLesson, getSubjectOptions } from "../utils/academyData.js";
import { getLessonExternalUrl } from "../utils/lessonContent.js";

const lessonTypeLabels = {
  youtube: "Video",
  google_doc: "Google Doc",
  pdf: "PDF",
  pptx: "PPTX"
};

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadCourse() {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/courses/${id}`);

        if (!isMounted) {
          return;
        }

        const normalizedCourse = decorateCourse(response.data.course);
        setCourse({
          ...normalizedCourse,
          modules: normalizedCourse.modules.map((moduleItem) => ({
            ...moduleItem,
            lessons: moduleItem.lessons.map((lesson) =>
              decorateLesson(lesson, {
                subject: normalizedCourse.subject,
                courseTitle: normalizedCourse.title,
                moduleTitle: moduleItem.title
              })
            )
          }))
        });
        setSubjectFilter(normalizedCourse.subject || "all");
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(requestError.response?.data?.message || "Unable to load course");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCourse();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const filteredModules = useMemo(() => {
    if (!course) {
      return [];
    }

    const normalizedQuery = query.trim().toLowerCase();

    return course.modules
      .map((moduleItem) => ({
        ...moduleItem,
        lessons: moduleItem.lessons.filter((lesson) => {
          const subjectMatches =
            subjectFilter === "all" || course.subject === subjectFilter;
          const queryMatches =
            !normalizedQuery ||
            lesson.title.toLowerCase().includes(normalizedQuery) ||
            lesson.topic.toLowerCase().includes(normalizedQuery) ||
            moduleItem.title.toLowerCase().includes(normalizedQuery);

          return subjectMatches && queryMatches;
        })
      }))
      .filter((moduleItem) => moduleItem.lessons.length > 0);
  }, [course, query, subjectFilter]);

  if (loading) {
    return <div className="content-panel">Loading course...</div>;
  }

  if (error) {
    return <div className="content-panel error-text">{error}</div>;
  }

  return (
    <div className="stack page-gap">
      <section className="academy-hero academy-hero-tight">
        <div className="academy-hero-copy">
          <p className="eyebrow">
            {course.level} · {course.subject}
          </p>
          <h2>{course.title}</h2>
          <p>{course.description}</p>
          <div className="button-row">
            {course.isAccessible ? (
              <Link className="button button-primary" to="/practice">
                Start practice quiz
              </Link>
            ) : (
              <Link className="button button-primary" to={`/payments?courseId=${course.id}`}>
                Submit payment
              </Link>
            )}
            <Link className="button button-secondary" to="/dashboard">
              Back to dashboard
            </Link>
          </div>
        </div>

        <div className="academy-hero-grid">
          <article className="hero-metric">
            <span>{course.chapterCount}</span>
            <p>Chapters</p>
          </article>
          <article className="hero-metric">
            <span>{course.estimatedHours}</span>
            <p>Estimated hours</p>
          </article>
          <article className="hero-metric">
            <span>{course.difficulty}</span>
            <p>Difficulty band</p>
          </article>
          <article className="hero-metric hero-metric-wide">
            <p className="eyebrow">Curriculum focus</p>
            <strong>{course.topicList.join(" · ")}</strong>
            <p>Subject, chapter, topic, and lesson structure tuned for Cambridge pacing.</p>
          </article>
        </div>
      </section>

      <section className="content-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Filter curriculum</p>
            <h3>Find chapters, topics, and lessons quickly</h3>
          </div>
        </div>
        <div className="filter-row">
          <input
            className="input"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search lesson, topic, or chapter"
            value={query}
          />
          <select
            className="input compact-input"
            onChange={(event) => setSubjectFilter(event.target.value)}
            value={subjectFilter}
          >
            <option value="all">All subjects</option>
            {getSubjectOptions().map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="stack">
        {filteredModules.map((moduleItem, moduleIndex) => (
          <article className="module-panel" key={moduleItem.id}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  Chapter {moduleIndex + 1}
                  {moduleItem.chapterCode ? ` · ${moduleItem.chapterCode}` : ""}
                </p>
                <h3>{moduleItem.title}</h3>
                <p className="muted-copy">
                  {(moduleItem.focusTopics || []).length > 0
                    ? moduleItem.focusTopics.join(" · ")
                    : "Core Cambridge lesson sequence"}
                </p>
              </div>
            </div>
            <div className="stack">
              {moduleItem.lessons.map((lesson) => (
                <div className="lesson-row lesson-row-card" key={lesson.id}>
                  <div>
                    <div className="button-row">
                      <span className="pill pill-secondary">{lesson.topic}</span>
                      <span className={`pill ${lesson.isFree ? "pill-success" : "pill-warning"}`}>
                        {lesson.isFree ? "Free lesson" : "Premium lesson"}
                      </span>
                    </div>
                    <strong>{lesson.title}</strong>
                    <p>
                      {lesson.estimatedReadTime} · {lessonTypeLabels[lesson.contentType || "youtube"]}
                    </p>
                    <p className="muted-copy">{lesson.summary}</p>
                  </div>
                  <div className="lesson-row-actions">
                    {lesson.isLocked ? (
                      <span className="pill pill-danger">Locked</span>
                    ) : lesson.contentType === "youtube" || !lesson.contentType ? (
                      <Link className="button button-secondary" to={`/lessons/${lesson.id}`}>
                        Open lesson
                      </Link>
                    ) : (
                      <a
                        className="button button-secondary"
                        href={getLessonExternalUrl(lesson)}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Open file
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
        {filteredModules.length === 0 ? (
          <div className="content-panel">No lessons match your current filters.</div>
        ) : null}
      </section>
    </div>
  );
}
