<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Email Notification Test</h3>
    
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Test Email Address</label>
        <input
          v-model="testEmail"
          type="email"
          placeholder="test@example.com"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div class="flex space-x-3">
        <button
          @click="testAcceptedEmail"
          :disabled="testing || !testEmail"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Test Accepted Email
        </button>
        
        <button
          @click="testDeclinedEmail"
          :disabled="testing || !testEmail"
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Test Declined Email
        </button>
      </div>
      
      <div v-if="testResult" class="mt-4 p-3 rounded-md" :class="testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'">
        {{ testResult.message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { sendOrderNotification, type OrderEmailData } from '../services/emailService'

const testEmail = ref('')
const testing = ref(false)
const testResult = ref<{ success: boolean; message: string } | null>(null)

const testAcceptedEmail = async () => {
  await sendTestEmail('accepted')
}

const testDeclinedEmail = async () => {
  await sendTestEmail('declined')
}

const sendTestEmail = async (status: 'accepted' | 'declined') => {
  if (!testEmail.value) return
  
  testing.value = true
  testResult.value = null
  
  try {
    const emailData: OrderEmailData = {
      orderId: 'TEST123',
      customerName: 'Test Customer',
      customerEmail: testEmail.value,
      status,
      total: 150.00,
      orderDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      items: [
        {
          name: 'Test Cake',
          quantity: 1,
          unitPrice: 100.00,
          totalPrice: 100.00
        },
        {
          name: 'Test Decoration',
          quantity: 1,
          unitPrice: 50.00,
          totalPrice: 50.00
        }
      ]
    }
    
    const success = await sendOrderNotification(emailData)
    
    if (success) {
      testResult.value = {
        success: true,
        message: `Test ${status} email sent successfully to ${testEmail.value}`
      }
    } else {
      testResult.value = {
        success: false,
        message: `Failed to send test ${status} email. Check your EmailJS configuration.`
      }
    }
  } catch (error) {
    testResult.value = {
      success: false,
      message: `Error sending test email: ${error}`
    }
  } finally {
    testing.value = false
  }
}
</script>
