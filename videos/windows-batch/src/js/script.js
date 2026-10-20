// 旁白脚本：每个 cue = [id, 字幕, {tts, gap, pause}]
// - 字幕里 *词* 表示强调色；tts 缺省时取字幕去掉标记后的文本
// - gap: 该句结束到下一句开始的停顿（秒），pause: 无旁白的纯画面停顿
// 浏览器与 Node 共用（tools/ 下的 TTS 与混音脚本读取同一份）
(function (root) {
  const SCRIPT = [
    {
      id: 'open', chap: null, lead: 0.6, tail: 0.3,
      cues: [
        ['o1', '在 Windows 11 上，新建一个文本文件', { tts: '在 Windows 十一上，新建一个文本文件。' }],
        ['o2', '写一行命令，把扩展名改成 *.bat*', { tts: '写一行命令，把扩展名改成点 bat。' }],
        ['o3', '双击，它就会运行', { gap: 0.6 }],
        ['o4', '这种文件，*1981 年*就已经存在'],
        ['o5', '比 Windows 的第一个版本，还早四年', { gap: 0.4 }],
        ['oT', null, { pause: 2.8 }],
      ],
    },
    {
      id: 's1', chap: ['01', '来历'], lead: 1.4, tail: 0.5,
      cues: [
        ['a1', '1981 年 8 月，IBM 发布了 IBM PC'],
        ['a2', '随机的操作系统是 *PC DOS 1.0*', { tts: '随机的操作系统是 PC DOS 一点零。' }],
        ['a3', '它的命令解释器，叫 *COMMAND.COM*', { tts: '它的命令解释器，叫 command 点 com。', gap: 0.5 }],
        ['a4', '把要敲的命令逐行写进文本文件，扩展名用 .BAT', { tts: '把要敲的命令逐行写进文本文件，扩展名用点 bat。' }],
        ['a5', '解释器替人一条一条地执行：这就是*批处理*', { gap: 0.5 }],
        ['a6', '那时为它准备的命令只有两条：注释 REM，暂停 PAUSE', { tts: '那时为它准备的命令只有两条：注释 rem，暂停 pause。' }],
        ['a7', '条件判断和循环，要到 1983 年的 DOS 2.0 才有', { tts: '条件判断和循环，要到一九八三年的 DOS 二点零才有。' }],
      ],
    },
    {
      id: 's2', chap: ['02', '回显'], lead: 1.4, tail: 0.5,
      cues: [
        ['b1', '这段来历，今天的 cmd.exe 里仍然看得见', { tts: '这段来历，今天的 CMD 点 EXE 里仍然看得见。' }],
        ['b2', '第一处：每条命令执行之前，会先被*显示一遍*', { gap: 0.5 }],
        ['b3', '早期 DOS 每读入一行，就原样打到屏幕上'],
        ['b4', '因为它做的事，本来就是替人敲命令', { gap: 0.5 }],
        ['b5', '所以批处理的第一行，常常是 *@echo off*', { tts: '所以批处理的第一行，常常是艾特 echo off。' }],
      ],
    },
    {
      id: 's3', chap: ['03', '逐行读盘'], lead: 1.4, tail: 0.5,
      cues: [
        ['c1', '第二处：脚本不会被整个读进内存'],
        ['c2', '早期 DOS 每执行一条命令，都重新打开文件读下一行', { gap: 0.4 }],
        ['c3', '文件打不开时，它会提示：*插入带有批处理文件的磁盘*'],
        ['c4', '因为那张软盘，可能已经被换掉了', { gap: 0.6 }],
        ['c5', '今天的 cmd.exe 仍然执行一条、读一条', { tts: '今天的 CMD 点 EXE 仍然执行一条、读一条。' }],
        ['c6', '这个脚本在运行途中，给自己追加了一行'],
        ['c7', '追加的这一行，随后也被执行了'],
      ],
    },
    {
      id: 's4', chap: ['04', '读入即替换'], lead: 1.4, tail: 0.5,
      cues: [
        ['d1', '第三处：百分号变量，在语句读入时就被换成了值'],
        ['d2', '括号里的整个代码块，算作一条语句', { gap: 0.5 }],
        ['d3', '块里先把 n 改成 2 再输出，得到的却是 *1*', { tts: '块里先把 N 改成二再输出，得到的却是一。', gap: 0.5 }],
        ['d4', '因为读入这个块的时候，n 还是 1', { tts: '因为读入这个块的时候，N 还是一。', gap: 0.6 }],
        ['d5', 'Windows 2000 加入延迟展开，变量改用*感叹号*', { tts: 'Windows 两千加入延迟展开，变量改用感叹号。' }],
        ['d6', '但它默认关闭，旧脚本的行为保持不变'],
      ],
    },
    {
      id: 's5', chap: ['05', '今天'], lead: 1.4, tail: 0.5,
      cues: [
        ['e1', '1993 年，Windows NT 带来了 *cmd.exe*', { tts: '一九九三年，Windows NT 带来了 CMD 点 EXE。' }],
        ['e2', '2006 年，PowerShell 发布'],
        ['e3', '批处理并没有被它取代', { gap: 0.5 }],
        ['e4', '这台 Windows 11 开发机上，有 *3164* 个批处理文件', { tts: '这台 Windows 十一开发机上，有三千一百六十四个批处理文件。' }],
        ['e5', '其中近六成，是 npm 为命令行工具生成的入口', { tts: '其中近六成，是 NPM 为命令行工具生成的入口。', gap: 0.5 }],
        ['e6', '旧系统也还在：中国约 4% 的桌面 Windows 是 *Windows 7*', { tts: '旧系统也还在：中国约百分之四的桌面 Windows 是 Windows 七。' }],
        ['e7', '同一个脚本，在 2008 年的系统上，输出完全相同', { tts: '同一个脚本，在二零零八年的系统上，输出完全相同。' }],
        ['e8', '而那台机器上的 PowerShell，还是 1.0 版', { tts: '而那台机器上的 PowerShell，还是一点零版。', gap: 0.5 }],
        ['e9', '2017 年微软说明：cmd *不会*从 Windows 中移除', { tts: '二零一七年微软说明：CMD 不会从 Windows 中移除。' }],
        ['e10', '构建和测试 Windows 的系统，本身就是大量 cmd 脚本', { tts: '构建和测试 Windows 的系统，本身就是大量 CMD 脚本。' }],
      ],
    },
    {
      id: 'end', chap: null, lead: 0.8, tail: 0.2,
      cues: [
        ['f1', '四十五年过去'],
        ['f2', '一种为软盘时代设计的脚本'],
        ['f3', '仍然能在最新的 Windows 上双击运行', { gap: 0.4 }],
        ['fT', null, { pause: 3.2 }],
      ],
    },
  ];

  const strip = (s) => s.replace(/\*/g, '');
  // 语音合成会把多音字「行」（háng：一行、逐行）在不少位置读成 xíng。送去合成的文本里，
  // 除「执行」「进行」「运行」「行为」（xíng）外一律换成只有 háng 一读的「航」；字幕与画面仍用「行」。
  const ttsNorm = (s) => s.replace(/(执|进|运)行/g, '$1\u0000').replace(/行为/g, '\u0000为').replace(/行/g, '航').replace(/\u0000/g, '行');
  const ttsText = (c) => ttsNorm((c[2] && c[2].tts) || (strip(c[1]) + '。'));

  // 没有真实音频时长时的估算（开发期占位）
  const estimate = (text) => 0.35 + strip(text).replace(/[，。：；、\s]/g, '').length / 5.2;

  // 由脚本与实测时长计算整条时间线；浏览器端排动画、Node 端混音都用它
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

  const api = { SCRIPT, layoutScript, ttsText, ttsNorm, strip };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else Object.assign(root, api);
})(typeof window !== 'undefined' ? window : globalThis);
