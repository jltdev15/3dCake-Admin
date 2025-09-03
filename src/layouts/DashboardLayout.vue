<template>
  <div class="min-h-screen bg-gradient-to-r from-[#D3D58E] to-[#FFF7D0] flex flex-col md:flex-row">
    <!-- Mobile Header with Menu Toggle -->
    <div class="md:hidden bg-gradient-to-r from-[#D3D58E] to-[#FFF7D0] p-3 sm:p-4 flex justify-between items-center shadow-sm">
      <div class="flex items-center">
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden shadow-md mr-2 sm:mr-3">
          <img src="/images/logo.jpg" alt="Logo" class="w-full h-full object-cover" />
        </div>
        <h1 class="text-base sm:text-lg font-semibold text-gray-800">Psalm Cakes</h1>
      </div>

      <div class="flex items-center space-x-2 sm:space-x-4">
        <!-- Notification Bell for Mobile -->
        <div class="relative notification-dropdown-container">
          <button @click="toggleNotificationDropdown"
            class="p-1.5 sm:p-2 hover:bg-white/50 rounded-full transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <!-- Notification Badge -->
            <span v-if="unreadNotificationsCount > 0"
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium h-5 w-5 flex items-center justify-center rounded-full ring-2 ring-white">
              {{ unreadNotificationsCount }}
            </span>
          </button>

          <!-- Mobile Notification Dropdown -->
          <div v-if="notificationDropdownOpen"
            class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-100 z-50 transform transition-all duration-200 ease-in-out">
            <div class="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <h3 class="font-semibold text-gray-800">Notifications</h3>
              <button @click="markAllAsRead"
                class="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200">
                Mark all as read
              </button>
            </div>

            <div class="max-h-96 overflow-y-auto">
              <div v-if="notifications.length === 0" class="px-4 py-6 text-center text-gray-500">
                No notifications
              </div>

              <div v-for="notification in notifications" :key="notification.id"
                :class="['px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors duration-200', { 'bg-blue-50': !notification.read }]"
                @click="handleNotificationClick(notification)">
                <div class="flex justify-between items-start">
                  <p class="font-medium text-gray-800">{{ notification.message }}</p>
                  <span v-if="!notification.read" class="h-2 w-2 bg-blue-500 rounded-full mt-2"></span>
                </div>
                <p class="text-sm text-gray-500 mt-1">{{ notification.time }}</p>
              </div>
            </div>
          </div>
        </div>
        <button @click="toggleSidebar" class="p-2 hover:bg-white/50 rounded-full transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Navigation Overlay -->
    <div v-if="sidebarOpen" class="fixed inset-0 z-50 md:hidden">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-gray-900 bg-opacity-50" @click="toggleSidebar"></div>

      <!-- Sidebar -->
      <div
        class="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-r from-[#D3D58E] to-[#FFF7D0] shadow-xl transform transition-transform duration-300 ease-in-out">
        <!-- Mobile header with logo and close button -->
        <div class="p-4 flex justify-between items-center border-b border-gray-200">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-lg overflow-hidden shadow-md mr-3">
              <img src="/images/logo.jpg" alt="Logo" class="w-full h-full object-cover" />
            </div>
            <h1 class="text-lg font-semibold text-gray-800">Psalm Cakes</h1>
          </div>
          <button @click="toggleSidebar" class="p-2 hover:bg-white/50 rounded-full transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="mt-4 flex-grow overflow-y-auto">
          <div class="px-4 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Navigation
          </div>
          <ul class="mt-2">
            <li>
              <router-link to="/dashboard"
                class="flex items-center px-4 py-3 text-gray-700 hover:bg-white/50 transition-colors duration-200"
                :class="{ 'bg-white/70 text-gray-900': $route.path === '/dashboard' }" @click="closeSidebarOnMobile">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </router-link>
            </li>
            <li>
              <router-link to="/orders"
                class="flex items-center px-4 py-3 text-gray-700 hover:bg-white/50 transition-colors duration-200"
                :class="{ 'bg-white/70 text-gray-900': $route.path === '/orders' }" @click="closeSidebarOnMobile">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Orders
              </router-link>
            </li>
            <!-- <li>
              <router-link to="/settings"
                class="flex items-center px-4 py-3 text-gray-700 hover:bg-white/50 transition-colors duration-200"
                :class="{ 'bg-white/70 text-gray-900': $route.path === '/settings' }" @click="closeSidebarOnMobile">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </router-link>
            </li> -->
            <li>
              <router-link to="/users"
                class="flex items-center px-4 py-3 text-gray-700 hover:bg-white/50 transition-colors duration-200"
                :class="{ 'bg-white/70 text-gray-900': $route.path === '/users' }" @click="closeSidebarOnMobile">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                User Management
              </router-link>
            </li>
            <li>
              <router-link to="/messaging"
                class="flex items-center px-4 py-3 text-gray-700 hover:bg-white/50 transition-colors duration-200"
                :class="{ 'bg-white/70 text-gray-900': $route.path === '/messaging' }" @click="closeSidebarOnMobile">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Messaging
                <span v-if="messagingStore.totalUnreadCount > 0" 
                      class="ml-2 bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {{ messagingStore.totalUnreadCount }}
                </span>
              </router-link>
            </li>
          </ul>

          <!-- Logout Button -->
          <div class="p-4 border-t border-gray-200 mt-4">
            <button @click="showLogoutConfirmation"
              class="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </nav>
      </div>
    </div>

    <!-- Desktop Sidebar -->
    <aside
      class="hidden md:flex md:flex-col md:w-80 lg:w-96 bg-gradient-to-r from-[#D3D58E] to-[#FFF7D0] border-r border-gray-200">
      <div class="h-full flex flex-col">
        <!-- Logo section -->
        <div class="p-6 sm:p-8 border-b border-gray-200">
          <div class="flex items-center">
            <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden shadow-md mr-4 sm:mr-5">
              <img src="/images/logo.jpg" alt="Logo" class="w-full h-full object-cover" />
            </div>
            <h1 class="text-2xl sm:text-3xl font-semibold text-gray-800">Psalm Cakes</h1>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-grow px-4 sm:px-6 py-4 sm:py-6">
          <div class="text-base font-semibold text-gray-700 uppercase tracking-wider mb-4 sm:mb-6">
            Navigation
          </div>
          <ul class="space-y-2">
            <li>
              <router-link to="/dashboard"
                class="flex items-center px-4 sm:px-5 py-3 sm:py-4 text-gray-700 rounded-lg hover:bg-white/50 transition-colors duration-200 text-lg"
                :class="{ 'bg-white/70 text-gray-900': $route.path === '/dashboard' }">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-7 sm:w-7 mr-3 sm:mr-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </router-link>
            </li>
            <li>
              <router-link to="/orders"
                class="flex items-center px-4 sm:px-5 py-3 sm:py-4 text-gray-700 rounded-lg hover:bg-white/50 transition-colors duration-200 text-lg"
                :class="{ 'bg-white/70 text-gray-900': $route.path === '/orders' }">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-7 sm:w-7 mr-3 sm:mr-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Orders
              </router-link>
            </li>
            <!-- <li>
              <router-link to="/settings"
                class="flex items-center px-4 sm:px-5 py-3 sm:py-4 text-gray-700 rounded-lg hover:bg-white/50 transition-colors duration-200 text-lg"
                :class="{ 'bg-white/70 text-gray-900': $route.path === '/settings' }">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-7 sm:w-7 mr-3 sm:mr-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </router-link>
            </li> -->
            <li>
              <router-link to="/users"
                class="flex items-center px-4 sm:px-5 py-3 sm:py-4 text-gray-700 rounded-lg hover:bg-white/50 transition-colors duration-200 text-lg"
                :class="{ 'bg-white/70 text-gray-900': $route.path === '/users' }">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-7 sm:w-7 mr-3 sm:mr-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Customers
              </router-link>
            </li>
            <li>
              <router-link to="/messaging"
                class="flex items-center px-4 sm:px-5 py-3 sm:py-4 text-gray-700 rounded-lg hover:bg-white/50 transition-colors duration-200 text-lg"
                :class="{ 'bg-white/70 text-gray-900': $route.path === '/messaging' }">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-7 sm:w-7 mr-3 sm:mr-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Messaging
                <span v-if="messagingStore.totalUnreadCount > 0" 
                      class="ml-2 bg-red-500 text-white text-base font-medium px-3 py-1 rounded-full">
                  {{ messagingStore.totalUnreadCount }}
                </span>
              </router-link>
            </li>
          </ul>
        </nav>

        <!-- Logout Button -->
        <div class="p-6 border-t border-gray-200">
          <button @click="showLogoutConfirmation"
            class="w-full flex items-center justify-center px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 mr-3" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto">
      <!-- Header -->
      <header class="bg-gradient-to-r from-[#D3D58E] to-[#FFF7D0] shadow-sm">
        <div class="px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex justify-between items-center">
          <h1 class="text-lg sm:text-xl font-semibold text-gray-800">
            {{ pageTitle }}
          </h1>

          <!-- User Profile -->
          <div class="flex items-center space-x-2 sm:space-x-4">
            <!-- Notification Bell (hidden on mobile) -->
            <div class="relative notification-dropdown-container hidden md:block">
              <button @click="toggleNotificationDropdown"
                class="p-2 hover:bg-white/50 rounded-full transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <!-- Notification Badge -->
                <span v-if="unreadNotificationsCount > 0"
                  class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium h-5 w-5 flex items-center justify-center rounded-full ring-2 ring-white">
                  {{ unreadNotificationsCount }}
                </span>
              </button>

              <!-- Notification Dropdown -->
              <div v-if="notificationDropdownOpen"
                class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-100 z-50 transform transition-all duration-200 ease-in-out">
                <div class="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <h3 class="font-semibold text-gray-800">Notifications</h3>
                  <button @click="markAllAsRead"
                    class="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200">
                    Mark all as read
                  </button>
                </div>

                <div class="max-h-96 overflow-y-auto">
                  <div v-if="notifications.length === 0" class="px-4 py-6 text-center text-gray-500">
                    No notifications
                  </div>

                  <div v-for="notification in notifications" :key="notification.id"
                    :class="['px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors duration-200', { 'bg-blue-50': !notification.read }]"
                    @click="handleNotificationClick(notification)">
                    <div class="flex justify-between items-start">
                      <p class="font-medium text-gray-800">{{ notification.message }}</p>
                      <span v-if="!notification.read" class="h-2 w-2 bg-blue-500 rounded-full mt-2"></span>
                    </div>
                    <p class="text-sm text-gray-500 mt-1">{{ notification.time }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex items-center">
              <span class="text-gray-700 font-medium mr-2 sm:mr-3 hidden sm:inline">Admin User</span>
              <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <div class="h-full p-2 sm:p-3 md:p-4">
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4 md:p-6">
          <slot></slot>
        </div>
      </div>
    </main>
  </div>

  <!-- Logout Confirmation Modal -->
  <div v-if="showLogoutModal" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-gray-500/50 bg-opacity-50" @click="cancelLogout"></div>
    
    <!-- Modal -->
    <div class="relative bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h3 class="text-lg font-medium text-gray-900 mb-2">Confirm Logout</h3>
        <p class="text-sm text-gray-500 mb-6">Are you sure you want to logout? You will need to login again to access the admin panel.</p>
        
        <div class="flex space-x-3">
          <button @click="cancelLogout" 
                  class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200">
            Cancel
          </button>
          <button @click="confirmLogout" 
                  class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200">
            Logout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useMessagingStore } from '../stores/messaging'
import { ref as dbRef, onValue, off, update, get } from 'firebase/database'
import { database } from '../firebase/config'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const messagingStore = useMessagingStore()
const sidebarOpen = ref(false)
const notificationDropdownOpen = ref(false)
const showLogoutModal = ref(false)

// Notification state
const notifications = ref<any[]>([])
const unreadNotificationsCount = ref(0)

// Function to format timestamp to relative time
const formatTime = (timestamp: number) => {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}

// Function to fetch notifications
const fetchNotifications = () => {
  const notificationsRef = dbRef(database, 'admin_notifications')
  
  onValue(notificationsRef, (snapshot) => {
    const data = snapshot.val()
    if (data) {
      // Convert object to array and sort by timestamp
      const notificationsArray = Object.entries(data).map(([id, notification]: [string, any]) => ({
        id,
        ...notification,
        time: formatTime(new Date(notification.timestamp).getTime())
      })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      notifications.value = notificationsArray
      unreadNotificationsCount.value = notificationsArray.filter(n => !n.read).length
    } else {
      notifications.value = []
      unreadNotificationsCount.value = 0
    }
  })
}

// Function to mark notification as read
const markNotificationAsRead = async (notificationId: string) => {
  try {
    const notificationRef = dbRef(database, `admin_notifications/${notificationId}`)
    await update(notificationRef, { read: true })
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

// Function to mark all notifications as read
const markAllAsRead = async () => {
  try {
    const updates: { [key: string]: boolean } = {}
    notifications.value.forEach(notification => {
      if (!notification.read) {
        updates[`admin_notifications/${notification.id}/read`] = true
      }
    })
    await update(dbRef(database), updates)
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
  }
}

// Function to handle notification click
const handleNotificationClick = async (notification: any) => {
  if (!notification.read) {
    await markNotificationAsRead(notification.id)
  }
  
  // Navigate to the appropriate order detail page
  if (notification.orderId) {
    // First fetch the order to determine its type
    try {
      const orderRef = dbRef(database, `orders/${notification.orderId}`)
      const snapshot = await get(orderRef)
      const orderData = snapshot.val()
      
      if (orderData) {
        // Determine order type based on hasCustomItems and hasRegularItems
        if (orderData.items.some((item: any) => item.isCustomCake)) {
          // Pure custom order
          router.push(`/custom-orders/${notification.orderId}`)
        } else {
          // Regular order or mixed order (both custom and regular items)
          router.push(`/orders/${notification.orderId}`)
        }
      } else {
        console.error('Order not found')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    }
  }
  
  notificationDropdownOpen.value = false
}

// Toggle notification dropdown
const toggleNotificationDropdown = () => {
  notificationDropdownOpen.value = !notificationDropdownOpen.value
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
  if (path.includes('/messaging')) return 'Messaging'
  return 'Dashboard'
})

// Setup and cleanup
onMounted(() => {
  fetchNotifications()
  
  // Initialize message listener when component mounts and user is authenticated
  if (authStore.isAuthenticated) {
    messagingStore.initMessageListener()
  }
})

// Watch for auth changes to initialize/remove message listener
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated) {
    messagingStore.initMessageListener()
  }
})

onUnmounted(() => {
  // Cleanup Firebase listeners
  const notificationsRef = dbRef(database, 'admin_notifications')
  off(notificationsRef)
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

// Show logout confirmation modal
const showLogoutConfirmation = () => {
  showLogoutModal.value = true
}

// Confirm logout
const confirmLogout = async () => {
  showLogoutModal.value = false
  await logout()
}

// Cancel logout
const cancelLogout = () => {
  showLogoutModal.value = false
}

// This is needed for TypeScript to recognize the component
defineExpose({})
</script>
