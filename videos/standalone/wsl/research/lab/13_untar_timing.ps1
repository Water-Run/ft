# 文件密集操作的计时：在 ft-wsl1 与 ft-wsl2 里解压同一个源码包（WSL 3.0.1，1489 个文件、221 个目录）。
# busybox 的 date 没有纳秒，12 里的计时全是 0（那一段作废）；这里改在 Windows 一侧用秒表量「wsl -d <发行版> -- sh -c '…'」整条命令，
# 并量一条空命令作基线（进程启动与进入发行版的开销），两者都列出。每组先做 1 次不计的热身，再计 5 次；
# 每次计时之前清空目标目录，这一步不计入：被计时的只有「tar xzf … ; sync」。
# 前提：11 已执行，/root/WSL-3.0.1.tar.gz 已在两个发行版里。回显存为 out_13_untar_timing.txt。
$ErrorActionPreference = 'Continue'
$env:WSL_UTF8 = '1'
$SRC = 'WSL-3.0.1.tar.gz'
function TimeIt([string]$d, [string]$sh, [string]$prep = 'true', [int]$n = 5) {
  wsl -d $d -- sh -c $prep 2>$null | Out-Null; wsl -d $d -- sh -c $sh 2>$null | Out-Null      # 热身，不计
  $ms = foreach ($i in 1..$n) {
    wsl -d $d -- sh -c $prep 2>$null | Out-Null                                                # 准备（清空目标目录），不计时
    $sw = [Diagnostics.Stopwatch]::StartNew(); wsl -d $d -- sh -c $sh 2>$null | Out-Null; $sw.Stop(); [int]$sw.ElapsedMilliseconds
  }
  $sorted = $ms | Sort-Object
  [pscustomobject]@{ runs = ($ms -join ' '); median = $sorted[[int](($n - 1) / 2)]; min = $sorted[0]; max = $sorted[-1] }
}
"# 取证时刻（UTC）：" + [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ')
"# WSL：" + ((wsl --version 2>&1 | Select-Object -First 2) -join '；')
"# Defender 实时保护：" + $(try { (Get-MpComputerStatus).RealTimeProtectionEnabled } catch { '未知' })
"# 每行：发行版 | 目标 | 5 次（毫秒）| 中位数 | 最小 | 最大"
""
$rows = @()
foreach ($d in 'ft-wsl1', 'ft-wsl2') {
  $base = TimeIt $d 'true'
  "{0,-8} | {1,-34} | {2,-28} | 中位 {3,5} | 最小 {4,5} | 最大 {5,5}" -f $d, '基线：空命令 true', $base.runs, $base.median, $base.min, $base.max
  foreach ($t in @(@('Linux 文件系统 /root/x', '/root/x'), @("Windows 文件系统 /mnt/c/ftlab/x_$d", "/mnt/c/ftlab/x_$d"))) {
    $prep = "rm -rf $($t[1]); mkdir -p $($t[1]); sync"
    $sh = "tar xzf /root/$SRC -C $($t[1]); sync"
    $r = TimeIt $d $sh $prep
    "{0,-8} | {1,-34} | {2,-28} | 中位 {3,5} | 最小 {4,5} | 最大 {5,5}" -f $d, $t[0], $r.runs, $r.median, $r.min, $r.max
    $rows += [pscustomobject]@{ d = $d; target = $t[0]; median = $r.median; base = $base.median }
    wsl -d $d -- sh -c "find $($t[1]) -type f | wc -l; rm -rf $($t[1])" 2>$null | ForEach-Object { "         文件数核对：$_" }
  }
}
""
"# 扣除基线后的中位数（毫秒）"
foreach ($r in $rows) { "{0,-8} | {1,-34} | {2,6}" -f $r.d, $r.target, ($r.median - $r.base) }
""
"# 对照：Windows 自己用 tar.exe 解到 NTFS（5 次，毫秒）"
$w = foreach ($i in 0..5) {
  Remove-Item 'C:\ftlab\x_win' -Recurse -Force -ErrorAction SilentlyContinue; New-Item -ItemType Directory 'C:\ftlab\x_win' | Out-Null
  $sw = [Diagnostics.Stopwatch]::StartNew(); tar.exe -xzf "C:\ftlab\$SRC" -C 'C:\ftlab\x_win' 2>$null; $sw.Stop(); if ($i -gt 0) { [int]$sw.ElapsedMilliseconds }
}
Remove-Item 'C:\ftlab\x_win' -Recurse -Force -ErrorAction SilentlyContinue
"tar.exe  | NTFS C:\ftlab\x_win               | " + ($w -join ' ') + " | 中位 " + ($w | Sort-Object)[2]
""
"# wslc 各子命令的用法（供 14 使用）"
foreach ($c in 'import', 'run', 'images', 'info', 'system info', 'system session', 'volume', 'network', 'inspect', 'stats', 'pull') {
  "PS> wslc $c --help"
  (Invoke-Expression "wslc $c --help 2>&1" | Out-String).TrimEnd() -split "`r?`n" | Where-Object { $_ -notmatch '版权所有|隐私信息' -and $_.Trim() }
  ""
}
wsl -t ft-wsl1 | Out-Null; wsl -t ft-wsl2 | Out-Null
