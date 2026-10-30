<script setup>
/**
 * 「磁盘 95% 但不敢随便删」的安全处置图。
 *
 * 对应题 5427。核心洞察：先搞清「什么占了空间」，再按**安全等级**从高到低处理；
 * 最高频的陷阱是「已删除但被进程持有」的文件（df 与 du 对不上）。
 *
 * 画布 340 宽，文字须控制在列内（npm run check:figures 校验）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 296" role="img" aria-label="磁盘将满的安全处置：先定位占用，再按安全等级从已删除文件、过期日志、临时文件、旧镜像到业务数据依次处理">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">先搞清「什么占了空间」，再按安全等级处理——绝不盲目 rm -rf</text>

      <!-- Step 1 -->
      <rect x="6" y="20" width="328" height="46" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 定位（5 分钟内，先不删）</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">df -h 找挂载点 → du -sh /var/* 层层下钻 → lsof | grep deleted 查被占用文件</text>
      <text x="14" y="57" font-size="7.5" font-weight="700" fill="#e5484d">df 满但 du 对不上 = 有进程删了文件却仍持有句柄（最高频陷阱）</text>

      <!-- 安全等级阶梯 -->
      <text x="6" y="82" font-size="9.5" font-weight="700" fill="var(--fig-text)">② 按安全等级从高到低处理</text>

      <rect x="6" y="90" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="102" font-size="8" font-weight="700" fill="var(--fig-node-c)">最安全：已删除但被占用的文件</text>
      <text x="14" y="114" font-size="7.5" fill="var(--fig-text)">reload / 重启持有它的进程即可释放，数据本身不需要动</text>

      <rect x="6" y="124" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="136" font-size="8" font-weight="700" fill="var(--fig-node-c)">安全：过期日志</text>
      <text x="14" y="148" font-size="7.5" fill="var(--fig-text)">先确认保留策略与合规要求 → 压缩或删除；别删「正在写」的文件</text>

      <rect x="6" y="158" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="170" font-size="8" font-weight="700" fill="var(--fig-node-b)">较安全：临时文件</text>
      <text x="14" y="182" font-size="7.5" fill="var(--fig-text)">/tmp 下超过 N 天的文件；注意「进程正在用的临时文件」</text>

      <rect x="6" y="192" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="204" font-size="8" font-weight="700" fill="var(--fig-node-b)">较安全：旧镜像 / 容器层</text>
      <text x="14" y="216" font-size="7.5" fill="var(--fig-text)">docker image prune / 无用容器层；确认没有回滚还需要旧镜像</text>

      <rect x="6" y="226" width="328" height="30" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="238" font-size="8" font-weight="700" fill="#e5484d">最危险：业务数据 / 数据库文件</text>
      <text x="14" y="250" font-size="7.5" fill="var(--fig-text)">不要直接删；应先扩容、归档、或清理历史分区（有备份与审批）</text>

      <rect x="6" y="262" width="328" height="20" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="275" font-size="7.5" fill="var(--fig-node-d)">治本：日志轮转限份数 · 清理任务自动化 · 磁盘水位趋势告警（预测何时满）</text>

      <text x="6" y="292" font-size="7.5" fill="var(--fig-muted)">面试要点：主动说出「lsof | grep deleted」这个陷阱，比会删文件更加分</text>
    </svg>
    <figcaption>磁盘将满按「被占用文件 → 旧日志 → 临时文件 → 旧镜像 → 业务数据」的安全等级处理</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
