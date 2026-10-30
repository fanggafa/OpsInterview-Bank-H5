<script setup>
/**
 * 最小权限原则的落地（题 63）。
 *
 * 核心洞察：最小权限不是一个开关，而是「账号 → 授权 → 提权 → 服务账户」
 * 四层都要收敛；任何一层放宽，前面几层的努力都会被绕过。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 266" role="img" aria-label="最小权限四层落地：账号分层、按角色授权、临时提权、服务账户隔离，以及容器场景的额外要求">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">不是一个开关，而是四层都要收敛 —— 任一层放宽就会被绕过</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 账号分层</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">日常用普通账号，需要时 sudo 提权（而不是人人 root）</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 按角色授权</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">DBA 只碰数据库、运维只碰部署目录；数据库按库/表授权</text>

      <rect x="6" y="96" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="109" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ 临时提权（JIT）</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">需要时申请、带时效与审批 → 平时无高权限，泄露窗口大幅缩小</text>

      <rect x="6" y="134" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="147" font-size="8" font-weight="700" fill="var(--fig-node-d)">④ 服务账户隔离</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">应用用专属低权限账号（只读写自己目录），不用 root 跑业务</text>

      <!-- 容器 -->
      <rect x="6" y="176" width="328" height="44" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="189" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">容器场景的额外要求</text>
      <text x="14" y="202" font-size="7.5" fill="var(--fig-text)">非 root 运行（USER 1000）· 禁止 privileged · drop ALL capabilities</text>
      <text x="14" y="214" font-size="7.5" fill="var(--fig-text)">只读根文件系统 · 不挂 docker.sock 与宿主敏感路径</text>

      <rect x="6" y="226" width="328" height="24" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="242" font-size="7.5" fill="var(--fig-text)">最常见破坏者：CI/CD 的部署凭据同时拥有「发布」和「删库」权限</text>

      <text x="6" y="256" font-size="7.5" fill="var(--fig-muted)">验证手段：定期扫 authorized_keys、sudoers、云 IAM，找出超出所需的授权</text>
    </svg>
    <figcaption>最小权限分四层：账号分层、按角色授权、JIT 临时提权、服务账户隔离；容器还要非 root + 限能力</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
