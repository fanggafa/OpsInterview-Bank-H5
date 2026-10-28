<script setup>
/**
 * 虚拟化 CPU 资源分配与超分影响图。
 * 用「物理核 vs vCPU」的映射直观解释超分、绑核、steal time 三个概念的关系——
 * 这三个概念经常被混为一谈。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 228" role="img" aria-label="虚拟化中物理核与 vCPU 的映射、超分机制与 steal time 的产生">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">vCPU 不是真核，是宿主机调度器分配的时间片</text>

      <!-- 物理核 -->
      <text x="6" y="30" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">物理机 4 核</text>
      <g>
        <rect x="6" y="36" width="34" height="18" rx="3" fill="var(--fig-node-a)" opacity=".8" />
        <text x="23" y="49" text-anchor="middle" font-size="7.5" fill="#fff">Core0</text>
        <rect x="44" y="36" width="34" height="18" rx="3" fill="var(--fig-node-a)" opacity=".8" />
        <text x="61" y="49" text-anchor="middle" font-size="7.5" fill="#fff">Core1</text>
        <rect x="82" y="36" width="34" height="18" rx="3" fill="var(--fig-node-a)" opacity=".8" />
        <text x="99" y="49" text-anchor="middle" font-size="7.5" fill="#fff">Core2</text>
        <rect x="120" y="36" width="34" height="18" rx="3" fill="var(--fig-node-a)" opacity=".8" />
        <text x="137" y="49" text-anchor="middle" font-size="7.5" fill="#fff">Core3</text>
      </g>

      <text x="6" y="70" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">分配出去的 8 个 vCPU（超分 1:2）</text>
      <g>
        <rect x="6" y="76" width="26" height="16" rx="3" fill="var(--fig-node-b)" opacity=".55" />
        <text x="19" y="88" text-anchor="middle" font-size="7" fill="#fff">VM1-1</text>
        <rect x="36" y="76" width="26" height="16" rx="3" fill="var(--fig-node-b)" opacity=".55" />
        <text x="49" y="88" text-anchor="middle" font-size="7" fill="#fff">VM1-2</text>
        <rect x="66" y="76" width="26" height="16" rx="3" fill="var(--fig-node-c)" opacity=".55" />
        <text x="79" y="88" text-anchor="middle" font-size="7" fill="#fff">VM2-1</text>
        <rect x="96" y="76" width="26" height="16" rx="3" fill="var(--fig-node-c)" opacity=".55" />
        <text x="109" y="88" text-anchor="middle" font-size="7" fill="#fff">VM2-2</text>
        <rect x="126" y="76" width="26" height="16" rx="3" fill="var(--fig-node-d)" opacity=".55" />
        <text x="139" y="88" text-anchor="middle" font-size="7" fill="#fff">VM3-1</text>
        <rect x="156" y="76" width="26" height="16" rx="3" fill="var(--fig-node-d)" opacity=".55" />
        <text x="169" y="88" text-anchor="middle" font-size="7" fill="#fff">VM3-2</text>
      </g>

      <text x="6" y="106" font-size="7.5" fill="var(--fig-muted)">8 个 vCPU 抢 4 个物理核 → 每个 vCPU 只有约 50% 的时间能真正运行</text>

      <!-- steal time -->
      <rect x="6" y="114" width="328" height="42" rx="6" fill="#e5484d" opacity=".09" />
      <rect x="6" y="114" width="328" height="42" rx="6" fill="none" stroke="#e5484d" stroke-width="1.2" />
      <text x="16" y="130" font-size="9" font-weight="700" fill="#e5484d">st（steal time）= 想跑但被抢走的时间</text>
      <text x="16" y="144" font-size="8" fill="var(--fig-text)">st 高说明宿主机超分过度，或邻居 VM 在满载 —— 此时在 guest 内做任何优化都无效</text>
      <text x="16" y="153" font-size="7.5" fill="var(--fig-muted)">处置方向：迁移 VM、减少宿主机超分比、给关键 VM 绑核</text>

      <!-- 绑核 -->
      <text x="6" y="174" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">绑核（CPU pinning）换来什么、失去什么</text>
      <text x="6" y="188" font-size="8" fill="var(--fig-node-c)">✓ 消除调度抖动、缓存亲和、性能可预测</text>
      <text x="6" y="201" font-size="8" fill="var(--fig-node-d)">✗ 失去弹性：空闲的核别的 VM 用不上，且不好热迁移</text>
      <text x="6" y="214" font-size="7.5" fill="var(--fig-muted)">适合延迟敏感的数据库；一般 Web 应用不必绑核</text>
    </svg>
    <figcaption>超分是「透支」：st 高时问题在宿主机，不在虚拟机里</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
