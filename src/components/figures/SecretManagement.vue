<script setup>
/**
 * 密钥与敏感配置的几种管理方式对比（题 66）。
 *
 * 核心洞察：从「硬编码」到「密钥管理平台」，安全性逐级提升；
 * 关键差别在「能否轮换」「能否审计」「是否落盘」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="密钥管理四种做法：硬编码、环境变量、加密配置、密钥管理平台，安全性逐级提升">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">安全性逐级提升：能不能轮换、能不能审计、是否落盘</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="#e5484d" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="#e5484d">① 硬编码在代码/配置</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">最危险：进 Git 历史就永久泄露，无法轮换，谁也看不到谁用过</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-d)">② 环境变量</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">比硬编码好（不落代码库），但仍会落进 `docker inspect`/日志/进程环境</text>

      <rect x="6" y="96" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="109" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ 加密配置（KMS 信封加密）</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">密文可进库，但要设计好解密凭据；轮换与审计仍偏弱</text>

      <rect x="6" y="134" width="328" height="46" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="147" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">④ 密钥管理平台（Vault / 云 Secret Manager）</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">集中管理 + 短期凭证（数据库账号按需签发、用完即失效）</text>
      <text x="14" y="172" font-size="7.5" fill="var(--fig-text)">可审计（谁在何时取了哪个密钥）· 可轮换 · 可按路径最小授权</text>

      <!-- 判断 -->
      <rect x="6" y="188" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="201" font-size="8" font-weight="700" fill="var(--fig-node-b)">判断一个方案好不好：问四个问题</text>
      <text x="14" y="213" font-size="7.5" fill="var(--fig-text)">能轮换吗？能审计吗？会落盘吗？泄露后影响面多大？</text>

      <rect x="6" y="222" width="328" height="20" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="236" font-size="7.5" fill="var(--fig-text)">反模式：把密钥和备份放一起 —— 备份被拿走时密钥一起泄露</text>

      <text x="6" y="248" font-size="7.5" fill="var(--fig-muted)">起步建议：先消灭硬编码（密钥扫描钩子），再逐步迁到密钥平台</text>
    </svg>
    <figcaption>四种做法安全度递增：硬编码最危、环境变量会落 inspect、加密配置轮换弱、密钥平台可轮换可审计且支持短期凭证</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
