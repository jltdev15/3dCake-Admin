<template>
  <DashboardLayout>
    <div>
      <h1 class="text-2xl font-bold mb-4 text-center">Orders</h1>

      <!-- Simple Search -->
      <div class="mb-6 text-center">
        <input
          type="text"
          placeholder="Search orders..."
          class="w-full max-w-md px-4 py-2 border-2 border-gray-300"
          v-model="searchQuery"
        />
      </div>

      <!-- Basic Table -->
      <div class="overflow-x-auto">
        <table class="w-full border-collapse border-2 border-gray-500">
          <thead>
            <tr class="bg-gray-200">
              <th class="border-2 border-gray-500 p-2 text-center">Order ID</th>
              <th class="border-2 border-gray-500 p-2 text-center">Type</th>
              <th class="border-2 border-gray-500 p-2 text-center">Order Date and Time</th>
              <th class="border-2 border-gray-500 p-2 text-center">Status</th>
              <th class="border-2 border-gray-500 p-2 text-center">Total</th>
              <th class="border-2 border-gray-500 p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.orderId" class="hover:bg-gray-100">
              <td class="border-2 border-gray-500 p-2 text-center">#{{ order.orderId }}</td>
              <td class="border-2 border-gray-500 p-2 text-center">{{ order.type }}</td>
              <td class="border-2 border-gray-500 p-2 text-center">{{ formatDate(order.createdAt) }}</td>
              <td class="border-2 border-gray-500 p-2 text-center">
                <span :class="getStatusClass(order.status)">
                  {{ order.status }}
                </span>
              </td>
              <td class="border-2 border-gray-500 p-2 text-center">₱{{ order.totalAmount.toFixed(2) }}</td>
              <td class="border-2 border-gray-500 p-2 text-center">
                <div class="flex justify-center space-x-2">
                  <router-link :to="`/orders/${order.orderId}`" class="bg-blue-500 text-white px-2 py-1">
                    View
                  </router-link>
                  <button 
                    v-if="order.status === 'pending'"
                    @click="updateOrderStatus(order.orderId, 'accepted')"
                    class="bg-green-500 text-white px-2 py-1"
                  >
                    Accept
                  </button>
                  <button 
                    v-if="order.status === 'pending'"
                    @click="updateOrderStatus(order.orderId, 'declined')"
                    class="bg-red-500 text-white px-2 py-1"
                  >
                    Decline
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center mt-4">
        <p>Loading orders...</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="text-center mt-4 text-red-500">
        <p>{{ error }}</p>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useOrderStore } from '../stores/orders'
import type { Order } from '../stores/orders'
import { ref as dbRef, set } from 'firebase/database'
import { database } from '../firebase/config'

const orderStore = useOrderStore()
const searchQuery = ref('')

// Fetch orders when component mounts
onMounted(async () => {
  await orderStore.fetchOrders()
})

// Use storeToRefs to properly handle refs from the store
const { orders, loading, error } = storeToRefs(orderStore)

// Filtered orders based on search
const filteredOrders = computed(() => {
  return orders.value.filter((order: Order) => {
    return searchQuery.value === '' ||
      order.orderId.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      order.type.toLowerCase().includes(searchQuery.value.toLowerCase())
  })
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
      return 'font-bold text-yellow-600'
    case 'accepted':
      return 'font-bold text-green-600'
    case 'declined':
      return 'font-bold text-red-600'
    default:
      return 'font-bold text-gray-600'
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
</script>

