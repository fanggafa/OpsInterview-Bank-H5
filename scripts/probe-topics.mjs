/**
 * 按「主题关键词」在指定分类内检索，用于人工复核清单里可能已覆盖的条目。
 * 只打印真实题干，让人一眼判断算不算重复。
 */
import { readFileSync } from 'node:fs'

const bank = JSON.parse(readFileSync('public/data/questions.json', 'utf8'))

const PROBES = [
  ['Pod 探针种类', '容器与K8s', ['探针', 'Probe', 'liveness', 'readiness', 'startup']],
  ['Pod 生命周期状态', '容器与K8s', ['生命周期', 'phase', 'Pending']],
  ['Deployment vs StatefulSet', '容器与K8s', ['StatefulSet', 'DaemonSet']],
  ['Service 类型', '容器与K8s', ['Service', 'ClusterIP', 'NodePort', 'LoadBalancer']],
  ['数据持久 / PV / PVC', '容器与K8s', ['PV', 'PVC', 'StorageClass', '持久']],
  ['污点与容忍', '容器与K8s', ['污点', 'Taint', 'Toleration']],
  ['亲和性', '容器与K8s', ['亲和', 'Affinity', 'nodeSelector']],
  ['HPA', '容器与K8s', ['HPA', 'Horizontal']],
  ['CNI / flannel / calico', '容器与K8s', ['CNI', 'flannel', 'calico', '网络插件']],
  ['OOM', '容器与K8s', ['OOM', '内存']],
  ['重启 / CrashLoop', '容器与K8s', ['重启', 'CrashLoop', 'restart']],
  ['kube-proxy', '容器与K8s', ['kube-proxy', 'ipvs', 'iptables 模式']],
  ['etcd', '容器与K8s', ['etcd']],
  ['Redis 数据结构', 'Redis', ['数据结构', 'String', 'Hash', 'zset']],
  ['Redis 集群 / 哨兵', 'Redis', ['集群', '哨兵', 'sentinel', 'Cluster']],
  ['RabbitMQ 消息丢失', '消息队列', ['丢失', '丢消息', 'ack']],
  ['Kafka 分区与消费者', '消息队列', ['分区', 'Partition', 'Consumer', '消费者']],
  ['Docker 镜像优化', '容器与K8s', ['Docker', '镜像']],
  ['Python 并发', 'Python', ['并发', '并行', 'GIL', '协程']],
  ['Python 内存泄漏', 'Python', ['内存泄漏', '泄漏']],
  ['Linux 内核机制', 'Linux基础', ['内核']],
  ['恢复误删文件', 'Linux基础', ['误删', '恢复', 'inode']],
  ['df 与 lsblk', 'Linux基础', ['df', 'lsblk', '磁盘']],
]

for (const [label, cat, keys] of PROBES) {
  const hits = bank.filter(
    (q) =>
      q.category === cat &&
      keys.some((k) => {
        const t = q.question.toLowerCase()
        return t.includes(k.toLowerCase())
      }),
  )
  console.log(`\n【${label}】分类「${cat}」命中 ${hits.length} 条`)
  for (const h of hits.slice(0, 4)) {
    console.log(`   题${h.id}  ${h.question.slice(0, 60)}`)
  }
}
