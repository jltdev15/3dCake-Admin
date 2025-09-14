<template>
  <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Background overlay -->
    <div class="fixed inset-0 bg-black/20 backdrop-blur-sm" @click="handleCancel"></div>

    <!-- Modal -->
    <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
      <!-- Header -->
      <div class="p-6 text-center">
        <!-- Icon -->
        <div class="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4" :class="iconBgClass">
          <!-- Check Icon for Accept -->
          <svg v-if="iconComponent === 'CheckIcon'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          
          <!-- X Mark Icon for Decline -->
          <svg v-else-if="iconComponent === 'XMarkIcon'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <!-- Title -->
        <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ title }}</h3>
        
        <!-- Message -->
        <p class="text-gray-600 mb-4">{{ message }}</p>

        <!-- Order Info -->
        <div v-if="orderDetails" class="bg-gray-50 rounded-lg p-4 mb-4 text-left">
          <div class="text-sm space-y-1">
            <div class="flex justify-between">
              <span class="text-gray-500">Order:</span>
              <span class="font-medium">{{ orderDetails.orderId }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Customer:</span>
              <span class="font-medium">{{ orderDetails.customerName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Total:</span>
              <span class="font-semibold">₱{{ orderDetails.total.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Warning -->
        <p class="text-sm text-blue-600 mb-6">
          <svg class="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          Customer will be notified via email
        </p>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 px-6 pb-6">
        <button
          @click="handleCancel"
          class="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleConfirm"
          class="flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors"
          :class="confirmButtonClass"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface OrderDetails {
  orderId: string
  customerName: string
  total: number
}

interface Props {
  isVisible: boolean
  type: 'accept' | 'decline'
  title: string
  message: string
  orderDetails?: OrderDetails
  confirmText?: string
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm'
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

// Computed properties for styling based on type
const iconComponent = computed(() => {
  return props.type === 'accept' ? 'CheckIcon' : 'XMarkIcon'
})

const iconClass = computed(() => {
  return props.type === 'accept' ? 'text-green-600' : 'text-red-600'
})

const iconBgClass = computed(() => {
  return props.type === 'accept' ? 'bg-green-100' : 'bg-red-100'
})

const confirmButtonClass = computed(() => {
  return props.type === 'accept' 
    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}
</script>