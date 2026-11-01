# 插图规范

> 说明「插图怎么写、怎么注册、溢出怎么修」。
> 完整注册表见 [figures-registry](figures-registry.md)，出题规范见 [question-authoring](question-authoring.md)。

## 这是什么

部分简答题的参考答案里带**内联 SVG 图解**，用来表达流程、链路、优先级对比这类
文字难说清的内容。当前共 **363 张**，分属 26 个分类。

在 `answer` 字段里写标记即可引用：

```json
{
  "answer": "按先后顺序共 5 步：\n\n1. 浏览器缓存\n2. /etc/hosts\n\n[[图:dns-resolve]]\n\n一句话记：缓存越靠前越快。"
}
```

渲染时 `[[图:id]]` 会被替换成对应的 SVG 组件。**选择题只能写在 `explanation` 里**
（选择题的答案位是选项 key，不能放图标记）。

## 文件模板

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

## 硬性约束

`npm run check:figures` 与 `check:figure-sfc` 会校验，**不通过即失败**：

| 项 | 要求 |
|---|---|
| `viewBox` | **`0 0 340 H`**，宽度固定 340，高度按内容计算 |
| **字号** | **最小 7px**（`font-size="7"` 是下限；正文 7.5，标题 8~8.5，图内大标题 9.5） |
| 元素越界 | 所有元素 `x+w ≤ 340`，`y+h ≤ H` |
| 文字重叠 | 两段文字纵向间隔 > 3px 且横向重叠 > 6px 视为重叠，**必须避免** |
| 行距 | 相邻文字行距 ≥ 字号 × 1.05 |
| 合法标签 | 只用合法 SVG 标签，`<text>` 必须 `</text>` 闭合 |
| SFC 完整性 | `</style>` 之后不能再有任何内容（Windows 上不一定报错，CI 会崩） |
| **`<path>` 线条** | **必须带 `fill="none"`** —— 否则折线会被自动闭合填充成黑色块 |

> 最后一条踩过：`LvsThreeModes.vue` 有 4 条 `M` + `L` 的 polyline 缺 `fill="none"`，
> 渲染时整片涂黑。全库扫描后确认只有那几处。

## 颜色（禁止写死颜色）

| 变量 | 用途 |
|---|---|
| `var(--fig-node-a)` | 主色（第 1 类对象） |
| `var(--fig-node-b)` | 第 2 类对象 |
| `var(--fig-node-c)` | 第 3 类对象 |
| `var(--fig-node-d)` | 第 4 类对象 |
| `var(--fig-text)` | 正文文字 |
| `var(--fig-muted)` | 次要说明 |
| `var(--fig-stroke)` | 描边、分隔虚线 |
| `var(--fig-bg)` | 插图容器渐变背景 |
| `#e5484d` | **仅**用于「危险/坑」的强调 |

**不要用 `currentColor`** —— 深色主题下全灰看不清。

底色用法：`<rect ... fill="var(--fig-node-a)" opacity=".12" />`（浅底 + 同色文字）。
四个节点色在深色主题下会自动提亮（见 `styles.css` 的 `[data-theme='dark']` 段）。

## 内容要求

- **必须能表达「文字难说清」的东西**：流程、链路、优先级、对比、状态机。
  **不要为了配图而配图。**
- 每张图配 **一句结论式 `figcaption`**，写明「这张图想让人记住的判断」。
- SVG 里的文字要**短**（单行不超过约 30 个全角字符），否则窄屏会溢出。
- 只调排版时**不要改写内容语义**，技术点、命令、口诀全部保留。

## 新增一张插图

1. 在 `src/components/figures/` 下新建 `.vue` 组件（照抄现有文件结构）
2. 在 `src/components/figures/index.js` 的 `FIGURES` 里登记一行
3. 在题目答案里写 `[[图:你的-id]]`
4. 在 [figures-registry.md](figures-registry.md) 追加一行（**否则清单与实际不符**）
5. 跑 `npm run check:figures && npm run check:figure-sfc`

**id 只允许小写字母、数字和连字符**（正则 `[a-z0-9-]+`）。
写错或未注册的 id 会原样显示成文本，不会注入任何 HTML。

## 看大图：双击打开 + 滚轮/双指缩放

SVG 画布固定 340 宽，在手机上被缩到 ~0.85 倍，7.5~9px 的标注字实际只剩 6~8px。
所以给了「点开看大的」出口：

- **点任意图解** → 全屏查看层（`Teleport` 到 body，锁背景滚动、吞掉刷题快捷键）
- **桌面：滚轮缩放**；**移动端：双指缩放**
- 缩放范围 **0.35 ~ 5 倍**；双击复位；`Esc` / 点空白 / ✕ 关闭

**图宽按可视区平铺，不是固定像素**：

```css
.ans-zoom__inner        { box-sizing: border-box; width: 100%; }
.ans-zoom__inner .fig   { width: calc(100% * var(--zoom, 1)); }
```

**为什么用 CSS 宽度而不是 `transform: scale()`**：transform 不改变布局尺寸，
滚动范围不会跟着变，放大后超出屏幕的部分拖不过去，等于被裁掉。

实现见 `src/utils/pinch.js`，几个容易踩的坑：

| 坑 | 现象 | 处理 |
|---|---|---|
| `touch-action: pan-x pan-y` 会禁用 pinch-zoom | 两指一捏图没动（浏览器接管并 `pointercancel`） | 第二根手指落下瞬间把 `touch-action` 改成 `none`，抬起/取消/解绑还原 |
| 单指也挂 window 监听 | **单指一挪图就缩放**（抬起记录清不掉） | 第一个 `pointerdown` 就挂监听，`up/cancel` 都清记录 |
| 起手间距直接当分母 | **轻轻一挪就放很大**（25px→50px 就是 2 倍） | 分母下限 48px + 6% 死区 + 0.62 次幂阻尼 |
| `margin: 0 auto` 居中超宽子元素 | 放大后左侧被推到容器外、滚不回来 | 内层 flex + `flex-start`，子项 `flex: 0 0 auto` |
| 缩放下限设成 1 | **只能放大不能缩小** | 下限放到 0.35 |

## 文字溢出修复规则

所有插图都画在固定宽度的 `viewBox` 里，用绝对坐标 `<text x= y=>` 摆放文字。
**超出画布右边界的内容会被 SVG 直接裁掉**，放大也救不回来（裁切发生在画布坐标系里）。
用户反馈的「虽然可以点击放大，但是图片内容显示不全」就是这个原因。

检查脚本：`node scripts/check-figure-text.mjs`。它按字符宽度估算每条 `<text>` 的
实际横向占用，报出超界的位置与超出像素。

### 修复原则

1. **不要缩小字号**。字号本来就是「手机上太小看不清」的根因，
   缩小字号等于制造新问题。现有字号保持不变。
2. **拆行**。把一句长的说明拆成两条 `<text>`，第二条 `y` 加 12（行高）。
3. **挪起点**。若某行文字从很靠右的 x 开始（如 130、180），
   改到左侧单独起行，或整段右移改左对齐。
4. **加高画布**。拆行后内容变高，`viewBox` 的高度要相应加足（留 6~10px 余量），
   否则会变成「底部溢出」。宽度 `340` 保持不变。
5. **保持原有配色、节点、箭头、结构不动**，只调文字的行与画布高度。
6. 改完后必须让 `check-figure-text.mjs` 不再报错。

### 示例（`CpuBottleneckTree.vue`，已按此修好）

修改前（一条 8.5px 文本写到 x=397，超出 61px 被裁）：

```html
<rect x="6" y="48" width="328" height="24" rx="5" fill="var(--fig-node-b)" opacity=".1" />
<text x="14" y="63" font-size="9" font-weight="700" fill="var(--fig-node-b)">sy 高</text>
<text x="66" y="63" font-size="8.5" fill="var(--fig-text)">内核态忙 → 系统调用频繁：上下文切换、连接风暴、文件描述符操作、sysbench 类压测</text>
```

修改后（拆成两行，色块加高到 32，画布从 232 加到 286）：

```html
<rect x="6" y="56" width="328" height="32" rx="5" fill="var(--fig-node-b)" opacity=".1" />
<text x="14" y="77" font-size="9" font-weight="700" fill="var(--fig-node-b)">sy 高</text>
<text x="72" y="71" font-size="8.5" fill="var(--fig-text)">内核态忙 → 系统调用频繁：上下文切换、连接风暴、</text>
<text x="72" y="83" font-size="8.5" fill="var(--fig-text)">文件描述符操作、sysbench 类压测</text>
```

注意左右两块文字起点不同（`14` 是标签，`72` 是说明），说明文字第一行 `y` 比标签略高
（71 vs 77），第二行在 83 —— 两行大致以标签基线上下对称。
拆分时尽量在「、」「→」「：」「——」这些自然断点处断开。

## 为什么插图不用异步加载

`defineAsyncComponent` 会让图在测试环境里渲染不出来，破坏现有测试。
**这是明确决定不做的**，不要为了减小首屏体积去改。
