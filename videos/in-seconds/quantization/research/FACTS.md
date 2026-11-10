# 事实出处

取证日期 2026-11-09。对象：Qwen3.8-27B 及其各量化版本。画面与旁白里的每一项事实都要有出处；模型输出、记忆与搜索摘要只作线索。

实验脚本与完整回显在 `research/lab/`。网页评测里的分数以原文或原图的数据点为准。

## 环境与版本

| 项 | 版本 | 获取方式 |
|---|---|---|
| Qwen3.8-27B 官方权重 | Hugging Face `Qwen/Qwen3.8-27B`，createdAt 2026-08-05 | 接口查询，`lab/out_02_public_numbers.txt` |
| GGUF 文件 | `unsloth/Qwen3.8-27B-GGUF`，2026-11-09 的仓库状态 | HTTP 范围请求，只读文件头与 64 字节，`lab/01_read_weights.py` |
| llama.cpp 源码 | 提交 `7d7f0287530bc8981690f361d8c1627dbae1c99a` | `ggml/src/ggml-common.h`、`ggml/src/ggml-quants.c` |
| 实验环境 | Python 3 标准库，只读取公开文件，无本机路径 | 同上 |

## 对象与解释路径

一个大模型的权重文件主要就是一大堆数。Qwen3.8-27B 共 27,781,427,952 个参数，每个用 BF16 存，占 2 字节（A2），合 55.56 GB（A3）。量化不改变数的个数，而是减少每个数占的位数。以 GGUF 的 Q4_0 为例：每 32 个数一组，存一个 16 位的刻度 d；每个数只存一个 4 位的编号，还原时算（编号 − 8）× d（B1、B2）。原本的 512 位变成 144 位（B3）。编号相同的数还原后完全相同，这是精度损失的具体形式（B4、B5）。

体积与成绩（E1–E7）：同一模型的五个文件考同一份 GPQA Diamond，8 位、4 位档与原版无法区分，2 位档下降，1 位档低于随机猜测。

未解决：Quesma 用的是 Unsloth 的 v2 文件（2、4、8 位档），v2 已于 2026-08-19 被替换，所以当前仓库的体积（如 UD-Q2_K_XL 9.83 GB）与文中所用文件（10.7 GB）略有不同。成绩表一律配文中所用文件的体积。

## 逐章

### A. 模型是一大堆数

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、截至日期 | 状态 |
|---|---|---|---|---|---|
| A1 | Qwen3.8-27B 发布于 2026 年 8 月 | HF 接口 `createdAt` 2026-08-05（`out_02`） | Quesma 文（2026-08-26）基于该模型 | 2026-11-09 查询 | 已核 |
| A2 | 官方权重共 27,781,427,952 个参数，类型 BF16 | HF 接口 `safetensors.parameters`（`out_02`） | A3 的体积可反算 | 同上 | 已核 |
| A3 | 官方权重 55.56 GB；27,781,427,952 × 2 字节 = 55.56 GB | HF 仓库 safetensors 总和（`out_02`） | GGUF BF16 两卷 49.986 + 4.672 = 54.658 GB，加视觉部分 `mmproj-BF16` 0.931 GB = 55.59 GB | 同上。旁白说「差不多 55 GB」，Quesma 原文写 55 GB | 已核 |

### B. 量化怎么做（Q4_0 为例）

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、截至日期 | 状态 |
|---|---|---|---|---|---|
| B1 | Q4_0：每 32 个数一组，存一个 16 位的 delta 和 16 字节的 4 位编号 | `ggml-common.h`：`#define QK4_0 32`；`block_q4_0 { ggml_half d; uint8_t qs[QK4_0 / 2]; }` | 实测每组 18 字节能正确还原（`out_01`） | llama.cpp 提交见上 | 已核 |
| B2 | 还原方法：（编号 − 8）× d | `ggml-quants.c`：`dequantize_row_q4_0`，`x0 = (qs & 0x0F) - 8; y = x0 * d` | 实测还原值与原值的偏差都在一两格以内（`out_01`） | 同上 | 已核 |
| B3 | 32 个数：BF16 占 512 位；Q4_0 占 16 + 128 = 144 位，每数 4.5 位，省 71.9% | `out_01` 末行 | B1 算术 | 同上 | 已核 |
| B4 | 真实的 32 个数：张量 `blk.13.ffn_down.weight` 第 1000 组，刻度 d = 0.002775 | `out_01_read_weights.txt`，`weights_32.json` | 两个文件同一位置逐数对照 | 2026-11-09 | 已核 |
| B5 | 第 2、3、14、23 号（0.013428、0.013123、0.013855、0.012756）都得到编号 13，还原后都是 0.013876 | `out_01` | 同上 | 同上 | 已核 |
| B6 | 这组数的平均误差 0.00068，这组数绝对值的平均 0.00829 | `out_01` 末尾 | 同上 | 仅这一组，不外推 | 已核 |
| B7 | 真实文件的刻度不是「最大值除以 8」：按那样算是 0.003036，文件里是 0.002775，最大的数被截断（误差 0.00209，超过半格 0.00139） | `out_01`；llama.cpp 的 `quantize_row_q4_0_ref` 只是参考实现 | — | 文案不说刻度怎么选 | 已核 |

### C. 历史

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、截至日期 | 状态 |
|---|---|---|---|---|---|
| C1 | llama.cpp 的首个提交 2023-03-10，作者 Georgi Gerganov | GitHub 提交 `26c084662903ddaca19bef982831bfb0856e8257`，消息 “Initial release” | 首个 README 提交 `775328064e` 同日 | — | 已核 |
| C2 | 最早的 README 写明目标是用 4 位量化在 MacBook 上运行模型；“This was hacked in an evening - I have no idea if it works correctly.”；“typically degrades significanlty after ~30-40 tokens” | README 提交 `18ebda34d67c05f4f5584a9209e7efb949f5fd56`（原文） | C1 | — | 已核 |

### D. 名词

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、截至日期 | 状态 |
|---|---|---|---|---|---|
| D1 | Q8、Q4 等 GGUF 类型里 Q 后面的数字是每个数的位数档（Q4_0 为 4 位，Q8_0 为 8 位） | `ggml-common.h` 的 `block_q4_0`（4 位）、`QK8_0` 定义 | Quesma：“8-bit Q8_0, 4-bit Q4_K_M, 2-bit UD-Q2_K_XL, 1-bit UD-IQ1_S” | 档位名不等于实际平均位数：IQ1_S 6.2 GB ÷ 278 亿 ≈ 1.8 位 | 已核 |
| D2 | NVFP4 是英伟达的 4 位浮点格式，每 16 个数一组，配一个 FP8 刻度，另有每张量一个 FP32 系数；由 Blackwell 显卡引入 | NVIDIA 技术博客 “Introducing NVFP4 for Efficient and Accurate Low-Precision Inference”：“a fine-grained FP8 scale to each 16-value micro-block and a second-level FP32 scalar per tensor” | `nvidia/Qwen3.8-27B-NVFP4` 模型卡列 Blackwell | 2026-11-09 | 已核 |
| D3 | 英伟达的 Qwen3.8-27B-NVFP4 是混合配方：MLP 与 lm_head 用 NVFP4，注意力层用 FP8 | 同模型卡 | HF 讨论 #192 | 同上。画面标「NVFP4（混合 FP8）」 | 已核 |
| D4 | FP8 是 8 位浮点；官方提供 `Qwen/Qwen3.8-27B-FP8`，30.87 GB | `out_02` | NVIDIA 博客列 FP8 | 同上 | 已核 |
| D5 | 同一模型还有 AWQ-INT4（21.02 GB）、MLX-4bit（16.05 GB）、GPTQ、bitsandbytes 等版本 | `out_02`；HF 搜索 2026-11-09 | — | 背景混眼熟，不进旁白 | 已核 |

### E. 体积与成绩

分数来自 Piotr Migdał，[Benchmarking Qwen3.8 27B quantizations: 4-bit holds up, 1-bit collapses](https://quesma.com/blog/qwen38-27b-quantizations-benchmarked/)，Quesma Blog，2026-08-26。数字由页面内嵌 SVG 的坐标反算（`out_02`）。

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、截至日期 | 状态 |
|---|---|---|---|---|---|
| E1 | GPQA Diamond（研究生水平科学选择题，推理强度 xhigh）：BF16 55 GB 89.9% | Quesma 图一 | Quesma 称复现了官方结果；ISTA-DASLab 模型卡 BF16 也是 89.90 | 该文 | 已核 |
| E2 | Q8_0 29 GB 89.8% | Quesma 图一 | Hack-Log 测 Q8_0 与 BF16 逐词一致 98.9% | 该文 | 已核 |
| E3 | Q4_K_M 17 GB 90.4%；与 BF16 的差距属于噪声（原文：“besides noise … there is little difference down to 4-bit”） | Quesma 图一、图二一致 | 文中 Terminal-Bench 2.1 上 Q4_K_M 与 BF16 同为 70.8%（63/89） | 该文 | 已核 |
| E4 | UD-Q2_K_XL 10.7 GB 85.4% | Quesma 图一、图二一致 | ISTA-DASLab 卡：UD-Q2_K_XL 86.87（文件版本不同） | 该文 | 已核 |
| E5 | UD-IQ1_S 6.2 GB 10.4%；随机猜测 25%；长推理更差，常因耗尽词元而交白卷 | Quesma 图二、正文 | — | 该文 | 已核 |
| E6 | GPQA Diamond 是四选一，随机猜测基线 25% | Quesma 图二的 “random guess” 线 | — | — | 已核 |
| E7 | 速度：DGX Spark（vLLM）上，BF16 14.6 词/秒，FP8 20.6，NVIDIA NVFP4 38.6（2.64 倍）；代码与数学分差距 2 分以内 | [HF 讨论 #192](https://huggingface.co/Qwen/Qwen3.8-27B/discussions/192) 结果表 | Hack-Log：Q4_K_M 67 vs Q8_0 50 词/秒 | 该机器，不外推到其他硬件 | 已核 |
| E8 | 官方 BF16 在 RTX 4090（24 GB）上放不下，Q4_K_M 17 GB 放得下 | Quesma 正文 “fits on a 24 GB card such as RTX 4090” | 算术 | — | 已核 |
| E9 | GPQA Diamond 共 198 题；89.9% = 178/198，90.4% = 179/198，所以 Q4_K_M 比 BF16「只多对了一道题」 | Hugging Face 数据集 `fingertap/GPQA-Diamond`，`datasets-server` 的 test 划分 198 行（2026-11-09） | ISTA-DASLab 卡的分数同样落在 n/198 上（89.39 = 177/198，86.87 = 172/198，84.85 = 168/198） | 只对这次评测成立 | 已核 |
| E10 | NVFP4 的速度是 BF16 的两倍半：38.6 ÷ 14.6 = 2.64 | E7 | — | 仅 DGX Spark、vLLM，英伟达版（混合 FP8）。画面标明机器与版本 | 已核 |

## 取证中发现、没有进入成片的事实

- Terminal-Bench 2.1：Q4_K_M 与 BF16 同为 70.8%，UD-Q2_K_XL 64.0%（`out_02`）。
- 与 BF16 逐词一致率：Q8_0 98.7%，Q4_K_M 94.8%，UD-Q2_K_XL 87.3%，UD-IQ1_M 77.6%，UD-IQ1_S 74.2%（`out_02`）。逐词不同不等于答错。
- Unsloth 自称 UD-IQ1_S「保留约 72% top-1%」，Quesma 指出剩下的 28% 决定了成败。
- 量化有训练后量化与量化感知训练之分；KV 缓存也能量化，本片只讲权重。
- 2017 年 Jacob 等人的整数推理量化（arXiv 1712.05877），面向手机；本片历史段只留一个节点。

## 复核

<!-- 成片后逐句、逐画面再核一遍。 -->
未做。
