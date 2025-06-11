<template>
  <DashboardLayout>
    <div class=" bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <!-- Dashboard Header -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <h1 class="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
        <p class="mt-1 text-sm text-gray-500">Welcome to your business analytics dashboard</p>
      </div>

      <!-- Dashboard Stats Cards -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Total Orders Card -->
          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Orders</h3>
                <div class="mt-2">
                  <p v-if="loading" class="text-3xl font-bold text-gray-900 animate-pulse">...</p>
                  <p v-else class="text-3xl font-bold text-gray-900">{{ totalOrders }}</p>
                </div>
              </div>
              <div class="p-3 bg-blue-50 rounded-lg">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <div class="mt-4 flex items-center space-x-4 text-sm">
              <div class="flex items-center">
                <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                <span class="text-green-600 font-medium">{{ acceptedOrders }} accepted</span>
              </div>
              <div class="flex items-center">
                <span class="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                <span class="text-red-600 font-medium">{{ declinedOrders }} declined</span>
              </div>
            </div>
          </div>

          <!-- Number of Customers Card -->
          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Customers</h3>
                <div class="mt-2">
                  <p v-if="loading" class="text-3xl font-bold text-gray-900 animate-pulse">...</p>
                  <p v-else class="text-3xl font-bold text-gray-900">{{ totalCustomers }}</p>
                </div>
              </div>
              <div class="p-3 bg-purple-50 rounded-lg">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Total Revenue Card -->
          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Revenue</h3>
                <div class="mt-2">
                  <p v-if="loading" class="text-3xl font-bold text-gray-900 animate-pulse">...</p>
                  <p v-else class="text-3xl font-bold text-gray-900">₱{{ totalRevenue.toLocaleString() }}</p>
                </div>
              </div>
              <div class="p-3 bg-green-50 rounded-lg">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="mt-4 text-sm text-gray-500">
              From accepted orders only
            </div>
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
