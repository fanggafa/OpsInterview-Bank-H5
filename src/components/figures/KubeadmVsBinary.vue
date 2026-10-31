<script setup>
/**
 * 二进制安装与 kubeadm 的差别（题 4735）。
 *
 * 核心洞察：差别不在「装得快不快」，而在「控制面跑在哪」——
 * kubeadm 的控制面是静态 Pod（在容器里），二进制的是宿主机 systemd 服务。
 * 这直接决定排查方式。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 244" role="img" aria-label="kubeadm 控制面是静态 Pod 跑在容器里，二进制是 systemd 服务；排查方式不同">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">关键差别：控制面跑在「容器里」还是「宿主机上」</text>

      <rect x="6" y="20" width="160" height="76" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">kubeadm</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">控制面 = 静态 Pod（容器）</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">装得快、社区标准</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">证书自动生成与轮换</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-text)">升级走 kubeadm upgrade</text>
      <text x="14" y="94" font-size="7" fill="var(--fig-node-c)">排查用 crictl 而非 journalctl -u</text>

      <rect x="174" y="20" width="160" height="76" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">二进制</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">控制面 = systemd 服务</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">手工配置，完全可控</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">参数随意调、适配特殊环境</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-text)">升级要手工替换二进制</text>
      <text x="182" y="94" font-size="7" fill="var(--fig-node-c)">排查用 journalctl -u</text>

      <!-- 排查差异 -->
      <rect x="6" y="106" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="119" font-size="8.5" font-weight="700" fill="#e5484d">这个差别直接决定你怎么查问题</text>
      <text x="14" y="132" font-size="7.5" fill="var(--fig-text)">kubeadm 集群 apiserver 起不来 → crictl ps / crictl logs 看静态 Pod</text>
      <text x="14" y="144" font-size="7.5" fill="var(--fig-text)">二进制集群 → systemctl status kube-apiserver / journalctl -u kube-apiserver</text>

      <!-- 选型 -->
      <rect x="6" y="160" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="173" font-size="8" font-weight="700" fill="var(--fig-node-c)">选型建议</text>
      <text x="14" y="185" font-size="7.5" fill="var(--fig-text)">优先 kubeadm；需要深度定制/离线/信创时才用二进制</text>

      <rect x="6" y="198" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="211" font-size="8" font-weight="700" fill="var(--fig-node-d)">常见误区</text>
      <text x="14" y="223" font-size="7.5" fill="var(--fig-text)">「二进制更稳定」不成立 —— kubeadm 的默认配置经过大量验证</text>

      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">很多企业的路径是「kubeadm 起步 + 逐步替换个别组件」</text>
    </svg>
    <figcaption>kubeadm 控制面是静态 Pod（用 crictl 排查）、二进制是 systemd 服务（用 journalctl）；差别在可控性与排查方式</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
