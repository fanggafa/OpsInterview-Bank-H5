<script setup>
/**
 * 数据库主从切换（题 12153）。
 *
 * 核心洞察：切换不是「把从库提成主」这一个动作，而是七步固定顺序；
 * 其中「先让旧主只读、再停写」是防止切换瞬间两边都写的唯一保险，
 * 而恢复后的旧主必须先降级为从 —— 否则就是双主写入。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 310" role="img" aria-label="主从切换七步流程：确认延迟为0、旧主只读、停写、提升从库、切应用连接、验证写入、恢复读流量，末尾警示旧主必须先降级">
      <defs>
        <marker id="arrDbf" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-a)" />
        </marker>
      </defs>

      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">顺序错了就会丢数据或双写：七步一条链，不能跳</text>

      <!-- ① -->
      <circle cx="16" cy="34" r="8" fill="var(--fig-node-a)" opacity=".14" />
      <text x="16" y="37" text-anchor="middle" font-size="8" font-weight="700" fill="var(--fig-node-a)">1</text>
      <rect x="30" y="20" width="304" height="28" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="38" y="32" font-size="8" font-weight="700" fill="var(--fig-node-a)">确认延迟为 0</text>
      <text x="38" y="43" font-size="7.5" fill="var(--fig-text)">从库 Seconds_Behind_Master=0，先确认数据已完整</text>
      <line x1="16" y1="42" x2="16" y2="52" stroke="var(--fig-node-a)" stroke-width="1.2" />

      <!-- ② -->
      <circle cx="16" cy="67" r="8" fill="#e5484d" opacity=".14" />
      <text x="16" y="70" text-anchor="middle" font-size="8" font-weight="700" fill="#e5484d">2</text>
      <rect x="30" y="53" width="304" height="28" rx="4" fill="#e5484d" opacity=".1" />
      <text x="38" y="65" font-size="8" font-weight="700" fill="#e5484d">旧主设为只读</text>
      <text x="38" y="76" font-size="7.5" fill="var(--fig-text)">read_only=1，堵住切换窗口里最后的新写入</text>
      <line x1="16" y1="75" x2="16" y2="85" stroke="var(--fig-node-a)" stroke-width="1.2" />

      <!-- ③ -->
      <circle cx="16" cy="100" r="8" fill="var(--fig-node-a)" opacity=".14" />
      <text x="16" y="103" text-anchor="middle" font-size="8" font-weight="700" fill="var(--fig-node-a)">3</text>
      <rect x="30" y="86" width="304" height="28" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="38" y="98" font-size="8" font-weight="700" fill="var(--fig-node-a)">应用停写</text>
      <text x="38" y="109" font-size="7.5" fill="var(--fig-text)">摘掉写入流量并等同步追平，此时允许短暂不可写</text>
      <line x1="16" y1="108" x2="16" y2="118" stroke="var(--fig-node-a)" stroke-width="1.2" />

      <!-- ④ -->
      <circle cx="16" cy="133" r="8" fill="var(--fig-node-b)" opacity=".16" />
      <text x="16" y="136" text-anchor="middle" font-size="8" font-weight="700" fill="var(--fig-node-b)">4</text>
      <rect x="30" y="119" width="304" height="28" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="38" y="131" font-size="8" font-weight="700" fill="var(--fig-node-b)">提升从库为主</text>
      <text x="38" y="142" font-size="7.5" fill="var(--fig-text)">reset slave、read_only=0，新主在此刻产生</text>
      <line x1="16" y1="141" x2="16" y2="151" stroke="var(--fig-node-a)" stroke-width="1.2" />

      <!-- ⑤ -->
      <circle cx="16" cy="166" r="8" fill="var(--fig-node-a)" opacity=".14" />
      <text x="16" y="169" text-anchor="middle" font-size="8" font-weight="700" fill="var(--fig-node-a)">5</text>
      <rect x="30" y="152" width="304" height="28" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="38" y="164" font-size="8" font-weight="700" fill="var(--fig-node-a)">切应用连接</text>
      <text x="38" y="175" font-size="7.5" fill="var(--fig-text)">DNS/VIP/配置中心指向新主，旧连接必须断开重连</text>
      <line x1="16" y1="174" x2="16" y2="184" stroke="var(--fig-node-a)" stroke-width="1.2" />

      <!-- ⑥ -->
      <circle cx="16" cy="199" r="8" fill="var(--fig-node-a)" opacity=".14" />
      <text x="16" y="202" text-anchor="middle" font-size="8" font-weight="700" fill="var(--fig-node-a)">6</text>
      <rect x="30" y="185" width="304" height="28" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="38" y="197" font-size="8" font-weight="700" fill="var(--fig-node-a)">验证写入</text>
      <text x="38" y="208" font-size="7.5" fill="var(--fig-text)">写探针数据确认可写，比对最后一条业务数据在不在</text>
      <line x1="16" y1="207" x2="16" y2="217" stroke="var(--fig-node-a)" stroke-width="1.2" />

      <!-- ⑦ -->
      <circle cx="16" cy="232" r="8" fill="var(--fig-node-c)" opacity=".16" />
      <text x="16" y="235" text-anchor="middle" font-size="8" font-weight="700" fill="var(--fig-node-c)">7</text>
      <rect x="30" y="218" width="304" height="28" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="38" y="230" font-size="8" font-weight="700" fill="var(--fig-node-c)">恢复读流量</text>
      <text x="38" y="241" font-size="7.5" fill="var(--fig-text)">读写分离下读也要改指向，最后切回，避免读到旧库</text>

      <!-- 危险 -->
      <rect x="6" y="252" width="328" height="42" rx="5" fill="#e5484d" opacity=".12" />
      <text x="14" y="265" font-size="8.5" font-weight="700" fill="#e5484d">旧主恢复后：必须先降级为从，再启动</text>
      <text x="14" y="278" font-size="7.5" fill="var(--fig-text)">先设 read_only，再 change master 指向新主</text>
      <text x="14" y="289" font-size="7" fill="#e5484d">否则它自认仍是主 → 双主写入 → 数据永久分叉</text>

      <text x="6" y="302" font-size="7" fill="var(--fig-muted)">配套：半同步复制减少丢数据，写入需可重试且幂等</text>
    </svg>
    <figcaption>切换七步固定顺序，先旧主只读再停写才不双写；恢复的旧主必须降级为从，否则脑裂导致数据分叉</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
