<script setup>
/**
 * 「P99 只在整点前后变差」的排查图。
 *
 * 对应题 5422。核心洞察：整点变差 = 「整点触发的任务」或「整点集中访问」，
 * 排查就是把所有「整点会跑的东西」列出来逐个排除。
 *
 * 画布 340 宽，文字须控制在列内（npm run check:figures 校验）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 262" role="img" aria-label="整点前后 P99 变差的排查：先确认时间规律，再列出整点触发的任务并逐个排除">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">整点前后变差 → 一定有「整点才会跑」的东西</text>

      <!-- Step 1 -->
      <rect x="6" y="20" width="328" height="34" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="9" font-weight="700" fill="var(--fig-node-a)">Step 1：确认「穷的规律」</text>
      <text x="14" y="44" font-size="8" fill="var(--fig-text)">每个整点都这样？还是只在业务高峰的整点？持续 2 分钟还是 20 分钟？</text>
      <text x="14" y="51" font-size="7.5" fill="var(--fig-node-c)">「每小时都有」与「只有特定整点」的成因完全不同</text>

      <!-- Step 2 -->
      <rect x="6" y="60" width="328" height="34" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="73" font-size="9" font-weight="700" fill="var(--fig-node-b)">Step 2：列出所有「整点任务」</text>
      <text x="14" y="84" font-size="8" fill="var(--fig-text)">crontab -l、/etc/cron.d/*、systemd timer、K8s CronJob</text>
      <text x="14" y="91" font-size="7.5" fill="var(--fig-node-c)">重点看 0 * * * * 与 @hourly，别只看当前用户</text>

      <!-- Step 3: 嫌疑清单 -->
      <text x="6" y="110" font-size="9.5" font-weight="700" fill="var(--fig-text)">Step 3：按「影响面」逐个排除</text>

      <text x="10" y="126" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">① 定时任务全表扫</text>
      <text x="10" y="138" font-size="8" fill="var(--fig-text)">统计/对账跑全表 → DB 慢查询把连接池占满</text>

      <text x="10" y="154" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">② 缓存集中失效</text>
      <text x="10" y="166" font-size="8" fill="var(--fig-text)">整点批量刷新缓存 → 一波回源打到 DB</text>

      <text x="10" y="182" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">③ 日志切割 / 备份</text>
      <text x="10" y="194" font-size="8" fill="var(--fig-text)">logrotate 压缩大文件、rsync 备份 → 磁盘 IO 打满</text>

      <text x="10" y="210" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">④ 监控采集爆发</text>
      <text x="10" y="222" font-size="8" fill="var(--fig-text)">整点全量采集 → 被监控服务瞬时压力上升</text>

      <rect x="6" y="230" width="328" height="22" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="244" font-size="8" fill="var(--fig-node-c)">验证顺序：GC 日志时间戳 → 慢查询日志 → iostat 同一时刻 → 任务清单逐个停</text>
    </svg>
    <figcaption>整点变差几乎不是「随机抖动」：把整点任务列出来，逐个停掉验证即可定位</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
