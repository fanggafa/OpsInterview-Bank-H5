<script setup>
/**
 * Nginx / 系统排查中「CPU 高」的定位树。
 * 把 us/sy/wa/st/si 五个 CPU 时间占比与对应的排查方向直接对应起来——
 * 这是「CPU 高怎么查」这道题最需要的一张图。
 *
 * 排版注意：画布固定 340 宽，说明文字必须自己控制在列宽内。
 * 早期版本每条说明都写成一整行、写到 400+ px，超出部分被 SVG 直接裁掉，
 * 放大也看不到（用户反馈：图片内容显示不全）。现在每条拆成两行，
 * 行高 12、行距 36，画布相应加高。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 286" role="img" aria-label="CPU 使用率高时按 us、sy、wa、st、si 五种时间占比定位瓶颈">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">top 里 CPU 拆成五份，每一份指向不同的排查方向</text>

      <!-- us -->
      <rect x="6" y="20" width="328" height="32" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="41" font-size="9" font-weight="700" fill="var(--fig-node-a)">us 高</text>
      <text x="72" y="35" font-size="8.5" fill="var(--fig-text)">用户态忙 → 应用自己在算：死循环、正则回溯、</text>
      <text x="72" y="47" font-size="8.5" fill="var(--fig-text)">序列化、加密、大量计算</text>

      <!-- sy -->
      <rect x="6" y="56" width="328" height="32" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="77" font-size="9" font-weight="700" fill="var(--fig-node-b)">sy 高</text>
      <text x="72" y="71" font-size="8.5" fill="var(--fig-text)">内核态忙 → 系统调用频繁：上下文切换、连接风暴、</text>
      <text x="72" y="83" font-size="8.5" fill="var(--fig-text)">文件描述符操作、sysbench 类压测</text>

      <!-- wa -->
      <rect x="6" y="92" width="328" height="32" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="113" font-size="9" font-weight="700" fill="var(--fig-node-d)">wa 高</text>
      <text x="72" y="107" font-size="8.5" fill="var(--fig-text)">等 IO → 磁盘慢 / 打满：iostat 看 await 与 %util，</text>
      <text x="72" y="119" font-size="8.5" fill="var(--fig-text)">再查慢查询、大文件写、日志刷盘</text>

      <!-- st -->
      <rect x="6" y="128" width="328" height="32" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="143" font-size="9" font-weight="700" fill="#e5484d">st 高</text>
      <text x="14" y="155" font-size="8" fill="var(--fig-muted)">steal</text>
      <text x="72" y="143" font-size="8.5" fill="var(--fig-text)">被宿主机抢走 → 虚拟化环境专属信号：邻居 VM</text>
      <text x="72" y="155" font-size="8.5" fill="var(--fig-text)">抢 CPU / 宿主机超分过度 / 配额不足</text>

      <!-- si -->
      <rect x="6" y="164" width="328" height="32" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="185" font-size="9" font-weight="700" fill="var(--fig-node-c)">si / hi 高</text>
      <text x="72" y="179" font-size="8.5" fill="var(--fig-text)">软 / 硬中断 → 网络包量大、网卡队列不均、</text>
      <text x="72" y="191" font-size="8.5" fill="var(--fig-text)">DDoS、iptables 规则过多</text>

      <!-- 下一步 -->
      <text x="6" y="214" font-size="9.5" font-weight="700" fill="var(--fig-text)">确认方向后的下一步</text>
      <text x="6" y="228" font-size="8.5" fill="var(--fig-text)">us 高 → top -H 找线程 → jstack / pstack 对照栈 →</text>
      <text x="6" y="240" font-size="8.5" fill="var(--fig-text)">　　　 定位到具体方法 / 正则</text>
      <text x="6" y="253" font-size="8.5" fill="var(--fig-text)">sy 高 → vmstat 看 cs（上下文切换）→ pidstat -w 找切换大户</text>
      <text x="6" y="266" font-size="8.5" fill="var(--fig-text)">wa 高 → iostat -x 1 → 找 %util 高的盘与写它的进程</text>
      <text x="6" y="279" font-size="8.5" fill="var(--fig-node-c)">st 高 → 找宿主机管理员（这台机器上你做什么都没用）</text>
    </svg>
    <figcaption>「CPU 100%」不是结论，先看是 us/sy/wa/st 哪一种——它决定了该往哪里查</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
