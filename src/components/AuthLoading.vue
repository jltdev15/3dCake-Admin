<template>
  <div v-if="loading" class="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="text-center">
      <div class="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const loading = computed(() => authStore.initialLoading)
</script> 