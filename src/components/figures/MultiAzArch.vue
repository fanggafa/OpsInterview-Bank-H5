<script setup>
/**
 * 多可用区（AZ）高可用架构图。
 * 展示「跨 AZ 的入口 → 每个 AZ 各一份应用 → 数据库主备」，
 * 并标出三处「最容易漏掉的单 AZ 组件」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 238" role="img" aria-label="多可用区高可用架构与常见的单可用区断点">
      <defs>
        <marker id="arrAz" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-a)" />
        </marker>
      </defs>

      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">同城双活：任一 AZ 故障，另一个还能服务</text>

      <!-- 入口 -->
      <rect x="112" y="20" width="116" height="20" rx="6" fill="var(--fig-node-b)" opacity=".85" />
      <text x="170" y="34" text-anchor="middle" font-size="9" fill="#fff" font-weight="600">SLB / 全局流量（跨 AZ）</text>

      <path d="M150 42 L86 60" stroke="var(--fig-node-a)" stroke-width="1.6" marker-end="url(#arrAz)" />
      <path d="M190 42 L254 60" stroke="var(--fig-node-a)" stroke-width="1.6" marker-end="url(#arrAz)" />

      <!-- AZ1 -->
      <rect x="16" y="62" width="146" height="112" rx="8" fill="var(--fig-node-a)" opacity=".07" />
      <rect x="16" y="62" width="146" height="112" rx="8" fill="none" stroke="var(--fig-node-a)" stroke-width="1.4" />
      <text x="24" y="78" font-size="10" font-weight="700" fill="var(--fig-node-a)">可用区 A</text>

      <rect x="26" y="86" width="126" height="18" rx="4" fill="var(--fig-card)" stroke="var(--fig-node-a)" stroke-width="1.1" />
      <text x="89" y="98" text-anchor="middle" font-size="8.5" fill="var(--fig-text)">应用实例（无状态）</text>

      <rect x="26" y="110" width="126" height="18" rx="4" fill="var(--fig-node-c)" opacity=".8" />
      <text x="89" y="122" text-anchor="middle" font-size="8.5" fill="#fff" font-weight="600">DB 主（可写）</text>

      <rect x="26" y="134" width="126" height="18" rx="4" fill="var(--fig-card)" stroke="var(--fig-node-d)" stroke-width="1.1" stroke-dasharray="3 2" />
      <text x="89" y="146" text-anchor="middle" font-size="8" fill="var(--fig-node-d)">云盘 PV（AZ 级资源）</text>

      <text x="26" y="166" font-size="7.5" fill="var(--fig-muted)">该 AZ 整体失联时不可用</text>

      <!-- AZ2 -->
      <rect x="178" y="62" width="146" height="112" rx="8" fill="var(--fig-node-c)" opacity=".07" />
      <rect x="178" y="62" width="146" height="112" rx="8" fill="none" stroke="var(--fig-node-c)" stroke-width="1.4" />
      <text x="186" y="78" font-size="10" font-weight="700" fill="var(--fig-node-c)">可用区 B</text>

      <rect x="188" y="86" width="126" height="18" rx="4" fill="var(--fig-card)" stroke="var(--fig-node-c)" stroke-width="1.1" />
      <text x="251" y="98" text-anchor="middle" font-size="8.5" fill="var(--fig-text)">应用实例（承接全量）</text>

      <rect x="188" y="110" width="126" height="18" rx="4" fill="var(--fig-card)" stroke="var(--fig-node-c)" stroke-width="1.1" stroke-dasharray="3 2" />
      <text x="251" y="122" text-anchor="middle" font-size="8" fill="var(--fig-node-c)">DB 备（同步，不可读）</text>

      <rect x="188" y="134" width="126" height="18" rx="4" fill="var(--fig-card)" stroke="var(--fig-node-d)" stroke-width="1.1" stroke-dasharray="3 2" />
      <text x="251" y="146" text-anchor="middle" font-size="8" fill="var(--fig-node-d)">云盘 PV（另一 AZ）</text>

      <text x="188" y="166" font-size="7.5" fill="var(--fig-muted)">容量要能承接 2 倍流量</text>

      <!-- 关键提醒 -->
      <text x="6" y="192" font-size="9.5" font-weight="700" fill="var(--fig-node-d)">最常见的「伪双活」——任一单 AZ 组件都会让整体变单 AZ</text>
      <text x="6" y="206" font-size="8.5" fill="var(--fig-text)">✗ 应用双 AZ，但数据库单 AZ　　✗ 忘了认证/配置中心/消息队列</text>
      <text x="6" y="220" font-size="8.5" fill="var(--fig-text)">✗ 镜像仓库单 AZ　　✗ 备份只在同一 AZ　　✗ 容量只按 1x 准备</text>
      <text x="6" y="234" font-size="8.5" fill="var(--fig-node-c)">✓ 逐项盘点「每个组件在几个 AZ」，并按「另一 AZ 承接全量」做容量</text>
    </svg>
    <figcaption>双活不是「部署两份」，而是「每个依赖都跨 AZ，且容量能承接全量」</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
