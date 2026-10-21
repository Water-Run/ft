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
// 本集 96 秒，六段：是什么 → 它从哪来 → 日常遇到的码 → 谁发的 → 出错谁负责 → 片尾。
// 策划者 2026-10-21 要求包含历史沿革；沿革只讲一件事：这个三位数从哪来、变过没有。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);

  const TOTAL = 96;
  const RAW = [
    {
      id: 'open', at: 0, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['o1', { zh: '网页打不开，浏览器给你一个三位数。', en: 'A page fails; the browser gives you a three-digit number.' }, { gap: 0.3 }],
        ['o2', { zh: '404 是没找到，500 是服务器崩了。', en: '404 means not found; 500 means the server broke.' }, { gap: 0.25 }],
        ['o3', { zh: '这叫 HTTP 状态码。', en: 'That is called an HTTP status code.' }, { gap: 0.28 }],
        ['oT', null, { pause: 1.9 }],
      ],
    },
    {
      id: 'what', at: 12.602, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['w1', { zh: '它在响应的第一行，就是这个三位数。', en: 'It sits on the first line of the response: that three-digit number.' }, { gap: 0.25 }],
        ['w2', { zh: '前面那位数字决定类别：', en: 'The first digit decides the class:' }, { gap: 0.2 }],
        ['w3', { zh: '1xx 处理中，2xx 成功，3xx 跳转，', en: '1xx working, 2xx success, 3xx redirect,' }, { gap: 0.2 }],
        ['w4', { zh: '4xx 你的错，5xx 服务器错。', en: '4xx your fault, 5xx the server’s.' }, { gap: 0.38 }],
      ],
    },
    {
      id: 'history', at: 26.247, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['h1', { zh: '1990 年 web 诞生时，还没有状态码。', en: 'In 1990, when the Web was born, there were no status codes.' }, { gap: 0.3 }],
        ['h2', { zh: '后来 HTTP 用报文装请求和响应，才有了这一行。', en: 'HTTP later wrapped requests and responses in messages, and only then did this line appear.' }, { gap: 0.3 }],
        ['h3', { zh: '1.1 用了十几年，2 版 2015 年出，', en: 'Version 1.1 ran for over a decade, version 2 came in 2015,' }, { gap: 0.15 }],
        ['h4', { zh: '3 版 2022 年出，版本换了，状态码没改。', en: 'version 3 in 2022; the versions changed, the codes did not.' }, { gap: 0.38 }],
      ],
    },
    {
      id: 'common', at: 43.261, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['c1', { zh: '先说成功：200 是拿到了，304 是内容没变。', en: 'First success: 200 means you got it, 304 means nothing changed.' }, { gap: 0.25 }],
        ['c2', { zh: '然后是出错的：400 请求不合法，', en: 'Then errors: 400 invalid request,' }, { gap: 0.22 }],
        ['c3', { zh: '404 没这资源，401 缺凭据，', en: '404 no such resource, 401 no credentials,' }, { gap: 0.12 }],
        ['c3b', { zh: '403 认得你但不给你看，', en: '403 it knows you but will not show you,' }, { gap: 0.2 }],
        ['c4', { zh: '405 方法不对，429 请求太密。', en: '405 wrong method, 429 too many requests.' }, { gap: 0.3 }],
        ['c5', { zh: '最后是服务器自己的错：500 它出了问题，', en: 'Finally the server’s own: 500 it broke,' }, { gap: 0.2 }],
        ['c6', { zh: '502 和 504 是网关说的：上游出问题。', en: '502 and 504 come from the gateway: the upstream had trouble.' }, { gap: 0.48 }],
      ],
    },
    {
      id: 'who', at: 68.696, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['u1', { zh: '同一个码，谁发的？', en: 'The same code, but who sent it?' }, { gap: 0.3 }],
        ['u2', { zh: '大多是源站发的，405 是框架挡的，429 是限流给的，', en: 'Mostly the origin; 405 from the framework, 429 from rate limiting,' }, { gap: 0.3 }],
        ['u3', { zh: '502 和 504 只有网关会发。', en: 'and only a gateway sends 502 and 504.' }, { gap: 0.48 }],
      ],
    },
    {
      id: 'close', at: 80.118, chap: null, lead: 0.5, tail: 0,
      cues: [
        ['x1', { zh: '出了错，先看第一位数字。', en: 'When something breaks, look at the first digit.' }, { gap: 0.05 }],
        ['x2', { zh: '4xx 你改，5xx 服务器改。', en: '4xx is yours, 5xx is theirs.' }, { gap: 0.05 }],
        ['x3', { zh: '502 和 504 你改不动。', en: '502 and 504, you cannot fix them.' }, { gap: 0.05 }],
      ],
    },
    {
      // 片尾名单：策划、参与模型与分工、开源视频的仓库地址。约 7.5 秒，不配旁白
      id: 'outro', at: 88.5, chap: null, lead: 0.5, tail: 0,
      cues: [
        ['z1', null, { pause: 6.17 }],
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。先用 kit/tools/tts_probe.js 试，再用 asr.js 回听。
  const SAY = {
    zh: [
      [/HTTP/g, 'H T T P'],
      [/GET/g, 'G E T'],
      [/1990/g, '一九九零'],
      [/2015/g, '二零一五'],
      [/2022/g, '二零二二'],
      [/1\.1/g, '一点一'],
      [/web/g, 'web'],
    ],
    en: [
      [/HTTP/g, 'H T T P'],
      [/GET/g, 'G E T'],
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
