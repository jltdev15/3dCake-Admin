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

      // Fetch non-custom orders
      const nonCustomOrdersRef = dbRef(database, 'orders/non-custom')
      const snapshot = await get(nonCustomOrdersRef)
      
      if (snapshot.exists()) {
        const ordersData = snapshot.val()
        console.log('Orders data:', ordersData) // Debug log
        const ordersArray: Order[] = []
        
        // Convert the object to an array
        Object.keys(ordersData).forEach(orderId => {
          ordersArray.push({
            ...ordersData[orderId],
            orderId,
            type: 'non-custom' // Ensure type is set correctly
          })
        })
        
        orders.value = ordersArray
      } else {
        orders.value = []
      }
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