// 片尾（142–150 秒）：左边是本集的两个词与一句话的概括，右边是制作名单与开源仓库地址。名单出处见 research/FACTS.md「制作署名」。
scene('outro', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const zh = LANG === 'zh', t0 = s.start + 0.4, VX = 880, G = 24;
  // 左：上半整块红（稠密），下半白底上一排格子只亮一格（MoE）
  const red = blk(world, 'bg-red', -100, -100, VX + 100, 520);
  const v = blk(world, 'bg-ink', VX, -100, G, VH + 200), hl = blk(world, 'bg-ink', -100, 420, VX + 100, G);
  appear(red, s.start); wipe(v, s.start + 0.05, { dir: 't', d: 0.4 });   // 红块随换场的黑线刷出 wipe(hl, t0, { dir: 'l', d: 0.35 });
  const dW = txt(world, 'paper', 'Dense', 96, 120); css(dW, { font: '900 220px "Inter"', letterSpacing: '-.045em', lineHeight: '1' });
  const mW = txt(world, 'ink', 'MoE', 96, 480); css(mW, { font: '900 220px "Inter"', letterSpacing: '-.045em', lineHeight: '1' });
  slam(dW, t0 + 0.1, { from: 1.2, d: 0.4 }); sfx('thud', t0 + 0.1, { g: 0.8, p: -0.4 });
  slam(mW, t0 + 0.35, { from: 1.2, d: 0.4 }); sfx('thud', t0 + 0.35, { g: 0.7, p: -0.4 });
  const cx = 680, cy = 520, cs = 70, cells = [];                              // MoE 旁边的四个专家格，亮一格
  for (let k = 0; k < 4; k++) { const e = blk(world, k === 2 ? 'bg-red' : 'bg-paper', cx + (k % 2) * (cs + 14), cy + Math.floor(k / 2) * (cs + 14), cs, cs); css(e, { border: `8px solid ${C.ink}` }); cells.push(e); wipe(e, t0 + 0.5 + k * 0.06, { dir: 'l', d: 0.2 }); }
  sfx('tick', t0 + 0.5, { g: 0.5, p: -0.3 });
  const line = txt(world, 't-3', tr('稠密省内存，MoE 省计算', 'Dense saves memory,<br>MoE saves compute'), 100, 730);
  const ser = txt(world, 't-n dimp', tr('XX 秒速通 · ' + TOTAL + ' 秒了解 LLM 的 Dense 和 MoE', 'In XX Seconds · Dense and MoE LLMs in ' + TOTAL + ' Seconds'), 100, zh ? 850 : 890); ser.style.fontSize = '28px';
  wipe(line, t0 + 0.7, { dir: 'l', d: 0.4 }); wipe(ser, t0 + 0.95, { dir: 'l', d: 0.4 });
  // 右：名单
  const RX = VX + G + 70, RW = 1920 - RX - 70;
  const rows = [
    [tr('策划', 'Planning'), 'WaterRun'],
    [tr('取证 · 实验 · 脚本 · 翻译 · 视觉 · 动画 · 配乐 · 审查', 'Research · experiments · script · translation · design · animation · score · review'), 'Claude Opus 5.5'],
    [tr('旁白合成', 'Narration voice'), tr('Microsoft Edge 在线语音（模型未披露）', 'Microsoft Edge online TTS (model undisclosed)')],   // lint-ok: 这里的 Microsoft 是服务名，不是字体
    [tr('读音回听', 'Read-back check'), 'Whisper small'],
    [tr('网页检索与摘录', 'Web lookup'), tr('WebSearch · WebFetch（模型未披露）', 'WebSearch · WebFetch (model undisclosed)')],
    [tr('开源视频', 'Open-source video'), 'github.com/Water-Run/ft'],
  ];
  rows.forEach(([k, val], i) => {
    const y = 150 + i * 118, last = i === rows.length - 1;
    const rl = blk(world, last ? 'bg-red' : 'bg-ink', RX, y, RW, last ? 8 : 3);
    const a = txt(world, 't-n dimp', k, RX, y + 14); a.style.fontSize = zh ? '28px' : '24px';
    const b = txt(world, (last ? 'mono ' : '') + 't-4', val, RX, y + 50);
    if (last) b.style.fontWeight = 800;
    if (!zh && val.length > 30) b.style.fontSize = '36px';
    const tt = t0 + 0.3 + i * 0.12;
    fromTo(rl, tt, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.35, ease: 'power3.out' });
    wipe(a, tt + 0.05, { dir: 'l', d: 0.3 }); wipe(b, tt + 0.12, { dir: 'l', d: 0.35 });
    sfx(last ? 'chime' : 'tick', tt, { g: last ? 0.6 : 0.6, p: 0.4 });
  });
  hudGround('L', s.start, TOTAL + 1, 'red');
  // 最后五秒：左上角的剩余秒数每秒跳一下
  for (let sec = TOTAL - 5; sec < TOTAL; sec++) {
    fromTo(HUD.left, sec, { scale: 1 }, { keyframes: [{ scale: 1.28, duration: 0.1, ease: 'power2.out' }, { scale: 1, duration: 0.3, ease: 'power2.inOut' }], transformOrigin: '0% 50%', immediateRender: false });
    sfx('tick', sec, { g: 0.8, p: -0.6 });
  }
  cam.track(s.start, { x: 960, y: 484, z: 1.0 }, [[s.start + 0.1, { z: 1.03 }, s.end - s.start - 0.2, { ease: 'none', sfx: false }]]);
});
