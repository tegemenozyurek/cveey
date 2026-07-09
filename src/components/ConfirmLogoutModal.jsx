import { useLanguage } from '../context/LanguageContext'

function LogoutIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function ConfirmLogoutModal({ onConfirm, onCancel }) {
  const { t } = useLanguage()

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="confirm-logout-modal"
        role="dialog"
        aria-labelledby="logout-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-logout-content">
          <div className="confirm-logout-icon">
            <LogoutIcon />
          </div>
          <h2 id="logout-title" className="confirm-logout-title">{t('logout.title')}</h2>
          <p className="confirm-logout-text">{t('logout.text')}</p>
        </div>

        <div className="confirm-actions confirm-actions--logout">
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
