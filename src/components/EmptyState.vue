<script setup>
defineProps({
  title: { type: String, default: '暂无内容' },
  desc: { type: String, default: '' },
  /** 行动按钮文案，为空则不显示 */
  action: { type: String, default: '' },
  /** 按钮是否禁用（如重试退避冷却期内） */
  actionDisabled: { type: Boolean, default: false },
  /** 插画类型：favorites | wrong | search | error */
  variant: { type: String, default: 'search' },
})

defineEmits(['action'])
</script>

<template>
  <div class="empty">
    <svg class="empty__art" viewBox="0 0 120 100" aria-hidden="true">
      <ellipse cx="60" cy="88" rx="38" ry="6" fill="currentColor" opacity=".08" />
      <template v-if="variant === 'favorites'">
        <path
          d="M60 28l7.6 15.4 17 2.5-12.3 12 2.9 16.9L60 66.8 44.8 74.8l2.9-16.9-12.3-12 17-2.5z"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linejoin="round"
          opacity=".5"
        />
      </template>
      <template v-else-if="variant === 'wrong'">
        <circle cx="60" cy="50" r="24" fill="none" stroke="currentColor" stroke-width="2.5" opacity=".5" />
        <path d="M50 40l20 20M70 40L50 60" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity=".5" />
      </template>
      <template v-else-if="variant === 'error'">
        <path
          d="M60 30l22 38a2 2 0 0 1-1.7 3H39.7a2 2 0 0 1-1.7-3l20-38a2 2 0 0 1 3.4 0z"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linejoin="round"
          opacity=".5"
        />
        <path d="M60 46v14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity=".5" />
        <circle cx="60" cy="66" r="1.6" fill="currentColor" opacity=".5" />
      </template>
      <template v-else>
        <circle cx="55" cy="45" r="18" fill="none" stroke="currentColor" stroke-width="2.5" opacity=".5" />
        <path d="M68 58l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity=".5" />
        <path d="M48 45h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".3" />
      </template>
    </svg>

    <p class="empty__title">{{ title }}</p>
    <p v-if="desc" class="empty__desc">{{ desc }}</p>
    <button
      v-if="action"
      class="btn btn--ghost empty__action"
      :disabled="actionDisabled"
      @click="$emit('action')"
    >
      {{ action }}
    </button>
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 16px;
  color: var(--c-text-3);
  text-align: center;
}
.empty__art {
  width: 120px;
  height: 100px;
  color: var(--c-text-3);
}
.empty__title {
  margin: 12px 0 4px;
  font-size: 15px;
  font-weight: 500;
  color: var(--c-text-2);
}
.empty__desc {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.6;
  max-width: 260px;
}
.empty__action {
  margin-top: 4px;
}
</style>
