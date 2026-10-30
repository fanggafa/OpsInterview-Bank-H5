<script setup>
/**
 * Java 应用 CPU 100% 如何定位到具体代码行（题 1811）。
 *
 * 核心洞察：关键是「把最忙的线程号转成十六进制」去 jstack 里对上 nid，
 * 再拿线程栈的方法名回到代码 —— 这是唯一能量化到行号的路径。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 284" role="img" aria-label="CPU 100% 定位流程：top -H 找最忙线程、转十六进制、jstack 对 nid、看栈顶方法、回到代码">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">关键动作：把「最忙的线程号」转成十六进制，去 jstack 里对 nid</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① top -Hp &lt;pid&gt;</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">按 CPU 排序，记下占用最高的线程 PID（十进制的线程号）</text>

      <rect x="6" y="56" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="69" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 转成十六进制</text>
      <text x="14" y="81" font-size="7.5" fill="var(--fig-text)">printf "%x\n" &lt;线程号&gt;　→ jstack 输出里的 nid=0x… 就是这个值</text>

      <rect x="6" y="92" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="105" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ jstack &lt;pid&gt; | grep -A30 nid=0x&lt;hex&gt;</text>
      <text x="14" y="117" font-size="7.5" fill="var(--fig-text)">拿到该线程的完整调用栈</text>

      <rect x="6" y="128" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="141" font-size="8" font-weight="700" fill="var(--fig-node-d)">④ 看栈顶的「业务方法」</text>
      <text x="14" y="153" font-size="7.5" fill="var(--fig-text)">忽略 JDK 底层帧，找到第一个你自己的类名 + 行号</text>

      <!-- 常见原因 -->
      <rect x="6" y="164" width="328" height="52" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="177" font-size="8.5" font-weight="700" fill="#e5484d">CPU 高的四类常见原因</text>
      <text x="14" y="190" font-size="7.5" fill="var(--fig-text)">① 死循环 / 正则回溯（栈停在同一个方法不变）</text>
      <text x="14" y="202" font-size="7.5" fill="var(--fig-text)">② 频繁 GC（多个线程都在 GC 任务里）　③ 计算密集/序列化大对象</text>
      <text x="14" y="214" font-size="7.5" fill="var(--fig-text)">④ 线程数暴涨（上下文切换多，看 vmstat 的 cs）</text>

      <rect x="6" y="226" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="239" font-size="8" font-weight="700" fill="var(--fig-node-a)">确认是不是 GC 造成的</text>
      <text x="14" y="251" font-size="7.5" fill="var(--fig-text)">jstat -gcutil 1s：GCT 占比高、FGC 频繁 → 先解决 GC 再看业务代码</text>

      <text x="6" y="274" font-size="7.5" fill="var(--fig-muted)">易混点：进程 CPU 高 ≠ 某线程高；先按线程拆分（top -Hp）才有意义</text>
    </svg>
    <figcaption>top -Hp 找最忙线程 → 转十六进制 → jstack 对 nid → 看栈顶业务方法；栈不变多是死循环，多线程在 GC 里则先治 GC</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
