<script setup>
/**
 * requirements.txt 与 pyproject.toml，以及生产如何锁依赖（题 5601）。
 *
 * 核心洞察：前者是「扁平清单」、后者是「工程元数据」；
 * 生产的关键不是用哪个，而是「声明」与「锁定」要分开。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 242" role="img" aria-label="requirements 与 pyproject 对比，以及声明依赖与锁定依赖的区别">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">关键不是用哪个文件，而是「声明」与「锁定」要分开</text>

      <rect x="6" y="20" width="160" height="76" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">requirements.txt</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">扁平清单，只列依赖</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">无版本范围语义</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">pip 传统方式</text>
      <text x="14" y="82" font-size="7" fill="var(--fig-node-c)">常用 pip freeze 生成</text>
      <text x="14" y="94" font-size="7" fill="var(--fig-node-c)">适合：简单项目/容器</text>

      <rect x="174" y="20" width="160" height="76" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">pyproject.toml</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">工程元数据 + 依赖声明</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">支持 &gt;= / ~= / extras</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">PEP 621 标准</text>
      <text x="182" y="82" font-size="7" fill="var(--fig-node-c)">pip/poetry/uv 都支持</text>
      <text x="182" y="94" font-size="7" fill="var(--fig-node-c)">适合：可分发/长期维护</text>

      <!-- 声明 vs 锁定 -->
      <rect x="6" y="104" width="328" height="52" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="117" font-size="8.5" font-weight="700" fill="#e5484d">生产必须「锁」而不是只「声明」</text>
      <text x="14" y="130" font-size="7.5" fill="var(--fig-text)">声明：requests&gt;=2.28 —— 允许升级，两次安装可能得到不同版本</text>
      <text x="14" y="142" font-size="7.5" fill="var(--fig-text)">锁定：requests==2.31.0 + hash —— 完全可复现，还能防篡改</text>
      <text x="14" y="154" font-size="7" fill="var(--fig-node-c)">传递依赖也要锁（升级 urllib3 常引发「昨天能跑今天崩」）</text>

      <rect x="6" y="164" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="177" font-size="8" font-weight="700" fill="var(--fig-node-c)">三种锁定方式</text>
      <text x="14" y="189" font-size="7.5" fill="var(--fig-text)">pip-tools（requirements.in → 锁定 + hash）· pip freeze · uv/poetry 的 lock 文件</text>

      <rect x="6" y="204" width="328" height="18" rx="3" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="217" font-size="7.5" fill="var(--fig-text)">排查「本地能跑线上报错」：比对两边 pip freeze，看传递依赖差在哪</text>

      <text x="6" y="234" font-size="7.5" fill="var(--fig-muted)">实践：声明写 pyproject，锁定文件进版本库；安装时必须用锁定文件</text>
    </svg>
    <figcaption>requirements 是扁平清单、pyproject 是工程元数据；生产关键是把「声明」与「锁定（含 hash）」分开，传递依赖也要锁</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
