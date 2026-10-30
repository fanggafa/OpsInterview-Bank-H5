<script setup>
/**
 * 测试金字塔与流水线分层（题 109 / 4817）。
 *
 * 核心洞察：金字塔的实质是「按成本与稳定性分层」——
 * 底层多而快、顶层少而慢；倒金字塔（大量 E2E）会让流水线又慢又 flaky。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 284" role="img" aria-label="测试金字塔：单元测试最多最快、集成测试居中、E2E 最少最慢，以及流水线中的执行位置">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">金字塔实质是「按成本与稳定性分层」：底层多而快，顶层少而慢</text>

      <!-- 金字塔 -->
      <polygon points="170,26 262,110 78,110" fill="var(--fig-node-c)" opacity=".14" />
      <text x="150" y="60" font-size="7.5" font-weight="700" fill="var(--fig-node-c)">E2E</text>
      <text x="118" y="72" font-size="7" fill="var(--fig-text)">少、慢、易 flaky</text>

      <polygon points="78,112 262,112 296,178 44,178" fill="var(--fig-node-b)" opacity=".12" />
      <text x="152" y="140" font-size="7.5" font-weight="700" fill="var(--fig-node-b)">集成</text>
      <text x="140" y="152" font-size="7" fill="var(--fig-text)">验证接口/DB/消息</text>

      <polygon points="44,180 296,180 330,246 10,246" fill="var(--fig-node-a)" opacity=".12" />
      <text x="152" y="208" font-size="7.5" font-weight="700" fill="var(--fig-node-a)">单元测试</text>
      <text x="120" y="220" font-size="7" fill="var(--fig-text)">多、毫秒级、定位准</text>

      <!-- 流水线位置 -->
      <text x="6" y="262" font-size="7.5" fill="var(--fig-muted)">流水线：提交即跑单元 → 构建后跑集成 → 部署预发跑 E2E 冒烟</text>
      <text x="6" y="274" font-size="7.5" fill="var(--fig-muted)">反模式：大量 E2E 会让流水线 40 分钟且 flaky 频繁，团队最终忽略失败</text>
    </svg>
    <figcaption>单元多而快、集成居中、E2E 少而慢；倒金字塔会让流水线又慢又 flaky，最终没人看结果</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
