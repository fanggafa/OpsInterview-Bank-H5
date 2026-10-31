<script setup>
/**
 * Kafka 的顺序性保证与破坏点（题 4132）。
 *
 * 核心洞察：Kafka 只在「单分区内」严格有序（追加日志 + offset 递增），
 * 业务有序完全靠「同 key 落同分区」把需要串行的消息钉在同一处。
 * 这条链条上任何一环被拆开都会断：扩分区改了哈希落点、消费端多线程、
 * 或者取到手就丢线程池异步 —— 三者都是把串行悄悄变成了并行。
 * 所以判断要不要有序，只看一件事：同一实体的事件倒序执行会不会算错。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 268" role="img" aria-label="顺序链条纵向五步：同 key、同 partition、组内单消费者、串行消费、有序；右侧三个红色破坏点：改分区数、消费端多线程、丢线程池异步；下方对照必须有序与无需有序的场景">
      <defs>
        <marker id="arrDown" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-muted)" />
        </marker>
      </defs>

      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">Kafka 只保证单分区内有序，业务有序靠同 key 同分区</text>

      <!-- 核心链条（左列） -->
      <rect x="6" y="20" width="168" height="20" rx="3" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33.5" font-size="7.5" font-weight="700" fill="var(--fig-node-a)">① 同一条业务事件带同一 key</text>

      <path d="M28 41 V47" stroke="var(--fig-muted)" stroke-width="1.1" fill="none" marker-end="url(#arrDown)" />

      <rect x="6" y="48" width="168" height="20" rx="3" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="61.5" font-size="7.5" font-weight="700" fill="var(--fig-node-a)">② key 哈希 → 落在同一 partition</text>

      <path d="M28 69 V75" stroke="var(--fig-muted)" stroke-width="1.1" fill="none" marker-end="url(#arrDown)" />

      <rect x="6" y="76" width="168" height="20" rx="3" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="89.5" font-size="7.5" font-weight="700" fill="var(--fig-node-b)">③ 该分区只分给组内一个消费者</text>

      <path d="M28 97 V103" stroke="var(--fig-muted)" stroke-width="1.1" fill="none" marker-end="url(#arrDown)" />

      <rect x="6" y="104" width="168" height="20" rx="3" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="117.5" font-size="7.5" font-weight="700" fill="var(--fig-node-c)">④ 单线程按 offset 串行处理</text>

      <path d="M28 125 V131" stroke="var(--fig-muted)" stroke-width="1.1" fill="none" marker-end="url(#arrDown)" />

      <rect x="6" y="132" width="168" height="20" rx="3" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="145.5" font-size="7.5" font-weight="700" fill="var(--fig-node-d)">⑤ 同一实体的事件严格有序</text>

      <!-- 三个破坏点（右列） -->
      <text x="186" y="26" font-size="8" font-weight="700" fill="#e5484d">三个破坏顺序的坑</text>

      <rect x="186" y="34" width="148" height="34" rx="3" fill="#e5484d" opacity=".12" />
      <text x="192" y="45" font-size="7.5" font-weight="700" fill="#e5484d">① 改分区数</text>
      <text x="192" y="56" font-size="7" fill="var(--fig-text)">key 哈希落点变了，可能进新分区</text>
      <text x="192" y="65" font-size="7" fill="var(--fig-muted)">历史消息与新消息就此分家</text>

      <rect x="186" y="72" width="148" height="34" rx="3" fill="#e5484d" opacity=".12" />
      <text x="192" y="83" font-size="7.5" font-weight="700" fill="#e5484d">② 消费端多线程</text>
      <text x="192" y="94" font-size="7" fill="var(--fig-text)">同一分区被并发处理，先后失控</text>
      <text x="192" y="103" font-size="7" fill="var(--fig-muted)">提交乱序还可能重复消费</text>

      <rect x="186" y="110" width="148" height="34" rx="3" fill="#e5484d" opacity=".12" />
      <text x="192" y="121" font-size="7.5" font-weight="700" fill="#e5484d">③ 丢线程池异步</text>
      <text x="192" y="132" font-size="7" fill="var(--fig-text)">取到手就交出去，完成顺序看调度</text>
      <text x="192" y="141" font-size="7" fill="var(--fig-muted)">链条在最后一步断掉</text>

      <text x="186" y="156" font-size="7.5" fill="#e5484d">①最隐蔽：扩了分区顺序悄悄断</text>
      <text x="186" y="168" font-size="7.5" fill="var(--fig-muted)">要做有序就别中途扩分区</text>
      <text x="186" y="180" font-size="7.5" fill="var(--fig-muted)">已扩则迁移期按新落点重排队</text>

      <!-- 必须有序 -->
      <rect x="6" y="160" width="168" height="56" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="172" font-size="8" font-weight="700" fill="var(--fig-node-c)">必须有序（倒序会算错）</text>
      <text x="14" y="185" font-size="7.5" fill="var(--fig-text)">订单状态流转：创建 → 支付 → 发货</text>
      <text x="14" y="197" font-size="7.5" fill="var(--fig-text)">账户余额加减顺序影响结果</text>
      <text x="14" y="209" font-size="7.5" fill="var(--fig-text)">CDC 按 binlog 重放、库存扣减</text>

      <!-- 不需要有序 -->
      <rect x="6" y="222" width="168" height="32" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="233" font-size="8" font-weight="700" fill="var(--fig-node-d)">不需要有序（吞吐优先）</text>
      <text x="14" y="246" font-size="7.5" fill="var(--fig-text)">日志采集、埋点统计、通知推送</text>

      <text x="6" y="260" font-size="7.5" fill="var(--fig-muted)">折中：按业务键分区，不同实体并行、同一实体串行</text>
    </svg>
    <figcaption>顺序链条：同 key → 同 partition → 组内单消费者 → 串行消费 → 有序；破坏点是改分区数、消费端多线程、丢线程池异步；订单/余额/CDC/库存必须有序，日志与埋点不需要</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
