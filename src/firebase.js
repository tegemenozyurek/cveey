import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDllXXMOliHnKKhycS-AezkbKCDz6UvGaU',
  authDomain: 'cveey-a7faa.firebaseapp.com',
  projectId: 'cveey-a7faa',
  storageBucket: 'cveey-a7faa.firebasestorage.app',
  messagingSenderId: '399886964668',
  appId: '1:399886964668:web:9c12481937c61c582fbdb9',
  measurementId: 'G-F2952WQFFS',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

export const analyticsPromise =
  typeof window !== 'undefined'
    ? isSupported().then((supported) => (supported ? getAnalytics(app) : null))
    : Promise.resolve(null)
