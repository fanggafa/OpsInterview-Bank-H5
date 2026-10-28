<script setup>
/**
 * HTTP 状态码分类速查图（5xx 为主）。
 * 排障时最容易混淆的就是「502 / 503 / 504 到底谁该负责」，
 * 这张图按「谁的问题」归组，而不是按数字顺序罗列。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 250" role="img" aria-label="HTTP 状态码按责任方分组：2xx 成功、3xx 重定向、4xx 客户端、5xx 服务端">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">按「谁的责任」分组，比按数字顺序死记更有用</text>

      <!-- 2xx -->
      <rect x="6" y="20" width="160" height="44" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <rect x="6" y="20" width="160" height="44" rx="5" fill="none" stroke="var(--fig-node-c)" stroke-width="1.2" />
      <text x="14" y="35" font-size="9" font-weight="700" fill="var(--fig-node-c)">2xx 成功</text>
      <text x="14" y="49" font-size="7.5" fill="var(--fig-text)">200 正常 / 201 已创建</text>
      <text x="14" y="60" font-size="7.5" fill="var(--fig-muted)">204 无内容（DELETE 常用）</text>

      <!-- 3xx -->
      <rect x="174" y="20" width="160" height="44" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <rect x="174" y="20" width="160" height="44" rx="5" fill="none" stroke="var(--fig-node-b)" stroke-width="1.2" />
      <text x="182" y="35" font-size="9" font-weight="700" fill="var(--fig-node-b)">3xx 重定向</text>
      <text x="182" y="49" font-size="7.5" fill="var(--fig-text)">301 永久（会被缓存）/ 302 临时</text>
      <text x="182" y="60" font-size="7.5" fill="var(--fig-muted)">304 未修改（走缓存，不算异常）</text>

      <!-- 4xx -->
      <rect x="6" y="70" width="328" height="52" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <rect x="6" y="70" width="328" height="52" rx="5" fill="none" stroke="var(--fig-node-d)" stroke-width="1.2" />
      <text x="14" y="86" font-size="9" font-weight="700" fill="var(--fig-node-d)">4xx 客户端问题（请求本身不对）</text>
      <text x="14" y="100" font-size="7.5" fill="var(--fig-text)">400 参数错 / 401 未认证 / 403 无权限 / 404 路径不存在 / 429 被限流</text>
      <text x="14" y="113" font-size="7" fill="var(--fig-muted)">排查方向：看请求参数、鉴权 token、路径拼写、限流配置 —— 不是服务端的锅</text>

      <!-- 5xx -->
      <rect x="6" y="128" width="328" height="76" rx="5" fill="#e5484d" opacity=".09" />
      <rect x="6" y="128" width="328" height="76" rx="5" fill="none" stroke="#e5484d" stroke-width="1.3" />
      <text x="14" y="144" font-size="9" font-weight="700" fill="#e5484d">5xx 服务端问题（这四个最常考）</text>

      <text x="14" y="159" font-size="8" fill="var(--fig-text)">500 后端代码抛异常（看应用日志）</text>
      <text x="180" y="159" font-size="8" fill="var(--fig-text)">502 网关连不上/收到无效响应</text>
      <text x="14" y="173" font-size="8" fill="var(--fig-text)">503 服务不可用（后端全摘/过载）</text>
      <text x="180" y="173" font-size="8" fill="var(--fig-text)">504 网关等后端超时</text>

      <text x="14" y="189" font-size="7.5" fill="var(--fig-node-d)">502 和 504 都是「网关视角」：502 是连不上/响应无效，504 是连上了但等太久</text>
      <text x="14" y="199" font-size="7.5" fill="var(--fig-muted)">所以查这两类要先看网关（Nginx/SLB）的日志，再看后端进程是否在</text>

      <!-- 结论 -->
      <text x="6" y="218" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">排障口诀：4xx 查请求，500 查代码，</text>
      <text x="6" y="230" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">502/504 查网关与后端连通性，503 查容量与健康检查</text>
      <text x="6" y="241" font-size="7.5" fill="var(--fig-muted)">304 属于正常缓存行为，出现在告警里通常是「采集了口径错误」，不是故障</text>
    </svg>
    <figcaption>5xx 的责任方在服务端，但「网关」和「后端应用」是两个不同的排查起点</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
