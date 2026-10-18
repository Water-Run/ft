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
        ['o1', { zh: '你打开一个网站，输入账号和密码。', en: 'You open a site and type an account and password.' }, { gap: 0.45 }],
        ['o2', { zh: '服务器凭什么确认，屏幕这边真的是你？', en: 'How does the server confirm it is really you?' }, { gap: 0.5 }],
        ['o3', { zh: '口令、短信码、Google 登录、指纹，都是证据。', en: 'Passwords, SMS codes, Google sign-in, fingerprints: all evidence.' }, { gap: 0.5 }],
        ['o4', { zh: '区别在于，服务器要验证什么。', en: 'What differs is what the server verifies.' }, { gap: 0.4 }],
      ],
    },
    {
      id: 'password', at: 18, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['p1', { zh: '网站先让你报上账号，再输入口令。', en: 'The site asks for an account, then a password.' }, { gap: 0.45 }],
        ['p2', { zh: '口令经 TLS 加密送到服务器。', en: 'The password goes to the server over TLS.' }, { gap: 0.45 }],
        ['p3', { zh: '服务器不保存口令，只保存盐和慢哈希。', en: 'The server stores a salt and a slow hash, not the password.' }, { gap: 0.5 }],
        ['p4', { zh: '它加盐、慢哈希，再和保存的结果比对。', en: 'It hashes the input with the same salt and compares.' }, { gap: 0.5 }],
        ['p5', { zh: '一致，就确认你知道这个口令。', en: 'A match confirms that you know the password.' }, { gap: 0.5 }],
        ['p6', { zh: '但口令正确，只证明你知道。', en: 'But that only proves knowledge.' }, { gap: 0.5 }],
        ['p7', { zh: '它不证明下一次请求还是你。', en: 'It does not prove the next request is you.' }, { gap: 0.4 }],
      ],
    },
    {
      id: 'factors', at: 48, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['k1', { zh: '短信码验证你拥有手机，但验证码能被实时转发。', en: 'An SMS code verifies you have the phone, but it can be relayed.' }, { gap: 0.5 }],
        ['k3', { zh: 'passkey 验证的是另一件事：你持有私钥。', en: 'A passkey verifies something else: you hold the private key.' }, { gap: 0.5 }],
        ['k4', { zh: '注册时服务器只存公钥；登录时发随机挑战。', en: 'The server stores the public key and sends a random challenge.' }, { gap: 0.5 }],
        ['k5', { zh: '认证器用私钥签名，服务器用公钥验证，签名绑定域名。', en: 'The authenticator signs; the server verifies, bound to the domain.' }, { gap: 0.4 }],
      ],
    },
    {
      id: 'session', at: 70, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['s1', { zh: '登录成功后，服务器要记住这次验证结果。', en: 'After login, the server remembers this verification result.' }, { gap: 0.45 }],
        ['s2', { zh: 'HTTP 不记得上一次请求，服务器生成随机会话编号。', en: 'HTTP does not remember; the server makes a random session ID.' }, { gap: 0.5 }],
        ['s3', { zh: '编号放进 cookie，浏览器之后每次请求自动带上。', en: 'It goes into a cookie, sent automatically on later requests.' }, { gap: 0.5 }],
        ['s4', { zh: '服务器查会话表：编号存在、没过期，就认这次会话。', en: 'The server checks its table: ID exists, not expired, session accepted.' }, { gap: 0.5 }],
        ['s6', { zh: '编号泄露就能冒充你；登录后换新编号，注销时让它失效。', en: 'A leaked ID impersonates you; rotate and invalidate it on logout.' }, { gap: 0.5 }],
        ['j1', { zh: '会话表有个麻烦：服务器一多，就要共享这张表。', en: 'One problem: many servers must share that session table.' }, { gap: 0.5 }],
        ['j2', { zh: '另一种做法，是把验证结果放进签名令牌，服务器不存表。', en: 'Another way: put the result in a signed token, with no table.' }, { gap: 0.5 }],
        ['j3', { zh: 'JWT 就是这种令牌：头部、载荷、签名。', en: 'A JWT is such a token: header, payload, signature.' }, { gap: 0.5 }],
        ['j4', { zh: '前两段只是编码，不是加密；谁拿到都能读。', en: 'The first two parts are encoded, not encrypted; anyone can read them.' }, { gap: 0.5 }],
        ['j5', { zh: '服务器验证签名，再查有效期和受众。', en: 'The server verifies the signature, then expiry and audience.' }, { gap: 0.5 }],
        ['j6', { zh: '代价是撤销麻烦，所以要短命；token 谁拿到谁用。', en: 'The cost is revocation; keep it short-lived. Whoever holds it can use it.' }, { gap: 0.4 }],
      ],
    },
    {
      id: 'federation', at: 126, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['f1', { zh: '还有一种验证：让 Google 或企业 SSO 替你证明。', en: 'Another kind of verification: Google or enterprise SSO vouches for you.' }, { gap: 0.5 }],
        ['f2', { zh: '你被带到第三方登录，再带着授权码回来。', en: 'You log in there, then return with a code.' }, { gap: 0.5 }],
        ['f3', { zh: 'OAuth 解决授权；OIDC 加身份层，返回 ID Token。', en: 'OAuth handles authorization; OIDC adds identity and returns an ID token.' }, { gap: 0.5 }],
        ['f4', { zh: '原网站验证 ID Token 的签名和受众，才相信结果。', en: 'The site verifies the ID token’s signature and audience before trusting it.' }, { gap: 0.5 }],
        ['f5', { zh: '授权码短命、单次、绑定回调；PKCE 再校验。', en: 'The code is short-lived, single-use, redirect-bound; PKCE checks too.' }, { gap: 0.4 }],
      ],
    },
    {
      id: 'attacks', at: 153, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['a1', { zh: '攻击者要让验证通过，但证据不是你的。', en: 'An attacker wants verification to pass with evidence not yours.' }, { gap: 0.5 }],
        ['a2', { zh: '钓鱼骗口令和验证码；撞库拿泄露口令试。', en: 'Phishing takes passwords and codes; stuffing reuses leaks.' }, { gap: 0.5 }],
        ['a3', { zh: 'XSS 读走没设 HttpOnly 的 cookie。', en: 'XSS reads cookies without HttpOnly.' }, { gap: 0.5 }],
        ['a4', { zh: 'CSRF 借浏览器带 cookie；SameSite 挡。', en: 'CSRF sends the cookie; SameSite blocks it.' }, { gap: 0.5 }],
        ['a5', { zh: '会话固定先塞编号；JWT 被偷，谁拿到谁用到失效。', en: 'Fixation plants an ID; a stolen JWT works until invalid.' }, { gap: 0.4 }],
      ],
    },
    {
      id: 'close', at: 177.2, chap: null, lead: 0.5, tail: 0.15,
      cues: [
        ['e1', { zh: '验证你是你，是拿证据对照规则。', en: 'Verifying you means checking evidence against a rule.' }, { gap: 0.4 }],
        ['e2', { zh: '口令验证知道，短信码验证拥有，passkey 验证私钥。', en: 'Passwords verify knowledge, SMS possession, passkeys a key.' }, { gap: 0.4 }],
        ['e3', { zh: 'cookie 验证连续，JWT 验证签名；没有万能机制。', en: 'Cookies verify continuity, JWTs a signature; no mechanism fits all.' }, { gap: 0.1 }],
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
      [/SSO/g, 'S S O'],
      [/SameSite/g, 'same site'],
      [/HttpOnly/g, 'http only'],
      [/OAuth 2\.0/g, 'O auth two point zero'],
      [/OIDC/g, 'O I D C'],
      [/PKCE/g, 'P K C E'],
      [/JWT/g, 'J W T'],
      [/ID Token/g, 'I D token'],
      [/TLS/g, 'T L S'],
      [/\bXSS\b/g, 'X S S'],
      [/\bCSRF\b/g, 'C S R F'],
      [/cookie/g, 'cookie'],
    ],
    en: [
      [/passkey/g, 'pass key'],
      [/SSO/g, 'S S O'],
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
