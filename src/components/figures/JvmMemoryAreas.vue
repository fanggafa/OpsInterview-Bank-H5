<script setup>
/**
 * JVM 内存区域与 OOM 类型对照图。
 * 左侧是内存区域，右侧是「每个区域溢出时报什么错」——
 * 这是「OOM 怎么排查」这道题最需要的一张对应关系图。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 232" role="img" aria-label="JVM 内存区域划分与各区域溢出时对应的 OOM 类型">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">不同区域的溢出对应不同的 OOM 报错，看报错就能知道去哪查</text>

      <!-- 堆 -->
      <rect x="6" y="20" width="164" height="52" rx="6" fill="var(--fig-node-a)" opacity=".1" />
      <rect x="6" y="20" width="164" height="52" rx="6" fill="none" stroke="var(--fig-node-a)" stroke-width="1.3" />
      <text x="14" y="35" font-size="9.5" font-weight="700" fill="var(--fig-node-a)">堆（Heap）</text>
      <text x="14" y="50" font-size="8" fill="var(--fig-text)">Young（Eden + Survivor）× 2 + Old</text>
      <text x="14" y="64" font-size="8" fill="var(--fig-node-d)">→ Java heap space（对象放不下 / 泄漏）</text>

      <!-- 元空间 -->
      <rect x="6" y="78" width="164" height="44" rx="6" fill="var(--fig-node-b)" opacity=".1" />
      <rect x="6" y="78" width="164" height="44" rx="6" fill="none" stroke="var(--fig-node-b)" stroke-width="1.3" />
      <text x="14" y="93" font-size="9.5" font-weight="700" fill="var(--fig-node-b)">元空间（Metaspace）</text>
      <text x="14" y="107" font-size="8" fill="var(--fig-text)">类元数据、方法、常量池（JDK8+ 取代永久代）</text>
      <text x="14" y="118" font-size="8" fill="var(--fig-node-d)">→ Metaspace（动态生成类过多）</text>

      <!-- 栈 -->
      <rect x="6" y="128" width="164" height="44" rx="6" fill="var(--fig-node-c)" opacity=".1" />
      <rect x="6" y="128" width="164" height="44" rx="6" fill="none" stroke="var(--fig-node-c)" stroke-width="1.3" />
      <text x="14" y="143" font-size="9.5" font-weight="700" fill="var(--fig-node-c)">虚拟机栈 / 本地方法栈</text>
      <text x="14" y="157" font-size="8" fill="var(--fig-text)">每个线程的栈帧（局部变量、返回地址）</text>
      <text x="14" y="168" font-size="8" fill="var(--fig-node-d)">→ StackOverflowError（递归过深）</text>

      <!-- 直接内存 -->
      <rect x="6" y="178" width="164" height="44" rx="6" fill="var(--fig-node-d)" opacity=".1" />
      <rect x="6" y="178" width="164" height="44" rx="6" fill="none" stroke="var(--fig-node-d)" stroke-width="1.3" />
      <text x="14" y="193" font-size="9.5" font-weight="700" fill="var(--fig-node-d)">直接内存 / 堆外</text>
      <text x="14" y="207" font-size="8" fill="var(--fig-text)">NIO DirectByteBuffer、Netty、JNI</text>
      <text x="14" y="218" font-size="8" fill="var(--fig-node-d)">→ Direct buffer memory（容器里最常见）</text>

      <!-- 右侧排查线索 -->
      <rect x="178" y="20" width="156" height="202" rx="7" fill="var(--fig-node-a)" opacity=".07" />
      <rect x="178" y="20" width="156" height="202" rx="7" fill="none" stroke="var(--fig-node-a)" stroke-width="1.2" />
      <text x="188" y="38" font-size="9.5" font-weight="700" fill="var(--fig-node-a)">排查路径</text>

      <text x="188" y="56" font-size="8.5" fill="var(--fig-text)">1. 看报错信息定位区域</text>
      <text x="188" y="70" font-size="8" fill="var(--fig-muted)">（上面四条对应关系）</text>

      <text x="188" y="88" font-size="8.5" fill="var(--fig-text)">2. heap space 时抓 dump：</text>
      <text x="188" y="101" font-size="7.5" fill="var(--fig-muted)">-XX:+HeapDumpOnOutOfMemory</text>
      <text x="188" y="112" font-size="7.5" fill="var(--fig-muted)">-XX:HeapDumpPath=/data</text>

      <text x="188" y="130" font-size="8.5" fill="var(--fig-text)">3. 用 MAT / jmap 分析</text>
      <text x="188" y="143" font-size="8" fill="var(--fig-muted)">找「谁占了大头」</text>

      <text x="188" y="161" font-size="8.5" fill="var(--fig-text)">4. 容器里必须配：</text>
      <text x="188" y="174" font-size="7.5" fill="var(--fig-muted)">-XX:MaxRAMPercentage=75</text>
      <text x="188" y="185" font-size="7.5" fill="var(--fig-muted)">否则 JVM 看不到 limits</text>

      <text x="188" y="203" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">坑：堆设对但仍有 OOM</text>
      <text x="188" y="215" font-size="7.5" fill="var(--fig-muted)">→ 往往是堆外/直接内存超了 limits</text>
    </svg>
    <figcaption>看 OOM 的报错后缀就能定位区域；容器里最容易忽略的是堆外内存</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
