// 多长算快（72.0–81.6 秒）：对数刻度的尺度尺。琥珀指针随旁白移到各个例子；「继续生成」的长条从琥珀块之后长出来。规格：第 3.6 节。
// 指针是为了让每一次画面变化都对应一句旁白（F20），也使静止段不超过 2.5 秒（scan.js 的 STILL）。
scene('scale', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  cam.cut(s.start, { x: 960, y: 484, z: 1 });
  const X = (v) => 240 + 380 * (Math.log10(v) + 1);      // 对数刻度：0.1 秒在 x240，每个十倍 380 像素
  const tS1 = T('s1', '聊天');
  const tS3 = T('s3', '深度');
  const c4 = L.cues['s4'].start;                          // 「首 Token 延迟短」开始
  const tE1 = Tend('s1');
  const lab = (cls, text, x, y, size) => { const e = txt(world, cls, text, x, y); if (size) css(e, { fontSize: size + 'px' }); return e; };

  wipe(lab('t-4', '首 Token 延迟的尺度', 240, 170), c0, { dir: 'l', d: 0.5 });
  appear(lab('eg', '对数刻度', 790, 176), c0 + 0.2);

  // 刻度线（y700）与刻度值（y726）
  const ax = h('div', 'ax', world); px(ax, 240, 700, 1520, 4); wipe(ax, c0, { dir: 'l', d: 0.8, ease: 'none' });
  [[0.1, '0.1'], [1, '1'], [10, '10'], [100, '100'], [1000, '1000 秒']].forEach(([v, text]) => {
    const tk = h('div', 'tk', world); px(tk, X(v) - 1.5, 704, 3, 16); appear(tk, c0 + 0.2);
    const lb = h('div', 'al', world, text); px(lb, X(v), 726); appear(lb, c0 + 0.2);
  });

  // 指针（琥珀细条，在刻度线上方）：聊天（0.35 秒附近）→ 深度思考（120 秒附近）→ 回到「首 Token」的例子
  const ptr = h('div', 'ptr', world); px(ptr, X(0.1) - 3, 652, 6, 48); appear(ptr, c0);
  move(ptr, tS1 - 0.2, X(0.1) - 3, 652, X(0.35) - 3, 652, 1.5, 'power2.inOut');
  move(ptr, tS3 - 0.3, X(0.35) - 3, 652, X(120) - 3, 652, 1.6, 'power2.inOut');
  move(ptr, c4, X(120) - 3, 652, X(0.35) - 3, 652, 1.0, 'power2.inOut');
  sfx('whoosh', tS1 - 0.2, { g: 0.3 }); sfx('whoosh', tS3 - 0.3, { g: 0.3 }); sfx('whoosh', c4, { g: 0.3 });   // 指针每移到下一个例子，一声轻的 whoosh

  // 第一排（y380–450）：0.2–0.5 秒的琥珀块（调得好的部署）；其后的「继续生成」长条（ink2，dim 字）
  const bBand = h('div', 'abs', world); px(bBand, X(0.1), 326, 0, 36); css(bBand, { background: PALETTE.paper });
  fromTo(bBand, tS1 - 0.1, { width: 0 }, { width: X(1) - X(0.1), duration: 1.1, ease: 'none' });
  wipe(lab('tag pp', '聊天：一秒以内算快', 240, 270, 38), tS1, { dir: 'l', d: 0.4 });
  sfx('pop', tS1, { g: 0.6 });
  const bAmb = h('div', 'stage gen', world); px(bAmb, X(0.2), 380, X(0.5) - X(0.2), 70);
  fromTo(bAmb, tS1 + 1.4, { width: 0 }, { width: X(0.5) - X(0.2), duration: 0.5, ease: 'power2.out' });
  sfx('blip', tS1 + 1.4, { g: 0.6 });
  wipe(lab('tag ac', '调得好的部署：0.2–0.5 秒', X(0.2), 462, 34), tS1 + 1.6, { dir: 'l', d: 0.4 });
  const tEnd4 = Tend('s4');
  const bMore = h('div', 'stage net', world); px(bMore, X(0.5), 380, 1760 - X(0.5), 70);
  fromTo(bMore, c4 + 0.1, { width: 0 }, { width: 1760 - X(0.5), duration: (s.end - 0.4) - (c4 + 0.1), ease: 'none' });
  sfx('riser', c4 + 0.1, { g: 0.3 });                                  // 长条一直长：整段回答还在继续写   // 一直长到场景快结束：整段回答还在继续写，旁白说完后画面不停
  const lbMore = txt(world, 'tag', '继续生成', X(0.5) + 28, 396); css(lbMore, { font: '700 38px "Sans SC"', color: PALETTE.ink }); appear(lbMore, tEnd4 - 1.2); sfx('pop', tEnd4 - 1.2, { g: 0.5 });

  // 第二排（y530–590）：长输入（2–10 秒）与深度思考（40–360 秒）；标签在下方（y602）
  const bLong = h('div', 'stage pre', world); px(bLong, X(2), 530, X(10) - X(2), 60); fromTo(bLong, tS1 + 2.4, { width: 0 }, { width: X(10) - X(2), duration: 0.5, ease: 'power2.out' }); sfx('blip', tS1 + 2.4, { g: 0.5 });
  wipe(lab('tag pp', '输入很长：几秒', X(2), 602, 34), tS1 + 2.6, { dir: 'l', d: 0.4 });
  const bDeep = h('div', 'stage pre', world); px(bDeep, X(40), 530, X(360) - X(40), 60); fromTo(bDeep, tS3, { width: 0 }, { width: X(360) - X(40), duration: 0.5, ease: 'power2.out' });
  wipe(lab('tag pp', '深度思考（最高档）：40–360 秒', X(40) - 120, 602, 34), tS3 + 0.4, { dir: 'l', d: 0.4 });
  sfx('thud', tS3, { g: 0.6 });

  // 出处（三行，28px）：与「深度思考」同时带出，第二行是 Artificial Analysis 的快照
  ['数据：Artificial Analysis 榜单快照（2026-11-18）', '“首个答案 Token”含思考时间（方法说明）'].forEach((t, i) => {
    wipe(lab('tag pp', t, 240, 800 + i * 38, 28), tS3 + 0.8 + i * 1.2, { dir: 'l', d: 0.4 });
    sfx('tick', tS3 + 0.8 + i * 1.2, { g: 0.4 });
  });
});
