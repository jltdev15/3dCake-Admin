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
  orderId: string
  type: 'non-custom' | 'custom'
  status: 'pending' | 'accepted' | 'declined'
  totalAmount: number
  userId: string
  customerName: string
  createdAt: number
  items: OrderItem[]
  // Custom order specific fields
  needsPricing?: boolean
  pricingStatus?: 'pending' | 'priced' | 'rejected'
  customerEmail?: string
  updatedAt?: number
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
    return orders.value.reduce((total, order) => {
      return order.status === 'accepted' ? total + order.totalAmount : total
    }, 0)
  })

  const getOrdersByType = computed(() => {
    return (type: 'non-custom' | 'custom') => {
      return orders.value.filter(order => order.type === type)
    }
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

      // Fetch both custom and non-custom orders
      const [nonCustomSnapshot, customSnapshot] = await Promise.all([
        get(dbRef(database, 'orders/non-custom')),
        get(dbRef(database, 'orders/custom'))
      ])
      
      const ordersArray: Order[] = []
      
      // Process non-custom orders
      if (nonCustomSnapshot.exists()) {
        const nonCustomOrders = nonCustomSnapshot.val()
        Object.keys(nonCustomOrders).forEach(orderId => {
          ordersArray.push({
            ...nonCustomOrders[orderId],
            orderId,
            type: 'non-custom'
          })
        })
      }
      
      // Process custom orders
      if (customSnapshot.exists()) {
        const customOrders = customSnapshot.val()
        Object.keys(customOrders).forEach(orderId => {
          ordersArray.push({
            ...customOrders[orderId],
            orderId,
            type: 'custom',
            totalAmount: customOrders[orderId].totalAmount || 0 // Ensure totalAmount exists
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

  const addOrder = async (order: Omit<Order, 'orderId' | 'createdAt'>) => {
    loading.value = true
    error.value = null
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('User not authenticated')
      }

      const newOrder = {
        ...order,
        orderId: `ord${Date.now()}`,
        createdAt: Date.now()
      }
      
      const orderRef = dbRef(database, `orders/${order.type}/${newOrder.orderId}`)
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

      const orderRef = dbRef(database, `orders/${updates.type || 'non-custom'}/${orderId}`)
      await update(orderRef, updates)
      
      const index = orders.value.findIndex(order => order.orderId === orderId)
      if (index !== -1) {
        orders.value[index] = { ...orders.value[index], ...updates }
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update order'
      console.error('Error updating order:', e)
    } finally {
      loading.value = false
    }
  }

  const deleteOrder = async (orderId: string, type: 'non-custom' | 'custom') => {
    loading.value = true
    error.value = null
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('User not authenticated')
      }

      const orderRef = dbRef(database, `orders/${type}/${orderId}`)
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
    getOrdersByType,
    // Actions
    fetchOrders,
    addOrder,
    updateOrder,
    deleteOrder
  }
}) 