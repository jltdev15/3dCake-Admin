import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  type User
} from 'firebase/auth'
import { auth } from '../firebase/config'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const initialLoading = ref(true) // New state for initial auth check

  // Computed property to check if user is authenticated
  const isAuthenticated = computed(() => !!user.value)

  // Initialize auth state listener
  const initAuth = async () => {
    try {
      // Set persistence to LOCAL (persists even after browser restart)
      await setPersistence(auth, browserLocalPersistence)
      
      // Listen for auth state changes
      onAuthStateChanged(auth, (newUser) => {
        console.log('Auth state changed:', newUser ? 'User logged in' : 'User logged out')
        user.value = newUser
        initialLoading.value = false
      })
    } catch (err: any) {
      error.value = err.message || 'Failed to initialize auth'
      initialLoading.value = false
    }
  }

  // Login action
  const login = async (email: string, password: string) => {
    try {
      loading.value = true
      error.value = null
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      return userCredential.user
    } catch (err: any) {
      error.value = err.message || 'Failed to login'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Logout action
  const logout = async () => {
    try {
      console.log('Starting logout process...')
      loading.value = true
      error.value = null
      
      // Check if user is logged in before attempting logout
      if (!auth.currentUser) {
        console.log('No user is currently logged in')
        user.value = null
        return
      }

      console.log('Attempting to sign out user:', auth.currentUser.email)
      await signOut(auth)
      console.log('Sign out successful')
      user.value = null
    } catch (err: any) {
      console.error('Logout error:', err)
      error.value = err.message || 'Failed to logout'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    initialLoading,
    isAuthenticated,
    initAuth,
    login,
    logout
  }
}) 