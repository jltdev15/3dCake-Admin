<template>
  <DashboardLayout>
    <div>
      <!-- Settings Header -->
      <h1 class="text-2xl font-bold mb-4 text-center">Profile Settings</h1>

      <!-- Profile Section -->
      <div class="border-2 border-gray-500 p-4 bg-gray-100">
        <h2 class="text-xl font-bold mb-4 text-center">Profile Information</h2>
        <p class="mb-6 text-center">Update your account's profile information and email address.</p>

        <form @submit.prevent="saveProfile" class="space-y-6">
  

          <!-- Name -->
          <div>
            <label for="name" class="block font-bold mb-2">Name</label>
            <input
              type="text"
              id="name"
              v-model="profile.name"
              class="w-full px-3 py-2 border-2 border-gray-500"
            />
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block font-bold mb-2">Email</label>
            <input
              type="email"
              id="email"
              v-model="profile.email"
              class="w-full px-3 py-2 border-2 border-gray-500"
            />
          </div>

          <!-- Save Button -->
          <div class="text-center">
            <button
              type="submit"
              class="px-6 py-3 bg-blue-500 text-white font-bold"
            >
              SAVE
            </button>
          </div>
        </form>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Profile form data
const profile = ref({
  name: 'Admin User',
  email: 'admin@example.com',
})

// Form submission handler
const saveProfile = () => {
  alert('Profile saved!')
}
</script>
