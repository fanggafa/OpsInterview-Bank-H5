<script setup>
/**
 * Python 内存增长排查（题 5604）。
 *
 * 核心洞察：先分清「真泄漏」还是「缓存/C 层碎片」；
 * tracemalloc 看「哪行分配最多」，objgraph 看「谁在引用它」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="内存增长排查：先看趋势与重启回落，tracemalloc 按代码行、objgraph 按对象与引用链定位">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">GC 后仍不回落才是泄漏；重启后回落 = 泄漏，不回落 = 缓存/碎片</text>

      <rect x="6" y="20" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="36" font-size="7.5" fill="var(--fig-text)">① 看趋势：RSS 是否单调上升；重启后是否回落</text>

      <rect x="6" y="50" width="160" height="66" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="63" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">tracemalloc</text>
      <text x="14" y="76" font-size="7.5" fill="var(--fig-text)">按「代码行」统计分配</text>
      <text x="14" y="88" font-size="7.5" fill="var(--fig-text)">回答：哪一行分配最多</text>
      <text x="14" y="100" font-size="7.5" fill="var(--fig-text)">compare_to(snap1, lineno)</text>
      <text x="14" y="112" font-size="7" fill="var(--fig-node-c)">开销大，只适合短时空跑</text>

      <rect x="174" y="50" width="160" height="66" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="182" y="63" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">objgraph</text>
      <text x="182" y="76" font-size="7.5" fill="var(--fig-text)">按「对象类型」看增长</text>
      <text x="182" y="88" font-size="7.5" fill="var(--fig-text)">谁在引用它（backrefs）</text>
      <text x="182" y="100" font-size="7.5" fill="var(--fig-text)">show_growth / show_backrefs</text>
      <text x="182" y="112" font-size="7" fill="var(--fig-node-c)">适合定位「卡住不放的对象」</text>

      <!-- 四个常见来源 -->
      <rect x="6" y="126" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="139" font-size="8.5" font-weight="700" fill="#e5484d">四个常见泄漏来源</text>
      <text x="14" y="152" font-size="7.5" fill="var(--fig-text)">① 全局缓存无上限（dict 增长 / lru_cache(maxsize=None)）</text>
      <text x="14" y="164" font-size="7.5" fill="var(--fig-text)">② 注册了回调/监听未注销　③ 线程局部变量未清理　④ 循环引用 + __del__</text>

      <rect x="6" y="180" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="193" font-size="8" font-weight="700" fill="var(--fig-node-d)">tracemalloc 正常但 RSS 涨</text>
      <text x="14" y="205" font-size="7.5" fill="var(--fig-text)">多是 glibc 碎片或 C 扩展未释放 → 试 MALLOC_ARENA_MAX=2 或换 jemalloc</text>

      <rect x="6" y="218" width="328" height="20" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="232" font-size="7.5" fill="var(--fig-text)">容器里结合 memory.stat 与 cgroup 限额看；注意 RSS 不等于实际使用</text>

      <text x="6" y="248" font-size="7.5" fill="var(--fig-muted)">经验：泄漏多是「生命周期没对上」——请求建的对象活到了进程结束</text>
    </svg>
    <figcaption>先确认是否真泄漏（重启回落），tracemalloc 定位分配行、objgraph 定位持有者；RSS 涨而 tracemalloc 平 → 碎片或 C 层</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
