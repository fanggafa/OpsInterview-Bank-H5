<script setup>
/**
 * 管道退出码与 PIPESTATUS（题 10）。
 *
 * 核心洞察：`$?` 只看管道最后一个命令，前面的失败会被吞掉 ——
 * 这正是「脚本明明出错却仍然报成功」的根源。三种解法各有适用场景。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 260" role="img" aria-label="管道退出码：$? 只看最后一个命令，PIPESTATUS 数组看各段，pipefail 让管道整体失败">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">$? 只反映「最后一个命令」，管道前面的失败会被吞掉</text>

      <!-- 问题示意 -->
      <rect x="6" y="20" width="328" height="42" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="#e5484d">典型陷阱</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">grep foo file | wc -l　→　grep 失败时 $? 仍是 0（wc 成功）</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-node-c)">后果：脚本继续往下跑，错误被静默忽略</text>

      <!-- 三种解法 -->
      <text x="6" y="80" font-size="9" font-weight="700" fill="var(--fig-text)">三种解法</text>

      <rect x="6" y="88" width="328" height="46" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="101" font-size="8" font-weight="700" fill="var(--fig-node-a)">① PIPESTATUS 数组（要看「各段分别是什么」）</text>
      <text x="14" y="114" font-size="7.5" fill="var(--fig-text)">cmd1 | cmd2; echo "${PIPESTATUS[@]}"　→ 每段退出码</text>
      <text x="14" y="126" font-size="7.5" fill="#e5484d">坑：必须紧接着读取，任何后续命令都会覆盖它</text>

      <rect x="6" y="140" width="328" height="46" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="153" font-size="8" font-weight="700" fill="var(--fig-node-b)">② set -o pipefail（要「整体失败即失败」，最常用）</text>
      <text x="14" y="166" font-size="7.5" fill="var(--fig-text)">管道整体返回「第一个非零」的退出码 → 配 set -e 生效</text>
      <text x="14" y="178" font-size="7.5" fill="var(--fig-node-c)">脚本开头建议：set -euo pipefail</text>

      <rect x="6" y="192" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="205" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ 避免管道（要「逐步判断」）</text>
      <text x="14" y="218" font-size="7.5" fill="var(--fig-text)">拆成两条命令分别判断 $?，逻辑最清晰但不够紧凑</text>

      <text x="6" y="242" font-size="7.5" fill="var(--fig-muted)">易混点：$? 是「上一条命令」；PIPESTATUS 是「上一个管道的各段」</text>
      <text x="6" y="254" font-size="7.5" fill="var(--fig-muted)">排查提示：bash -x 能看到管道各段的实际执行与返回</text>
    </svg>
    <figcaption>$? 只看管道的最后一个命令；要看各段用 PIPESTATUS（须紧接着读），要整体失败用 set -o pipefail</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
