# 事实出处

画面与旁白里的每一项事实都要有出处。优先级：亲手做实验取得的数据 > 源码 > 官方文档 > 其他。做法见仓库 `docs/guides/research.md`：读原始来源、做独立交叉核查；模型输出、记忆与搜索摘要只作线索。待核实的内容不能进入定稿，标题、字幕、封面与译文同样要核查。

取证日期：2026-10-31。对象：Agent 的 Harness（包在模型外面、替模型执行工具调用并维持循环的程序）。实验对象：本片自写的最小 Harness `research/lab/01_harness.py`，模型 DeepSeek `deepseek-flash`。

## 环境与版本

| 项 | 版本 | 获取方式 |
|---|---|---|
| 系统 | Windows 11 Pro for Workstations | 本机 |
| Python | 3.14.3，只用标准库 | 本机 |
| 模型接口 | DeepSeek `/chat/completions`（OpenAI 兼容），模型 `deepseek-flash`，`temperature 0` | API key 取自环境变量，不入库 |
| 演示项目 | `research/lab/demo/cart.py`、`test_cart.py` | 本片自写；每次实验先复制到临时目录，跑完删除 |

实验记录：`out_01_harness_a.json` / `.txt`（2026-10-31T04:54:56Z，**片中所用**，按「取第一次」选定）；`out_01_harness_b.json` / `.txt`（同日第二次，用来看结果是否稳定）。JSON 里保存每一次请求的完整请求体与完整响应；工具输出里的临时目录路径替换成「.」，实际没有出现路径。

## 对象与解释路径

语言模型本身只接收文字、输出文字，不会执行任何操作（D1、D2）。要让它「读文件、跑测试、改代码」，需要外面一层程序：把环境说明、工具清单和任务一起发给模型；模型若回复一段约定格式的「工具调用」，就由这层程序真的去执行，把结果作为一条消息放回对话，再连同整段对话重新请求模型（D4、D5）；模型的回复里不再有工具调用时，循环结束（D4）。这层程序就是 Harness；LangChain 的说法是「Agent = Model + Harness」（D3）。

一次完整操作见实验 E1–E8：5 次请求，6 次工具调用（读 2 个文件、跑测试、改 1 行、再跑测试），第 5 次回复没有工具调用，循环停下。每次请求都带着全部历史，发出的消息数 2 → 5 → 7 → 9 → 11，`prompt_tokens` 489 → 1044（E8）。

Harness 还负责：对话太长时压缩旧内容（D6）；划定模型能做什么、拦下不允许的调用（D7）。同一个模型换一套 Harness，评测分数会变（D8、D9）。

尚未弄清、不进旁白：各家对 Harness 的边界说法并不一致（见末节）。

## 实验事实（E）

| 号 | 陈述 | 依据（`research/lab/`） | 核查 |
|---|---|---|---|
| E1 | 演示项目：`cart.py` 的 `total` 写成 `return sum(prices[1:])`，会跳过第一个价格；`test_cart.py` 检查 `total([3, 5, 2])` 应为 10 | `demo/cart.py` 第 3 行；`demo/test_cart.py` | 2026-10-31，已核 |
| E2 | 第 1 次请求：2 条消息（system：「你是一个编程助手……当前项目里的文件：cart.py、test_cart.py……」；user：「测试没通过，帮我修好。」）＋ 3 个工具 `read_file`、`edit_file`、`run_tests`；请求体 1243 字节 | `out_01_harness_a.json` → `rounds[0].request`、`request_bytes`；文件清单由 `01_harness.py` 从目录读出后写进 system | 已核 |
| E3 | 第 1 次响应：`finish_reason` 为 `tool_calls`，正文「我先看看这两个文件。」，两个工具调用 `read_file({"path": "cart.py"})`、`read_file({"path": "test_cart.py"})`；Harness 执行后把两个文件的内容作为 `tool` 消息放回 | `rounds[0].response.choices[0]`、`rounds[0].tool_results` | 已核 |
| E4 | 第 2 次请求 5 条消息；模型调用 `run_tests({})`；结果「退出码 1 / 失败：total([3, 5, 2]) 应为 10，实际得到 7」 | `rounds[1]` | 已核 |
| E5 | 第 3 次请求 7 条消息；模型正文「问题确认了：`prices[1:]` 把第一件商品漏掉了（3+5+2=10，实际算成 5+2=7）。」，调用 `edit_file`，把 `    return sum(prices[1:])` 换成 `    return sum(prices)`；结果「已修改 cart.py」 | `rounds[2]` | 已核 |
| E6 | 第 4 次请求 9 条消息；模型调用 `run_tests({})`；结果「退出码 0 / 通过：total([3, 5, 2]) = 10」 | `rounds[3]` | 已核 |
| E7 | 第 5 次请求 11 条消息；响应 `finish_reason` 为 `stop`，没有工具调用，正文「测试通过了。我把 `cart.py` 里 `total` 的 `sum(prices[1:])` 改成 `sum(prices)`，因为原来的写法会跳过第一件商品的价格。」；循环结束后 Harness 自己再跑一遍测试，通过 | `rounds[4]`、`final_check`、`after` | 已核 |
| E8 | 5 次请求发出的消息数 2、5、7、9、11；`prompt_tokens` 489、683、835、987、1044；请求体 1243、2133、2834、3402、3724 字节 | 各轮 `len(request.messages)`、`response.usage`、`request_bytes` | 已核（2026-10-31 更正，见「复核」） |
| E9 | 第二次运行（`_b`）走的是同一条路（读两个文件 → 跑测试 → 改同一行 → 再跑 → 停），也是 5 次请求；`prompt_tokens` 489、683、775、915、972，与 `_a` 略有出入 | `out_01_harness_b.json` | 已核。片中数字只取 `_a` |
| E10 | 这个 Harness 每次请求都发送全部消息；工具只能访问项目目录里的文件，越界时返回「只能访问项目目录里的文件」；工具出错时把错误作为结果交回模型 | `01_harness.py` 的 `main()` 循环、`make_tools()` 里的 `inside()` | 已核（读源码）。越界在本次运行中没有触发 |

## 文档事实（D）

| 号 | 陈述 | 原始出处与定位 | 独立印证 | 核查 |
|---|---|---|---|---|
| D1 | 模型返回一个结构化的工具调用，由应用程序去执行，再把结果送回模型 | Anthropic 文档《Tool use with Claude》§ How tool use works：「Client tools … run in your application. Claude responds with `stop_reason: "tool_use"` and one or more `tool_use` blocks. Your code runs the operation and sends back a `tool_result`.」https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview | DeepSeek 文档《Tool Calls》§ Non-thinking Mode：「Note: In the above code, the functionality of the `get_weather` function needs to be provided by the user. The model itself does not execute specific functions.」https://api-docs.deepseek.com/guides/tool_calls ；实验 E3 | 2026-10-31 读原文，已核 |
| D2 | 模型本身不会执行代码 | LangChain，Vivek Trivedy，《The Anatomy of an Agent Harness》，2026-03-10，§ Why Do We Need Harnesses：「Out of the box they cannot: … Execute code …」https://www.langchain.com/blog/the-anatomy-of-an-agent-harness | D1 的 DeepSeek 引文 | 已核。旁白 o3「它只会输出文字」是对文本模型的简化：本片实验的模型只接收与输出文字（E2–E7） |
| D3 | 「Agent = Model + Harness」；Harness 是模型以外的全部代码、配置与执行逻辑 | 同 D2，§ Can Someone Please Define a "Harness"?：「Agent = Model + Harness」「A harness is every piece of code, configuration, and execution logic that isn't the model itself.」 | 用法印证：Anthropic 工程博客《Effective harnesses for long-running agents》，Justin Young，2025-11-26：「The Claude Agent SDK is a powerful, general-purpose agent harness …」https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents | 已核。公式是 LangChain 的概括，画面署名 |
| D4 | 循环：模型决定 → 执行工具 → 结果交回 → 重复，直到回复里没有工具调用 | Claude Agent SDK 文档《How the agent loop works》§ The loop at a glance：「Claude continues calling tools and processing results until it produces a response with no tool calls.」§ Turns and messages：「Turns continue until Claude produces output with no tool calls, at which point the loop ends …」https://code.claude.com/docs/en/agent-sdk/agent-loop | DeepSeek《Tool Calls》的四步流程；实验 E7（`finish_reason: stop`，无工具调用即停） | 已核 |
| D5 | 接口不记上下文，每次请求都要带上全部历史 | DeepSeek 文档《Multi-round Conversation》：「The DeepSeek `/chat/completions` API is a "stateless" API, meaning the server does not record the context of the user's requests. Therefore, the user must concatenate all previous conversation history and pass it to the chat API with each request.」https://api-docs.deepseek.com/guides/multi_round_chat | 实验 E8：消息数逐次增加，每次请求都含此前全部消息 | 已核。适用于本片所用接口；旁白 m1「模型自己不记事」指模型接口本身 |
| D6 | 上下文接近上限时，Harness 把较早的历史压成摘要 | Claude Agent SDK 文档 § Automatic compaction：「When the context window approaches its limit, the SDK automatically compacts the conversation: it summarizes older history to free space …」 | LangChain《The Anatomy of an Agent Harness》把 compaction 列为 Harness 的 Hooks/Middleware 之一 | 已核 |
| D7 | Harness 可以拦下工具调用；被拒绝时，模型收到的是一条拒绝消息 | Claude Agent SDK 文档 § Hooks：「a `PreToolUse` hook that rejects a tool call prevents it from executing, and Claude receives the rejection message instead.」§ Tool permissions：「When a tool is denied, Claude receives a rejection message as the tool result …」 | LangChain（D3 同文）：Harness 给模型「enforceable constraints」；本片 Harness 的路径限制（E10） | 已核。旁白 m4 只说「比如只许碰项目里的文件」，即 E10 |
| D8 | LangChain 报告：只改 Harness、模型固定为 `gpt-5.2-codex`，其编程 Agent 在 Terminal Bench 2.0 上从 52.8 升到 66.5；改的是系统提示、工具与中间件 | LangChain，Vivek Trivedy，《Improving Deep Agents with harness engineering》，2026-02-17，TLDR 与 § The Goal of Harness Engineering：「… `13.7 points` from `52.8` to `66.5` on Terminal Bench 2.0. We only tweaked the harness and kept the model fixed, `gpt-5.2-codex`.」https://www.langchain.com/blog/improving-deep-agents-with-harness-engineering | 数字只有 LangChain 自己的报告（转载不算独立印证），所以旁白写成「LangChain 报告」；榜单页面由前端渲染，未能读到条目 | 已核原文；作为报告引用 |
| D9 | 同一个模型换 Harness，分数差别与换模型相当 | Jiwoo Han、Yuekai Sun，《How good is your harness?》，ICML 2026 研讨会海报，摘要：「the harness matters as much as the LLM: the gains from simply picking the best harness are comparable to those from picking the best LLM.」https://icml.cc/virtual/2026/68323 | D8 | 已核摘要。支撑 m5 的一般说法 |

## 逐章

### open

| 句号 | 陈述 | 依据 |
|---|---|---|
| o1 | 「测试没通过，帮我修好」 | E2 的 user 消息 |
| o2 | 读代码、跑测试、改掉一行，测试通过 | E3–E7 |
| o3 | 模型本身不会动手，只会输出文字 | D1、D2 |
| o5 | Harness 是包在模型外面的一层程序 | D3 |
| o6 | Model + Harness，就是 Agent | D3（LangChain 的公式「Agent = Model + Harness」，画面署名） |

### ask

| 句号 | 陈述 | 依据 |
|---|---|---|
| a1–a4 | 第一次请求发出三样东西：项目文件说明、三个工具、用户那句话 | E2 |
| a5 | 模型回的仍是文字，格式特殊，叫工具调用 | D1；E3 的 `tool_calls`（JSON 文本） |
| a6 | 它要读两个文件，自己打不开 | E3；D1 |
| a7 | Harness 照着去读，把内容放回对话 | E3 的 `tool_results`；E10 |

### loop

| 句号 | 陈述 | 依据 |
|---|---|---|
| l1 | 带上整段对话再问一次 | D5、E8 |
| l2–l3 | 第二次要跑测试；失败，应为 10，实际 7 | E4 |
| l4–l5 | 第三次找到原因：漏算第一件；改掉这一行 | E5 |
| l6 | 第四次再跑：通过 | E6 |
| l7 | 第五次没有工具调用，循环停下 | E7、D4 |
| l8–l9 | 模型决定、Harness 执行、结果交回，这个循环是核心 | D4；D3（LangChain：「tool execution, feedback loops」） |

### more

| 句号 | 陈述 | 依据 |
|---|---|---|
| m1 | 模型不记事，每次重发整段对话 | D5、E8 |
| m2 | 五次请求，发出的对话从 2 条涨到 11 条 | E8 |
| m3 | 太长时 Harness 把旧的部分压成摘要 | D6 |
| m4 | 它管边界，比如只许碰项目里的文件 | E10、D7 |
| m5 | 同一个模型，换一套 Harness，本事不一样 | D9、D8 |
| m6–m7 | LangChain 报告：只改 Harness，分数 52.8 → 66.5 | D8 |

### end

| 句号 | 陈述 | 依据 |
|---|---|---|
| e1–e2 | 模型想、Harness 做并把结果交回 | D1、D4 |

## 取证中发现、没有进入成片的事实

- Harness 的边界并无统一定义：LangChain 取最宽的「模型以外的一切」；有评论者（Birgitta Böckeler，经搜索摘要得知，未读原文）认为 Harness 是 Agent 接入、用来解决具体问题的东西。片中只用 LangChain 的公式并署名。
- LangChain 把 Harness 的组成列为：System Prompts；Tools, Skills, MCPs；Bundled Infrastructure（filesystem, sandbox, browser）；Orchestration Logic（subagent spawning, handoffs, model routing）；Hooks/Middleware（compaction, continuation, lint checks）（D2 同文）。入门片不展开。
- Claude Agent SDK 的 `max_turns` 可以给循环设上限（D4 同页 § Turns and messages）。
- 历史：ReAct 论文（Yao 等，arXiv:2210.03629，2022-10-06 首次提交）提出让模型交替产生推理与行动；Anthropic 2024-05-30 宣布 Claude 3 全系列的工具调用正式可用（https://claude.com/blog/tool-use-ga）。150 秒内不讲历史。
- OpenAI《Unrolling the Codex agent loop》（2026-01-23，Michael Bolin）讲 Codex 的 Harness 与循环；页面返回 403，未读到原文，不作依据。

## 复核

- 2026-10-31 制作方按选定方向做关键帧时，逐条数了 `out_01_harness_a.json` 各轮 `request.messages`：实际发出 2、5、7、9、11 条，不是此前记的 3、6、8、10、12。原因是 `01_harness.py` 在追加模型回复之后才数条数、写进 `.txt`，事实表照抄了 `.txt`。已更正 E2、E4–E8、m2 与第 22 行，脚本已修（见 `lab/README.md` 勘误）；`prompt_tokens` 与请求体字节数取自 JSON，不受影响。旁白 m2 随之改为「2 条涨到了 11 条」，须重新交校对确认。
- 其余：未做（成片后进行）。
