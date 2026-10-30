<script setup>
/**
 * MongoDB 复合索引的 ESR 原则（题 2008）。
 *
 * 核心洞察：字段顺序应「等值（Equality）→ 排序（Sort）→ 范围（Range）」，
 * 因为范围条件会把后面的字段踢出索引查找 —— 这与 MySQL 的最左前缀同理但更严格。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="MongoDB 复合索引 ESR 原则：等值字段在前、排序字段居中、范围字段在最后">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">字段顺序：Equality → Sort → Range，范围条件必须放最后</text>

      <rect x="6" y="20" width="328" height="40" rx="5" fill="var(--fig-node-a)" opacity=".14" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">E：等值条件放最前</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">{ status: 1 }　→ 先收窄到这个确定值，后续字段才有效</text>
      <text x="14" y="56" font-size="7" fill="var(--fig-node-c)">MongoDB 也是「前缀」生效，跳过前面的字段就等于没建</text>

      <rect x="6" y="66" width="328" height="40" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="79" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">S：排序字段其次</text>
      <text x="14" y="92" font-size="7.5" fill="var(--fig-text)">{ createdAt: -1 }　→ 让排序直接用索引顺序，避免内存排序</text>
      <text x="14" y="102" font-size="7" fill="var(--fig-node-c)">排序方向要与查询一致（复合索引的字段方向可各自正负）</text>

      <rect x="6" y="112" width="328" height="40" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="125" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">R：范围条件放最后</text>
      <text x="14" y="138" font-size="7.5" fill="var(--fig-text)">{ score: 1 }（$gt/$lt）→ 因为它会截断，后面的字段无法参与查找</text>
      <text x="14" y="148" font-size="7" fill="var(--fig-node-c)">若把范围字段放前面，后面所有字段都只能「回表后再过滤」</text>

      <!-- 例子 -->
      <rect x="6" y="158" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="171" font-size="8" font-weight="700" fill="var(--fig-node-d)">典型例子</text>
      <text x="14" y="184" font-size="7.5" fill="var(--fig-text)">find({status:1}).sort({createdAt:-1}) 且 createdAt 在范围内</text>

      <rect x="6" y="196" width="328" height="24" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="212" font-size="7.5" fill="var(--fig-text)">索引应建：{ status: 1, createdAt: -1 }（等值在前、排序随后）</text>

      <text x="6" y="248" font-size="7.5" fill="var(--fig-muted)">验证：explain 看 totalKeysExamined 与 nReturned；比值接近 1 说明索引设计合理</text>
    </svg>
    <figcaption>复合索引按 ESR 排序：等值字段在最前、排序字段居中、范围字段必须最后，否则范围之后的字段失效</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
