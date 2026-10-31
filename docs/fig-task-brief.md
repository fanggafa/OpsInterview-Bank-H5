# 图解生成任务分工（27 张，6 组）

每组独立创建自己的 `.vue` 文件，**不要碰 `index.js` 和 `questions.json`**（由主控统一串行处理）。

---

## 通用规范（所有组必须遵守）

### 文件模板

```vue
<script setup>
/**
 * <图解主题>（题 <题号>）。
 *
 * 核心洞察：<一句话说清这张图想让读者看到什么>
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 H" role="img" aria-label="<描述图的内容>">
      <!-- 内容 -->
    </svg>
    <figcaption><一句话总结></figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
```

### 硬性约束（`npm run check:figures` 会校验，不通过即失败）

| 项 | 要求 |
|---|---|
| `viewBox` | **`0 0 340 H`**，宽度固定 340，高度按内容计算 |
| 字号 | **最小 7px**（`font-size="7"` 是下限，正文 7.5，标题 8~8.5，图内大标题 9.5） |
| 元素越界 | 所有元素的 x+w ≤ 340，y+h ≤ H |
| 文字重叠 | 两段文字的纵向间隔 > 3px、横向重叠 > 6px 视为重叠，**必须避免** |
| 行距 | 相邻文字行距 ≥ 字号 × 1.05 |
| 合法标签 | 只用合法 SVG 标签，`<text>` 必须 `</text>` 闭合 |

### 颜色（禁止写死颜色）

| 变量 | 用途 |
|---|---|
| `var(--fig-node-a)` | 主色（第 1 类对象） |
| `var(--fig-node-b)` | 第 2 类对象 |
| `var(--fig-node-c)` | 第 3 类对象 |
| `var(--fig-node-d)` | 第 4 类对象 |
| `var(--fig-text)` | 正文文字 |
| `var(--fig-muted)` | 次要说明 |
| `var(--fig-stroke)` | 描边 |
| `#e5484d` | 仅用于「危险/坑」的强调（项目里已这么用） |

底色用法：`<rect ... fill="var(--fig-node-a)" opacity=".12" />`（浅底 + 同色文字）。

### 内容要求

- **不要只是把文字排版成方块** —— 要有**空间关系**（箭头、连线、层叠、包含）
- 每个色块内文字不超过 **4 行**，每行不超过 **26 个全角字符**（超出会被判重叠或越界）
- 图的目的是「一眼看懂关系」，不是「复述答案」
- 中文排版：数字与中文之间不加空格，单位与数字紧贴

### 参考范本

`src/components/figures/AffinityTypes.vue` 是标准写法，可先读一遍。

---

## 第 1 组：Linux 原理（5 张）

| figure-id | 文件名 | 题号 | 图类型 | 画什么 |
|---|---|---|---|---|
| `rsync-incremental` | `RsyncIncremental.vue` | 8640 | 原理 | 滚动校验增量同步：接收端切块算弱校验 → 发送端滚动比对 → 只传差异块 |
| `linux-boot-flow` | `LinuxBootFlow.vue` | 8630 | 流程 | BIOS → GRUB → 内核 → initramfs → init(systemd) → 登录，6 步竖向流程，旁注 6 vs 7 差异 |
| `process-states` | `ProcessStates.vue` | 8597 | 状态 | R/S/D/T/Z 五态圆 + 迁移箭头；标出僵尸（Z）与孤儿（被 init 收养）的位置 |
| `sudo-privilege` | `SudoPrivilege.vue` | 8646 | 原理 | 普通用户 → sudo(SUID位) → 读 sudoers → 以 root 执行 → 审计日志，含「授权编辑器=vim 等于给 shell」的警告 |
| `ansible-agentless` | `AnsibleAgentless.vue` | 8656 | 原理 | 控制机 → SSH 推送临时脚本 → 被控机执行（无需 agent）→ 汇总；对比需 agent 的方案 |

## 第 2 组：Linux 存储 + 网络分层（4 张）

| figure-id | 文件名 | 题号 | 图类型 | 画什么 |
|---|---|---|---|---|
| `link-inode` | `LinkInode.vue` | 8639 | 原理 | 目录项 → inode → 数据块；硬链接（两个目录项指向同一 inode）vs 软链接（独立 inode，内容是指向路径）；标注 link count 与「为何不能跨分区」 |
| `osi-seven-layers` | `OsiSevenLayers.vue` | 9631 | 分层 | 7 层从上到下堆叠，每层写「作用 + 典型协议/设备」；标注交换机=L2、路由器=L3 |
| `tcpip-vs-osi` | `TcpipVsOsi.vue` | 9632 | 分层 | 左 OSI 7 层，右 TCP/IP 4 层，用连接线画合并关系（5~7→应用，1~2→网络接口） |
| `nat-workflow` | `NatWorkflow.vue` | 9629 | 原理 | 内网 IP:port → NAT 改写 → 映射表 → 公网 → 回包查表还原；区分 SNAT/DNAT |

## 第 3 组：TCP 状态 + 消息队列（5 张）

| figure-id | 文件名 | 题号 | 图类型 | 画什么 |
|---|---|---|---|---|
| `tcp-state-machine` | `TcpStateMachine.vue` | 9633 | 状态 | 三次握手（CLOSED→SYN_SENT/LISTEN→SYN_RECV→ESTABLISHED）与四次挥手（FIN_WAIT_1/2→TIME_WAIT、CLOSE_WAIT→LAST_ACK）；**标注 TIME_WAIT 为何必须存在、CLOSE_WAIT 堆积是应用 bug** |
| `kafka-architecture` | `KafkaArchitecture.vue` | 4126 | 架构 | Producer → Broker集群 → Consumer Group；内部分 Topic→Partition(Leader+Follower)→Replica；ZooKeeper/KRaft 协调 |
| `rabbitmq-architecture` | `RabbitmqArchitecture.vue` | 4120 | 架构 | Producer → Exchange（4 类型）→ Binding → Queue → Consumer；旁注 vhost 与「集群≠高可用」 |
| `kafka-components` | `KafkaComponents.vue` | 4127 | 架构 | Producer(batch/linger/acks) → Broker(segment/索引/页缓存) → Consumer Group(offset/手动提交)；标出各环节优化点 |
| `kafka-ordering` | `KafkaOrdering.vue` | 4132 | 结构 | 同 key → 同 partition → 组内单消费者串行；标注三种破坏顺序的坑（改分区数、消费端多线程、异步处理） |

## 第 4 组：综合场景 · 高可用（5 张）

| figure-id | 文件名 | 题号 | 图类型 | 画什么 |
|---|---|---|---|---|
| `ha-architecture` | `HaArchitecture.vue` | 12082 | 架构 | 分层：入口(DNS/CDN) → 负载均衡(主备VIP) → 应用(无状态多实例) → 缓存/DB(主从) → 存储；每层标高可用手段 |
| `eventual-consistency` | `EventualConsistency.vue` | 12086 | 架构 | 四种方案并列：本地消息表 / 事务消息 / TCC / Saga，各画关键步骤与「保证点」 |
| `distributed-lock` | `DistributedLock.vue` | 12085 | 结构 | Redis（SET NX EX + Lua 解锁 + 看门狗续期）、ZooKeeper（临时顺序节点）、DB（唯一索引）；标出三个难题 |
| `multiactive-multi-region` | `MultiactiveMultiRegion.vue` | 12090 | 架构 | 主备 / 一写多读 / 双写 / 单元化 四模式对比；标「单元化=片内单写无冲突」是最务实方案 |
| `zero-downtime-upgrade` | `ZeroDowntimeUpgrade.vue` | 12025 | 架构 | 灰度替换：老版本+新版本并行 → LB 分流 → 验证 → 全量切 → 下线；标 JDK 升级的兼容性检查点 |

## 第 5 组：综合场景 · 运维体系（4 张）

| figure-id | 文件名 | 题号 | 图类型 | 画什么 |
|---|---|---|---|---|
| `log-trace-system` | `LogTraceSystem.vue` | 12091 | 流程 | 应用埋点 → traceId 透传 → 收集 → 存储（ES/时序库）→ 三支柱查询路径：指标发现→追踪定位→日志找因 |
| `db-failover` | `DbFailover.vue` | 12153 | 结构 | 切换七步：确认延迟0 → 旧主只读 → 停写 → 提升从库 → 切应用连接 → 验证 → 恢复读；标「旧主恢复后必须先降级为从」 |
| `db-change-safety` | `DbChangeSafety.vue` | 12162 | 流程 | 三次发布：加列(兼容) → 双写切换 → 删旧列；标「每步都可回滚」+ 危险操作（WHERE 漏写、大表DDL锁表） |
| `health-check-design` | `HealthCheckDesign.vue` | 12164 | 结构 | liveness(失败→重启) vs readiness(失败→摘流量) 对比；画「liveness 检查依赖」导致的雪崩循环 |

## 第 6 组：Nginx/LVS/Redis/RAID（4 张）

| figure-id | 文件名 | 题号 | 图类型 | 画什么 |
|---|---|---|---|---|
| `nginx-modules` | `NginxModules.vue` | 2118 | 架构 | 核心(core/events/http_core) + 常用模块(proxy/upstream/access/limit_req/gzip/ssl/log)；标「worker_processes × worker_connections = 并发上限」 |
| `lvs-three-modes` | `LvsThreeModes.vue` | 2616 | 流程 | DR（改MAC，回包不经LB）/ NAT（双向经LB）/ TUN（IP隧道，可跨机房）；三者对比表 + 各自流量路径 |
| `redis-replication` | `RedisReplication.vue` | 8132 | 原理 | 首次全量（BGSAVE+RDB+缓冲命令）→ 命令传播；断线重连（PSYNC + offest + repl_backlog 命中/不命中） |
| `raid-levels` | `RaidLevels.vue` | 4616 | 原理 | RAID 0（纯条带）/ 1（镜像）/ 5（分布式校验）/ 10（镜像+条带）四联图，每张标容量利用率与容错能力 |

---

## 交付要求

1. **只创建自己的 `.vue` 文件**到 `src/components/figures/`
2. 每张图创建后自检：
   ```bash
   node scripts/check-figure-sfc.mjs <你的文件名.vue>
   ```
   必须通过（无越界、无重叠）
3. 完成后回复：创建了哪几个文件、各自 `viewBox` 高度、自检是否通过

## 不要做的事

- ❌ 不要改 `src/components/figures/index.js`（主控统一注册）
- ❌ 不要改 `public/data/questions.json`（主控统一注入 `[[图:id]]`）
- ❌ 不要改别人的文件
- ❌ 不要写死颜色（一律用 `var(--fig-*)`）
