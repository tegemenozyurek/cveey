import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import UserAvatar from '../components/UserAvatar'
import ConfirmCancelRequestModal from '../components/ConfirmCancelRequestModal'
import { getUserProfile } from '../userService'
import {
  cancelConnectionRequest,
  getOutgoingConnectionRequest,
  sendConnectionRequest,
} from '../connectionService'
import { downloadCvFile, getPublicActiveCv } from '../storageService'

function stripPdfExtension(name) {
  if (!name) return ''
  return name.replace(/\.pdf$/i, '')
}

const MOCK_THEIR_NETWORK = [
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

function degreeTypeLabel(t, education) {
  if (!education?.degreeType) return ''
  if (education.degreeType === 'other' && education.degreeOther) {
    return education.degreeOther
  }
  return t(`profile.educationDegree.${education.degreeType}`)
}

function educationStatusLabel(t, education) {
  if (!education?.status) return ''
  if (education.graduationYear) {
    if (education.status === 'studying') {
      return t('profile.educationStatus.studyingYear', { year: education.graduationYear })
    }
    if (education.status === 'graduated') {
      return t('profile.educationStatus.graduatedYear', { year: education.graduationYear })
    }
  }
  return t(`profile.educationStatus.${education.status}`)
}

function ReadOnlyEducationList({ t, educations }) {
  const items = Array.isArray(educations) ? educations : []

  return (
    <div className="profile-edu-list">
      <div className="profile-about-field-head">
        <p className="profile-about-kicker">{t('profile.education')}</p>
      </div>
      {items.length === 0 ? (
        <p className="profile-about-empty">{t('profile.noEducation')}</p>
      ) : (
        <ul className="profile-edu-items">
          {items.map((item) => (
            <li key={item.id} className="profile-edu-item">
              <div className="profile-edu-item-view">
                <div className="profile-edu-item-copy">
                  <p className="profile-about-lead profile-edu-item-title">
                    {[degreeTypeLabel(t, item), item.program].filter(Boolean).join(' · ')}
                  </p>
                  {item.university ? (
                    <p className="profile-about-edu-uni">{item.university}</p>
                  ) : null}
                  {item.status ? (
                    <p className="profile-about-edu-status">{educationStatusLabel(t, item)}</p>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function NetworkPersonRow({ person, actionLabel }) {
  return (
    <li className="network-person">
      <UserAvatar user={person} className="network-person-avatar" />
      <div className="network-person-info">
        <p className="network-person-name">{person.displayName || person.username}</p>
        {person.headline ? <p className="network-person-headline">{person.headline}</p> : null}
        {person.location || person.homeCity ? (
          <p className="network-person-location">{person.location || person.homeCity}</p>
        ) : null}
      </div>
      <button
        type="button"
        className="network-connect-btn network-connect-btn--icon"
        aria-label={actionLabel}
        title={actionLabel}
      >
        <MessageIcon />
      </button>
    </li>
  )
}

function PublicActiveCvPanel({ t, activeCv, loading }) {
  const [downloading, setDownloading] = useState(false)
  const previewUrl = activeCv?.url || ''
  const paperName = stripPdfExtension(activeCv?.displayName) || t('profile.activeCv')

  function handlePreview() {
    if (!previewUrl) return
    window.open(previewUrl, '_blank', 'noopener,noreferrer')
  }

  async function handleDownload() {
    if (!activeCv?.fullPath || downloading) return
    setDownloading(true)
    try {
      await downloadCvFile(activeCv.fullPath, activeCv.displayName)
    } catch (err) {
      console.error('Public CV download failed:', err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <section
      className={`profile-cv-post${!activeCv && !loading ? ' profile-cv-post--empty' : ''}`}
      aria-labelledby="public-active-cv-heading"
    >
      <div className="profile-cv-post-media">
        <div className="profile-cv-sheet">
          {loading ? (
            <div className="profile-cv-sheet-status">
              <span className="cv-preview-spinner" aria-hidden="true" />
            </div>
          ) : !activeCv ? (
            <div className="profile-cv-sheet-status profile-cv-sheet-status--empty">
              <span className="profile-cv-empty-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 2v6h6M12 18v-6M9 15h6"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          ) : (
            <button
              type="button"
              className="profile-cv-paper"
              onClick={handlePreview}
              disabled={!previewUrl}
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

      <div className={`profile-cv-post-body${!activeCv && !loading ? ' profile-cv-post-body--empty' : ''}`}>
        <div className="profile-cv-post-content">
          <span className="profile-cv-label">{t('profile.activeCv')}</span>
          <h2
            id="public-active-cv-heading"
            className={`profile-cv-heading${!activeCv && !loading ? ' profile-cv-heading--wrap' : ''}`}
          >
            {activeCv ? stripPdfExtension(activeCv.displayName) : t('profile.cvEmpty')}
          </h2>
          <p className="profile-cv-caption">
            {activeCv || loading ? t('profile.publicCvIntro') : t('profile.publicCvEmpty')}
          </p>
        </div>

        {activeCv ? (
          <div className="profile-cv-actions" role="group" aria-label={t('profile.activeCv')}>
            <button
              type="button"
              className="profile-cv-action"
              onClick={handlePreview}
              disabled={!previewUrl}
            >
              {t('profile.cvPreview')}
            </button>
            <button
              type="button"
              className="profile-cv-action"
              onClick={() => void handleDownload()}
              disabled={!activeCv.fullPath || downloading}
            >
              {downloading ? t('profile.cvDownloading') : t('profile.cvDownload')}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default function PublicProfile() {
  const { uid } = useParams()
  const { user, authLoading } = useAuth()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [exists, setExists] = useState(true)
  const [username, setUsername] = useState('')
  const [homeCity, setHomeCity] = useState('')
  const [preferredWorkCities, setPreferredWorkCities] = useState([])
  const [educations, setEducations] = useState([])
  const [summary, setSummary] = useState('')
  const [photoURL, setPhotoURL] = useState('')
  const [panel, setPanel] = useState(null)
  const [requestStatus, setRequestStatus] = useState('idle') // idle | pending | loading
  const [requestBusy, setRequestBusy] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [activeCv, setActiveCv] = useState(null)
  const [cvLoading, setCvLoading] = useState(true)

  useEffect(() => {
    if (!uid) {
      setLoading(false)
      setExists(false)
      return undefined
    }

    let cancelled = false
    setLoading(true)
    setPanel(null)
    setShowCancelConfirm(false)
    setActiveCv(null)
    setCvLoading(true)

    getUserProfile(uid)
      .then((profile) => {
        if (cancelled) return
        setExists(Boolean(profile.exists))
        setUsername(profile.username || '')
        setHomeCity(profile.homeCity || '')
        setPreferredWorkCities(profile.preferredWorkCities || [])
        setEducations(profile.educations || [])
        setSummary(profile.summary || '')
        setPhotoURL(profile.photoURL || '')
        setLoading(false)
      })
      .catch((err) => {
        console.error('Public profile load failed:', err)
        if (cancelled) return
        setExists(false)
        setLoading(false)
      })

    getPublicActiveCv(uid)
      .then((cv) => {
        if (!cancelled) {
          setActiveCv(cv)
          setCvLoading(false)
        }
      })
      .catch((err) => {
        console.error('Public active CV load failed:', err)
        if (!cancelled) {
          setActiveCv(null)
          setCvLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [uid])

  useEffect(() => {
    if (!user?.uid || !uid || user.uid === uid) {
      setRequestStatus('idle')
      return undefined
    }

    let cancelled = false
    setRequestStatus('loading')

    getOutgoingConnectionRequest(user.uid, uid)
      .then((request) => {
        if (cancelled) return
        setRequestStatus(request?.status === 'pending' ? 'pending' : 'idle')
      })
      .catch((err) => {
        console.error('Connection request lookup failed:', err)
        if (!cancelled) setRequestStatus('idle')
      })

    return () => {
      cancelled = true
    }
  }, [user?.uid, uid])

  async function handleConnectClick() {
    if (!user?.uid || !uid || requestBusy || requestStatus === 'loading') return

    if (requestStatus === 'pending') {
      setShowCancelConfirm(true)
      return
    }

    setRequestBusy(true)
    try {
      await sendConnectionRequest(user.uid, uid)
      setRequestStatus('pending')
    } catch (err) {
      console.error('Send connection request failed:', err)
    } finally {
      setRequestBusy(false)
    }
  }

  async function handleConfirmCancel() {
    if (!user?.uid || !uid || requestBusy) return

    setRequestBusy(true)
    try {
      await cancelConnectionRequest(user.uid, uid)
      setRequestStatus('idle')
      setShowCancelConfirm(false)
    } catch (err) {
      console.error('Cancel connection request failed:', err)
    } finally {
      setRequestBusy(false)
    }
  }

  if (authLoading) {
    return (
      <main className="main">
        <p className="profile-empty">{t('profile.loading')}</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/network" replace />
  }

  if (uid && user.uid === uid) {
    return <Navigate to="/profile" replace />
  }

  if (loading) {
    return (
      <main className="main profile-page">
        <p className="profile-empty">{t('profile.loading')}</p>
      </main>
    )
  }

  if (!exists) {
    return (
      <main className="main profile-page">
        <div className="profile-shell">
          <p className="profile-empty">{t('profile.notFound')}</p>
          <p className="profile-empty">
            <Link to="/network">{t('profile.backToNetwork')}</Link>
          </p>
        </div>
      </main>
    )
  }

  const workCities = preferredWorkCities.length > 0 ? preferredWorkCities : []
  const summaryText = summary.trim()
  const displayName = username || t('profile.untitled')
  const connectLabel =
    requestStatus === 'pending' ? t('profile.requested') : t('profile.connect')

  return (
    <main className="main profile-page">
      <div className="profile-shell">
        <header className="profile-hero">
          <div className="profile-hero-glow" aria-hidden="true" />
          <div className="profile-hero-row">
            <div className="profile-hero-avatar-wrap">
              <UserAvatar
                user={{ photoURL: photoURL || null, displayName }}
                className="profile-page-avatar"
              />
            </div>
            <div className="profile-hero-text">
              <p className="profile-hero-name">@{displayName}</p>
            </div>
            <p
              className={`profile-hero-city${!homeCity ? ' profile-hero-city--muted' : ''}`}
              aria-label={t('profile.homeCity')}
            >
              <span className="profile-hero-city-icon">
                <PinIcon />
              </span>
              <span className="profile-hero-city-label">
                {homeCity || t('profile.locationEmpty')}
              </span>
            </p>
            <div className="profile-page-actions profile-page-actions--public">
              <button
                type="button"
                className={`profile-page-icon-btn${panel === 'network' ? ' profile-page-icon-btn--active' : ''}`}
                onClick={() => setPanel((current) => (current === 'network' ? null : 'network'))}
                aria-pressed={panel === 'network'}
                aria-label={t('network.theirNetworks')}
                title={t('network.theirNetworks')}
              >
                <PeopleIcon />
              </button>
              <button
                type="button"
                className={`profile-connect-btn${
                  requestStatus === 'pending' ? ' profile-connect-btn--requested' : ''
                }`}
                onClick={handleConnectClick}
                disabled={requestBusy || requestStatus === 'loading'}
                aria-pressed={requestStatus === 'pending'}
              >
                {connectLabel}
              </button>
            </div>
          </div>

          {panel === 'network' ? (
            <div className="profile-page-panel">
              <div className="profile-page-panel-head">
                <p className="profile-page-panel-title">{t('network.theirNetworks')}</p>
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
                {MOCK_THEIR_NETWORK.map((person) => (
                  <NetworkPersonRow
                    key={person.id}
                    person={person}
                    actionLabel={t('network.message')}
                  />
                ))}
              </ul>
            </div>
          ) : null}
        </header>

        <div className="profile-page-main">
          <section className="profile-about" aria-label={t('profile.sectionAbout')}>
            <div
              className={`profile-about-side${
                educations.length === 0 && workCities.length === 0
                  ? ' profile-about-side--empty'
                  : ''
              }`}
            >
              <div
                className={`profile-about-degree${
                  educations.length === 0 ? ' profile-about-degree--empty' : ''
                }`}
              >
                <ReadOnlyEducationList t={t} educations={educations} />
              </div>

              {workCities.length > 0 ? (
                <div className="profile-about-work">
                  <p className="profile-about-kicker">{t('profile.workCities')}</p>
                  <ul className="profile-about-city-list">
                    {workCities.map((city) => (
                      <li key={city}>
                        <span className="profile-about-city-dot" aria-hidden="true" />
                        <span>{city}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <div
              className={`profile-about-main${!summaryText ? ' profile-about-main--empty' : ''}`}
            >
              <div className="profile-about-field-head">
                <p className="profile-about-kicker">{t('profile.summary')}</p>
              </div>
              {summaryText ? (
                <p className="profile-about-bio">{summaryText}</p>
              ) : (
                <p className="profile-about-empty">{t('profile.noSummary')}</p>
              )}
            </div>
          </section>
          <PublicActiveCvPanel t={t} activeCv={activeCv} loading={cvLoading} />
        </div>
      </div>

      {showCancelConfirm ? (
        <ConfirmCancelRequestModal
          busy={requestBusy}
          onCancel={() => setShowCancelConfirm(false)}
          onConfirm={handleConfirmCancel}
        />
      ) : null}
    </main>
  )
}
