<template>
  <DashboardLayout>
    <div class=" bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <!-- Header Section -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">Orders Management</h1>
            <p class="mt-1 text-sm text-gray-500">Manage and track all customer orders</p>
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
                placeholder="Search orders by ID, name, or email..."
                class="block w-full md:w-96 pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
                v-model="searchQuery"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-100">
              <thead>
                <tr class="bg-gray-50">
                  <th scope="col" class="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th scope="col" class="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th scope="col" class="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Date</th>
               
                  <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-100">
                <tr v-for="order in paginatedOrders" :key="order.orderId" 
                    class="hover:bg-gray-50 transition-colors duration-200">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">#{{ order.orderId }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ order.customerName }}</div>
                    <div class="text-sm text-gray-500">{{ order.customerContact }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ formatDate(order.createdAt) }}</div>
                  </td>

                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="capitalize inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="getStatusClass(order.status)">
                      {{ order.status || 'Pending' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">₱{{ order.total?.toFixed(2) || '0.00' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <div class="flex items-center space-x-2">
                      <router-link 
                        :to="order.items.some(item => item.isCustomCake) ? `/custom-orders/${order.orderId}` : `/orders/${order.orderId}`"
                        class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </router-link>
                      <button 
                        v-if="order.status === 'pending'"
                        @click="updateOrderStatus(order.orderId, 'accepted')"
                        class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Accept
                      </button>
                      <button 
                        v-if="order.status === 'pending'"
                        @click="updateOrderStatus(order.orderId, 'declined')"
                        class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Decline
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="!loading && !error && paginatedOrders.length > 0" 
               class="px-6 py-4 flex items-center justify-between border-t border-gray-100">
            <div class="flex items-center text-sm text-gray-500">
              <span>Showing</span>
              <span class="mx-1 font-medium">{{ paginationStart }}</span>
              <span>to</span>
              <span class="mx-1 font-medium">{{ paginationEnd }}</span>
              <span>of</span>
              <span class="mx-1 font-medium">{{ totalOrders }}</span>
              <span>orders</span>
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

          <!-- Loading State -->
          <div v-if="loading" class="p-8 text-center">
            <div class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading orders...
            </div>
          </div>

          <!-- Error State -->
          <div v-if="error" class="p-8 text-center">
            <div class="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ error }}
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!loading && !error && paginatedOrders.length === 0" class="p-8 text-center">
            <div class="inline-flex flex-col items-center px-4 py-6 text-sm text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p class="font-medium">No orders found</p>
              <p class="text-gray-400 mt-1">Try adjusting your search query</p>
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
import { useOrderStore } from '../stores/orders'
import type { Order } from '../stores/orders'
import { ref as dbRef, set } from 'firebase/database'
import { database } from '../firebase/config'

const orderStore = useOrderStore()
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

// Fetch orders when component mounts
onMounted(async () => {
  await orderStore.fetchOrders()
})

// Use storeToRefs to properly handle refs from the store
const { orders, loading, error } = storeToRefs(orderStore)

// Filtered orders based on search
const filteredOrders = computed(() => {
  return orders.value.filter((order: Order) => {
    if (searchQuery.value === '') return true;
    
    const query = searchQuery.value.toLowerCase();
    return order.orderId.toLowerCase().includes(query) ||
      order.customerName.toLowerCase().includes(query) ||
      order.customerContact.toLowerCase().includes(query) ||
      getOrderType(order).toLowerCase().includes(query);
  })
})

// Pagination computed properties
const totalOrders = computed(() => filteredOrders.value.length)
const totalPages = computed(() => Math.ceil(totalOrders.value / itemsPerPage))

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredOrders.value.slice(start, end)
})

const paginationStart = computed(() => {
  return totalOrders.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage + 1
})

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * itemsPerPage, totalOrders.value)
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

// Function to format date
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Function to get the appropriate CSS class for order status
const getStatusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'accepted':
      return 'bg-green-100 text-green-800'
    case 'declined':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Function to get the appropriate CSS class for pricing status
const getPricingStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'priced':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Function to update order status
const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
  try {
    // First update the order status
    await orderStore.updateOrder(orderId, { status: newStatus })
    
    // Get the order details to access userId
    const order = orders.value.find(o => o.orderId === orderId)
    if (!order) {
      throw new Error('Order not found')
    }

    try {
      // Create notification entry in Firebase
      const notificationRef = dbRef(database, `users/${order.userId}/ordernotification/${orderId}`)
      await set(notificationRef, {
        orderId,
        status: newStatus,
        timestamp: Date.now(),
        message: `Your order #${orderId} has been ${newStatus}`,
        read: false
      })
    } catch (notificationError: any) {
      // Log the notification error but don't fail the whole operation
      console.warn('Failed to create notification:', notificationError)
      // You might want to show a toast or notification to the admin
      // that the order was updated but notification failed
    }
  } catch (e) {
    console.error('Failed to update order status:', e)
    // You might want to show an error message to the user here
  }
}

// Function to get order type label
const getOrderType = (order: Order) => {
  const hasCustomItems = order.items.some(item => item.isCustomCake)
  const hasRegularItems = order.items.some(item => !item.isCustomCake)
  
  if (hasCustomItems && hasRegularItems) {
    return 'Mixed'
  } else if (hasCustomItems) {
    return 'Custom'
  } else if (hasRegularItems) {
    return 'Regular'
  } else {
    return 'Unknown'
  }
}
</script>

