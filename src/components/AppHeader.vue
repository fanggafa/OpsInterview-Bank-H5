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
/**
 * 页头：**浮动圆角玻璃胶囊**（iOS 26 的真实形态）。
 *
 * ## 为什么不再是通栏条
 *
 * 早先是横贯全屏、上下都有硬边界的玻璃条。这种形态在内容密集的页面上
 * 必然显得像「贴上去的板子」—— 边界清楚、面积大、与卡片不是一套语言
 * （用户连续反馈「丑」「越改越丑」）。
 *
 * iOS 26 的导航栏本身是**浮在内容之上的圆角胶囊**：四周留白、圆角、柔和投影。
 * 这样它和下面的玻璃卡是同一个视觉族，不再是「顶着一块板」。
 *
 * ## 关键细节
 *
 * - **四周留白**（`margin`）：浮起来的关键，贴边就变回板子
 * - **下方必须留 12px 间距**：早先只写 `margin: 0 ... 0`（下边距为 0），
 *   胶囊和紧跟的搜索框直接粘在一起、两个玻璃块连成一片，看着像一块坏掉的玻璃
 * - **圆角 16px**：与卡片同族的圆角语言
 * - **柔和投影**：给一点高度，说明它浮在内容之上
 * - **不加边框、不加内高光线**：玻璃边界是模糊过渡，不是线
 * - 饱和度用 `--glass-bar-saturate`（130%），条状区域面积大，190% 会把背后蓝光拉成一块
 */
.header {
  position: sticky;
  top: 8px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  /**
   * 上移 6px 抵消 `.page` 的 `padding-top: 6px`；左右 12px、下方 12px 让胶囊浮起来
   * 且与下方内容分开（下方为 0 会和搜索框粘连）。
   */
  margin: -6px 12px 12px;
  padding: 0 8px;
  border-radius: 16px;
  background: var(--glass-bar-bg);
  box-shadow: var(--glass-shadow);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-bar-saturate));
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-bar-saturate));
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .header {
    background: var(--c-card);
  }
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
