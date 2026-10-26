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
// 来稿：Gemini 4 Argon，策划者于 2026-10-26 转交。保留原句号与原文；四幕定点为 0、32、64、96 秒，目标全长 128 秒。
// 当前为待核、待校对稿；逐句画面见 src/design/README.md，创作署名见 project.json。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);            // 画面里的文字：tr('中文', 'English')

  const TOTAL = 128;
  const RAW = [
    {
      "id": "open",
      "at": 0,
      "chap": null,
      "lead": 0,
      "tail": 0,
      "cues": [
        [
          "o1",
          {
            "zh": "同一块芯片，上一秒算账，下一秒就能打游戏"
          },
          {}
        ],
        [
          "o2",
          {
            "zh": "里面不改一根电线，却随时能变成另一台机器"
          },
          {}
        ],
        [
          "o3",
          {
            "zh": "这套沿用至今的蓝图，叫冯·诺伊曼架构"
          },
          {}
        ],
        [
          "p1",
          {
            "zh": "而在早期，算题的步骤全靠电线连死；换一道题，就得重连几千根线"
          },
          {}
        ],
        [
          "a1",
          {
            "zh": "1945 年的新架构，把计算机收拢为五部分"
          },
          {}
        ],
        [
          "a2",
          {
            "zh": "两侧是连接外部的输入和输出"
          },
          {}
        ],
        [
          "a3",
          {
            "zh": "左边是负责指挥的控制器，和负责算数的运算器"
          },
          {}
        ],
        [
          "a4",
          {
            "zh": "右边是负责记忆的存储器"
          },
          {}
        ],
        [
          "a5",
          {
            "zh": "最关键的破局，是把算题的步骤和要算的数，放进同一个存储器"
          },
          {}
        ]
      ]
    },
    {
      "id": "program",
      "at": 32,
      "chap": null,
      "lead": 0,
      "tail": 0,
      "cues": [
        [
          "b1",
          {
            "zh": "这个设计叫存储程序"
          },
          {}
        ],
        [
          "b2",
          {
            "zh": "要算的数叫数据，怎么算的步骤叫指令"
          },
          {}
        ],
        [
          "b3",
          {
            "zh": "哪怕是“做加法”这样的指令，也会编成 0 和 1，和数据存在一起"
          },
          {}
        ],
        [
          "h1",
          {
            "zh": "1936 年，图灵曾构想过这种能把指令当数据读的机器"
          },
          {}
        ],
        [
          "h2",
          {
            "zh": "1945 年，冯·诺伊曼执笔 EDVAC 报告，将它变成工程蓝图"
          },
          {}
        ],
        [
          "b4",
          {
            "zh": "在这套蓝图里，内存就像一排编好号的格子"
          },
          {}
        ],
        [
          "b5",
          {
            "zh": "前几格放着指令，后几格放着数据"
          },
          {}
        ],
        [
          "b6",
          {
            "zh": "控制器只需顺着格子编号，一行一行往下读"
          },
          {}
        ]
      ]
    },
    {
      "id": "cycle",
      "at": 64,
      "chap": null,
      "lead": 0,
      "tail": 0,
      "cues": [
        [
          "c1",
          {
            "zh": "机器运转，只靠三个动作不断循环"
          },
          {}
        ],
        [
          "c2",
          {
            "zh": "第一步取指：控制器按顺序，从第 1 格读出一条指令"
          },
          {}
        ],
        [
          "c3",
          {
            "zh": "第二步译码：将这串数字拆开——前半截代表动作“加”，后半截写着“去第 8 格拿数”"
          },
          {}
        ],
        [
          "c4",
          {
            "zh": "第三步执行：从第 8 格取出数据，送进运算器算出结果"
          },
          {}
        ],
        [
          "c5",
          {
            "zh": "接着箭头移向第 2 格，每秒重复数十亿次"
          },
          {}
        ],
        [
          "c6",
          {
            "zh": "想算账，就往格子里装入算账的指令；想打游戏，就换上游戏的指令"
          },
          {}
        ],
        [
          "c7",
          {
            "zh": "硬件从此固定下来：只靠同一块内存、同一套循环"
          },
          {}
        ]
      ]
    },
    {
      "id": "bottleneck",
      "at": 96,
      "chap": null,
      "lead": 0,
      "tail": 0,
      "cues": [
        [
          "d1",
          {
            "zh": "但指令和数据共用中间这一条通道，也埋下了代价"
          },
          {}
        ],
        [
          "d2",
          {
            "zh": "运算器越算越快，指令和数据却在通道口排起长队"
          },
          {}
        ],
        [
          "d3",
          {
            "zh": "1977 年，这种拥堵被命名为冯·诺伊曼瓶颈"
          },
          {}
        ],
        [
          "d4",
          {
            "zh": "现代芯片在贴近核心的地方加设缓存，把指令和数据分成两条道"
          },
          {}
        ],
        [
          "d5",
          {
            "zh": "如今的 AI 芯片，更尝试在内存格里直接计算，减少搬运"
          },
          {}
        ],
        [
          "d6",
          {
            "zh": "但无论怎么演进，那条根基从未改变：不必重连电线，只需改写代码"
          },
          {}
        ]
      ]
    }
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
