<script setup>
/**
 * GitOps 与传统 CI/CD 的区别（题 4812）。
 *
 * 核心洞察：传统是「流水线推送到集群」，GitOps 是「集群拉取 Git 的期望状态」——
 * 关键是「唯一真相源在 Git」与「持续调和（reconcile）」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 252" role="img" aria-label="传统 CI/CD 流水线推送、GitOps 由集群内控制器拉取 Git 期望状态并持续调和">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">方向相反：传统「推」，GitOps「拉」+ 持续调和</text>

      <rect x="6" y="20" width="160" height="84" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">传统 CI/CD（Push）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">流水线持有集群凭据</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">构建后 kubectl apply 推送</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">状态在集群里，流程在流水线</text>
      <text x="14" y="82" font-size="7.5" fill="#e5484d">集群凭据要暴露给流水线</text>
      <text x="14" y="94" font-size="7" fill="var(--fig-node-c)">漂移不会自动纠正</text>

      <rect x="174" y="20" width="160" height="84" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">GitOps（Pull）</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">Git 是唯一期望状态</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">集群内控制器定时拉取</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">发现差异自动调和</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-node-b)">凭据留在集群内（更安全）</text>
      <text x="182" y="94" font-size="7" fill="var(--fig-node-c)">手动改动会被「纠回」</text>

      <!-- 关键差别 -->
      <rect x="6" y="112" width="328" height="50" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="125" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">三个本质差别</text>
      <text x="14" y="138" font-size="7.5" fill="var(--fig-text)">① 凭据方向：不用把 kubeconfig 塞进 CI（减少泄露面）</text>
      <text x="14" y="150" font-size="7.5" fill="var(--fig-text)">② 漂移检测：集群自己和对账，手动改动会被覆盖</text>
      <text x="14" y="162" font-size="7.5" fill="var(--fig-text)">③ 回滚=改 Git：回退一个 commit 即回到该状态</text>

      <rect x="6" y="170" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="183" font-size="8" font-weight="700" fill="var(--fig-node-d)">常见工具</text>
      <text x="14" y="195" font-size="7.5" fill="var(--fig-text)">Argo CD / Flux（拉模式）· CI 仍负责构建镜像与更新 Git 中的镜像 tag</text>

      <rect x="6" y="210" width="328" height="20" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="224" font-size="7.5" fill="var(--fig-text)">注意：GitOps 管「部署期望态」，不替代 CI 的构建与测试</text>

      <text x="6" y="242" font-size="7.5" fill="var(--fig-muted)"> Secrets 别明文进 Git：用 SOPS/SealedSecrets 或外部密钥管理</text>
    </svg>
    <figcaption>传统是流水线持凭据推送、不纠漂移；GitOps 是集群内控制器拉 Git 并持续调和，回滚就是回退 commit</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
