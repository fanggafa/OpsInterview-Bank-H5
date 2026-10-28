<script setup>
/**
 * 配置管理「执行链路与幂等性」图。
 * 展示一次 Ansible 执行从「读清单 → 生成任务 → SSH 执行 → 汇总结果」的流程，
 * 并标出「哪里会破坏幂等性」——这是自动化落地最核心的概念。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 262" role="img" aria-label="Ansible 执行链路与幂等性的判断点，以及破坏幂等的常见写法">
      <defs>
        <marker id="arrAuto" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-a)" />
        </marker>
      </defs>

      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">Ansible 执行一次 playbook 的四步链路</text>

      <!-- 链路 -->
      <rect x="6" y="20" width="72" height="40" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <rect x="6" y="20" width="72" height="40" rx="5" fill="none" stroke="var(--fig-node-a)" stroke-width="1.2" />
      <text x="42" y="36" text-anchor="middle" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">inventory</text>
      <text x="42" y="50" text-anchor="middle" font-size="7" fill="var(--fig-muted)">对哪些机器</text>

      <path d="M80 40 L92 40" stroke="var(--fig-node-a)" stroke-width="1.5" marker-end="url(#arrAuto)" />

      <rect x="96" y="20" width="72" height="40" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <rect x="96" y="20" width="72" height="40" rx="5" fill="none" stroke="var(--fig-node-b)" stroke-width="1.2" />
      <text x="132" y="36" text-anchor="middle" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">play/task</text>
      <text x="132" y="50" text-anchor="middle" font-size="7" fill="var(--fig-muted)">做什么</text>

      <path d="M170 40 L182 40" stroke="var(--fig-node-a)" stroke-width="1.5" marker-end="url(#arrAuto)" />

      <rect x="186" y="20" width="72" height="40" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <rect x="186" y="20" width="72" height="40" rx="5" fill="none" stroke="var(--fig-node-c)" stroke-width="1.2" />
      <text x="222" y="36" text-anchor="middle" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">module</text>
      <text x="222" y="50" text-anchor="middle" font-size="7" fill="var(--fig-muted)">SSH 执行</text>

      <path d="M260 40 L272 40" stroke="var(--fig-node-a)" stroke-width="1.5" marker-end="url(#arrAuto)" />

      <rect x="276" y="20" width="58" height="40" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <rect x="276" y="20" width="58" height="40" rx="5" fill="none" stroke="var(--fig-node-d)" stroke-width="1.2" />
      <text x="305" y="36" text-anchor="middle" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">结果</text>
      <text x="305" y="50" text-anchor="middle" font-size="7" fill="var(--fig-muted)">ok/changed</text>

      <!-- 幂等判断 -->
      <rect x="6" y="70" width="328" height="58" rx="6" fill="var(--fig-node-c)" opacity=".08" />
      <rect x="6" y="70" width="328" height="58" rx="6" fill="none" stroke="var(--fig-node-c)" stroke-width="1.2" />
      <text x="16" y="86" font-size="9" font-weight="700" fill="var(--fig-node-c)">幂等性的验收标准：连跑两次，第二次必须 changed=0</text>
      <text x="16" y="100" font-size="8" fill="var(--fig-text)">专用模块（yum/file/copy）自带幂等：已装就跳过、</text>
      <text x="16" y="112" font-size="8" fill="var(--fig-text)">内容相同就跳过、目录已存在就跳过</text>
      <text x="16" y="124" font-size="7.5" fill="var(--fig-muted)">「第二次还是 changed」说明写的不是幂等任务，重跑就会重复追加/重复创建</text>

      <!-- 破坏幂等的写法 -->
      <text x="6" y="146" font-size="9.5" font-weight="700" fill="#e5484d">四种会破坏幂等的写法</text>
      <text x="6" y="161" font-size="8" fill="var(--fig-text)">① shell: echo "x" &gt;&gt; file —— 每次追加一行</text>
      <text x="6" y="174" font-size="8" fill="var(--fig-text)">② shell: mkdir /data —— 第二次报「已存在」直接失败</text>
      <text x="6" y="187" font-size="8" fill="var(--fig-text)">③ shell 却没用 creates/changed_when 限定条件</text>
      <text x="6" y="200" font-size="8" fill="var(--fig-text)">④ 生成随机密码/自增 ID —— 每次结果都不同</text>

      <!-- 修法 -->
      <rect x="6" y="212" width="328" height="44" rx="6" fill="var(--fig-node-a)" opacity=".09" />
      <text x="16" y="226" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">修法：能用专用模块就别用 shell</text>
      <text x="16" y="239" font-size="8" fill="var(--fig-text)">lineinfile（替代 echo &gt;&gt;）、file state=directory（替代 mkdir）、</text>
      <text x="16" y="251" font-size="8" fill="var(--fig-text)">args: creates=…（限次执行）</text>
    </svg>
    <figcaption>自动化能重跑才有意义；「重跑不炸」比「第一次跑通」重要得多</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
