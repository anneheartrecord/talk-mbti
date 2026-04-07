import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/HomePage.vue') },
  { path: '/tags', name: 'Tags', component: () => import('../views/TagsPage.vue') },
  { path: '/chat', name: 'Chat', component: () => import('../views/ChatPage.vue') },
  { path: '/report', name: 'Report', component: () => import('../views/ReportPage.vue') },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
