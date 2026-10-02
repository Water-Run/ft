# 补充实验：与片中画面逐字对应的两个脚本（hello.bat、expand6.bat），以及 cmd.exe 回显行的确切格式。临时目录 D:\batlab，用完删除。
$ErrorActionPreference = 'Stop'
$lab = 'D:\batlab'
if (Test-Path $lab) { Remove-Item -Recurse -Force $lab }
New-Item -ItemType Directory $lab | Out-Null
[IO.File]::WriteAllText("$lab\hello.bat", "echo hello`r`n", [Text.Encoding]::ASCII)
[IO.File]::WriteAllText("$lab\expand6.bat", "@echo off`r`nset n=1`r`n(`r`n  set n=2`r`n  echo %n%`r`n)`r`n", [Text.Encoding]::ASCII)
[IO.File]::WriteAllText("$lab\echo_off.bat", "@echo off`r`necho hello`r`n", [Text.Encoding]::ASCII)
Set-Location $lab
$env:PROMPT = $null
'=== hello.bat via: cmd /d /c hello.bat   (PROMPT unset = default $P$G)'
$o = cmd /d /c hello.bat 2>&1; $o | ForEach-Object { '[' + $_ + ']' }
'=== echo_off.bat'
$o = cmd /d /c echo_off.bat 2>&1; $o | ForEach-Object { '[' + $_ + ']' }
'=== expand6.bat'
$o = cmd /d /c expand6.bat 2>&1; $o | ForEach-Object { '[' + $_ + ']' }
'=== pwsh / powershell versions on this machine'
'pwsh: ' + $PSVersionTable.PSVersion.ToString()
'windows powershell: ' + (& "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -Command '$PSVersionTable.PSVersion.ToString()')
Set-Location D:\
Remove-Item -Recurse -Force $lab
'=== cleaned: ' + (-not (Test-Path $lab))
