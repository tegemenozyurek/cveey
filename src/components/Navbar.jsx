import { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import NotificationsDropdown from './NotificationsDropdown'
import UserAvatar from './UserAvatar'

const NAV_ITEMS = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/jobs', key: 'nav.jobs' },
  { to: '/network', key: 'nav.network' },
  { to: '/my-cv', key: 'nav.myCv' },
]

const MOBILE_NAV_ITEMS = NAV_ITEMS

function BurgerIcon({ open }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      )}
    </svg>
  )
}

function InboxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22 12h-6l-2 3h-4l-2-3H2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.3 21a1.94 1.94 0 003.4 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Navbar() {
  const { user, openLogin, authLoading } = useAuth()
  const { t } = useLanguage()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const desktopNotificationsRef = useRef(null)
  const mobileNotificationsRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    setMobileNavOpen(false)
    setNotificationsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileNavOpen])

  const closeMobileNav = () => setMobileNavOpen(false)
  const closeNotifications = useCallback(() => setNotificationsOpen(false), [])

  const toggleNotifications = () => {
    setNotificationsOpen((open) => !open)
  }

  const goTo = (path) => {
    closeMobileNav()
    setNotificationsOpen(false)
    navigate(path)
  }

  const navLinkClass = ({ isActive }) =>
    `nav-link${isActive ? ' nav-link--active' : ''}`

  return (
    <header className="navbar">
      <div className="navbar-glass">
        <Link to="/" className="logo" onClick={closeMobileNav}>
          cve<span>ey</span>
        </Link>

        <nav className="nav-links nav-links--desktop" aria-label={t('nav.mainNav')}>
          {NAV_ITEMS.map(({ to, key, end }) => (
            <NavLink key={to} to={to} end={end} className={navLinkClass}>
              {t(key)}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-end">
          {authLoading ? (
            <span className="navbar-auth-placeholder" aria-hidden="true" />
          ) : !user ? (
            <button
              type="button"
              className="btn-gradient-wrap header-signin--desktop"
              onClick={openLogin}
            >
              <span className="btn-gradient-inner">{t('nav.signIn')}</span>
            </button>
          ) : (
            <div className="navbar-user-actions">
              <div className="navbar-icon-group">
                <div className="notifications-menu" ref={desktopNotificationsRef}>
                  <button
                    type="button"
                    className={`navbar-icon-btn${notificationsOpen ? ' navbar-icon-btn--open' : ''}`}
                    onClick={toggleNotifications}
                    aria-label={t('nav.notifications')}
                    title={t('nav.notifications')}
                    aria-expanded={notificationsOpen}
                    aria-haspopup="dialog"
                  >
                    <BellIcon />
                  </button>
                  <NotificationsDropdown
                    open={notificationsOpen && !mobileNavOpen}
                    onClose={closeNotifications}
                    menuRef={desktopNotificationsRef}
                    placement="bottom"
                  />
                </div>
                <button
                  type="button"
                  className="navbar-icon-btn"
                  onClick={() => goTo('/messages')}
                  aria-label={t('nav.messages')}
                  title={t('nav.messages')}
                >
                  <InboxIcon />
                </button>
              </div>
              <button
                type="button"
                className="profile-trigger profile-trigger--desktop"
                onClick={() => goTo('/profile')}
                aria-label={t('nav.profile')}
                title={t('nav.profile')}
              >
                <UserAvatar user={user} />
              </button>
            </div>
          )}

          <button
            type="button"
            className={`burger-btn${mobileNavOpen ? ' burger-btn--open' : ''}`}
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-expanded={mobileNavOpen}
            aria-label={mobileNavOpen ? t('nav.closeMenu') : t('nav.openMenu')}
          >
            <BurgerIcon open={mobileNavOpen} />
          </button>
        </div>
      </div>

      {mobileNavOpen && (
        <>
          <button
            type="button"
            className="mobile-nav-backdrop"
            aria-label={t('nav.closeMenu')}
            onClick={closeMobileNav}
          />
          <div className="mobile-nav-panel">
            <nav className="mobile-nav-links" aria-label={t('nav.mainNav')}>
              {MOBILE_NAV_ITEMS.map(({ to, key, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={navLinkClass}
                  onClick={closeMobileNav}
                >
                  {t(key)}
                </NavLink>
              ))}
            </nav>

            {authLoading ? (
              <div className="mobile-nav-footer">
                <span className="navbar-auth-placeholder navbar-auth-placeholder--mobile" aria-hidden="true" />
              </div>
            ) : user ? (
              <div className="mobile-nav-footer">
                <div className="mobile-nav-footer-icons">
                  <div className="notifications-menu" ref={mobileNotificationsRef}>
                    <button
                      type="button"
                      className={`navbar-icon-btn${notificationsOpen ? ' navbar-icon-btn--open' : ''}`}
                      onClick={toggleNotifications}
                      aria-label={t('nav.notifications')}
                      title={t('nav.notifications')}
                      aria-expanded={notificationsOpen}
                      aria-haspopup="dialog"
                    >
                      <BellIcon />
                    </button>
                    <NotificationsDropdown
                      open={notificationsOpen && mobileNavOpen}
                      onClose={closeNotifications}
                      menuRef={mobileNotificationsRef}
                      placement="top"
                    />
                  </div>
                  <button
                    type="button"
                    className="navbar-icon-btn"
                    onClick={() => goTo('/messages')}
                    aria-label={t('nav.messages')}
                    title={t('nav.messages')}
                  >
                    <InboxIcon />
                  </button>
                </div>
                <button
                  type="button"
                  className="profile-trigger"
                  onClick={() => goTo('/profile')}
                  aria-label={t('nav.profile')}
                  title={t('nav.profile')}
                >
                  <UserAvatar user={user} />
                </button>
              </div>
            ) : (
              <div className="mobile-nav-footer">
                <button
                  type="button"
                  className="btn-gradient-wrap btn-gradient-wrap--block"
                  onClick={() => {
                    closeMobileNav()
                    openLogin()
                  }}
                >
                  <span className="btn-gradient-inner">{t('nav.signIn')}</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </header>
  )
}
