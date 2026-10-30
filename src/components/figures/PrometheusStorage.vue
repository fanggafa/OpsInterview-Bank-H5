<script setup>
/**
 * Prometheus 的存储模型（题 5000）。
 *
 * 核心洞察：它按「时间序列 + 固定间隔采样」存储，每个点用 2 字节浮点压缩，
 * 并在 2 小时后切成 block；这种设计让它高效但不适合长期高精度存储。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 252" role="img" aria-label="Prometheus 存储模型：时间序列按采样间隔存点、2 小时成一个 block、压缩高效但不适合长期高精度">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">按「序列 + 固定采样点」存储，2 小时切一个 block</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">数据单位：时间序列（metric + 标签组合）</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">一条序列 = 一个指标 + 一组固定标签，每个采样点一个值</text>

      <rect x="6" y="54" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="var(--fig-node-b)">采样间隔固定（默认 15s）</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-text)">不是「变化才存」，而是「每 15s 存一个点」→ 存储量与时间成正比</text>

      <rect x="6" y="88" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="101" font-size="8" font-weight="700" fill="var(--fig-node-c)">存储结构：2 小时的 block</text>
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">内存里缓冲近期样本，每 2 小时落盘成一个只读块（chunk + index）</text>

      <rect x="6" y="122" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="135" font-size="8" font-weight="700" fill="var(--fig-node-d)">为什么高效</text>
      <text x="14" y="147" font-size="7.5" fill="var(--fig-text)">时间戳按差值编码、值用 XOR 压缩 → 每个样本约 1~2 字节</text>

      <rect x="6" y="160" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="173" font-size="8.5" font-weight="700" fill="#e5484d">由此带来的限制</text>
      <text x="14" y="186" font-size="7.5" fill="var(--fig-text)">① 不适合长期高精度保留（要降采样或远程写）② 不支持任意打点（无法补写历史）</text>
      <text x="14" y="198" font-size="7.5" fill="var(--fig-text)">③ 单实例规模受内存与磁盘限制（见扩展方案）</text>

      <rect x="6" y="210" width="328" height="24" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="226" font-size="7.5" fill="var(--fig-text)">推论：指标是「统计视角」，不是「事件日志」——明细请放日志/追踪</text>

      <text x="6" y="242" font-size="7.5" fill="var(--fig-muted)">容量估算：序列数 × (86400/15) × 保留天数 × 2 字节 ≈ 日增存储</text>
    </svg>
    <figcaption>Prometheus 按固定间隔采样、2 小时切成只读 block、XOR 压缩高效；但不适合长期高精度，也不支持补写历史</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
