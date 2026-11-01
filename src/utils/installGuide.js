/**
 * 安装引导：识别平台，给出对应的「装到手机桌面」步骤。
 *
 * 为什么需要它：
 * 1. 用户不知道有 PWA/离线这事儿（页面里没有任何提示）；
 * 2. 各平台路径完全不同（iOS 只认 Safari；安卓 Chrome 在国内常失败）；
 * 3. 失败现象是「点了安装，什么都没发生」，不给指引就只能干瞪眼。
 *
 * 纯函数、不读 window：平台由调用方传入，便于单测覆盖各分支。
 */

/** 平台类型 */
export const PLATFORMS = ['ios', 'android', 'desktop', 'unknown']

/**
 * 从 UA 识别平台。
 *
 * 顺序有讲究：iPadOS 13+ 的 UA 会伪装成 macOS（Macintosh + 触摸点），
 * 所以「先判断触摸的 Mac，再判断普通 Mac」。
 *
 * @param {string} ua userAgent
 * @param {number} maxTouchPoints navigator.maxTouchPoints
 * @returns {'ios'|'android'|'desktop'|'unknown'}
 */
export function detectPlatform(ua = '', maxTouchPoints = 0) {
  const s = String(ua || '')

  // iPadOS 13+ 伪装成 macOS：靠触摸点数量区分
  const isIpad = /Macintosh/.test(s) && maxTouchPoints > 1
  if (/iPhone|iPad|iPod/.test(s) || isIpad) return 'ios'

  if (/Android/.test(s)) return 'android'

  // 桌面浏览器（Windows / macOS / Linux）
  if (/Windows|Macintosh|Linux|X11/.test(s)) return 'desktop'

  return 'unknown'
}

/**
 * 是否已经在「独立应用」形态里运行（已装好并打开）。
 *
 * 三种判定都接受：
 * - display-mode: standalone（绝大多数安卓 PWA）
 * - navigator.standalone（iOS Safari 的历史属性）
 * - display-mode: minimal-ui（部分浏览器）
 *
 * 已装好时不该再提示安装，只该告知「已装好」。
 *
 * @param {boolean} matchMediaStandalone 是否匹配 (display-mode: standalone)
 * @param {boolean} navigatorStandalone navigator.standalone
 */
export function isInstalled(matchMediaStandalone = false, navigatorStandalone = false) {
  return !!(matchMediaStandalone || navigatorStandalone)
}

/**
 * 各平台的安装步骤。
 *
 * 安卓特意拆成两套：
 * - **优先「自带浏览器」**：不经系统安装流程，一定成功；
 * - Chrome 作为备选，并明确警告「国内可能失败」。
 *
 * 这个顺序来自真实踩坑：国行小米上 Chrome 的「安装」会走 Google 服务器的
 * WebAPK 铸造，失败后连文件都可能变成 .mht，桌面什么都不会出现。
 * 而手机自带浏览器是本机直接建快捷方式，绕过一切外部依赖。
 *
 * @param {'ios'|'android'|'desktop'|'unknown'} platform
 */
export function installSteps(platform) {
  if (platform === 'ios') {
    return {
      title: '添加到主屏幕',
      /** iOS 必须 Safari，Chrome/微信内都不行 */
      warning: '必须用 Safari 打开本页面，微信或 Chrome 内无法添加。',
      steps: [
        '用 Safari 打开本页面',
        '点底部分享按钮（方框向上箭头）',
        '下滑找到「添加到主屏幕」',
        '改好名字后点「添加」',
      ],
      note: '添加后是全屏应用，可离线刷题。',
    }
  }

  if (platform === 'android') {
    return {
      title: '添加到屏幕',
      warning: '推荐用手机自带浏览器。Chrome 在国内可能失败（点了安装却毫无反应）。',
      steps: [
        '用手机自带浏览器打开本页面',
        '点菜单，选「添加到屏幕」或「添加到桌面」',
        '确认后，桌面会出现应用图标',
      ],
      note: 'Chrome 里若出现「安装 / 创建快捷方式」二选一，请选「创建快捷方式」。',
      /** 安卓特别提示：失败时的备选 */
      fallback: '若 Chrome 点击安装后弹出「保存网页」或生成 .mht 文件，说明该路径不可用，改用自带浏览器或 Firefox。',
    }
  }

  if (platform === 'desktop') {
    return {
      title: '安装到电脑',
      warning: '',
      steps: [
        'Chrome / Edge：地址栏右侧出现安装图标，或菜单里选「安装应用」',
        'Safari（macOS）：菜单「文件 → 添加到 Dock」',
      ],
      note: '装好后可像普通应用一样从桌面启动，且支持离线。',
    }
  }

  return {
    title: '添加到桌面',
    warning: '',
    steps: ['在浏览器菜单里找到「添加到主屏幕」或「安装应用」'],
    note: '添加后支持离线刷题。',
  }
}

/**
 * 一次性拿到完整引导数据（页面直接用这个）。
 *
 * @param {{ua?: string, maxTouchPoints?: number, standalone?: boolean, navStandalone?: boolean}} env
 */
export function installGuide(env = {}) {
  const platform = detectPlatform(env.ua, env.maxTouchPoints)
  const installed = isInstalled(env.standalone, env.navStandalone)
  return { platform, installed, ...installSteps(platform) }
}
