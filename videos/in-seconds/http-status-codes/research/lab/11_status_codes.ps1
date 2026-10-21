# 11_status_codes.ps1
# 演示常见 HTTP 状态码，并显示「谁产生这个码」。
# 完整回显写入同目录的 out_11_status_codes.txt；脚本与回显同名对应。
# 本机没有 bash，故用 PowerShell（本仓库 wsl 一集同此做法）。
$ErrorActionPreference = 'Stop'

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$server = Join-Path $here '11_status_codes_server.js'
$outFile = Join-Path $here 'out_11_status_codes.txt'
$lines = New-Object System.Collections.Generic.List[string]

function Say([string]$text = '') {
  $lines.Add($text)
  Write-Output $text
}

function Case([string]$title, [string]$command, [string[]]$argv) {
  Say ''
  Say ('== ' + $title)
  Say ('$ ' + $command)
  $output = & $argv[0] $argv[1..($argv.Length - 1)] 2>&1
  foreach ($line in $output) { Say ([string]$line) }
}

Say '== 环境'
Say ('$ node -v')
Say (& node -v)
Say ('$ curl --version')
Say ((& curl --version)[0])
Say ('$ $PSVersionTable.PSVersion')
Say ($PSVersionTable.PSVersion.ToString())
Say ('$ [System.Environment]::OSVersion.VersionString')
Say ([System.Environment]::OSVersion.VersionString)
Say '本实验只监听 127.0.0.1 的临时端口；端口号由内核分配，每次运行都会变。'

$node = Start-Process -FilePath 'node' -ArgumentList $server -PassThru -RedirectStandardOutput (Join-Path $here '.server.out') -RedirectStandardError (Join-Path $here '.server.err')
try {
  $originPort = $null; $gatewayPort = $null
  for ($i = 0; $i -lt 100 -and ($null -eq $originPort -or $null -eq $gatewayPort); $i++) {
    Start-Sleep -Milliseconds 100
    if (Test-Path (Join-Path $here '.server.out')) {
      $text = Get-Content (Join-Path $here '.server.out') -Raw -ErrorAction SilentlyContinue
      if ($text -match 'ORIGIN 127\.0\.0\.1:(\d+)') { $originPort = $Matches[1] }
      if ($text -match 'GATEWAY 127\.0\.0\.1:(\d+)') { $gatewayPort = $Matches[1] }
    }
  }
  if ($null -eq $originPort -or $null -eq $gatewayPort) { throw '服务未能在本机启动' }

  $o = "http://127.0.0.1:$originPort"
  $g = "http://127.0.0.1:$gatewayPort"

  Case '200 成功：内容就在响应里' "curl -i $o/ok" @('curl','-sS','-i',"$o/ok")
  Case '201 成功：新建了资源，Location 指向它' "curl -i -X POST $o/created" @('curl','-sS','-i','-X','POST',"$o/created")
  Case '204 成功：动作生效，但没有内容要回' "curl -i $o/nocontent" @('curl','-sS','-i',"$o/nocontent")
  Case '301 重定向：这个地址永久换了地方' "curl -i $o/moved" @('curl','-sS','-i',"$o/moved")
  Case '302 重定向：这次临时换地方' "curl -i $o/found" @('curl','-sS','-i',"$o/found")
  Case '304 重定向：内容没变，缓存里的副本仍然有效' "curl -i -H 'If-None-Match: `"demo-v1`"' $o/ok" @('curl','-sS','-i','-H','If-None-Match: "demo-v1"',"$o/ok")
  Case '400 客户端错误：请求本身不合法' "curl -i $o/bad" @('curl','-sS','-i',"$o/bad")
  Case '401 客户端错误：缺少凭据，服务器给出挑战' "curl -i $o/private" @('curl','-sS','-i',"$o/private")
  Case '403 客户端错误：认得出你，但不给你看' "curl -i $o/forbidden" @('curl','-sS','-i',"$o/forbidden")
  Case '401 与 403 的分界：同一个资源，凭据不对是 401，凭据有效但权限不够是 403' "curl -i -H 'Authorization: Bearer good-token' $o/private" @('curl','-sS','-i','-H','Authorization: Bearer good-token',"$o/private")
  Case '401 与 403 的分界：凭据有效、权限也够，这次是 200' "curl -i -H 'Authorization: Bearer good-token' -H 'X-Demo-Role: admin' $o/private" @('curl','-sS','-i','-H','Authorization: Bearer good-token','-H','X-Demo-Role: admin',"$o/private")
  Case '404 客户端错误：源站没有这个资源' "curl -i $o/missing" @('curl','-sS','-i',"$o/missing")
  Case '405 客户端错误：方法不支持，Allow 列出支持的方法' "curl -i -X POST $o/post-only" @('curl','-sS','-i','-X','POST',"$o/post-only")
  Case '429 客户端错误：请求太多，告诉你等多久' "curl -i $o/limited" @('curl','-sS','-i',"$o/limited")
  Case '500 服务器错误：服务器自己出了问题' "curl -i $o/boom" @('curl','-sS','-i',"$o/boom")
  Case '503 服务器错误：临时不可用，Retry-After 给出恢复时间' "curl -i $o/maintenance" @('curl','-sS','-i',"$o/maintenance")
  Case '未登记的码：服务器回了 471，首位数字仍是 4，按同类 x00 看待就是当成 400' "curl -i $o/unassigned" @('curl','-sS','-i',"$o/unassigned")
  Case '502 服务器错误（网关产生）：网关连不上上游' "curl -i $g/dead" @('curl','-sS','-i',"$g/dead")
  Case '504 服务器错误（网关产生）：网关等上游等太久' "curl -i $g/slow" @('curl','-sS','-i',"$g/slow")
  Case '同一个 404，经过网关时仍然是源站产生的那个码' "curl -i $g/missing" @('curl','-sS','-i',"$g/missing")
  Case '1xx 中间响应：Expect: 100-continue 之后还有一个最终响应' "curl -i -X POST -H 'Expect: 100-continue' -d 'x=1' $o/created" @('curl','-sS','-i','-X','POST','-H','Expect: 100-continue','-d','x=1',"$o/created")
}
finally {
  if ($node -and -not $node.HasExited) { $node.Kill() }
  Remove-Item (Join-Path $here '.server.out') -ErrorAction SilentlyContinue
  Remove-Item (Join-Path $here '.server.err') -ErrorAction SilentlyContinue
}

$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($outFile, ($lines -join [Environment]::NewLine) + [Environment]::NewLine, $utf8)
Write-Output ''
Write-Output ('已写入 ' + (Split-Path -Leaf $outFile))
