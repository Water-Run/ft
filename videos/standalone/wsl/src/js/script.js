// 旁白脚本：每个 cue = [句号, 字幕, {tts, gap, pause}]
// - 多语言时字幕写成 { zh: '…', en: '…' }；只有一种语言时直接写字符串。tts、gap、章节标题同理
// - 字幕里 *词* 表示强调；tts 缺省时由字幕按 SAY 表换成读法（字幕写正式拼写，读法只放在 SAY 表或 tts 字段）
// - gap：该句结束到下一句开始的停顿（秒，缺省 0.3）；pause：无旁白的纯画面停顿（标题、转场）
// - 每章一个 scene：chap [编号, 标题]（null 表示没有章节卡）、lead 章节卡时长、tail 章末留白
// 语言：浏览器取 ?lang=，Node 取环境变量 VLANG；缺省为 zh。浏览器与 Node 共用本文件（工具读它排时间线）。
// 翻译以中文为底本：先定中文，再译其他语言；各语言的句号一一对应，时间轴各自排布。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);            // 画面里的文字：tr('中文', 'English')

  const RAW = [
    {
      // 开场：两个数字的矛盾 → 片名 → 方法（同一份根文件系统，同一个问题，问三次）
      id: 'open', chap: null, lead: 0.6, tail: 0.5,
      cues: [
        ['o1', { zh: '2026 年 6 月 23 日，WSL 的产品经理发了一条帖子', en: 'On June 23, 2026, the product manager for WSL posted a note.' }, { gap: 0.3 }],
        ['o2', { zh: '原话是：*没有 WSL 3 这种东西*', en: 'It said: *there is no such thing as WSL 3*.' }, { gap: 0.7 }],
        ['o3', { zh: '三个月后的 9 月 29 日，WSL *3.0.1* 发布', en: 'Three months later, on September 29, WSL *3.0.1* was released.' }, { gap: 0.6 }],
        ['o4', { zh: '这台机器装的是 3.0.2：版本号的第一位是 *3*', en: 'This machine runs 3.0.2. The version starts with a *3*.' }, { gap: 0.4 }],
        ['o5', { zh: '列出发行版，VERSION 一栏却仍然是 *2*', en: 'List the distributions: the VERSION column still says *2*.' }, { gap: 0.4 }],
        ['o6', { zh: '把默认版本改成 3，回答是：*无法解析版本号*', en: 'Set the default version to 3, and it *cannot be parsed*.' }, { gap: 0.7 }],
        ['o7', { zh: '两个数字都没有错，它们数的不是同一样东西', en: 'Neither number is wrong. They count different things.' }, { gap: 0.5 }],
        ['oT', null, { pause: 3.2 }],
        ['o8', { zh: '方法很简单：同一份 Alpine Linux 的根文件系统', en: 'The method is simple: one Alpine Linux root filesystem,' }, { gap: 0.25 }],
        ['o9', { zh: '用三种方式运行，每次问同一个问题：*内核是哪个版本*', en: 'run three ways, and asked each time: *which kernel is this?*' }, { gap: 0.4 }],
      ],
    },
    {
      // WSL 1（2016）：把 Linux 系统调用翻译成 Windows 内核的调用
      id: 'one', chap: ['01', { zh: 'WSL 1：翻译', en: 'WSL 1: translation' }], lead: 2.3, tail: 0.5,
      cues: [
        ['a1', { zh: '2016 年 3 月 30 日，微软公布了一项新功能', en: 'On March 30, 2016, Microsoft announced a new feature:' }, { gap: 0.25 }],
        ['a2', { zh: '名叫 Bash on Ubuntu on Windows', en: 'Bash on Ubuntu on Windows.' }, { gap: 0.4 }],
        ['a3', { zh: '支撑它的新设施，就是 Windows Subsystem for Linux', en: 'Underneath it was the Windows Subsystem for Linux.' }, { gap: 0.6 }],
        ['a4', { zh: '它里面*没有 Linux 内核*', en: 'It contained *no Linux kernel*.' }, { gap: 0.5 }],
        ['a5', { zh: 'Linux 程序发出的系统调用，由两个内核驱动接住', en: 'Two Windows kernel drivers caught each Linux system call' }, { gap: 0.25 }],
        ['a6', { zh: '再*翻译*成 Windows 内核自己的调用', en: 'and *translated* it into calls on the Windows kernel.' }, { gap: 0.4 }],
        ['a7', { zh: '程序本身不用修改', en: 'The programs themselves ran unmodified.' }, { gap: 0.9 }],
        ['a8', { zh: '把那份 Alpine 按版本 1 导入，问它内核版本', en: 'Import that Alpine as version 1 and ask for the kernel.' }, { gap: 0.4 }],
        ['a9', { zh: '回答是 4.4.0，后面跟着 26100 和 Microsoft', en: 'The answer: 4.4.0, followed by 26100 and Microsoft.' }, { gap: 0.5 }],
        ['a10', { zh: '26100，是这台机器上 *Windows 内核*的版本号', en: '26100 is the build of this machine\'s *Windows kernel*.' }, { gap: 0.4 }],
        ['a11', { zh: '回答问题的是 Windows 的驱动，不是 Linux 内核', en: 'A Windows driver answered. No Linux kernel was there.' }, { gap: 0.9 }],
        ['a12', { zh: '翻译要一个调用一个调用地实现，总有没实现的', en: 'Translation is written call by call, and some are missing.' }, { gap: 0.4 }],
        ['a13', { zh: '读取内核日志，得到的是：*功能未实现*', en: 'Read the kernel log, and it says: *function not implemented*.' }, { gap: 0.4 }],
        ['a14', { zh: '容器依赖的用户命名空间和 cgroup，也都没有', en: 'User namespaces and cgroups, which containers need, are absent.' }, { gap: 0.8 }],
        ['a15', { zh: '它的文件，是 Windows 文件系统里一个个普通文件', en: 'Its files are ordinary files on the Windows filesystem.' }, { gap: 0.4 }],
        ['a16', { zh: '解压一个 1489 个文件的源码包，用了 *2.5 秒*', en: 'Unpacking a source archive of 1489 files took *2.5 seconds*.' }, { gap: 0.4 }],
      ],
    },
    {
      // WSL 2（2019）：虚拟机里的真内核；代价在跨系统的文件访问
      id: 'two', chap: ['02', { zh: 'WSL 2：真内核', en: 'WSL 2: a real kernel' }], lead: 2.3, tail: 0.5,
      cues: [
        ['b1', { zh: '2019 年 5 月 6 日，微软公布 WSL 2', en: 'On May 6, 2019, Microsoft announced WSL 2.' }, { gap: 0.4 }],
        ['b2', { zh: '做法反过来：不再翻译，直接带上*真正的 Linux 内核*', en: 'It reversed the approach: no translation, a *real Linux kernel*.' }, { gap: 0.4 }],
        ['b3', { zh: '内核跑在一台轻量级的*虚拟机*里', en: 'The kernel runs inside a lightweight *virtual machine*.' }, { gap: 0.4 }],
        ['b4', { zh: '2020 年 5 月，它随 Windows 10 的 2004 版正式提供', en: 'In May 2020 it shipped with Windows 10, version 2004.' }, { gap: 0.9 }],
        ['b5', { zh: '同一份 Alpine，按版本 2 导入，问同一个问题', en: 'The same Alpine, imported as version 2, the same question.' }, { gap: 0.4 }],
        ['b6', { zh: '这一次是 6.18，结尾写着 *WSL2*', en: 'This time it is 6.18, and the name ends in *WSL2*.' }, { gap: 0.5 }],
        ['b7', { zh: '内核日志读得到了，命名空间和 cgroup 也都在', en: 'The kernel log is there. So are namespaces and cgroups.' }, { gap: 0.6 }],
        ['b8', { zh: '根文件系统变成了一个 ext4 格式的虚拟磁盘文件', en: 'The root filesystem became one ext4 virtual disk file.' }, { gap: 0.4 }],
        ['b9', { zh: '同样解压那个源码包：*0.34 秒*，约为原来的七分之一', en: 'Unpacking the same archive: *0.34 seconds*, about a seventh.' }, { gap: 0.9 }],
        ['b10', { zh: '代价在边界上：访问 Windows 的盘，要经过 9P 文件协议', en: 'The cost is at the border: Windows drives go through 9P.' }, { gap: 0.4 }],
        ['b11', { zh: '把同一个包解到 C 盘，版本 1 用了 7.8 秒', en: 'Unpack the same archive onto C: version 1 took 7.8 seconds.' }, { gap: 0.3 }],
        ['b12', { zh: '版本 2 用了 *88 秒*', en: 'Version 2 took *88 seconds*.' }, { gap: 0.8 }],
        ['b13', { zh: '版本 1 至今保留着，两种发行版可以并存', en: 'Version 1 is still supported. The two kinds run side by side.' }, { gap: 0.4 }],
      ],
    },
    {
      // 两套版本号：架构的代号（1、2）与软件包的版本号（0.47.1 → 1.0.0 → 2.0.0 → 3.0.1）
      id: 'num', chap: ['03', { zh: '两套版本号', en: 'Two version numbers' }], lead: 2.3, tail: 0.5,
      cues: [
        ['v1', { zh: '到这里，1 和 2 说的都是*架构*：发行版运行在哪一种上面', en: 'So far, 1 and 2 name an *architecture* a distribution runs on.' }, { gap: 0.6 }],
        ['v2', { zh: '2021 年，WSL 从 Windows 里分离出来，单独发布', en: 'In 2021, WSL was split from Windows and shipped on its own.' }, { gap: 0.4 }],
        ['v3', { zh: '它从此有了自己的*软件版本号*，第一个是 0.47.1', en: 'It gained a *package version* of its own, starting at 0.47.1.' }, { gap: 0.5 }],
        ['v4', { zh: '2022 年 11 月，软件包升到 1.0.0', en: 'In November 2022, the package reached 1.0.0.' }, { gap: 0.4 }],
        ['v5', { zh: '那时装的是 1.0.0，跑的是 WSL 2', en: 'What was installed was 1.0.0. What it ran was WSL 2.' }, { gap: 0.6 }],
        ['v6', { zh: '2023 年 9 月是 2.0.0；2025 年 5 月，源代码公开', en: 'September 2023 brought 2.0.0. In May 2025 it went open source.' }, { gap: 0.6 }],
        ['v7', { zh: '两条线画在同一根时间轴上：一条停在 2，一条还在往上走', en: 'On one timeline: one line stops at 2, the other keeps climbing.' }, { gap: 0.5 }],
      ],
    },
    {
      // 「WSL 3」（2026）：3.0 与 WSL 容器。重头：它是怎样搭起来的
      id: 'three', chap: ['04', { zh: '「WSL 3」：容器', en: '“WSL 3”: containers' }], lead: 2.3, tail: 0.5,
      cues: [
        ['c1', { zh: '2026 年 6 月，微软公布 WSL 容器，缩写 WSLc', en: 'In June 2026 came WSL containers, or WSLc.' }, { gap: 0.4 }],
        ['c2', { zh: '有的报道把它写成了 WSL 3，于是有了开头那条帖子', en: 'Some reports called it WSL 3, which prompted that note.' }, { gap: 0.6 }],
        ['c3', { zh: '9 月 29 日它正式可用，这个版本的编号是 *3.0.1*', en: 'On September 29 it became generally available, as *3.0.1*.' }, { gap: 0.4 }],
        ['c4', { zh: '官方的发布文章里，没有出现过 WSL 3 这个词', en: 'The official announcement never uses the words WSL 3.' }, { gap: 0.9 }],
        ['c5', { zh: '新增一个命令 wslc：在 Windows 上直接运行 Linux 容器', en: 'It adds a command, wslc, to run Linux containers on Windows.' }, { gap: 0.6 }],
        ['c6', { zh: '第三次：同一份 Alpine 导入成映像，在容器里问内核版本', en: 'Third run: the same Alpine as an image, asked in a container.' }, { gap: 0.4 }],
        ['c7', { zh: '6.18，结尾仍然是 *WSL2*', en: '6.18 again, and the name still ends in *WSL2*.' }, { gap: 0.5 }],
        ['c8', { zh: '和上一次逐字相同：容器用的就是 WSL 2 的那个内核', en: 'Identical to the last answer: it is the WSL 2 kernel.' }, { gap: 0.9 }],
        ['c9', { zh: '但它不在任何发行版里，而是跑在*另一台虚拟机*上', en: 'But it is in no distribution. It runs in *another virtual machine*.' }, { gap: 0.5 }],
        ['c10', { zh: '系统服务 wslservice 创建这台虚拟机', en: 'The system service wslservice creates that machine,' }, { gap: 0.3 }],
        ['c11', { zh: '再交给 wslcsession：一个以当前用户身份运行的进程', en: 'then hands it to wslcsession, a process running as the user.' }, { gap: 0.5 }],
        ['c12', { zh: '这样一台虚拟机叫一个*会话*，带着自己的存储盘', en: 'One such machine is a *session*, with a storage disk of its own.' }, { gap: 0.6 }],
        ['c13', { zh: '虚拟机里面，运行着 containerd 和 dockerd', en: 'Inside the machine run containerd and dockerd.' }, { gap: 0.4 }],
        ['c14', { zh: 'wslcsession 通过套接字，用 Docker 的 HTTP 接口下指令', en: 'wslcsession drives them over a socket, using Docker\'s HTTP API.' }, { gap: 0.9 }],
        ['c15', { zh: '挂进容器的 Windows 目录不再走 9P，改用 *virtiofs*', en: 'Windows folders mounted into a container use *virtiofs*, not 9P.' }, { gap: 0.4 }],
        ['c16', { zh: '官方的说法是，大约快一倍', en: 'By the official account, it is about twice as fast.' }, { gap: 0.6 }],
        ['c17', { zh: '网络也换了：虚拟机发出的以太网帧，交给 Windows 一侧', en: 'Networking changed too: the machine\'s Ethernet frames go to Windows,' }, { gap: 0.25 }],
        ['c18', { zh: '由一个用户身份的进程转发', en: 'where a process running as the user forwards them.' }, { gap: 0.6 }],
        ['c19', { zh: '目前没有 compose，官方把它列为下一步的重点', en: 'No compose yet: it is named as the next priority.' }, { gap: 0.5 }],
      ],
    },
    {
      // 落点：两个数字各自数的是什么
      id: 'end', chap: null, lead: 1.2, tail: 0.6,
      cues: [
        ['e1', { zh: '回到开头的两个数字', en: 'Consider the two numbers again.' }, { gap: 0.4 }],
        ['e2', { zh: '1 和 2 是*架构*：翻译系统调用，或在虚拟机里运行真内核', en: '1 and 2 are *architectures*: translate calls, or run a real kernel.' }, { gap: 0.5 }],
        ['e3', { zh: '3.0 是*软件包的版本号*：在第二种架构上，加了容器', en: '3.0 is a *package version*: the second architecture, plus containers.' }, { gap: 0.6 }],
        ['e4', { zh: '3.0.1 的源码里，校验发行版版本的那行，只接受 1 和 2', en: 'In the 3.0.1 source, the version check accepts only 1 and 2.' }, { gap: 0.8 }],
        ['e5', { zh: '所以「没有 WSL 3」和「WSL 3.0 发布了」，同时成立', en: 'So “there is no WSL 3” and “WSL 3.0 is out” are both true.' }, { gap: 0.6 }],
        ['e6', { zh: '版本号的第一位已经是 3；内核的名字，结尾还是 WSL2', en: 'The version starts with 3. The kernel\'s name still ends in WSL2.' }, { gap: 0.6 }],
      ],
    },
    {
      // 片尾名单：策划、参与模型与分工、开源视频的仓库地址
      id: 'outro', chap: null, lead: 0.6, tail: 0,
      cues: [
        ['z1', null, { pause: 7.4 }],
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。先用 kit/tools/tts_probe.js 试，再用 asr.js 回听。
  const SAY = {
    zh: [
      [/wslcsession/g, 'W S L C session'],
      [/wslservice/g, 'W S L service'],
      [/WSLc|wslc/g, 'W S L C'],
      [/WSL ?(\d)/g, 'W S L $1'],
      [/WSL/g, 'W S L'],
      [/containerd/g, 'container D'],
      [/dockerd/g, 'docker D'],
      [/virtiofs/g, 'virtio F S'],            // 读作 virt-ee-oh F S；写成 virt I O F S 会被逐字母拼读
      [/cgroup/g, 'C group'],
      [/ext4/g, 'E X T 四'],
      [/9P/g, '九 P'],
      [/26100/g, '二六一零零'],
      [/2004 版/g, '二零零四版'],
      [/3\.0\.2/g, '三点零点二'],
      [/3\.0\.1/g, '三点零点一'],
      [/0\.47\.1/g, '零点四七点一'],
      [/1\.0\.0/g, '一点零点零'],
      [/2\.0\.0/g, '二点零点零'],
      [/4\.4\.0/g, '四点四点零'],
      [/3\.0/g, '三点零'],
      [/6\.18/g, '六点一八'],
      [/VERSION/g, 'version'],
    ],
    en: [
      [/wslcsession/g, 'W S L C session'],
      [/wslservice/g, 'W S L service'],
      [/\bWSLc\b|\bwslc\b/g, 'W S L C'],
      [/\bWSL ?(\d)/g, 'W S L $1'],
      [/\bWSL\b/g, 'W S L'],
      [/containerd/g, 'container D'],
      [/dockerd/g, 'docker D'],
      [/virtiofs/g, 'virtio F S'],
      [/\bcgroups\b/g, 'C groups'],
      [/\bext4\b/g, 'E X T 4'],
      [/\b9P\b/g, 'nine P'],
      [/\b26100\b/g, 'two six one zero zero'],
      [/version 2004/g, 'version twenty oh four'],
      [/3\.0\.2/g, 'three point oh point two'],
      [/3\.0\.1/g, 'three point oh point one'],
      [/0\.47\.1/g, 'zero point four seven point one'],
      [/1\.0\.0/g, 'one point oh point oh'],
      [/2\.0\.0/g, 'two point oh point oh'],
      [/4\.4\.0/g, 'four point four point zero'],
      [/\b3\.0\b/g, 'three point oh'],
      [/\b6\.18\b/g, 'six point eighteen'],
      [/\bVERSION\b/g, 'version'],
      [/\bC:/g, 'C,'],
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
