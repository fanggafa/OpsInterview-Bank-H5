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
import BackupVsDr from './BackupVsDr.vue'
import BackupDesignElements from './BackupDesignElements.vue'
import StorageActiveActive from './StorageActiveActive.vue'
import HotColdTiering from './HotColdTiering.vue'
import EsIlmStages from './EsIlmStages.vue'
import LokiVsElk from './LokiVsElk.vue'
import EsOomTriage from './EsOomTriage.vue'
import LogTraceCorrelation from './LogTraceCorrelation.vue'
import ShellOperators from './ShellOperators.vue'
import BackgroundRunModes from './BackgroundRunModes.vue'
import ShellTestSytax from './ShellTestSytax.vue'
import FindExecVsXargs from './FindExecVsXargs.vue'
import ZeroTrustVsPerimeter from './ZeroTrustVsPerimeter.vue'
import KubeProxyModes from './KubeProxyModes.vue'
import NodeMaintenanceFlow from './NodeMaintenanceFlow.vue'
import PodEvictedTriage from './PodEvictedTriage.vue'
import ConfigMapVsSecret from './ConfigMapVsSecret.vue'
import MqBacklogTriage from './MqBacklogTriage.vue'
import MqOrderingGuarantee from './MqOrderingGuarantee.vue'
import MqBroadcastVsCluster from './MqBroadcastVsCluster.vue'
import KafkaPartitionPlanning from './KafkaPartitionPlanning.vue'
import CloudServiceModels from './CloudServiceModels.vue'
import SlbVsAlb from './SlbVsAlb.vue'
import CrossVpcConnect from './CrossVpcConnect.vue'
import CloudLatencyTriage from './CloudLatencyTriage.vue'
import MetricCardinality from './MetricCardinality.vue'
import P99SpikeTriage from './P99SpikeTriage.vue'
import K8sMetricsSources from './K8sMetricsSources.vue'
import PrometheusStorage from './PrometheusStorage.vue'
import ProcessStates from './ProcessStates.vue'
import BootFlow from './BootFlow.vue'
import Signals from './Signals.vue'
import SelinuxModes from './SelinuxModes.vue'
import AuditReplay from './AuditReplay.vue'
import SuspiciousAccountTriage from './SuspiciousAccountTriage.vue'
import SecretManagement from './SecretManagement.vue'
import SqlInjection from './SqlInjection.vue'
import PythonGil from './PythonGil.vue'
import PythonConcurrency from './PythonConcurrency.vue'
import PythonMemoryLeak from './PythonMemoryLeak.vue'
import PythonTriage from './PythonTriage.vue'
import ArchExplaining from './ArchExplaining.vue'
import ConfigABDifference from './ConfigABDifference.vue'
import K8sMigrationPlan from './K8sMigrationPlan.vue'
import HaRefactorLayers from './HaRefactorLayers.vue'
import MongoMemoryTriage from './MongoMemoryTriage.vue'
import MongoReadConcern from './MongoReadConcern.vue'
import MongoNotWritable from './MongoNotWritable.vue'
import MongoChunkMigrate from './MongoChunkMigrate.vue'
import VmIoPerformance from './VmIoPerformance.vue'
import VmNetwork from './VmNetwork.vue'
import VmHostSlow from './VmHostSlow.vue'
import VmThrottle from './VmThrottle.vue'
import ConfigCenterVsAnsible from './ConfigCenterVsAnsible.vue'
import AutomationArchitecture from './AutomationArchitecture.vue'
import AnsibleCopyVsTemplate from './AnsibleCopyVsTemplate.vue'
import AnsibleImportVsInclude from './AnsibleImportVsInclude.vue'
import Nginx502504 from './Nginx502504.vue'
import NginxReloadRestart from './NginxReloadRestart.vue'
import NginxRootAlias from './NginxRootAlias.vue'
import NginxStreamVsHttp from './NginxStreamVsHttp.vue'
import IptablesDropReject from './IptablesDropReject.vue'
import IptablesOrder from './IptablesOrder.vue'
import SecGroupVsIptables from './SecGroupVsIptables.vue'
import K8sNodeIptables from './K8sNodeIptables.vue'
import LvsResponseIssue from './LvsResponseIssue.vue'
import LvsRealIp from './LvsRealIp.vue'
import LvsActiveStandby from './LvsActiveStandby.vue'
import PartialUsersFail from './PartialUsersFail.vue'
import LogicalVsPhysicalBackup from './LogicalVsPhysicalBackup.vue'
import SnapshotVsClone from './SnapshotVsClone.vue'
import IscsiVsNfs from './IscsiVsNfs.vue'
import ArchiveVsBackup from './ArchiveVsBackup.vue'
import LogHistoryMissing from './LogHistoryMissing.vue'
import EsIndexPlanning from './EsIndexPlanning.vue'
import LogAlertOptions from './LogAlertOptions.vue'
import LogPlatformDesign from './LogPlatformDesign.vue'
import CmsVsG1 from './CmsVsG1.vue'
import JvmMemoryLeakTriage from './JvmMemoryLeakTriage.vue'
import JvmToolsMap from './JvmToolsMap.vue'
import TomcatSlowStart from './TomcatSlowStart.vue'
import GitopsVsCicd from './GitopsVsCicd.vue'
import TestLayersPipeline from './TestLayersPipeline.vue'
import ArtifactRegistryPlan from './ArtifactRegistryPlan.vue'
import ZeroDowntimeUpgrade from './ZeroDowntimeUpgrade.vue'
import Utf8VsUtf8mb4 from './Utf8VsUtf8mb4.vue'
import MysqlReplLag from './MysqlReplLag.vue'
import SlowSqlTriage from './SlowSqlTriage.vue'
import ZsetStructure from './ZsetStructure.vue'
import ExpireVsEviction from './ExpireVsEviction.vue'
import RedisPerfTriage from './RedisPerfTriage.vue'
import ConnStateTriage from './ConnStateTriage.vue'
import LimitLayers from './LimitLayers.vue'
import LogrotateFlow from './LogrotateFlow.vue'
import SystemdFailure from './SystemdFailure.vue'
import ShellFileLock from './ShellFileLock.vue'
import ShellDialects from './ShellDialects.vue'
import PositionalParams from './PositionalParams.vue'
import GrepSedAwk from './GrepSedAwk.vue'
import RabbitAlarm from './RabbitAlarm.vue'
import KafkaLeaderElection from './KafkaLeaderElection.vue'
import MqCapacityPlanning from './MqCapacityPlanning.vue'
import GitCloneSlow from './GitCloneSlow.vue'
import GitlabCiStructure from './GitlabCiStructure.vue'
import SubmoduleVsSubtree from './SubmoduleVsSubtree.vue'
import PreventAccidentalDelete from './PreventAccidentalDelete.vue'
import ReadReplicaAndHa from './ReadReplicaAndHa.vue'
import DrTiers from './DrTiers.vue'
import TracingConcepts from './TracingConcepts.vue'
import CapacityPlanning from './CapacityPlanning.vue'
import MonitorTriagePath from './MonitorTriagePath.vue'
import DnsRecursiveIterative from './DnsRecursiveIterative.vue'
import DnsServerFaults from './DnsServerFaults.vue'
import NginxChangeFlow from './NginxChangeFlow.vue'
import NginxAccessLog from './NginxAccessLog.vue'
import MongoVsMysql from './MongoVsMysql.vue'
import PythonDeps from './PythonDeps.vue'
import PythonContainers from './PythonContainers.vue'
import CrossDcSync from './CrossDcSync.vue'
import AnsibleUnreachable from './AnsibleUnreachable.vue'
import CronjobVsJob from './CronjobVsJob.vue'
import SingleDomainSlow from './SingleDomainSlow.vue'
import VirtualizationPlan from './VirtualizationPlan.vue'
import MongoReplSetSetup from './MongoReplSetSetup.vue'
import DataLifecycle from './DataLifecycle.vue'
import VirtualizationCapacity from './VirtualizationCapacity.vue'
import KibanaErrorSpike from './KibanaErrorSpike.vue'
import OpsDevVsOps from './OpsDevVsOps.vue'
import DnsResolutionChain from './DnsResolutionChain.vue'
import CopyVsAdd from './CopyVsAdd.vue'
import CpuSpikeIncident from './CpuSpikeIncident.vue'
import CloudMigrationPlan from './CloudMigrationPlan.vue'
import ArchEvolutionPlan from './ArchEvolutionPlan.vue'
import PromotionLoadTest from './PromotionLoadTest.vue'
import K8sWorkflow from './K8sWorkflow.vue'
import PodCreateFlow from './PodCreateFlow.vue'
import PodDeleteFlow from './PodDeleteFlow.vue'
import K8sComponentHa from './K8sComponentHa.vue'
import PodTypes from './PodTypes.vue'
import KubeadmVsBinary from './KubeadmVsBinary.vue'
import SentinelVsCluster from './SentinelVsCluster.vue'
import RedisSlot from './RedisSlot.vue'
import RabbitMessageLoss from './RabbitMessageLoss.vue'
import UndeletePrinciple from './UndeletePrinciple.vue'
import RestartPolicy from './RestartPolicy.vue'
import ImagePullPolicy from './ImagePullPolicy.vue'
import PvPvc from './PvPvc.vue'
import DaemonsetTraits from './DaemonsetTraits.vue'
import FlannelModes from './FlannelModes.vue'
import K8sInstallSteps from './K8sInstallSteps.vue'
import DeploymentYaml from './DeploymentYaml.vue'
import PodNetworkTriage from './PodNetworkTriage.vue'
import PodTriageSteps from './PodTriageSteps.vue'
import NodeFailureTriage from './NodeFailureTriage.vue'
import ServiceTypes from './ServiceTypes.vue'
import KubeProxyMechanism from './KubeProxyMechanism.vue'
import StatefulsetDeploy from './StatefulsetDeploy.vue'
import AffinityTypes from './AffinityTypes.vue'
import AutoRecoveryLayers from './AutoRecoveryLayers.vue'
import NetworkPolicyMechanism from './NetworkPolicyMechanism.vue'
import CanaryMethods from './CanaryMethods.vue'
import EtcdCommands from './EtcdCommands.vue'
import DockerImageOptimize from './DockerImageOptimize.vue'
import DockerSecrets from './DockerSecrets.vue'
import K8sComponents from './K8sComponents.vue'
import DeploymentCreate from './DeploymentCreate.vue'
import RollingUpdate from './RollingUpdate.vue'
import ApiserverHa from './ApiserverHa.vue'
import PvLifecycle from './PvLifecycle.vue'
import FlannelVsCalico from './FlannelVsCalico.vue'
import PodSchedulingMethods from './PodSchedulingMethods.vue'
import FiveXxTriage from './FiveXxTriage.vue'
import HpaMechanism from './HpaMechanism.vue'
import DockerMonitoring from './DockerMonitoring.vue'
import RedisDataTypes from './RedisDataTypes.vue'
import DfVsLsblk from './DfVsLsblk.vue'
import KafkaPartitionConsumer from './KafkaPartitionConsumer.vue'
import PythonConcurrencyModes from './PythonConcurrencyModes.vue'
import K8sSecurityLayers from './K8sSecurityLayers.vue'
import LlmVsMl from './LlmVsMl.vue'
import TokenBilling from './TokenBilling.vue'
import RagPipeline from './RagPipeline.vue'
import AgentLoop from './AgentLoop.vue'
import HallucinationMitigation from './HallucinationMitigation.vue'
import PromptPrinciples from './PromptPrinciples.vue'
import TemperatureEffect from './TemperatureEffect.vue'
import ContextWindowLimits from './ContextWindowLimits.vue'
import FinetuneVsRag from './FinetuneVsRag.vue'
import SftVsRlhf from './SftVsRlhf.vue'
import LoraStructure from './LoraStructure.vue'
import VectorEmbedding from './VectorEmbedding.vue'
import TokenCostBreakdown from './TokenCostBreakdown.vue'
import PromptInjectionDefense from './PromptInjectionDefense.vue'
import DataMaskingFlow from './DataMaskingFlow.vue'
import AiGatewayRoles from './AiGatewayRoles.vue'
import AiDataSecurityLayers from './AiDataSecurityLayers.vue'
import LlmObservabilityGap from './LlmObservabilityGap.vue'
import LogAiAnalysisFlow from './LogAiAnalysisFlow.vue'
import AiSlowTriage from './AiSlowTriage.vue'
import LlmApiMonitoring from './LlmApiMonitoring.vue'
import VllmArchitecture from './VllmArchitecture.vue'
import VramComposition from './VramComposition.vue'
import GpuVsCpu from './GpuVsCpu.vue'
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
import LinuxBootFlow from './LinuxBootFlow.vue'
import SudoPrivilege from './SudoPrivilege.vue'
import AnsibleAgentless from './AnsibleAgentless.vue'
import LinkInode from './LinkInode.vue'
import OsiSevenLayers from './OsiSevenLayers.vue'
import TcpipVsOsi from './TcpipVsOsi.vue'
import NatWorkflow from './NatWorkflow.vue'
import TcpStateMachine from './TcpStateMachine.vue'
import KafkaArchitecture from './KafkaArchitecture.vue'
import RabbitmqArchitecture from './RabbitmqArchitecture.vue'
import KafkaComponents from './KafkaComponents.vue'
import KafkaOrdering from './KafkaOrdering.vue'
import HaArchitecture from './HaArchitecture.vue'
import EventualConsistency from './EventualConsistency.vue'
import DistributedLock from './DistributedLock.vue'
import MultiactiveMultiRegion from './MultiactiveMultiRegion.vue'
import LogTraceSystem from './LogTraceSystem.vue'
import DbFailover from './DbFailover.vue'
import DbChangeSafety from './DbChangeSafety.vue'
import HealthCheckDesign from './HealthCheckDesign.vue'
import NginxModules from './NginxModules.vue'
import LvsThreeModes from './LvsThreeModes.vue'
import RedisReplication from './RedisReplication.vue'

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
  'backup-vs-dr': BackupVsDr,
  'backup-design-elements': BackupDesignElements,
  'storage-active-active': StorageActiveActive,
  'hot-cold-tiering': HotColdTiering,
  'es-ilm-stages': EsIlmStages,
  'loki-vs-elk': LokiVsElk,
  'es-oom-triage': EsOomTriage,
  'log-trace-correlation': LogTraceCorrelation,
  'shell-operators': ShellOperators,
  'background-run-modes': BackgroundRunModes,
  'shell-test-syntax': ShellTestSytax,
  'find-exec-vs-xargs': FindExecVsXargs,
  'zero-trust-vs-perimeter': ZeroTrustVsPerimeter,
  'kube-proxy-modes': KubeProxyModes,
  'node-maintenance-flow': NodeMaintenanceFlow,
  'pod-evicted-triage': PodEvictedTriage,
  'configmap-vs-secret': ConfigMapVsSecret,
  'mq-backlog-triage': MqBacklogTriage,
  'mq-ordering-guarantee': MqOrderingGuarantee,
  'mq-broadcast-vs-cluster': MqBroadcastVsCluster,
  'kafka-partition-planning': KafkaPartitionPlanning,
  'cloud-service-models': CloudServiceModels,
  'slb-vs-alb': SlbVsAlb,
  'cross-vpc-connect': CrossVpcConnect,
  'cloud-latency-triage': CloudLatencyTriage,
  'metric-cardinality': MetricCardinality,
  'process-states': ProcessStates,
  'boot-flow': BootFlow,
  'linux-signals': Signals,
  'selinux-modes': SelinuxModes,
  'audit-replay': AuditReplay,
  'suspicious-account-triage': SuspiciousAccountTriage,
  'secret-management': SecretManagement,
  'sql-injection': SqlInjection,
  'python-gil': PythonGil,
  'python-concurrency': PythonConcurrency,
  'python-memory-leak': PythonMemoryLeak,
  'python-triage': PythonTriage,
  'arch-explaining': ArchExplaining,
  'config-ab-difference': ConfigABDifference,
  'k8s-migration-plan': K8sMigrationPlan,
  'ha-refactor-layers': HaRefactorLayers,
  'mongo-memory-triage': MongoMemoryTriage,
  'mongo-read-concern': MongoReadConcern,
  'mongo-not-writable': MongoNotWritable,
  'mongo-chunk-migrate': MongoChunkMigrate,
  'vm-io-performance': VmIoPerformance,
  'vm-network': VmNetwork,
  'vm-host-slow': VmHostSlow,
  'vm-throttle': VmThrottle,
  'config-center-vs-ansible': ConfigCenterVsAnsible,
  'automation-architecture': AutomationArchitecture,
  'ansible-copy-vs-template': AnsibleCopyVsTemplate,
  'ansible-import-vs-include': AnsibleImportVsInclude,
  'nginx-502-504': Nginx502504,
  'nginx-reload-vs-restart': NginxReloadRestart,
  'nginx-root-vs-alias': NginxRootAlias,
  'nginx-stream-vs-http': NginxStreamVsHttp,
  'p99-spike-triage': P99SpikeTriage,
  'k8s-metrics-sources': K8sMetricsSources,
  'prometheus-storage': PrometheusStorage,
  'iptables-drop-vs-reject': IptablesDropReject,
  'iptables-rule-order': IptablesOrder,
  'security-group-vs-iptables': SecGroupVsIptables,
  'k8s-node-iptables': K8sNodeIptables,
  'lvs-response-issue': LvsResponseIssue,
  'lvs-real-ip': LvsRealIp,
  'lvs-active-vs-active-active': LvsActiveStandby,
  'partial-users-fail': PartialUsersFail,
  'logical-vs-physical-backup': LogicalVsPhysicalBackup,
  'snapshot-vs-clone': SnapshotVsClone,
  'iscsi-vs-nfs': IscsiVsNfs,
  'archive-vs-backup': ArchiveVsBackup,
  'log-history-missing': LogHistoryMissing,
  'es-index-planning': EsIndexPlanning,
  'log-alert-options': LogAlertOptions,
  'log-platform-design': LogPlatformDesign,
  'cms-vs-g1': CmsVsG1,
  'jvm-memory-leak-triage': JvmMemoryLeakTriage,
  'jvm-tools-map': JvmToolsMap,
  'tomcat-slow-start': TomcatSlowStart,
  'gitops-vs-cicd': GitopsVsCicd,
  'test-layers-pipeline': TestLayersPipeline,
  'artifact-registry-plan': ArtifactRegistryPlan,
  'zero-downtime-upgrade': ZeroDowntimeUpgrade,
  'utf8-vs-utf8mb4': Utf8VsUtf8mb4,
  'mysql-repl-lag': MysqlReplLag,
  'slow-sql-triage': SlowSqlTriage,
  'zset-structure': ZsetStructure,
  'expire-vs-eviction': ExpireVsEviction,
  'redis-perf-triage': RedisPerfTriage,
  'conn-state-triage': ConnStateTriage,
  'limit-layers': LimitLayers,
  'logrotate-flow': LogrotateFlow,
  'systemd-failure': SystemdFailure,
  'shell-file-lock': ShellFileLock,
  'shell-dialects': ShellDialects,
  'positional-params': PositionalParams,
  'grep-sed-awk': GrepSedAwk,
  'rabbit-alarm': RabbitAlarm,
  'kafka-leader-election': KafkaLeaderElection,
  'mq-capacity-planning': MqCapacityPlanning,
  'git-clone-slow': GitCloneSlow,
  'gitlab-ci-structure': GitlabCiStructure,
  'submodule-vs-subtree': SubmoduleVsSubtree,
  'prevent-accidental-delete': PreventAccidentalDelete,
  'read-replica-and-ha': ReadReplicaAndHa,
  'dr-tiers': DrTiers,
  'tracing-concepts': TracingConcepts,
  'capacity-planning': CapacityPlanning,
  'monitor-triage-path': MonitorTriagePath,
  'dns-recursive-vs-iterative': DnsRecursiveIterative,
  'dns-server-faults': DnsServerFaults,
  'nginx-change-flow': NginxChangeFlow,
  'nginx-access-log': NginxAccessLog,
  'mongo-vs-mysql': MongoVsMysql,
  'python-deps': PythonDeps,
  'python-containers': PythonContainers,
  'cross-dc-sync': CrossDcSync,
  'ansible-unreachable': AnsibleUnreachable,
  'cronjob-vs-job': CronjobVsJob,
  'single-domain-slow': SingleDomainSlow,
  'virtualization-plan': VirtualizationPlan,
  'mongo-replset-setup': MongoReplSetSetup,
  'data-lifecycle': DataLifecycle,
  'virtualization-capacity': VirtualizationCapacity,
  'kibana-error-spike': KibanaErrorSpike,
  'opsdev-vs-ops': OpsDevVsOps,
  'dns-resolution-chain': DnsResolutionChain,
  'copy-vs-add': CopyVsAdd,
  'cpu-spike-incident': CpuSpikeIncident,
  'cloud-migration-plan': CloudMigrationPlan,
  'arch-evolution-plan': ArchEvolutionPlan,
  'promotion-load-test': PromotionLoadTest,
  'k8s-workflow': K8sWorkflow,
  'pod-create-flow': PodCreateFlow,
  'pod-delete-flow': PodDeleteFlow,
  'k8s-component-ha': K8sComponentHa,
  'pod-types': PodTypes,
  'kubeadm-vs-binary': KubeadmVsBinary,
  'sentinel-vs-cluster': SentinelVsCluster,
  'redis-slot': RedisSlot,
  'rabbit-message-loss': RabbitMessageLoss,
  'undelete-principle': UndeletePrinciple,
  'restart-policy': RestartPolicy,
  'image-pull-policy': ImagePullPolicy,
  'pv-and-pvc': PvPvc,
  'daemonset-traits': DaemonsetTraits,
  'flannel-modes': FlannelModes,
  'k8s-install-steps': K8sInstallSteps,
  'deployment-yaml': DeploymentYaml,
  'pod-network-triage': PodNetworkTriage,
  'pod-triage-steps': PodTriageSteps,
  'node-failure-triage': NodeFailureTriage,
  'service-types': ServiceTypes,
  'kube-proxy-mechanism': KubeProxyMechanism,
  'statefulset-deploy': StatefulsetDeploy,
  'affinity-types': AffinityTypes,
  'auto-recovery-layers': AutoRecoveryLayers,
  'network-policy-mechanism': NetworkPolicyMechanism,
  'canary-methods': CanaryMethods,
  'etcd-commands': EtcdCommands,
  'docker-image-optimize': DockerImageOptimize,
  'docker-secrets': DockerSecrets,
  'k8s-components': K8sComponents,
  'deployment-create': DeploymentCreate,
  'rolling-update': RollingUpdate,
  'apiserver-ha': ApiserverHa,
  'pv-lifecycle': PvLifecycle,
  'flannel-vs-calico': FlannelVsCalico,
  'pod-scheduling-methods': PodSchedulingMethods,
  'five-xx-triage': FiveXxTriage,
  'hpa-mechanism': HpaMechanism,
  'docker-monitoring': DockerMonitoring,
  'redis-data-types': RedisDataTypes,
  'df-vs-lsblk': DfVsLsblk,
  'kafka-partition-consumer': KafkaPartitionConsumer,
  'python-concurrency-modes': PythonConcurrencyModes,
  'k8s-security-layers': K8sSecurityLayers,
  'llm-vs-ml': LlmVsMl,
  'token-billing': TokenBilling,
  'rag-pipeline': RagPipeline,
  'agent-loop': AgentLoop,
  'hallucination-mitigation': HallucinationMitigation,
  'prompt-principles': PromptPrinciples,
  'temperature-effect': TemperatureEffect,
  'context-window-limits': ContextWindowLimits,
  'finetune-vs-rag': FinetuneVsRag,
  'sft-vs-rlhf': SftVsRlhf,
  'lora-structure': LoraStructure,
  'vector-embedding': VectorEmbedding,
  'token-cost-breakdown': TokenCostBreakdown,
  'prompt-injection-defense': PromptInjectionDefense,
  'data-masking-flow': DataMaskingFlow,
  'ai-gateway-roles': AiGatewayRoles,
  'ai-data-security-layers': AiDataSecurityLayers,
  'llm-observability-gap': LlmObservabilityGap,
  'log-ai-analysis-flow': LogAiAnalysisFlow,
  'ai-slow-triage': AiSlowTriage,
  'llm-api-monitoring': LlmApiMonitoring,
  'vllm-architecture': VllmArchitecture,
  'vram-composition': VramComposition,
  'gpu-vs-cpu': GpuVsCpu,
  'linux-boot-flow': LinuxBootFlow,
  'sudo-privilege': SudoPrivilege,
  'ansible-agentless': AnsibleAgentless,
  'link-inode': LinkInode,
  'osi-seven-layers': OsiSevenLayers,
  'tcpip-vs-osi': TcpipVsOsi,
  'nat-workflow': NatWorkflow,
  'tcp-state-machine': TcpStateMachine,
  'kafka-architecture': KafkaArchitecture,
  'rabbitmq-architecture': RabbitmqArchitecture,
  'kafka-components': KafkaComponents,
  'kafka-ordering': KafkaOrdering,
  'ha-architecture': HaArchitecture,
  'eventual-consistency': EventualConsistency,
  'distributed-lock': DistributedLock,
  'multiactive-multi-region': MultiactiveMultiRegion,
  'log-trace-system': LogTraceSystem,
  'db-failover': DbFailover,
  'db-change-safety': DbChangeSafety,
  'health-check-design': HealthCheckDesign,
  'nginx-modules': NginxModules,
  'lvs-three-modes': LvsThreeModes,
  'redis-replication': RedisReplication,
}

/**
 * 按 id 取组件。
 * @param {string} id
 * @returns {object|null}
 */
export function getFigure(id) {
  return FIGURES[id] || null
}
