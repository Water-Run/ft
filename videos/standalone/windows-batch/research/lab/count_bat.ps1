# 统计制作用的 Windows 11 开发机上 .bat / .cmd 文件的数量与分布。只读枚举，不修改任何文件。
$ErrorActionPreference = 'SilentlyContinue'
$opt = [IO.EnumerationOptions]::new(); $opt.RecurseSubdirectories = $true; $opt.IgnoreInaccessible = $true
$opt.AttributesToSkip = [IO.FileAttributes]::ReparsePoint
$sw = [Diagnostics.Stopwatch]::StartNew()
$rows = New-Object System.Collections.Generic.List[string]
foreach ($drive in 'C:\', 'D:\') { foreach ($pat in '*.bat', '*.cmd') { foreach ($f in [IO.Directory]::EnumerateFiles($drive, $pat, $opt)) { $rows.Add($f) } } }
"date: " + (Get-Date -Format 'yyyy-MM-dd HH:mm')
"elapsed_s: " + [int]$sw.Elapsed.TotalSeconds
"total: " + $rows.Count
foreach ($d in 'C:\', 'D:\') { foreach ($e in '.bat', '.cmd') { "{0} {1}: {2}" -f $d, $e, ($rows | Where-Object { $_.StartsWith($d) -and $_.ToLower().EndsWith($e) }).Count } }
'--- C: by top-level directory'
$rows | Where-Object { $_.StartsWith('C:\') } | Group-Object { ($_ -split '\\')[1] } | Sort-Object Count -Descending | Select-Object -First 12 | ForEach-Object { "{0,7}  C:\{1}" -f $_.Count, $_.Name }
'--- C:\Windows by ext'
foreach ($e in '.bat', '.cmd') { "{0}: {1}" -f $e, ($rows | Where-Object { $_.StartsWith('C:\Windows\') -and $_.ToLower().EndsWith($e) }).Count }
'--- inside node_modules (any drive)'
($rows | Where-Object { $_ -match '\\node_modules\\' }).Count
'--- by file name (top 25)'
$rows | Group-Object { [IO.Path]::GetFileName($_).ToLower() } | Sort-Object Count -Descending | Select-Object -First 25 | ForEach-Object { "{0,7}  {1}" -f $_.Count, $_.Name }
'--- well-known entries'
foreach ($n in 'npm.cmd', 'npx.cmd', 'gradlew.bat', 'mvnw.cmd', 'vcvarsall.bat', 'VsDevCmd.bat', 'activate.bat', 'code.cmd', 'pip.cmd', 'yarn.cmd', 'pnpm.cmd', 'tsc.cmd', 'flutter.bat', 'catalina.bat', 'startup.bat', 'emcc.bat', 'setenv.bat', 'build.bat', 'make.bat', 'install.bat', 'run.bat') {
  $hit = $rows | Where-Object { [IO.Path]::GetFileName($_) -ieq $n }
  "{0,-16} {1,6}   e.g. {2}" -f $n, @($hit).Count, (@($hit) | Select-Object -First 1)
}
'--- samples under C:\Windows (first 30)'
$rows | Where-Object { $_.StartsWith('C:\Windows\') } | Select-Object -First 30
'--- C:\Program Files\nodejs'
Get-ChildItem 'C:\Program Files\nodejs' -File | Select-Object -ExpandProperty Name
