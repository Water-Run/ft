// 片尾：片名、制作名单与开源仓库地址。名单与 project.json 的 credits 一致；不配旁白。
scene('outro', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const t0 = s.start + 0.3;
  // 左栏：片名与开源地址
  const frame = blk(world, '', 60, 120, 640, 760); frame.style.border = '8px solid var(--olive)';
  const big = txt(world, 'big', 'SSH', 96, 150); big.style.fontSize = '240px';
  const ttl = txt(world, 'cap-zh', tr('256 秒搞懂 SSH', 'SSH in 256 Seconds'), 104, 390); ttl.style.fontSize = '44px'; ttl.style.fontWeight = 700; ttl.style.color = 'var(--paper)';
  stripe(world, 104, 470, 520);
  const os = txt(world, 'plate zh', tr('开源视频', 'Open-source video'), 104, 520); os.style.fontSize = '30px';
  const repo = txt(world, 'term', 'github.com/Water-Run/ft', 104, 580); repo.style.fontSize = '50px';
  const lic = txt(world, 'term p', 'GPL-3.0-or-later', 104, 650); lic.style.fontSize = '36px';
  flick(frame, t0 - 0.1); slam(big, t0, { from: 1.15, d: 0.3, ease: 'steps(3)' }); sfx('thud', t0, { g: 0.7, p: -0.4 });
  flick(ttl, t0 + 0.2); flick(os, t0 + 0.5); flick(repo, t0 + 0.6); flick(lic, t0 + 0.7); sfx('chime', t0 + 0.6, { g: 0.5, p: -0.4 });
  // 右栏：名单，一行一行打出
  const rows = [
    ['plan', tr('策划', 'Planning'), 'WaterRun', null],
    ['m', tr('模型', 'Models'), 'MiniMax M3.1 Flash', '事实测绘 · 实验 · 中文文案 · 视觉与配乐方向'],
    ['m', '', 'Grok 4.7', '视觉系统 · 配乐初稿 · 文案对抗审稿 · 英文翻译'],
    ['m', '', 'Gemini 4 Argon', '中文稿'],
    ['m', '', 'Claude Opus 5.5', '分镜 · 场景实现 · 配乐 · 音效与混音 · 封面 · 渲染与验收'],
    ['s', tr('服务', 'Services'), 'MiniMax speech-2.8-hd', tr('配音 · Chinese (Mandarin)_Radio_Host', 'Narration · Friendly_Person')],
    ['s', '', '网页抓取服务（模型未披露）', '网页检索'],
  ];
  let y = 124;
  rows.forEach(([kind, label, name, roles], i) => {
    const tt = t0 + 0.35 + i * 0.16;
    if (label) { const l = txt(world, 'plate zh', label, 780, y + 4); l.style.fontSize = '26px'; appear(l, tt); }
    const n = txt(world, kind === 'plan' ? 'big' : 'term', name, 940, y); n.style.fontSize = kind === 'plan' ? '48px' : '36px';
    if (/[一-鿿]/.test(name)) { n.className = 'abs cap-zh ac'; n.style.fontSize = '30px'; }
    line(n, tt, { g: 0.35, p: 0.4, sfx: i % 2 === 0 });
    y += kind === 'plan' ? 76 : 44;
    if (roles) { const r = txt(world, 'cap-zh', roles, 940, y); r.style.fontSize = '26px'; appear(r, tt + 0.05); y += 52; }
    if (i === 0 || i === 4) y += 18;
  });
  camPath(cam, s, { x: 960, y: 484, z: 1 }, [[s.start + 0.1, { z: 1.025 }, s.end - s.start - 0.2, { ease: 'none', sfx: false }]]);
});
