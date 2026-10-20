// 片尾（112.5–120 秒）：片名、一句话、制作名单与开源仓库地址。名单出处见 research/FACTS.md「制作署名」。
scene('outro', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  blk(world, 'bg-ink', -200, -200, 2320, 1400);
  const t0 = s.start + 0.35;
  const big = txt(world, '', '2FA', 92, 96); css(big, { font: '900 330px "Inter"', letterSpacing: '-.04em', lineHeight: '1' });
  const line = txt(world, 't-3 ac', tr('同一个密钥，同一个时钟', 'Same key. Same clock.'), 108, 452);
  const ser = txt(world, 't-n dim', tr('XX 秒速通 · 120 秒关于什么是 2FA，以及它是怎么工作的', 'In XX Seconds · 2FA in 120 Seconds: What It Is and How It Works'), 110, 848); ser.style.fontSize = '28px';
  slam(big, t0, { from: 1.2, d: 0.4 }); sfx('thud', t0, { g: 0.8, p: -0.3 });
  wipe(line, t0 + 0.25, { dir: 'l', d: 0.4 }); wipe(ser, t0 + 0.6, { dir: 'l', d: 0.4 });
  makeDial(world, { x: 330, y: 680, r: 96, sw: 4, color: C.paper });
  makeCode(world, { size: 84, x: 470, y: 640 });
  const rows = [
    [tr('策划', 'Planning'), 'WaterRun'],
    [tr('取证 · 脚本 · 翻译 · 视觉 · 动画 · 配乐 · 审查', 'Research · script · translation · design · animation · score · review'), 'Claude Opus 5.5'],
    [tr('旁白合成', 'Narration voice'), tr('Microsoft Edge 在线语音（模型未披露）', 'Microsoft Edge online TTS (model undisclosed)')],   // lint-ok: 这里的 Microsoft 是服务名，不是字体
    [tr('读音回听', 'Read-back check'), 'Whisper small'],
    [tr('网页检索与摘录', 'Web lookup'), tr('WebSearch · WebFetch（模型未披露）', 'WebSearch · WebFetch (model undisclosed)')],
    [tr('开源视频', 'Open-source video'), 'github.com/Water-Run/ft'],
  ];
  rows.forEach(([k, v], i) => {
    const y = 124 + i * 122, last = i === rows.length - 1;
    const rule = blk(world, last ? 'bg-ac' : 'bg-paper', 980, y, 840, last ? 6 : 3);
    const a = txt(world, 't-n dim', k, 980, y + 14); a.style.fontSize = LANG === 'zh' ? '28px' : '26px';
    const b = txt(world, (last ? 'mono ac' : '') + ' t-4', v, 980, y + 52); if (last) b.style.fontWeight = 700; if (LANG !== 'zh' && v.length > 34) b.style.fontSize = '38px';
    const tt = t0 + 0.2 + i * 0.1;
    fromTo(rule, tt, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.35, ease: 'power3.out' });
    wipe(a, tt + 0.05, { dir: 'l', d: 0.3 }); wipe(b, tt + 0.12, { dir: 'l', d: 0.35 });
    sfx(last ? 'chime' : 'tick', tt, { g: last ? 0.6 : 0.7, p: 0.4 });
  });
  // 最后五秒：左上角的剩余秒数每秒跳一下
  for (let sec = TOTAL - 5; sec < TOTAL; sec++) {
    fromTo(HUD.left, sec, { scale: 1 }, { keyframes: [{ scale: 1.28, duration: 0.1, ease: 'power2.out' }, { scale: 1, duration: 0.3, ease: 'power2.inOut' }], transformOrigin: '0% 50%', immediateRender: false });
    sfx('tick', sec, { g: 0.8, p: -0.6 });
  }
  cam.track(s.start, { x: 960, y: 484, z: 1 }, [[s.start + 0.1, { z: 1.03 }, s.end - s.start - 0.2, { ease: 'none', sfx: false }]]);
});
