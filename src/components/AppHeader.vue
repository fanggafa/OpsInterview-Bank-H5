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
        <!--
          与刷题页顶栏用同一个「带横线的返回箭头」。
          全局只保留这一种返回图标，避免同一个动作在不同页面长出两张脸。
          宽度取 20 而非 22：20 是这套图标里的标准尺寸，视觉重量更稳。
        -->
        <path
          d="M20 12H5M11 6l-6 6 6 6"
          fill="none"
          stroke="currentColor"
          stroke-width="1.9"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <!--
      首页（没有返回按钮时）用等宽占位替代原来的「运维面试题库」品牌字：
      它在页头左侧占着位置，把标题挤到右边、看起来没居中；
      而且底部 TabBar 已经明确「你在哪个 App」，页头重复一遍是噪音。
    -->
    <span v-else class="header__left-spacer" aria-hidden="true" />

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

/**
 * 标题真正居中。
 *
 * 早先标题写 `flex: 1` + `text-align: center`，但左侧有 44px 的返回按钮、
 * 右侧又有 44px 槽位 —— 两侧宽度虽然对得上，文字却因为品牌字挤在左边
 * 显得偏右。现在左右各留一个等宽占位（`.header__slot`），标题居中才是真的居中。
 */
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

/* 左侧占位：把标题推到视觉中心 */
.header__left-spacer {
  flex-shrink: 0;
  width: 44px;
}

.header__right {
  display: flex;
  align-items: center;
  min-width: 44px;
  justify-content: flex-end;
}
</style>
