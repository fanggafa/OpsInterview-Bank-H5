<script setup>
/**
 * git stash 与「提交到临时分支」的区别（题 2811 相关）。
 *
 * 核心洞察：stash 是「本地的临时存放」，不参与历史、不推送、易丢失；
 * 提交到临时分支则进入历史、可推送、可共享 —— 长期保存应选后者。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 256" role="img" aria-label="git stash 是本地临时存放不进入历史，临时分支会进入历史可推送共享；两者适用场景与风险对比">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">stash 是本地的「临时抽屉」，临时分支是「进了历史的存档」</text>

      <rect x="6" y="20" width="160" height="76" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">git stash</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">把未提交改动收起来</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">不进入提交历史</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">不推送、不可共享</text>
      <text x="14" y="82" font-size="7.5" fill="#e5484d">易被遗忘 / 误清（stash drop）</text>

      <rect x="174" y="20" width="160" height="76" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">临时分支 + commit</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">改动进入提交历史</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">可推送、可共享、可回滚</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">有提交信息可追溯</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-node-c)">适合「要留几天」的改动</text>

      <!-- 场景 -->
      <rect x="6" y="106" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="119" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">stash 的典型场景</text>
      <text x="14" y="132" font-size="7.5" fill="var(--fig-text)">开发 A 到一半，要紧急切分支修 bug → stash 收起来，修完再 pop</text>
      <text x="14" y="144" font-size="7.5" fill="var(--fig-text)">注意：pop 可能冲突（期间改过同一文件），冲突要先解决</text>

      <!-- 命令 -->
      <rect x="6" y="162" width="328" height="40" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="175" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">常用命令</text>
      <text x="14" y="188" font-size="7.5" fill="var(--fig-text)">stash / stash list / stash pop / stash apply（保留记录）/ stash -u（含未跟踪）</text>
      <text x="14" y="200" font-size="7.5" fill="var(--fig-node-c)">pop = apply + drop；只想恢复不想删记录就用 apply</text>

      <rect x="6" y="210" width="328" height="24" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="226" font-size="7.5" fill="var(--fig-text)">风险：stash 只在本地 reflog 里，重装/换机就没了</text>

      <text x="6" y="246" font-size="7.5" fill="var(--fig-muted)">判断：改动只是「几小时内要回来的」用 stash，超过一天就用临时分支</text>
    </svg>
    <figcaption>stash 不进历史、本地易丢，适合几小时内切走又回来；要留较久或多机同步就用临时分支加 commit</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
