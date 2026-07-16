import MaterialDatePicker from './MaterialDatePicker'

/** @deprecated Prefer MaterialDatePicker — kept as thin month-precision wrapper. */
export default function MonthYearSelect({
  id,
  value,
  onChange,
  disabled = false,
  required = false,
  t,
}) {
  return (
    <MaterialDatePicker
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      precision="month"
      t={t}
    />
  )
}
