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
// 2026-10-20：中文初稿（准备方）。本轮只交中文稿，英文稿按仓库流程在中文经 WaterRun 明确确认后再译（docs/guides/script-review.md 第 2 节第 6 步）。
//   字幕暂用纯字符串（未写成 { zh, en }）：英文确认前不预填译文，避免把未经校对的外文当成定稿。
//   各场景的时长预算、每句的事实出处见 README「内容」与 research/FACTS.md。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);            // 画面里的文字：tr('中文', 'English')

  const TOTAL = 96;
  const RAW = [
    {
      // 现象：有人问「这个模型多大」，答案不是一个数字。片名卡落在 o2 上
      id: 'open', at: 0, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['o1', '有人问：这个模型多大？', { gap: 0.4 }],
        ['o2', '答案不是一个数字，是一串参数。', { gap: 0.8 }],
        ['o3', '这些数字，写在模型仓库的配置文件里。', { gap: 0.4 }],
      ],
    },
    {
      // 第一类：参数量。它是什么 → 单位 → 量级
      id: 'p1', at: 11.75, chap: null, lead: 0.6, tail: 0.4,
      cues: [
        ['p1_1', '第一类：参数量。', { gap: 0.4 }],
        ['p1_2', '模型里学出来的数字，一共多少个。', { gap: 0.4 }],
        ['p1_3', '名字里的数：M 百万，B 十亿，T 万亿。', { gap: 0.4 }],
        ['p1_4', '这一列里，最小一亿多，最大两万多亿。', { gap: 0.4 }],
      ],
    },
    {
      // 第二类：结构参数。模型长什么样
      id: 'p2', at: 27, chap: null, lead: 0.6, tail: 0.4,
      cues: [
        ['p2_1', '第二类：结构参数。', { gap: 0.4 }],
        ['p2_2', '同一个文件里，还写着模型长什么样。', { gap: 0.4 }],
        ['p2_3', '层数 42，隐藏维度 2048，每个位置记这么多数。', { gap: 0.4 }],
        ['p2_4', '注意力头 16，分 16 路看上下文。', { gap: 0.4 }],
      ],
    },
    {
      // 第三类：上下文长度。单位是 token 不是字
      id: 'p3', at: 42.75, chap: null, lead: 0.6, tail: 0.4,
      cues: [
        ['p3_1', '第三类：上下文长度。', { gap: 0.4 }],
        ['p3_2', '模型一次最多能读多少东西。', { gap: 0.4 }],
        ['p3_3', '单位是 token，也就是词表里的一条。', { gap: 0.4 }],
        ['p3_4', '这个模型能读 13 万个 token。', { gap: 0.4 }],
      ],
    },
    {
      // 第四类：词表。为什么 1 个 token 不等于 1 个字
      id: 'p4', at: 56.25, chap: null, lead: 0.6, tail: 0.4,
      cues: [
        ['p4_1', '第四类：词表。', { gap: 0.4 }],
        ['p4_2', '词表是模型认识的所有词条。', { gap: 0.4 }],
        ['p4_3', '中文一个 token 一两个字，英文四五个字母。', { gap: 0.4 }],
        ['p4_4', '所以上下文长度，不能按字数算。', { gap: 0.4 }],
      ],
    },
    {
      // 边界：口径陷阱。总参数 ≠ 激活参数，参数量 ≠ 能力
      id: 'edge', at: 70, chap: null, lead: 0.6, tail: 0.4,
      cues: [
        ['e1', '参数量大，不一定更强。', { gap: 0.4 }],
        ['e2', '有的模型叫混合专家，存了 240 亿参数，', { gap: 0.4 }],
        ['e3', '每次却只用 25 亿。', { gap: 0.4 }],
      ],
    },
    {
      // 结论：先看单位，再看量级，最后看口径
      id: 'concl', at: 80.5, chap: null, lead: 0.6, tail: 0.4,
      cues: [
        ['c1', '先看单位，', { gap: 0.4 }],
        ['c2', '再看量级，', { gap: 0.4 }],
        ['c3', '最后看口径。参数量只是一项。', { gap: 0.4 }],
      ],
    },
    {
      // 片尾名单：策划、参与模型与分工、开源视频的仓库地址。88.5 → 96.0，共 7.5 秒，不配旁白
      id: 'outro', at: 88.5, chap: null, lead: 0, tail: 0,
      cues: [
        ['z1', null, { pause: 7.5, gap: 0 }],
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。先用 kit/tools/tts_probe.js 试，再用 asr.js 回听。
  // 下面四条都是初稿，**尚未试听**（tts_probe.js 与 tts.js 都要文案已确认才能用）；配音那一步先试听再定。
  const SAY = {
    zh: [
      [/token/g, '偷肯'],
      [/\bM\b/g, 'emm'],
      [/\bB\b/g, 'bee'],
      [/\bT\b/g, 'tee'],
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
