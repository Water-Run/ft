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
      id: 'open', at: 0, chap: null, lead: 0.4, tail: 0.4,
      cues: [
        ['o1', '打开网站时，数据要找到远方的另一台电脑。', { gap: 0.3 }],
        ['o2', '设备那么多，靠什么找？靠地址。', { gap: 0.4 }],
        ['o3', '这套按地址送数据的规则，叫 *IP*；', { gap: 0.3 }],
        ['o4', '它的第四版定于一九八一年，叫 *IPv4*，一直用到今天。', { gap: 0.5 }],
      ],
    },
    {
      id: 'address', at: 20, chap: null, lead: 0.3, tail: 0.3,
      cues: [
        ['a1', '一个 IPv4 地址，是三十二个零或一，', { gap: 0.25 }],
        ['a2', '每八个一组写成十进制，比如 192.168.1.10。', { gap: 0.3 }],
      ],
    },
    {
      id: 'prefix', at: 30.75, chap: null, lead: 0.3, tail: 0.3,
      cues: [
        ['p1', '地址分两截：前一截是网络，后一截是设备。', { gap: 0.3 }],
        ['p2', '/24 表示前二十四位是网络。', { gap: 0.4 }],
        ['p3', '假设要去 203.0.113.80，它在别的网络。', { gap: 0.3 }],
      ],
    },
    {
      id: 'route', at: 45.75, chap: null, lead: 0.3, tail: 0.3,
      cues: [
        ['r1', '同一网络，直接送到；', { gap: 0.2 }],
        ['r2', '别的网络，先交给家里的路由器；', { gap: 0.3 }],
        ['r3', '一路上，每台路由器查表，一站站往下送。', { gap: 0.3 }],
      ],
    },
    {
      id: 'special', at: 57.5, chap: null, lead: 0.3, tail: 0.3,
      cues: [
        ['s1', '另外，127.0.0.1 指的是你自己这台电脑。', { gap: 0.45 }],
        ['s2', '192.168 开头的是*私有地址*，各家内网都能用；', { gap: 0.3 }],
        ['s3', '上公网时，整个内网通常共用一个公网地址。', { gap: 0.3 }],
      ],
    },
    {
      id: 'limit', at: 74.25, chap: null, lead: 0.3, tail: 0.4,
      cues: [
        ['e1', '要共用，是因为三十二位只有约四十三亿个地址。', { gap: 0.3 }],
        ['e2', '二〇一一年，全球统一管理的地址池分完了。', { gap: 0.45 }],
        ['e3', '接班的 *IPv6* 有一百二十八位，', { gap: 0.2 }],
        ['e4', '找路的办法照旧：先看网络，再交给下一站。', { gap: 0.3 }],
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
      [/192\.168\.1\.10/g, '一九二点一六八点一点一零'],
      [/203\.0\.113\.80/g, '二零三点零点一一三点八零'],
      [/127\.0\.0\.1/g, '一二七点零点零点一'],
      [/192\.168/g, '一九二点一六八'],
      [/127/g, '一二七'],
      [/\/24/g, '斜杠二十四'],
      [/localhost/g, 'local host'],
      [/IPv4/g, 'I P V 四'],
      [/IPv6/g, 'I P V 六'],
      [/\bIP\b/g, 'I P'],
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
