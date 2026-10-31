<script setup>
/**
 * 用大模型辅助分析 Nginx / Linux 日志（题 5827）。
 *
 * 核心洞察：模型的强项是「解释一段已经变小的证据」，
 * 不是替你数日志。所以正确次序是先聚合统计、再挑样本、脱敏，最后才交模型；
 * 把全量日志直接丢进去，既超上下文（中间内容被忽略），又慢又贵还带出内网信息。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 244" role="img" aria-label="用大模型分析日志的正确四步：聚合统计、挑样本、脱敏、交模型解读；反面是直接丢全量日志">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">正确姿势：先统计 → 再取样 → 脱敏 → 交模型解读</text>

      <rect x="6" y="22" width="328" height="32" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="34" font-size="7.5" fill="var(--fig-node-a)">① 先聚合统计：awk/sort/uniq 数出错误码、Top IP、P95 耗时</text>
      <text x="14" y="47" font-size="7.5" fill="var(--fig-text)">日志先变成几十行结论：省 token、不泄密、上下文也不会超</text>

      <rect x="6" y="58" width="328" height="32" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="70" font-size="7.5" fill="var(--fig-node-b)">② 挑样本：按时间窗 / 某 IP / 5xx 抓原始行，带前后几行上下文</text>
      <text x="14" y="83" font-size="7.5" fill="var(--fig-text)">模型看到的是「现场」，而不是被压缩掉的汇总数字</text>

      <rect x="6" y="94" width="328" height="32" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="106" font-size="7.5" fill="var(--fig-node-c)">③ 脱敏：抹掉 IP、账号、Cookie、内网域名、密钥与工单号</text>
      <text x="14" y="119" font-size="7.5" fill="var(--fig-text)">出网前先过一遍脱敏脚本，这一步比节省 token 重要得多</text>

      <rect x="6" y="130" width="328" height="32" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="142" font-size="7.5" fill="var(--fig-node-d)">④ 交模型解读：要它给「可能原因 + 验证命令」，人再核验执行</text>
      <text x="14" y="155" font-size="7.5" fill="var(--fig-text)">按假设去验证，而不是把它的结论当线上定论</text>

      <rect x="6" y="168" width="328" height="54" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="181" font-size="8" font-weight="700" fill="#e5484d">反面姿势：把全量日志直接丢给模型</text>
      <text x="14" y="194" font-size="7.5" fill="var(--fig-text)">超上下文 → 中间内容被忽略，最关键的几行反而看不到</text>
      <text x="14" y="206" font-size="7.5" fill="var(--fig-text)">又慢又贵：一次几十万 token，还顺手把内网信息带出网</text>
      <text x="14" y="218" font-size="7.5" fill="var(--fig-text)">次序要反过来：先缩小范围，再让它解释范围里的现象</text>

      <text x="6" y="232" font-size="7.5" fill="var(--fig-muted)">模型擅长解释「已经变小的证据」，不擅长替你数日志</text>
    </svg>
    <figcaption>四步：聚合统计 → 挑样本 → 脱敏 → 交模型解读；直接丢全量日志会超上下文、漏掉关键行、泄露内网信息且代价高</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
