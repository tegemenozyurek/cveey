import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useResume } from '../context/ResumeContext'
import UserAvatar from '../components/UserAvatar'
import LanguageSwitcher from '../components/LanguageSwitcher'
import ThemeSwitcher from '../components/ThemeSwitcher'
import { resolveAuthMethod } from '../authUtils'
import { getUserProfile, saveUserEducation, saveUserProfileField } from '../userService'
import { TURKISH_UNIVERSITIES, UNIVERSITY_OTHER } from '../data/turkishUniversities'
import { downloadCvFile } from '../storageService'

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

function educationHasContent(education) {
  if (!education) return false
  return Boolean(
    education.degreeType &&
      education.status &&
      education.university?.trim() &&
      education.program?.trim() &&
      (education.status !== 'graduated' || education.graduationYear),
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
  if (education.status === 'graduated' && education.graduationYear) {
    return t('profile.educationStatus.graduatedYear', { year: education.graduationYear })
  }
  return t(`profile.educationStatus.${education.status}`)
}

const EDUCATION_DEGREE_TYPES = ['associate', 'bachelor', 'master', 'doctorate', 'other']
const EDUCATION_STATUSES = ['studying', 'graduated']
const CURRENT_YEAR = new Date().getFullYear()
const GRADUATION_YEARS = Array.from({ length: CURRENT_YEAR - 1949 }, (_, index) => CURRENT_YEAR - index)

function EducationField({ t, education, onSave }) {
  const hasValue = educationHasContent(education)
  const [editing, setEditing] = useState(false)
  const [degreeType, setDegreeType] = useState('')
  const [degreeOther, setDegreeOther] = useState('')
  const [status, setStatus] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [university, setUniversity] = useState('')
  const [universityIsOther, setUniversityIsOther] = useState(false)
  const [universityCustom, setUniversityCustom] = useState('')
  const [program, setProgram] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function hydrateFromEducation(next) {
    setDegreeType(next?.degreeType || '')
    setDegreeOther(next?.degreeOther || '')
    setStatus(next?.status || '')
    setGraduationYear(next?.graduationYear ? String(next.graduationYear) : '')
    setUniversityIsOther(Boolean(next?.universityIsOther))
    if (next?.universityIsOther) {
      setUniversity(UNIVERSITY_OTHER)
      setUniversityCustom(next?.university || '')
    } else {
      setUniversity(next?.university || '')
      setUniversityCustom('')
    }
    setProgram(next?.program || '')
  }

  useEffect(() => {
    if (!editing) hydrateFromEducation(education)
  }, [editing, education])

  function startEditing() {
    hydrateFromEducation(education)
    setError('')
    setEditing(true)
  }

  function cancelEditing() {
    hydrateFromEducation(education)
    setError('')
    setEditing(false)
  }

  async function save() {
    if (!degreeType) {
      setError(t('profile.educationDegreeRequired'))
      return
    }
    if (degreeType === 'other' && !degreeOther.trim()) {
      setError(t('profile.educationDegreeOtherRequired'))
      return
    }
    if (!status) {
      setError(t('profile.educationStatusRequired'))
      return
    }
    if (status === 'graduated' && !graduationYear) {
      setError(t('profile.educationGraduationYearRequired'))
      return
    }

    const resolvedUniversity = universityIsOther ? universityCustom.trim() : university.trim()
    if (universityIsOther && !resolvedUniversity) {
      setError(t('profile.educationUniversityCustomRequired'))
      return
    }
    if (!universityIsOther && !resolvedUniversity) {
      setError(t('profile.educationUniversityRequired'))
      return
    }
    if (!program.trim()) {
      setError(t('profile.educationProgramRequired'))
      return
    }

    setSaving(true)
    setError('')
    try {
      await onSave({
        degreeType,
        degreeOther: degreeType === 'other' ? degreeOther.trim() : '',
        status,
        graduationYear: status === 'graduated' ? Number(graduationYear) : 0,
        university: resolvedUniversity,
        universityIsOther,
        program: program.trim(),
      })
      setEditing(false)
    } catch (err) {
      console.error('Profile education update failed:', err)
      setError(t('profile.updateError'))
    } finally {
      setSaving(false)
    }
  }

  if (!hasValue && !editing) {
    return (
      <button type="button" className="profile-about-add-btn" onClick={startEditing}>
        {t('profile.addEducation')}
      </button>
    )
  }

  if (!editing) {
    return (
      <>
        <div className="profile-about-field-head">
          <p className="profile-about-kicker">{t('profile.education')}</p>
          <button
            type="button"
            className="profile-about-edit-btn"
            onClick={startEditing}
            aria-label={`${t('profile.edit')} ${t('profile.education')}`}
            title={t('profile.edit')}
          >
            <EditIcon />
          </button>
        </div>
        <p className="profile-about-lead">
          {degreeTypeLabel(t, education)}
          {education.program ? ` · ${education.program}` : ''}
        </p>
        {education.university ? (
          <p className="profile-about-edu-uni">{education.university}</p>
        ) : null}
        {education.status ? (
          <p className="profile-about-edu-status">{educationStatusLabel(t, education)}</p>
        ) : null}
      </>
    )
  }

  return (
    <div className="profile-about-edit profile-edu-edit">
      <p className="profile-about-kicker">{t('profile.education')}</p>

      <div className="form-field">
        <label className="form-label" htmlFor="profile-edu-degree">
          {t('profile.educationDegree')}
        </label>
        <select
          id="profile-edu-degree"
          className={`form-input profile-edu-degree-select${!degreeType ? ' profile-edu-degree-select--placeholder' : ''}`}
          value={degreeType}
          onChange={(event) => {
            const nextType = event.target.value
            setError('')
            setDegreeType(nextType)
            if (nextType !== 'other') setDegreeOther('')
          }}
          disabled={saving}
        >
          <option value="" disabled>
            {t('profile.educationDegreePlaceholder')}
          </option>
          {EDUCATION_DEGREE_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`profile.educationDegree.${type}`)}
            </option>
          ))}
        </select>
      </div>

      {degreeType === 'other' ? (
        <div className="form-field">
          <label className="form-label" htmlFor="profile-edu-degree-other">
            {t('profile.educationDegreeOther')}
          </label>
          <input
            id="profile-edu-degree-other"
            className="form-input profile-about-edit-field"
            type="text"
            value={degreeOther}
            onChange={(event) => {
              setError('')
              setDegreeOther(event.target.value)
            }}
            placeholder={t('profile.educationDegreeOtherPlaceholder')}
            maxLength={80}
            disabled={saving}
          />
        </div>
      ) : null}

      <div className="form-field">
        <label className="form-label" htmlFor="profile-edu-status">
          {t('profile.educationStatus')}
        </label>
        <select
          id="profile-edu-status"
          className={`form-input profile-edu-degree-select${!status ? ' profile-edu-degree-select--placeholder' : ''}`}
          value={status}
          onChange={(event) => {
            const nextStatus = event.target.value
            setError('')
            setStatus(nextStatus)
            if (nextStatus !== 'graduated') setGraduationYear('')
          }}
          disabled={saving}
        >
          <option value="" disabled>
            {t('profile.educationStatusPlaceholder')}
          </option>
          {EDUCATION_STATUSES.map((item) => (
            <option key={item} value={item}>
              {t(`profile.educationStatus.${item}`)}
            </option>
          ))}
        </select>
      </div>

      {status === 'graduated' ? (
        <div className="form-field">
          <label className="form-label" htmlFor="profile-edu-graduation-year">
            {t('profile.educationGraduationYear')}
          </label>
          <select
            id="profile-edu-graduation-year"
            className={`form-input profile-edu-degree-select${!graduationYear ? ' profile-edu-degree-select--placeholder' : ''}`}
            value={graduationYear}
            onChange={(event) => {
              setError('')
              setGraduationYear(event.target.value)
            }}
            disabled={saving}
          >
            <option value="" disabled>
              {t('profile.educationGraduationYearPlaceholder')}
            </option>
            {GRADUATION_YEARS.map((year) => (
              <option key={year} value={String(year)}>
                {year}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="form-field">
        <label className="form-label" htmlFor="profile-edu-university">
          {t('profile.educationUniversity')}
        </label>
        <select
          id="profile-edu-university"
          className={`form-input profile-edu-degree-select${!university && !universityIsOther ? ' profile-edu-degree-select--placeholder' : ''}`}
          value={universityIsOther ? UNIVERSITY_OTHER : university}
          onChange={(event) => {
            const nextValue = event.target.value
            setError('')
            if (nextValue === UNIVERSITY_OTHER) {
              setUniversityIsOther(true)
              setUniversity(UNIVERSITY_OTHER)
              setUniversityCustom('')
              return
            }
            setUniversityIsOther(false)
            setUniversity(nextValue)
            setUniversityCustom('')
          }}
          disabled={saving}
        >
          <option value="" disabled>
            {t('profile.educationUniversityPlaceholder')}
          </option>
          <option value={UNIVERSITY_OTHER}>{t('profile.educationUniversityOther')}</option>
          {TURKISH_UNIVERSITIES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {universityIsOther ? (
        <div className="form-field">
          <label className="form-label" htmlFor="profile-edu-university-custom">
            {t('profile.educationUniversityCustom')}
          </label>
          <input
            id="profile-edu-university-custom"
            className="form-input profile-about-edit-field"
            type="text"
            value={universityCustom}
            onChange={(event) => {
              setError('')
              setUniversityCustom(event.target.value)
            }}
            placeholder={t('profile.educationUniversityCustomPlaceholder')}
            maxLength={120}
            disabled={saving}
          />
        </div>
      ) : null}

      <div className="form-field">
        <label className="form-label" htmlFor="profile-edu-program">
          {t('profile.educationProgram')}
        </label>
        <input
          id="profile-edu-program"
          className="form-input profile-about-edit-field"
          type="text"
          value={program}
          onChange={(event) => {
            setError('')
            setProgram(event.target.value)
          }}
          placeholder={t('profile.educationProgramPlaceholder')}
          maxLength={120}
          disabled={saving}
        />
      </div>

      <div className="profile-about-edit-actions">
        <button type="button" onClick={cancelEditing} disabled={saving}>
          {t('profile.cancel')}
        </button>
        <button type="button" onClick={() => void save()} disabled={saving}>
          {saving ? t('profile.saving') : t('profile.save')}
        </button>
      </div>
      {error ? <p className="profile-about-edit-error" role="alert">{error}</p> : null}
    </div>
  )
}

function EditableProfileField({
  t,
  label,
  value,
  addLabel,
  multiline = false,
  maxLength,
  valueClassName,
  onSave,
}) {
  const hasValue = Boolean(value?.trim())
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fieldRef = useRef(null)

  useEffect(() => {
    if (!editing) setDraft(value || '')
  }, [editing, value])

  useEffect(() => {
    if (editing) fieldRef.current?.focus()
  }, [editing])

  function startEditing() {
    setDraft(value || '')
    setError('')
    setEditing(true)
  }

  function cancelEditing() {
    setDraft(value || '')
    setError('')
    setEditing(false)
  }

  async function save() {
    const nextValue = draft.trim()
    if (!nextValue) {
      setError(t('profile.fieldRequired'))
      return
    }
    if (maxLength && nextValue.length > maxLength) {
      setError(t('profile.fieldTooLong', { max: maxLength }))
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

  if (!hasValue && !editing) {
    return (
      <button type="button" className="profile-about-add-btn" onClick={startEditing}>
        {addLabel}
      </button>
    )
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
          {multiline && maxLength ? (
            <p
              className={`profile-about-char-count${draft.length > maxLength ? ' profile-about-char-count--over' : ''}`}
              aria-live="polite"
            >
              {draft.length}/{maxLength}
            </p>
          ) : null}
          <div className="profile-about-edit-actions">
            <button type="button" onClick={cancelEditing} disabled={saving}>
              {t('profile.cancel')}
            </button>
            <button type="button" onClick={() => void save()} disabled={saving}>
              {saving ? t('profile.saving') : t('profile.save')}
            </button>
          </div>
          {error ? <p className="profile-about-edit-error" role="alert">{error}</p> : null}
        </div>
      ) : (
        <p className={valueClassName}>{value}</p>
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
  education,
  summary,
  preferredWorkCities,
  loading,
  onSaveEducation,
  onSaveSummary,
}) {
  const workCities = preferredWorkCities.length > 0 ? preferredWorkCities : []

  return (
    <section className="profile-about" aria-label={t('profile.sectionAbout')}>
      <div className="profile-about-side">
        <div className="profile-about-degree">
          {loading ? (
            <p className="profile-about-loc-empty">…</p>
          ) : (
            <EducationField t={t} education={education} onSave={onSaveEducation} />
          )}
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
        {loading ? (
          <p className="profile-about-loc-empty">…</p>
        ) : (
          <EditableProfileField
            t={t}
            label={t('profile.summary')}
            value={summary}
            addLabel={t('profile.addSummary')}
            multiline
            maxLength={500}
            valueClassName="profile-about-bio"
            onSave={onSaveSummary}
          />
        )}
      </div>
    </section>
  )
}

function ActiveCvPanel({ t }) {
  const navigate = useNavigate()
  const { activeCv, activePreviewUrl, loading } = useResume()
  const [cvHidden, setCvHidden] = useState(false)
  const [downloading, setDownloading] = useState(false)

  function handlePreview() {
    if (!activePreviewUrl) return
    window.open(activePreviewUrl, '_blank', 'noopener,noreferrer')
  }

  async function handleDownload() {
    if (!activeCv?.fullPath || downloading) return

    setDownloading(true)
    try {
      await downloadCvFile(activeCv.fullPath, activeCv.displayName)
    } catch (err) {
      console.error('Active CV download failed:', err)
    } finally {
      setDownloading(false)
    }
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
            <button
              type="button"
              className="profile-cv-action"
              onClick={() => void handleDownload()}
              disabled={cvHidden || !activeCv.fullPath || downloading}
            >
              {downloading ? t('profile.cvDownloading') : t('profile.cvDownload')}
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
  const [education, setEducation] = useState({
    degreeType: '',
    degreeOther: '',
    status: '',
    graduationYear: null,
    university: '',
    universityIsOther: false,
    program: '',
  })
  const [summary, setSummary] = useState('')
  const [profileDataLoading, setProfileDataLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) {
      setUsername('')
      setHomeCity('')
      setPreferredWorkCities([])
      setEducation({
        degreeType: '',
        degreeOther: '',
        status: '',
        graduationYear: null,
        university: '',
        universityIsOther: false,
        program: '',
      })
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
        setEducation(data.education)
        setSummary(data.summary)
      })
      .catch((err) => {
        console.error('Profile load failed:', err)
        if (!cancelled) {
          setUsername('')
          setHomeCity('')
          setPreferredWorkCities([])
          setEducation({
            degreeType: '',
            degreeOther: '',
            status: '',
            graduationYear: null,
            university: '',
            universityIsOther: false,
            program: '',
          })
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
    if (field === 'summary') setSummary(value)
  }

  async function updateEducation(payload) {
    const saved = await saveUserEducation(user.uid, payload)
    setEducation(saved)
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

  const profileUsername = username || user.email?.split('@')[0] || t('profile.untitled')

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
              <p className="profile-hero-name">@{profileUsername}</p>
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
            education={education}
            summary={summary}
            preferredWorkCities={preferredWorkCities}
            loading={profileDataLoading}
            onSaveEducation={updateEducation}
            onSaveSummary={(value) => updateProfileField('summary', value)}
          />
          <ActiveCvPanel t={t} />
        </div>
      </div>
    </main>
  )
}
