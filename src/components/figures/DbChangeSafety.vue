<script setup>
/**
 * 数据库变更安全性（题 12162）。
 *
 * 核心洞察：危险的不是「改表」本身，而是「一步改到不可逆」。
 * 把一次变更拆成三次发布（加列 → 双写 → 删列），让新旧代码与新旧表结构
 * 任意组合都能跑 —— 于是每一步都能整体回退到上一个发布。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 330" role="img" aria-label="三次发布保证可回滚：第一次加可空列，第二次双写并切读，第三次删旧列；下方矩阵说明新旧代码与新旧表结构任意组合都能运行">
      <defs>
        <marker id="arrDcs" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-a)" />
        </marker>
      </defs>

      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">一次变更拆成三次发布：中间态才是可回滚的关键</text>

      <!-- 发布 1 -->
      <rect x="6" y="20" width="328" height="48" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="39" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">发布 1：加新列（可空，只增不减）</text>
      <text x="14" y="51" font-size="7.5" fill="var(--fig-text)">新列可空，老代码根本不写它 → 老逻辑完全不受影响</text>
      <text x="14" y="62" font-size="7.5" fill="var(--fig-text)">只动结构不动数据，出问题回退＝代码回到上一版</text>
      <rect x="252" y="26" width="76" height="16" rx="8" fill="var(--fig-node-a)" opacity=".16" />
      <text x="290" y="37" text-anchor="middle" font-size="7" fill="var(--fig-node-a)">↩ 可回滚</text>

      <path d="M30 68 L30 76" stroke="var(--fig-node-a)" stroke-width="1.5" marker-end="url(#arrDcs)" />

      <!-- 发布 2 -->
      <rect x="6" y="78" width="328" height="48" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="97" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">发布 2：双写 + 读切到新列</text>
      <text x="14" y="109" font-size="7.5" fill="var(--fig-text)">新旧列同时写、读走新列；发现不一致时旧列仍是现成备份</text>
      <text x="14" y="120" font-size="7.5" fill="var(--fig-text)">回退＝只把读切回旧列，新列数据还在，一行都不丢</text>
      <rect x="252" y="84" width="76" height="16" rx="8" fill="var(--fig-node-b)" opacity=".16" />
      <text x="290" y="95" text-anchor="middle" font-size="7" fill="var(--fig-node-b)">↩ 可回滚</text>

      <path d="M30 126 L30 134" stroke="var(--fig-node-a)" stroke-width="1.5" marker-end="url(#arrDcs)" />

      <!-- 发布 3 -->
      <rect x="6" y="136" width="328" height="48" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="155" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">发布 3：删旧列（最后才做）</text>
      <text x="14" y="167" font-size="7.5" fill="var(--fig-text)">确认一个发布周期内再无代码读写旧列，才允许 DROP</text>
      <text x="14" y="178" font-size="7.5" fill="var(--fig-text)">全流程唯一不可逆的一步 → 必须最后做，且先备份该表</text>
      <rect x="252" y="142" width="76" height="16" rx="8" fill="#e5484d" opacity=".14" />
      <text x="290" y="153" text-anchor="middle" font-size="7" fill="#e5484d">✗ 不可逆</text>

      <!-- 兼容矩阵 -->
      <text x="6" y="202" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">为什么可回：新旧代码 × 新表结构，四种组合都兼容</text>

      <text x="64" y="222" font-size="7.5" fill="var(--fig-muted)">表结构：旧</text>
      <text x="194" y="222" font-size="7.5" fill="var(--fig-muted)">表结构：新（已加列）</text>

      <rect x="64" y="228" width="126" height="22" rx="3" fill="var(--fig-node-a)" opacity=".1" />
      <text x="72" y="243" font-size="7.5" fill="var(--fig-node-a)">✓ 老代码照常跑</text>
      <rect x="194" y="228" width="140" height="22" rx="3" fill="var(--fig-node-a)" opacity=".1" />
      <text x="202" y="243" font-size="7.5" fill="var(--fig-node-a)">✓ 多一列不影响</text>
      <text x="12" y="243" font-size="7.5" fill="var(--fig-muted)">旧代码</text>

      <rect x="64" y="254" width="126" height="22" rx="3" fill="var(--fig-node-b)" opacity=".1" />
      <text x="72" y="269" font-size="7.5" fill="var(--fig-node-b)">✓ 新列可空不报错</text>
      <rect x="194" y="254" width="140" height="22" rx="3" fill="var(--fig-node-b)" opacity=".1" />
      <text x="202" y="269" font-size="7.5" fill="var(--fig-node-b)">✓ 双写读写都通</text>
      <text x="12" y="269" font-size="7.5" fill="var(--fig-muted)">新代码</text>

      <!-- 危险 -->
      <rect x="6" y="284" width="328" height="38" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="297" font-size="8.5" font-weight="700" fill="#e5484d">三种最常见事故</text>
      <text x="14" y="309" font-size="7.5" fill="var(--fig-text)">① UPDATE 漏写 WHERE → 改全表　② 大表 DDL 锁表</text>
      <text x="14" y="320" font-size="7" fill="var(--fig-text)">③ 代码还在用就删列；执行前确认连接串防连错环境</text>
    </svg>
    <figcaption>加列→双写→删列分三次发布，前两步随时可整体回退；只有最后删列不可逆，所以它必须排在最后并先备份</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
