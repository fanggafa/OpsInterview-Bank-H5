<script setup>
/**
 * 日志与链路追踪体系（题 12091）。
 *
 * 核心洞察：一个 traceId 把「指标 / 追踪 / 日志」三支柱串成一条可走通的路径 ——
 * 指标先说「有异常」，追踪说「慢在哪一段」，日志说「为什么」；
 * 由面到点逐层收窄，才是排查的正确方向。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 312" role="img" aria-label="日志与追踪体系：写入链路（埋点、traceId 透传、收集、存储）与查询路径（指标发现、追踪定位、日志找因）">
      <defs>
        <marker id="arrLts" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-a)" />
        </marker>
      </defs>

      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">一个 traceId 串起日志、指标、追踪三支柱</text>

      <!-- 写入链路 -->
      <rect x="6" y="20" width="76" height="44" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <rect x="6" y="20" width="76" height="44" rx="5" fill="none" stroke="var(--fig-node-a)" stroke-width="1" />
      <text x="44" y="36" text-anchor="middle" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">应用埋点</text>
      <text x="44" y="50" text-anchor="middle" font-size="7" fill="var(--fig-text)">结构化 JSON</text>
      <text x="44" y="61" text-anchor="middle" font-size="7" fill="var(--fig-text)">带上 traceId</text>

      <path d="M84 42 L88 42" stroke="var(--fig-node-a)" stroke-width="1.5" marker-end="url(#arrLts)" />

      <rect x="90" y="20" width="76" height="44" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <rect x="90" y="20" width="76" height="44" rx="5" fill="none" stroke="var(--fig-node-b)" stroke-width="1" />
      <text x="128" y="36" text-anchor="middle" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">traceId 透传</text>
      <text x="128" y="50" text-anchor="middle" font-size="7" fill="var(--fig-text)">HTTP header</text>
      <text x="128" y="61" text-anchor="middle" font-size="7" fill="var(--fig-text)">线程上下文</text>

      <path d="M168 42 L172 42" stroke="var(--fig-node-a)" stroke-width="1.5" marker-end="url(#arrLts)" />

      <rect x="174" y="20" width="76" height="44" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <rect x="174" y="20" width="76" height="44" rx="5" fill="none" stroke="var(--fig-node-c)" stroke-width="1" />
      <text x="212" y="36" text-anchor="middle" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">收集</text>
      <text x="212" y="50" text-anchor="middle" font-size="7" fill="var(--fig-text)">Filebeat</text>
      <text x="212" y="61" text-anchor="middle" font-size="7" fill="var(--fig-text)">OTLP 上报</text>

      <path d="M252 42 L256 42" stroke="var(--fig-node-a)" stroke-width="1.5" marker-end="url(#arrLts)" />

      <rect x="258" y="20" width="76" height="44" rx="5" fill="var(--fig-node-d)" opacity=".12" />
      <rect x="258" y="20" width="76" height="44" rx="5" fill="none" stroke="var(--fig-node-d)" stroke-width="1" />
      <text x="296" y="36" text-anchor="middle" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">存储</text>
      <text x="296" y="50" text-anchor="middle" font-size="7" fill="var(--fig-text)">ES 存日志</text>
      <text x="296" y="61" text-anchor="middle" font-size="7" fill="var(--fig-text)">时序库存指标</text>

      <!-- 查询路径：由面到点逐层收窄 -->
      <rect x="6" y="76" width="328" height="40" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="89" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 指标：整体健康度</text>
      <text x="14" y="102" font-size="7.5" fill="var(--fig-text)">聚合值 + 趋势 + 告警，先在这里发现异常</text>

      <path d="M40 116 L40 128" stroke="var(--fig-node-a)" stroke-width="1.5" marker-end="url(#arrLts)" />

      <rect x="6" y="130" width="268" height="40" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="143" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② 追踪：慢在哪一段</text>
      <text x="14" y="156" font-size="7.5" fill="var(--fig-text)">一条 trace 的 span 瀑布图，定位到具体调用</text>
      <text x="282" y="143" font-size="7" fill="var(--fig-muted)">只聚焦一次请求</text>

      <path d="M40 170 L40 182" stroke="var(--fig-node-a)" stroke-width="1.5" marker-end="url(#arrLts)" />

      <rect x="6" y="184" width="208" height="40" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="197" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">③ 日志：为什么失败</text>
      <text x="14" y="210" font-size="7.5" fill="var(--fig-text)">同 traceId 下的全链路事件与参数</text>
      <text x="222" y="197" font-size="7" fill="var(--fig-muted)">再聚焦单次事件</text>

      <!-- 坑 -->
      <rect x="6" y="236" width="328" height="54" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="250" font-size="8.5" font-weight="700" fill="#e5484d">两个必须提前设计的点</text>
      <text x="14" y="263" font-size="7.5" fill="var(--fig-text)">① traceId 要透传到线程池/异步任务，否则日志串不起来</text>
      <text x="14" y="277" font-size="7.5" fill="var(--fig-text)">② 采样：正常 1%、错误 100%；同时监控日志速率防写满</text>

      <text x="6" y="302" font-size="7.5" fill="var(--fig-muted)">冷热分级存储：热存 ES 7~15 天，审计冷存归档 6 个月起</text>
    </svg>
    <figcaption>写入链路是「埋点→透传→收集→存储」，查询路径是「指标→追踪→日志」由面到点收窄；关键在 traceId 全程不断</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
