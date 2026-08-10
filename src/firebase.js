import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyDllXXMOliHnKKhycS-AezkbKCDz6UvGaU',
  // Custom Hosting domain — keeps auth helper on the same origin as the app
  authDomain: 'cveey.com',
  projectId: 'cveey-a7faa',
  storageBucket: 'cveey-a7faa.firebasestorage.app',
  messagingSenderId: '399886964668',
  appId: '1:399886964668:web:9c12481937c61c582fbdb9',
  measurementId: 'G-F2952WQFFS',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export const analyticsPromise =
  typeof window !== 'undefined'
    ? isSupported().then((supported) => (supported ? getAnalytics(app) : null))
    : Promise.resolve(null)
