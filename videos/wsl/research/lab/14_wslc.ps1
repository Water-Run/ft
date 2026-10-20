# WSL 3.0 的 WSL 容器（wslc）：把 11 用过的同一份 Alpine minirootfs 导入为映像，在容器里再跑一遍同样的命令，
# 并从 Windows 一侧与会话虚拟机内部各看一眼它是怎样搭起来的。
# 在装有 WSL 3.0.x 的 Windows 11 上用 PowerShell 7 执行。前提：C:\ftlab 里有 11 下载并校验过的 Alpine 压缩包。
# 本脚本建的映像（ft-alpine）、容器（ft-sleep、ft-web）与目录（C:\ftlab\share）由 19_cleanup.ps1 删除。回显存为 out_14_wslc.txt。
# 回显里的用户目录写成 %LOCALAPPDATA%，进程的属主只写「当前用户」或「SYSTEM」。
$ErrorActionPreference = 'Continue'
$env:WSL_UTF8 = '1'
$LAB = 'C:\ftlab'
$ALPINE = 'alpine-minirootfs-3.24.2-x86_64.tar.gz'
$IMG = 'ft-alpine:3.24.2'
function Clean([string]$s) { $s.Replace($env:LOCALAPPDATA, '%LOCALAPPDATA%').Replace($env:USERPROFILE, '%USERPROFILE%').Replace($env:USERNAME, '<用户>').Replace($env:COMPUTERNAME, '<主机>') }
function Run([string]$cmd, [int]$timeoutSec = 120) {
  "PS> $cmd"
  $job = Start-Job -ScriptBlock { param($c) $env:WSL_UTF8 = '1'; [Console]::OutputEncoding = [Text.Encoding]::UTF8; $o = (Invoke-Expression "$c 2>&1" | Out-String).TrimEnd(); $o; "[exit=$LASTEXITCODE]" } -ArgumentList $cmd
  if (Wait-Job $job -Timeout $timeoutSec) { Clean ((Receive-Job $job | Out-String).TrimEnd()) } else { Stop-Job $job; "[超过 $timeoutSec 秒未结束，已中止]" }
  Remove-Job $job -Force
  ""
}
"# 取证时刻（UTC）：" + [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ')
"# WSL：" + ((wsl --version 2>&1 | Select-Object -First 2) -join '；')
""
"## 0 起点"
Run 'wslc version'
Run 'wslc info'
Run 'wslc images'
Run 'wslc list --all'
"PS> Get-Process wslcsession, vmmem*  （运行第一条容器命令之前）"
$p = Get-Process -Name 'wslcsession', 'vmmem*' -ErrorAction SilentlyContinue | Group-Object Name | ForEach-Object { "{0,-16} x{1}" -f $_.Name, $_.Count }; if ($p) { $p } else { '（没有）' }
""
"## 1 同一份根文件系统，第三种跑法：导入为映像，在容器里执行"
Run "wslc import $LAB\$ALPINE $IMG"
Run 'wslc images'
Run "wslc run --rm $IMG uname -r"
Run "wslc run --rm $IMG uname -sr"
Run "wslc run --rm $IMG cat /proc/version"
Run "wslc run --rm $IMG cat /etc/alpine-release"
""
"## 2 容器里看到的环境"
Run "wslc run -d --name ft-sleep $IMG sleep 3600"
Run 'wslc list'
Run 'wslc exec ft-sleep ps -o pid,user,comm'
Run 'wslc exec ft-sleep cat /proc/1/cgroup'
Run 'wslc exec ft-sleep grep -E "^overlay | / " /proc/mounts'
Run 'wslc exec ft-sleep cat /proc/cmdline'
Run 'wslc exec ft-sleep cat /sys/fs/cgroup/cgroup.controllers'
""
"## 3 Windows 一侧：谁拥有这台虚拟机"
"PS> Get-CimInstance Win32_Process（wslservice / wslcsession / wslc / vmmem*），属主只分「当前用户」与其他"
Get-CimInstance Win32_Process | Where-Object { $_.Name -match '^(wslservice|wslcsession|wslc|vmmem.*|vmwp)(\.exe)?$' } | Sort-Object Name | ForEach-Object {
  $o = Invoke-CimMethod -InputObject $_ -MethodName GetOwner -ErrorAction SilentlyContinue
  $who = if (-not $o -or -not $o.User) { '（查不到）' } elseif ($o.User -eq $env:USERNAME) { '当前用户' } else { $o.User }
  $parent = (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.ParentProcessId)" -ErrorAction SilentlyContinue).Name
  "{0,-18} 属主={1,-10} 父进程={2}" -f $_.Name, $who, $(if ($parent) { $parent } else { '（已退出或查不到）' })
}
""
"PS> wsl -l -v   （WSL 容器的会话是否出现在发行版列表里；只列表头与本实验的行）"
(wsl -l -v 2>&1 | Out-String) -split "`r?`n" | Where-Object { $_ -match '^\s+NAME\s' -or $_ -match 'ft-' }
""
"PS> Get-ChildItem %LOCALAPPDATA%\wslc -Recurse  （会话的存储）"
$root = Join-Path $env:LOCALAPPDATA 'wslc'
if (Test-Path $root) { Get-ChildItem $root -Recurse -Force | ForEach-Object { "{0,-70} {1,14}" -f (Clean $_.FullName), $(if ($_.PSIsContainer) { '<目录>' } else { $_.Length }) } } else { "（没有 $((Clean $root))）" }
""
"## 4 会话虚拟机内部"
Run 'wslc system session list'
Run 'wslc system session run --help'
Run 'wslc system session run uname -r'
Run 'wslc system session run cat /proc/version'
Run 'wslc system session run ps -e -o pid,comm'
Run 'wslc system session run cat /proc/cmdline'
Run 'wslc system session run grep -E " / |/mnt|virtiofs|docker" /proc/mounts'
Run 'wslc system session run dockerd --version'
Run 'wslc system session run containerd --version'
Run 'wslc system session run docker version'
""
"## 5 卷：把 Windows 目录挂进容器"
New-Item -ItemType Directory -Force -Path "$LAB\share" | Out-Null
[IO.File]::WriteAllText("$LAB\share\hello.txt", "hello from Windows`n")
Run "wslc run --rm -v $LAB\share:/data $IMG cat /data/hello.txt"
Run "wslc run --rm -v $LAB\share:/data $IMG grep /data /proc/mounts"
Run 'wslc system session run grep -E "virtiofs|9p" /proc/mounts'
""
"## 6 网络：端口映射"
Run "wslc run -d --name ft-web -p 18080:80 $IMG httpd -f -p 80 -h /etc"
Start-Sleep -Seconds 2
Run 'curl.exe -s -m 8 http://localhost:18080/alpine-release'
Run 'wslc exec ft-web ip -o -4 addr'
Run 'wslc exec ft-web cat /etc/resolv.conf'
Run 'wslc network list'
Run 'wslc system session run ip -o -4 addr'
"PS> netstat -ano | findstr :18080   （Windows 一侧是谁在监听；只留进程名）"
$ls = netstat -ano | Select-String ':18080\s' | ForEach-Object { $c = ($_.Line.Trim() -split '\s+'); $n = (Get-Process -Id $c[-1] -ErrorAction SilentlyContinue).Name; "{0,-6} {1,-22} {2,-10} 进程={3}" -f $c[0], $c[1], $c[3], $n }
if ($ls) { $ls } else { '（没有）' }
""
"## 7 从镜像仓库拉取（视网络而定）"
Run 'wslc pull alpine:3.24.2' 150
Run 'wslc images'
""
"## 8 停掉容器（映像与目录的删除在 19_cleanup.ps1）"
Run 'wslc stop ft-sleep ft-web'
Run 'wslc remove ft-sleep ft-web'
Run 'wslc list --all'
