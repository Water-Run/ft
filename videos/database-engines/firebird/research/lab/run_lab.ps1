# Firebird 一集的取证实验：一次跑完，产出全部证据
#
# 用法（在仓库根目录）：
#   powershell -ExecutionPolicy Bypass -File videos/database-engines/firebird/research/lab/run_lab.ps1
#
# 前提：官方安装包已解压到 research/_src/fb504/（不入库；版本与校验和见 research/FACTS.md 的 T02）。
# 产出：证据写进 research/lab/（入库）；体积大的 .fdb 快照留在 out/lab/（不入库，可由脚本重新生成）。
#
# 实验用完即清：脚本结束时停掉服务端进程。库文件与安装目录留给后续重做，收尾时按
# docs/guides/release.md 撤除。

$ErrorActionPreference = 'Stop'

$Lab   = $PSScriptRoot
$Video = Split-Path (Split-Path $Lab -Parent) -Parent
$Repo  = Split-Path (Split-Path (Split-Path (Split-Path $Video -Parent) -Parent) -Parent) -Parent
$Fb    = Join-Path $Video 'research\_src\fb504'
$Out   = Join-Path $Video 'out\lab'
$Isql  = Join-Path $Fb 'isql.exe'
$Dsn   = 'inet://127.0.0.1:3051/lab/demo.fdb'
$Port  = 3051

New-Item -ItemType Directory -Force -Path $Out | Out-Null
$env:FIREBIRD = $Fb
$env:FB_CLIENT = Join-Path $Fb 'fbclient.dll'
$env:PATH = "$Fb;$env:PATH"
# 原生命令的输出按 UTF-8 解码：否则 Python 的中文在控制台按 GBK 读，落盘就是乱码
$env:PYTHONIOENCODING = 'utf-8'
$env:PYTHONUTF8 = '1'
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)

function Say($m) { Write-Host "== $m" }

# ── 实验口令：现场生成，不入库 ──
# 第一次跑时随机生成一个，写进 out/lab/lab_password.txt（out/ 不入库），
# 之后各次跑读同一个值——安全库里的 SYSDBA 口令是建库时定下的，改了就连不上。
# 入库的 .sql 里只留 __FTLAB_PASSWORD__ 占位符，由本脚本替换后写到 out/lab/ 再执行。
$PwdFile = Join-Path $Out 'lab_password.txt'
if (Test-Path $PwdFile) {
  $env:FTLAB_PASSWORD = (Get-Content $PwdFile -Raw).Trim()
} else {
  $bytes = New-Object byte[] 18
  [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
  $env:FTLAB_PASSWORD = 'ft' + ([Convert]::ToHexString($bytes)).ToLower()
  Set-Content -Path $PwdFile -Value $env:FTLAB_PASSWORD -Encoding utf8
}
Say "实验口令已就绪（不出库，存于 out/lab/lab_password.txt）"

# 把带占位符的 .sql 复制成可执行的一份，放进 out/lab/
function Prepare-Sql($name) {
  $src = Join-Path $Lab $name
  $dst = Join-Path $Out $name
  (Get-Content $src -Raw -Encoding UTF8).Replace('__FTLAB_PASSWORD__', $env:FTLAB_PASSWORD) |
    Set-Content -Path $dst -Encoding utf8
  return $dst
}

function Start-Server {
  Start-Process -FilePath (Join-Path $Fb 'firebird.exe') -ArgumentList '-p', $Port -WorkingDirectory $Fb `
    -WindowStyle Hidden -RedirectStandardOutput (Join-Path $Out 'server.out') -RedirectStandardError (Join-Path $Out 'server.err')
  Start-Sleep -Seconds 6
}

function Stop-Server {
  Get-Process firebird -ErrorAction SilentlyContinue | Stop-Process -Force
  Start-Sleep -Seconds 3
}

# ── 0. 安全库：先确保 security5.fdb 在位，再用嵌入式连接建 SYSDBA ──
# 装包里带的是出厂的空安全库（没有任何预置用户）。控制台方式启动的服务端不会
# 自动生成它，缺了它嵌入式引擎会报「文件不存在」；缺了就从安装包里取回这一份。
Say '00 准备安全库'
$SecDb = Join-Path $Fb 'SECURITY5.FDB'
if (-not (Test-Path $SecDb)) {
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $zipPath = Join-Path $Video 'research\_src\fb504-win64.zip'
  $zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
  try {
    $entry = $zip.Entries | Where-Object { $_.FullName -match 'SECURITY5\.FDB$' } | Select-Object -First 1
    if ($null -eq $entry) { throw "安装包里没有 SECURITY5.FDB" }
    [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $SecDb, $true)
  } finally { $zip.Dispose() }
  Say '   已从安装包取回出厂的 security5.fdb'
}
# 之后按 doc/README.security_database.txt 的步骤，用嵌入式连接建用户。
# 工作目录切到 out/lab/，让 SQL 里的库文件用相对路径，入库文件不留本机绝对路径。
Say '00 安全库初始化（嵌入式）'
$env:FIREBIRD_TMP = Join-Path $Out 'tmp'
New-Item -ItemType Directory -Force -Path $env:FIREBIRD_TMP | Out-Null
Push-Location $Out
# 上一次留下的临时库会让 CREATE DATABASE 失败，isql 因此连不上库、后面的语句全部落空；先清掉
$InitDb = Join-Path $Out 'security_init.fdb'
if (Test-Path $InitDb) { Remove-Item $InitDb -Force }
& $Isql -q -user SYSDBA -i (Prepare-Sql '02_init_user.sql') 2>&1 | Out-File -FilePath (Join-Path $Lab 'out_02_init_user.txt') -Encoding utf8
Pop-Location
# ── 1. 服务端 ──
Say '01 起服务端'
Start-Server

# ── 2. 建库与运行参数（先把上一轮的库删掉，再建干净的）──
Say '02 运行参数'
& $Isql -q -user SYSDBA -password $env:FTLAB_PASSWORD -i (Join-Path $Lab '03a_drop.sql') $Dsn 2>&1 | Out-Null
& $Isql -q -user SYSDBA -password $env:FTLAB_PASSWORD -i (Prepare-Sql '01_probe.sql') 2>&1 | Tee-Object -FilePath (Join-Path $Lab 'out_01_probe.txt') | Out-Null

# ── 3. 系列标准示例表 ──
Say '03 示例表与数据'
& $Isql -q -user SYSDBA -password $env:FTLAB_PASSWORD -i (Prepare-Sql '03_schema.sql') $Dsn 2>&1 | Tee-Object -FilePath (Join-Path $Lab 'out_03_schema.txt') | Out-Null

# ── 4. 两会话并发 ──
Say '04 行版本与并发'
python (Join-Path $Lab '04_mvcc.py') $Dsn (Join-Path $Fb 'lab\demo.fdb') $Lab 2>&1 |
  Tee-Object -FilePath (Join-Path $Lab 'out_04_mvcc_stdout.txt') | Out-Null

# ── 5. 页类型分布 ──
Say '05 页类型分布'
python (Join-Path $Lab '05_pages.py') (Join-Path $Fb 'lab\demo.fdb') 8192 alice (Join-Path $Lab 'out_05_pages.json') 2>&1 | Out-Null

# ── 6. 三种连接方式；停掉服务端后只有嵌入式还活着 ──
Say '06 三种连接方式（服务端在）'
python (Join-Path $Lab '06_modes.py') $Dsn (Join-Path $Fb 'lab\demo.fdb') $Fb $Lab 2>&1 |
  Tee-Object -FilePath (Join-Path $Lab 'out_06_modes_on.txt') | Out-Null
Copy-Item (Join-Path $Lab 'out_06_modes.json') (Join-Path $Lab 'out_06_modes_on.json') -Force
Stop-Server
Say '06 三种连接方式（服务端已停）'
python (Join-Path $Lab '06_modes.py') $Dsn (Join-Path $Fb 'lab\demo.fdb') $Fb $Lab server-off 2>&1 |
  Tee-Object -FilePath (Join-Path $Lab 'out_06_modes_off.txt') | Out-Null
Copy-Item (Join-Path $Lab 'out_06_modes.json') (Join-Path $Lab 'out_06_modes_off.json') -Force
Start-Server

# ── 7. 一次 UPDATE 的副本计数（干净库对照）──
Say '07 干净库的一次 UPDATE'
$CleanDsn = 'inet://127.0.0.1:3051/lab/clean2.fdb'
& $Isql -q -user SYSDBA -password $env:FTLAB_PASSWORD -i (Join-Path $Lab '03a_drop.sql') $CleanDsn 2>&1 | Out-Null
& $Isql -q -user SYSDBA -password $env:FTLAB_PASSWORD -i (Prepare-Sql '08a_create.sql') 2>&1 | Tee-Object -FilePath (Join-Path $Lab 'out_08a_create.txt') | Out-Null
python (Join-Path $Lab '08_clean_versions.py') $CleanDsn (Join-Path $Fb 'lab\clean2.fdb') $Out 2>&1 |
  Tee-Object -FilePath (Join-Path $Lab 'out_08_clean_versions.txt') | Out-Null
Copy-Item (Join-Path $Out 'out_08_clean_versions.json') (Join-Path $Lab 'out_08_clean_versions.json') -Force

# ── 8. 官网标志的配色 ──
Say '08 标志配色'
python (Join-Path $Lab '09_logo_colors.py') (Join-Path $Video 'research\_src\web\fb-logo.png') 2>&1 |
  Tee-Object -FilePath (Join-Path $Lab 'out_09_logo_colors.txt') | Out-Null

# ── 9. 配乐自检 ──
Say '09 配乐自检'
python (Join-Path $Lab '10_music_smoke.py') (Join-Path $Video 'tools\music.py') (Join-Path $Lab 'out_10_music.json') 2>&1 |
  Tee-Object -FilePath (Join-Path $Lab 'out_10_music.txt') | Out-Null

# ── 10. 样式 lint ──
Say '10 样式检查'
python (Join-Path $Lab '11_style_lint.py') $Video 2>&1 | Tee-Object -FilePath (Join-Path $Lab 'out_11_style_lint.txt') | Out-Null

Stop-Server
Say '完成。证据在 research/lab/，大文件在 out/lab/。'
