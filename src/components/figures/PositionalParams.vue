<script setup>
/**
 * Shell 位置参数 $0 $# $@ $* $?（题 4325）。
 *
 * 核心洞察：$@ 与 $* 在「不加引号」时看起来一样，但加了引号后
 * $@ 保持「一个参数一项」，$* 会合成「一整串」—— 这是最经典的坑。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 248" role="img" aria-label="位置参数含义，以及 @ 与星号在加引号后的关键区别">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">核心差别：加引号后 $@ 仍是多项，$* 会合并成一串</text>

      <rect x="6" y="20" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="36" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">$0</tspan>　脚本名本身（不是第一个参数）</text>

      <rect x="6" y="50" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="66" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">$#</tspan>　参数个数；常用于「至少几个参数」校验</text>

      <rect x="6" y="80" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="96" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">$?</tspan>　上一条命令退出码；0 成功，非 0 失败</text>

      <rect x="6" y="110" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="126" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">$1..$9 / ${10}</tspan>　第 N 个参数；超过 9 需用花括号</text>

      <!-- @ vs * -->
      <rect x="6" y="144" width="328" height="52" rx="5" fill="#e5484d" opacity=".12" />
      <text x="14" y="157" font-size="8.5" font-weight="700" fill="#e5484d">$@ 与 $* 的关键区别（加引号才显现）</text>
      <text x="14" y="170" font-size="7.5" fill="var(--fig-text)">"$@"　→ 每个参数各自保留（"a b" "c" 仍是两项）</text>
      <text x="14" y="182" font-size="7.5" fill="var(--fig-text)">"$*"　→ 所有参数合并成一项（"a b c"），循环时只跑一次</text>
      <text x="14" y="194" font-size="7" fill="var(--fig-node-c)">不加引号时两者行为相同（都会按空白拆分）→ 这才是坑的隐蔽之处</text>

      <rect x="6" y="206" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="223" font-size="7.5" fill="var(--fig-text)">实践：要遍历参数一律用 for arg in "$@"，绝不用 "$*"</text>

      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">补充：shift 会消耗参数；set -- 可重置参数列表</text>
    </svg>
    <figcaption>$0 脚本名、$# 个数、$? 退出码；"$@" 保持多项而 "$*" 合并成一项，遍历参数必须用 "$@"</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
