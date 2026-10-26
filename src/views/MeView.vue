<script setup>
import { computed } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { THEMES } from '@/utils/constants'
import { useStudyStore } from '@/stores/studyStore'

const settings = useSettingsStore()
const study = useStudyStore()

const THEME_LABEL = { light: '浅色', dark: '深色', system: '跟随系统' }

const themeOptions = computed(() => THEMES.map((t) => ({ value: t, label: THEME_LABEL[t] })))

function clearRecords() {
  if (window.confirm('确定清空全部学习记录？此操作不可恢复。')) {
    study.clearRecords()
  }
}

function clearFavorites() {
  if (study.favorites.length === 0) return
  if (window.confirm('确定清空全部收藏？')) {
    study.clearFavorites()
  }
}
</script>

<template>
  <div class="page">
    <AppHeader title="我的" :back="false" />

    <h2 class="section-title">主题</h2>
    <div class="seg card">
      <button
        v-for="opt in themeOptions"
        :key="opt.value"
        class="seg__item"
        :class="{ 'seg__item--on': settings.theme === opt.value }"
        @click="settings.setTheme(opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>

    <h2 class="section-title">数据管理</h2>
    <div class="card list">
      <div class="list__row">
        <span>学习记录</span>
        <span class="muted">{{ study.reviewedCount }} 题</span>
      </div>
      <button class="list__row list__row--action" @click="clearRecords">
        <span class="danger">清空学习记录</span>
      </button>
      <div class="list__row">
        <span>收藏</span>
        <span class="muted">{{ study.favorites.length }} 题</span>
      </div>
      <button class="list__row list__row--action" @click="clearFavorites">
        <span class="danger">清空收藏</span>
      </button>
    </div>

    <h2 class="section-title">关于</h2>
    <div class="card list">
      <div class="list__row">
        <span>应用</span>
        <span class="muted">运维面试题库 v0.1.0</span>
      </div>
      <div class="list__row">
        <span>数据存储</span>
        <span class="muted">浏览器本地（localStorage）</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.seg {
  display: flex;
  padding: 4px;
  gap: 4px;
}
.seg__item {
  flex: 1;
  min-height: 38px;
  border-radius: var(--radius-sm);
  font-size: 13.5px;
  color: var(--c-text-2);
}
.seg__item--on {
  background: var(--c-primary);
  color: #fff;
  font-weight: 500;
}

.list {
  padding: 0 14px;
  overflow: hidden;
}
.list__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 48px;
  padding: 0;
  font-size: 14px;
  color: var(--c-text);
  border-bottom: 1px solid var(--c-border);
  text-align: left;
}
.list__row:last-child {
  border-bottom: none;
}
.list__row--action {
  justify-content: flex-start;
  cursor: pointer;
}
.danger {
  color: var(--c-danger);
}
.list__row .muted {
  font-size: 13px;
}
</style>
