<template>
  <div class="min-h-screen bg-gradient-to-r from-[#D3D58E] to-[#FFF7D0] flex flex-col md:flex-row">
    <!-- Mobile Header with Menu Toggle -->
    <div class="md:hidden bg-gradient-to-r from-[#D3D58E] to-[#FFF7D0] p-4 flex justify-between items-center border-b-2 border-gray-500">
      <div class="flex items-center">
        <div class="w-10 h-10 border-2 border-white mr-2">
          <img src="/images/logo.jpg" alt="Logo" class="w-full h-full object-cover" />
        </div>
        <h1 class="text-lg font-bold text-gray-800 bg-white px-2 py-1 border-2 border-gray-500">Psalm Cakes</h1>
      </div>

      <div class="flex items-center">
        <!-- Notification Bell for Mobile -->
        <div class="relative mr-4 notification-dropdown-container">
          <button @click="toggleNotificationDropdown" class="bg-white p-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <!-- Notification Badge -->
            <span v-if="unreadNotificationsCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold h-5 w-5 flex items-center justify-center border border-white">
              {{ unreadNotificationsCount }}
            </span>
          </button>

          <!-- Mobile Notification Dropdown -->
          <div v-if="notificationDropdownOpen" class="absolute right-0 mt-2 w-72 bg-white border-2 border-gray-500 z-50">
            <div class="px-4 py-2 border-b-2 border-gray-500 flex justify-between items-center bg-gray-200">
              <h3 class="font-bold">Notifications</h3>
              <button @click="markAllAsRead" class="text-blue-500 font-bold">
                Mark all as read
              </button>
            </div>

            <div class="max-h-60 overflow-y-auto">
              <div v-if="notifications.length === 0" class="px-4 py-3 text-center">
                No notifications
              </div>

              <div
                v-for="notification in notifications"
                :key="notification.id"
                :class="['px-4 py-3 border-b-2 border-gray-300 cursor-pointer', { 'bg-blue-100': !notification.read }]"
                @click="handleNotificationClick(notification)"
              >
                <div class="flex justify-between">
                  <p class="font-bold">{{ notification.message }}</p>
                  <span v-if="!notification.read" class="h-3 w-3 bg-blue-500"></span>
                </div>
                <p class="text-gray-500 mt-1">{{ notification.time }}</p>
              </div>
            </div>

            <div class="px-4 py-2 border-t-2 border-gray-500 bg-gray-200">
              <a href="#" class="text-blue-500 font-bold block text-center">
                View all notifications
              </a>
            </div>
          </div>
        </div>
        <button @click="toggleSidebar" class="bg-white p-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Navigation Overlay -->
    <div v-if="sidebarOpen" class="fixed inset-0 z-50 md:hidden">
      <!-- Sidebar -->
      <div class="absolute right-0 top-0 bottom-0 w-full bg-gradient-to-r from-[#D3D58E] to-[#FFF7D0] border-l-2 border-gray-500">
        <!-- Mobile header with logo and close button -->
        <div class="p-4 flex justify-between items-center border-b-2 border-gray-500 bg-yellow-50">
          <div class="flex items-center">
            <div class="w-10 h-10 border-2 border-white mr-2">
              <img src="/images/logo.jpg" alt="Logo" class="w-full h-full object-cover" />
            </div>
            <h1 class="text-lg font-bold text-gray-800 bg-white px-2 py-1 border-2 border-gray-500">Psalm Cakes</h1>
          </div>
          <button @click="toggleSidebar" class="bg-white p-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="mt-4 flex-grow overflow-y-auto">
          <div class="px-4 py-2 bg-yellow-100 text-gray-800 font-bold border-y-2 border-gray-500">
            NAVIGATION
          </div>
          <ul>
            <li class="border-b-2 border-gray-500">
              <router-link to="/dashboard"
                class="block px-4 py-3 text-gray-800 font-bold"
                :class="{ 'bg-yellow-100': $route.path === '/dashboard' }"
                @click="closeSidebarOnMobile">
                DASHBOARD
              </router-link>
            </li>
            <li class="border-b-2 border-gray-500">
              <router-link to="/orders"
                class="block px-4 py-3 text-gray-800 font-bold"
                :class="{ 'bg-yellow-100': $route.path === '/orders' }"
                @click="closeSidebarOnMobile">
                ORDERS
              </router-link>
            </li>
            <li class="border-b-2 border-gray-500">
              <router-link to="/settings"
                class="block px-4 py-3 text-gray-800 font-bold"
                :class="{ 'bg-yellow-100': $route.path === '/settings' }"
                @click="closeSidebarOnMobile">
                SETTINGS
              </router-link>
            </li>
            <li class="border-b-2 border-gray-500">
              <router-link to="/users"
                class="block px-4 py-3 text-gray-800 font-bold"
                :class="{ 'bg-yellow-100': $route.path === '/users' }"
                @click="closeSidebarOnMobile">
                USER MANAGEMENT
              </router-link>
            </li>
          </ul>

          <!-- Logout Button -->
          <div class="p-4 border-t-2 border-gray-500 mt-4">
            <div class="py-2 bg-yellow-100 text-gray-800 font-bold text-center border-2 border-gray-500 mb-2">
              ACCOUNT
            </div>
            <button @click="logout"
              class="bg-red-500 text-white font-bold py-2 px-4 w-full">
              LOGOUT
            </button>
          </div>
        </nav>
      </div>
    </div>

    <!-- Desktop Sidebar -->
    <aside class="hidden md:block md:w-64 bg-gradient-to-r from-[#D3D58E] to-[#FFF7D0] border-r-2 border-gray-500">
      <div class="h-full flex flex-col">
        <!-- Logo section -->
        <div class="p-4 border-b-2 border-gray-500 bg-yellow-50">
          <div class="flex items-center">
            <div class="w-12 h-12 mr-3 border-2 border-white">
              <img src="/images/logo.jpg" alt="Logo" class="w-full h-full object-cover" />
            </div>
            <h1 class="text-xl font-bold text-gray-800 bg-white px-2 py-1 border-2 border-gray-500">Psalm Cakes</h1>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="mt-4 flex-grow">
          <ul>
            <li class="mb-2">
              <router-link to="/dashboard"
                class="block px-4 py-2 text-gray-800 font-bold"
                :class="{ 'bg-yellow-100': $route.path === '/dashboard' }">
                DASHBOARD
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/orders"
                class="block px-4 py-2 text-gray-800 font-bold"
                :class="{ 'bg-yellow-100': $route.path === '/orders' }">
                ORDERS
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/settings"
                class="block px-4 py-2 text-gray-800 font-bold"
                :class="{ 'bg-yellow-100': $route.path === '/settings' }">
                SETTINGS
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/users"
                class="block px-4 py-2 text-gray-800 font-bold"
                :class="{ 'bg-yellow-100': $route.path === '/users' }">
                USER MANAGEMENT
              </router-link>
            </li>
          </ul>
        </nav>

        <!-- Logout Button -->
        <div class="p-4 border-t-2 border-gray-500 mt-auto">
          <button @click="logout"
            class="bg-red-500 text-white font-bold py-2 px-4 w-full">
            LOGOUT
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto">
      <!-- Header -->
      <header
        class="bg-gradient-to-r from-[#D3D58E] to-[#FFF7D0] border-b-2 border-gray-500 p-4 flex justify-between items-center">
        <h1 class="text-xl font-bold text-gray-800">
          {{ pageTitle }}
        </h1>

        <!-- User Profile -->
        <div class="flex items-center">
          <!-- Notification Bell (hidden on mobile) -->
          <div class="relative mr-4 notification-dropdown-container hidden md:block">
            <button @click="toggleNotificationDropdown" class="bg-white p-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <!-- Notification Badge -->
              <span v-if="unreadNotificationsCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold h-5 w-5 flex items-center justify-center border border-white">
                {{ unreadNotificationsCount }}
              </span>
            </button>

            <!-- Notification Dropdown -->
            <div v-if="notificationDropdownOpen" class="absolute right-0 mt-2 w-80 bg-white border-2 border-gray-500 z-50">
              <div class="px-4 py-2 border-b-2 border-gray-500 flex justify-between items-center bg-gray-200">
                <h3 class="font-bold">Notifications</h3>
                <button @click="markAllAsRead" class="text-blue-500 font-bold">
                  Mark all as read
                </button>
              </div>

              <div class="max-h-60 overflow-y-auto">
                <div v-if="notifications.length === 0" class="px-4 py-3 text-center">
                  No notifications
                </div>

                <div v-for="notification in notifications" :key="notification.id"
                  :class="['px-4 py-3 border-b-2 border-gray-300 cursor-pointer', { 'bg-blue-100': !notification.read }]"
                  @click="handleNotificationClick(notification)">
                  <div class="flex justify-between">
                    <p class="font-bold">{{ notification.message }}</p>
                    <span v-if="!notification.read" class="h-3 w-3 bg-blue-500"></span>
                  </div>
                  <p class="text-gray-500 mt-1">{{ notification.time }}</p>
                </div>
              </div>

              <div class="px-4 py-2 border-t-2 border-gray-500 bg-gray-200">
                <a href="#" class="text-blue-500 font-bold block text-center">
                  View all notifications
                </a>
              </div>
            </div>
          </div>
          <span class="text-gray-800 font-bold mr-3 hidden sm:inline">Admin User</span>

        </div>
      </header>

      <!-- Page Content -->
      <div class="p-4">
        <div class="bg-white border-2 border-gray-500 p-4">
          <slot></slot>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const sidebarOpen = ref(false)
const notificationDropdownOpen = ref(false)

// Sample notifications data
const notifications = ref([
  { id: 1, message: 'New order #1234 received', time: '5 minutes ago', read: false, orderId: '1234', type: 'order' },
  { id: 2, message: 'Payment confirmed for order #1230', time: '2 hours ago', read: false, orderId: '1230', type: 'order' },
  { id: 3, message: 'Customer feedback received', time: '1 day ago', read: false, orderId: '1001', type: 'order' },
  { id: 4, message: 'System update completed', time: '3 days ago', read: true, orderId: null, type: 'system' }
])

// Toggle notification dropdown
const toggleNotificationDropdown = (event: MouseEvent) => {
  event.stopPropagation() // Prevent the click from being detected by the document click handler
  notificationDropdownOpen.value = !notificationDropdownOpen.value
}

// Close notification dropdown when clicking outside
const closeNotificationDropdown = (event: MouseEvent) => {
  // Check if the click was outside the notification dropdown
  const target = event.target as HTMLElement
  if (!target.closest('.notification-dropdown-container')) {
    notificationDropdownOpen.value = false
  }
}

// Add event listener for click outside
onMounted(() => {
  document.addEventListener('click', closeNotificationDropdown)
})

// Remove event listener when component is unmounted
onUnmounted(() => {
  document.removeEventListener('click', closeNotificationDropdown)
})

// Mark all notifications as read
const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true
  })
}

// Handle notification click
const handleNotificationClick = (notification: any) => {
  // Mark the notification as read
  notification.read = true

  // Close the notification dropdown
  notificationDropdownOpen.value = false

  // Redirect based on notification type
  if (notification.type === 'order' && notification.orderId) {
    // Navigate to the specific order detail page
    router.push(`/orders/${notification.orderId}`)
  }
}

// Toggle sidebar visibility on mobile
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value

  // Prevent scrolling on body when sidebar is open
  if (sidebarOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// Close sidebar when clicking a link on mobile
const closeSidebarOnMobile = () => {
  if (window.innerWidth < 768) { // md breakpoint
    sidebarOpen.value = false
    document.body.style.overflow = ''
  }
}

// Compute the page title based on the current route
const pageTitle = computed(() => {
  const path = route.path
  if (path.includes('/dashboard')) return 'Dashboard'
  if (path.includes('/orders')) return 'Orders'
  if (path.includes('/settings')) return 'Settings'
  if (path.includes('/users')) return 'User Management'
  return 'Dashboard'
})

// Compute the number of unread notifications
const unreadNotificationsCount = computed(() => {
  return notifications.value.filter(notification => !notification.read).length
})

// Logout function
const logout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (err) {
    console.error('Logout error:', err)
  }
}

// This is needed for TypeScript to recognize the component
defineExpose({})
</script>
