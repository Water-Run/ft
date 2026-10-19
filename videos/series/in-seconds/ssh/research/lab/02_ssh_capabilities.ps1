# 本机 OpenSSH 能力清单：版本号与 `ssh -Q <类别>` 的支持列表。
# 只记录「支持什么」，不推断「默认选什么」——默认顺序要看 OpenSSH 自己的文档。
#
# 用法：pwsh -File research/lab/02_ssh_capabilities.ps1
# 2026-10-19 首次运行。环境：Windows 11。

$ErrorActionPreference = 'Stop'

Write-Output "环境：$([System.Environment]::OSVersion.VersionString)；$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss zzz'))"
Write-Output ""
Write-Output "───── ssh -V ─────"
Write-Output ((& ssh -V) -join '')
Write-Output ""

foreach ($cat in @('kex', 'cipher', 'cipher-auth', 'mac', 'key', 'key-sig', 'key-cert', 'key-plain', 'compression', 'protocol-version', 'sig', 'help')) {
  $out = & ssh -Q $cat 2>&1
  Write-Output "───── ssh -Q $cat ─────"
  if ($LASTEXITCODE -ne 0) {
    Write-Output "（本机 ssh 不支持该类别，退出码 $LASTEXITCODE）"
    Write-Output ""
    continue
  }
  $lines = @($out | ForEach-Object { $_.ToString() } | Where-Object { $_ -ne '' })
  Write-Output "条目数：$($lines.Count)"
  $i = 0
  foreach ($l in $lines) { $i++; Write-Output ("  {0,2}. {1}" -f $i, $l) }
  Write-Output ""
}
