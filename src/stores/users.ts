import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ref as dbRef, get, update } from 'firebase/database'
import { database } from '../firebase/config'

// Types
export interface User {
  uid: string
  name: string
  email: string
  photoUrl?: string
  status: 'active' | 'blocked'
  ordernotification?: {
    [key: string]: {
      orderId: string
      status: string
      timestamp: number
      message: string
      read: boolean
    }
  }
}

export const useUserStore = defineStore('users', () => {
  // State
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  const fetchUsers = async () => {
    loading.value = true
    error.value = null
    try {
      const usersRef = dbRef(database, 'users')
      const snapshot = await get(usersRef)
      
      if (snapshot.exists()) {
        const usersData = snapshot.val()
        const usersArray: User[] = []
        
        // Convert the object to an array
        Object.keys(usersData).forEach(uid => {
          usersArray.push({
            uid,
            ...usersData[uid]
          })
        })
        
        users.value = usersArray
      } else {
        users.value = []
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch users'
      console.error('Error fetching users:', e)
    } finally {
      loading.value = false
    }
  }

  const updateUserStatus = async (uid: string, status: 'active' | 'blocked') => {
    loading.value = true
    error.value = null
    try {
      const userRef = dbRef(database, `users/${uid}`)
      await update(userRef, { status })
      
      // Update local state
      const index = users.value.findIndex(user => user.uid === uid)
      if (index !== -1) {
        users.value[index].status = status
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update user status'
      console.error('Error updating user status:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    users,
    loading,
    error,
    // Actions
    fetchUsers,
    updateUserStatus
  }
}) 