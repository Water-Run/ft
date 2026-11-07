// 旁白脚本：每个 cue = [句号, 字幕, {tts, gap, pause}]
// - 只有中文：字幕直接写字符串。tts 缺省时由字幕按 SAY 表换成读法（字幕写正式拼写，读法只放在 SAY 表或 tts 字段）
// - 字幕里 *词* 标出术语（字幕上显示为强调）；术语第一次出现的那句说完时，画面上要有 data-gloss="词" 的注解（scan.js 的 GLOSS）
// - gap：该句结束到下一句开始的停顿（秒，缺省 0.3）；pause：无旁白的纯画面停顿（标题、转场）
// - 片尾署名只上画面：['credits', null, { pause: 8, credits: true }]；名单由 scenes/s9_credits.js 从 project.json 读取
// - 每章一个 scene：chap [编号, 标题]（null 表示没有章节卡）、lead 章节卡时长、tail 章末留白
// 事实依据见 research/FACTS.md；句号与事实条目的对应写在 FACTS 各节的表里。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);

  const RAW = [
    {
      id: 'open', chap: null, lead: 1.0, tail: 0.4,
      cues: [
        ['o1', '25992 × 92138，等于多少？', { tts: '两万五千九百九十二，乘以九万两千一百三十八，等于多少？', gap: 1.0 }],
        ['o2', '我们把这道题交给 DeepSeek，只许它说答案', { gap: 0.4 }],
        ['o3', '它给出一个十位数：前四位对，后四位也对', { gap: 0.3 }],
        ['o4', '偏偏错在中间两位', { gap: 1.0 }],
        ['o5', '换个问法：先把算式写出来，再给答案', { gap: 0.4 }],
        ['o6', '同一个模型，这次一位不差', { gap: 0.9 }],
        ['o7', '再换一种：先写答案，再写过程', { gap: 0.5 }],
        ['o8', '过程有板有眼', { gap: 0.3 }],
        ['o9', '最后一步相加，却不偏不倚，加成了第一行那个错答案', { gap: 1.2 }],
        ['o10', '先思考，再回答', { gap: 0.9 }],
        ['o11', '这种问法叫*思维链*，Chain of Thought，简称 CoT', { gap: 0.8 }],
        ['o12', '写出来，为什么就能算对？', { gap: 0.8 }],
        ['o13', '说到底，对一台一个字接一个字往下写的机器', { gap: 0.2 }],
        ['o14', '「思考」究竟是什么？', { gap: 1.0 }],
        ['oT', null, { pause: 3.2 }],
      ],
    },
    {
      id: 'origin', chap: ['01', '一句话'], lead: 2.3, tail: 0.6,
      cues: [
        ['h1', '这个名字，来自 2022 年 1 月谷歌研究者的一篇论文', { gap: 0.5 }],
        ['h2', '他们给模型看几道示范题，解题步骤都写在答案前面', { gap: 0.3 }],
        ['h3', '模型有样学样，遇到新题，也先写步骤', { gap: 0.5 }],
        ['h4', '一套数学应用题，正确率从不到两成，跳到将近六成', { gap: 0.9 }],
        ['h5', '几个月后，又有人发现：连示范都不必给', { gap: 0.3 }],
        ['h6', '只要在答案前加一句：Let’s think step by step', { tts: '只要在答案前加一句：lets think step by step', gap: 0.3 }],
        ['h7', '我们一步一步来想', { gap: 0.5 }],
        ['h8', '同一套题，正确率从一成升到四成', { gap: 0.9 }],
        ['h9', '模型一点没变，变的只是答案前面多了几行字', { gap: 0.6 }],
        ['h10', '几行字，凭什么这么管用？', { gap: 0.6 }],
      ],
    },
    {
      id: 'paper', chap: ['02', '草稿纸'], lead: 2.3, tail: 0.6,
      cues: [
        ['c1', '模型写字，其实一次只写一小块，这一小块叫 *token*', { gap: 0.5 }],
        ['c2', '开头那个错答案，它只用四块就写完了', { gap: 0.7 }],
        ['c3', '每写一块，它都把前面所有的字从头读一遍', { gap: 0.3 }],
        ['c4', '经过一层又一层的计算，才决定下一块写什么', { gap: 0.5 }],
        ['c5', '层数是固定的，比如 GPT-3 有 96 层', { gap: 0.4 }],
        ['c6', '不管这一块多难写，能用的就这么多层', { gap: 0.7 }],
        ['c7', '只许说答案，等于逼它用四块字的工夫，算完整道乘法', { gap: 0.9 }],
        ['c8', '乘积的开头，大致估得出来', { gap: 0.3 }],
        ['c9', '末尾几位，只看两个数的末尾就能定', { gap: 0.4 }],
        ['c10', '难的是中间：那几位要一步一步地进位', { gap: 0.5 }],
        ['c11', '它错的，恰好就是中间', { gap: 0.9 }],
        ['c12', '人遇到这种题，会顺手拿一张草稿纸', { gap: 0.4 }],
        ['c13', '模型没有草稿纸，除非它把草稿写出来', { gap: 0.9 }],
        ['c14', '先把 92138 拆成 92000 加 138', { tts: '先把九万两千一百三十八，拆成九万两千，加一百三十八', gap: 0.3 }],
        ['c15', '两部分分别乘，再相加', { gap: 0.4 }],
        ['c16', '每一步都很小，几块字的工夫就够了', { gap: 0.3 }],
        ['c17', '写下的每个结果，后面每一块都能回头读到', { gap: 0.5 }],
        ['c18', '写出来的字，就是它的草稿纸', { gap: 1.1 }],
        ['c19', '那是不是写得越多越好？', { gap: 0.4 }],
        ['c20', '谷歌的论文试过：让模型先写一串点，和算式一样长', { gap: 0.3 }],
        ['c21', '成绩和直接回答差不多', { gap: 0.4 }],
        ['c22', '有用的不是字数，是纸上写下的内容', { gap: 0.9 }],
        ['c23', '我们出了一百道乘法，从三位数到七位数', { gap: 0.4 }],
        ['c24', '只许说答案，位数一多，几乎全军覆没', { gap: 0.4 }],
        ['c25', '先写过程，一百道只错了一道', { gap: 0.9 }],
      ],
    },
    {
      id: 'order', chap: ['03', '顺序'], lead: 2.3, tail: 0.6,
      cues: [
        ['s1', '那么，过程写在答案后面，行不行？', { gap: 0.4 }],
        ['s2', '谷歌的论文也试过：成绩还是和直接回答差不多', { gap: 0.7 }],
        ['s3', '再看开头那第三种问法', { gap: 0.4 }],
        ['s4', '第一行的答案，已经错了', { gap: 0.5 }],
        ['s5', '接着，拆分对了，两次乘法也对了', { gap: 0.4 }],
        ['s6', '最后一步相加，本该得出正确的乘积', { gap: 0.3 }],
        ['s7', '它写下的，却正是第一行那个错数', { gap: 1.1 }],
        ['s8', '五位数的二十道题，这样问，只对了两道', { gap: 0.6 }],
        ['s9', '它写字一块接一块，落笔就收不回来', { gap: 0.3 }],
        ['s10', '后面的每一块，都要顺着前面写', { gap: 0.3 }],
        ['s11', '答案一旦先写下，后面的过程，往往就去迁就它', { gap: 0.9 }],
        ['s12', '思考写在答案前面，是在算', { gap: 0.4 }],
        ['s13', '写在答案后面，只是在解释', { gap: 0.9 }],
      ],
    },
    {
      id: 'learn', chap: ['04', '学会思考'], lead: 2.3, tail: 0.6,
      cues: [
        ['r1', '起初，「一步一步来想」只是提问时的一句话', { gap: 0.3 }],
        ['r2', '后来，人们把它训练成了模型自己的习惯', { gap: 0.5 }],
        ['r3', '2024 年，OpenAI 发布 o1：回答之前，先写出很长的思考', { gap: 0.5 }],
        ['r4', '2025 年 1 月，DeepSeek 公开了 R1 的训练方法', { gap: 0.3 }],
        ['r5', '其中一个版本，训练时不给它看人写的解题过程', { gap: 0.3 }],
        ['r6', '答对了，就给奖励', { gap: 0.4 }],
        ['r7', '这种靠奖励、不靠示范的训练，叫*强化学习*', { gap: 0.5 }],
        ['r8', '没人要求它多想，它的思考却自己越写越长', { gap: 0.3 }],
        ['r9', '训练到中途，它在思考里写下这样一句', { gap: 0.3 }],
        ['r10', '等等，等等。等等。这是一个值得标记的顿悟时刻', { gap: 0.8 }],
        ['r11', '没有人示范过，该怎样停下来反思', { gap: 0.9 }],
        ['r12', '我们把开头那道题，交给 DeepSeek 的思考模式', { gap: 0.4 }],
        ['r13', '它算对之后，又换了一种拆法，自己验算了一遍', { gap: 0.5 }],
        ['r14', '那一百道里取二十五道，它全答对；位数越多，想得越久', { gap: 0.9 }],
      ],
    },
    {
      id: 'faith', chap: ['05', '说出来的理由'], lead: 2.3, tail: 0.6,
      cues: [
        ['f1', '可是，写在答案前面的思考，就是它真正的想法吗？', { gap: 0.7 }],
        ['f2', '2025 年，Anthropic 拿会思考的模型做了个测试', { gap: 0.3 }],
        ['f3', '在选择题里塞一条提示：斯坦福教授认为答案是 A', { gap: 0.3 }],
        ['f4', '模型跟着提示改了答案，思考里却多半只字不提', { gap: 0.3 }],
        ['f5', '提到这条提示的，Claude 3.7 Sonnet 只有四分之一', { gap: 0.25 }],
        ['f6', 'DeepSeek R1 也不到四成', { gap: 0.9 }],
        ['f7', '人其实也一样。1977 年，两位心理学家发表过一个实验', { gap: 0.3 }],
        ['f8', '他们请路人从四双一模一样的丝袜里，挑出质量最好的', { gap: 0.5 }],
        ['f9', '最右边那双被挑中的次数，是最左边的将近四倍', { gap: 0.4 }],
        ['f10', '问起理由，没有一个人主动提到位置', { gap: 0.3 }],
        ['f11', '直接问是不是位置的缘故，几乎人人否认', { gap: 0.3 }],
        ['f12', '还往往担心地看调查员一眼', { gap: 0.2 }],
        ['f13', '好像自己听错了问题，或者遇上了疯子', { gap: 0.9 }],
        ['f14', '说出来的理由，和真正的原因，可以是两回事', { gap: 1.0 }],
      ],
    },
    {
      id: 'end', chap: null, lead: 1.0, tail: 0.4,
      cues: [
        ['e1', '回到最初的问题', { gap: 0.5 }],
        ['e2', '对一台一个字接一个字往下写的机器，思考是什么？', { gap: 0.8 }],
        ['e3', '要多想，就要多写', { gap: 0.4 }],
        ['e4', '四块字算不完的乘法，三百多块的草稿就能算对', { gap: 1.0 }],
        ['e5', '写下的字，是它的草稿纸，帮它走到答案', { gap: 0.3 }],
        ['e6', '却不一定是一扇窗，让我们看清它为什么走到那里', { gap: 1.0 }],
        ['e7', '这一点上，它和我们，也许并没有那么不同', { gap: 1.0 }],
        ['e8', '先思考，再回答', { gap: 1.6 }],
      ],
    },
    {
      id: 'credits', chap: null, lead: 0.4, tail: 0.6,
      cues: [
        ['credits', null, { pause: 8, credits: true }],
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。
  const SAY = {
    zh: [
      [/Claude 3\.7 Sonnet/g, 'Claude 三点七 Sonnet'],
      [/DeepSeek R1/g, 'DeepSeek R 一'],
      [/R1 的/g, 'R 一的'],
      [/GPT-3/g, 'G P T 三'],
      [/OpenAI 发布 o1/g, 'OpenAI 发布 O 一'],
      [/CoT/g, 'C O T'],
      [/2022 年/g, '二零二二年'],
      [/2023 年/g, '二零二三年'],
      [/2024 年/g, '二零二四年'],
      [/2025 年/g, '二零二五年'],
      [/1977 年/g, '一九七七年'],
      [/第一行/g, '第一航'],
      [/几行字/g, '几航字'],
      [/96 层/g, '九十六层'],
      [/1 月/g, '一月'],
      [/[「」]/g, ''],
    ],
  };
  const strip = (s) => s.replace(/\*/g, '');
  const ttsNorm = (s) => { for (const [re, to] of SAY[LANG] || []) s = s.replace(re, to); return s; };
  const SCRIPT = RAW.map((sc) => ({
    ...sc, chap: sc.chap ? [sc.chap[0], pick(sc.chap[1])] : null,
    cues: sc.cues.map(([id, cap, o = {}]) => [id, pick(cap), { ...o, tts: pick(o.tts), gap: pick(o.gap) }]),
  }));
  const ttsText = (c) => (c[2] && c[2].tts) || ttsNorm(strip(c[1]) + (LANG === 'zh' && !/[。？！]$/.test(c[1]) ? '。' : ''));

  // 没有实测时长时的估算（合成旁白之前的占位）
  const estimate = (text) => (LANG === 'zh' ? 0.35 + text.replace(/[，。：；、\s]/g, '').length / 5.2 : 0.3 + text.split(/\s+/).length / 2.7);

  // 由脚本与实测时长算出整条时间线；浏览器端排动画、Node 端混音与检查都用它
  function layoutScript(DUR) {
    DUR = DUR || {};
    let t = 0;
    const cues = {}, scenes = [], order = [];
    for (const sc of SCRIPT) {
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
      t += sc.tail || 0.6;
      scenes.push({ id: sc.id, chap: sc.chap, start: s0, first, end: t, lead: sc.lead || 0 });
    }
    return { cues, scenes, order, total: t };
  }

  const api = { SCRIPT, LANG, pick, tr, layoutScript, ttsText, ttsNorm, strip };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { Object.assign(root, api); root.DUR = (root.DUR_ALL || {})[LANG] || {}; }
})(typeof window !== 'undefined' ? window : globalThis);
