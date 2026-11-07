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
        ['o2', '我们拿这道题问 DeepSeek，要它只报答案', { gap: 0.4 }],
        ['o3', '它报了一个十位数，前四位对，后四位也对', { gap: 0.3 }],
        ['o4', '错在中间两位', { gap: 1.0 }],
        ['o5', '第二次，我们让它先把算式写出来，再说答案', { gap: 0.4 }],
        ['o6', '这回它算对了', { gap: 0.9 }],
        ['o7', '第三次反过来：先写答案，再补过程', { gap: 0.5 }],
        ['o8', '过程里的拆分和乘法都没问题', { gap: 0.3 }],
        ['o9', '最后一步加完，得出的正好是这一次开头写下的那个错数', { gap: 1.2 }],
        ['o10', '同一个模型，同一道题', { gap: 0.3 }],
        ['o11', '差别只在：过程写不写，写在答案前还是后', { gap: 0.8 }],
        ['o12', '让模型先写推理、再给答案，这种做法叫*思维链*', { gap: 0.3 }],
        ['o13', '英文是 Chain of Thought，简称 CoT', { gap: 0.8 }],
        ['o14', '先多写几行字，怎么就算对了？', { gap: 0.4 }],
        ['o15', '这几行「思考」，到底算什么？', { gap: 1.0 }],
        ['oT', null, { pause: 2.7 }],
      ],
    },
    {
      id: 'origin', chap: ['01', '一句话'], lead: 3.2, tail: 0.6,
      cues: [
        ['h1', '「思维链」这个名字，出自谷歌 2022 年 1 月的一篇论文', { gap: 0.5 }],
        ['h2', '他们给模型看几道例题，步骤都写在答案前面', { gap: 0.3 }],
        ['h3', '模型照着样子，碰到新题也先写步骤', { gap: 0.5 }],
        ['h4', '一套数学应用题，正确率从不到两成涨到将近六成', { gap: 0.9 }],
        ['h5', '过了几个月，另一组研究者发现，连例题都不用给', { gap: 0.3 }],
        ['h6', '只要在答案前面加一句 Let’s think step by step', { tts: '只要在答案前面加一句，lets think step by step', gap: 0.3 }],
        ['h7', '意思是：我们一步一步来想', { gap: 0.5 }],
        ['h8', '换一个模型、同一套题，正确率从一成左右涨到了四成', { gap: 0.9 }],
        ['h9', '模型本身没改，只是答案前面多了几行字', { gap: 0.6 }],
      ],
    },
    {
      id: 'paper', chap: ['02', '草稿纸'], lead: 3.2, tail: 0.6,
      cues: [
        ['c1', '模型写字，一次写一小块，这一小块叫 *token*', { gap: 0.5 }],
        ['c2', '开头那个错答案，它一共只写了四块', { gap: 0.7 }],
        ['c3', '每写一块，都要把前面所有的内容重新读一遍', { gap: 0.3 }],
        ['c4', '再经过一层一层的计算，决定下一块写什么', { gap: 0.5 }],
        ['c5', '这个层数是固定的，比如 GPT-3 是 96 层', { gap: 0.4 }],
        ['c6', '不管下一块好不好算，能用的就这么多层', { gap: 0.7 }],
        ['c7', '只让它报答案，就等于要它在写这四块的时候', { gap: 0.2 }],
        ['c8', '把整道乘法一口气算完', { gap: 0.9 }],
        ['c9', '乘积开头几位，大致估得出来', { gap: 0.3 }],
        ['c10', '末尾几位，只看两个数的末尾就能算', { gap: 0.4 }],
        ['c11', '最麻烦的是中间那几位，要一位一位地进位', { gap: 0.5 }],
        ['c12', '它错的，正好是中间', { gap: 0.9 }],
        ['c13', '换成人来算，这种题一般会拿张纸写一写', { gap: 0.4 }],
        ['c14', '模型没有纸，要打草稿，只能写进回答里', { gap: 0.8 }],
        ['c15', '比如先把 92138 拆成 92000 加 138', { tts: '比如先把九万两千一百三十八，拆成九万两千，加一百三十八', gap: 0.3 }],
        ['c16', '两边分别乘，最后加起来', { gap: 0.4 }],
        ['c17', '每一步都不大，写几块就能算出来', { gap: 0.3 }],
        ['c18', '写下的每个结果，后面都还能读到', { gap: 0.5 }],
        ['c19', '这些写出来的字，就是它的草稿纸', { gap: 1.1 }],
        ['c20', '那是不是随便多写点什么都行？谷歌那篇论文试过', { gap: 0.3 }],
        ['c21', '让模型先输出一串点，长度和算式一样', { gap: 0.3 }],
        ['c22', '结果和直接回答差不多', { gap: 0.9 }],
        ['c23', '我们自己也出了一百道乘法，从三位数到七位数', { gap: 0.4 }],
        ['c24', '只报答案的话，位数一多，基本都错', { gap: 0.4 }],
        ['c25', '先写过程，一百道里只错了一道', { gap: 0.9 }],
      ],
    },
    {
      id: 'learn', chap: ['03', '学会思考'], lead: 3.2, tail: 0.6,
      cues: [
        ['r1', '一开始，「一步一步来想」只是人在提问时加的一句话', { gap: 0.3 }],
        ['r2', '后来，这个做法直接练进了模型里', { gap: 0.5 }],
        ['r3', '2024 年，OpenAI 发布 o1，回答之前会先写一大段思考', { gap: 0.5 }],
        ['r4', '2025 年 1 月，DeepSeek 公开了 R1 的训练方法', { gap: 0.3 }],
        ['r5', '其中有一个版本，训练时不给它看人写的解题过程', { gap: 0.3 }],
        ['r6', '答对了，就给奖励', { gap: 0.5 }],
        ['r7', '没人要求它想得更长，它的思考却越写越长', { gap: 0.3 }],
        ['r8', '训练到中途，它在思考里写了这么一句', { gap: 0.3 }],
        ['r9', '等等，等等。等等。这是个顿悟时刻，可以在这儿标记一下', { gap: 0.8 }],
        ['r10', '训练时，没人示范过怎么停下来回头检查', { gap: 0.9 }],
        ['r11', '我们也把开头那道题，拿去问了 DeepSeek 的思考模式', { gap: 0.4 }],
        ['r12', '它算对以后，又换了一种拆法，自己验算了一遍', { gap: 0.5 }],
        ['r13', '再从那一百道里，每种位数各取前五道', { gap: 0.3 }],
        ['r14', '二十五道全做对了；位数越多，它想得越久', { gap: 0.9 }],
      ],
    },
    {
      id: 'order', chap: ['04', '顺序'], lead: 3.2, tail: 0.6,
      cues: [
        ['s1', '回到开头的第三次：它也写了过程，结果还是错的', { gap: 0.4 }],
        ['s2', '拆分、乘法都没错，最后却加回了这一次开头写的错数', { gap: 0.6 }],
        ['s3', '它是一块接一块往下写的，写出去就收不回来', { gap: 0.3 }],
        ['s4', '答案先摆在那儿，后面的过程往往就去凑它', { gap: 0.6 }],
        ['s5', '谷歌那篇论文也测过这种写法，成绩跟只报答案几乎一样', { gap: 0.4 }],
        ['s6', '那一百道里的五位数题，这样问，二十道只对了两道', { gap: 0.6 }],
        ['s7', '这样写出来的过程，更像是事后补的解释', { gap: 1.0 }],
      ],
    },
    {
      id: 'faith', chap: ['05', '说出来的理由'], lead: 3.2, tail: 0.6,
      cues: [
        ['f1', '那写在答案前面的思考，会不会也没说出真正的原因？', { gap: 0.8 }],
        ['f2', '2025 年，Anthropic 拿会思考的模型做了个实验', { gap: 0.3 }],
        ['f3', '在选择题里塞一条提示，比如「斯坦福教授认为答案是 A」', { gap: 0.4 }],
        ['f4', '有些题，模型照着提示改了答案', { gap: 0.3 }],
        ['f5', '可在它写下的思考里，提到这条提示的', { gap: 0.2 }],
        ['f6', 'Claude 3.7 Sonnet 只有四分之一', { gap: 0.2 }],
        ['f7', 'DeepSeek R1 不到四成', { gap: 1.0 }],
        ['f8', '人自己说的理由，也有人测过', { gap: 0.3 }],
        ['f9', '两位心理学家 1977 年发表过一个商店里的实验', { gap: 0.3 }],
        ['f10', '他们请路人从四双一模一样的丝袜里，挑出质量最好的一双', { gap: 0.5 }],
        ['f11', '最右边那双被挑中的次数，是最左边的将近四倍', { gap: 0.4 }],
        ['f12', '问大家为什么选它，没有一个人主动说是因为位置', { gap: 0.3 }],
        ['f13', '直接问是不是位置的原因，几乎所有人都说不是', { gap: 0.3 }],
        ['f14', '多半还会不放心地瞟调查员一眼', { gap: 0.2 }],
        ['f15', '那眼神像在说：是我听错了，还是你疯了？', { gap: 1.2 }],
      ],
    },
    {
      id: 'end', chap: null, lead: 1.0, tail: 0.4,
      cues: [
        ['e1', '再看开头那三次回答', { gap: 0.6 }],
        ['e2', '第一次只报答案，写四块字的那点计算，不够算完这道题', { gap: 0.4 }],
        ['e3', '第二次先写草稿，一步一步，算对了', { gap: 0.4 }],
        ['e4', '第三次答案先定，过程是照着答案补的', { gap: 1.0 }],
        ['e5', '先思考再回答，能让它算得更对', { gap: 0.6 }],
        ['e6', '它写下的「思考」，可以是第二次那样的草稿', { gap: 0.3 }],
        ['e7', '也可能像第三次，说的和真正起作用的对不上', { gap: 0.5 }],
        ['e8', '就像那条提示，起了作用，却没写进理由里', { gap: 1.0 }],
        ['e9', '所以它写下的思考，不能全当成理由来读', { gap: 2.0 }],
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
