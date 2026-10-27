<script setup>
import { computed } from 'vue'
import { parseAnswerFlow, splitInline } from '@/utils/answerParts'
import { getFigure } from '@/components/figures/index'

/**
 * 答案渲染组件：结构化块渲染（标题/段落/列表/表格/代码）+ 内联 SVG 插图。
 *
 * 安全要点：**全程不使用 v-html**。
 * - 答案解析成数据（块数组、行内片段），模板里用插值渲染
 * - 表格渲染成真 <table>、列表渲染成真 <ul>/<ol>、代码渲染成 <pre><code>
 * - 插图按白名单 id 取组件渲染
 * 因此题库内容无法注入任何脚本，也不会出现「文字竖排错乱」。
 */
const props = defineProps({
  answer: { type: String, default: '' },
})

const flow = computed(() => {
  const out = []
  parseAnswerFlow(props.answer).forEach((item, idx) => {
    if (item.type === 'figure') {
      const comp = getFigure(item.id)
      out.push(
        comp
          ? { key: `f-${idx}`, type: 'figure', comp }
          : { key: `t-${idx}`, type: 'fallback', text: `[[图:${item.id}]]` }
      )
      return
    }
    out.push({ key: `b-${idx}`, type: 'blocks', blocks: item.blocks })
  })
  return out
})

/** 行内片段归一化（兼容旧的 splitEmphasis 返回值） */
function segs(list) {
  return (list || []).map((s) => ({
    text: s.text,
    strong: !!s.strong,
    code: !!s.code,
  }))
}
</script>

<template>
  <div class="answer-body">
    <template v-for="item in flow" :key="item.key">
      <component :is="item.comp" v-if="item.type === 'figure'" />

      <div v-else-if="item.type === 'fallback'" class="ans-block">
        <div class="ans-line">{{ item.text }}</div>
      </div>

      <div v-else class="ans-block">
        <template v-for="(b, bi) in item.blocks" :key="bi">
          <!-- 标题 -->
          <div v-if="b.type === 'heading'" class="ans-h" :class="`ans-h--${b.level}`">
            <template v-for="(seg, si) in b.segs" :key="si">
              <code v-if="seg.code" class="ans-code-inline">{{ seg.text }}</code>
              <strong v-else-if="seg.strong" class="ans-strong">{{ seg.text }}</strong>
              <span v-else>{{ seg.text }}</span>
            </template>
          </div>

          <!-- 表格 -->
          <div v-else-if="b.type === 'table'" class="ans-table-wrap">
            <table class="ans-table">
              <thead>
                <tr>
                  <th
                    v-for="(cell, ci) in b.header"
                    :key="ci"
                    :class="`ta-${b.align[ci] || 'left'}`"
                  >
                    <template v-for="(seg, si) in segs(cell)" :key="si">
                      <code v-if="seg.code" class="ans-code-inline">{{ seg.text }}</code>
                      <strong v-else-if="seg.strong" class="ans-strong">{{ seg.text }}</strong>
                      <span v-else>{{ seg.text }}</span>
                    </template>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, ri) in b.rows" :key="ri">
                  <td
                    v-for="(cell, ci) in row"
                    :key="ci"
                    :class="`ta-${b.align[ci] || 'left'}`"
                  >
                    <template v-for="(seg, si) in segs(cell)" :key="si">
                      <code v-if="seg.code" class="ans-code-inline">{{ seg.text }}</code>
                      <strong v-else-if="seg.strong" class="ans-strong">{{ seg.text }}</strong>
                      <span v-else>{{ seg.text }}</span>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 列表 -->
          <ul v-else-if="b.type === 'list' && !b.ordered" class="ans-list">
            <li
              v-for="(it, ii) in b.items"
              :key="ii"
              :class="it.depth ? `ans-list__item--d${it.depth}` : ''"
            >
              <span class="ans-list__dot" aria-hidden="true"></span>
              <span class="ans-list__txt">
                <template v-for="(seg, si) in segs(it.segs)" :key="si">
                  <code v-if="seg.code" class="ans-code-inline">{{ seg.text }}</code>
                  <strong v-else-if="seg.strong" class="ans-strong">{{ seg.text }}</strong>
                  <span v-else>{{ seg.text }}</span>
                </template>
                <span v-for="(ex, ei) in it.extra || []" :key="`x${ei}`" class="ans-list__extra">{{ ex }}</span>
              </span>
            </li>
          </ul>
          <ol v-else-if="b.type === 'list' && b.ordered" class="ans-list ans-list--ol">
            <li
              v-for="(it, ii) in b.items"
              :key="ii"
              :class="it.depth ? `ans-list__item--d${it.depth}` : ''"
            >
              <span class="ans-list__num" aria-hidden="true">{{ ii + 1 }}</span>
              <span class="ans-list__txt">
                <template v-for="(seg, si) in segs(it.segs)" :key="si">
                  <code v-if="seg.code" class="ans-code-inline">{{ seg.text }}</code>
                  <strong v-else-if="seg.strong" class="ans-strong">{{ seg.text }}</strong>
                  <span v-else>{{ seg.text }}</span>
                </template>
                <span v-for="(ex, ei) in it.extra || []" :key="`x${ei}`" class="ans-list__extra">{{ ex }}</span>
              </span>
            </li>
          </ol>

          <!-- 代码块 -->
          <div v-else-if="b.type === 'code'" class="ans-pre">
            <span v-if="b.lang" class="ans-pre__lang">{{ b.lang }}</span>
            <pre class="ans-pre__body"><code>{{ b.lines.join('\n') }}</code></pre>
          </div>

          <!-- 分隔线 -->
          <hr v-else-if="b.type === 'hr'" class="ans-hr" />

          <!-- 引用 -->
          <blockquote v-else-if="b.type === 'quote'" class="ans-quote">{{ b.text }}</blockquote>

          <!-- 段落 -->
          <p v-else class="ans-p">
            <template v-for="(seg, si) in segs(b.segs)" :key="si">
              <code v-if="seg.code" class="ans-code-inline">{{ seg.text }}</code>
              <strong v-else-if="seg.strong" class="ans-strong">{{ seg.text }}</strong>
              <span v-else>{{ seg.text }}</span>
            </template>
          </p>
        </template>
      </div>
    </template>
  </div>
</template>

<style scoped>
.answer-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ans-block {
  font-size: 13.5px;
  line-height: 1.75;
  color: var(--c-text);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 段落：中文优先正文字体，不再全局等宽 */
.ans-p {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 标题 */
.ans-h {
  font-weight: 700;
  color: var(--c-text);
  letter-spacing: 0.2px;
}
.ans-h--1,
.ans-h--2 {
  font-size: 14.5px;
  padding-left: 9px;
  border-left: 3px solid var(--c-primary);
  line-height: 1.5;
}
.ans-h--3,
.ans-h--4,
.ans-h--5,
.ans-h--6 {
  font-size: 13.5px;
  color: var(--c-primary);
}

/* 强调与行内代码 */
.ans-strong {
  font-weight: 700;
  color: var(--c-text);
}
.ans-code-inline {
  font-family: var(--mono);
  font-size: 0.88em;
  padding: 1px 5px;
  border-radius: 5px;
  background: var(--c-code-bg);
  color: var(--c-code-text);
  border: 1px solid var(--c-code-border);
  word-break: break-word;
}

/* 表格 */
.ans-table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: var(--radius-sm);
  border: 1px solid var(--c-border);
  background: var(--c-card);
}
.ans-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
  line-height: 1.55;
}
.ans-table th {
  background: var(--c-table-head);
  color: var(--c-text);
  font-weight: 700;
  padding: 7px 9px;
  text-align: left;
  white-space: nowrap;
  border-bottom: 1px solid var(--c-border);
}
.ans-table td {
  padding: 7px 9px;
  border-bottom: 1px solid var(--c-table-line);
  vertical-align: top;
}
.ans-table tbody tr:last-child td {
  border-bottom: none;
}
.ans-table tbody tr:nth-child(even) {
  background: var(--c-table-zebra);
}
.ans-table .ta-center {
  text-align: center;
}
.ans-table .ta-right {
  text-align: right;
}

/* 列表 */
.ans-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ans-list > li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.ans-list__dot {
  flex: none;
  width: 5px;
  height: 5px;
  margin-top: 0.62em;
  border-radius: 50%;
  background: var(--c-primary);
  opacity: 0.85;
}
.ans-list__num {
  flex: none;
  min-width: 17px;
  height: 17px;
  margin-top: 0.18em;
  border-radius: 5px;
  background: var(--c-primary-weak);
  color: var(--c-primary);
  font-size: 11px;
  font-weight: 700;
  line-height: 17px;
  text-align: center;
  font-family: var(--mono);
}
.ans-list__txt {
  flex: 1;
  min-width: 0;
  word-break: break-word;
}
/* 列表项下的缩进续行（多为命令或补充说明） */
.ans-list__extra {
  display: block;
  margin-top: 2px;
  padding-left: 2px;
  font-family: var(--mono);
  font-size: 12px;
  line-height: 1.6;
  color: var(--c-text-2);
  white-space: pre-wrap;
}
.ans-list__item--d1 {
  margin-left: 15px;
}
.ans-list__item--d2 {
  margin-left: 30px;
}

/* 代码块 */
.ans-pre {
  position: relative;
  border-radius: var(--radius-sm);
  background: var(--c-code-bg);
  border: 1px solid var(--c-code-border);
  overflow: hidden;
}
.ans-pre__lang {
  display: block;
  padding: 4px 10px;
  font-family: var(--mono);
  font-size: 10.5px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--c-text-3);
  background: var(--c-code-head);
  border-bottom: 1px solid var(--c-code-border);
}
.ans-pre__body {
  margin: 0;
  padding: 9px 11px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  font-family: var(--mono);
  font-size: 12px;
  line-height: 1.65;
  color: var(--c-code-text);
  white-space: pre;
  tab-size: 2;
}
.ans-pre__body code {
  font: inherit;
}

/* 引用与分隔线 */
.ans-quote {
  margin: 0;
  padding: 7px 11px;
  border-left: 3px solid var(--c-border);
  background: var(--c-bg);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  color: var(--c-text-2);
}
.ans-hr {
  margin: 2px 0;
  border: none;
  height: 1px;
  background: var(--c-border);
}
</style>
