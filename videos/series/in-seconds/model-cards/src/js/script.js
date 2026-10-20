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
// 2026-10-20 第 2 轮，待 WaterRun 审查：WaterRun 认为 BERT 太旧，例子换成 deepseek-ai/DeepSeek-V4.1-Flash 的模型卡。
// 中文为交审稿；英文是直译草稿，中文确认后按中文重译。
// 主问题：决定用不用一个模型之前，模型卡上该先找什么。
// 讲法：开头给同一个模型换跑法后的分数差，再沿这张卡从上往下读到成绩表、跑法表与它链接的技术报告。
// 全部数字与原文见 research/FACTS.md 的「第 2 稿起的例子」。
// F04：r7 之后的 rT 与 c2 之后的 cT 是无旁白的纯画面停顿，给跑法表上的两个分数与结论留足阅读时间。
// F14：z1 是静默片尾，credits: true，不设 tts、不写字幕。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);            // 画面里的文字：tr('中文', 'English')

  const TOTAL = 96;
  const RAW = [
    {
      // 现象：同一个模型、同一套测试，换一种跑法，分数就变。先看见结果，再知道这些写在哪里。
      id: 'open', at: 0, chap: null, lead: 0.12, tail: 0.12,
      cues: [
        ['o1', { zh: '同一个模型、同一套编程测试，分数从 65.5 到 74.2', en: 'Same model, same coding benchmark: scores from 65.5 to 74.2.' }, { gap: 0.16 }],
        ['o2', { zh: '模型没换，换的只是外面那层跑它的程序', en: 'The model did not change. Only the program around it did.' }, { gap: 0.16 }],
        ['o3', { zh: '这件事，它自己的说明里就写着', en: 'Its own documentation says so.' }, { gap: 0.16 }],
        ['o4', { zh: '这份说明叫*模型卡*', en: 'That document is the *model card*.' }, { gap: 0.12 }],
        ['oT', null, { pause: 2.6, gap: 0 }],   // 片名卡停在模型卡的名字之后
      ],
    },
    {
      // 它是什么：随模型发布的简短文档；2018 年论文提出，主张写清评测方法与使用场合。
      id: 'what', at: 17.3, chap: null, lead: 0.16, tail: 0.14,
      cues: [
        ['w1', { zh: '模型卡是跟着模型一起发布的一份简短文档', en: 'A model card is a short document published with a model.' }, { gap: 0.16 }],
        ['w2', { zh: '2018 年一篇论文提出，主张写清评测方法和使用场合', en: 'A 2018 paper proposed it: report evaluation and intended use.' }, { gap: 0.16 }],
      ],
    },
    {
      // 重头：沿 DeepSeek V4.1 Flash 的卡往下读。元数据 → 成绩表的测试条件 → 跑法表。
      // 卡里的结构介绍（参数量、注意力、KV 缓存）不进旁白：与参数一集分工，也不是决定用不用的条件。
      id: 'read', at: 27.2, chap: null, lead: 0.16, tail: 0.12,
      cues: [
        ['r1', { zh: '拿 *DeepSeek V4.1 Flash* 的卡来读', en: 'Take the card for *DeepSeek V4.1 Flash*.' }, { gap: 0.16 }],
        ['r2', { zh: '最上面几行写给机器看：许可证 *MIT*', en: 'The top lines are for machines: license *MIT*.' }, { gap: 0.16 }],
        ['r3', { zh: '往下翻到成绩表，先找测试条件', en: 'Scroll down to the scores. Find the test conditions first.' }, { gap: 0.16 }],
        ['r4', { zh: '表上方写着：全部开到最高推理强度 *100*', en: 'Above the table: everything ran at maximum reasoning effort, *100*.' }, { gap: 0.16 }],
        ['r5', { zh: '调低能省钱，分数也可能更低', en: 'Lower settings cost less, and may score lower.' }, { gap: 0.2 }],
        ['r6', { zh: '再往下一张表：同一套编程测试，换了八种跑法', en: 'Another table: the same coding benchmark, run eight ways.' }, { gap: 0.16 }],
        ['r7', { zh: '*Claude Code* 跑出 69.8，mini-SWE 跑出 74.2', en: '*Claude Code* gets 69.8; mini-SWE gets 74.2.' }, { gap: 0.2 }],
        ['rT', null, { pause: 1.9, gap: 0 }],   // F04：跑法表与两个分数完整出现之后，静止读完再走
        ['r8', { zh: '你平时用哪一种，就该看哪一格', en: 'Read the cell for the setup you actually use.' }, { gap: 0.16 }],
      ],
    },
    {
      // 边界：卡上没有局限一栏；局限写在它链接的技术报告里，开发方自己说了跑分接近不等于能力追平。
      id: 'edge', at: 61.6, chap: null, lead: 0.16, tail: 0.12,
      cues: [
        ['e1', { zh: '这张卡上，没有专门写局限的一栏', en: 'This card has no section on limitations.' }, { gap: 0.16 }],
        ['e2', { zh: '局限写在它链接的技术报告里', en: 'They are in the linked technical report.' }, { gap: 0.16 }],
        ['e3', { zh: '开发方自己写着：跑分差得不多', en: 'The developers write: close scores' }, { gap: 0.16 }],
        ['e4', { zh: '不等于在最难的推理上，追平了顶尖闭源模型', en: 'do not mean parity with top closed models on the hardest reasoning.' }, { gap: 0.16 }],
      ],
    },
    {
      // 结论：回答开头。停 1.5 秒是结论留白，不是转场。
      id: 'close', at: 76.0, chap: null, lead: 0.14, tail: 0.12,
      cues: [
        ['c1', { zh: '决定用不用一个模型，卡上先找三样', en: 'Before using a model, find three things.' }, { gap: 0.16 }],
        ['c2', { zh: '许可证、分数的测法、局限写在哪', en: 'License, test conditions, and where the limitations are.' }, { gap: 0.16 }],
        ['cT', null, { pause: 1.5, gap: 0 }],
        ['c3', { zh: '三样找齐，那些分数才读得懂', en: 'Then the scores make sense.' }, { gap: 0.1 }],
      ],
    },
    {
      // 片尾名单：策划、参与模型与分工、开源视频的仓库地址。不配旁白。
      id: 'outro', at: 88, chap: null, lead: 0.5, tail: 0,
      cues: [
        ['z1', null, { pause: 7.5, gap: 0, credits: true }],
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。先用 kit/tools/tts_probe.js 试，再用 asr.js 回听。
  const SAY = {
    zh: [
      [/DeepSeek V4\.1 Flash/g, 'DeepSeek V四点一 Flash'],
      [/Claude Code/g, 'Claude Code'],
      [/mini-SWE/g, 'mini S W E'],
      [/MIT/g, 'M I T'],
      [/65\.5/g, '六十五点五'],
      [/74\.2/g, '七十四点二'],
      [/69\.8/g, '六十九点八'],
      [/100/g, '一百'],
    ],
    en: [],
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
