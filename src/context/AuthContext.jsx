import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../firebase'
import LoginModal from '../LoginModal'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import { deleteUserAccount } from '../userService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setAuthLoading(false)
    })
  }, [])

  const openLogin = () => setShowLogin(true)
  const closeLogin = () => setShowLogin(false)

  const handleLogout = () => signOut(auth)

  const handleDeleteAccount = async () => {
    if (!user) return
    setDeleting(true)
    try {
      await deleteUserAccount(user)
      setShowDeleteConfirm(false)
    } catch (err) {
      setShowDeleteConfirm(false)
      if (err.code === 'auth/requires-recent-login') {
        window.alert('For security, please sign out, sign in again, then delete your account.')
      } else {
        window.alert('Could not delete account. Please try again.')
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        openLogin,
        handleLogout,
        setShowDeleteConfirm,
        deleting,
      }}
    >
      {children}
      {showLogin && <LoginModal onClose={closeLogin} />}
      {showDeleteConfirm && (
        <ConfirmDeleteModal
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteConfirm(false)}
          loading={deleting}
        />
      )}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
