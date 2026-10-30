<script setup>
/**
 * 「是代码问题还是环境问题」的高效推进方式。
 *
 * 对应题 5433。核心洞察：争论「是谁的问题」没有产出，
 * 有效方式是**把问题变成可二分验证的假设**——用最小差异实验快速收敛。
 *
 * 画布 340 宽，文字须控制在列内（npm run check:figures 校验）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 274" role="img" aria-label="代码问题还是环境问题：用最小差异实验二分，先复现再对比，最后定位到具体差异">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">不要争论「是谁的问题」——把问题变成可验证的假设</text>

      <rect x="6" y="20" width="328" height="34" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="9" font-weight="700" fill="var(--fig-node-a)">① 先统一「事实」（不是观点）</text>
      <text x="14" y="45" font-size="8" fill="var(--fig-text)">哪个环境、哪次请求、什么报错原文、什么时间开始、能否稳定复现</text>

      <rect x="6" y="60" width="328" height="52" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="73" font-size="9" font-weight="700" fill="var(--fig-node-b)">② 用「最小差异实验」二分（核心方法）</text>
      <text x="14" y="85" font-size="8" fill="var(--fig-text)">同一份代码，换环境跑 → 出问题说明环境/配置；不出说明代码</text>
      <text x="14" y="97" font-size="8" fill="var(--fig-text)">同一个环境，换代码版本跑 → 出问题说明代码；不出说明环境</text>
      <text x="14" y="108" font-size="7.5" fill="var(--fig-node-c)">关键：一次只改一个变量，别同时换代码又换配置</text>

      <!-- 三条常见差异 -->
      <text x="6" y="128" font-size="9.5" font-weight="700" fill="var(--fig-text)">③ 环境差异的高频来源（按概率）</text>

      <text x="10" y="144" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">依赖版本</text>
      <text x="72" y="144" font-size="8" fill="var(--fig-text)">JDK / glibc / 中间件客户端版本不一致（最常见）</text>

      <text x="10" y="160" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">配置项</text>
      <text x="72" y="160" font-size="8" fill="var(--fig-text)">超时、连接数、开关、环境变量、时区</text>

      <text x="10" y="176" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">资源与限额</text>
      <text x="72" y="176" font-size="8" fill="var(--fig-text)">CPU/内存/容器 limit、文件句柄、线程数上限</text>

      <text x="10" y="192" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">网络与依赖</text>
      <text x="72" y="192" font-size="8" fill="var(--fig-text)">DNS、代理、证书、后端服务版本</text>

      <text x="10" y="208" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">数据差异</text>
      <text x="72" y="208" font-size="8" fill="var(--fig-text)">测试数据量与边界值不同（"本地能跑"最常见原因）</text>

      <!-- 协作方式 -->
      <rect x="6" y="218" width="328" height="42" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="231" font-size="9" font-weight="700" fill="var(--fig-node-d)">④ 协作姿态（决定效率）</text>
      <text x="14" y="243" font-size="8" fill="var(--fig-text)">一起看日志/链路，而不是互相转工单；先把「可复现的最小案例」造出来</text>
      <text x="14" y="255" font-size="8" fill="var(--fig-text)">结论要落到「具体差异项」上，而不是「大概是环境问题」</text>

      <text x="6" y="270" font-size="7.5" fill="var(--fig-muted)">最有说服力的一句话：「在 A 环境同样操作能复现，B 环境不能，差异是 X」</text>
    </svg>
    <figcaption>用最小差异实验二分「代码 vs 环境」，一次只改一个变量，结论落到具体差异项</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
