import {
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import { createConnectionRequestNotification } from './notificationModel'
import { getUserProfile } from './userService'

function requestRef(toUid, fromUid) {
  return doc(db, 'users', toUid, 'connectionRequests', fromUid)
}

function notificationRef(toUid, notificationId) {
  return doc(db, 'users', toUid, 'notifications', notificationId)
}

export async function getOutgoingConnectionRequest(fromUid, toUid) {
  if (!fromUid || !toUid || fromUid === toUid) return null
  const snap = await getDoc(requestRef(toUid, fromUid))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
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

  const batch = writeBatch(db)
  batch.set(requestRef(toUid, fromUid), {
    fromUid,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
  batch.set(notificationRef(toUid, fromUid), {
    ...notification,
    type: 'connection_request',
    createdAt: serverTimestamp(),
  })
  await batch.commit()
}

export async function cancelConnectionRequest(fromUid, toUid) {
  if (!fromUid || !toUid || fromUid === toUid) {
    throw new Error('INVALID_CONNECTION_REQUEST')
  }

  const batch = writeBatch(db)
  batch.delete(requestRef(toUid, fromUid))
  batch.delete(notificationRef(toUid, fromUid))
  await batch.commit()
}
