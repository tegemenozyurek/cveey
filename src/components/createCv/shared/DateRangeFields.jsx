import FieldLabel from './FieldLabel'
import MonthYearSelect from './MonthYearSelect'
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
        <MonthYearSelect
          id={startId}
          value={startValue}
          onChange={onStartChange}
          required={startVisibility === VISIBILITY.REQUIRED}
          t={t}
        />
      </div>
      <div className="form-field">
        <FieldLabel htmlFor={endId} label={endLabel} visibility={endVisibility} t={t} />
        <MonthYearSelect
          id={endId}
          value={endValue}
          onChange={onEndChange}
          disabled={isEndDisabled}
          required={endVisibility === VISIBILITY.REQUIRED && !isEndDisabled}
          t={t}
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
