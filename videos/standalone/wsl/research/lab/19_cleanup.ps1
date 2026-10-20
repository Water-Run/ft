# 收尾：删掉 11–15 建的全部东西。两个实验发行版、容器、映像、演示目录与下载的压缩包。
# 不动别的发行版，也不动 WSL 容器默认会话的存储盘（%LOCALAPPDATA%\wslc\sessions\…\storage.vhdx：它属于用户的默认会话，
# 本实验只往里放过一个映像，已在这里删除）。回显存为 out_19_cleanup.txt。
$ErrorActionPreference = 'Continue'
$env:WSL_UTF8 = '1'
function Clean([string]$s) { $s.Replace($env:LOCALAPPDATA, '%LOCALAPPDATA%').Replace($env:USERPROFILE, '%USERPROFILE%').Replace($env:USERNAME, '<用户>').Replace($env:COMPUTERNAME, '<主机>') }
function Run([string]$cmd) { "PS> $cmd"; $o = (Invoke-Expression "$cmd 2>&1" | Out-String).TrimEnd(); if ($o) { Clean $o }; "[exit=$LASTEXITCODE]"; "" }
"# 取证时刻（UTC）：" + [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ')
""
Run 'wslc list --all'
Run 'wslc rmi ft-alpine:3.24.2'
Run 'wslc images'
Run 'wslc system session list'
Run 'wslc system session terminate'
Run 'wsl --unregister ft-wsl1'
Run 'wsl --unregister ft-wsl2'
"PS> wsl -l -v   （只列表头与名字以 ft- 开头的行）"
$rest = (wsl -l -v 2>&1 | Out-String) -split "`r?`n" | Where-Object { $_ -match '^\s+NAME\s' -or $_ -match 'ft-' }
$rest
"（实验发行版剩余 $(@($rest | Where-Object { $_ -match 'ft-' }).Count) 个）"
""
"PS> 删除 C:\ftlab 下的实验材料（保留 jobs 目录）"
Get-ChildItem 'C:\ftlab' -Force | Where-Object { $_.Name -ne 'jobs' } | ForEach-Object { Remove-Item $_.FullName -Recurse -Force -ErrorAction SilentlyContinue; "已删 " + $_.Name }
"PS> Get-ChildItem C:\ftlab"
Get-ChildItem 'C:\ftlab' -Force | ForEach-Object { $_.Name }
"PS> Get-Process vmmem*, wslcsession"
$p = Get-Process -Name 'vmmem*', 'wslcsession' -ErrorAction SilentlyContinue | Group-Object Name | ForEach-Object { "{0,-28} x{1}" -f (Clean $_.Name), $_.Count }; if ($p) { $p } else { '（没有）' }
