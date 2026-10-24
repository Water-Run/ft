// 旁白脚本：每个 cue = [句号, 字幕, {tts, gap, pause}]
// 2026-10-24 定稿中文：Gemini 4 Argon 的 SSH-ZH-R3，加上 WaterRun 同意的三句。
// 2026-10-24 英文由 Grok 4.7 按中文重译，尚未经 WaterRun 确认。片尾 7.5 秒无旁白。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);

  const TOTAL = 256;
  const g = { gap: 0.16 };
  const RAW = [
    {
      id: 'open', at: 0, chap: null, lead: 0.35, tail: 0.2,
      cues: [
        ['s01', { zh: '敲下 *ssh* 命令回车，屏幕总会静上一秒。', en: 'Type *ssh* and press Enter. The screen always goes quiet for a second.' }, g],
        ['s02', { zh: '钥匙不从网上传，私钥也不出本机，', en: 'The key stays off the wire. The private key stays home.' }, { ...g, gap: 0.04, tts: { zh: '钥匙不从网上传，私钥也不出本机，' } }],
        ['s02b', { zh: '两台电脑却能建立起加密连接。', en: 'The link still encrypts.' }, g],
        ['s03', { zh: '支配这一秒的，是 *SSH*：', en: 'What governs that second is *SSH*:' }, { ...g, gap: 0.04, tts: { zh: '支配这一秒的，是 S S H：' } }],
        ['s03b', { zh: '一套远程登录协议，不是某一个程序的名字。', en: 'a remote-login protocol, not one program\'s name.' }, g],
        ['s04', { zh: '隔着网络连向远处的机器，', en: 'Across the network it stops eavesdropping,' }, { ...g, gap: 0.04, tts: { zh: '隔着网络连向远处的机器，' } }],
        ['s04b', { zh: '既要防人半路偷听，也要防人冒名顶替。', en: 'and it stops a fake server.' }, g],
        ['s05', { zh: '在你真正登录成功之前，两台机器必须先过四道关。', en: 'Before the login succeeds, the two machines must pass four gates.' }, g],
        ['s06', { zh: '对上算法，选定彼此都会的加密。', en: 'Match algorithms. Choose encryption both sides know.' }, g],
        ['s07', { zh: '换出密钥，却不让钥匙在网上传。', en: 'Make a key, and do not send that key across the network.' }, g],
        ['s08', { zh: '认明主机，确认对面还是上次那一台。', en: 'Check the host. Confirm it is still the machine from last time.' }, g],
        ['s09', { zh: '证明自己，私钥留下，签名出门。', en: 'Prove yourself. The private key stays. The signature goes out.' }, g],
      ],
    },
    {
      id: 'what', chap: null, lead: 0.15, tail: 0.6,
      cues: [
        ['s10', { zh: '1995 年，Tatu Ylonen 公开了它的第一个版本。', en: 'In 1995, Tatu Ylonen published its first version.' }, g],
        ['s11', { zh: '2006 年，它的传输层写成标准文档，编号 *RFC 4253*。', en: 'In 2006 its transport layer became the standard *RFC 4253*.' }, g],
        ['s12', { zh: '今天常用的这份 ssh 程序，', en: 'Today\'s usual ssh program' }, { ...g, gap: 0.04, tts: { zh: '今天常用的这份 S S H 程序，' } }],
        ['s12b', { zh: '由 OpenBSD 项目的开发者维护。', en: 'is maintained by OpenBSD project developers.' }, g],
      ],
    },
    {
      id: 'kex', chap: null, lead: 0.15, tail: 1.0,
      cues: [
        ['s13', { zh: '连上线后，两端不急着换钥匙，先互报版本标识。', en: 'Once online, they do not rush the key. First they exchange version strings.' }, g],
        ['s14', { zh: '双方借此确认：彼此说的是哪一版 *SSH*。', en: 'Each side thus confirms which version of *SSH* the other is speaking.' }, g],
        ['s15', { zh: '版本对上，两边各发出一份完整的算法清单。', en: 'Versions settled, each side sends a complete list of algorithms.' }, g],
        ['s16', { zh: '清单里不只有加密，还列着密钥交换和主机身份算法。', en: 'The list is not only ciphers. It also names key exchange and host-identity algorithms.' }, g],
        ['s17', { zh: '每一项怎么排，全按各自偏好的先后顺序。', en: 'Every item is ranked by that side\'s own preference.' }, g],
        ['s18', { zh: '加密算法的选法很直接：顺着你这边的清单从头往后找。', en: 'The cipher rule is direct: walk your list from the top.' }, g],
        ['s19', { zh: '只要取你这边有、对方也有的第一个，就当场拍板。', en: 'Take the first one you have that the other side also has. That settles it.' }, g],
        ['s20', { zh: '要是比对到底，一个共同支持的都没有，连接当场断开。', en: 'If the lists share nothing, the connection drops on the spot.' }, g],
        ['s21', { zh: '这一次实验连接，双方最终敲定的是这三个名字：', en: 'On this test connection, the two sides settled on these three names.' }, g],
        ['s22', { zh: '密钥交换，用 *curve25519-sha256*。', en: 'Key exchange: *curve25519-sha256*.' }, g],
        ['s23', { zh: '主机身份，用 *ssh-ed25519*。', en: 'Host identity: *ssh-ed25519*.' }, g],
        ['s24', { zh: '通信加密，用 *chacha20-poly1305*。', en: 'Traffic encryption: *chacha20-poly1305*.' }, g],
        ['s25', { zh: '这三项只是本次协商的结果，不是标准文档列出的必选项。', en: 'These three are only this negotiation\'s result, not the mandatory list in the standard.' }, g],
      ],
    },
    {
      id: 'dh', chap: null, lead: 0.15, tail: 0.9,
      cues: [
        ['s26', { zh: '算法敲定之后，两台机器开始换出密钥。', en: 'Once the algorithms are set, the two machines begin to make a key.' }, g],
        ['s27', { zh: '标准文档先写过一种经典换法，名字叫迪菲-赫尔曼。', en: 'The standard first describes a classic method. Its name is Diffie-Hellman.' }, g],
        ['s28', { zh: '两边各留一个不送出去的秘密，各自算出同一个密钥。', en: 'Each side keeps a secret it does not send, and each computes the same key.' }, g],
        ['s29', { zh: '算出来的这个密钥本身，不从网上传。', en: 'That computed key itself does not travel the network.' }, g],
        ['s30', { zh: '但这次连接没有用它，走的是刚才选出的那套密钥交换。', en: 'This connection did not use that method. It used the key exchange just chosen.' }, g],
        ['s31', { zh: '换完之后，两台机器手里同样有了一把共同密钥。', en: 'When the exchange is done, both machines hold the same shared secret.' }, g],
        ['s32', { zh: '后面的通信加密，靠的就是这把共同密钥。', en: 'The encryption that follows depends on that shared secret.' }, g],
        ['s33', { zh: '但这把共同密钥，', en: 'But that shared secret' }, { ...g, gap: 0.04, tts: { zh: '但这把共同密钥，' } }],
        ['s33b', { zh: '和真正用来加密数据包的钥匙不是同一把。', en: 'is not the key that actually encrypts the packets.' }, g],
        ['s34', { zh: '它还要在本地再变一次，才变成数据包真正使用的钥匙。', en: 'It still has to be changed once, locally, into the keys the packets use.' }, g],
        ['s35', { zh: '钥匙虽已备好，隐患却还在。', en: 'The keys are ready. The danger is not gone.' }, g],
        ['s36', { zh: '光换出共同密钥，还不能认出对面的服务器是谁。', en: 'A shared secret alone still cannot tell you which server is on the other side.' }, g],
      ],
    },
    {
      id: 'hostkey', chap: null, lead: 0.15, tail: 0.8,
      cues: [
        ['s37', { zh: '对面必须亮出身份：那是一把长期的主机密钥。', en: 'The other side must show who it is: a long-term host key.' }, g],
        ['s38', { zh: '它用来证明：我还是上次那一台。', en: 'It is there to prove: I am still the machine from last time.' }, g],
        ['s39', { zh: '前面整个交换过程会收成一份哈希：也就是一份短摘要。', en: 'The exchange so far is folded into a hash: a short digest.' }, g],
        ['s40', { zh: '服务器用自己的主机私钥，给这份短摘要签名。', en: 'The server signs that short digest with its own host private key.' }, g],
        ['s41', { zh: '你的电脑拿它的主机公钥查验，对不上就当场断开。', en: 'Your computer checks it with the host public key. If it fails, the link drops.' }, g],
        ['s42', { zh: '光验过签名，还不算数。', en: 'A signature that checks out is still not enough.' }, g],
        ['s43', { zh: '你电脑里有一份 *known_hosts* 记录：', en: 'Your computer keeps a *known_hosts* record:' }, { ...g, gap: 0.04, tts: { zh: '你电脑里有一份 known hosts 记录：' } }],
        ['s43b', { zh: '存着你这台电脑记下的服务器指纹。', en: 'the server fingerprint it stored.' }, g],
        ['s44', { zh: '以后服务器这把身份若是变了，电脑会当场报错。', en: 'If the server\'s identity changes later, the computer reports an error at once.' }, g],
        ['s45', { zh: '要是电脑里已经有记录，眼前的公钥就必须跟它完全一样。', en: 'If a record already exists, this public key must match it exactly.' }, g],
      ],
    },
    {
      id: 'edge', chap: null, lead: 0.15, tail: 0.8,
      cues: [
        ['s46', { zh: '可要是第一次连接，你电脑里还没有旧记录可比。', en: 'But on the first connection, your computer has no old record to compare.' }, g],
        ['s47', { zh: '程序默认先停下来问人，等你点头了才记下这份身份。', en: 'By default the program stops and asks. It records the identity only after you agree.' }, g],
        ['s48', { zh: '这时如果不核对指纹就直接接受，', en: 'Accept it then without checking the fingerprint,' }, { ...g, gap: 0.04, tts: { zh: '这时如果不核对指纹就直接接受，' } }],
        ['s48b', { zh: '有人冒充服务器是挡不住的。', en: 'and an impersonator is not stopped.' }, g],
        ['s49', { zh: '从第一次连接起，你就可能认错人，', en: 'From the first connection,' }, { ...g, gap: 0.04, tts: { zh: '从第一次连接起，你就可能认错人，' } }],
        ['s49b', { zh: '把假身份当成真的记下来。', en: 'you may store an impostor as the real server.' }, g],
      ],
    },
    {
      id: 'userauth', chap: null, lead: 0.15, tail: 0.9,
      cues: [
        ['s50', { zh: '双方宣布新密钥生效之后，后面的内容才开始加密。', en: 'Only after both sides announce the new keys does later traffic become encrypted.' }, g],
        ['s51', { zh: '服务器认完之后，最后才轮到证明你是你。', en: 'After the server is recognized, it is finally your turn to prove you are you.' }, g],
        ['s52', { zh: '这一次实验连接走的是公钥，全程没有用口令。', en: 'This test connection used a public key. It never used a password.' }, g],
        ['s53', { zh: '两把钥匙各司其职：刚才电脑查验的是服务器的主机公钥。', en: 'Two jobs. Your computer just checked the server\'s host public key.' }, g],
        ['s54', { zh: '现在用来证明你身份的，则是你自己留下的另一把私钥。', en: 'What proves you now is another private key, the one you keep yourself.' }, g],
        ['s55', { zh: '你的私钥始终留在本机，不会发给服务器。', en: 'Your private key stays on this machine. It is not sent to the server.' }, g],
        ['s56', { zh: '网上传输的，只有你的公钥和用私钥签出的签名。', en: 'Only your public key, and a signature from the private key, cross the network.' }, g],
        ['s57', { zh: '服务器拿你的公钥验过签名，确认无误，这才放行。', en: 'The server checks the signature with your public key, then lets you in.' }, g],
      ],
    },
    {
      id: 'close', chap: null, lead: 0.2, tail: 0.2,
      cues: [
        ['s58', { zh: '从敲下回车，到真正登录成功。', en: 'From pressing Enter, to a login that has actually succeeded.' }, g],
        ['s59', { zh: '对上加密，换出密钥，认明服务器，再证明你是你。', en: 'Match the encryption, make the key, recognize the server, then prove you are you.' }, g],
        ['s60', { zh: '共同的密钥不从网上传，各自的私钥也不离开本机。', en: 'The shared secret does not cross the network. Neither private key leaves its machine.' }, g],
        ['s61', { zh: '屏幕静默的那一秒，四道关已经走完。', en: 'In that quiet second on the screen, the four gates are already finished.' }, g],
        ['s62', { zh: '唯一还要你自己点头的，是第一次把对面记下来的时候。', en: 'The only yes still yours is the first time you record the other side.' }, g],
      ],
    },
    {
      id: 'outro', at: 248.5, chap: null, lead: 0, tail: 0,
      cues: [
        ['z1', null, { pause: 7.5, credits: true, gap: 0 }],
      ],
    },
  ];

  const SAY = {
    zh: [
      [/known_hosts/g, 'known hosts'],
      [/curve25519-sha256/g, 'curve25519 的 sha256'],
      [/chacha20-poly1305/g, 'chacha20 的 poly1305'],
      [/ssh-ed25519/g, 'ssh ed25519'],
      [/RFC 4253/g, 'R F C 四二五三'],
      [/OpenBSD/g, 'Open BSD'],
      [/ssh/g, 'S S H'],
      [/SSH/g, 'S S H'],
    ],
    en: [
      [/curve25519-sha256/g, 'curve two five five one nine, sha two five six'],
      [/chacha20-poly1305/g, 'cha cha twenty, poly one three zero five'],
      [/ssh-ed25519/g, 'ssh ed two five five one nine'],
      [/known_hosts/g, 'known hosts'],
      [/RFC 4253/g, 'R F C forty two fifty three'],
      [/OpenBSD/g, 'Open B S D'],
    ],
  };
  const strip = (s) => s.replace(/\*/g, '');
  const ttsNorm = (s) => { for (const [re, to] of SAY[LANG] || []) s = s.replace(re, to); return s; };
  const SCRIPT = RAW.map((sc) => ({
    ...sc, chap: sc.chap ? [sc.chap[0], pick(sc.chap[1])] : null,
    cues: sc.cues.map(([id, cap, o = {}]) => [id, pick(cap), { ...o, tts: pick(o.tts), gap: pick(o.gap), pause: pick(o.pause), credits: o.credits }]),
  }));
  const ttsText = (c) => (c[2] && c[2].tts) || ttsNorm(strip(c[1]) + (LANG === 'zh' ? '。' : ''));
  const estimate = (text) => (LANG === 'zh' ? 0.35 + text.replace(/[，。：；、\s]/g, '').length / 5.2 : 0.3 + text.split(/\s+/).length / 2.7);

  function layoutScript(DUR) {
    DUR = DUR || {};
    let t = 0;
    const cues = {}, scenes = [], order = [], problems = [];
    const pinTo = (at, what) => {
      const last = scenes[scenes.length - 1];
      if (t > at + 1e-6) { problems.push(`场景 ${last.id} 的旁白超出${what} ${(t - at).toFixed(2)} 秒（到 ${t.toFixed(2)}s，应在 ${at}s 之前说完）`); return; }
      last.slack = +(at - t).toFixed(3); t = at; last.end = t;
    };
    for (const sc of SCRIPT) {
      if (sc.at != null && scenes.length) pinTo(sc.at, `下一场 ${sc.id} 的定点`);
      const s0 = t;
      t += sc.lead || 0;
      const first = t;
      for (const c of sc.cues) {
        const [id, cap, o = {}] = c;
        const meas = DUR[id];
        const d = o.pause != null ? o.pause : (meas ? meas.d : estimate(ttsText(c)));
        cues[id] = { id, scene: sc.id, cap, start: t, end: t + d, d, silent: o.pause != null, tts: o.pause != null ? null : ttsText(c), words: meas ? meas.words : null };
        order.push(id);
        t += d + (o.gap != null ? o.gap : 0.3);
      }
      t += sc.tail != null ? sc.tail : 0.6;
      scenes.push({ id: sc.id, chap: sc.chap, start: s0, first, end: t, lead: sc.lead || 0, slack: 0 });
    }
    pinTo(TOTAL, '全片时长');
    return { cues, scenes, order, total: t, problems };
  }

  const api = { SCRIPT, LANG, pick, tr, layoutScript, ttsText, ttsNorm, strip, TOTAL };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { Object.assign(root, api); root.DUR = (root.DUR_ALL || {})[LANG] || {}; }
})(typeof window !== 'undefined' ? window : globalThis);
