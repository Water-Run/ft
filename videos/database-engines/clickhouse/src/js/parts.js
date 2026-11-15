// 本片的部件与数据（平面，近黑底，黄色是焦点）。数字全部来自 research/lab/out_*.txt 的实测回显，出处见 research/FACTS.md。
// 场景文件只管「什么时刻出现什么」，版面与小部件都在这里。

// 新建一个绝对定位的块：mk(父元素, 类名, x, y, w, h, html)
const mk = (parent, cls, x, y, w, hh, html) => { const e = h('div', 'abs ' + cls, parent, html); px(e, x, y, w, hh); return e; };
const cellAt = (parent, x, y, w, hh, html, cls = '') => mk(parent, 'cell ' + cls, x, y, w, hh, html);
const noteAt = (parent, x, y, html, cls = 'note') => mk(parent, cls, x, y, null, null, html);
// 注解（术语第一次出现的那句说完时必须在场）：glossAt(父元素, x, y, w, 术语, html)
function glossAt(parent, x, y, w, term, html) {
  const g = mk(parent, 'gloss', x, y, w, null, html);
  g.dataset.gloss = term;
  return g;
}
// 终端：一个面板，里面的行逐行出现。termAt(父元素, x, y, w, h) → { el, line(i, html, t, o) }
function termAt(parent, x, y, w, hh) {
  const el = mk(parent, 'term', x, y, w, hh);
  const api = {
    el, rows: [],
    // 第 i 行（从 0 数起）。o.type：每秒字数，用打字机；否则整行瞬间出现（输出）。返回这一行出现完毕的时刻
    line(i, html, t, o = {}) {
      const d = h('div', 'mono', el, ''); css(d, { position: 'absolute', left: '22px', top: (14 + i * 42) + 'px', whiteSpace: 'pre' });
      api.rows[i] = d;
      if (o.type) { d.innerHTML = ''; vanish(d, 0); appear(d, t - 0.02); return typeText(d, html, t, o.type, { cursor: o.cursor !== false, cursorUntil: o.cursorUntil }); }   // 没轮到的行不先亮光标
      d.innerHTML = html; appear(d, t); return t;
    },
  };
  return api;
}
// 镜头在一屏上的极慢横移：dir = 1 向右，-1 向左（一章之内同向，相邻两章反向）；总幅度不超过 48 像素
function drift(cam, s, dir = 1) {
  const hold = s.end - s.start - 0.2, dx = Math.min(48, 2 * hold);
  cam.track(s.start, { x: 960 - dir * dx / 2, y: 540, z: 1 }, [[s.start + 0.1, { x: 960 + dir * dx / 2 }, hold, { ease: 'none', sfx: false }]]);
}
// 一个元素在 [t0, t1) 期间加上类名
const during = (el, cls, t0, t1) => classAt(el, cls, t0, t1);
// 八个人的小表（本系列共用；id、姓名、年龄与实验里的 demo 小表一致）
const P8 = [[1, 'alice', 30], [2, 'bob', 25], [3, 'carol', 41], [4, 'dave', 19], [5, 'erin', 33], [6, 'frank', 52], [7, 'grace', 28], [8, 'heidi', 36]];
const hex2 = (n) => n.toString(16).padStart(2, '0');
// 一行三格（编号、姓名、年龄）：rowAt(父元素, x, y, [id, name, age], 各格宽度)，返回 { row, c: [三格] }
function rowAt(parent, x, y, r, ws = [90, 250, 120], hh = 54, cls = '') {
  const row = mk(parent, '', x, y, ws[0] + ws[1] + ws[2] - 4, hh);
  const c = [];
  let cx = 0;
  r.forEach((v, i) => { c.push(cellAt(row, cx, 0, ws[i], hh, '<span>' + v + '</span>', cls)); cx += ws[i] - 2; });
  return { row, c };
}
// 一排单元格：stripAt(父元素, x, y, 值数组, 单元格宽, 高, 类名) → 单元格数组（相邻两格共用 2 像素边框）
function stripAt(parent, x, y, vals, cw, hh = 56, cls = '') {
  return vals.map((v, i) => cellAt(parent, x + i * (cw - 2), y, cw, hh, '<span>' + v + '</span>', cls));
}
// 一个小的整页分组：满屏、初始不可见（场景里用 appear/vanish 切换）
function groupAt(parent) { const g = mk(parent, '', 0, 0, 1920, 1080); vanish(g, 0); return g; }
// 文件夹（片段）：foldAt(父元素, x, y, w, h, 名字, 类名)；名字在左上角（mono），.y 黄框，.ghost 虚线（还没有 / 临时）
function foldAt(parent, x, y, w, hh, name, cls = '') {
  const f = mk(parent, 'fold ' + cls, x, y, w, hh);
  const nm = h('div', 'nm', f, name);
  f.nm = nm;
  return f;
}
// 文件夹里的一行文件名：fileAt(文件夹, 第几行, 文字, 类名)
function fileAt(fold, i, text, cls = '') { const e = h('div', 'it ' + cls, fold, text); css(e, { top: (58 + i * 40) + 'px' }); return e; }
// 面板「亮起再回落」：旁白讲到它的这段时间，它的底色慢慢提亮一格再回到原样（「这一块正在被讲」）。面积大，静止检查里算作画面在变。
// base 必须是这个面板原本的底色（panel / fold / term / tile 是 #1F1F1C，ghost 的 fold 是 #151515）；不要用在会被 .on 填成黄色的格子上。
function warm(el, t0, t1, base = '#1F1F1C', hi = '#3C3C2A') {
  const n = Math.max(1, Math.round((t1 - t0) / 2.4)), d = (t1 - t0) / n / 2;
  for (let k = 0; k < n; k++) {
    const a = t0 + k * 2 * d;
    tl.fromTo(el, { backgroundColor: base }, { backgroundColor: hi, duration: d, ease: 'none', immediateRender: false }, a);
    tl.to(el, { backgroundColor: base, duration: d, ease: 'none' }, a + d);
  }
}
// 一亿行演示表的真实内容（research/lab/03_big.sh 的生成式）：编号 n 的姓名是 User0000n-…（后半截固定的字母串画面上省略），年龄 18 + n % 63；Alice 是 2050 号、42 岁
const NM = (n) => (n === 2050 ? 'Alice' : 'User' + (n < 100000 ? String(n).padStart(5, '0') : String(n)) + '-…');
const AG = (n) => (n === 2050 ? 42 : 18 + (n % 63));
const U = (n) => [String(n), NM(n), String(AG(n))];
// 不透明度从 a 渐变到 b（不在构建时生效，不与入场的 fromTo 抢同一个起点）
const dimTo = (el, t, a, b, d = 0.6) => tl.fromTo(el, { opacity: a }, { opacity: b, duration: d, ease: 'power1.inOut', immediateRender: false }, t);
// 同一个元素、同一个类名在几段时间里加上：只用一个记忆，避免两处 classAt 抢同一个类名（顺着播与直接跳不一样）
function classWins(e, cls, wins) { let last = null; F((t) => { const on = wins.some(([a, b]) => t >= a && t < b); if (on !== last) { e.classList.toggle(cls, on); last = on; } }); }
// 画面右上角的表名标签：这一段演示用的是哪一张表（实验里的真实表名，research/lab/*.sh）
function tableTag(parent, text, t0, t1) { const e = mk(parent, 'ttag', 0, 99, null, null, text); css(e, { left: 'auto', right: '86px' }); vanish(e, 0); appear(e, t0); classAt(e, 'flash', t0, t0 + 1.2); if (t1 != null) vanish(e, t1); return e; }
// clickhouse-client 的 PrettyCompact 结果表：pretty([{ name, values, right }]) → 若干行字符串（表头一行、每行数据前面带行号「1. 」、表尾一行）
// 字符串列左对齐、表头名靠左；数字列右对齐、表头名靠右（与实验回显 research/lab/out_*.txt 的样子一致）
function pretty(cols) {
  const n = cols[0].values.length, pad = String(n).length + 2;
  const w = cols.map((c) => Math.max(c.name.length, ...c.values.map((v) => String(v).length)) + 2);
  const sp = ' '.repeat(pad);
  const head = sp + '┌' + cols.map((c, k) => (c.right ? '─'.repeat(w[k] - c.name.length - 1) + '<b>' + c.name + '</b>─' : '─<b>' + c.name + '</b>' + '─'.repeat(w[k] - c.name.length - 1))).join('┬') + '┐';
  const rows = [];
  for (let i = 0; i < n; i++) rows.push((String(i + 1) + '.').padEnd(pad, ' ') + '│' + cols.map((c, k) => { const v = String(c.values[i]); return ' ' + (c.right ? v.padStart(w[k] - 2) : v.padEnd(w[k] - 2)) + ' '; }).join('│') + '│');
  const foot = sp + '└' + w.map((x) => '─'.repeat(x)).join('┴') + '┘';
  return [head, ...rows, foot];
}
// 在终端 tm 的第 i0 行起，时刻 t 一次打出若干行（客户端拿到结果后整块打印）
function printAt(tm, i0, lines, t, cls = 'out') { lines.forEach((l, k) => tm.line(i0 + k, '<span class="' + cls + '">' + l + '</span>', t, {})); sfx('tick', t, { g: 0.35 }); }
const PR = '<span class="pr">:) </span>', PR2 = '<span class="pr">:-] </span>';
// 一亿行表里的一段：2048–2052 号（Alice 是 2050 号），姓名的长尾巴在格子里省略
const SL5 = [2048, 2049, 2050, 2051, 2052];
const NMS = (n) => (n === 2050 ? 'Alice' : 'User0' + n + '…');

// 五个引擎各自的存放结构（FACTS S07、S08；示意，不画真实字节），每张只突出一个特点：
//   MyISAM 索引和数据是两个文件；InnoDB 表本身就是 B+ 树，叶子里是整行；PostgreSQL 堆里按到达顺序乱放、索引在旁边指过去；
//   SQLite 整个库一个文件；ClickHouse 一列一个文件。都装 demo.users8 的 8 个人（插入顺序 5 2 8 1 7 4 6 3，out_02）。
// 画在 parent（一个 320×380 的容器）里，坐标相对容器左上角。kind：0 MyISAM、1 InnoDB、2 PostgreSQL、3 SQLite、4 ClickHouse。
// o.labels = false 时不画文字（开场的小卡片里缩小用）。
// 返回 { rows, cols }：rows 是行存结构里每一行的条带（按画的顺序），cols 是 ClickHouse 三个列文件里的格子。
function engineStruct(parent, kind, t0, o = {}) {
  const L = o.labels !== false, ov = overlay(parent);
  const at = (e, t) => { vanish(e, 0); appear(e, t); return e; };
  const lbl = (x, y, text, t, cls = 't-note') => { if (!L) return null; const e = mk(parent, cls, x, y, null, null, text); css(e, { fontSize: '22px' }); show(e, t, { y: 10, d: 0.35 }); return e; };
  const node = (x, y, w, hh, t) => at(mk(parent, 'nd', x, y, w, hh, ''), t);
  const file = (x, y, w, hh, t) => { const e = mk(parent, '', x, y, w, hh); css(e, { border: '3px solid var(--g3)' }); vanish(e, 0); wipe(e, t, { dir: 't', d: 0.35 }); return e; };
  const rowS = (x, y, w, t, big) => at(mk(parent, 'rs' + (big ? ' b22' : ''), x, y, w, big ? 22 : 18, '<i style="width:16%"></i><i style="width:60%"></i><i style="width:24%"></i>'), t);
  const link = (x1, y1, x2, y2, t, color = 'dim', arrow = false) => at(path(ov, `M ${x1} ${y1} L ${x2} ${y2}`, color, { w: 3, arrow }), t);
  const rows = [], cols = [];
  if (kind === 0) {            // MyISAM：两个文件。上面索引（B 树），下面数据一行接一行；索引指到数据文件里的那一行
    lbl(0, 0, '两个文件：索引、数据分开', t0 + 0.1);
    file(0, 34, 320, 112, t0 + 0.1); lbl(12, 40, 'users.MYI', t0 + 0.15);
    node(130, 72, 60, 22, t0 + 0.2); node(60, 112, 60, 22, t0 + 0.3); node(200, 112, 60, 22, t0 + 0.3);
    link(160, 94, 90, 112, t0 + 0.3); link(160, 94, 230, 112, t0 + 0.3);
    file(0, 166, 320, 208, t0 + 0.35); lbl(12, 172, 'users.MYD', t0 + 0.4);
    for (let k = 0; k < 8; k++) rows.push(rowS(14, 206 + k * 20, 292, t0 + 0.45 + k * 0.05));
    link(90, 134, 60, 206 + 3 * 20 + 2, t0 + 1.0, 'accent', true);
    lbl(0, 376, '索引指到数据文件里的那一行', t0 + 1.1);
  } else if (kind === 1) {     // InnoDB：表本身就是按主键排好的 B+ 树，叶子里就是整行
    lbl(0, 0, 'users.ibd · 表就是一棵 B+ 树', t0 + 0.1);
    node(110, 42, 100, 28, t0 + 0.2);
    [3, 3, 2].forEach((n, k) => {
      const lx = k * 110; node(lx, 112, 100, 178, t0 + 0.35 + k * 0.1); link(160, 70, lx + 50, 112, t0 + 0.35 + k * 0.1);
      for (let r = 0; r < n; r++) rows.push(rowS(lx + 9, 132 + r * 50, 82, t0 + 0.6 + k * 0.1 + r * 0.05, true));
    });
    lbl(0, 376, '叶子里就是整行', t0 + 1.0);
  } else if (kind === 2) {     // PostgreSQL：堆里按到达顺序放（编号乱的），索引是另一个文件，指过去
    lbl(0, 0, '堆：按到达顺序放', t0 + 0.1);
    [[5, 2, 8, 1], [7, 4, 6, 3]].forEach((ids, k) => {
      node(0, 34 + k * 128, 214, 112, t0 + 0.2 + k * 0.15);
      ids.forEach((id, r) => {
        const y = 46 + k * 128 + r * 24; rows.push(rowS(48, y, 154, t0 + 0.4 + k * 0.15 + r * 0.06));
        if (L) { const n = at(mk(parent, 'mono', 14, y - 4, null, null, String(id)), t0 + 0.4 + k * 0.15 + r * 0.06); css(n, { fontSize: '22px', color: 'var(--g3)' }); }
      });
    });
    lbl(236, 120, '索引', t0 + 0.8);
    node(246, 156, 60, 22, t0 + 0.9); node(232, 206, 40, 20, t0 + 1.0); node(280, 206, 40, 20, t0 + 1.0);
    link(276, 178, 252, 206, t0 + 1.0); link(276, 178, 300, 206, t0 + 1.0);
    link(240, 206, 206, 46 + 3 * 24 + 9, t0 + 1.3, 'accent', true);
    lbl(0, 376, '索引另放，指到堆里', t0 + 1.2);
  } else if (kind === 3) {     // SQLite：整个库就是一个文件（右上角折一个角），表在里面也是一棵 B+ 树
    lbl(0, 0, 'main.db · 整个库一个文件', t0 + 0.1);
    file(0, 34, 320, 340, t0 + 0.15);
    const ear = mk(parent, '', 287, 34, 33, 33); css(ear, { background: 'var(--k)', borderLeft: '3px solid var(--g3)', borderBottom: '3px solid var(--g3)' }); at(ear, t0 + 0.3);
    node(110, 74, 100, 26, t0 + 0.4);
    [3, 3, 2].forEach((n, k) => {
      const lx = 14 + k * 100; node(lx, 140, 92, 178, t0 + 0.55 + k * 0.1); link(160, 100, lx + 46, 140, t0 + 0.55 + k * 0.1);
      for (let r = 0; r < n; r++) rows.push(rowS(lx + 8, 160 + r * 50, 76, t0 + 0.75 + k * 0.1 + r * 0.05, true));
    });
    lbl(0, 376, '表也在这个文件里', t0 + 1.1);
  } else {                     // ClickHouse：片段是一个文件夹，里面一列一个文件，每格一个人
    lbl(0, 0, 'all_1_1_0 · 片段是一个文件夹', t0 + 0.1);
    const fo = foldAt(parent, 0, 34, 320, 340, '', 'y'); vanish(fo, 0); wipe(fo, t0, { dir: 'l', d: 0.4 });
    ['id.bin', 'name.bin', 'age.bin'].forEach((c, k) => {
      const fy = 52 + k * 104;
      file(12, fy, 296, 84, t0 + 0.25 + k * 0.15); lbl(22, fy + 6, c, t0 + 0.3 + k * 0.15);
      cols.push([]); for (let r = 0; r < 8; r++) cols[k].push(at(mk(parent, 'cseg k' + k, 22 + r * 35, fy + 44, 31, 28, ''), t0 + 0.45 + k * 0.15 + r * 0.03));
    });
    lbl(0, 376, '一列一个 .bin 文件', t0 + 1.0);
  }
  return { rows, cols };
}
