import { createRouter, createWebHistory } from 'vue-router'
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
    path: '/interview',
    name: 'interview',
    component: () => import('@/views/InterviewSetupView.vue'),
    meta: { title: '模拟面试' },
  },
  {
    path: '/interview/run',
    name: 'interview-run',
    component: () => import('@/views/InterviewRunView.vue'),
    meta: { title: '面试进行中', parent: '/interview' },
  },
  {
    path: '/interview/result',
    name: 'interview-result',
    component: () => import('@/views/InterviewResultView.vue'),
    meta: { title: '面试评估', parent: '/interview' },
  },
  {
    path: '/stats',
    name: 'stats',
    component: () => import('@/views/StatsView.vue'),
    meta: { title: '统计' },
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('@/views/FavoritesView.vue'),
    meta: { title: '收藏', parent: '/stats' },
  },
  {
    path: '/wrong',
    name: 'wrong',
    component: () => import('@/views/WrongView.vue'),
    meta: { title: '错题本', parent: '/stats' },
  },
  {
    path: '/me',
    name: 'me',
    component: () => import('@/views/MeView.vue'),
    meta: { title: '我的' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: '页面不存在' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

const APP_NAME = '运维面试题库'

router.beforeEach(async (to) => {
  // 面试流程守卫：无会话/无结果时跳回设置页
  if (to.name === 'interview-run') {
    const { useInterviewStore } = await import('@/stores/interviewStore')
    const interview = useInterviewStore()
    if (!interview.active) return { name: 'interview', replace: true }
    // 已答完还停在 run 页（如手动改地址）→ 直接去结果页
    if (interview.isFinished) return { name: 'interview-result', replace: true }
  }
  if (to.name === 'interview-result') {
    const { useInterviewStore } = await import('@/stores/interviewStore')
    const interview = useInterviewStore()
    if (!interview.result) return { name: 'interview', replace: true }
  }
  return true
})

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
