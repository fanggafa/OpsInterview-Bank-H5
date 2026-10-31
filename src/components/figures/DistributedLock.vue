<script setup>
/**
 * 分布式锁的三种实现与三个难题（题 12085）。
 *
 * 核心洞察：三种实现解决的是同一件事 —— 「谁持锁、锁怎么释放」，
 * 差别只在「防死锁」靠什么：Redis 靠过期、ZK 靠临时节点、DB 靠事务回滚；
 * 而锁本身的三个死穴（过期、主从切换、等待）都只能靠业务侧兜底。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 362" role="img" aria-label="分布式锁三种实现：Redis 原子加锁与 Lua 解锁及看门狗、ZooKeeper 临时顺序节点、数据库唯一索引；下方列出锁过期、主从切换、等待公平三个难题">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">三种实现只在「防死锁靠什么」上不同</text>

      <!-- 三必备特性 -->
      <rect x="6" y="20" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="32" font-size="8" font-weight="700" fill="var(--fig-node-a)">三个必备特性（缺一条就出事）</text>
      <text x="14" y="43" font-size="7" fill="var(--fig-text)">互斥 · 防死锁（持锁者崩了能放）· 防误删</text>

      <!-- ① Redis -->
      <rect x="6" y="52" width="328" height="80" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="65" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">① Redis · 最常用</text>
      <rect x="14" y="72" width="88" height="18" rx="3" fill="var(--fig-node-b)" opacity=".2" />
      <text x="18" y="84" font-size="7" fill="var(--fig-text)">加锁 SET NX</text>
      <line x1="104" y1="81" x2="115" y2="81" stroke="var(--fig-node-b)" stroke-width="1.2" />
      <polygon points="113,77.8 113,84.2 119,81" fill="var(--fig-node-b)" />
      <rect x="121" y="72" width="80" height="18" rx="3" fill="var(--fig-node-b)" opacity=".2" />
      <text x="125" y="84" font-size="7" fill="var(--fig-text)">EX 过期兜底</text>
      <line x1="203" y1="81" x2="214" y2="81" stroke="var(--fig-node-b)" stroke-width="1.2" />
      <polygon points="212,77.8 212,84.2 218,81" fill="var(--fig-node-b)" />
      <rect x="220" y="72" width="110" height="18" rx="3" fill="var(--fig-node-b)" opacity=".2" />
      <text x="224" y="84" font-size="7" fill="var(--fig-text)">唯一值 value 防误删</text>
      <rect x="14" y="96" width="122" height="18" rx="3" fill="var(--fig-node-b)" opacity=".2" />
      <text x="18" y="108" font-size="7" fill="var(--fig-text)">解锁：Lua 先比再删</text>
      <line x1="138" y1="105" x2="149" y2="105" stroke="var(--fig-node-b)" stroke-width="1.2" />
      <polygon points="147,101.8 147,108.2 153,105" fill="var(--fig-node-b)" />
      <rect x="155" y="96" width="106" height="18" rx="3" fill="var(--fig-node-b)" opacity=".2" />
      <text x="159" y="108" font-size="7" fill="var(--fig-text)">看门狗 10s 续期</text>
      <text x="14" y="126" font-size="7" fill="var(--fig-node-b)">保证点：加锁一条命令、解锁一段 Lua，中间无窗口</text>

      <!-- ② ZooKeeper -->
      <rect x="6" y="138" width="328" height="76" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="151" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">② ZooKeeper · 天然防死锁</text>
      <rect x="14" y="158" width="100" height="18" rx="3" fill="var(--fig-node-c)" opacity=".2" />
      <text x="18" y="170" font-size="7" fill="var(--fig-text)">建临时顺序节点</text>
      <line x1="116" y1="167" x2="127" y2="167" stroke="var(--fig-node-c)" stroke-width="1.2" />
      <polygon points="125,163.8 125,170.2 131,167" fill="var(--fig-node-c)" />
      <rect x="133" y="158" width="90" height="18" rx="3" fill="var(--fig-node-c)" opacity=".2" />
      <text x="137" y="170" font-size="7" fill="var(--fig-text)">序号最小者持锁</text>
      <line x1="225" y1="167" x2="236" y2="167" stroke="var(--fig-node-c)" stroke-width="1.2" />
      <polygon points="234,163.8 234,170.2 240,167" fill="var(--fig-node-c)" />
      <rect x="242" y="158" width="88" height="18" rx="3" fill="var(--fig-node-c)" opacity=".2" />
      <text x="246" y="170" font-size="7" fill="var(--fig-text)">断开=节点自动删</text>
      <text x="14" y="188" font-size="7" fill="var(--fig-node-c)">保证点：锁的生命周期挂会话 —— 会话断了锁必然释放</text>
      <text x="14" y="200" font-size="7" fill="var(--fig-text)">代价：性能不如 Redis，要独立维护 ZK 集群</text>
      <text x="14" y="210" font-size="7" fill="var(--fig-muted)">收益：watch 排队代替自旋，等待更公平</text>

      <!-- ③ DB -->
      <rect x="6" y="220" width="328" height="76" rx="5" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="233" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">③ 数据库 · 不用新组件</text>
      <rect x="14" y="240" width="130" height="18" rx="3" fill="var(--fig-node-d)" opacity=".2" />
      <text x="18" y="252" font-size="7" fill="var(--fig-text)">唯一索引 INSERT 成功=持锁</text>
      <line x1="146" y1="249" x2="157" y2="249" stroke="var(--fig-node-d)" stroke-width="1.2" />
      <polygon points="155,245.8 155,252.2 161,249" fill="var(--fig-node-d)" />
      <rect x="163" y="240" width="126" height="18" rx="3" fill="var(--fig-node-d)" opacity=".2" />
      <text x="167" y="252" font-size="7" fill="var(--fig-text)">或 SELECT FOR UPDATE</text>
      <text x="14" y="270" font-size="7" fill="var(--fig-node-d)">保证点：锁随事务回滚 —— 提交、断开都自动释放</text>
      <text x="14" y="282" font-size="7" fill="var(--fig-text)">代价：性能差；FOR UPDATE 会一直占连接</text>
      <text x="14" y="292" font-size="7" fill="#e5484d">坑：等锁的连接不释放 → 连接池被打满，比锁更致命</text>

      <!-- 三个难题 -->
      <rect x="6" y="304" width="106" height="44" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="12" y="317" font-size="7.5" font-weight="700" fill="var(--fig-node-a)">难题① 锁过期</text>
      <text x="12" y="329" font-size="7" fill="var(--fig-text)">业务比 TTL 慢</text>
      <text x="12" y="341" font-size="7" fill="var(--fig-text)">→ 看门狗续期</text>

      <rect x="117" y="304" width="106" height="44" rx="4" fill="#e5484d" opacity=".12" />
      <text x="123" y="317" font-size="7.5" font-weight="700" fill="#e5484d">难题② 主从切换</text>
      <text x="123" y="329" font-size="7" fill="var(--fig-text)">锁尚未同步即宕</text>
      <text x="123" y="341" font-size="7" fill="var(--fig-text)">→ 两人同时持锁</text>

      <rect x="228" y="304" width="106" height="44" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="234" y="317" font-size="7.5" font-weight="700" fill="var(--fig-node-c)">难题③ 等待公平</text>
      <text x="234" y="329" font-size="7" fill="var(--fig-text)">Redis 只能自旋</text>
      <text x="234" y="341" font-size="7" fill="var(--fig-text)">→ ZK 顺序排队</text>

      <!-- 结论 -->
      <text x="6" y="358" font-size="7.5" fill="var(--fig-muted)">结论：锁只降低冲突概率，仍需唯一索引/幂等兜底</text>
    </svg>
    <figcaption>Redis 靠过期+看门狗、ZK 靠临时节点、DB 靠事务；过期、主从切换、等待三个难题都需业务侧幂等兜底</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
