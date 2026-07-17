import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useResume } from '../context/ResumeContext'
import UserAvatar from '../components/UserAvatar'
import LanguageSwitcher from '../components/LanguageSwitcher'
import ThemeSwitcher from '../components/ThemeSwitcher'
import { resolveAuthMethod } from '../authUtils'
import { getUserProfile, saveUserProfileField } from '../userService'

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

function authMethodLabel(method, t) {
  if (method === 'google') return t('profile.authGoogle')
  if (method === 'github') return t('profile.authGithub')
  return t('profile.authEmail')
}

function stripPdfExtension(name) {
  if (!name) return ''
  return name.replace(/\.pdf$/i, '')
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

function PinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 22s7-7.2 7-12.2A7 7 0 1 0 5 9.8C5 14.8 12 22 12 22Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.25" stroke="currentColor" strokeWidth="1.75" />
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

function EditIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20h9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M16.5 3.5a2.12 2.12 0 013 3L8 18l-4 1 1-4L16.5 3.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function EditableProfileField({
  t,
  label,
  value,
  fallback,
  multiline = false,
  maxLength,
  valueClassName,
  onSave,
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value || fallback)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fieldRef = useRef(null)

  useEffect(() => {
    if (!editing) setDraft(value || fallback)
  }, [editing, fallback, value])

  useEffect(() => {
    if (editing) fieldRef.current?.focus()
  }, [editing])

  function startEditing() {
    setDraft(value || fallback)
    setError('')
    setEditing(true)
  }

  function cancelEditing() {
    setDraft(value || fallback)
    setError('')
    setEditing(false)
  }

  async function save() {
    const nextValue = draft.trim()
    if (!nextValue) {
      setError(t('profile.fieldRequired'))
      return
    }
    if (nextValue === value) {
      setEditing(false)
      return
    }

    setSaving(true)
    setError('')
    try {
      await onSave(nextValue)
      setEditing(false)
    } catch (err) {
      console.error(`Profile ${label} update failed:`, err)
      setError(t('profile.updateError'))
    } finally {
      setSaving(false)
    }
  }

  const fieldProps = {
    ref: fieldRef,
    className: `profile-about-edit-field${multiline ? ' profile-about-edit-field--textarea' : ''}`,
    value: draft,
    onChange: (event) => setDraft(event.target.value),
    onKeyDown: (event) => {
      if (event.key === 'Escape') cancelEditing()
      if (!multiline && event.key === 'Enter') void save()
      if (multiline && event.key === 'Enter' && (event.metaKey || event.ctrlKey)) void save()
    },
    disabled: saving,
    maxLength,
    'aria-label': label,
  }

  return (
    <>
      <div className="profile-about-field-head">
        <p className="profile-about-kicker">{label}</p>
        {!editing ? (
          <button
            type="button"
            className="profile-about-edit-btn"
            onClick={startEditing}
            aria-label={`${t('profile.edit')} ${label}`}
            title={t('profile.edit')}
          >
            <EditIcon />
          </button>
        ) : null}
      </div>

      {editing ? (
        <div className="profile-about-edit">
          {multiline ? <textarea {...fieldProps} rows={7} /> : <input {...fieldProps} type="text" />}
          <div className="profile-about-edit-actions">
            <button type="button" onClick={() => void save()} disabled={saving}>
              {saving ? t('profile.saving') : t('profile.save')}
            </button>
            <button type="button" onClick={cancelEditing} disabled={saving}>
              {t('profile.cancel')}
            </button>
          </div>
          {error ? <p className="profile-about-edit-error" role="alert">{error}</p> : null}
        </div>
      ) : (
        <p className={valueClassName}>{value || fallback}</p>
      )}
    </>
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

function ProfileAboutSection({
  t,
  bachelor,
  summary,
  preferredWorkCities,
  loading,
  onSaveBachelor,
  onSaveSummary,
}) {
  const workCities = preferredWorkCities.length > 0 ? preferredWorkCities : []

  return (
    <section className="profile-about" aria-label={t('profile.sectionAbout')}>
      <div className="profile-about-side">
        <div className="profile-about-degree">
          <EditableProfileField
            t={t}
            label={t('profile.bachelor')}
            value={bachelor}
            fallback={t('profile.bachelorMock')}
            maxLength={120}
            valueClassName="profile-about-lead"
            onSave={onSaveBachelor}
          />
          <p className="profile-about-kicker profile-about-kicker--follow">{t('profile.position')}</p>
          <p className="profile-about-position">{t('profile.positionMock')}</p>
        </div>

        {workCities.length > 0 || loading ? (
          <div className="profile-about-work">
            <p className="profile-about-kicker">{t('profile.workCities')}</p>
            {loading ? (
              <p className="profile-about-loc-empty">…</p>
            ) : (
              <ul className="profile-about-city-list">
                {workCities.map((city) => (
                  <li key={city}>
                    <span className="profile-about-city-dot" aria-hidden="true" />
                    <span>{city}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>

      <div className="profile-about-main">
        <EditableProfileField
          t={t}
          label={t('profile.summary')}
          value={summary}
          fallback={t('profile.summaryMock')}
          multiline
          maxLength={1200}
          valueClassName="profile-about-bio"
          onSave={onSaveSummary}
        />
      </div>
    </section>
  )
}

function ActiveCvPanel({ t }) {
  const navigate = useNavigate()
  const { activeCv, activePreviewUrl, loading } = useResume()
  const [cvHidden, setCvHidden] = useState(false)

  function handlePreview() {
    if (!activePreviewUrl) return
    window.open(activePreviewUrl, '_blank', 'noopener,noreferrer')
  }

  const paperName = stripPdfExtension(activeCv?.displayName) || t('profile.activeCv')

  return (
    <section className="profile-cv-post" aria-labelledby="profile-active-cv-heading">
      <div className="profile-cv-post-media">
        <div className={`profile-cv-sheet${cvHidden ? ' profile-cv-sheet--hidden' : ''}`}>
          {loading ? (
            <div className="profile-cv-sheet-status">
              <span className="cv-preview-spinner" aria-hidden="true" />
            </div>
          ) : cvHidden ? (
            <div className="profile-cv-sheet-status">
              <p>{t('profile.cvHidden')}</p>
            </div>
          ) : !activeCv ? (
            <div className="profile-cv-sheet-status">
              <p>{t('profile.cvEmptyHint')}</p>
            </div>
          ) : (
            <button
              type="button"
              className="profile-cv-paper"
              onClick={handlePreview}
              disabled={!activePreviewUrl}
              aria-label={t('profile.cvPreview')}
              title={t('profile.cvPreview')}
            >
              <div className="profile-cv-paper-accent" />
              <div className="profile-cv-paper-body">
                <div className="profile-cv-paper-name">{paperName}</div>
                <div className="profile-cv-paper-rule" />
                <div className="profile-cv-paper-line profile-cv-paper-line--long" />
                <div className="profile-cv-paper-line" />
                <div className="profile-cv-paper-line profile-cv-paper-line--mid" />
                <div className="profile-cv-paper-block">
                  <div className="profile-cv-paper-line profile-cv-paper-line--short" />
                  <div className="profile-cv-paper-line profile-cv-paper-line--long" />
                  <div className="profile-cv-paper-line" />
                </div>
                <div className="profile-cv-paper-block">
                  <div className="profile-cv-paper-line profile-cv-paper-line--short" />
                  <div className="profile-cv-paper-line profile-cv-paper-line--mid" />
                  <div className="profile-cv-paper-line" />
                </div>
                <div className="profile-cv-paper-chips">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </button>
          )}
        </div>
      </div>

      <div className="profile-cv-post-body">
        <div className="profile-cv-post-content">
          <span className="profile-cv-label">{t('profile.activeCv')}</span>
          <h2 id="profile-active-cv-heading" className="profile-cv-heading">
            {activeCv ? stripPdfExtension(activeCv.displayName) : t('profile.cvEmpty')}
          </h2>
          <p className="profile-cv-caption">{t('profile.activeCvIntro')}</p>
          {!activeCv && !loading ? (
            <Link to="/my-cv" className="profile-cv-inline-link">
              {t('profile.goToMyCv')}
            </Link>
          ) : null}
        </div>

        {activeCv ? (
          <div className="profile-cv-actions" role="group" aria-label={t('profile.activeCv')}>
            <button
              type="button"
              className="profile-cv-action"
              onClick={handlePreview}
              disabled={cvHidden || !activePreviewUrl}
            >
              {t('profile.cvPreview')}
            </button>
            <button type="button" className="profile-cv-action" onClick={() => navigate('/my-cv')}>
              {t('profile.cvChange')}
            </button>
            <button
              type="button"
              className={`profile-cv-action${cvHidden ? ' profile-cv-action--on' : ''}`}
              onClick={() => setCvHidden((v) => !v)}
            >
              {cvHidden ? t('profile.cvShow') : t('profile.cvHide')}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default function Profile() {
  const { user, authLoading, setShowLogoutConfirm } = useAuth()
  const { t } = useLanguage()
  const [panel, setPanel] = useState(null)
  const [username, setUsername] = useState('')
  const [homeCity, setHomeCity] = useState('')
  const [preferredWorkCities, setPreferredWorkCities] = useState([])
  const [bachelor, setBachelor] = useState('')
  const [summary, setSummary] = useState('')
  const [profileDataLoading, setProfileDataLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) {
      setUsername('')
      setHomeCity('')
      setPreferredWorkCities([])
      setBachelor('')
      setSummary('')
      setProfileDataLoading(false)
      return undefined
    }

    let cancelled = false
    setProfileDataLoading(true)

    getUserProfile(user.uid)
      .then((data) => {
        if (cancelled) return
        setUsername(data.username)
        setHomeCity(data.homeCity)
        setPreferredWorkCities(data.preferredWorkCities)
        setBachelor(data.bachelor)
        setSummary(data.summary)
      })
      .catch((err) => {
        console.error('Profile load failed:', err)
        if (!cancelled) {
          setUsername('')
          setHomeCity('')
          setPreferredWorkCities([])
          setBachelor('')
          setSummary('')
        }
      })
      .finally(() => {
        if (!cancelled) setProfileDataLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user?.uid])

  function togglePanel(next) {
    setPanel((current) => (current === next ? null : next))
  }

  async function updateProfileField(field, value) {
    await saveUserProfileField(user.uid, field, value)
    if (field === 'bachelor') setBachelor(value)
    if (field === 'summary') setSummary(value)
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

  const displayName =
    user.displayName || username || user.email?.split('@')[0] || t('profile.untitled')

  return (
    <main className="main profile-page">
      <div className="profile-shell">
        <header className="profile-hero">
          <div className="profile-hero-glow" aria-hidden="true" />
          <div className="profile-hero-row">
            <div className="profile-hero-avatar-wrap">
              <UserAvatar user={user} className="profile-page-avatar" />
            </div>
            <div className="profile-hero-text">
              <p className="profile-hero-name">{displayName}</p>
              {username ? (
                <p className="profile-hero-username">@{username}</p>
              ) : null}
              <p className="profile-hero-email">{user.email}</p>
            </div>
            <p
              className={`profile-hero-city${!homeCity && !profileDataLoading ? ' profile-hero-city--muted' : ''}`}
              aria-label={t('profile.homeCity')}
            >
              <span className="profile-hero-city-icon">
                <PinIcon />
              </span>
              <span className="profile-hero-city-label">
                {profileDataLoading ? '…' : homeCity || t('profile.locationEmpty')}
              </span>
            </p>
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
          ) : null}

          {panel === 'settings' ? (
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
          ) : null}
        </header>

        <div className="profile-page-main">
          <ProfileAboutSection
            t={t}
            bachelor={bachelor}
            summary={summary}
            preferredWorkCities={preferredWorkCities}
            loading={profileDataLoading}
            onSaveBachelor={(value) => updateProfileField('bachelor', value)}
            onSaveSummary={(value) => updateProfileField('summary', value)}
          />
          <ActiveCvPanel t={t} />
        </div>
      </div>
    </main>
  )
}
