// 第 01 章。TODO: 模板示例场景，整个文件换成本片的内容。
// 示范：一个 world 里按「站」排开内容，镜头在站与站之间移动；打字机；关键动作登记音效。
scene('demo', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);

  // 第一站
  const head = h('div', 'abs d-2', world, tr('第一站', 'Station one')); px(head, 120, 160);
  const term = h('div', 'abs mono', world, ''); css(term, { left: '120px', top: '420px', fontSize: '46px' });
  wipe(head, c0 + 0.1, { dir: 'l' }); sfx('whoosh', c0 + 0.1, { g: 0.5 });
  typeText(term, '$ echo <span class="accent">hello</span>', T('a1'), 26);

  // 第二站：在右边一屏之外。镜头到站时，站上已经有东西（标题先摆好），正文随旁白出现
  const head2 = h('div', 'abs d-2', world, tr('第二站', 'Station two')); px(head2, 2040, 160);
  const note = h('div', 'abs t-body', world, tr('读法写进 SAY 表，字幕保持正式拼写', 'Pronunciations live in the SAY table')); px(note, 2048, 420);
  const move = Tend('a1') + 0.1;                              // 上一句说完再走，下一句开始前到站
  appear(head2, move);
  slide(note, T('a2', 'SAY'), { y: 40 }); sfx('blip', T('a2', 'SAY'));

  cam.track(s.start, { x: 960, y: 540, z: 1 }, [
    [c0 + 0.1, { z: 1.03 }, move - c0 - 0.1, { ease: 'none', sfx: false }],      // 第一站：慢推
    [move, { x: 2880, z: 1 }, 1.0],                                              // 移到第二站（自动登记一声 whoosh）
    [null, { z: 1.04 }, s.end - move - 1.25, { ease: 'none', sfx: false }],      // 第二站：慢推。null 表示接在上一段之后 0.15 秒
  ]);
});
