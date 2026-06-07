export default function DeviceWarning({ message, onClose }) {
  if (!message) {
    return null;
  }

  return (
    <div className="warning-banner" role="alert">
      <div>
        <p className="eyebrow">Access warning</p>
        <strong>Device limit reached</strong>
        <p>{message}</p>
      </div>
      <button className="button button-secondary" onClick={onClose} type="button">
        Dismiss
      </button>
    </div>
  );
}
