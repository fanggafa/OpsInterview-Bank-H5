<script setup>
/**
 * RabbitMQ 基本架构（题 4120）。
 *
 * 核心洞察：生产者和队列之间隔着 Exchange —— 这就是 RabbitMQ
 * 比「生产者直接写队列」灵活的原因（一条消息能按规则分发到多个队列）。
 * 另一个必须记住的点：集群 ≠ 高可用，默认队列的消息只在单节点。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 316" role="img" aria-label="RabbitMQ 架构：Producer 发到 Exchange，Exchange 按绑定规则路由到两个 Queue，各由 Consumer 消费；下注四种交换机类型与 vhost 隔离，并提醒集群不等于高可用">
      <defs>
        <marker id="arrR" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-muted)" />
        </marker>
      </defs>

      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">生产者和队列之间，隔着一层 Exchange</text>

      <!-- Producer -->
      <rect x="6" y="24" width="64" height="56" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="12" y="40" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">Producer</text>
      <text x="12" y="53" font-size="7" fill="var(--fig-text)">发消息到</text>
      <text x="12" y="63" font-size="7" fill="var(--fig-node-a)">Exchange</text>
      <text x="12" y="74" font-size="7" fill="var(--fig-muted)">不是队列</text>

      <path d="M70 52 H86" stroke="var(--fig-muted)" stroke-width="1.4" fill="none" marker-end="url(#arrR)" />
      <text x="70" y="44" font-size="7" fill="var(--fig-muted)">key</text>

      <!-- Exchange -->
      <rect x="88" y="24" width="76" height="64" rx="5" fill="var(--fig-node-b)" opacity=".14" />
      <rect x="88" y="24" width="76" height="64" rx="5" fill="none" stroke="var(--fig-node-b)" stroke-width="1.1" />
      <text x="95" y="38" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">Exchange</text>
      <text x="95" y="50" font-size="7" fill="var(--fig-text)">按类型 + key</text>
      <text x="95" y="60" font-size="7" fill="var(--fig-text)">路由到队列</text>
      <text x="95" y="74" font-size="7" fill="var(--fig-node-c)">direct/fanout</text>
      <text x="95" y="83" font-size="7" fill="var(--fig-node-c)">topic/headers</text>

      <!-- Binding 标注 -->
      <text x="168" y="42" font-size="7" fill="var(--fig-muted)">Binding</text>
      <text x="168" y="52" font-size="7" fill="var(--fig-muted)">绑定规则</text>

      <!-- 两条分叉箭头到两个队列 -->
      <path d="M164 46 V38 H196" stroke="var(--fig-muted)" stroke-width="1.2" fill="none" marker-end="url(#arrR)" />
      <path d="M164 70 V78 H196" stroke="var(--fig-muted)" stroke-width="1.2" fill="none" marker-end="url(#arrR)" />

      <!-- Queue A -->
      <rect x="198" y="24" width="76" height="28" rx="4" fill="var(--fig-node-c)" opacity=".13" />
      <text x="204" y="36" font-size="7.5" font-weight="700" fill="var(--fig-node-c)">Queue A</text>
      <text x="204" y="46" font-size="7" fill="var(--fig-text)">真正的存储（FIFO）</text>

      <!-- Queue B -->
      <rect x="198" y="64" width="76" height="28" rx="4" fill="var(--fig-node-d)" opacity=".13" />
      <text x="204" y="76" font-size="7.5" font-weight="700" fill="var(--fig-node-d)">Queue B</text>
      <text x="204" y="86" font-size="7" fill="var(--fig-text)">同名可在不同 vhost</text>

      <!-- 消费者 -->
      <path d="M274 38 H292" stroke="var(--fig-muted)" stroke-width="1.2" fill="none" marker-end="url(#arrR)" />
      <path d="M274 78 H292" stroke="var(--fig-muted)" stroke-width="1.2" fill="none" marker-end="url(#arrR)" />

      <rect x="294" y="24" width="40" height="28" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="299" y="36" font-size="7" fill="var(--fig-text)">Consumer</text>
      <text x="299" y="46" font-size="7" fill="var(--fig-muted)">竞争消费</text>

      <rect x="294" y="64" width="40" height="28" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="299" y="76" font-size="7" fill="var(--fig-text)">Consumer</text>
      <text x="299" y="86" font-size="7" fill="var(--fig-muted)">各自消费</text>

      <!-- 四种交换机 -->
      <rect x="6" y="100" width="328" height="62" rx="5" fill="var(--fig-node-b)" opacity=".08" />
      <text x="14" y="114" font-size="8" font-weight="700" fill="var(--fig-node-b)">四种交换机（决定消息怎么分到队列）</text>
      <text x="14" y="127" font-size="7" fill="var(--fig-text)">direct：routing key 精确匹配 ｜ fanout：忽略 key 广播到所有绑定队列</text>
      <text x="14" y="139" font-size="7" fill="var(--fig-text)">topic：按通配符匹配（ * 一个词， # 零到多） ｜ headers：按消息头匹配（少用）</text>
      <text x="14" y="153" font-size="7" fill="var(--fig-node-c)">fanout 是「一条消息发给多个队列」最直接的方式</text>

      <!-- vhost -->
      <rect x="6" y="170" width="160" height="46" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="184" font-size="8" font-weight="700" fill="var(--fig-node-d)">vhost（逻辑隔离）</text>
      <text x="14" y="197" font-size="7" fill="var(--fig-text)">每 vhost 内队列/交换机独立</text>
      <text x="14" y="208" font-size="7" fill="var(--fig-text)">同名不冲突，权限按 vhost 授权</text>

      <!-- 集群提醒 -->
      <rect x="174" y="170" width="160" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="182" y="184" font-size="8" font-weight="700" fill="#e5484d">集群 ≠ 高可用</text>
      <text x="182" y="197" font-size="7" fill="var(--fig-text)">默认队列消息只在单节点</text>
      <text x="182" y="208" font-size="7" fill="var(--fig-text)">要 Quorum Queue 才有副本</text>

      <!-- 可靠性三件事 -->
      <rect x="6" y="226" width="328" height="52" rx="5" fill="var(--fig-node-a)" opacity=".08" />
      <text x="14" y="240" font-size="8" font-weight="700" fill="var(--fig-node-a)">可靠性三件事（缺一件就可能丢消息）</text>
      <text x="14" y="253" font-size="7" fill="var(--fig-text)">① 生产：开启 publisher confirm 确认消息真的到了 Broker</text>
      <text x="14" y="265" font-size="7" fill="var(--fig-text)">② 存储：durable 队列 + persistent 消息（两个都要设）</text>
      <text x="14" y="277" font-size="7" fill="var(--fig-text)">③ 消费：手动 ack（autoAck 时消费者崩溃＝消息丢失）</text>

      <!-- 底部 -->
      <text x="6" y="292" font-size="7.5" fill="var(--fig-muted)">消息积压在哪一层？在 Queue（Exchange 不存储消息）</text>
      <text x="6" y="306" font-size="7" fill="#e5484d">集群共享元数据，但消息体只在其中一个节点上</text>
    </svg>
    <figcaption>Producer → Exchange（四类型）→ Binding → Queue → Consumer；Exchange 是关键中间层（一条消息可按规则分发到多队列），vhost 做逻辑隔离，集群默认不保证高可用</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
