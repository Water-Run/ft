// 它从哪来：一条版本的「磁带」，五站：1990、HTTP/1.0、HTTP/1.1、HTTP/2、HTTP/3。每站一块屏，屏上是那一版响应里报结果的那一行。
// 主画面：同一个 404 沿磁带走过各版本——1990 年那一格是空的（只有文件）；之后状态行包住文件；到 HTTP/2、HTTP/3 换成 :status 伪头，
// 码还是那个 404，而且在等宽字里落在同一列。出处：RFC 1945 §4.1、§6.1、§9.4；RFC 9113 §8.3.2；RFC 9114 §4.3.2（FACTS 05-13 至 05-15）。
scene('history', ({ root, s }) => {
  const world = h('div', 'world', root);
  css(world, { width: '3800px' });
  const cam = makeCamera(world, 1920, VH);
  const PITCH = 720, CX = (i) => 400 + i * PITCH, SY = 220, SW = 600, SH = 340, TY = 640;
  const ST = [
    { y: '1990', v: 'HTTP/0.9', rfc: '', line: null },
    { y: '1996', v: 'HTTP/1.0', rfc: 'RFC 1945', line: 'HTTP/1.0 <span class="sc">404</span> Not Found' },
    { y: '1997', v: 'HTTP/1.1', rfc: 'RFC 2068', line: esc(E('404').status[0]).replace(' 404 ', ' <span class="sc">404</span> ') },
    { y: '2015', v: 'HTTP/2', rfc: 'RFC 7540', line: ':status: <span class="sc">404</span>' },
    { y: '2022', v: 'HTTP/3', rfc: 'RFC 9114', line: ':status: <span class="sc">404</span>' },
  ];
  // 磁带：一条墨色的带子，五站各有一道刻度与年份
  const tape = blk(world, 'bg-ink', 0, TY, 3800, 84); tape.dataset.name = tr('版本磁带', 'version tape');
  for (let x = 20; x < 3800; x += 40) blk(world, 'bg-case2', x, TY + 6, 4, 10);
  const stations = ST.map((d, i) => {
    const cx = CX(i);
    const scr = screen(world, cx - SW / 2, SY, SW, SH, d.v);
    const yr = txt(world, 'px amber', d.y, cx - 150, TY + 6); css(yr, { fontSize: '100px', width: '300px', textAlign: 'center' });
    const vl = txt(world, 'ink', d.v, cx - SW / 2, TY + 104); css(vl, { font: '800 52px/1 "Inter"' });
    const rf = d.rfc ? txt(world, 'mono mute', d.rfc, cx - SW / 2, TY + 168) : null; if (rf) rf.style.fontSize = '38px';
    // 文件：屏下半部的一页纸
    const page = blk(scr, 'bg-case', 40, 150, 170, 150); page.dataset.name = tr('文件', 'file');
    for (let k = 0; k < 4; k++) blk(page, 'bg-case2', 18, 24 + k * 28, k === 3 ? 80 : 134, 12);
    const ln = d.line ? addLine(scr, d.line, 40, 58, 40) : null;
    return { cx, scr, yr, vl, rf, page, ln, sc: ln ? ln.querySelector('.sc') : null };
  });

  // h1：1990，只有文件；报结果的那一格是空的
  const s0 = stations[0];
  const t90 = Q(T('h1', { zh: '一九九零', en: '1990' }) - 0.1);
  slam(s0.yr, t90, { from: 1.3, d: 0.35 }); sfx('thud', t90, { g: 0.7, p: -0.5 });
  const tFile = Q(Math.min(T('h1', { zh: '文件', en: 'files' }) - 0.15, T('h1', 'HTTP') - 0.1));
  slide(s0.page, tFile, { x: -60, d: 0.4 }); sfx('pop', tFile, { g: 0.6, p: -0.5 });
  const slot = h('div', 'abs', s0.scr); px(slot, 34, 50, 530, 66); css(slot, { border: '4px dashed ' + C.dima });
  slot.dataset.name = tr('空着的一行', 'empty line');
  const none = addLine(s0.scr, tr('没有状态码', 'no status code'), 56, 60, 40, 'err');
  css(none, { fontFamily: '"Sans SC", "Inter"', fontWeight: 800 });
  const tNone = Q(T('h1', { zh: '没有', en: 'no' }) - 0.1);
  wipe(slot, tNone, { dir: 'l', d: 0.35 }); wipe(none, tNone + 0.1, { dir: 'l', d: 0.35 });
  sfx('error', tNone, { g: 0.5, p: -0.5 });

  // h2：包成报文，加上这一行
  const s1 = stations[1];
  const tMsg = Q(T('h2') + 0.05);
  slam(s1.yr, tMsg - 0.35, { from: 1.3, d: 0.35 }); sfx('thud', tMsg - 0.35, { g: 0.6 });
  slide(s1.page, tMsg, { x: -SW, d: 0.5 });
  const frame = h('div', 'abs', s1.scr); px(frame, 22, 36, 556, 284); css(frame, { border: '4px solid ' + C.amber });
  frame.dataset.name = tr('报文', 'message');
  wipe(frame, tMsg + 0.25, { dir: 't', d: 0.4 }); sfx('pop', tMsg + 0.25, { g: 0.6 });
  const tLine = tMsg + 0.2;
  appear(s1.ln, tLine); sfx('beep', tLine, { g: 0.6 });
  meter(tLine, '404');

  // h3：1.1 → 2 → 3，一站一站过；码没改
  const tCam = Q(T('h3') - 0.1);
  const tV = [Math.max(tCam + 0.7, Q(T('h3', { zh: '一点一', en: 'one point one' }) - 0.1)), 0, Q(T('h3', { zh: 'H T T P 三', en: 'H T T P three' }) - 0.1)];
  tV[2] = Math.max(tV[2], tV[0] + 0.7); tV[1] = (tV[0] + tV[2]) / 2;
  [2, 3, 4].forEach((i, k) => {
    const st = stations[i], t = tV[k];
    slam(st.yr, t, { from: 1.3, d: 0.3 });
    appear(st.page, t); appear(st.ln, t + 0.1);
    sfx('beep', t + 0.1, { g: 0.5, p: 0.2 * k });
  });
  const tSame = Q(T('h3', { zh: '码没改', en: 'codes' }) - 0.15);
  stations.slice(1).forEach((st) => classAt(st.sc, 'hotc', tSame));
  sfx('chime', tSame, { g: 0.7 });
  const same = txt(world, 't-3 ink', tr('码没改', 'same code'), CX(3) - SW / 2, SY - 120);
  wipe(same, Math.min(tSame + 0.1, Q(T('h3', { zh: '版本', en: 'versions' }) - 0.1)), { dir: 'l', d: 0.35 });

  // 镜头：1990、1996 两站并排 → 移到 1997、2015、2022 三站，三行里的 404 落在同一列
  const cy = 500;
  cam.track(s.start, { x: CX(0) + 180, y: cy, z: 1 }, [            // 1990 与 1996 两站同在画面里：先「没有」，再「加上」
    [s.start + 0.2, { x: CX(0) + 330 }, Math.max(0.3, tCam - s.start - 0.25), { ease: 'none', sfx: false }],
    [tCam, { x: CX(3), y: 480, z: 0.8 }, 0.9, { g: 0.4 }],
    [tCam + 0.95, { z: 0.83 }, Math.max(0.3, s.end + 0.3 - tCam - 0.95), { ease: 'none', sfx: false }],
  ]);
});
