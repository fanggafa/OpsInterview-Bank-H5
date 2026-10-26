import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles.css'
import { bindFlushOnHide } from './utils/storage'
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

// 预热题库：失败不阻塞渲染，页面会显示错误态
const bank = useBankStore()
bank.load().catch(() => {})

// 触达一次 studyStore，确保记录从 localStorage 读入
useStudyStore()

app.mount('#app')
