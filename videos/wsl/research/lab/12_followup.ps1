# 接 11：三项补充。（a）WSL 1 报出的内核版本字符串里的数字与 Windows 内核文件的版本号对照；
# （b）WSL 1 的 Linux 进程在 Windows 进程表里是否可见（几种查法）；（c）解压计时（11 里那一段的引号被命令行吃掉，未得到数字）。
# 前提：11_wsl1_vs_wsl2.ps1 已执行，ft-wsl1、ft-wsl2 与 C:\ftlab 里的两个压缩包还在。回显存为 out_12_followup.txt。
$ErrorActionPreference = 'Continue'
$env:WSL_UTF8 = '1'
$LAB = 'C:\ftlab'
$SRC = 'WSL-3.0.1.tar.gz'
function InDistro([string]$d, [string]$sh) {
  "[$d]\$ $sh"
  $out = (wsl -d $d -- sh -c $sh 2>&1 | Out-String).TrimEnd()
  if ($out) { $out }
  "[exit=$LASTEXITCODE]"
}
"# 取证时刻（UTC）：" + [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ')
""
"## a 版本字符串里的数字"
"PS> (Get-Item C:\Windows\System32\ntoskrnl.exe).VersionInfo.ProductVersion"
(Get-Item C:\Windows\System32\ntoskrnl.exe).VersionInfo.ProductVersion
"PS> (Get-Item C:\Windows\System32\drivers\lxcore.sys).VersionInfo | fl ProductVersion, FileDescription"
$lx = Get-Item C:\Windows\System32\drivers\lxcore.sys -ErrorAction SilentlyContinue
if ($lx) { "ProductVersion  : " + $lx.VersionInfo.ProductVersion; "FileDescription : " + $lx.VersionInfo.FileDescription; "Length          : " + $lx.Length } else { '（没有 lxcore.sys）' }
"PS> Get-Item C:\Windows\System32\drivers\lxss.sys"
$ls = Get-Item C:\Windows\System32\drivers\lxss.sys -ErrorAction SilentlyContinue
if ($ls) { "ProductVersion  : " + $ls.VersionInfo.ProductVersion; "FileDescription : " + $ls.VersionInfo.FileDescription; "Length          : " + $ls.Length } else { '（没有 lxss.sys）' }
"PS> [Environment]::OSVersion.Version / 注册表里的版本"
$cv = Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion'
"CurrentBuild=$($cv.CurrentBuild) UBR=$($cv.UBR) BuildLabEx=$($cv.BuildLabEx)"
InDistro 'ft-wsl1' 'cat /proc/version'
""
"## b 进程可见性"
$p1 = Start-Process -WindowStyle Hidden -PassThru wsl.exe -ArgumentList '-d', 'ft-wsl1', '--', 'sleep', '7777'
$p2 = Start-Process -WindowStyle Hidden -PassThru wsl.exe -ArgumentList '-d', 'ft-wsl2', '--', 'sleep', '8888'
Start-Sleep -Seconds 6
InDistro 'ft-wsl1' 'ps -o pid,args | grep -E "PID|sleep 7777" | grep -v grep'
InDistro 'ft-wsl2' 'ps -o pid,args | grep -E "PID|sleep 8888" | grep -v grep'
"PS> tasklist | findstr /i sleep"
$t = (tasklist | Select-String -Pattern 'sleep' | ForEach-Object { $_.Line }); if ($t) { $t } else { '（没有）' }
"PS> Get-CimInstance Win32_Process | ? Name -match 'sleep|^init'"
$c = Get-CimInstance Win32_Process | Where-Object { $_.Name -match 'sleep|^init$' } | ForEach-Object { "{0,-12} Pid={1,-7} 命令行={2}" -f $_.Name, $_.ProcessId, $(if ($_.CommandLine) { $_.CommandLine } else { '(空)' }) }
if ($c) { $c } else { '（没有）' }
"PS> [Diagnostics.Process]::GetProcesses() 里名字为空或为 sleep、init 的项"
$g = [Diagnostics.Process]::GetProcesses() | Where-Object { $_.ProcessName -match '^(sleep|init|sh|ash)$' -or -not $_.ProcessName } | ForEach-Object { "{0,-12} Id={1}" -f $(if ($_.ProcessName) { $_.ProcessName } else { '(空名)' }), $_.Id }
if ($g) { $g } else { '（没有）' }
"PS> wsl.exe 之外，与两个 sleep 相关的 Windows 进程（按名字计数）"
Get-Process -Name 'vmmem*', 'wslhost', 'wslservice', 'wslrelay', 'wsl' -ErrorAction SilentlyContinue | Group-Object Name | Sort-Object Name | ForEach-Object { "{0,-16} x{1}" -f $_.Name, $_.Count }
foreach ($p in $p1, $p2) { try { Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue } catch {} }
""
"## c 解压计时：WSL 3.0.1 源码包（$SRC），各 3 次"
$bench = @'
#!/bin/sh
# 用法：bench.sh <压缩包> <目标目录>。解压三次，每次之前清空目标目录；计时含 sync。
for i in 1 2 3; do
  rm -rf "$2"; mkdir -p "$2"; sync
  a=$(date +%s%N)
  tar xzf "$1" -C "$2"; sync
  b=$(date +%s%N)
  echo "run $i: $(( (b - a) / 1000000 )) ms"
done
echo "files: $(find "$2" -type f | wc -l)  dirs: $(find "$2" -type d | wc -l)"
rm -rf "$2"
'@
[IO.File]::WriteAllText("$LAB\bench.sh", $bench.Replace("`r`n", "`n"))
"PS> Get-Content $LAB\bench.sh"
$bench
""
"### c1 解到 Linux 自己的文件系统"
foreach ($d in 'ft-wsl1', 'ft-wsl2') { InDistro $d "sh /mnt/c/ftlab/bench.sh /root/$SRC /root/x" }
"### c2 解到 Windows 的文件系统（经 /mnt/c）"
foreach ($d in 'ft-wsl1', 'ft-wsl2') { InDistro $d "sh /mnt/c/ftlab/bench.sh /root/$SRC /mnt/c/ftlab/x_$d" }
"### c3 对照：Windows 自己解同一个包（tar.exe，NTFS）"
foreach ($i in 1..3) {
  Remove-Item "$LAB\x_win" -Recurse -Force -ErrorAction SilentlyContinue; New-Item -ItemType Directory "$LAB\x_win" | Out-Null
  $sw = [Diagnostics.Stopwatch]::StartNew(); tar.exe -xzf "$LAB\$SRC" -C "$LAB\x_win" 2>$null; $sw.Stop()
  "run ${i}: $($sw.ElapsedMilliseconds) ms"
}
Remove-Item "$LAB\x_win" -Recurse -Force -ErrorAction SilentlyContinue
"PS> Get-MpComputerStatus | select RealTimeProtectionEnabled"
try { "RealTimeProtectionEnabled=" + (Get-MpComputerStatus).RealTimeProtectionEnabled } catch { '（查询失败）' }
""
wsl -t ft-wsl1 | Out-Null; wsl -t ft-wsl2 | Out-Null
"# 两个发行版已终止"
