import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import UserAvatar from '../components/UserAvatar'
import { resolveAuthMethod } from '../authUtils'

function authMethodLabel(method, t) {
  if (method === 'google') return t('profile.authGoogle')
  if (method === 'github') return t('profile.authGithub')
  return t('profile.authEmail')
}

export default function Profile() {
  const { user, authLoading } = useAuth()
  const { t } = useLanguage()

  if (authLoading) {
    return (
      <main className="main">
        <p className="page-loading">{t('profile.loading')}</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="main">
      <div className="page-header">
        <h1 className="page-title">{t('profile.title')}</h1>
        <p className="page-subtitle">{t('profile.subtitle')}</p>
      </div>

      <div className="profile-page-card">
        <div className="profile-page-identity">
          <UserAvatar user={user} className="profile-page-avatar" />
          <div className="profile-page-identity-text">
            <p className="profile-page-name">
              {user.displayName || user.email?.split('@')[0] || t('profile.untitled')}
            </p>
            <p className="profile-page-email">{user.email}</p>
          </div>
        </div>

        <div className="prefs-divider" />

        <div className="profile-page-meta">
          <div className="profile-page-meta-row">
            <span className="profile-page-meta-label">{t('profile.signInMethod')}</span>
            <span className="profile-page-meta-value">
              {authMethodLabel(resolveAuthMethod(user), t)}
            </span>
          </div>
        </div>

        <div className="prefs-divider" />

        <Link to="/preferences" className="profile-page-link">
          <span>{t('nav.preferences')}</span>
          <span className="profile-page-link-arrow" aria-hidden="true">→</span>
        </Link>
      </div>
    </main>
  )
}
