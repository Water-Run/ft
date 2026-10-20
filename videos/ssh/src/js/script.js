// 旁白脚本：每个 cue = [句号, 字幕, {tts, gap, pause}]
// - 多语言时字幕写成 { zh: '…', en: '…' }；tts、gap、pause 同理
// - 字幕里 *词* 表示强调；tts 缺省时由字幕按 SAY 表换成读法（字幕写正式拼写，读法只放在 SAY 表或 tts 字段）
// - gap：该句结束到下一句开始的停顿（秒，缺省 0.3）；pause：无旁白的纯画面停顿
// 语言：浏览器取 ?lang=，Node 取环境变量 VLANG；缺省为 zh。浏览器与 Node 共用本文件（工具读它排时间线）。
// 翻译以中文为底本：先定中文，再译其他语言；各语言的句号一一对应，时间轴各自排布。
//
// 本系列（XX 秒速通）的时间线是定长的：片名里的秒数就是成片的时长，各语言相同。
// - 场景的 at 是它开始的时刻（秒）。上一场的旁白说完之后，余下的时间留白到这一刻；说不完就是超出，记入 L.problems，总闸门不通过。
// - TOTAL 是全片的时长，最后一场补齐到这一刻。
//
// 2026-10-19 第 1 稿（MiniMax M3.1 Flash）。主问题：按下回车、SSH 还没登录成功的那一秒里，到底发生了什么。
// 讲法：一次真实连接贯穿，按时间顺序拆，每一步说清「这一步防住了什么」。
// 英文目前是直译草稿，等中文确认后重译。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);            // 画面里的文字：tr('中文', 'English')

  const TOTAL = 256;
  const RAW = [
    {
      // 现象：敲下回车之后那一秒。标题卡落在定义之后。
      id: 'open', at: 0, chap: null, lead: 0.1, tail: 0.18,
      cues: [
        ['o1', { zh: '敲下 *ssh* 命令，回车，屏幕静了一秒。', en: 'Type the *ssh* command, press Enter. Silence.' }, { gap: 0.22 }],
        ['o2', { zh: '这一秒里，两台机器换出一把外人算不出的密钥。', en: 'Both machines agreed a key nobody else can compute.' }, { gap: 0.22 }],
        ['o3', { zh: '服务器亮出身份证明，你才被放进去。', en: 'The server shows who it is. Then you get in.' }, { gap: 0.22 }],
        ['o4', { zh: '这套流程叫 *SSH*，本片把它拆开看。', en: 'This is called *SSH*. We take it apart.' }, { gap: 0.22 }],
        ['oT', null, { pause: 2.2, gap: 0 }],
      ],
    },
    {
      // 它是什么：协议、年代、分层。传输层只认服务器，不认用户。
      id: 'what', at: 17.86, chap: null, lead: 0.1, tail: 0.18,
      cues: [
        ['w1', { zh: '*SSH* 是一套协议，不是一个程序。', en: '*SSH* is a protocol, not a program.' }, { gap: 0.22 }],
        ['w2', { zh: '1995 年，Tatu Ylonen 公开了第一个版本。', en: 'In 1995, Tatu Ylonen published the first version.' }, { gap: 0.22 }],
        ['w3', { zh: '2006 年，它成了标准文档 *RFC 4253*。', en: 'In 2006 it became a standard, RFC *4253*.' }, { gap: 0.22 }],
        ['w4', { zh: '它分成好几层，本片讲最底下那层。', en: 'It has several layers; this film covers the bottom one.' }, { gap: 0.22 }],
        ['w5', { zh: '这一层只认服务器是谁，不认你是谁。', en: 'This layer proves who the server is, never who you are.' }, { gap: 0.22 }],
        ['w6', { zh: '认你是谁，是上面另一个协议的事。', en: 'Proving who you is a protocol one layer up.' }, { gap: 0.22 }],
        ['w7', { zh: '现在用的 *ssh* 来自 OpenBSD 项目。', en: 'The *ssh* used today comes from the OpenBSD project.' }, { gap: 0.22 }],
      ],
    },
    {
      // 算法清单协商：各发一份清单，按偏好排序，取第一个共同的；没有就断开。
      id: 'kex', at: 45.03, chap: null, lead: 0.1, tail: 0.18,
      cues: [
        ['k1', { zh: '连上之后，两端先各发一份清单。', en: 'Once connected, both sides send a list.' }, { gap: 0.22 }],
        ['k2', { zh: '清单里写着自己支持哪些算法，按偏好排。', en: 'Each list names supported algorithms, by preference.' }, { gap: 0.22 }],
        ['k3', { zh: '加密算法取客户端清单里第一个对方有的。', en: 'The cipher is the first on the client list the server has.' }, { gap: 0.22 }],
        ['k4', { zh: '一个共同的都没有，双方当场断开。', en: 'With none in common, both sides disconnect.' }, { gap: 0.22 }],
        ['k5', { zh: '这一条连接用的软件是 OpenSSH 9.5p2。', en: 'The software here is OpenSSH 9.5p2.' }, { gap: 0.22 }],
        ['k6', { zh: '密钥交换用 *curve25519-sha256*。', en: 'Key exchange uses *curve25519-sha256*.' }, { gap: 0.22 }],
        ['k7', { zh: '主机身份用 *ssh-ed25519*。', en: 'The host identity uses *ssh-ed25519*.' }, { gap: 0.22 }],
        ['k8', { zh: '加密用 *chacha20-poly1305*。', en: 'Encryption uses *chacha20-poly1305*.' }, { gap: 0.22 }],
      ],
    },
    {
      // 密钥交换：迪菲-赫尔曼。双方各算一半，结果相同，这个数不过网。
      id: 'dh', at: 77.39, chap: null, lead: 0.1, tail: 0.18,
      cues: [
        ['d1', { zh: '换密钥，用的是一个双方各算一半的办法。', en: 'Both sides compute half of the key.' }, { gap: 0.22 }],
        ['d2', { zh: '方法叫 *Diffie-Hellman*。', en: 'The method is called *Diffie-Hellman*.' }, { gap: 0.22 }],
        ['d3', { zh: '客户端随机取一个数，算出 e，发给服务器。', en: 'The client picks x, computes e, sends it.' }, { gap: 0.22 }],
        ['d4', { zh: '服务器也随机取一个数，算出 f，发回来。', en: 'The server picks y, computes f, sends back.' }, { gap: 0.22 }],
        ['d5', { zh: '两边各自把对方的数乘上自己的秘密。', en: 'Each multiplies the other number by its secret.' }, { gap: 0.22 }],
        ['d6', { zh: '两边算出同一个数，只有它们算得出。', en: 'Both sides get the same number. Only they can.' }, { gap: 0.22 }],
        ['d7', { zh: '这个共同的密钥，没有在网络上传输过。', en: 'That shared key was never transmitted.' }, { gap: 0.22 }],
        ['d8', { zh: '窃听者只看到 e 和 f，算不出这个数。', en: 'A listener sees e and f, cannot compute it.' }, { gap: 0.22 }],
        ['d9', { zh: '但这套办法不认服务器，还得再验一次身份。', en: 'But this does not identify the server. Separate step.' }, { gap: 0.22 }],
      ],
    },
    {
      // 主机密钥：签名交换哈希，客户端验签，再跟 known_hosts 对照。
      id: 'hostkey', at: 109.93, chap: null, lead: 0.1, tail: 0.18,
      cues: [
        ['h1', { zh: '服务器有一把身份密钥，叫主机密钥。', en: 'The server has an identity key, the host key.' }, { gap: 0.22 }],
        ['h2', { zh: '刚才那个共同的数，和两边的标识，凑成一个哈希 H。', en: 'The shared number and both IDs hash into one.' }, { gap: 0.22, tts: { zh: '刚才那个共同的数，和两边的标识，凑成一个哈希值。', en: 'The shared number and both IDs hash into one.' } }],
        ['h3', { zh: '服务器用主机私钥给这个哈希签名。', en: 'The server signs that hash with the host private key.' }, { gap: 0.22 }],
        ['h4', { zh: '客户端用主机公钥验这个签名，对不上就断开。', en: 'The client checks the signature; mismatch ends it.' }, { gap: 0.22 }],
        ['h5', { zh: '公钥还得跟本地存的那份对得上，才算数。', en: 'It must match the copy stored locally.' }, { gap: 0.22 }],
        ['h6', { zh: '本地存这些公钥的地方叫 *known_hosts* 文件。', en: 'The local file holding these keys is *known_hosts*.' }, { gap: 0.22, tts: { zh: '本地存这些公钥的地方叫 known hosts 文件。', en: 'The local file holding these keys is known hosts.' } }],
        ['h7', { zh: '第一次连上，本地没有记录可比。', en: 'On the first connection there is nothing to compare.' }, { gap: 0.22 }],
        ['h8', { zh: '默认先问人一声，点头才写进文件。', en: 'By default it asks a person, then writes the file.' }, { gap: 0.22 }],
        ['h9', { zh: '以后再来，主机密钥变了会当场报错。', en: 'After that, a changed host key is reported immediately.' }, { gap: 0.22 }],
      ],
    },
    {
      // 密钥派生：六次哈希，A 到 F；之后全部加密，连包头一起。
      id: 'derive', at: 145.07, chap: null, lead: 0.1, tail: 0.18,
      cues: [
        ['r1', { zh: '身份对了，还要把共同的数变成能用的密钥。', en: 'Identity settled, the number must become real keys.' }, { gap: 0.22 }],
        ['r2', { zh: '办法是反复做哈希，每做一次加一个字母。', en: 'Hash repeatedly, adding a letter each time.' }, { gap: 0.22 }],
        ['r3', { zh: '一共算六次，字母从 A 排到 F。', en: 'Six hashes, the letters A through F.' }, { gap: 0.22 }],
        ['r4', { zh: 'A 和 B 是两个方向的初始向量。', en: 'A and B are the initial vectors per direction.' }, { gap: 0.22 }],
        ['r5', { zh: 'C、D 是加密密钥，E、F 是完整性密钥。', en: 'C and D are encryption keys, E and F integrity.' }, { gap: 0.22 }],
        ['r6', { zh: '从这一刻起，发出去的内容全部加密。', en: 'From then on, everything sent is encrypted.' }, { gap: 0.22 }],
        ['r7', { zh: '连包头一起加密，外面看不出传的是什么。', en: 'Even the header is encrypted. Nothing shows outside.' }, { gap: 0.22 }],
        ['r8', { zh: '每包都算一次校验码，传多了要换一次密钥。', en: 'Every packet carries a check code; long transfers rekey.' }, { gap: 0.22 }],
      ],
    },
    {
      // 用户认证：ssh-userauth 服务，公钥认证，报公钥、签数据、验签。
      id: 'userauth', at: 174.35, chap: null, lead: 0.1, tail: 0.18,
      cues: [
        ['a1', { zh: '服务器是谁已经清楚了，现在该证明你是谁。', en: 'The server is settled. Now you must prove who you are.' }, { gap: 0.22 }],
        ['a2', { zh: '接着客户端请求认证服务，叫 *ssh-userauth*。', en: 'The client requests the auth service, *ssh-userauth*.' }, { gap: 0.22 }],
        ['a3', { zh: '认证方法里，公钥认证是必须实现的一种。', en: 'Public key is the one auth method that must be implemented.' }, { gap: 0.22 }],
        ['a4', { zh: '客户端先把公钥报过去，服务器回一个确认包。', en: 'The client offers the public key; the server acknowledges.' }, { gap: 0.22 }],
        ['a5', { zh: '客户端用私钥签一份数据：会话标识、用户名、方法名。', en: 'The client signs with the private key: session id, user name.' }, { gap: 0.22 }],
        ['a6', { zh: '服务器拿公钥验这份签名，对了就放行。', en: 'The server checks the signature with the public key, then admits you.' }, { gap: 0.22 }],
        ['a7', { zh: '私钥始终留在本机，路上只有公钥和签名。', en: 'The private key never leaves this machine.' }, { gap: 0.22 }],
        ['a8', { zh: '这条连接走的正是公钥，口令没用上。', en: 'This connection used public key. No password was involved.' }, { gap: 0.22 }],
      ],
    },
    {
      // 边界：第一次连接的盲区、转发认证代理、端口转发；外加重换密钥的规矩。
      id: 'edge', at: 207.67, chap: null, lead: 0.1, tail: 0.18,
      cues: [
        ['e1', { zh: '这套办法有三处要留心。', en: 'There are three places to watch.' }, { gap: 0.22 }],
        ['e2', { zh: '第一处：第一次连接没有记录可比，是它自己的盲区。', en: 'First: on the first connection there is no record to compare.' }, { gap: 0.22 }],
        ['e3', { zh: '第二处：转发认证代理，等于把钥匙的用法也交出去。', en: 'Second: forwarding the agent hands over your keys’ use.' }, { gap: 0.22 }],
        ['e4', { zh: '对方主机上能碰代理的人，就能借你的身份登录。', en: 'Anyone reaching the agent there can log in as you.' }, { gap: 0.22 }],
        ['e5', { zh: '第三处：端口转发能在隧道里再开一条通道。', en: 'Third: port forwarding opens another channel in the tunnel.' }, { gap: 0.22 }],
        ['e6', { zh: '能到哪儿，取决于两端的配置，不只由加密保证。', en: 'How far it reaches depends on both ends, not encryption.' }, { gap: 0.22 }],
        ['e7', { zh: '还有一条：传够 1 GB 或连够一小时，就换一次密钥。', en: 'One more rule: after a gigabyte or an hour, keys change.' }, { gap: 0.22 }],
      ],
    },
    {
      // 结论：回到开头的那一秒。
      id: 'close', at: 237.34, chap: null, lead: 0.1, tail: 0.18,
      cues: [
        ['c1', { zh: '所以那一秒，做完了四件事。', en: 'In that second, four things happened.' }, { gap: 0.22 }],
        ['c2', { zh: '协商算法，换出密钥，验明服务器，证明自己。', en: 'Negotiate, agree a key, verify server, prove yourself.' }, { gap: 0.22 }],
        ['c3', { zh: '登录框出现前，这四件事已经做完了。', en: 'All four were done before the prompt appeared.' }, { gap: 0.22 }],
      ],
    },
    {
      // 片尾名单：策划、参与模型与分工、开源视频的仓库地址。7.5 秒静默，不配旁白。
      id: 'outro', at: 248.0, chap: null, lead: 0.5, tail: 0,
      cues: [
        ['z1', null, { pause: 7.5, credits: true, gap: 0 }],
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。先用 kit/tools/tts_probe.js 试，再用 asr.js 回听。
  const SAY = {
    zh: [
      [/Diffie-Hellman/g, '迪菲-赫尔曼'],
      [/known_hosts/g, 'known hosts'],
      [/OpenSSH/g, 'Open SSH'],
      [/ssh-ed25519/g, 'ssh ed25519'],
      [/curve25519-sha256/g, 'curve25519 的 sha256'],
      [/chacha20-poly1305/g, 'chacha20 的 poly1305'],
      [/ssh-userauth/g, 'ssh userauth'],
      [/RFC 4253/g, 'R F C 四二五三'],
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

  // 没有实测时长时的估算（合成旁白之前的占位）
  const estimate = (text) => (LANG === 'zh' ? 0.35 + text.replace(/[，。：；、\s]/g, '').length / 5.2 : 0.3 + text.split(/\s+/).length / 2.7);

  // 由脚本与实测时长算出整条时间线；浏览器端排动画、Node 端混音与检查都用它
  function layoutScript(DUR) {
    DUR = DUR || {};
    let t = 0;
    const cues = {}, scenes = [], order = [], problems = [];
    const pinTo = (at, what) => {            // 把时间线补齐到定点；已经超过就记为问题
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
