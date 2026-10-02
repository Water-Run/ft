# 在 Windows 11 开发机的 cmd.exe 上执行各实验脚本，输出「脚本原文 + 真实回显」。临时目录 D:\batlab，用完删除。
$ErrorActionPreference = 'Stop'
$lab = 'D:\batlab'
if (Test-Path $lab) { Remove-Item -Recurse -Force $lab }
New-Item -ItemType Directory $lab | Out-Null
$files = [ordered]@{
  'echo_on.bat'  = "echo hello`r`n"
  'echo_off.bat' = "@echo off`r`necho hello`r`n"
  'selfmod.bat'  = "@echo off`r`necho 1`r`necho echo 3 >> selfmod.bat`r`necho 2`r`n"
  'rewrite.bat'  = "@echo off`r`necho A`r`npowershell -NoProfile -Command `"(Get-Content rewrite.bat -Raw).Replace('echo C','echo X') | Set-Content -NoNewline -Encoding ascii rewrite.bat`"`r`necho C`r`n"
  'expand.bat'   = "@echo off`r`nset n=1`r`n(`r`n  set n=2`r`n  echo %n%`r`n)`r`necho %n%`r`n"
  'expand_if.bat' = "@echo off`r`nset n=1`r`nif exist expand_if.bat (`r`n  set n=2`r`n  echo %n%`r`n)`r`necho %n%`r`n"
  'delayed.bat'  = "@echo off`r`nsetlocal enabledelayedexpansion`r`nset n=1`r`n(`r`n  set n=2`r`n  echo !n!`r`n)`r`n"
  'expand_echo_on.bat' = "set n=1`r`n(`r`n  set n=2`r`n  echo %n%`r`n)`r`n"
}
foreach ($k in $files.Keys) { [IO.File]::WriteAllText("$lab\$k", $files[$k], [Text.Encoding]::ASCII) }
Set-Location $lab
'=== ver'
cmd /d /c ver
'=== cmd.exe file version'
(Get-Item $env:ComSpec).VersionInfo.ProductVersion
(Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version, BuildNumber | Format-List | Out-String).Trim()
foreach ($k in $files.Keys) {
  "=== $k  (before, {0} bytes)" -f (Get-Item $k).Length
  [IO.File]::ReadAllText("$lab\$k")
  "--- output of: cmd /d /c $k"
  $o = cmd /d /c "prompt `$P`$G & $k" 2>&1 | Out-String
  $o
  "--- file after run ({0} bytes)" -f (Get-Item $k).Length
  [IO.File]::ReadAllText("$lab\$k")
}
'=== set /? (chcp 437, excerpt about delayed expansion)'
$h = cmd /d /c "chcp 437 >nul & set /?" | Out-String
$i = $h.IndexOf('Delayed environment variable expansion'); if ($i -lt 0) { $i = $h.IndexOf('延迟') }
if ($i -ge 0) { $h.Substring([Math]::Max(0,$i-1200), [Math]::Min($h.Length-[Math]::Max(0,$i-1200), 3200)) } else { $h.Substring(0, [Math]::Min(3000,$h.Length)) }
Set-Location D:\
Remove-Item -Recurse -Force $lab
'=== cleaned: ' + (-not (Test-Path $lab))
