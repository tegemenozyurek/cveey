import { signInWithPopup } from 'firebase/auth'

const POPUP_CLOSE_GRACE_MS = 2500
const POPUP_POLL_MS = 200

function createPopupClosedError() {
  const err = new Error('Popup closed by user')
  err.code = 'auth/popup-closed-by-user'
  return err
}

export function signInWithOAuthPopup(auth, provider) {
  let oauthPopup = null
  const originalOpen = window.open

  window.open = function (...args) {
    oauthPopup = originalOpen.apply(window, args)
    return oauthPopup
  }

  return new Promise((resolve, reject) => {
    let settled = false
    let pollId = null
    let closeTimer = null
    let popupCloseDetected = false

    const cleanup = () => {
      window.open = originalOpen
      if (pollId) clearInterval(pollId)
      if (closeTimer) clearTimeout(closeTimer)
    }

    const settle = (handler) => {
      if (settled) return
      settled = true
      cleanup()
      handler()
    }

    pollId = setInterval(() => {
      if (!oauthPopup?.closed || popupCloseDetected) return

      popupCloseDetected = true
      closeTimer = setTimeout(() => {
        settle(() => reject(createPopupClosedError()))
      }, POPUP_CLOSE_GRACE_MS)
    }, POPUP_POLL_MS)

    signInWithPopup(auth, provider)
      .then((result) => {
        settle(() => resolve(result))
      })
      .catch((err) => {
        settle(() => reject(err))
      })
  })
}
