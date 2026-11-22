const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Aariy\\.gemini\\antigravity\\brain\\766f3924-9b4e-4809-9a9f-0edd6fdfd864';
const PORT = 9260;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

class CDPClient {
  constructor(ws) {
    this.ws = ws;
    this.id = 1;
    this.callbacks = new Map();
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && this.callbacks.has(data.id)) {
        const { resolve, reject } = this.callbacks.get(data.id);
        this.callbacks.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expr) {
    const res = await this.send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result ? res.result.value : undefined;
  }

  async screenshot(filePath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
  }
}

async function run() {
  const profileDir = path.join(ARTIFACT_DIR, 'scratch', 'chrome-profile-tweaks');
  fs.mkdirSync(profileDir, { recursive: true });

  const cp = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--window-size=1900,868',
    `--user-data-dir=${profileDir}`,
    'file:///C:/Users/Aariy/Palora/index.html'
  ]);

  try {
    let tab = null;
    for (let i = 0; i < 30; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
        const tabs = await res.json();
        if (tabs && tabs.length > 0) {
          tab = tabs[0];
          break;
        }
      } catch (e) {
        await sleep(200);
      }
    }

    if (!tab) throw new Error('Could not connect to Chrome debugging port');

    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    const cdp = new CDPClient(ws);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1900,
      height: 868,
      deviceScaleFactor: 1,
      mobile: false
    });

    console.log('Testing homepage at 1900x868...');
    await sleep(600);

    // Collect console errors
    const errors = [];
    ws.addEventListener('message', (ev) => {
      const data = JSON.parse(ev.data);
      if (data.method === 'Runtime.consoleAPICalled' && data.params.type === 'error') {
        errors.push(data.params.args.map(a => a.value || a.description).join(' '));
      }
    });

    // Check navbar and hero flush at 1900x868 on homepage
    const homeLayout = await cdp.eval(`(() => {
      const header = document.querySelector('.site-header');
      const hero = document.querySelector('.hero');
      const valueBar = document.querySelector('.value-bar');
      const hr = header ? header.getBoundingClientRect() : null;
      const heror = hero ? hero.getBoundingClientRect() : null;
      const vbr = valueBar ? valueBar.getBoundingClientRect() : null;
      const docEl = document.documentElement;
      
      return {
        headerHeight: hr ? hr.height : 0,
        heroBottom: heror ? heror.bottom : 0,
        valueBarTop: vbr ? vbr.top : 0,
        valueBarBottom: vbr ? vbr.bottom : 0,
        viewportHeight: window.innerHeight,
        scrollWidth: docEl.scrollWidth,
        clientWidth: docEl.clientWidth,
        hasHScroll: docEl.scrollWidth > docEl.clientWidth
      };
    })()`);
    console.log('Homepage Layout & Flush Check:', JSON.stringify(homeLayout, null, 2));

    // Open drawer and measure drawer components
    await cdp.eval(`(() => {
      const btn = document.getElementById('mobileToggleBtn') || document.querySelector('.hamburger-btn');
      if (btn) btn.click();
    })()`);

    // Wait for drawer transition + animation
    await sleep(1200);

    const drawerMetrics = await cdp.eval(`(() => {
      const d = document.getElementById('menu-drawer');
      const dr = d.getBoundingClientRect();
      
      // Menu rows
      const menuRows = Array.from(d.querySelectorAll('.md-menu a')).map(a => {
        const r = a.getBoundingClientRect();
        const cs = window.getComputedStyle(a);
        const num = a.querySelector('.n');
        const numCS = num ? window.getComputedStyle(num) : null;
        return {
          text: a.textContent.trim(),
          height: Math.round(r.height),
          fontSize: cs.fontSize,
          lineHeight: cs.lineHeight,
          gridTemplateColumns: cs.gridTemplateColumns,
          numFontSize: numCS ? numCS.fontSize : null
        };
      });

      // Footer
      const foot = d.querySelector('.md-foot');
      const footR = foot.getBoundingClientRect();
      const footCS = window.getComputedStyle(foot);
      const hr = foot.querySelector('hr');
      const hrCS = hr ? window.getComputedStyle(hr) : null;
      const p = foot.querySelector('p');
      const pR = p.getBoundingClientRect();
      const pCS = p ? window.getComputedStyle(p) : null;
      const priv = foot.querySelector('a');
      const privCS = priv ? window.getComputedStyle(priv) : null;

      // Gift SVG
      const gift = d.querySelector('.md-gift');
      const giftR = gift ? gift.getBoundingClientRect() : null;
      const giftCS = gift ? window.getComputedStyle(gift) : null;

      // Clearance between text (p) right edge and gift left edge
      const clearance = (giftR && pR) ? Math.round(giftR.left - pR.right) : null;

      return {
        drawerWidth: Math.round(dr.width),
        drawerHeight: Math.round(dr.height),
        menuRows,
        footer: {
          height: Math.round(footR.height),
          padding: footCS.padding,
          hrMargin: hrCS ? hrCS.margin : null,
          tagline: {
            fontSize: pCS.fontSize,
            lineHeight: pCS.lineHeight,
            maxWidth: pCS.maxWidth,
            width: Math.round(pR.width)
          },
          privacyLink: {
            fontSize: privCS.fontSize,
            lineHeight: privCS.lineHeight,
            marginTop: privCS.marginTop
          }
        },
        gift: gift ? {
          width: Math.round(giftR.width),
          height: Math.round(giftR.height),
          right: giftCS.right,
          bottom: giftCS.bottom,
          opacity: giftCS.opacity,
          zIndex: giftCS.zIndex,
          pointerEvents: giftCS.pointerEvents
        } : null,
        clearancePx: clearance
      };
    })()`);
    console.log('Drawer Metrics:', JSON.stringify(drawerMetrics, null, 2));

    // Capture open drawer screenshot
    const drawerScreenshotPath = path.join(ARTIFACT_DIR, 'drawer_tweaks_1900x868.png');
    await cdp.screenshot(drawerScreenshotPath);
    console.log('Captured:', drawerScreenshotPath);

    // Close drawer
    await cdp.eval(`(() => {
      const closeBtn = document.getElementById('closeDrawerBtn');
      if (closeBtn) closeBtn.click();
    })()`);
    await sleep(600);

    // Capture homepage top
    const indexScreenshotPath = path.join(ARTIFACT_DIR, 'top_index_1900x868.png');
    await cdp.screenshot(indexScreenshotPath);
    console.log('Captured:', indexScreenshotPath);

    // Measure nav getBoundingClientRect() across all 5 pages
    const pages = [
      { name: 'index', url: 'file:///C:/Users/Aariy/Palora/index.html' },
      { name: 'catalogue', url: 'file:///C:/Users/Aariy/Palora/catalogue.html' },
      { name: 'story', url: 'file:///C:/Users/Aariy/Palora/story.html' },
      { name: 'help', url: 'file:///C:/Users/Aariy/Palora/help.html' },
      { name: 'privacy', url: 'file:///C:/Users/Aariy/Palora/privacy.html' }
    ];

    const navComparison = {};

    for (const pg of pages) {
      await cdp.send('Page.navigate', { url: pg.url });
      await sleep(700);

      const metrics = await cdp.eval(`(() => {
        const header = document.querySelector('.site-header');
        const hr = header.getBoundingClientRect();
        const nav = document.querySelector('.desktop-nav');
        const nr = nav ? nav.getBoundingClientRect() : null;
        const brand = document.querySelector('.brand-title') || document.querySelector('.header-brand');
        const br = brand ? brand.getBoundingClientRect() : null;
        const tag = document.querySelector('.brand-sub');
        const tr = tag ? tag.getBoundingClientRect() : null;
        const actions = document.querySelector('.header-actions');
        const ar = actions ? actions.getBoundingClientRect() : null;
        const firstLink = nav ? nav.querySelector('a') : null;
        const flr = firstLink ? firstLink.getBoundingClientRect() : null;
        
        const docEl = document.documentElement;
        return {
          header: { top: Math.round(hr.top), height: Math.round(hr.height), bottom: Math.round(hr.bottom) },
          nav: nr ? { top: Math.round(nr.top), height: Math.round(nr.height), bottom: Math.round(nr.bottom) } : null,
          brand: br ? { top: Math.round(br.top), height: Math.round(br.height), bottom: Math.round(br.bottom) } : null,
          tagline: tr ? { top: Math.round(tr.top), height: Math.round(tr.height), bottom: Math.round(tr.bottom) } : null,
          actions: ar ? { top: Math.round(ar.top), height: Math.round(ar.height), bottom: Math.round(ar.bottom) } : null,
          firstLink: flr ? { top: Math.round(flr.top), height: Math.round(flr.height), bottom: Math.round(flr.bottom) } : null,
          hasHScroll: docEl.scrollWidth > docEl.clientWidth
        };
      })()`);

      navComparison[pg.name] = metrics;

      const shotPath = path.join(ARTIFACT_DIR, `top_${pg.name}_1900x868.png`);
      await cdp.screenshot(shotPath);
      console.log(`Captured: top_${pg.name}_1900x868.png`);
    }

    console.log('Nav Comparison Across 5 Pages:');
    console.log(JSON.stringify(navComparison, null, 2));

    console.log('Console Errors:', errors.length === 0 ? 'None (0 errors)' : JSON.stringify(errors));

  } finally {
    cp.kill();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
