import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import axiosInstance from "../api/axiosInstance.js";
import CourseCard from "../components/CourseCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  buildStudentInsights,
  decorateCourse,
  teacherProfile
} from "../utils/academyData.js";

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const isApproved = user?.isVerifiedStudent && user?.status === "active";

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");
        const requests = [axiosInstance.get("/api/courses")];

        if (isApproved) {
          requests.push(axiosInstance.get("/api/live-classes"));
        }

        const [coursesResponse, liveClassesResponse] = await Promise.all(requests);

        if (!isMounted) {
          return;
        }

        setCourses(
          coursesResponse.data.courses.map((course, index) => decorateCourse(course, index))
        );
        setLiveClasses(isApproved ? liveClassesResponse.data.liveClasses : []);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(requestError.response?.data?.message || "Unable to load dashboard");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isApproved]);

  const accessibleCourses = courses.filter((course) => course.isAccessible);
  const lockedCourses = courses.filter((course) => course.isLocked);
  const paidCourses = courses.filter((course) => course.type === "paid");
  const insights = buildStudentInsights(courses, liveClasses);

  return (
    <div className="stack page-gap">
      <section className="academy-hero academy-hero-student">
        <div className="academy-hero-copy">
          <p className="eyebrow">Cambridge science academy</p>
          <h2>
            {isApproved
              ? `${user?.name}, your ${insights.overallProgress}% progress arc is live across Cambridge subjects.`
              : `${user?.name}, your student profile is ready for premium Cambridge access.`}
          </h2>
          <p>
            {teacherProfile.experience}. Specialist teaching for{" "}
            {teacherProfile.subjects.join(", ")} with a calm, exam-ready structure for
            Pre-O Level and O Level learners.
          </p>
          <div className="button-row">
            <Link className="button button-primary" to={isApproved ? "/practice" : "/payments"}>
              {isApproved ? "Open practice hub" : "Submit payment"}
            </Link>
            <Link className="button button-secondary" to="/profile">
              Review profile
            </Link>
          </div>
          <div className="academy-proof-row">
            <div className="academy-proof-chip">Weekly plans</div>
            <div className="academy-proof-chip">Progress tracking</div>
            <div className="academy-proof-chip">Parent visibility</div>
          </div>
        </div>

        <div className="academy-hero-grid">
          <article className="hero-metric">
            <span>{isApproved ? `${insights.streakDays} days` : "Pending"}</span>
            <p>Study streak</p>
          </article>
          <article className="hero-metric">
            <span>{isApproved ? `${insights.weeklyHours} hrs` : paidCourses.length}</span>
            <p>{isApproved ? "Weekly study time" : "Available paid courses"}</p>
          </article>
          <article className="hero-metric">
            <span>{isApproved ? accessibleCourses.length : lockedCourses.length}</span>
            <p>{isApproved ? "Accessible subjects" : "Courses awaiting unlock"}</p>
          </article>
          <article className="hero-metric hero-metric-wide">
            <p className="eyebrow">Instructor focus</p>
            <strong>{teacherProfile.title}</strong>
            <p>{teacherProfile.description}</p>
          </article>
        </div>
      </section>

      {!isApproved ? (
        <section className="content-panel spotlight-row">
          <div>
            <p className="eyebrow">Enrollment flow</p>
            <h3>Complete payment, then wait for manual verification.</h3>
            <p>
              The platform uses a solo-teacher approval workflow. Once payment is reviewed,
              your dashboard unlocks structured lessons, progress analytics, and live classes.
            </p>
          </div>
          <div className="button-row">
            <Link className="button button-primary" to="/payments">
              Open payment form
            </Link>
            <Link className="button button-secondary" to="/profile">
              Update profile
            </Link>
          </div>
        </section>
      ) : null}

      {isApproved ? (
        <>
          <section className="dashboard-grid dashboard-grid-primary">
            <article className="content-panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Subject progress</p>
                  <h3>Track strengths chapter by chapter</h3>
                </div>
              </div>
              <div className="subject-progress-list">
                {insights.progressCards.map((item) => (
                  <div className="subject-progress-item" key={item.id}>
                    <div className="progress-row">
                      <div>
                        <strong>{item.subject}</strong>
                        <p>
                          {item.level} · {item.topicCount} tracked topics
                        </p>
                      </div>
                      <span>{item.progress}%</span>
                    </div>
                    <div className="progress-track">
                      <span style={{ width: `${item.progress}%` }} />
                    </div>
                    <p className="muted-copy">{item.recommendation}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="content-panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Continue learning</p>
                  <h3>Resume your next best session</h3>
                </div>
              </div>
              <div className="stack">
                {insights.continueLearning.map((item) => (
                  <Link className="study-list-item" key={item.id} to={item.to}>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.chapter}</p>
                    </div>
                    <span>{item.time}</span>
                  </Link>
                ))}
              </div>
            </article>
          </section>

          <section className="dashboard-grid">
            <article className="content-panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Recent activity</p>
                  <h3>Keep momentum visible</h3>
                </div>
              </div>
              <div className="stack">
                {insights.recentActivity.map((item) => (
                  <div className="activity-row" key={item.id}>
                    <div>
                      <strong>{item.label}</strong>
                      <p>{item.subject}</p>
                    </div>
                    <span>{item.when}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="content-panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Weak-topic recommendations</p>
                  <h3>Target the chapters costing marks</h3>
                </div>
              </div>
              <div className="stack">
                {insights.recommendations.map((item) => (
                  <div className="recommendation-row" key={item.id}>
                    <strong>{item.title}</strong>
                    <p>
                      {item.subject} · {item.reason}
                    </p>
                  </div>
                ))}
              </div>
            </article>

            <article className="content-panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Upcoming quizzes</p>
                  <h3>Exam practice queued for this week</h3>
                </div>
              </div>
              <div className="stack">
                {insights.upcomingQuiz.map((item) => (
                  <div className="quiz-row" key={item.id}>
                    <div>
                      <strong>{item.title}</strong>
                      <p>
                        {item.mode} · {item.paperCode}
                      </p>
                    </div>
                    <span>{item.scoreTarget}</span>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </>
      ) : null}

      {isApproved && insights.nextLiveClass ? (
        <section className="content-panel spotlight-row">
          <div>
            <p className="eyebrow">Next live class</p>
            <h3>{insights.nextLiveClass.title}</h3>
            <p>{formatDateTime(insights.nextLiveClass.scheduledAt)}</p>
          </div>
          <Link className="button button-primary" to="/live-classes">
            View live schedule
          </Link>
        </section>
      ) : null}

      {loading ? <div className="content-panel">Loading dashboard...</div> : null}
      {error ? <div className="content-panel error-text">{error}</div> : null}

      {!loading && !error ? (
        isApproved ? (
          <>
            <section className="stack">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Current curriculum</p>
                  <h3>Accessible courses</h3>
                </div>
              </div>
              <div className="course-grid">
                {accessibleCourses.length > 0 ? (
                  accessibleCourses.map((course) => <CourseCard course={course} key={course.id} />)
                ) : (
                  <div className="content-panel">No accessible courses yet.</div>
                )}
              </div>
            </section>

            <section className="stack">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Premium tracks</p>
                  <h3>Locked paid courses</h3>
                </div>
              </div>
              <div className="course-grid">
                {lockedCourses.length > 0 ? (
                  lockedCourses.map((course) => <CourseCard course={course} key={course.id} />)
                ) : (
                  <div className="content-panel">
                    All published courses are already unlocked for you.
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          <section className="stack">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Payment queue</p>
                <h3>Choose a paid course and submit payment</h3>
              </div>
            </div>
            <div className="course-grid">
              {paidCourses.length > 0 ? (
                paidCourses.map((course) => (
                  <CourseCard course={course} key={course.id} primaryAction="payment" />
                ))
              ) : (
                <div className="content-panel">No paid courses are published yet.</div>
              )}
            </div>
          </section>
        )
      ) : null}
    </div>
  );
}
