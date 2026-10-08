// 片尾：制作名单与开源链接。中性皮肤，纸白底；名单按行刷出，留足阅读时间。
scene('outro', ({ root, s, c0 }) => {
  const { world, g } = stage(root, 'n');
  const cam = makeCamera(world);
  const X = 260;
  const rows = [
    [tr('策划', 'Planning'), 'WaterRun'],
    [tr('制作', 'Production'), tr('Claude Opus 5.5（取证、实验、脚本与翻译、视觉、场景、配乐、封面、审查）', 'Claude Opus 5.5 (research, experiment, script and translation, visuals, scenes, music, covers, review)')],
    [tr('配音', 'Voice'), tr('Microsoft Edge 在线语音 zh-CN-YunyangNeural / en-US-AndrewNeural（模型未披露）', 'Microsoft Edge online voices zh-CN-YunyangNeural / en-US-AndrewNeural (model undisclosed)')],   // lint-ok: 片尾名单里的服务名
    [tr('回听', 'Listening check'), 'faster-whisper small'],
    [tr('素材', 'Assets'), tr('OpenClaw v2026.8.1（MIT）：吉祥物与 Instrument Sans（OFL）；OpenCode v2.0.24（MIT）：方块字标志', 'OpenClaw v2026.8.1 (MIT): mascot, Instrument Sans (OFL); OpenCode v2.0.24 (MIT): block logo')],
  ];
  const t0 = c0 + 0.2;
  rows.forEach(([k, v], i) => {
    const y = 170 + i * 110;
    const a = tx(world, 'seqn', X - 112, y + 8, String(501 + i).padStart(4, '0'), { fontSize: '26px' });
    const b = tx(world, 'ser6', X, y, k, { fontSize: '40px', color: C.ink2 });
    const c = tx(world, 'sans', X + tr(260, 330), y + 2, esc(v), { fontSize: '36px', fontWeight: 500, whiteSpace: 'normal', width: tr('1280px', '1210px'), lineHeight: '1.3' });   // 英文标签（Listening check）更宽
    appear(a, t0 + i * 0.25); wipe(b, t0 + i * 0.25, { dir: 'l', d: 0.4 }); wipe(c, t0 + i * 0.25 + 0.1, { dir: 'l', d: 0.5 }); sfx('tick', t0 + i * 0.25, { g: 0.35 });
  });
  const ln = Ln(g, X, 730, X + 1440, 730, C.ink, 4);
  const os = tx(world, 'ser6', X, 752, tr('开源视频', 'Open-source video'), { fontSize: '40px', color: C.ink2 });
  const url = tx(world, 'ser', X, 812, 'github.com/Water-Run/ft', { fontSize: '64px' });
  drawH(ln, t0 + 1.5, 0.6); wipe(os, t0 + 1.7, { dir: 'l', d: 0.4 }); wipe(url, t0 + 1.8, { dir: 'l', d: 0.6 }); sfx('thud', t0 + 1.9, { g: 0.5 });
  camTrack(cam, s.start, { x: 960, y: 520, z: 1.02 }, [
    [c0 + 0.1, { x: 975, z: 1.0 }, Math.max(1.2, s.end - c0 - 0.3), { sfx: false }],
  ], s.end + 0.45);
});
