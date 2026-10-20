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
// 本片 120 秒 = 4 个 30 秒，正好是 TOTP 的 4 个时间步：每一章占一个时间步，角上的验证码在章与章的交界处更换。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);            // 画面里的文字：tr('中文', 'English')

  const TOTAL = 120;
  const RAW = [
    {
      // 第 1 个时间步：现象 → 2FA 是什么 → 三类依据
      id: 'open', at: 0, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['o1', { zh: '这 6 位数字，每 30 秒换一次', en: 'These six digits change every 30 seconds.' }, { gap: 0.35 }],
        ['o2', { zh: '手机可以不联网，服务器却知道它此刻是多少', en: 'The phone can be offline, yet the server knows the current digits.' }, { gap: 0.6 }],
        ['o3', { zh: '它属于 *2FA*：双因素认证里常见的一道验证', en: 'It is a common step in *2FA*: two-factor authentication.' }, { gap: 0.9 }],
        ['p1', { zh: '只验证密码的登录，密码一泄露，账号就失守', en: 'If sign-in checks only a password, one leak loses the account.' }, { gap: { zh: 0.8, en: 0.55 } }],
        ['a1', { zh: '验证的依据共有三类', en: 'Proof of identity comes in three kinds.' }, { gap: 0.3 }],
        ['a2', { zh: '*知道*的，如密码', en: 'Something *known*, like a password.' }, { gap: 0.25 }],
        ['a3', { zh: '*持有*的，如手机、安全密钥', en: 'Something *held*, like a phone or a security key.' }, { gap: 0.25 }],
        ['a4', { zh: '*自身*的，如指纹', en: 'Something *inherent*, like a fingerprint.' }, { gap: 0.5 }],
        ['a5', { zh: '双因素，就是用上其中*不同的两类*', en: 'Two-factor means using *two different kinds*.' }, { gap: 0.3 }],
      ],
    },
    {
      // 第 2 个时间步：名字 → 共享密钥 → 时间轴（1970、1984、2011）→ 计数
      id: 'seed', at: 30, chap: null, lead: 0.6, tail: 0.3,
      cues: [
        ['b1', { zh: '这种验证码叫 *TOTP*：基于时间的一次性密码', en: 'Its name is *TOTP*: time-based one-time password.' }, { gap: { zh: 0.35, en: 0.3 } }],
        ['b3', { zh: '开启时，服务器生成一个*密钥*，放进二维码', en: 'At setup, the server puts a fresh *secret key* into a QR code.' }, { gap: 0.3 }],
        ['b4', { zh: '手机扫码，存下*同一个*密钥', en: 'The phone scans it and stores the *same* key.' }, { gap: { zh: 0.45, en: 0.4 } }],
        ['b5', { zh: '另一个输入是*时间*：1970 年元旦至今的秒数', en: 'The other input is *time*: seconds since 1970.' }, { gap: { zh: 0.35, en: 0.25 } }],
        ['h1', { zh: '1984 年申请的一项专利，已让令牌上的数字随时间变化', en: 'A patent filed in 1984 already had digits that change with time.' }, { gap: { zh: 0.3, en: 0.25 } }],
        ['h2', { zh: '2011 年，TOTP 作为公开规范发布', en: 'In 2011, TOTP was published as an open specification.' }, { gap: { zh: 0.45, en: 0.35 } }],
        ['b6', { zh: '把秒数除以 30，取整，就是*计数器*', en: 'Divide by 30 and round down: that is the *counter*.' }, { gap: 0.3 }],
        ['b7', { zh: '它每 30 秒加一', en: 'It adds one every 30 seconds.' }, { gap: 0.3 }],
      ],
    },
    {
      // 第 3 个时间步：HMAC → 动态截取 → 6 位 → 服务器同算
      id: 'code', at: 60, chap: null, lead: 0.75, tail: 0.3,
      cues: [
        ['c1', { zh: '密钥和计数器，一起送进 *HMAC*', en: 'Key and counter go into *HMAC* together.' }, { gap: 0.4 }],
        ['c2', { zh: '得到 20 个字节', en: 'Out come 20 bytes.' }, { gap: 0.8 }],
        ['c3', { zh: '最后一个字节的低 4 位，指出从哪里取 4 个字节', en: 'The last byte\'s low four bits say where to take four bytes.' }, { gap: 0.9 }],
        ['c4', { zh: '去掉最高位，读成整数，留下末 6 位', en: 'Drop the top bit, read an integer, keep the last six digits.' }, { gap: 0.8 }],
        ['c5', { zh: '这就是*验证码*', en: 'That is the verification *code*.' }, { gap: 1.0 }],
        ['c6', { zh: '服务器用同一个密钥、同一个时间，再算一遍', en: 'The server, with the same key and the same time, computes it again.' }, { gap: 0.45 }],
        ['c7', { zh: '结果一致，登录通过', en: 'The results match, and sign-in succeeds.' }, { gap: 0.7 }],
        ['c8', { zh: '手机和服务器无需通信：只靠*同一个密钥*、*同一个时钟*', en: 'Phone and server never had to talk: *same key*, *same clock*.' }, { gap: 0.3 }],
      ],
    },
    {
      // 第 4 个时间步：其他方式的强弱 → 结论
      id: 'rank', at: 90, chap: null, lead: 0.75, tail: 0.3,
      cues: [
        ['d1', { zh: '验证方式不止这一种，强弱不同', en: 'Other methods vary in strength.' }, { gap: 0.3 }],
        ['d2', { zh: '短信验证码*最弱*：号码可能被转走', en: 'SMS codes are *weakest*: a phone number can be hijacked.' }, { gap: 0.35 }],
        ['d3', { zh: 'TOTP 更强，但假网站仍能当场骗走数字', en: 'TOTP is stronger, but a fake site can still capture the digits.' }, { gap: 0.35 }],
        ['d4', { zh: '2019 年成为标准的 *WebAuthn*，改用私钥签名', en: '*WebAuthn*, standardized in 2019, signs with a private key.' }, { gap: 0.3 }],
        ['d5', { zh: '签名认准域名，假网站拿不到', en: 'It is bound to the domain; a fake site gets nothing.' }, { gap: 0.6 }],
        ['d6', { zh: '不论哪一种，都*好过只有密码*', en: 'Any of them *beats a password alone*.' }, { gap: 0.3 }],
      ],
    },
    {
      // 片尾名单：策划、参与模型与分工、开源视频的仓库地址
      id: 'outro', at: 112.5, chap: null, lead: 0.5, tail: 0,
      cues: [
        ['z1', null, { pause: 6.5 }],
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。先用 kit/tools/tts_probe.js 试，再用 asr.js 回听。
  const SAY = {
    zh: [
      [/2FA/g, 'two F A'],            // 缺省读成「二 A F」一类的音；试验见 README「读法」
      [/HMAC/g, 'H mac'],
      [/WebAuthn/g, 'Web Authen'],
    ],
    en: [
      [/WebAuthn/g, 'Web Awthen'],    // 缺省与写成 Web Authen 都读成 web often
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
