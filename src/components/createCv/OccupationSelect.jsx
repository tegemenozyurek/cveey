import { getSelectableOccupations } from '../../createCv/occupations/registry'

export default function OccupationSelect({ value, onChange, t }) {
  const occupations = getSelectableOccupations()

  return (
    <div className="create-cv-occupation">
      <label className="form-label" htmlFor="cv-occupation">
        {t('createCv.occupationLabel')}
      </label>
      <select
        id="cv-occupation"
        className="form-input form-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {occupations.map((occupation) => (
          <option key={occupation.id} value={occupation.id}>
            {t(occupation.nameKey)}
          </option>
        ))}
      </select>
      <p className="create-cv-field-hint">{t('createCv.occupationHint')}</p>
    </div>
  )
}
