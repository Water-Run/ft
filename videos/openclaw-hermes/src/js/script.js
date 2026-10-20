// 旁白脚本：每个 cue = [句号, 字幕, {tts, gap, pause}]
// - 多语言时字幕写成 { zh: '…', en: '…' }；只有一种语言时直接写字符串。tts、gap、章节标题同理
// - 字幕里 *词* 表示强调；tts 缺省时由字幕按 SAY 表换成读法（字幕写正式拼写，读法只放在 SAY 表或 tts 字段）
// - gap：该句结束到下一句开始的停顿（秒，缺省 0.3）；pause：无旁白的纯画面停顿（标题、转场）
// - 每章一个 scene：chap [编号, 标题]（null 表示没有章节卡）、lead 章节卡时长、tail 章末留白
// 语言：浏览器取 ?lang=，Node 取环境变量 VLANG；缺省为 zh。浏览器与 Node 共用本文件（工具读它排时间线）。
// 翻译以中文为底本：先定中文，再译其他语言；各语言的句号一一对应，时间轴各自排布。
// 章节标题里的 | 把「眉题」与标题分开（config.js 的章节卡按它排版）。
// 结构：这一类程序（网关型智能体）→ OpenClaw（来历、用法一句、实现与分析）→ Hermes Agent（同）→ 异同 → Mac mini 上接入飞书的一条链路。
// 事实依据：research/FACTS.md（按句号逐条列出）。数据截至 2026-10-06。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);            // 画面里的文字：tr('中文', 'English')

  const RAW = [
    // ───────────────────────── 开场 ─────────────────────────
    {
      id: 'open', chap: null, lead: 0.8, tail: 0.4,
      cues: [
        ['o1', { zh: '一台不关机的电脑上，常驻着一个进程', en: 'On a computer that never shuts down, one process stays running.' }, { gap: 0.4 }],
        ['o2', { zh: '一头连着聊天软件，一头连着模型、文件和终端', en: 'One end reaches chat apps; the other reaches a model, files and a shell.' }, { gap: 0.6 }],
        ['o3', { zh: '这一类程序里，有 OpenClaw，和 Hermes Agent', en: 'Two programs of this kind are OpenClaw and Hermes Agent.' }, { gap: 0.5 }],
        ['o4', { zh: '这部片子讲这一类的设计，和两者的实现', en: 'This film explains the category’s design, then both implementations.' }, { gap: 0.5 }],
        ['oT', null, { pause: 3.0 }],
      ],
    },
    // ───────────────────────── 01 网关型智能体 ─────────────────────────
    {
      id: 'kind', chap: ['01', { zh: '一类程序|网关型智能体', en: 'A kind of program|Gateway agents' }], lead: 2.3, tail: 0.6,
      cues: [
        ['k1', { zh: '先看更常见的一类：终端里的编程智能体', en: 'Start with a more familiar kind: the coding agent in a terminal.' }, { gap: 0.4 }],
        ['k2', { zh: '它的内部是一个循环：把对话和工具清单发给模型', en: 'Inside is a loop: send the conversation and the tool list to a model.' }, { gap: 0.3 }],
        ['k3', { zh: '模型要调用工具，就执行，把结果追加回去', en: 'Whenever the model requests a tool, execute it and append the result.' }, { gap: 0.3 }],
        ['k4', { zh: '直到模型给出一个不再调用工具的回答', en: 'Repeat until the model answers without calling a tool.' }, { gap: 0.5 }],
        ['k5', { zh: '包着模型的这层程序，叫 *harness*', en: 'This program surrounding the model is called a *harness*.' }, { gap: 0.6 }],
        ['k6', { zh: '它默认了几件事：人在键盘前，输入只来自这个人', en: 'It assumes several things: someone at the keyboard, providing the only input.' }, { gap: 0.3 }],
        ['k7', { zh: '一个窗口一段对话，窗口关了，进程也就结束', en: 'One window is one conversation; close the window, and the process ends.' }, { gap: 0.8 }],
        ['k8', { zh: '*网关型智能体*，把这些前提都换掉了', en: 'A *gateway agent* replaces every one of these assumptions.' }, { gap: 0.5 }],
        ['k9', { zh: '进程常驻，由系统的服务管理器拉起', en: 'The process is long-lived, started by the system’s service manager.' }, { gap: 0.35 }],
        ['k10', { zh: '输入来自许多聊天平台，每个平台一个适配器', en: 'Input arrives from many chat platforms, each through its own adapter.' }, { gap: 0.35 }],
        ['k11', { zh: '消息按来源算出*会话键*，分到各自的上下文', en: 'Each message maps to a *session key*, which selects its context.' }, { gap: 0.35 }],
        ['k12', { zh: '发消息的可能是任何人，所以先做准入', en: 'Anyone might send a message, so admission comes first.' }, { gap: 0.35 }],
        ['k13', { zh: '没有人发消息时，定时任务也能启动一轮', en: 'Even without messages, scheduled jobs can still trigger a turn.' }, { gap: 0.7 }],
        ['k14', { zh: '循环没有变，网关回答的是循环之外的问题', en: 'The loop is unchanged; the gateway answers the questions outside it.' }, { gap: 0.5 }],
      ],
    },
    // ───────────────────────── 02 OpenClaw：来历与用法 ─────────────────────────
    {
      id: 'claw', chap: ['02', { zh: 'OpenClaw', en: 'OpenClaw' }], lead: 2.3, tail: 0.5,
      cues: [
        ['c1', { zh: 'OpenClaw 的仓库创建于 2025 年 11 月，起初叫 warelay', en: 'The OpenClaw repository was created in November 2025, as warelay.' }, { gap: 0.4 }],
        ['c2', { zh: '十二月改名 CLAWDIS，定位是一句话', en: 'In December it became CLAWDIS, described in one sentence:' }, { gap: 0.3 }],
        ['c3', { zh: '把 WhatsApp 和 Telegram，桥接到本机的编程智能体', en: 'a bridge from WhatsApp and Telegram to a local coding agent.' }, { gap: 0.4 }],
        ['c4', { zh: '也就是给一个 harness 加上了网关', en: 'In other words, a gateway added to a harness.' }, { gap: 0.8 }],
        ['c5', { zh: '2026 年 1 月三次改名，30 日定名 OpenClaw', en: 'It was renamed three times in January 2026, ending as OpenClaw on the 30th.' }, { gap: 0.5 }],
        ['c6', { zh: '星标 1 月 20 日不到五千，2 月 7 日超过十六万', en: 'Under 5,000 stars on January 20; over 160,000 by February 7.' }, { gap: 0.7 }],
        ['c7', { zh: '2 月 15 日，作者宣布加入 OpenAI，项目转给基金会', en: 'On February 15 its author announced a move to OpenAI; the project went to a foundation.' }, { gap: 0.4 }],
        ['c8', { zh: '到 10 月 6 日，星标是 39.1 万', en: 'By October 6, it had 391,000 stars.' }, { gap: 0.6 }],
        ['c9', { zh: '8 月底的 2.0，把会话从文件迁进 SQLite', en: 'Version 2.0, in late August, moved sessions from files into SQLite.' }, { gap: 0.8 }],
        ['c10', { zh: '用法只有一步：安装，并把网关注册成系统服务', en: 'Usage, in one line: install it, and register the gateway as a system service.' }, { gap: 0.5 }],
      ],
    },
    // ───────────────────────── OpenClaw：实现与分析 ─────────────────────────
    {
      id: 'clawi', chap: null, lead: 1.2, tail: 0.6,
      cues: [
        ['i1', { zh: '实现上，OpenClaw 的中心是*网关*', en: 'In implementation, the center of OpenClaw is the *gateway*.' }, { gap: 0.4 }],
        ['i2', { zh: '一台主机一个网关进程，默认监听本机 18789 端口', en: 'One gateway process per host, listening on local port 18789 by default.' }, { gap: 0.35 }],
        ['i3', { zh: '命令行、网页控制台、桌面应用，都是它的客户端', en: 'The command line, the web console and the desktop app are all its clients.' }, { gap: 0.3 }],
        ['i4', { zh: '它们用 WebSocket 连进来，收发带类型的 JSON 帧', en: 'They connect over WebSocket and exchange typed JSON frames.' }, { gap: 0.35 }],
        ['i5', { zh: '会话归网关所有，不归任何客户端', en: 'Sessions belong to the gateway, not to any client.' }, { gap: 0.7 }],
        ['i6', { zh: '聊天平台以*通道插件*接入：162 个扩展包里占 28 个', en: 'Chat platforms plug in as *channel plugins*: 28 of its 162 extension packages.' }, { gap: 0.35 }],
        ['i7', { zh: '插件管平台的收发和准入，会话键和调度留在核心', en: 'A plugin handles transport and admission; session keys and dispatch stay in core.' }, { gap: 0.7 }],
        ['i8', { zh: '一条消息进来，先路由出会话键，再去重、合并连发', en: 'An inbound message is routed to a session key, then deduplicated and debounced.' }, { gap: 0.35 }],
        ['i9', { zh: '私聊默认并入同一个主会话，群聊各有各的键', en: 'Direct messages share one main session by default; each group has its own key.' }, { gap: 0.35 }],
        ['i10', { zh: '每个会话一条车道，同一会话里的轮次串行', en: 'Each session is a lane; turns within a session run one at a time.' }, { gap: 0.35 }],
        ['i11', { zh: '一轮没跑完又来消息，默认*注入*正在进行的这一轮', en: 'A message arriving mid-turn is, by default, *injected* into the running turn.' }, { gap: 0.8 }],
        ['i12', { zh: '跑循环的部分，叫*智能体运行时*', en: 'The component running the loop is called an *agent runtime*.' }, { gap: 0.3 }],
        ['i13', { zh: '内置的那个叫 openclaw，旧别名正是 pi', en: 'The built-in one is named openclaw; its legacy alias is pi.' }, { gap: 0.35 }],
        ['i14', { zh: 'Codex，或者 Claude 的命令行，也能接进来当运行时', en: 'Codex, or the Claude command line, can be plugged in as the runtime instead.' }, { gap: 0.35 }],
        ['i15', { zh: '也就是说，循环本身是可以替换的部件', en: 'The loop itself is therefore a replaceable component.' }, { gap: 0.8 }],
        ['i16', { zh: '系统提示词每一轮都由 OpenClaw 自己装配', en: 'OpenClaw assembles the system prompt itself, on every run.' }, { gap: 0.3 }],
        ['i17', { zh: '工作区里的几份 Markdown 会注入进去，记忆也在其中', en: 'Markdown files from the workspace are injected into it, memory included.' }, { gap: 0.35 }],
        ['i18', { zh: '官方的说法：模型只记得落盘的内容，没有隐藏状态', en: 'In its own words: the model remembers only what is on disk; no hidden state.' }, { gap: 0.35 }],
        ['i19', { zh: '每天一份笔记可供检索，后台定期整理进长期记忆', en: 'Daily notes are searchable; a background pass distills them into long-term memory.' }, { gap: 0.7 }],
        ['i20', { zh: '工具默认在网关所在的主机上执行，沙箱默认关闭', en: 'Tools run on the gateway host by default; sandboxing is off by default.' }, { gap: 0.35 }],
        ['i21', { zh: '没有消息时，心跳默认每三十分钟跑一轮', en: 'With no messages, a heartbeat runs a turn every thirty minutes by default.' }, { gap: 0.9 }],
        ['i22', { zh: '归纳：状态集中在网关，其余几乎都是插件', en: 'In summary: state concentrates in the gateway; nearly everything else is a plugin.' }, { gap: 0.4 }],
        ['i23', { zh: '代价官方也写了：核心里的东西，每次请求都要付成本', en: 'The stated cost: anything in core is paid for on every model request.' }, { gap: 0.4 }],
        ['i24', { zh: '默认值对应一人自用；多人使用时，文档要求隔离私聊', en: 'The defaults fit one person; with several users, the docs require isolating DMs.' }, { gap: 0.5 }],
      ],
    },
    // ───────────────────────── 03 Hermes Agent：来历与用法 ─────────────────────────
    {
      id: 'hermes', chap: ['03', { zh: 'Hermes Agent', en: 'Hermes Agent' }], lead: 2.3, tail: 0.5,
      cues: [
        ['h1', { zh: 'Hermes 这个名字，最早属于一系列模型', en: 'The name Hermes first belonged to a series of models.' }, { gap: 0.4 }],
        ['h2', { zh: '2023 年 6 月，Nous Research 发布 Nous-Hermes-13b', en: 'In June 2023, Nous Research released Nous-Hermes-13b.' }, { gap: 0.35 }],
        ['h3', { zh: '2024 年的 Hermes 3，定位是通用的指令与工具调用模型', en: 'Hermes 3, in 2024, was described as a generalist instruct and tool-use model.' }, { gap: 0.4 }],
        ['h4', { zh: '先有会调用工具的模型，后有智能体', en: 'The tool-calling models came first; the agent came later.' }, { gap: 0.7 }],
        ['h5', { zh: '智能体在 2026 年 2 月 25 日公开，仓库建于前一年七月', en: 'The agent launched on February 25, 2026; its repository was seven months old.' }, { gap: 0.4 }],
        ['h6', { zh: '两周多后的 v0.2.0，合并了 216 个拉取请求', en: 'Just over two weeks later, v0.2.0 merged 216 pull requests.' }, { gap: 0.5 }],
        ['h7', { zh: '星标四月初两万，四月下旬过十一万', en: 'Stars: 20,000 in early April, over 110,000 by late April.' }, { gap: 0.35 }],
        ['h7b', { zh: '到 10 月 6 日是 25.1 万', en: 'By October 6, 251,000.' }, { gap: 0.8 }],
        ['h8', { zh: '用法同样一句：hermes 进入对话，加 gateway 启动网关', en: 'Usage, again in one line: hermes opens a chat; hermes gateway starts the gateway.' }, { gap: 0.5 }],
      ],
    },
    // ───────────────────────── Hermes Agent：实现与分析 ─────────────────────────
    {
      id: 'hermesi', chap: null, lead: 1.2, tail: 0.6,
      cues: [
        ['j1', { zh: '实现上，Hermes 的中心不是网关，是*核心*', en: 'In implementation, the center of Hermes is not the gateway, but the *core*.' }, { gap: 0.4 }],
        ['j2', { zh: '核心是一个类 AIAgent，循环在 run_conversation 里', en: 'The core is one class, AIAgent; its loop lives in run_conversation.' }, { gap: 0.35 }],
        ['j3', { zh: '命令行、消息网关、ACP、批处理，都只是入口', en: 'The command line, the messaging gateway, ACP and batch runs are only entry points.' }, { gap: 0.3 }],
        ['j4', { zh: '每个入口做同一件事：构造 AIAgent，交给它一轮对话', en: 'Every entry point does one thing: construct an AIAgent and delegate the turn.' }, { gap: 0.35 }],
        ['j5', { zh: '官方称之为*窄腰*：核心收窄，能力放在边缘', en: 'The project calls this a *narrow waist*: a small core, capability at the edges.' }, { gap: 0.4 }],
        ['j6', { zh: '模型接口有三种模式，进出核心时统一成一种格式', en: 'Model APIs come in three modes, all converted to one format inside the core.' }, { gap: 0.7 }],
        ['j7', { zh: '网关一侧，每个平台一个适配器，继承同一个基类', en: 'On the gateway side, each platform has an adapter extending one base class.' }, { gap: 0.35 }],
        ['j8', { zh: '会话键写进平台和聊天编号，每个私聊各自独立', en: 'The session key carries the platform and chat ID; each direct chat is separate.' }, { gap: 0.35 }],
        ['j9', { zh: '准入默认拒绝；一轮没跑完又来消息，默认*打断*', en: 'Admission denies by default; a message arriving mid-turn *interrupts* by default.' }, { gap: 0.8 }],
        ['j10', { zh: '另一条不变量：一场对话里的提示词缓存不能破坏', en: 'Its other invariant: a conversation’s prompt cache must not be broken.' }, { gap: 0.35 }],
        ['j11', { zh: '系统提示词分三层：稳定、上下文、易变', en: 'The system prompt has three tiers: stable, context and volatile.' }, { gap: 0.3 }],
        ['j12', { zh: '会话开始时装配一次，之后原样复用', en: 'It is assembled once when the session starts, then reused unchanged.' }, { gap: 0.4 }],
        ['j13', { zh: '记忆是两份有上限的文件：2200 和 1375 个字符', en: 'Memory is two capped files: 2,200 and 1,375 characters.' }, { gap: 0.35 }],
        ['j14', { zh: '中途写的记忆会落盘，提示词里的快照却不变', en: 'A mid-session memory write reaches disk, but the snapshot in the prompt stays fixed.' }, { gap: 0.35 }],
        ['j15', { zh: '所有会话存进 SQLite，带全文索引，可以检索', en: 'Every session is stored in SQLite with a full-text index, and can be searched.' }, { gap: 0.8 }],
        ['j16', { zh: '再看它自述的*学习闭环*', en: 'Next comes its self-described *learning loop*.' }, { gap: 0.3 }],
        ['j17', { zh: '一轮结束后，后台复制一个智能体，重放这段对话', en: 'After a turn, a background copy of the agent replays the conversation.' }, { gap: 0.3 }],
        ['j18', { zh: '它只判断一件事：有没有该存下的记忆或技能', en: 'It decides one thing: whether any memory or skill should be saved.' }, { gap: 0.35 }],
        ['j19', { zh: '技能是 Markdown 写的做法，提示词里只放索引', en: 'A skill is a procedure written in Markdown; the prompt holds only an index.' }, { gap: 0.35 }],
        ['j20', { zh: '副本沿用同一份提示词，命中的是同一段缓存', en: 'The copy reuses the same prompt, so it hits the same cached prefix.' }, { gap: 0.7 }],
        ['j21', { zh: '终端有七种后端，默认本机；安全边界是操作系统', en: 'The terminal has seven backends, local by default; the security boundary is the OS.' }, { gap: 0.9 }],
        ['j22', { zh: '归纳：一个核心服务所有入口，网关只是其中之一', en: 'In summary: one core serves every entry point, and the gateway is just one of them.' }, { gap: 0.4 }],
        ['j23', { zh: '许多设计出自同一个约束：缓存按前缀命中', en: 'Much of the design follows one constraint: caches match by prefix.' }, { gap: 0.5 }],
      ],
    },
    // ───────────────────────── 04 异同 ─────────────────────────
    {
      id: 'both', chap: ['04', { zh: '对照|异同', en: 'Side by side|Same and different' }], lead: 2.3, tail: 0.6,
      cues: [
        ['b1', { zh: '放在一起看，骨架是相同的', en: 'Side by side, the skeleton is the same.' }, { gap: 0.3 }],
        ['b2', { zh: '常驻进程、平台适配器、会话键、工具循环', en: 'A long-lived process, platform adapters, session keys, and a tool loop.' }, { gap: 0.4 }],
        ['b3', { zh: '记忆都在 Markdown 里，连文件名都相同', en: 'Both keep memory in Markdown, down to the same file names.' }, { gap: 0.4 }],
        ['b4', { zh: '都能定时启动，工具都默认在本机执行，都是 MIT 许可', en: 'Both run on a schedule, run tools locally by default, and are MIT-licensed.' }, { gap: 0.4 }],
        ['b5', { zh: '还各带一条命令，把对方的数据迁移过来', en: 'Each provides a command that imports the other project’s data.' }, { gap: 0.9 }],
        ['b6', { zh: '差别从中心开始：一个是网关，一个是核心', en: 'The differences begin at the center: a gateway in one, a core in the other.' }, { gap: 0.4 }],
        ['b7', { zh: 'OpenClaw 的循环可以整个换掉，Hermes 只有一个', en: 'OpenClaw can swap out its whole loop; Hermes has exactly one.' }, { gap: 0.4 }],
        ['b8', { zh: '中途来的消息：一个默认注入，一个默认打断', en: 'A message mid-turn: one injects it by default, the other interrupts.' }, { gap: 0.4 }],
        ['b9', { zh: '私聊：一个默认并入主会话，一个按聊天分开', en: 'Direct messages: one merges them into a main session, the other separates them.' }, { gap: 0.4 }],
        ['b10', { zh: '记忆：一个是笔记加检索，一个是限额加技能', en: 'Memory: notes plus search in one, caps plus skills in the other.' }, { gap: 0.6 }],
        ['b11', { zh: '出发点也不同：一个从桥接聊天做起，一个从模型做起', en: 'Their origins differ too: one began as a chat bridge, the other from a model.' }, { gap: 0.5 }],
      ],
    },
    // ───────────────────────── 05 一条真实的链路 ─────────────────────────
    {
      id: 'mini', chap: ['05', { zh: '真实链路|Mac mini 与飞书', en: 'A real path|Feishu on a Mac mini' }], lead: 2.3, tail: 0.6,
      cues: [
        ['m1', { zh: '最后看一条真实的链路：Mac mini 上接入飞书', en: 'Finally, one real path: Feishu connected on a Mac mini.' }, { gap: 0.4 }],
        ['m2', { zh: '一台 Mac mini 放在家里，不关机', en: 'A Mac mini stays at home, permanently switched on.' }, { gap: 0.3 }],
        ['m3', { zh: '网关是 launchd 服务：登录时启动，异常退出后被拉起', en: 'The gateway is a launchd service: started at login, restarted if it exits abnormally.' }, { gap: 0.7 }],
        ['m4', { zh: '家里的电脑没有公网地址，飞书的消息怎么进来', en: 'Home computers lack a public address. How can Feishu messages arrive?' }, { gap: 0.4 }],
        ['m5', { zh: '做法是反过来：由 Mac mini 主动向飞书建立长连接', en: 'The direction is reversed: the Mac mini opens a long connection out to Feishu.' }, { gap: 0.35 }],
        ['m6', { zh: '两边用的都是飞书官方 SDK 的 WebSocket 客户端', en: 'Both projects use the WebSocket client from Feishu’s official SDK.' }, { gap: 0.8 }],
        ['m7', { zh: '有人在飞书里给机器人发消息，事件沿长连接推下来', en: 'Someone messages the bot in Feishu, and an event is pushed down the connection.' }, { gap: 0.35 }],
        ['m8', { zh: '飞书要求三秒内处理完，否则重推', en: 'Feishu requires handling within three seconds, or it pushes the event again.' }, { gap: 0.35 }],
        ['m9', { zh: '所以两边都先收下：一个写入持久队列，一个起后台任务', en: 'So both accept first: one writes a durable queue, the other spawns a background task.' }, { gap: 0.6 }],
        ['m10', { zh: '去重、准入之后，算出会话键', en: 'After deduplication and admission, the session key is computed.' }, { gap: 0.3 }],
        ['m11', { zh: '同一条私聊，一边并入主会话，一边得到自己的键', en: 'One places this direct chat in the main session; the other assigns a separate key.' }, { gap: 0.6 }],
        ['m12', { zh: '进入循环：装配提示词，调用模型', en: 'The loop begins: assemble the prompt, call the model.' }, { gap: 0.3 }],
        ['m13', { zh: '模型要读一篇飞书文档，就发出一次工具调用', en: 'To read a Feishu document, the model issues a tool call.' }, { gap: 0.3 }],
        ['m14', { zh: '结果追加回对话，模型再给出回答', en: 'The result is appended to the conversation, and the model answers.' }, { gap: 0.5 }],
        ['m15', { zh: '回复沿原路发回：一边是流式卡片，一边是富文本', en: 'The reply returns the same way: a streaming card in one, rich text in the other.' }, { gap: 0.4 }],
        ['m16', { zh: '最后落盘：会话进 SQLite，记忆写进文件', en: 'Last, persistence: the session goes to SQLite, and memory goes to files.' }, { gap: 0.8 }],
        ['m17', { zh: '离开这台机器的只有两类请求：发给飞书的，和发给模型的', en: 'Only two kinds of request leave the machine: to Feishu, and to the model.' }, { gap: 0.5 }],
      ],
    },
    // ───────────────────────── 片尾 ─────────────────────────
    {
      id: 'outro', chap: null, lead: 1.0, tail: 0.8,
      cues: [
        ['s1', { zh: 'OpenClaw：状态集中在网关，其余都可以换', en: 'OpenClaw: state concentrates in the gateway, and the rest can be swapped.' }, { gap: 0.5 }],
        ['s2', { zh: 'Hermes：一切围着一个核心，和它的提示词缓存', en: 'Hermes: everything revolves around one core, and its prompt cache.' }, { gap: 0.9 }],
        ['x1', { zh: '取证记录、脚本和源码，都在开源仓库里', en: 'The research records, the script and all source code are in the open repository.' }, { gap: 0.6 }],
        ['xC', null, { pause: 8.5 }],
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。先用 kit/tools/tts_probe.js 试，再用 asr.js 回听。
  const SAY = {
    zh: [
      [/Hermes Agent/g, 'Hermes Agent'],
      [/OpenClaw/g, 'Open Claw'],
      [/openclaw/g, 'open claw'],
      [/warelay/g, 'ware relay'],
      [/CLAWDIS/g, 'Claw dis'],
      [/SQLite/g, 'S Q Lite'],
      [/MIT/g, 'M I T'],
      [/OpenAI/g, 'Open A I'],
      [/AIAgent/g, 'A I Agent'],
      [/run_conversation/g, 'run conversation'],
      [/launchd/g, 'launch D'],
      [/ACP/g, 'A C P'],
      [/SDK/g, 'S D K'],
      [/JSON/g, 'jason'],
      [/18789/g, '一八七八九'],
      [/v0\.2\.0/g, 'v 零点二点零'],
      [/的 2\.0/g, '的二点零'],
      [/Nous-Hermes-13b/g, 'Nous Hermes 十三 B'],
      [/旧别名正是 pi/g, '旧别名正是 pie'],
      [/2200/g, '两千二百'],
      [/1375/g, '一千三百七十五'],
    ],
    en: [
      [/OpenClaw/g, 'Open Claw'],
      [/openclaw/g, 'open claw'],
      [/warelay/g, 'ware relay'],
      [/CLAWDIS/g, 'Claw dis'],
      [/SQLite/g, 'S Q Lite'],
      [/\bMIT\b/g, 'M I T'],
      [/Nous-Hermes-13b/g, 'Noose Hermes thirteen B'],
      [/Nous/g, 'Noose'],
      [/Feishu/g, 'Fay shoo'],
      [/AIAgent/g, 'A I Agent'],
      [/run_conversation/g, 'run conversation'],
      [/launchd/g, 'launch D'],
      [/\bDMs\b/g, 'D Ms'],
      [/alias is pi\b/g, 'alias is pie'],
      [/\bthe OS\b/g, 'the O S'],
      [/18789/g, 'one eight seven eight nine'],
      [/2,200/g, 'twenty-two hundred'],
      [/1,375/g, 'thirteen seventy-five'],
      [/v0\.2\.0/g, 'version 0.2.0'],
      [/github\.com\/Water-Run\/ft/g, 'github dot com slash Water Run slash f t'],
    ],
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
