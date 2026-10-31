<script setup>
/**
 * 向量与 Embedding 的直觉（题 5814）。
 *
 * 核心洞察：Embedding 把「语义」压成坐标，相近语义在空间里也相近，
 * 用余弦相似度只比方向不比长度。但向量是用某个模型算出来的 ——
 * 查询向量和库里的向量必须出自同一模型，换模型就得重建索引，
 * 否则两个空间的坐标根本不可比。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 270" role="img" aria-label="Embedding 把语义映射为向量，相近语义距离近；用余弦相似度衡量方向夹角；查询与库必须同一模型，换模型要重建索引">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">语义 → 一串数字：意思相近，坐标就相近</text>

      <!-- 语义空间 -->
      <rect x="6" y="20" width="160" height="106" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="13" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">语义空间</text>
      <line x1="24" y1="96" x2="24" y2="44" stroke="var(--fig-muted)" stroke-width=".7" opacity=".6" />
      <line x1="24" y1="96" x2="152" y2="96" stroke="var(--fig-muted)" stroke-width=".7" opacity=".6" />
      <circle cx="52" cy="86" r="2.6" fill="var(--fig-node-a)" />
      <text x="57" y="89" font-size="7.5" fill="var(--fig-text)">猫</text>
      <circle cx="66" cy="78" r="2.6" fill="var(--fig-node-a)" opacity=".8" />
      <text x="71" y="81" font-size="7.5" fill="var(--fig-text)">狗</text>
      <circle cx="60" cy="95" r="2.6" fill="var(--fig-node-a)" opacity=".7" />
      <text x="65" y="98" font-size="7.5" fill="var(--fig-text)">宠物</text>
      <circle cx="128" cy="52" r="2.6" fill="var(--fig-node-c)" />
      <text x="133" y="55" font-size="7.5" fill="var(--fig-text)">汽车</text>
      <circle cx="118" cy="64" r="2.6" fill="var(--fig-node-c)" opacity=".8" />
      <text x="123" y="67" font-size="7.5" fill="var(--fig-text)">驾照</text>
      <text x="13" y="118" font-size="7.5" fill="var(--fig-muted)">近义聚在一起，无关的离得远</text>

      <!-- 向量 -->
      <rect x="174" y="20" width="160" height="106" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="181" y="33" font-size="8" font-weight="700" fill="var(--fig-node-b)">变成向量</text>
      <text x="181" y="49" font-size="7.5" fill="var(--fig-text)">猫 → [0.21, -0.44, 0.86, …]</text>
      <text x="181" y="62" font-size="7.5" fill="var(--fig-text)">狗 → [0.25, -0.40, 0.81, …]</text>
      <text x="181" y="75" font-size="7.5" fill="var(--fig-text)">汽车 → [-0.7, 0.35, 0.12, …]</text>
      <text x="181" y="90" font-size="7.5" fill="var(--fig-muted)">几百到几千维，每维没有名字</text>
      <text x="181" y="103" font-size="7.5" fill="var(--fig-muted)">猫/狗的向量几乎同向 → 相似度高</text>
      <text x="181" y="116" font-size="7.5" fill="var(--fig-text)">相似度 ≈ 夹角余弦，只看方向</text>

      <!-- 余弦 -->
      <rect x="6" y="134" width="328" height="38" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="147" font-size="8" font-weight="700" fill="var(--fig-node-d)">余弦相似度</text>
      <text x="14" y="159" font-size="7.5" fill="var(--fig-text)">越接近 1 越相似，接近 0 即无关；只比方向，不比长短</text>
      <text x="14" y="169" font-size="7.5" fill="var(--fig-muted)">文本长度不同不影响打分，这正是它适合检索的原因</text>

      <!-- 必须同模型 -->
      <rect x="6" y="180" width="328" height="48" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="193" font-size="8.5" font-weight="700" fill="#e5484d">铁律：查询和库必须同一个 Embedding 模型</text>
      <text x="14" y="205" font-size="7.5" fill="var(--fig-text)">不同模型坐标不对齐，算出来的相似度没有意义</text>
      <text x="14" y="217" font-size="7.5" fill="var(--fig-text)">换模型 = 重建索引（全量重算），不是改个参数就行</text>

      <rect x="6" y="236" width="328" height="18" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="248" font-size="7.5" fill="var(--fig-text)">维度、归一化方式、切片规则，也要与建库时保持一致</text>

      <text x="6" y="260" font-size="7.5" fill="var(--fig-muted)">换模型忘了重建：召回明显变差，且极难排查</text>
    </svg>
    <figcaption>Embedding 把语义映射成向量，近义者距离近；余弦只看方向算相似度；查询与库必须同一模型，换模型必须重建索引</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
