<template>
  <DashboardLayout>
    <div>
      <!-- User Management Header -->
      <h1 class="text-2xl font-bold mb-4 text-center">User Management</h1>

      <!-- Simple Search and Add Button -->
      <div class="mb-6">
        <div class="text-center mb-4">
          <input
            type="text"
            placeholder="Search users..."
            class="w-full max-w-md px-4 py-2 border-2 border-gray-500"
            v-model="searchQuery"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center mt-4">
        <p>Loading users...</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="text-center mt-4 text-red-500">
        <p>{{ error }}</p>
      </div>

      <!-- Basic Table -->
      <div v-if="!loading && !error" class="overflow-x-auto">
        <table class="w-full border-collapse border-2 border-gray-500">
          <thead>
            <tr class="bg-gray-200">
              <th class="border-2 border-gray-500 p-2 text-center">Name</th>
              <th class="border-2 border-gray-500 p-2 text-center">Email</th>
              <th class="border-2 border-gray-500 p-2 text-center">Status</th>
              <th class="border-2 border-gray-500 p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.uid" class="hover:bg-gray-100">
              <td class="border-2 border-gray-500 p-2">
                <div class="flex items-center justify-center">
                  <div class="h-10 w-10 bg-blue-500 flex items-center justify-center mr-3 rounded-full">
                    <span class="text-white font-bold">{{ getUserInitials(user.name) }}</span>
                  </div>
                  <div class="font-bold">{{ user.name }}</div>
                </div>
              </td>
              <td class="border-2 border-gray-500 p-2 text-center">{{ user.email }}</td>
              <td class="border-2 border-gray-500 p-2 text-center">
                <span :class="user.status === 'active' ? 'text-green-600' : 'text-red-600'" class="font-bold">
                  {{ user.status.toUpperCase() }}
                </span>
              </td>
              <td class="border-2 border-gray-500 p-2 text-center">
                <button 
                  v-if="user.status === 'active'"
                  @click="showBlockConfirmation(user)"
                  class="bg-red-500 text-white px-4 py-1 font-bold hover:bg-red-600"
                >
                  BLOCK
                </button>
                <button 
                  v-else
                  @click="showUnblockConfirmation(user)"
                  class="bg-green-500 text-white px-4 py-1 font-bold hover:bg-green-600"
                >
                  UNBLOCK
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- No Users State -->
      <div v-if="!loading && !error && filteredUsers.length === 0" class="text-center mt-4">
        <p>No users found</p>
      </div>

      <!-- Confirmation Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">
        <div class="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-200">
          <h2 class="text-xl font-bold mb-4">{{ modalTitle }}</h2>
          <p class="mb-6">{{ modalMessage }}</p>
          <div class="flex justify-end space-x-4">
            <button 
              @click="closeModal" 
              class="px-4 py-2 bg-gray-500 text-white font-bold hover:bg-gray-600"
            >
              Cancel
            </button>
            <button 
              @click="confirmAction" 
              :class="selectedUser?.status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'"
              class="px-4 py-2 text-white font-bold"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '../stores/users'
import type { User } from '../stores/users'

const userStore = useUserStore()
const searchQuery = ref('')

// Modal state
const showModal = ref(false)
const selectedUser = ref<User | null>(null)
const modalTitle = computed(() => selectedUser.value?.status === 'active' ? 'Block User' : 'Unblock User')
const modalMessage = computed(() => {
  if (!selectedUser.value) return ''
  return selectedUser.value.status === 'active'
    ? `Are you sure you want to block ${selectedUser.value.name}?`
    : `Are you sure you want to unblock ${selectedUser.value.name}?`
})

// Fetch users when component mounts
onMounted(async () => {
  await userStore.fetchUsers()
})

// Use storeToRefs to properly handle refs from the store
const { users, loading, error } = storeToRefs(userStore)

// Filtered users based on search
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value

  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  )
})

// Get user initials for avatar
const getUserInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Show block confirmation modal
const showBlockConfirmation = (user: User) => {
  selectedUser.value = user
  showModal.value = true
}

// Show unblock confirmation modal
const showUnblockConfirmation = (user: User) => {
  selectedUser.value = user
  showModal.value = true
}

// Close modal
const closeModal = () => {
  showModal.value = false
  selectedUser.value = null
}

// Confirm action
const confirmAction = async () => {
  if (!selectedUser.value) return
  
  const newStatus = selectedUser.value.status === 'active' ? 'blocked' : 'active'
  await userStore.updateUserStatus(selectedUser.value.uid, newStatus)
  closeModal()
}
</script>
