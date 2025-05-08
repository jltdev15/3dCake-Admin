import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import DashboardLayout from './layouts/DashboardLayout.vue'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

// Register the DashboardLayout component globally
app.component('DashboardLayout', DashboardLayout)

app.use(pinia)
app.use(router)

// Initialize auth state
const authStore = useAuthStore()
authStore.initAuth()

app.mount('#app')
