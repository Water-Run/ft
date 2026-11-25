/* SPDX-License-Identifier: GPL-3.0-or-later */
// 场景按整秒定点，字幕与读法共用这份稿。未配音时使用系列的字数估算。
(function (root) {
  const TOTAL = 192;
  const LANG = 'zh';
  const pick = (value) => value;
  const tr = (zh) => zh;
  const SCRIPT = [
    {
      id: 'open', at: 0, chap: null, lead: 0.5, tail: 0.35,
      cues: [
        ['o1', 'Windows 里开个 Linux，叫虚拟机。'],
        ['o2', '跑 Java 程序的 JVM，也叫虚拟机。'],
        ['o3', '它们是一回事吗？', { gap: 0.45 }],
        ['title', null, { pause: 3.5, gap: 0.35 }],
        ['o4', 'Linux 这样的操作系统，要直接管处理器、内存和磁盘。'],
        ['o5', '一台电脑只有一套硬件，两套系统怎么都管？'],
        ['o6', '办法是用软件造一台虚拟的电脑，让 Linux 在上面运行。'],
        ['o7', '在虚拟电脑上运行的系统，叫*客体系统*。'],
        ['o8', '这台虚拟的电脑，就叫*系统虚拟机*。', { gap: 0.6 }],
      ],
    },
    {
      id: 'type1', at: 37.25, chap: null, lead: 0.55, tail: 0.35,
      cues: [
        ['x1', '真实的硬件，由一层*虚拟机监控器*来分配。'],
        ['x2', '客体以为自己直接管着硬件，其实监控器在背后接手。'],
        ['x3', '按监控器放在哪一层，分成两类。先看 Xen。', { gap: 0.5 }],
        ['x4', '开机后，Xen 直接在硬件上启动，'],
        ['x5', '把处理器和内存分给各台虚拟机。'],
        ['x6', 'Xen 随后启动一套负责管理的 Linux，'],
        ['x7', '连它也是 Xen 上的一台虚拟机。'],
        ['x8', '监控器直接在硬件上，这叫*第一类*，也叫裸机型。', { gap: 0.5 }],
      ],
    },
    {
      id: 'type2', at: 70.25, chap: null, lead: 0.55, tail: 0.35,
      cues: [
        ['v1', '回到开头那台电脑，开机先启动 Windows。'],
        ['v2', 'VirtualBox 像普通软件一样装在上面。'],
        ['v3', '这套 Windows，叫*宿主系统*。'],
        ['v4', '比如客体往自己的磁盘写一份数据，'],
        ['v5', 'VirtualBox 把它写进 Windows 上的一个文件。'],
        ['v6', '客体看到一块盘，Windows 只看到一个文件。'],
        ['v7', '监控器装在宿主系统上，借它干活，', { gap: 0.2 }],
        ['v8', '这叫*第二类*，也叫宿主型。', { gap: 0.6 }],
      ],
    },
    {
      id: 'process', at: 104, chap: null, lead: 0.55, tail: 0.35,
      cues: [
        ['j1', '那 JVM 也要启动一整套操作系统吗？'],
        ['j2', '不用。JVM 只是操作系统上的一个程序，'],
        ['j3', '随 Java 程序启动，也随它结束。', { gap: 0.5 }],
        ['j4', 'Java 源码会编译成*字节码*：'],
        ['j5', '写给 JVM 的指令，不针对哪款真实处理器。'],
        ['j6', '比如程序调用加法方法，传入二和三。'],
        ['j7', '头两条指令，把二和三依次叠进一个栈。'],
        ['j8', '加法指令取出这两个数，把五放回去。'],
        ['j9', '最后一条把五返回，程序把它打印出来。', { gap: 0.5 }],
        ['j10', '这些指令，JVM 可以逐条照做，也可以先译成处理器指令。'],
        ['j11', '同一份字节码，能交给不同平台上兼容的 JVM 去跑。'],
        ['j12', '只给一个程序提供执行环境的，叫*进程虚拟机*。'],
      ],
    },
    {
      id: 'compare', at: 152.75, chap: null, lead: 0.55, tail: 0.35,
      cues: [
        ['c1', '所以两者不是一回事：'],
        ['c2', '系统虚拟机给操作系统一整台电脑，'],
        ['c3', '进程虚拟机给一个程序一套执行环境。', { gap: 0.5 }],
        ['c4', '两者还能套着用：刚才的 Linux 客体里，照样能跑 JVM。', { gap: 0.6 }],
        ['c5', '分辨时先问：谁在用这台虚拟机？'],
        ['c6', '是程序，就是进程虚拟机。'],
        ['c7', '是操作系统，就是系统虚拟机；', { gap: 0.2 }],
        ['c8', '再看监控器在硬件上还是宿主上，分出第一类和第二类。', { gap: 0.6 }],
      ],
    },
    {
      id: 'outro', at: 184.5, chap: null, lead: 0.5, tail: 0,
      cues: [['z1', null, { pause: 6.5, credits: true }]],
    },
  ];

  const SAY = [
    [/VirtualBox/g, 'Virtual Box'],
    [/Xen/g, 'Zen'],
    [/JVM/g, 'J V M'],
  ];
  const strip = (text) => text.replace(/\*/g, '');
  const ttsNorm = (text) => {
    for (const [match, reading] of SAY) text = text.replace(match, reading);
    return text;
  };
  const ttsText = ([, caption, options]) => options?.tts || ttsNorm(strip(caption));
  const estimate = (text) => 0.35 + text.replace(/[，。？！：、\s]/g, '').length / 5.2;

  function layoutScript(DUR = {}) {
    let time = 0;
    const cues = {}, scenes = [], order = [], problems = [];
    const pinTo = (at, target) => {
      const last = scenes.at(-1);
      if (time > at + 1e-6) {
        problems.push(`场景 ${last.id} 的旁白超出${target} ${(time - at).toFixed(2)} 秒`);
        return;
      }
      last.slack = +(at - time).toFixed(3);
      time = at;
      last.end = time;
    };
    for (const scene of SCRIPT) {
      if (scenes.length) pinTo(scene.at, `下一场 ${scene.id} 的定点`);
      const start = time;
      time += scene.lead;
      const first = time;
      for (const cue of scene.cues) {
        const [id, cap, options = {}] = cue;
        const measured = DUR[id];
        const silent = options.pause != null;
        const tts = silent ? null : ttsText(cue);
        const d = options.pause ?? measured?.d ?? estimate(tts);
        cues[id] = { id, scene: scene.id, cap, start: time, end: time + d, d, silent, tts, words: measured?.words ?? null };
        order.push(id);
        time += d + (options.gap ?? 0.3);
      }
      time += scene.tail;
      scenes.push({ id: scene.id, chap: scene.chap, start, first, end: time, lead: scene.lead, slack: 0 });
    }
    pinTo(TOTAL, '全片时长');
    return { cues, scenes, order, total: time, problems };
  }

  const api = { SCRIPT, LANG, pick, tr, layoutScript, ttsText, ttsNorm, strip, TOTAL };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { Object.assign(root, api); root.DUR = (root.DUR_ALL || {})[LANG] || {}; }
})(typeof window !== 'undefined' ? window : globalThis);
