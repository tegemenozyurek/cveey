import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '../../../context/LanguageContext'
import {
  COUNTRIES,
  findCountryByCode,
  formatPhoneValue,
  getCountryName,
  getFlagUrl,
  parsePhoneValue,
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

function getMenuStyle(anchorEl, menuHeight = 280) {
  if (!anchorEl) return null
  const rect = anchorEl.getBoundingClientRect()
  const gutter = 12
  const width = Math.min(320, Math.max(rect.width, 220))
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

export default function PhoneInput({
  id,
  value,
  onChange,
  required = false,
  placeholder,
  disabled = false,
}) {
  const { lang, t } = useLanguage()
  const reactId = useId()
  const listId = `${reactId}-dial-list`
  const rootRef = useRef(null)
  const menuRef = useRef(null)
  const searchRef = useRef(null)

  const parsed = parsePhoneValue(value)
  const [countryCode, setCountryCode] = useState(parsed.countryCode || 'TR')
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [menuStyle, setMenuStyle] = useState(null)

  const selected = findCountryByCode(countryCode) || findCountryByCode('TR')
  const dial = selected?.dial || parsed.dial
  const national = parsed.national

  useEffect(() => {
    const next = parsePhoneValue(value)
    if (next.countryCode) setCountryCode(next.countryCode)
  }, [value])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return COUNTRIES
    return COUNTRIES.filter((country) => {
      const name = getCountryName(country, lang).toLowerCase()
      return (
        name.includes(needle)
        || country.code.toLowerCase().includes(needle)
        || country.dial.includes(needle)
        || country.dial.replace('+', '').includes(needle)
      )
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

  const setCountry = (country) => {
    setCountryCode(country.code)
    onChange(formatPhoneValue(country.dial, national))
    closeMenu()
  }

  const setNational = (nextNational) => {
    onChange(formatPhoneValue(dial, nextNational))
  }

  const menu = open && menuStyle && createPortal(
    <div
      ref={menuRef}
      id={listId}
      className="create-cv-phone-menu"
      style={menuStyle}
      role="listbox"
      aria-label={t('createCv.phoneCountryCode')}
    >
      <div className="create-cv-phone-menu-search">
        <input
          ref={searchRef}
          className="form-input create-cv-phone-menu-search-input"
          type="search"
          value={query}
          placeholder={t('createCv.phoneSearchCountry')}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={t('createCv.phoneSearchCountry')}
        />
      </div>
      <div className="create-cv-phone-menu-list">
        {filtered.map((country) => {
          const active = country.code === selected?.code
          return (
            <button
              key={`${country.code}-${country.dial}`}
              type="button"
              role="option"
              aria-selected={active}
              className={`create-cv-phone-option${active ? ' create-cv-phone-option--active' : ''}`}
              onClick={() => setCountry(country)}
            >
              <FlagImg code={country.code} className="create-cv-phone-flag" />
              <span className="create-cv-phone-option-dial">{country.dial}</span>
              <span className="create-cv-phone-option-name">{getCountryName(country, lang)}</span>
            </button>
          )
        })}
        {filtered.length === 0 ? (
          <p className="create-cv-phone-menu-empty">{t('createCv.phoneNoCountry')}</p>
        ) : null}
      </div>
    </div>,
    document.body,
  )

  return (
    <div className={`create-cv-phone${disabled ? ' create-cv-phone--disabled' : ''}`}>
      <div ref={rootRef} className={`create-cv-phone-dial-wrap${open ? ' create-cv-phone-dial-wrap--open' : ''}`}>
        <button
          type="button"
          className="form-input create-cv-phone-dial"
          disabled={disabled}
          aria-label={t('createCv.phoneCountryCode')}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          onClick={() => {
            if (open) closeMenu()
            else openMenu()
          }}
        >
          <FlagImg code={selected?.code} className="create-cv-phone-flag" />
          <span className="create-cv-phone-dial-code">{dial}</span>
          <span className="create-cv-phone-dial-caret" aria-hidden="true">▾</span>
        </button>
        {menu}
      </div>
      <input
        id={id}
        className="form-input create-cv-phone-number"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={national}
        disabled={disabled}
        required={required}
        placeholder={placeholder || t('createCv.phoneNationalPlaceholder')}
        onChange={(e) => setNational(e.target.value)}
      />
    </div>
  )
}
