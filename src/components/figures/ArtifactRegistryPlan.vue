<script setup>
/**
 * 制品仓库（Nexus/Harbor）的规划（题 4805）。
 *
 * 核心洞察：制品仓库要管「版本可追溯、可回滚、可审计」，
 * 只依赖镜像会丢失「构建产物与源码的对应关系」和中转缓存能力。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 244" role="img" aria-label="制品仓库要管三类内容与四个规划要点，以及为什么不能只依赖镜像">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">制品仓库的核心价值：版本可追溯、可回滚、可审计</text>

      <rect x="6" y="20" width="328" height="28" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="38" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">①</tspan> 放什么：镜像（Harbor）+ 二进制/包（Nexus）+ 依赖缓存（proxy 仓库）</text>

      <rect x="6" y="52" width="328" height="28" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">②</tspan> 分级：snapshot（可覆盖）vs release（不可变，禁止覆盖同名版本）</text>

      <rect x="6" y="84" width="328" height="28" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="102" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">③</tspan> 保留策略：按版本/时间清理，但「最近 N 个发布版本」必须永久保留</text>

      <rect x="6" y="116" width="328" height="28" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="134" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">④</tspan> 高可用与备份：仓库本身挂了会阻塞发布，要冗余与异地备份</text>

      <!-- 为什么不能只靠镜像 -->
      <rect x="6" y="150" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="163" font-size="8.5" font-weight="700" fill="#e5484d">为什么不能只依赖镜像</text>
      <text x="14" y="176" font-size="7.5" fill="var(--fig-text)">① 镜像里「代码与依赖已打包」，追溯源码改动要反查构建记录</text>
      <text x="14" y="188" font-size="7.5" fill="var(--fig-text)">② 部分制品不是镜像（jar/war/npm 包/安装包），回滚需要原文件</text>

      <rect x="6" y="202" width="328" height="20" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="216" font-size="7.5" fill="var(--fig-text)">关键实践：镜像 tag 用「git sha + 版本号」，禁止只用 latest</text>

      <text x="6" y="238" font-size="7.5" fill="var(--fig-muted)">安全：镜像漏洞扫描、制品签名、拉取需鉴权（别让仓库变公开可写）</text>
    </svg>
    <figcaption>制品仓库要放镜像/二进制/依赖缓存，分 snapshot 与不可变 release；只靠镜像会丢失源码追溯与非镜像制品的回滚</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
