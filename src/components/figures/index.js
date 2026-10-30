/**
 * 插图注册表：把答案里的 [[图:id]] 映射到内联 SVG 组件。
 *
 * 为什么用内联 SVG 而不是图片文件：
 * - 零额外请求、可离线、随主题自动变色（用 currentColor 与 --fig-* 变量）
 * - 不引入 v-html，标记只认白名单 id，避免 XSS
 *
 * 新增插图：在 figures/ 下加一个 .vue 组件，然后在此登记一行。
 * 注意：id 一经使用就不要改名（题库里的 [[图:id]] 会失效），
 *       tests/figures.test.js 会校验「所有引用的 id 都已注册」。
 */
import WaitNotComputeTree from './WaitNotComputeTree.vue'
import HalfUsersDimensions from './HalfUsersDimensions.vue'
import DualActivePhases from './DualActivePhases.vue'
import HourlySpikeTriage from './HourlySpikeTriage.vue'
import IntermittentIssueStrategy from './IntermittentIssueStrategy.vue'
import RedisTimeoutPaths from './RedisTimeoutPaths.vue'
import MidnightCpuSurge from './MidnightCpuSurge.vue'
import ReplicationLagTriage from './ReplicationLagTriage.vue'
import FixedTimeSlowness from './FixedTimeSlowness.vue'
import MultiRegionLayers from './MultiRegionLayers.vue'
import ConfigDriftDecision from './ConfigDriftDecision.vue'
import CodeVsEnvBisect from './CodeVsEnvBisect.vue'
import MemoryGrowthDecision from './MemoryGrowthDecision.vue'
import RestartTriggers from './RestartTriggers.vue'
import DiskFullSafeTriage from './DiskFullSafeTriage.vue'
import MicroserviceObservability from './MicroserviceObservability.vue'
import AlertFatigueTriage from './AlertFatigueTriage.vue'
import MonitorBlindSpots from './MonitorBlindSpots.vue'
import EnvParityGap from './EnvParityGap.vue'
import ZombieVsOrphan from './ZombieVsOrphan.vue'
import InodeVsBlock from './InodeVsBlock.vue'
import NicePriorityLevels from './NicePriorityLevels.vue'
import FlowVsCongestion from './FlowVsCongestion.vue'
import HttpCodeTriage from './HttpCodeTriage.vue'
import CurlLayers from './CurlLayers.vue'
import ObjectVsFileSystem from './ObjectVsFileSystem.vue'
import LiveMigrationPhases from './LiveMigrationPhases.vue'
import MqComparison from './MqComparison.vue'
import KafkaIsrMechanism from './KafkaIsrMechanism.vue'
import EsThreadPoolTriage from './EsThreadPoolTriage.vue'
import PrometheusScaling from './PrometheusScaling.vue'
import MongoOplogFlow from './MongoOplogFlow.vue'
import WiredTigerMechanisms from './WiredTigerMechanisms.vue'
import RedisMemoryMetrics from './RedisMemoryMetrics.vue'
import RedisFailoverTriage from './RedisFailoverTriage.vue'
import K8sWorkloadTypes from './K8sWorkloadTypes.vue'
import K8sNotReadyLayers from './K8sNotReadyLayers.vue'
import CiPipelineStages from './CiPipelineStages.vue'
import TestPyramid from './TestPyramid.vue'
import GitBranchStrategies from './GitBranchStrategies.vue'
import RolloutStrategies from './RolloutStrategies.vue'
import PipelineExitCode from './PipelineExitCode.vue'
import XargsSafeUsage from './XargsSafeUsage.vue'
import HardeningChecklist from './HardeningChecklist.vue'
import IncidentResponseOrder from './IncidentResponseOrder.vue'
import IptablesPolicyVsRule from './IptablesPolicyVsRule.vue'
import LvsForwardModes from './LvsForwardModes.vue'
import TerraformVsAnsible from './TerraformVsAnsible.vue'
import MysqlIsolationLevels from './MysqlIsolationLevels.vue'
import RdsHaComparison from './RdsHaComparison.vue'
import JvmOomTypes from './JvmOomTypes.vue'
import MergeVsRebase from './MergeVsRebase.vue'
import GitlabComponents from './GitlabComponents.vue'
import EsQueryVsFilter from './EsQueryVsFilter.vue'
import VmDiskFormats from './VmDiskFormats.vue'
import NginxVsApacheModel from './NginxVsApacheModel.vue'
import TimeWaitReason from './TimeWaitReason.vue'
import UrlToRender from './UrlToRender.vue'
import RedisArchEvolution from './RedisArchEvolution.vue'
import K8sProbes from './K8sProbes.vue'
import K8sServiceTypes from './K8sServiceTypes.vue'
import CrashLoopTriage from './CrashLoopTriage.vue'
import PrometheusMetricTypes from './PrometheusMetricTypes.vue'
import NginxTimingSplit from './NginxTimingSplit.vue'
import BPlusTreeReason from './BPlusTreeReason.vue'
import LeftmostPrefix from './LeftmostPrefix.vue'
import ExplainFields from './ExplainFields.vue'
import K8sResourcesQos from './K8sResourcesQos.vue'
import LvsThreeLayers from './LvsThreeLayers.vue'
import VpcLayers from './VpcLayers.vue'
import EsShardDesign from './EsShardDesign.vue'
import DnsFailureLayers from './DnsFailureLayers.vue'
import DnsNdotsSearch from './DnsNdotsSearch.vue'
import MultiARecords from './MultiARecords.vue'
import ConntrackFull from './ConntrackFull.vue'
import FirewalldVsIptables from './FirewalldVsIptables.vue'
import TomcatRequestFlow from './TomcatRequestFlow.vue'
import Cpu100Locate from './Cpu100Locate.vue'
import AnsibleVarPriority from './AnsibleVarPriority.vue'
import ShellQuotes from './ShellQuotes.vue'
import LeastPrivilegeLayers from './LeastPrivilegeLayers.vue'
import TlsCertLifecycle from './TlsCertLifecycle.vue'
import RsyncIncremental from './RsyncIncremental.vue'
import CephComponents from './CephComponents.vue'
import KvmVsXenVmware from './KvmVsXenVmware.vue'
import LvsScheduling from './LvsScheduling.vue'
import GitStash from './GitStash.vue'
import TcpdumpConnectFail from './TcpdumpConnectFail.vue'
import RateVsIrate from './RateVsIrate.vue'
import ObservabilityPillars from './ObservabilityPillars.vue'
import MongoEsrPrinciple from './MongoEsrPrinciple.vue'
import MongoDeployModes from './MongoDeployModes.vue'
import SloErrorBudget from './SloErrorBudget.vue'
import OncallResponseFlow from './OncallResponseFlow.vue'
import TcpVsUdp from './TcpVsUdp.vue'
import HttpsTlsHandshake from './HttpsTlsHandshake.vue'
import HttpCacheLevels from './HttpCacheLevels.vue'
import CdnPrinciples from './CdnPrinciples.vue'
import KeepaliveVsHeartbeat from './KeepaliveVsHeartbeat.vue'
import SsVsNetstat from './SsVsNetstat.vue'
import TracerouteVsMtr from './TracerouteVsMtr.vue'
import CrossDcNetwork from './CrossDcNetwork.vue'
import PingFailTriage from './PingFailTriage.vue'
import DnsResolve from './DnsResolve.vue'
import DnsRecordTypes from './DnsRecordTypes.vue'
import IptablesChainFlow from './IptablesChainFlow.vue'
import NginxLocationMatch from './NginxLocationMatch.vue'
import NginxProxyPass from './NginxProxyPass.vue'
import RaidLevels from './RaidLevels.vue'
import Backup321 from './Backup321.vue'
import MysqlReplicationFlow from './MysqlReplicationFlow.vue'
import EsShardReplica from './EsShardReplica.vue'
import MultiAzArch from './MultiAzArch.vue'
import K8sRollingUpdate from './K8sRollingUpdate.vue'
import TcpHandshake from './TcpHandshake.vue'
import LvsModes from './LvsModes.vue'
import RedisPersistence from './RedisPersistence.vue'
import MonitorLayers from './MonitorLayers.vue'
import ContainerVsVm from './ContainerVsVm.vue'
import CpuBottleneckTree from './CpuBottleneckTree.vue'
import JvmMemoryAreas from './JvmMemoryAreas.vue'
import MqDelivery from './MqDelivery.vue'
import MongoReplicaShard from './MongoReplicaShard.vue'
import DeployStrategies from './DeployStrategies.vue'
import GitAreas from './GitAreas.vue'
import ShellSafety from './ShellSafety.vue'
import BastionAccess from './BastionAccess.vue'
import AutomationFlow from './AutomationFlow.vue'
import VmCpuOvercommit from './VmCpuOvercommit.vue'
import IncidentFlow from './IncidentFlow.vue'
import SlowServiceLayers from './SlowServiceLayers.vue'
import DeployIncidentTriage from './DeployIncidentTriage.vue'
import HttpStatusGroups from './HttpStatusGroups.vue'
import MysqlIndexLookup from './MysqlIndexLookup.vue'
import DockerLayers from './DockerLayers.vue'
import CacheProblems from './CacheProblems.vue'
import AlertFunnel from './AlertFunnel.vue'

/** @type {Record<string, object>} */
export const FIGURES = {
  'dns-resolve': DnsResolve,
  'dns-record-types': DnsRecordTypes,
  'iptables-chain-flow': IptablesChainFlow,
  'nginx-location-match': NginxLocationMatch,
  'nginx-proxy-pass': NginxProxyPass,
  'raid-levels': RaidLevels,
  'backup-321': Backup321,
  'mysql-replication-flow': MysqlReplicationFlow,
  'es-shard-replica': EsShardReplica,
  'multi-az-arch': MultiAzArch,
  'k8s-rolling-update': K8sRollingUpdate,
  'tcp-handshake': TcpHandshake,
  'lvs-modes': LvsModes,
  'redis-persistence': RedisPersistence,
  'monitor-layers': MonitorLayers,
  'container-vs-vm': ContainerVsVm,
  'cpu-bottleneck-tree': CpuBottleneckTree,
  'jvm-memory-areas': JvmMemoryAreas,
  'mq-delivery': MqDelivery,
  'mongo-replica-shard': MongoReplicaShard,
  'deploy-strategies': DeployStrategies,
  'git-areas': GitAreas,
  'shell-safety': ShellSafety,
  'bastion-access': BastionAccess,
  'automation-flow': AutomationFlow,
  'vm-cpu-overcommit': VmCpuOvercommit,
  'incident-flow': IncidentFlow,
  'slow-service-layers': SlowServiceLayers,
  'deploy-incident-triage': DeployIncidentTriage,
  'http-status-groups': HttpStatusGroups,
  'mysql-index-lookup': MysqlIndexLookup,
  'docker-layers': DockerLayers,
  'cache-problems': CacheProblems,
  'alert-funnel': AlertFunnel,
  'wait-not-compute-tree': WaitNotComputeTree,
  'half-users-dimensions': HalfUsersDimensions,
  'dual-active-phases': DualActivePhases,
  'hourly-spike-triage': HourlySpikeTriage,
  'intermittent-issue-strategy': IntermittentIssueStrategy,
  'redis-timeout-paths': RedisTimeoutPaths,
  'midnight-cpu-surge': MidnightCpuSurge,
  'replication-lag-triage': ReplicationLagTriage,
  'fixed-time-slowness': FixedTimeSlowness,
  'multi-region-layers': MultiRegionLayers,
  'config-drift-decision': ConfigDriftDecision,
  'code-vs-env-bisect': CodeVsEnvBisect,
  'memory-growth-decision': MemoryGrowthDecision,
  'restart-triggers': RestartTriggers,
  'disk-full-safe-triage': DiskFullSafeTriage,
  'microservice-observability': MicroserviceObservability,
  'alert-fatigue-triage': AlertFatigueTriage,
  'monitor-blind-spots': MonitorBlindSpots,
  'env-parity-gap': EnvParityGap,
  'zombie-vs-orphan': ZombieVsOrphan,
  'inode-vs-block': InodeVsBlock,
  'nice-priority-levels': NicePriorityLevels,
  'flow-vs-congestion': FlowVsCongestion,
  'http-code-triage': HttpCodeTriage,
  'curl-layers': CurlLayers,
  'object-vs-filesystem': ObjectVsFileSystem,
  'live-migration-phases': LiveMigrationPhases,
  'mq-comparison': MqComparison,
  'kafka-isr-mechanism': KafkaIsrMechanism,
  'es-thread-pool-triage': EsThreadPoolTriage,
  'prometheus-scaling': PrometheusScaling,
  'mongo-oplog-flow': MongoOplogFlow,
  'wired-tiger-mechanisms': WiredTigerMechanisms,
  'redis-memory-metrics': RedisMemoryMetrics,
  'redis-failover-triage': RedisFailoverTriage,
  'k8s-workload-types': K8sWorkloadTypes,
  'k8s-not-ready-layers': K8sNotReadyLayers,
  'ci-pipeline-stages': CiPipelineStages,
  'test-pyramid': TestPyramid,
  'git-branch-strategies': GitBranchStrategies,
  'rollout-strategies': RolloutStrategies,
  'pipeline-exit-code': PipelineExitCode,
  'xargs-safe-usage': XargsSafeUsage,
  'hardening-checklist': HardeningChecklist,
  'incident-response-order': IncidentResponseOrder,
  'iptables-policy-vs-rule': IptablesPolicyVsRule,
  'lvs-forward-modes': LvsForwardModes,
  'terraform-vs-ansible': TerraformVsAnsible,
  'mysql-isolation-levels': MysqlIsolationLevels,
  'rds-ha-comparison': RdsHaComparison,
  'jvm-oom-types': JvmOomTypes,
  'merge-vs-rebase': MergeVsRebase,
  'gitlab-components': GitlabComponents,
  'es-query-vs-filter': EsQueryVsFilter,
  'vm-disk-formats': VmDiskFormats,
  'nginx-vs-apache-model': NginxVsApacheModel,
  'time-wait-reason': TimeWaitReason,
  'url-to-render': UrlToRender,
  'redis-arch-evolution': RedisArchEvolution,
  'k8s-probes': K8sProbes,
  'k8s-service-types': K8sServiceTypes,
  'crash-loop-triage': CrashLoopTriage,
  'prometheus-metric-types': PrometheusMetricTypes,
  'nginx-timing-split': NginxTimingSplit,
  'b-plus-tree-reason': BPlusTreeReason,
  'leftmost-prefix': LeftmostPrefix,
  'explain-fields': ExplainFields,
  'k8s-resources-qos': K8sResourcesQos,
  'lvs-three-layers': LvsThreeLayers,
  'vpc-layers': VpcLayers,
  'es-shard-design': EsShardDesign,
  'dns-failure-layers': DnsFailureLayers,
  'dns-ndots-search': DnsNdotsSearch,
  'multi-a-records': MultiARecords,
  'conntrack-full': ConntrackFull,
  'firewalld-vs-iptables': FirewalldVsIptables,
  'tomcat-request-flow': TomcatRequestFlow,
  'cpu-100-locate': Cpu100Locate,
  'ansible-var-priority': AnsibleVarPriority,
  'shell-quotes': ShellQuotes,
  'least-privilege-layers': LeastPrivilegeLayers,
  'tls-cert-lifecycle': TlsCertLifecycle,
  'rsync-incremental': RsyncIncremental,
  'ceph-components': CephComponents,
  'kvm-vs-xen-vmware': KvmVsXenVmware,
  'lvs-scheduling': LvsScheduling,
  'git-stash': GitStash,
  'tcpdump-connect-fail': TcpdumpConnectFail,
  'rate-vs-irate': RateVsIrate,
  'observability-pillars': ObservabilityPillars,
  'mongo-esr-principle': MongoEsrPrinciple,
  'mongo-deploy-modes': MongoDeployModes,
  'slo-error-budget': SloErrorBudget,
  'oncall-response-flow': OncallResponseFlow,
  'tcp-vs-udp': TcpVsUdp,
  'https-tls-handshake': HttpsTlsHandshake,
  'http-cache-levels': HttpCacheLevels,
  'cdn-principles': CdnPrinciples,
  'keepalive-vs-heartbeat': KeepaliveVsHeartbeat,
  'ss-vs-netstat': SsVsNetstat,
  'traceroute-vs-mtr': TracerouteVsMtr,
  'cross-dc-network': CrossDcNetwork,
  'ping-fail-triage': PingFailTriage,
}

/**
 * 按 id 取组件。
 * @param {string} id
 * @returns {object|null}
 */
export function getFigure(id) {
  return FIGURES[id] || null
}
