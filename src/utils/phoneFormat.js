import {
  AsYouType,
  getExampleNumber,
  parsePhoneNumberFromString,
} from 'libphonenumber-js/min'
import examples from 'libphonenumber-js/mobile/examples'
import { findCountryByCode, findCountryByDial } from '../data/countries'

function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '')
}

function resolveCountryCode(countryCode) {
  const code = String(countryCode || '').trim().toUpperCase()
  return findCountryByCode(code)?.code || 'TR'
}

/**
 * As-you-type national formatting for the selected ISO country.
 * Input may contain spaces/punctuation; only digits drive the template.
 */
export function formatNationalAsYouType(countryCode, input) {
  const iso = resolveCountryCode(countryCode)
  const raw = String(input || '')
  // Allow the user to clear the field completely.
  if (!raw.trim()) return ''

  const type = new AsYouType(iso)
  // Feed digits only so country templates stay stable while typing.
  const formatted = type.input(digitsOnly(raw))
  return formatted || digitsOnly(raw)
}

/**
 * Build the stored phone string in international display form
 * (e.g. "+90 552 054 40 86"). Empty national → "".
 */
export function buildInternationalPhone(countryCode, nationalInput) {
  const iso = resolveCountryCode(countryCode)
  const digits = digitsOnly(nationalInput)
  if (!digits) return ''

  const parsed = parsePhoneNumberFromString(digits, iso)
  if (parsed) {
    return parsed.formatInternational()
  }

  // Incomplete numbers: keep dial + as-you-type national grouping.
  const country = findCountryByCode(iso)
  const dial = country?.dial || '+90'
  const national = formatNationalAsYouType(iso, digits)
  return `${dial} ${national}`.trim()
}

/**
 * Reformat an existing phone when the dial-country changes.
 * Keeps national digits, applies the new country's template.
 */
export function reformatPhoneForCountry(phone, nextCountryCode) {
  const iso = resolveCountryCode(nextCountryCode)
  const digits = extractNationalDigits(phone, iso)
  return buildInternationalPhone(iso, digits)
}

/**
 * Extract national significant digits from a stored / pasted value.
 */
export function extractNationalDigits(phone, countryCodeHint) {
  const raw = String(phone || '').trim()
  if (!raw) return ''

  const hint = resolveCountryCode(countryCodeHint)
  const parsed = parsePhoneNumberFromString(raw, hint)
  if (parsed) return parsed.nationalNumber

  // Strip known dial if present, else take all digits.
  const withPlus = raw.startsWith('+') ? raw : `+${raw}`
  const byDial = findCountryByDial(withPlus)
  if (byDial && withPlus.startsWith(byDial.dial)) {
    return digitsOnly(withPlus.slice(byDial.dial.length))
  }
  return digitsOnly(raw)
}

/**
 * Split a stored phone for the PhoneInput UI.
 */
export function parsePhoneForInput(phone, preferredCountryCode) {
  const preferred = resolveCountryCode(preferredCountryCode || 'TR')
  const raw = String(phone || '').trim()
  if (!raw) {
    const country = findCountryByCode(preferred)
    return {
      dial: country?.dial || '+90',
      countryCode: preferred,
      national: '',
    }
  }

  const parsed = parsePhoneNumberFromString(raw, preferred)
  if (parsed) {
    const iso = parsed.country || findCountryByDial(`+${parsed.countryCallingCode}`)?.code || preferred
    const country = findCountryByCode(iso) || findCountryByDial(`+${parsed.countryCallingCode}`)
    return {
      dial: country?.dial || `+${parsed.countryCallingCode}`,
      countryCode: country?.code || iso,
      national: new AsYouType(iso).input(parsed.nationalNumber),
    }
  }

  const withPlus = raw.startsWith('+') ? raw : null
  if (withPlus) {
    const byDial = findCountryByDial(withPlus)
    if (byDial) {
      const nationalDigits = digitsOnly(withPlus.slice(byDial.dial.length))
      return {
        dial: byDial.dial,
        countryCode: byDial.code,
        national: formatNationalAsYouType(byDial.code, nationalDigits),
      }
    }
  }

  const country = findCountryByCode(preferred)
  const nationalDigits = digitsOnly(raw)
  return {
    dial: country?.dial || '+90',
    countryCode: preferred,
    national: formatNationalAsYouType(preferred, nationalDigits),
  }
}

/**
 * International display for preview / PDF. Safe for incomplete drafts.
 */
export function formatPhoneForDisplay(phone, countryCodeHint) {
  const raw = String(phone || '').trim()
  if (!raw) return ''

  const hint = countryCodeHint ? resolveCountryCode(countryCodeHint) : undefined
  const parsed = parsePhoneNumberFromString(raw, hint)
  if (parsed) return parsed.formatInternational()

  // Already looks international — keep as-is after light cleanup.
  if (raw.startsWith('+')) {
    const byDial = findCountryByDial(raw)
    if (byDial) {
      const nationalDigits = digitsOnly(raw.slice(byDial.dial.length))
      if (!nationalDigits) return ''
      return buildInternationalPhone(byDial.code, nationalDigits) || raw
    }
    return raw
  }

  if (hint) return buildInternationalPhone(hint, raw) || raw
  return raw
}

/** Country-aware placeholder from libphonenumber example numbers. */
export function getPhoneNationalPlaceholder(countryCode) {
  const iso = resolveCountryCode(countryCode)
  try {
    const example = getExampleNumber(iso, examples)
    if (example) return example.formatNational()
  } catch {
    // ignore — fall through
  }
  return formatNationalAsYouType(iso, '5555555555') || '555 555 5555'
}
