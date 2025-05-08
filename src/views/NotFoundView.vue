<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
      <h1 class="text-6xl font-bold text-red-500 mb-4">404</h1>
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
      <p class="text-gray-600 mb-6">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <router-link 
        to="/" 
        class="inline-block px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        Go Home
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// No additional logic needed for this component
</script>
