<script setup>
/**
 * Kafka 各组件的工作机制与常见优化点（题 4127）。
 *
 * 核心洞察：三段链路各管一件事 —— Producer 决定「怎么攒、往哪个分区发」，
 * Broker 决定「怎么落盘而不随机写」，Consumer Group 决定「谁来消费、何时算消费完」。
 * 吞吐问题要先定位断在哪一段：攒批不够看 Producer、顺序写与页缓存看 Broker、
 * 拉取批次与提交时机看 Consumer —— 每段旁标的参数，就是那一段唯一该动的东西。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 294" role="img" aria-label="Kafka 三段链路：Producer 序列化分区后攒批发送、Broker 追加段文件加索引并按大小时间滚动、Consumer Group 分摊分区并处理完再提交；每段旁标各自的优化参数">
      <defs>
        <marker id="arrStep" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-muted)" />
        </marker>
      </defs>

      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">三段链路：先定位瓶颈在哪一段，再动那一段的参数</text>

      <!-- ① Producer 段 -->
      <rect x="6" y="20" width="328" height="74" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="34" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① Producer：攒批是吞吐的命门</text>

      <rect x="14" y="42" width="72" height="20" rx="3" fill="var(--fig-node-a)" opacity=".12" />
      <text x="50" y="55" font-size="7" text-anchor="middle" fill="var(--fig-node-a)">序列化</text>

      <rect x="92" y="42" width="72" height="20" rx="3" fill="var(--fig-node-a)" opacity=".12" />
      <text x="128" y="55" font-size="7" text-anchor="middle" fill="var(--fig-node-a)">分区器 key 哈希</text>

      <rect x="170" y="42" width="72" height="20" rx="3" fill="var(--fig-node-a)" opacity=".12" />
      <text x="206" y="55" font-size="7" text-anchor="middle" fill="var(--fig-node-a)">累积成 batch</text>

      <rect x="248" y="42" width="72" height="20" rx="3" fill="var(--fig-node-a)" opacity=".12" />
      <text x="284" y="55" font-size="7" text-anchor="middle" fill="var(--fig-node-a)">发送 + 重试</text>

      <path d="M87 47 L89.5 52 L87 57" stroke="var(--fig-muted)" stroke-width="1.2" fill="none" />
      <path d="M165 47 L167.5 52 L165 57" stroke="var(--fig-muted)" stroke-width="1.2" fill="none" />
      <path d="M243 47 L245.5 52 L243 57" stroke="var(--fig-muted)" stroke-width="1.2" fill="none" />

      <text x="14" y="75" font-size="7.5" fill="var(--fig-node-a)">优化：batch.size 调大批量，linger.ms 等凑批</text>
      <text x="14" y="87" font-size="7.5" fill="var(--fig-node-a)">acks=all 最安全；compression.type 用 lz4 省带宽</text>

      <path d="M170 94 V102" stroke="var(--fig-muted)" stroke-width="1.2" fill="none" marker-end="url(#arrStep)" />

      <!-- ② Broker 段 -->
      <rect x="6" y="102" width="328" height="86" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="116" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② Broker：只追加不修改，靠索引定位</text>

      <rect x="14" y="124" width="100" height="20" rx="3" fill="var(--fig-node-b)" opacity=".12" />
      <text x="64" y="137" font-size="7" text-anchor="middle" fill="var(--fig-node-b)">追加写 00000.log</text>

      <rect x="120" y="124" width="100" height="20" rx="3" fill="var(--fig-node-b)" opacity=".12" />
      <text x="170" y="137" font-size="7" text-anchor="middle" fill="var(--fig-node-b)">.index 稀疏索引</text>

      <rect x="226" y="124" width="100" height="20" rx="3" fill="var(--fig-node-b)" opacity=".12" />
      <text x="276" y="137" font-size="7" text-anchor="middle" fill="var(--fig-node-b)">按大小/时间滚动</text>

      <path d="M115 129 L117.5 134 L115 139" stroke="var(--fig-muted)" stroke-width="1.2" fill="none" />
      <path d="M221 129 L223.5 134 L221 139" stroke="var(--fig-muted)" stroke-width="1.2" fill="none" />

      <text x="14" y="157" font-size="7.5" fill="var(--fig-node-b)">优化：多盘顺序写（JBOD/RAID10，别用 RAID5）</text>
      <text x="14" y="169" font-size="7.5" fill="var(--fig-node-b)">num.partitions 定并行度，log.retention 别太长</text>
      <text x="14" y="181" font-size="7.5" fill="var(--fig-node-b)">留足 OS 页缓存（30%+），读写全走它</text>

      <path d="M170 188 V196" stroke="var(--fig-muted)" stroke-width="1.2" fill="none" marker-end="url(#arrStep)" />

      <!-- ③ Consumer Group 段 -->
      <rect x="6" y="196" width="328" height="86" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="210" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">③ Consumer Group：分区瓜分 + 手动提交</text>

      <rect x="14" y="218" width="100" height="20" rx="3" fill="var(--fig-node-c)" opacity=".12" />
      <text x="64" y="231" font-size="7" text-anchor="middle" fill="var(--fig-node-c)">组内分摊分区</text>

      <rect x="120" y="218" width="100" height="20" rx="3" fill="var(--fig-node-c)" opacity=".12" />
      <text x="170" y="231" font-size="7" text-anchor="middle" fill="var(--fig-node-c)">拉取并处理</text>

      <rect x="226" y="218" width="100" height="20" rx="3" fill="var(--fig-node-c)" opacity=".12" />
      <text x="276" y="231" font-size="7" text-anchor="middle" fill="var(--fig-node-c)">处理完再 commit</text>

      <path d="M115 223 L117.5 228 L115 233" stroke="var(--fig-muted)" stroke-width="1.2" fill="none" />
      <path d="M221 223 L223.5 228 L221 233" stroke="var(--fig-muted)" stroke-width="1.2" fill="none" />

      <text x="14" y="251" font-size="7.5" fill="var(--fig-node-c)">优化：fetch.min.bytes 调大减少往返</text>
      <text x="14" y="263" font-size="7.5" fill="var(--fig-node-c)">max.poll.records 限单批，避免被判死</text>
      <text x="14" y="275" font-size="7.5" fill="var(--fig-node-c)">处理完再提交 offset；先加分区、再扩消费者</text>

      <text x="6" y="289" font-size="7.5" fill="var(--fig-node-d)">消费堆积先加分区再扩消费者；只扩消费者会空转</text>
    </svg>
    <figcaption>三段链路：Producer 序列化分区后攒批发送、Broker 追加段文件加索引并按大小时间滚动、Consumer Group 分摊分区并处理完再提交 offset；每段旁标该段唯一该调的参数</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
