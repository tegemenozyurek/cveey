import CreateCvSectionHead from '../shared/CreateCvSectionHead'

const DEFAULT_SUMMARY_MAX = 600

export default function ProfessionalSummarySection({
  value: summary,
  onChange,
  t,
  stepNumber = '02',
  maxLength = DEFAULT_SUMMARY_MAX,
}) {
  const count = summary.length

  return (
    <div className="create-cv-section">
      <CreateCvSectionHead
        stepNumber={stepNumber}
        title={t('createCv.sectionSummary')}
        description={t('createCv.sectionSummaryDesc')}
      />

      <div className="form-field">
        <label className="form-label" htmlFor="cv-summary">{t('createCv.summaryLabel')}</label>
        <textarea
          id="cv-summary"
          className="form-input form-textarea create-cv-textarea"
          value={summary}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder={t('createCv.summaryPlaceholder')}
          rows={6}
          required
        />
        <div className="create-cv-textarea-meta">
          <p className="create-cv-field-hint">{t('createCv.summaryHint')}</p>
          <span className={`create-cv-char-count${count >= maxLength ? ' create-cv-char-count--max' : ''}`}>
            {count}/{maxLength}
          </span>
        </div>
      </div>
    </div>
  )
}
