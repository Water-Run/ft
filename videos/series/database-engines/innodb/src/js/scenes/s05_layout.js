// 第 05 章：数据怎么放。站 A：一个 .ibd 文件、页、磁盘与内存之间整页搬、八页各管什么（I02、D11、术语表 page）；
// 站 B：表就是主键 B 树（D01、D02，多层为示意）；没有主键时的选择（D01）；站 C：叶子存整行，对照上一期存位置（D01、M）；users 只有一层（I03）；
// 站 D：alice 这一行的 33 字节：记录头、三个列、两个隐藏字段（I04、I33、D03、I16、I35）。
scene('s05', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const g = gsvg(world, -200, -200, 9000, 1400);
  const XB = 2200, XC = 4400, XD = 6600;
  const at = (id, w, o = 0) => Q(T(id, w)) + o;
  const R = D.indexes[0].records;

  // ── 站 A：文件与页 ──
  const q1 = txt(world, 't-n dim', '上一期的第一个问题', 104, 130), q2 = txt(world, 't-2', '数据怎么放', 100, 170);
  fin(q1, at('a1') - 0.35); pop(q2, at('a1') - 0.25, { from: 0.85, origin: '0 50%' }); sfx('thud', at('a1') - 0.25, { g: 0.5 });
  // 上一期的两个文件：数据文件里是一行行记录，索引文件里是一棵 B 树（与开场的画法一致）；讲到哪样，哪样成块出现
  const PM = panel(world, 96, 300, 560, 600, 'MyISAM', { name: 'myisam-files' });
  const mD = fileIcon(world, 150, 380, 150, 190, { inpanel: true }), mI = fileIcon(world, 400, 380, 150, 190, { inpanel: true, lines: [0.5, 0.6] });
  const mDl = txt(world, 'mono t-s dim', '.MYD', 150, 584), mIl = txt(world, 'mono t-s dim', '.MYI', 400, 584);
  const mRows = [0, 1, 2].map((k) => { const e = row(world, 150, 652 + k * 56, 150, '', 'dk'); css(e, { height: '42px' }); return e; });
  const mRoot = tile(world, 400, 652, 150, 44, 't3'), mKids = [0, 1].map((k) => tile(world, 400 + k * 80, 742, 70, 44, 't3'));
  const mEdges = [0, 1].map((k) => gline(g, `M475 696 L${435 + k * 80} 742`, 'dim', { w: 3 }));
  const mDt = txt(world, 't-s', '数据', 150, 830), mIt = txt(world, 't-s', '索引', 400, 830);
  const mSplit = gline(g, 'M350 384 L350 866', 'line', { w: 3, dashed: '10 10' });
  const tM = at('a2', '两个文件'), tMd = at('a2', '数据'), tMi = at('a2', '索引');
  showPanel(PM, at('a1', '数据怎么放') + 0.2); pop(mD.e, at('a2') + 0.2); pop(mI.e, at('a2') + 0.35);
  mRows.forEach((e, k) => pop(e, tMd + k * 0.08, { from: 0.8 })); fin(mDt, tMd + 0.2); sfx('tick', tMd, { g: 0.4, p: -0.5 });
  pop(mRoot, tMi - 0.05, { from: 0.8 }); mKids.forEach((e, k) => pop(e, tMi + 0.1 + k * 0.08, { from: 0.8 })); mEdges.forEach((l, k) => drawIn(l, tMi + 0.05 + k * 0.05, 0.25));
  fin(mIt, tMi + 0.2); sfx('tick', tMi, { g: 0.4, p: -0.3 });
  drawIn(mSplit, at('a2', '分成') - 0.1, 0.4); fin(mDl, tM); fin(mIl, tM + 0.1);
  const PI = panel(world, 700, 300, 1124, 600, 'InnoDB · users.ibd', { cls: 'hot', name: 'ibd-file' });
  const iF = fileIcon(world, 760, 380, 150, 190, { inpanel: true, lines: [0.7, 0.8, 0.6, 0.7] });
  const iFl = txt(world, 't-n wrap', '数据和索引，都在这一个文件里', 940, 420); css(iFl, { width: '820px' });
  const tI = at('a2b', '两样');
  showPanel(PI, at('a2', '两个文件') + 0.2); pop(iF.e, at('a2b') + 0.3); fin(iFl, tI); sfx('pop', at('a2b') + 0.3, { g: 0.5 });
  // 切成页：八个页块
  const kinds = [['t1', '文件自身的信息'], ['t1', ''], ['t1', ''], ['t1', ''], ['t4', '主键索引'], ['t3', '名字索引'], ['t0', '空'], ['t0', '']];
  const pages = kinds.map(([cls], i) => tile(world, 760 + i * 128, 620, 110, 140, cls));
  const pno = kinds.map((_, i) => txt(world, 't-s dim', String(i), 800 + i * 128, 770));
  const tP = at('a3', '一页一页');
  out(iF.e, tP - 0.2); out(iFl, tP - 0.2);
  pages.forEach((e, i) => pop(e, tP + i * 0.06)); pno.forEach((e, i) => fin(e, tP + 0.3 + i * 0.04)); sfx('tick', tP, { g: 0.45 }); sfx('tick', tP + 0.3, { g: 0.4 });
  const kb = tag(world, 760, 400, '每页 16 KiB', 'blue'); pop(kb, at('a3', '16'));
  // 页是读写的单位：一页从磁盘搬进内存
  const mem = panel(world, 1300, 330, 480, 260, '内存', { name: 'memory' });
  const mv = tile(world, 760 + 4 * 128, 620, 110, 140, 't4'); mv.style.zIndex = 3; mv.style.visibility = 'hidden';
  const tU = at('a4b', '内存');
  showPanel(mem, at('a4', '单位') - 0.2);
  // 搬动的那一页：显隐由 t 直接算出（用补间切换显隐时，倒着跳会留下可见的页块）
  const tOut = at('a5') - 0.1;
  F((t) => { const o = t < tU - 0.3 ? 0 : t < tOut ? 1 : Math.max(0, 1 - (t - tOut) / 0.3); mv.style.opacity = o.toFixed(3); mv.style.visibility = o > 0 ? 'visible' : 'hidden'; });
  tl.fromTo(mv, { x: 0, y: 0 }, { x: 1340 - 1272, y: 424 - 620, duration: 0.8, ease: 'power3.inOut', immediateRender: false }, tU - 0.3);
  const unit = txt(world, 't-n', '一次搬一整页', 1480, 474); fin(unit, at('a4b', '一整页')); sfx('whoosh', tU - 0.3, { g: 0.3 });
  out(mem.el, at('a5') - 0.1); out(mem.tt, at('a5') - 0.1); out(unit, at('a5') - 0.1); out(kb, at('a5') - 0.1);
  const lbl = [[0, 3, '文件自身的信息', 'dim', 'a5', '自身'], [4, 4, '主键索引', '', 'a6', '索引'], [5, 5, '名字索引', '', 'a6', '索引'], [6, 7, '还空着', 'dim', 'a6', '空着']];
  lbl.forEach(([a, b, t_, cls, id, w], k) => {
    const x0 = 760 + a * 128, x1 = 760 + b * 128 + 110;
    const ln = gline(g, `M${x0} 600 L${x1} 600`, cls === 'dim' ? 'dim' : 'blue', { w: 4 });
    const e = txt(world, 't-s ' + (cls || 'blue'), t_, x0, k === 1 ? 470 : k === 2 ? 520 : 550); if (k === 1 || k === 2) css(e, { left: (x0 - 10) + 'px' });
    drawIn(ln, at(id, w) - 0.1 + k * 0.1, 0.3); fin(e, at(id, w) + k * 0.1);
  });

  // ── 站 B：表就是主键 B 树 ──
  const hB = txt(world, 't-3', '表本身就是主键索引：一棵按主键排好序的 B 树', XB + 100, 140); fin(hB, at('a7') + 0.2);
  const PB = panel(world, XB + 96, 230, 1100, 660, null, { name: 'btree' });
  const rootT = tile(world, XB + 520, 280, 260, 80, 't3');
  const brs = [0, 1, 2].map((i) => tile(world, XB + 200 + i * 320, 440, 260, 70, 't2'));
  const lvs = [0, 1, 2, 3, 4, 5].map((i) => panel(world, XB + 140 + i * 172, 600, 156, 240, null, { name: 'leaf-page' }));
  const lvRows = lvs.map((P_, i) => [0, 1, 2, 3].map((k) => { const e = row(world, P_.x + 14, 618 + k * 54, 128, ''); css(e, { height: '40px' }); return e; }));
  const rk = txt(world, 'mono t-s white', '1 · 3 · 5', XB + 590, 300), lab1 = txt(world, 't-s dim', '上面几层：路标', XB + 820, 300), lab2 = txt(world, 't-s blue', '叶子页：按顺序存着数据', XB + 140, 850);
  const sk = tag(world, XB + 1000, 250, '示意');
  const tT = at('a7x', 'B 树');
  showPanel(PB, at('a7', '主键索引') - 0.2); pop(rootT, at('a7', '主键索引')); fin(rk, tT); pop(sk, tT); brs.forEach((e, i) => pop(e, tT + 0.1 + i * 0.08));
  lvs.forEach((P_, i) => fin(P_.el, tT + 0.3 + i * 0.05, { y: 10 })); lvRows.flat().forEach((e, i) => fin(e, tT + 0.5 + i * 0.01, { y: 0, d: 0.2 }));
  const eg = [[650, 360, 330, 440], [650, 360, 650, 440], [650, 360, 970, 440]].concat([0, 1, 2, 3, 4, 5].map((i) => [330 + Math.floor(i / 2) * 320, 510, 218 + i * 172, 600]))
    .map(([a, b, c, d], i) => { const l = gline(g, `M${XB + a} ${b} L${XB + c} ${d}`, 'dim', { w: 3 }); drawIn(l, tT + 0.1 + i * 0.03, 0.3); return l; });
  const tLeaf = at('a7c', '叶子页');
  lvRows.flat().forEach((e) => classAt(e, 'dk', tLeaf));
  fin(lab2, tLeaf); fin(lab1, at('a7c', '路标'));
  const path = gline(g, `M${XB + 650} 360 L${XB + 650} 440 M${XB + 650} 510 L${XB + 562} 600`, 'blue', { w: 7 });
  drawIn(path, at('a7d', '根页'), 0.8); classAt(lvs[2].el, 'hot', at('a7d', '叶子')); sfx('tick', at('a7d', '叶子'), { g: 0.45 });
  // 没有主键时
  const PK = panel(world, XB + 1240, 230, 584, 660, '表要是没有主键', { name: 'no-primary-key' });
  const ch = [['主键', 'blue'], ['第一个列都不为空的唯一索引', ''], ['隐藏的行号', '']];
  ch.forEach(([t_, cls], i) => {
    const e = txt(world, 't-4 wrap', t_, XB + 1290, 330 + i * 170); css(e, { width: '480px', padding: '14px 20px', borderRadius: '14px', background: cls ? C.blue : '#e4efee', color: cls ? '#fff' : C.ink });
    const tt = i === 0 ? at('a7b') : i === 1 ? at('a7b', '唯一索引') : at('a7bb', '行号');
    pop(e, tt - 0.1, { from: 0.85 });
    if (i) { const l = gline(g, `M${XB + 1530} ${330 + i * 170 - 50} L${XB + 1530} ${330 + i * 170 - 6}`, 'ink', { w: 4, arrow: true }); arrowIn(l, tt - 0.3, 0.3); }
  });
  showPanel(PK, at('a7b') - 0.3);
  const nk = txt(world, 't-s dim wrap', '依次往下选，选中的就是这张表的「主键索引」', XB + 1290, 800); css(nk, { width: '500px' }); fin(nk, at('a7bb') + 0.6);

  // ── 站 C：叶子里是整行 ──
  const PCm = panel(world, XC + 96, 140, 820, 420, '上一期 · MyISAM', { name: 'myisam-leaf' });
  const ml = row(world, XC + 140, 240, 400, '3' + sp(2) + '→ 行的位置');
  const mfile = fileIcon(world, XC + 640, 220, 140, 180, { inpanel: true });
  const ma = gline(g, `M${XC + 548} 268 L${XC + 630} 290`, 'dim', { w: 4, arrow: true }); const mt = txt(world, 't-n dim wrap', '还要再去 .MYD 里读一次', XC + 140, 330); css(mt, { width: '480px' });
  const PCi = panel(world, XC + 1004, 140, 820, 420, 'InnoDB', { cls: 'hot', name: 'innodb-leaf' });
  const il = row(world, XC + 1048, 240, 720, '3' + sp(2) + 'carol' + sp(2) + '41', 'on'); const it = txt(world, 't-n', '叶子里就是整行数据', XC + 1048, 330);
  const tC = at('a8', '位置');
  showPanel(PCm, at('a8') - 0.3); fin(ml, at('a8')); pop(mfile.e, tC); arrowIn(ma, tC, 0.3); fin(mt, tC + 0.3);
  showPanel(PCi, at('a8', '不同')); fin(il, at('a8', '整行')); fin(it, at('a8', '整行') + 0.2); sfx('pop', at('a8', '整行'), { g: 0.5 });
  const gotI = tag(world, XC + 1048, 440, '找到叶子，数据就拿到了', 'blue'); pop(gotI, at('a9', '拿到'));
  const P4 = panel(world, XC + 96, 600, 1300, 300, 'users · 第 4 页：根就是叶子', { name: 'root-leaf' });
  const r8 = R.map((r, i) => { const e = row(world, XC + 140 + (i % 4) * 310, 680 + Math.floor(i / 4) * 80, 290, r.id + sp(1) + r.name); css(e, { fontSize: '28px' }); return e; });
  const t10 = at('a10', '八行');
  showPanel(P4, t10 - 0.3); r8.forEach((e, i) => fin(e, t10 + i * 0.05, { y: 6, d: 0.3 })); sfx('tick', t10, { g: 0.4 });
  const one = tag(world, XC + 1440, 640, '只有一层', 'blue'); pop(one, at('a10b', '一层'));
  const grow = panel(world, XC + 1440, 700, 384, 200, null, { cls: 'sketch', name: 'grows' });
  const gr = [0, 1, 2].map((i) => tile(world, XC + 1470 + i * 112, 790, 96, 50, 't0'));
  const grR = tile(world, XC + 1582, 726, 96, 40, 't0'); const grT = txt(world, 't-s dim', '行多了：树长高（示意）', XC + 1460, 850);
  fin(grow.el, at('a11') - 0.1); gr.forEach((e, i) => pop(e, at('a11', '更多层') + i * 0.08)); pop(grR, at('a11', '更多层') + 0.3); fin(grT, at('a11', '更多层') + 0.4);

  // ── 站 D：一行 33 字节 ──
  const hD = txt(world, 't-3', 'alice 这一行：33 字节', XD + 100, 140); fin(hD, at('a12') + 0.2);
  const segs = [['记录头', 5, 't2', 'a14'], ['id', 4, 'blue', 'a13'], ['事务号', 6, 't4', 'a17b'], ['回滚指针', 7, 't4', 'a18'], ['名字', 10, 'blue', 'a13'], ['年龄', 1, 'blue', 'a13']];
  const U = 1700 / 33; let x = XD + 110;
  const segEls = segs.map(([nm, n, cls, id], i) => {
    const w = n * U - 6;
    const e = tile(world, x, 250, w, 110); e.dataset.name = 'seg-' + nm;
    const l = txt(world, 't-s', nm, x + 8, 372); const nb = txt(world, 't-s dim', n + ' 字节', x + 8, 410);
    if (w < 120) { css(l, { left: (x - 20) + 'px' }); css(nb, { left: (x - 20) + 'px', top: '446px' }); }
    const tt = at('a12', '33') + i * 0.08;
    pop(e, at('a12', 'alice') + i * 0.3, { from: 0.9 }); fin(l, tt + 0.2); fin(nb, tt + 0.25);
    x += n * U;
    return { e, cls, id, nm };
  });
  sfx('tick', at('a12', '33'), { g: 0.45 });
  segEls.forEach(({ e, cls, id, nm }) => { const tt = id === 'a13' ? at('a13', '15') : id === 'a14' ? at('a14', '记录头') : id === 'a17b' ? at('a16', '隐藏字段') : at('a16', '隐藏字段') + 0.1; classAt(e, cls, tt); });
  beat(segEls[1].e, at('a13', 'id'), 1.08); beat(segEls[4].e, at('a13', '名字'), 1.05); beat(segEls[5].e, at('a13', '年龄'), 1.3);
  const colT = tag(world, XD + 110, 520, '三个列：15 字节', 'blue'); pop(colT, at('a13', '15')); sfx('pop', at('a13', '15'), { g: 0.4 });
  const hidT = tag(world, XD + 110 + 9 * U, 520, '两个隐藏字段：13 字节'); css(hidT, { background: C.ink, color: '#fff', borderColor: C.ink }); pop(hidT, at('a16', '13')); sfx('pop', at('a16', '13'), { g: 0.4, p: -0.3 });
  // 记录头指向下一条：页里的记录连成链
  const chainP = panel(world, XD + 96, 600, 1100, 300, '第 4 页里的记录', { name: 'chain' });
  const cr = R.map((r, i) => { const e = tile(world, XD + 140 + i * 130, 700, 110, 70, i === 0 ? 'blue' : 't1'); const t_ = txt(world, 'mono t-s ' + (i === 0 ? 'white' : ''), String(r.id), XD + 182 + i * 130, 716); return [e, t_]; });
  const tCh = at('a14', '下一条');
  showPanel(chainP, at('a14') + 0.3); sfx('tick', tCh, { g: 0.35 }); cr.forEach(([e, t_], i) => { pop(e, tCh + i * 0.06); fin(t_, tCh + 0.1 + i * 0.06); });
  cr.slice(0, 7).forEach((_, i) => { const l = gline(g, `M${XD + 252 + i * 130} 735 L${XD + 266 + i * 130} 735`, 'blue', { w: 4, arrow: true }); arrowIn(l, at('a14b', '链') - 0.3 + i * 0.06, 0.2); });
  // 读到「按主键」时整条顺序成块出现（只有箭头描出时，低清预演里看不出变化）；读到「链」时各条之间的箭头描出
  const chB = row(world, XD + 140, 800, 1010, '按主键排好：' + R.map((r) => r.id).join(' → '), 'on'); css(chB, { fontFamily: '"Sans SC", "Mono"' });
  pop(chB, at('a14b', '主键') - 0.1, { from: 0.9, origin: '0 50%' }); sfx('tick', at('a14b', '主键') - 0.1, { g: 0.35, p: -0.2 });
  // 事务号与回滚指针
  const PH = panel(world, XD + 1240, 600, 584, 300, null, { name: 'hidden-fields' });
  const h1 = txt(world, 't-n wrap', '事务号：每个修改数据的事务都有编号；这里记着最后修改它的那个', XD + 1270, 620); css(h1, { width: '530px' });
  const h1v = txt(world, 'mono t-4 blue', '2575', XD + 1270, 740);
  const h2 = txt(world, 't-n wrap', '回滚指针：指向改动之前的旧内容', XD + 1270, 800); css(h2, { width: '530px' });
  showPanel(PH, at('a17') - 0.2); fin(h1, at('a17', '事务号')); sfx('tick', at('a17', '事务号'), { g: 0.35 }); fin(h1v, at('a17b', '最后修改')); fin(h2, at('a18', '回滚指针'));
  const oldB = panel(world, XD + 1380, 450, 300, 120, null, { cls: 'sketch', name: 'old-content' });
  const oldT = txt(world, 't-s dim', '改动之前的旧内容', XD + 1400, 492);
  const rp = gline(g, `M${XD + 110 + 15 * U + 3.5 * U} 250 C ${XD + 110 + 18.5 * U} 200, ${XD + 1480} 330, ${XD + 1520} 442`, 'or', { w: 4, arrow: true, dashed: '10 7' });
  fin(oldB.el, at('a18', '旧内容') - 0.3); fin(oldT, at('a18', '旧内容')); arrowIn(rp, at('a18', '指向'), 0.5); sfx('tick', at('a18', '指向'), { g: 0.4 });
  beat(segEls[2].e, at('a20', '关键'), 1.04); beat(segEls[3].e, at('a20', '关键') + 0.15, 1.04);

  camGuard(world, s.start + 0.01, { x: 960, y: 484, z: 1 });
  camTrack(cam, s, { x: 960, y: 484, z: 1 }, [
    [at('a7') - 0.5, { x: XB + 960 }, 1.1, { g: 0.4 }],
    [at('a8') - 0.6, { x: XC + 960 }, 1.1, { g: 0.4 }],
    [at('a12') - 0.6, { x: XD + 960 }, 1.1, { g: 0.4 }],
  ]);
});
