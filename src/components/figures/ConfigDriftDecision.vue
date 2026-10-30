<script setup>
/**
 * 「一台机器配置与其他不一致，但一直没出问题」的处理决策。
 *
 * 对应题 5430。核心洞察：不一致本身不是问题，**盲目统一反而会出事**——
 * 这台机器可能正是因为少了那个参数，才躲过了别人的故障。
 * 所以顺序是「先搞清楚为什么不同 → 评估风险 → 再决定怎么统一」。
 *
 * 画布 340 宽，文字须控制在列内（npm run check:figures 校验）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 278" role="img" aria-label="配置不一致的处置决策：先查为什么不同，评估影响，再决定对齐或保留并纳入文档">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">「一直没出问题」本身就是一条线索，不要急着「统一」</text>

      <!-- 关键认知 -->
      <rect x="6" y="20" width="328" height="34" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="9" font-weight="700" fill="var(--fig-node-a)">先别动：不一致可能是「好事」</text>
      <text x="14" y="45" font-size="8" fill="var(--fig-text)">它少了某个参数却一直正常 → 可能别人有那个参数才触发了问题</text>

      <!-- Step 1 -->
      <rect x="6" y="60" width="328" height="52" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="73" font-size="9" font-weight="700" fill="var(--fig-node-b)">① 查「为什么不同」（最容易被跳过）</text>
      <text x="14" y="85" font-size="8" fill="var(--fig-text)">是历史遗留？手工改过？自动化漏掉了这台？新机器没同步？</text>
      <text x="14" y="97" font-size="8" fill="var(--fig-text)">从 git 历史、变更记录、机器上线时间、配置管理日志里找答案</text>
      <text x="14" y="108" font-size="7.5" fill="var(--fig-node-c)">知道原因，才知道「统一」会带来什么后果</text>

      <!-- Step 2 -->
      <rect x="6" y="118" width="328" height="52" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="131" font-size="9" font-weight="700" fill="var(--fig-node-c)">② 评估「这个参数」的实际作用</text>
      <text x="14" y="143" font-size="8" fill="var(--fig-text)">查文档：它控制什么、默认值是什么、在什么条件下起作用</text>
      <text x="14" y="155" font-size="8" fill="var(--fig-text)">对照其他机器的表现：有它的机器是否在某些场景下更差/更好</text>
      <text x="14" y="166" font-size="7.5" fill="var(--fig-node-c)">结论可能是：这台的「不全」反而是当前更优的配置</text>

      <!-- Step 3 决策 -->
      <text x="6" y="186" font-size="9.5" font-weight="700" fill="var(--fig-text)">③ 三种决策（不是无脑对齐）</text>

      <rect x="6" y="193" width="106" height="46" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="12" y="205" font-size="8" font-weight="700" fill="var(--fig-node-a)">补齐到这台的配置</text>
      <text x="12" y="217" font-size="7.5" fill="var(--fig-text)">确认参数确实必要</text>
      <text x="12" y="227" font-size="7.5" fill="var(--fig-text)">→ 加参数 + 灰度验证</text>
      <text x="12" y="236" font-size="7.5" fill="var(--fig-node-c)">先小范围，别一次全量</text>

      <rect x="117" y="193" width="106" height="46" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="123" y="205" font-size="8" font-weight="700" fill="var(--fig-node-c)">把这台当作基准</text>
      <text x="123" y="217" font-size="7.5" fill="var(--fig-text)">确认少了更好</text>
      <text x="123" y="227" font-size="7.5" fill="var(--fig-text)">→ 推动所有机器对齐</text>
      <text x="123" y="236" font-size="7.5" fill="var(--fig-node-c)">要有数据支撑</text>

      <rect x="228" y="193" width="106" height="46" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="234" y="205" font-size="8" font-weight="700" fill="var(--fig-node-d)">保持差异</text>
      <text x="234" y="217" font-size="7.5" fill="var(--fig-text)">差异有正当理由</text>
      <text x="234" y="227" font-size="7.5" fill="var(--fig-text)">→ 写进文档与例外清单</text>
      <text x="234" y="236" font-size="7.5" fill="var(--fig-node-c)">否则下次还会「被统一」</text>

      <!-- 收尾 -->
      <rect x="6" y="246" width="328" height="22" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="260" font-size="8" fill="var(--fig-text)">无论哪种，都要「消除下次的漂移」：配置进版本管理、加基线巡检</text>

      <text x="6" y="270" font-size="7.5" fill="var(--fig-muted)">最差做法：直接手工改成一致，不记录、不验证</text>
    </svg>
    <figcaption>配置不一致先别急着统一：查清原因、评估参数作用，再在「补齐/以它为基准/保留为例外」里选一个</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
