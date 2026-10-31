<script setup>
/**
 * 最终一致性的四种方案（题 12086）。
 *
 * 核心洞察：跨服务没有本地事务，「保证点」只能落在某一处 ——
 * 四种方案的本质差别就是「把『业务成功 ⇔ 消息必发』这个保证交给谁」：
 * 本地消息表交给同一本地事务、事务消息交给 MQ 回查、
 * TCC 交给预留资源、Saga 交给补偿 + 对账。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 344" role="img" aria-label="最终一致性四方案：本地消息表、事务消息、TCC、Saga，各自画出关键步骤并在箭头旁标注一致性保证点">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">不做强一致：用「可靠消息 + 补偿」达到最终一致</text>

      <!-- ① 本地消息表 -->
      <rect x="6" y="22" width="328" height="76" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="35" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 本地消息表 · 复杂度低 · 最常用</text>
      <rect x="14" y="41" width="50" height="16" rx="3" fill="var(--fig-node-a)" opacity=".35" />
      <text x="17" y="52" font-size="7" fill="var(--fig-text)">业务表</text>
      <text x="66" y="52" font-size="7.5" fill="var(--fig-text)">+</text>
      <rect x="74" y="41" width="50" height="16" rx="3" fill="var(--fig-node-a)" opacity=".35" />
      <text x="77" y="52" font-size="7" fill="var(--fig-text)">消息表</text>
      <line x1="126" y1="49" x2="138" y2="49" stroke="var(--fig-node-a)" stroke-width="1.2" />
      <polygon points="136,45.5 136,52.5 142,49" fill="var(--fig-node-a)" />
      <text x="144" y="52" font-size="7" fill="var(--fig-node-a)">同一本地事务提交</text>
      <rect x="212" y="41" width="44" height="16" rx="3" fill="var(--fig-node-a)" opacity=".35" />
      <text x="215" y="52" font-size="7" fill="var(--fig-text)">异步投递</text>
      <line x1="258" y1="49" x2="270" y2="49" stroke="var(--fig-node-a)" stroke-width="1.2" />
      <polygon points="268,45.5 268,52.5 274,49" fill="var(--fig-node-a)" />
      <text x="276" y="52" font-size="7" fill="var(--fig-text)">MQ</text>
      <text x="14" y="68" font-size="7" fill="var(--fig-node-a)">保证点：业务与消息同库同事务，要么都成</text>
      <text x="14" y="80" font-size="7" fill="var(--fig-text)">不会出现「业务成功但消息没发」；失败则扫表重试</text>
      <text x="14" y="92" font-size="7" fill="var(--fig-muted)">消费方重试会重复 → 必须先做幂等</text>

      <!-- ② 事务消息：半消息 → 本地事务 → 回查 -->
      <rect x="6" y="104" width="328" height="76" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="117" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② 事务消息（RocketMQ）· 把保证交给 MQ</text>
      <rect x="14" y="123" width="72" height="16" rx="3" fill="var(--fig-node-b)" opacity=".35" />
      <text x="17" y="134" font-size="7" fill="var(--fig-text)">① 发半消息</text>
      <line x1="88" y1="131" x2="100" y2="131" stroke="var(--fig-node-b)" stroke-width="1.2" />
      <polygon points="98,127.5 98,134.5 104,131" fill="var(--fig-node-b)" />
      <rect x="106" y="123" width="72" height="16" rx="3" fill="var(--fig-node-b)" opacity=".35" />
      <text x="109" y="134" font-size="7" fill="var(--fig-text)">② 执行本地事务</text>
      <line x1="180" y1="131" x2="192" y2="131" stroke="var(--fig-node-b)" stroke-width="1.2" />
      <polygon points="190,127.5 190,134.5 196,131" fill="var(--fig-node-b)" />
      <rect x="198" y="123" width="60" height="16" rx="3" fill="var(--fig-node-b)" opacity=".35" />
      <text x="201" y="134" font-size="7" fill="var(--fig-text)">③ 提交消息</text>
      <text x="14" y="150" font-size="7" fill="var(--fig-node-b)">保证点：Broker 没收到确认就回查本地事务</text>
      <text x="14" y="162" font-size="7" fill="var(--fig-text)">等于把「本地消息表」的机制内置进 MQ，省自建表</text>
      <text x="14" y="172" font-size="7" fill="var(--fig-muted)">依赖 MQ 支持；只有半消息成功才做本地事务</text>

      <!-- ③ TCC -->
      <rect x="6" y="182" width="328" height="76" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="195" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">③ TCC · 资金/库存类 · 侵入极强</text>
      <rect x="14" y="201" width="86" height="16" rx="3" fill="var(--fig-node-c)" opacity=".35" />
      <text x="17" y="212" font-size="7" fill="var(--fig-text)">Try 冻结余额（预留）</text>
      <line x1="102" y1="209" x2="114" y2="209" stroke="var(--fig-node-c)" stroke-width="1.2" />
      <polygon points="112,205.5 112,212.5 118,209" fill="var(--fig-node-c)" />
      <rect x="120" y="201" width="86" height="16" rx="3" fill="var(--fig-node-c)" opacity=".35" />
      <text x="123" y="212" font-size="7" fill="var(--fig-text)">Confirm 确认扣减</text>
      <line x1="208" y1="209" x2="220" y2="209" stroke="var(--fig-node-c)" stroke-width="1.2" />
      <polygon points="218,205.5 218,212.5 224,209" fill="var(--fig-node-c)" />
      <rect x="226" y="201" width="46" height="16" rx="3" fill="var(--fig-node-c)" opacity=".35" />
      <text x="229" y="212" font-size="7" fill="var(--fig-text)">Cancel</text>
      <text x="14" y="228" font-size="7" fill="var(--fig-node-c)">保证点：Confirm/Cancel 都幂等，可安全重试</text>
      <text x="14" y="240" font-size="7" fill="var(--fig-text)">不依赖数据库事务，跨服务也能保证</text>
      <text x="14" y="251" font-size="7" fill="var(--fig-muted)">代价：每个操作写三个方法，预留逻辑很重</text>

      <!-- ④ Saga -->
      <rect x="6" y="260" width="328" height="52" rx="5" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="273" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">④ Saga · 长流程 · 先做失败再倒序补偿</text>
      <rect x="14" y="279" width="46" height="16" rx="3" fill="var(--fig-node-d)" opacity=".35" />
      <text x="17" y="290" font-size="7" fill="var(--fig-text)">步骤 1</text>
      <line x1="62" y1="287" x2="74" y2="287" stroke="var(--fig-node-d)" stroke-width="1.2" />
      <polygon points="72,283.5 72,290.5 78,287" fill="var(--fig-node-d)" />
      <rect x="80" y="279" width="46" height="16" rx="3" fill="var(--fig-node-d)" opacity=".35" />
      <text x="83" y="290" font-size="7" fill="var(--fig-text)">步骤 2</text>
      <line x1="128" y1="287" x2="140" y2="287" stroke="var(--fig-node-d)" stroke-width="1.2" />
      <polygon points="138,283.5 138,290.5 144,287" fill="var(--fig-node-d)" />
      <rect x="146" y="279" width="60" height="16" rx="3" fill="#e5484d" opacity=".18" />
      <text x="149" y="290" font-size="7" fill="#e5484d">步骤 3 失败</text>
      <line x1="208" y1="287" x2="222" y2="287" stroke="#e5484d" stroke-width="1.2" stroke-dasharray="3 2" />
      <polygon points="220,283.5 220,290.5 226,287" fill="#e5484d" />
      <text x="228" y="290" font-size="7" fill="#e5484d">倒序补偿 2、1</text>
      <text x="14" y="304" font-size="7" fill="var(--fig-node-d)">保证点：每步都有补偿操作，失败按相反顺序回滚</text>

      <!-- 通用前提 -->
      <rect x="6" y="318" width="328" height="20" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="331" font-size="7" fill="#e5484d">四方案都靠幂等 + 补偿 + 对账；不一致窗口必然存在</text>
    </svg>
    <figcaption>四种方案的差别只有「保证点落在哪」：本地消息表靠同库同事务、事务消息靠 MQ 回查、TCC 靠预留、Saga 靠补偿；幂等与对账是共同前提</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
