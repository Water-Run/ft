// 第 4 个时间步的前段（90–112.5 秒）：其他验证方式的强弱（依据 CISA 2022 的排序与弱点）→ 结论（Google 2019 的数据）。
// 一张三行三列的表：行是验证方式，列是攻击手段；斜线 = 这种攻击走得通。斜线越少越强。
scene('rank', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const CX = [1020, 1296, 1572], CW = 256, CH = 150, RY = [228, 424, 620], LX = 140;
  const heads = [tr('钓鱼网站', 'phishing site'), tr('SIM 换卡', 'SIM swap'), tr('信令劫持', 'SS7 intercept')];
  const tHead = s.start + 0.12, tPre = Qf(T('d1')) + 0.5;
  const hl = txt(world, 't-n dim', tr('验证方式', 'method'), LX + 8, 164);
  wipe(hl, tHead, { dir: 'l', d: 0.3 });
  heads.forEach((t, i) => { const e = txt(world, 't-n', t, CX[i], 164); css(e, { width: CW + 'px', textAlign: 'center' }); wipe(e, tHead + 0.125 + i * 0.125, { dir: 't', d: 0.3 }); sfx('tick', tHead + 0.125 + i * 0.125, { g: 0.7, p: 0.2 + i * 0.25 }); });
  // 九个空格先摆出来：占位，随后填上
  const cellAt = (r, c) => { const e = h('div', 'abs', world); px(e, CX[c], RY[r], CW, CH); css(e, { border: `4px solid ${C.paper}` }); return e; };
  const grid = RY.map((_, r) => CX.map((_, c) => { const e = cellAt(r, c); wipe(e, tHead + 0.3 + (r * 3 + c) * 0.04, { dir: 'l', d: 0.25 }); return e; }));
  const fill = (r, c, t) => { const e = hatch(world, CX[c] + 4, RY[r] + 4, CW - 8, CH - 8, C.paper, 20, 6); wipe(e, t, { dir: 'l', d: 0.3 }); sfx('error', t, { g: 0.45, p: 0.2 + c * 0.25 }); return e; };
  // 三种方式的名字先以次要色摆出来（占位），讲到哪一行，哪一行点亮
  const name = (r, html, t) => {
    const e = txt(world, 't-2', html, LX, RY[r] - 4);
    wipe(e, tPre + r * 0.25, { dir: 'l', d: 0.35 }); sfx('tick', tPre + r * 0.25, { g: 0.8, p: -0.5 }); classAt(e, 'dim', 0, t);
    fromTo(e, t, { scale: 1 }, { keyframes: [{ scale: 1.07, duration: 0.12, ease: 'power2.out' }, { scale: 1, duration: 0.3, ease: 'power2.inOut' }], transformOrigin: '0% 60%', immediateRender: false });
    sfx('thud', t, { g: 0.7, p: -0.5 }); return e;
  };
  const sub = (r, html, t, dy = 112) => { const e = txt(world, 't-n', html, LX + 8, RY[r] + dy); wipe(e, t, { dir: 'l', d: 0.3 }); return e; };

  // 短信验证码：三种都走得通
  const t2 = Q(T('d2', { zh: '短信', en: 'SMS' })), t2b = Q(T('d2', { zh: '号码', en: 'phone number' }));
  name(0, tr('短信验证码', 'SMS code'), t2);
  [0, 1, 2].forEach((c) => fill(0, c, t2 + 0.25 + c * 0.125));
  sub(0, tr('号码被转到别人的卡上，验证码随之改道', 'move the number to another SIM and the codes follow'), t2b);
  fromTo(grid[0][1], t2b, { scale: 1 }, { keyframes: [{ scale: 1.1, duration: 0.12, ease: 'power2.out' }, { scale: 1, duration: 0.35, ease: 'power2.inOut' }], immediateRender: false }); sfx('pop', t2b, { p: 0.4 });

  // TOTP：只剩钓鱼网站
  const t3 = Q(T('d3', 'TOTP')), t3b = Q(T('d3', { zh: '假网站', en: 'fake site' })), t3c = Q(T('d3', { zh: '数字', en: 'digits' }));
  name(1, tr('TOTP 验证码', 'TOTP code'), t3);
  fill(1, 0, t3b);
  sub(1, tr('假网站当场收下数字，转手登录', 'a fake site takes the digits and signs in at once'), t3b + 0.2);
  const got = h('div', 'abs bg-ink', world); px(got, CX[0] + 30, RY[1] + 41, 200, 68);
  const gt = txt(got, 'num', sp3(CODES[3]), 0, 12); css(gt, { width: '200px', textAlign: 'center', fontSize: '42px' });
  slam(got, t3c, { from: 1.3, d: 0.3 }); sfx('pop', t3c, { p: 0.2 });

  // WebAuthn：私钥签名，签名认准域名
  const t4 = Q(T('d4', 'WebAuthn')), t4y = Q(T('d4', '2019')), t4b = Q(T('d4', { zh: '私钥', en: 'private key' }));
  const n3 = name(2, 'WebAuthn', t4);
  const yr = txt(world, 'num', '2019', LX + 490, RY[2] + 22); yr.style.fontSize = '64px';
  const yn = txt(world, 't-n dim', tr('W3C 标准', 'W3C standard'), LX + 660, RY[2] + 44);
  slam(yr, t4y, { from: 1.4, d: 0.3 }); wipe(yn, t4y + 0.15, { dir: 'l', d: 0.3 }); sfx('pop', t4y, { p: -0.2 });
  sub(2, tr('私钥签名 · 用于安全密钥与通行密钥', 'private-key signatures · security keys and passkeys'), t4b);
  const t5 = Q(T('d5', { zh: '域名', en: 'domain' })), t5b = Q(T('d5', { zh: '拿不到', en: 'nothing' }));
  const s2 = sub(2, tr('签名只对 <span class="mono">example.com</span> 有效', 'the signature works only for <span class="mono">example.com</span>'), t5, 154);
  // 假网站：斜线框。它拿不到签名。域名用保留的 .test（RFC 6761），不指向任何真实站点
  const fake = h('div', 'abs', world); px(fake, CX[0] + 12, RY[2] + 14, 232, 58);
  hatch(fake, 0, 0, 232, 58, C.paper, 16, 5); blk(fake, 'bg-ink', 8, 8, 216, 42);
  const ft = txt(fake, 'mono', 'examp1e.test', 8, 9); css(ft, { width: '216px', textAlign: 'center', fontSize: '28px', fontWeight: 700 });
  slide(fake, t5 + 0.35, { y: -90, d: 0.4, ease: 'power3.out' }); sfx('whoosh', t5 + 0.35, { g: 0.4, p: 0.2 });
  const no = txt(world, 't-n ink bg-ac', tr('拿不到签名', 'no signature'), CX[0] + 12, RY[2] + 82); css(no, { width: '232px', textAlign: 'center', fontSize: '28px', fontWeight: 700, lineHeight: '54px' });
  slam(no, t5b, { from: 1.3, d: 0.3 }); sfx('thud', t5b, { g: 0.8, p: 0.2 });
  const src = txt(world, 't-n dim', tr('强弱排序与弱点依据 CISA《Implementing Phishing-Resistant MFA》，2022 年 10 月', 'Ranking and weaknesses per CISA, “Implementing Phishing-Resistant MFA”, October 2022'), LX + 8, 848);
  src.style.fontSize = '28px';
  wipe(src, t2 + 0.6, { dir: 'l', d: 0.4 });

  // ── 结论：朱红整屏 ──
  // 结论的大字落在整拍上（配乐在这一拍抬起：tools/music.py 用同一个算式）
  const tSay = Math.round((T('d6') + 0.2) / BEAT) * BEAT, tCard = tSay - 0.4;
  const card = h('div', 'abs bg-ac ink', root); px(card, 0, 0, 1920, VH);
  const say = txt(card, 'ink', tr('任何一种，<br>都好过只有密码', 'Any of them beats<br>a password alone'), 100, 124);
  css(say, { font: `900 ${LANG === 'zh' ? 176 : 138}px "Inter", "Sans SC"`, letterSpacing: '-.03em', lineHeight: '1.08' });
  const lead = txt(card, 't-4 ink', tr('连最弱的短信验证码，也拦下了', 'Even SMS codes, the weakest, blocked'), 108, 556);
  const nums = [[100, tr('自动化攻击', 'of automated bots')], [96, tr('批量钓鱼', 'of bulk phishing')], [76, tr('定向攻击', 'of targeted attacks')]];
  const tNum = Qf(Math.min(Tend('d6') - 0.4, s.end - 2.4));                     // 三个数至少留出两秒可读
  nums.forEach(([v, lab], i) => {
    const x = 100 + i * 520, n = txt(card, 'num ink', '0', x, 624), pc = txt(card, 'num ink', '%', x + (String(v).length) * 96 + 8, 668), l = txt(card, 't-4 ink', lab, x + 6, 790);
    n.style.fontSize = '160px'; pc.style.fontSize = '100px';
    const t0 = tNum + i * 0.25;
    wipe(n, t0, { dir: 'b', d: 0.25 }); appear(pc, t0 + 0.05); countTo(n, 0, v, t0, 0.6, (x) => String(Math.round(x))); wipe(l, t0 + 0.2, { dir: 'l', d: 0.3 });
    sfx('pop', t0, { g: 0.9, p: -0.5 + i * 0.5 });
  });
  const gsrc = txt(card, 't-n ink', tr('数据：Google 安全博客，2019-05-17', 'Data: Google Security Blog, 2019-05-17'), 108, 880); gsrc.style.fontSize = '28px';
  wipe(card, tCard, { dir: 'l', d: 0.4 }); sfx('whoosh', tCard - 0.1, { g: 0.8 });
  slam(say, tSay, { from: 1.12, d: 0.4 }); sfx('thud', tSay);
  wipe(lead, tNum - 0.3, { dir: 'l', d: 0.3 }); wipe(gsrc, tNum + 0.9, { dir: 'l', d: 0.3 });
  [say, lead, gsrc, ...card.querySelectorAll('.num, .t-4')].forEach((e) => { e.dataset.overlapOk = '1'; });
  hudGround('L', tCard + 0.2, s.end + 0.3, 'ac'); hudGround('R', tCard + 0.3, s.end + 0.45, 'ac');

  // ── 镜头：跟着正在讲的那一行 ──
  cam.track(s.start, { x: 960, y: 484, z: 1.04 }, [
    [s.start + 0.02, { z: 1 }, 0.9, { ease: 'power3.out', sfx: false }],
    [s.start + 1.0, { z: 1.02 }, t2 - s.start - 1.3, { ease: 'none', sfx: false }],
    [t2 - 0.2, { y: 446, z: 1.035 }, 0.6, { sfx: false }],
    [null, { z: 1.05 }, t3 - t2 - 0.75, { ease: 'none', sfx: false }],
    [t3 - 0.2, { y: 484, z: 1.035 }, 0.6, { sfx: false }],
    [null, { z: 1.05 }, Math.min(t4, t4y) - t3 - 0.8, { ease: 'none', sfx: false }],
    [Math.min(t4, t4y) - 0.2, { y: 506, z: 1.03 }, 0.6, { sfx: false }],
    [null, { z: 1.045 }, tCard - Math.min(t4, t4y) - 0.6, { ease: 'none', sfx: false }],
  ]);
});
