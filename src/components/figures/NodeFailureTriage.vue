<script setup>
/**
 * 节点宕机的原因与排查（题 4754）。
 *
 * 核心洞察：多数「节点宕机」其实是磁盘满或 kubelet 崩溃，不是硬件问题；
 * 先分清「OS 真的挂了」还是「节点还在但 NotReady」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 248" role="img" aria-label="节点宕机排查：先分清 OS 不可用与 NotReady，两类各有原因">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">先分清：OS 真的挂了，还是节点在但 NotReady</text>

      <rect x="6" y="20" width="328" height="54" rx="5" fill="#e5484d" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="#e5484d">① OS 不可用（连不上机器）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">硬件故障（内存条/磁盘/电源）· 内核 panic（OOM 导致）</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">磁盘满 / inode 耗尽（也会「像宕机」）· 网络中断 · 系统 hang</text>
      <text x="14" y="70" font-size="7" fill="var(--fig-node-c)">取证：IPMI/带外日志、dmesg -T、journalctl -k</text>

      <rect x="6" y="78" width="328" height="54" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="91" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② 机器在，但 K8s 认为 NotReady</text>
      <text x="14" y="104" font-size="7.5" fill="var(--fig-text)">kubelet 挂了 · containerd 异常 · 节点资源 Pressure</text>
      <text x="14" y="116" font-size="7.5" fill="var(--fig-text)">与 apiserver 网络不通 · kubelet 证书过期</text>
      <text x="14" y="128" font-size="7" fill="var(--fig-node-c)">取证：systemctl status kubelet、journalctl -u kubelet、crictl ps</text>

      <!-- 排查顺序 -->
      <rect x="6" y="136" width="328" height="48" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="149" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">排查顺序（从节点自身往外）</text>
      <text x="14" y="162" font-size="7.5" fill="var(--fig-text)">① 能否 SSH/带外登录 ② 系统层：dmesg、df -h、df -i、free -h</text>
      <text x="14" y="174" font-size="7.5" fill="var(--fig-text)">③ 服务层：kubelet/containerd ④ K8s 视角 describe node 的 Conditions</text>

      <rect x="6" y="188" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="201" font-size="8" font-weight="700" fill="var(--fig-node-d)">恢复后要确认</text>
      <text x="14" y="213" font-size="7.5" fill="var(--fig-text)">原 Pod 是否已重建到其他节点、DaemonSet 是否重新覆盖、是否需要再平衡</text>

      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">高频真相：多数「宕机」是磁盘满或 kubelet 崩溃，先查这两个最快定论</text>
    </svg>
    <figcaption>分两类：OS 不可用（硬件/panic/磁盘满/网络）与机器在但 NotReady（kubelet/containerd/压力/证书）；先查磁盘与 kubelet</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
