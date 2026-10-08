// 旁白脚本：每个 cue = [句号, 字幕, {tts, gap, pause}]
// - 字幕写成 { zh: '…', en: '…' }；tts、gap、章节标题同理
// - 字幕里 *词* 表示强调；tts 缺省时由字幕按 SAY 表换成读法（字幕写正式拼写，读法只放在 SAY 表或 tts 字段）
// - gap：该句结束到下一句开始的停顿（秒，缺省 0.3）；pause：无旁白的纯画面停顿（标题、转场）
// - 每章一个 scene：chap [编号, 标题]（null 表示没有章节卡）、lead 章节卡时长、tail 章末留白
// 翻译以中文为底本：先定中文，再译英文；两种语言的句号一一对应，时间轴各自排布。
// 每一句的出处见 research/FACTS.md。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);

  const RAW = [
    // ── 开场：两个 v2，一个共同的问题 ──
    {
      id: 'open', chap: null, lead: 0.6, tail: 0.3,
      cues: [
        ['o1', { zh: '2026 年 8 月 31 日，OpenClaw 发布 2.0。', en: 'On August 31, 2026, OpenClaw shipped 2.0.' }, { gap: 0.35 }],
        ['o2', { zh: '不到两周，OpenCode 打出了 v2.0.0 的标签。', en: 'Less than two weeks later, OpenCode tagged v2.0.0.' }, { gap: 0.45 }],
        ['o3', { zh: '一个在聊天软件里当个人助理，', en: 'One is a personal assistant that lives in chat apps.' }, { gap: 0.25 }],
        ['o4', { zh: '一个在终端里写代码。', en: 'The other writes code in a terminal.' }, { gap: 0.5 }],
        ['o5', { zh: '两次大改，都有相当一部分在处理同一个问题：', en: 'Both overhauls spend a large part on the same question:' }, { gap: 0.25 }],
        ['o6', { zh: '进程在半路死掉之后，还剩下什么。', en: 'when the process dies halfway, what is left?' }, { gap: 0.7 }],
        ['oT', null, { pause: 3.2 }],
      ],
    },
    // ── 01 一年前的 harness ──
    {
      id: 'before', chap: ['01', { zh: '一年前的 harness', en: 'The harness, a year ago' }], lead: 2.2, tail: 0.6,
      cues: [
        ['a1', { zh: 'harness 是包在模型外面的那层程序。', en: 'A harness is the program wrapped around the model.' }, { gap: 0.3 }],
        ['a2', { zh: '它把对话和工具清单发给模型，', en: 'It sends the conversation and the tool list to the model,' }, { gap: 0.25 }],
        ['a3', { zh: '执行模型要调用的工具，再把结果接回对话。', en: 'runs the tools the model asks for, and feeds the results back.' }, { gap: 0.6 }],
        ['a4', { zh: '2025 年 10 月 31 日，OpenCode 发布 1.0。', en: 'On October 31, 2025, OpenCode released 1.0.' }, { gap: 0.25 }],
        ['a5', { zh: '它的核心，就是这样一个循环。', en: 'At its core is exactly such a loop.' }, { gap: 0.3 }],
        ['a6', { zh: '每转一圈，读出历史，请求一次模型；', en: 'Each turn reads the history and makes one model request.' }, { gap: 0.25 }],
        ['a7', { zh: '模型要调用工具，就再转一圈。', en: 'If the model calls a tool, it goes around again.' }, { gap: 0.6 }],
        ['a8', { zh: '状态呢？每条消息、每个片段，各是一个 JSON 文件。', en: 'Where does the state live? One JSON file per message and per part.' }, { gap: 0.25 }],
        ['a9', { zh: '写入时，整个存储共用一把写锁。', en: 'Every write takes one lock shared by the whole store.' }, { gap: 0.25 }],
        ['a10', { zh: '运行中又来的消息，排队的状态只在进程内存里。', en: 'Messages that arrive mid-run wait in a queue held in memory.' }, { gap: 0.6 }],
        ['h1', { zh: '这一年里，v1 自己也在变：', en: 'Over that year, v1 kept changing as well:' }, { gap: 0.25 }],
        ['h2', { zh: '2026 年 2 月的 1.2，把文件迁进了 SQLite；', en: 'in February 2026, version 1.2 moved the files into SQLite;' }, { gap: 0.25 }],
        ['h3', { zh: '3 月的 1.3，开始支持 Node.js。', en: 'in March, version 1.3 added support for Node.js.' }, { gap: 0.6 }],
        ['h4', { zh: 'OpenClaw 晚一个月出现。2025 年 11 月它叫 warelay，', en: 'OpenClaw arrived a month later. In November 2025 it was called warelay,' }, { gap: 0.25 }],
        ['h5', { zh: '一个在 WhatsApp 上收发、自动回复的工具。', en: 'a tool to send, receive and auto-reply on WhatsApp.' }, { gap: 0.3 }],
        ['h6', { zh: '12 月改名 CLAWDIS，成了一个网关：', en: 'In December it became CLAWDIS, a gateway' }, { gap: 0.25 }],
        ['h7', { zh: '把 WhatsApp 和 Telegram 接到本机的编程智能体 Pi。', en: 'that bridged WhatsApp and Telegram to a local coding agent, Pi.' }, { gap: 0.3 }],
        ['h8', { zh: '也就是在一个 harness 外面，再加一层网关。', en: 'In other words, a gateway in front of a harness.' }, { gap: 0.6 }],
        ['a11', { zh: 'OpenClaw 到 2026 年 7 月的版本，会话也还是文件：', en: 'In OpenClaw, as late as July 2026, sessions were files too:' }, { gap: 0.25 }],
        ['a12', { zh: '一个 sessions.json 做索引，每个会话一份 JSONL。', en: 'a sessions.json index, and one JSONL transcript per session.' }, { gap: 0.6 }],
        ['a13', { zh: '这样能跑，难的是它没有处理的那些时刻：', en: 'This works. The hard part is the moments it does not handle:' }, { gap: 0.25 }],
        ['a14', { zh: '进程半路退出，上下文装不下，', en: 'the process exits halfway, the context does not fit,' }, { gap: 0.25 }],
        ['a15', { zh: '几个客户端同时连接，一条命令该不该放行。', en: 'several clients connect at once, a command needs approval.' }, { gap: 0.4 }],
        ['a16', { zh: '下面看两个 v2 在这些地方各改了什么。', en: 'Here is what each v2 changed at these points.' }, { gap: 0.4 }],
      ],
    },
    // ── 02 OpenClaw 2.0：一条消息的收与发 ──
    {
      id: 'claw', chap: ['02', 'OpenClaw 2.0'], lead: 2.4, tail: 0.5,
      cues: [
        ['c1', { zh: 'OpenClaw 2.0 的版本号是 2026.8.1。', en: 'OpenClaw 2.0 is version 2026.8.1.' }, { gap: 0.25 }],
        ['c2', { zh: '发布说明附了 16,977 个拉取请求的清单。', en: 'Its release notes list 16,977 pull requests.' }, { gap: 0.3 }],
        ['c3', { zh: '这里只看其中和 harness 有关的部分：', en: 'Here we follow only the part that concerns the harness:' }, { gap: 0.25 }],
        ['c4', { zh: '一条消息，从进来到发出去。', en: 'one message, from arrival to delivery.' }, { gap: 0.6 }],
        ['c5', { zh: '它的重构文档记着这样一个故障：', en: 'Its refactor notes record this failure:' }, { gap: 0.25 }],
        ['c6', { zh: 'Telegram 的更新已经确认，回复也已生成，', en: 'the Telegram update was acknowledged, the reply was written,' }, { gap: 0.25 }],
        ['c7', { zh: '进程却在发送前重启，这条回复就丢了。', en: 'the process restarted before sending, and the reply was lost.' }, { gap: 0.6 }],
        ['c8', { zh: '2.0 的规则是：要发出的消息，先把发送意图写进库，', en: 'The rule in 2.0: first write the intent to send into the database,' }, { gap: 0.25 }],
        ['c9', { zh: '再调用平台的接口；成功之后，再记下回执。', en: 'then call the platform; after success, record the receipt.' }, { gap: 0.6 }],
        ['c10', { zh: '最难办的是这一段：接口调了，回执没写，进程死了。', en: 'The hard window: the call went out, no receipt yet, the process died.' }, { gap: 0.25 }],
        ['c11', { zh: '这时无法知道，消息到底发出去没有。', en: 'Now nobody knows whether the message was sent.' }, { gap: 0.25 }],
        ['c12', { zh: 'OpenClaw 把它记成 unknown_after_send。', en: 'OpenClaw records it as unknown_after_send.' }, { gap: 0.25 }],
        ['c13', { zh: '只有通道核实「确实没发出」，才允许重发。', en: 'It resends only if the channel confirms it was not sent.' }, { gap: 0.3 }],
        ['c14', { zh: '默认是至少一次；通道能证明幂等，才有恰好一次。', en: 'At least once by default; exactly once only where a channel proves idempotency.' }, { gap: 0.6 }],
        ['c14b', { zh: '意图写不进库呢？要求持久的通道直接失败；', en: 'What if the intent cannot be written? A channel that requires durability fails;' }, { gap: 0.25 }],
        ['c14c', { zh: '只有标成「尽力而为」的，才退回直接发送。', en: 'only a best-effort channel falls back to sending directly.' }, { gap: 0.6 }],
        ['c15', { zh: '收消息的一侧也一样：', en: 'The receiving side works the same way:' }, { gap: 0.25 }],
        ['c16', { zh: '接收、待处理、完成，每一步都留下记录，', en: 'accepted, pending, completed, each step leaves a record,' }, { gap: 0.25 }],
        ['c17', { zh: '网关重启之后，从记录接着走。', en: 'and after a gateway restart, work resumes from the record.' }, { gap: 0.3 }],
        ['c17b', { zh: '比如 Telegram：一条更新处理完，才推进重启水位线；', en: 'Telegram, for instance: the restart watermark moves only past finished updates;' }, { gap: 0.25 }],
        ['c17c', { zh: '没处理完的，重启后再来一遍。', en: 'unfinished ones are replayed after a restart.' }, { gap: 0.5 }],
        ['c17d', { zh: '一轮没跑完又来一条消息，默认注入正在进行的这一轮：', en: 'A message that arrives mid-turn is, by default, steered into the running turn:' }, { gap: 0.25 }],
        ['c17e', { zh: '正在跑的工具跑完，还没开始的跳过，', en: 'the running tool finishes, the ones not yet started are skipped,' }, { gap: 0.25 }],
        ['c17f', { zh: '跳过的调用补上合成的错误结果，记录保持成对。', en: 'and every skipped call gets a synthetic error result, so the record stays paired.' }, { gap: 0.5 }],
      ],
    },
    {
      id: 'claw2', chap: null, lead: 0.9, tail: 0.5,
      cues: [
        ['c18', { zh: '会话和对话记录，2.0 也从文件搬进了 SQLite。', en: 'Sessions and transcripts also moved from files into SQLite in 2.0.' }, { gap: 0.25 }],
        ['c19', { zh: '每个智能体一个库，放它的会话和记录；', en: 'Each agent gets one database for its sessions and transcripts;' }, { gap: 0.25 }],
        ['c20', { zh: '全局另有一个库，放网关自己的状态。', en: 'one more global database holds the gateway’s own state.' }, { gap: 0.25 }],
        ['c21', { zh: '运行时只读写数据库，旧文件只交给迁移工具。', en: 'At runtime only the databases are used; old files go to the migration tool.' }, { gap: 0.6 }],
        ['c21b', { zh: '几个会话协作时，人或别的智能体可能改动其中一个。', en: 'When sessions collaborate, a human or another agent may change one of them.' }, { gap: 0.25 }],
        ['c21c', { zh: '2.0 给每个会话一条带序号的信号日志；', en: '2.0 gives every session a numbered signal log;' }, { gap: 0.25 }],
        ['c21d', { zh: '观察它的会话只收到一条提醒，再按序号取回之后的变化。', en: 'a watcher gets one notice, then fetches what changed after its number.' }, { gap: 0.6 }],
        ['c22', { zh: '授权也落到具体的记录上。', en: 'Authority is pinned to specific records as well.' }, { gap: 0.25 }],
        ['c23', { zh: '一次审批，绑定到具体的请求、命令、会话和人；', en: 'An approval is bound to the exact request, command, session, and person.' }, { gap: 0.25 }],
        ['c24', { zh: '第一个有效答复就了结它，重连也不能让它复活。', en: 'The first valid answer settles it; reconnecting cannot revive it.' }, { gap: 0.6 }],
        ['c25', { zh: '凭据则不进模型能看到的文字。', en: 'Credentials stay out of the text the model can see.' }, { gap: 0.25 }],
        ['c26', { zh: '开启出网代理后，子进程拿到的只是一个哨兵串；', en: 'With the egress proxy on, a subprocess holds only a sentinel string;' }, { gap: 0.25 }],
        ['c27', { zh: '请求出网时，代理才把它换成真值，只对绑定的主机。', en: 'the proxy swaps in the real value on the way out, only for the bound host.' }, { gap: 0.6 }],
        ['c28', { zh: '2.0 还能接管别的编程智能体的会话，包括 OpenCode。', en: '2.0 can also adopt sessions from other coding agents, OpenCode included.' }, { gap: 0.25 }],
        ['c29', { zh: '它的文档写着：OpenCode v1 的表不记每条消息的来源，', en: 'Its docs note that OpenCode v1’s tables do not keep per-message provenance;' }, { gap: 0.25 }],
        ['c30', { zh: '只有 v2 的结构里有。', en: 'only the v2 schema does.' }, { gap: 0.6 }],
      ],
    },
    // ── 03 OpenCode v2：一个后台服务，一本会话记录 ──
    {
      id: 'code', chap: ['03', 'OpenCode v2'], lead: 2.4, tail: 0.5,
      cues: [
        ['d1', { zh: 'OpenCode 在 2026 年 9 月 11 日打出 v2.0.0。', en: 'OpenCode tagged v2.0.0 on September 11, 2026.' }, { gap: 0.25 }],
        ['d2', { zh: '到 10 月 6 日已是 2.0.24，v1 仍在并行发布。', en: 'By October 6 it was at 2.0.24, with v1 still shipping in parallel.' }, { gap: 0.5 }],
        ['d3', { zh: 'v2 删掉了原来的主包，拆成几层：', en: 'v2 deleted the old main package and split it into layers:' }, { gap: 0.25 }],
        ['d4', { zh: 'Schema 定数据的形状，Core 管执行和存储，', en: 'Schema defines the shapes, Core owns execution and storage,' }, { gap: 0.25 }],
        ['d5', { zh: 'Protocol 定接口，Server 对外，客户端由接口生成。', en: 'Protocol defines the API, Server exposes it, and clients are generated.' }, { gap: 0.5 }],
        ['d6', { zh: '默认每个用户只起一个后台服务，', en: 'By default there is one background service per user.' }, { gap: 0.25 }],
        ['d7', { zh: '终端、桌面、网页都连它；会话、权限、工具执行都归它。', en: 'Terminal, desktop and web connect to it; it owns sessions, permissions, tools.' }, { gap: 0.6 }],
        ['d7b', { zh: '每个事件只编码一次；每个连接一条队列，上限 4,096，', en: 'Events are encoded once; each connection queues up to 4,096,' }, { gap: 0.25 }],
        ['d7c', { zh: '慢的那个超了限就断开，不拖住别人。', en: 'and a slow one that overflows is cut off without holding up the rest.' }, { gap: 0.25 }],
        ['d7d', { zh: '规范里测过：50 个客户端时，', en: 'Measured in the spec: with 50 clients,' }, { gap: 0.25 }],
        ['d7e', { zh: '编码耗时从 554 毫秒降到 12 毫秒。', en: 'encoding time fell from 554 to 12 milliseconds.' }, { gap: 0.6 }],
        ['d8', { zh: '会话里的每一次变化，都是一个带序号的事件，', en: 'Every change in a session is an event with a sequence number,' }, { gap: 0.25 }],
        ['d9', { zh: '在同一个事务里写进表。', en: 'written into tables in the same transaction.' }, { gap: 0.3 }],
        ['d10', { zh: '用户输入先进收件箱，默认在下一个安全的步边界插入。', en: 'Input enters an inbox and, by default, joins at the next safe step boundary.' }, { gap: 0.3 }],
        ['d11', { zh: '每一步开始前，都重新从库里读出历史。', en: 'Before every step, the history is reloaded from the database.' }, { gap: 0.25 }],
        ['d12', { zh: '工具调用在产生副作用之前，就已经落库。', en: 'A tool call is stored before any of its side effects begin.' }, { gap: 0.4 }],
        ['d13', { zh: '重试的范围也收窄了：只管限流、服务端故障和传输失败，', en: 'Retries are narrow: rate limits, provider failures, and transport errors only,' }, { gap: 0.25 }],
        ['d14', { zh: '最多再试四次，间隔按指数增长并带随机抖动。', en: 'at most four more attempts, with jittered exponential backoff.' }, { gap: 0.6 }],
      ],
    },
    {
      id: 'crash', chap: null, lead: 0.9, tail: 0.5,
      cues: [
        ['e1', { zh: '这些规则，出事的时候才看得出差别。做一个实验。', en: 'These rules only show their worth when something breaks. An experiment.' }, { gap: 0.3 }],
        ['e2', { zh: '一个按脚本应答的模型，要求执行一条命令：', en: 'A scripted model asks for one command:' }, { gap: 0.25 }],
        ['e3', { zh: '先睡 20 秒，再往文件里追加一行。', en: 'sleep 20 seconds, then append a line to a file.' }, { gap: 0.3 }],
        ['e4', { zh: '命令开始约 4 秒后，强杀进程。', en: 'About 4 seconds in, the process is killed.' }, { gap: 0.25 }],
        ['e5', { zh: '同样的操作，在 v1.0.0 和 v2.0.24 上各做一遍。', en: 'The same steps run on v1.0.0 and on v2.0.24.' }, { gap: 0.6 }],
        ['e6', { zh: 'v1.0.0 的记录里，这次调用一直停在 running。', en: 'In v1.0.0’s record, the call stays at running for good.' }, { gap: 0.25 }],
        ['e7', { zh: '让它继续，发给模型的请求里，这次调用不见了。', en: 'Asked to continue, it sends a request in which the call is gone.' }, { gap: 0.25 }],
        ['e8', { zh: '源码里，只有完成或出错的调用才会转进上下文。', en: 'In the source, only completed or failed calls reach the context.' }, { gap: 0.6 }],
        ['e9', { zh: 'v2.0.24 只要重启服务，就自己接上了：', en: 'v2.0.24 picks the session back up as soon as the service restarts:' }, { gap: 0.25 }],
        ['e10', { zh: '它把这次调用记成「被中断」，', en: 'it marks the call as interrupted,' }, { gap: 0.25 }],
        ['e11', { zh: '再补一条消息：服务器重启过，不要重复已完成的工作。', en: 'and adds a message: the server restarted; do not repeat completed work.' }, { gap: 0.6 }],
        ['e12', { zh: '模型这边只看到命令被中断；按脚本，它又执行了一遍。', en: 'The model sees only an interrupted command; per its script, it runs it again.' }, { gap: 0.25 }],
        ['e13', { zh: '而被强杀的服务留下的那条命令，其实还在跑。', en: 'But the command left behind by the killed service was still running.' }, { gap: 0.25 }],
        ['e14', { zh: '文件里最后是两行。v1.0.0 那边，也是两行。', en: 'The file ends up with two lines. On v1.0.0, also two.' }, { gap: 0.6 }],
        ['e15', { zh: 'v2 的规范写明：恢复不保证工具恰好执行一次。', en: 'The v2 spec says it plainly: recovery does not guarantee exactly-once tools.' }, { gap: 0.25 }],
        ['e16', { zh: '区别在于，v2 记下了发生过的事，并如实告诉了模型。', en: 'The difference: v2 recorded what happened and told the model as it was.' }, { gap: 0.7 }],
      ],
    },
    {
      id: 'budget', chap: null, lead: 0.9, tail: 0.6,
      cues: [
        ['f1', { zh: '上下文也按预算来管。', en: 'The context is managed as a budget, too.' }, { gap: 0.25 }],
        ['f2', { zh: '快到上限时，较早的对话压成一份结构化摘要，', en: 'Near the limit, older conversation becomes a structured summary,' }, { gap: 0.25 }],
        ['f3', { zh: '默认留下最近约 15,000 个 token。', en: 'and by default about the last 15,000 tokens are kept.' }, { gap: 0.3 }],
        ['f3b', { zh: '摘要分固定几项：目标、决定、已完成和进行中的工作、', en: 'The summary has fixed sections: objective, decisions, done and active work,' }, { gap: 0.25 }],
        ['f3c', { zh: '卡点和下一步、相关文件，另一个智能体能照着接手。', en: 'blockers and next moves, relevant files, so another agent could take over.' }, { gap: 0.3 }],
        ['f4', { zh: '工具输出太长，模型只看到开头和结尾，全文另存。', en: 'Long tool output reaches the model as head and tail; the rest is stored.' }, { gap: 0.3 }],
        ['f5', { zh: '指令文件按内容的哈希记录差异；', en: 'Instruction files are tracked by content hash;' }, { gap: 0.25 }],
        ['f6', { zh: '有改动，就作为新的一条追加在后面，', en: 'a change is appended as a new entry,' }, { gap: 0.25 }],
        ['f7', { zh: '前面的提示前缀不变，缓存还能命中。', en: 'so the prompt prefix stays the same and the cache still hits.' }, { gap: 0.3 }],
        ['f7b', { zh: '最后一步不许再调工具，工具定义却照样发送，', en: 'On the final step tools are switched off, yet their definitions are still sent,' }, { gap: 0.25 }],
        ['f7c', { zh: '也是为了保住这段前缀。', en: 'to keep that same prefix.' }, { gap: 0.3 }],
        ['f7d', { zh: '还可以打开保温：空闲时每 4 分钟发一次请求，', en: 'Optional warming sends a request every 4 idle minutes' }, { gap: 0.25 }],
        ['f7e', { zh: '让服务商那边的缓存不过期。', en: 'so the provider-side cache does not expire.' }, { gap: 0.5 }],
        ['f8', { zh: '也有删减：v2 不再运行语言服务器，', en: 'Some things were cut: v2 no longer runs language servers,' }, { gap: 0.25 }],
        ['f9', { zh: 'v1 的插件要按新接口重写。', en: 'and v1 plugins must be rewritten for the new API.' }, { gap: 0.5 }],
      ],
    },
    // ── 04 学到了什么 ──
    {
      id: 'lessons', chap: ['04', { zh: '学到了什么', en: 'What we learned' }], lead: 2.3, tail: 0.6,
      cues: [
        ['l1', { zh: '把两边放在一起，能看出几条共同的做法。', en: 'Side by side, the two share a few practices.' }, { gap: 0.5 }],
        ['l2', { zh: '第一条，先记下来，再动手。', en: 'One: write it down first, then act.' }, { gap: 0.25 }],
        ['l3', { zh: 'OpenClaw 先写发送意图，OpenCode 先把工具调用落库。', en: 'OpenClaw writes the send intent first; OpenCode stores the tool call first.' }, { gap: 0.5 }],
        ['l4', { zh: '第二条，恢复时承认「不知道」。', en: 'Two: when recovering, admit what is unknown.' }, { gap: 0.25 }],
        ['l5', { zh: '一边记成 unknown_after_send，一边记成被中断。', en: 'One records unknown_after_send, the other records an interruption.' }, { gap: 0.25 }],
        ['l6', { zh: '两边都不承诺恰好一次。', en: 'Neither promises exactly once.' }, { gap: 0.5 }],
        ['l7', { zh: '第三条，记录始终成对。', en: 'Three: keep the record paired.' }, { gap: 0.25 }],
        ['l8', { zh: '被跳过或被中断的工具调用，两边都补上一条错误结果。', en: 'A skipped or interrupted tool call gets a synthetic error result on both sides.' }, { gap: 0.5 }],
        ['l9', { zh: '第四条，上下文是预算。', en: 'Four: the context is a budget.' }, { gap: 0.25 }],
        ['l10', { zh: 'OpenClaw 的仓库守则：注入模型的每一项都有硬上限，', en: 'OpenClaw’s repository rules require a hard cap on every item injected into the model,' }, { gap: 0.25 }],
        ['l11', { zh: '顺序确定，旧记录的字节尽量不变，让缓存命中。', en: 'with deterministic order and old bytes preserved, so the cache hits.' }, { gap: 0.25 }],
        ['l12', { zh: 'OpenCode 的压缩、截断与追加指令，做的是同一件事。', en: 'OpenCode’s compaction, truncation and appended instructions do the same job.' }, { gap: 0.5 }],
        ['l13', { zh: '第五条，授权绑定到具体的那一次。', en: 'Five: authority is bound to the specific instance.' }, { gap: 0.25 }],
        ['l14', { zh: 'OpenClaw 的审批绑定请求、命令、会话和人；', en: 'OpenClaw binds an approval to request, command, session and person;' }, { gap: 0.25 }],
        ['l15', { zh: 'OpenCode 的权限按顺序匹配，最后命中的一条生效。', en: 'OpenCode matches permissions in order, and the last matching rule wins.' }, { gap: 0.5 }],
        ['l16', { zh: '第六条，只留一条路径，旧的删掉。', en: 'Six: keep one path and delete the old one.' }, { gap: 0.25 }],
        ['l17', { zh: 'OpenClaw 的守则写着：重构默认只留一条规范路径；', en: 'OpenClaw’s rules say a refactor keeps one canonical path by default;' }, { gap: 0.25 }],
        ['l18', { zh: 'OpenCode v2 删掉了整个旧主包，旧插件不再加载。', en: 'OpenCode v2 removed the old main package, and old plugins no longer load.' }, { gap: 0.7 }],
        ['l19', { zh: '一年前，harness 的核心是那个循环。', en: 'A year ago, the core of a harness was the loop.' }, { gap: 0.3 }],
        ['l20', { zh: '到了 v2，循环还在，分量移到了它的外面：', en: 'In v2 the loop is still there, but the weight has moved outside it:' }, { gap: 0.25 }],
        ['l21', { zh: '先写下的记录，有上限的上下文，绑定到具体请求的权限。', en: 'records written first, a bounded context, authority bound to each request.' }, { gap: 0.4 }],
        ['l22', { zh: '要自己写 harness，可以从这几处开始。', en: 'Anyone writing a harness can start from these.' }, { gap: 0.8 }],
      ],
    },
    {
      id: 'outro', chap: null, lead: 0.4, tail: 0.6,
      cues: [
        ['zT', null, { pause: 9.0 }],
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。先用 kit/tools/tts_probe.js 试，再用 asr.js 回听。
  const SAY = {
    zh: [
      [/unknown_after_send/g, 'unknown after send'],
      [/SQLite/g, 'S Q Lite'],
      [/CLAWDIS/g, 'Clawdis'],
      [/sessions\.json/g, 'sessions 点 JSON'],
      [/JSONL/g, 'JSON L'],
      [/2026\.8\.1/g, '二零二六点八点一'],
      [/v2\.0\.24/g, 'v 二点零点二十四'],
      [/2\.0\.24/g, '二点零点二十四'],
      [/v2\.0\.0/g, 'v 二点零点零'],
      [/v1\.0\.0/g, 'v 一点零点零'],
      [/16,977/g, '一万六千九百七十七'],
      [/15,000/g, '一万五千'],
      [/4,096/g, '四千零九十六'],
      [/Node\.js/g, 'Node JS'],
    ],
    en: [
      [/unknown_after_send/g, 'unknown after send'],
      [/warelay/g, 'wa relay'],
      [/CLAWDIS/g, 'Clawdis'],
      [/sessions\.json/g, 'sessions dot JSON'],
      [/JSONL/g, 'JSON L'],
      [/2026\.8\.1/g, 'twenty twenty-six point eight point one'],
      [/v2\.0\.24/g, 'v two point oh point twenty-four'],
      [/2\.0\.24/g, 'two point oh point twenty-four'],
      [/v2\.0\.0/g, 'v two point oh point oh'],
      [/v1\.0\.0/g, 'v one point oh point oh'],
    ],
  };
  const strip = (s) => s.replace(/\*/g, '');
  const ttsNorm = (s) => { for (const [re, to] of SAY[LANG] || []) s = s.replace(re, to); return s; };
  const SCRIPT = RAW.map((sc) => ({
    ...sc, chap: sc.chap ? [sc.chap[0], pick(sc.chap[1])] : null,
    cues: sc.cues.map(([id, cap, o = {}]) => [id, pick(cap), { ...o, tts: pick(o.tts), gap: pick(o.gap) }]),
  }));
  const ttsText = (c) => (c[2] && c[2].tts) || ttsNorm(strip(c[1]) + (LANG === 'zh' && !/[。：；，]$/.test(strip(c[1])) ? '。' : ''));

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
