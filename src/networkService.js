import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'

const BATCH_LIMIT = 400

function networksCollection(uid) {
  return collection(db, 'users', uid, 'networks')
}

function networkDoc(ownerUid, friendUid) {
  return doc(db, 'users', ownerUid, 'networks', friendUid)
}

function normalizeNetworkMember(id, data) {
  if (!data || typeof data !== 'object') return null

  const uid =
    (typeof data.uid === 'string' && data.uid.trim()) ||
    id
  if (!uid) return null

  const username =
    (typeof data.username === 'string' && data.username.trim()) ||
    'User'
  const photoURL =
    typeof data.photoURL === 'string' && data.photoURL.trim()
      ? data.photoURL.trim()
      : null

  return {
    id: uid,
    uid,
    username,
    displayName: username,
    photoURL,
    homeCity: '',
    location: '',
  }
}

export async function areUsersConnected(uidA, uidB) {
  if (!uidA || !uidB || uidA === uidB) return false
  const snap = await getDoc(networkDoc(uidA, uidB))
  return snap.exists()
}

/** Remove friendship from both users' networks collections. */
export async function removeNetworkConnection(uidA, uidB) {
  if (!uidA || !uidB || uidA === uidB) {
    throw new Error('INVALID_NETWORK_REMOVE')
  }

  const batch = writeBatch(db)
  batch.delete(networkDoc(uidA, uidB))
  batch.delete(networkDoc(uidB, uidA))
  await batch.commit()
}

/**
 * When a user deletes their account: remove them from every friend's
 * networks list and clear their own networks collection.
 */
export async function purgeUserFromAllNetworks(uid) {
  if (!uid) return

  const snap = await getDocs(networksCollection(uid))
  if (snap.empty) return

  let batch = writeBatch(db)
  let ops = 0

  const commitBatch = async () => {
    if (ops === 0) return
    await batch.commit()
    batch = writeBatch(db)
    ops = 0
  }

  for (const friendSnap of snap.docs) {
    const friendUid = friendSnap.id
    batch.delete(networkDoc(friendUid, uid))
    batch.delete(networkDoc(uid, friendUid))
    ops += 2

    if (ops >= BATCH_LIMIT) {
      await commitBatch()
    }
  }

  await commitBatch()
}

/**
 * Remove pending connection notifications this user sent to others.
 */
export async function purgeOutgoingConnectionNotifications(fromUid) {
  if (!fromUid) return

  const snap = await getDocs(
    query(collectionGroup(db, 'notifications'), where('fromUid', '==', fromUid)),
  )
  if (snap.empty) return

  let batch = writeBatch(db)
  let ops = 0

  for (const docSnap of snap.docs) {
    batch.delete(docSnap.ref)
    ops += 1
    if (ops >= BATCH_LIMIT) {
      await batch.commit()
      batch = writeBatch(db)
      ops = 0
    }
  }

  if (ops > 0) await batch.commit()
}

/**
 * Clear the deleting user's own notifications inbox.
 */
export async function purgeOwnNotifications(uid) {
  if (!uid) return

  const snap = await getDocs(collection(db, 'users', uid, 'notifications'))
  if (snap.empty) return

  let batch = writeBatch(db)
  let ops = 0

  for (const docSnap of snap.docs) {
    batch.delete(docSnap.ref)
    ops += 1
    if (ops >= BATCH_LIMIT) {
      await batch.commit()
      batch = writeBatch(db)
      ops = 0
    }
  }

  if (ops > 0) await batch.commit()
}

/**
 * Live subscription to a user's networks collection.
 * @returns {() => void} unsubscribe
 */
export function subscribeToUserNetworks(uid, onChange, onError) {
  if (!uid) {
    onChange([])
    return () => {}
  }

  const q = query(networksCollection(uid), orderBy('connectedAt', 'desc'))

  return onSnapshot(
    q,
    (snapshot) => {
      const people = snapshot.docs
        .map((docSnap) => normalizeNetworkMember(docSnap.id, docSnap.data()))
        .filter(Boolean)
      onChange(people)
    },
    (err) => {
      console.error('Networks subscription failed:', err)
      onError?.(err)
      onChange([])
    },
  )
}
