<script setup>
/**
 * Redis 主从复制（题 8132）。
 *
 * 核心洞察：复制只有两条路 —— 第一次必然全量（BGSAVE 出 RDB + 缓冲区补命令），
 * 之后靠命令传播维持；断线重连时由 repl_backlog 决定是「补一小段」还是「整份重来」。
 * 所以 backlog 的大小，直接决定了主库会不会被反复全量拖垮。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 356" role="img" aria-label="Redis 主从复制：首次全量的四步、命令传播与 repl_backlog 环形窗口，以及断线重连时命中与不命中的两条走向">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">全量只做一次，之后全靠 backlog 续传</text>

      <defs>
        <marker id="mR1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-a)" />
        </marker>
        <marker id="mR2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-c)" />
        </marker>
        <marker id="mR3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#e5484d" />
        </marker>
      </defs>

      <!-- ============ ① 首次全量四步 ============ -->
      <rect x="6" y="20" width="328" height="92" rx="6" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="34" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 首次同步：全量 RDB + 缓冲区补差</text>

      <rect x="10" y="42" width="74" height="32" rx="4" fill="none" stroke="var(--fig-node-a)" stroke-width="1.2" />
      <text x="47" y="54" text-anchor="middle" font-size="7.5" font-weight="700" fill="var(--fig-node-a)">PSYNC ? -1</text>
      <text x="47" y="66" text-anchor="middle" font-size="7" fill="var(--fig-muted)">从库请求全量</text>

      <path d="M85 58 L92 58" stroke="var(--fig-node-a)" stroke-width="1.4" marker-end="url(#mR1)" />

      <rect x="94" y="42" width="74" height="32" rx="4" fill="none" stroke="var(--fig-node-a)" stroke-width="1.2" />
      <text x="131" y="54" text-anchor="middle" font-size="7.5" font-weight="700" fill="var(--fig-node-a)">BGSAVE</text>
      <text x="131" y="66" text-anchor="middle" font-size="7" fill="var(--fig-muted)">fork 出 RDB</text>

      <path d="M169 58 L176 58" stroke="var(--fig-node-a)" stroke-width="1.4" marker-end="url(#mR1)" />

      <rect x="178" y="42" width="72" height="32" rx="4" fill="none" stroke="var(--fig-node-a)" stroke-width="1.2" />
      <text x="214" y="54" text-anchor="middle" font-size="7.5" font-weight="700" fill="var(--fig-node-a)">传 RDB</text>
      <text x="214" y="66" text-anchor="middle" font-size="7" fill="var(--fig-muted)">从库先清空</text>

      <path d="M251 58 L258 58" stroke="var(--fig-node-a)" stroke-width="1.4" marker-end="url(#mR1)" />

      <rect x="260" y="42" width="70" height="32" rx="4" fill="var(--fig-node-b)" opacity=".2" />
      <text x="295" y="54" text-anchor="middle" font-size="7.5" font-weight="700" fill="var(--fig-node-b)">补缓冲</text>
      <text x="295" y="66" text-anchor="middle" font-size="7" fill="var(--fig-node-b)">追平命令空档</text>

      <text x="14" y="88" font-size="7.5" fill="var(--fig-text)">BGSAVE 期间的写命令先进 replication buffer，RDB 传完再补发</text>
      <text x="14" y="102" font-size="7" fill="var(--fig-muted)">fork 与 RDB 传输是内存与带宽的双重峰值，大实例要错峰执行</text>

      <!-- ============ ② 命令传播 + backlog 环形窗口 ============ -->
      <rect x="6" y="120" width="328" height="76" rx="6" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="134" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">② 命令传播 · repl_backlog 是个环形窗口</text>

      <rect x="14" y="142" width="36" height="16" rx="2" fill="var(--fig-node-c)" opacity=".25" />
      <rect x="54" y="142" width="36" height="16" rx="2" fill="var(--fig-node-c)" opacity=".25" />
      <rect x="94" y="142" width="36" height="16" rx="2" fill="var(--fig-node-c)" opacity=".25" />
      <rect x="134" y="142" width="36" height="16" rx="2" fill="var(--fig-node-c)" opacity=".25" />
      <rect x="174" y="142" width="36" height="16" rx="2" fill="var(--fig-node-c)" opacity=".25" />
      <rect x="214" y="142" width="36" height="16" rx="2" fill="var(--fig-node-c)" opacity=".25" />
      <rect x="254" y="142" width="36" height="16" rx="2" fill="var(--fig-node-c)" opacity=".25" />
      <rect x="294" y="142" width="36" height="16" rx="2" fill="none" stroke="var(--fig-node-c)" stroke-width="1.1" stroke-dasharray="3 2" />

      <text x="14" y="172" font-size="7" fill="var(--fig-node-c)">实线格＝仍在窗口内，断线后从 offset 处补发即可</text>
      <text x="14" y="184" font-size="7" fill="#e5484d">虚线格＝已被新写覆盖，offset 滚出去就只能全量重来</text>

      <!-- ============ ③ 断线重连两条路 ============ -->
      <rect x="6" y="204" width="328" height="88" rx="6" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="218" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">③ 断线重连：由 backlog 决定走哪条</text>

      <rect x="10" y="228" width="86" height="34" rx="4" fill="none" stroke="var(--fig-node-b)" stroke-width="1.2" />
      <text x="53" y="240" text-anchor="middle" font-size="7.5" fill="var(--fig-text)">从库重连</text>
      <text x="53" y="252" text-anchor="middle" font-size="7" fill="var(--fig-node-b)">PSYNC runid+offset</text>

      <path d="M97 245 L104 245" stroke="var(--fig-node-b)" stroke-width="1.4" marker-end="url(#mR2)" />

      <rect x="106" y="228" width="94" height="34" rx="4" fill="var(--fig-node-b)" opacity=".25" />
      <text x="153" y="240" text-anchor="middle" font-size="7.5" font-weight="700" fill="var(--fig-node-b)">主库校验两件事</text>
      <text x="153" y="252" text-anchor="middle" font-size="7" fill="var(--fig-node-b)">runid 匹配 · offset 在窗口</text>

      <path d="M201 238 L208 238" stroke="var(--fig-node-c)" stroke-width="1.4" marker-end="url(#mR2)" />
      <path d="M201 252 L208 252" stroke="#e5484d" stroke-width="1.4" marker-end="url(#mR3)" />

      <rect x="210" y="228" width="120" height="20" rx="4" fill="var(--fig-node-c)" opacity=".2" />
      <text x="270" y="241" text-anchor="middle" font-size="7.5" fill="var(--fig-node-c)">命中 → 只补 offset 之后</text>

      <rect x="210" y="252" width="120" height="20" rx="4" fill="#e5484d" opacity=".12" />
      <text x="270" y="265" text-anchor="middle" font-size="7.5" fill="#e5484d">不命中 → 退回全量重传</text>

      <text x="14" y="284" font-size="7" fill="var(--fig-muted)">默认 1MB；写入量大或断线久就滚出窗口，只能重跑 BGSAVE</text>

      <!-- ============ ④ 结论 ============ -->
      <rect x="6" y="300" width="328" height="52" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="313" font-size="8.5" font-weight="700" fill="#e5484d">三个必须记住的结论</text>
      <text x="14" y="326" font-size="7.5" fill="var(--fig-text)">命令传播是异步的：主库写完即返回，从库必然滞后</text>
      <text x="14" y="337" font-size="7.5" fill="var(--fig-text)">主从复制≠高可用，主挂了不会自动切，要哨兵或集群</text>
      <text x="14" y="348" font-size="7" fill="var(--fig-muted)">大流量实例把 repl-backlog-size 调到 64MB 级</text>
    </svg>
    <figcaption>首次同步必然全量（BGSAVE 出 RDB + 缓冲区补差），之后靠命令传播；断线时 offset 还在 backlog 窗口内就只补增量，滚出窗口就得整份重来</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
