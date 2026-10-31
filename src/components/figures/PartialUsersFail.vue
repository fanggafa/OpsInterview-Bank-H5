<script setup>
/**
 * 「部分用户访问不了，但服务器都正常」（题 1629）。
 *
 * 核心洞察：「部分」是最关键的线索 —— 说明不是全链路故障，
 * 而是某个维度不一致：特定节点/机房、特定运营商、特定地理区域、或粘性会话。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 256" role="img" aria-label="部分用户访问不了的排查：按用户维度切分，检查负载均衡节点一致性、会话粘性、DNS 与运营商差异">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">「部分」说明链路没全断 —— 去找「哪些人、走哪条路」的共同点</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">第一步：切分「不行的用户」</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">按地域/运营商/客户端版本/出口 IP 分组，找出共同特征</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-b)">① 负载均衡节点不一致</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">多台 LB 配置不同（某台漏了规则/证书旧/后端清单少）→ 只有落它上面的用户受影响</text>

      <rect x="6" y="96" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="109" font-size="8" font-weight="700" fill="var(--fig-node-c)">② 会话粘性 / 状态不均</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">源 IP 哈希把某些用户固定到一台有问题的后端（见 LVS sh 算法）</text>

      <rect x="6" y="134" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="147" font-size="8" font-weight="700" fill="var(--fig-node-d)">③ DNS / CDN 解析差异</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">不同地区解析到不同节点；某节点故障或缓存了旧记录</text>

      <rect x="6" y="172" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="185" font-size="8" font-weight="700" fill="var(--fig-node-a)">④ 网络路径 / 运营商问题</text>
      <text x="14" y="198" font-size="7.5" fill="var(--fig-text)">某些 ISP 到机房的链路丢包；用 mtr 从「用户侧」看才有意义</text>

      <rect x="6" y="214" width="328" height="20" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="228" font-size="7.5" fill="var(--fig-text)">关键手段：让受影响用户提供出口 IP + 时间，再对照 LB 访问日志</text>

      <text x="6" y="246" font-size="7.5" fill="var(--fig-muted)">反模式：只在服务器上查「服务是否正常」—— 全都正常，但某一台 LB 配置不对</text>
    </svg>
    <figcaption>「部分」要按地域/运营商/版本切分出共同点；常见是某台 LB 配置不一致、会话粘性落到坏后端、DNS 差异</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
