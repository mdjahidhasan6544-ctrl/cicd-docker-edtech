import { useEffect, useState } from "react";

import axiosInstance from "../api/axiosInstance.js";

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default function LiveClasses() {
  const [liveClasses, setLiveClasses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadLiveClasses() {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/live-classes");

        if (!isMounted) {
          return;
        }

        setLiveClasses(response.data.liveClasses);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(requestError.response?.data?.message || "Unable to load live classes");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadLiveClasses();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="stack page-gap">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Live schedule</p>
          <h2>Upcoming classes, controlled join links, and recordings in one timeline.</h2>
          <p>Meeting links appear shortly before class starts. Published recordings remain available after the session.</p>
        </div>
      </section>

      {loading ? <div className="content-panel">Loading live classes...</div> : null}
      {error ? <div className="content-panel error-text">{error}</div> : null}

      <section className="stack">
        {liveClasses.map((liveClass) => (
          <article className="content-panel" key={liveClass.id}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">{liveClass.isUpcoming ? "Upcoming" : "Completed"}</p>
                <h3>{liveClass.title}</h3>
                <p>{formatDateTime(liveClass.scheduledAt)}</p>
              </div>
              <div className="button-row">
                {liveClass.canJoin ? (
                  <a className="button button-primary" href={liveClass.meetLink} rel="noreferrer" target="_blank">
                    Join class
                  </a>
                ) : (
                  <span className="pill pill-warning">Join link hidden</span>
                )}
                {liveClass.recordingUrl ? (
                  <a className="button button-secondary" href={liveClass.recordingUrl} rel="noreferrer" target="_blank">
                    Recording
                  </a>
                ) : null}
              </div>
            </div>
            <p>{liveClass.description || "No class notes yet."}</p>
          </article>
        ))}
        {!loading && !liveClasses.length ? (
          <div className="content-panel">No live classes have been published yet.</div>
        ) : null}
      </section>
    </div>
  );
}
