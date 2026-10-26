/**
 * 用 Chrome DevTools Protocol 做真实移动端视口测量。
 * 目的：验证「375×667 下题库列表一屏可见 ≥4 张卡片」等布局验收项。
 *
 * headless 的 --window-size 最小宽度是 500px，
 * 所以必须用 Emulation.setDeviceMetricsOverride 才能真正得到 375px 视口。
 */
import { spawn } from 'node:child_process'
import { mkdtempSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9222
const BASE = process.argv[2] || 'http://127.0.0.1:5273'

const userDir = mkdtempSync(join(tmpdir(), 'cdp-probe-'))

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${userDir}`,
    'about:blank',
  ],
  { stdio: 'ignore' }
)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getPageWsUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`)
      const list = await res.json()
      const page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
      if (page) return page.webSocketDebuggerUrl
    } catch (e) {
      /* 还没起来 */
    }
    await sleep(250)
  }
  throw new Error('未找到可调试的页面 target')
}

let idCounter = 0
function call(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++idCounter
    const onMessage = (ev) => {
      let msg
      try {
        msg = JSON.parse(ev.data)
      } catch (e) {
        return
      }
      if (msg.id !== id) return
      ws.removeEventListener('message', onMessage)
      if (msg.error) reject(new Error(`${method}: ${msg.error.message}`))
      else resolve(msg.result)
    }
    ws.addEventListener('message', onMessage)
    ws.send(JSON.stringify({ id, method, params }))
  })
}

async function evaluate(ws, expression) {
  const r = await call(ws, 'Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  })
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text)
  return r.result.value
}

async function screenshot(ws, path) {
  const r = await call(ws, 'Page.captureScreenshot', { format: 'png' })
  const buf = Buffer.from(r.data, 'base64')
  writeFileSync(path, buf)
  return buf.length
}

/** 打开页面并等待渲染稳定 */
async function openPage(ws, url) {
  await call(ws, 'Page.enable')
  await call(ws, 'Page.navigate', { url })
  await sleep(1800)
}

const results = {}

try {
  const wsUrl = await getPageWsUrl()
  const ws = new WebSocket(wsUrl)
  await new Promise((res, rej) => {
    ws.addEventListener('open', res)
    ws.addEventListener('error', rej)
  })

  // 375x667，移动端标志位开启
  await call(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    mobile: true,
  })
  await call(ws, 'Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 })

  // ---------- 题库页 ----------
  await openPage(ws, `${BASE}/bank`)
  results.bank = await evaluate(
    ws,
    `(() => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const cards = [...document.querySelectorAll('.qcard')];
      // 完全落在首屏内（底部不超过视口）的卡片数
      const fullyVisible = cards.filter(c => c.getBoundingClientRect().bottom <= vh).length;
      const partlyVisible = cards.filter(c => {
        const r = c.getBoundingClientRect();
        return r.top < vh && r.bottom > 0;
      }).length;
      const overflowX = document.documentElement.scrollWidth - vw;
      const tab = document.querySelector('.tabbar');
      return {
        vw, vh,
        cardCount: cards.length,
        fullyVisible,
        partlyVisible,
        cardHeight: cards[0] ? Math.round(cards[0].getBoundingClientRect().height) : null,
        overflowX,
        tabbarWidth: tab ? Math.round(tab.getBoundingClientRect().width) : null,
        tabbarItems: document.querySelectorAll('.tabbar__item').length,
        lastTabVisible: (() => {
          const items = document.querySelectorAll('.tabbar__item');
          if (!items.length) return null;
          const r = items[items.length-1].getBoundingClientRect();
          return r.right <= vw + 0.5;
        })(),
      };
    })()`
  )
  results.bankShotBytes = await screenshot(ws, 'shot-bank-375.png')

  // ---------- 刷题页（简答） ----------
  await openPage(ws, `${BASE}/practice`)
  results.practice = await evaluate(
    ws,
    `(() => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const stage = document.querySelector('.stage');
      const card = document.querySelector('.qcard-p');
      const actions = document.querySelector('.actions');
      const body = document.querySelector('.qcard-p__scroll');
      const r = el => el ? el.getBoundingClientRect() : null;
      const sr = r(stage), ar = r(actions), cr = r(card);
      const tab = document.querySelector('.tabbar');
      const tabTop = tab ? tab.getBoundingClientRect().top : vh;
      return {
        vw, vh,
        hasStage: !!stage,
        stageHeight: sr ? Math.round(sr.height) : null,
        cardHeight: cr ? Math.round(cr.height) : null,
        cardBottomGap: ar && cr ? Math.round(ar.top - cr.bottom) : null,
        // 操作栏是否完整落在 TabBar 之上（被遮住就说明算错高度了）
        actionsAboveTabbar: ar ? Math.round(ar.bottom) <= Math.round(tabTop) + 1 : null,
        actionsGapToTabbar: ar ? Math.round(tabTop - ar.bottom) : null,
        actionsHeight: ar ? Math.round(ar.height) : null,
        bodyScrollable: body ? body.scrollHeight > body.clientHeight : null,
        pageOverflowX: document.documentElement.scrollWidth - vw,
        docScrollH: document.documentElement.scrollHeight,
        bodyOverflowY: document.documentElement.scrollHeight - vh,
      };
    })()`
  )
  results.practiceShotBytes = await screenshot(ws, 'shot-practice-375.png')

  // ---------- 详情页（选择题） ----------
  const choiceId = await evaluate(
    ws,
    `fetch('${BASE}/data/questions.json').then(r=>r.json()).then(d=>{
       const c = d.find(q => q.type === 'single');
       return c ? c.id : null;
     })`
  )
  if (choiceId) {
    await openPage(ws, `${BASE}/question/${choiceId}`)
    results.choiceDetail = await evaluate(
      ws,
      `(() => {
        const vw = window.innerWidth;
        return {
          vw,
          optionCount: document.querySelectorAll('.option').length,
          hasExplanation: !!document.querySelector('.explain'),
          overflowX: document.documentElement.scrollWidth - vw,
          optionMinHeight: (() => {
            const o = document.querySelector('.option');
            return o ? Math.round(o.getBoundingClientRect().height) : null;
          })(),
        };
      })()`
    )
    results.choiceShotBytes = await screenshot(ws, 'shot-choice-375.png')
  }

  ws.close()
} finally {
  chrome.kill()
}

console.log(JSON.stringify(results, null, 2))
