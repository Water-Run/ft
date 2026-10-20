// P39 测绘的取帧脚本：从中文主成片按时刻取帧，供复核 docs/log/reviews/2026-10-20-web-login-graphics.md 的三处实例。
// 用法（仓库根目录）：node kit/tools/... 不可用时直接跑本脚本：
//   pwsh -File videos/web-login/research/lab/61_take_p39_frames.ps1
// 主成片路径由参数给出，默认取本片 out/ 下的中文主成片；成片已发布后不在本机时，用平台上的同版本文件核对。
param(
  [string]$Mp4 = ''
)
$ErrorActionPreference = 'Stop'
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $Mp4) {
  $cand = Join-Path (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $dir)))) 'out/web-login-zh-1080p60.mp4'
  $Mp4 = $cand
}
if (-not (Test-Path $Mp4)) { Write-Output "找不到主成片：$Mp4（已归档或未在本机时，改为传入平台同版本文件）"; exit 1 }
$ff = Join-Path (Resolve-Path (Join-Path $dir '../../../../assets/ffmpeg/bin')) 'ffmpeg.exe'
$shots = @(
  @{ t = '104.0'; out = 'p39_f01_104.0_hash.png';        note = '哈希压模（对照：此处图形与旁白一致）' },
  @{ t = '120.5'; out = 'p39_f02_120.5_phishing-label.png'; note = '实例二：红圆飞走后「知道」标签留在原地，紧挨黄三角' },
  @{ t = '129.0'; out = 'p39_f03_129.0_passkey.png';       note = '实例三：私钥画成不可读的阶梯块' },
  @{ t = '172.5'; out = 'p39_f04_172.5_oidc.png';          note = 'OIDC 与 ID Token（对照：此处图形与旁白一致）' },
  @{ t = '180.8'; out = 'p39_f05_180.8_trust.png';         note = '实例一：信任集中，五个空框倾倒' },
  @{ t = '196.0'; out = 'p39_f06_196.0_outro.png';         note = '片尾名单（对照：此处图形与旁白一致）' }
)
foreach ($s in $shots) {
  & $ff -hide_banner -loglevel error -y -ss $s.t -i $Mp4 -frames:v 1 -vf 'scale=640:360' (Join-Path $dir $s.out)
  Write-Output ("{0}  t={1}  {2}" -f $s.out, $s.t, $s.note)
}
Write-Output '完成：六帧覆盖三个实例与三个对照。'
