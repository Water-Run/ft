// 第 1 幕：改参数不必重编译 → 配置文件 → INI。一条斜线把版面切成「代码」（黑）与「外面的文本」（纸），之后 INI 的巨字撞进来。
const W = (id, w, sh = 0) => Qf(T(id, w, sh));
const hold = (cam, s, dir = 1) => {   // 停留：只朝一个方向极慢横移（一屏合计不超过 48 像素）
  const d = s.end - s.start - 0.2, dx = Math.min(48, 2 * d) * dir;
  cam.track(s.start, { x: 960 - dx / 2, y: 484, z: 1 }, [[s.start + 0.1, { x: 960 + dx / 2 }, d, { ease: 'none', sfx: false }]]);
};
scene('open', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  blk(world, 'bg-paper', -100, -100, 2120, 1170);

  // ── o1：黑色半区里是程序，纹丝不动；「重新编译」被划掉 ──
  const A = h('div', 'abs', world); px(A, 0, 0, 1920, 968);
  const half = poly(A, [[0, 0], [760, 0], [1240, 968], [0, 968]], 'ink');
  wipe(half, s.start, { dir: 'l', d: 0.45 }); sfx('whoosh', s.start, { g: 0.6 });
  hudGround('L', s.start + 0.2, T('a1') + 0.3, 'ink');
  const src = code(A, `<span class="d">// main.c</span>\nint main(void) {\n    int <span class="r">port</span> = load("app.conf");\n    serve(<span class="r">port</span>);\n}`, 110, 190, 40, 'paper ink-on');
  wipe(src, s.start + 0.25, { dir: 't', d: 0.5 }); sfx('tick', s.start + 0.3, { g: 0.6 });
  const tP = W('o1', '参数');
  const lab1 = tag(A, 'r', '参数', 110, 120); stamp(lab1, tP);
  const comp = txt(A, 'say paper', '重新编译', 110, 520);
  const tNo = W('o1', '不需要');
  appear(comp, tNo - 0.25);
  const strike = blk(A, 'bg-ac', 96, 552, 300, 20); strike.dataset.overlapOk = '1';
  tl.fromTo(strike, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.25, ease: 'power3.in', immediateRender: true }, tNo + 0.15); sfx('thud', tNo + 0.4, { g: 0.6 });
  const no = txt(A, 'tag r', '不用', 420, 532); stamp(no, tNo + 0.45);

  // ── o2：外面的纯文本斜切进来；80 改成 8080 ──
  const F1 = h('div', 'abs bg-ac', A); px(F1, 1080, 120, 720, 400); gsap.set(F1, { rotation: -6 });
  const tF = W('o2', '外面');
  wipe(F1, tF, { dir: 'r', d: 0.4 }); sfx('whoosh', tF, { g: 0.7 });
  const fname = txt(F1, 'tag k', 'app.conf', 40, 36);
  const kv = code(F1, 'port = <span class="num">80</span>', 40, 160, 96, 'paper');
  const tTxt = W('o2', '纯文');
  const plain = tag(A, 'k', '纯文本', 1500, 560); stamp(plain, tTxt);
  const num = kv.querySelector('.num');
  const tCh = W('o2', '改掉');
  swapAt(num, '80', '8080', tCh + 0.2);
  tl.fromTo(num, { scale: 1 }, { keyframes: [{ scale: 1.25, duration: 0.12 }, { scale: 1, duration: 0.25 }], transformOrigin: '0% 70%', immediateRender: false }, tCh + 0.2);
  sfx('pop', tCh + 0.2, { g: 0.8 });
  const arrow = txt(A, 'note', '程序下次读取时生效', 1500, 640); wipe(arrow, Q(Tend('o2')), { dir: 'l', d: 0.4 });

  // ── o3：「配置文件」四个字沿斜线逐字放大 ──
  const tCfg = W('o3', '配置');
  const G0 = giant(A, '配置文件', { x: 860, y: 965, size: 150, grow: 1.26, rot: -9, cls: 'cn-giant ac' });
  giantIn(G0, tCfg);
  clearOut(arrow, tCfg - 0.2); clearOut(plain, tCfg - 0.2);

  // ── a1：一条红线斜切清场，INI 撞进左半屏 ──
  const tA = W('a1');
  const red = slash(world, -100, 1040, 2100, -120, 34, 'bg-ac'); cut(red, tA - 0.3, 0.3);
  clearOut(A, tA);
  const B = h('div', 'abs', world); px(B, 0, 0, 1920, 968);
  const G1 = giant(B, 'INI', { x: 70, y: 1000, size: 330, grow: 1.32, rot: -10, cls: 'ink' });
  giantIn(G1, tA + 0.1, 0.12);
  const yr = tag(B, 'k', '1985 · Windows 1.0', 120, 150); stamp(yr, W('a1', 'Windows'));
  const what = txt(B, 'note', '用 .ini 文件存放设置', 120, 220); wipe(what, W('a1', '存放'), { dir: 'l', d: 0.35 });

  // ── a2：方括号分出章节，等号写出键值 ──
  const sec = h('div', 'abs bg-ac', B); px(sec, 1000, 200, 520, 120);
  const secT = code(sec, '[server]', 34, 8, 84, 'paper');
  const tSec = W('a2', '方括号');
  wipe(sec, tSec, { dir: 'l', d: 0.3 }); sfx('pop', tSec, { g: 0.7 });
  const lS = tag(B, 'o', '章节', 1560, 236); stamp(lS, tSec + 0.3, { g: 0.4 });
  const rows = ['port = 8080', 'host = localhost', 'workers = 4'].map((r, i) => code(B, r.replace(' = ', ' <span class="r">=</span> '), 1030, 360 + i * 96, 68, 'ink'));
  const tEq = W('a2', '等号');
  stamp(rows[0], tEq);
  const lK = tag(B, 'o', '键 = 值', 1560, 372); stamp(lK, tEq + 0.3, { g: 0.4 });

  // ── a3：再盖两行，木刻活字一样 ──
  const tSimple = W('a3');
  stamp(rows[1], tSimple + 0.1); stamp(rows[2], tSimple + 0.45);

  // ── a4：[db] 想塞进 [server] 里面，被顶回去 ──
  const db = h('div', 'abs bg-ink', B); px(db, 1240, 640, 240, 96); code(db, '[db]', 30, 6, 70, 'paper');
  const tIn = W('a4');
  tl.fromTo(db, { autoAlpha: 0, x: 600 }, { autoAlpha: 1, x: 0, duration: 0.4, ease: 'power3.out', immediateRender: true }, tIn);
  const tPush = W('a4b', '一层套');
  tl.to(db, { keyframes: [{ x: -170, y: -340, duration: 0.3, ease: 'power3.in' }, { x: 160, y: 0, rotation: 8, duration: 0.45, ease: 'back.out(2.4)' }] }, tPush);
  tl.to(sec, { keyframes: [{ x: -14, duration: 0.08, delay: 0.3 }, { x: 0, duration: 0.25, ease: 'back.out(3)' }] }, tPush);
  sfx('thud', tPush + 0.3, { g: 0.9, p: -0.2 });
  const flat = tag(B, 'r', '只有一层', 1030, 820); stamp(flat, W('a4b', '装不下'), { g: 0.8 });
  hold(cam, s, 1);
});
