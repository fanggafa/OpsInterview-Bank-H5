<script setup>
/**
 * Deployment YAML 的结构（题 4737）。
 *
 * 核心洞察：一份 Deployment 就三层 —— 元数据、期望状态（replicas/strategy）、
 * Pod 模板；最容易写错的是 selector 与 template.labels 必须匹配。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 244" role="img" aria-label="Deployment YAML 三层结构：元数据、期望状态、Pod 模板，以及四个易错点">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">三层结构：元数据 → 期望状态 → Pod 模板</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 概要：apiVersion / kind / metadata</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">apiVersion: apps/v1 · kind: Deployment · name / namespace / labels</text>

      <rect x="6" y="58" width="328" height="46" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 期望状态：replicas / selector / strategy</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">replicas 期望副本数　·　selector 选哪些 Pod 归我管</text>
      <text x="14" y="96" font-size="7.5" fill="var(--fig-text)">strategy 滚动更新：maxSurge（最多超出）/ maxUnavailable（最多不可用）</text>

      <rect x="6" y="108" width="328" height="50" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="121" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ Pod 模板：template.metadata + spec</text>
      <text x="14" y="134" font-size="7.5" fill="var(--fig-text)">labels（必须能被 selector 选中）· containers[image/ports/resources]</text>
      <text x="14" y="146" font-size="7.5" fill="var(--fig-text)">探针（readiness/liveness）· env · volumes</text>

      <!-- 易错点 -->
      <rect x="6" y="164" width="328" height="50" rx="5" fill="#e5484d" opacity=".12" />
      <text x="14" y="177" font-size="8.5" font-weight="700" fill="#e5484d">四个最容易写错的点</text>
      <text x="14" y="190" font-size="7.5" fill="var(--fig-text)">① selector 与 template.labels 不匹配 → 直接报错</text>
      <text x="14" y="202" font-size="7.5" fill="var(--fig-text)">② selector 创建后不可改（要重建）　③ 不写 requests → 调度无依据</text>
      <text x="14" y="214" font-size="7" fill="var(--fig-node-c)">④ 用 :latest tag → 默认 Always 重拉，且无法确定性回滚</text>

      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">技巧：kubectl create deployment --dry-run=client -o yaml 生成骨架再改</text>
    </svg>
    <figcaption>Deployment YAML 三层：元数据、期望状态（replicas/selector/strategy）、Pod 模板；最易错是 selector 与 labels 不匹配</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
