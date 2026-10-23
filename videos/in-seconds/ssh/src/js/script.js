// 旁白脚本：每个 cue = [句号, 字幕, {tts, gap, pause}]
// 2026-10-24 定稿中文：Gemini 4 Argon 的 SSH-ZH-R3，加上 WaterRun 同意的三句。
// 英文是对照草稿，尚未确认。片尾 7.5 秒无旁白。
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
        ['s01', { zh: '敲下 *ssh* 命令回车，屏幕总会静上一秒。', en: 'Type *ssh*, press Enter. The screen goes quiet for a second.' }, g],
        ['s02', { zh: '钥匙不从网上传，私钥也不出本机，两台电脑却能建立起加密连接。', en: 'The key never crosses the wire, and the private key never leaves the machine. Still, the two computers open an encrypted connection.' }, g],
        ['s03', { zh: '支配这一秒的，是 *SSH*：一套远程登录协议，不是某一个程序的名字。', en: 'What runs that second is *SSH*: a remote-login protocol, not the name of one program.' }, g],
        ['s04', { zh: '隔着网络连向远处的机器，既要防人半路偷听，也要防人冒名顶替。', en: 'Across a network, it has to stop eavesdropping, and stop impersonation.' }, g],
        ['s05', { zh: '在你真正登录成功之前，两台机器必须先过四道关。', en: 'Before you are logged in, the two machines pass four gates.' }, g],
        ['s06', { zh: '对上算法，选定彼此都会的加密。', en: 'Agree an algorithm both sides can use.' }, g],
        ['s07', { zh: '换出密钥，却不让钥匙在网上传。', en: 'Make a key, and do not send that key.' }, g],
        ['s08', { zh: '认明主机，确认对面还是上次那一台。', en: 'Check the host: is it still the machine from last time?' }, g],
        ['s09', { zh: '证明自己，私钥留下，签名出门。', en: 'Prove yourself. The private key stays. A signature goes out.' }, g],
      ],
    },
    {
      id: 'what', chap: null, lead: 0.15, tail: 0.15,
      cues: [
        ['s10', { zh: '1995 年，Tatu Ylonen 公开了它的第一个版本。', en: 'In 1995, Tatu Ylonen published the first version.' }, g],
        ['s11', { zh: '2006 年，它的传输层写成标准文档，编号 *RFC 4253*。', en: 'In 2006 its transport layer became a standard, *RFC 4253*.' }, g],
        ['s12', { zh: '今天常用的这份 ssh 程序，由 OpenBSD 项目的开发者维护。', en: 'The ssh program in common use is maintained by developers of the OpenBSD project.' }, g],
      ],
    },
    {
      id: 'kex', chap: null, lead: 0.15, tail: 0.15,
      cues: [
        ['s13', { zh: '连上线后，两端不急着换钥匙，先互报版本标识。', en: 'Once connected, they announce versions before any key.' }, g],
        ['s14', { zh: '双方借此确认：彼此说的是哪一版 *SSH*。', en: 'Each side learns which version of *SSH* the other speaks.' }, g],
        ['s15', { zh: '版本对上，两边各发出一份完整的算法清单。', en: 'Then each side sends its full list of algorithms.' }, g],
        ['s16', { zh: '清单里不只有加密，还列着密钥交换和主机身份算法。', en: 'The list holds ciphers, key exchange, and host-key algorithms.' }, g],
        ['s17', { zh: '每一项怎么排，全按各自偏好的先后顺序。', en: 'Each list is ordered by that side\'s preference.' }, g],
        ['s18', { zh: '加密算法的选法很直接：顺着你这边的清单从头往后找。', en: 'For the cipher, walk down your list.' }, g],
        ['s19', { zh: '只要取你这边有、对方也有的第一个，就当场拍板。', en: 'Take the first one the other side also has.' }, g],
        ['s20', { zh: '要是比对到底，一个共同支持的都没有，连接当场断开。', en: 'If nothing overlaps, the connection drops.' }, g],
        ['s21', { zh: '这一次实验连接，双方最终敲定的是这三个名字：', en: 'On this test connection, three names were chosen.' }, g],
        ['s22', { zh: '密钥交换，用 *curve25519-sha256*。', en: 'Key exchange: *curve25519-sha256*.' }, g],
        ['s23', { zh: '主机身份，用 *ssh-ed25519*。', en: 'Host identity: *ssh-ed25519*.' }, g],
        ['s24', { zh: '通信加密，用 *chacha20-poly1305*。', en: 'Encryption: *chacha20-poly1305*.' }, g],
        ['s25', { zh: '这三项只是本次协商的结果，不是标准文档列出的必选项。', en: 'These are this negotiation\'s results, not the standard\'s required set.' }, g],
      ],
    },
    {
      id: 'dh', chap: null, lead: 0.15, tail: 0.15,
      cues: [
        ['s26', { zh: '算法敲定之后，两台机器开始换出密钥。', en: 'With the algorithms set, they make a key.' }, g],
        ['s27', { zh: '标准文档先写过一种经典换法，名字叫迪菲-赫尔曼。', en: 'The standard first describes an older method, Diffie-Hellman.' }, g],
        ['s28', { zh: '两边各留一个不送出去的秘密，各自算出同一个密钥。', en: 'Each side keeps a secret and computes the same key.' }, g],
        ['s29', { zh: '算出来的这个密钥本身，不从网上传。', en: 'That key itself is not transmitted.' }, g],
        ['s30', { zh: '但这次连接没有用它，走的是刚才选出的那套密钥交换。', en: 'This connection did not use that method. It used the one just chosen.' }, g],
        ['s31', { zh: '换完之后，两台机器手里同样有了一把共同密钥。', en: 'Afterward, both machines hold one shared secret.' }, g],
        ['s32', { zh: '后面的通信加密，靠的就是这把共同密钥。', en: 'Later encryption depends on that shared secret.' }, g],
        ['s33', { zh: '但这把共同密钥，和真正用来加密数据包的钥匙不是同一把。', en: 'It is not itself the key that encrypts the packets.' }, g],
        ['s34', { zh: '它还要在本地再变一次，才变成数据包真正使用的钥匙。', en: 'It is transformed once, locally, into the packet keys.' }, g],
        ['s35', { zh: '钥匙虽已备好，隐患却还在。', en: 'The keys are ready. One doubt remains.' }, g],
        ['s36', { zh: '光换出共同密钥，还不能认出对面的服务器是谁。', en: 'A shared secret does not tell you which server that is.' }, g],
      ],
    },
    {
      id: 'hostkey', chap: null, lead: 0.15, tail: 0.15,
      cues: [
        ['s37', { zh: '对面必须亮出身份：那是一把长期的主机密钥。', en: 'The other side shows a long-term host key.' }, g],
        ['s38', { zh: '它用来证明：我还是上次那一台。', en: 'It says: I am still the machine from last time.' }, g],
        ['s39', { zh: '前面整个交换过程会收成一份哈希：也就是一份短摘要。', en: 'The exchange collapses into a hash, a short digest.' }, g],
        ['s40', { zh: '服务器用自己的主机私钥，给这份短摘要签名。', en: 'The server signs that digest with its host private key.' }, g],
        ['s41', { zh: '你的电脑拿它的主机公钥查验，对不上就当场断开。', en: 'Your computer checks it with the host public key. A mismatch drops the connection.' }, g],
        ['s42', { zh: '光验过签名，还不算数。', en: 'A valid signature is not enough.' }, g],
        ['s43', { zh: '你电脑里有一份 *known_hosts* 记录：存着你这台电脑记下的服务器指纹。', en: '*known_hosts* stores the server fingerprint this computer kept.' }, g],
        ['s44', { zh: '以后服务器这把身份若是变了，电脑会当场报错。', en: 'If that identity changes later, the computer errors at once.' }, g],
        ['s45', { zh: '要是电脑里已经有记录，眼前的公钥就必须跟它完全一样。', en: 'If a record already exists, the public key must match it.' }, g],
      ],
    },
    {
      id: 'edge', chap: null, lead: 0.15, tail: 0.15,
      cues: [
        ['s46', { zh: '可要是第一次连接，你电脑里还没有旧记录可比。', en: 'On the first connection, there is no old record.' }, g],
        ['s47', { zh: '程序默认先停下来问人，等你点头了才记下这份身份。', en: 'By default it stops and asks. It writes the identity only after you agree.' }, g],
        ['s48', { zh: '这时如果不核对指纹就直接接受，有人冒充服务器是挡不住的。', en: 'Accepting it without checking the fingerprint does not stop an impersonator.' }, g],
        ['s49', { zh: '从第一次连接起，你就可能认错人，把假身份当成真的记下来。', en: 'From that first yes, you can record the wrong machine as the real one.' }, g],
      ],
    },
    {
      id: 'userauth', chap: null, lead: 0.15, tail: 0.15,
      cues: [
        ['s50', { zh: '双方宣布新密钥生效之后，后面的内容才开始加密。', en: 'After both sides announce the new keys, later traffic is encrypted.' }, g],
        ['s51', { zh: '服务器认完之后，最后才轮到证明你是你。', en: 'Only then does the server ask you to prove who you are.' }, g],
        ['s52', { zh: '这一次实验连接走的是公钥，全程没有用口令。', en: 'This test connection used a public key. No password.' }, g],
        ['s53', { zh: '两把钥匙各司其职：刚才电脑查验的是服务器的主机公钥。', en: 'Two different keys. Your computer just checked the server\'s host public key.' }, g],
        ['s54', { zh: '现在用来证明你身份的，则是你自己留下的另一把私钥。', en: 'The key that proves you is a different private key, and it stays with you.' }, g],
        ['s55', { zh: '你的私钥始终留在本机，不会发给服务器。', en: 'That private key never goes to the server.' }, g],
        ['s56', { zh: '网上传输的，只有你的公钥和用私钥签出的签名。', en: 'The wire carries your public key and a signature.' }, g],
        ['s57', { zh: '服务器拿你的公钥验过签名，确认无误，这才放行。', en: 'The server checks the signature with your public key, then lets you in.' }, g],
      ],
    },
    {
      id: 'close', chap: null, lead: 0.2, tail: 0.2,
      cues: [
        ['s58', { zh: '从敲下回车，到真正登录成功。', en: 'From the Enter key to a real login.' }, g],
        ['s59', { zh: '对上加密，换出密钥，认明服务器，再证明你是你。', en: 'Agree encryption, make a key, check the server, prove yourself.' }, g],
        ['s60', { zh: '共同的密钥不从网上传，各自的私钥也不离开本机。', en: 'The shared secret is not sent. Each private key stays home.' }, g],
        ['s61', { zh: '屏幕静默的那一秒，四道关已经走完。', en: 'In that quiet second, the four gates are already done.' }, g],
        ['s62', { zh: '唯一还要你自己点头的，是第一次把对面记下来的时候。', en: 'The only yes still required of you is the first time you record the other side.' }, g],
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
      [/known_hosts/g, 'known hosts'],
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
