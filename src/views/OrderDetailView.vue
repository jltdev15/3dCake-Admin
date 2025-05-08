<template>
  <DashboardLayout>
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-center">Order #{{ orderId }}</h1>
        <router-link to="/orders" class="bg-blue-500 text-white px-4 py-2">
          Back to Orders
        </router-link>
      </div>

      <!-- Order Details -->
      <div v-if="order" class="border-2 border-gray-500 p-4 mb-6">
        <h2 class="text-xl font-bold mb-4 bg-gray-200 p-2 border-2 border-gray-500">Order Information</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="border-2 border-gray-500 p-2">
            <p class="font-bold">Order ID: <span class="font-normal">#{{ order.orderId }}</span></p>
          </div>
          <div class="border-2 border-gray-500 p-2">
            <p class="font-bold">Customer Name: <span class="font-normal">{{ order.customerName }}</span></p>
          </div>
          <div class="border-2 border-gray-500 p-2">
            <p class="font-bold">Date: <span class="font-normal">{{ formatDate(order.createdAt) }}</span></p>
          </div>
          <div class="border-2 border-gray-500 p-2">
            <p class="font-bold">Type: <span class="font-normal">{{ order.type }}</span></p>
          </div>
          <div class="border-2 border-gray-500 p-2">
            <p class="font-bold">Status:
              <span :class="getStatusClass(order.status)">{{ order.status }}</span>
            </p>
          </div>
        </div>

        <h2 class="text-xl font-bold mb-4 bg-gray-200 p-2 border-2 border-gray-500">Order Items</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div v-for="item in order.items" :key="item.id" class="border-2 border-gray-500 p-4">
            <div class="flex items-center space-x-4">
              <img :src="item.imageUrl" :alt="item.name" class="w-24 h-24 object-cover rounded-lg">
              <div class="flex-1">
                <h3 class="font-bold text-lg">{{ item.name }}</h3>
                <p class="text-gray-600">Cake ID: {{ item.cakeId }}</p>
                <p class="text-gray-600">Size: {{ item.size || 'Standard' }}</p>
                <div class="flex justify-between items-center mt-2">
                  <div>
                    <p class="text-gray-600">Quantity: {{ item.quantity }}</p>
                    <p class="text-gray-600">Unit Price: ₱{{ item.unitPrice.toFixed(2) }}</p>
                  </div>
                  <p class="font-bold text-lg">₱{{ item.totalPrice.toFixed(2) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <div class="border-2 border-gray-500 p-4 bg-gray-100 w-full md:w-1/3">
            <div class="flex justify-between font-bold text-lg border-t-2 border-gray-500 pt-2">
              <span>Total Amount:</span>
              <span>₱{{ order.totalAmount.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Actions -->
      <div v-if="order?.status.toLowerCase() === 'pending'" class="border-2 border-gray-500 p-4 bg-gray-100">
        <h2 class="text-xl font-bold mb-4">Actions</h2>
        <div class="flex space-x-4">
          <button 
            @click="updateOrderStatus('accepted')"
            class="bg-green-500 text-white px-4 py-2 font-bold hover:bg-green-600"
          >
            ACCEPT ORDER
          </button>
          <button 
            @click="updateOrderStatus('declined')"
            class="bg-red-500 text-white px-4 py-2 font-bold hover:bg-red-600"
          >
            DECLINE ORDER
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useOrderStore } from '../stores/orders'
import type { Order } from '../stores/orders'

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
const updateOrderStatus = async (newStatus: 'accepted' | 'declined') => {
  if (!order.value) return
  
  try {
    await orderStore.updateOrder(order.value.orderId, { status: newStatus })
    order.value.status = newStatus
  } catch (e) {
    console.error('Failed to update order status:', e)
  }
}

// Fetch order data
onMounted(async () => {
  try {
    await orderStore.fetchOrders()
    const foundOrder = orders.value.find((o: Order) => o.orderId === orderId.value)
    if (foundOrder) {
      order.value = foundOrder
    } else {
      console.error('Order not found')
    }
  } catch (e) {
    console.error('Error fetching order:', e)
  }
})
</script>
