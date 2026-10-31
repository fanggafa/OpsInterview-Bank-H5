<script setup>
/**
 * 硬链接与软链接的实现原理（题 8639）。
 *
 * 核心洞察：目录项 → inode → 数据块是三段跳；
 * 硬链接只是「多一个目录项指向同一个 inode」，软链接则是「另建一个 inode，
 * 里面存的只是目标路径字符串」—— 后者能跨分区、前者不行，根子在 inode 编号只在本分区唯一。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 318" role="img" aria-label="硬链接两个目录项指向同一 inode 同一份数据块；软链接另建 inode 只存路径字符串，靠路径解析回目标 inode；硬链接不能跨分区因为 inode 编号只在单个文件系统内唯一">
      <defs>
        <marker id="arrLink" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-a)" />
        </marker>
        <marker id="arrLinkB" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-b)" />
        </marker>
      </defs>

      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">硬链接共享同一个 inode；软链接另建 inode，内容是路径</text>

      <!-- 硬链接 -->
      <rect x="4" y="18" width="332" height="88" rx="6" fill="var(--fig-node-a)" opacity=".08" />
      <text x="12" y="32" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">硬链接 ln a b：两个目录项 → 同一个 inode</text>

      <text x="38" y="44" text-anchor="middle" font-size="7" fill="var(--fig-muted)">目录项</text>
      <text x="142" y="44" text-anchor="middle" font-size="7" fill="var(--fig-muted)">inode</text>
      <text x="263" y="44" text-anchor="middle" font-size="7" fill="var(--fig-muted)">数据块</text>

      <rect x="8" y="50" width="60" height="18" rx="3" fill="var(--fig-node-a)" opacity=".16" />
      <text x="38" y="63" text-anchor="middle" font-size="7.5" fill="var(--fig-text)">a.txt</text>
      <rect x="8" y="74" width="60" height="18" rx="3" fill="var(--fig-node-a)" opacity=".16" />
      <text x="38" y="87" text-anchor="middle" font-size="7.5" fill="var(--fig-text)">b.txt</text>

      <path d="M70 59 L96 62" stroke="var(--fig-node-a)" stroke-width="1.4" marker-end="url(#arrLink)" />
      <path d="M70 83 L96 84" stroke="var(--fig-node-a)" stroke-width="1.4" marker-end="url(#arrLink)" />

      <rect x="100" y="50" width="84" height="42" rx="5" fill="var(--fig-node-a)" opacity=".14" />
      <rect x="100" y="50" width="84" height="42" rx="5" fill="none" stroke="var(--fig-node-a)" stroke-width="1.2" />
      <text x="142" y="63" text-anchor="middle" font-size="8" font-weight="700" fill="var(--fig-node-a)">inode #12345</text>
      <text x="142" y="75" text-anchor="middle" font-size="7.5" fill="var(--fig-text)">属主/权限/时间戳</text>
      <text x="142" y="87" text-anchor="middle" font-size="7.5" font-weight="700" fill="var(--fig-node-a)">Links: 2</text>

      <path d="M186 72 L197 72" stroke="var(--fig-node-a)" stroke-width="1.4" marker-end="url(#arrLink)" />

      <rect x="200" y="54" width="126" height="34" rx="5" fill="var(--fig-node-a)" opacity=".14" />
      <text x="263" y="68" text-anchor="middle" font-size="7.5" font-weight="700" fill="var(--fig-node-a)">数据块（文件内容）</text>
      <text x="263" y="80" text-anchor="middle" font-size="7.5" fill="var(--fig-text)">只存一份，两个名字共用</text>

      <text x="12" y="100" font-size="7.5" fill="var(--fig-muted)">rm 只是把 Links 减 1；减到 0 才真正释放数据块</text>

      <!-- 软链接 -->
      <rect x="4" y="112" width="332" height="96" rx="6" fill="var(--fig-node-b)" opacity=".08" />
      <text x="12" y="126" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">软链接 ln -s：独立 inode，内容是目标路径字符串</text>

      <rect x="8" y="142" width="60" height="26" rx="3" fill="var(--fig-node-b)" opacity=".16" />
      <text x="38" y="160" text-anchor="middle" font-size="8" fill="var(--fig-text)">s.txt</text>

      <path d="M70 158 L96 158" stroke="var(--fig-node-b)" stroke-width="1.4" marker-end="url(#arrLinkB)" />

      <rect x="100" y="136" width="96" height="56" rx="5" fill="var(--fig-node-b)" opacity=".14" />
      <rect x="100" y="136" width="96" height="56" rx="5" fill="none" stroke="var(--fig-node-b)" stroke-width="1.2" />
      <text x="148" y="150" text-anchor="middle" font-size="8" font-weight="700" fill="var(--fig-node-b)">inode #20002</text>
      <text x="148" y="162" text-anchor="middle" font-size="7.5" fill="var(--fig-text)">内容 = 路径字符串</text>
      <text x="148" y="174" text-anchor="middle" font-size="7.5" fill="var(--fig-node-b)">「/data/c.txt」</text>
      <text x="148" y="186" text-anchor="middle" font-size="7" fill="var(--fig-muted)">自己不指向数据块</text>

      <path d="M198 164 L231 164" stroke="var(--fig-node-b)" stroke-width="1.4" stroke-dasharray="4 3" marker-end="url(#arrLinkB)" />

      <rect x="234" y="140" width="92" height="46" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="280" y="154" text-anchor="middle" font-size="8" font-weight="700" fill="var(--fig-node-a)">目标 inode</text>
      <text x="280" y="166" text-anchor="middle" font-size="7.5" fill="var(--fig-text)">按路径解析</text>
      <text x="280" y="178" text-anchor="middle" font-size="7.5" fill="var(--fig-text)">与编号无关</text>

      <text x="12" y="203" font-size="7.5" fill="#e5484d">目标被删 → 指针悬空（断链），而硬链接的数据仍在</text>

      <!-- 为什么不能跨分区 -->
      <rect x="4" y="214" width="332" height="84" rx="6" fill="var(--fig-node-c)" opacity=".08" />
      <text x="12" y="228" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">为何硬链接不能跨分区：inode 编号只在单个文件系统内唯一</text>

      <rect x="12" y="238" width="110" height="30" rx="4" fill="var(--fig-node-c)" opacity=".14" />
      <text x="67" y="251" text-anchor="middle" font-size="7.5" fill="var(--fig-text)">/dev/sda1</text>
      <text x="67" y="263" text-anchor="middle" font-size="7" fill="var(--fig-node-c)">inode #12345</text>
      <rect x="136" y="238" width="110" height="30" rx="4" fill="var(--fig-node-c)" opacity=".14" />
      <text x="191" y="251" text-anchor="middle" font-size="7.5" fill="var(--fig-text)">/dev/sdb1</text>
      <text x="191" y="263" text-anchor="middle" font-size="7" fill="var(--fig-node-c)">inode #12345</text>

      <text x="12" y="281" font-size="7.5" fill="var(--fig-text)">两个分区各有独立 inode 表，编号会重复</text>
      <text x="12" y="292" font-size="7.5" fill="var(--fig-node-c)">内核无法判断「第 12345 号」属于哪个分区 → 禁止</text>

      <text x="6" y="310" font-size="7.5" fill="var(--fig-muted)">坑：rm 后空间没释放 → 进程还持有句柄，lsof | grep deleted</text>
    </svg>
    <figcaption>硬链接 = 多个目录项指向同一 inode（Links 计数）；软链接 = 独立 inode 存路径；跨分区不行因为 inode 编号按文件系统独立</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
