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
}

/**
 * 按 id 取组件。
 * @param {string} id
 * @returns {object|null}
 */
export function getFigure(id) {
  return FIGURES[id] || null
}
