<script setup>
/**
 * LLM 可观测性与传统 APM 的差别（题 5835）。
 *
 * 核心洞察：APM 回答的是「服务活着吗」（延迟、错误率、资源），
 * 它能全绿而用户依然不满意——因为「答得好不好」和「token 花在哪」
 * 根本不在 APM 的指标体系里，必须额外采集四类数据。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 266" role="img" aria-label="传统 APM 可见的指标与 LLM 场景下看不到的质量和成本，以及需补采的四类数据">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">APM 答「服务活着吗」，LLM 还要答「答得好吗」</text>

      <!-- APM 能看 -->
      <rect x="6" y="18" width="328" height="44" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="32" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">✓ 传统 APM 能看</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">请求量、延迟、错误率、依赖链、主机资源</text>
      <text x="14" y="56" font-size="7.5" fill="var(--fig-text)">能判定「接口通了」，但判定不了「答得对不对」</text>

      <!-- 看不到 -->
      <rect x="6" y="70" width="328" height="60" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="84" font-size="8.5" font-weight="700" fill="#e5484d">✗ 看不到的部分</text>
      <text x="14" y="97" font-size="7.5" fill="var(--fig-text)">答得好不好：答非所问、幻觉、格式崩溃</text>
      <text x="14" y="109" font-size="7.5" fill="var(--fig-text)">token 花在哪：输入/输出/检索/重试各占多少</text>
      <text x="14" y="121" font-size="7.5" fill="var(--fig-text)">成本变化、模型或 Prompt 版本切换后的真实影响</text>

      <!-- 四类数据 -->
      <rect x="6" y="138" width="328" height="68" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="152" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">需要额外采集四类数据</text>
      <text x="14" y="165" font-size="7.5" fill="var(--fig-text)">① 上下文：Prompt 版本、检索片段、模型与参数</text>
      <text x="14" y="177" font-size="7.5" fill="var(--fig-text)">② 用量：输入/输出 token、缓存命中、单次费用</text>
      <text x="14" y="189" font-size="7.5" fill="var(--fig-text)">③ 质量：自动评分、人工反馈、拒答与截断率</text>
      <text x="14" y="201" font-size="7.5" fill="var(--fig-text)">④ 链路：RAG 召回 → 模型 → 后处理 的分段耗时</text>

      <rect x="6" y="210" width="328" height="46" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="224" font-size="7.5" fill="var(--fig-text)">指标全绿 ≠ 用户满意：质量与成本必须单独采</text>
      <text x="14" y="236" font-size="7.5" fill="var(--fig-text)">采样：费用/token 全量记，完整对话按比例抽</text>
      <text x="14" y="248" font-size="7.5" fill="var(--fig-node-c)">与 APM 的关系：不是替代，是在同一条链路上补信号</text>
    </svg>
    <figcaption>APM 能看通不通，看不到答得好不好与 token 花在哪，需补采上下文、用量、质量、链路四类数据</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
