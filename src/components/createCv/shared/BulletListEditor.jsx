import { VISIBILITY } from '../../../createCv/fieldVisibility'
import FieldLabel from './FieldLabel'

export default function BulletListEditor({
  idPrefix,
  label,
  items = [''],
  onChange,
  placeholder,
  addLabel,
  removeLabel,
  visibility,
  t,
}) {
  const safeItems = Array.isArray(items) && items.length > 0 ? items : ['']
  const updateItem = (index, value) => {
    const next = [...safeItems]
    next[index] = value
    onChange(next)
  }

  const addItem = () => onChange([...safeItems, ''])

  const removeItem = (index) => {
    if (safeItems.length <= 1) {
      onChange([''])
      return
    }
    onChange(safeItems.filter((_, i) => i !== index))
  }

  return (
    <div className="create-cv-bullet-list">
      {label && (visibility
        ? <FieldLabel htmlFor={`${idPrefix}-0`} label={label} visibility={visibility} t={t} />
        : <p className="form-label">{label}</p>)}
      <ul className="create-cv-bullet-items">
        {safeItems.map((item, index) => (
          <li key={`${idPrefix}-${index}`} className="create-cv-bullet-item">
            <span className="create-cv-bullet-marker" aria-hidden="true">•</span>
            <input
              id={`${idPrefix}-${index}`}
              className="form-input"
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={placeholder}
              required={visibility === VISIBILITY.REQUIRED}
            />
            <button
              type="button"
              className="btn btn-ghost btn-sm create-cv-item-remove"
              onClick={() => removeItem(index)}
              aria-label={removeLabel || addLabel}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="btn btn-ghost btn-sm create-cv-add-item" onClick={addItem}>
        + {addLabel}
      </button>
    </div>
  )
}
