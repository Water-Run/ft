// 旁白脚本：每个 cue = [句号, 字幕, {tts, gap, pause}]
// - 只有中文：字幕直接写字符串。*词* 标出术语，第一次出现的那句说完时，画面上要有 data-gloss="词" 的注解
// - tts 缺省时由字幕按 SAY 表换成读法；gap：该句结束到下一句开始的停顿（秒，缺省 0.3）；pause：无旁白的纯画面停顿
// - 片尾署名只上画面：['credits', null, { pause: 8, credits: true }]
// 语言：浏览器取 ?lang=，Node 取环境变量 VLANG；缺省为 zh。浏览器与 Node 共用本文件（工具读它排时间线）。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);

  const RAW = [
    {
      id: 'open', chap: null, lead: 1.0, tail: 0.4,
      cues: [
        ['o1', '这，是一个 DeepSeek Harness', { gap: 0.8 }],
        ['o2', '现在它黑化了', { gap: 0.6 }],
        ['o3', '成了 DeepSeek Harness Uncensored', { gap: 0.5 }],
        ['o4', '多了一个 Uncensored', { gap: 0.7 }],
        ['o6', '更自由的探索未至之境', { gap: 0.4 }],
        ['oT', null, { pause: 0.9 }],
      ],
    },
    {
      id: 'box', chap: ['01', '开箱即用的破甲体验'], lead: 3.0, tail: 0.6,
      cues: [
        ['b1', 'DSHU 沿用 dsh-purge 早期的 MIT 版本', { gap: 0.2 }],
        ['b1b', '直接内置了破甲提示词，开箱即用', { gap: 0.3 }],
        ['b3', '不用再到处找提示词，也不用自己改配置', { gap: 0.8 }],
        ['b6', '现在 DSHU 的源码，基于官方的 DSH 0.2.2-rc.5', { gap: 0.3, tts: '现在 DSHU 的源码基于官方的 D S H 零点二点二 R C 五。' }],
        ['b7', '但它跟官方版是分开的', { gap: 0.3 }],
        ['b8', '程序目录、配置、会话、更新渠道，都各管各的', { gap: 0.3 }],
        ['b9', '可以独立并存', { gap: 0.9 }],
      ],
    },
    {
      id: 'modes', chap: ['02', '四种模式'], lead: 3.0, tail: 0.6,
      cues: [
        ['m1', '新建会话的时候，输入框上面能选模式', { gap: 0.3 }],
        ['m2', '一共四种：缺省、网安、逆向、写作', { gap: 0.6 }],
        ['m3', '破甲是四种模式共用的', { gap: 0.3 }],
        ['m4', '不一样的是，每种模式带的工具、手册和资料', { gap: 0.7 }],
        ['m6', '每种模式有自己的颜色，蓝、红、绿、黄', { gap: 0.3 }],
        ['m7', '选了哪种，标题、侧栏和按钮就跟着换色', { gap: 0.6 }],
        ['m8', '默认情况下，第一条消息发出去、对话建好以后', { gap: 0.2 }],
        ['m8b', '模式就固定下来了，不能改变', { gap: 0.3 }],
        ['m9', '这样聊到一半，工具和手册不会突然全变', { gap: 1.0 }],
      ],
    },
    {
      id: 'default', chap: null, lead: 0.8, tail: 0.5,
      cues: [
        ['d1', '缺省就是默认', { gap: 0.2 }],
        ['d1b', '缺省模式，就是平时日常开发、调试之类的模式', { gap: 0.3 }],
        ['d2', '其实啥都能干，作为通用模式', { gap: 0.2 }],
        ['d2b', '你不知道选什么的时候，选这个就行', { gap: 1.0 }],
      ],
    },
    {
      id: 'security', chap: null, lead: 0.8, tail: 0.5,
      cues: [
        ['s1', '网安模式，做网络安全审计和渗透测试', { gap: 0.3 }],
        ['s2', '里面有七类现场手册，按调查的阶段来用', { gap: 0.3 }],
        ['s3', '目标、证据、发现都记进案件，最后能整理成报告', { gap: 0.6 }],
        ['s4', '还可以开独立代理，让访问目标的流量走你指定的代理', { gap: 0.2 }],
        ['s5', '再套一层马甲', { gap: 0.3 }],
        ['s5b', '当然这只是一个实验功能，不要过于依赖', { gap: 0.6 }],
        ['s6', '第一次进网安，要先读一遍责任说明', { gap: 0.3 }],
        ['s7', '你自己要确保目标是有授权的，否则后果自负', { gap: 1.0 }],
      ],
    },
    {
      id: 'reverse', chap: null, lead: 0.8, tail: 0.5,
      cues: [
        ['r1', '逆向模式，内置 REA', { gap: 0.2 }],
        ['r1b', '用来拆程序、二进制、文件格式和协议', { gap: 0.3 }],
        ['r5', '如果你想用 Ghidra、IDA、Hopper 这些，你也能接进来', { gap: 1.0 }],
      ],
    },
    {
      id: 'writing', chap: null, lead: 0.8, tail: 0.6,
      cues: [
        ['w1', '写作模式，写你想写的东西', { gap: 0.4 }],
        ['w2', '你可以把人物、设定和文风卡放在 story 目录里', { gap: 0.3 }],
        ['w3', '并勾上你这次想要用到的', { gap: 0.6 }],
        ['w6', '这个模式里没有终端，也不跑代码，就专心写', { gap: 1.0 }],
        ['w7', '哦对了，现在对话也能删掉了', { gap: 1.0 }],
      ],
    },
    {
      id: 'asides', chap: ['03', '通用增强'], lead: 3.0, tail: 0.6,
      cues: [
        ['x1', 'DeepSeek Harness Uncensored 还提供了', { gap: 0.1 }],
        ['x1b', '一系列便于使用的通用增强', { gap: 0.6 }],
        ['x2', '主线正在跑一个长任务，你想搞明白进度如何', { gap: 0.3 }],
        ['x3', '直接 /btw，这叫随问', { gap: 0.2 }],
        ['x3b', '和 Claude Code 的 /btw 类似', { gap: 0.2 }],
        ['x3c', '主要用来问各种简单的一次性小问题', { gap: 0.7 }],
        ['x4', '输入 /side，右边会开一个旁问', { gap: 0.2 }],
        ['x4b', '这个则类似于 Codex 的 /side', { gap: 0.3 }],
        ['x5', '在旁边打开一个同步的对话', { gap: 0.2 }],
        ['x5b', '自动跟进主线已经完成的进度', { gap: 0.3 }],
        ['x6', '你可以用 /clear 清理对话', { gap: 0.2 }],
        ['x6b', '也可以设成关掉旁问时自动清理', { gap: 0.9 }],
        ['x11', 'DSHU 另外引入了可选的输入预测功能', { gap: 0.3 }],
        ['x11b', '打字停一下，输入框里会冒出灰色的后半句', { gap: 0.3 }],
        ['x12', '按 Tab 就能收下', { gap: 1.0 }],
      ],
    },
    {
      id: 'spend', chap: null, lead: 0.8, tail: 0.6,
      cues: [
        ['y1', '进入页面，你会发现左下角一直挂着账户余额', { gap: 0.3 }],
        ['y2', '现在是梁文峰还是梁文谷、还有多久', { gap: 0.6 }],
        ['y3', '设置里还有总余额的变化曲线，鼠标悬停就能读数', { gap: 0.3 }],
        ['y4', '具体到每个对话花了多少，你可以在会话的底部查看', { gap: 0.8 }],
        ['y5', '要是你用惯了各种 Coding Plan', { gap: 0.2 }],
        ['y5b', '感觉没有额度百分比很不舒服', { gap: 0.3 }],
        ['y6', '对于有这种癖好的用户', { gap: 0.2 }],
        ['y6b', 'DSHU 也带来了经典的 5 小时和周限额', { gap: 0.3 }],
        ['y7', '还不满足的话，还有更多限额可选', { gap: 0.3 }],
        ['y7b', '给自己上一些防沉迷控制', { gap: 1.0 }],
      ],
    },
    {
      id: 'memory', chap: null, lead: 0.8, tail: 0.6,
      cues: [
        ['k1', '对了，DSHU 还有跨对话记忆', { gap: 0.2 }],
        ['k2', '偏好和项目约定存一次，以后的对话自己会去找', { gap: 1.0 }],
      ],
    },
    {
      id: 'outro', chap: null, lead: 1.0, tail: 0.6,
      cues: [
        ['f1', 'DSHU 以 GPL-3.0-or-later 开源在 GitHub', { gap: 0.3 }],
        ['f2', 'GitHub Release 上的安装包准备了四个平台', { gap: 0.3 }],
        ['f3', 'Windows x64、Linux x64', { gap: 0.3 }],
        ['f4', 'Linux ARM64 和 macOS ARM64', { gap: 0.6 }],
        ['f4a', 'DSH 是 TypeScript 写的，你当然也可以自己打包一个', { gap: 0.6 }],
        ['f6', 'DeepSeek Harness Uncensored，更自由的探索未至之境', { gap: 0.4 }],
        ['fT', null, { pause: 1.0 }],
      ],
    },
    {
      id: 'credits', chap: null, lead: 0.4, tail: 0.6,
      cues: [
        ['credits', null, { pause: 4, credits: true }],
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面。先用 kit/tools/tts_probe.js 试，再用 asr.js 回听。
  const SAY = {
    zh: [
      [/GPL-3\.0-or-later/g, 'G P L 三点零或更高版本'],
      [/0\.2\.2-rc\.5/g, '零点二点二 R C 五'],
      [/REA 6\.9\.0/g, 'R E A 六点九点零'],
      [/DSHU/g, 'DSHU'],   // r2：「DSHU读的不通顺」，字母之间不再隔空格
      [/\bDSH\b/g, 'D S H'],
      [/dsh-purge/g, 'D S H purge'],
      [/Windows x64/g, 'Windows x 六十四'],
      [/Linux x64/g, 'Linux x 六十四'],
      [/ARM64/g, '阿姆六十四'],   // 策划者 2026-11-23：「ARM的读法连读, 大概类似于阿姆」
      [/macOS/g, 'mac O S'],
      [/MIT/g, 'M I T'],
      [/\/side/g, '斜杠 side'],
      [/\/btw/g, '斜杠 B T W'],
      [/\/clear/g, '斜杠 clear'],
      [/IDA/g, 'I D A'],
      [/5 小时/g, '五小时'],
    ],
  };
  const strip = (s) => s.replace(/\*/g, '');
  const ttsNorm = (s) => { for (const [re, to] of SAY[LANG] || []) s = s.replace(re, to); return s; };
  const SCRIPT = RAW.map((sc) => ({
    ...sc, chap: sc.chap ? [sc.chap[0], pick(sc.chap[1])] : null,
    cues: sc.cues.map(([id, cap, o = {}]) => [id, pick(cap), { ...o, tts: pick(o.tts), gap: pick(o.gap) }]),
  }));
  const ttsText = (c) => (c[2] && c[2].tts) || ttsNorm(strip(c[1]) + (LANG === 'zh' ? '。' : ''));

  const estimate = (text) => (LANG === 'zh' ? 0.35 + text.replace(/[，。：；、\s]/g, '').length / 5.2 : 0.3 + text.split(/\s+/).length / 2.7);

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
