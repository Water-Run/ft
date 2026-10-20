// 旁白脚本：每个 cue = [句号, 字幕, {tts, gap, pause}]
// - 多语言时字幕写成 { zh: '…', en: '…' }；tts、gap、pause 同理
// - 字幕里 *词* 表示强调；tts 缺省时由字幕按 SAY 表换成读法（字幕写正式拼写，读法只放在 SAY 表或 tts 字段）
// - gap：该句结束到下一句开始的停顿（秒，缺省 0.3）；pause：无旁白的纯画面停顿
// 语言：浏览器取 ?lang=，Node 取环境变量 VLANG；缺省为 zh。浏览器与 Node 共用本文件（工具读它排时间线）。
// 翻译以中文为底本。本轮只交审中文。英文字幕是对照草稿，中文确认后再修订并单独导出。
//
// 本集时长 192 秒，与标题相同。场景 at 是开始时刻；说不完记入 L.problems。
// 没有章节卡。片名落在 o3。循环一段是文档步骤的示意，不是运行记录。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);

  const TOTAL = 192;
  const RAW = [
    {
      id: 'open', at: 0, chap: null, lead: 0.4, tail: 0.25,
      cues: [
        ['o1', { zh: '没有外面的程序，模型只能把话说完', en: 'A model alone only finishes the sentence.' }, { gap: 0.45 }],
        ['o2', { zh: '文件、命令和网页都不在这句话里', en: 'Files and commands stay outside that sentence.' }, { gap: 0.5 }],
        ['o3', { zh: '负责执行的程序叫做 harness', en: 'The program that does the work is a harness.' }, { gap: 0.7 }],
        ['o4', { zh: '它指这一层，不是某一家产品的专名', en: 'The name is that layer, not one product.' }, { gap: 0.45 }],
        ['o5', { zh: '模型提出请求，程序执行，再把结果送回', en: 'The model asks. The program returns the result.' }, { gap: 0.4 }],
      ],
    },
    {
      id: 'loop', at: 20, chap: null, lead: 0.5, tail: 0.25,
      cues: [
        ['a1', { zh: '文档里的做法，是同一个循环', en: 'The documents describe the same loop.' }, { gap: 0.4 }],
        ['a2', { zh: '下面按文档走，不是一次实测', en: 'This follows the documents, not a measured run.' }, { gap: 0.6 }],
        ['a3', { zh: '程序先送出对话、工具清单和已有记录', en: 'The program sends the dialogue, tools, and record.' }, { gap: 0.45 }],
        ['a4', { zh: '模型返回文字、工具请求，或两者都有', en: 'The model returns text, a tool request, or both.' }, { gap: 0.45 }],
        ['a5', { zh: '工具请求要符合事先写好的参数', en: 'A tool request must match the given parameters.' }, { gap: 0.45 }],
        ['a6', { zh: '程序执行请求，把输出送回下一次', en: 'The program runs it and sends the output onward.' }, { gap: 0.45 }],
        ['a7', { zh: '如此重复，直到回答不再要工具', en: 'This repeats until a reply asks for no tool.' }, { gap: 0.5 }],
        ['a8', { zh: '这时，文件修改可以已经留在磁盘上', en: 'A file change may already be on disk.' }, { gap: 0.45 }],
        ['a9', { zh: '交还出去的结束，仍是一条文字', en: 'Stopping is still one line of text.' }, { gap: 0.55 }],
        ['a10', { zh: '做之前问不问，是外面的规则', en: 'Asking first is a rule outside the loop.' }, { gap: 0.35 }],
      ],
    },
    {
      id: 'past', at: 58.5, chap: null, lead: 0.5, tail: 0.25,
      cues: [
        ['h1', { zh: '这个循环比 harness 的叫法更早', en: 'The loop is older than the name.' }, { gap: 0.4 }],
        ['h2', { zh: '谁最先用这个词，材料不够，不讲', en: 'These sources do not show who used the word first.' }, { gap: 0.55 }],
        ['h3', { zh: '2022 年的 ReAct 把过程写成想、做、观察', en: 'In 2022, ReAct wrote thought, action, observation.' }, { gap: 0.45 }],
        ['h4', { zh: '想只写回上下文，并不改变外界', en: 'A thought only returns to the context.' }, { gap: 0.45 }],
        ['h5', { zh: '做，才会从外界得到新的观察', en: 'An action brings the next observation.' }, { gap: 0.55 }],
        ['h6', { zh: '2023 年 6 月 13 日，模型开始交出函数请求', en: 'On 13 June 2023, a model could return a function request.' }, { gap: 0.45 }],
        ['h7', { zh: '公告没有写谁把结果送回去', en: 'The post does not say who sends the result back.' }, { gap: 0.4 }],
        ['h8', { zh: '它写明，工具输出可能反过来指使模型', en: 'It says tool output can instruct the model.' }, { gap: 0.45 }],
        ['h9', { zh: '会留下外界后果的动作，要人确认', en: 'An outside consequence needs a person to confirm.' }, { gap: 0.35 }],
      ],
    },
    {
      id: 'houses', at: 93.6, chap: null, lead: 0.5, tail: 0.2,
      cues: [
        ['p1', { zh: '五家各用一份固定文档或提交，不排名', en: 'Five pinned sources. No ranking.' }, { gap: 0.55 }],
        ['p2', { zh: 'Claude Code 里，由模型挑选工具', en: 'In Claude Code, the model picks the tool.' }, { gap: 0.4 }],
        ['p3', { zh: '能不能执行，由程序的规则决定', en: 'The program rules decide whether it runs.' }, { gap: 0.4 }],
        ['p4', { zh: '写进提示，并不能改掉这些规则', en: 'A prompt does not change those rules.' }, { gap: 0.4 }],
        ['p5', { zh: '规则按拒绝、询问、允许，取第一条', en: 'First match wins: deny, ask, then allow.' }, { gap: 0.45 }],
        ['p6', { zh: '2026 年 10 月 18 日的文档，也可改由分类器审查', en: 'On 18 October 2026, a classifier may review instead.' }, { gap: 0.7 }],
        ['c1', { zh: 'Codex 由程序执行命令，并可以加沙箱', en: 'Codex runs commands and can add a sandbox.' }, { gap: 0.45 }],
        ['c2', { zh: '2025 年 4 月 16 日的开关，和 2026 年的不同', en: 'The 16 April 2025 switches differ from 2026.' }, { gap: 0.45 }],
        ['c3', { zh: '沙箱只约束自带的 shell，不含外部工具', en: 'The sandbox binds its own shell, not outside tools.' }, { gap: 0.7 }],
        ['n1', { zh: 'OpenCode 的 build 是默认，可以改文件', en: 'In OpenCode, build may edit files.' }, { gap: 0.4 }],
        ['n2', { zh: 'plan 默认不改文件，跑命令前会询问', en: 'plan does not edit, and asks before a command.' }, { gap: 0.45 }],
        ['n3', { zh: '差别可以是模式，不必换成另一个软件', en: 'A mode can differ without another program.' }, { gap: 0.7 }],
        ['i1', { zh: 'Pi 写明自己没有内建的许可系统', en: 'Pi has no built-in permission system.' }, { gap: 0.4 }],
        ['i2', { zh: '默认使用启动者的权限，也不逐次询问', en: 'It runs as the launching user and does not ask.' }, { gap: 0.7 }],
        ['d1', { zh: 'DeepSeek Harness 把这一层做成插件', en: 'DeepSeek Harness splits this layer into plugins.' }, { gap: 0.45 }],
        ['d2', { zh: '最小一档只提供 shell 和当前目录', en: 'The small profile has a shell and a directory.' }, { gap: 0.4 }],
        ['d3', { zh: '文件编辑不在这一档默认的工具里', en: 'File editing is not a default tool there.' }, { gap: 0.35 }],
      ],
    },
    {
      id: 'close', at: 166, chap: null, lead: 0.45, tail: 0.2,
      cues: [
        ['e1', { zh: '换成更会回答的模型，并不换掉这层程序', en: 'A better model does not replace this program.' }, { gap: 0.65 }],
        ['e2', { zh: '程序决定碰得着什么，以及做之前问不问', en: 'It decides reach, and whether to ask first.' }, { gap: 0.6 }],
        ['e3', { zh: '三份材料里，一轮并不是同一个边界', en: 'Three sources do not share one turn boundary.' }, { gap: 0.55 }],
        ['e4', { zh: '不能用步数比较谁转得更多', en: 'A step count cannot say which one turns more.' }, { gap: 0.4 }],
      ],
    },
    {
      id: 'outro', at: 184.5, chap: null, lead: 0.5, tail: 0,
      cues: [
        ['z1', null, { pause: 7, gap: 0 }],
      ],
    },
  ];

  const SAY = {
    zh: [
      [/DeepSeek Harness/g, 'Deep Seek harness'],
      [/Claude Code/g, 'Claude Code'],
      [/OpenCode/g, 'Open Code'],
      [/ReAct/g, 'Re Act'],
      [/\bPi\b/g, 'pie'],
      [/harness/g, 'harness'],
      [/shell/g, 'shell'],
      [/build/g, 'build'],
      [/plan/g, 'plan'],
      [/Codex/g, 'Codex'],
    ],
    en: [
      [/OpenCode/g, 'Open Code'],
      [/DeepSeek/g, 'Deep Seek'],
      [/\bPi\b/g, 'pie'],
    ],
  };
  const strip = (s) => s.replace(/\*/g, '');
  const ttsNorm = (s) => { for (const [re, to] of SAY[LANG] || []) s = s.replace(re, to); return s; };
  const SCRIPT = RAW.map((sc) => ({
    ...sc, chap: sc.chap ? [sc.chap[0], pick(sc.chap[1])] : null,
    cues: sc.cues.map(([id, cap, o = {}]) => [id, pick(cap), { ...o, tts: pick(o.tts), gap: pick(o.gap), pause: pick(o.pause) }]),
  }));
  const ttsText = (c) => (c[2] && c[2].tts) || ttsNorm(strip(c[1]) + (LANG === 'zh' ? '。' : ''));

  const estimate = (text) => (LANG === 'zh' ? 0.35 + text.replace(/[，。：；、\s]/g, '').length / 5.2 : 0.3 + text.split(/\s+/).length / 2.7);

  function layoutScript(DUR) {
    DUR = DUR || {};
    let t = 0;
    const cues = {}, scenes = [], order = [], problems = [];
    const pinTo = (at, what) => {
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
