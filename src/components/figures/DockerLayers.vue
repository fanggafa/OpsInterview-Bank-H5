<script setup>
/**
 * 容器镜像分层与构建缓存图。
 * 解释「为什么 Dockerfile 指令顺序会影响构建速度」——
 * 这是 Dockerfile 优化的核心原理，图比文字直观得多。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 226" role="img" aria-label="Docker 镜像分层结构与 Dockerfile 指令顺序对构建缓存的影响">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">每条指令 = 一层；某一层变了，它之后的层全部要重建</text>

      <!-- 分层 -->
      <text x="6" y="32" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">镜像 = 只读层堆叠</text>

      <rect x="6" y="38" width="150" height="17" rx="3" fill="var(--fig-node-c)" opacity=".8" />
      <text x="14" y="50" font-size="7.5" fill="#fff">COPY 源码与配置</text>

      <rect x="6" y="59" width="150" height="17" rx="3" fill="var(--fig-node-b)" opacity=".8" />
      <text x="14" y="71" font-size="7.5" fill="#fff">RUN npm ci（装依赖）</text>

      <rect x="6" y="80" width="150" height="17" rx="3" fill="var(--fig-node-a)" opacity=".8" />
      <text x="14" y="92" font-size="7.5" fill="#fff">FROM node:20-alpine</text>

      <text x="6" y="112" font-size="7.5" fill="var(--fig-muted)">底层共享（多个镜像可复用同一基础层）</text>

      <!-- 容器层 -->
      <rect x="6" y="118" width="150" height="17" rx="3" fill="var(--fig-node-d)" opacity=".8" />
      <text x="14" y="130" font-size="7.5" fill="#fff">容器可写层（运行时）</text>
      <text x="6" y="150" font-size="7" fill="var(--fig-muted)">容器删除后这一层消失，镜像层不变</text>

      <!-- 错误顺序 -->
      <rect x="176" y="20" width="158" height="86" rx="6" fill="#e5484d" opacity=".08" />
      <rect x="176" y="20" width="158" height="86" rx="6" fill="none" stroke="#e5484d" stroke-width="1.2" />
      <text x="184" y="36" font-size="8.5" font-weight="700" fill="#e5484d">✗ 错误顺序（缓存常失效）</text>
      <text x="184" y="52" font-size="7.5" fill="var(--fig-text)">COPY . .</text>
      <text x="184" y="65" font-size="7.5" fill="var(--fig-text)">RUN npm ci</text>
      <text x="184" y="82" font-size="7.5" fill="var(--fig-node-d)">改任一源码文件 → COPY 层变</text>
      <text x="184" y="94" font-size="7.5" fill="var(--fig-node-d)">→ 依赖全部重装（几分钟）</text>

      <!-- 正确顺序 -->
      <rect x="176" y="114" width="158" height="86" rx="6" fill="var(--fig-node-c)" opacity=".09" />
      <rect x="176" y="114" width="158" height="86" rx="6" fill="none" stroke="var(--fig-node-c)" stroke-width="1.2" />
      <text x="184" y="130" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">✓ 正确顺序（缓存命中高）</text>
      <text x="184" y="146" font-size="7.5" fill="var(--fig-text)">COPY package*.json ./</text>
      <text x="184" y="159" font-size="7.5" fill="var(--fig-text)">RUN npm ci</text>
      <text x="184" y="172" font-size="7.5" fill="var(--fig-text)">COPY . .</text>
      <text x="184" y="188" font-size="7.5" fill="var(--fig-node-c)">改源码 → 依赖层仍命中缓存</text>
      <text x="184" y="199" font-size="7" fill="var(--fig-muted)">构建从几分钟降到几十秒</text>

      <!-- 另外两点 -->
      <text x="6" y="170" font-size="8.5" font-weight="700" fill="var(--fig-text)">另外两条实用规则</text>
      <text x="6" y="184" font-size="7.5" fill="var(--fig-text)">① 合并 RUN：减少层数（用 &amp;&amp; 串联，末尾清理缓存）</text>
      <text x="6" y="197" font-size="7.5" fill="var(--fig-text)">② 用 .dockerignore 排除 node_modules/.git</text>
      <text x="6" y="210" font-size="7.5" fill="var(--fig-node-d)">③ 不要把密钥写进镜像（层里永久留存）</text>
      <text x="6" y="222" font-size="7" fill="var(--fig-muted)">镜像层是不可变的，删掉文件也不会减小镜像体积</text>
    </svg>
    <figcaption>「先拷依赖清单、再装依赖、最后拷源码」是 Dockerfile 提速的关键</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
