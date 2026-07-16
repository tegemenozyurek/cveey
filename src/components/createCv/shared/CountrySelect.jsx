import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '../../../context/LanguageContext'
import {
  COUNTRIES,
  findCountryByCode,
  getCountryName,
  getFlagUrl,
} from '../../../data/countries'

function FlagImg({ code, className }) {
  if (!code) return null
  return (
    <img
      className={className}
      src={getFlagUrl(code, 40)}
      srcSet={`${getFlagUrl(code, 80)} 2x`}
      alt=""
      width={20}
      height={15}
      loading="lazy"
      decoding="async"
    />
  )
}

function getMenuStyle(anchorEl, menuHeight = 320) {
  if (!anchorEl) return null
  const rect = anchorEl.getBoundingClientRect()
  const gutter = 12
  const width = Math.min(360, Math.max(rect.width, 240))
  let left = rect.left
  left = Math.min(Math.max(gutter, left), window.innerWidth - width - gutter)
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top
  const openUp = spaceBelow < menuHeight && spaceAbove > spaceBelow
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

export default function CountrySelect({
  id,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder,
  t,
}) {
  const { lang } = useLanguage()
  const reactId = useId()
  const listId = `${reactId}-country-list`
  const rootRef = useRef(null)
  const menuRef = useRef(null)
  const searchRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [menuStyle, setMenuStyle] = useState(null)

  const selected = findCountryByCode(value)

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return COUNTRIES
    return COUNTRIES.filter((country) => {
      const name = getCountryName(country, lang).toLowerCase()
      return name.includes(needle) || country.code.toLowerCase().includes(needle)
    })
  }, [lang, query])

  const closeMenu = () => {
    setOpen(false)
    setMenuStyle(null)
    setQuery('')
  }

  const openMenu = () => {
    if (disabled) return
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

  const displayLabel = selected
    ? getCountryName(selected, lang)
    : (placeholder || t('createCv.countryPlaceholder'))

  const menu = open && menuStyle && createPortal(
    <div
      ref={menuRef}
      id={listId}
      className="create-cv-picker-menu"
      style={menuStyle}
      role="listbox"
      aria-label={t('createCv.country')}
    >
      <div className="create-cv-picker-menu-search">
        <input
          ref={searchRef}
          className="form-input create-cv-picker-menu-search-input"
          type="search"
          value={query}
          placeholder={t('createCv.phoneSearchCountry')}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={t('createCv.phoneSearchCountry')}
        />
      </div>
      <div className="create-cv-picker-menu-list">
        {filtered.map((country) => {
          const active = country.code === value
          return (
            <button
              key={country.code}
              type="button"
              role="option"
              aria-selected={active}
              className={`create-cv-picker-option${active ? ' create-cv-picker-option--active' : ''}`}
              onClick={() => {
                onChange(country.code)
                closeMenu()
              }}
            >
              <FlagImg code={country.code} className="create-cv-phone-flag" />
              <span className="create-cv-picker-option-name">{getCountryName(country, lang)}</span>
            </button>
          )
        })}
        {filtered.length === 0 ? (
          <p className="create-cv-picker-menu-empty">{t('createCv.phoneNoCountry')}</p>
        ) : null}
      </div>
    </div>,
    document.body,
  )

  return (
    <div
      ref={rootRef}
      className={`create-cv-country-select${disabled ? ' create-cv-country-select--disabled' : ''}${open ? ' create-cv-country-select--open' : ''}`}
    >
      <button
        type="button"
        id={id}
        className="form-input create-cv-country-select-trigger"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => {
          if (open) closeMenu()
          else openMenu()
        }}
      >
        {selected ? (
          <span className="create-cv-country-select-value">
            <FlagImg code={selected.code} className="create-cv-phone-flag" />
            <span>{displayLabel}</span>
          </span>
        ) : (
          <span className="create-cv-country-select-value create-cv-country-select-value--placeholder">
            {displayLabel}
          </span>
        )}
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
