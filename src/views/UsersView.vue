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

        <div class="text-center">
          <button class="bg-blue-500 text-white px-4 py-2 font-bold">
            ADD NEW USER
          </button>
        </div>
      </div>

      <!-- Basic Table -->
      <div class="overflow-x-auto">
        <table class="w-full border-collapse border-2 border-gray-500">
          <thead>
            <tr class="bg-gray-200">
              <th class="border-2 border-gray-500 p-2 text-center">Name</th>
              <th class="border-2 border-gray-500 p-2 text-center">Email</th>
              <th class="border-2 border-gray-500 p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-100">
              <td class="border-2 border-gray-500 p-2">
                <div class="flex items-center justify-center">
                  <div class="h-10 w-10 bg-blue-500 flex items-center justify-center mr-3">
                    <span class="text-white font-bold">{{ getUserInitials(user.name) }}</span>
                  </div>
                  <div class="font-bold">{{ user.name }}</div>
                </div>
              </td>
              <td class="border-2 border-gray-500 p-2 text-center">{{ user.email }}</td>
              <td class="border-2 border-gray-500 p-2 text-center">
                <button class="bg-red-500 text-white px-4 py-1 font-bold">
                  BLOCK
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Simple Pagination -->
      <div class="mt-6 text-center">
        <button class="bg-blue-500 text-white px-4 py-2 mx-2 font-bold">Previous</button>
        <button class="bg-blue-500 text-white px-4 py-2 mx-2 font-bold">Next</button>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Sample data for users
const users = ref([
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Robert Johnson', email: 'robert@example.com' },
  { id: 4, name: 'Emily Davis', email: 'emily@example.com' },
  { id: 5, name: 'Michael Brown', email: 'michael@example.com' },
])

// Search functionality
const searchQuery = ref('')

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


</script>
