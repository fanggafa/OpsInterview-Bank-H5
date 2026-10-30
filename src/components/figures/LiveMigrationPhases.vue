<script setup>
/**
 * 虚拟机热迁移的「迭代拷贝」原理（题 2605）。
 *
 * 核心洞察：热迁移不是「一次性搬内存」，而是「全量 → 反复拷脏页 → 最后极短暂停」；
 * 停机时间只取决于「最后那点脏页」，这也是为什么内存越大、写入越热越难迁。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 282" role="img" aria-label="热迁移迭代拷贝：先在目标机创建空 VM，全量拷内存，反复拷脏页，最后极短暂停拷剩余脏页与 CPU 状态">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">热迁移不是一次搬完，而是「全量 → 反复拷脏页 → 极短暂停」</text>

      <!-- 步骤 1 -->
      <rect x="6" y="20" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="7.5" font-weight="700" fill="var(--fig-node-a)">① 目标宿主机创建空 VM</text>
      <text x="150" y="37" font-size="7.5" fill="var(--fig-text)">同样的配置、同样的虚拟硬件</text>

      <!-- 步骤 2 -->
      <rect x="6" y="50" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="63" font-size="7.5" font-weight="700" fill="var(--fig-node-b)">② 第一次全量拷贝内存</text>
      <text x="150" y="67" font-size="7.5" fill="var(--fig-text)">几 GB ~ 几十 GB，最耗时的阶段</text>
      <text x="14" y="77" font-size="7.5" fill="var(--fig-node-c)">此阶段源 VM 照常对外服务，不中断</text>

      <!-- 步骤 3 -->
      <rect x="6" y="88" width="328" height="38" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="101" font-size="7.5" font-weight="700" fill="var(--fig-node-c)">③ 反复拷贝「脏页」（迭代）</text>
      <text x="150" y="105" font-size="7.5" fill="var(--fig-text)">拷完第一轮后源 VM 又改了内存 → 只拷变化的部分</text>
      <text x="14" y="118" font-size="7.5" fill="var(--fig-text)">每轮一般更小，重复直到「脏页足够少」（收敛）</text>

      <!-- 步骤 4 -->
      <rect x="6" y="130" width="328" height="38" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="143" font-size="7.5" font-weight="700" fill="#e5484d">④ 极短暂停（真正的停机）</text>
      <text x="150" y="147" font-size="7.5" fill="var(--fig-text)">暂停源 VM → 拷完剩余脏页 + CPU 寄存器状态</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">停机时间通常几十毫秒 ~ 几百毫秒（这才是用户感知的部分）</text>

      <!-- 步骤 5 -->
      <rect x="6" y="172" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="185" font-size="7.5" font-weight="700" fill="var(--fig-node-d)">⑤ 目标 VM 启动接管，源 VM 销毁</text>
      <text x="188" y="189" font-size="7.5" fill="var(--fig-text)">网络切换（ARP 更新 / 流量重定向）</text>

      <!-- 为什么难迁 -->
      <rect x="6" y="206" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="219" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">为什么有的 VM「迁不动」？</text>
      <text x="14" y="231" font-size="7.5" fill="var(--fig-text)">写入太热（脏页产生速度 &gt; 传输速度）→ 永远收敛不了，只能强制停机迁</text>
      <text x="14" y="244" font-size="7.5" fill="var(--fig-text)">内存太大 / 跨机房带宽小 → 单轮拷贝时间过长</text>

      <text x="6" y="264" font-size="7.5" fill="var(--fig-muted)">生产注意：错开业务高峰、预留带宽、迁移前确认目标机资源与亲和性</text>
      <text x="6" y="274" font-size="7.5" fill="var(--fig-muted)">加分点：说清「停机时间取决于最后那点脏页，而不是总内存」</text>
    </svg>
    <figcaption>热迁移靠「全量 + 反复拷脏页」把停机压缩到最后几十毫秒；脏页收敛不了就只能强制停机</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
