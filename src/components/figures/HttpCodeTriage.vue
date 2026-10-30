<script setup>
/**
 * HTTP 状态码分类与「谁的问题」分流（题 4411）。
 *
 * 核心洞察：排障第一步是分清「客户端问题、服务端问题、还是网关与后端之间的问题」；
 * 401/403 差在「是否已认证」，502/504 差在「连不上 vs 等超时」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 292" role="img" aria-label="HTTP 状态码五类与常见错误排查：401 未认证、403 无权限、404 不存在、429 限流、502 上游连不上、503 不可用、504 上游超时">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">排障第一步：先分清是谁的问题（客户端 / 服务端 / 网关与上游之间）</text>

      <!-- 五类 -->
      <rect x="6" y="20" width="328" height="22" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="34" font-size="7.5" fill="var(--fig-text)">1xx 信息　·　2xx 成功　·　3xx 重定向　·　4xx 客户端错　·　5xx 服务端错</text>

      <!-- 4xx -->
      <text x="6" y="58" font-size="9" font-weight="700" fill="var(--fig-node-c)">4xx：通常是客户端/权限问题（先别怀疑服务端）</text>

      <rect x="6" y="66" width="328" height="46" rx="4" fill="var(--fig-node-c)" opacity=".08" />
      <text x="14" y="78" font-size="7.5" font-weight="700" fill="var(--fig-node-c)">401 未认证</text>
      <text x="82" y="78" font-size="7.5" fill="var(--fig-text)">缺 token/cookie、token 过期、没带 Authorization 头</text>
      <text x="14" y="90" font-size="7.5" font-weight="700" fill="var(--fig-node-c)">403 已认证但无权限</text>
      <text x="112" y="90" font-size="7.5" fill="var(--fig-text)">账号权限、WAF 拦截、目录权限、SELinux</text>
      <text x="14" y="102" font-size="7.5" font-weight="700" fill="var(--fig-node-c)">404 资源不存在</text>
      <text x="96" y="102" font-size="7.5" fill="var(--fig-text)">路由配置、文件路径、SPA 缺 try_files</text>

      <rect x="6" y="116" width="328" height="24" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="132" font-size="7.5" font-weight="700" fill="var(--fig-node-d)">429 被限流</text>
      <text x="76" y="132" font-size="7.5" fill="var(--fig-text)">超出 QPS/并发限制、WAF CC 防护触发（看响应头 Retry-After）</text>

      <!-- 5xx -->
      <text x="6" y="158" font-size="9" font-weight="700" fill="#e5484d">5xx：服务端或网关与上游之间（重点区分三兄弟）</text>

      <rect x="6" y="166" width="328" height="66" rx="4" fill="#e5484d" opacity=".08" />
      <text x="14" y="178" font-size="7.5" font-weight="700" fill="#e5484d">502 Bad Gateway</text>
      <text x="102" y="178" font-size="7.5" fill="var(--fig-text)">网关连不上上游 / 上游响应非法 / 上游提前关闭</text>
      <text x="14" y="192" font-size="7.5" font-weight="700" fill="#e5484d">503 Service Unavailable</text>
      <text x="130" y="192" font-size="7.5" fill="var(--fig-text)">服务未就绪、过载、被摘除、正在发布</text>
      <text x="14" y="206" font-size="7.5" font-weight="700" fill="#e5484d">504 Gateway Timeout</text>
      <text x="126" y="206" font-size="7.5" fill="var(--fig-text)">连上了上游但等太久（上游慢或超时设置不当）</text>
      <text x="14" y="222" font-size="7.5" fill="var(--fig-node-c)">关键区分：502 = 没连上/响应坏；504 = 连上了但超时</text>

      <!-- 排查顺序 -->
      <rect x="6" y="240" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="253" font-size="8" font-weight="700" fill="var(--fig-node-a)">排查顺序</text>
      <text x="70" y="253" font-size="7.5" fill="var(--fig-text)">先看「谁返回的」（Nginx 日志 vs 应用日志）→ 再看上游是否可达</text>
      <text x="14" y="265" font-size="7.5" fill="var(--fig-text)">网关侧：error.log 的 upstream 关键字 · 直连上游验证 · 上游应用日志同时段</text>

      <text x="6" y="284" font-size="7.5" fill="var(--fig-muted)">加分点：主动提「401 与 403 的区别是有没有认证过」，能立刻显出专业度</text>
    </svg>
    <figcaption>状态码先分「谁的问题」：401/403 是认证与授权、502/504 是网关连不上与等超时</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
