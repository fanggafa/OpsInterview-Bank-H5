<script setup>
import { computed } from 'vue'
import { parseAnswer, splitEmphasis } from '@/utils/answerParts'
import { getFigure } from '@/components/figures/index'

/**
 * 答案渲染组件：纯文本（支持 **强调**）+ 可选内联 SVG 插图。
 *
 * 安全要点：**全程不使用 v-html**。
 * - 答案里的 [[图:id]] 被解析成片段，插图按白名单 id 取组件渲染
 * - **强调** 被拆成行内片段，普通插值（自动转义）
 * 因此题库内容无法注入任何脚本。
 */
const props = defineProps({
  answer: { type: String, default: '' },
})

/** 把文本段落在按行切分后，逐行拆强调片段，保持换行语义 */
const items = computed(() => {
  const parts = parseAnswer(props.answer)
  const out = []

  parts.forEach((p, i) => {
    if (p.type === 'figure') {
      const comp = getFigure(p.id)
      out.push(
        comp
          ? { key: `f-${i}`, type: 'figure', comp }
          : { key: `t-${i}`, type: 'text', lines: [{ segs: [{ text: `[[图:${p.id}]]`, strong: false }] }] }
      )
      return
    }

    // 按行切分，每行再拆强调；用 div 承载以保证 pre 的换行与缩进
    const lines = p.text.split('\n').map((line) => ({ segs: splitEmphasis(line) }))
    out.push({ key: `t-${i}`, type: 'text', lines })
  })

  return out
})
</script>

<template>
  <div class="answer-body">
    <template v-for="item in items" :key="item.key">
      <div v-if="item.type === 'text'" class="ans-block">
        <div v-for="(line, li) in item.lines" :key="li" class="ans-line">
          <template v-for="(seg, si) in line.segs" :key="si">
            <strong v-if="seg.strong" class="ans-strong">{{ seg.text }}</strong>
            <span v-else>{{ seg.text }}</span>
          </template>
          <!-- 空行需要占位高度，否则整段被压扁 -->
          <br v-if="!line.segs.length || !line.segs.some((s) => s.text)" />
        </div>
      </div>
      <component :is="item.comp" v-else />
    </template>
  </div>
</template>

<style scoped>
.answer-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ans-block {
  font-family: var(--mono);
  font-size: 13px;
  line-height: 1.7;
  color: var(--c-text);
}
.ans-line {
  white-space: pre-wrap;
  word-break: break-word;
  min-height: 1.7em;
}
.ans-strong {
  font-weight: 700;
  color: var(--c-text);
}
</style>
