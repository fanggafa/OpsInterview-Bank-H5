<script setup>
/**
 * Nginx 与 Apache 的并发模型对比（Nginx 分类）。
 *
 * 核心洞察：Apache 传统是「每连接一线程/进程」，Nginx 是「少量进程 + 事件循环」——
 * 这决定了高并发下的内存占用与 C10K 表现。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 264" role="img" aria-label="Apache 每连接一进程线程与 Nginx 事件驱动的高并发对比，以及各自适用场景">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">差别在并发模型：每连接一线程 vs 少量进程 + 事件循环</text>

      <rect x="6" y="20" width="160" height="76" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">Apache（prefork/worker）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">每个连接占一个进程/线程</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">内存随并发线性增长</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">C10K 后内存压力明显</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-node-c)">优势：mod_php 嵌入式、模块生态成熟</text>

      <rect x="174" y="20" width="160" height="76" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">Nginx（事件驱动）</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">少量 worker + epoll 事件循环</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">几万连接仍很省内存</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">静态资源与反代性能强</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-node-c)">劣势：动态处理要 php-fpm 分离</text>

      <rect x="6" y="104" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="117" font-size="8.5" font-weight="700" fill="#e5484d">Nginx 的坑：事件循环也会被阻塞</text>
      <text x="14" y="130" font-size="7.5" fill="var(--fig-text)">同步阻塞操作（慢磁盘、慢 upstream、同步文件读写）会拖住整个 worker</text>
      <text x="14" y="142" font-size="7.5" fill="var(--fig-node-c)">所以「Nginx 高并发」不等于「所有配置都能高并发」</text>

      <rect x="6" y="158" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="171" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">迁移要点</text>
      <text x="14" y="184" font-size="7.5" fill="var(--fig-text)">.htaccess 不生效（要手写进 location）· rewrite 语法不同 · mod_php 改 php-fpm</text>
      <text x="14" y="196" font-size="7.5" fill="var(--fig-node-c)">alias 与 root 的路径拼接规则不同（最常见 404 原因）</text>

      <rect x="6" y="212" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="225" font-size="8" font-weight="700" fill="var(--fig-node-d)">现代架构</text>
      <text x="14" y="238" font-size="7.5" fill="var(--fig-text)">Nginx 在前（抗并发/静态/代理）+ 应用服务在后，Apache 多见于历史系统</text>

      <text x="6" y="254" font-size="7.5" fill="var(--fig-muted)">排查提示：压测对比 QPS/内存/CPU，比凭印象判断靠谱得多</text>
    </svg>
    <figcaption>Apache 每连接占进程线程、内存随并发线性增长；Nginx 靠事件循环省内存，但阻塞操作会拖住整个 worker</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
