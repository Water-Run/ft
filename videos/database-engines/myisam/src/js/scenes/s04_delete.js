// 04 删除与空位。主画面：同一张 users.MYD 字节图。两次 DELETE 只改写行首 7 个字节（00 + 6 字节指针），
// 空位连成链，链头记在 .MYI 文件头（dellink）；之后的 INSERT 先填链头的空位，没有空位才追加到末尾；
// 于是全表扫描的顺序是 1 2 10 4 5 9 7 8 11。字节取自 snap_02–04，语句照录 02/03/04 的 .out（FACTS「04」）。
// alice 的年龄字节显示为 1f：接着上一章的改写（c14），其余字节都是快照原样。
scene('s4', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world); cam.el = world;   // track() 换页时要淡出整块画布
  const ov = overlay(world);
  const snap = R.usersMYD.map((hx) => hx.slice(0, 30) + '1f' + hx.slice(32));
  const X = 200, Y = 290, RH = 58, CW = 54, OFFW = 118, DX = X + OFFW + 16 * CW + 130;
  const g = hexDump(world, X, Y, snap[0] + '00'.repeat(16), { cw: CW, rh: RH, offW: OFFW, cls: userCls,
    dec: (r) => { if (r > 7) return ''; const u = decodeUser(rowsOf(snap[0])[r]); return `${String(u.id).padStart(2)}  ${u.name.padEnd(7)} ${u.age}`; }, decX: OFFW + 16 * CW + 130 });
  // 第 9 行（0x80）开始时不存在
  g.rows[8].querySelectorAll('.b').forEach((e) => (e.textContent = '')); vanish(g.rows[8], 0);
  g.rows.slice(0, 8).forEach((r, i) => appear(r, c0 + 0.1 + i * 0.03));
  g.decs[0].classList.add('c-o');

  const head = h('div', 'abs mono', world, 'users.MYD'); px(head, X, 128); css(head, { fontSize: '40px', color: '#F29111' });
  const size = h('div', 'abs mono', world, '128 字节'); px(size, X + 250, 134); css(size, { fontSize: '34px', color: '#8a8a8a' });
  appear(head, c0 + 0.1); appear(size, c0 + 0.1);
  // 命令栏：每条语句在这里敲出来
  const bar = h('div', 'blk mono', world); px(bar, X, 196, 1580, 58); css(bar, { fontSize: '28px', lineHeight: '54px', paddingLeft: '20px' });
  const barIn = h('span', '', bar);
  appear(bar, c0 + 0.2);
  const cmds = [];
  const cmd = (sql, t) => cmds.push({ sql, t });

  // ── d1 删除 id = 3：文件不变小 ──
  const t1 = T('d1') - 0.3;
  cmd('<span class="k">DELETE FROM</span> users <span class="k">WHERE</span> id = 3;', t1);
  keyed(size).at(T('d1', '不会') - 0.1, { cls: 'abs mono c-t' }).at(T('d2') - 0.2, { cls: 'abs mono' });   // size 后面还要由 keyed 换内容：类名也交给 keyed sfx('tick', T('d1', '不会'), { g: 0.5 });
  // ── d2 开头七个字节 ──
  const seven = ring(world, g.rowBox(2, 0, 6), 'r');
  wipe(seven, T('d2', '七个') - 0.25, { dir: 'l', d: 0.35 }); sfx('pop', T('d2', '七个'), { g: 0.5 });
  vanish(seven, T('d5') - 0.3);
  // ── d3 首字节 → 00；d4 六个字节 → 指针 ──
  const rows1 = rowsOf(snap[1]);
  g.poke(32, '00', T('d3', '写成') + 0.1, 'f-del'); sfx('thud', T('d3', '写成') + 0.1, { g: 0.6 });
  keyed(g.decs[2]).at(T('d3', '已删除'), { html: '已删除', cls: 'dec c-r' });
  for (let c = 7; c < 16; c++) keyed(g.cells[32 + c]).at(T('d3', '已删除'), { cls: 'b f-ghost' });
  rows1[2].match(/../g).slice(1, 7).forEach((b, k) => g.poke(33 + k, b, T('d4', '六个') + k * 0.07, 'f-ptr'));
  sfx('blip', T('d4', '六个'), { g: 0.5 });

  // ── d5 再删 id = 6：新的空位指回前一个（行号 2） ──
  const t5 = T('d5') - 0.3;
  cmd('<span class="k">DELETE FROM</span> users <span class="k">WHERE</span> id = 6;', t5);
  const tp = T('d5', '新的') - 0.1;
  g.poke(80, '00', tp, 'f-del'); sfx('thud', tp, { g: 0.6 });
  rows1[5].match(/../g).slice(1, 7).forEach((b, k) => g.poke(81 + k, b, tp + 0.15 + k * 0.06, 'f-ptr'));
  for (let c = 7; c < 16; c++) keyed(g.cells[80 + c]).at(tp + 0.2, { cls: 'b f-ghost' });
  keyed(g.decs[5]).at(tp + 0.2, { html: '已删除 → 第 2 行', cls: 'dec c-r' });
  // 链：画在字节与解码之间，从第 5 行弯回第 2 行
  const cx = X + OFFW + 16 * CW + 6, y5 = Y + 5 * RH + RH / 2, y2 = Y + 2 * RH + RH / 2;
  const link = path(ov, `M ${cx} ${y5} C ${cx + 90} ${y5}, ${cx + 90} ${y2}, ${cx + 4} ${y2}`, 'red', { w: 3 });
  arrowIn(link, T('d5', '指回') - 0.2, 0.6);
  // ── d6 链头记在索引文件里 ──
  const chip = h('div', 'blk mono', world); px(chip, DX + 250, Y + 4 * RH - 6, 290, 128);   // 右边留出页边：dellink = ff…ff 最长
  chip.innerHTML = '<div style="font-size:26px;color:#8a8a8a;padding:12px 18px 0">users.MYI 文件头</div><div class="dl" style="font-size:28px;padding:8px 18px;color:#e5534b">dellink = 0x50</div>';
  const dl = chip.querySelector('.dl');
  wipe(chip, T('d6', '链头') - 0.3, { dir: 'r', d: 0.4 }); sfx('pop', T('d6', '链头'), { g: 0.55 });
  const headA = path(ov, `M ${DX + 246} ${y5} L ${DX + 226} ${y5}`, 'red', { w: 3 });
  arrowIn(headA, T('d6', '链头') + 0.1, 0.3);
  classAt(link, 'thick', T('d6', '一条链') - 0.1, T('d7', '链头') - 0.2);   // 「一条链」：链的箭头加粗

  // ── d7 插入 ivan：先填链头的空位（第 5 行）；再插入 judy：填第 2 行 ──
  const t7 = T('d7') - 0.7;
  cmd("<span class=\"k\">INSERT INTO</span> users <span class=\"k\">VALUES</span> (9,'ivan',44);", t7);
  const fill = (r, hex32, t) => {
    hex32.match(/../g).forEach((b, c) => g.poke(r * 16 + c, b, t + c * 0.02, c === 0 ? 'f-new' : (userCls(c, b) + ' f-new')));
    const u = decodeUser(hex32);
    keyed(g.decs[r]).at(t + 0.2, { html: `${String(u.id).padStart(2)}  ${u.name.padEnd(7)} ${u.age}`, cls: 'dec c-o' });
    sfx('pop', t + 0.2, { g: 0.55 });
  };
  const tIv = T('d7', '链头') - 0.2;
  fill(5, rowsOf(snap[2])[5], tIv);
  tl.to(link, { autoAlpha: 0, duration: 0.3 }, tIv);
  keyed(dl).at(tIv + 0.2, { html: 'dellink = 0x20' });
  fromTo(headA, tIv + 0.2, { y: 0 }, { y: y2 - y5, duration: 0.4, ease: 'power2.inOut' });
  const t8 = Tend('d7') + 1.6;   // 第二条语句敲在 d7 之后的停顿里
  cmd("<span class=\"k\">INSERT INTO</span> users <span class=\"k\">VALUES</span> (10,'judy',27),(11,'mallory',39);", Tend('d7') + 0.7);
  fill(2, rowsOf(snap[3])[2], t8);
  keyed(dl).at(t8 + 0.2, { html: 'dellink = ff…ff' });
  vanish(headA, t8 + 0.2);
  // ── d8 没有空位：追加到末尾，文件变成 144 字节 ──
  const tM = T('d8', '追加') - 0.2;
  g.rows[8].querySelectorAll('.b').forEach((e) => (e.textContent = '00'));
  appear(g.rows[8], tM);
  fill(8, rowsOf(snap[3])[8], tM);
  keyed(size).at(tM + 0.3, { html: '144 字节', cls: 'abs mono c-o' }); sfx('tick', tM + 0.3, { g: 0.6 });
  const endN = tag(world, X + OFFW, Y + 9 * RH + 6, '0x80：原来的文件末尾', 'c-o'); appear(endN, tM + 0.2);

  // ── d9 文件里的顺序 ≠ 插入的顺序 ──
  const order = h('div', 'abs mono', world, 'SELECT * 的返回顺序：1 2 <span class="c-o">10</span> 4 5 <span class="c-o">9</span> 7 8 11'); px(order, X + OFFW, Y + 10 * RH + 4); css(order, { fontSize: '32px', color: '#d9d9d9' });
  wipe(order, T('d9', '顺序') - 0.3, { dir: 'l', d: 0.6 }); sfx('chime', T('d9', '插入') , { g: 0.4 });

  // 命令栏：按时刻显示最近一条，逐字敲出
  F((t) => {
    let c = null; for (const k of cmds) if (t >= k.t) c = k;
    const key = c ? c.t + ':' + Math.min(999, Math.floor((t - c.t) * 40)) : 'none';
    if (barIn._k === key) return; barIn._k = key;
    if (!c) { barIn.innerHTML = '<span class="c-o">mysql&gt; </span>'; return; }
    const toks = tokenize(c.sql), n = toks.filter((k) => k.ch).length, k = Math.min(n, Math.floor((t - c.t) * 40));
    let out = '', i = 0; for (const tk of toks) { if (tk.tag) { out += tk.tag; continue; } if (i++ < k) out += tk.ch; }
    barIn.innerHTML = '<span class="c-o">mysql&gt; </span>' + out + (k < n ? '<span class="cur"></span>' : '');
  });
  for (const k of cmds) for (let i = 0; i < 6; i++) sfx('key', k.t + i * 0.12, { g: 0.5 });

  track(cam, s.start, { x: 960, y: 560, z: 1 }, [
    [c0 + 0.1, { z: 1.02 }, T('d2') - c0 - 0.5, { ease: 'none', sfx: false }],
    [T('d2') - 0.3, { x: 820, y: 520, z: 1.3 }, 1.0, { g: 0.4 }],   // 中心放低：链尾那行注释要留在字幕栏上方
    [null, { x: 880, z: 1.34 }, Tend('d4') - T('d2') - 1.0, { ease: 'none', sfx: false }],
    [Tend('d4') + 0.15, { x: 960, y: 520, z: 1.05 }, 0.8, { sfx: false }],
    [T('d6') - 0.3, { x: 1110, y: 520, z: 1.08 }, 1.0, { g: 0.4 }],
    [Tend('d6') + 0.2, { x: 960, y: 560, z: 1 }, 0.8, { sfx: false }],
    [null, { z: 1.03 }, s.end - Tend('d6') - 1.2, { ease: 'none', sfx: false }],
  ]);
});
