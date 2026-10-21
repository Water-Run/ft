// 02 原理：退了房，房卡没作废。
// 主画面：一条「工作进程」的走廊。访问一位接一位进来，每位分到一间「内存」房；
// 上一位被中途打断，房间收回了，房卡却还在，下一位拿着旧房卡开门。然后是修复、补丁里的「置空」、14 年。
scene('how', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  screenGrid(world);
  const cam = makeCamera(world);

  // 第一站：走廊与访问
  const title = h('div', 'abs t-note', world, tr('PHP 工作进程', 'A PHP worker process')); px(title, 160, 160);
  const lane = h('div', 'lane', world); px(lane, 160, 470, 1600);
  const r1 = h('div', 'req', world, tr('访问 #1', 'request #1')); px(r1, 300, 300);
  const r2 = h('div', 'req', world, tr('访问 #2', 'request #2')); px(r2, 300, 300);
  const room = h('div', 'mem', world, tr('内存', 'memory')); px(room, 1100, 560); room.dataset.name = '内存房间';
  const card = h('div', 'keycard', world, tr('房卡', 'key card')); px(card, 640, 610); card.dataset.name = '房卡';
  appear(title, s.start + 0.5);
  fromTo(lane, s.start + 0.5, { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.6, ease: 'power3.inOut' });
  slide(r1, T('b2') + 0.1, { x: -400, d: 0.5 }); sfx('whoosh', T('b2') + 0.1, { g: 0.4, p: -0.4 });
  wipe(room, T('b4', { zh: '内存', en: 'memory' }), { dir: 'b', d: 0.4 }); sfx('pop', T('b4', { zh: '内存', en: 'memory' }), { p: 0.3 });
  slide(card, T('b4', { zh: '内存', en: 'memory' }, 0.25), { y: 40, d: 0.35 });
  // 「意外中断」：内存用超，#1 被打断
  const oom = h('div', 'abs stamp', world, tr('内存用超 · 中途打断', 'Out of memory · cut off')); px(oom, 260, 760);
  classAt(r1, 'bad', T('b6', { zh: '用超', en: 'runs' }));
  slam(oom, T('b6', { zh: '用超', en: 'runs' }), { from: 1.6, d: 0.28 }); sfx('error', T('b6', { zh: '用超', en: 'runs' }));
  fromTo(r1, T('b2') + 0.7, { x: 0 }, { x: 360, duration: T('b7', { zh: '收回', en: 'freed' }) - T('b2') - 0.8, ease: 'none', immediateRender: false });   // 访问沿走廊往前走
  exit(r1, T('b7', { zh: '收回', en: 'freed' }), { x: 360, y: 220, d: 0.5 }); hide(oom, T('b7', { zh: '收回', en: 'freed' }), { d: 0.3 });
  // 房间收回了，房卡还在
  const tFree = T('b7', { zh: '收回', en: 'freed' });
  const tOpen = T('b10', { zh: '开门', en: 'door' });
  keyed(room).at(tFree, { html: tr('已收回', 'freed'), cls: 'mem freed' }).at(tOpen, { html: tr('已不是原来的房间', 'not the old room'), cls: 'mem evil' });
  sfx('tick', tFree, { p: 0.3 });
  const still = h('div', 'abs t-body amber', world, tr('房卡还指着它 →', 'still points to it →')); px(still, 600, 800);
  show(still, T('b7', { zh: '指着', en: 'points' }), { x: -30 });
  const big = h('div', 'abs d-3', world, tr('退了房，房卡却没有作废', 'Checked out — key card still works')); px(big, 160, 200);
  slam(big, T('b8'), { from: 1.2, d: 0.4 }); sfx('thud', T('b8') + 0.1);
  // 下一位拿着旧房卡开门
  slide(r2, T('b9') + 0.1, { x: -400, d: 0.5 }); sfx('whoosh', T('b9') + 0.1, { g: 0.4, p: -0.4 });
  to(card, T('b10', { zh: '旧房卡', en: 'old' }), { x: 240, duration: 0.6, ease: 'power2.inOut' });
  sfx('error', tOpen, { p: 0.3 });
  const ctrl = h('div', 'abs stamp', world, tr('服务器可能被人控制', 'Server can be taken over')); px(ctrl, 1040, 820);
  slam(ctrl, T('b10', { zh: '服务器', en: 'server' }), { from: 1.5, d: 0.3 }); sfx('thud', T('b10', { zh: '服务器', en: 'server' }, 0.05));
  hide(still, tOpen, { d: 0.2 });

  // 第二站：修复
  const X = 2000;
  const fixHead = h('div', 'abs t-note', world, tr('PHP 官方修复 · 8.5.12 / 8.4.27 / 8.3.36 / 8.2.35', 'The fix · 8.5.12 / 8.4.27 / 8.3.36 / 8.2.35')); px(fixHead, X + 160, 160);
  const f1 = h('div', 'abs t-body', world, tr('<span class="okbox"></span>内存超限：不再中途跳出，安全收尾', '<span class="okbox"></span>Out of memory: no more bailing out mid-way')); px(f1, X + 160, 260);
  const f2 = h('div', 'abs t-body', world, tr('<span class="okbox"></span>每次访问结束：旧记录统统清零', '<span class="okbox"></span>After every request: reset the old records')); px(f2, X + 160, 340);
  const diff = h('div', 'diff', world, `<span class="ctx">efree(SG(request_info).auth_user);</span>\n<span class="add">+ SG(request_info).auth_user = NULL;</span>`); px(diff, X + 160, 520);
  diff.dataset.name = '补丁片段';
  const diffNote = h('div', 'abs t-note', world, tr('php-src · main/SAPI.c', 'php-src · main/SAPI.c')); px(diffNote, X + 170, 720);
  const toFix = Tend('b10') + 0.4;
  appear(fixHead, toFix);
  slide(f1, T('b14'), { x: -50 }); sfx('chime', T('b14') + 0.1, { g: 0.6 });
  slide(f2, T('b15'), { x: -50 }); sfx('pop', T('b15') + 0.1);
  wipe(diff, T('b16'), { dir: 'l', d: 0.4 }); sfx('tick', T('b16'));
  const addLine = diff.querySelector('.add');
  fromTo(addLine, T('b16', { zh: '置空', en: 'NULL' }, -0.4), { opacity: 0 }, { opacity: 1, duration: 0.25 }); sfx('blip', T('b16', { zh: '置空', en: 'NULL' }, -0.4));
  show(diffNote, T('b16') + 0.3, { y: 10 });

  // 第三站：2012 → 2026，14 年
  const Y = 1300;
  const rail = h('div', 'rail', world); px(rail, X + 200, Y + 520, 1500);
  const n1 = h('div', 'node', world); px(n1, X + 187, Y + 510);
  const n2 = h('div', 'node red', world); px(n2, X + 1687, Y + 510);
  const y1 = h('div', 'abs d-2 php', world, '2012'); px(y1, X + 140, Y + 330);
  const y1n = h('div', 'abs t-body', world, tr('PHP 5.4 · 加入「上传进度」功能（缺省开启）', 'PHP 5.4 · adds “upload progress” (on by default)')); px(y1n, X + 150, Y + 580);
  const y2 = h('div', 'abs d-2 red', world, '2026'); px(y2, X + 1560, Y + 330);
  const years = h('div', 'abs d-0', world, '0'); px(years, X + 760, Y + 230); years.dataset.name = '年数';
  const yrsU = h('div', 'abs d-2', world, tr('年', 'years')); px(yrsU, X + 1080, Y + 320);
  const who1 = h('div', 'abs t-note', world, tr('功能作者：Arnaud Le Blanc（2008 年的提案）', 'Feature author: Arnaud Le Blanc (2008 RFC)')); px(who1, X + 150, Y + 660);
  const who2 = h('div', 'abs t-note', world, tr('修复提交作者：Arnaud Le Blanc', 'Fix commit author: Arnaud Le Blanc')); px(who2, X + 1100, Y + 660);
  const toYears = Tend('b16') + 0.2;
  appear(rail, toYears); appear(n1, toYears);
  slam(y1, T('b17', { zh: '从', en: 'since' }, 0.1), { from: 1.3 }); sfx('thud', T('b17', { zh: '从', en: 'since' }, 0.15), { p: -0.5 });
  slide(y1n, T('b18'), { y: 20 }); sfx('pop', T('b18') + 0.1, { p: -0.4 });
  const tY = T('b19');
  fromTo(rail, tY, { background: '#262b52' }, { background: '#ff3b3b', duration: 1.0 });
  appear(n2, tY + 0.9); slam(y2, tY + 0.9, { from: 1.3 }); sfx('thud', tY + 0.95, { p: 0.5 });
  appear(years, tY); appear(yrsU, tY);
  countTo(years, 0, 14, tY, 1.0, (v) => String(Math.round(v)));
  show(who1, T('b20'), { y: 14 }); show(who2, T('b21'), { y: 14 }); sfx('tick', T('b21') + 0.1, { p: 0.4 });

  const toYrs = toYears;
  cam.track(s.start, { x: 960, y: 540, z: 1 }, [
    [s.start + 0.1, { x: 1020, z: 1.14 }, T('b8') - s.start - 0.4, { ease: 'none', sfx: false }],
    [T('b8') - 0.2, { x: 1000, y: 560, z: 1.2 }, 0.9, { sfx: false }],
    [Tend('b8') + 0.1, { x: 960, y: 560, z: 1 }, 0.7, { sfx: false }],
    [null, { x: 1040, z: 1.06 }, toFix - Tend('b8') - 1.0, { ease: 'none', sfx: false }],
    [toFix, { x: X + 960, y: 540, z: 1 }, 1.0],
    [null, { z: 1.04 }, toYrs - toFix - 1.2, { ease: 'none', sfx: false }],
    [toYrs, { x: X + 960, y: Y + 480, z: 1 }, 1.0],
    [null, { x: X + 1040, z: 1.14 }, s.end - toYrs - 1.2, { ease: 'none', sfx: false }],
  ]);
});
