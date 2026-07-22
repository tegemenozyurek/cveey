import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { updateProfile } from 'firebase/auth'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useResume } from '../context/ResumeContext'
import UserAvatar from '../components/UserAvatar'
import LanguageSwitcher from '../components/LanguageSwitcher'
import ThemeSwitcher from '../components/ThemeSwitcher'
import ChangePasswordModal from '../components/ChangePasswordModal'
import ChangeEmailModal from '../components/ChangeEmailModal'
import { resolveAuthMethod, AUTH_METHOD_EMAIL_PASSWORD } from '../authUtils'
import { getUserProfile, MAX_EDUCATIONS, saveUserEducations, saveUserIdentity, saveUserPhotoURL, saveUserProfileField } from '../userService'
import { clearCachedProfile, readCachedProfile, writeCachedProfile } from '../profileCache'
import { TURKISH_UNIVERSITIES, UNIVERSITY_OTHER } from '../data/turkishUniversities'
import { downloadCvFile, uploadProfilePhoto } from '../storageService'
import TurkishCitySelect from '../components/createCv/shared/TurkishCitySelect'
import { subscribeToUserNetworks } from '../networkService'

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

function CameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.75" />
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

function PrefsAuthIcon({ method }) {
  if (method === 'github') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0 1 12 6.84c.85 0 1.71.12 2.51.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.81 0 .27.18.59.69.48A10.04 10.04 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
      </svg>
    )
  }
  if (method === 'google') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M21.35 11.1h-9.17v2.98h5.27c-.23 1.24-1.4 3.63-5.27 3.63-3.17 0-5.76-2.62-5.76-5.85s2.59-5.85 5.76-5.85c1.81 0 3.02.77 3.71 1.43l2.53-2.44C16.84 3.7 14.84 2.8 12.18 2.8 6.98 2.8 2.8 7.02 2.8 12.2s4.18 9.4 9.38 9.4c5.41 0 8.99-3.8 8.99-9.16 0-.62-.07-1.08-.17-1.54Z"
        />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="4"
        y="11"
        width="16"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M8 11V8a4 4 0 1 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function PrefsUsernameIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 21a8 8 0 10-16 0M12 11a4 4 0 100-8 4 4 0 000 8z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PrefsCityIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

function PrefsLanguageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M3 12h18M12 3c2.5 2.7 3.75 5.7 3.75 9S14.5 18.3 12 21c-2.5-2.7-3.75-5.7-3.75-9S9.5 5.7 12 3Z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </svg>
  )
}

function PrefsThemeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v1.5M12 19.5V21M4.93 4.93l1.06 1.06M17.999 18.001l1.06 1.06M3 12h1.5M19.5 12H21M4.93 19.07l1.06-1.06M18 6l1.06-1.06"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}

function PrefsLogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PrefsPasswordIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M8 11V8a4 4 0 1 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function PrefsEmailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M3 7l9 6 9-6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PrefsDeleteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
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

function PlusIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
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

const EDUCATION_DEGREE_TYPES = ['associate', 'bachelor', 'master', 'doctorate', 'other']
const EDUCATION_STATUSES = ['studying', 'graduated']
const CURRENT_YEAR = new Date().getFullYear()
const EXPECTED_GRADUATION_HORIZON = 10
const PAST_GRADUATION_YEARS = Array.from(
  { length: CURRENT_YEAR - 1949 },
  (_, index) => CURRENT_YEAR - index,
)
const EXPECTED_GRADUATION_YEARS = Array.from(
  { length: EXPECTED_GRADUATION_HORIZON + 1 },
  (_, index) => CURRENT_YEAR + index,
)

function createLocalEducationId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `edu_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

const EducationEditorForm = forwardRef(function EducationEditorForm(
  {
    t,
    initial,
    saving,
    error,
    idPrefix = 'profile-edu',
    showActions = true,
    onCancel,
    onDelete,
    onSave,
  },
  ref,
) {
  const [degreeType, setDegreeType] = useState(initial?.degreeType || '')
  const [degreeOther, setDegreeOther] = useState(initial?.degreeOther || '')
  const [status, setStatus] = useState(initial?.status || '')
  const [graduationYear, setGraduationYear] = useState(
    initial?.graduationYear ? String(initial.graduationYear) : '',
  )
  const [university, setUniversity] = useState(
    initial?.universityIsOther ? UNIVERSITY_OTHER : initial?.university || '',
  )
  const [universityIsOther, setUniversityIsOther] = useState(Boolean(initial?.universityIsOther))
  const [universityCustom, setUniversityCustom] = useState(
    initial?.universityIsOther ? initial?.university || '' : '',
  )
  const [program, setProgram] = useState(initial?.program || '')
  const [localError, setLocalError] = useState('')

  function getValue() {
    setLocalError('')
    if (!degreeType) {
      setLocalError(t('profile.educationDegreeRequired'))
      return null
    }
    if (degreeType === 'other' && !degreeOther.trim()) {
      setLocalError(t('profile.educationDegreeOtherRequired'))
      return null
    }
    if (!status) {
      setLocalError(t('profile.educationStatusRequired'))
      return null
    }
    if (!graduationYear) {
      setLocalError(
        status === 'studying'
          ? t('profile.educationExpectedGraduationYearRequired')
          : t('profile.educationGraduationYearRequired'),
      )
      return null
    }

    const resolvedUniversity = universityIsOther ? universityCustom.trim() : university.trim()
    if (universityIsOther && !resolvedUniversity) {
      setLocalError(t('profile.educationUniversityCustomRequired'))
      return null
    }
    if (!universityIsOther && !resolvedUniversity) {
      setLocalError(t('profile.educationUniversityRequired'))
      return null
    }
    if (!program.trim()) {
      setLocalError(t('profile.educationProgramRequired'))
      return null
    }

    return {
      id: initial?.id || createLocalEducationId(),
      degreeType,
      degreeOther: degreeType === 'other' ? degreeOther.trim() : '',
      status,
      graduationYear: Number(graduationYear),
      university: resolvedUniversity,
      universityIsOther,
      program: program.trim(),
    }
  }

  function submit() {
    const value = getValue()
    if (value) onSave(value)
  }

  useImperativeHandle(ref, () => ({ getValue }))

  const displayError = localError || error
  const fieldId = (name) => `${idPrefix}-${name}`

  return (
    <div className="profile-about-edit profile-edu-edit">
      <div className="form-field">
        <label className="form-label" htmlFor={fieldId('degree')}>
          {t('profile.educationDegree')}
        </label>
        <select
          id={fieldId('degree')}
          className={`form-input profile-edu-degree-select${!degreeType ? ' profile-edu-degree-select--placeholder' : ''}`}
          value={degreeType}
          onChange={(event) => {
            const nextType = event.target.value
            setLocalError('')
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
          <label className="form-label" htmlFor={fieldId('degree-other')}>
            {t('profile.educationDegreeOther')}
          </label>
          <input
            id={fieldId('degree-other')}
            className="form-input profile-about-edit-field"
            type="text"
            value={degreeOther}
            onChange={(event) => {
              setLocalError('')
              setDegreeOther(event.target.value)
            }}
            placeholder={t('profile.educationDegreeOtherPlaceholder')}
            maxLength={80}
            disabled={saving}
          />
        </div>
      ) : null}

      <div className="form-field">
        <label className="form-label" htmlFor={fieldId('status')}>
          {t('profile.educationStatus')}
        </label>
        <select
          id={fieldId('status')}
          className={`form-input profile-edu-degree-select${!status ? ' profile-edu-degree-select--placeholder' : ''}`}
          value={status}
          onChange={(event) => {
            const nextStatus = event.target.value
            setLocalError('')
            setStatus(nextStatus)
            setGraduationYear('')
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

      {status === 'studying' || status === 'graduated' ? (
        <div className="form-field">
          <label className="form-label" htmlFor={fieldId('graduation-year')}>
            {status === 'studying'
              ? t('profile.educationExpectedGraduationYear')
              : t('profile.educationGraduationYear')}
          </label>
          <select
            id={fieldId('graduation-year')}
            className={`form-input profile-edu-degree-select${!graduationYear ? ' profile-edu-degree-select--placeholder' : ''}`}
            value={graduationYear}
            onChange={(event) => {
              setLocalError('')
              setGraduationYear(event.target.value)
            }}
            disabled={saving}
          >
            <option value="" disabled>
              {t('profile.educationGraduationYearPlaceholder')}
            </option>
            {(status === 'studying' ? EXPECTED_GRADUATION_YEARS : PAST_GRADUATION_YEARS).map(
              (year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ),
            )}
          </select>
        </div>
      ) : null}

      <div className="form-field">
        <label className="form-label" htmlFor={fieldId('university')}>
          {t('profile.educationUniversity')}
        </label>
        <select
          id={fieldId('university')}
          className={`form-input profile-edu-degree-select${!university && !universityIsOther ? ' profile-edu-degree-select--placeholder' : ''}`}
          value={universityIsOther ? UNIVERSITY_OTHER : university}
          onChange={(event) => {
            const nextValue = event.target.value
            setLocalError('')
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
          <label className="form-label" htmlFor={fieldId('university-custom')}>
            {t('profile.educationUniversityCustom')}
          </label>
          <input
            id={fieldId('university-custom')}
            className="form-input profile-about-edit-field"
            type="text"
            value={universityCustom}
            onChange={(event) => {
              setLocalError('')
              setUniversityCustom(event.target.value)
            }}
            placeholder={t('profile.educationUniversityCustomPlaceholder')}
            maxLength={120}
            disabled={saving}
          />
        </div>
      ) : null}

      <div className="form-field">
        <label className="form-label" htmlFor={fieldId('program')}>
          {t('profile.educationProgram')}
        </label>
        <input
          id={fieldId('program')}
          className="form-input profile-about-edit-field"
          type="text"
          value={program}
          onChange={(event) => {
            setLocalError('')
            setProgram(event.target.value)
          }}
          placeholder={t('profile.educationProgramPlaceholder')}
          maxLength={120}
          disabled={saving}
        />
      </div>

      {showActions ? <div className="profile-about-edit-actions">
        {onDelete ? (
          <button
            type="button"
            className="profile-edu-delete-action"
            onClick={onDelete}
            disabled={saving}
          >
            {t('profile.removeEducation')}
          </button>
        ) : null}
        <button type="button" onClick={onCancel} disabled={saving}>
          {t('profile.cancel')}
        </button>
        <button type="button" onClick={submit} disabled={saving}>
          {saving ? t('profile.saving') : t('profile.save')}
        </button>
      </div> : null}
      {displayError ? <p className="profile-about-edit-error" role="alert">{displayError}</p> : null}
    </div>
  )
})

function EducationList({ t, educations, onSaveEducations }) {
  const items = Array.isArray(educations) ? educations : []
  const [managing, setManaging] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editItems, setEditItems] = useState([])
  const [activeEditId, setActiveEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const editorRefs = useRef(new Map())
  const canAdd = !managing && items.length < MAX_EDUCATIONS && editingId === null

  async function persist(nextItems) {
    setSaving(true)
    setError('')
    try {
      const saved = await onSaveEducations(nextItems)
      setEditingId(null)
      return saved
    } catch (err) {
      console.error('Profile educations update failed:', err)
      setError(t('profile.updateError'))
      throw err
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveItem(payload) {
    const exists = items.some((item) => item.id === payload.id)
    const nextItems = exists
      ? items.map((item) => (item.id === payload.id ? payload : item))
      : [...items, payload]
    await persist(nextItems)
  }

  function startManaging() {
    setError('')
    setEditItems(items)
    setActiveEditId(items[0]?.id || null)
    editorRefs.current.clear()
    setManaging(true)
  }

  function cancelManaging() {
    setError('')
    setEditItems([])
    setActiveEditId(null)
    editorRefs.current.clear()
    setManaging(false)
  }

  function selectEditItem(nextId) {
    if (nextId === activeEditId) return
    const currentValue = editorRefs.current.get(activeEditId)?.getValue()
    if (!currentValue) return

    setEditItems((current) =>
      current.map((item) => (item.id === activeEditId ? currentValue : item)),
    )
    editorRefs.current.clear()
    setActiveEditId(nextId)
  }

  function removeEditedItem(id) {
    const remaining = editItems.filter((item) => item.id !== id)
    setEditItems(remaining)
    editorRefs.current.clear()
    setActiveEditId(remaining[0]?.id || null)
  }

  async function saveManagedItems() {
    const activeValue = activeEditId
      ? editorRefs.current.get(activeEditId)?.getValue()
      : null
    if (activeEditId && !activeValue) return
    const nextItems = editItems.map((item) =>
      item.id === activeEditId ? activeValue : item,
    )

    try {
      await persist(nextItems)
      setEditItems([])
      setActiveEditId(null)
      editorRefs.current.clear()
      setManaging(false)
    } catch {
      // persist displays the localized error.
    }
  }

  if (items.length === 0 && editingId !== 'new') {
    return (
      <button
        type="button"
        className="profile-about-add-btn"
        onClick={() => {
          setError('')
          setEditingId('new')
        }}
      >
        <PlusIcon />
        {t('profile.addEducation')}
      </button>
    )
  }

  return (
    <div className="profile-edu-list">
      <div className="profile-about-field-head">
        <p className="profile-about-kicker">{t('profile.education')}</p>
        {!managing && editingId === null ? (
          <div className="profile-edu-head-actions">
            {canAdd ? (
              <button
                type="button"
                className="profile-about-edit-btn"
                onClick={() => {
                  setError('')
                  setEditingId('new')
                }}
                aria-label={t('profile.addEducation')}
                title={t('profile.addEducation')}
              >
                <PlusIcon />
              </button>
            ) : null}
            <button
              type="button"
              className="profile-about-edit-btn"
              onClick={startManaging}
              aria-label={`${t('profile.edit')} ${t('profile.education')}`}
              title={t('profile.edit')}
            >
              <EditIcon />
            </button>
          </div>
        ) : null}
      </div>

      {managing ? (
        <>
          <ul className="profile-edu-items profile-edu-items--editing">
            {editItems.map((item, index) => (
              <li
                key={item.id}
                className={`profile-edu-item profile-edu-item--editing${
                  activeEditId === item.id ? ' profile-edu-item--active-edit' : ''
                }`}
              >
                {activeEditId === item.id ? (
                  <>
                    <EducationEditorForm
                      ref={(editor) => {
                        if (editor) editorRefs.current.set(item.id, editor)
                        else editorRefs.current.delete(item.id)
                      }}
                      t={t}
                      initial={item}
                      idPrefix={`profile-edu-${index}`}
                      saving={saving}
                      error=""
                      showActions={false}
                    />
                    <button
                      type="button"
                      className="profile-edu-delete-link"
                      onClick={() => removeEditedItem(item.id)}
                      disabled={saving}
                    >
                      {t('profile.removeEducation')}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="profile-edu-edit-choice"
                    onClick={() => selectEditItem(item.id)}
                    disabled={saving}
                  >
                    <span>{degreeTypeLabel(t, item)} · {item.program}</span>
                    <span>{item.university}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
          <div className="profile-about-edit-actions">
            <button type="button" onClick={cancelManaging} disabled={saving}>
              {t('profile.cancel')}
            </button>
            <button type="button" onClick={() => void saveManagedItems()} disabled={saving}>
              {saving ? t('profile.saving') : t('profile.save')}
            </button>
          </div>
          {error ? <p className="profile-about-edit-error" role="alert">{error}</p> : null}
        </>
      ) : (
        <ul className="profile-edu-items">
          {items.map((item) => (
            <li key={item.id} className="profile-edu-item">
              <div className="profile-edu-item-view">
                <div className="profile-edu-item-copy">
                  <p className="profile-about-lead profile-edu-item-title">
                    {degreeTypeLabel(t, item)}
                    {item.program ? ` · ${item.program}` : ''}
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

      {editingId === 'new' ? (
        <EducationEditorForm
          t={t}
          initial={null}
          saving={saving}
          error={error}
          onCancel={() => {
            setError('')
            setEditingId(null)
          }}
          onSave={(payload) => void handleSaveItem(payload)}
        />
      ) : null}

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
  allowEmpty = false,
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

  function clearDraft() {
    setDraft('')
    setError('')
    fieldRef.current?.focus()
  }

  async function save() {
    const nextValue = draft.trim()
    if (!nextValue && !allowEmpty) {
      setError(t('profile.fieldRequired'))
      return
    }
    if (maxLength && nextValue.length > maxLength) {
      setError(t('profile.fieldTooLong', { max: maxLength }))
      return
    }
    if (nextValue === (value || '').trim()) {
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
        <PlusIcon />
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
            {allowEmpty ? (
              <button
                type="button"
                className="profile-about-clear-btn"
                onClick={clearDraft}
                disabled={saving || !draft}
              >
                {t('profile.clear')}
              </button>
            ) : null}
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

function PersonRow({ person, actionLabel, iconOnly = false, onAction }) {
  return (
    <li className="network-person">
      <UserAvatar user={person} className="network-person-avatar" />
      <div className="network-person-info">
        <p className="network-person-name">{person.displayName || person.username || person.email}</p>
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
        onClick={onAction}
        disabled={!onAction}
      >
        {iconOnly ? <MessageIcon /> : actionLabel}
      </button>
    </li>
  )
}

function ProfileAboutSection({
  t,
  educations,
  summary,
  preferredWorkCities,
  onSaveEducations,
  onSaveSummary,
}) {
  const workCities = preferredWorkCities.length > 0 ? preferredWorkCities : []

  return (
    <section className="profile-about" aria-label={t('profile.sectionAbout')}>
      <div
        className={`profile-about-side${
          educations.length === 0 && workCities.length === 0 ? ' profile-about-side--empty' : ''
        }`}
      >
        <div
          className={`profile-about-degree${
            educations.length === 0 ? ' profile-about-degree--empty' : ''
          }`}
        >
          <EducationList t={t} educations={educations} onSaveEducations={onSaveEducations} />
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

      <div className={`profile-about-main${!summary.trim() ? ' profile-about-main--empty' : ''}`}>
        <EditableProfileField
          t={t}
          label={t('profile.summary')}
          value={summary}
          addLabel={t('profile.addSummary')}
          multiline
          maxLength={500}
          allowEmpty
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
    <section
      className={`profile-cv-post${!activeCv && !loading ? ' profile-cv-post--empty' : ''}`}
      aria-labelledby="profile-active-cv-heading"
    >
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

      <div className={`profile-cv-post-body${!activeCv && !loading ? ' profile-cv-post-body--empty' : ''}`}>
        <div className="profile-cv-post-content">
          <span className="profile-cv-label">{t('profile.activeCv')}</span>
          <h2
            id="profile-active-cv-heading"
            className={`profile-cv-heading${!activeCv && !loading ? ' profile-cv-heading--wrap' : ''}`}
          >
            {activeCv ? stripPdfExtension(activeCv.displayName) : t('profile.cvEmpty')}
          </h2>
          <p className="profile-cv-caption">
            {activeCv || loading ? t('profile.activeCvIntro') : t('profile.cvEmptyIntro')}
          </p>
        </div>

        {!activeCv && !loading ? (
          <div className="profile-cv-actions profile-cv-actions--cta" role="group" aria-label={t('profile.activeCv')}>
            <Link to="/my-cv" className="profile-cv-cta">
              {t('profile.goToMyCv')}
            </Link>
          </div>
        ) : null}

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
  const { user, authLoading, setShowLogoutConfirm, setShowDeleteConfirm, refreshUser } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { files, activeFileId } = useResume()
  const photoInputRef = useRef(null)
  const [panel, setPanel] = useState(null)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showChangeEmail, setShowChangeEmail] = useState(false)
  const [username, setUsername] = useState('')
  const [homeCity, setHomeCity] = useState('')
  const [editUsername, setEditUsername] = useState('')
  const [editHomeCity, setEditHomeCity] = useState('')
  const [identitySaving, setIdentitySaving] = useState(false)
  const [identityError, setIdentityError] = useState('')
  const [identityNotice, setIdentityNotice] = useState(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoNotice, setPhotoNotice] = useState(null)
  const [preferredWorkCities, setPreferredWorkCities] = useState([])
  const [educations, setEducations] = useState([])
  const [summary, setSummary] = useState('')
  const [profileDataLoading, setProfileDataLoading] = useState(true)
  const [myNetwork, setMyNetwork] = useState([])
  const [myNetworkLoading, setMyNetworkLoading] = useState(true)

  const cachedProfile = user?.uid ? readCachedProfile(user.uid) : null
  const profileView =
    profileDataLoading && cachedProfile
      ? cachedProfile
      : {
          username,
          homeCity,
          preferredWorkCities,
          educations,
          summary,
        }

  useEffect(() => {
    if (!user?.uid) {
      setUsername('')
      setHomeCity('')
      setPreferredWorkCities([])
      setEducations([])
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
        setEditUsername(data.username || '')
        setEditHomeCity(data.homeCity || '')
        setPreferredWorkCities(data.preferredWorkCities)
        setEducations(data.educations)
        setSummary(data.summary)
        writeCachedProfile(user.uid, data)
      })
      .catch((err) => {
        console.error('Profile load failed:', err)
        if (!cancelled) {
          setUsername('')
          setHomeCity('')
          setPreferredWorkCities([])
          setEducations([])
          setSummary('')
          clearCachedProfile(user.uid)
        }
      })
      .finally(() => {
        if (!cancelled) setProfileDataLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user?.uid])

  useEffect(() => {
    if (!user?.uid) {
      setMyNetwork([])
      setMyNetworkLoading(false)
      return undefined
    }

    setMyNetworkLoading(true)
    return subscribeToUserNetworks(
      user.uid,
      (people) => {
        setMyNetwork(people)
        setMyNetworkLoading(false)
      },
      () => {
        setMyNetwork([])
        setMyNetworkLoading(false)
      },
    )
  }, [user?.uid])

  function togglePanel(next) {
    setPanel((current) => (current === next ? null : next))
  }

  useEffect(() => {
    if (panel !== 'settings') return
    setEditUsername(username || '')
    setEditHomeCity(homeCity || '')
    setIdentityError('')
  }, [panel, username, homeCity])

  useEffect(() => {
    if (!identityNotice) return undefined
    const timer = window.setTimeout(() => setIdentityNotice(null), 5000)
    return () => window.clearTimeout(timer)
  }, [identityNotice])

  useEffect(() => {
    if (!photoNotice) return undefined
    const timer = window.setTimeout(() => setPhotoNotice(null), 5000)
    return () => window.clearTimeout(timer)
  }, [photoNotice])

  async function handleSaveIdentity(event) {
    event.preventDefault()
    if (!user?.uid || identitySaving) return

    setIdentitySaving(true)
    setIdentityError('')
    setIdentityNotice(null)
    try {
      const saved = await saveUserIdentity(user.uid, {
        username: editUsername,
        homeCity: editHomeCity,
      })
      setUsername(saved.username)
      setHomeCity(saved.homeCity)
      setEditUsername(saved.username)
      setEditHomeCity(saved.homeCity)
      writeCachedProfile(user.uid, {
        username: saved.username,
        homeCity: saved.homeCity,
        preferredWorkCities,
        educations,
        summary,
      })
      setIdentityNotice({
        type: 'success',
        title: t('prefs.identitySavedTitle'),
        message: t('prefs.identitySavedMessage'),
      })
    } catch (err) {
      console.error('Identity update failed:', err)
      if (err?.code === 'INVALID_USERNAME') {
        setIdentityError(t('locationSetup.usernameInvalid'))
      } else if (err?.code === 'INVALID_CITY') {
        setIdentityError(t('locationSetup.homeCityRequired'))
      } else {
        setIdentityError(t('prefs.identityError'))
      }
      setIdentityNotice({
        type: 'error',
        title: t('prefs.identityErrorTitle'),
        message: t('prefs.identityError'),
      })
    } finally {
      setIdentitySaving(false)
    }
  }

  async function handleProfilePhotoChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!user?.uid || !file || photoUploading) return

    setPhotoUploading(true)
    setPhotoNotice(null)
    try {
      const { url } = await uploadProfilePhoto(user.uid, file)
      await updateProfile(user, { photoURL: url })
      await saveUserPhotoURL(user.uid, url)
      await refreshUser?.()
      setPhotoNotice({
        type: 'success',
        title: t('profile.photoSavedTitle'),
        message: t('profile.photoSavedMessage'),
      })
    } catch (err) {
      console.error('Profile photo upload failed:', err)
      let message = t('profile.photoError')
      if (err?.code === 'INVALID_PROFILE_PHOTO_TYPE') {
        message = t('profile.photoInvalidType')
      } else if (err?.code === 'PROFILE_PHOTO_TOO_LARGE') {
        message = t('profile.photoTooLarge')
      }
      setPhotoNotice({
        type: 'error',
        title: t('profile.photoErrorTitle'),
        message,
      })
    } finally {
      setPhotoUploading(false)
    }
  }

  async function updateProfileField(field, value) {
    await saveUserProfileField(user.uid, field, value)
    if (field === 'summary') {
      setSummary(value)
      writeCachedProfile(user.uid, {
        username,
        homeCity,
        preferredWorkCities,
        educations,
        summary: value,
      })
    }
  }

  async function updateEducations(nextEducations) {
    const saved = await saveUserEducations(user.uid, nextEducations)
    setEducations(saved)
    writeCachedProfile(user.uid, {
      username,
      homeCity,
      preferredWorkCities,
      educations: saved,
      summary,
    })
    return saved
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

  const profileUsername =
    profileView.username || user.email?.split('@')[0] || t('profile.untitled')

  return (
    <main className="main profile-page">
      <div className="profile-shell">
        <header className="profile-hero">
          <div className="profile-hero-glow" aria-hidden="true" />
          <div className="profile-hero-row">
            <div className="profile-hero-avatar-wrap">
              <button
                type="button"
                className={`profile-hero-avatar-btn${photoUploading ? ' profile-hero-avatar-btn--busy' : ''}`}
                onClick={() => photoInputRef.current?.click()}
                disabled={photoUploading}
                aria-label={t('profile.changePhoto')}
                title={t('profile.changePhoto')}
              >
                <UserAvatar user={user} className="profile-page-avatar" />
                <span className="profile-hero-avatar-overlay" aria-hidden="true">
                  {photoUploading ? (
                    <span className="profile-hero-avatar-spinner" />
                  ) : (
                    <CameraIcon />
                  )}
                </span>
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="profile-hero-avatar-input"
                onChange={handleProfilePhotoChange}
                disabled={photoUploading}
              />
            </div>
            <div className="profile-hero-text">
              <p className="profile-hero-name">@{profileUsername}</p>
            </div>
            <p
              className={`profile-hero-city${!profileView.homeCity ? ' profile-hero-city--muted' : ''}`}
              aria-label={t('profile.homeCity')}
            >
              <span className="profile-hero-city-icon">
                <PinIcon />
              </span>
              <span className="profile-hero-city-label">
                {profileView.homeCity || t('profile.locationEmpty')}
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
                {myNetworkLoading ? (
                  <li className="network-empty">{t('network.loading')}</li>
                ) : myNetwork.length === 0 ? (
                  <li className="network-empty">{t('network.noConnections')}</li>
                ) : (
                  myNetwork.map((person) => (
                    <PersonRow
                      key={person.id}
                      person={person}
                      actionLabel={t('network.connect')}
                      onAction={() => navigate(`/profile/${person.uid}`)}
                    />
                  ))
                )}
              </ul>
            </div>
          ) : null}

          {panel === 'settings' ? (
            <div className="profile-page-panel prefs-panel">
              <div className="profile-page-panel-head">
                <div className="prefs-panel-heading">
                  <p className="profile-page-panel-title">{t('prefs.title')}</p>
                  <p className="prefs-panel-subtitle">{t('prefs.subtitle')}</p>
                </div>
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

              <div className="prefs-body">
                <section className="prefs-section" aria-label={t('profile.signInMethod')}>
                  <div className="prefs-row prefs-row--static">
                    <div className="prefs-row-leading">
                      <span className="prefs-row-icon" aria-hidden="true">
                        <PrefsAuthIcon method={resolveAuthMethod(user)} />
                      </span>
                      <div className="prefs-row-info">
                        <p className="prefs-row-label">{t('profile.signInMethod')}</p>
                        <p className="prefs-row-hint">{t('prefs.signInHint')}</p>
                      </div>
                    </div>
                    <span className="prefs-auth-badge">
                      {authMethodLabel(resolveAuthMethod(user), t)}
                    </span>
                  </div>
                </section>

                <section className="prefs-section" aria-label={t('prefs.profile')}>
                  <style>{`
                    #prefs-username.prefs-identity-input {
                      padding-left: 12px !important;
                      padding-bottom: 12px !important;
                    }
                    #prefs-home-city.prefs-identity-city-trigger {
                      padding-left: 12px !important;
                    }
                  `}</style>
                  <form className="prefs-identity-form" onSubmit={handleSaveIdentity}>
                    <div className="prefs-identity-field">
                      <div className="prefs-row-leading">
                        <span className="prefs-row-icon" aria-hidden="true">
                          <PrefsUsernameIcon />
                        </span>
                        <div className="prefs-row-info">
                          <label className="prefs-row-label" htmlFor="prefs-username">
                            {t('prefs.username')}
                          </label>
                          <p className="prefs-row-hint">{t('prefs.usernameHint')}</p>
                        </div>
                      </div>
                      <input
                        id="prefs-username"
                        className="form-input prefs-identity-input"
                        type="text"
                        value={editUsername}
                        onChange={(e) => {
                          setEditUsername(e.target.value)
                        }}
                        autoComplete="username"
                        maxLength={30}
                        spellCheck={false}
                        disabled={identitySaving}
                      />
                    </div>

                    <div className="prefs-identity-field">
                      <div className="prefs-row-leading">
                        <span className="prefs-row-icon" aria-hidden="true">
                          <PrefsCityIcon />
                        </span>
                        <div className="prefs-row-info">
                          <label className="prefs-row-label" htmlFor="prefs-home-city">
                            {t('prefs.city')}
                          </label>
                          <p className="prefs-row-hint">{t('prefs.cityHint')}</p>
                        </div>
                      </div>
                      <div className="prefs-identity-city-row">
                        <div className="prefs-identity-city">
                          <TurkishCitySelect
                            id="prefs-home-city"
                            value={editHomeCity}
                            onChange={(city) => {
                              setEditHomeCity(city)
                            }}
                            placeholder={t('locationSetup.homeCityPlaceholder')}
                            t={t}
                            triggerClassName="prefs-identity-city-trigger"
                          />
                        </div>
                        <button
                          type="submit"
                          className="prefs-action-btn prefs-identity-save"
                          disabled={identitySaving}
                        >
                          {identitySaving ? t('prefs.identitySaving') : t('prefs.saveProfile')}
                        </button>
                      </div>
                      {identityError ? (
                        <p className="prefs-identity-status prefs-identity-status--error" role="alert">
                          {identityError}
                        </p>
                      ) : null}
                    </div>
                  </form>
                </section>

                <section className="prefs-section" aria-label={t('prefs.title')}>
                  <div className="prefs-row">
                    <div className="prefs-row-leading">
                      <span className="prefs-row-icon" aria-hidden="true">
                        <PrefsLanguageIcon />
                      </span>
                      <div className="prefs-row-info">
                        <p className="prefs-row-label">{t('prefs.language')}</p>
                        <p className="prefs-row-hint">{t('prefs.languageHint')}</p>
                      </div>
                    </div>
                    <LanguageSwitcher />
                  </div>
                  <div className="prefs-row">
                    <div className="prefs-row-leading">
                      <span className="prefs-row-icon" aria-hidden="true">
                        <PrefsThemeIcon />
                      </span>
                      <div className="prefs-row-info">
                        <p className="prefs-row-label">{t('prefs.theme')}</p>
                        <p className="prefs-row-hint">{t('prefs.themeHint')}</p>
                      </div>
                    </div>
                    <ThemeSwitcher />
                  </div>
                </section>

                <section className="prefs-section" aria-label={t('prefs.account')}>
                  {resolveAuthMethod(user) === AUTH_METHOD_EMAIL_PASSWORD ? (
                    <div className="prefs-row">
                      <div className="prefs-row-leading">
                        <span className="prefs-row-icon" aria-hidden="true">
                          <PrefsEmailIcon />
                        </span>
                        <div className="prefs-row-info">
                          <p className="prefs-row-label">{t('prefs.changeEmail')}</p>
                          <p className="prefs-row-hint">{t('prefs.changeEmailHint')}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="prefs-action-btn"
                        onClick={() => setShowChangeEmail(true)}
                      >
                        {t('prefs.changeEmailAction')}
                      </button>
                    </div>
                  ) : null}
                  <div className="prefs-row">
                    <div className="prefs-row-leading">
                      <span className="prefs-row-icon" aria-hidden="true">
                        <PrefsPasswordIcon />
                      </span>
                      <div className="prefs-row-info">
                        <p className="prefs-row-label">{t('prefs.changePassword')}</p>
                        <p className="prefs-row-hint">{t('prefs.changePasswordHint')}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="prefs-action-btn"
                      onClick={() => setShowChangePassword(true)}
                    >
                      {t('prefs.changePasswordAction')}
                    </button>
                  </div>
                </section>

                <section className="prefs-section prefs-section--warn" aria-label={t('prefs.deleteAccount')}>
                  <div className="prefs-row">
                    <div className="prefs-row-leading">
                      <span className="prefs-row-icon prefs-row-icon--warn" aria-hidden="true">
                        <PrefsDeleteIcon />
                      </span>
                      <div className="prefs-row-info">
                        <p className="prefs-row-label">{t('prefs.deleteAccount')}</p>
                        <p className="prefs-row-hint">{t('prefs.deleteAccountHint')}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="prefs-warn-btn"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      {t('prefs.deleteAccountAction')}
                    </button>
                  </div>
                </section>

                <section className="prefs-section prefs-section--danger" aria-label={t('prefs.logout')}>
                  <div className="prefs-row">
                    <div className="prefs-row-leading">
                      <span className="prefs-row-icon prefs-row-icon--danger" aria-hidden="true">
                        <PrefsLogoutIcon />
                      </span>
                      <div className="prefs-row-info">
                        <p className="prefs-row-label">{t('prefs.logout')}</p>
                        <p className="prefs-row-hint">{t('prefs.logoutHint')}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="prefs-logout-btn"
                      onClick={() => setShowLogoutConfirm(true)}
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                </section>
              </div>
            </div>
          ) : null}
        </header>

        {showChangeEmail && user ? (
          <ChangeEmailModal user={user} onClose={() => setShowChangeEmail(false)} />
        ) : null}

        {showChangePassword && user ? (
          <ChangePasswordModal user={user} onClose={() => setShowChangePassword(false)} />
        ) : null}

        <div className="profile-page-main">
          <ProfileAboutSection
            t={t}
            educations={profileView.educations}
            summary={profileView.summary}
            preferredWorkCities={profileView.preferredWorkCities}
            onSaveEducations={updateEducations}
            onSaveSummary={(value) => updateProfileField('summary', value)}
          />
          <ActiveCvPanel t={t} />
        </div>
      </div>

      {(photoNotice || identityNotice)
        ? createPortal(
            (() => {
              const notice = photoNotice || identityNotice
              const dismiss = () => {
                if (photoNotice) setPhotoNotice(null)
                else setIdentityNotice(null)
              }
              return (
                <div
                  className={`create-cv-toast create-cv-toast--${notice.type}`}
                  role="status"
                  aria-live="polite"
                >
                  <span className="create-cv-toast-icon" aria-hidden="true">
                    {notice.type === 'success' ? '✓' : '!'}
                  </span>
                  <div className="create-cv-toast-copy">
                    <strong className="create-cv-toast-title">{notice.title}</strong>
                    <p className="create-cv-toast-text">{notice.message}</p>
                  </div>
                  <button
                    type="button"
                    className="create-cv-toast-close"
                    aria-label={t('prefs.dismissNotice')}
                    onClick={dismiss}
                  >
                    ×
                  </button>
                </div>
              )
            })(),
            document.body,
          )
        : null}
    </main>
  )
}
