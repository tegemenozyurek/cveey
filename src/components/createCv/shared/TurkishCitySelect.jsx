import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { TURKISH_CITIES } from '../../../data/turkishCities'

function getMenuStyle(anchorEl, menuHeight = 320) {
  if (!anchorEl) return null
  const rect = anchorEl.getBoundingClientRect()
  const gutter = 12
  const width = Math.min(360, Math.max(rect.width, 240))
  const left = Math.min(
    Math.max(gutter, rect.left),
    window.innerWidth - width - gutter,
  )
  const spaceBelow = window.innerHeight - rect.bottom
  const openUp = spaceBelow < menuHeight && rect.top > spaceBelow

  return {
    position: 'fixed',
    left,
    width,
    maxWidth: `calc(100vw - ${gutter * 2}px)`,
    top: openUp ? undefined : rect.bottom + 4,
    bottom: openUp ? window.innerHeight - rect.top + 4 : undefined,
    zIndex: 1400,
    boxSizing: 'border-box',
  }
}

export default function TurkishCitySelect({
  id,
  value,
  onChange,
  required = false,
  placeholder,
  t,
}) {
  const reactId = useId()
  const listId = `${reactId}-city-list`
  const rootRef = useRef(null)
  const menuRef = useRef(null)
  const searchRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [menuStyle, setMenuStyle] = useState(null)

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('tr-TR')
    if (!needle) return TURKISH_CITIES
    return TURKISH_CITIES.filter((city) => (
      city.toLocaleLowerCase('tr-TR').includes(needle)
    ))
  }, [query])

  const closeMenu = () => {
    setOpen(false)
    setMenuStyle(null)
    setQuery('')
  }

  const openMenu = () => {
    setQuery('')
    rootRef.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
    setOpen(true)
  }

  useLayoutEffect(() => {
    if (!open) return undefined
    const update = () => {
      const next = getMenuStyle(rootRef.current)
      if (next) setMenuStyle(next)
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    const frame = requestAnimationFrame(() => searchRef.current?.focus())
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      if (rootRef.current?.contains(event.target)) return
      if (menuRef.current?.contains(event.target)) return
      closeMenu()
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const menu = open && menuStyle && createPortal(
    <div
      ref={menuRef}
      id={listId}
      className="create-cv-picker-menu"
      style={menuStyle}
      role="listbox"
      aria-label={t('createCv.city')}
    >
      <div className="create-cv-picker-menu-search">
        <input
          ref={searchRef}
          className="form-input create-cv-picker-menu-search-input"
          type="search"
          value={query}
          placeholder={t('locationSetup.searchPlaceholder')}
          aria-label={t('locationSetup.searchPlaceholder')}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="create-cv-picker-menu-list">
        {filtered.map((city) => (
          <button
            key={city}
            type="button"
            role="option"
            aria-selected={city === value}
            className={`create-cv-picker-option${city === value ? ' create-cv-picker-option--active' : ''}`}
            onClick={() => {
              onChange(city)
              closeMenu()
            }}
          >
            <span className="create-cv-picker-option-name">{city}</span>
          </button>
        ))}
        {filtered.length === 0 ? (
          <p className="create-cv-picker-menu-empty">
            {t('locationSetup.noResults')}
          </p>
        ) : null}
      </div>
    </div>,
    document.body,
  )

  return (
    <div
      ref={rootRef}
      className={`create-cv-country-select${open ? ' create-cv-country-select--open' : ''}`}
    >
      <button
        type="button"
        id={id}
        className="form-input create-cv-country-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => {
          if (open) closeMenu()
          else openMenu()
        }}
      >
        <span className={`create-cv-country-select-value${value ? '' : ' create-cv-country-select-value--placeholder'}`}>
          {value || placeholder}
        </span>
        <span className="create-cv-phone-dial-caret" aria-hidden="true">▾</span>
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
      {menu}
    </div>
  )
}
