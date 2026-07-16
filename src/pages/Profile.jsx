import { useState } from 'react'
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

function Fact({ label, value }) {
  return (
    <div className="profile-fact">
      <span className="profile-fact-label">{label}</span>
      <span className="profile-fact-value">{value || '—'}</span>
    </div>
  )
}

function ActiveCvPanel({ t, previewPerson }) {
  const navigate = useNavigate()
  const { activeCv, activePreviewUrl, loading } = useResume()
  const [cvHidden, setCvHidden] = useState(false)

  function handlePreview() {
    if (!activePreviewUrl) return
    window.open(activePreviewUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <aside className="profile-cv-panel" aria-labelledby="profile-active-cv-heading">
      <div className="profile-cv-panel-top">
        <p className="profile-cv-kicker">{t('profile.activeCv')}</p>
        {activeCv ? (
          <h2 id="profile-active-cv-heading" className="profile-cv-filename">
            {stripPdfExtension(activeCv.displayName)}
          </h2>
        ) : (
          <h2 id="profile-active-cv-heading" className="profile-cv-filename">
            {t('profile.cvEmpty')}
          </h2>
        )}
      </div>

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
          <div className="profile-cv-sheet-status profile-cv-sheet-status--empty">
            <p>{t('profile.cvEmptyHint')}</p>
            <Link to="/my-cv" className="profile-cv-action profile-cv-action--primary">
              {t('profile.goToMyCv')}
            </Link>
          </div>
        ) : (
          <div className="profile-cv-paper" aria-hidden="true">
            <div className="profile-cv-paper-accent" />
            <div className="profile-cv-paper-body">
              <div className="profile-cv-paper-name">{previewPerson.fullName}</div>
              <div className="profile-cv-paper-role">{previewPerson.profession}</div>
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
          </div>
        )}
      </div>

      {activeCv ? (
        <div className="profile-cv-actions">
          <button
            type="button"
            className="profile-cv-action profile-cv-action--primary"
            onClick={handlePreview}
            disabled={cvHidden || !activePreviewUrl}
          >
            {t('profile.cvPreview')}
          </button>
          <button type="button" className="profile-cv-action" onClick={() => navigate('/my-cv')}>
            {t('profile.cvChange')}
          </button>
          <button type="button" className="profile-cv-action" onClick={() => setCvHidden((v) => !v)}>
            {cvHidden ? t('profile.cvShow') : t('profile.cvHide')}
          </button>
        </div>
      ) : null}
    </aside>
  )
}

export default function Profile() {
  const { user, authLoading, setShowLogoutConfirm } = useAuth()
  const { t } = useLanguage()
  const [panel, setPanel] = useState(null)

  const profileInfo = {
    fullName: user?.displayName || 'Ayşe Yılmaz',
    gender: 'Kadın',
    birthday: '14 Mart 1998',
    bio: 'Ölçeklenebilir web uygulamaları geliştiren ürün odaklı yazılım mühendisi. Kullanıcı deneyimi ve temiz mimariye önem verir.',
    profession: 'Yazılım Mühendisi',
    education: 'Boğaziçi Üniversitesi',
    department: 'Bilgisayar Mühendisliği',
    graduationDate: 'Haziran 2021',
    experiences: [
      { role: 'Frontend Engineer', company: 'Acme Labs', period: '2023 – Günümüz' },
      { role: 'Software Intern', company: 'Nova Soft', period: '2021 – 2022' },
    ],
    skills: ['React', 'TypeScript', 'Node.js', 'Firebase', 'Figma'],
    languages: [
      { name: 'Türkçe', level: 'Ana dil' },
      { name: 'İngilizce', level: 'C1' },
      { name: 'Almanca', level: 'A2' },
    ],
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
    <main className="main profile-page">
      <div className="profile-shell">
        <header className="profile-hero">
          <div className="profile-hero-glow" aria-hidden="true" />
          <div className="profile-hero-row">
            <div className="profile-hero-avatar-wrap">
              <UserAvatar user={user} className="profile-page-avatar" />
            </div>
            <div className="profile-hero-text">
              <p className="profile-hero-name">
                {profileInfo.fullName || user.email?.split('@')[0] || t('profile.untitled')}
              </p>
              <p className="profile-hero-role">{profileInfo.profession}</p>
              <p className="profile-hero-email">{user.email}</p>
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
          <div className="profile-info-stack">
            <section className="profile-section profile-section--about">
              <h2 className="profile-section-title">{t('profile.sectionAbout')}</h2>
              <p className="profile-bio">{profileInfo.bio}</p>
              <div className="profile-fact-grid">
                <Fact label={t('profile.fullName')} value={profileInfo.fullName} />
                <Fact label={t('profile.gender')} value={profileInfo.gender} />
                <Fact label={t('profile.birthday')} value={profileInfo.birthday} />
                <Fact label={t('profile.profession')} value={profileInfo.profession} />
              </div>
            </section>

            <section className="profile-section">
              <h2 className="profile-section-title">{t('profile.sectionEducation')}</h2>
              <div className="profile-edu">
                <p className="profile-edu-school">{profileInfo.education}</p>
                <p className="profile-edu-meta">
                  {profileInfo.department}
                  <span className="profile-edu-dot" aria-hidden="true">
                    ·
                  </span>
                  {profileInfo.graduationDate}
                </p>
              </div>
            </section>

            <section className="profile-section">
              <h2 className="profile-section-title">{t('profile.sectionExperience')}</h2>
              <ul className="profile-timeline">
                {profileInfo.experiences.map((item) => (
                  <li key={`${item.company}-${item.period}`} className="profile-timeline-item">
                    <span className="profile-timeline-dot" aria-hidden="true" />
                    <div className="profile-timeline-body">
                      <p className="profile-timeline-role">{item.role}</p>
                      <p className="profile-timeline-meta">
                        {item.company}
                        <span className="profile-edu-dot" aria-hidden="true">
                          ·
                        </span>
                        {item.period}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="profile-section">
              <h2 className="profile-section-title">{t('profile.sectionSkills')}</h2>
              <div className="profile-chip-row" aria-label={t('profile.skills')}>
                {profileInfo.skills.map((skill) => (
                  <span key={skill} className="profile-chip">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="profile-lang-row" aria-label={t('profile.languages')}>
                {profileInfo.languages.map((lang) => (
                  <div key={lang.name} className="profile-lang">
                    <span className="profile-lang-name">{lang.name}</span>
                    <span className="profile-lang-level">{lang.level}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <ActiveCvPanel t={t} previewPerson={profileInfo} />
        </div>
      </div>
    </main>
  )
}
