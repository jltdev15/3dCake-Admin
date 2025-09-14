<template>
  <div class="min-h-screen relative overflow-hidden" style="background: linear-gradient(135deg, #F0E68D 0%, #CAD08E 100%);">
    <!-- Decorative Elements -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      <div class="absolute -top-24 -left-24 w-96 h-96 bg-[#58091F]/5 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 -right-24 w-96 h-96 bg-[#58091F]/5 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-24 left-1/3 w-96 h-96 bg-[#58091F]/5 rounded-full blur-3xl"></div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen relative z-10">
      <div class="w-full max-w-md">
        <!-- Logo Section with Animation -->
        <div class="text-center mb-8 transform hover:scale-105 transition-transform duration-300">
          <div class="w-32 h-32 mx-auto rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-xl shadow-[#58091F]/10 border-2 border-white/80 hover:shadow-2xl hover:shadow-[#58091F]/20 transition-all duration-300">
            <img src="/images/logo.jpg" alt="Psalm Cakes Logo" class="w-28 h-28 object-cover" />
          </div>
          <h1 class="mt-4 text-3xl font-bold text-[#58091F]">Psalm Cakes</h1>
          <p class="text-[#58091F]/80 mt-1">Admin Portal</p>
        </div>

        <!-- Auth Card -->
        <div class="bg-white/60 backdrop-blur-md rounded-lg p-8 shadow-xl shadow-[#58091F]/10 border border-white/80 hover:shadow-2xl hover:shadow-[#58091F]/20 transition-all duration-300">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-[#58091F] mb-2">Welcome Back!</h2>
            <p class="text-[#58091F]/80">Sign in to manage your bakery</p>
          </div>

          <!-- Error message with animation -->
          <div v-if="authStore.error" 
               class="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md animate-fade-in-down">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-red-700">{{ authStore.error }}</p>
            </div>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-6">
            <!-- Email input with icon -->
            <div class="form-group relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-[#58091F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input 
                type="email" 
                id="username" 
                v-model="username" 
                placeholder="Enter your email"
                class="w-full pl-12 pr-4 py-3 bg-white/50 border-2 border-[#58091F]/20 rounded-md text-[#58091F] placeholder-[#58091F]/60 focus:outline-none focus:ring-2 focus:ring-[#58091F]/30 focus:border-transparent transition-all duration-300"
                :class="{'border-red-500': authStore.error}"
              />
            </div>

            <!-- Password input with icon -->
            <div class="form-group relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-[#58091F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input 
                type="password" 
                id="password" 
                v-model="password" 
                placeholder="Enter your password"
                class="w-full pl-12 pr-4 py-3 bg-white/50 border-2 border-[#58091F]/20 rounded-md text-[#58091F] placeholder-[#58091F]/60 focus:outline-none focus:ring-2 focus:ring-[#58091F]/30 focus:border-transparent transition-all duration-300"
                :class="{'border-red-500': authStore.error}"
              />
            </div>

            <!-- Login button with loading state -->
            <button 
              type="submit" 
              :disabled="authStore.loading"
              class="w-full py-3 px-4 bg-[#58091F] text-white font-medium rounded-md hover:bg-[#58091F]/90 focus:outline-none focus:ring-2 focus:ring-[#58091F] focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
            >
              <div class="flex items-center justify-center">
                <svg v-if="authStore.loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ authStore.loading ? 'Signing in...' : 'Sign In' }}
              </div>
            </button>

            <!-- Forgot password link -->
            <!-- <div class="text-center">
              <a href="#" class="text-[#58091F] hover:text-[#58091F]/80 font-medium transition-colors duration-300">
                Forgot Password?
              </a>
            </div> -->
          </form>

          <!-- Download Button -->
          <div class="mt-6 pt-6 border-t border-[#58091F]/20">
            <button 
              @click="handleDownload"
              class="w-full py-3 px-4 bg-white/80 text-[#58091F] font-medium rounded-md border-2 border-[#58091F]/30 hover:bg-[#58091F] hover:text-white hover:border-[#58091F] focus:outline-none focus:ring-2 focus:ring-[#58091F] focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div class="flex items-center justify-center">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.2439 13.8533 7.6818 12 7.6818s-3.5902.5621-5.1367 1.7279L4.841 5.9065a.416.416 0 00-.5676-.1521.416.416 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396"/>
                </svg>
                Download 3D Cake Maker App
              </div>
            </button>
          </div>
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
    if (err.code === 'auth/invalid-email') {
      authStore.error = 'Please enter a valid email address'
    } else {
      console.error('Login error:', err)
    }
  }
}

const handleDownload = () => {
  // Download the APK file from the public folder
  const link = document.createElement('a')
  link.href = '/app-release.apk'
  link.download = '3DCakeMaker-App.apk'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
.form-group {
  position: relative;
}

.form-group input:focus {
  transform: translateY(-1px);
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-down {
  animation: fadeInDown 0.3s ease-out;
}

/* Add smooth transitions for all interactive elements */
input, button, a {
  transition: all 0.3s ease;
}

/* Add hover effect for the logo */
.logo-container:hover img {
  transform: scale(1.05);
}

/* Add focus styles for better accessibility */
input:focus {
  box-shadow: 0 0 0 3px rgba(88, 9, 31, 0.2);
}

/* Add loading animation for the button */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
