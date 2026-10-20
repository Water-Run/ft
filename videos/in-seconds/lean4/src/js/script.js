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
// 本片 200 秒：六个正片场景各 32 秒（120 拍/分下正好 16 小节），片尾名单 8 秒。右上角每秒把 n 加一，全片从 1 试到 200。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);            // 画面里的文字：tr('中文', 'English')

  const TOTAL = 200;
  const RAW = [
    {
      // 现象：前 n 个奇数的和是 n²，试到一百万都对，但试不完 → 片名 → 证明是什么、历来由谁核对 → 开普勒猜想（1998）
      id: 'open', at: 0, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['o1', { zh: '1 + 3 + 5 + 7：前 n 个奇数的和，总是 n 的平方', en: '1 + 3 + 5 + 7: the first n odd numbers sum to n squared.' },
          { tts: { zh: '一，加三，加五，加七：前 n 个奇数的和，总是 n 的平方。', en: 'One plus three plus five plus seven: the first n odd numbers sum to n squared.' }, gap: 0.35 }],
        ['o2', { zh: '试到一百万，没有一次例外', en: 'Tested up to one million, it never fails.' }, { gap: 0.4 }],
        ['o3', { zh: '但这还不是*证明*：n 有无穷多个', en: 'That is still not a *proof*: there are infinitely many n.' }, { gap: 0.3 }],
        ['oT', null, { pause: 2.0 }],
        ['o4', { zh: '证明，是一串可以逐步核对的推理', en: 'A proof is an argument, checkable step by step.' }, { gap: 0.3 }],
        ['o5', { zh: '核对它的，一向是人', en: 'People have always done the checking.' }, { gap: 0.5 }],
        ['k1', { zh: '1998 年，开普勒猜想有了一份证明', en: 'In 1998, the Kepler conjecture got a proof:' }, { gap: 0.25 }],
        ['k1b', { zh: '300 页，外加约四万行程序', en: '300 pages, plus about 40,000 lines of code.' },
          { tts: { zh: '三百页，外加约四万航程序。', en: 'Three hundred pages, plus about forty thousand lines of code.' }, gap: 0.3 }],
        ['k2', { zh: '审稿人最终没能确认它完全正确', en: 'In the end, the referees could not certify it.' }, { gap: 0.3 }],
      ],
    },
    {
      // 形式化证明是什么 → 1968 Automath → 2014 开普勒猜想通过机器检查 → Lean（2013）与 Lean 4（2023）→ 开头的命题写成 Lean
      id: 'formal', at: 32, chap: null, lead: 0.75, tail: 0.3,
      cues: [
        ['f1', { zh: '*形式化证明*：把每一步都写成式子，交给程序检查', en: 'A *formal proof* writes every step as a formula for a program to check.' }, { gap: 0.4 }],
        ['f2', { zh: '1968 年提出的 Automath，让计算机开始核对证明', en: 'Automath, conceived in 1968, set computers to checking proofs.' }, { gap: 0.3 }],
        ['f3', { zh: '2014 年，开普勒猜想的证明全部通过了机器检查', en: 'In 2014, the Kepler proof passed machine checking in full.' }, { gap: 0.45 }],
        ['f4', { zh: 'Lean 是做这件事的工具之一，2013 年始于微软研究院', en: 'Lean is one such tool, begun at Microsoft Research in 2013.' }, { gap: 0.3 }],
        ['f5', { zh: '2023 年发布的 Lean 4，既是证明助手，也是编程语言', en: 'Lean 4, released in 2023, is a proof assistant and a programming language.' }, { gap: 0.45 }],
        ['f6', { zh: '开头的那个命题，写成 Lean 是这样', en: 'Here is the opening claim, written in Lean.' }, { gap: 0.3 }],
      ],
    },
    {
      // 命题即类型，证明即值，检查证明即检查类型 → 归纳法：先证 0，再证 k ⇒ k + 1（多出的一圈是 2k + 1）→ 两步覆盖无穷多个 n
      id: 'types', at: 64, chap: null, lead: 0.75, tail: 0.3,
      cues: [
        ['t1', { zh: '在 Lean 里，一条命题就是一个*类型*', en: 'In Lean, a proposition is a *type*.' }, { gap: 0.3 }],
        ['t2', { zh: '它的证明，是这个类型的一个*值*', en: 'A proof is a *value* belonging to that type.' }, { gap: 0.3 }],
        ['t3', { zh: '所以检查证明，就是检查类型', en: 'Checking a proof therefore means type checking.' }, { gap: 0.6 }],
        ['t4', { zh: '要对所有 n 成立，用归纳法：先证 n 等于 0', en: 'To cover every n, use induction: first, n equals zero.' }, { gap: 0.35 }],
        ['t5', { zh: '再证：对 k 成立，就对 k + 1 成立', en: 'Then: if it holds for k, it holds for k + 1.' },
          { tts: { zh: '再证：对 k 成立，就对 k 加一成立。', en: 'Then: if it holds for k, it holds for k plus one.' }, gap: 0.35 }],
        ['t6', { zh: '多出的那一圈，正好是 2k + 1', en: 'The extra ring is exactly 2k + 1.' },
          { tts: { zh: '多出的那一圈，正好是二 k 加一。', en: 'The extra ring is exactly two k plus one.' }, gap: 0.5 }],
        ['t7', { zh: '两步证完，*无穷多个 n* 全部覆盖', en: 'Two steps, and *all infinitely many n* are covered.' }, { gap: 0.3 }],
      ],
    },
    {
      // 策略不是证明本身 → 证明项（3 347 个节点）→ 内核逐个节点核对类型 → 内核约八千行 → 策略、自动化、AI 都在内核之外，错了过不去 → 三者的分工
      id: 'kernel', at: 96, chap: null, lead: 0.75, tail: 0.3,
      cues: [
        ['c1', { zh: '这几行叫策略，它们还不是证明本身', en: 'These lines are tactics. They are not yet the proof.' }, { gap: 0.3 }],
        ['c2', { zh: 'Lean 按它们生成*证明项*，展开有三千多个节点', en: 'From them Lean builds a *proof term* of over three thousand nodes.' }, { gap: 1.0 }],
        ['c3', { zh: '证明项交给*内核*，内核逐个节点核对类型', en: 'The term goes to the *kernel*, which checks types node by node.' }, { gap: 1.6 }],
        ['c4', { zh: '内核的源码只有约八千行', en: 'The kernel is only about eight thousand lines of code.' },
          { tts: { zh: '内核的源码只有约八千航。', en: 'The kernel is only about eight thousand lines of code.' }, gap: 0.9 }],
        ['c5', { zh: '策略、自动化，乃至 AI，都在内核之外', en: 'Tactics, automation, even AI all sit outside the kernel.' }, { gap: 0.3 }],
        ['c6', { zh: '它们出了错，交出的证明项过不了内核', en: 'If they go wrong, the term they hand over will not pass.' }, { gap: 0.7 }],
        ['c7', { zh: '人写策略，Lean 生成证明项，内核只看证明项', en: 'People write tactics, Lean builds the term, the kernel reads only the term.' }, { gap: 0.3 }],
      ],
    },
    {
      // 跳过的地方留下记录（sorryAx）→ #print axioms → 依赖闭包 2 565 条 → 重放 66 200 条 → 独立实现 → Mathlib 29 万条定理 → 费马大定理的形式化
      id: 'trust', at: 128, chap: null, lead: 0.75, tail: 0.3,
      cues: [
        ['r1', { zh: '跳过不证的地方，会被记录在案', en: 'A skipped step is put on record.' }, { gap: 0.3 }],
        ['r2', { zh: '一条命令，列出一条定理依赖的全部公理', en: 'One command lists every axiom a theorem depends on.' }, { gap: 0.5 }],
        ['r3', { zh: '这条定理向下依赖两千五百多条声明', en: 'This theorem rests on over 2,500 declarations.' }, { gap: 0.5 }],
        ['r4', { zh: '核心库的六万多条声明，可以全部交给内核重查', en: 'All 66,000 declarations of the core library can be re-checked by the kernel.' },
          { tts: { zh: '核心库的六万多条声明，可以全部交给内核重查。', en: 'All sixty-six thousand declarations of the core library can be re-checked by the kernel.' }, gap: 0.9 }],
        ['r5', { zh: '内核还有独立写成的版本，可以互相对照', en: 'Independent kernels exist, so they can cross-check each other.' }, { gap: 0.4 }],
        ['r6', { zh: '数学库 Mathlib 里，这样检查过的定理有 29 万条', en: 'Mathlib, the math library, holds 290,000 theorems checked this way.' },
          { tts: { zh: '数学库 Math Lib 里，这样检查过的定理有二十九万条。', en: 'Math lib, the math library, holds two hundred ninety thousand theorems checked this way.' }, gap: 1.0 }],
        ['r7', { zh: '费马大定理的证明，也正在用 Lean 逐步形式化', en: "A proof of Fermat's Last Theorem is now being formalized in Lean." }, { gap: 0.3 }],
      ],
    },
    {
      // 边界：内核不判断命题是否写对 → 仍要人读 → 2024 AlphaProof → 同一个内核 → 角上只试到 200，证明对所有 n 成立 → 结论
      id: 'edge', at: 160, chap: null, lead: 0.75, tail: 0.3,
      cues: [
        ['e1', { zh: '内核不管一件事：命题本身写得对不对', en: 'One thing the kernel does not judge: whether the statement is the right one.' }, { gap: 0.3 }],
        ['e2', { zh: '命题说的是不是原意，仍然要人来读', en: 'Its intended meaning still takes a human reader.' }, { gap: 0.5 }],
        ['e3', { zh: '2024 年，AlphaProof 用 Lean 证出三道国际奥数试题', en: 'In 2024, AlphaProof proved three Olympiad problems in Lean.' }, { gap: 0.3 }],
        ['e4', { zh: '写证明的不论是人还是 AI，过的是同一个内核', en: 'Human or AI, every proof passes the same kernel.' }, { gap: 0.6 }],
        ['e5', { zh: '逐个去试，这 200 秒只试到 n 等于 200', en: 'Trying one by one, these 200 seconds only reach n = 200.' },
          { tts: { zh: '逐个去试，这两百秒只试到 n 等于两百。', en: 'Trying one by one, these two hundred seconds only reach n equals two hundred.' }, gap: 0.3 }],
        ['e6', { zh: '而那份证明，对*所有的 n* 成立', en: 'That one proof holds for *every n*.' }, { gap: 0.6 }],
        ['e7', { zh: '形式化证明，把对作者的*信任*，换成对每一步的*检查*', en: 'Formal proof replaces *trust* in the author with a *check* of every step.' }, { gap: 0.3 }],
      ],
    },
    {
      // 片尾名单：策划、参与模型与分工、开源视频的仓库地址。8 秒，不配旁白
      id: 'outro', at: 192, chap: null, lead: 0.5, tail: 0,
      cues: [
        ['z1', null, { pause: 7.0 }],
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。先用 kit/tools/tts_probe.js 试，再用 asr.js 回听。
  const SAY = {
    zh: [
      [/Lean 4/g, 'Lean 四'],
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
