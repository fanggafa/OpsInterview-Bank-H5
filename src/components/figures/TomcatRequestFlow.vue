<script setup>
/**
 * Tomcat 核心组件与一个 HTTP 请求的处理流程（题 1802）。
 *
 * 核心洞察：请求在 Tomcat 内要经过 Connector → Engine → Host → Context → Wrapper，
 * 这条链解释了「配置该写在哪一层」和「为什么 context path 会影响访问」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 276" role="img" aria-label="Tomcat 组件层级：Connector 接收请求、Engine、Host、Context、Wrapper 依次匹配，最终交给 Servlet">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">请求依次穿过：Connector → Engine → Host → Context → Wrapper</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">Connector</text>
      <text x="86" y="33" font-size="7.5" fill="var(--fig-text)">监听端口、解析 HTTP、管理线程池（maxThreads）</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-node-c)">Coyote 实现；AJP 是另一种 Connector（建议关闭）</text>

      <text x="168" y="60" font-size="8" fill="var(--fig-muted)">↓</text>

      <rect x="6" y="66" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="83" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700" fill="var(--fig-node-b)">Engine</tspan>　按 Host（域名）路由</text>

      <rect x="6" y="98" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="115" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700" fill="var(--fig-node-c)">Host</tspan>　虚拟主机；一个 Host 可含多个 Context</text>

      <rect x="6" y="130" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="147" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700" fill="var(--fig-node-d)">Context</tspan>　一个 Web 应用 = context path（如 /app）</text>

      <rect x="6" y="162" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="179" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700" fill="var(--fig-node-a)">Wrapper</tspan>　最内层，对应一个 Servlet + Filter 链</text>

      <!-- 关键点 -->
      <rect x="6" y="196" width="328" height="30" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="209" font-size="8" font-weight="700" fill="#e5484d">为什么 context path 影响访问</text>
      <text x="14" y="221" font-size="7.5" fill="var(--fig-text)">应用部署在 /app 时，访问 `/` 会 404 —— URL 必须带 context path</text>

      <rect x="6" y="232" width="328" height="20" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="246" font-size="7.5" fill="var(--fig-node-c)">也可以把 context path 设为空（ROOT），但多应用时容易冲突</text>

      <text x="6" y="264" font-size="7.5" fill="var(--fig-muted)">排查提示：404 先看访问路径是否带 context path；慢请求先看 Connector 线程池是否打满</text>
    </svg>
    <figcaption>请求依次经过 Connector → Engine → Host → Context → Wrapper；这决定了配置层级与 context path 的访问规则</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
