import { useEffect, useState } from "react";

import axiosInstance from "../api/axiosInstance.js";

const initialForm = {
  title: "",
  description: "",
  meetLink: "",
  scheduledAt: "",
  recordingUrl: "",
  isPublished: false
};

export default function AdminLiveClasses() {
  const [liveClasses, setLiveClasses] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [edits, setEdits] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadLiveClasses() {
    try {
      const response = await axiosInstance.get("/api/admin/live-classes");
      setLiveClasses(response.data.liveClasses);
      setEdits(
        response.data.liveClasses.reduce((result, liveClass) => {
          result[liveClass._id] = {
            title: liveClass.title,
            description: liveClass.description || "",
            meetLink: liveClass.meetLink || "",
            scheduledAt: liveClass.scheduledAt?.slice(0, 16) || "",
            recordingUrl: liveClass.recordingUrl || "",
            isPublished: Boolean(liveClass.isPublished)
          };
          return result;
        }, {})
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load live classes");
    }
  }

  useEffect(() => {
    loadLiveClasses();
  }, []);

  function updateFormState(setter, event, id) {
    const { name, value, type, checked } = event.target;

    if (id) {
      setEdits((current) => ({
        ...current,
        [id]: {
          ...current[id],
          [name]: type === "checkbox" ? checked : value
        }
      }));
      return;
    }

    setter((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  async function createLiveClass(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await axiosInstance.post("/api/admin/live-classes", form);
      setForm(initialForm);
      setMessage("Live class scheduled");
      await loadLiveClasses();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create live class");
    }
  }

  async function saveLiveClass(id) {
    setError("");
    setMessage("");

    try {
      await axiosInstance.patch(`/api/admin/live-classes/${id}`, edits[id]);
      setMessage("Live class updated");
      await loadLiveClasses();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update live class");
    }
  }

  return (
    <div className="stack page-gap">
      <section className="section-heading">
        <div>
          <p className="eyebrow">Live delivery</p>
          <h2>Schedule classes, control publishing, and attach recordings.</h2>
        </div>
      </section>

      {error ? <div className="content-panel error-text">{error}</div> : null}
      {message ? <div className="content-panel success-text">{message}</div> : null}

      <form className="content-panel stack" onSubmit={createLiveClass}>
        <h3>Schedule live class</h3>
        <input className="input" name="title" onChange={(event) => updateFormState(setForm, event)} placeholder="Live class title" value={form.title} />
        <textarea className="input textarea" name="description" onChange={(event) => updateFormState(setForm, event)} placeholder="Description" value={form.description} />
        <input className="input" name="meetLink" onChange={(event) => updateFormState(setForm, event)} placeholder="Meeting link" value={form.meetLink} />
        <input className="input" name="scheduledAt" onChange={(event) => updateFormState(setForm, event)} type="datetime-local" value={form.scheduledAt} />
        <input className="input" name="recordingUrl" onChange={(event) => updateFormState(setForm, event)} placeholder="Recording URL" value={form.recordingUrl} />
        <label className="checkbox-row">
          <input checked={form.isPublished} name="isPublished" onChange={(event) => updateFormState(setForm, event)} type="checkbox" />
          <span>Publish immediately</span>
        </label>
        <button className="button button-primary" type="submit">
          Schedule class
        </button>
      </form>

      <div className="stack">
        {liveClasses.map((liveClass) => (
          <article className="content-panel stack" key={liveClass._id}>
            <div className="section-heading">
              <div>
                <h3>{liveClass.title}</h3>
                <p>{new Date(liveClass.scheduledAt).toLocaleString()}</p>
              </div>
              <span className={`pill ${liveClass.isPublished ? "pill-success" : "pill-warning"}`}>
                {liveClass.isPublished ? "Published" : "Draft"}
              </span>
            </div>
            <input className="input" name="title" onChange={(event) => updateFormState(setForm, event, liveClass._id)} value={edits[liveClass._id]?.title || ""} />
            <textarea className="input textarea" name="description" onChange={(event) => updateFormState(setForm, event, liveClass._id)} value={edits[liveClass._id]?.description || ""} />
            <input className="input" name="meetLink" onChange={(event) => updateFormState(setForm, event, liveClass._id)} value={edits[liveClass._id]?.meetLink || ""} />
            <input className="input" name="scheduledAt" onChange={(event) => updateFormState(setForm, event, liveClass._id)} type="datetime-local" value={edits[liveClass._id]?.scheduledAt || ""} />
            <input className="input" name="recordingUrl" onChange={(event) => updateFormState(setForm, event, liveClass._id)} value={edits[liveClass._id]?.recordingUrl || ""} />
            <label className="checkbox-row">
              <input
                checked={edits[liveClass._id]?.isPublished || false}
                name="isPublished"
                onChange={(event) => updateFormState(setForm, event, liveClass._id)}
                type="checkbox"
              />
              <span>Published</span>
            </label>
            <div className="button-row">
              <button className="button button-primary" onClick={() => saveLiveClass(liveClass._id)} type="button">
                Save changes
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
