// 旁白脚本：每个 cue = [句号, 字幕, {tts, gap, pause}]
// - 多语言时字幕写成 { zh: '…', en: '…' }；tts、gap、pause 同理
// - 字幕里 *词* 标出术语（字幕上显示为强调），只为加重语气的词不标；术语第一次出现的那句说完时，画面上要有 data-gloss="词" 的注解（scan.js 的 GLOSS）
// - tts 缺省时由字幕按 SAY 表换成读法（字幕写正式拼写，读法只放在 SAY 表或 tts 字段）
// - gap：该句结束到下一句开始的停顿（秒，缺省 0.3）；pause：无旁白的纯画面停顿
// 语言：浏览器取 ?lang=，Node 取环境变量 VLANG；缺省为 zh。浏览器与 Node 共用本文件（工具读它排时间线）。
// 翻译以中文为底本：先定中文，再译其他语言；各语言的句号一一对应，时间轴各自排布。
//
// 本系列（XX 秒速通）的时间线是定长的：片名里的秒数就是成片的时长，各语言相同。
// - 场景的 at 是它开始的时刻（秒）。上一场的旁白说完之后，余下的时间留白到这一刻；说不完就是超出，记入 L.problems，总闸门不通过。
// - TOTAL 是全片的时长，最后一场补齐到这一刻。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);            // 画面里的文字：tr('中文', 'English')

  const TOTAL = 100;
  const RAW = [
    {
      id: 'open', at: 0, chap: null, lead: 0.4, tail: 0.3,
      cues: [
        ['o1', '打开网站，数据要送到远方的一台电脑。', { gap: 0.8 }],
        ['o2', '网上的电脑那么多，数据怎么知道去哪一台？', { gap: 1.2 }],
      ],
    },
    {
      id: 'address', at: 10.25, chap: null, lead: 0.2, tail: 0.3,
      cues: [
        ['a1', '靠地址：联网的设备都有自己的地址，', { gap: 0.5 }],
        ['a2', '写成四个数，用点隔开。', { gap: 1.2 }],
        ['a3', '这套按地址送数据的规则，叫 *IP*。', { gap: 1.2 }],
        ['a4', '*IPv4* 是它的第四版，一九八一年定下，一直用到今天。', { gap: 0.8 }],
      ],
    },
    {
      id: 'prefix', at: 29.25, chap: null, lead: 0.4, tail: 0.3,
      cues: [
        ['p1', '地址分两截：前一截是哪个网络，后一截是哪台设备。', { gap: 1.5 }],
      ],
    },
    {
      id: 'route', at: 36.25, chap: null, lead: 0.4, tail: 0.3,
      cues: [
        ['r1', '你的电脑先看前一截：同一个网络，就直接送过去；', { gap: 1.0 }],
        ['r2', '不是，就交给家里的*路由器*。', { gap: 1.0 }],
        ['r3', '每台路由器按前一截查表，一站一站往前送，', { gap: 1.2 }],
        ['r4', '到了那个网络，再按后一截找到那一台。', { gap: 1.2 }],
      ],
    },
    {
      id: 'special', at: 56.0, chap: null, lead: 0.3, tail: 0.4,
      cues: [
        ['s1', '另外，127.0.0.1 指的是你自己这台电脑。', { gap: 1.0 }],
      ],
    },
    {
      id: 'limit', at: 62.25, chap: null, lead: 0.3, tail: 0.3,
      cues: [
        ['e1', '可这四个数在电脑里只有三十二位，', { gap: 0.6 }],
        ['e2', '总共只有约四十三亿个地址，不够分。', { gap: 1.4 }],
        ['e3', '于是，一家的设备出门上网时，通常共用一个地址；', { gap: 1.4 }],
        ['e4', '二〇一一年，全球统一管理的地址池还是分完了。', { gap: 1.4 }],
        ['e5', '接班的 *IPv6* 有一百二十八位，', { gap: 1.0 }],
        ['e6', '找路的办法照旧：先看网络，再一站站往前送。', { gap: 0.3 }],
      ],
    },
    {
      id: 'outro', at: 92.5, chap: null, lead: 0, tail: 0,
      cues: [
        ['z1', null, { pause: 7.5, gap: 0, credits: true }],
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。先用 kit/tools/tts_probe.js 试，再用 asr.js 回听。
  const SAY = {
    zh: [
      // IP 的 I 跟在「叫」「的」后面会被吞成「假屁」「PV4」（第 4 轮逐词时长与 Whisper 回听实测）：写成「爱」，按中文的读法念满一个音节
      [/127\.0\.0\.1/g, '一二七点零点零点一'],
      [/IPv4/g, '爱 P V 四'],
      [/IPv6/g, '爱 P V 六'],
      [/\bIP\b/g, '爱 P'],
    ],
    en: [
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
