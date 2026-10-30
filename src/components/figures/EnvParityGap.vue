<script setup>
/**
 * 「测试跑通、生产出事」的环境差异治理图。
 *
 * 对应题 5426。核心洞察：差异分六类，其中**数据量/分布/边界**最容易埋雷；
 * 治理按投入产出排序：生产脱敏副本 > 边界数据补齐 > 配置一致性 > 并发压测。
 *
 * 画布 340 宽，文字须控制在列内（npm run check:figures 校验）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 288" role="img" aria-label="测试与生产差异的六类来源与四项治理措施，重点是脱敏数据副本与边界数据补齐">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">「测试跑通 ≠ 生产能跑」是高频事故源，差异有六类</text>

      <text x="6" y="32" font-size="9.5" font-weight="700" fill="var(--fig-text)">① 六类差异 → 对应故障</text>

      <rect x="6" y="40" width="328" height="76" rx="5" fill="#e5484d" opacity=".09" />
      <text x="14" y="53" font-size="7.5" fill="var(--fig-text)">数据量：测试 100 条 vs 生产 1 亿条 → 慢查询、全表扫</text>
      <text x="14" y="66" font-size="7.5" fill="var(--fig-text)">数据分布：测试均匀 vs 生产有热点 → 分片不均、锁竞争</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-text)">数据边界：无超长串/特殊字符/NULL → 生产直接报错</text>
      <text x="14" y="92" font-size="7.5" fill="var(--fig-text)">并发量：1 个请求 vs 1000 QPS → 竞态、线程池满</text>
      <text x="14" y="105" font-size="7.5" fill="var(--fig-text)">配置与版本：超时/连接池/中间件驱动版本不一致</text>

      <text x="6" y="132" font-size="9.5" font-weight="700" fill="var(--fig-text)">② 治理措施（按投入产出排序）</text>

      <rect x="6" y="140" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="152" font-size="8" font-weight="700" fill="var(--fig-node-a)">最有效：用生产脱敏副本做 staging</text>
      <text x="14" y="164" font-size="7.5" fill="var(--fig-text)">数据量/分布/边界全部对齐 → 难点是脱敏（真实数据不能直接进测试）</text>

      <rect x="6" y="174" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="186" font-size="8" font-weight="700" fill="var(--fig-node-b)">低成本高收益：边界数据补齐</text>
      <text x="14" y="198" font-size="7.5" fill="var(--fig-text)">超长串 / emoji / SQL 关键字 / NULL / 极大值 / 并发同一记录</text>

      <rect x="6" y="208" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="220" font-size="8" font-weight="700" fill="var(--fig-node-c)">配置一致性：同一套 IaC 管理各环境</text>
      <text x="14" y="232" font-size="7.5" fill="var(--fig-text)">Helm/Kustomize 统一；差异项要显式声明，不能靠「记得改」</text>

      <rect x="6" y="242" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="254" font-size="8" font-weight="700" fill="var(--fig-node-d)">补并发：压测而非「单个请求跑通」</text>
      <text x="14" y="266" font-size="7.5" fill="var(--fig-text)">按生产峰值的 1.2~2 倍压测，观察竞态、池耗尽、慢查询</text>

      <text x="6" y="284" font-size="7.5" fill="var(--fig-muted)">一句话：80% 的「生产才报错」是边界数据与数据量差异，先把这两项补上</text>
    </svg>
    <figcaption>测试与生产的差异分六类，治理优先做「脱敏副本 + 边界数据」，性价比最高</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
