# 事实出处

《150 秒了解 LLM 的 Dense 和 MoE：稠密模型与混合专家模型》（「XX 秒速通」第 5 集）的事实记录。取证始于 2026-10-08。片长原为 96 秒，2026-10-09 先改为 128 秒（见「文案审查」第 5 轮），同日经第 6–8 轮审查改为 150 秒。

画面与旁白里的每一项事实都要有出处。优先级：亲手做实验取得的数据 > 源码 > 官方文档 > 其他。
按仓库 `docs/research.md` 阅读原始来源并做独立交叉核查；模型输出、记忆与搜索摘要只作线索。待核实的内容不能进入定稿，标题、字幕、封面与译文同样要核查。
实验脚本与完整回显放在 `research/lab/`；第三方源码、安装包等大文件放在 `research/_src/`（不入库），这里只记版本与获取方式。

## 环境与版本

| 项 | 版本 | 获取方式 |
|---|---|---|
| 实验模型 | OLMoE-1B-7B-0924（Allen Institute for AI，Apache-2.0），Hugging Face 仓库 `allenai/OLMoE-1B-7B-0924` 提交 `6d84c48581ece794365f2b8e9cfb043c68ade9c5`（2024-10-19） | `research/lab/01_fetch.py` 下载到 `research/_src/`，文件与 SHA-256 见 `out_01_fetch.txt` |
| 当前实例 | Qwen3.8-27B（提交 1d4bf0f2ff60，Apache-2.0）、Qwen3.8-2.4T-A95B（提交 207bd685a7e3）、Qwen3.8-Flash-Next（提交 de4b8e4d43b9；模型卡：Qwen3.8-Flash 是基于它的官方版本），Hugging Face 2026-08 发布 | `04_qwen_params.py` 只用 HTTP 范围请求读各分片的 safetensors 文件头逐个张量计数（不下载权重），回显 `out_04_qwen_params.txt`；`05_tokenize.py` 用 Qwen3.8-27B 仓库里的分词器切分开场字幕（2026-10-09 按新字幕重跑），回显 `out_05_tokenize.txt`；`06_qwen_detail.py` 用 04 缓存的文件头逐层计数、统计数据类型与字节数，并取 27B 第 0 层 `up_proj` 左上角 6×8 个权重原值；`07_cards.py` 摘 27B 与 2.4T 两张模型卡的原文行；`08_flash.py` 用 04 缓存的 Flash-Next 文件头按模型卡的口径逐类、逐层计数；`10_flash_card.py` 按提交号取 Flash-Next 模型卡，摘原文行与成绩表。04、06、08 在本机（WSL2，Python 3.12.3）运行，07、10 于 2026-10-09 运行 |
| 开源模型清单 | Hugging Face 上 2026-06-01 以后创建的模型仓库，2026-10-09 查得 | `09_survey.py`：画面上的 12 个模型逐个取模型卡（按当时的提交号）摘总参数与激活参数的原话，再读 config.json 看有没有专家数；另把 29 个 1000 亿参数以上的原创模型（不含量化版、他人转存与微调）逐个看 config.json。回显 `out_09_survey.txt`，结果 `survey.json` |
| 部署指南 | vLLM 官方部署配方 recipes.vllm.ai 的 Qwen3.8-2.4T-A95B、Qwen3.8-27B、Qwen3.8-Flash-Next 三页，2026-10-09 取得 | `11_recipes.py` 摘 2.4T 的「Choosing a variant」表、27B 的页首摘要、Flash-Next 关于 n-gram 嵌入卸载的一句，回显 `out_11_recipes.txt`，结果 `recipes.json`（页面会更新，以回显里的取用日期为准） |
| 推理环境 | Windows 11 x64，CPU，Python 3.14.3，PyTorch 2.14.1+cpu，transformers 5.19.0，bfloat16 | 虚拟环境建在 `research/_src/venv`（不入库） |
| 画面数据 | `tools/gen_data.py` 读上述实验的 JSON 结果，做自洽性断言（逐类计数 = 逐层计数之和；激活参数复算；层数、专家数与模型卡一致；Flash-Next 成绩表 12 项都高于 27B；两边权重都是 BF16），写出 `src/js/data.js` | 场景与封面里的数字、token 切分、权重原值、路由、模型卡原文、清单与成绩都取自 `data.js`，不手写。先后关系一段的四个模型（总参数与激活参数）取自论文与发布博客原文，在 `gen_data.py` 里注明 |
| 论文原文 | 见下表「文献」，均为 2026-10-08 取得的 PDF；SHA-256 前 16 位记在表里 | arXiv / 作者主页 |

**文献**

| 简称 | 文献 | 版本与校验 |
|---|---|---|
| Qwen3 2025 | Qwen Team, *Qwen3 Technical Report* | arXiv:2505.09388（84a5e2b1fa04bb77） |
| Qwen3.8 模型卡 | Hugging Face `Qwen/Qwen3.8-27B`、`Qwen/Qwen3.8-2.4T-A95B`、`Qwen/Qwen3.8-Flash-Next` 的 README 与 config.json | 提交号见上表，2026-10-08 / 10-09 取得 |
| vLLM 部署指南 | recipes.vllm.ai/Qwen/Qwen3.8-2.4T-A95B、…/Qwen3.8-27B、…/Qwen3.8-Flash-Next | 2026-10-09 取得，摘录见 `out_11_recipes.txt` |
| Jacobs 1991 | R. A. Jacobs, M. I. Jordan, S. J. Nowlan, G. E. Hinton, *Adaptive Mixtures of Local Experts*, Neural Computation 3, 79–87 (1991) | 扫描件 `cs.toronto.edu/~hinton/absps/jjnh91.pdf`（4af682881464b93b），页眉页脚核对 |
| Shazeer 2017 | N. Shazeer 等，*Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer*，ICLR 2017 | arXiv:1701.06538v1（2567713d198a376b） |
| GPT-3 2020 | T. Brown 等，*Language Models are Few-Shot Learners* | arXiv:2005.14165v4 |
| Kaplan 2020 | J. Kaplan 等，*Scaling Laws for Neural Language Models* | arXiv:2001.08361v1（a41bd7877fd1a6bc） |
| GShard 2020 | D. Lepikhin 等，*GShard* | arXiv:2006.16668v1（4078d81e9ef6db2e） |
| Switch 2021 | W. Fedus, B. Zoph, N. Shazeer，*Switch Transformers: Scaling to Trillion Parameter Models* | arXiv:2101.03961v3（f340f6ace31abf7d） |
| GLaM 2021 | N. Du 等，*GLaM: Efficient Scaling of Language Models with Mixture-of-Experts* | arXiv:2112.06905v2 |
| Mixtral 2024 | A. Q. Jiang 等，*Mixtral of Experts* | arXiv:2401.04088v1（f8bbf0e9d979b7a8）；发布博客 mistral.ai/news/mixtral-of-experts（2023-12-11） |
| Llama 3 2024 | Llama Team, *The Llama 3 Herd of Models* | arXiv:2407.21783v3（481f1599468f95a0） |
| OLMoE 2024 | N. Muennighoff 等，*OLMoE: Open Mixture-of-Experts Language Models* | arXiv:2409.02060v2（44511ee5d5a91914） |
| DeepSeek-V3 2024 | DeepSeek-AI, *DeepSeek-V3 Technical Report* | arXiv:2412.19437（取于 2026-10-08 的最新版，812a3fd645c80725） |
| Llama 4 2025 | Meta AI 博客 *The Llama 4 herd*（2025-04-05） | ai.meta.com/blog/llama-4-multimodal-intelligence/，2026-10-08 取得 |

## 逐章

<!-- 句号对应 src/js/script.js。状态：已核 = 读到原文且有第二路印证；实验 = 本片 research/lab 的实测；示意 = 画面上标「示意」的简化 -->

### open（0–24 秒）：引入——token、参数、计算量，以及要回答的问题

这一部分画面与旁白都不点模型的名字（策划者的要求，见第 7 轮）；用到的实测数据来自 Qwen3.8-27B，出处记在下表。

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| o1 | 大模型先把文字切成一个个 token | 实验 `out_05_tokenize.txt`：分词器把这句中文切成 8 个 token（大｜模型｜先把｜文字｜切成｜一个个｜ token｜。），英文句 8 个（Large｜ models｜ first｜ cut｜ text｜ into｜ tokens｜.）；画面用这组真实切分 | Qwen3.8-27B 模型卡「Token Embedding: 248,320 (Padded)」；DeepSeek-V3 2024 §4.1（Byte-level BPE） | Qwen3.8-27B 分词器，提交 1d4bf0f2ff60 | 2026-10-09 实验 |
| o2 | 模型里存着数以亿计的数字，叫作参数 | 实验 `out_04_qwen_params.txt`：Qwen3.8-27B 语言模型 26 895 998 464 个参数 | `out_02_params.txt`（OLMoE 69 亿）；模型卡「Number of Parameters: 27B」 | — | 2026-10-08 实验 |
| o3 | 每个 token 都要和这些参数逐一相乘 | Kaplan 2020 §2.1 式 (2.2)「Cforward ≈ 2N + …」：每个参数对每个 token 贡献一次乘加 | GLaM 2021 表 2：稠密模型每个 token 激活的参数数等于总参数数 | 稠密模型 | 2026-10-08 已核。**简化**：嵌入层是查表，另有随上下文长度增长的注意力项 |
| o4 | 参数越多，模型通常越强，要算的也越多 | Kaplan 2020 摘要「The loss scales as a power-law with model size, dataset size, and the amount of compute」 | 计算量同 o3 | — | 2026-10-08 已核；「通常」：还取决于数据量与训练量 |
| o5 | 能不能参数很多，每个 token 却只算一小部分？ | 设问 | Shazeer 2017 摘要「Conditional computation … increasing model capacity without a proportional increase in computation」 | — | 已核 |
| 画面 o1 | 开场字幕被切成 8 格（两种语言都是 8 格），标「一个大模型的分词器实测切分」 | `out_05_tokenize.txt` | — | Qwen3.8-27B 分词器 | 实验 |
| 画面 o2 | 6 行 × 8 列权重原值（−0.0035 +0.0024 …），标「一个 270 亿参数的稠密模型 · 第 0 层 up_proj · 左上角 6×8 个权重（BF16 原值）」；计数滚到 26 895 998 464，标「同一个模型（语言部分）· 按权重文件逐个张量计数」 | `out_06_qwen_detail.txt` 末 6 行；`out_04_qwen_params.txt` 语言模型一行 | 张量形状 [17408, 5120]、BF16 取自同一分片的文件头 | Qwen3.8-27B，提交 1d4bf0f2ff60 | 实验 |
| 画面 o2–o5 | 参数格墙：小墙 24×10 格、长大后 40×18 格；红色从左到右扫过 = 这个 token 用到的参数；o5 只亮约 5% 的格子 | 原理示意，画面标「示意」；o5 亮格的比例取 q3 Flash 的实测激活比例 4.78%（34/720 格），位置随机（固定种子） | — | — | 示意 |

### two（24–61 秒）：两种架构与路由

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| d1 | 稠密模型（Dense）：每个 token，全部参数都算 | OLMoE 2024 §1「dense models … which activate all parameters for every input」 | GLaM 2021 表 2 | 一般定义 | 2026-10-08 已核 |
| d2 | 每一层里，参数最多的一块是前馈网络 | 实验（`_src/headers` 缓存的 Qwen3.8-27B 文件头逐层计数）：64 层每层前馈 267 386 880，注意力 104 858 112 或 115 876 064，无一例外 | Kaplan 2020 表 1（dff = 4·dmodel 时前馈 8·dmodel²、注意力 4·dmodel²） | Qwen3.8-27B | 2026-10-08 实验 |
| d3 | 混合专家模型（MoE）把这一块换成许多个专家 | Shazeer 2017 摘要「consisting of up to thousands of feed-forward sub-networks」 | Qwen3.8 模型卡的 Hidden Layout（27B 每层是 FFN，2.4T 与 Flash-Next 每层是 MoE）；Mixtral 2024 摘要 | 一般定义 | 2026-10-08 已核 |
| d4 | 每来一个 token，路由器先给所有专家打分 | OLMoE 2024 §2 式 (1) 下文：「r, called the router, is a learned linear layer … A softmax is applied to the router outputs to compute routing probabilities for all N_E experts」 | 实验 `route.json`：每个 token 对 64 个专家各有一个概率，合计为 1（`gen_data.py` 断言） | OLMoE-1B-7B | 2026-10-09 已核 + 实验 |
| d5 | 只有得分最高的几个参与计算，这里是 64 选 8 | 同上式 (1) 的 Top-k；OLMoE 2024 表 1「64 small experts with 8 activated」 | 实验：复算的前 8 名 = 模型实际选中的专家（03 的断言） | — | 2026-10-09 已核 + 实验 |
| d6 | 它们的输出各乘以得分，再相加；其余专家不动 | OLMoE 2024 §2：「Each selected expert E_i processes the input x, the output of which is then multiplied with its respective routing probability. The results are then summed across all chosen Top-k experts」 | Shazeer 2017 §2；OLMoE 的 config `norm_topk_prob=false`（前 8 名的概率不再归一，画面上的得分就是相乘的系数） | OLMoE-1B-7B | 2026-10-09 已核。**限定**：有的模型先在前 k 名之间归一再相乘（Mixtral 2024 §2.1「G(x) := Softmax(TopK(x · Wg))」）；「按得分加权」对两种做法都成立 |
| d7 | 换一个 token，选中的专家往往就不同 | 实验 `out_03_route.txt`：演示句 17 个 token，在第 8 层（编号 7）选了 17 种不同的 8 专家组合；16 层里 14 层为 17/17，另 2 层为 16/17 | — | OLMoE-1B-7B，演示句 | 2026-10-09 实验。「往往」：并非每次都不同 |
| d8 | 路由器和专家一起训练；训练时还要防止它总挑同几个 | Shazeer 2017 §1「All parts of the network are trained jointly by back-propagation」；§4「the gating network tends to converge to a state where it always produces large weights for the same few experts. This imbalance is self-reinforcing」，并加一项 importance 损失 | OLMoE 2024 表 1：负载均衡损失「Auxiliary loss to penalize unequal assignment to experts」，权重 0.01 | — | 2026-10-09 已核 |
| 画面 d1 | 64 层的塔，每层按实测比例分成注意力与前馈两块，每 4 层一层全注意力（块略窄）；标「270 亿参数 · 64 层」；「100%」= 每个 token 用到的参数 | `out_06_qwen_detail.txt` 逐层计数与层型（LLLF 循环）；100% 同 d1 的出处 | 模型卡 Hidden Layout（3 × Gated DeltaNet → 1 × Gated Attention） | Qwen3.8-27B（画面不点名） | 实验 |
| 画面 d2 | 「其中一层」：注意力 115 876 064、前馈网络 267 386 880；脚注「全注意力层的注意力块为 104 858 112」 | `out_06_qwen_detail.txt` | — | Qwen3.8-27B | 实验 |
| 画面 d3 | 一层按 OLMoE-1B-7B 的实际比例重画：注意力 16 781 312 \| 路由器（黑色竖条，131 072）\| 64 个专家共 402 653 184 | `out_02_params.txt`（attention 268 500 992 ÷ 16 层；router 2 097 152 ÷ 16；experts 6 442 450 944 ÷ 16） | OLMoE 2024 表 1 | OLMoE-1B-7B-0924 | 实验 |
| 画面 d4–d6 | token「parameters」（演示句第 16 个 token）：64 格里升起灰柱，高度按路由概率；前 8 名（专家 59、26、5、46、16、17、4、0）涂红并写出得分 0.078 0.074 0.068 0.062 0.061 0.055 0.045 0.033；8 个红块带着得分移到下方，相加得到黄色的「这一层的输出」；「路由器：131 072 个参数，约占这一层的万分之三」 | `route.json` 第 8 层（编号 7）的 probs、experts、weights；`out_02_params.txt` | `gen_data.py` 断言：每行概率合计为 1、前 8 名与模型选中的一致、得分与模型的权重一致 | OLMoE-1B-7B-0924 | 实验 |
| 画面 d7 与右上角仪表 | 每拍一个 token，点亮路由器实际选中的 8 个专家（OLMoE 第 8 层）；「8 个在算 · 56 个不动」；「这一层：17 个 token，选了 17 种不同的组合（实测）」 | `out_03_route.txt` layer 7 一段；`route.json` | 03 脚本断言 | OLMoE-1B-7B-0924 | 实验。OLMoE 2024 表 1「No shared expert」，这里不示共享专家 |
| 画面 d8 | 两张 16 柱的小图：「不加约束：总挑同几个」与「加一项罚分配不均的损失」 | 原理示意，画面标「示意」并注出处（Shazeer 2017 §4；OLMoE 负载均衡损失权重 0.01） | — | — | 示意 |

### qwen（61–102.5 秒）：先后关系与今天的格局

全片只在这里点名 Qwen3.8 一次（m2）；之后只说「Flash」「27B」。

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| h1 | MoE 的想法更早，1991 年就有论文 | Jacobs 1991（*Adaptive Mixtures of Local Experts*，Neural Computation 3, 79–87）：由门控网络为每个输入挑选专家网络 | Shazeer 2017 §1.3「Since its introduction more than two decades ago (Jacobs et al., 1991; Jordan & Jacobs, 1994), the mixture-of-experts approach has been the subject of much research」 | — | 2026-10-09 已核 |
| h2 | 可大模型起初多是稠密的，比如 2020 年的 GPT-3 | GPT-3 2020 表 2.1「GPT-3 175B … 175.0B」；GLaM 2021 表 2「GPT-3 Dense Decoder-only 175B 175B」 | Switch 2021 摘要「In deep learning, models typically reuse the same parameters for all inputs」；Llama 3 2024 §1「we opt for a standard dense Transformer model architecture … rather than for a mixture-of-experts model … to maximize training stability」（405B 稠密） | — | 2026-10-09 已核。「多是」：同期已有 MoE 研究（Shazeer 2017、GShard 2020、Switch 2021），但当时最受关注的大模型是稠密的 |
| h3 | 后来 GLaM、DeepSeek-V3、Llama 4 等陆续用上了 MoE | GLaM 2021 L73–76「GLaM has 1.2T parameters in total with 64 experts per … activates a subnetwork of 96.6B (8% of 1.2T) parameters」；DeepSeek-V3 2024 摘要「a strong Mixture-of-Experts (MoE) language model with 671B total parameters with 37B activated for each token」；Llama 4 博客「our first built using a mixture-of-experts (MoE) architecture」 | Llama 4 博客「Llama 4 Maverick contains 17 billion active parameters, 128 experts, and 400 billion total parameters」 | GLaM 2021-12、DeepSeek-V3 2024-12、Llama 4 2025-04 | 2026-10-09 已核 |
| 画面 h1–h3 | 一条时间线：1991 年的示意图（门控网络为每个输入挑一个专家，标「示意」）与论文名、作者；2020 GPT-3 整块红「1750 亿 · 全部参与」；2021 GLaM「1.2 万亿 · 激活 966 亿」、2024 DeepSeek-V3「6710 亿 · 激活 370 亿」、2025 Llama 4 Maverick「4000 亿 · 激活 170 亿」，白底上一窄条红；方块面积按总参数，红条宽度按激活参数 | 同上各条原文；数字写在 `gen_data.py` 的 `history` 一段 | — | — | 已核；1991 的图为示意 |
| m1 | 如今最大的开源模型大多是 MoE，稠密多见于较小的型号 | 实验 `out_09_survey.txt`：2026-06-01 以后在 Hugging Face 发布、1000 亿参数以上的原创模型 29 个，config.json 全部有专家数（MoE）；查到的稠密新模型最大是 Apertus 1.5 70B（另有 Granite 4.2 30B / 8B、Qwen3.8-27B） | 画面 12 个模型的总参数与激活参数逐个取自各自模型卡的原话（见下一行）；Llama 4 博客「MoE architectures are more compute efficient for training and inference」 | 截至 2026-10-09 | 2026-10-09 实验 + 已核。**限定**：只看 Hugging Face 上公开的权重；「大多」比实测（29/29）保守，未穷尽所有发布 |
| 画面 m1 | 「2026 年 6 月以后发布的开源模型」12 条，按总参数排列，红 = 每个 token 激活的参数：Kimi K3 2.8T / 104B、LongCat-2.0 1.6T / 48B、MiMo-V2.6-Pro 1.02T / 42B、Inkling 975B / 41B、Hy4 preview 770B / 49B、K-EXAONE 2.0 750B / 37B、Nemotron 3 Ultra 550B / 55B、MiniMax-M3 428B / 23B、GLM-5.3-Flash 320B / 18B、Solar Open 2 250B / 15B（以上 MoE），Apertus 1.5 70B、Granite 4.2 30B（稠密，整条红）；脚注「另查：6 月以后发布、1000 亿参数以上的新模型共 29 个，全部是 MoE · Hugging Face，2026-10-09 查得」 | `out_09_survey.txt` CHART 一段：模型卡原话（如 Kimi K3 表格「Total Parameters 2.8T」「Activated Parameters 104B」、LongCat-2.0「1.6 trillion total parameters and ~48 billion activated per token」、Inkling「975B total, 41B active」、Granite「Decoder-only Dense Transformer」），提交号逐个记下 | config.json 的专家数与 MoE / 稠密一致（09 的断言）；Apertus 1.5 的 config 需登录，按同系列公开的 base 仓库核对（无专家数，`intermediate_size` 43008），模型卡「the same architecture as the original release, a decoder-only transformer」 | 截至 2026-10-09 | 实验 + 已核。**口径**：总参数以各模型卡为准，各家口径不完全一致（如 LongCat-2.0 含 1350 亿 n-gram 嵌入）；MiMo-V2.6-Pro 的仓库名为 `MiMo-V2.6-Pro-RL`，模型卡称其为「the flagship checkpoint of the MiMo-V2.6 series」；原话带「~」（约）的三个数——MiniMax-M3 的「~428B」「~23B」与 LongCat-2.0 的「~48 billion」——画面上省去了「~」，按 428B、23B、48B 显示 |
| m2–m3 | Qwen3.8 就是这样：Flash 和 2.4T 用 MoE，27B 是稠密的 | Flash-Next 模型卡 L63–64「Number of Experts: 512」「Number of Activated Experts: 10 Routed + 1 Shared」（`out_10_flash_card.txt`）；2.4T-A95B 模型卡「Number of Experts: 512」（`out_07`）；27B 模型卡 L20「a compact, deployment-friendly dense model」 | 实验：Flash-Next 与 2.4T 的文件头里有 `mlp.experts`（512 个），27B 没有专家张量（`out_04`、`out_08`）；Flash-Next 模型卡 L19「Qwen3.8-Flash is the official version based on Qwen3.8-Flash-Next」 | 提交见上表 | 2026-10-09 已核 + 实验。**限定**：Flash 是基于开源的 Flash-Next 的官方版本，参数按 Flash-Next 计（画面注明） |
| 画面 m2–m3 | 三个方块，面积按语言模型的参数个数：27B 26 895 998 464、Flash 125 710 814 080、2.4T 2 419 804 697 984；Flash 与 2.4T 标 MoE、左侧红条按激活比例（4.78%、3.94%），27B 整块红标稠密；「面积 = 语言模型的参数个数（按权重文件逐个张量计数）」 | `out_04`、`out_08` | — | — | 实验 |
| q3 | Flash 有 1250 亿参数，每个 token 只激活 60 亿 | Flash-Next 模型卡 L46「Number of Parameters: 125B with 6B activated, plus 51B n-gram embedding and 4B MTP」 | 实验 `out_08_flash.txt`：按卡的口径（语言模型，不含 n-gram 嵌入、MTP 头与视觉编码器）125 710 814 080；每个 token 激活 6 002 756 480（不含词表的输入嵌入与输出层，路由专家按 10/512 计，含共享专家），占 4.78% | 提交 de4b8e4d43b9 | 2026-10-09 已核 + 实验。另有 51 233 085 475 个 n-gram 嵌入参数与 2 607 150 848 个 MTP 参数，与卡一致地不计入 |
| 画面 q3 | Flash 的方块长成参数墙：48 行（层），每行按实际比例排开：注意力、每层的混合权重与共享专家（每个 token 都算，红）\| 路由器（黑线）\| 512 个专家（每行点亮 10 个，位置为示意）；每 4 行一道粗线（3 层 Gated DeltaNet + 1 层 Qwen Sparse Attention）；标「Qwen3.8-Flash-Next · 48 层，每层 512 个专家」「Flash 是基于它的官方版本（模型卡）」；计数 125 710 814 080 与 6 002 756 480 · 4.78%；模型卡原话一行 | `out_08_flash.txt` per layer 一行：注意力 57 958 624（线性）或 51 446 528（全注意力）、共享专家 4 917 760、路由器 1 310 720、单个路由专家 4 915 200、混合权重 13 209 600 | Flash-Next 模型卡 L50–51（48 层，Hidden Layout「12 × (3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE))」） | 提交 de4b8e4d43b9 | 实验；位置示意 |
| q6 | 每层选 10 个专家，外加 1 个每个 token 都用的共享专家 | Flash-Next 模型卡 L63–64「Number of Experts: 512」「Number of Activated Experts: 10 Routed + 1 Shared」 | 共享专家的含义：OLMoE 2024 §4.1.3「a shared/fixed expert that is always used in addition to the routed experts」；实验 `out_08`：每层都有 `mlp.shared_expert` 与 `shared_expert_gate` | 提交 de4b8e4d43b9 | 2026-10-09 已核 + 实验 |
| 画面 q6 | 墙上一行展开成「其中一层」：一格 = 一个专家，面积按参数个数；注意力（含混合权重，约 14.5 格）画成 2 格宽的红块；1 个共享专家格；路由器黑线；512 个路由专家排成 16 × 32，亮 10 格（位置为示意），「512 选 10」「+ 1 个共享专家」；「共享专家与每个路由专家几乎一样大：4 917 760 与 4 915 200 个参数」 | `out_08_flash.txt` per layer 一行；(57 958 624 + 13 209 600) ÷ 4 915 200 = 14.48 | 共享专家多出的 2 560 个参数是它的门控 `shared_expert_gate`（[1, 2560]） | 提交 de4b8e4d43b9 | 实验；位置示意 |

### tradeoff（102.5–142 秒）：各自的长处

例子只用前面出现过的 Qwen3.8（策划者的要求，见第 7 轮）；较早的模型只作出处，不进旁白与画面。

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| r1 | Flash 每个 token 只算 60 亿，成绩却高过 27B | Flash-Next 模型卡第一张成绩表（`out_10_flash_card.txt`）：表头「# Activated params 6B / 27B」；语言任务 12 项 Flash-Next 全部高于 27B：DeepSWE 1.1 58.7 / 42.2、SWE-bench Pro 62.5 / 61.7、SWE-bench Multilingual 81.0 / 73.8、NL2Repo-Bench 48.1 / 42.3、CoWorkBench 73.9 / 70.7、JobBench 55.7 / 33.4、Agents' Last Exam（Pass@1）24.3 / 20.4、Toolathlon Verified 73.5 / 67.1、IFBench 81.3 / 79.5、GPQA Diamond 91.7 / 89.2、HLE 35.9 / 30.8、LiveCodeBench v6 91.9 / 90.3 | 同卡第二张表（多模态 10 项）：9 项更高，OSWorld 2.0（Binary）持平 19.4 / 19.4，没有更低的 | 提交 de4b8e4d43b9 | 2026-10-09 已核。**限定**：成绩是 Qwen 自己报告的，模型为 Flash-Next（画面注明 Flash 是基于它的官方版本）；SWE-bench Pro 只高 0.8 |
| 画面 r1 | 账本：Flash「每个 token 算」60 亿（红）、27B 270 亿（红），同一把尺子；成绩 12 行，墨色 = Flash、灰 = 27B，每行写「Flash / 27B」；「12/12 项 Flash 更高」；标「Qwen3.8-Flash-Next 模型卡 · 语言任务 12 项 · Flash 是基于它的官方版本」 | 同上（条长取卡上表头的 6B、27B） | — | — | 已核 |
| r2 | 每个 token 算得少，推理就快，也更省钱 | Mixtral 2024 摘要「As it only uses a subset of its parameters for every token, Mixtral allows faster inference speed at low batch-sizes, and higher throughput at large batch-sizes」 | Llama 4 博客「MoE architectures are more compute efficient for training and inference」「offering high quality at a lower price compared to Llama 3」；Kaplan 2020 式 (2.2)（每 token 计算量约 2N，N 为参与计算的参数） | — | 2026-10-09 已核。**限定**：速度还取决于批量、显存带宽与硬件利用率（Mixtral 2024 §3） |
| 画面 r2 | 「= 27B 的约 1/4.5」（模型卡 6B 对 27B）；「更快」「更省钱」 | 同 r1、r2 | — | — | 已核 |
| r3 | 代价是内存：它的参数是 27B 的四倍多，全都得装进去 | Mixtral 2024 §3「The memory costs for serving Mixtral are proportional to its sparse parameter count」；Flash-Next 模型卡表头「# Params 125B / 27B」（4.63 倍） | Llama 4 博客「while all parameters are stored in memory, only a subset of the total parameters are activated」；实验：语言模型 125 710 814 080 对 26 895 998 464，4.67 倍（`out_08`） | — | 2026-10-09 已核 + 实验 |
| 画面 r3 | 「要装进内存」两条白条刷成蓝：Flash 1250 亿「251 GB」、27B 270 亿「54 GB」；「× 4.6」「模型卡：125B 与 27B」；脚注「权重按 BF16 计（语言模型部分，按文件逐个张量计数）；Flash 另有 510 亿 n-gram 嵌入，可卸到主机内存」 | 字节数：Flash 251 421 628 160（`out_08` 语言模型一行）、27B 26 895 998 464 × 2 = 53 791 996 928（全部张量为 BF16，`out_06`）；卸载：vLLM 部署指南 Flash-Next 页「a 51B lookup memory … can be asynchronously offloaded to host memory. (note that offload currently only runs on Nvidia devices)」（`out_11`） | Flash-Next 模型卡 L34「more amenable to offloading than Mixture-of-Experts」 | — | 实验 + 已核 |
| r4 | 反过来，参数一样多时，稠密更强：每个参数都派上用场 | Qwen3 2025 表 4、表 5：稠密的 Qwen3-32B-Base 与 MoE 的 Qwen3-30B-A3B-Base（总参数相近）在列出的 14 项上 32B 全部更高（如 MMLU 83.61 / 81.38、GPQA 49.49 / 43.94、CRUX-O 72.50 / 67.20）；§3.3（预训练评测）结论 (3)「With only 1/5 activated non-embedding parameters, Qwen3-30B-A3B … achieves comparable performance to Qwen3-14B-Base」 | Llama 4 博客的比较以「given a fixed training FLOPs budget」为前提（同计算量时 MoE 更好），与「同参数量时稠密更好」并不矛盾；d1（稠密每个 token 用全部参数） | Qwen3 系列（只作出处，不进旁白与画面） | 2026-10-09 已核。**限定**：比较对象是同一家、同一代、训练相近的模型 |
| 画面 r4 | 两块同样大小的 10×10 格墙（「参数一样多」）：稠密一列列全部涂红，MoE 只亮 8 格；中间的「=」换成「>」；「更强」「每个参数都派上用场」「每个 token 只用其中几格」 | 原理示意，画面标「示意」 | — | — | 示意 |
| r5 | 大模型跑在许多张显卡上，缺的是算力，所以大多用 MoE | vLLM 部署指南 2.4T 页（`out_11`）：BF16 权重 5871 GB，要 24 张 B300（268 GB）或 48 张 H200；FP8 也要 16 张 B300 | Llama 4 博客「MoE architectures are more compute efficient for training and inference and, given a fixed training FLOPs budget, delivers higher quality compared to a dense model」；m1 的清单 | 截至 2026-10-09 | 2026-10-09 已核。**归纳**：许多张卡合起来装得下全部参数，每个 token 的计算量随之成为主要成本，MoE 正好省这一项 |
| 画面 r5 | 「Qwen3.8-2.4T：BF16 权重 5871 GB」「要 24 张 B300 显卡（每张 268 GB）· vLLM 部署指南」；24 张卡刷成蓝（每张约 91%）「装得下」；一个 token 走过，每张卡亮一个红点「每个 token 只算 3.9%」；「MoE」 | `out_11`；3.9% = 95 287 866 752 ÷ 2 419 804 697 984（`out_04`）；红点为示意（画面注明） | — | — | 已核 + 实验；红点示意 |
| r6 | 要塞进一张显卡时，缺的是内存，稠密往往更合适 | vLLM 部署指南 27B 页（`out_11`）「Fits one Blackwell GPU in every precision」；r4（同样的参数量，稠密更强） | Qwen3.8-27B 模型卡 L20「a compact, deployment-friendly dense model」 | 截至 2026-10-09 | 2026-10-09 已核。「往往」：也有能放进一张卡的 MoE（Llama 4 博客：Scout 用 Int4 量化后「fits on a single H100 GPU」） |
| 画面 r6 | 「一张显卡」：卡里一块 27B，先蓝（装进内存）后红（每个参数都派上用场）；「显存装得下的参数有限」「稠密：装进去的每个参数都派上用场」；引原文「Fits one Blackwell GPU in every precision」，中文版另附「（每种精度都放得进一张 Blackwell 显卡）」，「vLLM 部署指南 · Qwen3.8-27B」 | 同上 | — | — | 已核；卡内比例为示意（未画容量刻度） |
| r7 | 稠密省内存，MoE 省计算：看缺的是哪一样 | 由 r1–r6 归纳 | Mixtral 2024 §3（计算成本随激活参数、内存成本随总参数） | — | 已核 |
| 画面 r7 | 左列稠密、右列 MoE，上行内存（蓝）、下行计算（红），块长按模型卡：稠密 27B / 27B，MoE（Flash-Next）125B / 6B；「省内存」「省计算」；读到「看缺的是哪一样」时两行标签反白 | Flash-Next 模型卡表头 | — | — | 已核 |

### outro（142–150 秒）

片尾名单，见「制作署名」；左侧一句概括取 r7「稠密省内存，MoE 省计算」。

## 文案审查

<!-- 文案稿经策划者 WaterRun 人工审查并明确确认后才配音（见 docs/workflow.md 第 2 步）。逐轮记录：交审日期、稿本（提交号或 script.js 的哈希）、审查意见与修改、确认日期。确认之后的实质改动另起一轮。 -->

| 轮次 | 交审日期 | 稿本 | 审查意见与修改 | 结论与日期 |
|---|---|---|---|---|
| 0 | 2026-10-08 | — | 标题：原片单「稠密和专家模型」，「专家模型」易与领域专家模型混淆、且 MoE 的专家是模型内的子网络；经策划者确认改为「稠密模型与混合专家模型」，英文 *Dense and MoE LLMs in 96 Seconds: Dense Models and Mixture-of-Experts Models* | 标题已确认（2026-10-08） |
| 1 | 2026-10-08 | `script.js` sha256 90b9d783f3e2… | 交审第 1 稿。意见：开头就要直观体现两种架构的差距；要表达 Dense 与 MoE 的发展关系；要有优劣分析；画面用蒙德里安的风格派（De Stijl），要有极大的冲击力；配音契合这种风格 | 按意见重写为第 2 稿 |
| 2 | 2026-10-08 | `script.js` sha256 1d5c729b4898… | 交审第 2 稿：四场改为「差距 → 机制 → 发展 → 优劣」。意见：缺引入语，稠密与 MoE 无缘无故出现，观众没有基本概念 | 重写为第 3 稿 |
| 3 | 2026-10-08 | `script.js` sha256 45af3dbdb16a… | 交审第 3 稿：先讲 token 与参数、计算量与模型强弱的矛盾，以设问引出稠密与 MoE。意见：例子要新（如 Qwen 3.8 系列）；写成了「从 Dense 到 MoE 的进化」，标题是「了解 LLM 的 Dense 和 MoE」 | 重写为第 4 稿 |
| 4 | 2026-10-08 | `script.js` sha256 9093d5095894… | 交审第 4 稿：两种架构并列讲解；实例换成 Qwen3.8（稠密 27B 与 MoE 的 Max） | 策划者回复「开始吧，自主完成视频制作」，确认第 4 稿（2026-10-09）；音色与配乐交由制作者决定：中文 Yunyang、英文 Eric，配乐用程序合成的 boogie-woogie |
| 5 | 2026-10-09 | `script.js` sha256 308b6e05e717… | 策划者核查 96 秒成片时指出：没有说 MoE 参数就一定比稠密多（无条件比较）；路由选专家一句带过；要求「片长改为 128 秒，合理组织，确保不要陷入局限」。改为 128 秒：路由扩成 d4–d8，加共享专家，比较带上前提 | 按指示组织并完成（2026-10-09），新稿未单独交审 |
| 6 | 2026-10-09 | 128 秒稿（交审时贴出全文） | 策划者要求「提供给我稿子看看」后指出：「27B 容易部署是因为他小，另外没有体现 Dense 和 MoE 发展的先后关系。MoE 的例子应该是 3.8 Flash」。改：加入先后关系（想法更早 → 大模型起初多是稠密 → 后来用上 MoE）；MoE 的例子换成 Qwen3.8-Flash；去掉「27B 便于部署」这类与架构无关的理由 | 重写后交审「最终的完整稿件」 |
| 7 | 2026-10-09 | 第 7 稿（交审时贴出全文） | 意见（原话）：「第四部分。27B 便于部署因为他小和视频的主题有什么关系？只用一部分是缺点吗？比如一个激活参数 10B 总 100B，和一个 100B 的 Dense 呢？自己思考下。MoE 和 Dense 的优缺点究竟是什么，前后者水平一样吗」；「还是不要局限，按你这个说 Dense 就没存在意义了，比如 Qwen 3.8 27B 为什么不是 Qwen 3.8 A3B 然后 27B 呢？……另外第四部分你直接举例就行，为什么一定要拉一个老模型出来？意思表达出来就行啊，例子就前面的 Qwen 3.8」；「包括为什么 MoE 现在是绝对主流了，Dense 只在一些小模型上」；「第一部分不要专门提及 Qwen 3.8，只要第三部分出现一次即可」；「第四部分讲性能的也可以说」。改：第四部分重写为 r1–r7（Flash 的成绩与推理开销 → 代价是内存 → 同参数量稠密更强 → 许多张卡缺算力、一张卡缺内存 → 结论），例子只用 Qwen3.8；第三部分加 m1（今天的格局）；Qwen3.8 全片只点名一次（m2）；第一部分不提 Qwen3.8 | 第 8 稿交审 |
| 8 | 2026-10-09 | 第 8 稿，按 150 秒排；交付时 `script.js` sha256 075b80a8d59c… | 策划者回复「150秒吧. 开始制作视频.」，确认第 8 稿与 150 秒片长（2026-10-09）。随后又说「对了 3 那个模型卡 新一点吧 起码 26 年 6 月之后的」：第三部分 m1 的模型清单改为 2026 年 6 月以后发布的模型（`09_survey.py`），旁白不变。确认后的非实质改动：m2 一句拆成两条字幕（m2「Qwen3.8 就是这样：Flash 和 2.4T 用 MoE」、m3「27B 是稠密的」，措辞不变，单条不超过 6 秒）；中文第三、四部分的句间停顿加长；第四部分起点由 102 秒改为 102.5 秒（英文第三部分说完需要） | 已确认（2026-10-09） |

## 制作署名

策划：WaterRun（依据：仓库制作规范）。

开源视频：[GitHub · Water-Run/ft](https://github.com/Water-Run/ft)（依据：仓库制作规范；交付前核对公开仓库页面并记录日期与结果）。

| 参与模型或服务（含可确认的版本） | 实际分工 | 记录依据 |
|---|---|---|
| Claude Opus 5.5 | 取证（含 OLMoE 实验、Qwen3.8 文件头计数、开源模型清单）、脚本、翻译、视觉设计、场景、配乐与音效、封面、审查、文档 | 本次制作会话 |
| Microsoft Edge 在线语音（经 edge-tts；模型未披露） | 旁白合成：中文 zh-CN-YunyangNeural（+6%），英文 en-US-EricNeural（+8%） | `project.json` 的 `voices`、`rates`；`kit/tools/tts.py` |
| Whisper small（faster-whisper，int8，CPU） | 读音回听（`asr.js`、`tts_probe.js`） | `kit/tools/asr.py` 缺省模型 `fw-small` |
| WebSearch、WebFetch（Claude Code 的网页检索与摘录工具；摘要所用模型未披露） | 取证时检索与摘录网页，结论均回到原始来源核对 | 本次制作会话的工具调用记录 |

不列入名单的：OLMoE-1B-7B 与 Qwen3.8 的分词器、权重文件头、各模型卡与部署指南是取证对象，不参与制作。

片尾名单（`src/js/scenes/s4_outro.js`）：策划 WaterRun；取证 · 实验 · 脚本 · 翻译 · 视觉 · 动画 · 配乐 · 审查 Claude Opus 5.5；旁白合成 Microsoft Edge 在线语音（模型未披露）；读音回听 Whisper small；网页检索与摘录 WebSearch · WebFetch（模型未披露）；开源视频 github.com/Water-Run/ft。英文版对应 Planning / Research · experiments · script · translation · design · animation · score · review / Narration voice / Read-back check / Web lookup / Open-source video。

## 复核

2026-10-09，制作者（Claude Opus 5.5）对渲染前的页面与最终成片逐项核对。96 秒、128 秒两版的复核记录见本文件的提交历史；下面各项都以 150 秒版为准。没有经过人耳试听与人眼通看，相关项写在最后。

**事实**

- 逐句对照：`sheets.js cue` 取两种语言每句说完那一刻的画面（各 28 帧），另沿第三、四部分每 1.5 秒取一帧（各 54 帧），把画面上的每段文字与上表逐条比对；数字全部取自 `src/js/data.js`，由 `tools/gen_data.py` 生成，生成时断言逐类计数与逐层计数一致、激活参数复算一致、层数与专家数与模型卡一致、Flash-Next 成绩表 12 项都高于 27B、两边权重都是 BF16。
- 第 6–8 轮新增的陈述，2026-10-09 逐条回到原文核对：Shazeer 2017 §1.3（引 Jacobs et al., 1991）；GPT-3 2020 表 2.1 与 GLaM 2021 表 2（GPT-3 稠密 175B）；Llama 3 2024 §1（选稠密而不用 MoE）；GLaM 2021 L73–76；DeepSeek-V3 2024 摘要；Llama 4 博客（first MoE、Maverick 400B / 17B、compute efficient、stored in memory、lower price、Scout 单卡）；Mixtral 2024 摘要与 §3；Qwen3 2025 表 4、表 5 与 §3.3 的结论 (3)。表 4 与表 5 的 14 项逐项比对后才写「32B 全部更高」。
- 模型卡与部署指南：Flash-Next 模型卡按提交号重新取得（`10_flash_card.py`）；清单里 12 个模型的总参数与激活参数逐个按模型卡原话摘录（`09_survey.py`），没有用 Hugging Face 接口给出的张量元素数（量化打包的仓库会偏离真实参数量）；vLLM 部署指南三页于 2026-10-09 取得（`11_recipes.py`）。vLLM 的 Flash-Next 页把 n-gram 嵌入写成「125B parameters, including an additional 51B N-gram embedding table」，与模型卡「125B … plus 51B n-gram embedding」不一致；文件头计数支持模型卡（语言模型 1257 亿，另有 n-gram 嵌入 512 亿），画面按模型卡。
- 示意：开场的参数格墙（o2–o5）、d8 的两张小图、1991 的门控示意图、r4 的两块格墙、r5 每张卡的红点是原理示意，画面标「示意」；q3 墙与 q6 单层里点亮的专家位置标「位置为示意」，比例是实测值。
- 画面上没有本机路径、主机名或用户名：对 `src/`、`research/`、`tools/` 与 `README.md` 做了关键字检索，只有策划者署名 WaterRun。

**读音与节奏**

- `asr.js`（Whisper small）回听仅旁白的音轨，150 秒版 28 句：中文的差异都是同音或近音识别（稠密→绸密/仇密、千问→前问、参数→残属、激活→击活、层→曾、Flash→Fresh、推理→退离、跑→泡）；英文只有 r7 句首「Dense」听成「It」，另用 `tts_probe.js` 单句合成回听为「Dense saves memory」，判断是整段回听时的切分误差，读音无误。新读法：DeepSeek-V3 中文读作「DeepSeek V 三」、2.4T 读作「二点四 T」、Qwen3.8 读作「千问三点八」（英文 Qwen three point eight），回听均对得上。
- `stats.js`：中文每秒 3.48–5.44 字，英文每秒 1.71–3.59 词；没有过快、超过 6 秒或停顿过短的句子（m2 原为一条 6.3 / 6.8 秒的字幕，拆成两条后通过）。

**旁白与画面对应**

- 逐帧总览里查出并改掉：1991 的示意图里四个专家一开始就全是红的（改为只有门控挑中的那一个变红）；论文名与「2020」相压、时间线上方的标签挤到画面顶端（名称与参数移到线下，方块略缩）；单层面板里注意力画成了大块，与参数墙的比例矛盾（改为按参数个数，约 14.5 个专家大小）；「参数一样多」压住「稠密」；结论页的「省内存」在色块画出之前就出现、底部注记被竖线切断（镜头提前到达、注记换行）；成绩表的数字字号不足 24px 且两行相叠（合成一行「Flash / 27B」）；清单的「MoE」「稠密」标签贴边（整体右移、右对齐到括号）；英文片尾的概括与名单相压（换行）。
- 开场只剩 8 个 token 后两行右侧空得多，字号由 84px 加大到 104–112px。
- 停留时间：英文版成绩表的「12/12 项 Flash 更高」只停约 0.4 秒镜头就离开，英文 q6 末尾「共享专家几乎一样大」一行在场景结束前半秒才出现。成绩站改为两条计算条画完就去、逐行加快，回账本的时机按词定（中文「算得少」、英文「means」），统计停留两种语言都在 1.9 秒以上；说明行改在读到「共享」之后半秒出现。这两处是在第一次正式渲染进行中发现的，停下渲染改完再重渲。

**动画、版面与声音**

- 全片扫描（`check.js`）两种语言通过；提示只有 81.5 秒前后的清单同时可见约 30 段文字（数据表，保留）。
- 低清预演（两种语言）：没有超过 2.5 秒的静止段。
- `margin.js`：两种语言 0 句进入 60px 安全边距（11 句按 `check.margin_skip` 略过：开场与时间线、Qwen3.8 三个型号脚下、结论页的黑色粗线有意出血）。
- 封面：英文 16:9 偶尔缺参数墙（canvas 在无头浏览器里偶尔整张画不上，连黑框都没有）；改用 SVG 矩形绘制后连出三轮、12 张全部正常。
- 混音：两种语言都没有削波（混音轨峰值中文 −0.3 dBFS、英文 −1.9 dBFS）；旁白说话时配乐低约 17–21 dB；配乐在 r7 处抬起。封装后整体响度中文 −16.7 LUFS、英文 −15.7 LUFS，真峰值 −1.4 / −1.2 dBFS。
- 成片：两种语言渲染日志末行 `verified frames=9000`；封装复查无 3 秒以上静帧、无空画面；`check.js --final` 全部通过；成片抽帧各 9 帧与页面一致。

**原创与片尾**

- 参考的是风格派的造型原则（只用水平与垂直的黑线、三原色面与白、非对称的平衡），没有复刻具体作品；构图由数据决定，见 README「视觉系统」。
- 片尾名单与「制作署名」一节一致；系列名一行写「150 秒了解 LLM 的 Dense 和 MoE」。

**未做**：人耳试听（旁白、配乐与音效的听感）；人眼连续播放通看。

## 取证中得到、未进成片的事实

- Mixtral 2024 §5：按学科看不出明显的专家分工；OLMoE 2024 §5.3 则观察到部分专家有明显的领域偏好。两者都说明分工是训练中形成的，不由人指定。
- Shazeer 2017 §4：门控网络会收敛到总给同几个专家大权重，且自我强化；训练时加一项「重要性」损失来平衡。OLMoE 用负载均衡损失（权重 0.01）与路由器 z-loss（0.001）。DeepSeek-V3 改用不加辅助损失的均衡方法。
- OLMoE 2024 §4.1.2：64 选 8 每层有 C(64, 8) 种组合；Mixtral 的 8 选 2 只有 28 种。
- OLMoE 2024 图 4：激活参数同为 1.3B 时，6.9B 的 MoE 用约三分之一的训练数据追平 1.3B 的稠密模型，按训练时间约快 2 倍（128 秒版用过，150 秒版改用 Qwen3.8 的例子）。
- Llama 4 博客：Scout（MoE，总 1090 亿）用 Int4 量化后能放进一张 H100——「一张卡时稠密往往更合适」的反例，旁白用「往往」。
- 腾讯 Hy3 模型卡：「Hy3 has 295B parameters in total. To serve it on 8 GPUs, we recommend using H20-3e or other GPUs with larger memory capacity」。
- DeepSeek-V4.1-Flash 模型卡：主干 552B，另有 196B 的 Engram 条件记忆（按 token 查表、稀疏访问）；与 Qwen3.8-Flash 的 n-gram 嵌入、LongCat-2.0 的 n-gram 嵌入一样，是在 MoE 之外另一条「参数多、每 token 算得少」的路。
- Kimi K3 模型卡：每层 896 个专家选 16 个（「activates 16 out of 896 experts」），总 2.8T、激活 104B，是 2026 年 6 月以后清单里最大的一个。
- Kaplan 2020 式 (2.2)：前向计算量约为 2N（N 为非嵌入参数），另加与上下文长度有关的注意力项。
