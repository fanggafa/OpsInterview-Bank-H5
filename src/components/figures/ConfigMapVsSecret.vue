<script setup>
/**
 * ConfigMap 与 Secret 的区别（题 4604）。
 *
 * 核心洞察：Secret 默认只是 base64 编码（不是加密），
 * 真正的安全要靠「加密静态数据 + 严格 RBAC + 外部密钥管理」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 246" role="img" aria-label="ConfigMap 存普通配置、Secret 存敏感数据但默认仅 base64 编码，需要加密与权限控制">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">Secret 默认只是 base64 —— 它是「编码」不是「加密」</text>

      <rect x="6" y="20" width="160" height="60" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">ConfigMap</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">普通配置（明文）</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">可挂成文件或环境变量</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-node-c)">适合非敏感配置</text>

      <rect x="174" y="20" width="160" height="60" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">Secret</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">敏感数据（密码/证书/token）</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">默认 base64 编码，不是加密</text>
      <text x="182" y="70" font-size="7.5" fill="#e5484d">能有权限的人都能解码</text>

      <!-- 关键提醒 -->
      <rect x="6" y="88" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="101" font-size="8.5" font-weight="700" fill="#e5484d">三条安全要求</text>
      <text x="14" y="114" font-size="7.5" fill="var(--fig-text)">① 开 EncryptionConfiguration（etcd 静态加密）② 严格 RBAC，限制读 Secret</text>
      <text x="14" y="126" font-size="7.5" fill="var(--fig-text)">③ 别把 Secret 放 ConfigMap、别打进镜像、别提交到 Git</text>

      <rect x="6" y="142" width="328" height="42" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="155" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">更好的做法</text>
      <text x="14" y="168" font-size="7.5" fill="var(--fig-text)">用外部密钥管理（Vault/云 Secret Manager）配合短期凭证，而不是长期存 K8s</text>

      <rect x="6" y="192" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="205" font-size="8" font-weight="700" fill="var(--fig-node-d)">排查：Secret 泄露的常见途径</text>
      <text x="14" y="218" font-size="7.5" fill="var(--fig-text)">kubectl describe 输出（部分版本）· 日志打印环境变量 · 镜像层残留</text>

      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">验证：kubectl get secret -o yaml 能直接 base64 解码 —— 说明它本来就不是加密的</text>
    </svg>
    <figcaption>ConfigMap 存普通配置、Secret 存敏感数据；但 Secret 默认只是 base64，须开静态加密 + 严格 RBAC + 外部密钥管理</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
