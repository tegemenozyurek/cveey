import { useState } from 'react'

export default function ProfileHeroEmail({ email, copyLabel, copiedLabel }) {
  const [copied, setCopied] = useState(false)

  if (!email) return null

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard may be blocked; keep email selectable as fallback.
    }
  }

  return (
    <button
      type="button"
      className="profile-hero-email"
      onClick={handleCopy}
      title={copied ? copiedLabel : copyLabel}
      aria-label={copied ? copiedLabel : copyLabel}
    >
      {email}
    </button>
  )
}
