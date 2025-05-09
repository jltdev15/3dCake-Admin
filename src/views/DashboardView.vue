<template>
  <DashboardLayout>
    <div>
      <!-- Dashboard Header -->
      <h1 class="text-2xl font-bold mb-6 text-center">Dashboard</h1>

      <!-- Dashboard Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
        <!-- Total Orders Card -->
        <div class="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
          <h3 class="text-gray-500 text-sm font-medium mb-2">Total Orders</h3>
          <p v-if="loading" class="text-3xl font-bold text-gray-800">Loading...</p>
          <p v-else class="text-3xl font-bold text-gray-800">{{ totalOrders }}</p>
          <div class="mt-2 text-sm text-gray-600">
            <span class="text-green-600">{{ acceptedOrders }} accepted</span>
            <span class="mx-2">•</span>
            <span class="text-red-600">{{ declinedOrders }} declined</span>
          </div>
        </div>

        <!-- Number of Customers Card -->
        <div class="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
          <h3 class="text-gray-500 text-sm font-medium mb-2">Number of Customers</h3>
          <p v-if="loading" class="text-3xl font-bold text-gray-800">Loading...</p>
          <p v-else class="text-3xl font-bold text-gray-800">{{ totalCustomers }}</p>
        </div>

        <!-- Estimated Revenue Card -->
        <div class="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
          <h3 class="text-gray-500 text-sm font-medium mb-2">Total Revenue</h3>
          <p v-if="loading" class="text-3xl font-bold text-gray-800">Loading...</p>
          <p v-else class="text-3xl font-bold text-gray-800">₱{{ totalRevenue.toLocaleString() }}</p>
          <div class="mt-2 text-sm text-gray-600">
            From accepted orders only
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../stores/dashboard'

const dashboardStore = useDashboardStore()
const { totalOrders, totalCustomers, totalRevenue, acceptedOrders, declinedOrders, loading, error } = storeToRefs(dashboardStore)

onMounted(() => {
  dashboardStore.fetchDashboardStats()
})
</script>
