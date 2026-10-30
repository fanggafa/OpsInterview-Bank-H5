<script setup>
/**
 * SQL 注入原理与运维侧防护（题 64）。
 *
 * 核心洞察：根因是「把数据当代码拼接」，代码层用参数化能根治；
 * 运维侧能用最小权限、WAF、审计等手段**降低影响面**，但替代不了代码修复。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 246" role="img" aria-label="SQL 注入因拼接产生，代码层参数化根治，运维侧用最小权限、WAF、审计降低影响面">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">根因是「把用户输入当代码」；运维能做的是降低影响面，不是根治</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="#e5484d">原理：拼接让输入变成了语句的一部分</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">`"select * from users where name='" + input + "'"` → 输入 `' or 1=1 --` 就改变了语义</text>

      <rect x="6" y="58" width="328" height="40" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="71" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">根治：代码层参数化（运维推不动就提工单）</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">预编译参数 / ORM 绑定变量；**绝不**用字符串拼接拼 SQL</text>

      <rect x="6" y="102" width="328" height="52" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="115" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">运维侧的四道降损措施</text>
      <text x="14" y="128" font-size="7.5" fill="var(--fig-text)">① 最小权限：应用账号只给必需库表的 CRUD，禁止 DROP/GRANT/FILE</text>
      <text x="14" y="140" font-size="7.5" fill="var(--fig-text)">② 读写分离/只读账号：查询走只读实例，限制写破坏面</text>
      <text x="14" y="152" font-size="7.5" fill="var(--fig-node-c)">③ WAF 规则拦截常见注入特征 ④ 审计与告警（异常 SQL、异常导出）</text>

      <rect x="6" y="158" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="171" font-size="8" font-weight="700" fill="var(--fig-node-c)">再加两条纵深</text>
      <text x="14" y="183" font-size="7.5" fill="var(--fig-text)">数据库不开公网（只内网）· 错误信息不回显（避免报错泄露表结构）</text>

      <rect x="6" y="192" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="205" font-size="8" font-weight="700" fill="#e5484d">别做的事</text>
      <text x="14" y="217" font-size="7.5" fill="var(--fig-text)">只靠「过滤关键字」——绕过手法太多（编码/大小写/注释/二次注入）</text>

      <text x="6" y="242" font-size="7.5" fill="var(--fig-muted)">验证：用 sqlmap 对**授权范围内**的测试环境验证，别打生产</text>
    </svg>
    <figcaption>注入源于拼接，代码层参数化才根治；运维侧靠最小权限、只读账号、WAF、审计降低影响面，过滤关键字不可靠</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
