import { describe, expect, it } from 'vitest'
import { highlightSegments, splitKeywords } from '@/utils/highlight'

/**
 * 关键词高亮的切分逻辑。
 *
 * 重点覆盖「容易出错但用户一眼能看出」的边界：
 * 大小写、多关键词、重叠、命中在开头/结尾、无命中、空输入。
 */

describe('splitKeywords', () => {
  it('按空白分隔并转小写', () => {
    expect(splitKeywords('Nginx 反向代理')).toEqual(['nginx', '反向代理'])
  })

  it('忽略多余空格与空项，并去重', () => {
    expect(splitKeywords('  nginx   NGINX  ')).toEqual(['nginx'])
  })

  it('空输入返回空数组', () => {
    expect(splitKeywords('')).toEqual([])
    expect(splitKeywords(null)).toEqual([])
  })
})

describe('highlightSegments', () => {
  it('无关键词时整段作为未命中返回（调用方无需分支）', () => {
    expect(highlightSegments('三次握手发生在哪个层', '')).toEqual([
      { text: '三次握手发生在哪个层', hit: false },
    ])
  })

  it('命中在中间：切成 前/命中/后 三段', () => {
    const segs = highlightSegments('三次握手发生在哪个层', '握手')
    expect(segs).toEqual([
      { text: '三次', hit: false },
      { text: '握手', hit: true },
      { text: '发生在哪个层', hit: false },
    ])
  })

  it('命中在开头：只有 命中/后 两段', () => {
    const segs = highlightSegments('Nginx 的 location 匹配', 'Nginx')
    expect(segs[0]).toEqual({ text: 'Nginx', hit: true })
    expect(segs).toHaveLength(2)
  })

  it('命中在结尾：最后一段是命中', () => {
    const segs = highlightSegments('什么是 inode', 'inode')
    const last = segs[segs.length - 1]
    expect(last).toEqual({ text: 'inode', hit: true })
  })

  it('大小写不敏感，但保留原文大小写', () => {
    const segs = highlightSegments('Nginx 反向代理', 'nginx')
    expect(segs[0]).toEqual({ text: 'Nginx', hit: true })
  })

  it('多个关键词都能命中', () => {
    const segs = highlightSegments('Nginx 反向代理与 LVS 负载均衡', 'nginx lvs')
    const hits = segs.filter((s) => s.hit).map((s) => s.text)
    expect(hits).toEqual(['Nginx', 'LVS'])
  })

  it('同一处被多个关键词重叠命中时合并为一个片段', () => {
    // "abc" 与 "bc" 都命中开头处，应合并成一个 mark，而不是两个
    const segs = highlightSegments('abcdef', 'abc bc')
    const hits = segs.filter((s) => s.hit)
    expect(hits).toHaveLength(1)
    expect(hits[0].text).toBe('abc')
    // 剩下的非命中部分
    expect(segs[segs.length - 1]).toEqual({ text: 'def', hit: false })
  })

  it('相邻命中区间合并（不会出现两个紧挨的 mark）', () => {
    const segs = highlightSegments('abcd', 'ab cd')
    const hits = segs.filter((s) => s.hit)
    expect(hits).toHaveLength(1)
    expect(hits[0].text).toBe('abcd')
  })

  it('无命中时返回整段未命中', () => {
    const segs = highlightSegments('三次握手', 'xyz')
    expect(segs).toEqual([{ text: '三次握手', hit: false }])
  })

  it('拼接所有片段等于原文（不丢字、不重复）', () => {
    const cases = [
      ['三次握手发生在哪个层', '握手'],
      ['Nginx 反向代理与 LVS 负载均衡', 'nginx lvs'],
      ['abcdef', 'abc bc'],
      ['abcd', 'ab cd'],
      ['无命中文本', 'xyz'],
    ]
    for (const [text, kw] of cases) {
      const joined = highlightSegments(text, kw)
        .map((s) => s.text)
        .join('')
      expect(joined).toBe(text)
    }
  })

  it('空文本返回空数组', () => {
    expect(highlightSegments('', 'x')).toEqual([])
    expect(highlightSegments(null, 'x')).toEqual([])
  })

  it('关键词比文本长时不命中', () => {
    expect(highlightSegments('ab', 'abcdef')).toEqual([{ text: 'ab', hit: false }])
  })

  it('中文多字关键词正确命中', () => {
    const segs = highlightSegments('什么是静态 Pod 与动态 Pod', '动态')
    expect(segs.filter((s) => s.hit)[0].text).toBe('动态')
  })
})
