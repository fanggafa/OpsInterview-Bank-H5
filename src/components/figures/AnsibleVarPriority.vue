<script setup>
/**
 * Ansible 变量优先级（题 3202）。
 *
 * 核心洞察：「变量被覆盖了找不到原因」几乎都是优先级问题 ——
 * 越靠后（命令行 -e、extra vars）优先级越高，且这个顺序不可配置。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 268" role="img" aria-label="Ansible 变量优先级从低到高：角色默认、inventory、play vars、host vars、extra vars 最高">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">越往下优先级越高（命令行 -e 最高）；「变量不生效」多半是顺序问题</text>

      <rect x="6" y="20" width="328" height="22" rx="4" fill="var(--fig-node-a)" opacity=".08" />
      <text x="14" y="35" font-size="7.5" fill="var(--fig-text)">最低：role defaults（角色默认值，最容易被覆盖）</text>

      <rect x="6" y="46" width="328" height="22" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="61" font-size="7.5" fill="var(--fig-text)">较低：inventory 的 group_vars / host_vars</text>

      <rect x="6" y="72" width="328" height="22" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="87" font-size="7.5" fill="var(--fig-text)">中：play 的 vars / vars_files</text>

      <rect x="6" y="98" width="328" height="22" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">较高：set_fact / register（运行时注册的变量）</text>

      <rect x="6" y="124" width="328" height="22" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="139" font-size="7.5" fill="var(--fig-text)">高：role vars（角色内 vars/main.yml）</text>

      <rect x="6" y="150" width="328" height="22" rx="4" fill="#e5484d" opacity=".12" />
      <text x="14" y="165" font-size="7.5" font-weight="700" fill="#e5484d">最高：命令行 -e / extra vars（覆盖一切）</text>

      <!-- 排查 -->
      <rect x="6" y="182" width="328" height="40" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="195" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">怎么确认变量最终值</text>
      <text x="14" y="208" font-size="7.5" fill="var(--fig-text)">ansible -m debug -a \"var=变量名\" 或 play 里 debug: var=…</text>
      <text x="14" y="220" font-size="7.5" fill="var(--fig-node-c)">-vvv 能看到变量来源与覆盖过程</text>

      <!-- 原则 -->
      <rect x="6" y="230" width="328" height="20" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="244" font-size="7.5" fill="var(--fig-node-c)">实践：给变量加前缀（如 app_db_host），避免跨角色重名撞车</text>

      <text x="6" y="260" font-size="7.5" fill="var(--fig-muted)">易混点：role defaults 最低、role vars 很高 —— 同一角色内两者差别很大</text>
    </svg>
    <figcaption>优先级从低到高：role defaults → inventory → play vars → set_fact → role vars → 命令行 -e；用 debug 确认最终值</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
