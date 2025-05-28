<template>
  <DashboardLayout>
    <div>
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-800">Custom Order Details</h1>
          <p class="mt-1 text-sm text-gray-600">View and manage custom order #{{ orderId }}</p>
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
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-4">
              <h2 class="text-lg font-medium text-gray-900 mb-3">Order Information</h2>
              <div class="space-y-2">
                <div class="bg-gray-50 rounded-lg p-3">
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <p class="text-xs font-medium text-gray-500">Order ID</p>
                      <p class="text-sm font-semibold text-gray-900">#{{ order.orderId }}</p>
                    </div>
                    <div>
                      <p class="text-xs font-medium text-gray-500">Date</p>
                      <p class="text-sm font-semibold text-gray-900">{{ formatDate(order.createdAt) }}</p>
                    </div>
                  </div>
                </div>

                <div class="bg-gray-50 rounded-lg p-3">
                  <p class="text-xs font-medium text-gray-500">Customer Name</p>
                  <p class="text-sm font-semibold text-gray-900">{{ order.customerName }}</p>
                </div>

                <div class="bg-gray-50 rounded-lg p-3">
                  <p class="text-xs font-medium text-gray-500">Customer Email</p>
                  <p class="text-sm font-semibold text-gray-900">{{ order.customerEmail }}</p>
                </div>

                <div class="bg-gray-50 rounded-lg p-3">
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <p class="text-xs font-medium text-gray-500">Order Type</p>
                      <p class="text-sm font-semibold text-gray-900">{{ getOrderType(order) }}</p>
                    </div>
                    <div>
                      <p class="text-xs font-medium text-gray-500">Status</p>
                      <span :class="[
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        getStatusClass(order.status)
                      ]">
                        {{ order.status }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="bg-gray-50 rounded-lg p-3">
                  <p class="text-xs font-medium text-gray-500">Pricing Status</p>
                  <span :class="[
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    getPricingStatusClass(order.pricingStatus || 'pending')
                  ]">
                    {{ order.pricingStatus || 'pending' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Order Items and Actions -->
        <div class="lg:col-span-2 space-y-4">
          <!-- Custom Order Items Card -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-4">
              <h2 class="text-lg font-medium text-gray-900 mb-3">Custom Cake Items</h2>
              <div class="grid grid-cols-1 gap-3">
                <div v-for="item in order.items" :key="item.id" class="bg-gray-50 rounded-lg p-3">
                  <div class="flex flex-col md:flex-row md:items-start md:space-x-3">
                    <div class="flex-1">
                      <h3 class="font-medium text-gray-900">{{ item.name || 'Custom Cake' }}</h3>

                      <!-- Custom cake details -->
                      <div v-if="item.customDetails" class="mt-3 space-y-2">


                        <!-- Flavor and Layers -->
                        <div class="bg-gray-50 rounded-lg p-3">
                          <div class="grid grid-cols-2 gap-2">
                            <div v-if="item.customDetails.flavor" class="text-xs">
                              <p class="text-xs font-medium text-gray-500">Flavor</p>
                              <p class="text-sm font-semibold text-gray-900">{{ item.customDetails.flavor.name }}</p>
                              <p class="text-xs text-gray-600">{{ item.customDetails.flavor.description }}</p>
                            </div>

                            <div v-if="item.customDetails.layers" class="text-xs">
                              <p class="text-xs font-medium text-gray-500">Layers</p>
                              <p class="text-sm font-semibold text-gray-900">{{ item.customDetails.layers }}</p>
                              <div v-if="item.size" class="text-xs">
                                <p class="text-xs font-medium text-gray-500">Size</p>
                                <p class="text-sm font-semibold text-gray-900">{{ item.size }}</p>
                              </div>
                            </div>

                          </div>
                        </div>

                        <!-- Greeting -->
                        <div v-if="item.customDetails.greeting?.enabled" class="bg-gray-50 rounded-lg p-3">
                          <p class="text-xs font-medium text-gray-500">Greeting</p>
                          <p class="text-sm font-semibold text-gray-900">{{ item.customDetails.greeting.text }}</p>
                          <p class="text-xs text-gray-600">Layout: {{ item.customDetails.greeting.layout }}</p>
                        </div>

                        <!-- Message -->
                        <div v-if="item.customDetails.message" class="bg-gray-50 rounded-lg p-3">
                          <p class="text-xs font-medium text-gray-500">Message</p>
                          <p class="text-sm font-semibold text-gray-900 italic">{{ item.customDetails.message }}</p>
                        </div>

                        <!-- 3D Design -->
                        <div v-if="item.customDetails.designData" class="bg-gray-50 rounded-lg p-3">
                          <p class="text-xs font-medium text-gray-500">3D Design</p>
                          <div class="flex justify-between items-center mt-1">
                            <p class="text-sm font-semibold text-gray-900">Design Available</p>
                            <button @click="view3DModel(item.customDetails.designData)"
                              class="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5" />
                              </svg>
                              View 3D Model
                            </button>
                          </div>
                        </div>
                      </div>

                      <!-- Pricing section -->
                      <div class="mt-3 pt-2 border-t border-gray-200">
                        <div v-if="order.needsPricing" class="flex justify-between items-center">
                          <span class="text-xs font-medium text-gray-500">Price:</span>
                          <div class="flex items-center space-x-2">
                            <input type="number" placeholder="Enter price"
                              class="w-24 px-2 py-1 text-xs border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              v-model="itemPrice">
                            <button @click="setPrice" :disabled="pricingInProgress"
                              class="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                              <svg v-if="pricingInProgress" class="animate-spin -ml-0.5 mr-1.5 h-3 w-3 text-white"
                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                  stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                              </svg>
                              {{ pricingInProgress ? 'Setting...' : 'Set Price' }}
                            </button>
                            <div v-if="successMessage" class="ml-2 text-xs text-green-600 font-medium">
                              {{ successMessage }}
                            </div>
                          </div>
                        </div>
                        <div v-else>
                          <p class="text-base font-semibold text-gray-900">₱{{ item.totalPrice?.toFixed(2) || '0.00' }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Summary Card -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-4">
              <div class="flex justify-end">
                <div class="w-full md:w-1/3">
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="flex justify-between items-center">
                      <span class="text-base font-medium text-gray-900">Total Amount</span>
                      <span v-if="order.needsPricing" class="text-sm font-medium text-yellow-600">Needs Pricing</span>
                      <span v-else class="text-lg font-semibold text-gray-900">₱{{ order.totalAmount?.toFixed(2) ||
                        '0.00' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Actions -->
          <div v-if="order.status.toLowerCase() === 'pending'"
            class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-4">
              <div class="flex justify-between items-center">
                <h2 class="text-base font-medium text-gray-900">Actions</h2>
                <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button v-if="!order.needsPricing" @click="updateOrderStatus('accepted')"
                    class="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Accept Order
                  </button>
                  <button @click="updateOrderStatus('declined')"
                    class="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
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

      <!-- Loading, Error and Not Found states -->
      <div v-if="loading" class="text-center py-8">
        <div class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          Loading order details...
        </div>
      </div>

      <div v-if="error" class="text-center py-8">
        <div class="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ error }}
        </div>
      </div>

      <div v-if="!loading && !error && !order" class="text-center py-8">
        <div class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Order not found
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useOrderStore } from '../stores/orders'
import type { Order } from '../stores/orders'
import { ref as dbRef, set } from 'firebase/database'
import { database } from '../firebase/config'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const { orders } = storeToRefs(orderStore)
const orderId = computed(() => route.params.id as string)
const order = ref<Order | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const itemPrice = ref<number | null>(null)
const pricingInProgress = ref(false)
const successMessage = ref<string | null>(null)

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
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Function to determine order type
const getOrderType = (order: Order) => {
  if (order.hasCustomItems && order.hasRegularItems) {
    return 'Mixed (Custom & Regular)'
  } else if (order.hasCustomItems) {
    return 'Custom'
  } else if (order.hasRegularItems) {
    return 'Regular'
  } else {
    return 'Unknown'
  }
}

// Function to view 3D model
const view3DModel = (designData: any) => {
  if (!order.value) return;
  
  // Instead of storing in localStorage, pass as router query params
  router.push({
    path: '/3dcakeviewer', 
    query: { 
      orderId: order.value.orderId,
      designId: 'custom'
    }
  });
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
      console.warn('Failed to create notification:', notificationError)
    }
  } catch (e) {
    console.error('Failed to update order status:', e)
    error.value = 'Failed to update order status'
  }
}

// Function to set price for custom order
const setPrice = async () => {
  if (!order.value) {
    error.value = 'Order not found'
    return
  }
  
  // Validate price input
  if (!itemPrice.value || itemPrice.value <= 0) {
    error.value = 'Please enter a valid price amount'
    setTimeout(() => {
      error.value = null
    }, 3000)
    return
  }
  
  // Set loading state for the button
  pricingInProgress.value = true
  
  try {
    // Type the updatedOrder properly to include items
    const updatedOrder: Partial<Order> = {
      totalAmount: itemPrice.value,
      needsPricing: false,
      pricingStatus: 'completed' as const
    }
    
    // Update items with price too
    if (order.value.items && order.value.items.length > 0) {
      // We're updating all items to have the same total price
      const pricePerItem = itemPrice.value / order.value.items.length
      
      // Create items with updated prices
      const updatedItems = order.value.items.map(item => ({
        ...item,
        totalPrice: pricePerItem
      }))
      
      // Add updated items to our order update
      updatedOrder.items = updatedItems
    }
    
    await orderStore.updateOrder(order.value.orderId, updatedOrder)
    
    // Update local order state
    order.value = {
      ...order.value,
      ...updatedOrder
    }
    
    // Create notification for pricing
    try {
      const notificationRef = dbRef(database, `users/${order.value.userId}/ordernotification/${order.value.orderId}_pricing`)
      await set(notificationRef, {
        orderId: order.value.orderId,
        status: 'priced',
        timestamp: Date.now(),
        message: `Your custom order #${order.value.orderId} has been priced at ₱${itemPrice.value.toFixed(2)}`,
        read: false
      })
      
      // Show success message
      successMessage.value = 'Price set successfully!'
      setTimeout(() => {
        successMessage.value = null
      }, 3000)
      
      console.log('Price set and notification sent successfully')
    } catch (notificationError: any) {
      console.warn('Failed to create pricing notification:', notificationError)
    }
    
  } catch (e) {
    console.error('Failed to set price:', e)
    error.value = 'Failed to set price for this order'
  } finally {
    pricingInProgress.value = false
  }
}

// Fetch order data
onMounted(async () => {
  loading.value = true
  error.value = null
  
  try {
    await orderStore.fetchOrders()
    const foundOrder = orders.value.find((o: Order) => o.orderId === orderId.value)
    
    if (foundOrder) {
      order.value = foundOrder
      console.log('Found order:', order.value)
      
      // Set initial price if already priced
      if (!foundOrder.needsPricing && foundOrder.totalAmount) {
        itemPrice.value = foundOrder.totalAmount
      }
    } else {
      error.value = 'Order not found'
    }
  } catch (e) {
    console.error('Error fetching order:', e)
    error.value = 'Error loading order details'
  } finally {
    loading.value = false
  }
})
</script> 