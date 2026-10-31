<script setup>
/**
 * K8s 安全最佳实践（题 4765）。
 *
 * 核心洞察：按「隔离 → 权限 → 镜像 → 网络 → 审计」五层收敛；
 * 最容易被误解的是「容器内 root ≠ 宿主 root，但配置不当就等同」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 242" role="img" aria-label="K8s 安全五层：运行时隔离、RBAC 权限、镜像供应链、网络策略、审计检测">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">五层收敛：隔离 → 权限 → 镜像 → 网络 → 审计</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 运行时隔离</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">非 root 运行 · drop 全部 capabilities · 只读根文件系统 · 禁 privileged</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="71" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② RBAC 权限</text>
      <text x="14" y="83" font-size="7.5" fill="var(--fig-text)">最小权限 · 不自动挂 SA token · 定期审计 cluster-admin 绑定</text>

      <rect x="6" y="96" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="109" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">③ 镜像与供应链</text>
      <text x="14" y="121" font-size="7.5" fill="var(--fig-text)">私有仓库 · 禁用 latest · 漏洞扫描接入 CI · 镜像签名 · 最小基础镜像</text>

      <rect x="6" y="134" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="147" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">④ 网络与密钥</text>
      <text x="14" y="159" font-size="7.5" fill="var(--fig-text)">NetworkPolicy 默认拒绝 · 控制面不暴露公网 · etcd 静态加密 · Secret 不进 Git</text>

      <rect x="6" y="172" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="185" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">⑤ 审计与检测</text>
      <text x="14" y="197" font-size="7.5" fill="var(--fig-text)">开 audit log · 监控特权容器与异常 exec · 定期跑 CIS Benchmark</text>

      <rect x="6" y="208" width="328" height="18" rx="3" fill="#e5484d" opacity=".1" />
      <text x="14" y="221" font-size="7.5" fill="var(--fig-text)">关键理解：容器内 root ≠ 宿主 root，但 privileged 或挂宿主目录就会等同</text>

      <text x="6" y="234" font-size="7.5" fill="var(--fig-muted)">最脆弱的通常是「CI/CD 凭据」—— 它权限大、又常被随意复制</text>
    </svg>
    <figcaption>五层：运行时隔离（非 root/去权限/只读）、RBAC 最小权限、镜像供应链、网络与密钥、审计检测</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
