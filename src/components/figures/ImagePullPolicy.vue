<script setup>
/**
 * 镜像更新策略 imagePullPolicy（题 4732）。
 *
 * 核心洞察：默认值取决于 tag —— latest 默认 Always，固定 tag 默认 IfNotPresent；
 * 所以「换 tag」才是发布新版本的正确方式，而非依赖 Always 重拉同名 tag。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 234" role="img" aria-label="三种拉取策略与默认值推导规则：latest 默认 Always，固定 tag 默认 IfNotPresent">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">决定 kubelet 何时去 registry 拉镜像</text>

      <rect x="6" y="20" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="37" font-size="7.5" fill="var(--fig-node-a)"><tspan font-weight="700">Always</tspan>　每次启动都去拉 → latest tag、要「重拉即更新」的场景</text>

      <rect x="6" y="50" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="67" font-size="7.5" fill="var(--fig-node-b)"><tspan font-weight="700">IfNotPresent</tspan>（默认）　本地有就不拉 → 固定版本 tag（推荐）</text>

      <rect x="6" y="80" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="97" font-size="7.5" fill="var(--fig-node-c)"><tspan font-weight="700">Never</tspan>　只用本地镜像，从不拉 → 离线环境、预热镜像</text>

      <!-- 默认值推导 -->
      <rect x="6" y="116" width="328" height="46" rx="5" fill="#e5484d" opacity=".12" />
      <text x="14" y="129" font-size="8.5" font-weight="700" fill="#e5484d">默认值不是固定的（最易错的一点）</text>
      <text x="14" y="142" font-size="7.5" fill="var(--fig-text)">tag = :latest（或不写 tag）→ 默认 Always</text>
      <text x="14" y="154" font-size="7.5" fill="var(--fig-text)">tag = 具体版本（如 :1.2.3）→ 默认 IfNotPresent</text>

      <rect x="6" y="170" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="183" font-size="8" font-weight="700" fill="var(--fig-node-d)">生产实践</text>
      <text x="14" y="195" font-size="7.5" fill="var(--fig-text)">用不可变 tag（版本或 git sha），发布新版本 = 换 tag，而不是重拉同名 tag</text>

      <text x="6" y="230" font-size="7.5" fill="var(--fig-muted)">排查「改了镜像但还是旧的」：查 Image ID 与 registry 里该 tag 的实际 digest</text>
    </svg>
    <figcaption>Always 始终拉、IfNotPresent 有就不拉、Never 从不拉；latest 默认 Always、固定 tag 默认 IfNotPresent；发布应换 tag</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
