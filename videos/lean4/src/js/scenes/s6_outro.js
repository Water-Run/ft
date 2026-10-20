// 片尾（192–200 秒）：主题词、一句话的概括、制作名单与开源仓库地址。名单出处见 research/FACTS.md「制作署名」。
// 左下是开场那个 4×4 的方点阵，旁边是右上角读数的放大：片子结束时停在 200² = 40 000。
scene('outro', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  blk(world, 'bg-ink', -200, -200, 2320, 1400);
  const t0 = s.start + 0.35;
  const big = txt(world, '', 'Lean 4', 92, 96); css(big, { font: '900 250px "Inter"', letterSpacing: '-.04em', lineHeight: '1' });
  const line = txt(world, 't-3 ac', tr('每一步，都由内核检查', 'Every step, checked by the kernel'), 108, 392); if (LANG !== 'zh') line.style.fontSize = '50px';
  const ser = txt(world, 't-n dim', tr('XX 秒速通 · 200 秒了解 Lean 4：什么是形式化证明，以及它为什么可靠', 'In XX Seconds · Lean 4 in 200 Seconds'), 110, 852); ser.style.fontSize = tr('26px', '28px');
  slam(big, t0, { from: 1.2, d: 0.4 }); sfx('thud', t0, { g: 0.8, p: -0.3 });
  wipe(line, t0 + 0.25, { dir: 'l', d: 0.4 }); wipe(ser, t0 + 0.6, { dir: 'l', d: 0.4 });
  // 开场的方点阵与此刻的读数
  const dots = dotSquare(world, 4, { x: 112, y: 540, pitch: 62, cell: 55 });
  dots.rings.forEach((g, r) => { [...g.children].forEach((c, j) => appear(c, t0 + 0.3 + r * 0.12 + j * 0.02)); if (r === 3) g.classList.add('hot'); });
  const live = txt(world, 'num', '', 400, 606); css(live, { fontSize: '64px', letterSpacing: '-.03em' });
  let last = null; F((t) => { const n = nAt(t), v = `${n}<sup>2</sup> = ${group3(SUMS[n])}`; if (v !== last) { live.innerHTML = v; last = v; } });
  wipe(live, t0 + 0.7, { dir: 'l', d: 0.4 });
  const ll = txt(world, 't-n dim', tr('逐个试到这里；证明覆盖所有的 n', 'Tested this far; proved for every n'), 404, 694); ll.style.fontSize = '28px'; wipe(ll, t0 + 0.95, { dir: 'l', d: 0.4 });
  const rows = [
    [tr('策划', 'Planning'), 'WaterRun'],
    [tr('取证 · 脚本 · 翻译 · 视觉 · 动画 · 配乐 · 审查', 'Research · script · translation · design · animation · score · review'), 'Claude Opus 5.5'],
    [tr('旁白合成', 'Narration voice'), tr('Microsoft Edge 在线语音（模型未披露）', 'Microsoft Edge online TTS (model undisclosed)')],   // lint-ok: 这里的 Microsoft 是服务名，不是字体
    [tr('读音回听', 'Read-back check'), 'Whisper small'],
    [tr('网页检索与摘录', 'Web lookup'), tr('WebSearch · WebFetch（模型未披露）', 'WebSearch · WebFetch (model undisclosed)')],
    [tr('收尾 · 复核 · 出片', 'Final review · finishing'), 'GPT-6 · Codex'],
    [tr('开源视频', 'Open-source video'), 'github.com/Water-Run/ft'],
  ];
  rows.forEach(([k, v], i) => {
    const y = 104 + i * 108, lastRow = i === rows.length - 1;
    const rule = blk(world, lastRow ? 'bg-ac' : 'bg-paper', 1000, y, 820, lastRow ? 6 : 3);
    const a = txt(world, 't-n dim', k, 1000, y + 14); a.style.fontSize = LANG === 'zh' ? '28px' : '26px';
    const b = txt(world, (lastRow ? 'mono ac' : '') + ' t-4', v, 1000, y + 52); if (lastRow) b.style.fontWeight = 700; if (LANG !== 'zh' && v.length > 34) b.style.fontSize = '38px';
    const tt = t0 + 0.2 + i * 0.1;
    fromTo(rule, tt, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.35, ease: 'power3.out' });
    wipe(a, tt + 0.05, { dir: 'l', d: 0.3 }); wipe(b, tt + 0.12, { dir: 'l', d: 0.35 });
    sfx(lastRow ? 'chime' : 'tick', tt, { g: lastRow ? 0.6 : 0.7, p: 0.4 });
  });
  cam.track(s.start, { x: 960, y: 484, z: 1 }, [[s.start + 0.1, { z: 1.03 }, s.end - s.start - 0.2, { ease: 'none', sfx: false }]]);
});
