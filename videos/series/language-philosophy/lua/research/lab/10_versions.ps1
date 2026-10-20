# 本机可用的 Lua 解释器版本：预装的 5.5.0，以及后面用官方源码构建的 5.4.9 / 5.3.6。
# 目的：记录实验所用的解释器身份，供 FACTS.md 与画面引用。
# 在 Windows 11 + PowerShell 7 上执行。回显存为 out_10_versions.txt。
$ErrorActionPreference = 'Continue'
$LAB = 'C:\ftlab'
$LUA55 = 'C:\SoftWare\lua\lua-5.5.0_Win64_bin\lua55.exe'
New-Item -ItemType Directory -Force -Path $LAB | Out-Null

"取证时刻（UTC+8）：" + (Get-Date).ToString('yyyy-MM-ddTHH:mm:sszzz')
"系统：" + [System.Environment]::OSVersion.VersionString
"PowerShell：" + $PSVersionTable.PSVersion.ToString()
""

"## 1 预装解释器 5.5.0"
"PS> & lua55.exe -v"
$out = (& $LUA55 -v 2>&1 | Out-String).TrimEnd()
if ($out) { $out }
"[exit=$LASTEXITCODE]"
""

"## 2 解释器自报版本与常量"
$code = @'
print("_VERSION        =", _VERSION)
print("_G._VERSION     =", _G._VERSION)
print("type(print)     =", type(print))
print("type({})        =", type({}))
print("type(nil)       =", type(nil))
print("type(true)      =", type(true))
print("type('')        =", type(''))
print("type(io.stdout) =", type(io.stdout))
print("type(coroutine.create(print)) =", type(coroutine.create(print)))
'@
$f = Join-Path $LAB 'version_probe.lua'
Set-Content -Path $f -Value $code -Encoding utf8NoBOM
"PS> & lua55.exe version_probe.lua"
$out = (& $LUA55 $f 2>&1 | Out-String).TrimEnd()
if ($out) { $out }
"[exit=$LASTEXITCODE]"
""

"## 3 源码构建的旧版本（由 11_build_older.ps1 生成）"
foreach ($v in '5.4.9', '5.3.6') {
  $exe = Join-Path $LAB "lua-$v\src\lua.exe"
  if (Test-Path $exe) {
    "PS> & lua-$v\src\lua.exe -v"
    $o = (& $exe -v 2>&1 | Out-String).TrimEnd()
    if ($o) { $o }
    "[exit=$LASTEXITCODE]"
  } else {
    "lua-$v\src\lua.exe 不存在；先运行 11_build_older.ps1"
  }
  ""
}
