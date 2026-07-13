import { useMemo, useState } from 'react'
import { signOut } from 'firebase/auth'
import { useLanguage } from '../context/LanguageContext'
import { TURKISH_CITIES, filterTurkishCities } from '../data/turkishCities'
import { auth } from '../firebase'
import { saveUserLocation } from '../userService'

const MAX_WORK_CITIES = 10

function LocationIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export default function LocationSetupModal({ user, onComplete }) {
  const { t } = useLanguage()
  const [homeCity, setHomeCity] = useState('')
  const [workCities, setWorkCities] = useState([])
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const filteredCities = useMemo(() => filterTurkishCities(search), [search])

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
            <div className="location-setup-icon">
              <LocationIcon />
            </div>
            <h2 id="location-setup-title" className="modal-heading">
              {t('locationSetup.title')}
            </h2>
          </div>
        </div>

        <form className="modal-auth-body location-setup-form" onSubmit={handleSubmit}>
          <p className="location-setup-text">{t('locationSetup.subtitle')}</p>

          <div className="form-field">
            <label className="form-label" htmlFor="home-city">
              {t('locationSetup.homeCity')}
            </label>
            <select
              id="home-city"
              className="form-input form-select"
              value={homeCity}
              onChange={(event) => {
                setError('')
                setHomeCity(event.target.value)
              }}
              disabled={saving}
              required
            >
              <option value="">{t('locationSetup.homeCityPlaceholder')}</option>
              {TURKISH_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field location-setup-work-field">
            <div className="location-setup-work-head">
              <label className="form-label" htmlFor="work-city-search">
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

            <input
              id="work-city-search"
              className="form-input"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('locationSetup.searchPlaceholder')}
              disabled={saving}
              autoComplete="off"
            />

            <div className="location-setup-city-list" role="listbox" aria-multiselectable="true">
              {filteredCities.length === 0 ? (
                <p className="location-setup-empty">{t('locationSetup.noResults')}</p>
              ) : (
                filteredCities.map((city) => {
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
                })
              )}
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
