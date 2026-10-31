<script setup>
/**
 * 异地多活的四种模式（题 12090）。
 *
 * 核心洞察：难点不在「部署两套」，而在「数据谁能写」——
 * 把「能写的地方」从「两边」收成「一处」，写冲突就从根上消失。
 * 所以单元化（按用户分片、片内单写）是最务实的方案，
 * 而「双写」无论加多少冲突检测，都是在给一个本可以不存在的问题打补丁。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 366" role="img" aria-label="异地多活四模式对比：主备、一写多读、双写双活、单元化；每个模式画出两个机房的可写与只读关系，单元化额外画出按用户分片后片内单写">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">难点不是「部署两套」，而是「数据两侧都能写」</text>

      <!-- 图例 -->
      <rect x="6" y="18" width="10" height="10" rx="2" fill="var(--fig-node-a)" opacity=".6" />
      <text x="20" y="27" font-size="7" fill="var(--fig-text)">可写</text>
      <rect x="52" y="18" width="10" height="10" rx="2" fill="none" stroke="var(--fig-node-a)" stroke-width="1.2" stroke-dasharray="3 2" />
      <text x="66" y="27" font-size="7" fill="var(--fig-text)">只读 / 待命</text>
      <text x="134" y="27" font-size="7" fill="#e5484d">↔ 写冲突</text>

      <!-- ① 主备 -->
      <rect x="6" y="34" width="328" height="52" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="47" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 主备（热备）· 一致性最强</text>
      <text x="14" y="59" font-size="7" fill="var(--fig-node-a)">同步复制，A 挂了才切 B</text>
      <rect x="150" y="38" width="72" height="18" rx="3" fill="var(--fig-node-a)" opacity=".55" />
      <text x="155" y="50" font-size="7" fill="var(--fig-text)">机房 A 写</text>
      <line x1="224" y1="47" x2="252" y2="47" stroke="var(--fig-node-a)" stroke-width="1.2" />
      <polygon points="250,43.8 250,50.2 256,47" fill="var(--fig-node-a)" />
      <text x="240" y="43" font-size="7" fill="var(--fig-muted)">同步</text>
      <rect x="258" y="38" width="72" height="18" rx="3" fill="none" stroke="var(--fig-node-a)" stroke-width="1.2" stroke-dasharray="3 2" />
      <text x="263" y="50" font-size="7" fill="var(--fig-text)">机房 B 待命</text>
      <text x="14" y="72" font-size="7" fill="var(--fig-text)">平时只有一处写：无冲突，但备机房不出力</text>
      <text x="14" y="83" font-size="7" fill="var(--fig-muted)">成本最低：只防机房级故障，切换有 RTO</text>

      <!-- ② 一写多读 -->
      <rect x="6" y="90" width="328" height="52" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="103" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② 双活 · 一写多读</text>
      <text x="14" y="115" font-size="7" fill="var(--fig-node-b)">多数所谓的「双活」实际就是这个形态</text>
      <rect x="150" y="94" width="72" height="18" rx="3" fill="var(--fig-node-b)" opacity=".55" />
      <text x="155" y="106" font-size="7" fill="var(--fig-text)">机房 A 写 + 读</text>
      <line x1="224" y1="103" x2="252" y2="103" stroke="var(--fig-node-b)" stroke-width="1.2" stroke-dasharray="4 2" />
      <polygon points="250,99.8 250,106.2 256,103" fill="var(--fig-node-b)" />
      <text x="232" y="99" font-size="7" fill="var(--fig-muted)">异步</text>
      <rect x="258" y="94" width="72" height="18" rx="3" fill="none" stroke="var(--fig-node-b)" stroke-width="1.2" stroke-dasharray="3 2" />
      <text x="263" y="106" font-size="7" fill="var(--fig-text)">机房 B 只读</text>
      <text x="14" y="128" font-size="7" fill="var(--fig-text)">B 承载读流量，写仍只在一处 → 仍无冲突</text>
      <text x="14" y="139" font-size="7" fill="var(--fig-muted)">代价：B 读到的可能是秒级延迟的数据</text>

      <!-- ③ 双写 -->
      <rect x="6" y="146" width="328" height="52" rx="5" fill="#e5484d" opacity=".12" />
      <text x="14" y="159" font-size="8.5" font-weight="700" fill="#e5484d">③ 双写双活 · 一致性最难</text>
      <text x="14" y="171" font-size="7" fill="#e5484d">两侧都可写 = 冲突从这里开始</text>
      <rect x="150" y="150" width="72" height="18" rx="3" fill="#e5484d" opacity=".45" />
      <text x="155" y="162" font-size="7" fill="var(--fig-text)">机房 A 可写</text>
      <line x1="254" y1="159" x2="276" y2="159" stroke="#e5484d" stroke-width="1.2" />
      <polygon points="256,155.8 256,162.2 252,159" fill="#e5484d" />
      <polygon points="274,155.8 274,162.2 278,159" fill="#e5484d" />
      <rect x="258" y="150" width="72" height="18" rx="3" fill="#e5484d" opacity=".45" />
      <text x="263" y="162" font-size="7" fill="var(--fig-text)">机房 B 可写</text>
      <text x="14" y="184" font-size="7" fill="var(--fig-text)">同一记录被两边改：谁赢？丢的是哪一条？</text>
      <text x="14" y="195" font-size="7" fill="var(--fig-muted)">只能补救：LWW / 版本号冲突检测 / CRDT</text>

      <!-- ④ 单元化 -->
      <rect x="6" y="202" width="328" height="104" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="215" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">④ 单元化（Set 化）· 最务实</text>
      <text x="236" y="215" font-size="7" fill="var(--fig-node-c)">按 UID 分片</text>

      <text x="14" y="233" font-size="7" fill="var(--fig-text)">单元 1</text>
      <rect x="54" y="222" width="70" height="16" rx="3" fill="var(--fig-node-c)" opacity=".55" />
      <text x="58" y="233" font-size="7" fill="var(--fig-text)">A 片内单写</text>
      <line x1="126" y1="230" x2="146" y2="230" stroke="var(--fig-node-c)" stroke-width="1.2" stroke-dasharray="4 2" />
      <polygon points="144,226.8 144,233.2 150,230" fill="var(--fig-node-c)" />
      <rect x="152" y="222" width="70" height="16" rx="3" fill="none" stroke="var(--fig-node-c)" stroke-width="1.2" stroke-dasharray="3 2" />
      <text x="156" y="233" font-size="7" fill="var(--fig-text)">B 只读半个</text>
      <text x="228" y="233" font-size="7" fill="var(--fig-muted)">UID%2=0</text>

      <text x="14" y="257" font-size="7" fill="var(--fig-text)">单元 2</text>
      <rect x="54" y="246" width="70" height="16" rx="3" fill="none" stroke="var(--fig-node-c)" stroke-width="1.2" stroke-dasharray="3 2" />
      <text x="58" y="257" font-size="7" fill="var(--fig-text)">A 只读半个</text>
      <line x1="146" y1="254" x2="126" y2="254" stroke="var(--fig-node-c)" stroke-width="1.2" stroke-dasharray="4 2" />
      <polygon points="128,250.8 128,257.2 122,254" fill="var(--fig-node-c)" />
      <rect x="152" y="246" width="70" height="16" rx="3" fill="var(--fig-node-c)" opacity=".55" />
      <text x="156" y="257" font-size="7" fill="var(--fig-text)">B 片内单写</text>
      <text x="228" y="257" font-size="7" fill="var(--fig-muted)">UID%2=1</text>

      <rect x="14" y="266" width="312" height="32" rx="4" fill="var(--fig-node-c)" opacity=".08" />
      <text x="20" y="277" font-size="7" font-weight="700" fill="var(--fig-node-c)">关键：每条数据只有一个单元能写 → 片内单写</text>
      <text x="20" y="289" font-size="7" fill="var(--fig-text)">天生无冲突；代价是跨单元调用与全局数据</text>

      <!-- 务实建议 -->
      <rect x="6" y="312" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="324" font-size="7.5" font-weight="700" fill="var(--fig-node-d)">别为了「多活」而多活：大多数业务同城双机房就够</text>
      <text x="14" y="336" font-size="7" fill="var(--fig-text)">防单机→集群副本；防机房→同城双机房；防城市→异地</text>

      <text x="6" y="360" font-size="7.5" fill="var(--fig-muted)">最难的其实不是技术：业务能否接受两地数据不同是决策</text>
    </svg>
    <figcaption>四种模式比的是「能写的地方有几处」：单写无冲突、双写必冲突、单元化把每片收成单写——所以它最务实</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
