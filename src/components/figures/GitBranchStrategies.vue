<script setup>
/**
 * Git 分支策略对比（题 53）。
 *
 * 核心洞察：三种策略的差别是「多久合一次主干」——
 * 分支活得越久，合并冲突与集成风险越大；Trunk Based 最激进也最省心。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 270" role="img" aria-label="Git Flow、GitHub Flow、Trunk Based 三种分支策略的复杂度、发布节奏与适用团队">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">差别在「分支活多久」：越久越容易冲突，也越难集成</text>

      <!-- Git Flow -->
      <rect x="6" y="20" width="328" height="58" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="34" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">Git Flow（最复杂）</text>
      <text x="14" y="47" font-size="7.5" fill="var(--fig-text)">master / develop / feature / release / hotfix 五种分支</text>
      <text x="14" y="59" font-size="7.5" fill="var(--fig-text)">适合：有明确版本发布周期的产品（如客户端、传统版本交付）</text>
      <text x="14" y="72" font-size="7.5" fill="var(--fig-node-c)">痛点：分支多、合并链路长，持续交付场景下很重</text>

      <!-- GitHub Flow -->
      <rect x="6" y="86" width="328" height="58" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="100" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">GitHub Flow（折中，最常用）</text>
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">main 常驻可发布 + 短命 feature 分支 + PR 评审</text>
      <text x="14" y="125" font-size="7.5" fill="var(--fig-text)">适合：Web 服务、能持续部署的团队</text>
      <text x="14" y="138" font-size="7.5" fill="var(--fig-node-c)">要点：feature 分支要短（几小时内合，最长不超过 1~2 天）</text>

      <!-- Trunk Based -->
      <rect x="6" y="152" width="328" height="58" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="166" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">Trunk Based（最激进）</text>
      <text x="14" y="179" font-size="7.5" fill="var(--fig-text)">直接提交/极短分支到主干，靠 Feature Flag 控制可见性</text>
      <text x="14" y="191" font-size="7.5" fill="var(--fig-text)">适合：成熟 CI/CD + 灰度能力强的团队</text>
      <text x="14" y="204" font-size="7.5" fill="var(--fig-node-c)">前提：必须有自动化测试与开关机制，否则风险高</text>

      <!-- 选择 -->
      <rect x="6" y="218" width="328" height="28" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="231" font-size="8" font-weight="700" fill="var(--fig-node-c)">判断依据</text>
      <text x="74" y="231" font-size="7.5" fill="var(--fig-text)">能多快部署？测试多可信？开关能力多强？→ 三者越强越适合 Trunk Based</text>
      <text x="14" y="242" font-size="7.5" fill="var(--fig-node-c)">无论选哪种：分支寿命越短越好，长期分支是冲突与集成风险的根源</text>

      <text x="6" y="262" font-size="7.5" fill="var(--fig-muted)">本仓库实践：main 受保护、每次改动一个短分支 + PR，合并后立即删分支</text>
    </svg>
    <figcaption>Git Flow 适合版本化交付、GitHub Flow 是 Web 服务主流、Trunk Based 需要强 CI 与开关能力；无论哪种，分支越快合越好</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
