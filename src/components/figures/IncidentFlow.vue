<script setup>
/**
 * 线上故障处理的五步决策流程图。
 * 场景题最缺的就是这张「先后顺序」图 —— 很多人答故障题时
 * 一上来就写「查日志」，而正确顺序是「先止血、再定位」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 240" role="img" aria-label="线上故障处理的五步流程：确认范围、止血、定位、修复、复盘">
      <defs>
        <marker id="arrInc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-a)" />
        </marker>
      </defs>

      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">顺序本身就是考点：先让用户不疼，再找病因</text>

      <!-- 第1步 -->
      <rect x="6" y="20" width="328" height="34" rx="6" fill="var(--fig-node-a)" opacity=".1" />
      <rect x="6" y="20" width="328" height="34" rx="6" fill="none" stroke="var(--fig-node-a)" stroke-width="1.3" />
      <text x="14" y="36" font-size="9" font-weight="700" fill="var(--fig-node-a)">① 确认范围与时间点（10 分钟内）</text>
      <text x="14" y="48" font-size="7.5" fill="var(--fig-text)">影响哪些页面/地域/用户？从几点开始？与发布、配置变更、流量峰值、依赖故障是否吻合？</text>

      <path d="M170 56 L170 64" stroke="var(--fig-node-a)" stroke-width="1.5" marker-end="url(#arrInc)" />

      <!-- 第2步 分叉 -->
      <rect x="6" y="68" width="156" height="40" rx="6" fill="var(--fig-node-d)" opacity=".12" />
      <rect x="6" y="68" width="156" height="40" rx="6" fill="none" stroke="var(--fig-node-d)" stroke-width="1.3" />
      <text x="14" y="84" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">② 能回滚吗？能 → 立刻回滚</text>
      <text x="14" y="97" font-size="7.5" fill="var(--fig-text)">时间点与变更吻合时，回滚是最快的止血</text>

      <rect x="174" y="68" width="160" height="40" rx="6" fill="var(--fig-node-c)" opacity=".12" />
      <rect x="174" y="68" width="160" height="40" rx="6" fill="none" stroke="var(--fig-node-c)" stroke-width="1.3" />
      <text x="182" y="84" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">不能回滚 → 限流/降级/扩容</text>
      <text x="182" y="97" font-size="7.5" fill="var(--fig-text)">先降低压力来源，保住核心链路</text>

      <path d="M170 110 L170 118" stroke="var(--fig-node-a)" stroke-width="1.5" marker-end="url(#arrInc)" />

      <!-- 第3步 -->
      <rect x="6" y="122" width="328" height="34" rx="6" fill="var(--fig-node-b)" opacity=".1" />
      <rect x="6" y="122" width="328" height="34" rx="6" fill="none" stroke="var(--fig-node-b)" stroke-width="1.3" />
      <text x="14" y="138" font-size="9" font-weight="700" fill="var(--fig-node-b)">③ 定位根因（业务恢复后再从容做）</text>
      <text x="14" y="150" font-size="7.5" fill="var(--fig-text)">看日志异常类型 → 看依赖指标 → 看链路追踪哪一跳慢 → 看资源是否触顶</text>

      <path d="M170 158 L170 166" stroke="var(--fig-node-a)" stroke-width="1.5" marker-end="url(#arrInc)" />

      <!-- 第4步 -->
      <rect x="6" y="170" width="156" height="34" rx="6" fill="var(--fig-node-c)" opacity=".1" />
      <rect x="6" y="170" width="156" height="34" rx="6" fill="none" stroke="var(--fig-node-c)" stroke-width="1.3" />
      <text x="14" y="186" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">④ 修复并验证</text>
      <text x="14" y="198" font-size="7.5" fill="var(--fig-text)">灰度验证后再全量</text>

      <rect x="174" y="170" width="160" height="34" rx="6" fill="var(--fig-node-a)" opacity=".1" />
      <rect x="174" y="170" width="160" height="34" rx="6" fill="none" stroke="var(--fig-node-a)" stroke-width="1.3" />
      <text x="182" y="186" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">⑤ 复盘（RCA）</text>
      <text x="182" y="198" font-size="7.5" fill="var(--fig-text)">时间线 / 根因 / 改进项与负责人</text>

      <!-- 反面清单 -->
      <rect x="6" y="210" width="328" height="26" rx="6" fill="#e5484d" opacity=".08" />
      <text x="16" y="226" font-size="8" font-weight="700" fill="#e5484d">✗ 一上来就重启服务 ✗ 没确认范围就动手 ✗ 先写报告 ✗ 关掉告警</text>
    </svg>
    <figcaption>「止血优先于定位」——业务还在受损时，分析根因不是第一优先级</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
