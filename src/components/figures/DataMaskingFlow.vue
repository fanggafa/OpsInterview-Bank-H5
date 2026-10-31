<script setup>
/**
 * 数据脱敏：四种手法与四个插入位置（题 5838）。
 *
 * 核心洞察：脱敏不是「打星号」一种做法——掩码留格式、替换保持可读、
 * 哈希保关联、泛化降精度，先看下游要做什么再选。
 * 插入位置里网关最可靠：一处策略覆盖全部应用，且发版解耦。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 268" role="img" aria-label="脱敏四种手法、四个插入位置与网关集中脱敏为何最可靠">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">脱敏 = 去掉可识别信息，保留格式与分析价值</text>

      <!-- ① 四种方式 -->
      <rect x="6" y="18" width="328" height="70" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="32" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 四种方式</text>
      <text x="14" y="44" font-size="7.5" fill="var(--fig-text)">掩码 138****8000 —— 留格式，便于人工核对</text>
      <text x="14" y="56" font-size="7.5" fill="var(--fig-text)">替换 张三→用户A —— 保持语义可读，不可逆</text>
      <text x="14" y="68" font-size="7.5" fill="var(--fig-text)">哈希 e3b0c442… —— 可关联同值，不可还原</text>
      <text x="14" y="80" font-size="7.5" fill="var(--fig-text)">泛化 32 岁→30~40 岁、朝阳区→北京 —— 降精度</text>

      <text x="6" y="98" font-size="7.5" fill="var(--fig-node-a)">选型：跨表关联用哈希；给人读用掩码；做分析用泛化</text>

      <!-- ② 四个位置 -->
      <rect x="6" y="106" width="328" height="70" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="120" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② 四个插入位置</text>
      <text x="14" y="132" font-size="7.5" fill="var(--fig-text)">① 采集端：源头脱敏，成本最低，但要改应用</text>
      <text x="14" y="144" font-size="7.5" fill="var(--fig-text)">② 客户端：能改代码/抓包，最容易被绕过</text>
      <text x="14" y="156" font-size="7.5" fill="var(--fig-text)">③ 网关：集中策略 + 应用无感知，最可靠 ★</text>
      <text x="14" y="168" font-size="7.5" fill="var(--fig-text)">④ 模型侧：最后一道，数据其实已经出域了</text>

      <!-- 为什么网关最可靠 -->
      <rect x="6" y="188" width="328" height="46" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="202" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">为什么网关最可靠</text>
      <text x="14" y="214" font-size="7.5" fill="var(--fig-text)">一处配置覆盖日志、API、上传件；改规则不用发版</text>
      <text x="14" y="226" font-size="7.5" fill="var(--fig-text)">风险是漏配 → 规则即代码 + 上线前抽样回放验证</text>

      <text x="6" y="252" font-size="7.5" fill="var(--fig-muted)">脱敏只看日志没用：AI 网关同样会把原文写进自己的调试日志</text>
    </svg>
    <figcaption>选对脱敏方式（掩码/替换/哈希/泛化），并把策略放在网关，才能一处配置全链路生效</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
