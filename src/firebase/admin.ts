import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

// Initialize Firebase Admin
const apps = getApps()

if (!apps.length) {
  initializeApp({
    credential: cert({
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      clientEmail: import.meta.env.VITE_FIREBASE_CLIENT_EMAIL,
      privateKey: import.meta.env.VITE_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    }),
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
  })
}

export const adminAuth = getAuth()

// Function to set admin custom claim
export const setAdminClaim = async (uid: string) => {
  try {
    await adminAuth.setCustomUserClaims(uid, { admin: true })
    return true
  } catch (error) {
    console.error('Error setting admin claim:', error)
    return false
  }
}

// Function to check if user is admin
export const isAdmin = async (uid: string) => {
  try {
    const user = await adminAuth.getUser(uid)
    return user.customClaims?.admin === true
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
} 