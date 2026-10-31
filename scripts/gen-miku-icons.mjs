/**
 * 生成 PWA 图标 + favicon（初音未来主题，纯 Node 像素画）。
 *
 * 配色修正：上一版用 #39c5bb（G=197 > B=187）偏墨绿，用户反馈「太青、不像 miku」。
 * 初音发色实际是**青蓝**（Blue >= Green），这版让 B 明确高于 G：
 *   底渐变 #2fd4dc（B=220 > G=212）→ #0e8298
 *
 * 图层顺序（后 → 前）：
 *   1. 青蓝渐变圆角底
 *   2. 双马尾：上窄下宽发束 + 内暗面
 *   3. 耳机：深灰外圈 + 品红环
 *   4. 脸：额头宽、下颌收窄（瓜子脸）
 *   5. 刘海：连贯波浪下缘（独立三角会在缝隙露肤色，像戴皇冠）
 *   6. 眼睛 / 嘴
 *   7. 领口：V 形，位于下巴下方
 */
import { writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

const TEAL_HI = [0x2f, 0xd4, 0xdc] // 亮青蓝（B > G）
const TEAL_LO = [0x0e, 0x82, 0x98] // 深青蓝
const HAIR = [0x27, 0xb8, 0xc4]
const HAIR_DK = [0x1c, 0x96, 0xa4]
const SKIN = [0xff, 0xe8, 0xe0]
const DARK = [0x1f, 0x2a, 0x2e]
const PINK = [0xf0, 0x45, 0x8c]
const EYE = [0x18, 0x93, 0xa6]
const MOUTH = [0xc4, 0x6a, 0x6a]

function makePng(size) {
  const px = Buffer.alloc(size * size * 4)
  const S = size

  const set = (x, y, c) => {
    if (x < 0 || y < 0 || x >= S || y >= S) return
    const i = (Math.round(y) * S + Math.round(x)) * 4
    px[i] = c[0]
    px[i + 1] = c[1]
    px[i + 2] = c[2]
    px[i + 3] = 255
  }

  const ellipse = (cx, cy, rx, ry, color) => {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const nx = (x - cx) / rx
        const ny = (y - cy) / ry
        if (nx * nx + ny * ny <= 1) set(x, y, color)
      }
    }
  }

  const u = (v) => v * S

  // ---------- 1. 底 ----------
  const R = u(0.2)
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const cx = Math.min(x, S - 1 - x)
      const cy = Math.min(y, S - 1 - y)
      let inside = true
      if (cx < R && cy < R) {
        const dx = R - cx
        const dy = R - cy
        inside = dx * dx + dy * dy <= R * R
      }
      if (!inside) continue
      const t = (x / S + y / S) / 2
      set(x, y, [
        Math.round(TEAL_HI[0] + (TEAL_LO[0] - TEAL_HI[0]) * t),
        Math.round(TEAL_HI[1] + (TEAL_LO[1] - TEAL_HI[1]) * t),
        Math.round(TEAL_HI[2] + (TEAL_LO[2] - TEAL_HI[2]) * t),
      ])
    }
  }

  // ---------- 2. 双马尾 ----------
  const tail = (xCenter, outward) => {
    for (let y = Math.round(u(0.33)); y < Math.round(u(0.92)); y++) {
      const t = (y - u(0.33)) / (u(0.92) - u(0.33))
      const cx = u(xCenter + outward * t * 0.05)
      const hw = u(0.045 + 0.045 * t)
      for (let x = Math.round(cx - hw); x <= Math.round(cx + hw); x++) set(x, y, HAIR)
      const inner = xCenter < 0.5 ? cx + hw * 0.45 : cx - hw * 0.45
      for (let x = Math.round(inner - hw * 0.18); x <= Math.round(inner + hw * 0.18); x++) {
        set(x, y, HAIR_DK)
      }
    }
  }
  tail(0.14, -1)
  tail(0.86, +1)

  // ---------- 3. 耳机 ----------
  ellipse(u(0.14), u(0.35), u(0.072), u(0.082), DARK)
  ellipse(u(0.86), u(0.35), u(0.072), u(0.082), DARK)
  ellipse(u(0.14), u(0.35), u(0.05), u(0.058), PINK)
  ellipse(u(0.86), u(0.35), u(0.05), u(0.058), PINK)
  ellipse(u(0.14), u(0.35), u(0.031), u(0.036), DARK)
  ellipse(u(0.86), u(0.35), u(0.031), u(0.036), DARK)

  // ---------- 4. 瓜子脸 ----------
  const faceTop = u(0.30)
  const faceBot = u(0.75)
  const faceHW = u(0.175)
  for (let y = Math.round(faceTop); y < Math.round(faceBot); y++) {
    const t = (y - faceTop) / (faceBot - faceTop)
    const k = t < 0.7 ? 1 - 0.12 * (t / 0.7) : (1 - 0.12) * Math.pow((1 - t) / 0.3, 0.85)
    const hw = faceHW * k
    for (let x = Math.round(u(0.5) - hw); x <= Math.round(u(0.5) + hw); x++) set(x, y, SKIN)
  }

  // ---------- 5. 刘海：连贯波浪 ----------
  const bangsTop = u(0.225)
  const bangsBottomBase = u(0.375)
  const waveAmp = u(0.052)
  const bangsHalfW = u(0.195)
  const centerX = u(0.5)

  for (let x = Math.round(centerX - bangsHalfW); x <= Math.round(centerX + bangsHalfW); x++) {
    const nx = (x - centerX) / bangsHalfW
    const wave = Math.cos(nx * Math.PI * 2.2) * 0.5 + Math.cos(nx * Math.PI * 0.9) * 0.5
    const edgeFalloff = 1 - 0.45 * Math.abs(nx) ** 1.6
    const bottomY = bangsBottomBase + waveAmp * wave * edgeFalloff
    for (let y = Math.round(bangsTop); y <= Math.round(bottomY); y++) set(x, y, HAIR)
  }

  // 两侧鬓发
  for (let y = Math.round(u(0.30)); y < Math.round(u(0.56)); y++) {
    const t = (y - u(0.30)) / (u(0.56) - u(0.30))
    const hw = u(0.035 - 0.02 * t)
    for (let x = Math.round(u(0.285) - hw); x <= Math.round(u(0.285) + hw); x++) set(x, y, HAIR)
    for (let x = Math.round(u(0.715) - hw); x <= Math.round(u(0.715) + hw); x++) set(x, y, HAIR)
  }

  // ---------- 6. 眼睛 / 嘴 ----------
  ellipse(u(0.425), u(0.505), u(0.045), u(0.038), EYE)
  ellipse(u(0.575), u(0.505), u(0.045), u(0.038), EYE)
  ellipse(u(0.44), u(0.495), u(0.016), u(0.014), [255, 255, 255])
  ellipse(u(0.59), u(0.495), u(0.016), u(0.014), [255, 255, 255])
  for (let x = Math.round(u(0.478)); x <= Math.round(u(0.522)); x++) set(x, u(0.60), MOUTH)

  // ---------- 7. 领口 V 形 ----------
  const collarTop = u(0.775)
  const collarBot = u(0.96)
  for (let y = Math.round(collarTop); y < Math.round(collarBot); y++) {
    const t = (y - collarTop) / (collarBot - collarTop)
    const hw = u(0.15 + 0.08 * t)
    for (let x = Math.round(u(0.5) - hw); x <= Math.round(u(0.5) + hw); x++) set(x, y, DARK)
  }
  const vTipY = u(0.875)
  for (let t = 0; t <= 1; t += 0.002) {
    const y = u(0.79) + (vTipY - u(0.79)) * t
    const half = u(0.052) * (1 - t)
    const w = Math.max(1, u(0.014))
    for (let d = -w; d <= w; d++) {
      set(u(0.5) - half, y + d, TEAL_HI)
      set(u(0.5) + half, y + d, TEAL_HI)
    }
  }

  return encodePng(px, S, S)
}

function encodePng(rgba, w, h) {
  const raw = Buffer.alloc((w * 4 + 1) * h)
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4)
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length)
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(body) >>> 0)
    return Buffer.concat([len, body, crc])
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function crc32(buf) {
  const table = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

for (const size of [192, 512]) {
  const png = makePng(size)
  writeFileSync(`public/icon-${size}.png`, png)
  console.log(`✓ public/icon-${size}.png  ${(png.length / 1024).toFixed(1)} KB`)
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#2fd4dc"/><stop offset="1" stop-color="#0e8298"/>
  </linearGradient></defs>
  <rect width="100" height="100" rx="20" fill="url(#g)"/>
  <path d="M14 33 L14 92 L24 92 L20 33 Z" fill="#27b8c4"/>
  <path d="M86 33 L86 92 L76 92 L80 33 Z" fill="#27b8c4"/>
  <path d="M17.5 50 L17.5 90 L20 90 L20 50 Z" fill="#1c96a4"/>
  <path d="M82.5 50 L82.5 90 L80 90 L80 50 Z" fill="#1c96a4"/>
  <ellipse cx="14" cy="35" rx="7.2" ry="8.2" fill="#1f2a2e"/>
  <ellipse cx="86" cy="35" rx="7.2" ry="8.2" fill="#1f2a2e"/>
  <ellipse cx="14" cy="35" rx="5" ry="5.8" fill="#f0458c"/>
  <ellipse cx="86" cy="35" rx="5" ry="5.8" fill="#f0458c"/>
  <ellipse cx="14" cy="35" rx="3.1" ry="3.6" fill="#1f2a2e"/>
  <ellipse cx="86" cy="35" rx="3.1" ry="3.6" fill="#1f2a2e"/>
  <path d="M32.5 30 Q50 26 67.5 30 L65 46 Q50 50 35 46 Z" fill="#ffe8e0"/>
  <path d="M31 22.5 L69 22.5 L67 37.5 L33 37.5 Z" fill="#27b8c4"/>
  <path d="M33 37.5 Q35.5 42 38 37.5 Q40.5 44 43 37.5 Q45 41.5 47 37.5 Q49 44.5 51 37.5 Q53 41.5 55 37.5 Q57.5 44 60 37.5 Q62.5 42 65 37.5 L67 37.5 L33 37.5 Z" fill="#27b8c4"/>
  <ellipse cx="28.5" cy="40" rx="3.5" ry="7" fill="#27b8c4"/>
  <ellipse cx="71.5" cy="40" rx="3.5" ry="7" fill="#27b8c4"/>
  <ellipse cx="42.5" cy="50.5" rx="4.5" ry="3.8" fill="#1893a6"/>
  <ellipse cx="57.5" cy="50.5" rx="4.5" ry="3.8" fill="#1893a6"/>
  <ellipse cx="44" cy="49.5" rx="1.6" ry="1.4" fill="#fff"/>
  <ellipse cx="59" cy="49.5" rx="1.6" ry="1.4" fill="#fff"/>
  <path d="M47.8 60 Q50 61.6 52.2 60" stroke="#c46a6a" stroke-width="1.1" fill="none"/>
  <path d="M35 77.5 L65 77.5 L73 96 L27 96 Z" fill="#1f2a2e"/>
  <path d="M38.5 79 L50 87.5 L61.5 79" stroke="#2fd4dc" stroke-width="1.6" fill="none"/>
</svg>`
writeFileSync('public/favicon.svg', svg, 'utf8')
console.log('✓ public/favicon.svg')
