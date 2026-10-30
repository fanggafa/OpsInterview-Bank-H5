<script setup>
/**
 * conntrack 表满的现象与调优（题 1205）。
 *
 * 核心洞察：conntrack 满时「新连接随机失败、已有连接正常」，
 * 这个特征很容易被误判成网络故障；排查要看 count/max 与 dmesg。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 272" role="img" aria-label="conntrack 表满：新连接被丢弃、已有连接正常，用 count/max 与 dmesg 排查，调大上限或缩短超时">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">满时「新连接失败、老连接正常」—— 最容易被误判成网络故障</text>

      <rect x="6" y="20" width="328" height="48" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="#e5484d">典型表现</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">新连接被丢弃（`nf_conntrack: table full, dropping packet`）</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">已建立的连接不受影响 → 「偶发连不上」而非「全部断」</text>

      <!-- 排查 -->
      <rect x="6" y="76" width="328" height="50" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="89" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">排查四步</text>
      <text x="14" y="102" font-size="7.5" fill="var(--fig-text)">cat /proc/sys/net/netfilter/nf_conntrack_count（当前）</text>
      <text x="14" y="114" font-size="7.5" fill="var(--fig-text)">cat .../nf_conntrack_max（上限）　·　conntrack -C（同 count）</text>

      <rect x="6" y="132" width="328" height="20" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="146" font-size="7.5" fill="var(--fig-node-c)">dmesg | grep -i \'conntrack|table full\' ← 决定性证据</text>

      <!-- 原因 -->
      <rect x="6" y="158" width="328" height="44" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="171" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">为什么会被占满</text>
      <text x="14" y="184" font-size="7.5" fill="var(--fig-text)">短连接过多 · NAT 场景每条都要跟踪 · 被扫描 · 超时太长不释放</text>

      <!-- 处置 -->
      <rect x="6" y="208" width="328" height="40" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="221" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">两层处置</text>
      <text x="14" y="234" font-size="7.5" fill="var(--fig-text)">临时：调大 nf_conntrack_max（每条约 300 字节，按内存算）</text>

      <text x="6" y="262" font-size="7.5" fill="var(--fig-muted)">根治：减少短连接（连接池/长连接）· 缩短 established 超时 · 上 WAF 挡扫描</text>
    </svg>
    <figcaption>conntrack 满时新连接随机失败、老连接照常；先看 count/max 与 dmesg，再调上限、缩短超时、减少短连接</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
