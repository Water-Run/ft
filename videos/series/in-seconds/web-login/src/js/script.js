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
        ['o1', { zh: '登录成功后，网站怎么验证下一次请求还是你？', en: 'After login, how does the site verify the next request?' }, { gap: 0.5 }],
        ['o2', { zh: '先看最常见的一种：cookie 会话。', en: 'Start with a cookie session.' }, { gap: 0.5 }],
        ['o3', { zh: '先看 cookie。', en: 'Start with cookie.' }, { gap: 0.4 }],
      ],
    },
    {
      id: 'cookie', at: 14.1, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['c1', { zh: '服务器生成一个随机会话编号，放进 cookie。', en: 'The server makes a random session ID and puts it in a cookie.' }, { gap: 0.45 }],
        ['c2', { zh: '浏览器之后每次请求，自动带上这个编号。', en: 'The browser sends it automatically on every later request.' }, { gap: 0.45 }],
        ['c3', { zh: '服务器查会话表：编号存在、没过期，就认这次会话。', en: 'The server checks its table: the ID exists and has not expired.' }, { gap: 0.5 }],
        ['c4', { zh: '所以它验证的是会话连续，不是重新验证你这个人。', en: 'So it verifies continuity, not the person again.' }, { gap: 0.5 }],
        ['c5', { zh: '第一个缺点：这张表要存在服务器上。', en: 'First weakness: the table lives on the server.' }, { gap: 0.5 }],
        ['c6', { zh: '服务器一多要共享表；表丢了，登录也没了。', en: 'Many servers share it; lose it and sessions are gone.' }, { gap: 0.5 }],
        ['c7', { zh: '第二个缺点：编号被偷，别人就能冒充你。', en: 'Second: a stolen ID lets someone impersonate you.' }, { gap: 0.5 }],
        ['c8', { zh: '第三个缺点：浏览器自动带 cookie，跨站请求也能用。', en: 'Third: browsers attach cookies, so cross-site requests can use them.' }, { gap: 0.4 }],
      ],
    },
    {
      id: 'jwt', at: 52.1, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['j1', { zh: '为了不存这张表，可以把验证结果签进一个令牌。', en: 'To avoid that table, sign the result into a token.' }, { gap: 0.5 }],
        ['j2', { zh: 'JWT 就是这种令牌：头部、载荷、签名。', en: 'A JWT is such a token: header, payload, signature.' }, { gap: 0.5 }],
        ['j3', { zh: '前两段只是编码，不是加密；谁拿到都能读。', en: 'The first two parts are encoded, not encrypted.' }, { gap: 0.5 }],
        ['j4', { zh: '服务器验签，再查过期和受众，才相信载荷。', en: 'Verify signature, expiry and audience before trusting it.' }, { gap: 0.5 }],
        ['j5', { zh: '它不查表，但撤销麻烦。', en: 'It removes the table, but adds revocation.' }, { gap: 0.5 }],
        ['j6', { zh: '令牌发出去，到期前通常一直有效；被偷也一样。', en: 'A token stays valid until expiry, and a stolen one works too.' }, { gap: 0.5 }],
        ['j7', { zh: '所以要短命，必要时维护撤销名单。', en: 'Keep it short-lived, with a revocation list.' }, { gap: 0.4 }],
      ],
    },
    {
      id: 'password', at: 81.8, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['p1', { zh: 'cookie 和 JWT 只记住之前的验证；第一次怎么验证？', en: 'Cookie and JWT only remember an earlier check. How was it done?' }, { gap: 0.5 }],
        ['p2', { zh: '最常见的是口令。服务器加盐、慢哈希，再比对。', en: 'Usually a password: salt, slow hash, compare.' }, { gap: 0.5 }],
        ['p3', { zh: '一致，就确认你知道这个口令。', en: 'A match confirms that you know it.' }, { gap: 0.5 }],
        ['p4', { zh: '但口令只证明“知道”，不证明你是账号主人。', en: 'But that only proves knowledge, not ownership.' }, { gap: 0.5 }],
        ['p5', { zh: '它怕钓鱼、撞库，也怕你在别处重复使用。', en: 'It is vulnerable to phishing, stuffing, and password reuse.' }, { gap: 0.5 }],
        ['p6', { zh: '所以它通常只是第一道验证。', en: 'So it is usually just the first check.' }, { gap: 0.4 }],
      ],
    },
    {
      id: 'factors', at: 107.5, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['f1', { zh: '第二个办法：短信码，验证你拥有这个手机号。', en: 'A second way: an SMS code verifies you have this phone.' }, { gap: 0.5 }],
        ['f2', { zh: '但码能被实时转发，假站点也能骗到。', en: 'But codes can be relayed by fake sites.' }, { gap: 0.5 }],
        ['f3', { zh: 'passkey 换一种证据：你持有私钥。', en: 'A passkey proves you hold the private key.' }, { gap: 0.5 }],
        ['f4', { zh: '服务器只存公钥，登录时发随机挑战。', en: 'The server stores the public key and sends a challenge.' }, { gap: 0.5 }],
        ['f5', { zh: '认证器用私钥签名，签名绑定网站域名。', en: 'The authenticator signs, bound to the site’s domain.' }, { gap: 0.5 }],
        ['f6', { zh: '缺点是依赖设备；设备丢了，恢复是另一套问题。', en: 'Its weakness is device dependence and recovery.' }, { gap: 0.4 }],
      ],
    },
    {
      id: 'delegated', at: 132.7, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['d1', { zh: '还有一种：让另一个身份提供方替你验证。', en: 'Another way: a separate identity provider verifies you.' }, { gap: 0.5 }],
        ['d2', { zh: '它验证完，把一张断言交给本站。', en: 'It verifies you, then hands this site an assertion.' }, { gap: 0.5 }],
        ['d3', { zh: '本站验证断言的签名和受众，才相信结果。', en: 'This site verifies the assertion’s signature and audience.' }, { gap: 0.5 }],
        ['d4', { zh: 'OIDC 的 ID Token、SAML 断言，都是断言。', en: 'OIDC ID tokens and SAML assertions are such statements.' }, { gap: 0.5 }],
        ['d5', { zh: '缺点是信任转移：第三方不可靠，本站也跟着不可靠。', en: 'The weakness is transferred trust: a bad provider weakens the site.' }, { gap: 0.4 }],
      ],
    },
    {
      id: 'attacks', at: 156.9, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['a1', { zh: '验证码只验证你是人，不是脚本。', en: 'CAPTCHA only checks you are human, not a script.' }, { gap: 0.5 }],
        ['a2', { zh: 'cookie 被偷/CSRF；JWT 被偷/撤销慢。', en: 'Cookies are stolen or CSRF’d; JWTs stolen or poorly revoked.' }, { gap: 0.5 }],
        ['a3', { zh: '口令被钓鱼/撞库；短信码被转发；passkey 怕丢设备。', en: 'Passwords phished or stuffed; SMS relayed; passkeys need the device.' }, { gap: 0.5 }],
        ['a4', { zh: '委托验证怕配置错：受众没查、签名没验。', en: 'Federation fails on bad config: no audience or signature check.' }, { gap: 0.4 }],
      ],
    },
    {
      id: 'close', at: 176.8, chap: null, lead: 0.5, tail: 0.15,
      cues: [
        ['e1', { zh: '没有一种验证方式适合所有场景。', en: 'No verification method fits every case.' }, { gap: 0.4 }],
        ['e2', { zh: 'cookie 连续，JWT 签名，口令知道，短信码拥有。', en: 'Cookies continuity, JWTs a signature, passwords knowledge, SMS possession, passkeys a key.' }, { gap: 0.4 }],
        ['e3', { zh: '选哪种，看证据、规则和代价。', en: 'Choose by evidence, rule reliability and cost.' }, { gap: 0.1 }],
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
