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
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);            // 画面里的文字：tr('中文', 'English')

  const TOTAL = 150;
  // 四个正片场景：引入 24 秒、两种架构与路由 37 秒、先后关系与今天的格局 41.5 秒、各自的长处 39.5 秒，片尾名单 8 秒。配乐的小节从每个场景的起点重新排
  const RAW = [
    {
      // 引入：token → 参数 → 每个 token 都要和参数相乘 → 参数越多越强也越费 → 问题 → 片名。这一部分不点任何模型的名字
      id: 'open', at: 0, chap: null, lead: 0.5, tail: 0.2,
      cues: [
        ['o1', { zh: '大模型先把文字切成一个个 *token*', en: 'Large models first cut text into *tokens*.' }, { gap: { zh: 0.4, en: 0.5 } }],
        ['o2', { zh: '模型里存着数以亿计的数字，叫作*参数*', en: 'Inside sit billions of numbers: the *parameters*.' }, { gap: { zh: 0.4, en: 0.45 } }],
        ['o3', { zh: '每个 token 都要和这些参数逐一相乘', en: 'Every token is multiplied through them.' }, { gap: { zh: 0.4, en: 0.5 } }],
        ['o4', { zh: '参数越多，模型通常越强，要算的也越多', en: 'More parameters usually mean a stronger model, and more work.' }, { gap: { zh: 0.5, en: 0.5 } }],
        ['o5', { zh: '能不能参数很多，每个 token 却只算*一小部分*？', en: 'Could a model hold many parameters, yet use only *a few* per token?' }, { gap: { zh: 0.5, en: 0.5 }, tts: { zh: '能不能参数很多，每个 token 却只算一小部分？' } }],
        ['oT', null, { pause: 2.4 }],
      ],
    },
    {
      // 两种架构：稠密 → 前馈网络 → MoE → 路由器怎样挑专家（打分、取前几名、加权相加、随 token 而变、训练与均衡）
      id: 'two', at: 24, chap: null, lead: 0.5, tail: 0.2,
      cues: [
        ['d1', { zh: '*稠密模型*，Dense：每个 token，全部参数都算', en: 'A *dense* model: every token uses every parameter.' }, { gap: 0.4 }],
        ['d2', { zh: '每一层里，参数最多的一块是*前馈网络*', en: 'In each layer, the largest block is the *feed-forward network*.' }, { gap: 0.4 }],
        ['d3', { zh: '*混合专家模型*，MoE，把这一块换成许多个专家', en: 'A *mixture-of-experts* model, MoE, replaces that block with many experts.' }, { gap: { zh: 0.8, en: 0.9 } }],
        ['d4', { zh: '每来一个 token，*路由器*先给所有专家打分', en: 'For each token, the *router* first scores every expert.' }, { gap: 0.4 }],
        ['d5', { zh: '只有得分最高的几个参与计算，这里是 64 选 8', en: 'Only the top scorers compute: here, 8 of 64.' }, { gap: { zh: 0.4, en: 0.5 } }],
        ['d6', { zh: '它们的输出各乘以得分，再*相加*；其余专家不动', en: 'Their outputs are scaled by score and *summed*; the rest stay idle.' }, { gap: { zh: 0.9, en: 0.9 } }],
        ['d7', { zh: '换一个 token，选中的专家往往就不同', en: 'A different token usually picks a different set.' }, { gap: { zh: 0.5, en: 0.6 } }],
        ['d8', { zh: '路由器和专家一起训练；训练时还要防止它总挑同几个', en: 'The router trains with the experts, and is kept from always picking the same few.' }, { gap: 0.3 }],
      ],
    },
    {
      // 先后关系与今天的格局：想法更早 → 大模型起初多是稠密 → 后来陆续用上 MoE → 如今最大的开源模型大多是 MoE → Qwen3.8（全片只在这里点名一次）→ Flash 的数字 → 共享专家
      id: 'qwen', at: 61, chap: null, lead: 0.5, tail: 0.2,
      cues: [
        ['h1', { zh: 'MoE 的想法更早，*1991 年*就有论文', en: 'The idea of MoE is older: a paper on it came out in *1991*.' }, { gap: { zh: 0.9, en: 0.4 } }],
        ['h2', { zh: '可大模型起初多是*稠密*的，比如 2020 年的 GPT-3', en: 'Yet large models were mostly *dense* at first, like GPT-3 in 2020.' }, { gap: { zh: 0.9, en: 0.4 } }],
        ['h3', { zh: '后来 GLaM、DeepSeek-V3、Llama 4 等陆续用上了 MoE', en: 'Later, large models such as GLaM, DeepSeek-V3 and Llama 4 adopted MoE.' }, { gap: { zh: 1.0, en: 0.5 } }],
        ['m1', { zh: '如今最大的开源模型大多是 *MoE*，稠密多见于较小的型号', en: 'Today the largest open models are mostly *MoE*; dense ones are mostly smaller.' }, { gap: { zh: 1.0, en: 0.5 } }],
        // m2 与 m3 是一句话，分成两条字幕（单条不超过 6 秒）
        ['m2', { zh: 'Qwen3.8 就是这样：Flash 和 2.4T 用 MoE', en: 'Qwen3.8 is a case in point: Flash and 2.4T are MoE,' }, { gap: 0.2, tts: { zh: '千问三点八就是这样：Flash 和二点四 T 用 M O E，' } }],
        ['m3', { zh: '27B 是*稠密*的', en: '27B is *dense*.' }, { gap: { zh: 0.9, en: 0.5 } }],
        ['q3', { zh: 'Flash 有 1250 亿参数，每个 token 只*激活 60 亿*', en: 'Flash holds 125 billion parameters, but *activates only 6 billion* per token.' }, { gap: { zh: 0.9, en: 0.5 } }],
        ['q6', { zh: '每层选 10 个专家，外加 1 个每个 token 都用的*共享专家*', en: 'Each layer picks 10 experts, plus 1 *shared expert* every token uses.' }, { gap: 0.3 }],
      ],
    },
    {
      // 各自的长处：MoE 的性能（成绩、推理快且省）与代价（内存）→ 稠密的长处（同样参数更强）→ 为什么大模型大多用 MoE、要塞进一张显卡时稠密更合适 → 结论
      id: 'tradeoff', at: 102.5, chap: null, lead: 0.5, tail: 0.2,
      cues: [
        ['r1', { zh: 'Flash 每个 token 只算 60 亿，*成绩*却高过 27B', en: 'Flash computes only 6 billion per token, yet *scores* above 27B.' }, { gap: { zh: 0.9, en: 0.5 } }],
        ['r2', { zh: '每个 token 算得少，推理就*快*，也更省钱', en: 'Less compute per token means *faster*, cheaper inference.' }, { gap: { zh: 1.0, en: 0.6 } }],
        ['r3', { zh: '代价是*内存*：它的参数是 27B 的四倍多，全都得装进去', en: 'The cost is *memory*: over four times 27B\'s parameters, all of them loaded.' }, { gap: { zh: 1.2, en: 0.8 } }],
        ['r4', { zh: '反过来，参数一样多时，*稠密更强*：每个参数都派上用场', en: 'But with equal parameters, *dense is stronger*: every parameter does work.' }, { gap: { zh: 1.2, en: 0.8 } }],
        ['r5', { zh: '大模型跑在许多张显卡上，缺的是*算力*，所以大多用 MoE', en: 'Large models run across many GPUs, where *compute* is scarce: hence MoE.' }, { gap: { zh: 0.9, en: 0.5 } }],
        ['r6', { zh: '要塞进一张显卡时，缺的是*内存*，稠密往往更合适', en: 'When a model must fit on one GPU, *memory* is scarce, and dense often fits better.' }, { gap: { zh: 1.2, en: 0.8 } }],
        ['r7', { zh: '*稠密省内存*，*MoE 省计算*：看缺的是哪一样', en: '*Dense saves memory*, *MoE saves compute*: the choice depends on which is scarce.' }, { gap: 0.3 }],
      ],
    },
    {
      // 片尾名单：策划、参与模型与分工、开源视频的仓库地址。8 秒，不配旁白
      id: 'outro', at: 142, chap: null, lead: 0.5, tail: 0,
      cues: [
        ['z1', null, { pause: 7.2 }],
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。先用 kit/tools/tts_probe.js 试，再用 asr.js 回听。
  const SAY = {
    zh: [
      // 「Qwen」按中文名读作「千问」（直读会被读成 Quinn）；型号里的连字符不读
      [/Qwen3\.8-27B/g, '千问三点八 二十七 B'], [/Qwen3\.8-Max/g, '千问三点八 Max'], [/Qwen3\.8/g, '千问三点八'],
      [/2\.4T-A95B/g, '二点四 T A 九十五 B'], [/27B/g, '二十七 B'],
      // 缩写逐字母读：MoE 连写时整个被吞掉
      [/DeepSeek-V3/g, 'DeepSeek V 三'], [/\b2\.4T\b/g, '二点四 T'],
      [/OLMoE/g, 'O L M O E'], [/MoE/g, 'M O E'], [/FFN/g, 'F F N'],
    ],
    en: [
      [/Qwen3\.8-27B/g, 'Qwen three point eight, twenty-seven B,'], [/Qwen3\.8-Max/g, 'Qwen three point eight Max'], [/Qwen3\.8/g, 'Qwen three point eight'],
      [/2\.4T-A95B/g, 'two point four T, A ninety-five B'], [/\b27B\b/g, 'twenty-seven B'],
      [/\b2\.4T\b/g, 'two point four T'],
      [/\bMoE\b/g, 'M O E'], [/\bFFN\b/g, 'F F N'],
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
