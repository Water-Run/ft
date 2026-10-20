# 实验室：OpenCode 是怎么实现的？

本目录保存本片的取证脚本与完整回显。第三方源码本体放在 `research/_src/opencode/`（按仓库规则不入库），这里只记版本、获取方式与固定点。

## 目录内容

| 文件 | 对应脚本 | 内容 |
|---|---|---|
| `11_checkout_opencode.ps1` | — | 检出记录：仓库 URL、完整 commit SHA、检出日期、许可证文件位置与校验和、历史起点 |
| `out_11_checkout_opencode.txt` | `11_checkout_opencode.ps1` | 上述脚本的完整回显 |
| `12_opencode_layout_opencode.ps1` | — | 仓库布局：顶层条目、各语言文件数、`packages/` 清单与关键包的规模、官方文档在仓库里的位置、运行时与包管理 |
| `out_12_opencode_layout_opencode.txt` | `12_opencode_layout_opencode.ps1` | 上述脚本的完整回显 |
| `13_opencode_mechanisms_opencode.ps1` | — | 关键机制落点：权限求值、内置工具、单步执行、插件入口与钩子、LSP 配置、全局目录与服务端形态、上下文与压缩 |
| `out_13_opencode_mechanisms_opencode.txt` | `13_opencode_mechanisms_opencode.ps1` | 上述脚本的完整回显 |
| `14_opencode_history_opencode.ps1` | — | 沿革证据：历史起点、Go → TypeScript 重写、共享包改名、v1 遗留目录、旧配置兼容、品牌痕迹、变更日志 |
| `out_14_opencode_history_opencode.txt` | `14_opencode_history_opencode.ps1` | 上述脚本的完整回显 |

## 复现方式

```bash
git clone --no-single-branch https://github.com/anomalyco/opencode.git research/_src/opencode
pwsh -File research/lab/11_checkout_opencode.ps1
pwsh -File research/lab/12_opencode_layout_opencode.ps1
pwsh -File research/lab/13_opencode_mechanisms_opencode.ps1
pwsh -File research/lab/14_opencode_history_opencode.ps1
```

脚本只用相对路径（`$PSScriptRoot\..\_src\opencode`）定位检出目录，回显里不出现本机绝对路径；`origin` 一行给出的是 GitHub 上的公开地址。本目录的回显已按 `docs/research.md` 第 5 节检查：没有口令、密钥、内网地址、主机名或可识别身份的信息。

## 本轮没做的事

- **没有运行 OpenCode**：需要模型账号或 API key，按规矩不入库。片中所有「一次任务怎么走」的段落都写成源码与官方文档所述的路径，不写成实测。
- **没有做演示回显**：系列说明要求「演示与取证用的是同一份检出」。本轮先固定检出与出处，演示任务留到写稿阶段另起编号的脚本。
- **没有核实「Go 那支变成 Charm 的 Crush」**：仓库自己的记录是 Go 实现被就地替换成 TypeScript（见 `out_14` 第 2 节）。这一说法在仓库记录中找不到依据，记在 `research/FACTS.md` 的「尚待核实」一节，本片不采用。
- **没有核实仓库从 `sst` 转到 `anomalyco` 的日期**：只核实了旧地址仍指向同一仓库（同一 repo id）。
