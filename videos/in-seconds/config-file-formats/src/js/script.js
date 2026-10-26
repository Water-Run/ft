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
// 来稿：Gemini 4 Argon，策划者于 2026-10-26 转交。保留全部原句号与原文；五幕各 30 秒，目标全长 150 秒。
// 逐句画面与构成主义海报规范见 src/design/README.md，创作署名见 project.json。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);            // 画面里的文字：tr('中文', 'English')

  const TOTAL = 150;
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
            "zh": "改掉软件的一个参数，不需要重新编译代码"
          },
          {}
        ],
        [
          "o2",
          {
            "zh": "只需打开外面的一个纯文本，改掉里面的数字"
          },
          {}
        ],
        [
          "o3",
          {
            "zh": "这种专门存参数的外部文本，叫配置文件"
          },
          {}
        ],
        [
          "a1",
          {
            "zh": "1980 年代普及的 .ini，是最早的常见格式"
          },
          {}
        ],
        [
          "a2",
          {
            "zh": "它只靠两样东西排版：方括号分出章节，等号写出键值"
          },
          {}
        ],
        [
          "a3",
          {
            "zh": "简单直接，谁都能看懂"
          },
          {}
        ],
        [
          "a4",
          {
            "zh": "但它只有平铺的一层，遇到一层套一层的复杂数据，就装不下了"
          },
          {}
        ]
      ]
    },
    {
      "id": "xml",
      "at": 30,
      "chap": null,
      "lead": 0,
      "tail": 0,
      "cues": [
        [
          "b1",
          {
            "zh": "1998 年成为标准的 .xml，改用成对的尖括号标签来表达层级"
          },
          {}
        ],
        [
          "b2",
          {
            "zh": "一头一尾两个标签，把数据夹在中间"
          },
          {}
        ],
        [
          "b3",
          {
            "zh": "大标签里再套小标签，就能搭出任意深度的树状结构"
          },
          {}
        ],
        [
          "b4",
          {
            "zh": "标签内还能附加属性，并严格校验每一项的格式"
          },
          {}
        ],
        [
          "b5",
          {
            "zh": "但代价是每个数据都得有头有尾"
          },
          {}
        ],
        [
          "b6",
          {
            "zh": "层级一深，外面的标签，比里面的数据本身还要长出一大截"
          },
          {}
        ]
      ]
    },
    {
      "id": "json",
      "at": 60,
      "chap": null,
      "lead": 0,
      "tail": 0,
      "cues": [
        [
          "c1",
          {
            "zh": "2001 年提出的 .json，砍掉了繁琐的闭合标签"
          },
          {}
        ],
        [
          "c2",
          {
            "zh": "它改用大括号层层包裹，体积立刻小了一半"
          },
          {}
        ],
        [
          "c3",
          {
            "zh": "同时直接区分数字、文本、数组与布尔值，机器读写极快"
          },
          {}
        ],
        [
          "c4",
          {
            "zh": "把每个大括号压成独立的一行，就是 .jsonl，适合日志与 AI 数据逐行追加"
          },
          {}
        ],
        [
          "c5",
          {
            "zh": "但 JSON 更迁就机器：满屏引号与括号，而且不允许写注释"
          },
          {}
        ]
      ]
    },
    {
      "id": "yaml",
      "at": 90,
      "chap": null,
      "lead": 0,
      "tail": 0,
      "cues": [
        [
          "d1",
          {
            "zh": "同在 2001 年诞生的 .yaml，把重心转向人类的阅读体验"
          },
          {}
        ],
        [
          "d2",
          {
            "zh": "它去掉了所有括号和引号，只靠左边的空格缩进来区分层级"
          },
          {}
        ],
        [
          "d3",
          {
            "zh": "还能用井号随时添加注释，常用于编写复杂的部署清单"
          },
          {}
        ],
        [
          "d4",
          {
            "zh": "但省掉括号，也带来了隐患"
          },
          {}
        ],
        [
          "d5",
          {
            "zh": "几十行往下，只要少敲一个空格，整个文件就会解析失败"
          },
          {}
        ],
        [
          "d6",
          {
            "zh": "不加引号的简写，比如代表挪威的 NO，还会被自动当成布尔值的“否”"
          },
          {}
        ]
      ]
    },
    {
      "id": "toml",
      "at": 120,
      "chap": null,
      "lead": 0,
      "tail": 0,
      "cues": [
        [
          "e1",
          {
            "zh": "2013 年发布的 .toml，把直观与严谨合二为一"
          },
          {}
        ],
        [
          "e2",
          {
            "zh": "它请回了 .ini 的方括号，在里面加颗圆点，就解决了多层嵌套"
          },
          {}
        ],
        [
          "e3",
          {
            "zh": "不用数空格，既能写注释，又有严格的数据类型"
          },
          {}
        ],
        [
          "e4",
          {
            "zh": "这五种格式的演进，其实一直在两端寻找平衡"
          },
          {}
        ],
        [
          "e5",
          {
            "zh": "一端是机器好解析，一端是人类好读写"
          },
          {}
        ],
        [
          "e6",
          {
            "zh": "无论选哪一种，作用都一样：不必重改代码，只需改动配置"
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
