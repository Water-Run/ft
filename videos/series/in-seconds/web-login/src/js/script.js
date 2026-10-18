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
        ['o1', { zh: '这串字符不是名字，也不是密码。', en: 'This string is not your name or password.' }, { gap: 0.45 }],
        ['o2', { zh: '但网站看到它，就知道是你。', en: 'But the site sees it and knows you.' }, { gap: 0.5 }],
        ['o3', { zh: '登录成功后，服务器发来的就是它。', en: 'After login, the server sends this.' }, { gap: 0.55 }],
        ['o4', { zh: '一张临时的 session ID。', en: 'A temporary pass: a session ID.' }, { gap: 0.5 }],
        ['o5', { zh: '它凭什么能代表你？', en: 'Why can it stand for you?' }, { gap: 0.4 }],
      ],
    },
    {
      id: 'password', at: 18, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['p1', { zh: '先看一次登录，到底交换了什么。', en: 'What happens in a login.' }, { gap: 0.45 }],
        ['p2', { zh: '浏览器用 TLS 把口令送到服务器。', en: 'The browser sends it over TLS.' }, { gap: 0.45 }],
        ['p4', { zh: '服务器不存口令，只存 salt 和慢哈希。', en: 'It stores a salt and a slow hash.' }, { gap: 0.5 }],
        ['p5', { zh: 'salt 让相同口令也得到不同结果。', en: 'A salt makes identical passwords hash differently.' }, { gap: 0.5 }],
        ['p6', { zh: '慢哈希故意拖慢计算。', en: 'A slow hash deliberately takes work.' }, { gap: 0.5 }],
        ['p7', { zh: '登录时，服务器用同样参数再算一次。', en: 'At login, it recomputes the same way.' }, { gap: 0.5 }],
        ['p8', { zh: '泄露的是哈希，不是口令。', en: 'A leak exposes hashes, not passwords.' }, { gap: 0.5 }],
        ['p9', { zh: '口令正确，只证明这一刻你知道它。', en: 'A correct password proves only that you know it.' }, { gap: 0.5 }],
        ['p10', { zh: '下一次请求，不会再带口令。', en: 'The next request does not carry the password.' }, { gap: 0.45 }],
      ],
    },
    {
      id: 'session', at: 49.6, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['s1', { zh: '服务器得记住，刚才是你。', en: 'The server has to remember that it was you.' }, { gap: 0.45 }],
        ['s2', { zh: '它生成一个无意义的会话编号。', en: 'It creates a meaningless session identifier.' }, { gap: 0.45 }],
        ['s3', { zh: '放进 Set-Cookie，交给浏览器。', en: 'It puts it in Set-Cookie and gives it to the browser.' }, { gap: 0.5 }],
        ['s4', { zh: '之后每次请求，浏览器自动带上它。', en: 'Every later request carries it automatically.' }, { gap: 0.5 }],
        ['s5', { zh: '服务器查会话表，找回你的身份。', en: 'The server looks it up and finds your identity.' }, { gap: 0.5 }],
        ['s6', { zh: '谁拿着这个编号，谁就被当成你。', en: 'Whoever holds the ID is treated as you.' }, { gap: 0.5 }],
        ['s7', { zh: 'cookie 的 Secure、HttpOnly、SameSite。', en: 'The cookie has Secure, HttpOnly, and SameSite.' }, { gap: 0.5 }],
        ['s8', { zh: '登录后换新编号，注销时让它失效。', en: 'Rotate the ID after login; invalidate it on logout.' }, { gap: 0.45 }],
      ],
    },
    {
      id: 'attacks', at: 85, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['a1', { zh: '这张通行证有三条失窃路径。', en: 'This pass has three common theft paths.' }, { gap: 0.45 }],
        ['a2', { zh: 'XSS 让攻击者的脚本读走 cookie。', en: 'XSS lets an attacker’s script read the cookie.' }, { gap: 0.5 }],
        ['a3', { zh: 'CSRF 不用读，它让浏览器代发请求。', en: 'CSRF makes the browser send the request for you.' }, { gap: 0.5 }],
        ['a4', { zh: 'session fixation 先塞给你一个编号。', en: 'Session fixation plants an ID on you first.' }, { gap: 0.5 }],
        ['a5', { zh: '你用它登录，攻击者就接管了。', en: 'You log in with it, and the attacker takes over.' }, { gap: 0.45 }],
      ],
    },
    {
      id: 'factors', at: 113, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['f1', { zh: '只靠口令，挡不住钓鱼和撞库。', en: 'A password alone stops neither phishing nor stuffing.' }, { gap: 0.45 }],
        ['f2', { zh: '因子分三类：知道、拥有、本身。', en: 'Factors are knowledge, possession, and inherence.' }, { gap: 0.5 }],
        ['f3', { zh: '短信码是第二种，但能被实时转发。', en: 'An SMS code can be relayed live.' }, { gap: 0.5 }],
        ['f4', { zh: 'OTP 不防钓鱼，假站点能让你念给它。', en: 'OTP can be relayed by a fake site.' }, { gap: 0.5 }],
        ['f5', { zh: 'AAL2 要求两个不同因子。', en: 'AAL2 requires two different factors.' }, { gap: 0.5 }],
        ['f6', { zh: 'WebAuthn 让认证器生成一对密钥。', en: 'WebAuthn has an authenticator create a key pair.' }, { gap: 0.5 }],
        ['f7', { zh: '服务器只存公钥，登录时给一个 challenge。', en: 'The server stores the public key and sends a challenge.' }, { gap: 0.5 }],
        ['f8', { zh: '凭据绑定 origin，钓鱼站拿不到签名。', en: 'The credential is bound to the origin, so phishing fails.' }, { gap: 0.45 }],
      ],
    },
    {
      id: 'federated', at: 145.7, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['g1', { zh: '还有一种登录，让别的网站替你证明。', en: 'Another login lets a different site vouch for you.' }, { gap: 0.5 }],
        ['g2', { zh: '点“用 Google 登录”，你离开了本站。', en: 'Click “Sign in with Google” and you leave this site.' }, { gap: 0.5 }],
        ['g3', { zh: 'OAuth 2.0 是授权，不是认证。', en: 'OAuth 2.0 is authorization, not authentication.' }, { gap: 0.5 }],
        ['g4', { zh: '授权码短命、只能用一次，还要绑定回调。', en: 'The code is short-lived, single-use, and bound to the redirect.' }, { gap: 0.5 }],
        ['g5', { zh: 'PKCE 让截到授权码的人也换不到 token。', en: 'PKCE stops an intercepted code from becoming a token.' }, { gap: 0.5 }],
        ['g6', { zh: 'ID Token 是 JWT：签名，但不默认加密。', en: 'The ID token is signed, not encrypted.' }, { gap: 0.5 }],
        ['g7', { zh: 'OIDC 在 OAuth 上加了一层身份。', en: 'OIDC adds an identity layer on top of OAuth.' }, { gap: 0.45 }],
      ],
    },
    {
      id: 'close', at: 177.4, chap: null, lead: 0.5, tail: 0.15,
      cues: [
        ['c1', { zh: '口令证明知道，cookie 证明会话。', en: 'The password proves knowledge; the cookie proves this session.' }, { gap: 0.25 }],
        ['c2', { zh: 'MFA 证明你还有别的东西。', en: 'MFA proves you have something else.' }, { gap: 0.25 }],
        ['c3', { zh: '每一环都有假设，攻击者只找最弱的一环。', en: 'Every link has assumptions; attackers pick the weakest.' }, { gap: 0.4 }],
        ['c4', { zh: '验证你是你，是让每一步都难被冒用。', en: 'Verifying you means making every step hard to impersonate.' }, { gap: 0.1 }],
      ],
    },
    {
      id: 'outro', at: 192.5, chap: null, lead: 0.5, tail: 0,
      cues: [
        ['z1', null, { pause: 7, gap: 0 }],
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。先用 kit/tools/tts_probe.js 试，再用 asr.js 回听。
  const SAY = {
    zh: [
      [/session ID/g, 'session I D'],
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
      [/AAL2/g, 'A A L two'],
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
