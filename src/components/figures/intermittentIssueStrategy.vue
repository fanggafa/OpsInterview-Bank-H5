<script setup>
/**
 * 「偶发问题」的系统性排查图。
 *
 * 对应题 5439。核心洞察：偶发问题不能靠「复现」，要靠「留证据」——
 * 先把模糊现象定义清楚，再把不可见的变成可观测的。
 *
 * 画布 340 宽，文字须控制在列内（npm run check:figures 校验）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 264" role="img" aria-label="偶发问题的排查策略：先精确定义现象，再补可观测性留证据，最后等它发生时抓现场">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">偶发问题的策略：不靠复现，靠留证据</text>

      <!-- Step 1 -->
      <rect x="6" y="20" width="328" height="52" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="9" font-weight="700" fill="var(--fig-node-a)">Step 1：把「偶发」定义清楚（最重要）</text>
      <text x="14" y="45" font-size="8" fill="var(--fig-text)">频率（一周一次 / 一天几次）· 共同特征（时段 / 流量 / 用户）</text>
      <text x="14" y="57" font-size="8" fill="var(--fig-text)">报错原文 · 影响面（用户可感知还是只有日志里）</text>
      <text x="14" y="68" font-size="7.5" fill="var(--fig-node-c)">很多「偶发」在精确定义之后，就不偶发了</text>

      <!-- Step 2 -->
      <rect x="6" y="78" width="328" height="70" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="91" font-size="9" font-weight="700" fill="var(--fig-node-b)">Step 2：把「不可见」变成「可见」</text>

      <text x="16" y="105" font-size="8" font-weight="700" fill="var(--fig-node-c)">加日志</text>
      <text x="76" y="105" font-size="8" fill="var(--fig-text)">关键路径的输入、状态、耗时（注意脱敏）</text>

      <text x="16" y="119" font-size="8" font-weight="700" fill="var(--fig-node-c)">加指标</text>
      <text x="76" y="119" font-size="8" fill="var(--fig-text)">给「可疑点」加计数与分布（不能只有平均值）</text>

      <text x="16" y="133" font-size="8" font-weight="700" fill="var(--fig-node-c)">留现场</text>
      <text x="76" y="133" font-size="8" fill="var(--fig-text)">慢请求 trace 全采、异常时自动 dump、保留现场</text>

      <text x="16" y="145" font-size="7.5" fill="var(--fig-muted)">原则：宁可多留证据（事后可删），也不要发生时什么都没有</text>

      <!-- Step 3 -->
      <rect x="6" y="154" width="328" height="44" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="167" font-size="9" font-weight="700" fill="var(--fig-node-c)">Step 3：等它发生，抓现场并固化</text>
      <text x="14" y="179" font-size="8" fill="var(--fig-text)">发生瞬间：保存线程栈 / 堆 / 相关日志，记录精确时间点</text>
      <text x="14" y="191" font-size="8" fill="var(--fig-text)">定位后 → 把「这次的排查手段」固化成告警或看板（下次自动发现）</text>

      <!-- 反模式 -->
      <rect x="6" y="204" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="217" font-size="9" font-weight="700" fill="#e5484d">反模式（常见但无效）</text>
      <text x="14" y="229" font-size="8" fill="var(--fig-text)">✗ 一直盯着等它复现　　✗ 直接重启「先恢复再说」</text>
      <text x="14" y="241" font-size="8" fill="var(--fig-text)">✗ 只加「更多日志」但不加指标（量太大反而看不到）</text>

      <text x="6" y="260" font-size="8" fill="var(--fig-muted)">偶发问题的成本核心在「观测窗口」——先让它可见，再谈定位</text>
    </svg>
    <figcaption>偶发问题靠「定义 → 观测 → 抓现场 → 固化」，而不是靠反复重试碰运气</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
