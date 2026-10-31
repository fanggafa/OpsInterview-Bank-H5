<script setup>
/**
 * Nginx reload 与 restart（题 1408）。
 *
 * 核心洞察：reload 是「平滑重载」——旧 worker 处理完存量请求再退出，不丢连接；
 * restart 是「整体停止再启动」，中间有中断窗口。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 254" role="img" aria-label="reload 平滑重载旧 worker 处理完再退出、restart 有中断窗口；何时必须 restart">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">reload 不丢连接，restart 有中断窗口 —— 生产优先 reload</text>

      <rect x="6" y="20" width="160" height="80" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">reload（平滑）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">校验配置 → 启新 worker</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">旧 worker 处理完存量再退</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">不中断连接、不丢请求</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-text)">耗时长连接不多时最安全</text>
      <text x="14" y="94" font-size="7" fill="var(--fig-node-c)">配置语法错误会直接拒绝</text>

      <rect x="174" y="20" width="160" height="80" rx="5" fill="#e5484d" opacity=".1" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="#e5484d">restart（重启）</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">停进程 → 再启动</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">有中断窗口（几百毫秒起）</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">所有连接被动断开</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-text)">长连接场景用户会感知</text>
      <text x="182" y="94" font-size="7" fill="#e5484d">仅在必须时用（如换监听端口）</text>

      <!-- 标准流程 -->
      <rect x="6" y="110" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="123" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">改配置的标准流程</text>
      <text x="14" y="136" font-size="7.5" fill="var(--fig-text)">① nginx -t 校验语法（不改线上任何东西）② 备份旧配置</text>
      <text x="14" y="148" font-size="7.5" fill="var(--fig-text)">③ nginx -s reload（或 systemctl reload nginx）④ 观察错误日志与状态码</text>

      <rect x="6" y="164" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="177" font-size="8" font-weight="700" fill="var(--fig-node-b)">什么时候必须 restart</text>
      <text x="14" y="190" font-size="7.5" fill="var(--fig-text)">改了监听端口/绑定地址、改了 worker 数相关的某些参数、升级二进制</text>

      <rect x="6" y="206" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="219" font-size="8" font-weight="700" fill="var(--fig-node-d)">reload 后配置「没生效」</text>
      <text x="14" y="231" font-size="7.5" fill="var(--fig-text)">多为改错了文件（include 有多份）、或被后加载的配置覆盖</text>

      <text x="6" y="244" font-size="7.5" fill="var(--fig-muted)">验证技巧：nginx -T 打印「最终合并后的配置」，确认你改的那份确实生效了</text>
    </svg>
    <figcaption>reload 启新 worker 等旧 worker 处理完再退（不丢连接），restart 有中断窗口；改配置先 nginx -t 再 reload</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
