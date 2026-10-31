<script setup>
/**
 * 「同一份配置 A 生效、B 不生效」的排查（题 5436）。
 *
 * 核心洞察：配置不生效几乎都源于「你以为生效的那份」或「你以为运行的环境」不一致；
 * 先确认生效文件与加载顺序，再比内容与环境差异。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 250" role="img" aria-label="配置只在 A 生效的排查：确认实际加载的文件、检查加载顺序与优先级、比对内容与环境变量">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">两种可能：B 加载的不是你改的那份，或 B 的环境让它被覆盖/失效</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 先确认「实际加载了哪个文件」</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">nginx -T（打印最终合并配置，含 include 的全部内容）· 看进程启动参数</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 检查加载顺序与优先级</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">多处配置同一项时，谁后加载谁生效；目录里的 include 常见「后置覆盖」</text>

      <rect x="6" y="96" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="109" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ 逐行 diff 两份配置</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">别凭记忆比；把两台的生效配置导出后 diff，差异往往一眼可见</text>

      <rect x="6" y="134" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="147" font-size="8" font-weight="700" fill="var(--fig-node-d)">④ 比对环境变量与节点差异</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">NODE_ENV/PROFILE、主机名、版本、集群中的角色都不一致时，同一份配置行为不同</text>

      <!-- 常见根因 -->
      <rect x="6" y="174" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="187" font-size="8.5" font-weight="700" fill="#e5484d">四个高频根因</text>
      <text x="14" y="200" font-size="7.5" fill="var(--fig-text)">① 改了但没 reload　② 改了另一份（符号链接/副本）　③ 被更高优先级覆盖</text>
      <text x="14" y="212" font-size="7.5" fill="var(--fig-text)">④ 集群里只更新了一台（滚动发布没完成）</text>

      <rect x="6" y="226" width="328" height="20" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="240" font-size="7.5" fill="var(--fig-text)">治本：配置纳入版本管理 + 配置中心下发 + 生效校验（不是靠人 restart）</text>

      <text x="6" y="248" font-size="7.5" fill="var(--fig-muted)"> </text>
    </svg>
    <figcaption>四步：确认实际加载的文件（如 nginx -T）、查加载顺序与优先级、导出后 diff、比对环境变量与节点差异</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
