# 事实出处

取证日期：2026-10-19（第 1 稿，BERT）；2026-10-20（第 2 稿，DeepSeek V4.1 Flash）。本片讲的是「决定用不用一个模型之前，模型卡上该先找什么」，讲法是沿一张真实的模型卡从上往下读。

**第 2 稿起换例子**：2026-10-20 WaterRun 认为 BERT 的例子太旧，要求按最新的模型举例，指定 DeepSeek V4.1 Flash。第 2 稿的陈述只来自下文「第 2 稿起的例子」一节与「模型卡这一说法的出处」；「一张真实的模型卡：google-bert/bert-base-uncased」一节只对应第 1 稿，保留作历史记录，不再进入旁白。本文件登记每一项陈述与出处；结构、时长分配与旁白措辞见 `MAP.md`，视觉方向见 `STYLE.md`。

本片没有实验回显：讲解对象是一份公开的模型卡与一篇公开的论文，两者的原文都逐字读过并记录了取用位置。画面上出现的每一个数字、每一段英文原文与年份都来自下表所列来源，没有另编的数字。

## 取证环境与来源

| 代号 | 材料 | 定位与取用方式 | 读取日期 |
|---|---|---|---|
| `paper-abs` | arXiv:1810.03993《Model Cards for Model Reporting》摘要页，<https://arxiv.org/abs/1810.03993> | 逐字读取摘要、作者列表、提交历史、期刊参考与 DOI | 2026-10-19 |
| `bert-card` | Hugging Face Hub 上 `google-bert/bert-base-uncased` 的模型卡原文，<https://huggingface.co/google-bert/bert-base-uncased/raw/main/README.md> | 取 `raw/main` 分支原文（非渲染页面），逐字读取 YAML 头与全部章节 | 2026-10-19 |
| `hub-doc` | Hugging Face Hub 官方文档 Model Cards，<https://huggingface.co/docs/hub/model-cards.md>（取其 Markdown 版本，原页为 Svelte 渲染） | 读取「What are Model Cards?」与「Model card metadata」两节 | 2026-10-19 |
| `hub-template` | `huggingface_hub` 仓库的官方模型卡模板，<https://github.com/huggingface/huggingface_hub/blob/main/src/huggingface_hub/templates/modelcard_template.md> | 逐字读取模板的全部栏目标题 | 2026-10-19 |
| `glue-site` | GLUE Benchmark 官网 <https://gluebenchmark.com/> | 读取页面 meta description 中 GLUE 的全称与定义 | 2026-10-19 |
| `ds-card` | Hugging Face Hub 上 `deepseek-ai/DeepSeek-V4.1-Flash` 的模型卡原文，<https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/raw/main/README.md>；读取时仓库 `main` 为 `314113f8`（2026-10-16 提交） | 取 `raw/main` 原文，逐字读取 YAML 头与全部章节 | 2026-10-20 |
| `ds-api` | 同一仓库的 Hub API，<https://huggingface.co/api/models/deepseek-ai/DeepSeek-V4.1-Flash> 与其 `commits/main` | 读取 `createdAt`、`pipeline_tag`、标签、文件列表与提交记录 | 2026-10-20 |
| `ds-report` | 卡里链接的技术报告 `DeepSeek_V41_Tech_Report.pdf`（同仓库，51 页），<https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf> | 下载后用 pdftotext 抽文字，读摘要与第 6 节「Conclusion, Limitations, and Future Directions」（第 37 页） | 2026-10-20 |
| `ds-card-1017` | 同系列小更新 `deepseek-ai/DeepSeek-V4.1-Flash-1017` 的模型卡原文（2026-10-17 建仓），<https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/raw/main/README.md> | 逐字读取，只作对照，第 2 稿不用 | 2026-10-20 |

`huggingface_hub` 仓库内的 `modelcard_template.py` 路径 2026-10-19 返回 404（模板已改为 `.md`），改用官方文档中给出的 `.md` 路径，位置见 `hub-doc` 的「What are Model Cards?」一节。

## 模型卡这一说法的出处

| 陈述 | 依据 | 状态 |
|---|---|---|
| 「模型卡」这个说法由一篇论文提出，论文题为 Model Cards for Model Reporting | `paper-abs` 标题与摘要：「In this paper, we propose a framework that we call model cards」 | 已读原文 |
| 论文作者为 Margaret Mitchell、Simone Wu、Andrew Zaldivar、Parker Barnes、Lucy Vasserman、Ben Hutchinson、Elena Spitzer、Inioluwa Deborah Raji、Timnit Gebru | `paper-abs` 作者行 | 已读原文 |
| 论文 v1 提交于 2018-10-05，v2 修订于 2019-01-14 | `paper-abs` dateline「[Submitted on 5 Oct 2018 (v1), last revised 14 Jan 2019 (this version, v2)]」与 Submission history | 已读原文 |
| 论文正式发表于 FAT* '19（2019-01-29 至 31，Atlanta），DOI 10.1145/3287560.3287596 | `paper-abs` 的 Journal reference 与 Related DOI 两行 | 已读原文 |
| 模型卡是「跟着训练好的模型一起发布的简短文档」 | `paper-abs` 摘要：「Model cards are short documents accompanying trained machine learning models」 | 已读原文，旁白 w1 为此句的中文转述 |
| 模型卡要提供有基准的评测，覆盖不同文化、人口统计或表型群体（例如种族、地域、性别、Fitzpatrick 皮肤类型）以及交叉群体 | `paper-abs` 摘要「provide benchmarked evaluation in a variety of conditions, such as across different cultural, demographic, or phenotypic groups … and intersectional groups」 | 已读原文。本片不逐项列举这些群体，避免堆叠定义；只用「评测」这一层 |
| 模型卡还要披露模型打算在什么场合使用、评测流程的细节以及其他相关信息 | `paper-abs` 摘要「Model cards also disclose the context in which models are intended to be used, details of the performance evaluation procedures, and other relevant information」 | 已读原文，旁白 w2 为此句的中文转述 |
| 论文里给了两个实例模型卡：一个检测图像中微笑人脸，一个检测文本中的有毒评论 | `paper-abs` 摘要「we provide cards for two supervised models: One trained to detect smiling faces in images, and one trained to detect toxic comments in text」 | 已读原文。本片不采用这两个实例，改用 BERT 的真实卡 |
| 论文提出模型卡是「走向负责任地普及机器学习及相关 AI 技术的一步」 | `paper-abs` 摘要「a step towards the responsible democratization of machine learning and related AI technology」 | 已读原文。本片不把这句写进旁白（属价值判断，见「不能说的话」） |
| Hugging Face Hub 的官方文档把模型卡列为模型仓库里的 `README.md`，并说模型卡应当描述模型、预期用途与潜在局限（含偏见与伦理考量）、训练参数与实验信息、训练数据集、评测结果 | `hub-doc`「What are Model Cards?」段的五项清单 | 已读原文 |
| Hub 文档在「预期用途与潜在局限」一项上直接引用 Mitchell, 2018（即上述论文） | `hub-doc` 同段：「including biases and ethical considerations as detailed in [Mitchell, 2018]」 | 已读原文 |
| 模型卡由两部分构成：YAML 里的元数据，与正文里的文字描述；两者信息有重叠 | `hub-doc`「Model Cards on the Hub have two key parts, with overlapping information: Metadata / Text descriptions」 | 已读原文，旁白 r1 的「机器读的元数据」对应这一层 |
| Hub 官方模型卡模板的一级栏目依次为 Model Details、Uses、Bias, Risks, and Limitations、How to Get Started with the Model、Training Details、Evaluation、Model Examination、Environmental Impact、Technical Specifications、Citation、Glossary、More Information、Model Card Authors、Model Card Contact | `hub-template` 全文的 `##` 标题 | 已读原文。模板与 BERT 那张真卡的实际栏目标题不同；本片讲的是后者，模板只作交叉印证：两者都把「用途」「局限与偏见」「评测结果」当作独立栏目 |

## 第 2 稿起的例子：deepseek-ai/DeepSeek-V4.1-Flash

以下全部取自 `ds-card` 的 `raw/main` 原文，另注来源的除外。旁白只用其中标了句号的几项。

| 陈述 | 依据（原文定位） | 状态 |
|---|---|---|
| Hub 记录的建仓时间为 2026-09-10，最近一次提交为 2026-10-16 | `ds-api` 的 `createdAt: 2026-09-10T02:17:58Z`、`lastModified: 2026-10-16T09:27:28Z`；`commits/main` 最早一条为 2026-09-10「initial commit」 | 已读。旁白不念日期；画面可写「2026-09」 |
| 卡头 YAML 元数据为 `license: mit`、`library_name: transformers`、`pipeline_tag: image-text-to-text` | `ds-card` 文件开头的 `---` 块 | 已读原文。旁白 r2「最上面几行写给机器看：许可证 MIT」据此；画面显示整个 YAML 块 |
| Hub 文档说 YAML 元数据用于让模型被检索、更易使用，例子包括在模型列表里筛选、显示模型的许可证 | `hub-doc`「Model card metadata」：「supports discovery and easier use of your model. For example: Allowing users to filter models … Displaying the model's license.」（2026-10-20 复读） | 已读原文。r2 的「写给机器看」是这一层的口语说法 |
| 卡里写明仓库与权重都以 MIT 许可证发布 | `ds-card`「## License」：「This repository and the model weights are licensed under the MIT License.」 | 已读原文，r2 |
| 模型原生处理图像与文字，输出文字 | `ds-card`「## Introduction」：「The model natively processes images and text, and generates text autoregressively.」 | 已读原文。第 2 稿不进旁白，画面上随 YAML 的 `image-text-to-text` 出现 |
| 卡里「Introduction」用大段篇幅讲结构：552B 骨干参数、预填充每 token 激活 8B、解码 16B、最长 100 万 token 上下文、CED 结构、CSA2、FP4 KV 缓存等 | `ds-card`「## Introduction」各段 | 已读原文。**不进旁白**：参数量属第 16 集《150 秒通过参数认识一个模型》，结构细节也不是决定用不用的条件；画面上镜头经过这一段，r3 只说「往下翻到成绩表」 |
| 指令模型的全部评测结果都用最高推理强度 `reasoning_effort=100`，采样 `temperature=1.0, top_p=0.95` | `ds-card`「### Instruct Model」首段：「All instruct results below use the maximum effort setting (`reasoning_effort=100`). Evaluations use `temperature=1.0, top_p=0.95`.」 | 已读原文，旁白 r4 |
| 推理强度是 1 到 100 的整数，可连续调节，用推理成本换准确率 | `ds-card`「Post-training」段：「continuously controllable reasoning effort setting (integer 1–100) that trades inference cost for accuracy」 | 已读原文。旁白 r5「调低能省钱，分数也可能更低」是这句的推论式转述：用「可能」，因为卡里没有给低档位的分数 |
| 编程智能体类测试（Terminal-Bench 2.1/3.0/4.0、DeepSWE v1.1、NL2Repo-Bench、ProgramBench）用 DeepSeek 自家 Harness 的 Minimal 模式与 100 万 token 上下文评测；为符合官方设置，DeepSWE v1.1 改用 mini-SWE | `ds-card`「### Instruct Model」第二段 | 已读原文。旁白不展开，r6–r7 只用下面那张跑法表 |
| 「Performance across agent scaffolds」一表：同一个模型在 DeepSWE v1.1（Resolved）上换 8 种跑法的分数为 Claude Code 69.8、Codex 65.6、OpenCode 65.5、Pi 66.2、mini-SWE 74.2、DSH Minimal 72.6、DSH Standard 70.5、DSH PTC 67.6 | `ds-card`「#### Performance across agent scaffolds」表格第一行 | 已读原文。旁白 o1「分数从 65.5 到 74.2」取这一行的最低与最高；r6「换了八种跑法」按表头 8 列计（其中 DSH 三列是同一个自家 Harness 的三种模式，所以说「跑法」不说「程序」）；r7 取 Claude Code 与 mini-SWE 两格 |
| 同表 Terminal-Bench 2.1 一行：Claude Code 88.0、Codex 84.1、OpenCode 85.0、Pi 86.1、mini-SWE 90.3、DSH Minimal 90.6、DSH Standard 85.8、DSH PTC 85.8 | 同表第二行 | 已读原文。旁白不用，画面上同表显示 |
| 跑法表的条件：DeepSWE v1.1 每题采样 N=8、Terminal-Bench 2.1 N=3，Linux 容器，`temperature=1.0`、`top_p=0.95`，100 万 token 上限，每个智能体最多 500 步；Terminal-Bench 2.1 断网评测 | 同节表上方一段 | 已读原文。画面上跟表一起出现，旁白不念 |
| DeepSWE v1.1 是卡里所说的编程智能体测试之一 | `ds-card`「For code agent benchmarks (Terminal-Bench 2.1/3.0/4.0, DeepSWE v1.1, …)」 | 已读原文。o1、r6 说成「编程测试」是简化，没有展开它考的是什么 |
| 「Comparison with frontier models」表里 DS-V4.1-Flash 的 DeepSWE v1.1 为 74.2（加粗），同行 Opus-5.0 为 74.0 | `ds-card`「#### Comparison with frontier models」 | 已读原文。旁白不用；74.2 与跑法表 mini-SWE 一格相同，与卡里「DeepSWE v1.1 用 mini-SWE」一致。对照表里其他模型用什么跑法，卡里没写 |
| 卡上没有写用途、局限、偏见或风险的栏目 | `ds-card` 全部 `##` 标题为 Introduction、Evaluation Results、Prompt Encoding、Minimal Inference、Reproducing DeepSWE Benchmark Results、License、Citation、Contact；全文检索 limitation、bias、intended、safety、risk、misuse、ethic 均无结果 | 已读原文，旁白 e1。只说「卡上没有专门一栏」，不说「开发方没写局限」：局限写在技术报告里，见下两行 |
| 卡里在标题下链接技术报告 | `ds-card` 第 40 行「Technical Report」链接指向同仓库的 `DeepSeek_V41_Tech_Report.pdf` | 已读原文，旁白 e2 |
| 技术报告第 6 节（第 37 页）标题为「Conclusion, Limitations, and Future Directions」；其中写明：跑分差距虽小，这种持平不意味着模型在复杂、高难度的推理与边缘情况上达到了领先闭源系统的前沿能力 | `ds-report` 第 37 页：「Although benchmark scores show a narrow margin, this parity does not imply that the model matches the frontier capabilities of leading closed-source systems on complex, high-difficulty reasoning and edge cases.」 | 已读原文，旁白 e3–e4 为此句的中文转述，「顶尖闭源模型」对应 leading closed-source systems |
| 同节还写：新结构带来尚未完全刻画的稳健性边界；有限的测试集覆盖不了所有极端输入与部署条件，CSA2 的选择误差与 SWA Bounded Replay 的近似重建可能在未测试的边界情况下导致能力下降 | `ds-report` 第 37 页第二段 | 已读原文。第 2 稿不进旁白（要先解释 CSA2 等结构），画面可截这一段 |
| 卡里的推荐采样参数：`temperature` 1.0，`top_p` 0.95 或 1.0，`context_window` 1M tokens，`max_tokens` ≥ 256K | `ds-card`「## Minimal Inference」表格 | 已读原文。第 2 稿不进旁白 |

### 对照与卡上过时的地方（不进旁白）

- `ds-card` 写「This release does not include a Jinja-format chat template」，但 `ds-api` 的文件列表里已有 `chat_template.jinja`，提交记录为 2026-10-01「Adding chat template (#68)」。卡上这句没有随仓库更新。
- `ds-card-1017` 自称「minor update」，卡上只有一张对比表。表中 DS-V4.1-Flash 一列的 NL2Repo-Bench 为 65.4，而 `ds-card` 同项为 64.0；两张卡对 Terminal-Bench 用哪种 Harness 的说法也不同（`ds-card` 为 DeepSeek Harness 的 Minimal 模式，`ds-card-1017` 脚注为 Claude Code）。原因卡里没有说明，本片不作解释。
- `ds-card` 与 `ds-card-1017` 都没有用途、局限一栏。

## 一张真实的模型卡：google-bert/bert-base-uncased（第 1 稿，第 2 稿起不再采用）

以下是本片的主角。全部取自 `bert-card` 的 `raw/main` 原文。

| 陈述 | 依据（原文定位） | 状态 |
|---|---|---|
| 这张模型卡是 Hugging Face 团队写的，不是发 BERT 的团队写的 | `bert-card` 标题下第一段：「Disclaimer: The team releasing BERT did not write a model card for this model so this model card has been written by the Hugging Face team.」 | 已读原文，旁白 e1、e2 为此句的中文转述 |
| 卡头的 YAML 元数据为 `language: en`、`tags: - exbert`、`license: apache-2.0`、`datasets: - bookcorpus / - wikipedia` | `bert-card` 文件开头的 `---` 块 | 已读原文。本片画面显示该 YAML 块；旁白不逐项读，只在 r1 说明「最上面是机器读的元数据」 |
| 这个模型用掩码语言建模（MLM）目标在英文语料上预训练，2018 年那篇 BERT 论文提出，首次发布在 google-research/bert 仓库 | `bert-card`「# BERT base model (uncased)」首段，链接指向 arXiv:1810.04805 与 github.com/google-research/bert | 已读原文 |
| uncased 指的是不区分 english 与 English 的大小写 | `bert-card` 同段：「This model is uncased: it does not make a difference between english and English.」 | 已读原文 |
| 自监督预训练指只用原始文本、没有任何人工标注，用自动过程生成输入与标签，因此能用大量公开数据 | `bert-card`「## Model description」首段 | 已读原文。本片不展开这一层，只用它解释 MLM 与 NSP |
| MLM 的做法是随机掩住输入中 15% 的词，让模型猜回被掩的词；这与逐词看的 RNN、以及内部掩掉未来词元的自回归模型不同，MLM 让模型学到句子的双向表示 | `bert-card`「Model description」第一条 bullet | 已读原文。本片不逐句讲，只在 r7 前用「卡里直接给了两个可以复现的例子」带过 |
| NSP 的做法是把两段句子拼在一起输入，模型判断它们原本是否相邻 | `bert-card`「Model description」第二条 bullet | 已读原文。本片不讲 |
| 卡里列了 8 个变体与参数量：bert-base-uncased 110M、bert-large-uncased 340M、bert-base-cased 110M、bert-large-cased 340M、bert-base-chinese 110M、bert-base-multilingual-cased 110M、bert-large-uncased-whole-word-masking 340M、bert-large-cased-whole-word-masking 340M | `bert-card`「## Model variations」的表格 | 已读原文。本片不采用这些参数量：与第 16 集《150 秒通过参数认识一个模型》分工，避免两集重叠 |
| 这个模型可以直接用于掩码语言建模或下一句预测，但主要意图是在下游任务上微调 | `bert-card`「## Intended uses & limitations」首段：「You can use the raw model for either masked language modeling or next sentence prediction, but it's mostly intended to be fine-tuned on a downstream task.」 | 已读原文 |
| 这个模型主要面向「用整句（可能带掩码）做决定」的任务，例如序列分类、词元分类、问答 | `bert-card` 同节：「this model is primarily aimed at being fine-tuned on tasks that use the whole sentence (potentially masked) to make decisions, such as sequence classification, token classification or question answering」 | 已读原文，旁白 r3 为此句的中文转述 |
| 做文本生成这类任务，应该去看 GPT2 这类模型 | `bert-card` 同节：「For tasks such as text generation you should look at model like GPT2」 | 已读原文，旁白 r4 为此句的中文转述 |
| 卡里在 Limitations and bias 一节给出两个可复现的填空例子。男人那句「The man worked as a [MASK].」的首选是 carpenter 0.09747550636529922，其后为 waiter 0.0523831807076931、barber 0.04962705448269844、mechanic 0.03788609802722931、salesman 0.037680890411138535 | `bert-card`「### Limitations and bias」的 Python 代码块与输出 | 已读原文。本片只用首选项的分数，旁白 r7 念 0.097 与 0.220 两位小数；完整数值保留在此表与画面角标 |
| 女人那句「The woman worked as a [MASK].」的首选是 nurse 0.21981462836265564，其后为 waitress 0.1597415804862976、maid 0.1154729500412941 | `bert-card` 同一代码块的第二段输出 | 已读原文，同上 |
| 卡里明写这个偏见会影响到所有基于它微调出来的版本 | `bert-card`「This bias will also affect all fine-tuned versions of this model.」 | 已读原文，旁白 r8 为此句的中文转述 |
| 卡里说明，即便训练数据可以称为「相当中性」，这个模型仍可能给出带偏见的预测 | `bert-card`「Even if the training data used for this model could be characterized as fairly neutral, this model can have biased predictions」 | 已读原文。本片不把这句写进旁白（会挤掉 r7 的分数），但保留在 FACTS 与画面 |
| 训练数据是 BookCorpus（11,038 本未出版书籍）与英文维基百科（去掉列表、表格和标题） | `bert-card`「## Training data」 | 已读原文。本片不讲 |
| 文本小写化后用 WordPiece 分词，词表 30,000；输入形如 `[CLS] Sentence A [SEP] Sentence B [SEP]` | `bert-card`「## Training procedure → Preprocessing」 | 已读原文。本片不讲 |
| 掩码规则：15% 的 token 被掩住，其中 80% 换成 `[MASK]`、10% 换成随机词、剩下 10% 原样不动 | `bert-card` 同节的四个 bullet | 已读原文。本片不讲 |
| 微调后的 GLUE 测试集结果为平均 79.6；各项为 MNLI 84.6/83.4、QQP 71.2、QNLI 90.5、SST-2 93.5、CoLA 52.1、STS-B 85.8、MRPC 88.9、RTE 66.4 | `bert-card`「## Evaluation results」的表格 | 已读原文，旁白 r9 只用平均值 79.6 |
| GLUE 的全称是 General Language Understanding Evaluation，是一组用于训练、评测与分析自然语言理解系统的资源 | `glue-site` 的 meta description：「The General Language Understanding Evaluation (GLUE) benchmark is a collection of resources for training, evaluating, and analyzing natural language understanding systems.」 | 已读原文。画面上把 GLUE 标为「自然语言理解测评集」即据此 |
| 卡里给 BERT 论文与 google-research/bert 仓库两处链接，并附 BibTeX 条目 | `bert-card` 首段链接与「### BibTeX entry and citation info」 | 已读原文。本片不念 |
| 卡里的许可为 apache-2.0 | `bert-card` YAML 头的 `license: apache-2.0` | 已读原文，画面显示 |

### 独立交叉核查

同一原始来源的转载不算独立印证，因此只对能真正互相印证的几项做了交叉：

- 「模型卡包含元数据与正文两部分」：`hub-doc` 的分节说明与 `bert-card` 实际文件结构（YAML 头 + Markdown 正文）一致。
- 「用途、局限与偏见、评测结果是独立的栏目」：`hub-template` 的官方模板有 `## Uses`、`## Bias, Risks, and Limitations`、`## Evaluation` 三个独立一级栏目；`bert-card` 的实际文件有对应的 `## Intended uses & limitations`、`### Limitations and bias`、`## Evaluation results`。两处栏目名不完全相同，本片讲的是后者，模板只用来确认这一分类是通行做法。

## 不能说的话

以下各项本次查过但证据不足或不适合进入旁白，逐条记录理由。

| 不能说的 | 理由 |
|---|---|
| 「模型卡已经成为行业事实标准」或「现在发布模型都必须写模型卡」 | 本次没有找到可复查的依据。`paper-abs` 只提出框架，未声称被广泛采纳；`hub-doc` 说明 Hub 提供模板与元数据 UI，这只说明工具存在，不等于强制要求或普遍采用。这属于趋势判断，本片不下断言 |
| 「模型卡由发模型的团队写」 | 与 `bert-card` 的免责声明直接矛盾。本片讲的正是相反的事实：这张卡由 Hugging Face 团队代写 |
| 「BERT 这个模型有 1.1 亿参数，因此适合在有限算力上跑」 | 参数量确实见 `bert-card` 的 variations 表，但「因此适合在有限算力上跑」是本片没有测量、也没有一手依据的推论。参数量整体属第 16 集，本片不碰 |
| 「这个偏见说明模型歧视某一性别」 | 卡里记录的是一组填空结果与其分数，并写明这个偏见会传染给所有微调版。把分数说成「歧视」是加上去的评价性判断，超出卡里的原文 |
| 「模型卡能防止模型被滥用 / 能提升模型安全性」 | `paper-abs` 只把模型卡说成「a step towards」负责任地普及相关技术，没有给出此类效果的量化证据。不写成定论 |
| 「GLUE 平均 79.6 说明这个模型表现好」 | 79.6 是这张卡在 2018 年那张表里的一个具体数字，本次没有取到同一张表的其他模型数值作对照，也没有核对测试集划分与评测脚本，说「好」没有依据。本片只报数字，不作评价 |
| 论文的两位作者姓名之外的完整作者名单 | 已读原文，但 96 秒放不下 9 个姓名，且对「怎么看模型卡」没有帮助。本片只在画面角标给论文标题与年份 |
| Hugging Face 官方模板的全部 14 个一级栏目 | `hub-template` 逐字读到了，但本片讲的是 BERT 那张真卡的实际栏目；把模板栏目全列出来会变成两份不同的清单，占掉 40 秒的重头段落 |
| 「DeepSeek 挑了最高的分数放进对比表」 | 对比表的 74.2 确实等于跑法表里最高的 mini-SWE 一格，但卡里写明 DeepSWE v1.1 用 mini-SWE 是「to align with official setup requirements」。说成挑分数是没有依据的动机判断 |
| 「DeepSeek V4.1 Flash 比 Opus-5.0 强」或「追平顶尖闭源模型」 | 对比表各项互有高低，且开发方自己在技术报告第 6 节写明持平的跑分不代表在高难度推理上追平。本片只转述这句 |
| 「这张卡没写局限」 | 卡上确实没有局限一栏，但技术报告第 6 节写了。旁白只说「卡上没有专门一栏」与「写在技术报告里」 |
| 「推理强度调低，分数一定下降 / 下降多少」 | 卡里只说这一设置「trades inference cost for accuracy」，没有给低档位的分数。旁白用「可能更低」 |
| 552B、8B / 16B 激活参数、MoE、100 万 token 等结构数字 | 已读原文，但参数量属第 16 集；结构也不是本片要回答的「先找什么」。画面上可经过，旁白不念 |
| 「八种不同的程序」 | 跑法表 8 列里 DSH Minimal / Standard / PTC 是同一个自家 Harness 的三种模式，所以旁白说「八种跑法」 |

## 制作署名

策划：WaterRun（依据：project.json 的 `production.planner`）。英文版片尾写 `Planning: WaterRun`。

开源视频：[本片源码](https://github.com/Water-Run/ft)（依据：project.json 的 `production.repository`；交付前核对公开仓库页面并记录日期与结果）。画面写 `开源视频：github.com/Water-Run/ft`，英文标签 `Open-source video`，网址须完整可读。

委托片（`production.mode: delegated`），准备方与受托方同时列出；同一模型的职责合并成一行。本片片尾只有 7.5 秒，行数比其他片更紧，**优先合并职责行，宁可少写一行也不要让片尾读不完**（F04、F14）。

| 参与模型（含可确认的版本） | 实际分工 | 记录依据 |
|---|---|---|
| MiniMax M3.1 Flash（本次会话确认的模型标识 `minimax-M3.1-Flash-Preview`） | 一手来源核实与事实测绘；96 秒定长中文文案；交审材料（NOTES.md、MAP.md）；液态玻璃视觉方向（STYLE.md） | 本次制作记录：2026-10-19 会话中逐字读取 arXiv:1810.03993 摘要页、BERT 模型卡 `raw/main` 原文、Hugging Face Hub 官方文档与 `huggingface_hub` 官方模板，并写出 `src/js/script.js` |
| Opus 5.5 | 2026-10-20 第 2 稿：DeepSeek V4.1 Flash 模型卡、Hub 提交记录与技术报告的取证，中文文案重写。受托方，**尚未开工**：场景实现、声音编排、封面、渲染、封装与成片后的三项审查 | `project.json` 的 `production.maker: Opus 5.5`。本轮只做第 0–2 步，未开工的部分据实记为尚未开工；开工后按真实记录追加实际使用的工具与版本 |
| 旁白合成 | **尚未合成，未使用任何语音服务**。文案确认后按 F17 先试听候选音色与语速、由策划者确认，再据实登记实际使用的服务与模型 | 本轮未运行 `tts.js`，`audio/` 为空 |
| 读音回听 | **未做** | 本轮未运行 `asr.js` |
| 网页检索与摘录 | 本次取证通过本地网络抓取工具直接读取公开页面原文（arXiv 摘要页、Hugging Face Hub 文档的 Markdown 版本、`huggingface_hub` 仓库的官方模型卡模板、BERT 模型卡的 `raw/main` 原文）。**该工具未披露底层模型，模型未披露** | 2026-10-19 会话记录；所读页面与取用位置见本文件「取证环境与来源」 |

图像生成模型：**未使用**，本片全部画面由受托模型按视觉方向以代码与 SVG 实现。

片尾名单只上画面，**不配旁白**：时间线用 `z1` 静默 cue（`pause: 7.5`、`credits: true`、无 `tts`、无字幕），88.00–96.00 秒。各语言、各交付视频版本都要有完整可读的名单（F14）。

## 文案审查

<!-- 文案稿经指定校对者 WaterRun 人工审查并明确确认后才配音（见 docs/script-review.md）。逐轮记录交审日期、内容 SHA-256 与结论；逐句意见在 review/NOTES.md 留存。 -->

| 轮次 | 交审日期 | 稿本 | 审查意见与修改 | 结论与日期 |
|---|---|---|---|---|
| 第 1 轮 | 2026-10-19 | 中文 `review/script.zh.35f01ec70b81811726827717c2c4b2fe9fa87cd6e5006b13f2f6e1bab3243b1c.md`，内容 SHA-256 `35f01ec70b81811726827717c2c4b2fe9fa87cd6e5006b13f2f6e1bab3243b1c` | 待 WaterRun 逐句核对。逐句依据见本文件各表；取舍见 `review/NOTES.md` | 尚未确认；`review/approval.json` 保持 pending |
| 第 1 轮（改名重导） | 2026-10-19 | 中文 `review/script.zh.17dfcf09139467d81d0875fa42d0101e52ea6260109434ae369aaaf3c491874c.md` | WaterRun 定片名为《96 秒速通模型卡》，旁白未改 | 未确认 |
| 第 2 轮 | 2026-10-20 | 中文 `review/script.zh.69820b4a79068764a860c9a45138d13aaff4859a3d2e2ec59e6f4dee80aa0c77.md`，内容 SHA-256 `69820b4a79068764a860c9a45138d13aaff4859a3d2e2ec59e6f4dee80aa0c77` | WaterRun：BERT 太旧，按最新的举例，考虑 DeepSeek V4.1 Flash。全稿重写：例子换成 `ds-card`，结论由「先读三栏」改为「先找许可证、分数的测法、局限写在哪」。见 `review/NOTES.md` | 待 WaterRun 审查；`approval.json` 保持 pending |

英文稿本本轮未导出：`src/js/script.js` 里的英文是直译草稿，中文确认后按中文重译，再导出英文稿本核对。

## 复核

<!-- 成片后记录核查范围、日期、依据、发现的问题与更正。未做的写「未做」。 -->
