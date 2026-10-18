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
// 2026-10-19 第 5 轮（Claude Opus 5.5，按 WaterRun 授权自主改写）：计数 4→9 的钩子，server/client/伪终端回答「程序住在哪」，再讲三层、按键、键表与重画，最后回答开头与 kill-server。
// 先说终端离开、计数还在，再用两次读数。定义之后才停片名。历史只留能接回这一页的原因。
// 不报 nscr、3.8、好读的代码，也不口播 3.4。结尾用 server 回答「还在」，最后一句是程序怎么停。片尾 120.5–128 不配旁白。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);            // 画面里的文字：tr('中文', 'English')

  const TOTAL = 128;
  const RAW = [
    {
      // 钩子：计数 4 → 断开 → 9。定义 tmux，片名停顿在定义之后。
      id: 'open', at: 0, chap: null, lead: 0.12, tail: 0.12,
      cues: [
        ['o1', { zh: '终端里有个程序在计数，数到 4，终端断开了', en: 'A program counts in a terminal. At 4, the terminal drops.' }, { gap: 0.16 }],
        ['o2', { zh: '过一会儿重新连上，它已经数到 9', en: 'Reconnect a moment later, and it is already at 9.' }, { gap: 0.16 }],
        ['o3', { zh: '程序一直在跑，走掉的只是终端', en: 'The program kept running. Only the terminal left.' }, { gap: 0.16 }],
        ['o4', { zh: '替它守着的，是终端复用器 *tmux*', en: 'What kept it alive is a terminal multiplexer: *tmux*.' }, { gap: 0.16 }],
        ['o5', { zh: '一块屏幕开好几个终端，人走了，它们还在', en: 'Many terminals on one screen, still there after you leave.' }, { gap: 0.12 }],
        ['oT', null, { pause: 2.2, gap: 0 }],
      ],
    },
    {
      // 来历：2007、screen 用户、不是复制、共享 window、2009 OpenBSD base。
      id: 'past', at: null, chap: null, lead: 0.16, tail: 0.2,
      cues: [
        ['p1', { zh: '*tmux* 诞生于 2007 年', en: '*tmux* was born in 2007.' }, { gap: 0.14 }],
        ['p2', { zh: '作者原本是另一个工具 *screen* 的重度用户', en: 'Its author was a heavy user of another tool, *screen*.' }, { gap: 0.14 }],
        ['p3', { zh: '但他说得明白：*tmux* 不是要复制 *screen*', en: 'But he was clear: *tmux* was not meant to copy *screen*.' }, { gap: 0.14 }],
        ['p4', { zh: '他要一个窗口接到多个终端，其他窗口各自独立', en: 'He wanted one window on several terminals, the rest independent.' }, { gap: 0.14 }],
        ['p6', { zh: '2009 年，*tmux* 被收进 OpenBSD 的基本系统', en: 'In 2009, *tmux* was imported into the OpenBSD base system.' }, { gap: 0.16 }],
      ],
    },
    {
      // server / client / 伪终端，再讲 session、window、pane 三层。
      id: 'model', at: null, chap: null, lead: 0.16, tail: 0.1,
      cues: [
        ['m1', { zh: '回到那个计数：它到底住在哪儿？', en: 'Back to the counter: where does it actually live?' }, { gap: 0.18 }],
        ['m2', { zh: '启动 *tmux*，会先拉起一个后台进程 *server*', en: 'Starting *tmux* first launches a background process, the *server*.' }, { gap: 0.14 }],
        ['m3', { zh: '计数程序，是 *server* 的子进程', en: 'The counter is a child process of the server.' }, { gap: 0.12 }],
        ['m4', { zh: '它用的终端，是 *server* 造出来的伪终端', en: 'Its terminal is a pseudo terminal the server created.' }, { gap: 0.16 }],
        ['m5', { zh: '眼前的终端窗口只是 *client*，管显示和按键', en: 'The terminal in front of you is just a *client*: picture and keys.' }, { gap: 0.14 }],
        ['m7', { zh: '*client* 和 *server* 是两个进程，靠本地连接通信', en: 'Client and server are two processes talking over a local socket.' }, { gap: 0.14 }],
        ['m8', { zh: '终端关掉，断开的只是这条连接', en: 'Close the terminal, and only that connection breaks.' }, { gap: 0.2 }],
        ['m9', { zh: '*server* 管的东西，分三层', en: 'What the server manages has three layers.' }, { gap: 0.12 }],
        ['m10', { zh: '最外层是 *session*，一组终端的集合', en: 'The outermost is a *session*, a group of terminals.' }, { gap: 0.12 }],
        ['m11', { zh: '*session* 里有 *window*，每个占满一屏', en: 'A session holds *windows*, each filling the screen.' }, { gap: 0.12 }],
        ['m12', { zh: '*window* 再切成 *pane*，每块都是独立的伪终端', en: 'Windows split into *panes*, each its own pseudo terminal.' }, { gap: 0.14 }],
      ],
    },
    {
      // 默认键：前缀、c、%、引号、d、attach。
      id: 'use', at: null, chap: null, lead: 0.14, tail: 0.08,
      cues: [
        ['u1', { zh: '操作时，先按前缀键 *Ctrl-b*，再按命令键', en: 'To use it, press the prefix *Ctrl-b*, then a command key.' }, { gap: 0.14 }],
        ['u2', { zh: '按 c，新建一个 *window*', en: 'c creates a new window.' }, { gap: 0.12 }],
        ['u3', { zh: '按 % 左右切开 *pane*，按引号上下切开', en: '% splits panes left-right; a double quote, top-bottom.' }, { gap: 0.12, tts: { zh: '按百分号左右切开 pane，按引号上下切开。', en: 'Percent splits panes left-right; a double quote, top-bottom.' } }],
        ['u5', { zh: '按 d，当前 *client* 断开，也就是 detach', en: 'd disconnects the current client. That is detach.' }, { gap: 0.14 }],
        ['u6', { zh: '回来时输入 *tmux* attach，画面原样接上', en: 'Come back with *tmux* attach, and the screen reconnects as it was.' }, { gap: 0.14 }],
      ],
    },
    {
      // 键表与重画：按键先进键表，输出先进 server 的屏幕再画给 client。
      id: 'impl', at: null, chap: null, lead: 0.12, tail: 0.08,
      cues: [
        ['i1', { zh: '每个按键，*tmux* 都先查自己的键表', en: 'Every key is first checked against tmux\'s key table.' }, { gap: 0.12 }],
        ['i2', { zh: '命中就自己执行，没命中才送进 *pane*', en: 'A match runs a tmux command; anything else goes to the pane.' }, { gap: 0.14 }],
        ['i3', { zh: '输出先写进 *server* 的屏幕，再画给每个 *client*', en: 'Output goes into a screen in the server, then is drawn for each client.' }, { gap: 0.16 }],
      ],
    },
    {
      // 回答开头；停法。
      id: 'edge', at: null, chap: null, lead: 0.14, tail: 0.08,
      cues: [
        ['e1', { zh: '所以开头的答案是：程序住在 *server* 里', en: 'So the answer: the program lives in the server.' }, { gap: 0.16 }],
        ['e2', { zh: '终端可以走，*server* 不走，程序就不停', en: 'Terminals may leave; while the server stays, the program runs.' }, { gap: 0.18 }],
        ['e3', { zh: '要彻底结束，就用 kill-server', en: 'To end it all, use kill-server.' }, { gap: 0.12 }],
        ['e4', { zh: '*server* 一停，所有会话和程序一起结束', en: 'Once the server stops, every session and program ends with it.' }, { gap: 0.14 }],
        ['eT', null, { pause: 2.2, gap: 0 }],
      ],
    },
    {
      // 片尾名单：策划、参与模型与分工、开源视频的仓库地址。不配旁白。
      id: 'outro', at: 120.5, chap: null, lead: 0.5, tail: 0,
      cues: [
        ['z1', null, { pause: 7, gap: 0 }],
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。先用 kit/tools/tts_probe.js 试，再用 asr.js 回听。
  const SAY = {
    zh: [
      [/kill-server/g, 'kill server'],
      [/Ctrl-b/g, 'control b'],
      [/OpenBSD/g, 'Open B S D'],
      [/PANE-A/g, 'pane A'],
      [/VT100/g, 'V T 一百'],
      [/nscr/g, 'n s c r'],
      [/\/dev\/pts\/3/g, 'dev pts 三'],
      [/3\.8/g, '三点八'],
      [/3\.4/g, '三点四'],
      [/tmux/g, 'T mux'],
    ],
    en: [
      [/nscr/g, 'n s c r'],
      [/tmux/g, 'tee mux'],
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
