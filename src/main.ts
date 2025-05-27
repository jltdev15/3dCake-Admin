import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import DashboardLayout from './layouts/DashboardLayout.vue'
import { useAuthStore } from './stores/auth'
import { useMessagingStore } from './stores/messaging'

const app = createApp(App)
const pinia = createPinia()

// Register the DashboardLayout component globally
app.component('DashboardLayout', DashboardLayout)

app.use(pinia)
app.use(router)

// Initialize auth state
const authStore = useAuthStore()
authStore.initAuth()

// Initialize messaging listener after auth is ready
const messagingStore = useMessagingStore()

// Listen for auth changes to initialize messaging
authStore.$subscribe((mutation, state) => {
  if (state.user) {
    messagingStore.initMessageListener()
  }
})

app.mount('#app')
