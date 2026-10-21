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
// 本集 96 秒，六段：现象 → 是什么 → 从哪来 → 一次请求走过的检查 → 谁发的 → 谁负责。
// 策划者 2026-10-21 定稿：文案由 Gemini 4 Argon 迭代三轮后确认，见 review/NOTES.md 与 review/GEMINI-ROUND*-*.md。
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
        ['o1', { zh: '你发出网页请求，却只收到一个三位数。', en: 'A request goes out; three digits return.' }, { gap: 0.2 }],
        ['o2', { zh: '404 是没找到，500 是服务器崩了。', en: '404 is not found; 500 is the server broke.' }, { gap: 0.2 }],
        ['o3', { zh: '这叫 HTTP 状态码。', en: 'This is an HTTP status code.' }, { gap: 0.2 }],
        ['oT', null, { pause: 1.9 }],
      ],
    },
    {
      id: 'what', at: 12.528, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['w1', { zh: '它在响应第一行，靠首位分五类：', en: 'It sits on the response’s first line; the digit sets the class:' }, { gap: 0.2 }],
        ['w2', { zh: '1xx 处理中，2xx 成功，3xx 重定向，', en: '1xx working, 2xx success, 3xx redirect,' }, { gap: 0.2 }],
        ['w3', { zh: '4xx 请求有错，5xx 服务端故障；', en: '4xx bad request, 5xx server failure;' }, { gap: 0.2 }],
        ['w4', { zh: '陌生码按首位算，如 471 当 400。', en: 'unknown ones sort by digit, like 471 as 400.' }, { gap: 0.2 }],
      ],
    },
    {
      id: 'history', at: 28.767, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['h1', { zh: '1990 年 HTTP 只传文件，还没有状态码。', en: 'In 1990, HTTP only sent files, no status codes.' }, { gap: 0.2 }],
        ['h2', { zh: '后来包成报文，才加上这一行报结果。', en: 'Messages came later, and this line was added.' }, { gap: 0.2 }],
        ['h3', { zh: '从 1.1 到 2022 年的 HTTP/3，版本换了，码没改。', en: 'From 1.1 to HTTP/3 in 2022, versions changed; codes stayed.' }, { gap: 0.2 }],
      ],
    },
    {
      id: 'common', at: 41.95, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['c1', { zh: '请求到真正存资源的源站，按步过检：', en: 'At the origin holding the resource, checks run:' }, { gap: 0.2 }],
        ['c2', { zh: '语法错回 400；缺凭据回 401；', en: 'Bad syntax gets 400; no credentials, 401;' }, { gap: 0.2 }],
        ['c3', { zh: '权限不够回 403，原样重试也没用。', en: 'not enough permission, 403, retrying fails.' }, { gap: 0.2 }],
        ['c4', { zh: '找不到资源回 404，不分暂时或永久。', en: 'No such resource, 404, temporary or permanent.' }, { gap: 0.2 }],
        ['c5', { zh: '找到就回 200 传内容；', en: 'Found it, 200 carries the content;' }, { gap: 0.2 }],
        ['c6', { zh: '若缓存仍有效，只回 304 省重传。', en: 'if the cache is valid, 304 skips resending.' }, { gap: 0.2 }],
      ],
    },
    {
      id: 'who', at: 62.641, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['u1', { zh: '若请求合法但源站崩了，源站回 500。', en: 'If the origin itself crashes, it returns 500.' }, { gap: 0.2 }],
        ['u2', { zh: '若刷太密，前面的限流层会回 429 拦下。', en: 'Too fast, and rate limiters return 429.' }, { gap: 0.2 }],
        ['u3', { zh: '中间转发的网关或代理，不改源站的码；', en: 'A gateway or proxy just forwards origin codes;' }, { gap: 0.2 }],
        ['u4', { zh: '上游无效才发 502，超时发 504。', en: '502 on a bad upstream, 504 on a timeout.' }, { gap: 0.2 }],
      ],
    },
    {
      id: 'close', at: 78.633, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['x1', { zh: '遇到报错，先看第一位数字：', en: 'On error, check the first digit:' }, { gap: 0.2 }],
        ['x2', { zh: '4xx 改请求，5xx 等恢复；', en: '4xx, fix your request; 5xx, wait;' }, { gap: 0.2 }],
        ['x3', { zh: '502 和 504，则是卡在了上游。', en: '502 and 504 mean it got stuck upstream.' }, { gap: 0.2 }],
        ['x4', { zh: '短短三位数，写清了请求停在哪、该谁负责。', en: 'Three digits show where it stopped, and who acts.' }, { gap: 0.2 }],
      ],
    },
    {
      // 片尾名单：策划、参与模型与分工、开源视频的仓库地址。约 7.5 秒，不配旁白
      id: 'outro', at: 92.666, chap: null, lead: 0.5, tail: 0,
      cues: [
        ['z1', null, { pause: 2.5 }],
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。先用 kit/tools/tts_probe.js 试，再用 asr.js 回听。
  // 状态码逐位念（试听定）：MiniMax 把「404」念成「四百零四」，开发者口头说的是「四零四」；英文按习惯 four-oh-four、five hundred。
  // 「4xx」念「四字头」、英文 four-ex-ex（写成 four-x-x 时被念成「zix」）。年份与版本号写成读得出来的样子。
  // 多音字换成同音的单音字（回听定）：表示「一行字」的「行」→「航」（MiniMax 念成 xíng，回听为「这一型」）；「重试」「重传」的「重」→「虫」。
  const CODES = {
    zh: { 200: '二零零', 304: '三零四', 400: '四零零', 401: '四零一', 403: '四零三', 404: '四零四', 429: '四二九', 471: '四七一', 500: '五零零', 502: '五零二', 504: '五零四' },
    en: { 200: 'two hundred', 304: 'three-oh-four', 400: 'four hundred', 401: 'four-oh-one', 403: 'four-oh-three', 404: 'four-oh-four', 429: 'four twenty-nine', 471: 'four seventy-one', 500: 'five hundred', 502: 'five-oh-two', 504: 'five-oh-four' },
  };
  const XX = { zh: ['一', '二', '三', '四', '五'].map((d) => d + '字头'), en: ['one', 'two', 'three', 'four', 'five'].map((d) => d + '-ex-ex') };
  const SAY = {
    zh: [
      [/HTTP\/3/g, 'H T T P 三'],
      [/HTTP/g, 'H T T P'],
      [/1990/g, '一九九零'],
      [/2022/g, '二零二二'],
      [/1\.1/g, '一点一'],
      [/(?<![执进串银])行/g, '航'],
      [/重(试|传)/g, '虫$1'],
    ],
    en: [
      [/HTTP\/3/g, 'H T T P three'],
      [/HTTP/g, 'H T T P'],
      [/1\.1/g, 'one point one'],
    ],
  };
  for (const lg of ['zh', 'en']) {
    SAY[lg].push([/([1-5])xx/g, (m, d) => XX[lg][d - 1]]);
    SAY[lg].push([/\b(\d{3})\b/g, (m) => CODES[lg][m] || m]);
  }
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
