// 本片的部件（D1 终端风格）：终端窗、字节格、users 表的字段配色与解码。数据只取自 data.js（window.REAL）。
const R = window.REAL;

// ── 终端窗 ──
// const t = term(父, x, y, w, h, '标题栏');  t.line(html, 时刻, { row })  整行瞬间出现；t.cmd(sql, 时刻) 打出一条命令，返回打完的时刻
function term(parent, x, y, w, hh, title) {
  const el = h('div', 'term', parent); px(el, x, y, w, hh);
  const bar = h('div', 'bar', el, title || '');
  const body = h('div', 'body', el);
  let n = 0;
  const api = {
    el, bar, body,
    line(html, t, o = {}) {
      if (o.row != null) n = o.row;
      const e = h('div', 'tl', body, html); css(e, { position: 'absolute', left: 0, top: n * 43 + 'px' }); n++;
      if (t != null) { appear(e, t); if (o.sfx !== false) sfx(o.snd || 'blip', t, { g: o.g != null ? o.g : 0.3 }); }
      return e;
    },
    lines(arr, t, o = {}) { return arr.map((s, i) => api.line(s, t + i * (o.step != null ? o.step : 0.04), { ...o, sfx: i === 0 && o.sfx !== false, row: i === 0 ? o.row : undefined })); },
    cmd(sql, t, o = {}) {
      const e = api.line('', null, o);
      h('span', 'p', e, o.prompt || 'mysql&gt; ');
      const s = h('span', '', e);
      appear(e, t - 0.25);
      const cps = o.cps || 30, end = t + tokenize(sql).filter((k) => k.ch).length / cps;
      typeText(s, sql, t, cps, { cursorUntil: o.cursorUntil != null ? o.cursorUntil : end + 0.4, sfxGain: 0.55 });
      return end;
    },
    skip(k = 1) { n += k; },
    row(k) { n = k; },
  };
  return api;
}

// ── users 表：一行 16 字节 = 标志 1 + id 4（低位在前）+ 名字 10（空格补齐）+ 年龄 1 ──
const FIELD = (c) => (c === 0 ? 'flag' : c <= 4 ? 'id' : c <= 14 ? 'name' : 'age');
const userCls = (c, b) => (FIELD(c) === 'name' && b === '20' ? 'f-pad' : 'f-' + FIELD(c));
function decodeUser(hex32) {
  const b = hex32.match(/../g).map((x) => parseInt(x, 16));
  if (b[0] === 0) return { del: true, link: parseInt(hex32.slice(2, 14), 16) };
  return { del: false, id: b[1] | (b[2] << 8) | (b[3] << 16) | (b[4] << 24), name: String.fromCharCode(...b.slice(5, 15)).trim(), age: b[15] };
}
const rowsOf = (hex) => hex.match(/.{32}/g);
const off4 = (n) => n.toString(16).padStart(4, '0');

// ── 字节格 ──
// const g = hexDump(父, x, y, hex, { cw, rh, offW, decX, cls(c, b), dec(row) })
// g.cells[i]、g.rows[r]、g.offs[r]、g.decs[r]；g.poke(i, 新字节, 时刻, 类名)；g.at(i) 给出第 i 格中心在父元素里的坐标
function hexDump(parent, x, y, hex, o = {}) {
  const cw = o.cw || 54, rh = o.rh || 58, offW = o.offW != null ? o.offW : 118, cols = o.cols || 16;
  const el = h('div', 'hx', parent); px(el, x, y);
  const bytes = hex.match(/../g), nRows = Math.ceil(bytes.length / cols);
  const cells = [], rows = [], offs = [], decs = [];
  for (let r = 0; r < (o.rows || nRows); r++) {
    const row = h('div', 'row', el); css(row, { top: r * rh + 'px', width: (offW + cols * cw + 400) + 'px' });
    rows.push(row);
    if (offW) { const of = h('div', 'off', row, off4(r * cols)); css(of, { left: '0px' }); offs.push(of); }
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c, b = bytes[i];
      const e = h('div', 'b ' + (b == null ? '' : (o.cls ? o.cls(c, b) : '')), row, b == null ? '' : b);
      css(e, { left: offW + c * cw + 'px', width: (cw - 4) + 'px' });
      cells.push(e);
    }
    if (o.dec) { const d = h('div', 'dec', row, bytes[r * cols] == null ? '' : o.dec(r)); css(d, { left: (o.decX || offW + cols * cw + 36) + 'px' }); decs.push(d); }
  }
  const api = {
    el, cells, rows, offs, decs, cw, rh, offW,
    poke(i, b, t, cls) { keyed(cells[i]).at(t, { html: b, cls: 'b ' + (cls || '') }); },
    at(i) { const r = Math.floor(i / cols), c = i % cols; return { x: x + offW + c * cw + (cw - 4) / 2, y: y + r * rh + rh / 2, l: x + offW + c * cw, t: y + r * rh }; },
    rowBox(r, c0 = 0, c1 = cols - 1) { return { x: x + offW + c0 * cw - 6, y: y + r * rh - 2, w: (c1 - c0 + 1) * cw + 8, h: rh + 2 }; },
  };
  return api;
}

// 方框：在 (x, y, w, h) 处画一个平涂描边框
function ring(parent, b, cls = '') { const e = h('div', 'ring ' + cls, parent); px(e, b.x, b.y, b.w, b.h); return e; }
// 文字标签
function tag(parent, x, y, html, cls = '') { const e = h('div', 'tag ' + cls, parent, html); px(e, x, y); return e; }
function lab(parent, x, y, html, cls = '') { const e = h('div', 'lab ' + cls, parent, html); px(e, x, y); return e; }

// 时间轴（第 01 章与第 10 章共用）：按年份画，标出各版本系列第一个正式版本的年份，以及「默认的存储引擎」一条带。
// 年份与版本只取 FACTS「时间轴的年份」。返回各部件，由场景决定什么时候长出来。
// const T_ = timeline(父, x, y, w)；T_.yx(年) 给出某年在父元素里的 x
const MYSQL_VERSIONS = [['3.23', 2001], ['4.0', 2003], ['4.1', 2004], ['5.0', 2005], ['5.1', 2008], ['5.5', 2010], ['5.6', 2013], ['5.7', 2015], ['8.0', 2018], ['9.7.4', 2026]];
function timeline(parent, x, y, w) {
  const Y0 = 1999, Y1 = 2027, yx = (yr) => x + (yr - Y0) / (Y1 - Y0) * w;
  const axis = h('div', 'abs', parent); px(axis, x, y, w, 3); css(axis, { background: '#4a4a4a' });
  const years = [], vers = [];
  for (let yr = Y0 + 1; yr < Y1; yr++) {
    const big = yr % 5 === 0, k = h('div', 'abs', parent); px(k, yx(yr) - 1, y + 3, 2, big ? 14 : 7); css(k, { background: '#4a4a4a' });
    const lb = big ? h('div', 'abs mono', parent, String(yr)) : null;
    if (lb) { px(lb, yx(yr) - 40, y + 22); css(lb, { width: '80px', textAlign: 'center', fontSize: '26px', color: '#808080' }); }
    years.push([k, lb]);
  }
  let prev = -9, row = 0;
  for (const [v, yr] of MYSQL_VERSIONS) {
    row = yr - prev <= 1 && row === 0 ? 1 : 0; prev = yr;   // 相邻一年的版本（4.0 / 4.1 / 5.0）错开两行，免得标签挤在一起
    const k = h('div', 'abs', parent); px(k, yx(yr) - 1, y - 14 - row * 40, 3, 14 + row * 40); css(k, { background: '#808080' });
    const lb = h('div', 'abs mono', parent, v); px(lb, yx(yr) - 40, y - 52 - row * 40); css(lb, { width: '80px', textAlign: 'center', fontSize: '28px', color: '#808080' });
    vers.push({ v, yr, k, lb });
  }
  const ver = (v) => vers.find((e) => e.v === v);
  // 默认的存储引擎：ISAM（3.23 以前）→ MyISAM（3.23 起）→ InnoDB（5.5 起）
  const BY = y - 190, BH = 72;
  const lane = h('div', 'abs', parent, '默认的存储引擎'); px(lane, x, BY - 46); css(lane, { font: '500 30px "Sans SC"', color: '#8a8a8a' });
  const isam = h('div', 'abs mono', parent, 'ISAM'); px(isam, x, BY, yx(2001) - x - 4, BH); css(isam, { background: '#151618', color: '#808080', fontSize: '28px', lineHeight: BH + 'px', paddingLeft: '10px', textDecoration: 'line-through', overflow: 'hidden' });
  const my = h('div', 'abs mono', parent, 'MyISAM'); px(my, yx(2001), BY, 0, BH); css(my, { background: '#F29111', color: '#0b0b0c', fontSize: '32px', lineHeight: BH + 'px', paddingLeft: '14px', overflow: 'hidden', whiteSpace: 'nowrap' });
  const inno = h('div', 'abs mono', parent, 'InnoDB'); px(inno, yx(2010), BY, 0, BH); css(inno, { background: '#3fb4cc', color: '#0b0b0c', fontSize: '32px', lineHeight: BH + 'px', paddingLeft: '14px', overflow: 'hidden', whiteSpace: 'nowrap' });
  // 5.5 以后 MyISAM 仍然可用（9.7.4 实测还能建表）：一条细线接到今天
  const still = h('div', 'abs', parent); px(still, yx(2010), BY + BH + 14, 0, 4); css(still, { background: '#F29111', opacity: '0.55' });
  const stillL = h('div', 'abs mono', parent, 'MyISAM 仍可用'); px(stillL, yx(2019), BY + BH + 24); css(stillL, { fontSize: '24px', color: '#b07a3e' });
  vanish(my, 0); vanish(inno, 0);   // 宽度为 0 时内边距仍会露出一截：长出来之前先藏着，由场景 appear
  return { yx, axis, years, vers, ver, lane, isam, my, inno, still, stillL, BY, BH, wMy: yx(2010) - yx(2001) - 4, wInno: yx(2027) - yx(2010) - 4, wStill: yx(2026) - yx(2010) };
}

// 镜头。WaterRun 2026-10-24：「镜头各种缩放移动动作太大了, 自然点」「不要一直大范围动, 影响用户观看专注」
// 「稍微的动动能辅助观感, 但是自己把握好, 尤其不要一直缩放这种」「如果横向空间不够你滚动, 不会整体放小一点?」
// 镜头只是辅助观感（规则见 docs/guides/scenes.md 第 3 节）：
// · 每一页整体按 0.95 倍显示，左右各多出约 48 像素的余量；
// · 停在一页上时，只朝一个方向极慢地横移（一页最多 48 像素、每秒不超过 2 像素），不缩放、不往回走；相邻两页方向相反；
// · 换到画布上另一块内容（离这一块的中心超过 700 像素）时不平移：原地换页，旧内容往上滚着淡出，新内容从下面升起；
// · 场景里写的推近（z > 1）与慢推一律不做；不推近的取景移动照做，至少 1.3 秒、柔和缓动；
// · 每段截到下一段开始之前（重叠会让画面依赖播放历史）。
// 场景里 const cam = makeCamera(world); cam.el = world;（换页要淡出整块画布）
function track(cam, t0, start, keys) {
  const FAR = 700, ZB = 0.95, PAN = 48, SPEED = 2, DRIFT = { ease: 'none', sfx: false }, out = [];
  const sc = L.scenes.find((q) => Math.abs(q.start - t0) < 1e-3), tEnd = sc ? sc.end : t0 + 60;
  const isDrift = (k) => k && k[3] && k[3].ease === 'none' && k[3].sfx === false;
  const x0 = start.x != null ? start.x : 960, y0 = start.y != null ? start.y : 540, z0 = Math.min(1, start.z != null ? start.z : 1);
  // 先找出换页的时刻，得到各页的起止；每页的横移速度按页长定，整页走完不超过 PAN
  const turns = [];
  { let px_ = x0, py_ = y0, pe = t0;
    for (const k of keys) {
      const tt = k[0] == null ? pe + 0.15 : k[0];
      if (isDrift(k)) { pe = tt + (k[2] != null ? k[2] : 1.4); continue; }
      const tx = k[1].x != null ? k[1].x : px_, ty = k[1].y != null ? k[1].y : py_;
      if (Math.hypot(tx - px_, ty - py_) > FAR) turns.push(tt);
      px_ = tx; py_ = ty; pe = tt + (k[2] != null ? k[2] : 1.4);
    } }
  const bounds = [t0, ...turns, tEnd];
  const speedAt = (t) => { let k = 0; while (k + 2 < bounds.length && t >= bounds[k + 1]) k++; return Math.min(SPEED, PAN / Math.max(1, bounds[k + 1] - bounds[k])); };
  let dir = 1, off = -PAN / 2, ax = x0, ay = y0, zo = z0, prevEnd = t0;
  const startX = x0 + dir * off;
  // 停留：朝 dir 方向慢慢横移（不缩放、不往回走）
  const pan = (g0, g1) => {
    g0 = Math.max(g0, prevEnd + 0.02);
    if (g1 - g0 < 0.3) return;
    off = Math.min(PAN / 2, off + speedAt(g0) * (g1 - g0));
    out.push([g0, { x: ax + dir * off }, g1 - g0, DRIFT]); prevEnd = g1;
  };
  for (let i = 0; i < keys.length; i++) {
    const [t, v, d0, o0] = keys[i], o = o0 || {};
    const tt = t == null ? prevEnd + 0.15 : t;
    const next = keys[i + 1] && keys[i + 1][0] != null ? keys[i + 1][0] : null;
    const room = next != null ? next - 0.05 - tt : Infinity;
    if (isDrift(keys[i])) { pan(tt, next != null ? next - 0.05 : tEnd - 0.05); continue; }
    const tx = v.x != null ? v.x : ax, ty = v.y != null ? v.y : ay;
    if (v.z != null) zo = v.z;
    if (Math.hypot(tx - ax, ty - ay) > FAR) {
      // 原地换页：0.3 秒滚走淡出 → 镜头跳到新的一块（横移从另一侧重新开始）→ 0.5 秒升起淡入
      const k = Math.min(1, room / 0.85), a = 0.3 * k, b = 0.5 * k, py = ay;
      dir = -dir; off = -PAN / 2; ax = tx; ay = ty;
      const z = Math.min(1, zo) * ZB;
      out.push([tt, { y: py + 50 }, a, { ease: 'power2.in', sfx: false }]);
      out.push([tt + a, { x: ax + dir * off, y: ay - 50, z }, 0.02, { sfx: false }]);
      out.push([tt + a + 0.03, { y: ay }, b, { ease: 'power2.out', sfx: false }]);
      tl.fromTo(cam.el, { autoAlpha: 1 }, { autoAlpha: 0, duration: a, ease: 'power1.in', immediateRender: false }, tt);
      tl.fromTo(cam.el, { autoAlpha: 0 }, { autoAlpha: 1, duration: b, ease: 'power1.out', immediateRender: false }, tt + a + 0.03);
      sfx('whoosh', tt, { g: Math.min(0.4, o.g != null ? o.g : 0.4) });
      prevEnd = tt + a + 0.03 + b;
    } else if (zo <= 1) {
      // 同一页里不推近的取景移动照做（横移的偏移带过去）；推近的关键帧（z > 1）不做
      const d = Math.max(0.1, Math.min(Math.max(d0 != null ? d0 : 1.4, 1.3), room));
      ax = tx; ay = ty;
      out.push([tt, { x: ax + dir * off, y: ay, z: zo * ZB }, d, { ease: 'power2.inOut', sfx: o.sfx, g: Math.min(0.3, o.g != null ? o.g : 0.3) }]);
      prevEnd = tt + d;
    }
    // 到下一次移动之间的空档慢慢横移；下一段若是接在后面的漂移段，由它来接
    if (!(isDrift(keys[i + 1]) && keys[i + 1][0] == null)) pan(Math.max(prevEnd, tt) + 0.05, next != null ? next - 0.05 : tEnd - 0.05);
  }
  if (!keys.length) pan(t0 + 0.05, tEnd - 0.05);
  cam.track(t0, { x: startX, y: y0, z: z0 * ZB }, out);
}
