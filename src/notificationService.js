import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import { createConnectionRequestNotification } from './notificationModel'

function notificationsCollection(uid) {
  return collection(db, 'users', uid, 'notifications')
}

function notificationDoc(uid, notificationId) {
  return doc(db, 'users', uid, 'notifications', notificationId)
}

function normalizeNotification(id, data) {
  if (!data || typeof data !== 'object') return null
  if (data.type && data.type !== 'connection_request') return null
  if (data.status && data.status !== 'pending') return null

  const fromUid =
    (typeof data.fromUid === 'string' && data.fromUid) ||
    (typeof data.id === 'string' && data.id) ||
    id
  const name =
    (typeof data.name === 'string' && data.name.trim()) ||
    'User'
  const photoURL =
    typeof data.photoURL === 'string' && data.photoURL.trim()
      ? data.photoURL.trim()
      : null

  return createConnectionRequestNotification({
    id: fromUid,
    name,
    fromUid,
    photoURL,
    status: 'pending',
  })
}

/**
 * Live subscription to the signed-in user's connection-request notifications.
 * @returns {() => void} unsubscribe
 */
export function subscribeToConnectionNotifications(uid, onChange, onError) {
  if (!uid) {
    onChange([])
    return () => {}
  }

  const q = query(notificationsCollection(uid), orderBy('createdAt', 'desc'))

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs
        .map((docSnap) => normalizeNotification(docSnap.id, docSnap.data()))
        .filter(Boolean)
      onChange(items)
    },
    (err) => {
      console.error('Notifications subscription failed:', err)
      onError?.(err)
      onChange([])
    },
  )
}

async function removeConnectionNotification(ownerUid, fromUid) {
  if (!ownerUid || !fromUid) {
    throw new Error('INVALID_NOTIFICATION_ACTION')
  }
  await deleteDoc(notificationDoc(ownerUid, fromUid))
}

export async function acceptConnectionNotification(ownerUid, fromUid) {
  await removeConnectionNotification(ownerUid, fromUid)
}

export async function rejectConnectionNotification(ownerUid, fromUid) {
  await removeConnectionNotification(ownerUid, fromUid)
}
