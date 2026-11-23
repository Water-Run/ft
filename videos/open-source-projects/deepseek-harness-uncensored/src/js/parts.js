// 本片的部件：图标、标志、DSHU 应用窗口、设置页与对话框、模式换色、注解与高亮、3D 动作。
// 界面照 DSHU 的截图重画（research/_src/dshu/docs/assets/dshu/*.webp，见 research/MATERIALS.md），不贴截图；
// 窗口约为截图的 1.4 倍，窗口里的文字一律不小于 22px（project.json 的 check.min_font）。所有动作仍只由 t 决定。

const MC = { def: '#2563EB', sec: '#DC2626', rev: '#15803D', wri: '#A16207' };
const MODE = {
  def: { zh: '缺省', en: 'Default', d: '日常使用和通用开发', ic: 'hash', li: ['读写与检索工作区', '执行命令与测试', '任务清单与委派'] },
  sec: { zh: '网安', en: 'Security', d: '安全审计和渗透测试', ic: 'shield', li: ['七类现场手册', '案件记录与报告', '独立代理'] },
  rev: { zh: '逆向', en: 'Reverse', d: '逆向你要逆向的程序', ic: 'code', li: ['八类分析手册', '内置 REA 6.9.0', '样本清点'] },
  wri: { zh: '写作', en: 'Writing', d: '写你想写的东西', ic: 'pen', li: ['七类写作手册', '六轴文风卡', '设定集'] },
};
const MODES = ['def', 'sec', 'rev', 'wri'];
const ICONS = {
  hash: '<path d="M5 9h14M5 15h14M10 3 8 21M16 3l-2 18"/>',
  shield: '<path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z"/>',
  code: '<path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
  pen: '<path d="M5 4h10l4 4v12H5z"/><path d="M9 12h6M9 16h4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M17 14v6M14 17h6"/>',
  folder: '<path d="M3 6h6l2 2h10v11H3z"/>',
  plus: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
  plain: '<path d="M12 5v14M5 12h14"/>',
  think: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
  inject: '<path d="M6 4h12v16H6z"/><path d="M12 8v6M9 11l3 3 3-3"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h1M4 12h1M4 18h1"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4-4"/>',
  sliders: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  newfolder: '<path d="M3 6h6l2 2h10v11H3z"/><path d="M15 11v5M12.5 13.5h5"/>',
  doc: '<path d="M6 3h9l3 3v15H6z"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  run: '<path d="M7 5l12 7-12 7z"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  side: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
  book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
  term: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M12 15h5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
  db: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>',
  gauge: '<path d="M4 15a8 8 0 1 1 16 0"/><path d="m12 15 4-4"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M16 12h2"/>',
  limit: '<path d="M4 20h16M7 16V9M12 16V5M17 16v-4"/>',
  panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
  panelR: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>',
  split: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16"/>',
  full: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  dots: '<circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5H4v11h4"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  stop: '<rect x="7" y="7" width="10" height="10" rx="1.5"/>',
  send: '<path d="M4 12 20 4l-6 16-3-7z"/>',
  warn: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/>',
  trash: '<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',
  pin: '<path d="M12 17v5M8 3h8l-1 6 3 4H6l3-4z"/>',
  tasks: '<path d="M4 6h2M4 12h2M4 18h2M9 6h11M9 12h11M9 18h11"/>',
  github: '<path d="M9 19c-4 1.5-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
  plug: '<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/>',
  chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
  memory: '<path d="M12 3a6 6 0 0 0-6 6c0 2 1 3.5 2.5 4.5V17h7v-3.5C17 12.5 18 11 18 9a6 6 0 0 0-6-6zM9.5 20h5"/>',
  box: '<path d="M12 3 4 7v10l8 4 8-4V7z"/><path d="M4 7l8 4 8-4M12 11v10"/>',
  windows: '<path d="M3 5.5 10.5 4.5v7H3zM12 4.3 21 3v8.5h-9zM3 12.5h7.5v7L3 18.5zM12 12.5h9V21l-9-1.3z"/>',
  linux: '<path d="M12 3c-2 0-3 1.8-3 4 0 1.5-1.5 3-2.5 5S5 16.5 6 18s4 2 6 2 5-.5 6-2-.5-4-1.5-6S15 8.5 15 7c0-2.2-1-4-3-4z"/><circle cx="10.5" cy="7.5" r=".6"/><circle cx="13.5" cy="7.5" r=".6"/>',
  apple: '<path d="M16.5 13c0-2.6 2.1-3.4 2.2-3.5-1.2-1.8-3.1-2-3.7-2-1.6-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.8 1.2 1.8 2.6 3.1 2.5 1.3 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.5.9-1.4 1.3-2.8 1.3-2.8s-2.3-.9-2.3-3.5zM14 5.5c.7-.8 1.2-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z"/>',
};
const icon = (k, extra = '') => `<svg class="i" viewBox="0 0 24 24" ${extra}>${ICONS[k] || ''}</svg>`;

// ── 标志：DSHU 图标里的同一条鲸鱼路径（src/design/assets/whale.js）。原版：白底深鲸、方角；DSHU：黑底白鲸、圆角 ──
function logoSVG(size, parent) {
  const s = svg('svg', { width: size, height: size, viewBox: '0 0 1024 1024' }, parent); s.style.position = 'relative'; s.style.display = 'block';
  const tile = svg('rect', { x: 32, y: 32, width: 960, height: 960, rx: 0, fill: '#FBFBFB', stroke: '#e2e4e9', 'stroke-width': 2 }, s);
  const fish = svg('path', { transform: 'translate(157 261) scale(32.5)', d: window.WHALE_PATH, fill: '#1C2434' }, s);
  return { s, tile, fish };
}
// 标志下面垫一块与底板同形的板子承托阴影（大尺寸 SVG 直接加 drop-shadow 在渲染时会丢掉鲸鱼）
function shadowPlate(parent, size, t, shadow) {
  const k = size / 1024, p = h('div', 'abs', parent); px(p, 32 * k, 32 * k, 960 * k, 960 * k);
  css(p, { borderRadius: (224 * k * t) + 'px', boxShadow: shadow, background: t ? '#10131a' : '#FBFBFB' });
  return p;
}
function logoDark(size, parent) {   // 静态的 DSHU 标志
  const l = logoSVG(size, parent); l.tile.setAttribute('fill', '#10131a'); l.tile.setAttribute('rx', 224); l.tile.setAttribute('stroke', '#303644'); l.fish.setAttribute('fill', '#ffffff');
  return l;
}
// 侧栏与首页里的小鲸鱼：截图里是不带底板的单色鲸鱼
function whale(size, color = 'currentColor') {
  return `<svg width="${size}" height="${size * 0.8}" viewBox="0 0 24 19" style="display:block;flex:none"><path d="${window.WHALE_PATH}" fill="${color}"/></svg>`;
}

// ── 应用窗口 ──
// o: { mode, home, title, sessions: [[标题, 模式, 选中?, 运行中?]], ws, wsSessions 放在哪个工作区下, more: 其余工作区, cost, x, y, w, h }
function makeApp(parent, o = {}) {
  const m = o.mode || 'def';
  const el = h('div', 'app', parent); el.style.setProperty('--mc', MC[m]);
  if (o.x != null) px(el, o.x, o.y, o.w, o.h);
  const side = h('div', 'side', el);
  const brand = h('div', 'brand', side);
  const mark = h('div', 'mark', brand, whale(46, '#1f2329'));
  const bt = h('div', '', brand, '<div class="wm">deepseek</div>');
  const tags = h('div', 'tags', bt, '<span class="tag h">HARNESS</span>');
  const tagU = o.official ? null : h('span', 'tag u', tags, 'UNCENSORED');
  h('span', 'sideicon', brand, icon('panel'));
  h('div', 'newbtn', side, icon('plus') + ' 新会话');
  h('div', 'nav', side, icon('clock') + ' 自动化任务'); h('div', 'nav', side, icon('grid') + ' 更多');
  h('div', 'grp', side, `<span>工作区</span><span class="gi">${icon('search')}${icon('sliders')}${icon('newfolder')}</span>`);
  const wsEl = h('div', 'ws open', side, icon('folder') + ` <span>${o.ws || 'acme-shop'}</span>`);
  const sess = (o.sessions || [[o.title || '新会话', m, true]]).map(([t, mm, on, run]) => {
    const e = h('div', 'sess' + (on ? ' on' : ''), side, `${run ? '<span class="spin"></span>' : ''}<span class="st">${t}</span><small>刚刚</small>`);
    e.style.setProperty('--c', mm ? MC[mm] : 'transparent'); return e;
  });
  for (const w of (o.more || ['router-fw', '雾港'])) h('div', 'ws', side, icon('folder') + ` <span>${w}</span>`);
  const bal = h('div', 'bal', side, `<div class="r"><span><span class="dot"></span><span class="ph">低峰时段</span></span><span class="cdw">${icon('clock')}<span class="cd mono">39:22:15</span></span></div><div class="r" style="margin-top:8px"><span>充值余额</span><b class="amt">¥126.73</b></div>`);
  h('div', 'nav', side, '<span style="width:24px;text-align:center">···</span> 更多').style.marginTop = '8px';
  const main = h('div', 'main', el);
  let hdr = null, titleEl = null, pill = null;
  if (!o.home) {
    hdr = h('div', 'hdr', main); titleEl = h('span', 'htitle', hdr, o.title || '');
    pill = h('span', 'pill', hdr, `<span class="pic">${icon(MODE[m].ic)}</span> <span class="pt">${MODE[m].zh}</span>`);
    h('span', 'hic', hdr, icon('side') + icon('dots') + icon('panelR'));
  }
  const body = h('div', 'body', main);
  return { el, side, brand, mark, tagU, wsEl, sess, bal, phase: bal.querySelector('.ph'), cd: bal.querySelector('.cd'), amt: bal.querySelector('.amt'), main, hdr, titleEl, pill, body };
}
function composer(parent, o = {}) {
  const c = h('div', 'composer', parent);
  const ph = h('div', 'ph', c, o.ph || '发消息或创建任务，/ 调用指令，@ 文件或对话');
  const bar = h('div', 'bar', c, `<span class="plusb">${icon('plain')}</span><span class="perm">${icon('shield')} 完全权限 <span class="car">⌄</span></span><span class="model">DeepSeek-V4.1-Flash <span style="opacity:.55">Max</span> <span class="car">⌄</span></span>`);
  const send = h('span', 'send' + (o.ready ? ' ready' : ''), bar, o.busy ? icon('stop') : icon('up'));
  const pw = o.pw || 1388, w = o.w || 1080;   // 居中：按父元素宽度直接算 left（不用 translateX(-50%)，免得被补间的 x 覆盖）
  css(c, { width: w + 'px', left: (pw - w) / 2 + 'px' });
  return { c, ph, bar, send };
}
// 底栏：轮次与步数、token 与缓存、本对话费用、额度限制
function footbar(parent, o = {}) {
  const f = h('div', 'foot', parent);
  const a = h('span', '', f, icon('gauge') + ` ${o.turns || '1 轮 4 步 · 242 tok/s'}`);
  const b = h('span', '', f, icon('db') + ` ${o.tok || '86.9K tok · 缓存命中 0%'}`);
  const c = h('span', 'cost', f, icon('wallet') + ` <span class="v">${o.cost || '¥0.18'}</span>`);
  const d = h('span', 'lim', f, icon('limit') + ` <span class="v">${o.lim || '未启用'}</span>`);
  return { f, turns: a, tok: b, cost: c, lim: d };
}
function step(parent, ic, label, detail, cls = '') { return h('div', 'step ' + cls, parent, `<span class="si">${icon(ic)}</span><span>${label}</span>${detail ? `<span class="sd"></span><span class="sv">${detail}</span>` : ''}`); }
function injects(parent) { return ['runtime-context', 'skill-catalog', 'time-context'].map((k) => step(parent, 'inject', '上下文注入', k)); }
const THUMB = '<path d="M7 11v9H4v-9zM7 11l4-7a2 2 0 0 1 3 2l-1 4h6a2 2 0 0 1 2 2l-2 7a2 2 0 0 1-2 1H7"/>';
function msgActions(parent, time = '17:32') { return h('div', 'acts', parent, `${icon('copy')}<svg class="i" viewBox="0 0 24 24">${THUMB}</svg><svg class="i" viewBox="0 0 24 24" style="transform:scaleY(-1)">${THUMB}</svg>${icon('send')}<span class="tm">${time}</span>`); }
// 对话正文的一栏（居中，窗口里所有回复都排在这一栏）
function column(body, o = {}) { const c = h('div', 'col', body); const w = o.w || 1040; css(c, { width: w + 'px', left: (1388 - w) / 2 + 'px' }); if (o.top != null) c.style.top = o.top + 'px'; return c; }

// ── 设置页（照「设置」截图：左侧通用、模型、额度、模式、插件）──
function settings(parent, active, o = {}) {
  const el = h('div', 'settings', parent); if (o.x != null) px(el, o.x, o.y, o.w, o.h);
  const nav = h('div', 'snav', el, '<div class="sh">设置</div>');
  const items = { 通用: 'gear', 模型: 'db', 额度: 'gear', 模式: 'box', 插件: 'sliders' };
  for (const k in items) h('div', 'sni' + (k === active ? ' on' : ''), nav, icon(items[k]) + ' ' + k);
  h('div', 'stop', el, `<span class="cfg">打开配置文件</span>${icon('x')}`);
  const content = h('div', 'scontent', el);
  return { el, nav, content };
}
function dialog(parent, x, y, w, title, o = {}) {
  const d = h('div', 'dialog', parent); px(d, x, y, w); if (o.h) d.style.height = o.h + 'px';
  d.dataset.overlapOk = '';   // 模态框：底下的内容被它盖住（真实界面就是这样）
  h('div', 'dh', d, `<span>${title}</span>${icon('x')}`);
  const body = h('div', 'db', d);
  return { d, body };
}
function toggleEl(parent, on = false) { const t = h('span', 'toggle' + (on ? ' on' : ''), parent, '<i></i>'); return t; }
// 开关在 t 时刻拨到「开」：底色与圆钮一起动
function toggleOn(tg, t, color) {
  fromTo(tg, t, { backgroundColor: '#cfd3da' }, { backgroundColor: color || 'var(--mc)', duration: 0.3, ease: 'power2.out' });
  fromTo(tg.querySelector('i'), t, { x: 0 }, { x: 26, duration: 0.3, ease: 'power2.out' });
  sfx('tick', t, { g: 0.8 });
}
function checkOn(cb, t) { keyed(cb).at(t, { cls: 'cbx on' }); fromTo(cb, t, { scale: 0.7 }, { scale: 1, duration: 0.3, ease: 'back.out(3)', immediateRender: false }); sfx('tick', t, { g: 0.7 }); }

// ── 动作工具（都显式给出起点，画面只由 t 决定）──
function fadeIn(e, t, o = {}) { tl.fromTo(e, { autoAlpha: 0, y: o.y != null ? o.y : 14, x: o.x || 0 }, { autoAlpha: 1, y: 0, x: 0, duration: o.d || 0.4, ease: o.ease || 'power2.out', immediateRender: true }, t); return e; }
function fadeOut(e, t, o = {}) { tl.fromTo(e, { autoAlpha: 1, y: 0, x: 0 }, { autoAlpha: 0, y: o.y || 0, x: o.x || 0, duration: o.d || 0.35, ease: o.ease || 'power2.in', immediateRender: false }, t); }
function modeTo(el, t, from, toM, d = 0.6) { tl.fromTo(el, { '--mc': MC[from] }, { '--mc': MC[toM], duration: d, ease: 'power1.inOut', immediateRender: false }, t); }
// 高亮环：围住 target（相对 rel 量），t0 出现，t1 退场
function ringOn(rel, target, t0, t1, o = {}) {
  const b = box(target, rel), p = o.pad != null ? o.pad : 8;
  const r = h('div', 'ring', rel); px(r, b.x - p, b.y - p, b.w + 2 * p, b.h + 2 * p);
  if (o.c) r.style.setProperty('--rc', o.c);
  if (o.r != null) r.style.borderRadius = o.r + 'px';
  tl.fromTo(r, { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'power3.out', immediateRender: true }, t0);
  if (t1 != null) fadeOut(r, t1, { d: 0.3 });
  return r;
}
// 注解：深色磨砂玻璃卡片，挂在被讲的东西旁边
function note(parent, x, y, html, w, o = {}) {
  const n = h('div', 'note', parent, html); px(n, x, y); if (w) n.style.width = w + 'px';
  if (o.gloss) n.dataset.gloss = o.gloss;
  return n;
}
// 场景通用：深色舞台背景（带当前模式色的光晕与细颗粒）
function stageBg(world, m) { const b = h('div', 'stagebg', world); b.style.setProperty('--mc', MC[m]); h('div', 'grain', b); return b; }
// 停留时极慢横移：一屏合计不超过 48 像素
function drift(t0, t1, dir = 1, base = 960) { const d = Math.max(0.5, t1 - t0), dx = Math.min(40, 1.8 * d) * dir; return [t0, { x: base + dx / 2 }, d, { ease: 'none', sfx: false }]; }

// ── 3D ──
const P3 = 2600;   // 透视距离（像素），全片统一
// 从景深里立起来：前倾、在远处，落到正面。元素之前已经出场过（例如沉下去再回来）时传 again: true，不在构建时就把它设成起始状态
function rise3d(e, t, o = {}) {
  tl.fromTo(e, { autoAlpha: 0, rotationX: o.rx != null ? o.rx : 16, rotationY: o.ry || 0, z: o.z != null ? -o.z : -420, y: o.y != null ? o.y : 40, transformPerspective: P3 },
    { autoAlpha: 1, rotationX: 0, rotationY: 0, z: 0, y: 0, duration: o.d || 0.9, ease: o.ease || 'power3.out', immediateRender: o.again ? false : true }, t);
  return e;
}
// 沉回景深里去
function sink3d(e, t, o = {}) {
  tl.fromTo(e, { autoAlpha: 1, rotationX: 0, rotationY: 0, z: 0, y: 0, transformPerspective: P3 },
    { autoAlpha: 0, rotationX: o.rx != null ? o.rx : -14, rotationY: o.ry || 0, z: o.z != null ? -o.z : -500, y: o.y || 0, duration: o.d || 0.6, ease: o.ease || 'power2.in', immediateRender: false }, t);
}
// 立方体式换场：整扇窗口绕自己的一条竖边转过去，下一扇从另一边转进来
function cubeIn(e, t, d = 0.85) {
  tl.fromTo(e, { rotationY: 62, x: 700, z: -380, transformOrigin: '0% 50%', transformPerspective: P3, autoAlpha: 1 },
    { rotationY: 0, x: 0, z: 0, duration: d, ease: 'power3.inOut', immediateRender: true }, t);
}
function cubeOut(e, t, d = 0.85) {
  tl.fromTo(e, { rotationY: 0, x: 0, z: 0, transformOrigin: '100% 50%', transformPerspective: P3 },
    { rotationY: -62, x: -700, z: -380, duration: d, ease: 'power3.inOut', immediateRender: false }, t);
}
// 换场时卡片在原地 3D 翻面：前一面转走、后一面转出来
function flip3d(front, back, t, d = 0.7, axis = 'rotationX') {
  tl.fromTo(front, { [axis]: 0, autoAlpha: 1, transformPerspective: 1600 }, { [axis]: -90, duration: d / 2, ease: 'power2.in', immediateRender: false }, t);
  tl.set(front, { autoAlpha: 0 }, t + d / 2);
  tl.fromTo(back, { [axis]: 90, autoAlpha: 0, transformPerspective: 1600 }, { [axis]: 0, autoAlpha: 1, duration: d / 2, ease: 'power2.out', immediateRender: true }, t + d / 2);
}

// ── 新会话首页（照 hero 截图）：鲸鱼 + 标语、工作区与模式选择、输入框 ──
const HOME_SESS = [['新会话', null, true], ['整理发布说明', 'def'], ['修复搜索结果消失', 'def'], ['审计上传接口', 'sec']];
function homePage(app, o = {}) {
  const head = h('div', 'abs homehead', app.body, `${whale(56, '#1f2329')}<span>更自由的探索未至之境</span>`);
  css(head, { left: '0', right: '0', top: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '18px', fontSize: '44px' });
  const ctx = h('div', 'ctxrow', app.body, `<span>${icon('folder')} acme-shop <span class="car">⌄</span></span><span class="mchip"><span class="mic" style="color:var(--mc)">${icon(MODE[o.mode || 'def'].ic)}</span><span class="mname">${MODE[o.mode || 'def'].zh}</span> <span class="car">⌄</span></span>`);
  ctx.style.top = '386px'; css(ctx, { left: '160px', transform: 'none' });
  const comp = composer(app.body, { ph: '描述你想要构建的内容，/ 调用指令，@ 文件或对话' }); comp.c.style.bottom = '338px';
  return { head, ctx, mchip: ctx.querySelector('.mchip'), mname: ctx.querySelector('.mname'), mic: ctx.querySelector('.mic'), comp };
}

// ── 输入框内容的时间表：同一个元素只用一个控制器，按时段显示（多个 typeText / keyed 挂在同一元素上会互相覆盖）──
// segs: [[t0, 'text', html]] 或 [[t0, 'type', 纯文本, { cps, pre, post, cursorUntil, ghost }]]；返回 type(...) 打完的时刻用 typeEnd()
const CUR = '<span class="cur" style="height:1em;width:3px;vertical-align:-.15em;background:var(--mc)"></span>';
function inputTrack(el, base, segs) {
  segs = segs.slice().sort((a, b) => a[0] - b[0]);
  for (const [t0, kind, p, o = {}] of segs) if (kind === 'type') { const n = [...p].length, cps = o.cps || 14; for (let i = 0; i < n; i += 2) sfx('key', t0 + i / cps, { g: 0.8 }); }
  let last = null;
  F((t) => {
    let html = base;
    for (const [t0, kind, p, o = {}] of segs) {
      if (t < t0) break;
      if (kind === 'text') { html = p; continue; }
      const chars = [...p], k = Math.min(chars.length, Math.floor((t - t0) * (o.cps || 14)));
      const cur = (o.cursorUntil == null || t < o.cursorUntil) ? CUR : '';
      html = (o.pre || '') + `<span class="ty">${esc(chars.slice(0, k).join(''))}</span>` + cur + (o.post || '');
    }
    if (html !== last) { el.innerHTML = html; last = html; }
  });
}
const typeEnd = (t0, text, cps = 14) => t0 + [...text].length / cps;

// ── 让位：讲到的物件要放在窗口右侧时，对话栏与输入框像打开侧栏那样往左挪、收窄（显式起点）──
// 主区宽 1388；居中时对话栏 left 174、宽 1040，输入框 left 154、宽 1080。让位后两者的中心移到 424
const ROOM = { colL: 44, colW: 760, compL: 34, compW: 780 };
function makeRoom(t, col, comp, d = 0.7) {
  fromTo(col, t, { left: 174, width: 1040 }, { left: ROOM.colL, width: ROOM.colW, duration: d, ease: 'power3.inOut', immediateRender: false });
  if (comp) fromTo(comp, t, { left: 154, width: 1080 }, { left: ROOM.compL, width: ROOM.compW, duration: d, ease: 'power3.inOut', immediateRender: false });
}
// 聚焦：讲到的物件浮在舞台上时，整扇窗口淡到几乎看不见（之后再回来用 unfocus）
function focusOn(e, t, d = 0.5) { fromTo(e, t, { opacity: 1 }, { opacity: 0.1, duration: d, ease: 'power2.inOut', immediateRender: false }); }
function focusOff(e, t, d = 0.5) { fromTo(e, t, { opacity: 0.1 }, { opacity: 1, duration: d, ease: 'power2.inOut', immediateRender: false }); }
