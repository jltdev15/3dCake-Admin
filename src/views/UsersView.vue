<template>
  <DashboardLayout>
    <div>
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-800">User Management</h1>
          <p class="mt-1 text-sm text-gray-600">Manage user accounts and permissions</p>
        </div>
        
        <!-- Search Bar -->
        <div class="relative mt-4 md:mt-0">
          <input
            type="text"
            placeholder="Search users..."
            class="w-full md:w-80 px-4 py-2 pl-10 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200"
            v-model="searchQuery"
          />
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <!-- Loading State -->
        <div v-if="loading" class="p-8 text-center">
          <div class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading users...
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="p-8 text-center">
          <div class="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ error }}
          </div>
        </div>

        <!-- Users Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100">
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="user in filteredUsers" :key="user.uid" class="hover:bg-gray-50 transition-colors duration-200">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 bg-blue-600 flex items-center justify-center rounded-full shadow-sm">
                      <span class="text-white font-medium">{{ getUserInitials(user.name) }}</span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-600">{{ user.email }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[
                    'px-3 py-1 text-xs font-medium rounded-full',
                    user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]">
                    {{ user.status.toUpperCase() }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <button 
                    v-if="user.status === 'active'"
                    @click="showBlockConfirmation(user)"
                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Block
                  </button>
                  <button 
                    v-else
                    @click="showUnblockConfirmation(user)"
                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Unblock
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- No Users State -->
        <div v-if="!loading && !error && filteredUsers.length === 0" class="p-8 text-center">
          <div class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            No users found
          </div>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-medium text-gray-900">{{ modalTitle }}</h2>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-500 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p class="text-sm text-gray-500 mb-6">{{ modalMessage }}</p>
            <div class="flex justify-end space-x-3">
              <button 
                @click="closeModal" 
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button 
                @click="confirmAction" 
                :class="[
                  'px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200',
                  selectedUser?.status === 'active' 
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                ]"
              >
                Confirm
              </button>
            </div>
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
  // First filter out the admin user
  const filteredList = users.value.filter(user => user.email !== 'admin@gmail.com')
  
  // Then apply search filtering if needed
  if (!searchQuery.value) return filteredList

  const query = searchQuery.value.toLowerCase()
  return filteredList.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  )
})

// Get user initials for avatar
const getUserInitials = (name: string) => {
  if (!name) return '??'
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
