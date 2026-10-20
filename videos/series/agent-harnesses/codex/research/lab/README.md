# 实验室：CodeX CLI 是怎么实现的？

本目录保存本片的取证脚本与完整回显。第三方源码本体放在 `research/_src/codex/`（按仓库规则不入库），这里只记版本、获取方式与固定点。

## 目录内容

| 文件 | 对应脚本 | 内容 |
|---|---|---|
| `11_checkout_codex.ps1` | — | 检出记录：仓库 URL、完整 commit SHA、检出日期、许可证文件位置与校验和、历史起点 |
| `out_11_checkout_codex.txt` | `11_checkout_codex.ps1` | 上述脚本的完整回显 |
| `12_codex_layout_codex.ps1` | — | 仓库布局：顶层条目、各语言文件数、`codex-rs/` 的 crate 数量与关键 crate 的规模 |
| `out_12_codex_layout_codex.txt` | `12_codex_layout_codex.ps1` | 上述脚本的完整回显 |
| `13_codex_mechanisms_codex.ps1` | — | 关键机制落点：沙箱模式、审批策略、代理循环、各系统沙箱实现、工具路由、模型端点、沙箱 CLI |
| `out_13_codex_mechanisms_codex.txt` | `13_codex_mechanisms_codex.ps1` | 上述脚本的完整回显 |
| `14_codex_history_codex.ps1` | — | 沿革证据：建仓与首发、`codex.rs` → `session/` 迁移、npm 包装层、legacy 文件、旧沙箱路径 |
| `out_14_codex_history_codex.txt` | `14_codex_history_codex.ps1` | 上述脚本的完整回显 |

## 复现方式

```bash
git clone --no-single-branch https://github.com/openai/codex.git research/_src/codex
# Windows 上若检出工作区失败（长路径），在检出目录里执行：
#   git config core.longpaths true
#   git reset --hard HEAD
pwsh -File research/lab/11_checkout_codex.ps1
pwsh -File research/lab/12_codex_layout_codex.ps1
pwsh -File research/lab/13_codex_mechanisms_codex.ps1
pwsh -File research/lab/14_codex_history_codex.ps1
```

脚本只用相对路径（`$PSScriptRoot\..\_src\codex`）定位检出目录，回显里不出现本机绝对路径；`origin` 一行给出的是 GitHub 上的公开地址。本目录的回显已按 `docs/research.md` 第 5 节检查：没有口令、密钥、内网地址、主机名或可识别身份的信息。

## 本轮没做的事

- **没有运行 Codex CLI**：需要 ChatGPT 登录或 API key，按规矩不入库。片中所有「一次任务怎么走」的段落都写成源码与官方文档所述的路径，不写成实测。
- **没有做演示回显**：系列说明要求「演示与取证用的是同一份检出」。本轮先固定检出与出处，演示任务留到写稿阶段另起编号的脚本。
- **没有找到系列说明所称的「官方 FAQ 原文」**：2021 年那组 Codex 模型的退役日期改用 OpenAI 自己的 API 弃用页核实（见 `research/FACTS.md` 第 02 章 02-02）。
