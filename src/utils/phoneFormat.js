import {
  AsYouType,
  formatIncompletePhoneNumber,
  getExampleNumber,
  parsePhoneNumberFromString,
} from 'libphonenumber-js/max'
import examples from 'libphonenumber-js/mobile/examples'
import metadata from 'libphonenumber-js/max/metadata'
import { Metadata } from 'libphonenumber-js/core'
import { findCountryByCode, findCountryByDial } from '../data/countries'

function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '')
}

function resolveCountryCode(countryCode) {
  const code = String(countryCode || '').trim().toUpperCase()
  return findCountryByCode(code)?.code || 'TR'
}

function getDial(iso) {
  return findCountryByCode(iso)?.dial || ''
}

/**
 * Max digits for the national phone field.
 * Uses each country's MOBILE possible-length metadata (the longest valid mobile).
 * This is correct globally: it caps TR at 10 while still allowing variable-length
 * countries such as DE (11), AT (13), NL (11) or ID (12) to enter valid numbers.
 * Falls back to the general possible-length max, then the mobile example length.
 */
export function getMaxNationalDigits(countryCode) {
  const iso = resolveCountryCode(countryCode)
  try {
    const meta = new Metadata(metadata)
    meta.selectNumberingPlan(iso)

    let mobileLengths
    try {
      mobileLengths = meta.numberingPlan?.type?.('MOBILE')?.possibleLengths?.()
    } catch {
      mobileLengths = undefined
    }
    if (mobileLengths && mobileLengths.length) return Math.max(...mobileLengths)

    const generalLengths = meta.numberingPlan?.possibleLengths?.() || []
    if (generalLengths.length) return Math.max(...generalLengths)

    const example = getExampleNumber(iso, examples)
    const exampleLen = example?.nationalNumber?.length
    if (exampleLen) return exampleLen
  } catch {
    // fall through
  }
  return 15
}

/**
 * National significant digits only (no trunk 0) — dial is chosen separately in the UI.
 */
export function normalizeNationalDigits(countryCode, input) {
  const iso = resolveCountryCode(countryCode)
  let digits = digitsOnly(input)
  // Drop trunk prefixes such as TR/DE/FR leading 0; country code is already selected.
  if (digits.startsWith('0')) digits = digits.replace(/^0+/, '')
  const max = getMaxNationalDigits(iso)
  if (max > 0 && digits.length > max) digits = digits.slice(0, max)
  return digits
}

function formatInternationalIncomplete(iso, nationalDigits) {
  const dial = getDial(iso)
  if (!dial || !nationalDigits) return ''
  // Prefer country-aware AsYouType so shared dials (+1) keep the selected ISO.
  const typed = new AsYouType(iso).input(`${dial}${nationalDigits}`)
  if (typed) return typed
  return formatIncompletePhoneNumber(`${dial}${nationalDigits}`) || `${dial}${nationalDigits}`
}

function nationalFromInternational(iso, international) {
  const dial = getDial(iso)
  if (!dial || !international) return ''
  if (international.startsWith(dial)) return international.slice(dial.length).trim()
  // Fallback: strip "+<callingCode>" with flexible spacing.
  const calling = dial.replace(/^\+/, '')
  return international.replace(new RegExp(`^\\+?${calling}\\s*`), '').trim()
}

/**
 * As-you-type national formatting using each country's libphonenumber rules.
 */
export function formatNationalAsYouType(countryCode, input) {
  const iso = resolveCountryCode(countryCode)
  const digits = normalizeNationalDigits(iso, input)
  if (!digits) return ''
  return nationalFromInternational(iso, formatInternationalIncomplete(iso, digits)) || digits
}

/**
 * Stored / preview / PDF value in international form (e.g. "+49 1512 3456789").
 */
export function buildInternationalPhone(countryCode, nationalInput) {
  const iso = resolveCountryCode(countryCode)
  const digits = normalizeNationalDigits(iso, nationalInput)
  if (!digits) return ''

  const parsed = parsePhoneNumberFromString(digits, iso)
  if (parsed) return parsed.formatInternational()

  return formatInternationalIncomplete(iso, digits)
}

export function reformatPhoneForCountry(phone, nextCountryCode) {
  const iso = resolveCountryCode(nextCountryCode)
  const digits = extractNationalDigits(phone, iso)
  return buildInternationalPhone(iso, digits)
}

export function extractNationalDigits(phone, countryCodeHint) {
  const raw = String(phone || '').trim()
  if (!raw) return ''

  const hint = resolveCountryCode(countryCodeHint)
  const parsed = parsePhoneNumberFromString(raw, hint)
  if (parsed) return normalizeNationalDigits(parsed.country || hint, parsed.nationalNumber)

  const withPlus = raw.startsWith('+') ? raw : `+${raw}`
  const byDial = findCountryByDial(withPlus)
  if (byDial && withPlus.startsWith(byDial.dial)) {
    return normalizeNationalDigits(byDial.code, withPlus.slice(byDial.dial.length))
  }
  return normalizeNationalDigits(hint, raw)
}

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
      national: formatNationalAsYouType(iso, parsed.nationalNumber),
    }
  }

  if (raw.startsWith('+')) {
    const byDial = findCountryByDial(raw)
    if (byDial) {
      return {
        dial: byDial.dial,
        countryCode: byDial.code,
        national: formatNationalAsYouType(byDial.code, raw.slice(byDial.dial.length)),
      }
    }
  }

  const country = findCountryByCode(preferred)
  return {
    dial: country?.dial || '+90',
    countryCode: preferred,
    national: formatNationalAsYouType(preferred, raw),
  }
}

export function formatPhoneForDisplay(phone, countryCodeHint) {
  const raw = String(phone || '').trim()
  if (!raw) return ''

  const hint = countryCodeHint ? resolveCountryCode(countryCodeHint) : undefined
  const parsed = parsePhoneNumberFromString(raw, hint)
  if (parsed) return parsed.formatInternational()

  if (raw.startsWith('+')) {
    const byDial = findCountryByDial(raw)
    if (byDial) {
      const nationalDigits = extractNationalDigits(raw, byDial.code)
      if (!nationalDigits) return ''
      return buildInternationalPhone(byDial.code, nationalDigits) || raw
    }
    return formatIncompletePhoneNumber(raw) || raw
  }

  if (hint) return buildInternationalPhone(hint, raw) || raw
  return raw
}

/** National placeholder without trunk 0 (dial shown separately). */
export function getPhoneNationalPlaceholder(countryCode) {
  const iso = resolveCountryCode(countryCode)
    if (iso === 'TR') return '555 444 33 22'
  try {
    const example = getExampleNumber(iso, examples)
    if (example?.nationalNumber) {
      return formatNationalAsYouType(iso, example.nationalNumber)
    }
  } catch {
    // ignore
  }
  return formatNationalAsYouType(iso, '5555555555') || '555 555 5555'
}
