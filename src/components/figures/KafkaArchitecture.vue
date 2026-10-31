<script setup>
/**
 * Kafka 基本架构（题 4126）。
 *
 * 核心洞察：Kafka 的「快」来自三件事——顺序写盘、零拷贝、分区并行；
 * 而「分区」既是并行单位、也是唯一能保证有序的边界。
 * 架构上真正要记住的是：Topic 是逻辑的，Partition 才是物理的。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 302" role="img" aria-label="Kafka 四层架构：Producer 写入 Broker 集群，Topic 在 Broker 内部分成多个 Partition，每个 Partition 有 Leader 与 Follower，Consumer Group 组内瓜分分区；下方由 ZooKeeper 或 KRaft 负责元数据与选举">
      <defs>
        <marker id="arrK" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-muted)" />
        </marker>
      </defs>

      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">Topic 是逻辑的，Partition 才是物理的</text>

      <!-- Producer -->
      <rect x="6" y="22" width="86" height="52" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="38" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">Producer</text>
      <text x="14" y="51" font-size="7" fill="var(--fig-text)">按 key 决定</text>
      <text x="14" y="61" font-size="7" fill="var(--fig-text)">进哪个 partition</text>
      <text x="14" y="70" font-size="7" fill="var(--fig-muted)">同 key → 同分区</text>

      <path d="M92 48 H118" stroke="var(--fig-muted)" stroke-width="1.4" fill="none" marker-end="url(#arrK)" />

      <!-- Broker 集群大框 -->
      <rect x="120" y="22" width="130" height="140" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <rect x="120" y="22" width="130" height="140" rx="5" fill="none" stroke="var(--fig-node-b)" stroke-width="1" opacity=".5" />
      <text x="127" y="36" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">Broker 集群</text>

      <!-- Topic 内部分区 -->
      <text x="127" y="50" font-size="7" fill="var(--fig-muted)">Topic: order-events</text>

      <rect x="127" y="56" width="116" height="30" rx="3" fill="var(--fig-node-a)" opacity=".13" />
      <text x="133" y="68" font-size="7.5" font-weight="700" fill="var(--fig-node-a)">Partition 0</text>
      <text x="133" y="79" font-size="7" fill="var(--fig-text)">Leader(b1) + Follower(b2)</text>

      <rect x="127" y="90" width="116" height="30" rx="3" fill="var(--fig-node-c)" opacity=".13" />
      <text x="133" y="102" font-size="7.5" font-weight="700" fill="var(--fig-node-c)">Partition 1</text>
      <text x="133" y="113" font-size="7" fill="var(--fig-text)">Leader(b2) + Follower(b3)</text>

      <rect x="127" y="124" width="116" height="30" rx="3" fill="var(--fig-node-d)" opacity=".13" />
      <text x="133" y="136" font-size="7.5" font-weight="700" fill="var(--fig-node-d)">Partition 2</text>
      <text x="133" y="147" font-size="7" fill="var(--fig-text)">Leader(b3) + Follower(b1)</text>

      <path d="M250 92 H276" stroke="var(--fig-muted)" stroke-width="1.4" fill="none" marker-end="url(#arrK)" />

      <!-- Consumer Group -->
      <rect x="278" y="22" width="56" height="52" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="284" y="36" font-size="8" font-weight="700" fill="var(--fig-node-c)">Consumer</text>
      <text x="284" y="46" font-size="8" font-weight="700" fill="var(--fig-node-c)">Group</text>
      <text x="284" y="58" font-size="7" fill="var(--fig-text)">组内瓜分</text>
      <text x="284" y="68" font-size="7" fill="var(--fig-text)">分区</text>

      <!-- 并行与有序的说明 -->
      <rect x="6" y="82" width="86" height="80" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="96" font-size="8" font-weight="700" fill="var(--fig-node-d)">分区意味着</text>
      <text x="14" y="109" font-size="7" fill="var(--fig-text)">并行：多分区</text>
      <text x="14" y="119" font-size="7" fill="var(--fig-text)">同时读写</text>
      <text x="14" y="132" font-size="7" fill="var(--fig-node-d)">有序：仅单分</text>
      <text x="14" y="142" font-size="7" fill="var(--fig-node-d)">区内保证</text>
      <text x="14" y="155" font-size="7" fill="var(--fig-muted)">跨分区无序</text>

      <!-- 元数据层 -->
      <rect x="120" y="170" width="214" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="128" y="182" font-size="7.5" font-weight="700" fill="var(--fig-node-b)">ZooKeeper / KRaft</text>
      <text x="128" y="194" font-size="7" fill="var(--fig-text)">存 broker 注册、topic 元数据、controller 选举</text>

      <path d="M227 162 V170" stroke="var(--fig-muted)" stroke-width="1.1" fill="none" marker-end="url(#arrK)" />

      <!-- 三个关键设计 -->
      <rect x="6" y="210" width="328" height="52" rx="5" fill="var(--fig-node-a)" opacity=".08" />
      <text x="14" y="224" font-size="8" font-weight="700" fill="var(--fig-node-a)">为什么快（三个关键设计）</text>
      <text x="14" y="237" font-size="7.5" fill="var(--fig-text)">① 顺序写磁盘：消息追加写入，不是随机写 → 接近内存速度</text>
      <text x="14" y="249" font-size="7.5" fill="var(--fig-text)">② 零拷贝：sendfile 从页缓存直达 socket，不经过用户态</text>
      <text x="14" y="261" font-size="7.5" fill="var(--fig-text)">③ 分区并行：一个 topic 拆多分区，读写都能并行</text>

      <!-- 副本提醒 -->
      <rect x="6" y="270" width="328" height="24" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="286" font-size="7.5" fill="#e5484d">副本数决定安全性：replication-factor=3 挂 1 台不丢；=1 就真丢了</text>
    </svg>
    <figcaption>Producer → Broker 集群（Topic 拆多个 Partition，各有 Leader+Follower）→ Consumer Group 组内瓜分分区；分区既是并行单位也是有序边界，下方由 ZooKeeper/KRaft 负责元数据</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
