import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import { useBankStore } from '@/stores/bankStore'

/**
 * 路由：history 模式（部署需 rewrite，见 README）。
 *
 * P2 TODO（未实现）：
 * 1. 零配置部署：可改为 createWebHashHistory，URL 变成 /#/bank 形式。
 * 2. PWA 离线：接入 vite-plugin-pwa 后无需改本文件。
 */

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '运维面试题库' },
  },
  {
    path: '/bank',
    name: 'bank',
    component: () => import('@/views/BankView.vue'),
    meta: { title: '题库' },
  },
  {
    path: '/question/:id',
    name: 'question',
    component: () => import('@/views/QuestionView.vue'),
    meta: { title: '题目详情', parent: '/bank' },
  },
  {
    path: '/practice',
    name: 'practice',
    component: () => import('@/views/PracticeView.vue'),
    meta: { title: '刷题' },
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('@/views/FavoritesView.vue'),
    // 收藏 / 错题本都从「我的」进入，所属 Tab 因而指向 /me
    meta: { title: '收藏', parent: '/me' },
  },
  {
    path: '/wrong',
    name: 'wrong',
    component: () => import('@/views/WrongView.vue'),
    meta: { title: '错题本', parent: '/me' },
  },
  {
    path: '/me',
    name: 'me',
    component: () => import('@/views/MeView.vue'),
    meta: { title: '我的' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { title: '设置', parent: '/me' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: '页面不存在' },
  },
]

/**
 * 路由模式由环境变量决定，避免「为部署改源码、事后忘记改回」的坑：
 * - 默认：history 模式（需要服务器 rewrite，如 Nginx/Vercel/Netlify）
 * - VITE_ROUTER_MODE=hash：hash 模式（零配置，适合 GitHub Pages 等不支持 rewrite 的托管）
 */
const USE_HASH = import.meta.env.VITE_ROUTER_MODE === 'hash'

const router = createRouter({
  history: USE_HASH
    ? createWebHashHistory()
    : createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

const APP_NAME = '运维面试题库'

router.afterEach((to) => {
  const title = to.meta?.title
  document.title = title ? `${title} · ${APP_NAME}` : APP_NAME

  // 非首页进入时确保题库已加载（失败由页面自身展示 error 态）
  if (to.name !== 'home') {
    const bank = useBankStore()
    bank.load().catch(() => {})
  }
})

export default router
