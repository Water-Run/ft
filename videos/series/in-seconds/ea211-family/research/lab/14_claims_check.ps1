# 14_claims_check.ps1 —— 核对 research/FACTS.md 里每条陈述的引文确实存在于抓取回显中。
# 做法：读 out_12_sources.txt，按「FACTS 条目号 → 一组（出处标签, 必须出现的原文片段）」逐条断言。
# 一个 FACTS 条目可以有多组断言，全部命中才算通过。输出 PASS/FAIL 表，任一条 FAIL 即退出码 1。
# 用法：pwsh -File 14_claims_check.ps1
# 回显：与脚本同名的 out_14_claims_check.txt。
param(
  [string]$Echo = (Join-Path $PSScriptRoot 'out_12_sources.txt'),
  [string]$Out = (Join-Path $PSScriptRoot 'out_14_claims_check.txt')
)

$ErrorActionPreference = 'Stop'
$raw = Get-Content $Echo -Raw -Encoding utf8

# 条目号 -> 断言组；每组是 @('出处标签', '必须出现的原文片段（正则）')
$claims = [ordered]@{
  '01-1 EA211 是汽油家族，含三缸与四缸' = @(, @('S1-vw-golf7-2012-powertrain', 'EA211 is a new family of petrol engines\. It is made up of both three-cylinder and four-cylinder engines'))
  '01-2 家族随第七代高尔夫投产'          = @(, @('S3-vw-tsi-evo-2020-pr', 'which launched in the Golf 7 in 2012'))
  '01-3 最早在 up! 以三缸 MPI 投产'      = @(, @('S1-vw-golf7-2012-powertrain', 'production launch of the up! as a three-cylinder MPI'))
  '01-4 与横置平台 MQB 同期登场'          = @(, @('S4-vw-mqb-10years', 'EA 211 series . which debuted alongside the MQB'))
  '01-5 沿用 82 mm 缸心距、铝机体与重量'  = @(, @('S1-vw-golf7-2012-powertrain', 'cylinder spacing of 82 mm was adopted from')) + @(, @('S1-vw-golf7-2012-powertrain', '97 kg \(1\.2 TSI\) and 104 kg \(1\.4 TSI\)'))
  '02-1 1.2/1.4 TSI 属 EA211'            = @(, @('S1-vw-golf7-2012-powertrain', 'as well as 90 kW / 122 PS and 103 kW / 140 PS \(each 1\.4 litre\)'))
  '02-2 1.0 三缸属 EA211'                 = @(, @('S6-vw-tcross-2018-engines', 'two petrol engines with 1\.0 litre capacity belong to the established EA211'))
  '02-3 官方命名 EA 211 TSI evo / evo2'   = @(, @('S3-vw-tsi-evo-2020-pr', 'designation EA 211 TSI evo')) + @(, @('S8-vw-image-evo2-2022', '1\.5 TSI evo2 . basic engine for many Volkswagen models')) + @(, @('S7-vw-troc-2025-drives', '1\.5 TSI evo2 from the Volkswagen EA211 engine family'))
  '02-4 巴西产四款 EA211'                 = @(, @('S10-vw-brazil-plant', 'EA211: 1\.0L MPI, 1\.6L MSI, 1\.0L TSI, 1\.4L TSI')) + @(, @('S10-vw-brazil-plant', '626,871 engines \(2025\)'))
  '02-5 墨西哥西拉奥厂供北美'             = @(, @('S9-vw-mexico-plant', 'third generation of EA888 engines family and the EA211 engine')) + @(, @('S9-vw-mexico-plant', '452,042 engines \(Silao plant, 2025\)'))
  '02-6 集团首个 MQB 车型是奥迪 A3'       = @(, @('S4-vw-mqb-10years', 'first-ever MQB model in the Volkswagen Group was the third-generation Audi A3'))
  '03-1 排气歧管集成进缸盖'               = @(, @('S1-vw-golf7-2012-powertrain', 'integrating the exhaust manifold in the cylinder head'))
  '03-2 进气凸轮轴 50 度曲轴角'           = @(, @('S1-vw-golf7-2012-powertrain', 'intake camshaft on all EA211 engines can be varied over a range of 50 degrees crankshaft angle'))
  '03-3 ACT 关闭 2、3 缸'                 = @(, @('S1-vw-golf7-2012-powertrain', 'Temporarily deactivating the second and third cylinders'))
  '03-4 ACTplus 与 VTG、米勒循环并用'     = @(, @('S7-vw-troc-2025-drives', 'ACTplus Active Cylinder Management'))
  '03-5 米勒循环与 λ=1'                   = @(, @('S7-vw-troc-2025-drives', 'Miller cycle \(early closing of the intake valves with high compression\)'))
  '03-6 喷射压力 200 bar 到 350 bar'       = @(, @('S1-vw-golf7-2012-powertrain', 'increased to 200 bar')) + @(, @('S3-vw-tsi-evo-2020-pr', 'maximum pressure of 350 bar')) + @(, @('S7-vw-troc-2025-drives', 'up to 350 bar pressure'))
  '03-7 压缩比 10.5:1'                    = @(, @('S5-vw-polo6-2017-engines', 'compression ratio of 10\.5:1 like all EA211 engines'))
  '03-8 铝机体、等离子喷涂层与 88 kg'      = @(, @('S3-vw-tsi-evo-2020-pr', 'three-cylinder variant weighs just 88 kilograms')) + @(, @('S7-vw-troc-2025-drives', 'plasma-coated cylinder liners'))
  '03-9 后倾 12 度统一安装点'             = @(, @('S1-vw-golf7-2012-powertrain', 'identical inclination angle of 12 degrees'))
  '04-1 48V 轻混成为标配'                 = @(, @('S7-vw-troc-2025-drives', '48V mild hybrid as standard'))
  '04-2 48V 皮带式启动发电机'             = @(, @('S7-vw-troc-2025-drives', '48V belt-driven starter alternator'))
  '04-3 额外 14 kW / 56 Nm、省约半升'     = @(, @('S7-vw-troc-2025-drives', 'additional 14 kW of power and 56 Nm of torque on a temporary basis')) + @(, @('S7-vw-troc-2025-drives', 'savings of around half a litre per 100 km'))
  '04-4 1.5 TSI evo2 可完全关闭滑行'       = @(, @('S7-vw-troc-2025-drives', 'switched off completely'))
  '04-5 插混用 1.5 TSI evo2'              = @(, @('S14-vw-golf-ehybrid-2024', '1\.5 TSI evo2'))
  '04-6 天然气 TGI 也是家族成员'          = @(, @('S3-vw-tsi-evo-2020-pr', 'designed for operation with natural gas as TGI engines'))
  '05-1 柴油属 EA288'                     = @(, @('S1-vw-golf7-2012-powertrain', 'TDIs of the EA288 engine series')) + @(, @('S5-vw-polo6-2017-engines', 'Both four-cylinder engines belong to the EA288 engine family'))
  '05-2 2.0 属 EA888'                     = @(, @('S11-vw-arteon-engine-2021', 'most powerful model in the EA888 engine family'))
  '05-3 EA888 也有横置版本'               = @(, @('S12-vw-golf6-gti-archive', 'optimised for transverse installation'))
  '05-4 MQB 横置、MLB 纵置'               = @(, @('S4-vw-mqb-10years', 'modular transverse matrix')) + @(, @('S13-vw-phaeton-mlb', 'modular longitudinal matrix \(MLB\)'))
  '05-5 平台统一安装位置与接口'           = @(, @('S4-vw-mqb-10years', 'installation position of the engines is also standardised in the modular transverse matrix'))
  '05-6 不同品牌同线生产'                 = @(, @('S4-vw-mqb-10years', 'models of different brands, on the same production line'))
  '05-7 MQB 累计 3200 万辆'               = @(, @('S4-vw-mqb-10years', 'more than 32 million vehicles'))
  '05-8 墨西哥与巴西两厂 2025 年产量'     = @(, @('S9-vw-mexico-plant', '452,042 engines')) + @(, @('S10-vw-brazil-plant', '626,871 engines'))
  '05-9 开姆尼茨是 EA211 的车型负责人'     = @(, @('S16-vw-chemnitz-type-leader', 'Chemnitz is the type leader for EA 211 engines \(1\.0 liter and 1\.5 liter capacity\)')) + @(, @('S16-vw-chemnitz-type-leader', 'In 2025, around 681,000 engines were delivered'))
}

# 按标签切出各来源的正文
$tags = [regex]::Matches($raw, '(?m)^########## (.+)$') | ForEach-Object {
  $v = $_.Groups[1].Value.Trim()
  if ($v -match '^(URL:|CHARS:|TRUNCATED|FETCH FAILED)') { return }
  [pscustomobject]@{ Tag = $v; Index = $_.Index }
}
$sections = @{}
for ($i = 0; $i -lt $tags.Count; $i++) {
  $to = if ($i -lt $tags.Count - 1) { $tags[$i + 1].Index } else { $raw.Length }
  $sections[$tags[$i].Tag] = ($raw.Substring($tags[$i].Index, $to - $tags[$i].Index) -replace '\s+', ' ')
}

$rows = New-Object System.Collections.Generic.List[string]
$rows.Add("=== 声明核对：$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===")
$rows.Add("=== 读入回显：$Echo（$((Get-Item $Echo).Length) 字节） ===")
$rows.Add("=== 条目数：$($claims.Count)（与 research/FACTS.md 的逐章条目号一一对应） ===")
$fail = 0
foreach ($name in $claims.Keys) {
  $ok = $true; $detail = @()
  foreach ($assertion in $claims[$name]) {
    $label = $assertion[0]; $pattern = $assertion[1]
    $body = $sections[$label]
    if (-not $body) { $ok = $false; $detail += "来源标签未找到：$label"; continue }
    if ($body -match $pattern) { $detail += "OK $label" }
    else { $ok = $false; $detail += "未匹配 $label：$pattern" }
  }
  if ($ok) { $rows.Add("PASS | $name") } else { $rows.Add("FAIL | $name | " + ($detail -join ' / ')); $fail++ }
}
$rows.Add("=== 合计：$($claims.Count) 条，通过 $($claims.Count - $fail) 条，失败 $fail 条 ===")

Set-Content -Path $Out -Value ($rows -join "`n") -Encoding utf8
$rows | ForEach-Object { $_ }
if ($fail -gt 0) { exit 1 }
