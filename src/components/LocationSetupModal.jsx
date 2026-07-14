import { useEffect, useRef, useState } from 'react'
import { signOut } from 'firebase/auth'
import { useLanguage } from '../context/LanguageContext'
import { TURKISH_CITIES } from '../data/turkishCities'
import { auth } from '../firebase'
import { saveUserLocation } from '../userService'

const MAX_WORK_CITIES = 3

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function LocationSetupModal({ user, onComplete }) {
  const { t } = useLanguage()
  const [homeCity, setHomeCity] = useState('')
  const [workCities, setWorkCities] = useState([])
  const [homeOpen, setHomeOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const homeFieldRef = useRef(null)

  useEffect(() => {
    if (!homeOpen) return undefined
    const handleClickOutside = (event) => {
      if (homeFieldRef.current && !homeFieldRef.current.contains(event.target)) {
        setHomeOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [homeOpen])

  const selectHomeCity = (city) => {
    setError('')
    setHomeCity(city)
    setHomeOpen(false)
  }

  const toggleWorkCity = (city) => {
    setError('')
    setWorkCities((current) => {
      if (current.includes(city)) {
        return current.filter((item) => item !== city)
      }
      if (current.length >= MAX_WORK_CITIES) return current
      return [...current, city]
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!homeCity) {
      setError(t('locationSetup.homeCityRequired'))
      return
    }

    if (workCities.length === 0) {
      setError(t('locationSetup.workCitiesRequired'))
      return
    }

    setSaving(true)
    try {
      await saveUserLocation(user.uid, { homeCity, preferredWorkCities: workCities })
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
        className="modal modal--auth modal--location"
        role="dialog"
        aria-labelledby="location-setup-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-auth-header">
          <div className="location-setup-header">
            <h2 id="location-setup-title" className="modal-heading">
              {t('locationSetup.title')}
            </h2>
          </div>
        </div>

        <form className="modal-auth-body location-setup-form" onSubmit={handleSubmit}>
          <p className="location-setup-text">{t('locationSetup.subtitle')}</p>

          <div className="form-field location-setup-home-field" ref={homeFieldRef}>
            <label className="form-label" htmlFor="home-city-trigger">
              {t('locationSetup.homeCity')}
            </label>
            <button
              type="button"
              id="home-city-trigger"
              className={`form-input location-setup-select-trigger${homeCity ? '' : ' location-setup-select-trigger--placeholder'}`}
              onClick={() => setHomeOpen((open) => !open)}
              disabled={saving}
              aria-haspopup="listbox"
              aria-expanded={homeOpen}
            >
              <span>{homeCity || t('locationSetup.homeCityPlaceholder')}</span>
              <span className="location-setup-select-arrow" aria-hidden="true">
                <ChevronIcon />
              </span>
            </button>

            {homeOpen && (
              <div className="location-setup-dropdown">
                <div className="location-setup-dropdown-list" role="listbox">
                  {TURKISH_CITIES.map((city) => {
                    const selected = homeCity === city
                    return (
                      <button
                        key={city}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={`location-setup-city-option${selected ? ' location-setup-city-option--selected' : ''}`}
                        onClick={() => selectHomeCity(city)}
                        disabled={saving}
                      >
                        <span className="location-setup-city-check" aria-hidden="true">
                          {selected ? '✓' : ''}
                        </span>
                        <span>{city}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="form-field location-setup-work-field">
            <div className="location-setup-work-head">
              <label className="form-label">
                {t('locationSetup.workCities')}
              </label>
              <span className="location-setup-count">
                {t('locationSetup.selectedCount', { count: workCities.length, max: MAX_WORK_CITIES })}
              </span>
            </div>
            <p className="location-setup-hint">{t('locationSetup.workCitiesHint')}</p>

            {workCities.length > 0 && (
              <div className="location-setup-chips" aria-label={t('locationSetup.workCities')}>
                {workCities.map((city) => (
                  <button
                    key={city}
                    type="button"
                    className="location-setup-chip"
                    onClick={() => toggleWorkCity(city)}
                    disabled={saving}
                  >
                    {city}
                    <span aria-hidden="true">×</span>
                  </button>
                ))}
              </div>
            )}

            <div className="location-setup-city-list" role="listbox" aria-multiselectable="true">
              {TURKISH_CITIES.map((city) => {
                const selected = workCities.includes(city)
                const disabled = saving || (!selected && workCities.length >= MAX_WORK_CITIES)

                return (
                  <button
                    key={city}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`location-setup-city-option${selected ? ' location-setup-city-option--selected' : ''}`}
                    onClick={() => toggleWorkCity(city)}
                    disabled={disabled}
                  >
                    <span className="location-setup-city-check" aria-hidden="true">
                      {selected ? '✓' : ''}
                    </span>
                    <span>{city}</span>
                  </button>
                )
              })}
            </div>
          </div>

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

        <div className="modal-auth-footer">
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
  )
}
