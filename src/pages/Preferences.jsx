import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import LanguageSwitcher from '../components/LanguageSwitcher'
import ThemeSwitcher from '../components/ThemeSwitcher'
import { resolveAuthMethod } from '../authUtils'

function authMethodLabel(method, t) {
  if (method === 'google') return t('profile.authGoogle')
  if (method === 'github') return t('profile.authGithub')
  return t('profile.authEmail')
}

export default function Preferences() {
  const { user, authLoading, setShowLogoutConfirm } = useAuth()
  const { t } = useLanguage()

  if (authLoading) {
    return (
      <main className="main">
        <p className="page-loading">{t('prefs.loading')}</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="main">
      <div className="page-header">
        <h1 className="page-title">{t('prefs.title')}</h1>
        <p className="page-subtitle">{t('prefs.subtitle')}</p>
      </div>

      <div className="prefs-card">
        <div className="prefs-row">
          <div className="prefs-row-info">
            <p className="prefs-row-label">{t('profile.signInMethod')}</p>
            <p className="prefs-row-hint">{authMethodLabel(resolveAuthMethod(user), t)}</p>
          </div>
        </div>

        <div className="prefs-divider" />

        <div className="prefs-row">
          <div className="prefs-row-info">
            <p className="prefs-row-label">{t('prefs.language')}</p>
            <p className="prefs-row-hint">{t('prefs.languageHint')}</p>
          </div>
          <LanguageSwitcher />
        </div>

        <div className="prefs-divider" />

        <div className="prefs-row">
          <div className="prefs-row-info">
            <p className="prefs-row-label">{t('prefs.theme')}</p>
            <p className="prefs-row-hint">{t('prefs.themeHint')}</p>
          </div>
          <ThemeSwitcher />
        </div>

        <div className="prefs-divider" />

        <div className="prefs-row">
          <div className="prefs-row-info">
            <p className="prefs-row-label">{t('prefs.logout')}</p>
            <p className="prefs-row-hint">{t('prefs.logoutHint')}</p>
          </div>
          <button
            type="button"
            className="prefs-logout-btn"
            onClick={() => setShowLogoutConfirm(true)}
          >
            {t('nav.logout')}
          </button>
        </div>
      </div>
    </main>
  )
}
