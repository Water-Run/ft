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
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);            // 画面里的文字：tr('中文', 'English')

  const TOTAL = 150;
  const RAW = [
    {
      id: 'open', at: 0, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['o1', '你对 AI 说：测试没通过，帮我修好', { gap: 0.4 }],
        ['o2', '它读代码、跑测试、改掉一行，测试通过了', { gap: 0.7 }],
        ['o3', '可模型本身不会动手，它只会输出文字', { gap: 0.4 }],
        ['o4', '那读文件、跑测试的，是谁的手？', { gap: 0.4 }],
        ['oT', null, { pause: 2.5 }],
        ['o5', '是包在模型外面的一层程序：*Harness*', { gap: 0.8 }],
        ['o6', 'Model + Harness，就是 *Agent*', { gap: 0.3 }],
      ],
    },
    {
      id: 'ask', at: 28.5, chap: null, lead: 0.8, tail: 0.3,
      cues: [
        ['a1', 'Harness 第一次去问模型，带上了三样东西', { gap: 0.5 }],
        ['a2', '一段说明：项目里有哪些文件', { gap: 0.3 }],
        ['a3', '一份工具清单：读文件、改文件、跑测试', { gap: 0.3 }],
        ['a4', '还有你的那句话', { gap: 0.8 }],
        ['a5', '模型回的还是文字，格式特殊，叫*工具调用*', { gap: 0.6 }],
        ['a6', '它要读两个文件，可它自己打不开', { gap: 0.4 }],
        ['a7', 'Harness 照着去读，把内容放回对话', { gap: 0.3 }],
      ],
    },
    {
      id: 'loop', at: 56, chap: null, lead: 0.8, tail: 0.3,
      cues: [
        ['l1', 'Harness 带上整段对话，再问一次模型', { gap: 0.6 }],
        ['l2', '第二次，模型要跑测试', { gap: 0.4 }],
        ['l3', 'Harness 跑完：3 加 5 加 2 应为 10，实际是 7', { gap: 0.7 }],
        ['l4', '第三次，模型找到原因：这一行漏算了第一件', { gap: 0.4 }],
        ['l5', '它要求改掉这一行，Harness 照办', { gap: 0.6 }],
        ['l6', '第四次，再跑测试：通过', { gap: 0.7 }],
        ['l7', '第五次，回复里没有工具调用，循环停下', { gap: 0.8 }],
        ['l8', '模型说要做什么，Harness 去做，再把结果交回去', { gap: 0.4 }],
        ['l9', '这个来回的*循环*，就是 Harness 的核心', { gap: 0.3 }],
      ],
    },
    {
      id: 'more', at: 95, chap: null, lead: 0.8, tail: 0.3,
      cues: [
        ['m1', '模型自己不记事，每问一次，整段对话都要重发', { gap: 0.3 }],
        ['m2', '问了五次，发出的对话从 2 条涨到了 11 条', { gap: 0.6 }],
        ['m3', '对话太长时，Harness 还要把旧的部分压成摘要', { gap: 0.7 }],
        ['m4', '它也管着边界，比如只许碰项目里的文件', { gap: 0.7 }],
        ['m5', '所以同一个模型，换一套 Harness，本事就不一样', { gap: 0.4 }],
        ['m6', 'LangChain 报告：只改 Harness、不换模型', { gap: 0.3 }],
        ['m7', '一项评测的分数，从 52.8 升到了 66.5', { gap: 0.6 }],
      ],
    },
    {
      id: 'end', at: 131.5, chap: null, lead: 0.6, tail: 0.3,
      cues: [
        ['e1', '模型负责想，Harness 负责做', { gap: 0.4 }],
        ['e2', '替模型动手、再把结果交回去的，就是 Agent 的手', { gap: 0.3 }],
      ],
    },
    {
      // 片尾名单：策划、参与模型与分工、开源视频的仓库地址。约 7.5 秒，不配旁白
      id: 'outro', at: 142.5, chap: null, lead: 0.5, tail: 0,
      cues: [
        ['z1', null, { pause: 6.5, credits: true }],   // 名单取自 project.json 的 credits
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。先用 kit/tools/tts_probe.js 试，再用 asr.js 回听。
  const SAY = {
    zh: [
      [/52\.8/g, '五十二点八'], [/66\.5/g, '六十六点五'],
      [/一行/g, '一航'], [/LangChain/g, 'Lang Chain'], [/\bAI\b/g, 'A I'], [/ \+ /g, ' 加 '],
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
