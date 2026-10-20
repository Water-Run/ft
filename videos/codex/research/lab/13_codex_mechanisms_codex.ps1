# 13_codex_mechanisms_codex.ps1 —— 关键机制在源码里的落点（openai/codex）
# 用途：把片中要讲的每一处机制固定成「路径:行号」，并把命中行原文打出来，供逐条复查。
# 运行：pwsh -File 13_codex_mechanisms_codex.ps1

$ErrorActionPreference = 'Stop'

$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\_src\codex')).Path
Set-Location $repo

function Show-Match {
  param([string]$Path, [string]$Pattern, [string]$Label, [int]$Context = 0, [int]$Max = 3)
  Write-Output ("--- " + $Label + "  [" + $Path + "]")
  $hits = Select-String -Path $Path -Pattern $Pattern -CaseSensitive:$false
  if (-not $hits) { Write-Output "    (未命中)"; return }
  $n = 0
  foreach ($h in $hits) {
    if ($n -ge $Max) { break }
    Write-Output ("    " + $h.Path.Replace($repo + '\', '') + ":" + $h.LineNumber + ": " + $h.Line.Trim())
    $n++
  }
}

Write-Output "=== 1. 沙箱模式枚举 ==="
Show-Match 'codex-rs/protocol/src/config_types.rs' 'pub enum SandboxMode' 'SandboxMode 定义' 0 1
Select-String -Path 'codex-rs/protocol/src/config_types.rs' -Pattern 'read-only|workspace-write|danger-full-access' |
  Select-Object -First 4 | ForEach-Object { Write-Output ("    " + $_.Path.Replace($repo + '\','') + ":" + $_.LineNumber + ": " + $_.Line.Trim()) }

Write-Output ""
Write-Output "=== 2. 审批策略枚举 ==="
Show-Match 'codex-rs/protocol/src/protocol.rs' 'pub enum AskForApproval' 'AskForApproval 定义' 0 1
Select-String -Path 'codex-rs/protocol/src/protocol.rs' -Pattern 'untrusted|on-request|granular|Never' |
  Where-Object { $_.LineNumber -ge 1090 -and $_.LineNumber -le 1125 } |
  ForEach-Object { Write-Output ("    " + $_.Path.Replace($repo + '\','') + ":" + $_.LineNumber + ": " + $_.Line.Trim()) }

Write-Output ""
Write-Output "=== 3. 代理循环（一次回合） ==="
Show-Match 'codex-rs/core/src/session/turn.rs' 'pub\(crate\) async fn run_turn' 'run_turn 定义' 0 1
Get-Content 'codex-rs/core/src/session/turn.rs' | Select-Object -Skip 157 -First 16 |
  ForEach-Object -Begin { $i = 158 } -Process { Write-Output ("    codex-rs/core/src/session/turn.rs:" + $i + ": " + $_.Trim()); $i++ }

Write-Output ""
Write-Output "=== 4. 各操作系统的沙箱实现 ==="
Show-Match 'codex-rs/sandboxing/src/seatbelt.rs' 'MACOS_SEATBELT_BASE_POLICY|sandbox-exec' 'macOS Seatbelt 策略文件与执行方式' 0 3
Show-Match 'codex-rs/sandboxing/src/landlock.rs' 'bubblewrap|seccomp|CODEX_LINUX_SANDBOX_ARG0' 'Linux 沙箱辅助程序说明' 0 3
Show-Match 'codex-rs/sandboxing/src/bwrap.rs' 'bwrap|bubblewrap' 'Linux bubblewrap 封装' 0 2
Show-Match 'codex-rs/sandboxing/src/windows.rs' 'WindowsSandboxLevel|restricted|elevated' 'Windows 沙箱档位' 0 3
Show-Match 'codex-rs/sandboxing/src/windows_mxc.rs' 'mxc|Mxc' 'Windows 原生沙箱 MXC' 0 2

Write-Output ""
Write-Output "=== 5. 工具注册与调用 ==="
Show-Match 'codex-rs/core/src/tools/registry.rs' 'fn ' '工具注册表入口' 0 4
Show-Match 'codex-rs/core/src/tools/router.rs' 'pub fn|pub async fn' '工具路由' 0 3
Show-Match 'codex-rs/core/src/tools/sandboxing.rs' 'pub fn|pub async fn|sandbox' '工具侧的沙箱策略' 0 3

Write-Output ""
Write-Output "=== 6. 模型调用（Responses API） ==="
Show-Match 'codex-rs/core/src/client.rs' 'responses|api.openai.com|chatgpt.com/backend-api' '模型端点' 0 4

Write-Output ""
Write-Output "=== 7. 配置与沙箱 CLI ==="
Show-Match 'codex-rs/cli/src/debug_sandbox.rs' 'run_command_under_seatbelt|run_command_under_landlock|SandboxType' 'codex sandbox 子命令落地' 0 4
Write-Output "--- 配置文件位置（codex-rs/core/src/config 目录） ---"
$cfg = Get-ChildItem 'codex-rs/core/src/config' -Recurse -File -Filter '*.rs' -ErrorAction SilentlyContinue
$cfg | Select-String -Pattern 'config\.toml|CODEX_HOME' |
  Select-Object -First 4 | ForEach-Object { Write-Output ("    " + $_.Path.Replace($repo + '\', '') + ":" + $_.LineNumber + ": " + $_.Line.Trim()) }

Write-Output ""
Write-Output "=== 8. 上下文压缩 ==="
Show-Match 'codex-rs/core/src/compact.rs' 'pub fn|pub async fn' '压缩实现入口' 0 4

Write-Output ""
Write-Output "=== 9. 未开源部分的仓库痕迹：app-server 与 IDE ==="
Write-Output ("    codex-rs/app-server 存在: " + (Test-Path 'codex-rs/app-server'))
Write-Output "顶层与 codex-rs/ 下名称含 ide 的目录："
@(Get-ChildItem -Directory -Name; Get-ChildItem 'codex-rs' -Directory -Name) |
  Where-Object { $_ -match 'ide' } | ForEach-Object { Write-Output ("    " + $_) }
Write-Output ("    是否存在名为 ide 的目录: " + $(if ((Test-Path 'ide') -or (Test-Path 'codex-rs/ide')) { '是' } else { '否（仓库内没有 IDE 扩展的实现目录）' }))
