import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useResume } from '../context/ResumeContext'
import UserAvatar from '../components/UserAvatar'
import LanguageSwitcher from '../components/LanguageSwitcher'
import ThemeSwitcher from '../components/ThemeSwitcher'
import { resolveAuthMethod } from '../authUtils'

const MOCK_MY_NETWORK = [
  {
    id: 'n1',
    displayName: 'Ayşe Kara',
    headline: 'Backend Engineer · Go',
    location: 'Istanbul, TR',
    photoURL: null,
  },
  {
    id: 'n2',
    displayName: 'James Okonkwo',
    headline: 'Engineering Manager',
    location: 'Amsterdam, NL',
    photoURL: null,
  },
  {
    id: 'n3',
    displayName: 'Lina Andersson',
    headline: 'UX Researcher',
    location: 'Stockholm, SE',
    photoURL: null,
  },
]

const PROFILE_INFO_FIELDS = [
  { key: 'fullName', labelKey: 'profile.fullName' },
  { key: 'gender', labelKey: 'profile.gender' },
  { key: 'birthday', labelKey: 'profile.birthday' },
  { key: 'bio', labelKey: 'profile.bio', multiline: true },
  { key: 'profession', labelKey: 'profile.profession' },
  { key: 'education', labelKey: 'profile.education' },
  { key: 'department', labelKey: 'profile.department' },
  { key: 'graduationDate', labelKey: 'profile.graduationDate' },
  { key: 'experiences', labelKey: 'profile.experiences', list: true },
  { key: 'skills', labelKey: 'profile.skills', list: true },
  { key: 'languages', labelKey: 'profile.languages', list: true },
]

function authMethodLabel(method, t) {
  if (method === 'google') return t('profile.authGoogle')
  if (method === 'github') return t('profile.authGithub')
  return t('profile.authEmail')
}

function PeopleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MessageIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 6l-10 7L2 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PersonRow({ person, actionLabel, iconOnly = false }) {
  return (
    <li className="network-person">
      <UserAvatar user={person} className="network-person-avatar" />
      <div className="network-person-info">
        <p className="network-person-name">{person.displayName || person.email}</p>
        {person.headline ? <p className="network-person-headline">{person.headline}</p> : null}
        {person.location || person.homeCity ? (
          <p className="network-person-location">{person.location || person.homeCity}</p>
        ) : null}
      </div>
      <button
        type="button"
        className={`network-connect-btn${iconOnly ? ' network-connect-btn--icon' : ''}`}
        aria-label={actionLabel}
        title={actionLabel}
      >
        {iconOnly ? <MessageIcon /> : actionLabel}
      </button>
    </li>
  )
}

function ProfileField({ label, value, multiline = false, list = false, emptyLabel }) {
  const isEmptyList = list && (!Array.isArray(value) || value.length === 0)
  const isEmptyText = !list && (value == null || String(value).trim() === '')

  return (
    <div className="profile-info-field">
      <p className="profile-info-label">{label}</p>
      {list ? (
        isEmptyList ? (
          <p className="profile-info-value profile-info-value--empty">{emptyLabel}</p>
        ) : (
          <ul className="profile-info-list">
            {value.map((item) => (
              <li key={item} className="profile-info-list-item">
                {item}
              </li>
            ))}
          </ul>
        )
      ) : (
        <p
          className={`profile-info-value${isEmptyText ? ' profile-info-value--empty' : ''}${
            multiline ? ' profile-info-value--multiline' : ''
          }`}
        >
          {isEmptyText ? emptyLabel : value}
        </p>
      )}
    </div>
  )
}

function ActiveCvPanel({ t }) {
  const navigate = useNavigate()
  const { activeCv, activePreviewUrl, activePreviewLoading, loading } = useResume()
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [cvHidden, setCvHidden] = useState(false)

  useEffect(() => {
    setIframeLoaded(false)
  }, [activePreviewUrl, activeCv?.id])

  function handlePreview() {
    if (!activePreviewUrl) return
    window.open(activePreviewUrl, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <section className="profile-cv-panel" aria-labelledby="profile-active-cv-heading">
        <h2 id="profile-active-cv-heading" className="profile-cv-title">
          {t('profile.activeCv')}
        </h2>
        <div className="profile-cv-preview">
          <div className="profile-cv-preview-status">
            <span className="cv-preview-spinner" aria-hidden="true" />
            <p>{t('myCv.previewLoading')}</p>
          </div>
        </div>
      </section>
    )
  }

  if (!activeCv) {
    return (
      <section className="profile-cv-panel" aria-labelledby="profile-active-cv-heading">
        <h2 id="profile-active-cv-heading" className="profile-cv-title">
          {t('profile.activeCv')}
        </h2>
        <div className="profile-cv-empty">
          <p className="profile-cv-empty-title">{t('profile.cvEmpty')}</p>
          <p className="profile-cv-empty-hint">{t('profile.cvEmptyHint')}</p>
          <Link to="/my-cv" className="profile-cv-action profile-cv-action--primary">
            {t('profile.goToMyCv')}
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="profile-cv-panel" aria-labelledby="profile-active-cv-heading">
      <h2 id="profile-active-cv-heading" className="profile-cv-title">
        {t('profile.activeCv')}
      </h2>

      <div className="profile-cv-preview">
        {cvHidden ? (
          <div className="profile-cv-preview-status">
            <p>{t('profile.cvHidden')}</p>
          </div>
        ) : (
          <>
            {(activePreviewLoading || (activePreviewUrl && !iframeLoaded)) && (
              <div className="profile-cv-preview-status" aria-live="polite">
                <span className="cv-preview-spinner" aria-hidden="true" />
                <p>{t('myCv.previewLoading')}</p>
              </div>
            )}

            {activePreviewUrl ? (
              <iframe
                key={activeCv.id || activeCv.fullPath}
                src={`${activePreviewUrl}#toolbar=0&navpanes=0`}
                title={activeCv.displayName || t('profile.activeCv')}
                className={`profile-cv-preview-frame${iframeLoaded ? ' profile-cv-preview-frame--ready' : ''}`}
                onLoad={() => setIframeLoaded(true)}
              />
            ) : !activePreviewLoading ? (
              <div className="profile-cv-preview-status">
                <p>{t('myCv.previewError')}</p>
              </div>
            ) : null}
          </>
        )}
      </div>

      <div className="profile-cv-actions">
        <button
          type="button"
          className="profile-cv-action"
          onClick={handlePreview}
          disabled={cvHidden || !activePreviewUrl}
        >
          {t('profile.cvPreview')}
        </button>
        <button
          type="button"
          className="profile-cv-action"
          onClick={() => navigate('/my-cv')}
        >
          {t('profile.cvChange')}
        </button>
        <button
          type="button"
          className="profile-cv-action"
          onClick={() => setCvHidden((v) => !v)}
        >
          {cvHidden ? t('profile.cvShow') : t('profile.cvHide')}
        </button>
      </div>
    </section>
  )
}

export default function Profile() {
  const { user, authLoading, setShowLogoutConfirm } = useAuth()
  const { t } = useLanguage()
  const [panel, setPanel] = useState(null)

  const profileInfo = {
    fullName: user?.displayName || '',
    gender: '',
    birthday: '',
    bio: '',
    profession: '',
    education: '',
    department: '',
    graduationDate: '',
    experiences: [],
    skills: [],
    languages: [],
  }

  function togglePanel(next) {
    setPanel((current) => (current === next ? null : next))
  }

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
      <div className="profile-page-card">
        <div className="profile-page-identity">
          <UserAvatar user={user} className="profile-page-avatar" />
          <div className="profile-page-identity-text">
            <p className="profile-page-name">
              {user.displayName || user.email?.split('@')[0] || t('profile.untitled')}
            </p>
            <p className="profile-page-email">{user.email}</p>
          </div>
          <div className="profile-page-actions">
            <button
              type="button"
              className={`profile-page-icon-btn${panel === 'network' ? ' profile-page-icon-btn--active' : ''}`}
              onClick={() => togglePanel('network')}
              aria-pressed={panel === 'network'}
              aria-label={t('network.myNetworks')}
              title={t('network.myNetworks')}
            >
              <PeopleIcon />
            </button>
            <button
              type="button"
              className={`profile-page-icon-btn${panel === 'settings' ? ' profile-page-icon-btn--active' : ''}`}
              onClick={() => togglePanel('settings')}
              aria-pressed={panel === 'settings'}
              aria-label={t('nav.preferences')}
              title={t('nav.preferences')}
            >
              <SettingsIcon />
            </button>
          </div>
        </div>

        {panel === 'network' ? (
          <>
            <div className="prefs-divider" />
            <div className="profile-page-panel">
              <div className="profile-page-panel-head">
                <p className="profile-page-panel-title">{t('network.myNetworks')}</p>
                <button
                  type="button"
                  className="profile-page-icon-btn profile-page-panel-close"
                  onClick={() => setPanel(null)}
                  aria-label={t('login.close')}
                  title={t('login.close')}
                >
                  <CloseIcon />
                </button>
              </div>
              <ul className="network-people-list">
                {MOCK_MY_NETWORK.map((person) => (
                  <PersonRow
                    key={person.id}
                    person={person}
                    actionLabel={t('network.message')}
                    iconOnly
                  />
                ))}
              </ul>
            </div>
          </>
        ) : null}

        {panel === 'settings' ? (
          <>
            <div className="prefs-divider" />
            <div className="profile-page-panel">
              <div className="profile-page-panel-head">
                <p className="profile-page-panel-title">{t('nav.preferences')}</p>
                <button
                  type="button"
                  className="profile-page-icon-btn profile-page-panel-close"
                  onClick={() => setPanel(null)}
                  aria-label={t('login.close')}
                  title={t('login.close')}
                >
                  <CloseIcon />
                </button>
              </div>
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
          </>
        ) : null}
      </div>

      <div className="profile-page-main">
        <section className="profile-info-panel" aria-label={t('profile.title')}>
          {PROFILE_INFO_FIELDS.map((field) => (
            <ProfileField
              key={field.key}
              label={t(field.labelKey)}
              value={profileInfo[field.key]}
              multiline={field.multiline}
              list={field.list}
              emptyLabel={t('profile.empty')}
            />
          ))}
        </section>

        <ActiveCvPanel t={t} />
      </div>
    </main>
  )
}
