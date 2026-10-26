<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  title: { type: String, default: '' },
  /** 是否显示返回按钮 */
  back: { type: Boolean, default: true },
  /** 返回目标，默认 router.back() */
  backTo: { type: String, default: '' },
})

const router = useRouter()

function goBack() {
  if (props.backTo) {
    router.push(props.backTo)
    return
  }
  if (window.history.length > 1) router.back()
  else router.push('/')
}
</script>

<template>
  <header class="header">
    <button
      v-if="back"
      class="header__btn"
      aria-label="返回"
      @click="goBack"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path
          d="M15 5l-7 7 7 7"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <router-link v-else to="/" class="header__brand">运维面试题库</router-link>

    <h1 class="header__title">{{ title }}</h1>

    <div class="header__right">
      <slot name="right" />
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 52px;
  margin: 0 -16px;
  padding: 0 8px;
  background: var(--c-bg);
  backdrop-filter: blur(8px);
}

.header__btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text);
  border-radius: 50%;
}
.header__btn:active {
  background: var(--c-primary-weak);
}

.header__brand {
  font-size: 16px;
  font-weight: 700;
  color: var(--c-text);
  padding-left: 8px;
  white-space: nowrap;
}

.header__title {
  flex: 1;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--c-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
}
.header__title + .header__right {
  min-width: 44px;
}

.header__right {
  display: flex;
  align-items: center;
  min-width: 44px;
  justify-content: flex-end;
}
</style>
