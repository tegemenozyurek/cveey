import UnderConstruction from '../components/UnderConstruction'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function Jobs() {
  const { user, openLogin, authLoading } = useAuth()
  const { t } = useLanguage()

  if (authLoading) {
    return (
      <main className="main">
        <p className="page-loading">{t('jobs.loading')}</p>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="main">
        <div className="empty-state">
          <div className="empty-state-icon" aria-hidden="true">
            <i className="fa-solid fa-lock" />
          </div>
          <h2 className="empty-state-title">{t('jobs.signInRequired')}</h2>
          <p className="empty-state-text">{t('jobs.signInText')}</p>
          <button type="button" className="btn-gradient-wrap" onClick={openLogin}>
            <span className="btn-gradient-inner">{t('nav.signIn')}</span>
          </button>
        </div>
      </main>
    )
  }

  return <UnderConstruction />
}
