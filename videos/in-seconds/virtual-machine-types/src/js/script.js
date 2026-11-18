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
        ['o1', '一台电脑，怎么同时开两套系统？', { gap: 0.45 }],
        ['title', null, { pause: 3.5, gap: 0.35 }],
        ['o2', '从操作系统的角度看。'],
        ['o3', '它要用处理器计算，用内存放数据。'],
        ['o4', '它还得读写磁盘，才能存文件。'],
        ['o5', '软件可以为它提供一套虚拟的处理器、内存和磁盘。'],
        ['o6', '在虚拟硬件上启动的操作系统，叫*客体系统*。'],
        ['o7', '这种提供整机环境的，叫*系统虚拟机*。'],
      ],
    },
    {
      id: 'type1', at: 31, chap: null, lead: 0.55, tail: 0.35,
      cues: [
        ['x1', '真实的硬件怎么分给这两套系统？'],
        ['x2', '靠中间这层*虚拟机监控器*。'],
        ['x3', '用 Xen 举例。机器开机后，Xen 直接运行在硬件上。'],
        ['x4', '它给不同的虚拟机安排处理器时间、分配内存。'],
        ['x5', '典型的 Xen 还会先启动一个*管理域*。'],
        ['x6', '它负责管理客体和设备，也跑在 Xen 上。'],
        ['x7', '监控器直接管硬件，这种架构叫*第一类*，也叫裸机型。', { gap: 0.5 }],
      ],
    },
    {
      id: 'type2', at: 65, chap: null, lead: 0.55, tail: 0.35,
      cues: [
        ['v1', '另一台电脑先启动 Windows。'],
        ['v2', '打开 VirtualBox，启动一套 Linux。'],
        ['v3', '外面的 Windows 叫*宿主系统*。'],
        ['v4', '假设客体要往自己的磁盘写数据。'],
        ['v5', '这次写入被转到宿主的*磁盘镜像*文件。'],
        ['v6', '客体看到一块盘，宿主管理一个文件。'],
        ['v7', '监控器依托宿主，这叫*第二类*，也叫宿主型。'],
      ],
    },
    {
      id: 'process', at: 100, chap: null, lead: 0.55, tail: 0.35,
      cues: [
        ['j1', '那 Java 虚拟机也要启动一套操作系统吗？', { gap: 0.65 }],
        ['j2', 'Java 虚拟机简称 JVM，由现成的操作系统启动。'],
        ['j3', 'Java 源码编译成类文件，里面是 JVM 要执行的*字节码*。'],
        ['j4', '来看这个加法方法。'],
        ['j5', '头两条指令，依次把二和三放进*操作数栈*。'],
        ['j6', '加法指令取走这两个数，再把结果五放回去。'],
        ['j7', '最后一条指令把五返回给调用方，程序打印五。'],
        ['j8', '实现可以逐条解释，也可以编译成机器指令。'],
        ['j9', '同一份类文件，能交给不同平台上兼容的 JVM。'],
        ['j10', '这种为程序提供执行环境的，叫*进程虚拟机*。'],
      ],
    },
    {
      id: 'compare', at: 145, chap: null, lead: 0.55, tail: 0.35,
      cues: [
        ['c1', '两种架构给 Linux 的，都是一套虚拟硬件。'],
        ['c2', '第一类和第二类，分的是监控器的位置。'],
        ['c3', '第二类也可以用处理器的虚拟化功能。'],
        ['c4', '进程虚拟机给程序提供执行环境。'],
        ['c5', '系统虚拟机和进程虚拟机可以套着用。'],
        ['c6', '刚才那个客体里，就能启动 JVM 来算这道加法。'],
        ['c7', '所以先问，谁在使用这台机器？'],
        ['c8', '如果是操作系统，再看监控器在硬件上，还是在宿主系统上。', { gap: 0.5 }],
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
