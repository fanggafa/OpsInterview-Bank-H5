<script setup>
/**
 * 「一半用户受影响」的维度分流图。
 *
 * 对应题 5401。核心洞察：「一半」不是随机，一定存在某个**维度差异**；
 * 把「一半」按维度拆开，根因几乎立刻浮出来。
 *
 * 画布 340 宽，文字须控制在列内（npm run check:figures 校验）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 250" role="img" aria-label="一半用户登录不上时，按地域、运营商、版本、账号段、时间五个维度分流">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">「一半用户」= 一定有某个维度不同，先把「一半」拆开</text>

      <rect x="6" y="20" width="328" height="22" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="35" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">先问三件事：随机还是有规律？报错还是无响应？从几点开始？</text>

      <!-- 五个维度 -->
      <rect x="6" y="50" width="328" height="30" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="62" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">① 按地域</text>
      <text x="72" y="62" font-size="8" fill="var(--fig-text)">某地区全失败 → DNS 解析到坏 IP、CDN 节点故障</text>
      <text x="72" y="74" font-size="8" fill="var(--fig-node-c)">查：多地 dig 对比 · CDN 节点状态 · 回源是否正常</text>

      <rect x="6" y="84" width="328" height="30" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="96" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">② 按运营商</text>
      <text x="72" y="96" font-size="8" fill="var(--fig-text)">某运营商用户失败 → 跨网路由、DNS 劫持</text>
      <text x="72" y="108" font-size="8" fill="var(--fig-node-c)">查：mtr 跨网路径 · 该运营商 DNS 的解析结果</text>

      <rect x="6" y="118" width="328" height="30" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="130" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">③ 按 App 版本</text>
      <text x="72" y="130" font-size="8" fill="var(--fig-text)">只有某版本失败 → 该版本接口/证书/域名配置问题</text>
      <text x="72" y="142" font-size="8" fill="var(--fig-node-c)">查：按版本分组的失败率 · 该版本的发布记录</text>

      <rect x="6" y="152" width="328" height="30" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="164" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">④ 按账号段</text>
      <text x="72" y="164" font-size="8" fill="var(--fig-text)">某段账号失败 → 该段的密码/权限/灰度开关差异</text>
      <text x="72" y="176" font-size="8" fill="var(--fig-node-c)">查：登录日志按账号聚合 · 权限校验与灰度规则</text>

      <rect x="6" y="186" width="328" height="30" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="198" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">⑤ 按时间点</text>
      <text x="72" y="198" font-size="8" fill="var(--fig-text)">某时刻起骤然一半 → 那次发布 / 那次证书 / 那次配置变更</text>
      <text x="72" y="210" font-size="8" fill="var(--fig-node-c)">查：发布与变更记录对齐时间轴（最高优先级）</text>

      <text x="6" y="232" font-size="8" fill="var(--fig-muted)">「昨天还好、今天突然」→ 先看最近 24h 的变更，比任何技术排查都快</text>
    </svg>
    <figcaption>把一个模糊的「一半」拆成五个可观察维度，根因通常一步就浮出来</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
