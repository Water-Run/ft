# 用官方源码构建 Lua 5.4.9 与 5.3.6，用来在同机对比 5.3 / 5.4 / 5.5 的行为差异。
# 步骤：从 www.lua.org/ftp 取官方压缩包，按官方公布的 SHA-256 校验，用 MinGW gcc 构建。
# 演示目录 C:\ftlab（不含个人身份信息）；构建产物不入库，见 FACTS.md「环境与版本」。
# 脱敏：gcc 的诊断信息里可能出现编译器的安装路径与临时目录，其中含个人用户名；
#       回显写入前统一替换为 C:\Users\user（见 FACTS.md「环境与版本」的脱敏说明）。
# 在 Windows 11 + PowerShell 7 上执行。回显存为 out_11_build_older.txt。
$ErrorActionPreference = 'Continue'
$LAB = 'C:\ftlab'
New-Item -ItemType Directory -Force -Path $LAB | Out-Null
$ORIG = (Get-Location).Path
Set-Location $LAB

function Sanitize([string]$text) {
  if (-not $text) { return $text }
  $text = $text -replace [regex]::Escape("$env:USERPROFILE"), 'C:\Users\user'
  $text = $text -replace [regex]::Escape(($env:USERPROFILE -replace '\\', '/')), 'C:/Users/user'
  $text = $text -replace [regex]::Escape($env:TEMP), 'C:\Users\user\AppData\Local\Temp'
  return $text
}

"取证时刻（UTC+8）：" + (Get-Date).ToString('yyyy-MM-ddTHH:mm:sszzz')
"PS> gcc --version"
$gccv = (gcc --version 2>&1 | Select-Object -First 1)
$gccv
"[exit=$LASTEXITCODE]"
""

# 官方公布的文件名与 SHA-256，取自 https://www.lua.org/ftp/ （该页最后更新 2026-08-25）
$pkgs = @(
  @{ name = 'lua-5.4.9'; file = 'lua-5.4.9.tar.gz'; sha = '2335b6c582a52654f94612bf10d2f4672805d05329aa6568b1d8cd9e5c6fb8e6' },
  @{ name = 'lua-5.3.6'; file = 'lua-5.3.6.tar.gz'; sha = 'fc5fd69bb8736323f026672b1b7235da613d7177e72558893a0bdcd320466d60' }
)

foreach ($p in $pkgs) {
  "## $($p.name)"
  if (-not (Test-Path $p.file)) {
    "PS> curl.exe -sSL -o $($p.file) https://www.lua.org/ftp/$($p.file)"
    curl.exe -sSL --retry 2 -m 300 -o $p.file "https://www.lua.org/ftp/$($p.file)"
    "[exit=$LASTEXITCODE]"
  } else {
    "已存在 $($p.file)，跳过下载"
  }
  $len = (Get-Item $p.file).Length
  $sha = (Get-FileHash -Algorithm SHA256 $p.file).Hash.ToLower()
  "$($p.file)  $len 字节  sha256=$sha"
  if ($sha -ne $p.sha) {
    "!! 校验和不符，停止构建 $($p.name)"
    ""
    continue
  }
  "SHA-256 与官方公布值一致"

  if (Test-Path $p.name) { Remove-Item -Recurse -Force $p.name }
  "PS> tar -xzf $($p.file)"
  tar -xzf $p.file
  "[exit=$LASTEXITCODE]"

  Push-Location (Join-Path $LAB "$($p.name)\src")
  # 用 Lua 发行包自带的 Makefile 构建（PLATS 含 mingw），与官方推荐的构建方式一致
  "PS> mingw32-make mingw"
  $out = (mingw32-make mingw 2>&1 | Out-String).TrimEnd()
  if ($out) { Sanitize $out }
  "[exit=$LASTEXITCODE]"
  if (Test-Path 'lua.exe') {
    "构建产物：$($p.name)\src\lua.exe  $((Get-Item 'lua.exe').Length) 字节"
    "PS> & lua.exe -v"
    $v = (& '.\lua.exe' -v 2>&1 | Out-String).TrimEnd()
    if ($v) { Sanitize $v }
    "[exit=$LASTEXITCODE]"
  } else {
    "!! 未生成 lua.exe"
  }
  Pop-Location
  ""
}
# 回到调用方的工作目录，避免调用方随后的相对路径落到演示目录里
Set-Location $ORIG
