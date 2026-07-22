import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  deleteDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import { createConnectionRequestNotification } from './notificationModel'
import { getUserProfile } from './userService'

function notificationRef(toUid, fromUid) {
  return doc(db, 'users', toUid, 'notifications', fromUid)
}

export async function getOutgoingConnectionRequest(fromUid, toUid) {
  if (!fromUid || !toUid || fromUid === toUid) return null
  const snap = await getDoc(notificationRef(toUid, fromUid))
  if (!snap.exists()) return null
  const data = snap.data()
  if (data?.type && data.type !== 'connection_request') return null
  if (data?.status && data.status !== 'pending') return null
  return { id: snap.id, ...data }
}

export async function sendConnectionRequest(fromUid, toUid) {
  if (!fromUid || !toUid || fromUid === toUid) {
    throw new Error('INVALID_CONNECTION_REQUEST')
  }

  const sender = await getUserProfile(fromUid)
  const name =
    (typeof sender.username === 'string' && sender.username.trim()) ||
    'User'
  const photoURL =
    typeof sender.photoURL === 'string' && sender.photoURL.trim()
      ? sender.photoURL.trim()
      : null

  const notification = createConnectionRequestNotification({
    id: fromUid,
    name,
    fromUid,
    photoURL,
    status: 'pending',
  })

  await setDoc(notificationRef(toUid, fromUid), {
    ...notification,
    type: 'connection_request',
    createdAt: serverTimestamp(),
  })
}

export async function cancelConnectionRequest(fromUid, toUid) {
  if (!fromUid || !toUid || fromUid === toUid) {
    throw new Error('INVALID_CONNECTION_REQUEST')
  }

  await deleteDoc(notificationRef(toUid, fromUid))
}
