# 04 本机作为「你的电脑」时，连接 RDP 会报上的几项设置（关键帧 C4 的示例值）
# 运行：pwsh -NoProfile -File videos/in-seconds/rdp/research/lab/04_client_settings.ps1 > videos/in-seconds/rdp/research/lab/out_04_client_settings.txt
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$v = Get-CimInstance Win32_VideoController | Where-Object { $_.CurrentHorizontalResolution } | Select-Object -First 1
"# 屏幕分辨率: $($v.CurrentHorizontalResolution)x$($v.CurrentVerticalResolution)"
$dpi = (Get-ItemProperty 'HKCU:\Control Panel\Desktop\WindowMetrics').AppliedDPI
"# AppliedDPI: $dpi（缩放 $([math]::Round($dpi / 96 * 100))%）"
$l = (Get-WinUserLanguageList)[0]
"# 输入语言: $($l.LanguageTag)  $($l.InputMethodTips -join ',')"
"# 时区: $((Get-TimeZone).Id)  $((Get-TimeZone).BaseUtcOffset)"
