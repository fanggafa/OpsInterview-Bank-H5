<script setup>
/**
 * JVM 内存区域与四种 OOM 的对应关系（Tomcat/JVM）。
 *
 * 核心洞察：`OutOfMemoryError` 有四种常见后缀，分别对应不同区域 ——
 * 看后缀就能直接定位方向，不用一上来就抓堆 dump。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 278" role="img" aria-label="JVM 四个内存区域与对应 OOM 类型：heap、Metaspace、直接内存、无法创建线程，各自的排查方向">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">看 OOM 的后缀就能定位方向，不必一上来就抓堆 dump</text>

      <rect x="6" y="20" width="328" height="42" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">Java heap space → 堆</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">容量不足 or 内存泄漏：jstat -gcutil 看 Old，jmap dump 后 MAT 找引用链</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-node-c)">必配 -XX:+HeapDumpOnOutOfMemoryError，否则没有现场</text>

      <rect x="6" y="66" width="328" height="42" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="79" font-size="8" font-weight="700" fill="var(--fig-node-b)">Metaspace → 类元数据（本地内存）</text>
      <text x="14" y="92" font-size="7.5" fill="var(--fig-text)">类被反复加载不卸载：动态代理、热部署、脚本引擎每请求编译</text>
      <text x="14" y="104" font-size="7.5" fill="var(--fig-node-c)">排查：jmap -clstats 看 ClassLoader 是否单调增长</text>

      <rect x="6" y="112" width="328" height="42" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="125" font-size="8" font-weight="700" fill="var(--fig-node-c)">Direct buffer memory → 堆外</text>
      <text x="14" y="138" font-size="7.5" fill="var(--fig-text)">NIO/DirectByteBuffer 未释放（常见于网络框架、大文件传输）</text>
      <text x="14" y="150" font-size="7.5" fill="var(--fig-node-c)">排查：-XX:MaxDirectMemorySize 限制；看 NMT 报告</text>

      <rect x="6" y="158" width="328" height="42" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="171" font-size="8" font-weight="700" fill="var(--fig-node-d)">unable to create new native thread → 线程</text>
      <text x="14" y="184" font-size="7.5" fill="var(--fig-text)">线程太多或 -Xss 太大：每个线程占栈空间，会耗尽进程内存/句柄</text>
      <text x="14" y="196" font-size="7.5" fill="var(--fig-node-c)">排查：ulimit -u / -n，线程数统计，线程池是否泄漏</text>

      <rect x="6" y="208" width="328" height="34" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="221" font-size="8" font-weight="700" fill="var(--fig-node-a)">容器化的额外陷阱</text>
      <text x="14" y="234" font-size="7.5" fill="var(--fig-text)">老 JDK 在 cgroup v2 上会「按宿主机内存」算堆 → 超 limit 被 OOMKilled</text>

      <text x="6" y="258" font-size="7.5" fill="var(--fig-muted)">易混点：Java 的 OOM 与「被内核 OOM killer 杀掉（Killed）」是完全两回事</text>
      <text x="6" y="270" font-size="7.5" fill="var(--fig-muted)">排查提示：容器被 kill 时先看 kubectl describe 的 Last State: OOMKilled</text>
    </svg>
    <figcaption>OOM 后缀直接指向区域：heap 抓 dump、Metaspace 看 ClassLoader、Direct 看 NMT、thread 看 ulimit</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
