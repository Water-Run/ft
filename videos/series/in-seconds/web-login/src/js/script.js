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
        ['o1', { zh: '你打开一个网站，输入账号和密码。', en: 'You open a site and type an account and password.' }, { gap: 0.4 }],
        ['o2', { zh: '登录成功后，浏览器里多了一个 cookie。', en: 'After login, the browser holds one more cookie.' }, { gap: 0.45 }],
        ['o3', { zh: '可 cookie 只是运输；记住你的是服务器上的 Session。', en: 'But the cookie is only transport; the Session on the server remembers you.' }, { gap: 0.5 }],
        ['o4', { zh: 'Web 的登录机制是什么样的？服务器是怎么知道，你，是你？', en: 'How does Web login work? How does the server know that you are you?' }, { gap: 0.4 }],
      ],
    },
    {
      id: 'session', at: 22.3, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['s1', { zh: '登录成功后，服务器创建一条会话，记录用户、权限和过期时间。', en: 'After login, the server creates a session: user, permissions, expiry.' }, { gap: 0.5 }],
        ['s2', { zh: '它给浏览器一个 Session ID。', en: 'It gives the browser a Session ID.' }, { gap: 0.5 }],
        ['s3', { zh: 'Session ID 放进 Cookie，之后每次请求自动带上。', en: 'The browser puts it in a Cookie, sent automatically.' }, { gap: 0.5 }],
        ['s4', { zh: '服务器用 Session ID 查会话；Cookie 只是运输。', en: 'The server looks up the session; Cookie is transport, Session is state.' }, { gap: 0.5 }],
        ['s5', { zh: '缺点是服务器要保存、共享这张会话表。', en: 'The weakness: the server must store and share that session table.' }, { gap: 0.5 }],
        ['s6', { zh: 'Session ID 被偷，别人就能冒充你。', en: 'A stolen Session ID impersonates you.' }, { gap: 0.5 }],
        ['s7', { zh: '浏览器自动带 Cookie，跨站请求也能利用它。', en: 'Browsers attach Cookies, so cross-site requests can use them.' }, { gap: 0.4 }],
      ],
    },
    {
      id: 'jwt', at: 59.3, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['j1', { zh: '为了不存会话表，可以把身份和权限签进一个 token。', en: 'To avoid the session table, sign identity and permissions into a token.' }, { gap: 0.5 }],
        ['j2', { zh: 'JWT 是一种 token 格式，不是 Session。', en: 'JWT is a token format, not a Session.' }, { gap: 0.5 }],
        ['j3', { zh: '它分三段：头部、载荷、签名。', en: 'It has three parts: header, payload, signature.' }, { gap: 0.5 }],
        ['j4', { zh: '前两段只是编码，不是加密，谁拿到都能读。', en: 'The first two parts are encoded, not encrypted; anyone can read them.' }, { gap: 0.5 }],
        ['j5', { zh: '服务器验签，再查过期和受众。', en: 'The server verifies the signature, expiry and audience.' }, { gap: 0.5 }],
        ['j6', { zh: 'Access Token 访问资源；Refresh Token 续期。', en: 'An Access Token calls resources; a Refresh Token gets a new Access Token.' }, { gap: 0.5 }],
        ['j7', { zh: '缺点是撤销麻烦、token 被偷；所以要短命。', en: 'Weaknesses: revocation is hard and tokens get stolen; keep them short-lived.' }, { gap: 0.4 }],
      ],
    },
    {
      id: 'authn', at: 95.3, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['p1', { zh: '会话和 token 只记住之前的认证；第一次怎么认证？', en: 'Session and token only remember an earlier check. How was it done?' }, { gap: 0.5 }],
        ['p2', { zh: '口令：服务器加盐、慢哈希，再比对；证明你知道。', en: 'Password: salt, slow hash, compare; it proves knowledge.' }, { gap: 0.5 }],
        ['p3', { zh: '短信码：证明你拥有手机，但能被转发。', en: 'SMS code: proves you have the phone, but can be relayed.' }, { gap: 0.5 }],
        ['p4', { zh: 'passkey：证明你持有私钥；公钥、挑战、域名绑定。', en: 'Passkey: proves you hold the private key, bound to the domain.' }, { gap: 0.5 }],
        ['p5', { zh: '验证码只证明你是人，不是脚本，不证明身份。', en: 'CAPTCHA only proves you are human, not your identity.' }, { gap: 0.5 }],
        ['p6', { zh: '所以认证解决“你是谁”，会话解决“怎么记住”。', en: 'Authentication answers who; session answers how to remember.' }, { gap: 0.4 }],
      ],
    },
    {
      id: 'oauth', at: 125.3, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['a1', { zh: 'OAuth 2.0 是授权：给第三方有限访问权。', en: 'OAuth 2.0 is authorization: limited access, not user authentication.' }, { gap: 0.5 }],
        ['a2', { zh: 'OIDC 加身份层，返回 ID Token。', en: 'OIDC adds an identity layer and returns an ID Token.' }, { gap: 0.5 }],
        ['a3', { zh: 'Access Token 访问资源；Refresh Token 续期。', en: 'Access Token calls resources; Refresh Token renews.' }, { gap: 0.5 }],
        ['a4', { zh: 'ID Token 证明身份；资源服务器验签名和受众。', en: 'ID Token proves identity; the resource server verifies signature and audience.' }, { gap: 0.5 }],
        ['a5', { zh: '缺点是信任转移：第三方不可靠，本站也跟着不可靠。', en: 'The weakness is transferred trust: a bad provider weakens the site.' }, { gap: 0.4 }],
      ],
    },
    {
      id: 'attacks', at: 154, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['x1', { zh: '这些层各有攻击面。', en: 'Each layer has its own attack surface.' }, { gap: 0.4 }],
        ['x2', { zh: '会话：Session ID 被偷、CSRF、固定。', en: 'Session: stolen IDs, CSRF, fixation.' }, { gap: 0.5 }],
        ['x3', { zh: 'JWT：token 被偷、撤销不及时、载荷可读。', en: 'JWT: stolen tokens, slow revocation, readable payloads.' }, { gap: 0.5 }],
        ['x4', { zh: '认证：钓鱼、撞库、短信转发、passkey 设备丢失。', en: 'AuthN: phishing, stuffing, SMS relay, lost passkey devices.' }, { gap: 0.5 }],
        ['x5', { zh: '授权：回调、受众、签名配置错，断言就不可信。', en: 'AuthZ: bad redirect, audience or signature checks break trust.' }, { gap: 0.4 }],
      ],
    },
    {
      id: 'close', at: 175.1, chap: null, lead: 0.5, tail: 0.15,
      cues: [
        ['e1', { zh: '所以认证、会话、授权、令牌，是四层，不是四个竞品。', en: 'AuthN, session, AuthZ and tokens are layers, not competitors.' }, { gap: 0.4 }],
        ['e2', { zh: '它们解决不同问题，也各有代价。', en: 'They solve different problems, each with a cost.' }, { gap: 0.4 }],
        ['e3', { zh: '先问要验证什么，再选机制。', en: 'Ask what must be verified, then choose the mechanism.' }, { gap: 0.1 }],
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
