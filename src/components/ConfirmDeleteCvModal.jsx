import { useLanguage } from '../context/LanguageContext'

function DeleteIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M8 6V4.5A1.5 1.5 0 019.5 3h5A1.5 1.5 0 0116 4.5V6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 6l.8 14.2A2 2 0 008.8 22h6.4a2 2 0 001.99-1.8L18 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 11v5M14 11v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function ConfirmDeleteCvModal({ cvName, onConfirm, onCancel, loading }) {
  const { t } = useLanguage()

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="confirm-logout-modal confirm-delete-cv-modal"
        role="dialog"
        aria-labelledby="delete-cv-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="confirm-logout-content">
          <div className="confirm-logout-icon confirm-delete-cv-icon">
            <DeleteIcon />
          </div>
          <h2 id="delete-cv-title" className="confirm-logout-title">{t('myCv.deleteTitle')}</h2>
          <p className="confirm-logout-text">{t('myCv.deleteWarning')}</p>
          {cvName && (
            <p className="confirm-delete-cv-name" title={cvName}>{cvName}</p>
          )}
        </div>

        <div className="confirm-actions confirm-actions--logout">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={loading}>
            {t('myCv.cancel')}
          </button>
          <button type="button" className="btn btn-destructive" onClick={onConfirm} disabled={loading}>
            {loading ? t('myCv.deleting') : t('myCv.delete')}
          </button>
        </div>
      </div>
    </div>
  )
}
