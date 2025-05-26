<template>
  <DashboardLayout>
    <div class="flex flex-col min-h-[400px] h-[80dvh] md:h-[90dvh]">
      <div class="flex-1 flex min-h-0">
        <!-- Conversations List -->
        <div class="w-1/3 border-r border-gray-200 flex flex-col">
          <div class="py-2 px-3 border-b border-gray-200 flex-shrink-0">
            <h2 class="text-base font-semibold text-gray-800">Messages</h2>
          </div>
          <div class="flex-1 overflow-y-auto">
            <div v-for="conversation in conversations" :key="conversation.id" @click="selectConversation(conversation)"
              class="py-2 px-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
              :class="{ 'bg-gray-50': selectedConversation?.id === conversation.id }">
              <div class="flex items-center space-x-2">
                <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span class="text-gray-600 text-sm font-medium">{{ conversation.name.charAt(0) }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ conversation.name }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ conversation.lastMessage }}</p>
                </div>
                <div class="flex flex-col items-end">
                  <span class="text-xs text-gray-500">{{ conversation.lastMessageTime }}</span>
                  <span v-if="conversation.unreadCount"
                    class="mt-0.5 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {{ conversation.unreadCount }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Area -->
        <div class="flex-1 flex flex-col min-h-0">
          <div v-if="selectedConversation" class="flex-1 flex flex-col min-h-0">
            <!-- Chat Header -->
            <div class="py-2 px-3 border-b border-gray-200 flex-shrink-0">
              <div class="flex items-center space-x-2">
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
                <div :class="['max-w-[70%] rounded-lg p-2', 
                          message.senderId === currentUserId ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900']">
                  <p class="text-sm">{{ message.content }}</p>
                  <p class="text-xs mt-0.5" :class="message.senderId === currentUserId ? 'text-blue-100' : 'text-gray-500'">
                    {{ formatTime(message.timestamp) }}
                  </p>
                </div>
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
              <p class="mt-0.5 text-xs text-gray-500">Select a conversation to start messaging</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { database, auth } from '../firebase/config'
import { onValue, ref as dbRef, push, set, update, serverTimestamp, get } from 'firebase/database'

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

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

onMounted(() => {
  const usersRef = dbRef(database, 'users')
  onValue(usersRef, (snapshot) => {
    const data = snapshot.val()
    if (data) {
      conversations.value = Object.entries(data)
        .filter(([id]) => id !== currentUserId.value)
        .map(([id, user]: [string, any]) => ({
          id,
          name: user.email || 'Unknown',
          lastMessage: user.lastMessage || '',
          lastMessageTime: user.lastMessageTime || '',
          unreadCount: user.unreadCount || 0
        }))
    } else {
      conversations.value = []
    }
  })
})

const selectConversation = (conversation: Conversation) => {
  selectedConversation.value = conversation
  
  try {
    // Reset unread count
    const userRef = dbRef(database, `users/${conversation.id}`)
    update(userRef, { unreadCount: 0 })
    
    // Load messages
    const messagesRef = dbRef(database, `messages/${getConversationId(conversation.id)}`)
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

    // Update the sender's messages
    const senderMessagesRef = dbRef(database, `users/${currentUserId.value}/messages/${conversationId}`)
    await set(senderMessagesRef, {
      lastMessage: newMessage.value,
      lastMessageTime: formatTime(Date.now()),
      unreadCount: 0
    })

    // Update the recipient's messages
    const recipientMessagesRef = dbRef(database, `users/${selectedConversation.value.id}/messages/${conversationId}`)
    await set(recipientMessagesRef, {
      lastMessage: newMessage.value,
      lastMessageTime: formatTime(Date.now()),
      unreadCount: (selectedConversation.value.unreadCount || 0) + 1
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
</script> 