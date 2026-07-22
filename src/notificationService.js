import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import {
  createConnectionAcceptedNotification,
  createConnectionRequestNotification,
} from './notificationModel'
import { getUserProfile } from './userService'

function notificationsCollection(uid) {
  return collection(db, 'users', uid, 'notifications')
}

function notificationDoc(uid, notificationId) {
  return doc(db, 'users', uid, 'notifications', notificationId)
}

function networkDoc(ownerUid, friendUid) {
  return doc(db, 'users', ownerUid, 'networks', friendUid)
}

function normalizeNotification(id, data) {
  if (!data || typeof data !== 'object') return null

  const type = data.type === 'connection_accepted' ? 'connection_accepted' : 'connection_request'

  if (type === 'connection_request' && data.status && data.status !== 'pending') {
    return null
  }

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

  if (type === 'connection_accepted') {
    return createConnectionAcceptedNotification({
      id: fromUid,
      name,
      fromUid,
      photoURL,
      status: typeof data.status === 'string' ? data.status : 'unread',
    })
  }

  return createConnectionRequestNotification({
    id: fromUid,
    name,
    fromUid,
    photoURL,
    status: 'pending',
  })
}

function toNetworkMember(uid, profile) {
  const username =
    (typeof profile?.username === 'string' && profile.username.trim()) ||
    'User'
  const photoURL =
    typeof profile?.photoURL === 'string' && profile.photoURL.trim()
      ? profile.photoURL.trim()
      : null

  return {
    uid,
    username,
    photoURL,
    connectedAt: serverTimestamp(),
  }
}

/**
 * Live subscription to the signed-in user's notifications.
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

export async function acceptConnectionNotification(ownerUid, fromUid) {
  if (!ownerUid || !fromUid || ownerUid === fromUid) {
    throw new Error('INVALID_NOTIFICATION_ACTION')
  }

  const [ownerProfile, fromProfile] = await Promise.all([
    getUserProfile(ownerUid),
    getUserProfile(fromUid),
  ])

  const acceptedNotification = createConnectionAcceptedNotification({
    id: ownerUid,
    name:
      (typeof ownerProfile.username === 'string' && ownerProfile.username.trim()) ||
      'User',
    fromUid: ownerUid,
    photoURL:
      typeof ownerProfile.photoURL === 'string' && ownerProfile.photoURL.trim()
        ? ownerProfile.photoURL.trim()
        : null,
  })

  const batch = writeBatch(db)
  batch.set(networkDoc(ownerUid, fromUid), toNetworkMember(fromUid, fromProfile))
  batch.set(networkDoc(fromUid, ownerUid), toNetworkMember(ownerUid, ownerProfile))
  batch.delete(notificationDoc(ownerUid, fromUid))
  batch.set(notificationDoc(fromUid, ownerUid), {
    ...acceptedNotification,
    createdAt: serverTimestamp(),
  })
  await batch.commit()
}

export async function rejectConnectionNotification(ownerUid, fromUid) {
  if (!ownerUid || !fromUid) {
    throw new Error('INVALID_NOTIFICATION_ACTION')
  }
  await deleteDoc(notificationDoc(ownerUid, fromUid))
}

export async function dismissNotification(ownerUid, notificationId) {
  if (!ownerUid || !notificationId) {
    throw new Error('INVALID_NOTIFICATION_ACTION')
  }
  await deleteDoc(notificationDoc(ownerUid, notificationId))
}
