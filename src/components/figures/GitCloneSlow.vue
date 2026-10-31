<script setup>
/**
 * git clone 特别慢的排查（题 2812）。
 *
 * 核心洞察：clone 慢分「仓库本身大」与「网络/服务端慢」两类；
 * 用浅克隆与分步观察即可快速定位是哪一侧。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 252" role="img" aria-label="clone 慢的两类原因：仓库体积大与网络服务端慢，以及浅克隆等缓解手段">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">先分清「仓库太大」还是「网络/服务端慢」，再选缓解手段</text>

      <rect x="6" y="20" width="160" height="82" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">仓库本身大</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">历史提交多、大文件进过仓库</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">大二进制历史（图片/包/数据）</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">分支/tag 数量多</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-node-c)">验证：git count-objects -vH 看 size-pack</text>
      <text x="14" y="94" font-size="7" fill="var(--fig-node-c)">解法：浅克隆 / 单分支 / 清理历史</text>

      <rect x="174" y="20" width="160" height="82" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">网络 / 服务端慢</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">跨地域拉取、出口带宽受限</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">GitLab 服务端负载高/IO 慢</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">走 HTTP 而非 SSH（或反之）</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-node-c)">验证：mtr + 分段计时（GIT_TRACE）</text>
      <text x="182" y="94" font-size="7" fill="var(--fig-node-c)">解法：就近镜像/加速节点</text>

      <!-- 缓解手段 -->
      <rect x="6" y="112" width="328" height="52" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="125" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">四个缓解手段（按效果排序）</text>
      <text x="14" y="138" font-size="7.5" fill="var(--fig-text)">① --depth 1 浅克隆（只要最新代码）　② --single-branch 只拉一个分支</text>
      <text x="14" y="150" font-size="7.5" fill="var(--fig-text)">③ --filter=blob:none 部分克隆（按需取文件）　④ 用镜像/加速服务</text>
      <text x="14" y="162" font-size="7" fill="var(--fig-node-c)">CI 里最适合用浅克隆，能显著缩短流水线时间</text>

      <rect x="6" y="174" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="187" font-size="8" font-weight="700" fill="#e5484d">根因治理</text>
      <text x="14" y="199" font-size="7.5" fill="var(--fig-text)">大文件用 Git LFS；历史里的大文件用 filter-repo 清理（需协调所有协作者）</text>

      <rect x="6" y="216" width="328" height="20" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="230" font-size="7.5" fill="var(--fig-text)">定位技巧：GIT_TRACE=1 git clone 看每个阶段耗时（fetch/pack 各多久）</text>

      <text x="6" y="242" font-size="7.5" fill="var(--fig-muted)">注意：浅克隆后无法直接查完整历史，需要时用 --unshallow 补全</text>
    </svg>
    <figcaption>clone 慢分仓库大（历史/大文件）与网络服务端慢两类；缓解靠浅克隆、单分支、部分克隆，根因是 LFS 与历史清理</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
