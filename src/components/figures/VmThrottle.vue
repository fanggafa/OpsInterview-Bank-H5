<script setup>
/**
 * 虚拟机被限速的发现与排查（题 2631）。
 *
 * 核心洞察：限速（IOPS/带宽/CPU 份额）会表现为「没报错但就是慢」，
 * 关键是找「贴顶」的特征 —— 数值刚好停在某个阈值附近。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 254" role="img" aria-label="虚拟机被限速的类型与识别方法：IOPS、网络带宽、CPU 份额与磁盘上限，特征是稳定贴在阈值">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">限速的典型特征：不报错、但指标「稳定贴在某个数值上」</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① IOPS / 吞吐限速（最常见）</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">云盘或平台策略限 IOPS；表现为 IOPS 曲线撞在同一上限、await 上升</text>

      <rect x="6" y="54" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 网络带宽限速</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-text)">传输速度稳定在某个 Mbps；大包小包都上不去（区别于链路拥塞）</text>

      <rect x="6" y="88" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="101" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ CPU 份额 / 预留限制</text>
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">份额（shares）低时抢不到 CPU；表现为 CPU 明明满但性能差</text>

      <rect x="6" y="122" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="135" font-size="8" font-weight="700" fill="var(--fig-node-d)">④ 平台侧配额（云厂商）</text>
      <text x="14" y="147" font-size="7.5" fill="var(--fig-text)">实例规格本身有上限；升配前无论怎么优化都到不了更高</text>

      <!-- 识别方法 -->
      <rect x="6" y="156" width="328" height="52" rx="5" fill="#e5484d" opacity=".12" />
      <text x="14" y="169" font-size="8.5" font-weight="700" fill="#e5484d">怎么确认「是被限速」而不是「硬件就到这」</text>
      <text x="14" y="182" font-size="7.5" fill="var(--fig-text)">① 看指标是否「贴顶」（曲线平直贴着某值，而不是波动到峰值）</text>
      <text x="14" y="194" font-size="7.5" fill="var(--fig-text)">② 用 fio/iperf 多线程压测，若并发提高但总量不变 → 典型限速特征</text>
      <text x="14" y="206" font-size="7" fill="var(--fig-node-c)">③ 对照平台文档的规格上限（IOPS/带宽），或看虚拟机配置里的限速项</text>

      <rect x="6" y="214" width="328" height="20" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="228" font-size="7.5" fill="var(--fig-text)">处置：调整限速策略/升规格；若无法调整，改架构（分离 IO 密集组件）</text>

      <text x="6" y="244" font-size="7.5" fill="var(--fig-muted)">注意：限速常和超分同时存在，别只看单台，也要看同一后端上的其他 VM</text>
    </svg>
    <figcaption>限速有四类：IOPS/带宽/CPU 份额/云配额；识别靠「指标贴顶」与「加并发但总量不变」，处置是调策略或升规格</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
