# 两套版本号：软件包的版本（wsl --version）与发行版的架构版本（wsl -l -v 的 VERSION 列）。
# 在装有 WSL 3.0.x 的 Windows 11 上用 PowerShell 7 执行；只读，唯一会改设置的一步（把默认版本设为 3）预期失败，
# 若它竟然成功，脚本立即把默认版本改回原值。回显存为 out_10_versions.txt。
# 回显里不属于本实验的发行版只保留默认的那一行，其余各行用一行说明代替（名称与本片无关）。
$ErrorActionPreference = 'Continue'
$env:WSL_UTF8 = '1'
function Run([string]$cmd) {
  "PS> $cmd"
  $out = (Invoke-Expression "$cmd 2>&1" | Out-String).TrimEnd()
  if ($out) { $out }
  "[exit=$LASTEXITCODE]"
  ""
}
function ListDistros {
  "PS> wsl -l -v"
  $lines = (wsl -l -v 2>&1 | Out-String).TrimEnd() -split "`r?`n"
  $shown = @(); $others = @()
  foreach ($l in $lines) {
    if ($l -match '^\s+NAME\s' -or $l -match '^\*' -or $l -match '^\s+ft-') { $shown += $l }
    elseif ($l.Trim()) { $others += ($l.Trim() -split '\s+')[-1] }
  }
  $shown
  if ($others.Count) { "  （另有 $($others.Count) 个与本实验无关的发行版从略，VERSION 列依次为：$($others -join '、')）" }
  "[exit=$LASTEXITCODE]"
  ""
}

"# 取证时刻（UTC）：" + [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ')
"# 系统：" + (Get-CimInstance Win32_OperatingSystem | ForEach-Object { $_.Caption + ' ' + $_.Version })
"# 界面语言：" + (Get-UICulture).Name
""
Run 'wsl --version'
Run 'wsl --status'
ListDistros
$before = ((wsl --status 2>&1 | Out-String) -split "`r?`n" | Where-Object { $_ -match '(\d)\s*$' } | Select-Object -Last 1)
Run 'wsl --set-default-version 3'
Run 'wsl --status'
$after = ((wsl --status 2>&1 | Out-String) -split "`r?`n" | Where-Object { $_ -match '(\d)\s*$' } | Select-Object -Last 1)
if ($before -ne $after) { "# 默认版本被改动，改回 2"; Run 'wsl --set-default-version 2' } else { "# 默认版本未变：$after"; "" }
Run 'wsl --set-default-version 2'
Run 'wslc --version'
Run 'wslc version'
"PS> Get-ChildItem 'C:\Program Files\WSL' -File -Filter *.exe"
Get-ChildItem 'C:\Program Files\WSL' -File -Filter *.exe | Sort-Object Name | ForEach-Object { "{0,-20} {1,10} {2}" -f $_.Name, $_.Length, $_.VersionInfo.ProductVersion }
""
"PS> (Get-FileHash wslc.exe).Hash -eq (Get-FileHash container.exe).Hash"
(Get-FileHash 'C:\Program Files\WSL\wslc.exe').Hash -eq (Get-FileHash 'C:\Program Files\WSL\container.exe').Hash
