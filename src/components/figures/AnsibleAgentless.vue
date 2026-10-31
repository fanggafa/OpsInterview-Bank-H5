<script setup>
/**
 * Ansible 的 agentless 批量执行原理（题 8656）。
 *
 * 核心洞察：被控端只要 sshd 和一个 Python，临时脚本「推过去、跑完、扔掉」——
 * 不常驻任何进程，所以不用在被控机上部署、升级、占用端口；
 * 而幂等让它可以随时重跑收敛状态，这才是它相对 Shell 脚本的根本优势。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 290" role="img" aria-label="Ansible agentless 原理：控制机读 inventory，把临时脚本经 SSH 推到被控机执行后即删除，被控机只需 sshd 与 python；下方对比需要常驻 agent 的方案">
      <defs>
        <marker id="arrAns" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-a)" />
        </marker>
      </defs>

      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">被控端只要 sshd + python，脚本用完即删</text>

      <!-- 控制机 -->
      <rect x="6" y="20" width="118" height="68" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">控制机 Ansible</text>
      <text x="14" y="47" font-size="7.5" fill="var(--fig-text)">读 inventory 清单</text>
      <text x="14" y="60" font-size="7.5" fill="var(--fig-text)">按模块生成临时脚本</text>
      <text x="14" y="73" font-size="7.5" fill="var(--fig-text)">SSH 推送，收集结果</text>
      <text x="14" y="84" font-size="7" fill="var(--fig-muted)">本地只跑这一个进程</text>

      <!-- 三条 SSH 通道 -->
      <path d="M126 33 L158 33" fill="none" stroke="var(--fig-node-a)" stroke-width="1.4" stroke-dasharray="3 2" marker-end="url(#arrAns)" />
      <path d="M126 57 L158 57" fill="none" stroke="var(--fig-node-a)" stroke-width="1.4" stroke-dasharray="3 2" marker-end="url(#arrAns)" />
      <path d="M126 81 L158 81" fill="none" stroke="var(--fig-node-a)" stroke-width="1.4" stroke-dasharray="3 2" marker-end="url(#arrAns)" />
      <text x="132" y="28" font-size="7" fill="var(--fig-muted)">SSH 推送</text>

      <!-- 被控机 -->
      <rect x="162" y="20" width="172" height="26" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="170" y="31" font-size="7.5" font-weight="700" fill="var(--fig-node-b)">web-1</text>
      <text x="170" y="42" font-size="7" fill="var(--fig-text)">只需 sshd + python，脚本跑完即删</text>

      <rect x="162" y="52" width="172" height="26" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="170" y="63" font-size="7.5" font-weight="700" fill="var(--fig-node-b)">web-2</text>
      <text x="170" y="74" font-size="7" fill="var(--fig-text)">不装 agent、不留常驻进程</text>

      <rect x="162" y="84" width="172" height="26" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="170" y="95" font-size="7.5" font-weight="700" fill="var(--fig-node-b)">db-1</text>
      <text x="170" y="106" font-size="7" fill="var(--fig-text)">免密靠 SSH key / become 提权</text>

      <!-- 对比需要 agent -->
      <rect x="6" y="120" width="328" height="60" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="133" font-size="8" font-weight="700" fill="var(--fig-node-c)">对比：谁需要常驻 agent</text>
      <rect x="14" y="139" width="150" height="17" rx="3" fill="var(--fig-node-c)" opacity=".16" />
      <text x="20" y="151" font-size="7" fill="var(--fig-node-c)">Ansible：无 agent</text>
      <rect x="172" y="139" width="154" height="17" rx="3" fill="var(--fig-node-d)" opacity=".16" />
      <text x="178" y="151" font-size="7" fill="var(--fig-node-d)">Salt/Puppet：每台装 agent</text>
      <text x="14" y="170" font-size="7.5" fill="var(--fig-text)">agent 是每台多一个常驻进程，要部署、升级、占端口</text>

      <!-- 幂等 -->
      <rect x="6" y="188" width="328" height="46" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="201" font-size="8" font-weight="700" fill="var(--fig-node-a)">幂等：随时重跑，只收敛差异</text>
      <text x="14" y="214" font-size="7.5" fill="var(--fig-text)">yum: name=nginx state=present —— 已装就跳过</text>
      <text x="14" y="226" font-size="7.5" fill="var(--fig-text)">Shell 脚本第二次还会全跑一遍，这正是短板</text>

      <!-- 实践 -->
      <rect x="6" y="242" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="255" font-size="8" font-weight="700" fill="var(--fig-node-d)">大规模时的四个动作</text>
      <text x="14" y="267" font-size="7.5" fill="var(--fig-text)">serial 分批、vault 加密、tag 局部重跑、先 --check</text>

      <text x="6" y="284" font-size="7.5" fill="var(--fig-muted)">嫌慢：开 pipelining、调大 forks；再大的量级才换方案</text>
    </svg>
    <figcaption>控制机读 inventory → 经 SSH 把临时脚本推到被控机 → 执行后即删除收集结果；被控端不需要任何 agent，配合幂等可随时重跑</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
