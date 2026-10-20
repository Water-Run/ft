// 本片的部件：文字、方框、色团、终端、计时条。皮肤由场景根上的年代类名决定（style.css）。
const txt = (parent, cls, html, x, y) => { const e = h('div', 'abs ' + (cls || ''), parent, html); px(e, x, y); return e; };
const blk = (parent, cls, x, y, w, hh) => { const e = h('div', 'abs ' + (cls || ''), parent); px(e, x, y, w, hh); return e; };
// 方框：lab 主标签，sub 次标签。Windows 10 年代里是磁贴，Fluent 里是亚克力面，Windows 11 里是圆角卡片
function card(parent, cls, x, y, w, hh, lab, sub) {
  const e = h('div', 'box ' + (cls || ''), parent); px(e, x, y, w, hh);
  if (lab != null) h('div', 'lab' + (sub == null ? ' solo' : ''), e, lab);
  if (sub != null) h('div', 'sub', e, sub);
  return e;
}
// 亚克力与 Mica 底下的色团：[[类名, x, y, 直径], …]
const blobs = (parent, list) => list.map(([k, x, y, d]) => { const b = h('div', 'blob ' + k, parent); px(b, x, y, d, d); b.dataset.name = 'blob'; return b; });

// 终端。o：{ x, y, w, h, title, era }；窗框按年代画。只放真实回显：命令用 type()，输出用 out()。
// 提示符的写法与取证回显一致：「PS> 」表示在测试机的 PowerShell 里执行，「[ft-wsl1]$ 」表示在该发行版里执行。
function makeTerm(parent, o) {
  const el = h('div', 'term', parent); px(el, o.x, o.y, o.w, o.h); el.dataset.name = 'terminal';
  const bar = h('div', 'bar', el), era = o.era;
  const glyph = (kind, col) => {
    const s = svg('svg', { width: 78, height: 64, viewBox: '0 0 78 64' }, null), st = { fill: 'none', stroke: col, 'stroke-width': 2.4 };
    if (kind === 'min') svg('path', { d: 'M28,33 H50', ...st }, s);
    if (kind === 'max') svg('rect', { x: 29, y: 22, width: 20, height: 20, rx: era === 'w11' ? 4 : 0, ...st }, s);
    if (kind === 'x') svg('path', { d: 'M29,22 L49,42 M49,22 L29,42', ...st }, s);
    return s;
  };
  const col = '#1b1b1b';
  if (era === 'w10') h('div', 'tt', bar, o.title);
  else h('div', 'tab', bar, `<span>${o.title}</span>`);
  const wb = h('div', 'wb', bar); ['min', 'max', 'x'].forEach((k) => wb.appendChild(glyph(k, col)));
  const body = h('div', 'body', el);
  const api = {
    el, body,
    line(html, cls) { return h('div', 'ln ' + (cls || ''), body, html); },
    // 敲入一条命令：提示符先到，命令逐字出现。返回敲完的时刻
    type(prompt, cmd, t, cps = 26, opt = {}) {
      const ln = api.line(`<span class="p">${esc(prompt)}</span><span class="c"></span>`);
      appear(ln, opt.promptAt != null ? opt.promptAt : t - 0.25);
      const n = cmd.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, 'x').length;
      return typeText(ln.lastChild, cmd, t, cps, { cursorUntil: opt.cursorUntil != null ? opt.cursorUntil : t + n / cps + 0.18, sfxGain: opt.g != null ? opt.g : 0.8 });   // 输出一到，光标就收走
    },
    // 输出若干行：整行瞬间出现，逐行错开。lines 的每一项是 html 或 [html, 类名]
    out(lines, t, step = 0.09, snd = 'blip') {
      return lines.map((it, i) => { const [html, cls] = Array.isArray(it) ? it : [it, '']; const ln = api.line(html, 'o ' + (cls || '')); appear(ln, t + i * step); if (snd && i === 0) sfx(snd, t, { g: 0.6 }); return ln; });
    },
    gap() { return api.line('&nbsp;', 'o'); },
  };
  return api;
}

// 计时条：轨道 + 填充。填充在 [t, t + 秒数] 里匀速走完，耗时就是画面上真实经过的时间（长于 cap 秒的按 cap 压缩并标明）
function makeBar(parent, o) {
  const tr_ = h('div', 'bar-track', parent); px(tr_, o.x, o.y, o.w, o.h || 44);
  const fill = h('div', 'bar-fill' + (o.cls ? ' ' + o.cls : ''), tr_); fill.style.width = (o.frac * 100).toFixed(2) + '%';
  return { el: tr_, fill, run(t, d) { fromTo(fill, t, { scaleX: 0 }, { scaleX: 1, duration: d, ease: 'none' }); } };
}
// 文件方格：n 个小方格排成 cols 列
function makeGrid(parent, o) {
  const g = h('div', 'abs', parent); px(g, o.x, o.y, o.cols * o.pitch, Math.ceil(o.n / o.cols) * o.pitch); g.dataset.name = o.name || 'files';
  const cells = [];
  for (let i = 0; i < o.n; i++) { const c = h('div', 'cell', g); px(c, (i % o.cols) * o.pitch, Math.floor(i / o.cols) * o.pitch, o.size, o.size); cells.push(c); }
  return { el: g, cells };
}
// 把一段文字里的某个子串包上高亮：hl('3.0.2.0', '3', 'hi') → <span class="hi">3</span>.0.2.0（只包首次出现）
const hl = (s, part, cls = 'hi') => { const i = s.indexOf(part); return i < 0 ? esc(s) : esc(s.slice(0, i)) + `<span class="${cls}">${esc(part)}</span>` + esc(s.slice(i + part.length)); };
// 字节数的两种写法
const bytes = (n) => nf(n) + tr(' 字节', ' bytes');
const mb = (n) => (n / 1048576).toFixed(0) + ' MB';
const sec = (ms, d = 2) => (ms / 1000).toFixed(d);
// 用 draw() 描出来的线，在开始描之前完全隐藏：虚线偏移到零长度时，线的起点仍会留下一点抗锯齿的痕迹。
// 用 display 而不是 visibility：draw() 的补间带 autoAlpha，会改 visibility；每帧都设，不缓存状态，画面才只由 t 决定
const hideUntil = (el, t0) => { F((t) => { el.style.display = t >= t0 ? '' : 'none'; }); };
