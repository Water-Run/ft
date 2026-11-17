// 本片的部件：GitHub 界面的几样东西（仓库名、状态胶囊、注解框、指针、描框、代码行）。图标来自 src/design/octicons.js（Octicons，MIT）。
// 所有部件的状态都只由 t 决定：位置与显隐都登记到时间线上，不存历史。

// ── 小工具 ──
const el = (parent, cls, html, x, y, w, hh) => { const e = h('div', 'abs ' + (cls || ''), parent, html); px(e, x, y, w, hh); return e; };
const fadeIn = (e, t, o = {}) => show(e, t, { y: o.y != null ? o.y : 16, x: o.x || 0, d: o.d || 0.4, s: o.s });
const fadeOut = (e, t, o = {}) => hide(e, t, { y: o.y != null ? o.y : -10, x: o.x || 0, d: o.d || 0.35 });
// 已在场的元素换成另一种样子：叠一层新样子淡入，旧的淡出（不让类名一下切过去，F30）
// 旧的先淡出一半，新的再接着淡入：两种字不在同一处叠着出现（r2：Merge pull request 与 Merged 叠字）
const swapFade = (a, b, t, d = 0.3) => { fromTo(a, t, { autoAlpha: 1 }, { autoAlpha: 0, duration: d * 0.6, ease: 'power1.in', immediateRender: false }); fromTo(b, t + d * 0.45, { autoAlpha: 0 }, { autoAlpha: 1, duration: d * 0.6, ease: 'power1.out' }); };

// ── GitHub 的几样部件（html 字符串） ──
const st = (kind, icon, text, size = 28) => `<span class="state ${kind}">${oct(icon, size, kind === 'idle' ? C.muted : '#fff')}${text}</span>`;
const repoName = (owner, name, o = {}) => `<span class="row" style="gap:${o.gap || 14}px;font-size:${o.size || 34}px">${oct(o.icon || 'repo', (o.size || 34) * 0.85, C.muted)}<span style="color:var(--accent)">${owner}</span><span class="k">/</span><b style="color:var(--accent);font-weight:700">${name}</b>${o.pub === false ? '' : `<span class="pill" style="font-size:24px;margin-left:6px">Public</span>`}</span>`;
const av = (who, size = 48) => { const m = { 'WaterRun': ['av-mei', 'W'], '你': ['av-you', '你'], '路人甲': ['av-pass', '路'] }[who]; return `<span class="avatar ${m[0]}" style="width:${size}px;height:${size}px;font-size:${Math.max(24, Math.round(size / 2))}px">${m[1]}</span>`; };
const codeLn = (no, html, cls = '', sg = null) => `<div class="ln ${cls}"><span class="no">${no}</span>${sg != null ? `<span class="sg">${sg}</span>` : ''}${html}</div>`;
const GT = '&gt;', GE = '&gt;=';

// ── 注解框：深色提示框带一个尖角；dir 是尖角朝哪边（up：框在对象下方，尖角朝上） ──
function gloss(parent, html, x, y, dir = 'up', term) {
  const e = el(parent, 'gloss ' + dir, html + '<span class="tip"></span>', x, y);
  if (term) e.dataset.gloss = term;
  return e;
}
// ── 描框：圈出某一块（构建期量好它的位置） ──
function ring(parent, b, cls = '', pad = 8) { const e = el(parent, 'ring ' + cls, '', b.x - pad, b.y - pad, b.w + pad * 2, b.h + pad * 2); e.dataset.name = '描框'; e.dataset.overlapOk = '1'; return e; }

// ── 指针：一个鼠标箭头。轨迹每段显式给出起止（与镜头同理），点击时缩一下 ──
function pointer(parent) {
  const e = el(parent, '', '<svg width="46" height="56" viewBox="0 0 23 28"><path d="M1.5,1.5 L1.5,22 L7,17 L10.6,25.5 L14.2,24 L10.6,15.6 L17.8,15.6 Z" fill="#1f2328" stroke="#ffffff" stroke-width="1.6" stroke-linejoin="round"/></svg>', 0, 0);
  e.dataset.name = '指针'; e.dataset.overlapOk = '1'; e.style.zIndex = 40;
  return e;
}
// keys: [[t, x, y, d]]：第一项是出现的位置与时刻；之后每项从上一项的位置移到 (x, y)，用时 d
function pointerPath(p, keys, tOut) {
  let [t0, x0, y0] = keys[0];
  fromTo(p, t0, { autoAlpha: 0, left: x0 + 30, top: y0 + 40 }, { autoAlpha: 1, left: x0, top: y0, duration: 0.45, ease: 'power3.out' });
  for (const [t, x, y, d = 0.6] of keys.slice(1)) { fromTo(p, t, { left: x0, top: y0 }, { left: x, top: y, duration: d, ease: 'power3.inOut', immediateRender: false }); x0 = x; y0 = y; }
  if (tOut != null) fromTo(p, tOut, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3, immediateRender: false });
}
const clickAt = (p, t, target) => {
  fromTo(p, t, { scale: 1 }, { keyframes: [{ scale: 0.82, duration: 0.08 }, { scale: 1, duration: 0.18 }], transformOrigin: '0 0', immediateRender: false });
  if (target) fromTo(target, t, { scale: 1 }, { keyframes: [{ scale: 0.95, duration: 0.08 }, { scale: 1, duration: 0.2 }], immediateRender: false });
  sfx('tick', t, { g: 1.1 });
};
// 在某个元素上原地点亮一层黄色（正在指认的那一处），过一会儿慢慢退回
function markOn(parent, b, t, t1, pad = 4) {
  const m = el(parent, '', '', b.x - pad, b.y - pad, b.w + pad * 2, b.h + pad * 2);
  css(m, { border: '3px solid ' + C.attention, borderRadius: '8px' });
  m.dataset.overlapOk = '1'; m.dataset.name = '指认框';
  fromTo(m, t, { autoAlpha: 0, scale: 1.25 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' });
  if (t1 != null) fromTo(m, t1, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.5, immediateRender: false });
  return m;
}
// 两个元素之间拉一条线（构建期量位置）
const midR = (b) => [b.r, b.cy], midL = (b) => [b.x, b.cy], midB = (b) => [b.cx, b.b], midT = (b) => [b.cx, b.y];
