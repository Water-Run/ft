# 复核：.bat/.cmd 中有多少是 npm 生成的入口（node_modules\.bin 下的 .cmd，以及全局前缀目录下的 .cmd）。只读枚举。
$ErrorActionPreference = 'SilentlyContinue'
$opt = [IO.EnumerationOptions]::new(); $opt.RecurseSubdirectories = $true; $opt.IgnoreInaccessible = $true
$opt.AttributesToSkip = [IO.FileAttributes]::ReparsePoint
$rows = New-Object System.Collections.Generic.List[string]
foreach ($drive in 'C:\', 'D:\') { foreach ($pat in '*.bat', '*.cmd') { foreach ($f in [IO.Directory]::EnumerateFiles($drive, $pat, $opt)) { $rows.Add($f) } } }
"date: " + (Get-Date -Format 'yyyy-MM-dd HH:mm')
"total: " + $rows.Count
$bin = @($rows | Where-Object { $_ -match '\\node_modules\\\.bin\\[^\\]+\.cmd$' })
$nm = @($rows | Where-Object { $_ -match '\\node_modules\\' })
$glob = @($rows | Where-Object { $_ -match '\\AppData\\Roaming\\npm\\[^\\]+\.cmd$' })
"node_modules\.bin\*.cmd: " + $bin.Count
"anywhere under node_modules: " + $nm.Count
"global npm prefix (AppData\Roaming\npm\*.cmd): " + $glob.Count
"npm-generated entries (.bin + global prefix): " + ($bin.Count + $glob.Count)
"share: {0:P1}" -f (($bin.Count + $glob.Count) / $rows.Count)
"under node_modules but not .bin (.cmd/.bat shipped by packages): " + ($nm.Count - $bin.Count)
'--- sample of a generated entry (first 12 lines)'
if ($bin.Count) { Get-Content $bin[0] -TotalCount 12; "    file: ...\node_modules\.bin\" + [IO.Path]::GetFileName($bin[0]) }
'--- python venv activate.bat: ' + @($rows | Where-Object { [IO.Path]::GetFileName($_) -ieq 'activate.bat' }).Count
'--- gradlew.bat: ' + @($rows | Where-Object { [IO.Path]::GetFileName($_) -ieq 'gradlew.bat' }).Count
'--- vcvarsall.bat: ' + @($rows | Where-Object { [IO.Path]::GetFileName($_) -ieq 'vcvarsall.bat' }).Count
'--- C:\Windows: ' + @($rows | Where-Object { $_.StartsWith('C:\Windows\') }).Count
