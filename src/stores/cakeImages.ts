import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Types
export interface CakeImage {
  id: string
  name: string
  category: 'birthdays' | 'weddings' | 'custom'
  imageUrl: string
  thumbnailUrl: string
}

export const useCakeImageStore = defineStore('cakeImages', () => {
  // State
  const cakeImages = ref<CakeImage[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getImagesByCategory = computed(() => {
    return (category: 'birthdays' | 'weddings' | 'custom') => {
      return cakeImages.value.filter(image => image.category === category)
    }
  })

  const getImageById = computed(() => {
    return (id: string) => {
      return cakeImages.value.find(image => image.id === id)
    }
  })

  // Actions
  const fetchCakeImages = async () => {
    loading.value = true
    error.value = null
    try {
      // Since images are static, we'll initialize with predefined paths
      cakeImages.value = [
        {
          id: '1',
          name: 'Cocomelon',
          category: 'birthdays',
          imageUrl: '/birthdays/1.png',
          thumbnailUrl: '/birthdays/thumbnails/1.png'
        },
        {
          id: '2',
          name: 'One Piece',
          category: 'birthdays',
          imageUrl: '/birthdays/2.png',
          thumbnailUrl: '/birthdays/thumbnails/2.png'
        },
        // Add more cake images here
      ]
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch cake images'
    } finally {
      loading.value = false
    }
  }

  const getImagePath = (imageUrl: string) => {
    // Helper function to get the full path of an image
    return imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
  }

  const getThumbnailPath = (thumbnailUrl: string) => {
    // Helper function to get the full path of a thumbnail
    return thumbnailUrl.startsWith('/') ? thumbnailUrl : `/${thumbnailUrl}`
  }

  return {
    // State
    cakeImages,
    loading,
    error,
    // Getters
    getImagesByCategory,
    getImageById,
    // Actions
    fetchCakeImages,
    getImagePath,
    getThumbnailPath
  }
}) 