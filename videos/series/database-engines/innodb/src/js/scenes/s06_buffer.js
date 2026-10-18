// 第 06 章：怎么找。站 A：缓冲池（术语表 buffer pool、D09 的中点插入与淘汰；链表为示意）；
// 站 B：一次按主键的查找（D01、I03）；站 C：二级索引与回到主键树（D01、I05，页 5 与页 4 的真实记录）。
scene('s06', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const g = gsvg(world, -200, -200, 7000, 1400);
  const XB = 2200, XC = 4400;
  const at = (id, w, o = 0) => Q(T(id, w)) + o;
  const R = D.indexes[0].records, SI = D.indexes[1].records;

  // ── 站 A：缓冲池 ──
  const q1 = txt(world, 't-n dim', '上一期的第二个问题', 104, 130), q2 = txt(world, 't-2', '怎么找', 100, 170);
  fin(q1, at('b1') - 0.35); pop(q2, at('b1') - 0.25, { from: 0.85, origin: '0 50%' }); sfx('thud', at('b1') - 0.25, { g: 0.5 });
  const PD = panel(world, 96, 720, 1728, 180, '磁盘', { name: 'disk' });
  const dk = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => tile(world, 300 + i * 124, 776, 104, 90, i % 4 === 1 ? 't2' : 't1'));
  showPanel(PD, at('b1', '怎么') - 0.1); dk.forEach((e, i) => pop(e, at('b2') + i * 0.03));   // 磁盘先在读到「怎么找」时摆出来，页块仍在下一句出现
  const PP = panel(world, 96, 300, 1728, 380, '内存', { name: 'buffer-pool' });
  showPanel(PP, at('b2', '内存') - 0.1);
  const bpT = txt(world, 't-3 blue', '缓冲池', 300, 318); fin(bpT, at('b3', '缓冲池'));
  const bpS = txt(world, 't-n dim', '存放读过的页', 520, 334); fin(bpS, at('b3', '读过'));
  // 链表：前部在左，尾部在右；十个槽
  const SX = (i) => 160 + i * 164, SY = 420;
  const lbl = ['p12', 'p7', 'p31', 'p3', 'p18', 'p25', 'p9', 'p40', 'p2'];
  const blocks = lbl.map((l, i) => { const e = tile(world, SX(i), SY, 144, 150, i < 6 ? 't2' : 't1'); const t_ = txt(world, 'mono t-s', l, 0, 0); e.appendChild(t_); css(t_, { left: '20px', top: '56px' }); return e; });
  const tB = at('b3', '读过');
  blocks.forEach((e, i) => pop(e, at('b3') + 0.3 + i * 0.05));
  const head = txt(world, 't-s dim', '← 前部', 160, 590), tail = txt(world, 't-s dim', '尾部 →', SX(9), 590);
  fin(head, tB + 0.6); fin(tail, tB + 0.7);
  // b4：再用到同一页：在内存里命中
  const tHit = at('b4', '同一页');
  const hitR = gring(g, SX(3) - 8, SY - 8, 160, 166, { color: 'blue', name: 'hit' }); drawIn(hitR, tHit - 0.1, 0.35);
  const hitT = tag(world, SX(3) - 10, 586, '直接在内存里取', 'blue'); pop(hitT, at('b4', '不必')); sfx('blip', tHit, { g: 0.5 });
  out(hitR, at('b5') - 0.2); out(hitT, at('b5') - 0.2);
  // b5：满了，淘汰尾部很久没用的页
  const tEv = at('b5', '淘汰');
  const ev = blocks[8];
  const evT = tag(world, SX(8) - 20, 360, '很久没用 → 淘汰', 'or'); pop(evT, tEv - 0.2);
  tl.fromTo(ev, { y: 0, autoAlpha: 1 }, { y: 240, autoAlpha: 0, duration: 0.6, ease: 'power3.in', immediateRender: false }, tEv + 0.2); sfx('error', tEv + 0.2, { g: 0.35 });
  out(evT, at('b6') - 0.1);
  // b6：新读进来的页先放在中间（旧子链表头部）；再被用到，才挪到前面
  const mid = gline(g, `M${SX(6) - 10} ${SY - 40} L${SX(6) - 10} ${SY + 190}`, 'blue', { w: 4, dashed: '10 8' });
  const midT = txt(world, 't-s blue', '中间', SX(6) - 40, 590);
  const nw = tile(world, SX(6), SY, 144, 150, 'blue'); const nwt = txt(world, 'mono t-s white', 'p50', 0, 0); nw.appendChild(nwt); css(nwt, { left: '20px', top: '56px' });
  const tM = at('b6', '中间');
  drawIn(mid, tM - 0.3, 0.3, { dash: '10 8' }); fin(midT, tM - 0.2);
  for (let i = 6; i < 8; i++) tl.fromTo(blocks[i], { x: 0 }, { x: 164, duration: 0.45, ease: 'power3.inOut', immediateRender: false }, tM - 0.2);
  tl.fromTo(nw, { autoAlpha: 0, y: 360 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', immediateRender: true }, tM - 0.1); sfx('pop', tM, { g: 0.5 });
  const tF = at('b6', '前面');
  tl.fromTo(nw, { x: 0 }, { x: SX(0) - SX(6), duration: 0.7, ease: 'power3.inOut', immediateRender: false }, tF - 0.3);
  for (let i = 0; i < 6; i++) tl.fromTo(blocks[i], { x: 0 }, { x: 164, duration: 0.6, ease: 'power3.inOut', immediateRender: false }, tF - 0.2);
  sfx('whoosh', tF - 0.3, { g: 0.3 });
  const hot = tag(world, 300, 586, '常用的页留在前面', 'blue'); pop(hot, at('b7', '常用'));

  // ── 站 B：一次按主键的查找 ──
  const hB = txt(world, 't-3', '按主键找 id = 3', XB + 100, 140); fin(hB, at('d1') - 0.2);
  const P4 = panel(world, XB + 96, 230, 1000, 660, '根页 · 第 4 页（也是叶子）', { name: 'root-page' });
  const rows4 = R.map((r, i) => row(world, XB + 140, 310 + i * 68, 912, r.id + sp(3) + pad(r.name, 7) + r.age));
  const tR = at('d1', '根页');
  showPanel(P4, tR - 0.2); rows4.forEach((e, i) => fin(e, tR + i * 0.04, { y: 6, d: 0.3 })); sfx('tick', tR, { g: 0.4 });
  const PQ = panel(world, XB + 1140, 230, 684, 660, '这一页在缓冲池里吗？', { name: 'lookup-steps' });
  const yes = txt(world, 't-4 wrap', '在：直接用', XB + 1190, 330), no = txt(world, 't-4 wrap dim', '不在：先从磁盘读进来', XB + 1190, 420);
  const tq = at('d1b', '缓冲池');
  showPanel(PQ, tq - 0.3); fin(yes, at('d1b', '直接用') - 0.1); fin(no, at('d1b', '磁盘') - 0.1); sfx('tick', at('d1b', '直接用'), { g: 0.4 });
  const step3 = txt(world, 't-4 wrap blue', '在页里按主键找到 3', XB + 1190, 560); css(step3, { width: '600px' });
  const tFd = at('d1c', '找到');
  fin(step3, tFd - 0.1); classAt(rows4[2], 'on', tFd); sfx('pop', tFd, { g: 0.55 });
  const whole = tag(world, XB + 1190, 660, '根就是叶子：整行就在这里', 'blue'); pop(whole, at('d1c', '整行'));

  // ── 站 C：二级索引 ──
  const P5 = panel(world, XC + 96, 230, 700, 660, '名字上的二级索引 · 第 5 页', { name: 'secondary' });
  const rows5 = SI.map((r, i) => row(world, XC + 140, 310 + i * 68, 612, pad(r.name, 7) + '→' + sp(2) + r.id));
  const tS = at('d2', '二级索引');
  const hC = txt(world, 't-3', '按名字找：另一棵树', XC + 100, 140); fin(hC, at('d2') - 0.2);
  showPanel(P5, at('d2', '另一棵树')); rows5.forEach((e, i) => fin(e, tS + i * 0.04, { y: 6, d: 0.3 }));
  const two = tag(world, XC + 140, 860 - 10, '叶子里只有：名字 + 主键'); pop(two, at('d3', '两样'));
  const P4b = panel(world, XC + 1124, 230, 700, 660, '主键索引 · 第 4 页', { name: 'primary' });
  const rows4b = R.map((r, i) => row(world, XC + 1168, 310 + i * 68, 612, r.id + sp(3) + pad(r.name, 7) + r.age));
  showPanel(P4b, at('d4b') - 0.6); rows4b.forEach((e, i) => fin(e, at('d4b') - 0.4 + i * 0.03, { y: 6, d: 0.3 }));
  const qc = tag(world, XC + 140, 170 + 40, '查 carol 的年龄', 'blue'); css(qc, { top: '176px', left: (XC + 820) + 'px' }); pop(qc, at('d4', 'carol'));
  const tK = at('d4b', '主键 3');
  classAt(rows5[2], 'on', at('d4b', 'carol')); sfx('pop', at('d4b', 'carol'), { g: 0.5 });
  const k3 = txt(world, '', '3', XC + 920, 420); css(k3, { font: '800 120px/1 "Open Sans"', color: C.blue }); pop(k3, tK); sfx('thud', tK, { g: 0.5 });
  const a1 = gline(g, `M${XC + 760} ${310 + 2 * 68 + 28} L${XC + 900} 480`, 'blue', { w: 5, arrow: true }); arrowIn(a1, tK - 0.2, 0.35);
  const a2 = gline(g, `M${XC + 1000} 480 L${XC + 1150} ${310 + 2 * 68 + 28}`, 'blue', { w: 5, arrow: true }); arrowIn(a2, at('d5', '主键树') - 0.2, 0.35);
  classAt(rows4b[2], 'on', at('d5', '整行')); const a41 = tag(world, XC + 1168, 860 - 10, '年龄 41', 'blue'); pop(a41, at('d5', '41')); sfx('blip', at('d5', '41'), { g: 0.55 });
  const cmp = panel(world, XC + 820, 600, 290, 280, null, { name: 'compare' });
  const cm1 = txt(world, 't-s dim wrap', 'MyISAM：索引存行的位置', XC + 840, 620), cm2 = txt(world, 't-s blue wrap', 'InnoDB：二级索引存主键', XC + 840, 720);
  [cm1, cm2].forEach((e) => css(e, { width: '250px' }));
  showPanel(cmp, at('d6') - 0.2); fin(cm1, at('d6', '位置')); fin(cm2, at('d6b', '主键'));
  const more = tag(world, XC + 820, 896, '多走一次主键树', 'or'); css(more, { top: '520px' }); pop(more, at('d7', '多走')); beat(a2, at('d7', '多走'));

  camGuard(world, s.start + 0.01, { x: 960, y: 484, z: 1 });
  camTrack(cam, s, { x: 960, y: 484, z: 1 }, [
    [at('d1') - 0.6, { x: XB + 960 }, 1.1, { g: 0.4 }],
    [at('d2') - 0.6, { x: XC + 960 }, 1.1, { g: 0.4 }],
  ]);
});
