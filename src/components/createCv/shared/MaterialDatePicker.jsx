import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const MONTH_KEYS = [
  'createCv.month.jan',
  'createCv.month.feb',
  'createCv.month.mar',
  'createCv.month.apr',
  'createCv.month.may',
  'createCv.month.jun',
  'createCv.month.jul',
  'createCv.month.aug',
  'createCv.month.sep',
  'createCv.month.oct',
  'createCv.month.nov',
  'createCv.month.dec',
]

const WEEKDAY_KEYS = [
  'createCv.weekday.sun',
  'createCv.weekday.mon',
  'createCv.weekday.tue',
  'createCv.weekday.wed',
  'createCv.weekday.thu',
  'createCv.weekday.fri',
  'createCv.weekday.sat',
]

const WEEKDAY_LONG_KEYS = [
  'createCv.weekdayLong.sun',
  'createCv.weekdayLong.mon',
  'createCv.weekdayLong.tue',
  'createCv.weekdayLong.wed',
  'createCv.weekdayLong.thu',
  'createCv.weekdayLong.fri',
  'createCv.weekdayLong.sat',
]

function pad2(n) {
  return String(n).padStart(2, '0')
}

function parseValue(value, precision) {
  if (!value) return null
  if (precision === 'month') {
    const match = String(value).match(/^(\d{4})-(\d{2})/)
    if (!match) return null
    return new Date(Number(match[1]), Number(match[2]) - 1, 1)
  }
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

function toMonthValue(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`
}

function toDayValue(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1)
}

function addYears(date, delta) {
  return new Date(date.getFullYear() + delta, date.getMonth(), 1)
}

function sameDay(a, b) {
  return a
    && b
    && a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

function sameMonth(a, b) {
  return a
    && b
    && a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
}

function formatDisplay(date, precision, t) {
  if (!date) return ''
  const monthName = t(MONTH_KEYS[date.getMonth()])
  if (precision === 'month') {
    return `${monthName} ${date.getFullYear()}`
  }
  const weekday = t(WEEKDAY_LONG_KEYS[date.getDay()])
  return `${weekday}, ${monthName} ${date.getDate()}`
}

function buildCalendarDays(viewMonth) {
  const first = startOfMonth(viewMonth)
  const startOffset = first.getDay()
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const cells = []

  for (let i = 0; i < startOffset; i += 1) {
    cells.push(null)
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(first.getFullYear(), first.getMonth(), day))
  }
  // Always render six calendar rows. Months normally need four, five, or six
  // rows; padding to 42 cells prevents the popover height from jumping while
  // navigating between months.
  while (cells.length < 42) cells.push(null)
  return cells
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function getPanelStyle(anchorEl) {
  if (!anchorEl) return null
  const rect = anchorEl.getBoundingClientRect()
  const gutter = 12
  const width = Math.min(320, Math.max(260, Math.min(rect.width, window.innerWidth - gutter * 2)))
  let left = rect.left
  left = Math.min(Math.max(gutter, left), window.innerWidth - width - gutter)
  const spaceBelow = window.innerHeight - rect.bottom
  const openUp = spaceBelow < 360 && rect.top > spaceBelow
  return {
    position: 'fixed',
    left,
    width,
    maxWidth: `calc(100vw - ${gutter * 2}px)`,
    top: openUp ? undefined : rect.bottom + 8,
    bottom: openUp ? window.innerHeight - rect.top + 8 : undefined,
    zIndex: 1400,
    boxSizing: 'border-box',
  }
}

/**
 * Material-inspired date picker.
 * @param {'month' | 'day'} precision — month stores YYYY-MM (no day UI), day stores YYYY-MM-DD
 */
export default function MaterialDatePicker({
  id,
  value,
  onChange,
  disabled = false,
  required = false,
  precision = 'month',
  t,
  placeholder,
}) {
  const isMonthOnly = precision === 'month'
  const reactId = useId()
  const fieldId = id || reactId
  const rootRef = useRef(null)
  const panelRef = useRef(null)
  const parsed = useMemo(() => parseValue(value, precision), [precision, value])
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => startOfMonth(parsed || new Date()))
  const [draft, setDraft] = useState(parsed)
  const [mode, setMode] = useState(isMonthOnly ? 'months' : 'calendar') // months | calendar | year
  const [panelStyle, setPanelStyle] = useState(null)

  const openPicker = () => {
    if (disabled) return
    setDraft(parsed)
    setView(startOfMonth(parsed || new Date()))
    setMode(isMonthOnly ? 'months' : 'calendar')
    setPanelStyle(getPanelStyle(rootRef.current))
    setOpen(true)
  }

  const closePicker = () => {
    setOpen(false)
    setPanelStyle(null)
  }

  useLayoutEffect(() => {
    if (!open) return undefined

    const updatePosition = () => {
      const next = getPanelStyle(rootRef.current)
      if (next) setPanelStyle(next)
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.documentElement.style.overflowX
    document.documentElement.style.overflowX = 'hidden'
    return () => {
      document.documentElement.style.overflowX = previousOverflow
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      if (rootRef.current?.contains(event.target)) return
      if (panelRef.current?.contains(event.target)) return
      closePicker()
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closePicker()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const selectLabel = t(isMonthOnly ? 'createCv.datePicker.selectMonth' : 'createCv.datePicker.selectDate')
  const display = formatDisplay(parsed, precision, t)
  const draftLabel = draft
    ? (isMonthOnly
      ? `${t(MONTH_KEYS[draft.getMonth()])} ${draft.getFullYear()}`
      : `${t(WEEKDAY_LONG_KEYS[draft.getDay()])}, ${t(MONTH_KEYS[draft.getMonth()])} ${draft.getDate()}`)
    : selectLabel

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear() + 1
    const years = []
    for (let year = current; year >= current - 70; year -= 1) years.push(year)
    return years
  }, [])

  const days = useMemo(() => (isMonthOnly ? [] : buildCalendarDays(view)), [isMonthOnly, view])

  const commit = (nextDate) => {
    if (!nextDate) {
      onChange('')
      closePicker()
      return
    }
    onChange(isMonthOnly ? toMonthValue(nextDate) : toDayValue(nextDate))
    closePicker()
  }

  const panel = open && panelStyle && createPortal(
    <div
      ref={panelRef}
      className={`cv-datepicker-panel${isMonthOnly ? ' cv-datepicker-panel--month' : ''}`}
      style={panelStyle}
      role="dialog"
      aria-modal="true"
      aria-label={selectLabel}
    >
      <div className="cv-datepicker-panel-head">
        <p className="cv-datepicker-kicker">{selectLabel}</p>
        <p className="cv-datepicker-selected">{draftLabel}</p>
      </div>

      <div className="cv-datepicker-toolbar">
        <button
          type="button"
          className="cv-datepicker-month-btn"
          onClick={() => setMode((prev) => (prev === 'year' ? (isMonthOnly ? 'months' : 'calendar') : 'year'))}
        >
          <span>
            {isMonthOnly
              ? view.getFullYear()
              : `${t(MONTH_KEYS[view.getMonth()])} ${view.getFullYear()}`}
          </span>
          <span className="cv-datepicker-caret" aria-hidden="true">▾</span>
        </button>
        <div className="cv-datepicker-nav">
          <button
            type="button"
            className="cv-datepicker-nav-btn"
            aria-label={t(isMonthOnly ? 'createCv.datePicker.prevYear' : 'createCv.datePicker.prevMonth')}
            onClick={() => setView((prev) => (isMonthOnly ? addYears(prev, -1) : addMonths(prev, -1)))}
          >
            ‹
          </button>
          <button
            type="button"
            className="cv-datepicker-nav-btn"
            aria-label={t(isMonthOnly ? 'createCv.datePicker.nextYear' : 'createCv.datePicker.nextMonth')}
            onClick={() => setView((prev) => (isMonthOnly ? addYears(prev, 1) : addMonths(prev, 1)))}
          >
            ›
          </button>
        </div>
      </div>

      {mode === 'year' ? (
        <div className="cv-datepicker-years">
          {yearOptions.map((year) => (
            <button
              key={year}
              type="button"
              className={`cv-datepicker-year${view.getFullYear() === year ? ' cv-datepicker-year--active' : ''}`}
              onClick={() => {
                const next = new Date(year, view.getMonth(), 1)
                setView(next)
                if (isMonthOnly && draft) {
                  setDraft(new Date(year, draft.getMonth(), 1))
                }
                setMode(isMonthOnly ? 'months' : 'calendar')
              }}
            >
              {year}
            </button>
          ))}
        </div>
      ) : isMonthOnly ? (
        <div className="cv-datepicker-months">
          {MONTH_KEYS.map((key, monthIndex) => {
            const monthDate = new Date(view.getFullYear(), monthIndex, 1)
            const selected = sameMonth(monthDate, draft)
            const isCurrent = sameMonth(monthDate, new Date())
            return (
              <button
                key={key}
                type="button"
                className={[
                  'cv-datepicker-month-cell',
                  selected ? 'cv-datepicker-month-cell--selected' : '',
                  isCurrent ? 'cv-datepicker-month-cell--today' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => setDraft(monthDate)}
              >
                {t(key)}
              </button>
            )
          })}
        </div>
      ) : (
        <>
          <div className="cv-datepicker-weekdays">
            {WEEKDAY_KEYS.map((key) => (
              <span key={key}>{t(key)}</span>
            ))}
          </div>
          <div className="cv-datepicker-grid">
            {days.map((day, index) => {
              if (!day) {
                return <span key={`empty-${index}`} className="cv-datepicker-day cv-datepicker-day--empty" />
              }
              const selected = sameDay(day, draft)
              const isToday = sameDay(day, new Date())
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  className={[
                    'cv-datepicker-day',
                    selected ? 'cv-datepicker-day--selected' : '',
                    isToday ? 'cv-datepicker-day--today' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => setDraft(day)}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>
        </>
      )}

      <div className="cv-datepicker-actions">
        <button type="button" className="cv-datepicker-action" onClick={closePicker}>
          {t('createCv.datePicker.cancel')}
        </button>
        <button
          type="button"
          className="cv-datepicker-action cv-datepicker-action--primary"
          onClick={() => commit(draft)}
          disabled={!draft}
        >
          {t('createCv.datePicker.ok')}
        </button>
      </div>
    </div>,
    document.body,
  )

  return (
    <div
      ref={rootRef}
      className={`cv-datepicker${disabled ? ' cv-datepicker--disabled' : ''}${open ? ' cv-datepicker--open' : ''}`}
    >
      <button
        type="button"
        id={fieldId}
        className="cv-datepicker-trigger form-input"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (open) closePicker()
          else openPicker()
        }}
      >
        <span className={`cv-datepicker-value${display ? '' : ' cv-datepicker-value--placeholder'}`}>
          {display
            || placeholder
            || t(isMonthOnly ? 'createCv.datePicker.placeholderMonth' : 'createCv.datePicker.placeholder')}
        </span>
        <span className="cv-datepicker-icon">
          <CalendarIcon />
        </span>
      </button>
      <input
        type="text"
        className="cv-datepicker-hidden"
        value={value || ''}
        required={required}
        tabIndex={-1}
        readOnly
        aria-hidden="true"
        onChange={() => {}}
      />
      {panel}
    </div>
  )
}
