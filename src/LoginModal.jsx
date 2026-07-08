import { useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { auth } from './firebase'

const AUTH_ERRORS = {
  'auth/email-already-in-use': 'This email is already registered.',
  'auth/invalid-email': 'Invalid email address.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/user-not-found': 'Invalid email or password.',
  'auth/wrong-password': 'Invalid email or password.',
  'auth/too-many-requests': 'Too many attempts. Try again later.',
}

function getAuthErrorMessage(code) {
  return AUTH_ERRORS[code] ?? 'Something went wrong. Please try again.'
}

export default function LoginModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      onClose()
    } catch (err) {
      setError(getAuthErrorMessage(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-labelledby="login-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <h2 id="login-title" className="modal-title">
          {isSignUp ? 'Create account' : 'Login'}
        </h2>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="form-field">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label className="form-field">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Please wait…' : isSignUp ? 'Sign up' : 'Sign in'}
          </button>
        </form>

        <p className="modal-switch">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setIsSignUp((v) => !v)
              setError('')
            }}
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  )
}
