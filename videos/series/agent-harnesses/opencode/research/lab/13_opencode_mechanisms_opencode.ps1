# 13_opencode_mechanisms_opencode.ps1 —— 关键机制在源码里的落点（anomalyco/opencode）
# 用途：把片中要讲的每一处机制固定成「路径:行号」，并把命中行原文打出来，供逐条复查。
# 运行：pwsh -File 13_opencode_mechanisms_opencode.ps1

$ErrorActionPreference = 'Stop'

$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\_src\opencode')).Path
Set-Location $repo

function Show-Match {
  param([string]$Path, [string]$Pattern, [string]$Label, [int]$Max = 4)
  Write-Output ("--- " + $Label + "  [" + $Path + "]")
  if (-not (Test-Path $Path)) { Write-Output "    (文件不存在)"; return }
  $hits = Select-String -Path $Path -Pattern $Pattern -CaseSensitive:$false
  if (-not $hits) { Write-Output "    (未命中)"; return }
  $n = 0
  foreach ($h in $hits) {
    if ($n -ge $Max) { break }
    Write-Output ("    " + $h.Path.Replace($repo + '\', '') + ":" + $h.LineNumber + ": " + $h.Line.Trim())
    $n++
  }
}

Write-Output "=== 1. 权限模型：规则集与求值 ==="
Show-Match 'packages/core/src/permission.ts' 'export function evaluate|missingAgentPermissions|export class BlockedError|export class DeclinedError' '权限求值与错误类型' 4
Show-Match 'packages/schema/src/permission.ts' 'Effect|allow|ask|deny|Ruleset|Rule' '权限规则的数据形状' 6

Write-Output ""
Write-Output "=== 2. 权限项的官方清单（文档源文件） ==="
Show-Match 'packages/web/src/content/docs/permissions.mdx' '^- |' '可用权限项' 0
Select-String -Path 'packages/web/src/content/docs/permissions.mdx' -Pattern '`read`|`edit`|`glob`|`grep`|`bash`|`task`|`skill`|`lsp`|`question`|`webfetch`|`websearch`|`external_directory`|`doom_loop`' |
  Select-Object -First 16 | ForEach-Object { Write-Output ("    packages/web/src/content/docs/permissions.mdx:" + $_.LineNumber + ": " + $_.Line.Trim()) }

Write-Output ""
Write-Output "=== 3. 内置工具 ==="
Write-Output "--- 工具实现文件 packages/core/src/tool/plugin/"
Get-ChildItem 'packages/core/src/tool/plugin' -File -Filter '*.ts' | Sort-Object Name | ForEach-Object { Write-Output ("    " + $_.Name) }
Show-Match 'packages/core/src/tool.ts' 'export const|export function|export namespace' '工具入口' 4

Write-Output ""
Write-Output "=== 4. 一次任务的回合：模型调用与工具执行 ==="
Show-Match 'packages/core/src/session/runner/step.ts' 'ToolCall|Permission|ToolOutput|Outcome' '单步执行里的模型、工具与权限' 6
Show-Match 'packages/core/src/session/runner/llm.ts' 'streamText|generateText|ToolCall|textStream' '模型调用' 4
Show-Match 'packages/core/src/session/runner/max-steps.ts' 'maxSteps|max_steps|step' '单回合步数上限' 3

Write-Output ""
Write-Output "=== 5. 插件与扩展点 ==="
Show-Match 'packages/plugin/src/host.ts' 'server|tui|rpc|export function resolve' '插件入口解析' 6
Show-Match 'packages/core/src/plugin/hooks.ts' 'export const|export interface|hook' '插件钩子' 6
Show-Match 'packages/web/src/content/docs/plugins.mdx' '\.opencode/plugins|~/.config/opencode/plugins|plugin' '插件的加载位置' 5

Write-Output ""
Write-Output "=== 6. LSP ==="
Show-Match 'packages/schema/src/config/lsp.ts' 'class Server|command|extensions|disabled' 'LSP 配置形状' 6
Show-Match 'packages/web/src/content/docs/lsp.mdx' 'LSP is disabled by default|built-in LSP servers' 'LSP 文档要点' 4

Write-Output ""
Write-Output "=== 7. 配置目录与客户端形态 ==="
Show-Match 'packages/util/src/global.ts' 'const app =|roots\(app\)|config|state|data' '全局目录' 8
Show-Match 'packages/web/src/content/docs/server.mdx' 'opencode serve|--port|--hostname|4096|OPENCODE_SERVER_PASSWORD' '服务端形态' 6
Show-Match 'packages/core/src/config/discovery.ts' 'globalDirectory|globalAgentsDirectory|globalClaudeDirectory' '配置发现' 5

Write-Output ""
Write-Output "=== 8. 上下文管理 ==="
Show-Match 'packages/core/src/session/compaction.ts' 'export const|export async|export function' '压缩实现入口' 4
Show-Match 'packages/core/src/session/context.ts' 'export const|export async|export function' '上下文装配入口' 4
