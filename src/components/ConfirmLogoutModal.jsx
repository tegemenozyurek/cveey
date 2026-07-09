import { useLanguage } from '../context/LanguageContext'

export default function ConfirmLogoutModal({ onConfirm, onCancel }) {
  const { t } = useLanguage()

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal confirm-modal"
        role="dialog"
        aria-labelledby="logout-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="logout-title" className="confirm-title">{t('logout.title')}</h2>
        <p className="confirm-text">{t('logout.text')}</p>
        <div className="confirm-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            {t('logout.cancel')}
          </button>
          <button type="button" className="btn-gradient-wrap confirm-action-primary" onClick={onConfirm}>
            <span className="btn-gradient-inner">{t('logout.confirm')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
