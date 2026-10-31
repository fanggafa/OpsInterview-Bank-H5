<script setup>
/**
 * MySQL 的 utf8 与 utf8mb4（题 3633）。
 *
 * 核心洞察：MySQL 的 utf8 是「残缺的」（最多 3 字节，存不了 emoji 与部分生僻字），
 * utf8mb4 才是真正的 UTF-8（4 字节），这是必须用 utf8mb4 的根本原因。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 238" role="img" aria-label="MySQL 的 utf8 最多 3 字节存不了 emoji，utf8mb4 是完整 4 字节 UTF-8">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">MySQL 的 utf8 不是标准 UTF-8 —— 它最多只能存 3 字节</text>

      <rect x="6" y="20" width="160" height="82" rx="5" fill="#e5484d" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="#e5484d">utf8（别名 utf8mb3）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">每字符最多 3 字节</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">只能存 BMP 内字符</text>
      <text x="14" y="70" font-size="7.5" fill="#e5484d">存不了 emoji（😀 等）</text>
      <text x="14" y="82" font-size="7.5" fill="#e5484d">存不了部分生僻字</text>
      <text x="14" y="94" font-size="7.5" fill="var(--fig-text)">插入时报 Incorrect string value</text>

      <rect x="174" y="20" width="160" height="82" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">utf8mb4</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">每字符最多 4 字节</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">完整 UTF-8（含 emoji）</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">MySQL 8 的默认字符集</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-text)">索引前缀长度上限略降</text>
      <text x="182" y="94" font-size="7" fill="var(--fig-node-c)">现在应统一用它</text>

      <!-- 迁移注意 -->
      <rect x="6" y="112" width="328" height="50" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="125" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">从 utf8 迁到 utf8mb4 要注意</text>
      <text x="14" y="138" font-size="7.5" fill="var(--fig-text)">① 索引长度：InnoDB 单列索引 767 字节限制 → varchar(255) 可能建不了索引</text>
      <text x="14" y="150" font-size="7.5" fill="var(--fig-text)">② 排序规则（collation）要一起改，否则比较/排序行为不一致</text>
      <text x="14" y="162" font-size="7" fill="var(--fig-node-c)">③ 连接、表、列、库四级都要对齐（任一没改就还可能出问题）</text>

      <rect x="6" y="170" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="183" font-size="8" font-weight="700" fill="var(--fig-node-d)">排查「错的是哪一级」</text>
      <text x="14" y="195" font-size="7.5" fill="var(--fig-text)">SHOW VARIABLES LIKE 'character_set%' 与 SHOW CREATE TABLE 对照</text>

      <text x="6" y="230" font-size="7.5" fill="var(--fig-muted)">建议：collation 用 utf8mb4_0900_ai_ci（MySQL 8）或 utf8mb4_unicode_ci（5.7）</text>
    </svg>
    <figcaption>utf8 实为 utf8mb3（最多 3 字节，存不了 emoji 与生僻字），utf8mb4 才是完整实现；迁移要同步改索引与排序规则</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
