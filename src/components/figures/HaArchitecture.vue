<script setup>
/**
 * 高可用分层架构（题 12082）。
 *
 * 核心洞察：高可用不是「某一层上了集群」，而是**逐层消除单点**——
 * 每一层都要能回答「这层的单点是什么、用什么手段消掉、挂了影响多大」；
 * 投入顺序按「影响面 × 概率」，不是每层都做到极致。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 324" role="img" aria-label="高可用五层架构：入口、负载均衡、应用、缓存与数据库、存储，每层右侧标注该层残留单点与消除手段，底部标投产顺序">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">高可用 = 每层无单点 + 自动切换 + 限制故障域</text>

      <!-- ① 入口 -->
      <rect x="6" y="24" width="196" height="40" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="37" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 入口：DNS 多线路 + CDN</text>
      <text x="14" y="49" font-size="7.5" fill="var(--fig-text)">权威 DNS 挂 → 全站域名解析失败</text>
      <text x="14" y="60" font-size="7.5" fill="var(--fig-text)">多厂商 NS / GSLB 按地域就近分发</text>
      <rect x="208" y="24" width="126" height="40" rx="5" fill="var(--fig-node-a)" opacity=".07" />
      <text x="214" y="37" font-size="7.5" font-weight="700" fill="var(--fig-node-a)">单点：权威 DNS</text>
      <text x="214" y="48" font-size="7" fill="var(--fig-text)">→ 多厂商 NS + CDN 回源</text>
      <text x="214" y="59" font-size="7" fill="var(--fig-text)">自建 DNS 挂 = 全站失联</text>
      <line x1="104" y1="65" x2="104" y2="71" stroke="var(--fig-stroke)" stroke-width="1.2" />
      <polygon points="101,69 107,69 104,75" fill="var(--fig-muted)" />

      <!-- ② 负载均衡 -->
      <rect x="6" y="76" width="196" height="40" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="89" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② 负载均衡：主备 + VIP 漂移</text>
      <text x="14" y="101" font-size="7.5" fill="var(--fig-text)">VRRP 心跳：主挂则 VIP 漂到备机</text>
      <text x="14" y="112" font-size="7.5" fill="var(--fig-text)">VIP 本身是单点 → 靠秒级漂移扛</text>
      <rect x="208" y="76" width="126" height="40" rx="5" fill="var(--fig-node-b)" opacity=".07" />
      <text x="214" y="89" font-size="7.5" font-weight="700" fill="var(--fig-node-b)">单点：VIP 绑定主机</text>
      <text x="214" y="100" font-size="7" fill="var(--fig-text)">→ Keepalived + VRRP</text>
      <text x="214" y="111" font-size="7" fill="var(--fig-text)">心跳断了才会自动漂移</text>
      <line x1="104" y1="117" x2="104" y2="123" stroke="var(--fig-stroke)" stroke-width="1.2" />
      <polygon points="101,121 107,121 104,127" fill="var(--fig-muted)" />

      <!-- ③ 应用 -->
      <rect x="6" y="128" width="196" height="40" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="141" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">③ 应用：无状态 + 多实例</text>
      <text x="14" y="153" font-size="7.5" fill="var(--fig-text)">readiness 失败 → 摘流量（不重启）</text>
      <text x="14" y="164" font-size="7.5" fill="var(--fig-text)">liveness 失败 → 重启容器</text>
      <rect x="208" y="128" width="126" height="40" rx="5" fill="var(--fig-node-c)" opacity=".07" />
      <text x="214" y="141" font-size="7.5" font-weight="700" fill="var(--fig-node-c)">单点：有状态就必单点</text>
      <text x="214" y="152" font-size="7" fill="var(--fig-text)">状态外置 → 会话进 Redis</text>
      <text x="214" y="163" font-size="7" fill="var(--fig-text)">熔断 + 降级 + 限流兜底</text>
      <line x1="104" y1="169" x2="104" y2="175" stroke="var(--fig-stroke)" stroke-width="1.2" />
      <polygon points="101,173 107,173 104,179" fill="var(--fig-muted)" />

      <!-- ④ 缓存 / DB -->
      <rect x="6" y="180" width="196" height="40" rx="5" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="193" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">④ 缓存 / DB：主从 + 切换</text>
      <text x="14" y="205" font-size="7.5" fill="var(--fig-text)">Redis 哨兵 / 集群；MySQL 主从</text>
      <text x="14" y="216" font-size="7.5" fill="var(--fig-text)">读写分离：主库单点变只读多点</text>
      <rect x="208" y="180" width="126" height="40" rx="5" fill="var(--fig-node-d)" opacity=".07" />
      <text x="214" y="193" font-size="7.5" font-weight="700" fill="var(--fig-node-d)">单点：主库的写入</text>
      <text x="214" y="204" font-size="7" fill="var(--fig-text)">→ 主从 + 自动提升</text>
      <text x="214" y="215" font-size="7" fill="var(--fig-text)">旧主必须先降级为从</text>
      <line x1="104" y1="221" x2="104" y2="227" stroke="var(--fig-stroke)" stroke-width="1.2" />
      <polygon points="101,225 107,225 104,231" fill="var(--fig-muted)" />

      <!-- ⑤ 存储 -->
      <rect x="6" y="232" width="196" height="40" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="245" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">⑤ 存储：副本 + 多可用区</text>
      <text x="14" y="257" font-size="7.5" fill="var(--fig-text)">对象存储多副本；块存储做快照</text>
      <text x="14" y="268" font-size="7.5" fill="var(--fig-text)">定期演练：没演练 = 没有高可用</text>
      <rect x="208" y="232" width="126" height="40" rx="5" fill="var(--fig-node-a)" opacity=".07" />
      <text x="214" y="245" font-size="7.5" font-weight="700" fill="var(--fig-node-a)">单点：单副本 / 单 AZ</text>
      <text x="214" y="256" font-size="7" fill="var(--fig-text)">→ 3 副本跨可用区</text>
      <text x="214" y="267" font-size="7" fill="var(--fig-text)">跨 AZ 才是真冗余</text>

      <!-- 投产顺序 -->
      <rect x="6" y="280" width="328" height="40" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="292" font-size="8" font-weight="700" fill="var(--fig-node-d)">投产顺序：按「影响面 × 概率」投入</text>
      <text x="14" y="303" font-size="7.5" fill="var(--fig-text)">① 先消关键单点：DB 主从、LB 主备</text>
      <text x="14" y="315" font-size="7.5" fill="var(--fig-text)">② 再做自动切换 → ③ 最后才是多活</text>
    </svg>
    <figcaption>高可用是逐层消除单点：入口 DNS/CDN → LB 主备 VIP → 无状态多实例 → 缓存与 DB 主从 → 多副本存储；每层都先问「这层的单点是什么」</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
