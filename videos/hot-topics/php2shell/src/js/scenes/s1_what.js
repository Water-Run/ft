// 01 它是什么，有多严重。
// 主画面：一百格的「网站方阵」，近七成点亮成 PHP 紫；然后是远程代码执行的示意与 9.2 分的严重程度表。
scene('what', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  screenGrid(world);
  const cam = makeCamera(world);

  // 第一站：一百格方阵，69 格点亮
  const share = Math.round(DATA.php_share.value);                 // 69
  const grid = h('div', 'abs', world); px(grid, 160, 190, 640, 640); grid.dataset.name = '网站方阵';
  const cells = [];
  for (let i = 0; i < 100; i++) { const c = h('div', 'cell', grid); px(c, (i % 10) * 64, Math.floor(i / 10) * 64); cells.push(c); }
  cells.forEach((c, i) => appear(c, c0 + 0.1 + (i % 10) * 0.015 + Math.floor(i / 10) * 0.015));
  const tOn = T('a2', { zh: '七成', en: 'seven' }, -0.4);
  cells.slice(0, share).forEach((c, i) => classAt(c, 'on', tOn + i * 0.008));
  sfx('tick', tOn, { p: -0.4 }); sfx('tick', tOn + 0.3, { p: -0.4, g: 0.6 });
  const big = h('div', 'abs d-1 php', world, `${DATA.php_share.value}%`); px(big, 900, 230);
  const bigNote = h('div', 'abs t-note', world, tr('能识别后台语言的网站里用 PHP 的比例<br>W3Techs · 2026-10-21', 'of websites whose server-side language is known<br>W3Techs · 21 Oct 2026')); px(bigNote, 910, 420);
  const php = h('div', 'abs d-2', world, 'PHP'); px(php, 900, 560);
  const phpNote = h('div', 'abs t-body', world, tr('写网站后台的语言', 'a language for website back ends')); px(phpNote, 910, 670);
  const apps = h('div', 'abs t-body pale', world, 'WordPress · Drupal · Joomla …'); px(apps, 910, 750);
  slam(php, T('a1') + 0.1, { from: 1.3 }); sfx('thud', T('a1') + 0.15);
  show(phpNote, T('a1', { zh: '后台', en: 'back' }), { y: 16 });
  countTo(big, 0, DATA.php_share.value, tOn, 0.9, (v) => v.toFixed(1) + '%'); show(big, tOn, { y: 10, d: 0.2 });
  show(bigNote, tOn + 0.4, { y: 10 });
  slide(apps, T('a3'), { x: -50 }); sfx('pop', T('a3'));
  const core = h('div', 'abs stamp', world, tr('问题在 PHP 本身', 'The flaw is in PHP itself')); px(core, 910, 860);
  slam(core, T('a4', { zh: '而在', en: 'but' }, -0.25), { from: 1.5, d: 0.3 }); sfx('thud', T('a4', { zh: '而在', en: 'but' }, 0.05));

  // 第二站：远程代码执行。陌生人 → 网络 → 你的服务器运行他的程序
  const X = 2000;
  const rce = h('div', 'abs d-1 red', world, 'RCE'); px(rce, X + 160, 170);
  const rceZh = h('div', 'abs d-3', world, tr('远程代码执行', 'Remote code execution')); px(rceZh, X + 640, 210);
  const who = h('div', 'card', world, `<div class="k">${tr('陌生人', 'a stranger')}</div><div class="v red">${tr('他的程序', 'his program')}</div>`); px(who, X + 160, 470, 420, 170);
  const net = h('div', 'abs mono dimc', world, '· · · · · · · · · →'); css(net, { fontSize: '40px' }); px(net, X + 620, 530);
  const srv = h('div', 'card', world, `<div class="k">${tr('你的服务器', 'your server')}</div><div class="v php">PHP</div>`); px(srv, X + 1260, 470, 420, 170);
  const run = h('div', 'abs mono red', world, tr('▶ 正在运行：他的程序', '▶ running: his program')); css(run, { fontSize: '36px' }); px(run, X + 1260, 680);
  const noLogin = h('div', 'abs stamp amber', world, tr('不用登录', 'No login needed')); px(noLogin, X + 620, 760);
  const toRce = Tend('a4') + 0.4;
  appear(rceZh, toRce);
  slam(rce, T('a6', { zh: '都是', en: 'both' }), { from: 1.3 }); sfx('error', T('a6', { zh: '都是', en: 'both' }), { g: 0.7 });
  slide(who, T('a7') + 0.1, { x: -60 }); sfx('pop', T('a7') + 0.1, { p: -0.4 });
  wipe(net, T('a7', { zh: '网络', en: 'network' }), { dir: 'l', d: 0.6 });
  slide(srv, T('a7', { zh: '服务器', en: 'server' }), { x: 60 }); sfx('pop', T('a7', { zh: '服务器', en: 'server' }), { p: 0.4 });
  appear(run, T('a8')); sfx('blip', T('a8'), { p: 0.4 });
  slam(noLogin, T('a8') + 0.4, { from: 1.5, d: 0.3 }); sfx('thud', T('a8') + 0.4, { g: 0.7 });

  // 第三站：严重程度 9.2 / 10
  const Y = 1300;
  const sev = h('div', 'abs t-note', world, tr('PHP 官方评分 · CVSS v4.0', 'PHP’s rating · CVSS v4.0')); px(sev, X + 160, Y + 120);
  const score = h('div', 'abs d-0 red', world, '0.0'); px(score, X + 150, Y + 180); score.dataset.name = '严重程度';
  const of10 = h('div', 'abs d-2 dimc', world, '/ 10'); px(of10, X + 690, Y + 270);
  const meter = h('div', 'meter', world, '<i></i>'); px(meter, X + 160, Y + 470, 1560, 40);
  const fill = meter.querySelector('i'); css(fill, { width: '100%', transform: 'scaleX(0)' });
  const crit = h('div', 'abs tag red', world, 'CRITICAL'); px(crit, X + 1480, Y + 200);
  const tSev = T('a10', { zh: '九点二', en: '9.2' }, -0.5);
  appear(sev, T('a10')); appear(score, T('a10'));
  countTo(score, 0, DATA.cvss.score, tSev, 0.7, (v) => v.toFixed(1));
  fromTo(fill, tSev, { scaleX: 0 }, { scaleX: DATA.cvss.score / 10, duration: 0.7, ease: 'power2.out' });
  show(of10, T('a10', { zh: '满分', en: 'out' }), { x: -20 });
  slam(crit, tSev + 0.75, { from: 1.5, d: 0.3 }); sfx('thud', tSev + 0.75);

  // 第四站：只有一句 Hello World 的网站
  const code = h('div', 'diff', world, `<span class="ctx">&lt;?php</span>\n<span class="ctx">echo "Hello World";</span>`); px(code, X + 160, Y + 620);
  const hwNote = h('div', 'abs t-body', world, tr('Wiz：这样的网站<span class="red">也可能中招</span>', 'Wiz: even this <span class="red">can be vulnerable</span>')); px(hwNote, X + 900, Y + 680);
  wipe(code, T('a12'), { dir: 'l', d: 0.45 }); sfx('tick', T('a12'));
  slide(hwNote, T('a13'), { x: 60 }); sfx('error', T('a13', { zh: '中招', en: 'vulnerable' }, -0.2), { g: 0.6, p: 0.3 });

  const toSev = Tend('a8') + 0.1, toHw = Tend('a10') + 0.15;
  cam.track(s.start, { x: 960, y: 540, z: 1 }, [
    [c0 + 0.1, { z: 1.04 }, toRce - c0 - 0.2, { ease: 'none', sfx: false }],
    [toRce, { x: X + 960, y: 540, z: 1 }, 0.9],
    [null, { z: 1.04 }, toSev - toRce - 1.1, { ease: 'none', sfx: false }],
    [toSev, { x: X + 960, y: Y + 400, z: 1.08 }, 0.9],
    [toHw, { x: X + 960, y: Y + 560, z: 1 }, 0.8, { sfx: false }],
    [null, { z: 1.04 }, s.end - toHw - 1.0, { ease: 'none', sfx: false }],
  ]);
});
