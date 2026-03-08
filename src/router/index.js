import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/leer/:chapter?',
    name: 'reader',
    component: () => import('@/views/ReaderView.vue'),
    props: true
  },
  {
    path: '/mapa',
    name: 'map',
    component: () => import('@/views/MapView.vue')
  },
  {
    path: '/creditos',
    name: 'credits',
    component: () => import('@/views/CreditsView.vue')
  },
  {
    path: '/morelli',
    name: 'morelli',
    component: () => import('@/views/MorelliView.vue')
  },
  {
    path: '/ia',
    name: 'ai',
    component: () => import('@/views/AIView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
