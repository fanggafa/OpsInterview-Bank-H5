<script setup>
/**
 * CrashLoopBackOff 的排查顺序（题 46）。
 *
 * 核心洞察：CrashLoopBackOff 是「重启退避」的结果不是原因；
 * 关键是看「退出码」与「上一次的日志」—— 光看 describe 往往不够。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 266" role="img" aria-label="CrashLoopBackOff 排查：describe 看退出码与事件、logs --previous 看崩溃日志、再按退出码分流">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">它是「重启退避」的结果，不是原因；先看退出码与上一次日志</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① kubectl describe pod</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">看 Last State 的 Reason / Exit Code，以及 Events（拉镜像失败、探针失败）</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-b)">② kubectl logs --previous（关键）</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">当前容器刚重启时日志是空的，必须看「上一次」崩溃前的输出</text>

      <!-- 退出码分流 -->
      <text x="6" y="108" font-size="9" font-weight="700" fill="var(--fig-text)">③ 按退出码分流</text>

      <rect x="6" y="116" width="328" height="26" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="132" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700" fill="#e5484d">137</tspan> = OOMKilled / SIGKILL → 内存超 limit（调 limits 或修泄漏）</text>

      <rect x="6" y="146" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="162" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700" fill="var(--fig-node-c)">143</tspan> = SIGTERM → 被优雅停止（可能是探针失败或部署替换）</text>

      <rect x="6" y="176" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="192" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700" fill="var(--fig-node-d)">1</tspan> = 应用自身异常 → 看日志里的堆栈/配置错误</text>

      <!-- 其他原因 -->
      <rect x="6" y="206" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="219" font-size="8" font-weight="700" fill="var(--fig-node-a)">报错在 describe 里但日志是空的</text>
      <text x="14" y="232" font-size="7.5" fill="var(--fig-text)">镜像拉不到 / 配置缺失 / 挂载失败 → 容器根本没起来，`logs` 当然没内容</text>

      <text x="6" y="256" font-size="7.5" fill="var(--fig-muted)">易混点：CrashLoopBackOff ≠ 应用一定有问题，也可能是 limits 太小或依赖不可达</text>
    </svg>
    <figcaption>先看退出码（137 OOM / 143 SIGTERM / 1 应用异常）再看 logs --previous；容器没起来时日志自然是空的</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
