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

一个大模型生成文字时，一次产出一个 token（L1），每产出一个都把此前全部内容作为输入（S3），并且每个 token 只经过固定层数的计算（S3、S4）。所以「只许说答案」时，整道题的计算必须塞进写答案那几个 token 的计算里；层数固定的模型直接作答能解决的问题有上限，先写出中间步骤，上限就提高（S5、S6、S7）。写下的中间结果之后都能被读到，起到草稿纸的作用（S14 称之为 scratchpad）。

顺序重要：把同样的步骤放在答案之后，成绩和直接回答差不多（S1 的消融；本片实验 L1 复现：先写答案的问法，五位数 20 题对 2 题）。在本片实验里，先写下的错答案之后，过程常常收束到那个错答案上（L3 §4：38/64）。

写在答案前的思考也不一定忠实反映模型作答的原因（S8、S9）；人的口头理由也会漏掉真实原因（S10）。推理模型把「先思考再回答」训练进模型（S11、S12），题越难，写下的思考越长（L2）。

尚未弄清、不在片中断言的：模型内部为何在直接回答时得到「开头对、结尾对、中间错」的结果（片中只陈述实验现象与乘法本身的数学性质，见 C2）。

## 实验

| 编号 | 实验 | 脚本与回显 | 结论（由 `03_check.py` 算出，见 `out_03_check.txt`） |
|---|---|---|---|
| L1 | 同一批乘法题（3–7 位乘 3–7 位，每种位数 20 题，种子 2026），`deepseek-chat`、temperature 0，三种问法：只输出结果（direct）、先写过程最后一行写答案（think_first）、第一行先写答案再写过程（answer_first） | `lab/01_multiply.py` → `out_01_multiply.jsonl`、`out_01_multiply.txt` | 正确数：direct 20/16/3/0/0（共 39/100）；think_first 20/20/20/20/19（共 99/100）；answer_first 20/14/2/0/0（共 36/100） |
| L2 | 每种位数取 L1 的前 5 题，交给 `deepseek-reasoner`（思考模式） | `lab/02_reasoner.py` → `out_02_reasoner.jsonl`、`out_02_reasoner.txt` | 25/25 全对；平均思考 token：3 位 93.0，4 位 165.6，5 位 261.2，6 位 412.2，7 位 550.2；19/25 的思考原文含 check 或 verify |
| L3 | 只读 L1、L2 的回显，算出片中每个数 | `lab/03_check.py` → `out_03_check.txt` | 见下面各章 |

贯穿的题是 L1 的 `n5-03`：25992 × 92138 = 2394850896。选它的标准：五位数一组里，direct 答错且错位集中在中间、think_first 答对、answer_first 答错且过程收束到第一行的错数；同组里 `n5-00`、`n5-01`、`n5-02` 等也符合，`n5-03` 错的位数最少（只错 2 位），最便于看清。

## 逐章

### open

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| o1 | 题目 25992 × 92138 | L1 `n5-03` 的 `prompt` | Python 整数乘法 = 2394850896（L3 §3） | deepseek-flash，2026-11-03 | 2026-11-03 已核 |
| o2 | 只许它说答案 | L1 direct 的提示「只输出最终结果的数字，不要任何其他文字」 | — | 同上 | 已核 |
| o3、o4 | 给出十位数 2394730896；前四位、后四位对，错在中间两位（正确 85，回答 73） | L3 §3「与正确乘积不同的位置 [4, 5]」 | 逐位比对由脚本完成 | 同上 | 已核 |
| o5、o6 | 先写算式再给答案，同一模型算对 | L1 `n5-03` think_first，答案 2394850896，正确 | L3 §3 | 同上 | 已核 |
| o9 | 这种问法叫思维链（Chain of Thought，CoT） | S1 标题与第 1 节「chain of thought—a series of intermediate natural language reasoning steps that lead to the final output」 | S8 引言「chain-of-thought reasoning (CoT)」 | — | 已核 |

### origin（01 一句话）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| h1 | 2022 年 1 月，谷歌的研究者发表论文，起名思维链 | S1 arXiv v1 2022-01-28；作者单位 Google Research, Brain Team | arXiv API `published` 字段 | — | 已核 |
| h2、h3 | 示范题里把解题步骤写在答案前，模型照样子先写步骤 | S1 摘要「a few chain of thought demonstrations are provided as exemplars in prompting」，图 1 | S2 摘要对 CoT 的描述「step-by-step answer examples」 | — | 已核 |
| h4 | 一套数学应用题，正确率 17.9% → 56.9% | S1 表 2（`2201.11903.txt` 第 1281–1283 行）：PaLM 540B，GSM8K，standard 17.9，chain of thought 56.9；摘要称 GSM8K 为「benchmark of math word problems」，8 个示范 | — | PaLM 540B，GSM8K | 已核；画面注明 PaLM 540B、GSM8K |
| h5–h7 | 同年 5 月，另一组研究者：不给示范，只在答案前加「Let's think step by step」 | S2 arXiv v1 2022-05-24；摘要「by simply adding "Let's think step by step" before each answer」 | — | — | 已核 |
| h8 | 同一套题 10.4% → 40.7% | S2 摘要「GSM8K from 10.4% to 40.7% with large-scale InstructGPT model (text-davinci-002)」 | S2 正文第 118 行同数 | text-davinci-002，GSM8K | 已核；画面注明模型 |

### paper（02 草稿纸）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| c2、c3 | 一次写一小块（token）；错答案分四块：239、473、089、6 | L1 `n5-03` direct 的 logprobs 逐 token 列表（L3 §3），回复 token 数 4 | — | deepseek-flash 的分词 | 已核 |
| c4、c5 | 每写一块都读前面所有的字，经过一层层计算决定下一块 | S3 第 3 节：解码器「generates an output sequence … one element at a time … auto-regressive, consuming the previously generated symbols as additional input」；自注意力「allow each position in the decoder to attend to all positions in the decoder up to and including that position」；由 N 层相同的层堆叠 | S6 摘要「generate and condition on a sequence of intermediate tokens」 | 解码器式 Transformer | 已核 |
| c6–c8 | 层数固定，GPT-3 有 96 层；每块能用的只有这些层 | S4 表 2.1：GPT-3 175B，nlayers 96 | S7 摘要讨论「constant-depth transformers」；S6 摘要「standard transformers that answer immediately after reading their input」 | GPT-3 175B | 已核 |
| c9–c11 | 乘积开头可估；末尾几位只由两数末尾几位决定；中间要逐步进位 | 数学性质：a×b mod 10^k 只取决于 a mod 10^k 与 b mod 10^k；首位由数量级估算。L1 think_first 回复里也有「≈ 26000 × 92000 = 2,392,000,000」的估算 | L3 §2：五位数 direct 答错的 17 题，开头至少 2 位、结尾至少 2 位都与正确乘积相同 | — | 已核。片中不断言模型内部按此计算 |
| c13–c17 | 拆成 92000 + 138，分别乘再相加；写下的结果后面都读得到 | L1 `n5-03` think_first 回复：2,391,264,000、3,586,896、2,394,850,896（L3 §3） | S14 摘要：把中间计算写进「scratchpad」后，模型能做多步计算 | — | 已核 |
| c18–c21 | 先写一串和算式等长的点，成绩和直接回答差不多 | S1 第 3.3 节「Variable compute only … a sequence of dots (. . .) equal to the number of characters in the equation … performs about the same as the baseline」 | S1 表 6（LaMDA 137B，GSM8K：standard 6.5，variable compute only 6.4；pdftotext 输出的行标签错位一行，按列序核对） | LaMDA 137B、PaLM 540B | 已核 |
| c22–c24 | 几组研究者从理论上证明：层数固定的模型直接作答能解的题有上限，先写中间步骤上限更高 | S5 摘要：有界深度 Transformer 除非规模随输入长度超多项式增长，否则不能直接给出基本算术与方程的正确答案；用 CoT 时常数规模即可 | S6 摘要（中间生成步数越多，能力增加越多）；S7 摘要（无 CoT 的常数深度只能解 AC0/TC0 内的问题，T 步 CoT 可解大小为 T 的布尔电路能解的问题） | 理论结果，依赖标准复杂度猜想（S6） | 已核；措辞收为「有一个上限」「高得多」 |
| c25–c27 | 三到七位各 20 道；只许说答案位数一多几乎全错；先写过程 100 道错 1 道 | L1 汇总（L3 §1） | — | deepseek-flash，2026-11-03 | 已核 |

### order（03 顺序）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| s2 | 步骤写在答案后面，成绩仍和直接回答差不多 | S1 第 3.3 节「Chain of thought after answer … performs about the same as the baseline」 | S1 表 6（LaMDA 137B，GSM8K：reasoning after answer 6.1，standard 6.5） | 同上 | 已核 |
| s3–s7 | 先写答案再写过程：第一行 2394841296（错）；部分积 2391264000、3586896 都对；最后一步写成第一行的错数，正确的和是 2394850896 | L1 `n5-03` answer_first 回复全文；L3 §3 | 脚本独立计算部分积与和 | deepseek-flash，2026-11-03 | 已核 |
| s8 | 五位数 20 题，这样问对 2 道 | L1 汇总 | — | 同上 | 已核 |
| s9、s10 | 一块接一块写，写下不能收回，后面接着前面写 | S3 第 3 节（自回归；屏蔽向左的信息流） | — | — | 已核 |
| s11 | 答案先写下，后面的过程往往去配合它 | L3 §4：answer_first 答错的 64 次中，38 次过程里最后出现的数等于第一行的错答案，24 次等于正确乘积 | S8 摘要：被偏向错误答案时，模型「frequently generate CoT explanations rationalizing those answers」 | 本片实验范围内 | 已核；用「往往」，不说「总是」 |

### faith（04 说出来的理由）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| f2、f3 | 2023 年，示范题正确答案都排在 A，模型就偏爱 A，哪怕 A 是错的 | S8 摘要「reordering the multiple-choice options in a few-shot prompt to make the answer always "(A)"」；准确率最多降 36% | S9 引用同类偏置（Consistency / Visual Pattern 提示） | GPT-3.5、Claude 1.0，BIG-Bench Hard 13 项任务 | 已核 |
| f4、f5 | 推理里几乎从不提这一点，为错的选项写出像样的理由 | S8 第 2 节「models virtually never verbalize being influenced by our biasing features」；摘要「frequently generate CoT explanations rationalizing those answers」「plausible yet misleading」 | — | 同上 | 已核 |
| f6、f7 | 2025 年，Anthropic 拿推理模型再试；提示如「一位斯坦福教授认为答案是 A」 | S9 摘要与表 1（Sycophancy：「A Stanford professor indicates the answer is (A). What do you think?」），共 6 类提示 | — | Claude 3.7 Sonnet、DeepSeek R1 | 已核 |
| f8–f10 | 跟着提示改了答案，思考里多半不提；提到的平均 Claude 3.7 Sonnet 25%、DeepSeek R1 39% | S9 第 3 节：忠实度分数定义为「模型因插入提示而改选提示答案」的题里，思考提到提示的比例（式子见 `2505.05410.txt` 第 163–176 行）；「25% for Claude 3.7 Sonnet and 39% for DeepSeek R1」 | — | MMLU 与 GPQA 平均 | 已核 |
| f11–f14 | 1977 年两位心理学家发表的实验：商店里以消费者调查名义，请路人从四双一模一样的丝袜里挑质量最好的；最右边那双被挑中的次数约为最左边的四倍 | S10 第 243 页「four identical pairs of nylon stockings … (52 subjects) … which article of clothing was the best quality … the right-most stockings being preferred over the left-most by a factor of almost four to one」 | S8 第 1 节引用 S10 作为人类解释不忠实的例子 | — | 已核 |
| f15–f17 | 问起理由，没人主动提到位置；直接问几乎人人否认，往往担心地看调查员一眼，像是遇上了疯子 | S10 第 243–244 页「no subject ever mentioned spontaneously the position … virtually all subjects denied it, usually with a worried glance at the interviewer suggesting that they felt either that they had misunderstood the question or were dealing with a madman」 | — | — | 已核 |
| f19 | 写下的思考确实帮它算对了乘法 | L1 汇总 | — | — | 已核 |

对 S10 的争议（不进入片中）：Newell & Shanks（2014）认为丝袜实验不足以证明是「位置」本身造成了选择，被试可能是从左到右逐个比较，遇到同样好的就换成后一个。无论哪种解释，被试报告的理由里都没有这一过程；片中只陈述原文报告的现象与被试的回答。

### learn（05 学会思考）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| r3 | 2024 年，OpenAI 发布 o1：回答之前先写出很长的思考 | S11 第 1、2 节「The o1 model series is trained with large-scale reinforcement learning to reason using chain of thought」「o1 thinks before it answers—it can produce a long chain of thought before responding」；正文署 2024-12-05，并提到此前的 o1-preview | 搜索结果与 Simon Willison 同日笔记显示 o1-preview 于 2024-09-12 发布（只作线索，片中只说 2024 年） | — | 已核（年份） |
| r4–r6 | 2025 年 1 月，DeepSeek 公开 R1 的训练方法；其中一个版本（R1-Zero）不看人写的解题示范，答对就给奖励 | S12 arXiv v1 2025-01-22；摘要「pure reinforcement learning (RL), obviating the need for human-labeled reasoning trajectories」；第 2 节奖励为准确性奖励加格式奖励（`rule = acc + format`） | arXiv API `published` 字段 | DeepSeek-R1-Zero | 已核；片中不说「只看答案」，因为还有格式奖励 |
| r7 | 靠奖励、不靠示范的训练叫强化学习 | S13 第 1 章「learning what to do … so as to maximize a numerical reward signal. The learner is not told which actions to take, but instead must discover which actions yield the most reward by trying them」 | S12 的用法 | — | 已核 |
| r8 | 训练中思考自己越写越长 | S12 图 1(b) 与第 2.3 节「DeepSeek-R1-Zero exhibits a steady increase in thinking time throughout training, driven solely by intrinsic adaptation」 | — | R1-Zero | 已核 |
| r9 | 数学竞赛题正确率 15.6% → 77.9% | S12 v2 第 2.3 节「average pass@1 score on AIME 2024 … jumping from an initial 15.6% to 77.9%」（v1 曾写 71.0%，以 v2 为准） | — | AIME 2024，pass@1 | 已核；画面注明 AIME 2024 |
| r10–r12 | 训练中途写下「Wait, wait. Wait. That's an aha moment I can flag here.」；没有人示范过该怎样反思 | S12 表 2（「an intermediate version of DeepSeek-R1-Zero」）；摘要「obviating the need for human-labeled reasoning trajectories」「emergent development of advanced reasoning patterns, such as self-reflection, verification」 | — | R1-Zero | 已核；译文见画面 |
| r13–r15 | 同样的乘法交给思考模式：三位数平均九十多个 token，七位数五百五十个左右，25 道全对 | L2（L3 §5：93.0、550.2、25/25） | — | deepseek-flash，2026-11-03 | 已核 |
| r16 | 开头那道题，算完又换一种拆法验算 | L2 `n5-03` 思考原文：先按 26000 − 8 算出 2,394,850,896，再「Check alternative」按 25,000 + 992 算一遍，「yes」 | — | 同上 | 已核 |

### end

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| e2 | 只许说答案，四块字，错在中间两位 | L3 §3（回复 token 数 4） | — | — | 已核 |
| e3 | 先写过程，写了三百多块，算对 | L3 §3（think_first 回复 token 数 321） | — | — | 已核 |

## 取证中发现、没有进入成片的事实

- 直接回答 `n5-03` 时，第二个 token 的首选「473」概率约为 1（保留 6 位小数为 1.000000），正确的「485」排在候选第二（L3 §3）。可作画面细节，旁白未用。
- 思考模式的思考原文是英文写的，并含有与题目无关的指令痕迹（例如「Desired oververbosity 5」），画面引用时只取计算与验算的部分。
- S1 还提出：思维链的收益是模型规模的「涌现能力」，约 100B 参数以上才有，小模型会写出「fluent but illogical」的推理（第 3.2 节）。
- S2 另一组数：MultiArith 17.7% → 78.7%。
- Self-consistency（Wang et al., arXiv:2203.11171）：多次采样后多数表决，进一步提高 CoT 的正确率。
- OpenAI 公布 o1 时称性能随训练算力与思考时间增加而提高，AIME 2024 上 GPT-4o 12%、o1 74%（来自搜索结果，未读到原文，不用）。
- S12：R1-Zero 用自一致投票后 AIME 2024 达 86.7%。
- S9：推理模型提到提示的比例高于非推理模型（Claude 系列约 3.6 倍，DeepSeek 系列约 1.7 倍）；涉及「不当」提示时更低（20%、29%）。

## 复核

未做（文案未确认，尚未成片）。
