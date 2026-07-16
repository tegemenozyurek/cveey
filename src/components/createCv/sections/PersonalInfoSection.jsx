import { MILITARY_STATUS_OPTIONS } from '../../../createCv/constants'
import CreateCvSectionHead from '../shared/CreateCvSectionHead'
import FieldLabel, { fieldIsRequired, isVisible } from '../shared/FieldLabel'
import LocationFields from '../shared/LocationFields'
import MaterialDatePicker from '../shared/MaterialDatePicker'
import PhoneInput from '../shared/PhoneInput'

const PERSONAL_FIELD_META = {
  fullName: { type: 'text', placeholderKey: 'createCv.fullNamePlaceholder', autoComplete: 'name', full: true },
  jobTitle: { type: 'text', placeholderKey: 'createCv.jobTitlePlaceholder', full: true },
  email: { type: 'email', placeholder: 'you@example.com', autoComplete: 'email', full: true },
  linkedin: { type: 'url', placeholder: 'linkedin.com/in/username' },
  github: { type: 'url', placeholder: 'github.com/username' },
  portfolio: { type: 'url', placeholder: 'yourportfolio.com', full: true },
  behance: { type: 'url', placeholder: 'behance.net/username' },
  dribbble: { type: 'url', placeholder: 'dribbble.com/username' },
  stackoverflow: { type: 'url', placeholder: 'stackoverflow.com/users/...' },
  drivingLicense: { type: 'text', placeholderKey: 'createCv.drivingLicensePlaceholder' },
  medicalLicense: { type: 'text', placeholderKey: 'createCv.medicalLicensePlaceholder' },
  specialty: { type: 'text', placeholderKey: 'createCv.specialtyPlaceholder' },
  residency: { type: 'text', placeholderKey: 'createCv.residencyPlaceholder' },
  teachingSubjects: { type: 'text', placeholderKey: 'createCv.teachingSubjectsPlaceholder', full: true },
  teachingCertificate: { type: 'text', placeholderKey: 'createCv.teachingCertificatePlaceholder' },
  accountingSoftware: { type: 'text', placeholderKey: 'createCv.accountingSoftwarePlaceholder' },
  taxExperience: { type: 'text', placeholderKey: 'createCv.taxExperiencePlaceholder' },
  licenseClass: { type: 'text', placeholderKey: 'createCv.licenseClassPlaceholder' },
  adrCertificate: { type: 'text', placeholderKey: 'createCv.adrCertificatePlaceholder' },
  drivingExperience: { type: 'text', placeholderKey: 'createCv.drivingExperiencePlaceholder' },
  flightHours: { type: 'text', placeholderKey: 'createCv.flightHoursPlaceholder' },
  aircraftTypes: { type: 'text', placeholderKey: 'createCv.aircraftTypesPlaceholder' },
  pilotLicense: { type: 'text', placeholderKey: 'createCv.pilotLicensePlaceholder' },
  clinicalExperience: { type: 'text', placeholderKey: 'createCv.clinicalExperiencePlaceholder', full: true },
  nurseCertifications: { type: 'text', placeholderKey: 'createCv.nurseCertificationsPlaceholder', full: true },
  salesTarget: { type: 'text', placeholderKey: 'createCv.salesTargetPlaceholder' },
  crmExperience: { type: 'text', placeholderKey: 'createCv.crmExperiencePlaceholder' },
  cuisineTypes: { type: 'text', placeholderKey: 'createCv.cuisineTypesPlaceholder' },
  michelinExperience: { type: 'text', placeholderKey: 'createCv.michelinExperiencePlaceholder' },
  pmp: { type: 'text', placeholderKey: 'createCv.pmpPlaceholder' },
  autocad: { type: 'text', placeholderKey: 'createCv.autocadPlaceholder' },
  sap2000: { type: 'text', placeholderKey: 'createCv.sap2000Placeholder' },
  adobeSkills: { type: 'text', placeholderKey: 'createCv.adobeSkillsPlaceholder', full: true },
}

const FIELD_ORDER = [
  'fullName', 'jobTitle', 'location', 'phone', 'email',
  'linkedin', 'github', 'stackoverflow', 'portfolio', 'behance', 'dribbble',
  'dateOfBirth', 'drivingLicense', 'licenseClass', 'adrCertificate', 'drivingExperience',
  'medicalLicense', 'specialty', 'residency',
  'teachingSubjects', 'teachingCertificate',
  'accountingSoftware', 'taxExperience',
  'flightHours', 'aircraftTypes', 'pilotLicense',
  'clinicalExperience', 'nurseCertifications',
  'salesTarget', 'crmExperience',
  'cuisineTypes', 'michelinExperience',
  'pmp', 'autocad', 'sap2000', 'adobeSkills',
]

export default function PersonalInfoSection({
  value: personal,
  onChange,
  t,
  stepNumber = '01',
  fieldVisibility = {},
}) {
  const set = (field, nextValue) => {
    onChange({ ...personal, [field]: nextValue })
  }

  const showMilitary = isVisible(fieldVisibility.militaryStatus)

  return (
    <div className="create-cv-section create-cv-section--personal">
      <CreateCvSectionHead
        stepNumber={stepNumber}
        title={t('createCv.sectionPersonal')}
        description={t('createCv.sectionPersonalDesc')}
      />

      <div className="create-cv-grid create-cv-grid--personal">
        {FIELD_ORDER.map((field) => {
          const visibility = fieldVisibility[field]
          if (!isVisible(visibility)) return null

          if (field === 'phone') {
            return (
              <div key={field} className="form-field create-cv-field--full">
                <FieldLabel
                  htmlFor="cv-phone"
                  label={t('createCv.phone')}
                  visibility={visibility}
                  t={t}
                />
                <PhoneInput
                  id="cv-phone"
                  value={personal.phone || ''}
                  onChange={(next) => set('phone', next)}
                  required={fieldIsRequired(visibility)}
                />
              </div>
            )
          }

          if (field === 'location') {
            return (
              <LocationFields
                key={field}
                idPrefix="cv-location"
                value={personal.location || ''}
                onChange={(next) => set('location', next)}
                visibility={visibility}
                t={t}
                required={fieldIsRequired(visibility)}
              />
            )
          }

          if (field === 'dateOfBirth') {
            return (
              <div key={field} className="form-field">
                <FieldLabel
                  htmlFor="cv-dateOfBirth"
                  label={t('createCv.dateOfBirth')}
                  visibility={visibility}
                  t={t}
                />
                <MaterialDatePicker
                  id="cv-dateOfBirth"
                  value={personal.dateOfBirth || ''}
                  onChange={(next) => set('dateOfBirth', next)}
                  precision="day"
                  required={fieldIsRequired(visibility)}
                  t={t}
                />
              </div>
            )
          }

          const meta = PERSONAL_FIELD_META[field]
          const labelKey = `createCv.${field}`
          const placeholder = meta.placeholderKey ? t(meta.placeholderKey) : meta.placeholder

          return (
            <div key={field} className={`form-field${meta.full ? ' create-cv-field--full' : ''}`}>
              <FieldLabel
                htmlFor={`cv-${field}`}
                label={t(labelKey)}
                visibility={visibility}
                t={t}
              />
              <input
                id={`cv-${field}`}
                className="form-input"
                type={meta.type}
                value={personal[field] || ''}
                onChange={(e) => set(field, e.target.value)}
                placeholder={placeholder}
                autoComplete={meta.autoComplete}
                required={fieldIsRequired(visibility)}
              />
            </div>
          )
        })}

        {showMilitary && (
          <div className="form-field create-cv-field--full">
            <FieldLabel
              htmlFor="cv-military"
              label={t('createCv.militaryStatus')}
              visibility={fieldVisibility.militaryStatus}
              t={t}
            />
            <select
              id="cv-military"
              className="form-input form-select"
              value={personal.militaryStatus}
              onChange={(e) => set('militaryStatus', e.target.value)}
              required={fieldIsRequired(fieldVisibility.militaryStatus)}
            >
              {MILITARY_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {t(`createCv.military.${option}`)}
                </option>
              ))}
            </select>
            <p className="create-cv-field-hint">{t('createCv.militaryHint')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
