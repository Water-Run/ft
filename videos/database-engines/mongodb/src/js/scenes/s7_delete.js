// 第 09 章 删（第 4 轮重做；第 4 轮 b 移到最后：主角的一生只往前走）：同一个舞台（collStage）。Alice 注销：三棵树各删一项；内存里在 2050 上挂一个删除标记 →
// 检查点：第二个叶页又写到文件末尾，页里 2049 后面就是 2051；文件没变小（132 KB），旧位置空出来 →
// Dave 注册拿到 4097（2050 不再发）→ 落进最后一个叶页 → 检查点时这一页写进空出来的位置，根页也挪进空位 →
// 这次检查点写完，它不再用的块才空出来；关闭 mongod 时又一次检查点：末尾空着的那段截掉，文件 120 KB，还有两段合计 24 KB 空着（U01 U02）。
// 事实：F01（ndeleted 1、keysDeleted 2）、F02（删除标记）、F03（2049、2051 在，2050 没有；叶页写到新位置）、F06（135,168 → 122,880，24,576 可复用）、
//       F04（4097，不回收）、B03（分界 3124）、F05（Dave 那一页 28672–49152）、F07（根页 122880 → 65536，文件截短）；06 回显的 deleteOne、insertOne。
scene('delete', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  makeCamera(world);
  chrome(root, s, '09 删');
  const V = collStage(world, null, c0);
  css(V.size, { borderRadius: '12px', padding: '0 16px', lineHeight: '66px', top: '674px' });
  const ov = V.ov, X = (o) => V.band.xOf(o);

  // 起点：同样是 4096 人刚写完、96 KB（f1）；Alice 注销（06 回显的命令）
  solid(V.size, T('f1', '九十') - 0.1, 'new', [T('f1', '九十') + 1.4, 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', K.ink]);
  solid(V.rows[1], T('f1', '开始') - 0.2, 'ink');
  const cmd = h('div', 'abs mono', world, 'deleteOne({ <span class="k">name</span>: <span class="s">"Alice"</span> })'); px(cmd, 400, 232); css(cmd, { font: '500 23px "Mono"', color: K.ink, background: '#FFD9D2', border: '2px solid ' + K.red, borderRadius: '8px', padding: '6px 14px' });
  show(cmd, T('f1a', '注销') - 0.3, { y: 8, d: 0.45 }); to(cmd, T('f1a', '账号') - 0.2, { backgroundColor: K.redl, borderColor: K.red, duration: 0.35 });
  // 三棵树都要动：集合树里 2050 这一项、两个索引各一项（F01）
  to(V.rows[1], T('f2', '集合树') - 0.2, { backgroundColor: K.red, color: '#FFFFFF', duration: 0.35 });
  to(V.leaves[1].c, T('f2', '三棵') - 0.2, { backgroundColor: '#FFB3A6', borderColor: K.red, duration: 0.35 }); to(V.leaves[1].c, T('f6', '检查点') - 0.3, { backgroundColor: '#FFFFFF', borderColor: K.gl1, duration: 0.35 });
  V.ix.forEach((e, i) => { textAt(e.querySelector('.ok'), [[0, ''], [T('f2b', '删掉') - 0.2 + i * 0.1, '删掉一项'], [T('f6', '检查点') - 0.3, '']]); to(e, T('f2b', '删掉') - 0.2 + i * 0.1, { borderColor: K.red, backgroundColor: K.red, color: '#FFFFFF', duration: 0.3 }); });
  const kd = tg(world, 900, 634, 'ndeleted: 1', 'm'); css(kd, { fontSize: '30px', lineHeight: '54px', color: '#FFFFFF', background: K.red, borderRadius: '10px', padding: '0 16px' });
  show(kd, T('f2', '文档') - 0.2, { y: 6, d: 0.4 });
  to(V.mem, Tend('f10') + 0.1, { backgroundColor: K.mint, borderColor: K.g1, duration: 0.4 }); to(V.mem, T('f13') - 0.2, { backgroundColor: K.gl3, borderColor: K.gl2, duration: 0.4 });
  textAt(kd, [[0, 'ndeleted: 1'], [T('f2b', '各') - 0.2, 'ndeleted: 1 · keysDeleted: 2']]);
  [0, 1, 2, 3].forEach((i) => tl.to(V.drop[i], { autoAlpha: 0, duration: 0.3 }, T('f2') - 0.3));   // 给下面的删除统计让出位置
  const kdZ = tg(world, 900, 694, '删掉的文档 1 份 · 删掉的索引键 2 个', 'b'); css(kdZ, { fontSize: '24px', color: K.redd });   // F01
  textAt(kdZ, [[0, '删掉的文档 1 份'], [T('f2b', '各') - 0.2, '删掉的文档 1 份 · 删掉的索引键 2 个']]);   // 跟上面那行统计一起长
  show(kdZ, T('f2', '文档') + 0.3, { y: 6, d: 0.4 }); fadeOut(kdZ, T('f3', '挂') - 0.6, 0.4);
  // 删除也是挂一个版本：不带内容，只说「删了」（F02）
  const memTi = V.mem.children[1];
  to(memTi, T('f3', '内存') - 0.2, { color: K.forest, duration: 0.35 });
  to(V.mem, T('f3', '内存') - 0.2, { backgroundColor: K.mint, borderColor: K.g1, duration: 0.4 }); to(V.mem, T('f5') + 0.15, { backgroundColor: K.gl3, borderColor: K.gl2, duration: 0.4 });
  const tT = T('f3', '挂') - 0.4;
  fadeOut(cmd, tT - 0.3, 0.35);
  to([V.leaves[2].c, V.leaves[3].c, V.links[2], V.links[3]], tT - 0.3, { opacity: 0, duration: 0.45 });   // 连过去的线一起收
  const RY = V.LY + 52 + 46;
  const tomb = h('div', 'abs', world); tomb.dataset.name = 'tomb'; px(tomb, 990, RY - 12, 260, 64); css(tomb, { borderRadius: '10px', background: K.ink, color: '#fff', font: '700 28px/56px "Sans SC"', textAlign: 'center' });
  tomb.innerHTML = ''; css(tomb, { background: 'transparent', border: '3px dashed ' + K.ink, color: K.ink, boxSizing: 'border-box' });
  textAt(tomb, [[0, ''], [T('f5', '删除') - 0.2, '删除标记']]);
  const tA = link(ov, [[912, RY + 20], [986, RY + 20]], 'ink', { w: 3, arrow: true });
  show(tomb, tT + 0.2, { x: -24, y: 0, d: 0.45 }); arrowIn(tA, tT, 0.35);
  const glT = gl(world, 1290, RY - 80, '删除标记', '更新链上不带内容的版本：<br>只表示这一项删了', { key: '删除标记' });   // F02 F03
  css(glT.querySelector('span'), { fontSize: '24px' });
  show(glT, T('f4') - 0.1, { y: 10, d: 0.45 });
  // 检查点：第二个叶页又写到文件末尾；页里 2049 后面就是 2051（F03）
  to(tomb, T('f4', '不带') - 0.2, { backgroundColor: K.gl2, duration: 0.3 });
  to([V.root, V.leaves[0].c], T('f4', '不带') - 0.2, { opacity: 0.35, duration: 0.4 });   // 只看这一项和挂上的版本
  fadeOut(kd, Tend('f5') + 0.4, 0.4);
  to(tomb, T('f4', '只说') - 0.2, { borderColor: K.red, color: K.redd, backgroundColor: K.redl, duration: 0.3 });
  to(tomb, T('f5', '删除') - 0.2, { backgroundColor: K.red, borderColor: K.red, borderStyle: 'solid', color: '#FFFFFF', duration: 0.35 });
  to(tA, Tend('f5') + 0.3, { stroke: K.red, duration: 0.3 });   // 指向删除标记的那根线也变红
  const tK = T('f6', '检查点') - 0.3;
  to(memTi, tK, { color: K.ink, duration: 0.35 });
  fadeOut([tomb, tA, glT], tK, 0.45); to([V.root, V.leaves[0].c], tK, { opacity: 1, duration: 0.45 });
  to([V.leaves[2].c, V.leaves[3].c, V.links[2], V.links[3]], tK + 0.45, { opacity: 1, duration: 0.45 });   // 等注解退完再回来，不交叠
  V.ix.forEach((e) => to(e, tK, { borderColor: K.gl1, duration: 0.3 }));
  V.ix.forEach((e) => to(e, T('f3', '内存') - 0.2, { backgroundColor: '#FFFFFF', borderColor: K.red, color: K.redd, duration: 0.35 }));
  const gh = ghostPage(world, V.LX(1), V.LY, V.LW, V.LH);
  tl.fromTo(gh, { autoAlpha: 0.95, x: 0, y: 0, scale: 1 }, { x: X(110592) - (V.LX(1) + V.LW / 2), y: 700 - V.LY, scale: 0.4, autoAlpha: 0, duration: 1.1, ease: 'power2.inOut', immediateRender: false }, T('f6', '写到') - 0.4);
  revealBand(V, T('f6', '末尾') - 0.5, 98304, 135168, 0.8);
  to(V.size, T('f6', '末尾') - 0.6, { autoAlpha: 0, duration: 0.3 }); to(V.size, T('f8', '长到') - 0.5, { autoAlpha: 1, duration: 0.3 });   // 文件条在长、大小还没讲到：先收起，免得两者对不上（同第 06 章）
  const n2 = V.band.blk(98304, 122880, 'n', '1225–2448'), r2 = V.band.blk(122880, 126976, 'r'), tail = V.band.blk(126976, 135168, 'h', '区段表');
  show(n2, T('f6', '末尾') - 0.1, { y: 0, s: 0.7, d: 0.4 }); show(r2, T('f6', '末尾') + 0.2, { y: 0, s: 0.7, d: 0.35 }); show(tail, T('f6', '末尾') + 0.45, { y: 0, s: 0.7, d: 0.35 }); sfx('thud', T('f6', '末尾'), { g: 0.5 });   // 叶页、根页、区段表依次接在末尾（U02）
  fadeOut(V.drop[1], T('f6', '末尾') - 0.1, 0.3);
  [0, 2, 3].forEach((i) => tl.to(V.drop[i], { autoAlpha: 0, duration: 0.3 }, T('f6', '末尾') - 0.1));
  const drop2 = link(ov, [[V.LX(1) + V.LW / 2, V.LY + V.LH], [V.LX(1) + V.LW / 2, 604], [X(110592), 604], [X(110592), 756]], 'accent', { w: 2.5, dashed: '6 6' }); arrowIn(drop2, T('f6', '末尾') + 0.2, 0.5);
  fadeOut(drop2, T('f10', 'D') - 0.4, 0.3);
  // 2050 那一行从页里消失，2051 补上来
  tl.to(V.rows[1], { autoAlpha: 0, scaleY: 0.2, duration: 0.45, ease: 'power2.in' }, T('f7', '2049') - 0.3);
  tl.to(V.rows[2], { y: -46, duration: 0.5, ease: 'power2.inOut' }, T('f7', '2051') - 0.6);
  to([V.rows[0], V.rows[2]], T('f7', '2051') - 0.2, { backgroundColor: K.forest, color: '#FFFFFF', duration: 0.35 });
  to([V.rows[0], V.rows[2]], T('f8') + 0.3, { backgroundColor: K.gl3, color: K.gd2, duration: 0.35 });
  to(V.leaves[1].head, T('f8', '少了') - 0.2, { color: '#FFFFFF', backgroundColor: K.red, duration: 0.35 }); to(V.leaves[1].head, T('f9') - 0.2, { color: K.gd2, backgroundColor: K.gl3, duration: 0.35 });
  // 文件没有变小：132 KB；第二个叶页原来的地方空出来
  to(n2, T('f8', '长到') - 0.3, { backgroundColor: K.forest, borderColor: K.forest, duration: 0.35 }); if (n2._t) to(n2._t, T('f8', '长到') - 0.3, { color: '#FFFFFF', duration: 0.35 });
  stepTo(V.size, [[T('f8', '长到') - 0.3, 0.9, 96, 132], [T('f15b', '缩回') - 0.2, 0.9, 132, 120]], (v) => Math.round(v) + ' KB');
  solid(V.size, T('f8', '没有') - 0.2, 'new', [T('f9') - 0.1, 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', K.ink]);
  to([V.root, ...V.leaves.map((p) => p.c), ...V.links], T('f9', '原来') - 0.2, { opacity: 0.35, duration: 0.45 }); to([V.root, ...V.leaves.map((p) => p.c), ...V.links], T('f10') - 0.1, { opacity: 1, duration: 0.45 });
  to(V.b.l2, T('f9', '原来') - 0.2, { backgroundColor: '#FCE9B0', borderColor: K.yeld, duration: 0.35 });
  to([V.b.l2, V.b.r, V.b.x], T('f9', '空') - 0.3, { backgroundColor: 'rgba(0,0,0,0)', borderColor: K.gd1, borderStyle: 'dashed', duration: 0.45 });   // lint-ok: 空出的块是透明底；上一份区段表也一起空出来（U02）
  fadeOut([V.b.l2._t, V.b.x._t], T('f9', '空') - 0.3, 0.3);
  // 对照前几集：删掉的数据占的地方，文件不会自己还回去（U04）
  const glCmp = gl(world, 200, 646, '对照前几集', glRows([['SQLite', '删掉的内容不擦，空间标成可再用；VACUUM 重建才缩小文件'], ['InnoDB', '删掉的行由 purge 清走，空页留在表空间；OPTIMIZE TABLE 重建才还给系统']]), { key: '对照 SQLite、InnoDB' }); glInline(glCmp); glCmp.querySelectorAll('.gr').forEach((e) => css(e, { fontSize: '24px', lineHeight: '35px' }));
  show(glCmp, T('f8', '没有') - 0.2, { x: 12, y: 0, d: 0.45 }); fadeOut(glCmp, T('f11', '空') - 0.3, 0.4);
  // Dave 注册：RecordId 4097，2050 不再发（F04）
  const tD = T('f10', 'D') - 0.3;

  const dcmd = h('div', 'abs mono', world, 'insertOne({ <span class="k">name</span>: <span class="s">"Dave"</span>, … })'); px(dcmd, 400, 244); css(dcmd, { font: '500 22px "Mono"', color: K.ink, background: K.mint2, border: '2px solid ' + K.g1, borderRadius: '8px', padding: '6px 14px' });
  show(dcmd, tD, { y: 8, d: 0.45 });
  V.b.l2.dataset.name = 'blk'; const rid = h('div', 'abs', world); rid.dataset.name = 'rid'; px(rid, 400, 246, 380, 50); css(rid, { font: '700 30px/50px "Mono"', color: '#FFFFFF', background: K.forest, borderRadius: '10px', padding: '0 14px', width: 'auto' });
  rid.innerHTML = 'RecordId <span style="color:#FFFFFF;background:#00684A;padding:2px 12px;border-radius:8px">4097</span>　<span class="no" style="color:#C0FAE6;text-decoration:line-through">2050</span>';
  fadeOut(dcmd, T('f11', '四') - 0.6, 0.3);
  show(rid, T('f11', '四') - 0.3, { y: 8, d: 0.45 });
  const noS = rid.querySelector('.no'); const noLine = h('div', 'abs', world); px(noLine, 400 + noS.offsetLeft - 4, 246 + 24, noS.offsetWidth + 8, 4); css(noLine, { background: K.red, transformOrigin: '0 50%' }); noLine.dataset.name = 'no2050';
  fromTo(noLine, T('f11', '不再') - 0.1, { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: 'power2.out' }); fadeOut(noLine, T('f13') - 0.3, 0.3);
  to(rid.querySelector('.no'), T('f11', '不再') - 0.2, { backgroundColor: K.red, color: '#FFFFFF', duration: 0.35 });
  const treeAll = [V.root, ...V.leaves.map((p) => p.c), ...V.links];
  to(treeAll, T('f11', '不再') - 0.3, { opacity: 0.35, duration: 0.4 }); to(treeAll, T('f13') - 0.2, { opacity: 1, duration: 0.4 });
  to([0, 1, 2].map((i) => V.leaves[i].c), T('f13', '三') - 0.2, { opacity: 0.35, duration: 0.4 }); to([0, 1, 2].map((i) => V.leaves[i].c), T('f14') - 0.1, { opacity: 1, duration: 0.4 });   // 4097 比 3124 大，不在前三个叶页
  // 4097 比 3124 大：落进最后一个叶页，叶页的范围变成 3124–4097
  // 4097 从 RecordId 那一格原样升起（大小、位置与那一格对齐，不盖住左边的「RecordId」）
  const chip4097 = rid.querySelector('span'); const TKX = 400 + chip4097.offsetLeft - 3;
  const tok = h('div', 'abs', world, '4097'); px(tok, TKX, 248); css(tok, { font: '700 30px/40px "Mono"', color: K.forest, background: K.mint2, border: '3px solid ' + K.g1, borderRadius: '10px', padding: '0 12px' });
  fadeOut(V.ix, T('f13') - 0.3, 0.35);
  tl.fromTo(tok, { autoAlpha: 0, x: 0, y: 0 }, { autoAlpha: 1, duration: 0.2, immediateRender: true }, T('f13') - 0.1);
  to(V.root, T('f13', '比') - 0.1, { backgroundColor: K.forest, duration: 0.35 });
  to(V.root, T('f14') - 0.1, { backgroundColor: K.ink, duration: 0.35 });
  tl.to(tok, { x: 1420 - TKX, y: 236 - 248, duration: 0.7, ease: 'power2.inOut' }, T('f13', '比') - 0.1);
  textAt(V.root, [[0, '根页 · 1 · 1225 · 2449 · 3124'], [T('f13', '三') - 0.2, '根页 · 1 · 1225 · 2449 · <span style="background:#00684A;padding:0 8px;border-radius:4px">3124</span>'], [T('f14') + 0.2, '根页 · 1 · 1225 · 2449 · 3124']]);
  tl.to(tok, { x: V.LX(3) + 100 - TKX, y: V.LY + 80 - 248, duration: 0.7, ease: 'power2.inOut' }, T('f13', '落') - 0.2);
  fadeOut(tok, T('f13', '叶页') + 0.3, 0.3);
  to(V.leaves[3].c, T('f13', '落') + 0.4, { borderColor: K.g1, duration: 0.3 });
  textAt(V.leaves[3].head, [[0, '叶页 · 3124–4096'], [T('f13', '叶页') + 0.1, '叶页 · 3124–4097']]);
  to(V.leaves[3].head, T('f13', '叶页') + 0.1, { backgroundColor: K.forest, color: '#FFFFFF', duration: 0.3 }); to(V.leaves[3].c, T('f13', '叶页') + 0.1, { backgroundColor: K.mint2, duration: 0.3 });
  // Dave 之后的检查点（U02 的 .3）：新页按最佳适配写进第二个叶页空出来的地方（28672–49152）
  const tK2 = T('f14', '检查点') - 0.3;
  fadeOut(rid, tK2, 0.35);
  // 文件条上方一行：这一步在做什么（U01）。放在 Dave 那条下落线的右边
  const chip = (t) => `<span style="background:${K.ink};color:#FFFFFF;border-radius:8px;padding:2px 12px;margin-right:14px">${t}</span>`;
  const C3 = chip('Dave 之后的检查点'), C4 = chip('关闭 mongod 时的检查点');
  const stg = h('div', 'abs', world); stg.dataset.name = 'stage'; px(stg, 660, 652); css(stg, { font: '600 24px/40px "Inter", "Sans SC"', color: K.ink, whiteSpace: 'nowrap' });
  textAt(stg, [[0, ''], [tK2, C3 + '新页挑合适的空位，根页、区段表从头找空位'], [T('f15b') - 0.3, C4 + '末尾截掉，根页、区段表挪前']]);
  show(stg, tK2, { y: 6, d: 0.35 }); fadeOut(stg, T('f16') - 0.55, 0.35);
  const gh4 = ghostPage(world, V.LX(3), V.LY, V.LW, V.LH);
  tl.fromTo(gh4, { autoAlpha: 0.95, x: 0, y: 0, scale: 1 }, { x: X(38912) - (V.LX(3) + V.LW / 2), y: 540 - V.LY, scale: 0.4, autoAlpha: 0, duration: 1.1, ease: 'power2.inOut', immediateRender: false }, T('f14', '用上') - 0.6);   // 停在上方那行字之上
  const d4 = V.band.blk(28672, 49152, 'd', '3124–4097'); show(d4, T('f14', '用上') + 0.4, { y: 0, s: 0.7, d: 0.4 }); sfx('thud', T('f14', '用上') + 0.5, { g: 0.5 });
  const fr0 = V.band.blk(49152, 53248, 'f'); set(fr0, s.start, { autoAlpha: 0 }); show(fr0, T('f14', '用上') + 0.4, { y: 0, d: 0.3 });   // 这块空位还剩 4 KB
  fadeOut(V.drop[3], T('f14', '用上') + 0.3, 0.3);
  fadeOut(V.b.l2, T('f14', '用上') + 0.4, 0.3);
  const drop4 = link(ov, [[V.LX(3) + V.LW / 2, V.LY + V.LH], [V.LX(3) + V.LW / 2, 604], [X(38912), 604], [X(38912), 756]], 'accent', { w: 2.5, dashed: '6 6' }); arrowIn(drop4, T('f14', '用上') + 0.5, 0.6);
  // 根页按首次适配写进剩下的 4 KB（49152），区段表写进旧根页与上一份区段表空出的地方（86016–94208）
  to([V.root, ...V.leaves.map((p) => p.c), ...V.links], T('f15', '文件') - 0.2, { opacity: 0.35, duration: 0.45 });   // 之后一直看磁盘
  const ghR = ghostPage(world, 880, 236, 520, 70); css(ghR, { background: K.forest, borderColor: K.forest, overflow: 'hidden' });
  tl.fromTo(ghR, { autoAlpha: 0.95, x: 0, y: 0, scale: 1 }, { x: X(51200) - 1140, y: 600 - 271, scale: 0.15, autoAlpha: 0, duration: 0.9, ease: 'power2.inOut', immediateRender: false }, T('f15', '挪进') - 0.6);   // 停在文件条上方的那行字之上
  const r3 = V.band.blk(49152, 53248, 'r'); show(r3, T('f15', '挪进') - 0.2, { y: 0, s: 0.7, d: 0.4 }); fadeOut(fr0, T('f15', '挪进') - 0.2, 0.2);
  to(V.root, T('f15', '根页') - 0.2, { backgroundColor: K.forest, duration: 0.35 }); to(V.root, T('f15b') - 0.2, { backgroundColor: K.ink, duration: 0.35 });
  const ex3 = V.band.blk(86016, 94208, 'h', '区段表'), fr3 = V.band.blk(94208, 98304, 'f'); set([ex3, fr3], s.start, { autoAlpha: 0 });
  show(ex3, T('f15', '空位') - 0.1, { y: 0, s: 0.7, d: 0.35 }); show(fr3, T('f15', '空位') - 0.1, { y: 0, d: 0.3 }); fadeOut([V.b.r, V.b.x], T('f15', '空位') - 0.1, 0.25);
  // 这次检查点写完：它不再用的块空出来——旧的最后一个叶页、文件末尾的旧根页与区段表（36 KB）
  to(V.b.l4, T('f15', '末尾') - 0.3, { backgroundColor: 'rgba(0,0,0,0)', borderColor: K.gd1, borderStyle: 'dashed', duration: 0.4 });   // lint-ok: 空出的块
  fadeOut(V.b.l4._t, T('f15', '末尾') - 0.3, 0.3);
  to([r2, tail], T('f15', '末尾') - 0.3, { backgroundColor: K.red, borderColor: K.red, duration: 0.35 }); if (tail._t) to(tail._t, T('f15', '末尾') - 0.3, { color: '#FFFFFF', duration: 0.3 }); solid(V.size, T('f15', '末尾') - 0.3, K.red);
  // 关闭 mongod 时的检查点（.4）：根页写进 65536；末尾空着的那段截掉，文件 120 KB；区段表写进 69632–77824
  const r4 = V.band.blk(65536, 69632, 'r'), frA = V.band.blk(69632, 86016, 'f'); set([r4, frA], s.start, { autoAlpha: 0 });
  show(r4, T('f15b') - 0.2, { y: 0, s: 0.7, d: 0.35 }); show(frA, T('f15b') - 0.2, { y: 0, d: 0.25 }); fadeOut(V.b.l4, T('f15b') - 0.2, 0.25);
  revealBand(V, T('f15b', '缩回') - 0.3, 135168, 122880, 0.9); fadeOut([r2, tail], T('f15b', '缩回') + 0.7, 0.2);   // 截掉的那一段
  const ex4 = V.band.blk(69632, 77824, 'h', '区段表'), frB = V.band.blk(77824, 86016, 'f'); set([ex4, frB], s.start, { autoAlpha: 0 });
  show(ex4, T('f15b', '120') - 0.1, { y: 0, s: 0.7, d: 0.35 }); show(frB, T('f15b', '120') - 0.1, { y: 0, d: 0.25 }); fadeOut(frA, T('f15b', '120') - 0.1, 0.25);
  // 写完：上一次的根页（49152）与区段表（86016）空出来；空位合成两段：49152–53248、77824–98304，共 24 KB
  to([r3, ex3], T('f15b', '二十') - 0.4, { backgroundColor: 'rgba(0,0,0,0)', borderColor: K.gd1, borderStyle: 'dashed', duration: 0.35 });   // lint-ok: 空出的块
  if (ex3._t) fadeOut(ex3._t, T('f15b', '二十') - 0.4, 0.3);
  const fr1 = V.band.blk(49152, 53248, 'f'), fr2 = V.band.blk(77824, 98304, 'f'); fr1.dataset.name = 'free'; fr2.dataset.name = 'free';
  set([fr1, fr2], s.start, { autoAlpha: 0 });
  show([fr1, fr2], T('f15b', '二十') + 0.05, { y: 0, d: 0.3 }); fadeOut([r3, ex3, frB, fr3], T('f15b', '二十') + 0.05, 0.25);
  to([fr1, fr2], T('f15b', '后来') - 0.2, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.35 });   // 还空着、留给以后：虚线浅绿，不涂成实心
  solid(V.size, T('f15b', '缩回') + 0.6, 'new');
  to([V.root, ...V.leaves.map((p) => p.c), ...V.links, drop4], T('f15b', '空着') - 0.2, { autoAlpha: 0, duration: 0.45 }); to(V.size, T('f15b', '空着') - 0.2, { backgroundColor: 'rgba(0,0,0,0)', borderColor: 'rgba(0,0,0,0)', color: K.ink, duration: 0.35 });   // lint-ok: 只看磁盘上空着的地方（用 autoAlpha，和后面的退场一致，倒着跳也复原得了）
  // f16：Alice 这一份资料的一生，一步步排出来：注册 → 进文件 → 被找到 → 42 改成 43 → 注销
  const tL = T('f16') - 0.2;
  to(V.size, tL, { color: K.ink, backgroundColor: 'rgba(0,0,0,0)', borderColor: 'rgba(0,0,0,0)', duration: 0.3 });   // lint-ok: 视线离开，退回文字
  fadeOut([V.root, ...V.leaves.map((p) => p.c), ...V.links, ...V.drop, drop2, drop4, V.mem], tL - 0.35, 0.45);
  const lifeT = tg(world, 400, 300, 'Alice 这一份资料', 'b'); css(lifeT, { fontSize: '34px', lineHeight: '58px', color: '#FFFFFF', background: K.ink, borderRadius: '12px', padding: '0 18px' });
  show(lifeT, tL, { y: 8, d: 0.4 });
  to(lifeT, T('f16', '一遍') - 0.2, { backgroundColor: K.forest, duration: 0.35 });
  const LIFE = [['注册', K.forest, '注册'], ['进文件', K.forest, '注册'], ['被找到', K.forest, '注册'], ['42 → 43', K.forest, '注销'], ['注销', K.red, '注销']];
  LIFE.forEach(([txt, col, w], i) => {
    const x = 400 + i * 280;
    const e = h('div', 'abs', world, txt); px(e, x, 380, 220, 56); css(e, { font: '700 28px/52px "Sans SC"', color: '#FFFFFF', textAlign: 'center', background: col, border: '2px solid ' + col, borderRadius: '10px' });
    const t = T('f16', w) - 0.25 + (w === '注册' ? i * 0.3 : (i - 3) * 0.35);
    show(e, t, { x: -14, y: 0, d: 0.4 });
    if (i) { const a = link(ov, [[x - 56, 408], [x - 8, 408]], i === 4 ? 'accent' : 'ink', { w: 3, arrow: true }); arrowIn(a, t - 0.1, 0.3); }
  });
});
