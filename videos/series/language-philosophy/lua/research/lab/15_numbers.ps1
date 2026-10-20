# 实验：Lua 5.3 起的整数子类型，以及 5.3 / 5.4 / 5.5 之间的除法与算术差异。
# 同一段 Lua 代码在三个解释器上各跑一遍，逐行对照输出。
# 观察点：整数与浮点是同一类型 number 的两个子类型；/ 永远得到浮点，// 是向下取整除法；
#         整数溢出按补码回绕；整数除以零是错误，浮点除以零得到 inf / nan；
#         5.3 的 // 结果是整数，5.4 起的 // 结果一律是浮点。
# 在 Windows 11 + PowerShell 7 上执行。回显存为 out_15_numbers.txt。
$ErrorActionPreference = 'Continue'
$LAB = 'C:\ftlab'
$LUA55 = 'C:\SoftWare\lua\lua-5.5.0_Win64_bin\lua55.exe'
New-Item -ItemType Directory -Force -Path $LAB | Out-Null

$code = @'
local function show(label, f)
  local ok, v = pcall(f)
  if ok then
    print(string.format("%-28s %-14s %s", label, tostring(v), type(v)))
  else
    print(string.format("%-28s %s", label, "错误: " .. tostring(v)))
  end
end

print("== 整数与浮点是 number 的两个子类型 ==")
show("math.type(1)", function() return math.type(1) end)
show("math.type(1.0)", function() return math.type(1.0) end)
show("1 == 1.0", function() return 1 == 1.0 end)
show("math.type(1 + 1)", function() return math.type(1 + 1) end)
show("math.type(1 + 1.0)", function() return math.type(1 + 1.0) end)
print("")

print("== 除法 ==")
show("7 / 2", function() return 7 / 2 end)
show("7 // 2", function() return 7 // 2 end)
show("7.0 // 2", function() return 7.0 // 2 end)
show("-7 // 2", function() return -7 // 2 end)
show("7 % 2", function() return 7 % 2 end)
show("7.5 % 2", function() return 7.5 % 2 end)
print("")

print("== 整数转换与范围 ==")
show("math.tointeger(3.0)", function() return math.tointeger(3.0) end)
show("math.tointeger(3.5)", function() return math.tointeger(3.5) end)
show("math.maxinteger", function() return math.maxinteger end)
show("math.mininteger", function() return math.mininteger end)
show("math.maxinteger + 1", function() return math.maxinteger + 1 end)
show("math.mininteger - 1", function() return math.mininteger - 1 end)
print("")

print("== 除以零 ==")
show("1 / 0", function() return 1 / 0 end)
show("0 / 0", function() return 0 / 0 end)
show("1 // 0", function() return 1 // 0 end)
show("1 % 0", function() return 1 % 0 end)
print("")

print("== 位运算要求整数表示 ==")
show("3 & 1", function() return 3 & 1 end)
show("3.0 & 1", function() return 3.0 & 1 end)
show("3 << 2", function() return 3 << 2 end)
print("")

print("== 字符串不自动转成数字 ==")
show('"10" + 1', function() return "10" + 1 end)
show('tonumber("10") + 1', function() return tonumber("10") + 1 end)
show('"10" == 10', function() return "10" == 10 end)
show('"3.0" + 0', function() return "3.0" + 0 end)
print("")

print("== 数字格式化的差别 ==")
show("tostring(1.0)", function() return tostring(1.0) end)
show("tostring(1e15)", function() return tostring(1e15) end)
show("string.format('%.14g', 1/3)", function() return string.format("%.14g", 1/3) end)
'@
$f = Join-Path $LAB 'numbers.lua'
Set-Content -Path $f -Value $code -Encoding utf8NoBOM

"取证时刻（UTC+8）：" + (Get-Date).ToString('yyyy-MM-ddTHH:mm:sszzz')

$interpreters = @(
  @{ label = '5.5.0（预装）'; exe = $LUA55 },
  @{ label = '5.4.9（官方源码构建）'; exe = (Join-Path $LAB 'lua-5.4.9\src\lua.exe') },
  @{ label = '5.3.6（官方源码构建）'; exe = (Join-Path $LAB 'lua-5.3.6\src\lua.exe') }
)

foreach ($iv in $interpreters) {
  "## Lua $($iv.label)"
  if (-not (Test-Path $iv.exe)) { "解释器不存在：$($iv.exe)；先运行 11_build_older.ps1"; ""; continue }
  "PS> & lua.exe numbers.lua"
  $out = (& $iv.exe $f 2>&1 | Out-String).TrimEnd()
  if ($out) { $out }
  "[exit=$LASTEXITCODE]"
  ""
}
