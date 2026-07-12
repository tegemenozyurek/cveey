export default function StarRating({ value, onChange, max = 5 }) {
  const parsedMax = Number(max)
  const parsedValue = Number(value)
  const safeMax = Number.isFinite(parsedMax)
    ? Math.min(5, Math.max(1, Math.round(parsedMax)))
    : 5
  const safeValue = Number.isFinite(parsedValue)
    ? Math.min(5, Math.max(1, Math.round(parsedValue)))
    : 1

  return (
    <div className="create-cv-star-rating" role="radiogroup">
      {Array.from({ length: safeMax }, (_, index) => {
        const level = index + 1
        const filled = level <= safeValue
        return (
          <button
            key={level}
            type="button"
            className={`create-cv-star${filled ? ' create-cv-star--filled' : ''}`}
            onClick={() => onChange(level)}
            aria-label={`${level}`}
            aria-pressed={filled}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}
