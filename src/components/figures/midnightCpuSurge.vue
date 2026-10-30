<script setup>
/**
 * 凌晨多机 CPU 同时飙高的处置流程图。
 *
 * 对应题 113。核心洞察：**凌晨这个时间点本身就是线索**（指向定时任务），
 * 且「多台同时」说明有共同的外部因素。处置顺序是「先止血、再定位、后复盘」。
 *
 * 画布 340 宽，文字须控制在列内（npm run check:figures 校验）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 276" role="img" aria-label="凌晨多台机器 CPU 飙高的处置：先止血、再看 us/sy/wa 分流、注意多机关联性、最后复盘">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">两条关键线索：凌晨 3 点 → 定时任务　多台同时 → 共同外部因素</text>

      <!-- 阶段 1 止血 -->
      <rect x="6" y="20" width="328" height="44" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="33" font-size="9" font-weight="700" fill="#e5484d">① 先止血（不要一上来就查根因）</text>
      <text x="14" y="45" font-size="8" fill="var(--fig-text)">摘异常节点：LB 权重调 0 / K8s cordon + drain，让健康节点扛</text>
      <text x="14" y="57" font-size="8" fill="var(--fig-text)">判断是否攻击：来源是否集中、UA 是否异常 → 是则 WAF / 封 IP</text>

      <!-- 阶段 2 分流 -->
      <text x="6" y="80" font-size="9.5" font-weight="700" fill="var(--fig-text)">② 按 CPU 分项分流（top 的 us / sy / wa）</text>

      <rect x="6" y="88" width="104" height="76" rx="5" fill="var(--fig-node-a)" opacity=".09" />
      <text x="12" y="100" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">us 高</text>
      <text x="12" y="112" font-size="7.5" fill="var(--fig-text)">应用在算</text>
      <text x="12" y="124" font-size="7.5" fill="var(--fig-text)">凌晨重点怀疑</text>
      <text x="12" y="134" font-size="7.5" fill="var(--fig-text)">定时任务雪崩</text>
      <text x="12" y="144" font-size="7.5" fill="var(--fig-node-c)">top -H 找线程</text>
      <text x="12" y="154" font-size="7.5" fill="var(--fig-node-c)">jstack 看栈</text>

      <rect x="118" y="88" width="104" height="76" rx="5" fill="var(--fig-node-b)" opacity=".09" />
      <text x="124" y="100" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">sy 高</text>
      <text x="124" y="112" font-size="7.5" fill="var(--fig-text)">内核在忙</text>
      <text x="124" y="124" font-size="7.5" fill="var(--fig-text)">上下文切换</text>
      <text x="124" y="134" font-size="7.5" fill="var(--fig-text)">软中断（网络包）</text>
      <text x="124" y="144" font-size="7.5" fill="var(--fig-node-c)">vmstat 查 cs/si</text>
      <text x="124" y="154" font-size="7.5" fill="var(--fig-node-c)">sar -n DEV 1</text>

      <rect x="230" y="88" width="104" height="76" rx="5" fill="var(--fig-node-d)" opacity=".09" />
      <text x="236" y="100" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">wa 高</text>
      <text x="236" y="112" font-size="7.5" fill="var(--fig-text)">在等磁盘</text>
      <text x="236" y="124" font-size="7.5" fill="var(--fig-text)">凌晨备份任务</text>
      <text x="236" y="134" font-size="7.5" fill="var(--fig-text)">日志狂写</text>
      <text x="236" y="144" font-size="7.5" fill="var(--fig-node-c)">iostat -x 1</text>
      <text x="236" y="154" font-size="7.5" fill="var(--fig-node-c)">pidstat -d 1</text>

      <!-- 阶段 3 关联性 -->
      <rect x="6" y="172" width="328" height="44" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="185" font-size="9" font-weight="700" fill="var(--fig-node-c)">③ 「多台同时」→ 找共同外部因素</text>
      <text x="14" y="197" font-size="8" fill="var(--fig-text)">共同下游超时 → 重试风暴　｜　共用存储 / NFS 抖动　｜　同宿主机</text>
      <text x="14" y="209" font-size="8" fill="var(--fig-text)">共用调度平台同一时刻触发 → 任务集体起跑</text>

      <!-- 阶段 4 复盘 -->
      <rect x="6" y="224" width="328" height="44" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="237" font-size="9" font-weight="700" fill="var(--fig-node-a)">④ 恢复与复盘（这才是闭环）</text>
      <text x="14" y="249" font-size="8" fill="var(--fig-text)">输出故障报告：时间线 · 影响面 · 根因 · 改进项</text>
      <text x="14" y="261" font-size="8" fill="var(--fig-text)">改进：任务错峰 / 加重试退避与限流 / 监控补盲点</text>

      <text x="6" y="273" font-size="7.5" fill="var(--fig-muted)">面试加分：先说「止血」，再说「根因」；主动点出凌晨这个时间线索</text>
    </svg>
    <figcaption>凌晨多机 CPU 飙高：先止血，再按 us/sy/wa 分流，最后别忘「多台同时」的共同因素</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
