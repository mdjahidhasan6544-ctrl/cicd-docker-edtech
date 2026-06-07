import { Link } from "react-router-dom";

export default function CourseCard({ course, primaryAction = "outline" }) {
  const usePaymentPrimary = primaryAction === "payment" && course.type === "paid" && course.isLocked;
  const progressValue = typeof course.progress === "number" ? Math.max(0, Math.min(course.progress, 100)) : null;

  return (
    <article className={`course-card ${course.isLocked ? "course-card-locked" : ""}`}>
      <div className="course-thumbnail">
        {course.thumbnail ? (
          <img alt={course.title} src={course.thumbnail} />
        ) : (
          <div className="course-thumbnail-fallback">
            <span>{course.type === "paid" ? "Premium" : "Open"}</span>
          </div>
        )}
      </div>
      <div className="course-card-body">
        <div className="course-card-topline">
          <span className={`pill ${course.type === "paid" ? "pill-warning" : "pill-success"}`}>
            {course.type}
          </span>
          {course.subject ? <span className="pill pill-secondary">{course.subject}</span> : null}
          {course.isLocked ? <span className="pill pill-danger">Locked</span> : null}
        </div>
        <h3>{course.title}</h3>
        <p>{course.description}</p>
        <div className="course-meta-grid">
          <div>
            <span>Level</span>
            <strong>{course.level || "Cambridge track"}</strong>
          </div>
          <div>
            <span>Difficulty</span>
            <strong>{course.difficulty || "Core"}</strong>
          </div>
          <div>
            <span>Chapters</span>
            <strong>{course.chapterCount || course.modules?.length || 0}</strong>
          </div>
          <div>
            <span>Est. hours</span>
            <strong>{course.estimatedHours || "--"}</strong>
          </div>
        </div>
        {progressValue !== null && !course.isLocked ? (
          <div className="progress-block" aria-label={`${course.title} progress`}>
            <div className="progress-row">
              <span>Progress</span>
              <strong>{progressValue}%</strong>
            </div>
            <div className="progress-track">
              <span style={{ width: `${progressValue}%` }} />
            </div>
          </div>
        ) : null}
        <div className="button-row">
          <Link className="button button-primary" to={usePaymentPrimary ? `/payments?courseId=${course.id}` : `/courses/${course.id}`}>
            {usePaymentPrimary ? "Submit payment" : course.isLocked ? "View outline" : "Open course"}
          </Link>
          {course.isLocked && course.type === "paid" && !usePaymentPrimary ? (
            <Link className="button button-secondary" to={`/payments?courseId=${course.id}`}>
              Submit payment
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
