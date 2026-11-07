# 01 本机：RDP 服务端监听的端口、客户端版本、会话列表
# 运行：pwsh -NoProfile -File videos/in-seconds/rdp/research/lab/01_local_rdp.ps1 > videos/in-seconds/rdp/research/lab/out_01_local_rdp.txt
# 会话列表里的本机用户名在输出前替换为 user（脱敏，见 FACTS.md）。
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$ts = 'HKLM:\SYSTEM\CurrentControlSet\Control\Terminal Server'
"# OS: " + [Environment]::OSVersion.VersionString
"# mstsc.exe ProductVersion: " + (Get-Item "$env:SystemRoot\System32\mstsc.exe").VersionInfo.ProductVersion
"# RDP-Tcp PortNumber: " + (Get-ItemProperty "$ts\WinStations\RDP-Tcp").PortNumber
"# fDenyTSConnections: " + (Get-ItemProperty $ts).fDenyTSConnections
"# TermService: " + (Get-Service TermService).Status
"# mstsc.exe FileDescription: " + (Get-Item "$env:SystemRoot\System32\mstsc.exe").VersionInfo.FileDescription
"# qwinsta:"
$old = [Console]::OutputEncoding
[Console]::OutputEncoding = [Text.Encoding]::GetEncoding(936)
$q = & qwinsta.exe
[Console]::OutputEncoding = $old
$q | ForEach-Object { $_ -replace [regex]::Escape($env:USERNAME), 'user' }
