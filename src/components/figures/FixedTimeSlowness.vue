<script setup>
/**
 * 「平时 200ms，每天固定时间变 5 秒」的排查图。
 *
 * 对应题 5405。核心洞察：固定时间 = 一定有「那个时刻才会发生的事」，
 * 排查路线是「对齐时间轴 → 找到同一时刻的其他事件」。
 *
 * 画布 340 宽，文字须控制在列内（npm run check:figures 校验）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 266" role="img" aria-label="固定时间变慢的排查：确认时间规律、对齐时间轴、找出同一时刻的其他事件">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">「固定时间」是强线索：那一刻一定有别的事在发生</text>

      <rect x="6" y="20" width="328" height="32" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="9" font-weight="700" fill="var(--fig-node-a)">① 先确认规律的「形状」</text>
      <text x="14" y="45" font-size="8" fill="var(--fig-text)">同一天内每次都是同一时刻？还是「相对某个事件之后」？持续多久？</text>

      <rect x="6" y="58" width="328" height="46" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="71" font-size="9" font-weight="700" fill="var(--fig-node-b)">② 把「慢」发生的时刻，和其他事件对齐</text>
      <text x="14" y="84" font-size="8" fill="var(--fig-text)">慢请求时间戳 · GC 日志 · 慢查询日志 · 备份/任务日志 · 发布记录</text>
      <text x="14" y="96" font-size="8" fill="var(--fig-node-c)">对齐后通常能直接看到「谁和它撞在一起」</text>

      <text x="6" y="120" font-size="9.5" font-weight="700" fill="var(--fig-text)">③ 按「撞车类型」分流</text>

      <text x="10" y="136" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">任务撞车</text>
      <text x="76" y="136" font-size="8" fill="var(--fig-text)">备份 / 对账 / 统计 与在线请求抢 CPU、IO、DB 连接</text>

      <text x="10" y="152" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">缓存集中过期</text>
      <text x="76" y="152" font-size="8" fill="var(--fig-text)">整点刷新一批 key → 回源把下游打满</text>

      <text x="10" y="168" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">连接池被占</text>
      <text x="76" y="168" font-size="8" fill="var(--fig-text)">批处理长时间占用 DB/Redis 连接，在线请求排队</text>

      <text x="10" y="184" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">锁 / 元数据锁</text>
      <text x="76" y="184" font-size="8" fill="var(--fig-text)">定时 DDL 或长事务持有锁 → 相关查询全部等待</text>

      <text x="10" y="200" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">定时 GC 压力</text>
      <text x="76" y="200" font-size="8" fill="var(--fig-text)">定时批量加载数据 → 老年代增长 → Full GC 集中发生</text>

      <rect x="6" y="210" width="328" height="42" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="223" font-size="9" font-weight="700" fill="var(--fig-node-c)">④ 验证与修复</text>
      <text x="14" y="235" font-size="8" fill="var(--fig-text)">验证：临时停掉可疑任务（或改到其他时刻），观察慢请求是否消失</text>
      <text x="14" y="247" font-size="8" fill="var(--fig-text)">修复：任务错峰 / 限速 / 拆批 / 独立连接池 / 改到从库执行</text>

      <text x="6" y="258" font-size="7.5" fill="var(--fig-muted)">不要用「扩容」绕过：撞车问题扩容只延缓，错峰才能根治</text>
    </svg>
    <figcaption>固定时间变慢：把时间轴对齐，找「同一时刻撞车的那件事」，然后错峰或隔离资源</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
