// 边界：第一次连接，known_hosts 里没有旧记录 → 默认先问人 → 不核对就点头，冒充者挡不住 → 假身份被当成真的记下。
// 依据 ssh_config(5) 的 StrictHostKeyChecking（ask 为默认）与 RFC 4253 §8 第 3 步。
scene('edge', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const rig = consoleRig(world);
  rig.units.forEach((u) => litAt(u, 0));
  // known_hosts：空的
  const kh = fileCard(world, 640, 110, 640, 180, 'known_hosts'); kh.dataset.name = 'known_hosts';
  const empty = txt(kh, 'lz', tr('（空）还没有旧记录', '(empty) no record yet'), 24, 70); empty.style.fontSize = '36px';
  const first = txt(world, 'cap-zh', tr('第一次连接', 'first connection'), 660, 316); first.style.fontSize = '48px'; first.style.fontWeight = 700; first.style.color = 'var(--amber)';
  const t46 = T('s46') + 0.05;
  hop(kh, t46, { y: -40, d: 0.4 }); sfx('pop', t46, { g: 0.6 });
  flick(first, T('s46', '第一次') - 0.1); sfx('tick', T('s46', '第一次') - 0.1, { g: 0.6 });
  appear(empty, T('s46', '旧记录') - 0.3); sfx('blip', T('s46', '旧记录') - 0.3, { g: 0.4 });
  // s47：先问人，点头才记下
  const ask = blk(world, 'bg-ink', 170, 366, 432, 180); ask.style.border = '6px solid var(--amber)'; ask.dataset.name = 'ask prompt';
  const a1 = txt(ask, 'cap-zh', tr('第一次见到这台主机', 'new host'), 16, 10); a1.style.fontSize = '28px'; a1.style.color = 'var(--paper)';
  const a2 = txt(ask, 'term', 'SHA256:g6PoA9wiW3y5…', 16, 56); a2.style.fontSize = '28px';
  const a3 = txt(ask, 'cap-zh', tr('记下它吗？', 'record it?'), 16, 100); a3.style.fontSize = '28px'; a3.style.color = 'var(--paper)';
  const yes = h('div', 'tok', ask, 'YES'); px(yes, 230, 112); yes.style.fontSize = '30px';
  const no = h('div', 'tok', ask, 'NO'); px(no, 340, 112); no.style.fontSize = '30px';
  const askL = txt(world, 'plate zh', tr('先问人，点头才记下', 'ask first; record only after yes'), 660, 400); askL.style.fontSize = '30px'; askL.style.background = 'var(--amber)';
  const t47 = T('s47', '问人') - 0.3;
  flick(ask, t47); sfx('beep', t47, { g: 0.5, p: -0.5 });
  flick(askL, T('s47', '问人') + 0.3); flickOut(askL, Tend('s47') + 0.75);
  // s48：冒充者递来自己的指纹，没核对就按了 YES
  const fake = h('div', 'abs', world); px(fake, CON.sx - 150, CON.y + 40, 260, 390); fake.style.background = 'var(--ink)'; fake.style.border = '6px solid var(--rust)'; fake.dataset.name = 'impostor';
  hatch(fake, 0, 0, 248, 378, 'var(--rust)', 22, 6);
  const fakeL = txt(world, 'plate zh', tr('冒充者', 'impostor'), CON.sx - 110, CON.y + 190); fakeL.style.background = 'var(--orange)';
  const t48 = T('s48') + 0.05;
  hop(fake, t48, { x: 240, d: 0.4 }); flick(fakeL, t48 + 0.4); sfx('error', t48 + 0.3, { g: 0.5, p: 0.5 });
  const fp = travel(world, rig, tr('它的指纹', 'its fingerprint'), t48 + 0.5, { dir: -1, w: 190, d: 0.8, cls: 'rust zh', until: Tend('s49b') + 1 });
  const noChk = txt(world, 'cap-zh', tr('不核对就接受', 'accepted without checking'), 660, 330); noChk.style.fontSize = '40px'; noChk.style.fontWeight = 700; noChk.style.color = 'var(--paper)';
  const tYes = T('s48', '接受') - 0.1;
  flickOut(first, tYes - 0.3);
  flick(noChk, tYes - 0.2);
  set(yes, tYes, { background: 'var(--amber)', y: 4 }); sfx('key', tYes, { g: 1.4, p: -0.5 });
  const stop = txt(world, 'plate zh', tr('挡不住冒充', 'the impostor is not stopped'), 900, 640); stop.style.background = 'var(--orange)'; stop.style.fontSize = '34px';
  flick(stop, T('s48b', '挡不住') - 0.2); sfx('error', T('s48b', '挡不住') - 0.2, { g: 0.8 });
  // s49：known_hosts 里记下的是冒充者那一行
  vanish(empty, T('s49') + 0.1);
  const row = txt(kh, 'ln', '[127.0.0.1]:2222 ssh-ed25519', 24, 64); row.style.fontSize = '34px';
  const hb = hatch(kh, 24, 112, 580, 40, 'var(--rust)', 14, 5);
  const wl = blk(world, 'lamp lamp-warn', 1210, 66, 40, 40); wl.style.width = wl.style.height = '40px';
  const t49 = T('s49', '认错人') - 0.3;
  line(row, T('s49') + 0.15); appear(hb, T('s49') + 0.2);
  flick(wl, t49); sfx('error', t49, { g: 0.7 });
  const wrong = txt(world, 'cap-zh', tr('可能把假的记成真的', 'a fake may be recorded as real'), 560, 830); wrong.style.fontSize = '52px'; wrong.style.fontWeight = 700; wrong.style.color = 'var(--paper)';
  flick(wrong, T('s49', '认错人')); sfx('thud', T('s49', '认错人'), { g: 0.6 });
  // 镜头：全景 → 推到询问框 → 平移到冒充者 → 拉回看 known_hosts
  camPath(cam, s, { x: 960, y: 480, z: 1.04 }, [
    [s.start + 0.05, { x: 960, y: 420, z: 1.12 }, 1.0, { ease: 'power2.out', sfx: false }],
    [Tend('s46') + 0.05, { x: 620, y: 470, z: 1.25 }, 0.9, { ease: 'power2.inOut', g: 0.3 }],
    [Tend('s47') + 0.05, { x: 1000, y: 480, z: 1.08 }, 0.9, { ease: 'power2.inOut', g: 0.3 }],
    [Tend('s48b') + 0.05, { x: 960, y: 470, z: 1 }, 0.7, { ease: 'power3.out', sfx: false }],
  ]);
});
