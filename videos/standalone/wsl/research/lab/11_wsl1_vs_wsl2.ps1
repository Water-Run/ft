# 同一个根文件系统，两种架构：把同一份 Alpine minirootfs 分别按版本 1 与版本 2 导入，逐项对比。
# 在装有 WSL 3.0.x、且两个可选组件（适用于 Linux 的 Windows 子系统、虚拟机平台）都已启用的 Windows 11 上用 PowerShell 7 执行。
# 工作目录 C:\ftlab（演示目录）。导入的两个发行版名为 ft-wsl1、ft-wsl2，由 19_cleanup.ps1 注销并删除。
# 回显存为 out_11_wsl1_vs_wsl2.txt。回显里不出现主机名：不用 uname -a、hostname。
$ErrorActionPreference = 'Continue'
$env:WSL_UTF8 = '1'
$LAB = 'C:\ftlab'
$ALPINE = 'alpine-minirootfs-3.24.2-x86_64.tar.gz'
$ALPINE_URL = "https://dl-cdn.alpinelinux.org/alpine/v3.24/releases/x86_64/$ALPINE"
$ALPINE_SHA = 'c5ca053cfe1d85c5b96dff8b9bc57045f7f184a30ffb6b65776409ca90388677'   # 取自 latest-releases.yaml（2026-10-07 查）
$SRC = 'WSL-3.0.1.tar.gz'
$SRC_URL = 'https://github.com/microsoft/WSL/archive/refs/tags/3.0.1.tar.gz'

function Run([string]$cmd) {
  "PS> $cmd"
  $out = (Invoke-Expression "$cmd 2>&1" | Out-String).TrimEnd()
  if ($out) { $out }
  "[exit=$LASTEXITCODE]"
  ""
}
# 在两个发行版里各执行同一条 Linux 命令
function Both([string]$sh) {
  foreach ($d in 'ft-wsl1', 'ft-wsl2') {
    "[$d]\$ $sh"
    $out = (wsl -d $d -- sh -c $sh 2>&1 | Out-String).TrimEnd()
    if ($out) { $out }
    "[exit=$LASTEXITCODE]"
  }
  ""
}

"# 取证时刻（UTC）：" + [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ')
"# WSL：" + ((wsl --version 2>&1 | Select-Object -First 2) -join '；')
""
"## 0 准备"
New-Item -ItemType Directory -Force -Path $LAB | Out-Null
Set-Location $LAB
if (-not (Test-Path $ALPINE)) { curl.exe -sSL --retry 2 -m 180 -o $ALPINE $ALPINE_URL }
if (-not (Test-Path $SRC)) { curl.exe -sSL --retry 2 -m 300 -o $SRC $SRC_URL }
foreach ($f in $ALPINE, $SRC) { "{0}  {1} 字节  sha256={2}" -f $f, (Get-Item $f).Length, (Get-FileHash $f -Algorithm SHA256).Hash.ToLower() }
if ((Get-FileHash $ALPINE -Algorithm SHA256).Hash.ToLower() -ne $ALPINE_SHA) { "!! Alpine 校验和不符，中止"; exit 1 } else { "Alpine 校验和与发布清单一致" }
""
"## 1 导入：同一份压缩包，两个版本"
Run "wsl --import ft-wsl1 $LAB\wsl1 $LAB\$ALPINE --version 1"
Run "wsl --import ft-wsl2 $LAB\wsl2 $LAB\$ALPINE --version 2"
"PS> wsl -l -v   （只列本实验的两行）"
(wsl -l -v 2>&1 | Out-String) -split "`r?`n" | Where-Object { $_ -match '^\s+NAME\s' -or $_ -match 'ft-wsl' }
""
"## 2 内核"
Both 'uname -r'
Both 'uname -sr'
Both 'cat /proc/version'
Both 'cat /etc/alpine-release'
Both 'cat /proc/cmdline'
Both 'ls /sys/module 2>/dev/null | wc -l'
Both 'dmesg 2>&1 | head -3'
""
"## 3 根文件系统与跨系统的文件访问"
Both 'grep -E " / | /mnt/c " /proc/mounts'
Both 'df -T / /mnt/c 2>&1'
"PS> Windows 一侧：两个发行版各自落在磁盘上的样子"
foreach ($d in 'wsl1', 'wsl2') {
  "--- $LAB\$d"
  Get-ChildItem "$LAB\$d" -Force | ForEach-Object { "{0,-14} {1,14}" -f $_.Name, $(if ($_.PSIsContainer) { '<目录>' } else { $_.Length }) }
}
$files = (Get-ChildItem "$LAB\wsl1\rootfs" -Recurse -Force -File -ErrorAction SilentlyContinue | Measure-Object).Count
$dirs = (Get-ChildItem "$LAB\wsl1\rootfs" -Recurse -Force -Directory -ErrorAction SilentlyContinue | Measure-Object).Count
"wsl1\rootfs 下：$files 个文件，$dirs 个目录（Windows 一侧直接可数）"
"PS> Get-ChildItem $LAB\wsl1\rootfs（前 8 项）"
Get-ChildItem "$LAB\wsl1\rootfs" -Force | Select-Object -First 8 | ForEach-Object { $_.Name }
""
"## 4 进程：Linux 进程在 Windows 一侧看不看得见"
foreach ($d in 'ft-wsl1', 'ft-wsl2') { Start-Process -WindowStyle Hidden wsl.exe -ArgumentList '-d', $d, '--', 'sleep', '3600' }
Start-Sleep -Seconds 6
Both 'ps -o pid,comm | grep -E "PID|sleep"'
"PS> Get-Process -Name sleep   （Windows 的进程表里有没有名为 sleep 的进程）"
$p = Get-Process -Name sleep -ErrorAction SilentlyContinue
if ($p) { $p | ForEach-Object { "{0,-10} Id={1,-7} 路径={2}" -f $_.Name, $_.Id, $(if ($_.Path) { $_.Path -replace [regex]::Escape($LAB), 'C:\ftlab' } else { '(空)' }) } } else { '（没有）' }
"PS> Get-Process vmmem*, wslhost, wslservice, wslrelay  （与 WSL 有关的 Windows 进程，按名字计数）"
Get-Process -Name 'vmmem*', 'wslhost', 'wslservice', 'wslrelay', 'wsl' -ErrorAction SilentlyContinue | Group-Object Name | Sort-Object Name | ForEach-Object { "{0,-16} x{1}" -f $_.Name, $_.Count }
""
"## 5 系统调用：容器依赖的几项内核能力"
Both 'unshare -U id -u 2>&1; echo "rc=$?"'
Both 'unshare -p -f --mount-proc sh -c "echo pid=\$\$" 2>&1; echo "rc=$?"'
Both 'unshare -n ip -o link 2>&1 | cut -c1-60; echo "rc=$?"'
Both 'mkdir -p /tmp/cg && mount -t cgroup2 none /tmp/cg 2>&1; echo "rc=$?"; cat /tmp/cg/cgroup.controllers 2>&1; umount /tmp/cg 2>/dev/null'
Both 'mkdir -p /tmp/t && mount -t tmpfs none /tmp/t 2>&1; echo "rc=$?"; umount /tmp/t 2>/dev/null'
Both 'cat /proc/filesystems | wc -l'
""
"## 6 文件密集操作：解压 WSL 3.0.1 的源码包（各 3 次，秒）"
Both "cp /mnt/c/ftlab/$SRC /root/ && ls -l /root/$SRC | awk '{print \`$5}'"
$bench = 'for i in 1 2 3; do rm -rf {0}; mkdir -p {0}; sync; a=$(date +%s.%N); tar xzf /root/' + $SRC + ' -C {0}; sync; b=$(date +%s.%N); echo "$a $b" | awk ''{{printf "%.2f\n", $2-$1}}''; done; find {0} -type f | wc -l; rm -rf {0}'
"### 6a 解到 Linux 自己的文件系统（/root/x）"
Both ($bench -f '/root/x')
"### 6b 解到 Windows 的文件系统（/mnt/c/ftlab/x_<发行版>）"
foreach ($d in 'ft-wsl1', 'ft-wsl2') {
  $sh = $bench -f "/mnt/c/ftlab/x_$d"
  "[$d]\$ $sh"
  (wsl -d $d -- sh -c $sh 2>&1 | Out-String).TrimEnd()
  "[exit=$LASTEXITCODE]"
}
""
"## 7 收尾：停掉 sleep，终止两个发行版（注销在 19_cleanup.ps1）"
Run 'wsl -t ft-wsl1'
Run 'wsl -t ft-wsl2'
