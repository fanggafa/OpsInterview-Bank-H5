<script setup>
/**
 * Nginx / 系统排查中「CPU 高」的定位树。
 * 把 us/sy/wa/st/si 五个 CPU 时间占比与对应的排查方向直接对应起来——
 * 这是「CPU 高怎么查」这道题最需要的一张图。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 232" role="img" aria-label="CPU 使用率高时按 us、sy、wa、st、si 五种时间占比定位瓶颈">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">top 里 CPU 拆成五份，每一份指向不同的排查方向</text>

      <!-- us -->
      <rect x="6" y="20" width="328" height="24" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="35" font-size="9" font-weight="700" fill="var(--fig-node-a)">us 高</text>
      <text x="66" y="35" font-size="8.5" fill="var(--fig-text)">用户态忙 → 应用自己在算：死循环、正则回溯、序列化、加密、大量计算</text>

      <!-- sy -->
      <rect x="6" y="48" width="328" height="24" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="63" font-size="9" font-weight="700" fill="var(--fig-node-b)">sy 高</text>
      <text x="66" y="63" font-size="8.5" fill="var(--fig-text)">内核态忙 → 系统调用频繁：上下文切换、连接风暴、文件描述符操作、sysbench 类压测</text>

      <!-- wa -->
      <rect x="6" y="76" width="328" height="24" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="91" font-size="9" font-weight="700" fill="var(--fig-node-d)">wa 高</text>
      <text x="66" y="91" font-size="8.5" fill="var(--fig-text)">等 IO → 磁盘慢/打满：iostat 看 await 与 %util，查慢查询、大文件写、日志刷盘</text>

      <!-- st -->
      <rect x="6" y="104" width="328" height="24" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="119" font-size="9" font-weight="700" fill="#e5484d">st 高（steal）</text>
      <text x="66" y="119" font-size="8.5" fill="var(--fig-text)">被宿主机抢走 → 虚拟化环境专属信号：邻居 VM 抢 CPU / 宿主机超分过度 / 配额不足</text>

      <!-- si -->
      <rect x="6" y="132" width="328" height="24" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="147" font-size="9" font-weight="700" fill="var(--fig-node-c)">si / hi 高</text>
      <text x="66" y="147" font-size="8.5" fill="var(--fig-text)">软/硬中断 → 网络包量大、网卡队列不均、DDoS、iptables 规则过多</text>

      <!-- 下一步 -->
      <text x="6" y="172" font-size="9.5" font-weight="700" fill="var(--fig-text)">确认方向后的下一步</text>
      <text x="6" y="186" font-size="8.5" fill="var(--fig-text)">us 高 → top -H 找线程 → jstack/pstack 对照栈 → 定位到具体方法/正则</text>
      <text x="6" y="199" font-size="8.5" fill="var(--fig-text)">sy 高 → vmstat 看 cs（上下文切换）→ pidstat -w 找切换大户</text>
      <text x="6" y="212" font-size="8.5" fill="var(--fig-text)">wa 高 → iostat -x 1 → 找 %util 高的盘与写它的进程（iotop）</text>
      <text x="6" y="225" font-size="8.5" fill="var(--fig-node-c)">st 高 → 找宿主机管理员（这台机器上你做什么都没用）</text>
    </svg>
    <figcaption>「CPU 100%」不是结论，先看是 us/sy/wa/st 哪一种——它决定了该往哪里查</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
