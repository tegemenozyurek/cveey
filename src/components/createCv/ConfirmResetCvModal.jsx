import { useLanguage } from '../../context/LanguageContext'

function ResetIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 12a9 9 0 0 1 15.5-6.36M21 12a9 9 0 0 1-15.5 6.36"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M3 5v5h5M21 19v-5h-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function ConfirmResetCvModal({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}) {
  const { t } = useLanguage()

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal confirm-modal"
        role="dialog"
        aria-labelledby="create-cv-reset-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="confirm-icon">
          <ResetIcon />
        </div>
        <h2 id="create-cv-reset-title" className="confirm-title">{title}</h2>
        <p className="confirm-text">{message}</p>
        <div className="confirm-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            {t('myCv.cancel')}
          </button>
          <button type="button" className="btn btn-destructive" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
