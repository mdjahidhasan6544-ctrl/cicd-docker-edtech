import { Link, useParams } from "react-router-dom";

import VideoPlayer from "../components/VideoPlayer.jsx";

export default function LessonPlayer() {
  const { id } = useParams();

  return (
    <div className="stack page-gap">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Lesson studio</p>
          <h2>Read, watch, review, then move directly into practice.</h2>
        </div>
        <div className="button-row">
          <Link className="button button-secondary" to="/practice">
            Practice hub
          </Link>
          <Link className="button button-secondary" to="/dashboard">
            Back to dashboard
          </Link>
        </div>
      </div>
      <VideoPlayer lessonId={id} />
    </div>
  );
}
