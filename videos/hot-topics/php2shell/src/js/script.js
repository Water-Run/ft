// 旁白脚本：每个 cue = [句号, 字幕, {tts, gap, pause}]
// - 多语言时字幕写成 { zh: '…', en: '…' }；只有一种语言时直接写字符串。tts、gap、章节标题同理
// - 字幕里 *词* 表示强调；tts 缺省时由字幕按 SAY 表换成读法（字幕写正式拼写，读法只放在 SAY 表或 tts 字段）
// - gap：该句结束到下一句开始的停顿（秒，缺省 0.3）；pause：无旁白的纯画面停顿（标题、转场）
// - 片尾署名只上画面：['credits', null, { pause: 8, credits: true }]；不写入旁白正文，不设置 tts。名单由 scenes/s9_credits.js 从 project.json 读取。
// - 每章一个 scene：chap [编号, 标题]（null 表示没有章节卡）、lead 章节卡时长、tail 章末留白
// 语言：浏览器取 ?lang=，Node 取环境变量 VLANG；缺省为 zh。浏览器与 Node 共用本文件（工具读它排时间线）。
// 翻译以中文为底本：先定中文，再译其他语言；各语言的句号一一对应，时间轴各自排布。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);            // 画面里的文字：tr('中文', 'English')

  // 中文第 1 稿（2026-10-22）。英文在中文确认后从中文译出。
  const RAW = [
    {
      id: 'open', chap: null, lead: 0.8, tail: 0.4,
      cues: [
        ['o1', { zh: '10 月 21 日，荷兰的政府网站接连下线' }, { gap: 0.35 }],
        ['o2', { zh: '公民登录系统 DigiD、政务门户、议会官网' }, { gap: 0.35 }],
        ['o3', { zh: '连荷兰国家网络安全中心，也关掉了自己的网站' }, { gap: 0.7 }],
        ['o4', { zh: '同一天，日本首相高市早苗在 X 上发帖' }, { gap: 0.3 }],
        ['o5', { zh: '请大家*今晚*就准备好给网站打补丁' }, { gap: 0.3 }],
        ['o6', { zh: '来不及打补丁，就先把网站停掉' }, { gap: 0.5 }],
        ['o6a', { zh: '而她自己的个人网站，当晚打开只剩一行 It works!' }, { gap: 0.3 }],
        ['o6b', { zh: '那是服务器的默认页，原因没有公布' }, { gap: 0.7 }],
        ['o7', { zh: '让这么多人连夜行动的，是 PHP 的两个漏洞' }, { gap: 0.3 }],
        ['o8', { zh: '它们被叫作 *PHP2Shell*' }, { gap: 0.4 }],
        ['oT', null, { pause: 2.3 }],
      ],
    },
    {
      id: 'what', chap: ['01', { zh: '它是什么，有多严重' }], lead: 3.1, tail: 0.6,
      cues: [
        ['a1', { zh: 'PHP 是一门写网站后台的语言' }, { gap: 0.3 }],
        ['a2', { zh: '在能识别后台语言的网站里，近七成用它' }, { gap: 0.3 }],
        ['a3', { zh: 'WordPress、Drupal 这些建站系统都跑在 PHP 上' }, { gap: 0.6 }],
        ['a4', { zh: '这次的问题不在哪个网站，而在 *PHP 本身*' }, { gap: 0.9 }],
        ['a6', { zh: '两个漏洞的后果都是 *RCE*：远程代码执行' }, { gap: 0.3 }],
        ['a7', { zh: '陌生人隔着网络，就能让你的服务器' }, { gap: 0.1 }],
        ['a8', { zh: '运行他的程序，而且不用登录' }, { gap: 0.4 }],
        ['a10', { zh: 'PHP 官方的严重程度评分是 *9.2*，满分 10' }, { gap: 0.3 }],
        ['a12', { zh: '发现者之一 Wiz 说：' }, { gap: 0.1 }],
        ['a13', { zh: '只有一句 Hello World 的网站也可能中招' }, { gap: 0.8 }],
      ],
    },
    {
      id: 'how', chap: ['02', { zh: '原理：退了房，房卡没作废' }], lead: 3.6, tail: 0.6,
      cues: [
        ['b2', { zh: 'PHP 的工作进程，一次接一次地处理访问' }, { gap: 0.3 }],
        ['b4', { zh: '每次访问分到一块内存，用完收回' }, { gap: 0.6 }],
        ['b5', { zh: '问题出在访问*意外中断*的时候' }, { gap: 0.3 }],
        ['b6', { zh: '比如内存用超了，PHP 会中途把它打断' }, { gap: 0.3 }],
        ['b7', { zh: '内存收回了，可有些记录还指着那块内存' }, { gap: 0.5 }],
        ['b8', { zh: '就像退了房，房卡却没有作废' }, { gap: 0.5 }],
        ['b9', { zh: '同一个进程接待下一次访问时' }, { gap: 0.1 }],
        ['b10', { zh: '可能先拿这张旧房卡去开门，服务器就可能被人控制' }, { gap: 1.2 }],
        ['b13', { zh: '官方的修复做了两件事' }, { gap: 0.3 }],
        ['b14', { zh: '内存超限时不再中途跳出，而是安全地收尾' }, { gap: 0.3 }],
        ['b15', { zh: '每次访问结束，把这些旧记录统统清零' }, { gap: 0.3 }],
        ['b16', { zh: '补丁里好几处，就是释放之后补一句「置空」' }, { gap: 0.8 }],
        ['b17', { zh: '发现者说，从 2012 年的 PHP 5.4 起就受影响' }, { gap: 0.3 }],
        ['b18', { zh: '那一版加入了缺省开启的「上传进度」功能' }, { gap: 0.3 }],
        ['b19', { zh: '到今年，问题藏了 *14 年*' }, { gap: 0.4 }],
        ['b20', { zh: '巧的是，当年写下这个功能的开发者' }, { gap: 0.1 }],
        ['b21', { zh: '也是这次修复补丁的作者' }, { gap: 0.8 }],
      ],
    },
    {
      id: 'time', chap: ['03', { zh: '时间线' }], lead: 2.3, tail: 0.6,
      cues: [
        ['c1', { zh: '8 月，安全公司 Calif 和 Wiz 先后找到问题' }, { gap: 0.1 }],
        ['c2', { zh: '分别报告给 PHP' }, { gap: 0.3 }],
        ['c3', { zh: 'OpenAI 的研究员也在发现者之列' }, { gap: 0.3 }],
        ['c4', { zh: '这是 OpenAI「修补地球」计划的一部分' }, { gap: 0.4 }],
        ['c5', { zh: 'Wiz 说，他们一路都用了 Gemini 和 GPT 的模型' }, { gap: 0.7 }],
        ['c8', { zh: '原本是秘密修复，10 月 20 日深夜却被人在网上爆料' }, { gap: 0.3 }],
        ['c9', { zh: '安全公司 watchTowr 随即证实：漏洞是真的' }, { gap: 0.3 }],
        ['c10', { zh: 'PHP 官方马上发出预告：第二天发布修复' }, { gap: 0.6 }],
        ['c11', { zh: '21 日，补丁还没出，Cloudflare 先上了临时防护' }, { gap: 0.3 }],
        ['c12', { zh: '它的技术负责人说，已经看到早期攻击' }, { gap: 0.6 }],
        ['c13', { zh: '北京时间 21 日晚上九点半左右，修复版本发布' }, { gap: 0.8 }],
      ],
    },
    {
      id: 'impact', chap: ['04', { zh: '影响' }], lead: 2.3, tail: 0.6,
      cues: [
        ['d1', { zh: '补丁出来之前，许多机构选择先下线' }, { gap: 0.3 }],
        ['d2', { zh: '英美安全机构都建议：没法马上更新，就下线' }, { gap: 0.6 }],
        ['d4', { zh: '荷兰，政府网站之外，高校的一些系统也下线了' }, { gap: 0.3 }],
        ['d5', { zh: '日本，游戏 Shadowverse: Worlds Beyond' }, { gap: 0.1 }],
        ['d6', { zh: '电商平台 BASE 等服务暂停' }, { gap: 0.3 }],
        ['d8', { zh: '4chan 暂停了发帖' }, { gap: 1.2 }],
        ['d11', { zh: '已经被大规模利用了吗？各方说法不一' }, { gap: 0.3 }],
        ['d12', { zh: 'Cloudflare 和 watchTowr 说看到了攻击' }, { gap: 0.3 }],
        ['d13', { zh: '荷兰国家网络安全中心和 Huntress 说还没看到' }, { gap: 0.8 }],
      ],
    },
    {
      id: 'now', chap: ['05', { zh: '现在该怎么办' }], lead: 2.8, tail: 0.8,
      cues: [
        ['e1', { zh: '如果你的网站用 PHP，现在就升级' }, { gap: 0.3 }],
        ['e2', { zh: '修复版本是 8.5.12、8.4.27' }, { gap: 0.1 }],
        ['e2b', { zh: '8.3.36 和 8.2.35' }, { gap: 0.4 }],
        ['e3', { zh: '正式修复只覆盖 8.2 及以上' }, { gap: 0.3 }],
        ['e3a', { zh: '7.4 到 8.1 只有官方给的最小源码补丁' }, { gap: 0.3 }],
        ['e3b', { zh: '更老的 PHP 5，没有任何官方补丁' }, { gap: 0.6 }],
        ['e3c', { zh: '可在用 PHP 的网站里，约三分之一还停在 7 和 5' }, { gap: 0.3 }],
        ['e3d', { zh: '最多的是早已停止维护的 7.4 和 5.6，甚至还有 5.3' }, { gap: 0.6 }],
        ['e4', { zh: '这些网站只能升级，或者找发行版和长期支持厂商的补丁' }, { gap: 0.4 }],
        ['e6', { zh: '改配置只能挡住一部分，官方说：更新是*唯一*安全的选择' }, { gap: 0.9 }],
        ['e6a', { zh: '出事的也不只 PHP：21 日，Node.js 也发布了安全更新' }, { gap: 0.1 }],
        ['e6b', { zh: '其中有可致远程代码执行的高危问题' }, { gap: 0.3 }],
        ['e6c', { zh: '19 日，Go 也发布了安全修复' }, { gap: 0.9 }],
        ['e7', { zh: '本片信息截至北京时间 2026 年 10 月 22 日 0 时' }, { gap: 0.3 }],
        ['e8', { zh: '事件还在发展，请以 PHP 官方公告为准' }, { gap: 0.6 }],
      ],
    },
    {
      id: 'credits', chap: null, lead: 0.4, tail: 0.6,
      cues: [
        ['credits', null, { pause: 8, credits: true }],   // 片尾名单：只上画面，不配旁白；名单取自 project.json 的 credits
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。先用 kit/tools/tts_probe.js 试，再用 asr.js 回听。
  const SAY = {
    zh: [
      [/CVE-2026-109618 和 109619/g, 'C V E 二零二六，一零九六一八，和一零九六一九'],
      [/8\.5\.12、8\.4\.27/g, '八点五点十二、八点四点二十七'],
      [/8\.3\.36 和 8\.2\.35/g, '八点三点三十六，和八点二点三十五'],
      [/2026 年 10 月 22 日 0 时/g, '二零二六年十月二十二日零时'],
      [/PHP2Shell/g, 'P H P to Shell'],
      [/PHP 5\.4/g, 'P H P 五点四'],
      [/7\.4 到 8\.1/g, '七点四到八点一'],
      [/8\.2 及以上/g, '八点二及以上'],
      [/7\.4 和 5\.6，甚至还有 5\.3/g, '七点四和五点六，甚至还有五点三'],
      [/7 和 5/g, '七和五'],
      [/PHP 5，/g, 'P H P 五，'],
      [/It works!/g, 'it works'],
      [/Node\.js/g, 'Node J S'],
      [/510 万个 IP/g, '五百一十万个 I P'],
      [/PHP/g, 'P H P'],
      [/RCE/g, 'R C E'],
      [/DigiD/g, 'Digi D'],
      [/watchTowr/g, 'watch tower'],
      [/VirusTotal/g, 'Virus Total'],
      [/Shadowverse: Worlds Beyond/g, 'Shadowverse Worlds Beyond'],
      [/9\.2/g, '九点二'],
      [/69%/g, '百分之六十九'],
    ],
    en: [],
  };
  const strip = (s) => s.replace(/\*/g, '');
  const ttsNorm = (s) => { for (const [re, to] of SAY[LANG] || []) s = s.replace(re, to); return s; };
  const SCRIPT = RAW.map((sc) => ({
    ...sc, chap: sc.chap ? [sc.chap[0], pick(sc.chap[1])] : null,
    cues: sc.cues.map(([id, cap, o = {}]) => [id, pick(cap), { ...o, tts: pick(o.tts), gap: pick(o.gap) }]),
  }));
  const ttsText = (c) => (c[2] && c[2].tts) || ttsNorm(strip(c[1]) + (LANG === 'zh' ? '。' : ''));

  // 没有实测时长时的估算（合成旁白之前的占位）
  const estimate = (text) => (LANG === 'zh' ? 0.35 + text.replace(/[，。：；、\s]/g, '').length / 5.2 : 0.3 + text.split(/\s+/).length / 2.7);

  // 由脚本与实测时长算出整条时间线；浏览器端排动画、Node 端混音与检查都用它
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
