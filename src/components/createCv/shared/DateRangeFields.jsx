import FieldLabel from './FieldLabel'
import { VISIBILITY } from '../../../createCv/fieldVisibility'

export default function DateRangeFields({
  startId,
  endId,
  startLabel,
  endLabel,
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  currentlyWorking,
  onCurrentlyWorkingChange,
  currentlyWorkingLabel,
  endDisabled,
  startVisibility,
  endVisibility,
  t,
}) {
  const isEndDisabled = Boolean(endDisabled)

  return (
    <div className="create-cv-date-range">
      <div className="form-field">
        <FieldLabel htmlFor={startId} label={startLabel} visibility={startVisibility} t={t} />
        <input
          id={startId}
          className="form-input"
          type="month"
          value={startValue}
          onChange={(e) => onStartChange(e.target.value)}
          required={startVisibility === VISIBILITY.REQUIRED}
        />
      </div>
      <div className="form-field">
        <FieldLabel htmlFor={endId} label={endLabel} visibility={endVisibility} t={t} />
        <input
          id={endId}
          className="form-input"
          type="month"
          value={endValue}
          onChange={(e) => onEndChange(e.target.value)}
          disabled={isEndDisabled}
          required={endVisibility === VISIBILITY.REQUIRED && !isEndDisabled}
        />
      </div>
      {onCurrentlyWorkingChange && (
        <label className="create-cv-checkbox-label create-cv-field--full">
          <input
            type="checkbox"
            checked={Boolean(currentlyWorking)}
            onChange={(e) => onCurrentlyWorkingChange(e.target.checked)}
          />
          <span>{currentlyWorkingLabel}</span>
        </label>
      )}
    </div>
  )
}
