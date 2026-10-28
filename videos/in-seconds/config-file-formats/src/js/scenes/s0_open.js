// 第 1 幕：服务器的端口写在外面的文件里 → 改文件里的数字，服务器就换了端口 → 这种文件叫配置文件 → INI：方括号分章节、等号写键值，但只有一层。
const W = (id, w, sh = 0) => Qf(T(id, w, sh));
const hold = (cam, s, dir = 1, from = s.start + 0.9) => {   // 停留：只朝一个方向极慢横移（一屏合计不超过 48 像素）
  const d = s.end - from - 0.1, dx = Math.min(48, 2 * d) * dir;
  cam.track(from, { x: 960, y: 484, z: 1 }, [[from + 0.05, { x: 960 + dx }, d, { ease: 'none', sfx: false }]]);
};
scene('open', ({ root, s }) => {
  const { world, cam } = stage(root, s, { server: false, slab: false });

  // ── o1：一台服务器，端口 80 ──
  const srv = serverBox(world, '80', false);
  tl.fromTo(srv.b, { autoAlpha: 0, x: -700, rotation: -8 }, { autoAlpha: 1, x: 0, rotation: 0, duration: 0.5, ease: 'power4.out', immediateRender: true }, s.start + 0.05);
  sfx('thud', s.start + 0.45, { g: 0.9, p: -0.4 }); shake(root, s.start + 0.45, 10);
  const tP = W('o1', '参数');
  tl.fromTo(srv.v, { scale: 1 }, { keyframes: [{ scale: 1.25, duration: 0.12 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' }], transformOrigin: '0% 80%', immediateRender: false }, tP);
  sfx('pop', tP, { g: 0.7 });
  const lP = tag(world, 'r', '参数：端口号', SRV.x, SRV.y + SRV.h + 24); stamp(lP, tP + 0.1);
  // 不需要：改源码再编译的那条路被划掉
  const old = tag(world, 'o', '改源码 → 重新编译 → 重启', SRV.x, SRV.y + SRV.h + 100);
  const tNo = W('o1', '不需要');
  stamp(old, tNo - 0.1, { g: 0.4 });
  const x1 = slash(world, SRV.x - 20, SRV.y + SRV.h + 150, SRV.x + 560, SRV.y + SRV.h + 96, 14, 'bg-ac'); cut(x1, W('o1', '编译'), 0.25);
  shake(root, W('o1', '编译') + 0.25, 8);

  // ── o2：外面的一个纯文本；光标选中 80，改成 8080；红点沿线跑到服务器，服务器换成 8080 ──
  const tF = W('o2', '外面');
  const doc = makeDoc(world, null, 7);
  wipe(doc.slab, tF, { dir: 'r', d: 0.35 }); sfx('whoosh', tF, { g: 0.8 });
  const fname = tag(world, 'k', 'app.ini', DOC.x - 60, DOC.y - 112); stamp(fname, tF + 0.2);
  docType(doc, FMT.ini, tF + 0.25, 70);
  const pv = doc.toks.find((k) => k.id === 'port');
  const tTxt = W('o2', '纯文');
  const lT = tag(world, 'o', '纯文本', DOC.x + 560, DOC.y - 112); stamp(lT, tTxt, { g: 0.4 });
  const wire = blk(world, 'bg-ac', SRV.x + SRV.w, SRV.y + 176, DOC.x - 60 - SRV.x - SRV.w, 8); wipe(wire, tF + 0.3, { dir: 'r', d: 0.4 });
  const tCh = W('o2', '改掉'), tSel = W('o2', '里面'), tNum = W('o2', '数字');
  const caret = blk(world, 'bg-paper', pv.x + 2 * CWD + 4, pv.y - 4, 6, 54);
  tl.fromTo(caret, { autoAlpha: 0, x: -200 }, { autoAlpha: 1, x: 0, duration: 0.3, ease: 'power3.out', immediateRender: true }, tCh);
  classAt(pv.e, 'sel', tSel, tNum + 0.05); sfx('blip', tSel, { g: 0.6 });
  // 选中的 80 被替换：逐字敲进 8080
  const kp = keyed(pv.e).at(-1, { html: '80' });
  ['8', '80', '808', '8080'].forEach((v, i) => { kp.at(tNum + 0.05 + i * 0.1, { html: v }); sfx('key', tNum + 0.05 + i * 0.1, { g: 0.8 }); });
  tl.to(caret, { x: 2 * CWD, duration: 0.3, ease: 'steps(2)' }, tNum + 0.1);
  vanish(caret, tNum + 0.9);
  // 红点沿线跑回服务器
  const tGo = tNum + 0.6;
  const dot = blk(world, 'bg-ac', DOC.x - 90, SRV.y + 160, 40, 40);
  gsap.set(dot, { autoAlpha: 0 });
  tl.fromTo(dot, { autoAlpha: 1, x: 0 }, { x: SRV.x + SRV.w - DOC.x + 70, duration: 0.45, ease: 'power3.in', immediateRender: false }, tGo);
  vanish(dot, tGo + 0.46); sfx('whoosh', tGo, { g: 0.6, p: 0.4 });
  swapAt(srv.v, '80', '8080', tGo + 0.45);
  tl.fromTo(srv.v, { scale: 1.6 }, { scale: 1, duration: 0.35, ease: 'power4.out', transformOrigin: '0% 80%', immediateRender: false }, tGo + 0.45);
  sfx('thud', tGo + 0.45, { g: 1, p: -0.3 }); shake(root, tGo + 0.45, 14);
  const lNew = tag(world, 'k', '服务器重新读取，改用 8080', SRV.x, SRV.y + SRV.h + 24);
  tl.set(lP, { autoAlpha: 0 }, tGo + 0.45); stamp(lNew, tGo + 0.55);
  clearOut(old, tGo + 0.45); clearOut(x1, tGo + 0.45);

  // ── o3：这份外部文本叫配置文件 ──
  const tCfg = W('o3', '配置');
  const frame = h('div', 'abs', world); px(frame, DOC.x - 80, DOC.y - 70, 900, slabH(7) + 40); css(frame, { border: '14px solid var(--ac)' });
  wipe(frame, W('o3', '外部'), { dir: 'l', d: 0.3 }); sfx('pop', W('o3', '外部'), { g: 0.6 });
  const G0 = giant(world, '配置文件', { x: 100, y: 960, size: 120, grow: 1.22, rot: -7, cls: 'cn-giant ac' });
  giantIn(G0, tCfg, 0.11); shake(root, tCfg + 0.33, 12);

  // ── a1：服务器缩到左上角（一直连着这份文件）；INI 巨字撞进左半幅 ──
  const tA = W('a1');
  tl.to(srv.b, { x: DOCKED.x - SRV.x, y: DOCKED.y - SRV.y, scale: DOCKED.s, transformOrigin: '0 0', duration: 0.55, ease: 'power3.inOut' }, tA - 0.1);
  tl.to(wire, { left: DOCKED.x + SRV.w * DOCKED.s, top: DOCKED.y + SRV.h * DOCKED.s / 2 - 4, width: DOC.x - 60 - DOCKED.x - SRV.w * DOCKED.s, duration: 0.55, ease: 'power3.inOut' }, tA - 0.1);
  [lNew, lT, frame].forEach((e) => clearOut(e, tA - 0.1)); clearOut(G0.g, tA - 0.2);
  const G1 = giant(world, 'INI', { x: 150, y: 940, size: 300, grow: 1.28, rot: -10, cls: 'ink' });
  giantIn(G1, tA + 0.35, 0.13); shake(root, tA + 0.35, 14); shake(root, tA + 0.61, 10);
  const yr = tag(world, 'k', '1985 · Windows 1.0', 64, 310); stamp(yr, W('a1', 'Windows'));
  // 读到 I、N、I 时，巨字的三个字母依次跳一下；文件名一起亮
  [T('a1', 'I. N. I.'), T('a1', 'N. I. 文件'), T('a1', 'I. 文件')].forEach((t, i) => { tl.fromTo(G1.letters[i], { y: 0 }, { keyframes: [{ y: -60, duration: 0.1, ease: 'power2.out' }, { y: 0, duration: 0.22, ease: 'bounce.out' }], immediateRender: false }, t); sfx('tick', t, { g: 0.7, p: 0.2 * i }); });
  classAt(fname, 'r', T('a1', 'I. N. I.'), W('a2'));
  // 存放设置：文件逐行一闪，一个红点沿线送到服务器
  const tKeep = W('a1', '存放');
  doc.toks.forEach((k) => tl.fromTo(k.e, { x: 0 }, { keyframes: [{ x: 16, duration: 0.1 }, { x: 0, duration: 0.25 }], immediateRender: false }, tKeep + k.row * 0.07));
  const dA = blk(world, 'bg-ac', DOC.x - 90, DOCKED.y + SRV.h * DOCKED.s / 2 - 18, 36, 36); gsap.set(dA, { autoAlpha: 0 });
  tl.fromTo(dA, { autoAlpha: 1, x: 0 }, { x: DOCKED.x + SRV.w * DOCKED.s - DOC.x + 60, duration: 0.5, ease: 'power3.in', immediateRender: false }, tKeep + 0.6); vanish(dA, tKeep + 1.11);
  sfx('whoosh', tKeep + 0.6, { g: 0.5, p: 0.4 }); sfx('pop', tKeep + 1.1, { g: 0.6 });

  // ── a2：两样东西：巨大的 [ ] 与 = 先砸在左边，讲到哪个，哪个就飞进文件 ──
  const tSec = W('a2', '方括号'), tEq = W('a2', '等号');
  const gB = txt(world, 'giant ac', '[ ]', 380, 330), gE = txt(world, 'giant ink', '=', 700, 330);
  [gB, gE].forEach((e) => { e.style.fontSize = '170px'; e.dataset.overlapOk = '1'; });
  stamp(gB, W('a2', '两样'), { from: 1.6, g: 0.9 }); stamp(gE, W('a2', '两样') + 0.3, { from: 1.6, g: 0.9 });
  shake(root, W('a2', '两样') + 0.15, 10);
  tl.to(gB, { left: DOC.x - 40, top: DOC.y - 30, scale: 0.35, autoAlpha: 0, transformOrigin: '0 0', duration: 0.4, ease: 'power3.in' }, tSec - 0.3);
  tl.to(gE, { left: DOC.x + 4 * CWD, top: DOC.y + DOC.lh - 30, scale: 0.35, autoAlpha: 0, transformOrigin: '0 0', duration: 0.4, ease: 'power3.in' }, tEq - 0.3);
  classAt(doc.el, 'm-sec', tSec, W('a3'));
  const secRows = [0, 4].map((r) => { const b = blk(world, 'bg-ac', DOC.x - 60, DOC.y + r * DOC.lh - 8, 14, 62); tl.fromTo(b, { scaleY: 0 }, { scaleY: 1, duration: 0.2, ease: 'power3.out', immediateRender: true }, tSec + r * 0.04); return b; });
  sfx('thud', tSec, { g: 0.6 }); sfx('thud', tSec + 0.16, { g: 0.5, p: 0.2 });
  docFind(doc, (k) => k.row === 0 || k.row === 4).forEach((k) => tl.fromTo(k.e, { x: 0, scale: 1 }, { keyframes: [{ x: -40, scale: 1.35, duration: 0.18, ease: 'power3.out' }, { x: -40, scale: 1.35, duration: 0.9 }, { x: 0, scale: 1, duration: 0.3, ease: 'power3.inOut' }], transformOrigin: '0 50%', immediateRender: false }, tSec + k.row * 0.04));
  const lS = tag(world, 'r', '章节', DOC.x + 500, DOC.y - 6); stamp(lS, W('a2', '章节'));
  const lS2 = tag(world, 'r', '章节', DOC.x + 500, DOC.y + 4 * DOC.lh - 6); stamp(lS2, W('a2', '章节') + 0.15);
  classAt(doc.el, 'm-eq', tEq, W('a3'));
  docFind(doc, (k) => k.cls === 'p').forEach((k, i) => { tl.fromTo(k.e, { y: -120, scale: 2.4 }, { y: 0, scale: 1, duration: 0.22, ease: 'power4.in', immediateRender: false }, tEq + i * 0.12); sfx('tick', tEq + i * 0.12 + 0.2, { g: 0.6 }); });
  docFind(doc, (k) => k.cls === 'dv').forEach((k, i) => tl.fromTo(k.e, { x: 0 }, { keyframes: [{ x: 30, duration: 0.12 }, { x: 0, duration: 0.3, ease: 'back.out(3)' }], immediateRender: false }, tEq + 0.9 + i * 0.1));
  const lK = tag(world, 'r', '键 = 值', DOC.x + 500, DOC.y + DOC.lh * 2 - 6); stamp(lK, W('a2', '键值'));

  // ── a3：一行一行读下去：谁都能看懂 ──
  const tRead = W('a3');
  [lS, lS2, lK].forEach((e) => clearOut(e, tRead));
  const mark = h('div', 'abs', world); px(mark, DOC.x - 40, DOC.y - 10, 820, 66); css(mark, { border: '6px solid #F0553F' });
  [0, 1, 2, 4, 5, 6].forEach((r, i) => tl.fromTo(mark, { y: (i ? [0, 1, 2, 4, 5, 6][i - 1] : 0) * DOC.lh }, { y: r * DOC.lh, duration: 0.18, ease: 'power2.inOut', immediateRender: i === 0 }, tRead + 0.1 + i * 0.25)); appear(mark, tRead + 0.1);
  vanish(mark, tRead + 1.8);
  const easy = tag(world, 'k', '打开就能读、能改', DOC.x - 60, DOC.y + slabH(7) - 20); stamp(easy, W('a3', '看懂'));

  // ── a4：只有平铺的一层；[db] 想塞进 [server] 里面，被顶回来 ──
  const tFlat = W('a4', '平铺');
  const rule = blk(world, 'bg-ac', DOC.x - 14, DOC.y - 20, 10, 7 * DOC.lh); tl.fromTo(rule, { scaleY: 0 }, { scaleY: 1, transformOrigin: '50% 0', duration: 0.4, ease: 'power3.out', immediateRender: true }, tFlat);
  const one = tag(world, 'r', '全在同一层', DOC.x + 500, DOC.y + 3 * DOC.lh - 20); stamp(one, tFlat + 0.2);
  clearOut(easy, tFlat);
  const tPush = W('a4b', '一层套');
  const dbToks = docFind(doc, (k) => k.row >= 4);
  dbToks.forEach((k) => tl.fromTo(k.e, { x: 0, y: 0 }, { keyframes: [{ x: 2 * CWD, y: -1.6 * DOC.lh, duration: 0.35, ease: 'power3.in' }, { x: -10, y: 30, duration: 0.3, ease: 'back.out(3)' }, { x: 0, y: 0, duration: 0.25 }], immediateRender: false }, tPush));
  secRows.forEach((b) => tl.to(b, { autoAlpha: 0, duration: 0.1 }, tPush));
  sfx('thud', tPush + 0.35, { g: 1, p: -0.4 }); shake(root, tPush + 0.35, 16);
  const no = tag(world, 'r big', '套不进去', DOC.x + 420, DOC.y + 5 * DOC.lh); stamp(no, W('a4b', '装不下'), { g: 0.9 });
  slabIn(root, s.end);
  hold(cam, s, 1, Math.max(s.start + 0.2, W('a4b', '装不下') + 0.6));
});
