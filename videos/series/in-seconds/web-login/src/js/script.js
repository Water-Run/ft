// 旁白脚本：每个 cue = [句号, 字幕, {tts, gap, pause}]
// - 多语言时字幕写成 { zh: '…', en: '…' }；tts、gap、pause 同理
// - 字幕里 *词* 表示强调；tts 缺省时由字幕按 SAY 表换成读法（字幕写正式拼写，读法只放在 SAY 表或 tts 字段）
// - gap：该句结束到下一句开始的停顿（秒，缺省 0.3）；pause：无旁白的纯画面停顿
// 语言：浏览器取 ?lang=，Node 取环境变量 VLANG；缺省为 zh。浏览器与 Node 共用本文件（工具读它排时间线）。
// 翻译以中文为底本。本轮只交审中文；英文是上一轮遗留的草稿，句号已对齐但超时，中文确认后重译并单独导出。
//
// 本集时长 200 秒，与标题相同。场景 at 是开始时刻；说不完记入 L.problems。
// 没有章节卡；片名卡落在 oT（o3b 问句之后）。协议名只在解释需要时出现。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);

  const TOTAL = 200;
  const RAW = [
    {
      id: 'open', at: 0, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['o1', { zh: '你输入账号和密码，登录一个网站。', en: 'You enter your account and password, and log in.' }, { gap: 0.3 }],
        ['o2', { zh: '之后看订单、改地址，它再也没问过密码。', en: 'After that, orders, a new address: it never asks again.' }, { gap: 0.45 }],
        ['o3', { zh: 'Web 的登录机制是什么样的？', en: 'How does Web login work?' }, { gap: 0.25, tts: { zh: 'Web 的登录机制，是什么样的？', en: null } }],
        ['o3b', { zh: '服务器是怎么知道，你，是你？', en: 'How does the server know that you are you?' }, { gap: 0.2, tts: { zh: null, en: 'How does the server know, that you, are you?' } }],
        ['oT', null, { pause: 2.5 }],
        ['o4', { zh: '这其实是三件事：第一次认出你，叫认证；', en: 'Three jobs. Recognizing you the first time: authentication.' }, { gap: 0.2 }],
        ['o5', { zh: '之后每个请求都认得你，叫会话；', en: 'Knowing you on every later request: the session.' }, { gap: 0.2 }],
        ['o6', { zh: '你能做什么，叫授权。', en: 'What you may do: authorization.' }, { gap: 0.4 }],
      ],
    },
    {
      id: 'session', at: 27.25, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['s1', { zh: '先说会话。网页用的 HTTP，本身不记得上一个请求。', en: 'Sessions first. HTTP, the Web’s protocol, forgets each request.' }, { gap: 0.3 }],
        ['s2', { zh: '所以登录成功时，服务器自己记一条会话：', en: 'So at login, the server writes down a session:' }, { gap: 0.2 }],
        ['s3', { zh: '你是谁、能做什么、何时过期。', en: 'who you are, what you may do, when it expires.' }, { gap: 0.3 }],
        ['s4', { zh: '再给它一个随机编号，叫 Session ID，', en: 'then gives it a random number, the Session ID,' }, { gap: 0.2 }],
        ['s5', { zh: '装进 Cookie 交给浏览器。', en: 'and hands it to the browser in a Cookie.' }, { gap: 0.3, tts: { zh: null, en: 'and hands it to the browser, in a Cookie.' } }],
        ['s6', { zh: '之后每次请求，浏览器都自动带上它，', en: 'After that, the browser sends it with each request,' }, { gap: 0.2 }],
        ['s7', { zh: '服务器拿编号查表，就认出了你。', en: 'and the server looks the number up and knows you.' }, { gap: 0.45 }],
        ['s8', { zh: 'Cookie 只负责运送，记住你的是服务器上的会话。', en: 'The Cookie only carries it; the server’s session remembers you.' }, { gap: 0.6 }],
        ['s9', { zh: '代价是：谁拿到这个编号，服务器就把谁当成你。', en: 'The cost: whoever holds that number is you, to the server.' }, { gap: 0.3 }],
        ['s10', { zh: '别的网页替你发请求，同样带着编号：这叫跨站请求伪造。', en: 'Another page’s request for you carries it too: cross-site request forgery.' }, { gap: 0.5 }],
      ],
    },
    {
      id: 'jwt', at: 65.25, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['j1', { zh: '网站一大，很多台服务器都得查同一张表。', en: 'On a big site, many servers must check one table.' }, { gap: 0.3 }],
        ['j2', { zh: '另一种做法不查表：把你是谁写进一张票，由服务器签名。', en: 'Another way skips it: who you are goes on a ticket the server signs.' }, { gap: 0.3 }],
        ['j3', { zh: '常用的格式叫 JWT：头部、内容、签名三段。', en: 'A common format is JWT: header, payload, signature.' }, { gap: 0.3 }],
        ['j4', { zh: '内容只是编码，谁都能读；但改一个字，签名就对不上。', en: 'It is only encoded, so anyone can read it; change one character and the signature fails.' }, { gap: 0.3 }],
        ['j5', { zh: '服务器验过签名和有效期，不用查表就认出你。', en: 'Checking signature and expiry, a server knows you without a lookup.' }, { gap: 0.45 }],
        ['j6', { zh: '代价是票发出去，就很难提前收回；', en: 'The cost: once issued, a ticket is hard to take back early;' }, { gap: 0.2 }],
        ['j7', { zh: '所以有效期设得很短，过期再用另一张长期票换。', en: 'so it is kept short, and renewed with a long-lived one.' }, { gap: 0.3 }],
        ['j7b', { zh: '短的叫 Access Token，长的叫 Refresh Token。', en: 'The short one is the Access Token; the long one, the Refresh Token.' }, { gap: 0.5 }],
      ],
    },
    {
      id: 'authn', at: 102, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['p1', { zh: '那第一次，是怎么认出你的？', en: 'So how does it recognize you the first time?' }, { gap: 0.45, tts: { zh: null, en: 'So how does it recognize you, the first time?' } }],
        ['p2', { zh: '先说密码：服务器只存它的哈希，一个算不回去的摘要。', en: 'Take passwords: the server keeps only a hash that cannot be reversed.' }, { gap: 0.2 }],
        ['p3', { zh: '你输入的密码照样算一遍，一致就通过。', en: 'What you type is hashed the same way; a match lets you in.' }, { gap: 0.2 }],
        ['p3b', { zh: '而且这一步故意算得很慢，表被偷了，也难逐个猜出来。', en: 'And it is slow on purpose: a stolen table is hard to guess back.' }, { gap: 0.3 }],
        ['p4', { zh: '它证明你知道一个秘密，但会被假网站骗走：这叫钓鱼。', en: 'It proves that you know a secret, but fake sites can steal it: phishing.' }, { gap: 0.3 }],
        ['p5', { zh: '短信码证明你有这个号码，但同样能被假网站转走。', en: 'An SMS code proves you have the phone; fake sites relay it too.' }, { gap: 0.45 }],
        ['p6', { zh: 'passkey 不同：设备生成一对钥匙，服务器只存公钥。', en: 'A passkey differs: the device makes a key pair; the server keeps the public key.' }, { gap: 0.2, tts: { zh: 'pass key 不同：设备生成一对儿钥匙，服务器只存公钥。', en: null } }],
        ['p7', { zh: '登录时你按下指纹，设备用私钥给服务器的随机数签名；', en: 'At login you touch the sensor; the device signs a challenge with the private key;' }, { gap: 0.2 }],
        ['p7b', { zh: '服务器用公钥一验，就知道是你。', en: 'the server checks it with the public key: it is you.' }, { gap: 0.3 }],
        ['p8', { zh: '这把钥匙只给注册它的网站签名，假网站拿不到能用的。', en: 'The key signs only for its own site; fakes get nothing usable.' }, { gap: 0.45 }],
        ['p9', { zh: '选图片、拖滑块的验证码，只分辨人和程序，不证明身份。', en: 'Picture puzzles and sliders tell people from programs, not who you are.' }, { gap: 0.5 }],
      ],
    },
    {
      id: 'oauth', at: 149.5, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['a1', { zh: '“用另一个平台的账号登录”，检查你的是那个平台。', en: 'With “sign in with another platform,” that platform checks you.' }, { gap: 0.3 }],
        ['a2', { zh: '你在平台登录、点同意，平台把你送回来，附上一次性码，', en: 'You log in there, agree, and come back with a one-time code,' }, { gap: 0.2 }],
        ['a3', { zh: '网站再拿它去换票。', en: 'which the site trades for tickets.' }, { gap: 0.2 }],
        ['a3b', { zh: '这套流程叫 OAuth 2.0。', en: 'That flow is OAuth 2.0.' }, { gap: 0.3 }],
        ['a4', { zh: '它本是授权：换来的 Access Token 只说能做什么。', en: 'It is authorization: the Access Token only says what may be done.' }, { gap: 0.3 }],
        ['a5', { zh: '要说明你是谁，靠上面加的一层 OIDC：', en: 'Saying who you are takes a layer on top, OIDC:' }, { gap: 0.2 }],
        ['a6', { zh: '再给一张签了名的 ID Token，写明你是谁、发给谁。', en: 'a signed ID Token naming who you are and which site it is for.' }, { gap: 0.3 }],
        ['a7', { zh: '代价是信任集中：平台账号失守，这些网站一起失守。', en: 'The cost: trust concentrates. Lose that account, and those sites fall with it.' }, { gap: 0.6 }],
      ],
    },
    {
      id: 'close', at: 181.75, chap: null, lead: 0.5, tail: 0.15,
      cues: [
        ['e1', { zh: '第一次看你拿出的证据，之后认你带回的编号或票。', en: 'First, the proof you show; after that, the number or ticket you bring back.' }, { gap: 0.45 }],
        ['e2', { zh: '服务器认的从来不是你本人，而是你出示的证据。', en: 'The server never recognizes you, only the proof you present.' }, { gap: 0.1 }],
      ],
    },
    {
      id: 'outro', at: 192, chap: null, lead: 0.5, tail: 0,
      cues: [
        ['z1', null, { pause: 7.5, gap: 0 }],
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。先用 kit/tools/tts_probe.js 试，再用 asr.js 回听。
  const SAY = {
    zh: [
      [/Session ID/g, 'session I D'],
      [/Access Token/g, 'access token'],
      [/Refresh Token/g, 'refresh token'],
      [/ID Token/g, 'I D token'],
      [/OAuth 2\.0/g, 'O auth 二点零'],
      [/passkey/g, 'pass key'],
      [/OIDC/g, 'O I D C'],
      [/JWT/g, 'J W T'],
      [/HTTP/g, 'H T T P'],
      [/Cookie/g, 'cookie'],
    ],
    en: [
      [/passkey/g, 'pass key'],
      [/\bOIDC\b/g, 'O I D C'],
      [/\bJWT\b/g, 'J W T'],
      [/OAuth 2\.0/g, 'O auth two point oh'],
    ],
  };
  const strip = (s) => s.replace(/\*/g, '');
  const ttsNorm = (s) => { for (const [re, to] of SAY[LANG] || []) s = s.replace(re, to); return s; };
  const SCRIPT = RAW.map((sc) => ({
    ...sc, chap: sc.chap ? [sc.chap[0], pick(sc.chap[1])] : null,
    cues: sc.cues.map(([id, cap, o = {}]) => [id, pick(cap), { ...o, tts: pick(o.tts), gap: pick(o.gap), pause: pick(o.pause) }]),
  }));
  const ttsText = (c) => (c[2] && c[2].tts) || ttsNorm(strip(c[1]) + (LANG === 'zh' ? '。' : ''));

  // 没有实测时长时的估算（合成旁白之前的占位）
  const estimate = (text) => (LANG === 'zh' ? 0.35 + text.replace(/[，。：；、\s]/g, '').length / 5.2 : 0.3 + text.split(/\s+/).length / 2.7);

  // 由脚本与实测时长算出整条时间线；浏览器端排动画、Node 端混音与检查都用它
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
