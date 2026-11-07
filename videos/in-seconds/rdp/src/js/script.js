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


  // 定点 at 是按估算排的初稿位置；选定音色后逐句实测，再改定点（只删内容，不压留白）。
  const TOTAL = 192;
  const RAW = [
    {
      // 引子：一个具体场景 → 问题 → 点名。片名卡只上画面，不念
      id: 'open', at: 0, chap: null, lead: 0.4, tail: 0.2,
      cues: [
        ['o1', '在家里，打开公司那台 Windows 电脑', { gap: 0.35 }],
        ['o2', '窗口、文件、复制粘贴，都像坐在它面前', { gap: 0.5 }],
        ['o3', '画面隔着网络传过来，字却清清楚楚', { gap: 0.7 }],
        ['o4', '这靠的是 *RDP*：远程桌面协议', { gap: 0.3 }],
        ['oT', null, { pause: 1.6 }],
      ],
    },
    {
      // 它是什么：程序在远端，客户端只看和按
      id: 'what', at: 17.5, chap: null, lead: 0.2, tail: 0.2,
      cues: [
        ['w1', '程序都在那台电脑上运行', { gap: 0.3 }],
        ['w2', '你这边只做两件事：看画面，按键盘和鼠标', { gap: 0.4 }],
        ['w3', '画面传过来，按键传回去', { gap: 0.6 }],
        ['w4', 'Windows 自带它，就是系统里的「远程桌面连接」', { gap: 0.3 }],
      ],
    },
    {
      // 历史：年份上画面；只讲到 XP，后来的演进放到「边界」里讲
      id: 'history', at: 32.5, chap: null, lead: 0.2, tail: 0.2,
      cues: [
        ['h1', '它诞生于 1998 年', { gap: 0.3 }],
        ['h2', '那时电脑很贵', { gap: 0.2 }],
        ['h3', '微软想让一台服务器，同时供很多人使用', { gap: 0.3 }],
        ['h4', '每人一台便宜的终端，程序全在服务器上跑', { gap: 0.3 }],
        ['h4b', '项目的代号叫 Hydra：九头蛇', { gap: 0.4 }],
        ['h5', '这套协议，脱胎于当年的网络会议标准', { gap: 0.5 }],
        ['h6', '2001 年，Windows XP 专业版自带了远程桌面', { gap: 0.3 }],
      ],
    },
    {
      // 主线一：把屏幕当视频
      id: 'video', at: 57.5, chap: null, lead: 0.2, tail: 0.2,
      cues: [
        ['v1', '远程最难的，是画面怎么传', { gap: 0.4 }],
        ['v2', '最直接的办法，是把屏幕当成*视频*', { gap: 0.3 }],
        ['v3', '每秒抓几十张整屏：压缩，发送，解压，显示', { gap: 0.4 }],
        ['v4', '游戏串流软件就是这么做的，什么画面都能传', { gap: 0.3 }],
        ['v5', '它拼的是快：总延迟二十毫秒和四十毫秒', { gap: 0.15 }],
        ['v6', '可能就是好玩和玩不了的差别', { gap: 0.3 }],
      ],
    },
    {
      // 主线二：RDP 发绘图命令。字节数取自规范的带注释样例（FACTS G4–G7）与本机实验（L2、L3）
      id: 'orders', at: 78, chap: null, lead: 0.2, tail: 0.2,
      cues: [
        ['r1', 'RDP 走了另一条路：它就在 Windows 里面', { gap: 0.3 }],
        ['r2', 'Windows 画一个窗口，本来就是一条条*绘图命令*', { gap: 0.3 }],
        ['r3', 'RDP 把命令本身发过去，让你的电脑自己画', { gap: 0.6 }],
        ['r4', '把 1024 乘 768 的一块填满颜色：10 个字节', { gap: 0.5 }],
        ['r5', '写字，先把每个字形发一次，存进*缓存*', { gap: 0.3 }],
        ['r5b', '比如字母 d：5 乘 9 个点，9 个字节', { gap: 0.3 }],
        ['r6', '以后只报编号：一行 9 个字，47 个字节', { gap: 0.5 }],
        ['r7', '往下滚动：一条搬移命令，14 个字节', { gap: 0.2 }],
        ['r8', '再补上露出来的新行', { gap: 0.5 }],
        ['r9', '同样的滚动当成视频发，这一帧要两万三千多字节', { gap: 0.6 }],
        ['r10', '视频压缩还会丢掉一部分颜色，彩色小字发虚', { gap: 0.3 }],
        ['r11', 'RDP 的字，是照着字形一点一点画的，分毫不差', { gap: 0.3 }],
      ],
    },
    {
      // 画面之外：虚拟通道
      id: 'channels', at: 128.5, chap: null, lead: 0.2, tail: 0.2,
      cues: [
        ['c1', '画面之外，RDP 还开了好几条*通道*', { gap: 0.3 }],
        ['c2', '剪贴板、文件、打印机、声音，各走各的', { gap: 0.4 }],
        ['c3', '复制一段字，传过去的还是字，不是它的照片', { gap: 0.3 }],
      ],
    },
    {
      // 边界：命令说不清的画面；新管线与混合编码
      id: 'limit', at: 140, chap: null, lead: 0.2, tail: 0.2,
      cues: [
        ['b1', '可游戏和视频，整屏每一帧都在变，命令说不清', { gap: 0.5 }],
        ['b2', '所以 Windows 8 起，RDP 重写了传画面的那一套', { gap: 0.3 }],
        ['b3', '填色、搬移、缓存照旧，后来图像也交给视频编码', { gap: 0.3 }],
        ['b4', 'Windows 10 起，又用完整的颜色编码，保住文字', { gap: 0.5 }],
        ['b5', '打游戏，视频串流更合适', { gap: 0.2 }],
        ['b6', '桌面上的字和窗口，是 RDP 的长项', { gap: 0.3 }],
      ],
    },
    {
      // 收尾：回到开头那行字，一句结论
      id: 'end', at: 171, chap: null, lead: 0.2, tail: 0.2,
      cues: [
        ['e1', '回到开头那行清清楚楚的字', { gap: 0.4 }],
        ['e2', 'RDP 的优雅在于：能说清「怎么画」', { gap: 0.2 }],
        ['e3', '就不传「画成了什么」', { gap: 0.3 }],
      ],
    },
    {
      // 片尾名单：策划、参与模型与分工、开源视频的仓库地址。约 7.5 秒，不配旁白
      id: 'outro', at: 184.5, chap: null, lead: 0.5, tail: 0,
      cues: [
        ['z1', null, { pause: 6.5, credits: true }],   // 名单取自 project.json 的 credits
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。
  const SAY = {
    zh: [
      [/1024 乘 768/g, '一千零二十四乘七百六十八'],
      [/1998 年/g, '一九九八年'],
      [/2001 年/g, '二零零一年'],
      [/3389/g, '三三八九'],
      [/RDP/g, 'R D P'],
      [/Windows XP/g, 'Windows X P'],
      [/一行/g, '一航'],
      [/新行/g, '新航'],
      [/「|」/g, ''],
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
