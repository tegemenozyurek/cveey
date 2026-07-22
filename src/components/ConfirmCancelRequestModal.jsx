import { useLanguage } from '../context/LanguageContext'

export default function ConfirmCancelRequestModal({
  title,
  text,
  confirmLabel,
  keepLabel,
  onConfirm,
  onCancel,
  busy = false,
  danger = false,
}) {
  const { t } = useLanguage()

  const resolvedTitle = title || t('profile.cancelRequestTitle')
  const resolvedText = text || t('profile.cancelRequestText')
  const resolvedConfirm = confirmLabel || t('profile.cancelRequestConfirm')
  const resolvedKeep = keepLabel || t('profile.cancelRequestKeep')

  return (
    <div className="modal-backdrop" onClick={busy ? undefined : onCancel}>
      <div
        className="confirm-logout-modal"
        role="dialog"
        aria-labelledby="cancel-request-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-logout-content">
          <h2 id="cancel-request-title" className="confirm-logout-title">
            {resolvedTitle}
          </h2>
          <p className="confirm-logout-text">{resolvedText}</p>
        </div>

        <div className="confirm-actions confirm-actions--logout">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
            {resolvedKeep}
          </button>
          <button
            type="button"
            className={`btn-gradient-wrap confirm-action-primary${
              danger ? ' confirm-action-primary--danger' : ''
            }`}
            onClick={onConfirm}
            disabled={busy}
          >
            <span className="btn-gradient-inner">{resolvedConfirm}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
