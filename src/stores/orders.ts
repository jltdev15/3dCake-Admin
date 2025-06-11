import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ref as dbRef, get, update, set, remove } from 'firebase/database'
import { database } from '../firebase/config'
import { auth } from '../firebase/config'

// Types
export interface OrderItem {
  id: string
  cakeId: string
  imageUrl: string
  name: string
  quantity: number
  size: string
  totalPrice: number
  unitPrice: number
  // Indicates whether the item is a custom-made cake
  isCustomCake?: boolean
  // Custom cake properties
  customDetails?: {
    designData?: {
      cakeLayers: any[]
      layerIdCounter: number
    }
    layers?: number
    flavor?: {
      name: string
      description: string
      color: string
    }
    layerFlavors?: Array<{
      name: string
      description: string
      color: string
    }>
    greeting?: {
      enabled: boolean
      text: string
      color: string
      size: number
      depth: number
      layout: string
    }
    message?: string
  }
}

export interface Order {
  id: string
  orderId: string
  createdAt: string
  updatedAt: number
  customerAddress: string
  customerContact: string
  customerName: string
  items: OrderItem[]
  paymentMethod: string
  paymentStatus: string
  status: 'pending' | 'accepted' | 'declined'
  total: number
  userId: string
}

export const useOrderStore = defineStore('orders', () => {
  // State
  const orders = ref<Order[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getPendingOrders = computed(() => {
    return orders.value.filter(order => order.status === 'pending')
  })

  const getCompletedOrders = computed(() => {
    return orders.value.filter(order => order.status === 'accepted')
  })

  const getTotalRevenue = computed(() => {
    return orders.value.filter(order => order.status === 'accepted')
      .reduce((total, order) => total + order.total, 0)
  })

  const getCustomOrders = computed(() => {
    return orders.value.filter(order => order.items.some(item => item.isCustomCake))
  })

  const getRegularOrders = computed(() => {
    return orders.value.filter(order => order.hasRegularItems && !order.hasCustomItems)
  })

  // Actions
  const fetchOrders = async () => {
    loading.value = true
    error.value = null
    try {
      // Check if user is authenticated
      const user = auth.currentUser
      console.log('Current user:', user) // Debug log
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Log the user's token for debugging
      const token = await user.getIdTokenResult()
      console.log('User token:', token) // Debug log

      // Fetch orders from the new structure
      const ordersSnapshot = await get(dbRef(database, 'orders'))
      
      const ordersArray: Order[] = []
      
      if (ordersSnapshot.exists()) {
        const ordersData = ordersSnapshot.val()
        Object.keys(ordersData).forEach(orderId => {
          ordersArray.push({
            ...ordersData[orderId],
            orderId
          })
        })
      }
      
      // Sort orders by createdAt in descending order (newest first)
      ordersArray.sort((a, b) => b.createdAt - a.createdAt)
      
      orders.value = ordersArray
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch orders'
      console.error('Error fetching orders:', e)
    } finally {
      loading.value = false
    }
  }

  const addOrder = async (order: Omit<Order, 'orderId' | 'createdAt' | 'updatedAt'>) => {
    loading.value = true
    error.value = null
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('User not authenticated')
      }

      const timestamp = Date.now()
      const newOrder = {
        ...order,
        orderId: `ord${timestamp.toString().substring(timestamp.toString().length - 6).padStart(6, '0')}`,
        createdAt: timestamp,
        updatedAt: timestamp
      }
      
      const orderRef = dbRef(database, `orders/${newOrder.orderId}`)
      await set(orderRef, newOrder)
      orders.value.push(newOrder)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to add order'
      console.error('Error adding order:', e)
    } finally {
      loading.value = false
    }
  }

  const updateOrder = async (orderId: string, updates: Partial<Order>) => {
    loading.value = true
    error.value = null
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Include the updatedAt timestamp
      const updatedData = {
        ...updates,
        updatedAt: Date.now()
      }

      const orderRef = dbRef(database, `orders/${orderId}`)
      await update(orderRef, updatedData)
      
      const index = orders.value.findIndex(order => order.orderId === orderId)
      if (index !== -1) {
        orders.value[index] = { ...orders.value[index], ...updatedData }
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update order'
      console.error('Error updating order:', e)
    } finally {
      loading.value = false
    }
  }

  const deleteOrder = async (orderId: string) => {
    loading.value = true
    error.value = null
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('User not authenticated')
      }

      const orderRef = dbRef(database, `orders/${orderId}`)
      await remove(orderRef)
      orders.value = orders.value.filter(order => order.orderId !== orderId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete order'
      console.error('Error deleting order:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    orders,
    loading,
    error,
    // Getters
    getPendingOrders,
    getCompletedOrders,
    getTotalRevenue,
    getCustomOrders,
    getRegularOrders,
    // Actions
    fetchOrders,
    addOrder,
    updateOrder,
    deleteOrder
  }
}) 