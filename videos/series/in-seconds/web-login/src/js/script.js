// 旁白脚本：每个 cue = [句号, 字幕, {tts, gap, pause}]
// - 多语言时字幕写成 { zh: '…', en: '…' }；tts、gap、pause 同理
// - 字幕里 *词* 表示强调；tts 缺省时由字幕按 SAY 表换成读法（字幕写正式拼写，读法只放在 SAY 表或 tts 字段）
// - gap：该句结束到下一句开始的停顿（秒，缺省 0.3）；pause：无旁白的纯画面停顿
// 语言：浏览器取 ?lang=，Node 取环境变量 VLANG；缺省为 zh。浏览器与 Node 共用本文件（工具读它排时间线）。
// 翻译以中文为底本。本轮先交审中文；英文字幕是同步草稿，中文确认后再逐句修订并单独导出。
//
// 本集时长 200 秒，与标题相同。场景 at 是开始时刻；说不完记入 L.problems。
// 没有章节卡；片名落在 o3/o4 之间。公式与协议名只在解释需要时出现。
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
        ['o1', { zh: '每天登录，网站到底在验证什么？', en: 'What is a site actually checking when you log in?' }, { gap: 0.45 }],
        ['o2', { zh: '口令、验证码、指纹、Google 登录，看起来很多。', en: 'Passwords, codes, fingerprints, Google sign-in: many forms.' }, { gap: 0.5 }],
        ['o3', { zh: '其实都在回答：你是谁，怎么证明，之后怎么记住。', en: 'All answer three questions: who, proof, and memory.' }, { gap: 0.55 }],
        ['o4', { zh: '先看一张临时通行证。', en: 'Start with one temporary pass.' }, { gap: 0.5 }],
        ['o5', { zh: '它凭什么能代表你？', en: 'Why can it stand for you?' }, { gap: 0.4 }],
      ],
    },
    {
      id: 'credentials', at: 19, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['c1', { zh: '第一个问题：你是谁。账号就是你的声明。', en: 'First: who are you? An account is your claim.' }, { gap: 0.45 }],
        ['c2', { zh: '第二个问题：你怎么证明。最常见的是口令。', en: 'Second: how do you prove it? Usually a password.' }, { gap: 0.5 }],
        ['c3', { zh: '口令要经 TLS 加密送到服务器。', en: 'The password travels to the server over TLS.' }, { gap: 0.5 }],
        ['c4', { zh: '服务器不存口令，只存唯一盐和慢哈希。', en: 'The server keeps a random salt and a slow hash, not the password.' }, { gap: 0.5 }],
        ['c5', { zh: '加盐后，相同口令结果不同；慢哈希拖慢猜测。', en: 'A salt changes equal passwords; a slow hash slows guessing.' }, { gap: 0.5 }],
        ['c6', { zh: '口令正确，只证明这一刻你知道它。', en: 'A correct password proves only that you know it now.' }, { gap: 0.5 }],
        ['c7', { zh: '还有一次性码：短信、邮件、验证器 App。', en: 'There are one-time codes: SMS, email, TOTP.' }, { gap: 0.5 }],
        ['c8', { zh: '它们方便，但能被实时转发，不防钓鱼。', en: 'They are convenient, relayable, and not phishing-resistant.' }, { gap: 0.5 }],
        ['c9', { zh: '多因素里，passkey 用 WebAuthn 生成密钥对。', en: 'For stronger proof, a passkey uses WebAuthn to create a key pair.' }, { gap: 0.5 }],
        ['c10', { zh: '服务器只存公钥；私钥签名，凭据绑定网站域名。', en: 'The server keeps the public key; the private key signs for this site.' }, { gap: 0.45 }],
      ],
    },
    {
      id: 'session', at: 66, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['s1', { zh: '第三个问题：登录之后，网站怎么记住你。', en: 'Third: after login, how does the site remember you?' }, { gap: 0.5 }],
        ['s2', { zh: 'HTTP 不记得上一次请求。', en: 'HTTP does not remember the last request.' }, { gap: 0.45 }],
        ['s3', { zh: '传统做法：服务器生成随机编号，放进 cookie。', en: 'The classic way: a random ID in a cookie.' }, { gap: 0.5 }],
        ['s4', { zh: '浏览器每次请求自动带上，服务器查会话表。', en: 'The browser sends it; the server checks a session store.' }, { gap: 0.5 }],
        ['s5', { zh: '另一种做法：把身份签进 token，服务器不存表。', en: 'Another way: sign identity into a token, with no session store.' }, { gap: 0.5 }],
        ['s6', { zh: 'JWT 就是一种 token：有签名，但不默认加密。', en: 'A JWT is such a token: signed, not encrypted by default.' }, { gap: 0.5 }],
        ['s7', { zh: '签名证明没被改，不隐藏内容；别把秘密放进去。', en: 'A signature proves integrity, not secrecy. Do not put secrets in it.' }, { gap: 0.5 }],
        ['s8', { zh: 'cookie 和 token 都认票不认人：谁拿着，谁就能用。', en: 'Cookie and token are both bearer: whoever holds it is you.' }, { gap: 0.5 }],
        ['s9', { zh: '所以要短命、绑定用途、能撤销，登录后换编号。', en: 'So: short-lived, audience-bound, revocable, and rotated after login.' }, { gap: 0.45 }],
      ],
    },
    {
      id: 'federation', at: 107.7, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['f1', { zh: '有时，是别的网站替你证明。', en: 'Sometimes another site does the proving.' }, { gap: 0.5 }],
        ['f2', { zh: '点“用 Google 登录”，你离开了本站。', en: 'Click “Sign in with Google” and you leave this site.' }, { gap: 0.5 }],
        ['f3', { zh: 'OAuth 2.0 是授权，不说你是谁。', en: 'OAuth 2.0 is authorization: what you may do, not who you are.' }, { gap: 0.5 }],
        ['f4', { zh: 'OIDC 加了身份层，返回 ID Token。', en: 'OIDC adds an identity layer and returns an ID token.' }, { gap: 0.5 }],
        ['f5', { zh: '授权码短命、单次、绑定回调；PKCE 再验一次。', en: 'Code: short-lived, single-use, bound; PKCE verifies.' }, { gap: 0.5 }],
        ['f6', { zh: '企业里常用 SAML 单点登录：一次登录，多个系统。', en: 'Enterprises use SAML SSO: one login, many apps.' }, { gap: 0.5 }],
        ['f7', { zh: '但联合登录只是转移信任，不消除风险。', en: 'Federation moves trust; it does not remove risk.' }, { gap: 0.45 }],
      ],
    },
    {
      id: 'attacks', at: 140.6, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['a1', { zh: '这些机制都怕几件事。', en: 'All these mechanisms fear a few things.' }, { gap: 0.45 }],
        ['a2', { zh: '钓鱼：假站点骗口令、OTP，甚至实时转发。', en: 'Phishing: a fake site takes a password or OTP.' }, { gap: 0.5 }],
        ['a3', { zh: '撞库：拿别处泄露的口令来试。', en: 'Credential stuffing: trying passwords leaked elsewhere.' }, { gap: 0.5 }],
        ['a4', { zh: 'XSS 读走没设 HttpOnly 的 cookie。', en: 'XSS reads cookies that lack HttpOnly.' }, { gap: 0.5 }],
        ['a5', { zh: 'CSRF 让浏览器带 cookie 发请求；SameSite 在挡。', en: 'CSRF sends the cookie via your browser; SameSite blocks it.' }, { gap: 0.5 }],
        ['a6', { zh: '会话固定先塞编号；登录后不换就被接管。', en: 'Fixation plants an ID; without rotation, it takes over.' }, { gap: 0.5 }],
        ['a7', { zh: 'JWT 也一样：谁拿到 token，谁就能用到它过期。', en: 'A JWT: whoever holds it uses it until expiry.' }, { gap: 0.45 }],
      ],
    },
    {
      id: 'close', at: 172.6, chap: null, lead: 0.5, tail: 0.15,
      cues: [
        ['e1', { zh: '所以登录不是一道口令题。', en: 'So login is not just a password question.' }, { gap: 0.4 }],
        ['e2', { zh: '它是三件事：声明、证明、记住。', en: 'It is three things: claim, proof, memory.' }, { gap: 0.4 }],
        ['e3', { zh: '再加上联合登录和攻击面，每一环都有假设。', en: 'Add federation and attacks; every link has assumptions.' }, { gap: 0.4 }],
        ['e4', { zh: '验证你是你，是让每一环都难被冒用。', en: 'Verifying you means making every link hard to impersonate.' }, { gap: 0.3 }],
        ['e5', { zh: '而“你”不是一张脸，是一组可验证的凭证。', en: 'And “you” is a set of verifiable credentials.' }, { gap: 0.1 }],
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
      [/session ID/g, 'session I D'],
      [/passkey/g, 'pass key'],
      [/SAML/g, 'S A M L'],
      [/SSO/g, 'S S O'],
      [/Set-Cookie/g, 'set cookie'],
      [/SameSite/g, 'same site'],
      [/HttpOnly/g, 'http only'],
      [/Argon2id/g, 'argon two I D'],
      [/WebAuthn/g, 'web auth N'],
      [/OAuth 2\.0/g, 'O auth two point zero'],
      [/OIDC/g, 'O I D C'],
      [/PKCE/g, 'P K C E'],
      [/JWT/g, 'J W T'],
      [/ID Token/g, 'I D token'],
      [/TLS/g, 'T L S'],
      [/\bOTP\b/g, 'O T P'],
      [/\bXSS\b/g, 'X S S'],
      [/\bCSRF\b/g, 'C S R F'],
      [/cookie/g, 'cookie'],
      [/challenge/g, 'challenge'],
      [/origin/g, 'origin'],
    ],
    en: [
      [/Argon2id/g, 'Argon two I D'],
      [/passkey/g, 'pass key'],
      [/SAML/g, 'S A M L'],
      [/SSO/g, 'S S O'],
      [/WebAuthn/g, 'Web Auth N'],
      [/AAL2/g, 'A A L two'],
      [/\bOTP\b/g, 'O T P'],
      [/\bXSS\b/g, 'X S S'],
      [/\bCSRF\b/g, 'C S R F'],
      [/\bOIDC\b/g, 'O I D C'],
      [/\bJWT\b/g, 'J W T'],
      [/\bPKCE\b/g, 'P K C E'],
      [/\bTLS\b/g, 'T L S'],
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
