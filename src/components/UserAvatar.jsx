import { useEffect, useState } from 'react'

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 21a8 8 0 10-16 0M12 11a4 4 0 100-8 4 4 0 000 8z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function UserAvatar({ user, className = 'profile-avatar' }) {
  const [imgError, setImgError] = useState(false)
  const photoURL = user?.photoURL
  const showPhoto = Boolean(photoURL && !imgError)

  useEffect(() => {
    setImgError(false)
  }, [photoURL])

  if (showPhoto) {
    return (
      <img
        src={photoURL}
        alt=""
        className={`${className} ${className}--photo`}
        onError={() => setImgError(true)}
        referrerPolicy="no-referrer"
      />
    )
  }

  return (
    <span className={`${className} ${className}--fallback`} aria-hidden="true">
      <UserIcon />
    </span>
  )
}
