import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles.css'
import { bindFlushOnHide } from './utils/storage'
import { migrateEarlyIds } from './utils/idMigration'
import { useSettingsStore } from './stores/settingsStore'
import { useStudyStore } from './stores/studyStore'
import { useBankStore } from './stores/bankStore'

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

// 早期题目 id 迁移（1–119 → 各分类编号段）：必须在 studyStore 读记录之前执行，
// 否则老用户在这些题上的进度会因 id 失效而退出统计。幂等，只跑一次。
migrateEarlyIds()

// 触达一次 studyStore，确保记录从 localStorage 读入
useStudyStore()

app.mount('#app')
