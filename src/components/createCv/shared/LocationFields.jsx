import { useMemo } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import {
  findCountryByCode,
  formatLocationValue,
  parseLocationValue,
} from '../../../data/countries'
import CountrySelect from './CountrySelect'
import FieldLabel from './FieldLabel'
import TurkishCitySelect from './TurkishCitySelect'

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

  const country = findCountryByCode(parsed.countryCode)
  const isTurkey = parsed.countryCode === 'TR'

  const emit = (city, countryCode) => {
    onChange(formatLocationValue(city, countryCode, lang))
  }

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
            <TurkishCitySelect
              id={`${idPrefix}-city`}
              value={parsed.city}
              required={required}
              placeholder={t('createCv.cityPlaceholder')}
              t={t}
              onChange={(city) => emit(city, parsed.countryCode || 'TR')}
            />
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
