<script setup>
/**
 * 微调 vs 提示词 vs RAG 的分工（题 5811）。
 *
 * 核心洞察：三手段解决的是三类不同的病 —— 管格式（提示词）、
 * 管知识（RAG）、管风格与稳定行为（微调）。把知识塞进微调，或
 * 用微调治「事实不准」，都是拿错了工具，还更贵、更难更新。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 262" role="img" aria-label="分工表：提示词管输出格式、RAG 管知识与事实、微调管语气风格与稳定行为；知识常变或数据不足时不该微调">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">先分清「病」再开药：三种手段治三种病</text>

      <rect x="6" y="20" width="328" height="16" rx="3" fill="var(--fig-node-a)" opacity=".16" />
      <text x="14" y="31" font-size="8" font-weight="700" fill="var(--fig-node-a)">分工表</text>
      <text x="120" y="31" font-size="7.5" fill="var(--fig-muted)">格式</text>
      <text x="176" y="31" font-size="7.5" fill="var(--fig-muted)">知识</text>
      <text x="236" y="31" font-size="7.5" fill="var(--fig-muted)">风格 / 行为</text>

      <rect x="6" y="40" width="328" height="28" rx="3" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="52" font-size="8" font-weight="700" fill="var(--fig-node-b)">提示词</text>
      <text x="120" y="52" font-size="7.5" fill="var(--fig-node-a)">✓ 管格式</text>
      <text x="176" y="52" font-size="7.5" fill="var(--fig-muted)">差</text>
      <text x="236" y="52" font-size="7.5" fill="var(--fig-muted)">弱</text>
      <text x="14" y="63" font-size="7.5" fill="var(--fig-text)">改输出结构、语气、角色设定：零成本、随时改</text>

      <rect x="6" y="72" width="328" height="28" rx="3" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="84" font-size="8" font-weight="700" fill="var(--fig-node-c)">RAG 检索</text>
      <text x="120" y="84" font-size="7.5" fill="var(--fig-muted)">弱</text>
      <text x="176" y="84" font-size="7.5" fill="var(--fig-node-a)">✓ 管知识</text>
      <text x="236" y="84" font-size="7.5" fill="var(--fig-muted)">弱</text>
      <text x="14" y="95" font-size="7.5" fill="var(--fig-text)">把最新文档、内部资料塞进上下文：换文档即生效</text>

      <rect x="6" y="104" width="328" height="28" rx="3" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="116" font-size="8" font-weight="700" fill="var(--fig-node-d)">微调</text>
      <text x="120" y="116" font-size="7.5" fill="var(--fig-muted)">中</text>
      <text x="176" y="116" font-size="7.5" fill="var(--fig-muted)">中</text>
      <text x="236" y="116" font-size="7.5" fill="var(--fig-node-a)">✓ 管风格</text>
      <text x="14" y="127" font-size="7.5" fill="var(--fig-text)">固定输出习惯、专有格式、领域术语：要数据要算力</text>

      <!-- 不该微调 -->
      <rect x="6" y="140" width="328" height="56" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="153" font-size="8.5" font-weight="700" fill="#e5484d">这两种情况别微调</text>
      <text x="14" y="166" font-size="7.5" fill="var(--fig-text)">① 知识经常变：微调等于把知识冻进权重，更新还得重训</text>
      <text x="14" y="178" font-size="7.5" fill="var(--fig-text)">② 只是事实不准 / 数据不够：该用 RAG，别拿微调硬记</text>
      <text x="14" y="190" font-size="7.5" fill="var(--fig-muted)">宁可不做，也别花大钱买一个更难维护的错答案</text>

      <rect x="6" y="204" width="328" height="40" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="217" font-size="8" font-weight="700" fill="var(--fig-node-a)">判断顺序（从便宜到贵）</text>
      <text x="14" y="229" font-size="7.5" fill="var(--fig-text)">先改提示词 → 不够就上 RAG → 仍不行再考虑微调</text>
      <text x="14" y="240" font-size="7.5" fill="var(--fig-muted)">多数「效果不好」卡在前两步没做好</text>

      <text x="6" y="256" font-size="7.5" fill="var(--fig-muted)">微调不是万用钥匙：它擅长塑造习惯，不擅长存放事实</text>
    </svg>
    <figcaption>提示词管格式、RAG 管知识、微调管风格；知识常变或只是事实不准时别微调，按「提示词 → RAG → 微调」由便宜到贵判断</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
