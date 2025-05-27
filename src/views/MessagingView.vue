<template>
  <DashboardLayout>
    <div class="flex flex-col min-h-[400px] h-[80dvh] md:h-[80dvh]">
      <!-- Mobile Toggle Buttons -->
      <div class="md:hidden flex w-full border-b border-gray-200">
        <button 
          @click="showConversationList = true" 
          class="flex-1 py-2 text-center font-medium text-sm"
          :class="showConversationList ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' : 'text-gray-500'"
        >
          Conversations
          <span v-if="totalUnreadCount > 0" 
                class="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium rounded-full bg-red-500 text-white">
            {{ totalUnreadCount }}
          </span>
        </button>
        <button 
          @click="showConversationList = false" 
          class="flex-1 py-2 text-center font-medium text-sm"
          :class="!showConversationList ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' : 'text-gray-500'"
          :disabled="!selectedConversation"
        >
          {{ selectedConversation ? selectedConversation.name : 'Messages' }}
        </button>
      </div>

      <div class="flex-1 flex min-h-0">
        <!-- Conversations List -->
        <div 
          class="border-r border-gray-200 flex flex-col md:w-1/3 lg:w-1/4"
          :class="{'w-full': showConversationList, 'hidden md:flex': !showConversationList}"
        >
          <div class="py-3 px-4 border-b border-gray-200 flex-shrink-0 bg-gray-50">
            <h2 class="text-base font-semibold text-gray-800 mb-2">Messages</h2>
            <!-- Search Input -->
            <div class="relative">
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Search conversations..." 
                class="w-full pl-9 pr-3 py-2 bg-white rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div class="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto bg-gray-50">
            <div v-if="filteredConversations.length > 0">
              <div 
                v-for="conversation in filteredConversations" 
                :key="conversation.id" 
                @click="() => { 
                  selectConversation(conversation); 
                  showConversationList = false;
                }"
                class="py-3 px-4 hover:bg-white border-b border-gray-100 cursor-pointer transition-colors duration-150"
                :class="{ 
                  'bg-white shadow-sm': selectedConversation?.id === conversation.id,
                  'hover:bg-blue-50': conversation.unreadCount > 0 && selectedConversation?.id !== conversation.id 
                }"
              >
                <div class="flex items-start space-x-3">
                  <!-- Avatar with online indicator -->
                  <div class="relative flex-shrink-0">
                    <div class="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-200 to-indigo-200 flex items-center justify-center shadow-sm">
                      <span class="text-blue-700 text-sm font-medium">{{ conversation.name.charAt(0).toUpperCase() }}</span>
                    </div>
                    <div 
                      class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                      :class="{'bg-green-500': true, 'bg-gray-300': false}"
                    ></div>
                  </div>
                  
                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start mb-0.5">
                      <h3 
                        class="text-sm truncate pr-2"
                        :class="{ 'font-bold text-gray-900': conversation.unreadCount > 0, 'font-medium text-gray-800': !conversation.unreadCount }"
                      >
                        {{ conversation.name }}
                      </h3>
                      <span 
                        class="text-xs whitespace-nowrap"
                        :class="{ 'text-blue-600 font-medium': conversation.unreadCount > 0, 'text-gray-500': !conversation.unreadCount }"
                      >
                        {{ conversation.lastMessageTime }}
                      </span>
                    </div>
                    <p 
                      class="text-xs truncate pr-8"
                      :class="{ 'text-gray-700': conversation.unreadCount > 0, 'text-gray-500': !conversation.unreadCount }"
                    >
                      {{ conversation.lastMessage || 'No messages yet' }}
                    </p>
                    
                    <!-- Unread badge -->
                    <div class="flex justify-between items-center mt-1">
                      <div class="flex space-x-1">
                        <!-- You can add message status icons here if needed -->
                      </div>
                      <div v-if="conversation.unreadCount > 0" class="flex items-center">
                        <span class="px-1.5 py-0.5 bg-blue-500 text-white text-xs font-medium rounded-full">
                          {{ conversation.unreadCount }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Empty filtered results -->
            <div v-else-if="searchQuery && conversationsWithCorrectUnreadCount.length > 0" class="p-6 text-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p class="text-sm">No results found for "{{ searchQuery }}"</p>
              <button @click="searchQuery = ''" class="mt-2 text-blue-500 text-xs">Clear search</button>
            </div>
            
            <!-- Empty conversations state -->
            <div v-else class="p-6 text-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p class="text-sm">No conversations yet</p>
              <p class="text-xs mt-1">Your messages will appear here</p>
            </div>
          </div>
        </div>

        <!-- Chat Area -->
        <div 
          class="flex-1 flex flex-col min-h-0"
          :class="{
            'hidden md:flex': showConversationList, 
            'flex': !showConversationList
          }"
        >
          <div v-if="selectedConversation" class="flex-1 flex flex-col min-h-0">
            <!-- Chat Header with Back Button on Mobile -->
            <div class="py-2 px-3 border-b border-gray-200 flex-shrink-0">
              <div class="flex items-center space-x-2">
                <!-- Back Button (Mobile Only) -->
                <button 
                  @click="showConversationList = true" 
                  class="md:hidden p-1 rounded-full hover:bg-gray-100 text-gray-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span class="text-gray-600 text-sm font-medium">{{ selectedConversation.name.charAt(0) }}</span>
                </div>
                <div>
                  <h3 class="text-base font-medium text-gray-900">{{ selectedConversation.name }}</h3>
                  <p class="text-xs text-gray-500">Online</p>
                </div>
              </div>
            </div>

            <!-- Messages -->
            <div class="flex-1 overflow-y-auto p-3 space-y-2" ref="messagesContainer">
              <div v-for="message in messages" :key="message.id"
                :class="['flex', message.senderId === currentUserId ? 'justify-end' : 'justify-start']">
                <div :class="['max-w-[85%] sm:max-w-[75%] rounded-lg p-2', 
                          message.senderId === currentUserId ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900']">
                  <p class="text-sm break-words">{{ message.content }}</p>
                  <p class="text-xs mt-0.5" :class="message.senderId === currentUserId ? 'text-blue-100' : 'text-gray-500'">
                    {{ formatTime(message.timestamp) }}
                  </p>
                </div>
              </div>
              <!-- Empty messages state -->
              <div v-if="messages.length === 0" class="p-4 text-center text-gray-500">
                <p class="text-sm">No messages yet</p>
                <p class="text-xs mt-1">Start the conversation!</p>
              </div>
            </div>

            <!-- Message Input -->
            <div class="p-2 border-t border-gray-200 flex-shrink-0">
              <div class="flex space-x-2">
                <input type="text" v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type a message..."
                  class="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <button @click="sendMessage"
                  class="bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm">
                  Send
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="flex-1 flex items-center justify-center">
            <div class="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto text-gray-400" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 class="mt-1 text-sm font-medium text-gray-900">No conversation selected</h3>
              <p class="mt-0.5 text-xs text-gray-500 px-4">Select a conversation from the list to start messaging</p>
              <!-- Show button on mobile to go back to conversation list -->
              <button 
                @click="showConversationList = true"
                class="mt-4 md:hidden px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium"
              >
                View Conversations
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watchEffect, watch } from 'vue'
import { database, auth } from '../firebase/config'
import { onValue, ref as dbRef, push, set, update, serverTimestamp, get } from 'firebase/database'
import { useMessagingStore } from '../stores/messaging'

interface Conversation {
  id: string
  name: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  timestamp: number
  isRead: boolean
  conversationId: string
}

const conversations = ref<Conversation[]>([])
const selectedConversation = ref<Conversation | null>(null)
const messages = ref<Message[]>([])
const newMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const currentUserId = computed(() => auth.currentUser?.uid)
const messagingStore = useMessagingStore()
const totalUnreadCount = computed(() => {
  return conversations.value.reduce((total, conversation) => total + (conversation.unreadCount || 0), 0)
})

const conversationsWithCorrectUnreadCount = computed(() => {
  return conversations.value.map(conversation => {
    // Check if we have unread count info from the store for this user
    const storeUnreadCount = messagingStore.unreadMessages[conversation.id] || 0;
    
    // Use the store's count if available, otherwise use the conversation's count
    return {
      ...conversation,
      unreadCount: storeUnreadCount || conversation.unreadCount || 0
    };
  });
});

watchEffect(() => {
  if (totalUnreadCount.value > 0) {
    document.title = `(${totalUnreadCount.value}) Messages - 3D Cake Admin`
  } else {
    document.title = '3D Cake Admin'
  }
})

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const showConversationList = ref(true); // Default to showing conversation list on mobile

const searchQuery = ref('');

const filteredConversations = computed(() => {
  if (!searchQuery.value) return conversationsWithCorrectUnreadCount.value;
  
  const query = searchQuery.value.toLowerCase();
  return conversationsWithCorrectUnreadCount.value.filter(conversation => 
    conversation.name.toLowerCase().includes(query) || 
    (conversation.lastMessage && conversation.lastMessage.toLowerCase().includes(query))
  );
});

onMounted(() => {
  const usersRef = dbRef(database, 'users')
  onValue(usersRef, (snapshot) => {
    const data = snapshot.val()
    if (data && currentUserId.value) {
      console.log('Firebase data received:', data)
      
      // Get current admin user data to check messages
      const currentUserData = data[currentUserId.value]
      console.log('Current user data:', currentUserData)
      console.log('Current user messages:', currentUserData?.messages)
      
      // Debug conversation IDs
      const otherUserIds = Object.keys(data).filter(id => id !== currentUserId.value)
      otherUserIds.forEach(id => {
        const possibleConvId = getConversationId(id)
        console.log(`Possible conversation ID with ${id}:`, possibleConvId)
      })
      
      conversations.value = Object.entries(data)
        .filter(([id]) => id !== currentUserId.value)
        .map(([id, user]: [string, any]) => {
          // Find the conversation between current user and this user
          let lastMessage = ''
          let lastMessageTime = ''
          let unreadCount = 0
          
          // Check if messages exist for this user
          if (user.messages) {
            console.log(`Messages for user ${id}:`, user.messages)
            // Find the conversation ID that contains the current user
            const conversationId = Object.keys(user.messages).find(convId => 
              convId.includes(currentUserId.value as string) && convId.includes(id)
            )
            
            if (conversationId && user.messages[conversationId]) {
              console.log(`Found conversation ${conversationId}:`, user.messages[conversationId])
              lastMessage = user.messages[conversationId].lastMessage || ''
              lastMessageTime = user.messages[conversationId].lastMessageTime || ''
              unreadCount = user.messages[conversationId].unreadCount || 0
              console.log(`Unread count for ${id}:`, unreadCount)
            }
          } else {
            console.log(`No messages for user ${id}`)
          }
          
          // IMPORTANT - Try to get messages from current user's data too
          if (currentUserData && currentUserData.messages) {
            const conversationId = getConversationId(id)
            if (currentUserData.messages[conversationId]) {
              console.log(`Found conversation in current user data: ${conversationId}`, currentUserData.messages[conversationId])
              if (!lastMessage) {
                lastMessage = currentUserData.messages[conversationId].lastMessage || ''
                lastMessageTime = currentUserData.messages[conversationId].lastMessageTime || ''
              }
              unreadCount = currentUserData.messages[conversationId].unreadCount || 0
              console.log(`Current user unread count for ${id}:`, unreadCount)
            }
          }
          
          const result = {
            id,
            name: user.name || user.email || 'Unknown',
            lastMessage,
            lastMessageTime,
            unreadCount: parseInt(String(unreadCount)) || 0  // Ensure it's a number
          }
          
          console.log(`Conversation object for ${id}:`, result)
          return result
        })
      
      console.log('Final conversations array:', conversations.value)
    } else {
      conversations.value = []
    }
  })
})

const selectConversation = (conversation: Conversation) => {
  selectedConversation.value = conversation
  
  try {
    // Get conversation ID
    const conversationId = getConversationId(conversation.id)
    console.log(`Selecting conversation: ${conversationId}`, conversation)
    
    // Reset unread count in the correct nested path
    if (currentUserId.value) {
      const userMessagesRef = dbRef(database, `users/${currentUserId.value}/messages/${conversationId}`)
      console.log(`Updating unreadCount to 0 at path: users/${currentUserId.value}/messages/${conversationId}`)
      
      // First check if this path exists
      get(userMessagesRef).then(snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log("Current message data:", data);
          
          // Only update if the path exists
          update(userMessagesRef, { unreadCount: 0 })
            .then(() => console.log("Successfully reset unread count"))
            .catch(err => console.error("Error resetting unread count:", err));
            
          // Also update the local conversation object
          const index = conversations.value.findIndex(c => c.id === conversation.id);
          if (index !== -1) {
            conversations.value[index].unreadCount = 0;
          }
        } else {
          console.log("No existing message data found at this path");
        }
      });
    }
    
    // Load messages
    const messagesRef = dbRef(database, `messages/${conversationId}`)
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        messages.value = Object.entries(data).map(([id, message]: [string, any]) => ({
          id,
          content: message.content,
          senderId: message.senderId,
          receiverId: message.receiverId,
          timestamp: message.timestamp,
          isRead: message.isRead || false,
          conversationId: message.conversationId
        }))
        scrollToBottom()
      } else {
        messages.value = []
      }
    })
  } catch (error) {
    console.error('Error loading conversation:', error)
    // You might want to show an error message to the user here
  }
}

const getConversationId = (userId: string) => {
  const ids = [currentUserId.value, userId].sort()
  return `${ids[0]}_${ids[1]}`
}

const sendMessage = async () => {
  console.log('Send message triggered', {
    message: newMessage.value,
    selectedConversation: selectedConversation.value,
    currentUserId: currentUserId.value
  })

  if (!newMessage.value.trim() || !selectedConversation.value || !currentUserId.value) {
    console.log('Message not sent - validation failed', {
      hasMessage: !!newMessage.value.trim(),
      hasConversation: !!selectedConversation.value,
      hasUserId: !!currentUserId.value
    })
    return
  }

  const conversationId = getConversationId(selectedConversation.value.id)
  console.log('Generated conversation ID:', conversationId)
  
  try {
    // Create message data
    const messageData = {
      content: newMessage.value,
      senderId: currentUserId.value,
      receiverId: selectedConversation.value.id,
      timestamp: Date.now(),
      conversationId: conversationId,
      isRead: false
    }

    console.log('Attempting to save message:', messageData)

    // Save message in the messages collection
    const messagesRef = dbRef(database, `messages/${conversationId}`)
    const newMessageRef = push(messagesRef)
    await set(newMessageRef, messageData)
    console.log('Message saved successfully')

    // Get current unread count for recipient
    let currentUnreadCount = 0
    const recipientMessagesRef = dbRef(database, `users/${selectedConversation.value.id}/messages/${conversationId}`)
    const snapshot = await get(recipientMessagesRef)
    if (snapshot.exists()) {
      const data = snapshot.val()
      currentUnreadCount = data.unreadCount ? parseInt(data.unreadCount) : 0
      console.log('Current unread count before increment:', currentUnreadCount)
    }

    // Update the sender's messages
    const senderMessagesRef = dbRef(database, `users/${currentUserId.value}/messages/${conversationId}`)
    await set(senderMessagesRef, {
      lastMessage: newMessage.value,
      lastMessageTime: formatTime(Date.now()),
      unreadCount: 0
    })

    // Update the recipient's messages with incremented unread count
    const newUnreadCount = currentUnreadCount + 1
    console.log('New unread count after increment:', newUnreadCount)
    await set(recipientMessagesRef, {
      lastMessage: newMessage.value,
      lastMessageTime: formatTime(Date.now()),
      unreadCount: newUnreadCount
    })

    console.log('User messages updated successfully')
    
    // Clear the input field
    newMessage.value = ''
    
    // Scroll to bottom after message is sent
    await scrollToBottom()
    
  } catch (error: any) {
    console.error('Error sending message:', {
      error,
      errorMessage: error.message,
      errorCode: error.code,
      errorDetails: error.details,
      stack: error.stack
    })
    
    // Check for specific Firebase error codes
    if (error.code === 'PERMISSION_DENIED') {
      console.error('Firebase permission denied. Check your database rules.')
      alert('Permission denied. Please check your database rules.')
    } else if (error.code === 'DATABASE_ERROR') {
      console.error('Firebase database error. Check your database URL and configuration.')
      alert('Database error. Please check your configuration.')
    } else {
      alert('Failed to send message. Please try again.')
    }
  }
}

// Add this watch after the computed properties
watch(() => messagingStore.unreadMessages, (newUnreadMessages) => {
  console.log("Unread messages updated in store:", newUnreadMessages);
  
  // Force refresh of conversations list to update unread counts
  conversations.value = [...conversations.value];
}, { deep: true });
</script> 