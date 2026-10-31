<script setup>
/**
 * Nginx 502 与 504 的区别（题 1403）。
 *
 * 核心洞察：502 是「后端回了无效响应 / 连不上」，504 是「后端没在超时内回」——
 * 前者多是进程崩了或端口不通，后者多是后端慢或超时设太短。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="Nginx 502 表示后端不可用或返回无效响应，504 表示后端超时未响应；各自常见原因">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">502 = 后端「给了坏响应/连不上」，504 = 后端「没在超时内回」</text>

      <rect x="6" y="20" width="160" height="86" rx="5" fill="#e5484d" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="#e5484d">502 Bad Gateway</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">连不上后端，或响应无效</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">① 后端进程挂了/没启动</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">② 端口不通（防火墙/监听地址）</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-text)">③ 后端提前关闭连接</text>
      <text x="14" y="94" font-size="7.5" fill="var(--fig-text)">④ upstream 地址/协议配错（http vs https）</text>

      <rect x="174" y="20" width="160" height="86" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">504 Gateway Timeout</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">后端在超时内没回</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">① 后端处理慢（DB 慢查询）</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">② 超时参数设太短</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-text)">③ 后端线程池打满排队</text>
      <text x="182" y="94" font-size="7.5" fill="var(--fig-text)">④ 后端依赖（下游）慢</text>

      <!-- 关键判断 -->
      <rect x="6" y="116" width="328" height="46" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="129" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">最快的判断方式：看后端有没有收到请求</text>
      <text x="14" y="142" font-size="7.5" fill="var(--fig-text)">后端访问日志有记录 → 是「处理慢」（看 504 方向）</text>
      <text x="14" y="154" font-size="7.5" fill="var(--fig-text)">完全没记录 → 是「连不上」（看 502 方向）</text>

      <rect x="6" y="170" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="183" font-size="8" font-weight="700" fill="var(--fig-node-b)">相关超时参数</text>
      <text x="14" y="196" font-size="7.5" fill="var(--fig-text)">proxy_connect_timeout 连不上 · proxy_read_timeout 等响应</text>

      <rect x="6" y="212" width="328" height="24" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="228" font-size="7.5" fill="var(--fig-text)">注意：把超时调大只是把 504 变成更长的等待 —— 治本要靠定位后端慢在哪</text>

      <text x="6" y="248" font-size="7.5" fill="var(--fig-muted)">查日志：error.log 会明确写 upstream timed out 或 connect() failed，比猜快</text>
    </svg>
    <figcaption>502 因连不上或响应无效（进程挂/端口不通/协议配错），504 因后端没在超时内回；看后端有无请求记录即可分流</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
