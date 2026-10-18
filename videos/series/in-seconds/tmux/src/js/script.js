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
// 2026-10-19 文案第 2 轮。中文是审稿底本；英文是对照草稿，共用场景定点。
// 同一条计数贯穿：终端离开后数从 4 到 9，再给留下的进程起名，再讲键和字节。没有章节卡。
// 历史、套接字、命令表、VT100 这一轮不口播。片尾 120.5–128 不配旁白。事实只转到 FACTS.md 已有的陈述。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);            // 画面里的文字：tr('中文', 'English')

  const TOTAL = 128;
  const RAW = [
    {
      // 6 秒内交出「终端离开，数从 4 到 9」。oT 是片名卡，不配旁白。o5 先回答留下了什么。
      id: 'open', at: 0, chap: null, lead: 0.16, tail: 0.22,
      cues: [
        ['o1', { zh: '终端里，一个程序在计数', en: 'A terminal runs a count.' }, { gap: 0.16 }],
        ['o2', { zh: '终端离开后，数从 4 到 9', en: 'It leaves, and 4 becomes 9.' }, { gap: 0.2 }],
        ['o3', { zh: '程序还在跑', en: 'The program keeps running.' }, { gap: 0.26 }],
        ['o4', { zh: '这是 *tmux*', en: 'This is *tmux*.' }, { gap: 0.2 }],
        ['oT', null, { pause: 2.2, gap: 0 }],
        ['o5', { zh: '离开的，只是连上来的终端', en: 'Only the attached terminal left.' }, { gap: 0.28 }],
      ],
    },
    {
      // 先命名留下的进程，再给屏幕上的东西起名。3.4 只标记这一次读到的画面。
      id: 'model', at: 14.4, chap: null, lead: 0.32, tail: 0.16,
      cues: [
        ['m1', { zh: '留住程序的进程，叫 *server*', en: 'The process that keeps it is the *server*.' }, { gap: 0.26 }],
        ['m2', { zh: '用来看和按键的一端，叫 *client*', en: 'The watching and typing end is the *client*.' }, { gap: 0.26 }],
        ['m3', { zh: 'client 离开以后，server 还在', en: 'After the client leaves, the server stays.' }, { gap: 0.3 }],
        ['m4', { zh: '程序读写的地方，叫伪终端', en: 'That place is a pseudo terminal.' }, { gap: 0.24 }],
        ['m5', { zh: '伪终端留在 server 上', en: 'The pseudo terminal stays on the server.' }, { gap: 0.26 }],
        ['m6', { zh: '计数的进程，是 server 启动的', en: 'The server started the counting process.' }, { gap: 0.28 }],
        ['m7', { zh: '占满屏幕的一页，叫 *window*', en: 'A full-screen page is a *window*.' }, { gap: 0.22 }],
        ['m8', { zh: 'tmux 3.4 有两个 window', en: 'tmux 3.4 has two windows.' }, { gap: 0.22 }],
        ['m9', { zh: '切开的一块，叫 *pane*', en: 'One cut of a window is a *pane*.' }, { gap: 0.2 }],
        ['m10', { zh: '第二个 window，分成两块 pane', en: 'The second window splits into two panes.' }, { gap: 0.24 }],
        ['m11', { zh: '计数的程序，在其中一块', en: 'The counting program is in one of them.' }, { gap: 0.22 }],
        ['m12', { zh: '每块 pane，都有一块伪终端', en: 'Each pane has its own pseudo terminal.' }, { gap: 0.24 }],
        ['m13', { zh: '它们放在一起，叫 *session*', en: 'Kept together, they are a *session*.' }, { gap: 0.28 }],
      ],
    },
    {
      // 对象都有名字之后才讲键。分离不提前使用，d 直接说成 client 离开。
      id: 'use', at: 57.6, chap: null, lead: 0.28, tail: 0.14,
      cues: [
        ['u1', { zh: '先按 *Ctrl-b*，再按下一个键', en: 'Press *Ctrl-b*, then the next key.' }, { gap: 0.22 }],
        ['u2', { zh: 'c 新开一个 window', en: 'c opens a new window.' }, { gap: 0.16 }],
        ['u3', { zh: 'd 让当前 client 离开', en: 'd makes the current client leave.' }, { gap: 0.2 }],
        ['u4', { zh: '% 左右切开 pane', en: '% splits a pane side by side.' }, { gap: 0.16, tts: { zh: '百分号左右切开 pane。', en: 'Percent splits a pane side by side.' } }],
        ['u5', { zh: '" 上下切开 pane', en: '" splits a pane top from bottom.' }, { gap: 0.16, tts: { zh: '引号上下切开 pane。', en: 'A quote splits a pane top from bottom.' } }],
        ['u6', { zh: 'tmux attach 接回这个 session', en: 'tmux attach brings this session back.' }, { gap: 0.26 }],
      ],
    },
    {
      // 同一条键和同一串字节。PANE-A 是另一块 pane，不和「没有 client」接成一件事。
      id: 'impl', at: 77.1, chap: null, lead: 0.28, tail: 0.14,
      cues: [
        ['i1', { zh: '按键先到 tmux，认得的由它处理', en: 'Keys hit tmux first. Known ones, it handles.' }, { gap: 0.24 }],
        ['i2', { zh: '其余的键，送给 pane 里的程序', en: 'Other keys go to the program in the pane.' }, { gap: 0.24 }],
        ['i3', { zh: '程序写回的字节，到达 server', en: 'Bytes the program writes reach the server.' }, { gap: 0.22 }],
        ['i4', { zh: 'server 把这些字节读成字', en: 'The server reads those bytes into characters.' }, { gap: 0.22 }],
        ['i5', { zh: '原字节不交给 client', en: 'Raw bytes are not given to the client.' }, { gap: 0.24 }],
        ['i6', { zh: '再按这个 client 的终端重画一屏', en: 'It redraws one frame for this client.' }, { gap: 0.24 }],
        ['i7', { zh: '向另一块 pane 送入命令，回显 *PANE-A*', en: 'A command to the other pane reads back *PANE-A*.' }, { gap: 0.26 }],
        ['i8', { zh: '没有 client 时，数仍从 4 到 9', en: 'With no client, 4 still becomes 9.' }, { gap: 0.28 }],
      ],
    },
    {
      // 历史不进这一轮。边界接在 4→9 之后。
      id: 'edge', at: 105.9, chap: null, lead: 0.24, tail: 0.12,
      cues: [
        ['e1', { zh: 'kill-server 后，server 与 pane 都停', en: 'After kill-server, server and pane both stop.' }, { gap: 0.24 }],
        ['e2', { zh: '还在，只算离开，不算重启', en: 'Still there means leaving, not a reboot.' }, { gap: 0.22 }],
        ['e3', { zh: '进程和屏幕在 server，不在 client', en: 'Process and screen stay on the server, not the client.' }, { gap: 0.18 }],
        ['eT', null, { pause: 1.6, gap: 0 }],
      ],
    },
    {
      // 片尾名单：策划、参与模型与分工、开源视频的仓库地址。7.5 秒，不配旁白。
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
