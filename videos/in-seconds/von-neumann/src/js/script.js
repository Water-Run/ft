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
// 第 3 稿（2026-10-31）：按 WaterRun 对预览 r01 的意见重写（开头提问、去掉输入输出、步骤名后停顿、例子用具体数字），
// 事实见 research/FACTS.md，改动见 review/NOTES.md。各场定点按实测配音排布，片尾名单 5 秒。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);            // 画面里的文字：tr('中文', 'English')

  const TOTAL = 128;
  const RAW = [
    {
      id: 'open', at: 0, chap: null, lead: 0.3, tail: 0.3,
      cues: [
        ['o1', { zh: "同一块芯片，上一秒算账，下一秒就能打游戏" }, { gap: 0.3 }],
        ['o2', { zh: "芯片里一根电线都没改，它是怎么做到的？" }, { gap: 0.6 }],
        ['o3', { zh: "靠的是一张蓝图" }, { gap: 0.7 }],
        ['o4', { zh: "冯·诺伊曼架构" }, { gap: 1.1 }],
        ['p1', { zh: "在它之前，计算机算一道题，步骤要靠电线连出来" }, { gap: 0.4 }],
        ['p2', { zh: "换一道题，就得拔掉重插，一忙就是好几天" }, { gap: 1.4 }],
        ['a1', { zh: "1945 年，冯·诺伊曼在报告里写下一个新办法" }, { gap: 0.6 }],
        ['a2', { zh: "核心是三样：" }, { gap: 0.8 }],
        ['a2b', { zh: "控制器指挥，运算器算数，存储器记东西" }, { gap: 0.6 }],
        ['a3', { zh: "关键一步：算题的步骤不再靠接线，而是存进存储器" }, { gap: 0.8 }],
      ],
    },
    {
      id: 'program', at: 39.3, chap: null, lead: 0.2, tail: 0.3,
      cues: [
        ['b1', { zh: "这就叫“存储程序”" }, { gap: 0.6 }],
        ['b2', { zh: "存储器像一排编了号的格子" }, { gap: 0.4 }],
        ['b3', { zh: "前几格放步骤，叫指令" }, { gap: 0.3 }],
        ['b4', { zh: "后几格放要算的数，叫数据" }, { gap: 0.5 }],
        ['b5', { zh: "指令也和数据一样，写成 0 和 1" }, { gap: 1.3 }],
      ],
    },
    {
      id: 'cycle', at: 55.4, chap: null, lead: 0.2, tail: 0.3,
      cues: [
        ['c1', { zh: "控制器只靠三个动作，反复循环" }, { gap: 0.5 }],
        ['c2', { zh: "第一步：取" }, { gap: 0.9 }],
        ['c3', { zh: "从第 1 格取出一条指令" }, { gap: 0.7 }],
        ['c4', { zh: "第二步：拆" }, { gap: 0.9 }],
        ['c5', { zh: "前半截是做什么：加；后半截是去哪拿数：第 8 格" }, { gap: 0.9 }],
        ['c6', { zh: "第三步：做" }, { gap: 0.9 }],
        ['c7', { zh: "去第 8 格拿到 5，加进运算器" }, { gap: 1.0 }],
        ['c8', { zh: "然后，轮到第 2 格" }, { gap: 1.0 }],
        ['c9', { zh: "如今的芯片，一秒能转几十亿圈" }, { gap: 1.4 }],
        ['c10', { zh: "想算账，就装算账的指令；想打游戏，就换游戏的指令" }, { gap: 0.6 }],
        ['c11', { zh: "电线一根不动，变的只是格子里的内容" }, { gap: 1.0 }],
      ],
    },
    {
      id: 'bottleneck', at: 95.3, chap: null, lead: 0.2, tail: 0.1,
      cues: [
        ['d1', { zh: "代价是：指令和数据都挤这一条通道，一次只能过一个" }, { gap: 0.4 }],
        ['d2', { zh: "运算器再快，也得排队等" }, { gap: 0.7 }],
        ['d3', { zh: "1977 年，这条通道有了名字" }, { gap: 0.8 }],
        ['d4', { zh: "冯·诺伊曼瓶颈" }, { gap: 1.1 }],
        ['d5', { zh: "今天的芯片在旁边加两块小缓存：一块放指令，一块放数据" }, { gap: 0.4 }],
        ['d6', { zh: "常用的就近拿，不用每次挤通道" }, { gap: 0.7 }],
        ['d7', { zh: "但根基没变：换用途，不改电线，只换格子里的指令" }, { gap: 0.35 }],
      ],
    },
    {
      id: 'credits', at: 123.0, chap: null, lead: 0, tail: 0,
      cues: [
        ['z1', null, { pause: 5, gap: 0, credits: true }],   // 名单取自 project.json 的 credits
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。先用 kit/tools/tts_probe.js 试，再用 asr.js 回听。
  const SAY = {
    zh: [
      // 例：[/2FA/g, 'two F A']
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
