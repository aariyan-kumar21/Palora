const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9257;

async function measure() {
  const cp = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    '--window-size=1900,868',
    'file:///C:/Users/Aariy/Palora/index.html'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const res = await fetch(`http://127.0.0.1:${port}/json/list`);
  const [tab] = await res.json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);

  ws.onopen = async () => {
    // Open drawer
    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: { expression: `document.getElementById('mobileToggleBtn').click();` }
    }));

    await new Promise(r => setTimeout(r, 1200));

    ws.send(JSON.stringify({
      id: 2,
      method: 'Runtime.evaluate',
      params: {
        expression: `(() => {
          const header = document.getElementById('site-header');
          const headerRect = header ? header.getBoundingClientRect() : {};
          const headerStyle = header ? window.getComputedStyle(header) : {};

          const drawer = document.getElementById('menu-drawer') || document.getElementById('mobileDrawer');
          
          const menuLinks = Array.from(drawer ? drawer.querySelectorAll('.md-menu a') : []);
          const menuInfo = menuLinks.map(a => {
            const r = a.getBoundingClientRect();
            const s = window.getComputedStyle(a);
            const n = a.querySelector('.n');
            const ns = n ? window.getComputedStyle(n) : null;
            const nr = n ? n.getBoundingClientRect() : null;
            return {
              text: a.textContent.trim(),
              rowHeight: Math.round(r.height),
              fontSize: s.fontSize,
              lineHeight: s.lineHeight,
              numeralFontSize: ns ? ns.fontSize : null,
              numeralWidth: nr ? Math.round(nr.width) : null
            };
          });

          const foot = drawer ? drawer.querySelector('.md-foot') : null;
          const footRect = foot ? foot.getBoundingClientRect() : {};
          const footStyle = foot ? window.getComputedStyle(foot) : {};
          const footHr = foot ? foot.querySelector('hr') : null;
          const footHrStyle = footHr ? window.getComputedStyle(footHr) : null;
          const tagline = foot ? foot.querySelector('p') : null;
          const taglineStyle = tagline ? window.getComputedStyle(tagline) : null;
          const priv = foot ? foot.querySelector('a') : null;
          const privStyle = priv ? window.getComputedStyle(priv) : null;

          const bow = drawer ? drawer.querySelector('.md-bow') : null;
          const bowRect = bow ? bow.getBoundingClientRect() : null;

          return {
            navbar: {
              height: Math.round(headerRect.height || 0),
              computedHeight: headerStyle.height
            },
            menuRows: menuInfo,
            footer: {
              height: Math.round(footRect.height || 0),
              paddingTop: footStyle.paddingTop,
              paddingBottom: footStyle.paddingBottom,
              paddingLeft: footStyle.paddingLeft,
              paddingRight: footStyle.paddingRight,
              hrMarginTop: footHrStyle?.marginTop,
              hrMarginBottom: footHrStyle?.marginBottom,
              taglineFontSize: taglineStyle?.fontSize,
              taglineLineHeight: taglineStyle?.lineHeight,
              privFontSize: privStyle?.fontSize,
              privMarginTop: privStyle?.marginTop
            },
            bow: {
              width: bowRect ? Math.round(bowRect.width) : null,
              height: bowRect ? Math.round(bowRect.height) : null
            }
          };
        })()`,
        returnByValue: true
      }
    }));
  };

  ws.onmessage = (e) => {
    const raw = JSON.parse(e.data);
    if (raw.id === 2) {
      const val = raw.result?.result?.value;
      console.log('BEFORE_VALUES:\n' + JSON.stringify(val, null, 2));
      cp.kill();
      process.exit(0);
    }
  };
}

measure().catch(err => {
  console.error(err);
  process.exit(1);
});
