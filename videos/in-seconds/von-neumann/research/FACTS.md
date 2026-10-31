# 事实核查

取证日期：2026-10-31。取证者：Claude Opus 5.5（制作方）。对象：冯·诺伊曼架构（存储程序计算机）的基本结构、一次「取—拆—做」的完整路径，以及共享通道的代价与今天的缓解办法。适用于第 2 稿（`src/js/script.js`，2026-10-31）。

## 对象与解释路径

整体结构（S1 §2.2–2.8）：控制器（CC）、运算器（CA）、存储器（M）、输入（I）、输出（O）五部分；控制器与运算器合称 C，经由同一套机构与存储器交换信息（S1 §2.6）。

关键关系（S1 §2.5、§12.2、§14.1）：存储器作为一个整体，既存要算的数，也存指挥机器的命令（报告里叫 orders）；命令和数一样编成二进制，占同样大小的存储单元。控制器从存储器取命令，「接收、解释，然后执行或交给相应部件执行」，正常情况下按存放顺序一条接一条地取（S1 §14.3）。

一次完整操作（本片的教学例子）：控制器从第 1 格取出一条指令 → 拆成「动作：加」与「地址：第 8 格」→ 从第 8 格取出数，与运算器里已有的数相加 → 转到第 2 格。格子编号、「前半截动作、后半截地址」的划分是为讲解设计的玩具机器，不对应 EDVAC 的实际编码长度；S1 的命令同样由动作类别与存储位置组成（§14.1 列出的四类命令），原理一致。

代价（S2 §3）：CPU 与存储器之间只有一条通道，一次只能传一个字；指令、数据和地址都要经过它。Backus 在 1977 年的图灵奖演讲中把这条通道命名为「冯·诺伊曼瓶颈」。

今天的缓解办法之一（S5）：处理器核心旁设分开的一级指令缓存与一级数据缓存（手册称 Harvard L1 memory system），指令从指令缓存或外部存储器取得。

## 取证环境

| 记录 | 取得方式 | 环境 |
|---|---|---|
| S1–S8 原文 | `curl` 下载网页与 PDF，`pdftotext` 抽文本后逐段阅读 | Windows 11，Git Bash；原件存于 `research/_src/`（不入库），校验和见下 |

## 出处

| 编号 | 出处 | 定位 | 校验和（SHA-256）/ 取得日期 |
|---|---|---|---|
| S1 | John von Neumann, *First Draft of a Report on the EDVAC*, Moore School of Electrical Engineering, University of Pennsylvania, 1945-06-30。Michael D. Godfrey 1992 年依原打字稿重排的版本：<https://www.wiley.com/legacy/wileychi/wang_archi/supp/appendix_a.pdf> | 封面；§2.2–2.8、§2.5、§12.2、§14.1、§14.3 | `75cfd66ac09b10e355e1f8dc81b046f409dac4def5d261be1bf0e6bf380ca6f1`，2026-10-31 |
| S1a | 同一报告的原稿扫描：<https://web.mit.edu/STS.035/www/PDFs/edvac.pdf> | 封面（图像，无文本层） | `cc591b48ea4989a72ef725f1d2fc8eb35ab556e8e24f1cc3db33ec56abc74e32`，2026-10-31 |
| S2 | John Backus, "Can Programming Be Liberated from the von Neumann Style? A Functional Style and Its Algebra of Programs", 1977 ACM Turing Award Lecture, *Communications of the ACM* 21(8), 1978-08。<https://worrydream.com/refs/Backus_1978_-_Can_Programming_Be_Liberated_from_the_von_Neumann_Style.pdf> | 首页编者按（1977-10-17 在西雅图 ACM 年会颁奖）；§3 "von Neumann Computers" | `2e412a7986c7fd1bdd060d90d035faa9ecc8a29675f99206c243da90954ca423`，2026-10-31 |
| S3 | Computer History Museum, *Revolution*, "ENIAC being set up"（照片约 1946，University of Pennsylvania Archives）：<https://www.computerhistory.org/revolution/birth-of-the-computer/4/78/316> | 图片说明 | `ad3e03bdf2c25522fcd2bf93d0f97cccf7017d42c33b7f83077c4f96f0a40e7e`，2026-10-31 |
| S4 | PBS, *A Science Odyssey*, "ENIAC is built 1945"：<https://www.pbs.org/wgbh/aso/databank/entries/dt45en.html> | 正文第 1、4、7 段 | `a4aef795f2914462658afe0c143aa12af145565eaa88d19b66403c7eea0f3fa8`，2026-10-31 |
| S5 | Arm 技术参考手册：Cortex-A53 r0p3（DDI 0500E）§1.3；Cortex-A7 r0p5 §6 L1 memory system；Cortex-A9 r0p1（DDI 0388）§6；Cortex-A15 r4p0 §6。经 documentation-service.arm.com 取得 | 见左 | A53 `eba73834…a3c2877b`（全值见下）、A7 `80ad066e…`、A9 `ba579e83…`、A15 `07c8f99e…`，2026-10-31 |
| S6 | AMD Ryzen 9 9950X 产品规格页：<https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-9-9950x.html> | Base Clock | `5280bd94e8aa8f8069f5d893d753f7586dd716dadf6db5ac4fd62114a3c2877b`，2026-10-31 |
| S7 | IBM Research Blog, "IBM Research's latest analog AI chip for deep learning inference", 2023-08-10：<https://research.ibm.com/blog/analog-ai-chip-inference> | 第 2–3 段 | `0abe2e272ebda606bba5c4bbc37f70d65770ebb829d811627a618a338a517cc1`，2026-10-31 |
| S8 | M. Le Gallo et al., "A 64-core mixed-signal in-memory compute chip based on phase-change memory for deep neural network inference", *Nature Electronics* 6, 680–693 (2023)：<https://www.nature.com/articles/s41928-023-01010-1> | 摘要 | `d348753a19c264de215843ea207df64419aab9e5eaa36afe410039e005de31d7`，2026-10-31 |

S5 完整校验和：A53 `eba73834fd8de210a7496c2e0f1fb46ebf0a32ee5546c30b4adb36257349227c`；A7 `80ad066eecf62c9ab265ec581a09f90b0a15e909902415ba534e8eb6349c563a`；A9 `ba579e8315e638b2f953d27e2077376598b4f1df11c53a9b68e79b2db1027339`；A15 `07c8f99e5be143d2a7ed13c48c846bd9ea52cc3001662be985a81a23cef46d29`。

## 逐句事实

状态：**已核** = 读到原文并与句意核对；**教学例子** = 为讲解设计、不声称对应某台真实机器的数值；**常识** = 不需出处的日常现象。

### 开场（open）

| 句号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| o1、o2 | 同一块芯片可以先运行记账程序、再运行游戏，硬件不变 | 日常现象；原理见 S1 §2.3（通用机器须把具体问题的指令与执行它们的控制部件分开） | 常识 |
| o3 | 这套设计被称为冯·诺伊曼架构 | S2 §3 以 "von Neumann computer" 指 CPU—存储器—通道三部分的结构；S1 封面署名 von Neumann | 已核 |
| p1、p2 | 早期计算机（ENIAC）靠接线与开关设定计算步骤；换一道题要重新接线、拨开关，需要好几天 | S3：「为每道新题设计正确的配置，再接线、拨开关，要花很多天」；S4 第 7 段：「改程序基本上就是重新接线……一个小组重编程序可能要两天」 | 已核（两路印证；S3 说 many days，S4 说 two days，旁白取「好几天」） |
| a1 | 1945 年，冯·诺伊曼的报告把计算机分成五部分 | S1 封面日期 1945-06-30、署名 John von Neumann；§2.2–2.8 逐一列出 CA、CC、M、I、O 五个 specific parts | 已核 |
| a2 | 两端是输入和输出，连着外部 | S1 §2.6–2.8：I、O 在外部记录介质 R 与 C、M 之间传递信息 | 已核 |
| a3 | 控制器指挥，运算器算数，存储器记东西 | S1 §2.2（CA 做加减乘除）、§2.3（CC 负责操作的先后顺序）、§2.4–2.5（M：记忆） | 已核 |
| a4 | 把算题的步骤与要算的数放进同一个存储器 | S1 §2.4(b)（指令须记住）、§2.5（把整个存储器当作一个部件）、§14.1：「CC 接收的命令来自 M，也就是存放数值材料的同一个地方」 | 已核 |

### 存储程序（program）

| 句号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| b1 | 这种做法叫「存储程序」 | 通行名称；S1 §14.1 描述其内容（命令与数同存于 M） | 已核（术语为后世通称，S1 未用此词） |
| b2 | 要算的数叫数据，步骤叫指令 | 定义性说明；S1 §12.2 区分 standard numbers 与 standard orders | 已核 |
| b3 | 指令也编成 0 和 1，跟数据存一起 | S1 §12.2：命令须写成与数同样占一个 32 位 minor cycle 的形式；每个单元另加一位标记区分「数」与「命令」 | 已核 |
| b4、b5 | 存储器像编号的格子；前几格放指令，后几格放数据 | 编号存储位置：S1 §14.1(c) 命令可让 CC「把与 M 的连接转到 M 中另一点」；格子数、排布为教学例子 | 已核 / 教学例子 |
| b6 | 控制器顺着编号一格一格往下读 | S1 §14.3：通常 CC 按命令自然出现的先后顺序执行，只在特殊情况下由转移命令跳到别处 | 已核 |

### 循环（cycle）

| 句号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| c1 | 机器靠三个动作循环：取、拆（译码）、做 | S1 §14.1：CC 的职能是「接收命令、解释命令，然后执行或交给相应部件执行」 | 已核 |
| c2–c4 | 第 1 格的指令前半截是「加」，后半截是「第 8 格」；取出第 8 格的数与运算器里的数相加 | 命令含操作与存储位置：S1 §14.1 四类命令（让 CA 做运算、在存储位置间传送数、转移等）；具体格号与编码划分为教学例子 | 教学例子（原理已核） |
| c5 | 接着轮到第 2 格；如今的芯片一秒能转几十亿圈 | 顺序：S1 §14.3。速度：S6 基础频率 4.3 GHz，即每秒 43 亿个时钟周期。现代处理器以流水线重叠执行多条指令，一条指令的完整三步不等于一个时钟周期；旁白「几十亿圈」只取数量级 | 已核（数量级） |
| c6、c7 | 换用途只需换存储器里的指令，硬件不变 | S1 §2.3：具体问题的指令被存起来，执行它们的控制部件固定不变 | 已核 |

### 瓶颈（bottleneck）

| 句号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| d1 | 指令和数据走同一条通道，一次只过一个 | S2 §3：冯·诺伊曼计算机由 CPU、存储器和一条「一次只能传一个字」的连接管道组成；指令、数据与地址都要经过它 | 已核 |
| d2 | 运算器再快，也得等着 | S2 §3：程序的工作「必须完全靠一个字一个字地在瓶颈中来回泵送来完成」 | 已核（旁白为该段的白话概括） |
| d3 | 1977 年，这条通道被命名为冯·诺伊曼瓶颈 | S2 编者按：1977 年 ACM 图灵奖于 1977-10-17 颁给 Backus；§3 原文 "I propose to call this tube the von Neumann bottleneck"。讲稿刊于 1978 年 8 月 | 已核（年份取演讲年份） |
| d4 | 今天的芯片在核心旁加两块小缓存，一块存指令、一块存数据 | S5：A53「Harvard Level 1 (L1) memory system」，分设 L1 指令缓存与 L1 数据缓存；A7、A9、A15 手册同样写明 separate instruction and data caches | 已核（同一厂商多份手册；未取得 x86 厂商原文，旁白不点名厂商） |
| d5 | 常用的放在近处，少走那条通道 | S5 A53 §2：取指单元「从指令缓存或外部存储器取得指令」——命中缓存时不必访问外部存储器 | 已核 |
| d6 | 换用途不改电线，只换存储器里的指令 | 同 c6、c7 | 已核 |

### 片尾（credits）

名单取自 `project.json` 的 `credits`，不配旁白。

## 未进入成片的事实

| 陈述 | 依据 | 为什么没用 |
|---|---|---|
| 有的 AI 芯片把模型权重存在存储器件里，直接在存储器里做乘加，减少存储器与处理单元之间的搬运 | S7 第 2–3 段；S8 摘要（"directly performing computations within memory"），IBM 的 64 核芯片为研究原型 | 128 秒内多一个新概念，且是研究阶段的方向；第 2 稿删去来稿的 d5 |
| ENIAC 有约 6,000 个手动开关、17,468 根电子管；1945 年 11 月完工 | S4 第 1、4 段（单一出处） | 旁白不需要；画面若用到开关数需再找第二出处 |
| 1936 年图灵设想的通用机器能读入写成符号的另一台机器的描述 | 未取证 | 来稿 h1；为控制时长与新名词删去，没有核实 |
| 存储程序思想的功劳归属存在争议（ENIAC 团队 Eckert、Mauchly 的贡献） | 未取证（检索线索提到，未读原文） | 本片只说「冯·诺伊曼的报告」，不说「冯·诺伊曼发明」；若日后要讲归属须先取证 |

## 复核

（成片审查后填写。）
