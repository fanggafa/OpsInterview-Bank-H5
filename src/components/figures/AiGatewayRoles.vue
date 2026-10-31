<script setup>
/**
 * AI 网关的角色（题 5825）。
 *
 * 核心洞察：网关的价值不在「转发」，而在把散落在各应用的密钥、限流、
 * 模型选路、成本计量全部收口——「没有网关时连钱花在哪个团队都答不上来」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="无网关时各应用直连模型的混乱，与有网关时六项能力统一收口">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">网关 = 应用与模型之间唯一的出入口</text>

      <!-- 无网关 -->
      <rect x="6" y="18" width="328" height="44" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="32" font-size="8.5" font-weight="700" fill="#e5484d">没有网关：每个应用自己接</text>
      <text x="14" y="44" font-size="7.5" fill="var(--fig-text)">密钥散落在各仓库、各自重试、成本无法归集</text>
      <text x="14" y="56" font-size="7.5" fill="var(--fig-text)">没有统一限流 → 一家跑飞就拖垮全部配额</text>

      <!-- 有网关 -->
      <rect x="6" y="70" width="328" height="40" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="84" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">有网关：一个入口收口</text>
      <text x="14" y="96" font-size="7.5" fill="var(--fig-text)">应用只认一个兼容地址；密钥、限流、日志都收在这里</text>

      <!-- 六项能力 -->
      <rect x="6" y="118" width="328" height="76" rx="4" fill="var(--fig-node-b)" opacity=".14" />
      <text x="14" y="132" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">六项能力</text>
      <text x="14" y="145" font-size="7.5" fill="var(--fig-text)">① 统一接口　② 密钥托管　③ 配额与限流</text>
      <text x="14" y="157" font-size="7.5" fill="var(--fig-text)">④ 路由与降级：主备模型切换、按价格/时延选路</text>
      <text x="14" y="169" font-size="7.5" fill="var(--fig-text)">⑤ 可观测：token、延迟、成本按团队归集</text>
      <text x="14" y="181" font-size="7.5" fill="var(--fig-text)">⑥ 安全：脱敏、注入过滤、内容审查、缓存隔离</text>

      <!-- 一句话 -->
      <rect x="6" y="202" width="328" height="44" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="216" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">一句话</text>
      <text x="14" y="228" font-size="7.5" fill="var(--fig-text)">价值不在「转发」，而在把不可见的消耗变成可管可算</text>
      <text x="14" y="240" font-size="7.5" fill="var(--fig-text)">没有网关时，连「这个月钱花在哪个团队」都答不上来</text>
    </svg>
    <figcaption>网关把密钥、配额、路由、成本与安全收口到一处，让 LLM 调用从「各接各家」变成可管可算</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
