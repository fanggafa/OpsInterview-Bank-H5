<script setup>
/**
 * Tomcat 启动很慢的排查（题 1826）。
 *
 * 核心洞察：启动慢主要卡在「熵池、扫描、依赖初始化」三处；
 * 用日志时间戳定位最慢的阶段，而不是盲目调连接池。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 264" role="img" aria-label="Tomcat 启动慢的四类原因：熵池阻塞、类扫描、依赖初始化、外部连接等待">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">先看日志时间戳找最慢阶段，别先调连接池</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="#e5484d" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="#e5484d">① 熵池阻塞（最常见，尤其容器/新装系统）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">启动时生成随机数等不到熵 → SecureRandom 卡住几十秒到几分钟</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-a)">② 类扫描与注解扫描</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">大量 jar（或 fat jar）被逐层扫描；JarScan / @ComponentScan 范围过大</text>

      <rect x="6" y="96" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="109" font-size="8" font-weight="700" fill="var(--fig-node-b)">③ 依赖初始化慢</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">连接池预热、远程配置拉取、数据库迁移在启动时执行</text>

      <rect x="6" y="134" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="147" font-size="8" font-weight="700" fill="var(--fig-node-c)">④ 外部连接等待</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">启动时连不上的下游（DNS/DB/注册中心）会一直重试直到超时</text>

      <!-- 排查方法 -->
      <rect x="6" y="176" width="328" height="46" rx="5" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="189" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">排查手段</text>
      <text x="14" y="202" font-size="7.5" fill="var(--fig-text)">① 看 catalina.out 每行时间戳的间隔，最大跳变就是瓶颈所在</text>
      <text x="14" y="214" font-size="7.5" fill="var(--fig-text)">② jstack 抓启动中的栈（若卡住，多次采样对比同一位置）</text>

      <rect x="6" y="228" width="328" height="16" rx="3" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="240" font-size="7.5" fill="var(--fig-text)">熵池解法：装 haveged 或 JVM 参数 -Djava.security.egd=file:/dev/urandom</text>

      <text x="6" y="254" font-size="7.5" fill="var(--fig-muted)">优化：懒初始化非必要组件、拆分模块、避免启动时做重活</text>
    </svg>
    <figcaption>启动慢多为熵池阻塞、类扫描、依赖初始化、外部连接等待；靠 catalina.out 时间戳跳变定位最慢阶段</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
