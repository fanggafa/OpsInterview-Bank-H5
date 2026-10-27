/**
 * 插图注册表：把答案里的 [[图:id]] 映射到内联 SVG 组件。
 *
 * 为什么用内联 SVG 而不是图片文件：
 * - 零额外请求、可离线、随主题自动变色（用 currentColor）
 * - 不引入 v-html，标记只认白名单 id，避免 XSS
 *
 * 新增插图：在 figures/ 下加一个 .vue 组件，然后在此登记一行。
 */
import DnsResolve from './DnsResolve.vue'
import DnsRecordTypes from './DnsRecordTypes.vue'
import IptablesChainFlow from './IptablesChainFlow.vue'
import NginxLocationMatch from './NginxLocationMatch.vue'
import NginxProxyPass from './NginxProxyPass.vue'

/** @type {Record<string, object>} */
export const FIGURES = {
  'dns-resolve': DnsResolve,
  'dns-record-types': DnsRecordTypes,
  'iptables-chain-flow': IptablesChainFlow,
  'nginx-location-match': NginxLocationMatch,
  'nginx-proxy-pass': NginxProxyPass,
}

/**
 * 按 id 取组件。
 * @param {string} id
 * @returns {object|null}
 */
export function getFigure(id) {
  return FIGURES[id] || null
}
