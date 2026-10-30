<script setup>
/**
 * nice / PR / RT 三层优先级关系（题 4004）。
 *
 * 核心洞察：nice 是「用户可调的谦让值」，PR 是「内核展示的换算值」，
 * RT 是「实时调度，凌驾于所有普通进程」——三者层级不同，别混为一谈。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="nice、PR、RT 三层优先级：nice 范围 -20 到 19，PR 等于 20 加 NI，RT 实时调度高于所有普通进程">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">nice 越大越「谦让」= 优先级越低，与日常直觉相反</text>

      <!-- 三层 -->
      <text x="6" y="34" font-size="9.5" font-weight="700" fill="var(--fig-text)">三个层次（越靠上优先级越高）</text>

      <rect x="6" y="42" width="328" height="42" rx="5" fill="#e5484d" opacity=".12" />
      <text x="14" y="55" font-size="9" font-weight="700" fill="#e5484d">RT 实时调度（SCHED_FIFO / SCHED_RR）</text>
      <text x="14" y="68" font-size="8" fill="var(--fig-text)">优先级 1~99，高于所有普通进程</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-node-c)">慎用：设太高可能让系统饿死（连 sshd 都抢不到 CPU）</text>

      <rect x="6" y="90" width="328" height="42" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="103" font-size="9" font-weight="700" fill="var(--fig-node-b)">PR（priority，内核展示用）</text>
      <text x="14" y="116" font-size="8" fill="var(--fig-text)">普通进程范围 0~39，换算公式 PR = 20 + NI</text>
      <text x="14" y="127" font-size="7.5" fill="var(--fig-node-c)">ps / top 里的 PRI 列看到的就是它</text>

      <rect x="6" y="138" width="328" height="46" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="151" font-size="9" font-weight="700" fill="var(--fig-node-a)">NI（nice，用户可调）</text>
      <text x="14" y="164" font-size="8" fill="var(--fig-text)">范围 -20 ~ 19：-20 最高优先级，19 最低（最谦让）</text>
      <text x="14" y="176" font-size="7.5" fill="var(--fig-text)">普通用户只能调高（更谦让，0→19）；降低（更优先）需要 root</text>

      <!-- 命令 -->
      <text x="6" y="202" font-size="9.5" font-weight="700" fill="var(--fig-text)">调整方式</text>
      <rect x="6" y="210" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="222" font-size="7.5" fill="var(--fig-text)">启动时指定：nice -n 10 ./backup.sh　（只能设正数，除非 root）</text>
      <text x="14" y="234" font-size="7.5" fill="var(--fig-text)">调整运行中：renice -n 5 -p &lt;pid&gt;　·　top 里按 r 也能改</text>

      <text x="6" y="254" font-size="7.5" fill="var(--fig-muted)">口诀：NI 是「我让你多少」，PR 是「换算后的号」，RT 是「我不排队」</text>
    </svg>
    <figcaption>nice 是用户可调的谦让值，PR = 20 + NI 是内核展示值，RT 实时调度凌驾于两者之上</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
