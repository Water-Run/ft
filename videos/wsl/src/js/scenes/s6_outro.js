// 片尾名单：策划、实际参与的模型与分工、语音服务、开源视频的仓库地址。名单与 research/FACTS.md 的「制作署名」一致。
scene('outro', ({ root, s, c0 }) => {
  const world = h('div', 'world', root), cam = makeCamera(world, 1920, VH);
  blobs(world, [['a', -300, -320, 1150], ['b', 1200, 340, 1050], ['c', 600, 500, 900]]);
  const t0 = s.start + SWIPE * 0.5;
  const ttl = txt(world, 't-3', tr('从 WSL 1 到 WSL 2，再到「WSL 3」', 'From WSL 1 to WSL 2, Then “WSL 3”'), 120, 70);
  const bar = blk(world, 'bg-ac', 124, 168, 420, 12);
  wipe(ttl, t0, { dir: 'l', d: 0.5 }); fromTo(bar, t0 + 0.3, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.5, ease: 'power3.out' }); appear(bar, t0 + 0.3);
  const rows = [
    [tr('策划', 'Planning'), 'WaterRun', ''],
    [tr('取证 · 脚本 · 翻译 · 视觉设计 · 场景 · 审查', 'Research · script · translation · design · scenes · review'), 'Claude Opus 5.5', ''],
    [tr('旁白', 'Narration'), tr('Microsoft Edge 在线语音', 'Microsoft Edge online voices'), tr('模型未披露 · zh-CN-YunyangNeural / en-US-AndrewNeural', 'model undisclosed · zh-CN-YunyangNeural / en-US-AndrewNeural')],   // lint-ok: 片尾名单里的服务名，不是字体
    [tr('配乐与音效', 'Music and sound effects'), tr('程序合成', 'synthesized in code'), ''],
  ];
  rows.forEach(([k, v, n], i) => {
    const y = 236 + i * 128;
    const a = txt(world, 't-n dim', k, 124, y), b = txt(world, 't-4', v, 124, y + 40), c = n ? txt(world, 't-n dim', n, 124 + 700, y + 50) : null;
    if (c) c.style.fontSize = '28px';
    const ta = t0 + 0.5 + i * 0.16;
    show(a, ta, { x: -24, y: 0, d: 0.35 }); wipe(b, ta + 0.06, { dir: 'l', d: 0.4 }); if (c) show(c, ta + 0.3, { x: -24, y: 0, d: 0.35 }); sfx('tick', ta, { g: 0.7, p: -0.3 });
  });
  const oss = card(world, 'ac', 120, 760, 1150, 150); oss.dataset.name = 'open source';
  txt(oss, 't-n white', tr('开源视频', 'Open-source video'), 36, 22);
  const url = txt(oss, 'mono white', 'github.com/Water-Run/ft', 36, 62); css(url, { fontSize: '56px', fontWeight: '700' });
  slide(oss, t0 + 1.3, { y: 90, d: 0.55 }); sfx('chime', t0 + 1.4, { g: 0.6 });
  cam.track(s.start, { x: 960, y: 484, z: 1.04 }, [
    [t0, { z: 1 }, 0.9, { ease: 'power3.out', sfx: false }],
    [t0 + 0.95, { z: 1.03 }, s.end - t0 - 1.0, { ease: 'none', sfx: false }],
  ]);
});
