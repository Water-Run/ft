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
// 2026-10-20：四轮自我对抗编辑；按策划者允许的 192 秒预算，以说明白为先。
//   全文只用同一 LFM2.5-24B-A2B 版本，分词与结构已用实验 09 核对。
//   先讲参数与单位，再用真实切分及十次重复解释种类、长度和上下文；
//   结构段在这些基础之后解释，注意力只指模型里的注意力层，不泛指全部 40 层。
//   本轮只交中文稿，英文稿在中文明确确认后再译（docs/guides/script-review.md 第 2 节第 6 步）。
//   字幕暂用纯字符串（未写成 { zh, en }）：英文确认前不预填译文，避免把未经校对的外文当成定稿。
//   各场景的时长预算、每句的事实出处见 README「内容」与 research/FACTS.md。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);            // 画面里的文字：tr('中文', 'English')

  const TOTAL = 192;
  const RAW = [
    {
      id: 'open', at: 0, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['o1', '一个大模型，为什么会有两种「大小」？', { gap: 0.6 }],
        ['o2', '介绍里写着24B参数，又标着13万上下文。', { gap: 0.6 }],
        ['o3', '这些数字，分别在量什么？', { gap: 0.6 }],
        ['oT', null, { pause: 1.75, gap: 0 }],
      ],
    },
    {
      id: 'p1', at: 17, chap: null, lead: 0.6, tail: 0.4,
      cues: [
        ['p1_1', '模型生成回答，要靠一大批数字来计算。', { gap: 0.6 }],
        ['p1_2', '这些数字叫参数，会影响它接下来输出什么。', { gap: 0.6 }],
        ['p1_3', '训练时，用大量例子反复调整这些数的值。', { gap: 0.6 }],
        ['p1_4', '把这些参数全部数一遍，就是参数量。', { gap: 0.6 }],
        ['p1_5', 'B表示十亿，所以24B约有240亿个参数。', { gap: 0.6 }],
        ['p1_6', 'M表示百万，T表示万亿。', { gap: 0.6 }],
      ],
    },
    {
      id: 'p4', at: 46, chap: null, lead: 0.6, tail: 0.4,
      cues: [
        ['p4_1', '接着看，文字怎样送进模型。', { gap: 0.6 }],
        ['p4_2', '它会先把文字切成小片，每片叫一个token。', { gap: 0.6 }],
        ['p4_3', '比如「模型参数」，切成「模型」和「参数」。', { gap: 0.8 }],
        ['p4_4', '四个汉字，在这里算两个token。', { gap: 0.8 }],
        ['p4_5', '换成「你好」，又是「你」「好」两片。', { gap: 0.8 }],
        ['p4_6', '每片包含的字数可以不同，不能一个字算一片。', { gap: 0.6 }],
      ],
    },
    {
      id: 'vocab', at: 73, chap: null, lead: 0.6, tail: 0.4,
      cues: [
        ['v1', '可用片段的清单，叫词表。', { gap: 0.6 }],
        ['v2', '同一个token在文章里出现十次，', { gap: 0.25 }],
        ['v3', '词表里仍是一种，文章长度却要数十个。', { gap: 0.6 }],
        ['v4', '所以，词表大小数种类，文本长度数个数。', { gap: 0.6 }],
      ],
    },
    {
      id: 'p3', at: 90, chap: null, lead: 0.6, tail: 0.4,
      cues: [
        ['p3_1', '上下文长度，就是一次最多能容纳多少个token。', { gap: 0.6 }],
        ['p3_2', '你发的问题、文章，加上它生成的回答，都占这个额度。', { gap: 0.6 }],
        ['p3_3', '这里的13万，数的就是这些文字片段。', { gap: 0.6 }],
        ['p3_4', '文章占得越多，留给回答的空间就越少。', { gap: 0.6 }],
      ],
    },
    {
      id: 'p2', at: 111, chap: null, lead: 0.6, tail: 0.4,
      cues: [
        ['p2_1', '为了参与计算，每个token会用一串数来表示。', { gap: 0.6 }],
        ['p2_2', '这里一片用2048个数。', { gap: 0.6 }],
        ['p2_3', '配置里把每串数的长度，叫隐藏维度。', { gap: 0.6 }],
        ['p2_4', '一层算出的结果，会交给下一层继续处理。', { gap: 0.6 }],
        ['p2_5', '这里共有40层，配置里写的就是层数。', { gap: 0.6 }],
        ['p2_6', '有些层会联系前面的文字，来处理当前这个片段，', { gap: 0.25 }],
        ['p2_7', '这叫注意力。', { gap: 0.65 }],
        ['p2_8', '注意力头写32，表示在这些层里，分32组做这种计算。', { gap: 0.6 }],
      ],
    },
    {
      id: 'edge', at: 146, chap: null, lead: 0.6, tail: 0.4,
      cues: [
        ['e1', '再回到参数。有些模型处理一个token，只用一部分参数。', { gap: 0.6 }],
        ['e2', '这个例子总共有约240亿，实际用到约25亿。', { gap: 0.6 }],
        ['e3', '前者叫总参数，后者叫激活参数。', { gap: 0.6 }],
        ['e4', '比较时，要看清数的是全部，还是每个token用到的部分。', { gap: 0.6 }],
      ],
    },
    {
      id: 'concl', at: 167, chap: null, lead: 0.6, tail: 0.4,
      cues: [
        ['c1', '现在再看：参数量说模型有多少参数，', { gap: 0.6 }],
        ['c2', '上下文说一次能容纳多少个token，', { gap: 0.6 }],
        ['c3', '激活参数说每个token用到多少参数。', { gap: 0.6 }],
        ['c4', '读数字，先看它数什么；能力还得看实际表现。', { gap: 0.8 }],
      ],
    },
    {
      id: 'outro', at: 184.5, chap: null, lead: 0, tail: 0,
      cues: [
        ['z1', null, { pause: 7.5, gap: 0, credits: true }],
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。先用 kit/tools/tts_probe.js 试，再用 asr.js 回听。
  // 均尚未试听；数字先展开，防止用阿拉伯数字的字符数低估口播时间。
  const SAY = {
    zh: [
      [/AI/g, 'A I'],
      [/token/g, '偷肯'],
      [/24B/g, '二十四 bee'],
      [/\b2048\b/g, '两千零四十八'],
      [/\b240\b/g, '二百四十'],
      [/\b40\b/g, '四十'],
      [/\b32\b/g, '三十二'],
      [/\b13\b/g, '十三'],
      [/\b25\b/g, '二十五'],
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
