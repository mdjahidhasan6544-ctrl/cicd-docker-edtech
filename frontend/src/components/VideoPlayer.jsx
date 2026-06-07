import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import axiosInstance from "../api/axiosInstance.js";
import { decorateLesson } from "../utils/academyData.js";
import { extractYouTubeId } from "../utils/lessonContent.js";

const lessonTypeLabels = {
  youtube: "Video",
  google_doc: "Google Doc",
  pdf: "PDF",
  pptx: "PPTX"
};

function buildLessonEmbedUrl(lesson) {
  const contentType = lesson.contentType || "youtube";

  if (contentType === "youtube") {
    const videoId = extractYouTubeId(lesson.youtubeId);

    return videoId
      ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
      : "";
  }

  return "";
}

export default function VideoPlayer({ lessonId }) {
  const [lesson, setLesson] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadLesson() {
      try {
        setLoading(true);
        setError("");
        const response = await axiosInstance.get(`/api/lessons/${lessonId}`);

        if (!isMounted) {
          return;
        }

        setLesson(
          decorateLesson(response.data.lesson, {
            subject: response.data.lesson.subject,
            courseTitle: response.data.lesson.courseTitle,
            moduleTitle: response.data.lesson.moduleTitle
          })
        );
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(requestError.response?.data?.message || "Unable to load lesson");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadLesson();

    return () => {
      isMounted = false;
    };
  }, [lessonId]);

  if (loading) {
    return <div className="content-panel">Loading lesson...</div>;
  }

  if (error) {
    return <div className="content-panel error-text">{error}</div>;
  }

  const contentType = lesson.contentType || "youtube";
  const embedUrl = buildLessonEmbedUrl(lesson);

  return (
    <section className="lesson-layout">
      <div className="video-shell">
        <div className="video-frame">
          {embedUrl ? (
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              src={embedUrl}
              title={lesson.title}
            />
          ) : (
            <div className="content-panel compact-panel">
              This lesson opens in a new tab from the course page.
            </div>
          )}
        </div>

        <div className="content-panel compact-panel">
          <p className="eyebrow">
            {lesson.level || "Cambridge lesson"} · {lessonTypeLabels[contentType]}
          </p>
          <h2>{lesson.title}</h2>
          <p>
            {lesson.courseTitle} · {lesson.chapterTitle} · {lesson.topic}
          </p>
          <div className="button-row">
            <button
              className={`button ${completed ? "button-secondary" : "button-primary"}`}
              onClick={() => setCompleted((current) => !current)}
              type="button"
            >
              {completed ? "Marked complete" : "Mark lesson complete"}
            </button>
            <Link className="button button-secondary" to="/practice">
              Start practice quiz
            </Link>
            {lesson.notesUrl ? (
              <a className="button button-secondary" href={lesson.notesUrl} rel="noreferrer" target="_blank">
                Download notes
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <aside className="lesson-sidebar">
        <article className="content-panel">
          <p className="eyebrow">Learning objectives</p>
          <div className="stack">
            {lesson.learningObjectives.map((item) => (
              <div className="objective-row" key={item}>
                <span />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="content-panel">
          <p className="eyebrow">Worked example</p>
          <h3>Example problem</h3>
          <p>{lesson.exampleProblem}</p>
        </article>

        <article className="content-panel">
          <p className="eyebrow">Summary</p>
          <p>{lesson.summary}</p>
          <p className="muted-copy">{lesson.practiceHint}</p>
        </article>
      </aside>
    </section>
  );
}
