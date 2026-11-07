// 旁白脚本：每个 cue = [句号, 字幕, {tts, gap, pause}]
// - 只有中文：字幕直接写字符串。tts 缺省时由字幕按 SAY 表换成读法（字幕写正式拼写，读法只放在 SAY 表或 tts 字段）
// - 字幕里 *词* 标出术语（字幕上显示为强调）；术语第一次出现的那句说完时，画面上要有 data-gloss="词" 的注解（scan.js 的 GLOSS）
// - gap：该句结束到下一句开始的停顿（秒，缺省 0.3）；pause：无旁白的纯画面停顿（标题、转场）
// - 片尾署名只上画面：['credits', null, { pause: 8, credits: true }]；名单由 scenes/s9_credits.js 从 project.json 读取
// - 每章一个 scene：chap [编号, 标题]（null 表示没有章节卡）、lead 章节卡时长、tail 章末留白
// 事实依据见 research/FACTS.md；句号与事实条目的对应写在 FACTS 各节的表里。
// 第 5 稿（2026-11-07）：主线只有一条——模型写每一块字，只能做固定的一趟计算；一趟里的结果只往上走，要交给下一趟，只能写成字。所以要多想，只能多写，而且要写在答案前面。
// 跟着片名走：开场三次回答提出两个问题；01 讲直接回答为什么不够（一趟），02 讲「思考」就是写草稿、写下的结果怎样接力，03 讲「先、再」（第三次），04 讲模型自己学会了多写；结尾回到片名。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);

  const RAW = [
    {
      id: 'open', chap: null, lead: 1.0, tail: 0.4,
      cues: [
        ['o1', '25992 × 92138，等于多少？', { tts: '两万五千九百九十二，乘以九万两千一百三十八，等于多少？', gap: 1.2 }],
        ['o2', '只看一眼，最多能估个大概，二十三亿多', { gap: 0.8 }],
        ['o3', '我们拿这道题问 DeepSeek，只许它报答案', { gap: 0.4 }],
        ['o4', '它报了一个十位数，前四位对，后四位也对', { gap: 0.3 }],
        ['o5', '错在中间两位', { gap: 1.0 }],
        ['o6', '第二次，我们让它先把算式写出来，再说答案', { gap: 0.4 }],
        ['o7', '这回它算对了', { gap: 0.9 }],
        ['o8', '第三次反过来，先写答案，再补过程', { gap: 0.5 }],
        ['o9', '过程里的拆分和乘法都没问题', { gap: 0.3 }],
        ['o10', '可最后一步加错了，加出来的，正好是它开头写的那个数', { gap: 1.2 }],
        ['o11', '三次，同一个模型，同一道题；差别只在过程写没写，写在答案前还是后', { gap: 0.8 }],
        ['o12', '让模型先写推理、再给答案，这种做法叫*思维链*', { gap: 0.3 }],
        ['o13', '英文是 Chain of Thought，简称 CoT，出自谷歌 2022 年的一篇论文', { gap: 0.9 }],
        ['o14', '多写几行字，为什么就算对了？', { gap: 0.4 }],
        ['o15', '第三次也写了，为什么又不对？', { gap: 0.8 }],
        ['o16', '要弄清这两件事，得先看它是怎么一块一块往下写的', { gap: 0.6 }],
        ['oT', null, { pause: 2.7 }],
      ],
    },
    {
      id: 'pass', chap: ['01', '一块字的工夫'], lead: 3.2, tail: 0.6,
      cues: [
        ['a1', '模型写字，一次写一小块，一小块叫一个 *token*', { gap: 0.5 }],
        ['a2', '开头那个错答案，它只写了四块', { gap: 0.7 }],
        ['a3', '模型里面，是一层叠一层的计算', { gap: 0.4 }],
        ['a4', '写第一块之前，它把题目读进来，从最底下一层往上算', { gap: 0.3 }],
        ['a5', '一层接一层，算到最顶上，才定下这一块写 239', { tts: '一层接一层，算到最顶上，才定下这一块写二三九。', gap: 0.5 }],
        ['a6', '这样从底到顶算一遍，我们叫它一趟', { gap: 0.6 }],
        ['a7', '层数在模型造好的时候就定了，比如 GPT-3，是 96 层', { gap: 0.5 }],
        ['a8', '下一块不管是一个逗号，还是乘积中间那两位，都只有这一趟的工夫', { gap: 0.9 }],
        ['a9', '一趟里，算出来的东西只往上走', { gap: 0.3 }],
        ['a10', '顶上得出的结果，想让下一趟从底下接着用，只有一个办法：先把它写成字', { gap: 0.9 }],
        ['a11', '只许报答案，能这样接力的，就只有写这四块的那几趟', { gap: 0.8 }],
        ['a12', '写乘积是从左往右写，进位却是从右往左来的', { gap: 0.4 }],
        ['a13', '中间那几位，要等右边的进位一位一位传过来', { gap: 0.5 }],
        ['a14', '理论上，题目越长，这种一步等一步的计算，迟早会超出这几趟能走的步数', { gap: 0.6 }],
        ['a15', '它错的，也在中间', { gap: 1.0 }],
      ],
    },
    {
      id: 'draft', chap: ['02', '草稿'], lead: 3.2, tail: 0.6,
      cues: [
        ['b1', '人算这道题，会拿一张纸', { gap: 0.3 }],
        ['b2', '算出一步，写下来，下一步就从纸上这个数接着算', { gap: 0.6 }],
        ['b3', '模型没有别的纸，要打草稿，只能写进回答里', { gap: 0.6 }],
        ['b4', '第二次它就是这样，答案之前，先写了三百多块', { gap: 0.4 }],
        ['b5', '把 92138 拆成 92000 加 138，两边分别乘，再加起来', { tts: '把九万两千一百三十八，拆成九万两千，加一百三十八，两边分别乘，再加起来', gap: 0.4 }],
        ['b6', '每算出一个中间结果，就写成字', { gap: 0.3 }],
        ['b7', '下一趟从底下读到这个字，接着往上算', { gap: 0.5 }],
        ['b8', '一趟算不完的，就这样分给很多趟，一段一段接起来', { gap: 3.6 }],
        ['b9', '那多写点别的，行不行？谷歌那篇论文试过，让模型先输出一串点，和算式一样长', { gap: 0.4 }],
        ['b10', '结果和直接回答差不多', { gap: 0.5 }],
        ['b11', '点写得再多，每一块都是同一个点，什么也没接下去', { gap: 1.0 }],
        ['b12', '我们自己出了一百道乘法，从三位数到七位数', { gap: 0.4 }],
        ['b13', '只报答案，对了三十九道；先写过程，对了九十九道', { gap: 1.0 }],
      ],
    },
    {
      id: 'order', chap: ['03', '先后'], lead: 3.2, tail: 0.6,
      cues: [
        ['s1', '回到第三次。它第一行就写下了答案', { gap: 0.4 }],
        ['s2', '写它的时候，前面只有题目，能接力的还是那几趟', { gap: 0.5 }],
        ['s3', '那一整段过程，都在答案之后', { gap: 0.5 }],
        ['s4', '后面的字读得到前面，反过来不行', { gap: 0.4 }],
        ['s5', '答案一旦写下，就擦不掉了', { gap: 0.7 }],
        ['s6', '过程一路读着那个数往下写，最后加回了它', { gap: 0.8 }],
        ['s7', '一百道里，先写答案对了三十六道，和只报答案的三十九道差不多', { gap: 0.5 }],
        ['s8', '先写答案、又答错的题里，将近六成，过程最后都落回了开头那个错数', { gap: 1.2 }],
      ],
    },
    {
      id: 'learn', chap: ['04', '越写越长'], lead: 3.2, tail: 0.6,
      cues: [
        ['r1', '谷歌那篇论文出来几个月后，又有人发现，只要在答案前面加一句「我们一步一步来想」', { gap: 0.3 }],
        ['r2', '一套数学应用题，正确率就从一成左右涨到了四成', { gap: 0.6 }],
        ['r3', '那时，这还只是人写进提问里的一句话', { gap: 0.3 }],
        ['r4', '后来，这个做法被直接练进了模型', { gap: 0.5 }],
        ['r5', '2024 年，OpenAI 发布 o1，回答之前先写一大段思考', { gap: 0.5 }],
        ['r6', '2025 年 1 月，DeepSeek 公开了 R1 的训练方法', { gap: 0.3 }],
        ['r7', '其中一个版本，训练时不给它看人写的解题过程，答对了就给奖励', { gap: 0.4 }],
        ['r8', '没人要求它想得更长，它的思考却越写越长', { gap: 1.0 }],
        ['r9', '我们把开头那道题，交给 DeepSeek 的思考模式', { gap: 0.3 }],
        ['r10', '它算对以后，又换了一种拆法，再算了一遍', { gap: 0.6 }],
        ['r11', '那一百道里，每种位数各取五道，二十五道全对', { gap: 0.4 }],
        ['r12', '三位数的题，思考平均写九十来块；七位数，五百五十块', { gap: 0.5 }],
        ['r13', '它多写的每一块，都是多走的一趟', { gap: 1.2 }],
      ],
    },
    {
      id: 'end', chap: null, lead: 1.0, tail: 0.4,
      cues: [
        ['e1', '人算不过来的时候，会拿一张纸', { gap: 0.5 }],
        ['e2', '模型没有别的纸，只有它自己写下的字', { gap: 0.6 }],
        ['e3', '它能想多远，就看答案之前，它一步一步写下了多少', { gap: 1.2 }],
        ['e4', '我们常让它先给结论，再讲理由', { gap: 0.4 }],
        ['e5', '这样讲出来的理由，没有参与得出那个结论', { gap: 1.2 }],
        ['eT', null, { pause: 3.6 }],
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

  // 实测时长是否还对得上这句的读法（词边界拼回去与读法相同）；文字改过的句子不用旧的实测，配音之后换成新的实测
  const bare = (x) => x.replace(/[，。？！、；：,.!?\s]/g, '');
  const sameText = (m, txt) => !!m && (!m.words || bare(m.words.map((w) => w[2]).join('')) === bare(txt));

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
        const meas = o.pause == null && sameText(DUR[id], ttsText(c)) ? DUR[id] : null;
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
