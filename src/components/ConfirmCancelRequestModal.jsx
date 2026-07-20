import { useLanguage } from '../context/LanguageContext'

export default function ConfirmCancelRequestModal({ onConfirm, onCancel, busy = false }) {
  const { t } = useLanguage()

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
            {t('profile.cancelRequestTitle')}
          </h2>
          <p className="confirm-logout-text">{t('profile.cancelRequestText')}</p>
        </div>

        <div className="confirm-actions confirm-actions--logout">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
            {t('profile.cancelRequestKeep')}
          </button>
          <button
            type="button"
            className="btn-gradient-wrap confirm-action-primary"
            onClick={onConfirm}
            disabled={busy}
          >
            <span className="btn-gradient-inner">{t('profile.cancelRequestConfirm')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
