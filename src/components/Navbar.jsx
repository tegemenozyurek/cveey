import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/jobs', label: 'Jobs' },
  { to: '/create-cv', label: 'Create CV' },
  { to: '/my-cv', label: 'My CV' },
]

export default function Navbar() {
  const { user, openLogin, handleLogout, setShowDeleteConfirm, deleting } = useAuth()
  const avatarLetter = user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo">
          cve<span>ey</span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <div className="user-chip">
                <div className="user-avatar">{avatarLetter}</div>
                <span className="user-email">{user.email}</span>
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleLogout}
                disabled={deleting}
              >
                Sign out
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleting}
              >
                Delete account
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-primary" onClick={openLogin}>
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
