import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles.css'
import { bindFlushOnHide } from './utils/storage'
import { useSettingsStore } from './stores/settingsStore'
import { useStudyStore } from './stores/studyStore'
import { useBankStore } from './stores/bankStore'
import { usePwaUpdate } from './composables/usePwaUpdate'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 页面隐藏/关闭前强制把节流中的数据落盘
bindFlushOnHide()

// 主题初始化（在挂载前应用，避免闪白）
const settings = useSettingsStore()
settings.init()

// 预热题库：失败不阻塞渲染，页面会显示错误态。
//
// 这里只预热**索引**（gzip 约 121 KB），不是全量 1455 KB —— 首屏的列表/统计/筛选
// 只需要摘要字段。需要答案的页面（详情/刷题）会调 load() 或 hydrateCategory() 补齐。
const bank = useBankStore()
bank.loadIndex().catch(() => {})

// 触达一次 studyStore，确保记录从 localStorage 读入
useStudyStore()

app.mount('#app')

// PWA Service Worker 注册：放到首屏渲染之后，不和首屏抢带宽/主线程。
// 开发环境由 vite-plugin-pwa 跳过（devOptions.enabled=false），没有副作用。
usePwaUpdate()
  .register()
  .catch(() => {})

/**
 * 空闲时预热答案分片（见 `prewarmCache` 的注释）。
 *
 * 答案分片已移出 precache，改走 CacheFirst 运行时缓存；
 * 这里在首屏稳定后主动把它们喂给 SW —— **一次一个、仅在浏览器空闲时**，
 * 所以不会和发版后的首次交互抢主线程（那正是用户反馈卡顿的时刻）。
 *
 * 延迟 2 秒起步：给首屏、索引解析、路由跳转留出干净的窗口。
 */
setTimeout(() => {
  usePwaUpdate().prewarmCache().catch(() => {})
}, 2000)
