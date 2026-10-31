<script setup>
/**
 * Nginx 核心模块与常用模块（题 2118）。
 *
 * 核心洞察：Nginx 是「core 内核 + 一堆模块」的拼装式架构 —— worker 进程里跑着
 * epoll 事件循环，所有功能（代理/限流/压缩/日志）都是挂上去的模块；
 * 而「最大并发」不是某个模块的功能，是 worker_processes × worker_connections 的乘积。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 284" role="img" aria-label="Nginx 的 core 内核与 http 常用模块分组，以及 worker_processes 乘 worker_connections 得到的并发上限">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">核心 + 模块：能做的事几乎全靠模块</text>

      <defs>
        <marker id="arrNgx" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-a)" />
        </marker>
      </defs>

      <!-- worker 进程（core 内核） -->
      <rect x="6" y="20" width="196" height="84" rx="6" fill="var(--fig-node-a)" opacity=".12" />
      <rect x="6" y="20" width="196" height="84" rx="6" fill="none" stroke="var(--fig-node-a)" stroke-width="1.3" />
      <text x="14" y="34" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">worker 进程（单线程事件循环）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-muted)">ngx_core / ngx_events 打底</text>

      <rect x="14" y="54" width="84" height="30" rx="4" fill="var(--fig-node-b)" opacity=".14" />
      <text x="56" y="66" text-anchor="middle" font-size="8" font-weight="700" fill="var(--fig-node-b)">ngx_core</text>
      <text x="56" y="77" text-anchor="middle" font-size="7" fill="var(--fig-muted)">进程·配置·日志</text>

      <rect x="106" y="54" width="84" height="30" rx="4" fill="var(--fig-node-c)" opacity=".14" />
      <text x="148" y="66" text-anchor="middle" font-size="8" font-weight="700" fill="var(--fig-node-c)">ngx_events</text>
      <text x="148" y="77" text-anchor="middle" font-size="7" fill="var(--fig-muted)">epoll·连接数</text>

      <text x="14" y="98" font-size="7.5" fill="var(--fig-text)">ngx_http_core：server/location 匹配、listen</text>

      <!-- 并发上限公式 -->
      <rect x="210" y="20" width="124" height="84" rx="6" fill="var(--fig-node-d)" opacity=".12" />
      <rect x="210" y="20" width="124" height="84" rx="6" fill="none" stroke="var(--fig-node-d)" stroke-width="1.3" />
      <text x="218" y="34" font-size="8" font-weight="700" fill="var(--fig-node-d)">并发上限怎么算</text>
      <text x="218" y="48" font-size="7.5" fill="var(--fig-text)">worker_processes</text>
      <text x="218" y="60" font-size="7.5" fill="var(--fig-text)">× worker_connections</text>
      <text x="218" y="74" font-size="7.5" font-weight="700" fill="var(--fig-node-d)">= 总并发上限</text>
      <text x="218" y="88" font-size="7" fill="var(--fig-muted)">最终受 ulimit -n 限制</text>

      <!-- 箭头：worker 内挂载模块 -->
      <path d="M104 104 L104 116" stroke="var(--fig-node-a)" stroke-width="1.4" marker-end="url(#arrNgx)" />

      <!-- http 块内的模块分组（包含关系） -->
      <rect x="6" y="118" width="328" height="102" rx="6" fill="none" stroke="var(--fig-stroke)" stroke-width="1.2" stroke-dasharray="4 3" />
      <text x="170" y="130" font-size="8" font-weight="700" fill="var(--fig-muted)">http 块内常用模块</text>

      <rect x="9" y="136" width="73" height="38" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="13" y="147" font-size="7.5" font-weight="700" fill="var(--fig-node-a)">代理/负载</text>
      <text x="13" y="159" font-size="7" fill="var(--fig-text)">proxy_pass</text>
      <text x="13" y="170" font-size="7" fill="var(--fig-muted)">upstream</text>

      <rect x="92" y="136" width="73" height="38" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="96" y="147" font-size="7.5" font-weight="700" fill="var(--fig-node-b)">限流</text>
      <text x="96" y="159" font-size="7" fill="var(--fig-text)">limit_req</text>
      <text x="96" y="170" font-size="7" fill="var(--fig-muted)">limit_conn</text>

      <rect x="175" y="136" width="73" height="38" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="179" y="147" font-size="7.5" font-weight="700" fill="var(--fig-node-c)">安全</text>
      <text x="179" y="159" font-size="7" fill="var(--fig-text)">allow/deny</text>
      <text x="179" y="170" font-size="7" fill="var(--fig-muted)">ssl_cert</text>

      <rect x="258" y="136" width="73" height="38" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="262" y="147" font-size="7.5" font-weight="700" fill="var(--fig-node-d)">日志</text>
      <text x="262" y="159" font-size="7" fill="var(--fig-text)">access_log</text>
      <text x="262" y="170" font-size="7" fill="var(--fig-muted)">log_format</text>

      <rect x="9" y="180" width="73" height="38" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="13" y="191" font-size="7.5" font-weight="700" fill="var(--fig-node-b)">重写</text>
      <text x="13" y="203" font-size="7" fill="var(--fig-text)">rewrite</text>
      <text x="13" y="214" font-size="7" fill="var(--fig-muted)">return 301</text>

      <rect x="92" y="180" width="73" height="38" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="96" y="191" font-size="7.5" font-weight="700" fill="var(--fig-node-c)">静态</text>
      <text x="96" y="203" font-size="7" fill="var(--fig-text)">root/alias</text>
      <text x="96" y="214" font-size="7" fill="var(--fig-muted)">autoindex</text>

      <rect x="175" y="180" width="73" height="38" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="179" y="191" font-size="7.5" font-weight="700" fill="var(--fig-node-a)">内容</text>
      <text x="179" y="203" font-size="7" fill="var(--fig-text)">gzip on</text>
      <text x="179" y="214" font-size="7" fill="var(--fig-muted)">add_header</text>

      <rect x="258" y="180" width="73" height="38" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="262" y="191" font-size="7.5" font-weight="700" fill="var(--fig-node-d)">缓存</text>
      <text x="262" y="203" font-size="7" fill="var(--fig-text)">proxy_cache</text>
      <text x="262" y="214" font-size="7" fill="var(--fig-muted)">cache_valid</text>

      <!-- 坑 -->
      <rect x="6" y="226" width="328" height="42" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="238" font-size="8.5" font-weight="700" fill="#e5484d">两个高频坑</text>
      <text x="14" y="250" font-size="7.5" fill="var(--fig-text)">反代一个请求占2个连接，实际并发只有一半</text>
      <text x="14" y="262" font-size="7" fill="var(--fig-muted)">ulimit -n 不够时，调大 worker_connections 也没用</text>

      <text x="6" y="278" font-size="7.5" fill="var(--fig-muted)">装新模块要重编译，或用动态模块 load_module 加载</text>
    </svg>
    <figcaption>core 只提供进程与事件循环，功能全靠模块；并发上限 = worker_processes × worker_connections，再被 fd 上限卡住</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
