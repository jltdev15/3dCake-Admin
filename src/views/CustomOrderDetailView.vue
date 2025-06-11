<template>
  <DashboardLayout>
    <div class="max-w-7xl mx-auto  ">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Custom Order Details</h1>
          <p class="mt-2 text-base text-gray-600">View and manage custom order #{{ orderId }}</p>
        </div>
        <router-link to="/orders"
          class="inline-flex items-center px-5 py-2.5 mt-4 md:mt-0 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Orders
        </router-link>
      </div>

      <!-- Order Details -->
      <div v-if="order" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Order Information -->
        <div class="lg:col-span-1">
          <!-- Order Information Card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-4">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Order Information</h2>
              <div class="space-y-4">
                <div>
                  <div class="bg-gray-50 rounded-lg p-4">
                    <p class="text-sm font-medium text-gray-500">Order Date</p>
                    <p class="text-base font-semibold text-gray-900 mt-1">{{ formatDate(order.createdAt) }}</p>
                  </div>

                </div>
                <div class="bg-gray-50 rounded-lg p-4">

                  <div class="grid ">
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
                  <div class="grid grid-cols-2 gap-4">
                    <div>
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
          </div>
        </div>

        <!-- Right Column: Order Items and Actions -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Custom Order Items Card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-2">
              <div class="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <div v-for="item in order.items" :key="item.id" class="bg-gray-50 rounded-lg p-4">
                  <div class="flex flex-col md:flex-row md:items-start md:space-x-4">
                    <div class="flex-1">
                      <h3 class="text-lg font-semibold text-gray-900">{{ item.name }}</h3>

                      <!-- Standard Cake Details -->
                      <div v-if="!item.isCustomCake" class="mt-2">
                        <div class="bg-white rounded-lg p-3 border border-gray-100">
                          <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-4">
                              <div v-if="item.imageUrl" class="flex-shrink-0">
                                <img :src="item.imageUrl" :alt="item.name" class="w-16 h-16 object-cover rounded-lg">
                              </div>
                              <div class="flex-1 min-w-0">
                                <div class="flex items-center space-x-2">
                                  <p class="text-sm font-medium text-gray-500">ID:</p>
                                  <p class="text-sm font-semibold text-gray-900">#{{ item.cakeId }}</p>
                                  <span class="mx-2 text-gray-300">|</span>
                                  <p class="text-sm font-medium text-gray-500">Qty:</p>
                                  <p class="text-sm font-semibold text-gray-900">{{ item.quantity }}</p>
                                </div>
                                <div class="flex items-center space-x-2 mt-1">
                                  <p class="text-sm font-medium text-gray-500">Unit:</p>
                                  <p class="text-sm font-semibold text-gray-900">₱{{ item.unitPrice?.toFixed(2) }}</p>
                                  <span class="mx-2 text-gray-300">|</span>
                                  <p class="text-sm font-medium text-gray-500">Total:</p>
                                  <p class="text-sm font-semibold text-gray-900">₱{{ item.totalPrice?.toFixed(2) }}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Custom cake details -->
                      <div v-if="item.isCustomCake && item.customDetails" class="mt-2">
                        <!-- Flavor and Layers -->
                        <div class="bg-white rounded-lg p-3 border border-gray-100">
                          <div class="flex flex-col space-y-2">
                            <!-- Single Flavor -->
                            <div v-if="item.customDetails.flavor" class="flex items-center space-x-2">
                              <p class="text-sm font-medium text-gray-500">Flavor:</p>
                              <p class="text-sm font-semibold text-gray-900">{{ item.customDetails.flavor.name }}</p>
                              <span class="mx-2 text-gray-300">|</span>
                              <p class="text-sm text-gray-600">{{ item.customDetails.flavor.description }}</p>
                            </div>

                            <!-- Multiple Layer Flavors -->
                            <div v-if="item.customDetails.layerFlavors && item.customDetails.layerFlavors.length > 0">
                              <div class="flex items-center space-x-2 mb-1">
                                <p class="text-sm font-medium text-gray-500">Layer Flavors:</p>
                                <p class="text-sm font-semibold text-gray-900">({{ item.customDetails.layers ||
                                  item.customDetails.layerFlavors.length }} layers)</p>
                              </div>
                              <div class="space-y-1 pl-2">
                                <div v-for="(layer, index) in getLayerFlavors(item)" :key="index"
                                  class="flex items-center space-x-2 text-sm">
                                  <div v-if="layer?.color" class="w-3 h-3 rounded-full flex-shrink-0"
                                    :style="{ backgroundColor: layer.color }"></div>
                                  <p class="font-semibold text-gray-900">Layer {{ index + 1 }}:</p>
                                  <p class="text-gray-900">{{ layer.name }}</p>
                                  <span class="mx-1 text-gray-300">|</span>
                                  <p class="text-gray-600">{{ layer.description }}</p>
                                </div>
                              </div>
                            </div>

                            <!-- Size -->
                            <div v-if="item.size" class="flex items-center space-x-2">
                              <p class="text-sm font-medium text-gray-500">Size:</p>
                              <p class="text-sm font-semibold text-gray-900">{{ item.size }}</p>
                            </div>

                            <!-- Greeting -->
                            <div v-if="item.customDetails.greeting?.enabled" class="flex items-center space-x-2">
                              <p class="text-sm font-medium text-gray-500">Greeting:</p>
                              <p class="text-sm font-semibold text-gray-900">{{ item.customDetails.greeting.text }}</p>
                              <span class="mx-2 text-gray-300">|</span>
                              <p class="text-sm text-gray-600">Layout: {{ item.customDetails.greeting.layout }}</p>
                            </div>

                            <!-- Message -->
                            <div v-if="item.customDetails.message" class="flex items-center space-x-2">
                              <p class="text-sm font-medium text-gray-500">Message:</p>
                              <p class="text-sm font-semibold text-gray-900 italic">{{ item.customDetails.message }}</p>
                            </div>

                            <!-- 3D Design -->
                            <div v-if="item.customDetails.designData" class="flex items-center justify-between">
                              <p class="text-sm font-medium text-gray-500">3D Design Available</p>
                              <button @click="view3DModel(item.customDetails.designData)"
                                class="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none"
                                  viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5" />
                                </svg>
                                View 3D Model
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Summary Card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-6">
              <div class="flex justify-end">
                <div class="w-full ">
                  <div class="bg-gray-50 rounded-lg p-4">
                    <div class="flex flex-col ">
                      <span class="text-lg font-medium text-gray-900">Total Amount</span>
                      <p class="text-xl font-bold text-gray-900">₱{{ order.total?.toFixed(2) || '0.00' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Actions -->
          <div v-if="order.status.toLowerCase() === 'pending'"
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

      <!-- Loading, Error and Not Found states -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-flex items-center px-6 py-3 text-base font-medium text-gray-600">
          <svg class="animate-spin -ml-1 mr-3 h-6 w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          Loading order details...
        </div>
      </div>

      <div v-if="error" class="text-center py-12">
        <div class="inline-flex items-center px-6 py-3 text-base font-medium text-red-600 bg-red-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ error }}
        </div>
      </div>

      <div v-if="!loading && !error && !order" class="text-center py-12">
        <div class="inline-flex items-center px-6 py-3 text-base font-medium text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24"
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
import { ref, onMounted, computed, watch } from 'vue'
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
const formatDate = (timestamp: string) => {
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


// Add computed property for layer flavors
const getLayerFlavors = computed(() => (item: any) => {
  if (!item.customDetails?.layerFlavors) return []
  
  // Log the layer flavors data for debugging
  console.log('Layer Flavors Data:', {
    allFlavors: item.customDetails.layerFlavors,
    totalLayers: item.customDetails.layers,
    size: item.size
  })
  
  // Ensure we have valid layer flavors data
  const validFlavors = item.customDetails.layerFlavors.filter((layer: any) => layer && layer.name)
  const layerCount = item.customDetails.layers || validFlavors.length
  
  return validFlavors.slice(0, layerCount)
})

// Function to fetch order data
const fetchOrderData = async () => {
  loading.value = true
  error.value = null
  
  try {
    await orderStore.fetchOrders()
    const foundOrder = orders.value.find((o: Order) => o.orderId === orderId.value)
    if (foundOrder) {
      order.value = foundOrder
      console.log('Custom order data updated:', order.value)
    } else {
      console.error('Custom order not found')
    }
  } catch (e) {
    console.error('Error fetching custom order:', e)
    error.value = 'Error loading order details'
  } finally {
    loading.value = false
  }
}

// Watch for route changes
watch(() => route.params.id, (newId) => {
  if (newId) {
    console.log('Route changed, fetching new custom order data for:', newId)
    fetchOrderData()
  }
}, { immediate: true })

// Fetch order data on mount
onMounted(() => {
  console.log('Component mounted, fetching custom order data')
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