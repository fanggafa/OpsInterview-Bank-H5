<script setup>
/**
 * include_tasks 与 import_tasks（题 3229）。
 *
 * 核心洞察：import 是「静态」——解析 playbook 时就展开；
 * include 是「动态」——运行时才决定，因此能用变量决定加载哪个文件。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 260" role="img" aria-label="import_tasks 静态在解析时展开、include_tasks 动态在运行时决定；各自的适用与限制">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">一句话：import 是编译期展开，include 是运行期决定</text>

      <rect x="6" y="20" width="160" height="80" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">import_tasks（静态）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">解析 playbook 时就展开</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">不能依赖运行时变量决定</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">可用 when 但作用于每一条</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-text)">tags 能精确到内部任务</text>
      <text x="14" y="94" font-size="7" fill="var(--fig-node-c)">推荐默认用它</text>

      <rect x="174" y="20" width="160" height="80" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">include_tasks（动态）</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">运行时才加载</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">可用变量决定文件名</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">可放在 loop / when 里</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-text)">tasks 内部变量更灵活</text>
      <text x="182" y="94" font-size="7" fill="#e5484d">不能用 tags 选内部任务</text>

      <!-- 判断 -->
      <rect x="6" y="110" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="123" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">怎么选</text>
      <text x="14" y="136" font-size="7.5" fill="var(--fig-text)">文件名固定、只是想拆分组织 → import_tasks（更快、可控性更好）</text>
      <text x="14" y="148" font-size="7.5" fill="var(--fig-text)">要「按不同环境加载不同文件」或有循环 → include_tasks</text>

      <!-- 易错 -->
      <rect x="6" y="164" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="177" font-size="8.5" font-weight="700" fill="#e5484d">两个容易踩的坑</text>
      <text x="14" y="190" font-size="7.5" fill="var(--fig-text)">① import 里的 when 不会「跳过整个文件」，而是逐条判断（易误判）</text>
      <text x="14" y="202" font-size="7.5" fill="var(--fig-text)">② include 无法被子任务 tags 单独选中，`--tags` 会抓不到</text>

      <rect x="6" y="218" width="328" height="20" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="232" font-size="7.5" fill="var(--fig-text)">还有 include_role / import_role，规则与 tasks 版本一致</text>

      <text x="6" y="252" font-size="7.5" fill="var(--fig-muted)">性能：import 在解析时一次性展开，任务多时比 include 略快</text>
    </svg>
    <figcaption>import_tasks 在解析时静态展开、tags 可控；include_tasks 运行时动态加载、可用变量决定文件，但 tags 抓不到内部任务</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
