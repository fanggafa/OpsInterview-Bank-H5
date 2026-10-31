# 插图注册表（figures registry）

> 共 **363 张**插图，按**实际挂载的题目分类**分组。
> 新增插图后请在此表追加一行，并在题目的答案里用 `[[图:id]]` 引用。

返回 [README](../README.md)。

| 分类 | 张数 |
|---|---|
| Linux基础 | 14 |
| Shell脚本 | 12 |
| 网络基础 | 19 |
| DNS | 7 |
| iptables/firewalld | 8 |
| Nginx | 10 |
| LVS/HAProxy | 8 |
| Tomcat/JVM | 8 |
| MySQL | 9 |
| Redis | 11 |
| MongoDB | 11 |
| 消息队列 | 12 |
| 容器与K8s | 52 |
| 存储与备份 | 15 |
| 虚拟化 | 10 |
| CI/CD | 9 |
| Git/GitLab | 7 |
| 监控告警 | 15 |
| 日志与ELK | 13 |
| 自动化与配置管理 | 9 |
| 安全与跳板机 | 11 |
| 云与高可用 | 10 |
| Python | 7 |
| AI与大模型 | 24 |
| 综合场景题 | 29 |

---

## Linux基础（18 张）

| id | 内容 | 用在哪 |
|---|---|---|
| `cpu-bottleneck-tree` | CPU 高时按 us/sy/wa/st/si 定位 | 题 6 |
| `zombie-vs-orphan` | 僵尸进程 vs 孤儿进程对比 | 题 4001 |
| `inode-vs-block` | inode 与数据块是两个独立上限 | 题 4002 |
| `nice-priority-levels` | nice / PR / RT 三层优先级 | 题 4004 |
| `process-states` | R/S/D/T/Z 进程状态与处置 | 题 4000 |
| `boot-flow` | Linux 启动六环与定位 | 题 4010 |
| `linux-signals` | TERM/KILL/HUP 与优雅停机 | 题 4035 |
| `selinux-modes` | SELinux 三模式与「莫名被拒」 | 题 4032 |
| `conn-state-triage` | TIME_WAIT 与 ESTABLISHED 异常 | 题 4009 |
| `limit-layers` | 资源限制的四层 | 题 4024 |
| `logrotate-flow` | logrotate 的流程与配错后果 | 题 4025 |
| `systemd-failure` | systemd 启动失败与 Type/Restart | 题 4122 |
| `undelete-principle` | 误删文件恢复原理 | 题 4127 |
| `df-vs-lsblk` | df / lsblk / du 三视角 | 题 4129 |
| `linux-boot-flow` | 开机 6 步流程；第 5 步是 6/7 唯一区别 | 题 8630 Linux 系统开机流程是怎样的？CentOS 6  |
| `sudo-privilege` | SUID → sudoers → 执行的提权链路与授权陷阱 | 题 8646 Linux 中如何做权限提升与命令委托？sudo 的 |
| `ansible-agentless` | 控制机经 SSH 推送临时脚本，被控端无需 agent | 题 8656 Linux 中如何做远程批量执行与配置管理？Ansi |
| `link-inode` | 目录项→inode→数据块；软硬链接差异与跨分区限制 | 题 8639 Linux 文件系统中，软链接和硬链接的实现原理有什 |


## Shell脚本（12 张）

| id | 内容 | 用在哪 |
|---|---|---|
| `shell-safety` | set -e/-u/pipefail 的作用范围与坑 | 题 9 |
| `pipeline-exit-code` | $? 与 PIPESTATUS 的管道退出码 | 题 10 |
| `xargs-safe-usage` | 含空格文件名的三种安全写法 | 题 12 |
| `shell-quotes` | Shell 四种引号与命令替换 | 题 98 |
| `shell-operators` | Shell 的 ; &amp;&amp; || 与 {} () 分组 | 题 4203 |
| `background-run-modes` | &amp;/nohup/disown/setsid/systemd 五种后台 | 题 4233 |
| `shell-test-syntax` | [ ] / [[ ]] / (( )) 的区别 | 题 4230 |
| `find-exec-vs-xargs` | find -exec 与 xargs 的三种写法 | 题 4214 |
| `shell-file-lock` | flock 与手写锁 | 题 4224 |
| `shell-dialects` | sh/bash/dash/zsh 与 shebang | 题 4226 |
| `positional-params` | 位置参数与 $@ vs $* | 题 4325 |
| `grep-sed-awk` | grep/sed/awk 的分工 | 题 4328 |

## 网络基础（23 张）

| id | 内容 | 用在哪 |
|---|---|---|
| `tcp-handshake` | 三次握手/四次挥手、半连接队列、TIME_WAIT | 题 16 |
| `http-status-groups` | 状态码按责任方分组（重点 5xx） | 题 23 |
| `time-wait-reason` | TIME_WAIT 为什么等 2MSL | 题 17 |
| `url-to-render` | 从输入 URL 到页面渲染的七段 | 题 18 |
| `tcpdump-connect-fail` | tcpdump 判断连接失败在哪一步 | 题 19 |
| `tcp-vs-udp` | TCP 与 UDP 的取舍与选型 | 题 22 |
| `https-tls-handshake` | HTTPS 与 TLS 握手五步 | 题 102 |
| `ping-fail-triage` | ping 不通的分层排查 | 题 103 |
| `flow-vs-congestion` | 流量控制 vs 拥塞控制 + 四阶段 | 题 4400 |
| `http-code-triage` | HTTP 状态码分类与排查方向 | 题 4411 |
| `curl-layers` | curl 按 DNS→TCP→TLS→HTTP 分层 | 题 4412 |
| `http-cache-levels` | 强缓存 / 协商缓存 / 不缓存 | 题 4431 |
| `cdn-principles` | CDN 原理与命中率、回源排查 | 题 4432 |
| `keepalive-vs-heartbeat` | TCP keepalive 与应用心跳 | 题 4424 |
| `ss-vs-netstat` | ss 与 netstat 的原理与迁移 | 题 4418 |
| `traceroute-vs-mtr` | traceroute 与 mtr、星号的含义 | 题 4414 |
| `cross-dc-network` | 跨机房组网方案对比 | 题 4417 |
| `single-domain-slow` | 单域名慢的分段计时 | 题 4413 |
| `dns-resolution-chain` | DNS 解析五级与故障症状 | 题 4519 |
| `osi-seven-layers` | 七层自上而下堆叠，每层作用与典型协议 | 题 9631 OSI 七层模型分别是哪七层？各层的作用是什么？ |
| `tcpip-vs-osi` | 七层与四层的合并关系连线（5~7→应用、1~2→接口） | 题 9632 TCP/IP 四层模型分别是哪四层？与 OSI 七层 |
| `nat-workflow` | NAT 改写→映射表→公网→回包查表还原；SNAT/DNAT | 题 9629 什么是网络地址转换（NAT）？描述其工作原理。 |
| `tcp-state-machine` | 左右两列状态时间线；TIME_WAIT vs CLOSE_WAIT | 题 9633 TCP 状态转换图中，有哪些关键状态？它们分别什么含 |


## DNS（7 张）

| id | 内容 | 用在哪 |
|---|---|---|
| `dns-resolve` | DNS 解析链路（5 步流程） | 题 1001、1005 |
| `dns-record-types` | DNS 记录类型对照表 | 题 1002 |
| `dns-failure-layers` | DNS 失败的三层定位与状态码分流 | 题 1003 |
| `dns-ndots-search` | search/ndots 导致的解析变慢 | 题 1009 |
| `multi-a-records` | 多 A 记录的选择与三个隐患 | 题 1010 |
| `dns-recursive-vs-iterative` | 递归查询与迭代查询 | 题 1005 |
| `dns-server-faults` | DNS 服务端故障四类 | 题 1024 |

## iptables/firewalld（8 张）

| id | 内容 | 用在哪 |
|---|---|---|
| `iptables-chain-flow` | iptables 五链数据包流向 | 题 1201 |
| `iptables-policy-vs-rule` | policy 与规则 ACCEPT 的区别 | 题 1204 |
| `conntrack-full` | conntrack 表满的现象与调优 | 题 1205 |
| `firewalld-vs-iptables` | firewalld 与 iptables 的关系与 zone | 题 1209 |
| `iptables-drop-vs-reject` | DROP 与 REJECT | 题 1208 |
| `iptables-rule-order` | 规则顺序决定结果 | 题 1233 |
| `security-group-vs-iptables` | 安全组与 iptables 的排查顺序 | 题 1220 |
| `k8s-node-iptables` | K8s 节点上的 iptables 规则 | 题 1230 |

## Nginx（11 张）

| id | 内容 | 用在哪 |
|---|---|---|
| `nginx-location-match` | Nginx location 匹配优先级 | 题 1401 |
| `nginx-proxy-pass` | proxy_pass 斜杠差异对比 | 题 1402 |
| `nginx-vs-apache-model` | Nginx 事件驱动 vs Apache 每连接一线程 | 题 1404 |
| `nginx-timing-split` | request_time vs upstream_response_time | 题 1414 |
| `nginx-502-504` | 502 与 504 的区别与排查 | 题 1403 |
| `nginx-reload-vs-restart` | reload 与 restart | 题 1408 |
| `nginx-root-vs-alias` | root 与 alias | 题 1422 |
| `nginx-stream-vs-http` | stream（4 层）与 http（7 层） | 题 1433 |
| `nginx-change-flow` | Nginx 改配置的标准流程 | 题 1409 |
| `nginx-access-log` | access.log 关键字段与排查 | 题 1434 |
| `nginx-modules` | 核心模块内嵌于 worker；并发上限公式 | 题 2118 Nginx 的核心模块有哪些？分别起什么作用？ |


## LVS/HAProxy（9 张）

| id | 内容 | 用在哪 |
|---|---|---|
| `lvs-modes` | LVS 四种转发模式对比 | 题 1601 |
| `lvs-forward-modes` | LVS 的 NAT / DR / TUN 三种模式 | 题 1610 |
| `lvs-three-layers` | LVS + Keepalived + Nginx 三层职责 | 题 1621 |
| `lvs-scheduling` | LVS 调度算法与选择 | 题 1604 |
| `lvs-response-issue` | LVS 响应不回客户端 | 题 1612 |
| `lvs-real-ip` | 四层传递真实 IP | 题 1617 |
| `lvs-active-vs-active-active` | 主备与主主模式 | 题 1627 |
| `partial-users-fail` | 部分用户访问不了 | 题 1629 |
| `lvs-three-modes` | DR/NAT/TUN 的回包路径差异（绕不绕 LB） | 题 2616 LVS 有哪三种模式？它们的工作过程有什么区别？ |


## Tomcat/JVM（8 张）

| id | 内容 | 用在哪 |
|---|---|---|
| `jvm-memory-areas` | JVM 内存区域与四种 OOM 对照 | 题 1801、1821 |
| `jvm-oom-types` | 四种 OOM 后缀与对应区域 | 题 1801 |
| `tomcat-request-flow` | Tomcat 组件层级与请求处理 | 题 1802 |
| `cpu-100-locate` | CPU 100% 定位到具体代码行 | 题 1811 |
| `cms-vs-g1` | CMS 与 G1 的取舍 | 题 1806 |
| `jvm-memory-leak-triage` | JVM 内存泄漏排查四步 | 题 1807 |
| `jvm-tools-map` | JVM 工具按症状选择 | 题 1819 |
| `tomcat-slow-start` | Tomcat 启动慢的四类原因 | 题 1826 |

## MySQL（9 张）

| id | 内容 | 用在哪 |
|---|---|---|
| `mysql-isolation-levels` | 四种隔离级别与 MVCC/间隙锁 | 题 27 |
| `b-plus-tree-reason` | B+ 树为何胜过 B 树/红黑树/哈希 | 题 24 |
| `leftmost-prefix` | 最左前缀与索引失效场景 | 题 25 |
| `explain-fields` | EXPLAIN 四个关键字段读法 | 题 26 |
| `mysql-replication-flow` | MySQL 主从三线程与复制延迟 | 题 3606 |
| `mysql-index-lookup` | 聚簇/二级索引、回表与覆盖索引 | 题 3602 |
| `utf8-vs-utf8mb4` | MySQL 的 utf8 与 utf8mb4 | 题 3633 |
| `mysql-repl-lag` | 主从复制延迟的排查 | 题 3719 |
| `slow-sql-triage` | 慢 SQL 的定位流程 | 题 3720 |

## Redis（12 张）

| id | 内容 | 用在哪 |
|---|---|---|
| `redis-persistence` | RDB/AOF 对比与淘汰策略 | 题 34 |
| `cache-problems` | 穿透 / 击穿 / 雪崩对照 | 题 33 |
| `redis-arch-evolution` | 主从 / 哨兵 / 集群演进 | 题 37 |
| `redis-memory-metrics` | used_memory vs rss 与碎片判断 | 题 3807 |
| `redis-failover-triage` | 主从切换后的报错与丢数据两条线 | 题 3816 |
| `zset-structure` | ZSet 的哈希表 + 跳表 | 题 3801 |
| `expire-vs-eviction` | 过期删除与内存淘汰 | 题 3918 |
| `redis-perf-triage` | Redis 性能下降的排查优先级 | 题 3833 |
| `sentinel-vs-cluster` | Redis 哨兵与集群 | 题 3928 |
| `redis-slot` | slot 分片与 hash tag | 题 3929 |
| `redis-data-types` | Redis 类型与场景对应 | 题 3927 |
| `redis-replication` | 全量同步四步 + repl_backlog 命中/不命中的分叉 | 题 8132 Redis 主从复制的原理是什么？ |


## MongoDB（11 张）

| id | 内容 | 用在哪 |
|---|---|---|
| `mongo-replica-shard` | 副本集高可用 vs 分片水平扩展 | 题 2011 |
| `mongo-oplog-flow` | oplog 数据流与「固定大小窗口」 | 题 2006 |
| `wired-tiger-mechanisms` | WiredTiger 四个核心机制 | 题 2010 |
| `mongo-deploy-modes` | MongoDB 三种部署形态与节点数 | 题 2002 |
| `mongo-esr-principle` | MongoDB 复合索引 ESR 原则 | 题 2008 |
| `mongo-memory-triage` | MongoDB 内存高：缓存 vs 真不够 | 题 2018 |
| `mongo-read-concern` | readConcern 三级与代价 | 题 2021 |
| `mongo-not-writable` | NotWritablePrimary 三类原因 | 题 2028 |
| `mongo-chunk-migrate` | chunk 迁移五步与风险 | 题 2032 |
| `mongo-vs-mysql` | MongoDB 与 MySQL 的区别与选型 | 题 2000 |
| `mongo-replset-setup` | MongoDB 副本集搭建六步 | 题 2033 |

## 消息队列（16 张）

| id | 内容 | 用在哪 |
|---|---|---|
| `mq-comparison` | Kafka / RabbitMQ / RocketMQ 选型 | 题 2200 |
| `kafka-isr-mechanism` | Kafka ISR 机制与 min.insync.replicas | 题 2204 |
| `mq-backlog-triage` | 消息积压：能力不足 vs 被卡住 | 题 2208 |
| `mq-ordering-guarantee` | 顺序消费：Kafka 与 RocketMQ | 题 2221 |
| `mq-broadcast-vs-cluster` | 广播消费与集群消费 | 题 2229 |
| `kafka-partition-planning` | Kafka 分区数规划倒推 | 题 2231 |
| `rabbit-alarm` | RabbitMQ 内存/磁盘 alarm | 题 2218 |
| `kafka-leader-election` | Kafka 频繁 Leader 选举 | 题 2224 |
| `mq-capacity-planning` | MQ 容量规划与压测场景 | 题 2236 |
| `rabbit-message-loss` | RabbitMQ 消息丢失三段 | 题 2316 |
| `kafka-partition-consumer` | 分区与消费者三种关系 | 题 2315 |
| `mq-delivery` | 消息在三段链路上的丢失与重复 | 题 2203、2215 |
| `kafka-architecture` | Topic 拆 Partition（Leader+Follower）+ Consumer Group | 题 4126 Kafka 的基本架构是怎样的？ |
| `rabbitmq-architecture` | Exchange 分层路由到多队列；四种交换机类型 | 题 4120 RabbitMQ 的基本架构是怎样的？ |
| `kafka-components` | 三段链路各自的优化参数落点 | 题 4127 Kafka 各组件的工作机制是什么？有哪些常见优化点 |
| `kafka-ordering` | 同 key→同分区→单消费者链路 + 三个破坏顺序的坑 | 题 4132 Kafka 如何保证消息顺序性？什么场景下顺序性是必 |


## 容器与K8s（52 张）

| id | 内容 | 用在哪 |
|---|---|---|
| `k8s-rolling-update` | K8s 滚动更新与三种探针 | 题 47 |
| `container-vs-vm` | 容器与虚拟机的隔离层次 | 题 41 |
| `docker-layers` | 镜像分层与构建缓存顺序 | 题 42 |
| `k8s-probes` | startup / readiness / liveness | 题 43 |
| `k8s-service-types` | 四种 Service 与流量入口 | 题 45 |
| `crash-loop-triage` | CrashLoopBackOff 排查与退出码 | 题 46 |
| `k8s-resources-qos` | requests/limits 与三种 QoS | 题 44 |
| `hpa-mechanism` | HPA 原理与五个常见问题 | 题 4759 |
| `k8s-workload-types` | Deployment / StatefulSet / DaemonSet | 题 4600 |
| `k8s-not-ready-layers` | NotReady 的四层排查 | 题 4607 |
| `kube-proxy-modes` | kube-proxy 的 iptables vs IPVS | 题 4613 |
| `node-maintenance-flow` | cordon/drain/delete 与维护流程 | 题 4621 |
| `pod-evicted-triage` | Pod 大量 Evicted 的排查 | 题 4645 |
| `configmap-vs-secret` | ConfigMap 与 Secret（base64 非加密） | 题 4604 |
| `cronjob-vs-job` | CronJob 与 Job | 题 4623 |
| `copy-vs-add` | COPY 与 ADD | 题 4636 |
| `k8s-workflow` | K8s 基本工作流程（声明式调谐） | 题 4726 |
| `pod-create-flow` | Pod 创建六步与两种卡点 | 题 4729 |
| `pod-delete-flow` | Pod 删除的优雅终止时序 | 题 4730 |
| `k8s-component-ha` | 组件高可用：并行 vs 选主 | 题 4728 |
| `pod-types` | 静态 Pod / 自主式 / 动态 | 题 4733 |
| `kubeadm-vs-binary` | kubeadm 与二进制安装 | 题 4735 |
| `restart-policy` | 重启策略三选与容器/Pod 分层 | 题 4731 |
| `image-pull-policy` | 镜像拉取策略与默认值规则 | 题 4732 |
| `pv-and-pvc` | PV 与 PVC 的定位与访问模式 | 题 4741 |
| `daemonset-traits` | DaemonSet 三特性与用途 | 题 4743 |
| `flannel-modes` | flannel 三种模式选型 | 题 4745 |
| `k8s-install-steps` | K8s 安装三段与三个坑 | 题 4734 |
| `deployment-yaml` | Deployment YAML 三层结构 | 题 4737 |
| `pod-network-triage` | Pod 网络五层排查 | 题 4748 |
| `pod-triage-steps` | Pod 异常定位四步与退出码 | 题 4750 |
| `node-failure-triage` | 节点宕机的两类原因 | 题 4754 |
| `service-types` | Service 的作用与四种类型 | 题 4770 |
| `kube-proxy-mechanism` | kube-proxy 只写规则不转发 | 题 4771 |
| `statefulset-deploy` | StatefulSet 三件套与部署四步 | 题 4772 |
| `affinity-types` | 亲和性两大类与硬软约束 | 题 4747 |
| `auto-recovery-layers` | 四层自动恢复机制 | 题 4751 |
| `network-policy-mechanism` | NetworkPolicy 的白名单语义 | 题 4762 |
| `canary-methods` | 灰度四种手段与粒度 | 题 4764 |
| `etcd-commands` | etcdctl 四个关键命令 | 题 4769 |
| `docker-image-optimize` | 镜像优化两目标与同层清理 | 题 4767 |
| `docker-secrets` | Docker 密钥管理四档安全性 | 题 4766 |
| `k8s-components` | K8s 核心组件与作用 | 题 4727 |
| `deployment-create` | Deployment 三级创建链路 | 题 4738 |
| `rolling-update` | 滚动升级与回滚本质 | 题 4739 |
| `apiserver-ha` | apiserver 的高可用三要素 | 题 4736 |
| `pv-lifecycle` | PV 四状态与回收策略 | 题 4742 |
| `flannel-vs-calico` | flannel 与 calico 对比 | 题 4753 |
| `pod-scheduling-methods` | 五种调度到指定节点的方法 | 题 4755 |
| `five-xx-triage` | 5xx 分层定位与来源判断 | 题 4757 |
| `docker-monitoring` | Docker 监控与 cgroup 读 limit | 题 4768 |
| `k8s-security-layers` | K8s 安全五层收敛 | 题 4765 |

## 存储与备份（15 张）

| id | 内容 | 用在哪 |
|---|---|---|
| `raid-levels` | RAID 0/1/5/6/10 容量与容错对比 | 题 2400 |
| `backup-321` | 备份 3-2-1 原则与勒索时代的补充 | 题 2401 |
| `object-vs-filesystem` | 对象存储 vs 文件系统 | 题 2403 |
| `rsync-incremental` | rsync 增量判断与 --delete 风险 | 题 2405 |
| `ceph-components` | Ceph 的 MON / OSD / MDS 职责 | 题 2408 |
| `backup-vs-dr` | 备份与容灾的区别、RTO/RPO | 题 2430 |
| `backup-design-elements` | 备份方案四要素 | 题 2404 |
| `storage-active-active` | 存储双活与主备的区别 | 题 2429 |
| `hot-cold-tiering` | 冷热数据分层与成本 | 题 2411 |
| `logical-vs-physical-backup` | 逻辑备份与物理备份 | 题 2409 |
| `snapshot-vs-clone` | 快照与克隆（快照不是备份） | 题 2417 |
| `iscsi-vs-nfs` | iSCSI 块存储与 NFS 文件存储 | 题 2418 |
| `archive-vs-backup` | 归档与备份的区别 | 题 2422 |
| `cross-dc-sync` | 跨机房同步的三种取舍 | 题 2424 |
| `data-lifecycle` | 数据生命周期四阶段 | 题 2433 |

## 虚拟化（10 张）

| id | 内容 | 用在哪 |
|---|---|---|
| `vm-cpu-overcommit` | vCPU 超分、steal time 与绑核 | 题 2601 |
| `live-migration-phases` | 热迁移的迭代拷贝与脏页收敛 | 题 2605 |
| `vm-disk-formats` | raw / qcow2 / vmdk 磁盘格式 | 题 2608 |
| `kvm-vs-xen-vmware` | KVM 与 Xen / VMware 架构差异 | 题 2600 |
| `vm-io-performance` | 虚拟机数据库 IO 差的四层 | 题 2609 |
| `vm-network` | 虚拟网络三模式与排查 | 题 2615 |
| `vm-host-slow` | 宿主不忙但 VM 卡的四因 | 题 2624 |
| `vm-throttle` | 虚拟机被限速的识别 | 题 2631 |
| `virtualization-plan` | 虚拟化平台五层规划 | 题 2612 |
| `virtualization-capacity` | 虚拟化容量规划四维 | 题 2621 |

## CI/CD（9 张）

| id | 内容 | 用在哪 |
|---|---|---|
| `deploy-strategies` | 滚动/蓝绿/灰度三种发布策略 | 题 49 |
| `ci-pipeline-stages` | 流水线阶段与每道质量门禁 | 题 48 |
| `test-pyramid` | 测试金字塔与流水线分层 | 题 109 |
| `git-branch-strategies` | 三种 Git 分支策略对比 | 题 53 |
| `rollout-strategies` | 滚动 / 蓝绿 / 金丝雀对比 | 题 4800 |
| `gitops-vs-cicd` | GitOps 与传统 CI/CD | 题 4812 |
| `test-layers-pipeline` | 测试分层与流水线顺序 | 题 4817 |
| `artifact-registry-plan` | 制品仓库规划 | 题 4805 |
| `zero-downtime-upgrade` | 零停机依赖升级四阶段 | 题 4832 |

## Git/GitLab（7 张）

| id | 内容 | 用在哪 |
|---|---|---|
| `git-areas` | Git 四层区域与常用命令流向 | 题 2800 |
| `merge-vs-rebase` | merge 与 rebase 的历史形状 | 题 2801 |
| `gitlab-components` | 自建 GitLab 的组件分层排查 | 题 2810 |
| `git-stash` | git stash 与临时分支的区别 | 题 2811 |
| `git-clone-slow` | git clone 慢的两类原因 | 题 2812 |
| `gitlab-ci-structure` | GitLab CI 的三要素 | 题 2828 |
| `submodule-vs-subtree` | submodule 与 subtree | 题 2830 |

## 监控告警（15 张）

| id | 内容 | 用在哪 |
|---|---|---|
| `monitor-layers` | 监控四层指标与只看资源的盲区 | 题 54 |
| `alert-funnel` | 告警治理漏斗（抑制/分组/分级） | 题 57 |
| `prometheus-metric-types` | 四种指标类型与 rate | 题 55 |
| `rate-vs-irate` | rate 与 irate、P99 正确写法 | 题 56 |
| `observability-pillars` | metrics / tracing / logging 分工 | 题 58 |
| `slo-error-budget` | SLI / SLO / SLA 与错误预算 | 题 59 |
| `oncall-response-flow` | 值班故障响应六步 | 题 60 |
| `prometheus-scaling` | Prometheus 四条扩展路线 | 题 5010 |
| `prometheus-storage` | Prometheus 存储模型与限制 | 题 5000 |
| `k8s-metrics-sources` | cAdvisor 与 kube-state-metrics | 题 5024 |
| `p99-spike-triage` | P99 升高但 QPS 正常的排查 | 题 5025 |
| `metric-cardinality` | 指标基数爆炸的排查与治理 | 题 5031 |
| `tracing-concepts` | Tracing 的 trace/span 与落地 | 题 5018 |
| `capacity-planning` | 用监控数据做容量规划 | 题 5019 |
| `monitor-triage-path` | 用监控定位故障的五步 | 题 5020 |

## 日志与ELK（13 张）

| id | 内容 | 用在哪 |
|---|---|---|
| `es-shard-replica` | ES 分片副本分布与 green/yellow/red | 题 3003 |
| `es-thread-pool-triage` | ES 拒绝按线程池分流 | 题 3005 |
| `es-query-vs-filter` | query 与 filter 的算分与缓存 | 题 3006 |
| `es-shard-design` | ES 分片与副本的设计权衡 | 题 3003 |
| `es-ilm-stages` | ES ILM 四阶段与日志保留 | 题 3011 |
| `loki-vs-elk` | Loki 与 ELK 的定位与选型 | 题 3019 |
| `es-oom-triage` | ES 节点 OOM 的原因与排查 | 题 3027 |
| `log-trace-correlation` | 日志与追踪如何用 trace_id 串联 | 题 3038 |
| `log-history-missing` | 查不到历史日志的排查 | 题 3031 |
| `es-index-planning` | 多应用的 ES 索引规划 | 题 3030 |
| `log-alert-options` | 日志告警的三种方案 | 题 3013 |
| `log-platform-design` | 日写 100GB 日志平台设计 | 题 3035 |
| `kibana-error-spike` | Kibana 错误突增排查 | 题 3017 |

## 自动化与配置管理（9 张）

| id | 内容 | 用在哪 |
|---|---|---|
| `automation-flow` | Ansible 执行链路与幂等判断点 | 题 3201 |
| `terraform-vs-ansible` | Terraform 与 Ansible 的定位差异 | 题 3207 |
| `ansible-var-priority` | Ansible 变量优先级顺序 | 题 3202 |
| `config-center-vs-ansible` | 配置中心与 Ansible 的区别 | 题 3226 |
| `automation-architecture` | 500 台/20 服务的自动化架构 | 题 3220 |
| `ansible-copy-vs-template` | copy 与 template | 题 3219 |
| `ansible-import-vs-include` | import_tasks 与 include_tasks | 题 3229 |
| `ansible-unreachable` | Ansible UNREACHABLE 排查 | 题 3223 |
| `opsdev-vs-ops` | 运维开发与传统运维 | 题 3240 |

## 安全与跳板机（11 张）

| id | 内容 | 用在哪 |
|---|---|---|
| `hardening-checklist` | 公网 Linux 加固四层清单 | 题 61 |
| `incident-response-order` | 入侵应急：隔离→取证→清除 | 题 62 |
| `least-privilege-layers` | 最小权限的四层落地 | 题 63 |
| `tls-cert-lifecycle` | 证书监控/续期/重载三件事 | 题 65 |
| `secret-management` | 密钥管理四种做法对比 | 题 66 |
| `sql-injection` | SQL 注入原理与运维侧降损 | 题 64 |
| `bastion-access` | 生产访问收敛与 SSH 四条加固 | 题 5200 |
| `zero-trust-vs-perimeter` | 零信任与传统边界防护的区别 | 题 5218 |
| `audit-replay` | 操作可审计可回放的四层 | 题 5233 |
| `suspicious-account-triage` | 可疑账号与异常登录排查 | 题 5205 |
| `cpu-spike-incident` | CPU 异常高的应急顺序 | 题 5204 |

## 云与高可用（10 张）

| id | 内容 | 用在哪 |
|---|---|---|
| `multi-az-arch` | 多可用区架构与「伪双活」断点 | 题 3404 |
| `rds-ha-comparison` | RDS 多可用区 vs 自建主从 | 题 3410 |
| `vpc-layers` | VPC / 子网 / 安全组 / 路由表 | 题 3401 |
| `cloud-service-models` | IaaS / PaaS / SaaS 与运维职责 | 题 3400 |
| `slb-vs-alb` | 四层 SLB 与七层 ALB 选型 | 题 3402 |
| `cross-vpc-connect` | 跨 VPC / 跨账号打通方案 | 题 3416 |
| `cloud-latency-triage` | 云上网络延迟的分段排查 | 题 3435 |
| `prevent-accidental-delete` | 云上误删的四层防护 | 题 3409 |
| `read-replica-and-ha` | 只读实例与多可用区高可用 | 题 3421 |
| `dr-tiers` | 容灾四档与 RTO/RPO | 题 3405 |

## Python（7 张）

| id | 内容 | 用在哪 |
|---|---|---|
| `python-gil` | GIL 与线程/进程的取舍 | 题 5602 |
| `python-concurrency` | 进程/线程/协程选型 | 题 5603 |
| `python-memory-leak` | 内存泄漏：tracemalloc/objgraph | 题 5604 |
| `python-triage` | CPU 100% 与卡住的定位 | 题 5608 |
| `python-deps` | Python 依赖声明与锁定 | 题 5601 |
| `python-containers` | list/dict/set 复杂度 | 题 5605 |
| `python-concurrency-modes` | 线程/进程/协程选型 | 题 5610 |

## AI与大模型（24 张）

| id | 内容 | 用在哪 |
|---|---|---|
| `llm-vs-ml` | LLM 与传统 ML 四维度对比 | 题 5800 |
| `token-billing` | Token 计费与输入/输出价差 | 题 5801 |
| `rag-pipeline` | RAG 离线建库与在线检索链路 | 题 5802 |
| `agent-loop` | Agent 的 ReAct 循环 | 题 5803 |
| `hallucination-mitigation` | 幻觉成因与五级缓解 | 题 5805 |
| `prompt-principles` | 结构化提示词骨架与原则 | 题 5806 |
| `temperature-effect` | Temperature 对概率分布的影响 | 题 5809 |
| `context-window-limits` | 上下文窗口的共享预算与四限制 | 题 5810 |
| `finetune-vs-rag` | 提示词/RAG/微调的分工 | 题 5811 |
| `sft-vs-rlhf` | 训练三阶段与 SFT/RLHF 对照 | 题 5812 |
| `lora-structure` | LoRA 冻结 W + 旁路 ΔW | 题 5813 |
| `vector-embedding` | 语义聚簇到向量与余弦相似度 | 题 5814 |
| `gpu-vs-cpu` | CPU 与 GPU 的架构差异 | 题 5818 |
| `vram-composition` | 显存构成与六种解法 | 题 5819 |
| `vllm-architecture` | PagedAttention 与连续批处理 | 题 5820 |
| `llm-api-monitoring` | LLM 服务的三层监控指标 | 题 5821 |
| `ai-data-security-layers` | 私有化 AI 的四层数据安全 | 题 5822 |
| `ai-gateway-roles` | AI 网关的六项治理能力 | 题 5825 |
| `log-ai-analysis-flow` | 日志喂给 AI 前的四步处理 | 题 5827 |
| `ai-slow-triage` | AI 变慢的三段耗时与两指标 | 题 5832 |
| `token-cost-breakdown` | 成本公式与降本三条路 | 题 5834 |
| `llm-observability-gap` | LLM 可观测性相对 APM 的缺口 | 题 5835 |
| `prompt-injection-defense` | 直接/间接注入与防御层次 | 题 5836 |
| `data-masking-flow` | 脱敏四方式与四个插入位置 | 题 5838 |

## 综合场景题（37 张）

| id | 内容 | 用在哪 |
|---|---|---|
| `incident-flow` | 故障处理五步（止血优先于定位） | 题 70 |
| `slow-service-layers` | 「服务慢」的四层分流排查 | 题 112 |
| `wait-not-compute-tree` | 「资源不高却超时」的五个等待点排查树 | 题 67 |
| `midnight-cpu-surge` | 凌晨多机 CPU 飙高：止血→us/sy/wa 分流→复盘 | 题 113 |
| `memory-growth-decision` | 内存上涨：泄漏 vs 缓存，堆内 vs 堆外 | 题 71 |
| `k8s-migration-plan` | 迁移到 K8s 的规划 | 题 117 |
| `ha-refactor-layers` | 单机改造高可用的分层 | 题 72 |
| `half-users-dimensions` | 「一半用户受影响」的五维分流 | 题 5401 |
| `dual-active-phases` | 单主库做双活的三阶段演进 | 题 5417 |
| `hourly-spike-triage` | 整点前后变差的排查与整点任务清单 | 题 5422 |
| `intermittent-issue-strategy` | 偶发问题：定义→观测→抓现场→固化 | 题 5439 |
| `redis-timeout-paths` | Redis 超时的五个方向分流 | 题 5416 |
| `replication-lag-triage` | 主从延迟：读回主库止血 + 五类原因 | 题 5402 |
| `fixed-time-slowness` | 固定时间变慢：时间轴对齐找撞车 | 题 5405 |
| `multi-region-layers` | 异地多活四层与「单元化」消除写冲突 | 题 5404 |
| `config-drift-decision` | 一台配置不一致：查原因→评估→三种决策 | 题 5430 |
| `code-vs-env-bisect` | 代码还是环境问题：最小差异实验二分 | 题 5433 |
| `restart-triggers` | 准时重启：进程 / Pod / 整机三路分流 | 题 5412 |
| `disk-full-safe-triage` | 磁盘将满：按安全等级从高到低处理 | 题 5427 |
| `microservice-observability` | 微服务排查三件套与 trace_id 断点 | 题 5437 |
| `alert-fatigue-triage` | 告警疲劳：量化后四类分别处理 | 题 5418 |
| `monitor-blind-spots` | 指标正常但用户不满的四个盲区 | 题 5442 |
| `env-parity-gap` | 测试与生产的六类差异与四项治理 | 题 5426 |
| `arch-explaining` | 怎么讲清系统架构 | 题 5456 |
| `config-ab-difference` | 配置只在 A 生效的排查 | 题 5436 |
| `cloud-migration-plan` | 自建机房上云迁移 | 题 5411 |
| `arch-evolution-plan` | 3 年架构演进规划 | 题 5421 |
| `promotion-load-test` | 大促容量评估与压测 | 题 5542 |
| `deploy-incident-triage` | 发布后故障按错误形态分诊 | 题 5502 |
| `ha-architecture` | 五层架构与每层的高可用手段、残留单点 | 题 12082 如何设计一个高可用架构？需要考虑哪些层面？ |
| `eventual-consistency` | 本地消息表/事务消息/TCC/Saga 四方案的保证点 | 题 12086 微服务架构下如何保证「最终一致」？有哪些典型方案？ |
| `distributed-lock` | Redis/ZK/DB 三种实现的命令链与三个难题 | 题 12085 分布式锁有哪些实现方式？如何保证锁的可靠性与安全性？ |
| `multiactive-multi-region` | 四模式对比：能写的地方有几处决定冲突难度 | 题 12090 异地多活的架构有哪些难点？一般怎么做？ |
| `log-trace-system` | 写入链路 + 指标→追踪→日志的收敛查询路径 | 题 12091 如何设计一套日志与链路追踪体系？怎么用它排查问题？ |
| `db-failover` | 切换七步时间轴；旧主恢复必须先降级为从 | 题 12153 数据库主从切换时，业务可能出现什么问题？如何保证切换 |
| `db-change-safety` | 三步发布 + 新旧代码/表结构的 2×2 兼容矩阵 | 题 12162 如何保障「数据库变更」的安全性？有哪些规范和流程？ |
| `health-check-design` | liveness vs readiness；检查依赖导致的雪崩重启循环 | 题 12164 如何设计一套「健康检查」机制？做错了会有什么后果？ |

