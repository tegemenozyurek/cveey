import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../firebase'
import LoginModal from '../LoginModal'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import ConfirmLogoutModal from '../components/ConfirmLogoutModal'
import EmailVerificationModal from '../components/EmailVerificationModal'
import LocationSetupModal from '../components/LocationSetupModal'
import { requiresEmailVerification } from '../authUtils'
import { deleteUserAccount, needsLocationSetup, syncUserToFirestore } from '../userService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [verificationDismissed, setVerificationDismissed] = useState(false)
  const [locationSetupPending, setLocationSetupPending] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [userSyncReady, setUserSyncReady] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setVerificationDismissed(false)
      setLocationSetupPending(false)
      setUserSyncReady(false)
      setAuthLoading(false)

      if (nextUser) {
        void syncUserToFirestore(nextUser)
          .catch((err) => {
            console.error('User sync failed:', err)
          })
          .then(async () => {
            try {
              const needed = await needsLocationSetup(nextUser.uid)
              setLocationSetupPending(needed)
            } catch (err) {
              console.error('Location setup check failed:', err)
              setLocationSetupPending(true)
            } finally {
              setUserSyncReady(true)
            }
          })
      } else {
        setUserSyncReady(false)
      }
    })
  }, [])

  useEffect(() => {
    if (!user) {
      setProfileLoading(false)
      return undefined
    }

    setProfileLoading(!userSyncReady)

    return undefined
  }, [user, userSyncReady])

  const openLogin = () => setShowLogin(true)
  const closeLogin = () => setShowLogin(false)

  const handleDeleteAccount = async () => {
    if (!user) return
    setDeleting(true)
    try {
      await deleteUserAccount(user)
      setShowDeleteConfirm(false)
    } catch (err) {
      console.error('Account delete failed:', err)
      throw err
    } finally {
      setDeleting(false)
    }
  }

  const handleLogout = () => {
    setShowLogoutConfirm(false)
    signOut(auth)
  }

  const showEmailVerification = Boolean(
    user && requiresEmailVerification(user) && !verificationDismissed,
  )

  const showLocationSetup = Boolean(
    user && !showEmailVerification && locationSetupPending && !profileLoading,
  )

  const handleEmailVerified = () => {
    setVerificationDismissed(true)
    setUser(auth.currentUser)
  }

  const handleLocationSetupComplete = () => {
    setLocationSetupPending(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        openLogin,
        handleLogout,
        setShowDeleteConfirm,
        setShowLogoutConfirm,
        deleting,
      }}
    >
      {children}
      {showLogin && <LoginModal onClose={closeLogin} />}
      {showLogoutConfirm && (
        <ConfirmLogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
      {showDeleteConfirm && user && (
        <ConfirmDeleteModal
          user={user}
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteConfirm(false)}
          loading={deleting}
        />
      )}
      {showEmailVerification && (
        <EmailVerificationModal user={user} onVerified={handleEmailVerified} />
      )}
      {showLocationSetup && (
        <LocationSetupModal user={user} onComplete={handleLocationSetupComplete} />
      )}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
