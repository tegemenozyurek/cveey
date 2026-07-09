export default function ConfirmDeleteModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal confirm-modal"
        role="dialog"
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 id="confirm-title" className="confirm-title">Delete account</h2>
        <p className="confirm-text">
          Your account and all associated data will be permanently deleted. This action cannot be undone.
        </p>
        <div className="confirm-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn btn-destructive" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : 'Delete account'}
          </button>
        </div>
      </div>
    </div>
  )
}
