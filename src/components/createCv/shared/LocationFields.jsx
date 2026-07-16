import { useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import {
  findCountryByCode,
  formatLocationValue,
  parseLocationValue,
} from '../../../data/countries'
import { TURKISH_CITIES } from '../../../data/turkishCities'
import CountrySelect from './CountrySelect'
import FieldLabel from './FieldLabel'

export default function LocationFields({
  idPrefix,
  value,
  onChange,
  visibility,
  t,
  required = false,
  fullWidth = true,
}) {
  const { lang } = useLanguage()
  const parsed = useMemo(() => parseLocationValue(value), [value])
  const [cityQuery, setCityQuery] = useState('')

  const country = findCountryByCode(parsed.countryCode)
  const isTurkey = parsed.countryCode === 'TR'

  const emit = (city, countryCode) => {
    onChange(formatLocationValue(city, countryCode, lang))
  }

  const filteredCities = useMemo(() => {
    if (!isTurkey) return []
    const needle = cityQuery.trim().toLocaleLowerCase('tr-TR')
    if (!needle) return TURKISH_CITIES
    return TURKISH_CITIES.filter((city) => city.toLocaleLowerCase('tr-TR').includes(needle))
  }, [cityQuery, isTurkey])

  return (
    <div className={`create-cv-location${fullWidth ? ' create-cv-field--full' : ''}`}>
      <div className="create-cv-location-grid">
        <div className="form-field">
          <FieldLabel
            htmlFor={`${idPrefix}-country`}
            label={t('createCv.country')}
            visibility={visibility}
            t={t}
          />
          <CountrySelect
            id={`${idPrefix}-country`}
            value={parsed.countryCode}
            required={required}
            placeholder={t('createCv.countryPlaceholder')}
            t={t}
            onChange={(nextCode) => {
              const nextCity = nextCode === parsed.countryCode ? parsed.city : (nextCode === 'TR' ? '' : parsed.city)
              emit(nextCode === parsed.countryCode ? nextCity : (nextCode === 'TR' ? '' : nextCity), nextCode)
              setCityQuery('')
            }}
          />
        </div>

        <div className="form-field">
          <FieldLabel
            htmlFor={`${idPrefix}-city`}
            label={t('createCv.city')}
            visibility={visibility}
            t={t}
          />
          {isTurkey ? (
            <div className="create-cv-city-combobox">
              <input
                id={`${idPrefix}-city`}
                className="form-input"
                list={`${idPrefix}-city-list`}
                value={parsed.city}
                required={required}
                placeholder={t('createCv.cityPlaceholder')}
                onChange={(e) => {
                  setCityQuery(e.target.value)
                  emit(e.target.value, parsed.countryCode || 'TR')
                }}
                autoComplete="address-level2"
              />
              <datalist id={`${idPrefix}-city-list`}>
                {filteredCities.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
            </div>
          ) : (
            <input
              id={`${idPrefix}-city`}
              className="form-input"
              type="text"
              value={parsed.city}
              required={required}
              placeholder={t('createCv.cityPlaceholder')}
              onChange={(e) => emit(e.target.value, parsed.countryCode)}
              autoComplete="address-level2"
              disabled={!country && !parsed.countryCode}
            />
          )}
        </div>
      </div>
    </div>
  )
}
