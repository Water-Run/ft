# 事实出处

画面与旁白里的每一项事实都要有出处。优先级：亲手做实验取得的数据 > 源码 > 官方文档 > 其他。做法见仓库 `docs/guides/research.md`。待核实的内容不能进入定稿。

取证日期：2026-11-03。对象：大语言模型的思维链（chain of thought，CoT）——提出、起作用的原因、顺序的作用、写下的思考是否忠实、推理模型。实验对象：DeepSeek 开放平台接口（2026-11-03 调用）。

## 环境与版本

| 项 | 版本 | 获取方式 |
|---|---|---|
| 实验接口 | `https://api.deepseek.com/chat/completions`；请求 `deepseek-chat`（不思考）与 `deepseek-reasoner`（思考模式），两者返回的 `model` 字段都是 `deepseek-flash`；01 的 `system_fingerprint` 为 `bc19ba97cbe016479903222bb1578db6` | 2026-11-03 调用；密钥取自环境变量，不入库；回显里没有密钥与本机路径 |
| 实验脚本 | Python 3.14.3，只用标准库 | `research/lab/01_multiply.py`、`02_reasoner.py`、`03_check.py` |
| 论文全文（`research/_src/`，不入库） | 见下表，括号里是 PDF 的 SHA-256 前 16 位 | `https://arxiv.org/pdf/<编号>` 下载的当前版本，`pdftotext -layout` 抽文字后逐段核对 |

| 编号 | 出处 | 版本与日期 |
|---|---|---|
| S1 | Wei et al., *Chain-of-Thought Prompting Elicits Reasoning in Large Language Models*, arXiv:2201.11903，Google Research, Brain Team，NeurIPS 2022（`7d9f878c23b460e4`） | v1 2022-01-28；核对 v6（2023-01-10） |
| S2 | Kojima et al., *Large Language Models are Zero-Shot Reasoners*, arXiv:2205.11916，东京大学与 Google Research（`43a3d73c77c7f3e1`） | v1 2022-05-24；核对 v4 |
| S3 | Vaswani et al., *Attention Is All You Need*, arXiv:1706.03762（`bdfaa68d8984f0dc`） | 核对当前版本 |
| S4 | Brown et al., *Language Models are Few-Shot Learners*（GPT-3）, arXiv:2005.14165（`97fd272f1fdfc186`） | 核对当前版本 |
| S5 | Feng et al., *Towards Revealing the Mystery behind Chain of Thought: A Theoretical Perspective*, arXiv:2305.15408，北京大学（`d687c458042199c8`） | v1 2023-05-24；核对 v5 |
| S6 | Merrill & Sabharwal, *The Expressive Power of Transformers with Chain of Thought*, arXiv:2310.07923，ICLR 2024（`4017f54b9b7357d6`） | v1 2023-10-11；核对 v5 |
| S7 | Li, Liu, Zhou & Ma, *Chain of Thought Empowers Transformers to Solve Inherently Serial Problems*, arXiv:2402.12875（`cff0a965f7a27241`） | v1 2024-02-20；核对 v4 |
| S8 | Turpin, Michael, Perez & Bowman, *Language Models Don't Always Say What They Think*, arXiv:2305.04388，NeurIPS 2023（`f68cfafe59e7acef`） | v1 2023-05-07；核对 v2 |
| S9 | Chen et al.（Anthropic Alignment Science Team）, *Reasoning Models Don't Always Say What They Think*, arXiv:2505.05410（`546afa672e0c50d5`） | v1 2025-05-08 |
| S10 | Nisbett & Wilson, *Telling More Than We Can Know: Verbal Reports on Mental Processes*, Psychological Review 84(3), 1977 年 5 月, 231–259，DOI 10.1037/0033-295X.84.3.231（`850cc8ac4ce9323d`，取自加州州立大学长滩分校课程页面的扫描件） | 原刊扫描 |
| S11 | OpenAI, *OpenAI o1 System Card*, arXiv:2412.16720（`12718557d4b3bf08`） | 正文署 2024-12-05；arXiv v1 2024-12-21，核对 v2 |
| S12 | DeepSeek-AI, *DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning*, arXiv:2501.12948（`b191b0a365a64b4a`） | v1 2025-01-22；核对 v2（2026-01-04） |
| S13 | Sutton & Barto, *Reinforcement Learning: An Introduction*, 第 2 版，`http://incompleteideas.net/book/RLbook2020.pdf`（`2dd0d71d9ee883fb`） | 第 1 章第 1 页 |
| S14 | Nye et al., *Show Your Work: Scratchpads for Intermediate Computation with Language Models*, arXiv:2112.00114（`4b32d3fed294bac2`） | v1 2021-11-30 |

OpenAI 博文 *Learning to Reason with LLMs*（2024-09-12）用 curl 与网页抓取工具均返回 403，没有读到原文；o1 的事实只取 S11。

## 对象与解释路径

一个大模型生成文字时，一次产出一个 token（L1），每产出一个都把此前全部内容作为输入（S3）。产出一个 token，要从最底层算到最顶层，层数固定（S3、S4）；每一层的输入是上一层的输出，自注意力只看当前及之前的位置（S3 第 3.2.3 节），所以同一次计算里，结果只从下层往上层传。顶层算出的结果，要让后面的计算从底层用上，只能先产出成 token，再作为输入读回来（S3「consuming the previously generated symbols as additional input」）。因此不写中间步骤时，能一步接一步完成的串行计算受层数限制；写下 T 个中间步骤，这个上限随 T 增长（S7 引言；S5、S6）。写下的中间结果起到草稿纸的作用（S14 称之为 scratchpad）。

顺序重要：答案先写下，后面的步骤读得到它，却改不了它；把步骤放在答案之后，成绩和直接回答差不多（S1 的消融；本片实验 L1：先写答案 36/100、只报答案 39/100）。先写下的错答案之后，过程常常收束到那个错数上（L3 §4：38/64）。推理模型把「先思考再回答」训练进模型（S11、S12），题的位数越多，写下的思考越长（L2）。

片中「一趟」是本片对「从最底层算到最顶层、产出一个 token 的一次计算」的叫法（旁白说「我们叫它一趟」），不是论文术语。

尚未弄清、不在片中断言的：模型内部为何在直接回答时得到「开头对、结尾对、中间错」的结果（片中只陈述实验现象与乘法本身的数学性质，见 C2）。

## 实验

| 编号 | 实验 | 脚本与回显 | 结论（由 `03_check.py` 算出，见 `out_03_check.txt`） |
|---|---|---|---|
| L1 | 同一批乘法题（3–7 位乘 3–7 位，每种位数 20 题，种子 2026），`deepseek-chat`、temperature 0，三种问法：只输出结果（direct）、先写过程最后一行写答案（think_first）、第一行先写答案再写过程（answer_first） | `lab/01_multiply.py` → `out_01_multiply.jsonl`、`out_01_multiply.txt` | 正确数：direct 20/16/3/0/0（共 39/100）；think_first 20/20/20/20/19（共 99/100）；answer_first 20/14/2/0/0（共 36/100） |
| L2 | 每种位数取 L1 的前 5 题，交给 `deepseek-reasoner`（思考模式） | `lab/02_reasoner.py` → `out_02_reasoner.jsonl`、`out_02_reasoner.txt` | 25/25 全对；平均思考 token：3 位 93.0，4 位 165.6，5 位 261.2，6 位 412.2，7 位 550.2；19/25 的思考原文含 check 或 verify |
| L3 | 只读 L1、L2 的回显，算出片中每个数 | `lab/03_check.py` → `out_03_check.txt` | 见下面各章 |

贯穿的题是 L1 的 `n5-03`：25992 × 92138 = 2394850896。选它的标准：五位数一组里，direct 答错且错位集中在中间、think_first 答对、answer_first 答错且过程收束到第一行的错数；同组里 `n5-00`、`n5-01`、`n5-02` 等也符合，`n5-03` 错的位数最少（只错 2 位），最便于看清。

## 逐章

句号按第 6c 稿（2026-11-08）；配音前因字幕宽度与每句时长拆开的句子加后缀 b（如 o11b），与原句同一条依据。第 6 稿的核心主旨：模型每写一块字只有固定的一趟计算，层数造好就定了；要算得远，只能把中间步骤写下来，一趟接一趟；它能想多远并没有定死，要看回答之前写下了多少步。起承转合：起（开场两次回答与一个问题）、承（01 一块字的工夫：来不及算；02 草稿：写下的步越多，能连着算的步就越多）、转（03 越写越长：没人要求，它自己学会多写）、合（结尾）。第 5 稿的「03 先后」整章与开场第三次回答删去，先答再想只在 02 章末用三句带过（b14–b16）。

### open

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| o1 | 题目 25992 × 92138 | L1 `n5-03` 的 `prompt` | Python 整数乘法 = 2394850896（L3 §3） | deepseek-flash，2026-11-03 | 2026-11-03 已核 |
| o2 | 看一眼能估个大概：二十三亿多 | 数学：26000 × 92000 = 2,392,000,000，正确乘积 2,394,850,896，都是二十三亿多 | L1 think_first 回复里有「≈ 26000 × 92000 = 2,392,000,000」的估算 | — | 2026-11-07 已核 |
| o3 | 交给 DeepSeek，只许它报答案 | L1 direct 的提示「只输出最终结果的数字，不要任何其他文字」；请求 `deepseek-chat`，返回 `model` 为 `deepseek-flash` | — | 同上 | 已核 |
| o4、o5 | 十位数 2394730896；前四位、后四位对，错在中间两位（正确 85，回答 73） | L3 §3「与正确乘积不同的位置 [4, 5]」 | 逐位比对由脚本完成 | 同上 | 已核 |
| o6、o7 | 先写算式再给答案，同一模型算对 | L1 `n5-03` think_first，答案 2394850896 | L3 §3 | 同上 | 已核 |
| （第 6 稿删去）o8–o10 | 先写答案再写过程：拆分与两次乘法都对；最后一步相加写成 2394841296（应为 2394850896），正是这一次第一行的答案（与只报答案的 2394730896 不是同一个数） | L1 `n5-03` answer_first 回复全文；L3 §3「过程最后一行 '= 2394841296'；正确的和应为 2394850896；最后一行等于第一行的答案：True」 | 脚本独立计算部分积与和 | 同上 | 已核；「加错了」指和写错 |
| o11、o11b | 同一个模型、同一道题，差别只在答案之前有没有先写过程 | L1 的两种问法 direct 与 think_first，同一模型、temperature 0 | — | deepseek-flash，2026-11-03 | 已核 |
| o12、o13、o13b | 这种做法叫思维链（Chain of Thought，CoT），出自谷歌 2022 年的论文 | S1 标题、第 1 节「chain of thought—a series of intermediate natural language reasoning steps that lead to the final output」；arXiv v1 2022-01-28；作者单位 Google Research, Brain Team | S8 引言「chain-of-thought reasoning (CoT)」 | — | 已核；o14–o16 是提问 |

### pass（01 一块字的工夫）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| a1、a2 | 一次写一小块（token）；错答案只写了四块：239、473、089、6 | L1 `n5-03` direct 的 logprobs 逐 token 列表（L3 §3），回复 token 数 4 | — | deepseek-flash 的分词 | 已核 |
| a3–a5 | 模型里是一层叠一层的计算；写一块之前读入题目，从最底层算到最顶层，才定下这一块（第一块是 239） | S3 第 3 节：由 N 层相同的层堆叠；第 3.2.3 节「all of the keys, values and queries come from the same place, in this case, the output of the previous layer」；解码「one element at a time … auto-regressive」 | L3 §3（第一块 239） | 解码器式 Transformer | 已核 |
| a3b | 画面上每一片代表一层 | 画面约定，不是事实陈述 | — | — | 画面约定 |
| a6 | 从底到顶算一遍，「我们叫它一趟」 | 本片的叫法，指产出一个 token 的一次逐层计算（S3） | — | — | 用语，不是事实陈述 |
| a7、a8、a8b | 层数在模型造好时就定了，GPT-3 是 96 层；下一块不论难易，都只有这一趟 | S4 表 2.1：GPT-3 175B，nlayers 96；层数是结构参数，生成时不随内容变化（S3 第 3 节；S7 引言「the depth is a fixed number that depends on the architecture」） | S6 摘要「standard transformers that answer immediately after reading their input」 | GPT-3 175B 作例子；本片实验的 deepseek-flash 层数未公开，画面只标 GPT-3 | 已核 |
| a9 | 一趟里，算出来的东西只往上走 | S3 第 3.2.3 节：每层的输入是上一层的输出；解码器自注意力只看当前及之前的位置，「prevent leftward information flow」 | S7 引言：不写中间步骤时串行计算的步数以层数为上限 | — | 已核；后面的位置在每一层读得到前面位置同一层的结果，但不会把高层的结果送回低层 |
| a10、a10b | 顶上得出的结果，要让下一趟从底下接着用，只能先写成字 | S3 第 3 节「consuming the previously generated symbols as additional input when generating the next」 | S6 摘要「generate and condition on a sequence of intermediate tokens」；S7 引言「with T intermediate steps, the number of serial computations possible is boosted to T」 | 解码器式 Transformer | 已核 |
| a11 | 只许报答案，能这样接力的，只有写这四块的那几趟 | L3 §3（direct 回复 4 个 token）；a10 的依据 | S7 引言 | — | 已核；只说串行接力的趟数，不说「全部计算」 |
| a12、a13 | 写乘积从左往右（高位先写）；进位从右往左（低位往高位）；中间几位要等右边的进位 | 数学性质；高位先写见 L3 §3 的 token 顺序 239、473、089、6 | 末尾几位只由两数末尾几位决定（a×b mod 10^k 只取决于 a mod 10^k 与 b mod 10^k） | — | 已核；片中不断言模型内部按此计算（C2） |
| a14、a14b | 理论上，题目越长，这种一步等一步的计算，迟早超出这几趟能走的步数 | S7 引言（不写中间步骤时，串行计算以层数为上限）；S5 摘要：有界深度 Transformer 除非规模随输入长度超多项式增长，否则不能直接给出基本算术的正确答案 | S6 摘要 | 理论结果依赖标准复杂度猜想（S6、S7） | 已核；旁白用「理论上」「迟早」 |
| a15 | 它错的，也在中间 | L3 §3（错位 [4, 5]） | L3 §2：五位数 direct 答错的 17 题，开头至少 2 位、结尾至少 2 位都与正确乘积相同 | — | 已核；只陈述现象，「也」不表示因果 |
| a16 | 只报答案，它多半不是不会算，是来不及算 | 推断：同一模型先写过程时 99/100 算对（L1），只报答案时可接力的只有写答案那几趟（a10、a11；S7：不写中间步骤时串行步数受层数限制） | — | — | 推断，旁白不说「一定」 |

### draft（02 草稿）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| b1、b2 | 人算这道题会拿纸，算出一步写下来，下一步从纸上的数接着算 | 对人工笔算的描述 | — | — | 描述，不是研究结论 |
| b3 | 模型要打草稿，只能写进回答里 | S14 摘要：把中间计算写进「scratchpad」后，模型能做多步计算 | S1 第 1 节 | — | 已核 |
| b4 | 第二次在答案之前先写了三百多块 | L3 §3：think_first 回复 321 个 token，答案在最后一行 | — | deepseek-flash 的分词 | 已核；「三百多块」不含最后的答案行 |
| b5、b5b | 拆成 92000 + 138，分别乘，再相加 | L1 `n5-03` think_first 回复：2,391,264,000、3,586,896、2,394,850,896（L3 §3） | — | — | 已核 |
| b6–b8 | 每个中间结果写成字；下一趟从底下读到它接着算；一趟算不完的分给很多趟 | a10 的依据（S3）；S7 引言 | S14 | — | 已核 |
| b8b | 写下的中间步骤越多，它能连着算下去的就越长 | S7 摘要与引言：写下 T 步思维链，常数深度的 Transformer 能完成的串行计算随 T 增长（不写时受层数限制） | S6 | 理论结果 | 已核；说的是上限，不说一定算对 |
| b9、b9b–b11（b11：写的全是点，没有中间结果，下一趟没东西可接） | 谷歌那篇论文试过先输出一串和算式一样长的点，结果和直接回答差不多；每一块都是同一个点，什么也没接下去 | S1 第 3.3 节「Variable compute only … a sequence of dots (. . .) equal to the number of characters in the equation … performs about the same as the baseline」 | S1 表 6（LaMDA 137B，GSM8K：standard 6.5，variable compute only 6.4；pdftotext 输出的行标签错位一行，按列序核对） | LaMDA 137B、PaLM 540B；未专门训练的模型 | 已核；b11 只说写下的点本身不带上一步的结果，不说填充符号在任何训练下都无用 |
| b12、b13 | 一百道乘法（三到七位）；只报答案对 39 道，先写过程对 99 道 | L1 汇总（L3 §1）：direct 39/100，think_first 99/100 | — | deepseek-flash，2026-11-03 | 已核 |
| b14 | 把过程挪到答案后面，一百道只对三十六道 | L1 汇总（L3 §1）：answer_first 36/100（只报答案 39/100） | S1 第 3.3 节「Chain of thought after answer … performs about the same as the baseline」 | deepseek-flash，2026-11-03 | 已核 |
| b15 | 因为答案写下的时候，后面的过程还没写，接不上 | S3 第 3.2.3 节（屏蔽向左的信息流：每个位置只读得到它前面的位置）；第 3 节（自回归） | — | 解码器式 Transformer | 已核 |
| b16 | 错了的，过程多半顺着错数往回圆，有点像人的脑补 | L3 §4：answer_first 答错的 64 次中，38 次过程里最后出现的数等于第一行的错答案（59%），24 次等于正确乘积；人的一面取 S10 第 243–244 页（丝袜实验：人说出的理由常是事后按常识推出来的） | S8 摘要（被偏向错误答案时，模型常写出为其辩护的推理） | 本片实验；1977 年的心理学实验 | 已核；「多半」对应 38/64；「有点像」是类比，不说机制相同 |

### learn（03 越写越长）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| r1、r1b、r2 | 谷歌论文几个月后，有人发现在答案前加一句「Let's think step by step」，一套数学应用题的正确率从一成左右到四成 | S2 arXiv v1 2022-05-24（S1 之后约 4 个月）；摘要「by simply adding "Let's think step by step" before each answer」「GSM8K from 10.4% to 40.7% with large-scale InstructGPT model (text-davinci-002)」 | S2 正文第 118 行同数 | text-davinci-002，GSM8K | 已核；旁白读中文译文，画面给英文原句、模型与原数 |
| r3、r4 | 那时这只是写进提问里的一句话；后来被练进了模型 | S2（只改提示，不训练模型）；S11 第 1、2 节「The o1 model series is trained with large-scale reinforcement learning to reason using chain of thought」 | S12 | — | 已核 |
| r5 | 2024 年 OpenAI 发布 o1，回答之前先写一大段思考 | S11「o1 thinks before it answers—it can produce a long chain of thought before responding」；正文署 2024-12-05，并提到此前的 o1-preview | 搜索结果与 Simon Willison 同日笔记显示 o1-preview 于 2024-09-12 发布（只作线索，片中只说 2024 年） | — | 已核（年份） |
| r6、r7b | DeepSeek R1 的一个版本（R1-Zero，2025 年 1 月公开，日期只上画面）训练时不给它看人写的解题过程，答对就给奖励 | S12 arXiv v1 2025-01-22；摘要「pure reinforcement learning (RL), obviating the need for human-labeled reasoning trajectories」；第 2 节奖励为准确性奖励加格式奖励（`rule = acc + format`） | arXiv API `published` 字段 | DeepSeek-R1-Zero | 已核；片中不说「只看答案」，因为还有格式奖励；「训练时」限定在强化学习阶段 |
| r8 | 没人要求它想得更长，思考却越写越长 | S12 图 1(b) 与第 2.3 节「DeepSeek-R1-Zero exhibits a steady increase in thinking time throughout training, driven solely by intrinsic adaptation」；奖励只有准确性与格式两项，没有长度奖励 | — | R1-Zero | 已核；训练模板要求先写思考再写答案，所以说「没人要求它想得更长」，不说「没人叫它想」 |
| r9、r10 | 开头那道题交给 DeepSeek 的思考模式：先写了两百多块思考，才报出答案，算对了 | L2 `n5-03`：思考 220 个 token（L3 §3），最终答案 2394850896，正确 | — | `deepseek-reasoner`，返回 `model` 为 `deepseek-flash`，2026-11-03 | 已核 |
| r11、r12、r12b | 每种位数各取五道，二十五道全对；位数越多写得越长；三位数平均写九十来块思考，七位数五百五十块 | L2（L3 §5：25/25；平均思考 token 3 位 93.0、4 位 165.6、5 位 261.2、6 位 412.2、7 位 550.2） | — | 同上 | 已核；五档数字放画面 |
| r13 | 多写的每一块，都是多走的一趟 | a6 的定义（每产出一个 token 是一趟）；S3 | — | — | 按定义成立 |

### end

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| e3 | 它的层数，在造好的那一刻就定了 | a7 的依据（S4 表 2.1；层数是模型结构的一部分，训练与使用时不变） | S3 | — | 已核 |
| e4、e5 | 它能想多远，并没有定死，要看回答之前写下了多少中间步骤 | 对 a10、b6–b8b、b9–b11 的概括：串行计算的上限随写下的中间步骤增长（S7），只写点不算（S1）；所以说「多少中间步骤」，不说「多少字」 | r12（思考长度随位数增长，L2） | — | 推断 |
| e6 | 对它来说，先思考，就是先写下来 | 对全片的概括（b3–b8b、r13） | — | — | 推断 |

## 取证中发现、没有进入成片的事实

- 直接回答 `n5-03` 时，第二个 token 的首选「473」概率约为 1（保留 6 位小数为 1.000000），正确的「485」排在候选第二（L3 §3）。可作画面细节，旁白未用。
- 思考模式的思考原文是英文写的，并含有与题目无关的指令痕迹（例如「Desired oververbosity 5」），画面引用时只取计算与验算的部分。
- S1 还提出：思维链的收益是模型规模的「涌现能力」，约 100B 参数以上才有，小模型会写出「fluent but illogical」的推理（第 3.2 节）。
- S2 另一组数：MultiArith 17.7% → 78.7%。
- Self-consistency（Wang et al., arXiv:2203.11171）：多次采样后多数表决，进一步提高 CoT 的正确率。
- OpenAI 公布 o1 时称性能随训练算力与思考时间增加而提高，AIME 2024 上 GPT-4o 12%、o1 74%（来自搜索结果，未读到原文，不用）。
- S12：R1-Zero 用自一致投票后 AIME 2024 达 86.7%。
- S9：推理模型提到提示的比例高于非推理模型（Claude 系列约 3.6 倍，DeepSeek 系列约 1.7 倍）；涉及「不当」提示时更低（20%、29%）。
- 第 1 稿用过、第 2 稿删去的：S8 的「示范题答案都排在 A」实验（2023 年；模型偏爱 A，推理里几乎从不提，并为错选项写出像样的理由；GPT-3.5、Claude 1.0，BIG-Bench Hard），现在只作 s11 的独立印证；S5–S7 的理论结果只作 c5–c7 的依据；R1-Zero 在 AIME 2024 上 pass@1 从 15.6% 升到 77.9%（S12 v2 第 2.3 节；v1 曾写 71.0%）。第 3 稿再删去「强化学习」的定义（S13 第 1 章，原 r7），旁白只说「答对了，就给奖励」。第 4 稿删去「光多写字没用」这种把一组对照说成普遍规律的说法，改为让实验自己说话（c20–c22）。

- 第 5 稿删去第 4 稿的第 05 章「说出来的理由」：S9（Anthropic 2025，提示实验：Claude 3.7 Sonnet 25%、DeepSeek R1 39%，第 3 节）。S10（1977 年丝袜实验）在第 5d 稿作为 s9 的类比回到片中，只取一句。原因是策划者要求主线明确、「思想是核心. 简单, 有效.」，这一章是另一条线。S8 只留作 s8 的独立印证。同时删去 R1-Zero 训练中途的「aha moment」原句（S12 表 2）与 S1 的 17.9% → 56.9%（表 2，PaLM 540B）。
- 观众审读提出、片中没有展开的限定：后面的位置在每一层都读得到前面位置同一层的中间结果（KV 缓存），所以「一趟」不是把全文从头重算；片中要点只是高层的结果回不到低层，除非写成字（a9、a10）。专门训练过的填充符号在部分任务上有用的研究不在本片出处之列，b11 只说本片引用的实验。

## 复核

未做（文案未确认，尚未成片）。
