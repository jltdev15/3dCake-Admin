import { defineStore } from 'pinia'
import { ref } from 'vue'
import { database } from '../firebase/config'
import { ref as dbRef, onValue } from 'firebase/database'

interface OrderItem {
  cakeId: string
  id: string
  imageUrl: string
  name: string
  quantity: number
  size: string
  totalPrice: number
  unitPrice: number
}

interface Order {
  createdAt: number
  customerName: string
  items: OrderItem[]
  orderId: string
  status: 'accepted' | 'declined' | 'pending'
  totalAmount: number
  type: 'non-custom'
  userId: string
}

export const useDashboardStore = defineStore('dashboard', () => {
  const totalOrders = ref(0)
  const totalCustomers = ref(0)
  const totalRevenue = ref(0)
  const acceptedOrders = ref(0)
  const declinedOrders = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchDashboardStats = async () => {
    loading.value = true
    error.value = null

    try {
      // Listen to orders
      const ordersRef = dbRef(database, 'orders/non-custom')
      onValue(ordersRef, (snapshot) => {
        const ordersData = snapshot.val() || {}
        console.log('Raw orders data:', ordersData)
        
        const ordersArray = Object.values(ordersData) as Order[]
        console.log('Processed orders array:', ordersArray)
        
        totalOrders.value = ordersArray.length
        console.log('Total orders:', totalOrders.value)
        
        // Calculate revenue only from accepted orders
        const acceptedOrdersArray = ordersArray.filter(order => order.status === 'accepted')
        console.log('Accepted orders:', acceptedOrdersArray)
        
        totalRevenue.value = acceptedOrdersArray.reduce((sum, order) => {
          console.log('Order amount:', order.totalAmount)
          return sum + (order.totalAmount || 0)
        }, 0)
        console.log('Total revenue:', totalRevenue.value)
        
        // Count orders by status
        acceptedOrders.value = acceptedOrdersArray.length
        declinedOrders.value = ordersArray.filter(order => order.status === 'declined').length
        
        console.log('Stats summary:', {
          totalOrders: totalOrders.value,
          totalRevenue: totalRevenue.value,
          acceptedOrders: acceptedOrders.value,
          declinedOrders: declinedOrders.value
        })
      })

      // Listen to users
      const usersRef = dbRef(database, 'users')
      onValue(usersRef, (snapshot) => {
        const users = snapshot.val() || {}
        console.log('Users data:', users)
        totalCustomers.value = Object.keys(users).length
        console.log('Total customers:', totalCustomers.value)
      })
    } catch (err) {
      error.value = 'Failed to fetch dashboard stats'
      console.error('Error fetching dashboard stats:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    totalOrders,
    totalCustomers,
    totalRevenue,
    acceptedOrders,
    declinedOrders,
    loading,
    error,
    fetchDashboardStats
  }
}) 