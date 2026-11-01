/**
 * 生成 PWA 图标（纯 Node，不引入图像库）。
 *
 * 为什么自己画：项目没有 sharp/canvas/pngjs，为一个图标装图像库（几十 MB）
 * 不值得。PNG 的最小可用格式（单 IDAT + 无滤波）用 zlib 就能拼出来。
 *
 * 图标设计：圆角方块底 + 一个书页/对勾的几何图形，配色与站点主色一致。
 * 输出 192 / 512 两个尺寸 + 一个 SVG（favicon 用）。
 */
import { writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

/** 主色（与站点 --c-primary 同系） */
const BG = [0x1f, 0x6f, 0xeb] // #1f6feb
const FG = [0xff, 0xff, 0xff]
const ACC = [0x9e, 0xd0, 0xff] // 浅蓝，做层次

/**
 * 生成 RGBA 像素缓冲并编码成 PNG。
 *
 * @param {number} size 边长
 * @returns {Buffer} PNG 文件内容
 */
function makePng(size) {
  const px = Buffer.alloc(size * size * 4)

  const set = (x, y, r, g, b, a = 255) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return
    const i = (y * size + x) * 4
    px[i] = r
    px[i + 1] = g
    px[i + 2] = b
    px[i + 3] = a
  }

  const S = size
  // 圆角矩形底：圆角半径 = 22% 边长
  const R = Math.round(S * 0.22)
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      // 判断是否在圆角矩形内
      const cx = Math.min(x, S - 1 - x)
      const cy = Math.min(y, S - 1 - y)
      let inside = true
      if (cx < R && cy < R) {
        const dx = R - cx
        const dy = R - cy
        inside = dx * dx + dy * dy <= R * R
      }
      if (inside) set(x, y, BG[0], BG[1], BG[2])
    }
  }

  /** 画一条粗线（用距离判定，简单但够用） */
  const line = (x1, y1, x2, y2, w, color) => {
    const steps = S * 2
    for (let t = 0; t <= steps; t++) {
      const p = t / steps
      const cx = Math.round(x1 + (x2 - x1) * p)
      const cy = Math.round(y1 + (y2 - y1) * p)
      const rw = Math.round(w / 2)
      for (let dy = -rw; dy <= rw; dy++) {
        for (let dx = -rw; dx <= rw; dx++) {
          if (dx * dx + dy * dy <= rw * rw) {
            set(cx + dx, cy + dy, color[0], color[1], color[2])
          }
        }
      }
    }
  }

  // 三条横线 = 「题库条目」的意象
  const lw = Math.round(S * 0.045)
  const x0 = Math.round(S * 0.24)
  const x1 = Math.round(S * 0.76)
  line(x0, Math.round(S * 0.34), x1, Math.round(S * 0.34), lw, FG)
  line(x0, Math.round(S * 0.5), x1, Math.round(S * 0.5), lw, ACC)
  line(x0, Math.round(S * 0.66), Math.round(S * 0.6), Math.round(S * 0.66), lw, FG)

  return encodePng(px, S, S)
}

/** 最小 PNG 编码：IHDR + IDAT + IEND，RGBA8、无滤波 */
function encodePng(rgba, w, h) {
  const raw = Buffer.alloc((w * 4 + 1) * h)
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0 // filter: None
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4)
  }

  const chunk = (type, data) => {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length)
    const typeBuf = Buffer.from(type, 'ascii')
    const body = Buffer.concat([typeBuf, data])
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(body) >>> 0)
    return Buffer.concat([len, body, crc])
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type: RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/** CRC32（PNG 用的标准多项式） */
function crc32(buf) {
  let c
  const table = []
  for (let n = 0; n < 256; n++) {
    c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

// 输出
for (const size of [192, 512]) {
  const png = makePng(size)
  writeFileSync(`public/icon-${size}.png`, png)
  console.log(`✓ public/icon-${size}.png  ${(png.length / 1024).toFixed(1)} KB`)
}

/**
 * iOS 的「添加到主屏幕」**只认 apple-touch-icon**，不看 web manifest 的 icons。
 * 缺它时 iOS 会拿页面截图缩成一个图标，看起来像「快捷方式」而不是应用。
 *
 * 尺寸规范：Apple 推荐 180×180（iPhone @3x），并且**不留透明通道、不做圆角** ——
 * iOS 会自己加圆角遮罩，我们自己mask 反而会出现「圆角套圆角」的毛边。
 * makePng 画的就是不透明底 + 方角图形，正好符合。
 */
const APPLE_SIZE = 180
const applePng = makePng(APPLE_SIZE)
writeFileSync('public/apple-touch-icon.png', applePng)
console.log(`✓ public/apple-touch-icon.png  ${(applePng.length / 1024).toFixed(1)} KB`)

// favicon.svg（浏览器标签页图标）
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="22" fill="#1f6feb"/>
  <rect x="24" y="30" width="52" height="5" rx="2.5" fill="#fff"/>
  <rect x="24" y="47" width="52" height="5" rx="2.5" fill="#9ed0ff"/>
  <rect x="24" y="64" width="34" height="5" rx="2.5" fill="#fff"/>
</svg>`
writeFileSync('public/favicon.svg', svg, 'utf8')
console.log('✓ public/favicon.svg')
