<script setup>
/**
 * 对象存储 vs 文件系统（题 2403）。
 *
 * 核心洞察：对象存储不是「文件系统」，它是「用 HTTP 存取不可变对象」；
 * 扁平的 key、只能整体覆盖、重命名等于复制——这三点决定了它适合什么、不适合什么。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 274" role="img" aria-label="对象存储与文件系统的区别：访问方式、目录结构、修改方式、重命名代价，以及各自适合的场景">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">对象存储不是「文件系统」，它是「用 HTTP 存取不可变对象」</text>

      <!-- 对比：每行一条，左侧属性名，右侧两种做法 -->
      <text x="6" y="32" font-size="7.5" font-weight="700" fill="var(--fig-text)">访问</text>
      <text x="44" y="32" font-size="7.5" fill="var(--fig-node-a)">文件系统：mount 后像本地文件</text>
      <text x="196" y="32" font-size="7.5" fill="var(--fig-node-c)">对象存储：HTTP API</text>

      <text x="6" y="50" font-size="7.5" font-weight="700" fill="var(--fig-text)">结构</text>
      <text x="44" y="50" font-size="7.5" fill="var(--fig-node-a)">文件系统：真实目录树</text>
      <text x="160" y="50" font-size="7.5" fill="var(--fig-node-c)">对象：扁平，/ 只是 key 前缀</text>

      <text x="6" y="68" font-size="7.5" font-weight="700" fill="var(--fig-text)">修改</text>
      <text x="44" y="68" font-size="7.5" fill="var(--fig-node-a)">文件系统：可随机写、追加</text>
      <text x="176" y="68" font-size="7.5" fill="#e5484d">对象：只能整体覆盖</text>

      <text x="6" y="86" font-size="7.5" font-weight="700" fill="var(--fig-text)">重命名</text>
      <text x="56" y="86" font-size="7.5" fill="var(--fig-node-a)">文件系统：O(1)</text>
      <text x="140" y="86" font-size="7.5" fill="#e5484d">对象：复制 + 删除（大对象很慢）</text>

      <text x="6" y="104" font-size="7.5" font-weight="700" fill="var(--fig-text)">一致性</text>
      <text x="56" y="104" font-size="7.5" fill="var(--fig-node-a)">本地：强一致</text>
      <text x="146" y="104" font-size="7.5" fill="var(--fig-node-c)">对象：读后写 / 最终一致</text>

      <!-- 关键推论 -->
      <rect x="6" y="116" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="129" font-size="8.5" font-weight="700" fill="#e5484d">三条推论（决定它能干什么）</text>
      <text x="14" y="141" font-size="7.5" fill="var(--fig-text)">① 不能当数据库：不支持随机写与原地修改</text>
      <text x="14" y="154" font-size="7.5" fill="var(--fig-text)">② 不能挂载跑程序：没有 POSIX 语义（网关可模拟但不建议）</text>

      <!-- 适合与不适合 -->
      <rect x="6" y="170" width="160" height="54" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="183" font-size="8" font-weight="700" fill="var(--fig-node-b)">适合</text>
      <text x="14" y="195" font-size="7.5" fill="var(--fig-text)">图片/视频等静态资源</text>
      <text x="14" y="207" font-size="7.5" fill="var(--fig-text)">备份归档、日志冷存</text>
      <text x="14" y="219" font-size="7.5" fill="var(--fig-text)">大数据原始文件</text>

      <rect x="174" y="170" width="160" height="54" rx="5" fill="#e5484d" opacity=".1" />
      <text x="182" y="183" font-size="8" font-weight="700" fill="#e5484d">不适合</text>
      <text x="182" y="195" font-size="7.5" fill="var(--fig-text)">数据库主库 / 频繁随机写</text>
      <text x="182" y="207" font-size="7.5" fill="var(--fig-text)">需文件锁、追加写的日志</text>
      <text x="182" y="219" font-size="7.5" fill="var(--fig-text)">大量小文件（按请求计费）</text>

      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">想「改对象里的一小段」做不到，只能整对象重写（或分片重传后重组）</text>
      <text x="6" y="254" font-size="7.5" fill="var(--fig-muted)">面试要点：主动点出「重命名其实是复制 + 删除」这个反直觉细节</text>
      <text x="6" y="268" font-size="7.5" fill="var(--fig-muted)">排查提示：对象被覆盖后旧内容不可回滚，除非开了版本控制</text>
    </svg>
    <figcaption>对象存储是「HTTP 存取不可变对象」：扁平 key、只能整体覆盖、重命名等于复制，所以不能当数据库用</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
