<template>
  <DashboardLayout>
    <div class="bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <!-- Header Section -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">User Management</h1>
            <p class="mt-1 text-sm text-gray-500">Manage and track all user accounts</p>
          </div>
          
          <!-- Search Bar -->
          <div class="mt-4 md:mt-0 relative">
            <div class="relative rounded-lg shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search users by name or email..."
                class="block w-full md:w-96 pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
                v-model="searchQuery"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
            <table class="min-w-full divide-y divide-gray-100">
              <thead>
                <tr class="bg-gray-50">
                  <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-100">
                <tr v-for="user in paginatedUsers" :key="user.uid" class="hover:bg-gray-50 transition-colors duration-200">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center rounded-full shadow-sm">
                        <span class="text-white text-sm font-medium">{{ getUserInitials(user.name) }}</span>
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
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                      {{ (user.status || 'unknown').toUpperCase() }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <div class="flex items-center space-x-2">
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
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="!loading && !error && paginatedUsers.length > 0" 
               class="px-6 py-4 flex items-center justify-between border-t border-gray-100">
            <div class="flex items-center text-sm text-gray-500">
              <span>Showing</span>
              <span class="mx-1 font-medium">{{ paginationStart }}</span>
              <span>to</span>
              <span class="mx-1 font-medium">{{ paginationEnd }}</span>
              <span>of</span>
              <span class="mx-1 font-medium">{{ totalUsers }}</span>
              <span>users</span>
            </div>
            <div class="flex items-center space-x-2">
              <button 
                @click="currentPage--" 
                :disabled="currentPage === 1"
                class="inline-flex items-center px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <div class="flex items-center space-x-1">
                <button 
                  v-for="page in displayedPages" 
                  :key="page"
                  @click="currentPage = page"
                  :class="[
                    'inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium transition-colors duration-200',
                    currentPage === page 
                      ? 'border-blue-500 text-blue-600 bg-blue-50' 
                      : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                  ]"
                >
                  {{ page }}
                </button>
              </div>
              <button 
                @click="currentPage++" 
                :disabled="currentPage === totalPages"
                class="inline-flex items-center px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Next
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <!-- No Users State -->
          <div v-if="!loading && !error && paginatedUsers.length === 0" class="p-8 text-center">
            <div class="inline-flex flex-col items-center px-4 py-6 text-sm text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p class="font-medium">No users found</p>
              <p class="text-gray-400 mt-1">Try adjusting your search query</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 transform transition-all">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-medium text-gray-900">{{ modalTitle }}</h2>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-500 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p class="text-sm text-gray-500 mb-6">{{ modalMessage }}</p>
            <div class="flex justify-end space-x-3">
              <button 
                @click="closeModal" 
                class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button 
                @click="confirmAction" 
                :class="[
                  'px-3 py-1.5 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200',
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
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '../stores/users'
import type { User } from '../stores/users'

const userStore = useUserStore()
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

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

// Pagination computed properties
const totalUsers = computed(() => filteredUsers.value.length)
const totalPages = computed(() => Math.ceil(totalUsers.value / itemsPerPage))

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredUsers.value.slice(start, end)
})

const paginationStart = computed(() => {
  return totalUsers.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage + 1
})

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * itemsPerPage, totalUsers.value)
})

const displayedPages = computed(() => {
  const pages = []
  const maxVisiblePages = 5
  let startPage = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2))
  let endPage = Math.min(totalPages.value, startPage + maxVisiblePages - 1)

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return pages
})

// Reset to first page when search query changes
watch(searchQuery, () => {
  currentPage.value = 1
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
