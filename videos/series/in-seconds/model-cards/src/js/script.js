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
// 2026-10-19 第 1 轮，待 WaterRun 审查：中文定稿；英文是直译草稿，中文确认后按中文重译。
// 主问题：决定用不用一个模型之前，应该先读它那份说明里的哪几栏。
// 讲法：沿一张真实的模型卡（google-bert/bert-base-uncased）从上往下走边读边说，不用抽象定义开场。
// 开头两个填空与两个分数全部取自这张卡的 Limitations and bias 一节，见 research/FACTS.md。
// F04：r7 之后的 rT 与 c1 之后的 cT 是无旁白的纯画面停顿，给那两个分数与结论留足阅读时间，不是拖时间。
// F14：z1 是静默片尾，credits: true，不设 tts、不写字幕。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);            // 画面里的文字：tr('中文', 'English')

  const TOTAL = 96;
  const RAW = [
    {
      // 现象：两道填空，两个答案。先看见结果，再知道这些答案写在哪里。
      id: 'open', at: 0, chap: null, lead: 0.12, tail: 0.12,
      cues: [
        ['o1', { zh: '填空「那个男人干的工作是」，模型答木匠', en: '"The man worked as a [MASK]." Answer: *carpenter*.' }, { gap: 0.16 }],
        ['o2', { zh: '换成「那个女人」，同一个模型答护士', en: 'Same sentence, "woman": the model answers *nurse*.' }, { gap: 0.16 }],
        ['o3', { zh: '两个答案，都写在它自己的说明里', en: 'Both answers are in its own description.' }, { gap: 0.16 }],
        ['o4', { zh: '这份说明叫*模型卡*', en: 'That description is a *model card*.' }, { gap: 0.12 }],
        ['oT', null, { pause: 2.6, gap: 0 }],   // 片名卡停在模型卡的定义之后
      ],
    },
    {
      // 它是什么：随模型发布的简短文档；2018 年论文提出，要求写清评测与使用场合。
      id: 'what', at: 15.75, chap: null, lead: 0.16, tail: 0.14,
      cues: [
        ['w1', { zh: '模型卡是跟着模型一起发布的一份简短文档', en: 'A model card is a short document published with a model.' }, { gap: 0.16 }],
        ['w2', { zh: '2018 年一篇论文提出这个做法，要求写清评测和使用场合', en: 'A 2018 paper proposed it: write down the evaluation and the intended use.' }, { gap: 0.16 }],
      ],
    },
    {
      // 重头：从上往下读三栏。机器读的头 → 用途与限制 → 局限与偏见 → 评测结果。
      // 卡里的 Model description、Model variations、Training data、Training procedure 在本片不逐栏讲，
      // 旁白 c3 明说「其余可以先跳过」，画面上镜头快速经过，不加任何说明性小字。
      id: 'read', at: 26.25, chap: null, lead: 0.16, tail: 0.12,
      cues: [
        ['r1', { zh: '从上往下读：最上面是机器读的元数据', en: 'From the top: machine-readable metadata first.' }, { gap: 0.16 }],
        ['r2', { zh: '接着这一栏，回答*它能做什么*', en: 'The next section answers *what it is meant for*.' }, { gap: 0.16 }],
        ['r3', { zh: '卡里写明：这个模型主要拿整句做判断', en: 'The card says: this model is mainly for decisions on whole sentences.' }, { gap: 0.16 }],
        ['r4', { zh: '要做文本生成，应该看 *GPT2* 这类模型', en: 'For text generation, look at a model like *GPT2*.' }, { gap: 0.16 }],
        ['r5', { zh: '再往下一栏，叫*局限与偏见*', en: 'The next section is *Limitations and bias*.' }, { gap: 0.16 }],
        ['r6', { zh: '卡里直接给了两个可以复现的例子', en: 'The card gives two reproducible examples.' }, { gap: 0.16 }],
        ['r7', { zh: '男人那道，首选木匠 0.097；女人那道，首选护士 0.220', en: 'Man: carpenter 0.097. Woman: nurse 0.220.' }, { gap: 0.2 }],
        ['rT', null, { pause: 1.9, gap: 0 }],   // F04：两个分数与它们并排出现之后，静止读完再走
        ['r8', { zh: '卡里写明：这个偏见会传染给所有微调版', en: 'The card says: this bias carries over to every fine-tuned version.' }, { gap: 0.2 }],
        ['r9', { zh: '最后一栏是评测结果：GLUE 语言理解测试，微调后平均 79.6', en: 'Last section: evaluation. GLUE, a language test suite, averages 79.6.' }, { gap: 0.16 }],
      ],
    },
    {
      // 边界：这张卡不是发模型的团队写的。写卡的人是谁，本身就是判断材料。
      id: 'edge', at: 64.75, chap: null, lead: 0.16, tail: 0.12,
      cues: [
        ['e1', { zh: '开头还有一句免责声明：发 *BERT* 的团队没写这张卡', en: 'A disclaimer at the top: the *BERT* team did not write it.' }, { gap: 0.16 }],
        ['e2', { zh: '由 *Hugging Face* 团队代写', en: 'The *Hugging Face* team wrote it.' }, { gap: 0.16 }],
        ['e3', { zh: '所以读模型卡，先看是谁写的', en: 'So first check who wrote the card.' }, { gap: 0.16 }],
      ],
    },
    {
      // 结论：回答开头。停 1.2 秒是结论留白，不是转场。
      id: 'close', at: 76.6, chap: null, lead: 0.14, tail: 0.12,
      cues: [
        ['c1', { zh: '决定用不用一个模型，先读三栏', en: 'To use a model, read three sections.' }, { gap: 0.16 }],
        ['c2', { zh: '用途与限制、局限与偏见、评测结果', en: 'Intended uses and limitations, bias, evaluation.' }, { gap: 0.16 }],
        ['cT', null, { pause: 1.2, gap: 0 }],
        ['c3', { zh: '三栏读完，就知道能做什么、不能做什么', en: 'Those three tell you what it can and cannot do.' }, { gap: 0.1 }],
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
      [/Hugging Face/g, 'hugging face'],
      [/BERT/g, 'B E R T'],
      [/GPT2/g, 'G P T two'],
      [/GLUE/g, 'glue'],
      [/0\.097/g, '零点零九七'],
      [/0\.220/g, '零点二二零'],
      [/79\.6/g, '七十九点六'],
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
