import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from './firebase'

function requestRef(toUid, fromUid) {
  return doc(db, 'users', toUid, 'connectionRequests', fromUid)
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

  await setDoc(requestRef(toUid, fromUid), {
    fromUid,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
}

export async function cancelConnectionRequest(fromUid, toUid) {
  if (!fromUid || !toUid || fromUid === toUid) {
    throw new Error('INVALID_CONNECTION_REQUEST')
  }

  await deleteDoc(requestRef(toUid, fromUid))
}
