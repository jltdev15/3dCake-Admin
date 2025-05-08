<template>
  <div class="min-h-screen flex justify-center  items-center" style="background-color: #F0E68D;">
    <!-- Login text at top -->


    <!-- Main content container - fully responsive -->
    <div class="w-full max-w-md flex flex-col items-center relative min-h-[500px] flex-grow"
      style="background-color: #F0E68D;">
      <!-- Cake image on the right side - hidden on very small screens -->


      <!-- Logo section -->
      <div class="mt-8 mb-4 relative z-10">
        <div
          class="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-xl shadow-black/30 border-2 border-white">
          <img src="/images/logo.jpg" alt="Psalm Cakes Logo" class="w-28 h-28 md:w-36 md:h-36 object-cover" />
        </div>
      </div>

      <!-- Form section with semi-transparent background -->
      <div class="w-full px-4 sm:px-6 pb-8 z-10 mt-4">
        <div class="bg-white/50 rounded-3xl p-4 sm:p-6 backdrop-blur-sm shadow-xl shadow-black/20 transform hover:translate-y-[-2px] transition-all duration-300 border border-white/30">
          <form @submit.prevent="handleLogin" class="flex flex-col items-center py-12">
            <!-- Error message -->
            <div v-if="authStore.error" class="w-full mb-4 text-red-600 text-center">
              {{ authStore.error }}
            </div>

            <!-- Email input -->
            <div class="w-full mb-4">
              <input type="email" id="username" v-model="username" placeholder="EMAIL"
                class="w-full px-4 py-3 border-4 border-white bg-transparent rounded-full text-center text-gray-800 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white shadow-inner shadow-black/10" />
            </div>

            <!-- Password input -->
            <div class="w-full mb-6">
              <input type="password" id="password" v-model="password" placeholder="PASSWORD"
                class="w-full px-4 py-3 border-4 border-white bg-transparent rounded-full text-center text-gray-800 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white shadow-inner shadow-black/10" />
            </div>

            <!-- Login button -->
            <button type="submit" :disabled="authStore.loading"
              class="w-32 py-2 px-4 bg-white rounded-full text-gray-800 font-medium mb-4 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 shadow-md hover:shadow-lg transition-shadow duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ authStore.loading ? 'Loading...' : 'LOG IN' }}
            </button>

            <!-- Forgot password link -->
            <div class="text-center mb-4">
              <a href="#" class="text-gray-800 hover:underline">Forgot Password?</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')

const handleLogin = async () => {
  try {
    await authStore.login(username.value, password.value)
    router.push('/dashboard')
  } catch (err: any) {
    // Handle specific error cases with user-friendly messages
    if (err.code === 'auth/invalid-email') {
      authStore.error = 'Please enter a valid email address'
    } else {
      console.error('Login error:', err)
    }
  }
}
</script>
