<script setup>
/**
 * GitLab CI 的 .gitlab-ci.yml 结构（题 2828）。
 *
 * 核心洞察：一份流水线由「stages 定义顺序 → jobs 归属 stage → rules 决定是否运行」
 * 三部分组成，再用 include / extends 做复用。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 254" role="img" aria-label="GitLab CI 三要素：stages 定顺序、job 归属 stage、rules 决定运行，以及 include extends 复用">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">三要素：stages 定顺序、job 属哪个 stage、rules 决定跑不跑</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">stages：定义阶段顺序</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">如 build → test → deploy；同一 stage 内 job 并行</text>

      <rect x="6" y="54" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="var(--fig-node-b)">job：具体任务，要写 stage</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-text)">script / image / artifacts / cache / needs（needs 可跳过阶段依赖）</text>

      <rect x="6" y="88" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="101" font-size="8" font-weight="700" fill="var(--fig-node-c)">rules：决定该 job 何时运行</text>
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">rules:if / changes / exists → 控制「分支、MR、文件变化」触发</text>

      <!-- 复用 -->
      <rect x="6" y="122" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="135" font-size="8" font-weight="700" fill="var(--fig-node-d)">复用机制</text>
      <text x="14" y="147" font-size="7.5" fill="var(--fig-text)">include（拆文件）· extends（继承模板）· hidden jobs 以 . 开头作模板</text>

      <!-- 排查要点 -->
      <rect x="6" y="160" width="328" height="50" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="173" font-size="8.5" font-weight="700" fill="#e5484d">最常见的四个坑</text>
      <text x="14" y="186" font-size="7.5" fill="var(--fig-text)">① job 名重复被覆盖　② rules 全不匹配 → job 不跑（没报错，很隐蔽）</text>
      <text x="14" y="198" font-size="7.5" fill="var(--fig-text)">③ artifacts 没传 → 下一阶段找不到产物　④ cache 与 artifacts 混用（用途不同）</text>
      <text x="14" y="210" font-size="7" fill="var(--fig-node-c)">最隐蔽的是 ②：流水线「成功」但某一步根本没执行</text>

      <rect x="6" y="218" width="328" height="16" rx="3" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="230" font-size="7.5" fill="var(--fig-text)">调试：CI Lint（项目内的 CI/CD → Editor）能静态校验并看合并后的配置</text>

      <text x="6" y="246" font-size="7.5" fill="var(--fig-muted)">注意：默认所有 job 都是「允许失败」以外的必过项 —— allow_failure 要显式配</text>
    </svg>
    <figcaption>stages 定顺序、job 属 stage、rules 决定运行；复用靠 include/extends/隐藏 job；最大坑是 rules 不匹配导致 job 静默不跑</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
