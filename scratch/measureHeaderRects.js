const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Aariy\\.gemini\\antigravity\\brain\\766f3924-9b4e-4809-9a9f-0edd6fdfd864';
const PORT = 9261;

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
}

async function run() {
  const profileDir = path.join(ARTIFACT_DIR, 'scratch', 'chrome-profile-rects');
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

    const pages = [
      { name: 'index', url: 'file:///C:/Users/Aariy/Palora/index.html' },
      { name: 'catalogue', url: 'file:///C:/Users/Aariy/Palora/catalogue.html' },
      { name: 'story', url: 'file:///C:/Users/Aariy/Palora/story.html' },
      { name: 'help', url: 'file:///C:/Users/Aariy/Palora/help.html' },
      { name: 'privacy', url: 'file:///C:/Users/Aariy/Palora/privacy.html' }
    ];

    const results = {};

    for (const pg of pages) {
      await cdp.send('Page.navigate', { url: pg.url });
      await sleep(600);

      const metrics = await cdp.eval(`(() => {
        const roundRect = (r) => r ? {
          top: Math.round(r.top),
          bottom: Math.round(r.bottom),
          left: Math.round(r.left),
          right: Math.round(r.right),
          height: Math.round(r.height),
          width: Math.round(r.width)
        } : null;

        const header = document.querySelector('.site-header');
        const nav = document.querySelector('.nav-menu');
        const firstLink = document.querySelector('.nav-link');
        const wordmark = document.querySelector('.site-wordmark');
        const title = document.querySelector('.wordmark-title');
        const tagline = document.querySelector('.wordmark-tagline');
        const actions = document.querySelector('.header-actions');
        const searchBtn = document.querySelector('#searchBtn');
        const cartBtn = document.querySelector('#cartBtn');
        const hamburgerBtn = document.querySelector('#mobileToggleBtn');

        return {
          header: roundRect(header ? header.getBoundingClientRect() : null),
          nav: roundRect(nav ? nav.getBoundingClientRect() : null),
          firstLink: roundRect(firstLink ? firstLink.getBoundingClientRect() : null),
          wordmark: roundRect(wordmark ? wordmark.getBoundingClientRect() : null),
          wordmarkTitle: roundRect(title ? title.getBoundingClientRect() : null),
          wordmarkTagline: roundRect(tagline ? tagline.getBoundingClientRect() : null),
          actions: roundRect(actions ? actions.getBoundingClientRect() : null),
          searchBtn: roundRect(searchBtn ? searchBtn.getBoundingClientRect() : null),
          cartBtn: roundRect(cartBtn ? cartBtn.getBoundingClientRect() : null),
          hamburgerBtn: roundRect(hamburgerBtn ? hamburgerBtn.getBoundingClientRect() : null)
        };
      })()`);

      results[pg.name] = metrics;
    }

    console.log('=== EXACT BoundingClientRect Comparison (1900x868) ===');
    console.log(JSON.stringify(results, null, 2));

  } finally {
    cp.kill();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
