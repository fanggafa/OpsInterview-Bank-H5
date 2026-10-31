<script setup>
/**
 * Docker 中管理秘密（题 4766）。
 *
 * 核心洞察：核心原则是「不进镜像层」——
 * ENV 会永久留在镜像历史、docker inspect 可见；
 * 构建期用 BuildKit secret，运行期用挂载文件或外部密钥管理。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 248" role="img" aria-label="密钥管理四种做法按安全性递增：ENV 最差、构建期 secret、挂载文件、外部密钥管理">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">原则：不进镜像层 —— ENV 会永久留在历史里</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="#e5484d" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="#e5484d">❌ 最差：写进 Dockerfile 的 ENV</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">镜像层永久留存，docker history 可见；-e 传的也会出现在 inspect</text>

      <rect x="6" y="54" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="var(--fig-node-a)">⚠ 中间：docker run -e 环境变量</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-text)">会出现在 docker inspect、进程环境、崩溃转储里</text>

      <rect x="6" y="88" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="101" font-size="8" font-weight="700" fill="var(--fig-node-b)">✅ 构建期：BuildKit secret</text>
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">RUN --mount=type=secret，只在那一层可见，不留在最终镜像</text>

      <rect x="6" y="126" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="139" font-size="8" font-weight="700" fill="var(--fig-node-c)">✅ 运行期：挂载文件到 /run/secrets/</text>
      <text x="14" y="151" font-size="7.5" fill="var(--fig-text)">只读挂载，不进镜像层；Docker Compose/Swarm 的 secrets 就是这个思路</text>

      <rect x="6" y="164" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="177" font-size="8" font-weight="700" fill="var(--fig-node-d)">✅✅ 最稳：外部密钥管理</text>
      <text x="14" y="189" font-size="7.5" fill="var(--fig-text)">Vault / 云 Secret Manager / CSI 挂载，可轮换、可审计</text>

      <rect x="6" y="202" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="215" font-size="8" font-weight="700" fill="var(--fig-node-a)">验证是否泄漏（两条命令）</text>
      <text x="14" y="227" font-size="7.5" fill="var(--fig-text)">docker history --no-trunc &lt;image&gt; | grep -i secret　·　docker run --rm &lt;image&gt; env</text>

      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">注意：多阶段构建也不能救「写进 ENV」——必须用 secret mount</text>
    </svg>
    <figcaption>四档安全性：ENV 最差（永久留镜像层）、-e 可见于 inspect、构建期 BuildKit secret、运行期挂载或外部密钥管理</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
