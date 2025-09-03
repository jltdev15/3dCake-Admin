<template>
  <DashboardLayout>
    <div>
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-800">Order Details</h1>
          <p class="mt-1 text-sm text-gray-600">View and manage order #{{ orderId }}</p>
        </div>
        <router-link to="/orders"
          class="inline-flex items-center px-4 py-2 mt-4 md:mt-0 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Orders
        </router-link>
      </div>

      <!-- Order Details -->
      <div v-if="order" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Order Information -->
        <div class="lg:col-span-1">
          <!-- Order Information Card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-4">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Order Information</h2>
              <div class="space-y-4">
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="text-sm font-medium text-gray-500">Order Date</p>
                  <p class="text-base font-semibold text-gray-900 mt-1">{{ formatDate(order.createdAt) }}</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-4">

                  <div class="grid">
                    <div>
                      <p class="text-sm font-medium text-gray-500">Order ID</p>
                      <p class="text-base font-semibold text-gray-900 mt-1">#{{ order.orderId }}</p>
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="text-sm font-medium text-gray-500">Customer Name</p>
                  <p class="text-base font-semibold text-gray-900 mt-1">{{ order.customerName }}</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="text-sm font-medium text-gray-500">Customer Contact</p>
                  <p class="text-base font-semibold text-gray-900 mt-1">{{ order.customerContact }}</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="text-sm font-medium text-gray-500">Customer Address</p>
                  <p class="text-base font-semibold text-gray-900 mt-1">{{ order.customerAddress }}</p>
                </div>

                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="text-sm font-medium text-gray-500">Status</p>
                  <span :class="[
                    'inline-flex items-center px-3 py-1 mt-1 rounded-full text-sm font-medium capitalize',
                    getStatusClass(order.status)
                  ]">
                    {{ order.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Order Items -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Order Items Card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="">
              <div class="grid grid-cols-1 gap-1 max-h-[400px] overflow-y-auto p-4 custom-scrollbar">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">Cake Information</h2>
                <div v-for="item in order.items" :key="item.id" class="bg-gray-50 rounded-lg p-4">
                  <div class="flex items-center space-x-4">
                    <div v-if="item.imageUrl" class="flex-shrink-0">
                      <img :src="item.imageUrl" :alt="item.name" class="w-16 h-16 object-cover rounded-lg">
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="text-base font-semibold text-gray-900">{{ item.name }}</h3>
                      <div class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <div class="flex items-center space-x-2">
                          <p class="text-sm font-medium text-gray-500">ID:</p>
                          <p class="text-sm font-semibold text-gray-900">#{{ item.cakeId }}</p>
                        </div>
                        <span class="text-gray-300">|</span>
                        <div class="flex items-center space-x-2">
                          <p class="text-sm font-medium text-gray-500">Size:</p>
                          <p class="text-sm font-semibold text-gray-900">{{ item.size || 'Standard' }}</p>
                        </div>
                        <span class="text-gray-300">|</span>
                        <div class="flex items-center space-x-2">
                          <p class="text-sm font-medium text-gray-500">Qty:</p>
                          <p class="text-sm font-semibold text-gray-900">{{ item.quantity }}</p>
                        </div>
                        <span class="text-gray-300">|</span>
                        <div class="flex items-center space-x-2">
                          <p class="text-sm font-medium text-gray-500">Unit:</p>
                          <p class="text-sm font-semibold text-gray-900">₱{{ item.unitPrice.toFixed(2) }}</p>
                        </div>
                        <span class="text-gray-300">|</span>
                        <div class="flex items-center space-x-2">
                          <p class="text-sm font-medium text-gray-500">Total:</p>
                          <p class="text-sm font-semibold text-gray-900">₱{{ (item.unitPrice * item.quantity).toFixed(2)
                            }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Summary Card -->
          <div class="bg-white mt-auto rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-6">
              <div class="flex justify-end">
                <div class="w-full">
                  <div class="bg-gray-50 rounded-lg p-4">
                    <div class="flex flex-col">
                      <span class="text-lg font-medium text-gray-900">Total Amount</span>
                      <p class="text-2xl font-bold text-gray-900">₱{{ order.total?.toFixed(2) || '0.00' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Actions -->
          <div v-if="order?.status.toLowerCase() === 'pending'"
            class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-6">
              <div class="flex justify-between items-center">
                <h2 class="text-lg font-semibold text-gray-900">Actions</h2>
                <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <button @click="updateOrderStatus('accepted')"
                    class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Accept Order
                  </button>
                  <button @click="updateOrderStatus('declined')"
                    class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Decline Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useOrderStore } from '../stores/orders'
import type { Order } from '../stores/orders'
import { ref as dbRef, set } from 'firebase/database'
import { database } from '../firebase/config'

const route = useRoute()
const orderStore = useOrderStore()
const { orders } = storeToRefs(orderStore)
const orderId = computed(() => route.params.id as string)
const order = ref<Order | null>(null)

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

// Function to update order status
const updateOrderStatus = async (newStatus: 'accepted' | 'declined') => {
  if (!order.value) return
  
  try {
    // First update the order status
    await orderStore.updateOrder(order.value.orderId, { status: newStatus })
    order.value.status = newStatus

    try {
      // Create notification entry in Firebase
      const notificationRef = dbRef(database, `users/${order.value.userId}/ordernotification/${order.value.orderId}`)
      await set(notificationRef, {
        orderId: order.value.orderId,
        status: newStatus,
        timestamp: Date.now(),
        message: `Your order #${order.value.orderId} has been ${newStatus}`,
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

// Function to fetch order data
const fetchOrderData = async () => {
  try {
    await orderStore.fetchOrders()
    const foundOrder = orders.value.find((o: Order) => o.orderId === orderId.value)
    if (foundOrder) {
      order.value = foundOrder
      console.log('Order data updated:', order.value)
    } else {
      console.error('Order not found')
    }
  } catch (e) {
    console.error('Error fetching order:', e)
  }
}

// Watch for route changes
watch(() => route.params.id, (newId) => {
  if (newId) {
    console.log('Route changed, fetching new order data for:', newId)
    fetchOrderData()
  }
}, { immediate: true })

// Fetch order data on mount
onMounted(() => {
  console.log('Component mounted, fetching order data')
  fetchOrderData()
})
</script>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #CBD5E0 #F3F4F6;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #F3F4F6;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #CBD5E0;
  border-radius: 4px;
  border: 2px solid #F3F4F6;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #9CA3AF;
}
</style>
