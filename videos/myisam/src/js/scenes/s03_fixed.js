// 03 数据文件：定长行。字节取自真实的 users.MYD（128 字节）
const MYD_GEO = { x: 96, y: 128, w: 1240, rowH: 46, cw: 44, fs: 25, legendH: 62 };
const fieldOf = (i) => { const c = i % 16; return c === 0 ? 'flag' : c < 5 ? 'id' : c < 15 ? 'name' : 'age'; };

function injectMydCss(root) {
  const st = document.createElement('style');
  st.textContent = `
  .myd-body { position:relative; padding:14px 30px 22px 30px; }
  .myd-legend { position:relative; height:${MYD_GEO.legendH}px; }
  .lg { position:absolute; top:6px; height:50px; }
  .lg-t { position:absolute; left:50%; top:0; transform:translateX(-50%); font-size:21px; letter-spacing:.06em; white-space:nowrap; }
  .lg-t small { font-family:var(--mono); font-size:16px; opacity:.75; margin-left:8px; }
  .lg-b { position:absolute; left:2px; right:2px; bottom:0; height:9px; border:2px solid currentColor; border-bottom:none; border-radius:5px 5px 0 0; }
  .dec { font-family:var(--mono); font-size:25px; }
  .dec-row { display:flex; align-items:center; height:${MYD_GEO.rowH}px; white-space:pre; }
  .dec-row .n { width:74px; color:var(--faint); font-size:20px; }
  .dec-row .a { width:74px; text-align:right; }
  .dec-row .b { width:176px; padding-left:34px; }
  .dec-row .c { width:60px; text-align:right; }
  .dec-hd { color:var(--faint); font-size:19px; letter-spacing:.08em; height:${MYD_GEO.legendH}px; align-items:flex-end; padding-bottom:12px; }
  .insp { position:absolute; left:96px; top:660px; width:1728px; height:230px; }
  .insp-in { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; gap:40px; }
  .ib { display:flex; gap:6px; }
  .ib span { font-family:var(--mono); font-size:38px; width:68px; height:66px; display:flex; align-items:center; justify-content:center; border-radius:8px; }
  .ib.sm span { font-size:30px; width:52px; height:56px; }
  .iarrow { font-family:var(--mono); font-size:36px; color:var(--faint); }
  .ival { font-family:var(--mono); font-size:54px; font-weight:500; }
  .icap { position:absolute; left:0; right:0; bottom:6px; text-align:center; font-size:23px; letter-spacing:.08em; color:var(--dim); }
  .icap b { font-weight:500; color:var(--text); }
  .bits { display:flex; gap:6px; }
  .bits i { font-style:normal; font-family:var(--mono); font-size:30px; width:50px; height:56px; display:flex; align-items:center; justify-content:center; border-radius:7px; border:1px solid var(--line-2); color:var(--dim); }
  .bits i.on { border-color:var(--orange); color:var(--orange-hi); background:rgba(242,145,17,.16); }
  .bitnote { font-size:22px; letter-spacing:.06em; color:var(--dim); line-height:1.7; }
  .bitnote b { color:var(--orange-hi); font-weight:500; }
  .fml { font-family:var(--mono); font-size:50px; display:flex; align-items:center; gap:22px; white-space:nowrap; }
  .fml .zh { font-family:var(--sans); font-size:40px; letter-spacing:.08em; }
  .fml .op { color:var(--faint); }
  .rf { position:absolute; left:0; right:0; top:716px; display:flex; align-items:center; justify-content:center; gap:26px; white-space:nowrap; }
  .rf .big { font-size:46px; font-weight:500; letter-spacing:.16em; }
  .rf .kv { font-family:var(--mono); font-size:24px; color:var(--dim); padding:10px 20px; border:1px solid var(--line-2); border-radius:8px; background:rgba(2,14,19,.6); }
  .rf .kv b { color:var(--orange-hi); font-weight:500; }
  `;
  root.appendChild(st);
}

// 十六进制面板 + 右侧逐行解码表（03、04 两章共用同一版式）
function mydPanel(root, hex, o = {}) {
  const G = MYD_GEO;
  const nRows = o.rows || Math.ceil(hex.length / 32);
  const pH = 48 + 14 + G.legendH + nRows * G.rowH + 22;
  const panel = h('div', 'panel', root); px(panel, G.x, G.y, G.w, pH);
  const hd = h('div', 'panel-hd', panel, `<span>users.MYD</span><span class="r"><span class="sz">${o.size != null ? o.size : hex.length / 2}</span> 字节</span>`);
  const body = h('div', 'myd-body', panel);
  const legend = h('div', 'myd-legend', body);
  const hv = hexView(body, hex.padEnd(nRows * 32, ' '), { cw: G.cw, rowH: G.rowH, fs: G.fs, cls: o.colored ? (i) => 'f-' + fieldOf(i) : null });
  css(hv.el, { position: 'relative' });
  hv.asc.forEach((a) => { a.style.width = '17px'; });
  // 超出真实长度的格子先留空（04 章追加新行时再填）
  for (let i = hex.trim().length / 2; i < hv.cells.length; i++) { hv.cells[i].textContent = ''; if (hv.asc[i]) hv.asc[i].textContent = ''; }
  for (let r = Math.ceil(hex.trim().length / 32); r < nRows; r++) hv.offs[r].style.opacity = 0;
  // 列图例：定长行的字段在每一行都落在同一列
  const c0 = box(hv.cells[0], legend), c1 = box(hv.cells[1], legend), c4 = box(hv.cells[4], legend), c5 = box(hv.cells[5], legend), c14 = box(hv.cells[14], legend), c15 = box(hv.cells[15], legend);
  const lg = (x1, x2, cls, html) => { const e = h('div', 'lg ' + cls, legend); css(e, { left: x1 + 'px', width: (x2 - x1) + 'px' }); h('div', 'lg-t', e, html); h('div', 'lg-b', e); return e; };
  const legends = {
    flag: lg(c0.x - 6, c0.r + 6, 'c-orange', '标志'),
    id: lg(c1.x, c4.r, 'c-cyan', 'id<small>INT · 4</small>'),
    name: lg(c5.x, c14.r, 'c-mint', 'name<small>CHAR(10) · 10</small>'),
    age: lg(c15.x - 6, c15.r + 6, 'c-sand', 'age'),
  };
  // 解码表
  const dp = h('div', 'panel', root); px(dp, G.x + G.w + 32, G.y, 456, pH);
  h('div', 'panel-hd', dp, '<span>按列解码</span><span class="r">row → 列值</span>');
  const db = h('div', 'dec', dp); css(db, { padding: '14px 28px 22px 28px' });
  h('div', 'dec-row dec-hd', db, '<span class="n">行号</span><span class="a">id</span><span class="b">name</span><span class="c">age</span>');
  const dec = [];
  for (let r = 0; r < nRows; r++) {
    const row = h('div', 'dec-row', db, `<span class="n">${r}</span><span class="a c-cyan"></span><span class="b c-mint"></span><span class="c c-sand"></span>`);
    dec.push({ row, n: row.children[0], id: row.children[1], name: row.children[2], age: row.children[3] });
  }
  return { panel, hd, body, legend, legends, hv, dp, dec, nRows, pH };
}
// 把 16 字节的一行解码成列值
function decodeRow(hex32) {
  const b = hex32.match(/../g).map((x) => parseInt(x, 16));
  return { flag: b[0], id: b[1] | (b[2] << 8) | (b[3] << 16) | (b[4] << 24), name: String.fromCharCode(...b.slice(5, 15)).trimEnd(), age: b[15] };
}

scene('s3', ({ root, s, c0 }) => {
  injectMydCss(root);
  const hex = REAL.usersMYD[0];
  const P = mydPanel(root, hex);
  const { hv, legends, dec } = P;
  const rows = hex.match(/.{32}/g).map(decodeRow);
  rows.forEach((r, i) => { dec[i].id.textContent = r.id; dec[i].name.textContent = r.name; dec[i].age.textContent = r.age; });
  const col = (k) => hv.cells.filter((_, i) => fieldOf(i) === k);
  const ascCol = (k) => hv.asc.filter((_, i) => fieldOf(i) === k);

  // c1 打开文件
  show(P.panel, T('c1') - 0.35, { y: 40, s: 0.94, d: 0.9 });
  gsap.set([hv.cells, hv.asc, hv.offs], { autoAlpha: 0 });
  gsap.set(Object.values(legends), { autoAlpha: 0, y: 8 });
  gsap.set(P.dp, { autoAlpha: 0, x: 30 });
  dec.forEach((d) => gsap.set([d.id, d.name, d.age, d.n], { autoAlpha: 0 }));
  // c2 128 个字节逐个涌入
  const t2 = T('c2') - 0.1;
  tl.to(hv.offs, { autoAlpha: 1, duration: 0.3, stagger: 0.09 }, t2);
  tl.to(hv.cells, { autoAlpha: 1, duration: 0.25, stagger: 0.0085, ease: 'none' }, t2);
  tl.to(hv.asc, { autoAlpha: 1, duration: 0.25, stagger: 0.0085, ease: 'none' }, t2 + 0.15);
  countTo(P.hd.querySelector('.sz'), 0, 128, t2, 1.25, (v) => Math.round(v));
  // c3 第 0 个字节就是数据
  const first = hv.cells[0];
  const tag0 = h('div', 'tag c-orange', P.body, '偏移 0<small>文件的第一个字节</small>');
  const fb = box(first, P.body);
  css(tag0, { left: (fb.x - 4) + 'px', top: (fb.y - 44) + 'px' });
  show(tag0, T('c3') + 0.1, { y: 8, d: 0.5 });
  tl.to(first, { backgroundColor: 'rgba(242,145,17,.3)', color: '#ffd9a0', duration: 0.3 }, T('c3') + 0.1);
  tl.to(hv.offs[0], { color: '#f29111', duration: 0.3 }, T('c3') + 0.1);
  hide(tag0, T('c4') - 0.35, { y: 0, d: 0.3 });
  tl.to(first, { backgroundColor: 'rgba(242,145,17,0)', color: '#c3dbe2', duration: 0.3 }, T('c4') - 0.35);
  tl.set(first, { clearProps: 'backgroundColor,color' }, T('c4') - 0.04);
  tl.to(hv.offs[0], { color: '#4f7682', duration: 0.3 }, T('c4') - 0.35);
  // c4 每 16 字节一行：逐行扫亮，右侧出现行号
  const t4 = T('c4', '十六') - 0.15;
  hv.rows.forEach((row, r) => {
    tl.fromTo(row, { backgroundColor: 'rgba(70,203,230,0)' }, { backgroundColor: 'rgba(70,203,230,.14)', duration: 0.22, yoyo: true, repeat: 1, ease: 'power1.inOut', immediateRender: false }, t4 + r * 0.13);
  });
  tl.to(P.dp, { autoAlpha: 1, x: 0, duration: 0.7 }, t4 + 0.2);
  tl.to(dec.map((d) => d.n), { autoAlpha: 1, duration: 0.25, stagger: 0.13 }, t4 + 0.25);

  // 着色与解码：标志 → id → name → age
  const paint = (k, t) => {
    tl.to(legends[k], { autoAlpha: 1, y: 0, duration: 0.45 }, t);
    const cells = col(k);
    cells.forEach((c, i) => { classAt(c, 'f-' + k, t + Math.floor(i / (cells.length / 8)) * 0.04); });
    tl.fromTo(cells, { scale: 1.25 }, { scale: 1, duration: 0.4, stagger: { each: 0.04 / (cells.length / 8) }, immediateRender: false }, t);
    ascCol(k).forEach((a) => { tl.to(a, { color: { flag: '#f29111', id: '#46cbe6', name: '#6fe0b6', age: '#f1d98a' }[k], duration: 0.3 }, t + 0.1); });
  };
  const insp = h('div', 'insp', root);
  const inBlock = (html, cap) => { const e = h('div', 'insp-in', insp, html); h('div', 'icap', e, cap); gsap.set(e, { autoAlpha: 0, y: 16 }); return e; };
  const bytes = (hexs, cls, sm) => `<div class="ib${sm ? ' sm' : ''}">${hexs.map((x) => `<span class="${cls}">${x}</span>`).join('')}</div>`;
  const block = (e, t0, t1) => { tl.to(e, { autoAlpha: 1, y: 0, duration: 0.5 }, t0); tl.to(e, { autoAlpha: 0, y: -12, duration: 0.3, ease: 'power2.in' }, t1); };

  // c5 标志位
  paint('flag', T('c5') - 0.1);
  const bFlag = inBlock(
    `${bytes(['ff'], 'f-flag')}<span class="iarrow">=</span><div class="bits">${'11111111'.split('').map((b, i) => `<i class="${i === 7 ? 'on' : ''}">${b}</i>`).join('')}</div>` +
    `<div class="bitnote"><b>最低位 1</b>：这一行有效<br>其余位：各列是否为 NULL（本表没有可空列）</div>`,
    '行首 1 字节 · 标志位');
  block(bFlag, T('c5', '标志位') - 0.1, T('c6') - 0.3);
  // c6 id
  paint('id', T('c6', '四个') - 0.2);
  const bId = inBlock(`${bytes(['01', '00', '00', '00'], 'f-id')}<span class="iarrow">→</span><span class="ival c-cyan">1</span>`, '<b>INT</b> 占 4 字节，低位字节在前');
  block(bId, T('c6', '四个') , T('c7') - 0.3);
  tl.to(dec.map((d) => d.id), { autoAlpha: 1, duration: 0.3, stagger: 0.05 }, T('c6', '四个') + 0.5);
  // c7 name
  paint('name', T('c7') - 0.1);
  const bName = inBlock(`${bytes(['61', '6c', '69', '63', '65'], 'f-name', true)}${bytes(['20', '20', '20', '20', '20'], 'f-ghost', true)}<span class="iarrow">→</span><span class="ival c-mint">'alice'</span>`, '<b>CHAR(10)</b> 固定占 10 字节，不足的部分补空格 <span class="mono">0x20</span>');
  block(bName, T('c7') + 0.2, T('c8') - 0.3);
  tl.to(dec.map((d) => d.name), { autoAlpha: 1, duration: 0.3, stagger: 0.05 }, T('c7') + 0.7);
  // 名字后面的填充空格压暗
  const pads = hv.cells.filter((c, i) => fieldOf(i) === 'name' && hex.substr(i * 2, 2) === '20');
  tl.to(pads, { opacity: 0.42, duration: 0.5 }, T('c7', '不足') );
  // c8 age
  paint('age', T('c8') - 0.1);
  const bAge = inBlock(`${bytes(['1e'], 'f-age')}<span class="iarrow">→</span><span class="ival c-sand">30</span>`, '<b>TINYINT</b> 占 1 字节');
  block(bAge, T('c8') + 0.15, T('c9') - 0.3);
  tl.to(dec.map((d) => d.age), { autoAlpha: 1, duration: 0.3, stagger: 0.05 }, T('c8') + 0.5);

  // c9 定长格式
  const rf = h('div', 'rf', root, '<span class="big">定长格式</span><span class="kv">Row_format: <b>Fixed</b></span><span class="kv">Avg_row_length: <b>16</b></span>');
  show(rf, T('c9', '这叫') - 0.2, { y: 16, d: 0.6 });
  hide(rf, T('c10') - 0.15, { y: -12, d: 0.35 });

  // c10–c12 定位 = 一次乘法
  const fml = h('div', 'insp-in', insp, `<div class="fml"><span class="zh">第 <span class="c-orange mono" style="font-size:50px" id="fN">N</span> 行的位置</span><span class="op">=</span><span class="c-orange" id="fN2">N</span><span class="op">×</span><span>16</span><span class="op" id="fEq">=</span><span class="c-orange" id="fR"></span></div>`);
  h('div', 'icap', fml, '行号从 0 数起 · 位置即文件内的字节偏移');
  gsap.set(fml, { autoAlpha: 0, y: 16 });
  tl.to(fml, { autoAlpha: 1, y: 0, duration: 0.6 }, T('c11') - 0.5);
  const fN = fml.querySelector('#fN'), fN2 = fml.querySelector('#fN2'), fR = fml.querySelector('#fR'), fEq = fml.querySelector('#fEq');
  const tA = T('c11', '乘以') + 0.9, tB = T('c12', '一次') - 0.1;
  swapAt(fN, 'N', '3', tA); swapAt(fN2, 'N', '3', tA); swapAt(fR, '', '48 <span class="faint" style="font-size:34px">= 0x30</span>', tA);
  gsap.set(fEq, { autoAlpha: 0 }); tl.to(fEq, { autoAlpha: 1, duration: 0.2 }, tA);
  tl.fromTo([fN, fN2, fR], { scale: 1.3 }, { scale: 1, duration: 0.45, immediateRender: false }, tA);
  const hot = (r, t0, t1) => {
    tl.to(hv.rows[r], { backgroundColor: 'rgba(242,145,17,.16)', boxShadow: '0 0 0 2px rgba(242,145,17,.85)', borderRadius: 6, duration: 0.3 }, t0);
    tl.to(hv.offs[r], { color: '#ffb347', duration: 0.3 }, t0);
    tl.to(dec[r].row, { backgroundColor: 'rgba(242,145,17,.16)', duration: 0.3 }, t0);
    tl.to(hv.rows[r], { backgroundColor: 'rgba(242,145,17,0)', boxShadow: '0 0 0 0px rgba(242,145,17,0)', duration: 0.3 }, t1);
    tl.to(hv.offs[r], { color: '#4f7682', duration: 0.3 }, t1);
    tl.to(dec[r].row, { backgroundColor: 'rgba(242,145,17,0)', duration: 0.3 }, t1);
  };
  hot(3, tA, tB);
  // 第二个例子：N = 6
  let lastN = null;
  F((t) => { if (t >= tB) { if (lastN !== 6) { fN.textContent = '6'; fN2.textContent = '6'; fR.innerHTML = '96 <span class="faint" style="font-size:34px">= 0x60</span>'; lastN = 6; } } else if (lastN === 6) { lastN = null; fN.textContent = t >= tA ? '3' : 'N'; fN2.textContent = t >= tA ? '3' : 'N'; fR.innerHTML = t >= tA ? '48 <span class="faint" style="font-size:34px">= 0x30</span>' : ''; } });
  tl.fromTo([fN, fN2, fR], { scale: 1.3 }, { scale: 1, duration: 0.45, immediateRender: false }, tB);
  hot(6, tB, s.end - 0.2);
});
