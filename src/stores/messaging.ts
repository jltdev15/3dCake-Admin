import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth, database } from '../firebase/config'
import { onValue, ref as dbRef, get } from 'firebase/database'

export const useMessagingStore = defineStore('messaging', () => {
  const totalUnreadCount = ref(0)
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const unreadMessages = ref<{[key: string]: number}>({})

  // Computed property to check if there are unread messages
  const hasUnreadMessages = computed(() => totalUnreadCount.value > 0)

  // Initialize message listener
  const initMessageListener = () => {
    isLoading.value = true
    error.value = null

    // Function to update unread count
    const updateUnreadCount = () => {
      try {
        const currentUser = auth.currentUser
        if (!currentUser) {
          console.log('[MessagingStore] No user is authenticated, cannot check messages')
          totalUnreadCount.value = 0
          isLoading.value = false
          return
        }

        // Reference to the current user's data
        const userRef = dbRef(database, `users/${currentUser.uid}`)
        
        // Get the data once first to check initial state
        get(userRef).then(snapshot => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            console.log('[MessagingStore] Initial user data:', userData);
            
            if (userData.messages) {
              console.log('[MessagingStore] Initial messages data:', userData.messages);
            }
          }
        });
        
        // Listen for changes to the user's messages
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val()
          let count = 0
          const unreadCounts: {[key: string]: number} = {}
          
          // If user has messages, count unread messages
          if (userData && userData.messages) {
            console.log('[MessagingStore] User messages data updated:', userData.messages)
            
            // Loop through all conversation messages for this user
            Object.entries(userData.messages).forEach(([conversationId, conversation]: [string, any]) => {
              if (conversation.unreadCount) {
                const unreadCount = parseInt(conversation.unreadCount || '0')
                count += unreadCount
                
                // Extract the other user's ID from the conversation ID
                const parts = conversationId.split('_')
                const otherUserId = parts[0] === currentUser.uid ? parts[1] : parts[0]
                unreadCounts[otherUserId] = unreadCount
                
                console.log(`[MessagingStore] Conversation ${conversationId} with user ${otherUserId} has ${unreadCount} unread messages`)
              }
            })
          }
          
          console.log('[MessagingStore] Total unread messages count:', count)
          console.log('[MessagingStore] Unread counts by user:', unreadCounts)
          
          totalUnreadCount.value = count
          unreadMessages.value = unreadCounts
          isLoading.value = false
        })
      } catch (err: any) {
        console.error('[MessagingStore] Error fetching unread messages:', err)
        error.value = err.message || 'Failed to fetch unread messages'
        isLoading.value = false
      }
    }

    // Initial update and setup listener
    updateUnreadCount()
  }

  return {
    totalUnreadCount,
    unreadMessages,
    isLoading,
    error,
    hasUnreadMessages,
    initMessageListener
  }
}) 