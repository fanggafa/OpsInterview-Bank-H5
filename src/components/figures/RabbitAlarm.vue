<script setup>
/**
 * RabbitMQ 内存/磁盘 alarm（题 2218）。
 *
 * 核心洞察：触发 alarm 后 RabbitMQ 会**阻塞发布者**（不是拒绝），
 * 所以表现为「生产者卡住、消息发不进去」；处置核心是让消费追上或扩容。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 244" role="img" aria-label="RabbitMQ 触发内存或磁盘 alarm 后阻塞发布者，排查磁盘与内存，处置靠消费或扩容">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">alarm 触发后不是「报错」，而是**阻塞发布者** —— 生产者会卡住</text>

      <rect x="6" y="20" width="160" height="76" rx="5" fill="#e5484d" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="#e5484d">内存 alarm</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">used_memory 超 vm_memory_high_watermark</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">默认 40% 内存即触发</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">表现：连接还在，但 publish 阻塞</text>
      <text x="14" y="82" font-size="7" fill="var(--fig-node-c)">也更早触发 paging（刷盘到页文件）</text>

      <rect x="174" y="20" width="160" height="76" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">磁盘 alarm</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">剩余空间低于 disk_free_limit</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">默认 50MB（建议改成绝对值或比例）</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">表现同上：所有发布者被阻塞</text>
      <text x="182" y="82" font-size="7" fill="#e5484d">常因日志/堆积消息把盘写满</text>

      <!-- 排查 -->
      <rect x="6" y="104" width="328" height="48" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="117" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">排查动作</text>
      <text x="14" y="130" font-size="7.5" fill="var(--fig-text)">① rabbitmqctl status / list_queues 看内存与队列堆积</text>
      <text x="14" y="142" font-size="7.5" fill="var(--fig-text)">② df -h 看磁盘；rabbitmqctl list_alarms（新版用 alarms）</text>
      <text x="14" y="154" font-size="7" fill="var(--fig-node-c)">③ 看是否有队列无消费者导致堆积（最常见）</text>

      <rect x="6" y="160" width="328" height="46" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="173" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">处置顺序（先救急再治本）</text>
      <text x="14" y="186" font-size="7.5" fill="var(--fig-text)">救急：清磁盘（日志/旧数据）、扩容内存、临时增大阈值</text>
      <text x="14" y="198" font-size="7.5" fill="var(--fig-text)">治本：补消费者/加队列上限/开惰性队列（lazy queue）减少内存占用</text>

      <text x="6" y="238" font-size="7.5" fill="var(--fig-muted)">注意：不要直接删队列里的消息了事 —— 会丢业务数据，先确认能否重放</text>
    </svg>
    <figcaption>alarm 触发后 RabbitMQ 阻塞发布者而非报错；内存与磁盘两类阈值，处置是先清盘扩容救急，再补消费者/惰性队列治本</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
