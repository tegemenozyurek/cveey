import { useEffect, useId, useRef, useState } from 'react'
import { signOut } from 'firebase/auth'
import { useLanguage } from '../context/LanguageContext'
import { filterTurkishCities } from '../data/turkishCities'
import { auth } from '../firebase'
import { saveUserOnboarding } from '../userService'

const USERNAME_MIN = 3
const USERNAME_MAX = 30
const USERNAME_RE = /^[a-zA-Z0-9._]+$/

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SearchableSelect({
  id,
  label,
  value,
  placeholder,
  searchPlaceholder,
  noResults,
  onSearch,
  onSelect,
  disabled,
  open,
  setOpen,
}) {
  const fieldRef = useRef(null)
  const [query, setQuery] = useState('')
  const listId = useId()

  useEffect(() => {
    if (!open) {
      setQuery('')
      return undefined
    }
    const handleClickOutside = (event) => {
      if (fieldRef.current && !fieldRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, setOpen])

  const filtered = open ? onSearch(query) : []

  return (
    <div className="form-field location-setup-home-field" ref={fieldRef}>
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <button
        type="button"
        id={id}
        className={`form-input location-setup-select-trigger${value ? '' : ' location-setup-select-trigger--placeholder'}`}
        onClick={() => setOpen((current) => !current)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
      >
        <span>{value || placeholder}</span>
        <span className="location-setup-select-arrow" aria-hidden="true">
          <ChevronIcon />
        </span>
      </button>

      {open && (
        <div className="location-setup-dropdown">
          <input
            type="search"
            className="form-input location-setup-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            autoFocus
            disabled={disabled}
            aria-controls={listId}
          />
          <div className="location-setup-dropdown-list" id={listId} role="listbox">
            {filtered.length === 0 ? (
              <p className="location-setup-empty">{noResults}</p>
            ) : (
              filtered.map((option) => {
                const selected = value === option
                return (
                  <button
                    key={option}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`location-setup-city-option${selected ? ' location-setup-city-option--selected' : ''}`}
                    onClick={() => {
                      onSelect(option)
                      setOpen(false)
                      setQuery('')
                    }}
                    disabled={disabled}
                  >
                    <span className="location-setup-city-check" aria-hidden="true">
                      {selected ? '✓' : ''}
                    </span>
                    <span>{option}</span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function LocationSetupModal({ user, onComplete }) {
  const { t } = useLanguage()
  const [username, setUsername] = useState('')
  const [homeCity, setHomeCity] = useState('')
  const [cityOpen, setCityOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const trimmedUsername = username.trim()
    if (trimmedUsername.length < USERNAME_MIN || trimmedUsername.length > USERNAME_MAX) {
      setError(t('locationSetup.usernameRequired'))
      return
    }
    if (!USERNAME_RE.test(trimmedUsername)) {
      setError(t('locationSetup.usernameInvalid'))
      return
    }

    if (!homeCity) {
      setError(t('locationSetup.homeCityRequired'))
      return
    }

    setSaving(true)
    try {
      await saveUserOnboarding(user.uid, {
        username: trimmedUsername,
        homeCity,
      })
      onComplete()
    } catch {
      setError(t('locationSetup.error'))
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = () => {
    signOut(auth)
  }

  return (
    <div className="modal-backdrop modal-backdrop--blocking">
      <div
        className="modal modal--auth modal--location modal--onboarding"
        role="dialog"
        aria-labelledby="location-setup-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="location-setup-intro">
          <div className="location-setup-brand" aria-label="cveey">
            cveey<span>.</span>
          </div>
          <div className="location-setup-intro-content">
            <h2 id="location-setup-title" className="location-setup-title">
              {t('locationSetup.title')}
            </h2>
            <p className="location-setup-text">{t('locationSetup.subtitle')}</p>
          </div>
          <div className="location-setup-orb location-setup-orb--one" aria-hidden="true" />
          <div className="location-setup-orb location-setup-orb--two" aria-hidden="true" />
        </div>

        <div className="location-setup-content">
          <form className="modal-auth-body location-setup-form" onSubmit={handleSubmit}>
            <div className="location-setup-form-heading">
              <h3 id="onboarding-info-heading" className="location-setup-section-title">
                {t('locationSetup.sectionInfo')}
              </h3>
            </div>

            <section className="location-setup-section" aria-labelledby="onboarding-info-heading">
              <div className="form-field location-setup-field-card">
                <label className="form-label" htmlFor="onboarding-username">
                  {t('locationSetup.username')}
                </label>
                <input
                  id="onboarding-username"
                  className="form-input"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => {
                    setError('')
                    setUsername(event.target.value)
                  }}
                  placeholder={t('locationSetup.usernamePlaceholder')}
                  maxLength={USERNAME_MAX}
                  disabled={saving}
                />
                <p className="location-setup-hint">{t('locationSetup.usernameHint')}</p>
              </div>

              <div className="location-setup-field-card">
                <SearchableSelect
                  id="home-city-trigger"
                  label={t('locationSetup.homeCity')}
                  value={homeCity}
                  placeholder={t('locationSetup.homeCityPlaceholder')}
                  searchPlaceholder={t('locationSetup.searchPlaceholder')}
                  noResults={t('locationSetup.noResults')}
                  onSearch={filterTurkishCities}
                  onSelect={(city) => {
                    setError('')
                    setHomeCity(city)
                  }}
                  disabled={saving}
                  open={cityOpen}
                  setOpen={setCityOpen}
                />
              </div>
            </section>

            <div className="modal-auth-error">
              {error && <p className="location-setup-error">{error}</p>}
            </div>

            <div className="location-setup-actions">
              <button
                type="submit"
                className="btn-gradient-wrap btn-gradient-wrap--block location-setup-submit"
                disabled={saving}
              >
                <span className="btn-gradient-inner">
                  {saving ? t('locationSetup.saving') : t('locationSetup.submit')}
                </span>
              </button>
            </div>
          </form>

          <div className="modal-auth-footer location-setup-footer">
            <button
              type="button"
              className="login-back-btn location-setup-signout"
              onClick={handleSignOut}
              disabled={saving}
            >
              {t('locationSetup.signOut')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
