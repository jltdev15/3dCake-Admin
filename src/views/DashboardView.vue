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
          <p class="text-3xl font-bold text-gray-800">125</p>
        </div>

        <!-- Number of Customers Card -->
        <div class="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
          <h3 class="text-gray-500 text-sm font-medium mb-2">Number of Customers</h3>
          <p class="text-3xl font-bold text-gray-800">48</p>
        </div>

        <!-- Estimated Revenue Card -->
        <div class="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
          <h3 class="text-gray-500 text-sm font-medium mb-2">Estimated Revenue</h3>
          <p class="text-3xl font-bold text-gray-800">₱12,500</p>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
// Dashboard component script
</script>
