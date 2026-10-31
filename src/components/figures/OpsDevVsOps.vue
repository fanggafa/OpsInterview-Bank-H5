<script setup>
/**
 * 运维开发与传统运维的区别（题 3240）。
 *
 * 核心洞察：不是「会不会写代码」，而是「产出物是操作还是系统」——
 * 传统运维交付「今天的稳定」，运维开发交付「持续的自动化」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 232" role="img" aria-label="传统运维与运维开发在产出物、衡量标准、能力要求上的区别">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">区别不在「写不写代码」，在「交付的是操作还是系统」</text>

      <rect x="6" y="20" width="160" height="92" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">传统运维</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">产出：稳定的系统运行</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">工作形态：巡检、值班、处置</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">核心能力：故障判断、经验积累</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-text)">衡量：可用性、故障恢复时长</text>
      <text x="14" y="94" font-size="7.5" fill="var(--fig-text)">重复劳动多（同一问题反复处理）</text>
      <text x="14" y="106" font-size="7" fill="var(--fig-node-c)">价值随规模线性增长受限</text>

      <rect x="174" y="20" width="160" height="92" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">运维开发</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">产出：可复用的工具与平台</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">工作形态：设计、编码、迭代</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">核心能力：工程化 + 运维理解</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-text)">衡量：自动化覆盖、效率提升</text>
      <text x="182" y="94" font-size="7.5" fill="var(--fig-text)">把重复问题「一次解决」</text>
      <text x="182" y="106" font-size="7" fill="var(--fig-node-c)">价值可复用到多团队</text>

      <!-- 桥梁 -->
      <rect x="6" y="124" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="137" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">转型最难的不是技术</text>
      <text x="14" y="150" font-size="7.5" fill="var(--fig-text)">① 要懂运维痛点（不懂就写不出有用的工具）</text>
      <text x="14" y="162" font-size="7.5" fill="var(--fig-text)">② 要接受「写工具比手动处理慢」的前期投入（长期收益在后期）</text>

      <rect x="6" y="178" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="191" font-size="8" font-weight="700" fill="var(--fig-node-d)">典型的运维开发产出物</text>
      <text x="14" y="203" font-size="7.5" fill="var(--fig-text)">自动化平台、监控告警系统、发布流水线、CMDB、故障自愈脚本</text>

      <text x="6" y="228" font-size="7.5" fill="var(--fig-muted)">注意：两者不是替代关系 —— 纯开发不懂现场写不出好工具，纯运维不做工程化会被规模压垮</text>
    </svg>
    <figcaption>传统运维交付稳定运行、靠经验处置；运维开发交付工具与平台、把重复问题一次解决；转型难点在懂痛点与承受前期投入</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
