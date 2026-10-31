<script setup>
/**
 * 线上 Python 服务 CPU 100% 与卡住的定位（题 5608）。
 *
 * 核心洞察：CPU 高看「热点在哪」，卡住看「卡在等什么」；
 * 两者的工具与判读方式完全不同，混着查会浪费大量时间。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 250" role="img" aria-label="CPU 100% 用 py-spy top 找热点，卡住用 py-spy dump 看等待栈；以及最常见的五类原因">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">CPU 高看「热点在哪」，卡住看「卡在等什么」——先分清症状</text>

      <rect x="6" y="20" width="160" height="70" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">CPU 100%</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">top -Hp &lt;pid&gt; 找忙线程</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">py-spy top --pid（实时热点）</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">py-spy record（火焰图）</text>
      <text x="14" y="82" font-size="7" fill="var(--fig-node-c)">无侵入，生产可直接用</text>

      <rect x="174" y="20" width="160" height="70" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">卡住 / 全超时</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">py-spy dump --pid（看栈）</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">kill -USR1（需注册 faulthandler）</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">看是等锁还是等 I/O</text>
      <text x="182" y="82" font-size="7" fill="var(--fig-node-c)">栈停在 lock/read 是线索</text>

      <!-- CPU 高原因 -->
      <rect x="6" y="102" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="115" font-size="8" font-weight="700" fill="var(--fig-node-c)">CPU 高的常见原因</text>
      <text x="14" y="127" font-size="7.5" fill="var(--fig-text)">死循环 · 正则回溯爆炸 · 大 JSON 序列化 · 循环里做 O(n) 查询（if x in list）</text>

      <!-- 卡住原因 -->
      <rect x="6" y="140" width="328" height="52" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="153" font-size="8.5" font-weight="700" fill="#e5484d">卡住的五类原因（按频率）</text>
      <text x="14" y="166" font-size="7.5" fill="var(--fig-text)">① 等锁（死锁）② **等 I/O 无超时**（最常见：requests 不设 timeout 会永久等）</text>
      <text x="14" y="178" font-size="7.5" fill="var(--fig-text)">③ 事件循环被同步调用阻塞　④ GIL 争抢　⑤ GC 停顿</text>
      <text x="14" y="190" font-size="7" fill="var(--fig-node-c)">排查顺序：先看栈停在什么调用上，再对号入座</text>

      <rect x="6" y="202" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="215" font-size="8" font-weight="700" fill="var(--fig-node-d)">必须的预防（比排查更省事）</text>
      <text x="14" y="227" font-size="7.5" fill="var(--fig-text)">所有外部调用设超时 · faulthandler.enable() · 生产常备 py-spy</text>

      <text x="6" y="246" font-size="7.5" fill="var(--fig-muted)">反模式：先重启「先恢复再说」——现场没了，下次还会复现</text>
    </svg>
    <figcaption>CPU 高用 py-spy top/record 找热点，卡住用 py-spy dump 看等待栈；最常见根因是调用外部接口没设超时</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
