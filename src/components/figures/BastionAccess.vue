<script setup>
/**
 * 生产访问链路与权限收敛图。
 * 「谁能登上生产」这个问题的正确答案是「经过堡垒机并被审计」，
 * 这张图把「不该有的直连」和「应该有的收敛」并排对比。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 244" role="img" aria-label="生产访问应该收敛到堡垒机，以及直连生产的三类风险">
      <defs>
        <marker id="arrSec" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-c)" />
        </marker>
        <marker id="arrSec2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#e5484d" />
        </marker>
      </defs>

      <!-- 正确：经堡垒机 -->
      <text x="6" y="12" font-size="9.5" font-weight="700" fill="var(--fig-node-c)">✓ 应该这样：所有访问经过堡垒机</text>

      <rect x="6" y="20" width="64" height="30" rx="5" fill="var(--fig-node-a)" opacity=".85" />
      <text x="38" y="39" text-anchor="middle" font-size="8.5" fill="#fff" font-weight="600">运维人员</text>

      <path d="M72 35 L108 35" stroke="var(--fig-node-c)" stroke-width="1.6" marker-end="url(#arrSec)" />

      <rect x="112" y="18" width="94" height="34" rx="5" fill="var(--fig-node-c)" opacity=".86" />
      <text x="159" y="32" text-anchor="middle" font-size="8.5" fill="#fff" font-weight="700">堡垒机</text>
      <text x="159" y="45" text-anchor="middle" font-size="7" fill="#fff" opacity=".9">认证+授权+录屏</text>

      <path d="M208 35 L244 35" stroke="var(--fig-node-c)" stroke-width="1.6" marker-end="url(#arrSec)" />

      <rect x="248" y="20" width="86" height="30" rx="5" fill="var(--fig-node-card, var(--fig-card))" stroke="var(--fig-node-c)" stroke-width="1.3" />
      <text x="291" y="39" text-anchor="middle" font-size="8.5" fill="var(--fig-node-c)" font-weight="600">生产服务器</text>

      <text x="6" y="66" font-size="7.5" fill="var(--fig-muted)">堡垒机给的三样东西：统一认证（谁能登）、最小权限（能做什么）、全量审计（做过什么）</text>

      <!-- 错误：直连 -->
      <text x="6" y="86" font-size="9.5" font-weight="700" fill="#e5484d">✗ 不该这样：人人能直连生产</text>

      <rect x="6" y="94" width="60" height="26" rx="5" fill="var(--fig-node-a)" opacity=".5" />
      <text x="36" y="110" text-anchor="middle" font-size="8" fill="#fff">开发 A</text>

      <rect x="6" y="126" width="60" height="26" rx="5" fill="var(--fig-node-a)" opacity=".5" />
      <text x="36" y="142" text-anchor="middle" font-size="8" fill="#fff">开发 B</text>

      <path d="M68 107 L120 118" stroke="#e5484d" stroke-width="1.4" stroke-dasharray="3 2" marker-end="url(#arrSec2)" />
      <path d="M68 139 L120 126" stroke="#e5484d" stroke-width="1.4" stroke-dasharray="3 2" marker-end="url(#arrSec2)" />

      <rect x="124" y="106" width="96" height="34" rx="5" fill="#e5484d" opacity=".12" />
      <rect x="124" y="106" width="96" height="34" rx="5" fill="none" stroke="#e5484d" stroke-width="1.3" stroke-dasharray="3 2" />
      <text x="172" y="120" text-anchor="middle" font-size="8" fill="#e5484d" font-weight="600">生产服务器</text>
      <text x="172" y="132" text-anchor="middle" font-size="7" fill="var(--fig-muted)">无审计、无录像</text>

      <!-- 风险列表 -->
      <text x="230" y="106" font-size="8" fill="#e5484d">三个后果：</text>
      <text x="230" y="119" font-size="7.5" fill="var(--fig-text)">① 出事查不到谁做的</text>
      <text x="230" y="131" font-size="7.5" fill="var(--fig-text)">② 离职后密码还在用</text>
      <text x="230" y="143" font-size="7.5" fill="var(--fig-text)">③ 误操作无人拦</text>

      <!-- 关键加固 -->
      <rect x="6" y="164" width="328" height="66" rx="7" fill="var(--fig-node-b)" opacity=".08" />
      <rect x="6" y="164" width="328" height="66" rx="7" fill="none" stroke="var(--fig-node-b)" stroke-width="1.2" />
      <text x="16" y="180" font-size="9" font-weight="700" fill="var(--fig-node-b)">SSH 本身的四条基础加固</text>
      <text x="16" y="194" font-size="8" fill="var(--fig-text)">① PasswordAuthentication no —— 禁密码，只留密钥</text>
      <text x="16" y="206" font-size="8" fill="var(--fig-text)">② PermitRootLogin no —— 禁 root 直接登录</text>
      <text x="16" y="218" font-size="8" fill="var(--fig-text)">③ 安全组禁止 0.0.0.0/0 访问 22/3306/6379 —— 端口暴露即被扫爆</text>
      <text x="16" y="231" font-size="8" fill="var(--fig-node-c)">④ sudo 白名单，不是 NOPASSWD:ALL</text>
    </svg>
    <figcaption>「最小权限 + 全量审计」是安全的两块基石；改端口只是减少扫描噪音，不是安全措施</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
