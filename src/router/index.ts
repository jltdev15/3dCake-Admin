import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { watch } from 'vue'
import MessagingView from '../views/MessagingView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Login route
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false }
    },

    // Dashboard routes
    {
      path: '/',
      redirect: '/dashboard',
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('../views/OrdersView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/orders/:id',
      name: 'order-detail',
      component: () => import('../views/OrderDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/custom-orders/:id',
      name: 'custom-order-detail',
      component: () => import('../views/CustomOrderDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/UsersView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/messaging',
      name: 'messaging',
      component: MessagingView,
      meta: { requiresAuth: true }
    },

    // 404 Not Found route - must be the last route
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
      meta: { requiresAuth: false }
    },
  ],
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  // Wait for initial auth check to complete
  if (authStore.initialLoading) {
    // Show loading state or wait for auth to initialize
    await new Promise(resolve => {
      const unwatch = watch(() => authStore.initialLoading, (loading) => {
        if (!loading) {
          unwatch()
          resolve(true)
        }
      })
    })
  }

  // If the route requires auth and user is not authenticated
  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  }
  // If user is authenticated and tries to access login page
  else if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
  }
  // Otherwise proceed
  else {
    next()
  }
})

export default router
