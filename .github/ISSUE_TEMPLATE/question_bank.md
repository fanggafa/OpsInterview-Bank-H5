---
name: 新增或修正题目
about: 提交新题目，或指出已有题目的答案错误
title: '[题库] '
labels: question-bank
---

## 类型

- [ ] 新增题目
- [ ] 修正已有题目（答案 / 解析 / 分类有误）
- [ ] 删除重复或有争议的题目

## 涉及题目

<!-- 修正类请给出题号，如「#73 单选题」 -->

## 内容

<!--
新增题目请按下面格式填写。注意：
- 简答题和选择题应是【不同知识点】，不要把简答题改写成选项形式凑数
- answer 里不要出现未转义的英文双引号
- 选择题的 key 必须是从 A 开始的连续大写字母
-->

```json
{
  "id": 0,
  "type": "short",
  "category": "Linux基础",
  "difficulty": "中等",
  "question": "题干",
  "answer": "参考答案（纯文本，可用 \\n 换行）",
  "tags": ["标签1", "标签2"],
  "frequency": "高频"
}
```

选择题参考：

```json
{
  "id": 0,
  "type": "single",
  "category": "MySQL",
  "difficulty": "中等",
  "question": "题干",
  "options": [
    { "key": "A", "text": "选项 A" },
    { "key": "B", "text": "选项 B" },
    { "key": "C", "text": "选项 C" },
    { "key": "D", "text": "选项 D" }
  ],
  "answer": ["C"],
  "explanation": "解析（≥10 字）",
  "tags": ["标签1", "标签2"],
  "frequency": "高频"
}
```

## 自查

- [ ] 已确认该知识点与现有题目不重复（可先搜一下）
- [ ] 分类、难度、频率使用的是合法枚举值
- [ ] 本地跑过 `npm run validate:data` 并通过
