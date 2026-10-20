# 实验：# 运算符给出的长度是一个「边界」，遇到空洞时结果不唯一。
# 观察点：连续的 1..n 序列，# 是确定的；一旦中间有 nil，# 返回哪个边界由实现决定，
#         Lua 只保证「返回一个边界」，不保证是最大的那个。
# 在 Windows 11 + PowerShell 7 上执行，解释器为预装的 Lua 5.5.0。
# 回显存为 out_13_length_border.txt。
$ErrorActionPreference = 'Continue'
$LAB = 'C:\ftlab'
$LUA = 'C:\SoftWare\lua\lua-5.5.0_Win64_bin\lua55.exe'
New-Item -ItemType Directory -Force -Path $LAB | Out-Null

$code = @'
local function count_ipairs(t)
  local n = 0
  for _ in ipairs(t) do n = n + 1 end
  return n
end

-- 1) 连续的 1..n：长度确定
local a = {10, 20, 30, 40, 50}
print("连续表 #a = " .. #a)
print("")

-- 2) 末尾有洞：边界落在洞之前
local b = {10, 20, 30}
b[5] = 50
print("b = {10,20,30,[5]=50}")
print("  #b = " .. #b .. "   边界在 3 与 5 之间")
print("  ipairs 读到 " .. count_ipairs(b) .. " 个")
print("")

-- 3) 中间有洞：两个边界都合法，实现可以给其中任意一个
local c = {1, 2, 3, 4, 5}
c[2] = nil
print("c = {1,nil,3,4,5}")
print("  #c = " .. #c .. "   1 或 4 都是合法边界")
print("  c[2] = " .. tostring(c[2]) .. "  c[3] = " .. tostring(c[3]))
print("  ipairs 读到 " .. count_ipairs(c) .. " 个")
print("")

-- 4) 空表与只有非整数键的表
local d = {}
print("空表 #d = " .. #d)
local e = {x = 1, y = 2}
print("只有字符串键的表 #e = " .. #e)
print("")

-- 5) 字符串的长度是确定的，与表不同
print("字符串 \"abc\" 的 # = " .. #"abc")
print("")

-- 6) 用元方法 __len 可以自己定义长度
local f = setmetatable({}, {__len = function() return 42 end})
print("带 __len 的表 #f = " .. #f)
local n = 0
for _ in pairs(f) do n = n + 1 end
print("  直接数键仍是 " .. n .. " 个键")
'@
$f = Join-Path $LAB 'length_border.lua'
Set-Content -Path $f -Value $code -Encoding utf8NoBOM

"取证时刻（UTC+8）：" + (Get-Date).ToString('yyyy-MM-ddTHH:mm:sszzz')
"PS> & lua55.exe length_border.lua"
$out = (& $LUA $f 2>&1 | Out-String).TrimEnd()
if ($out) { $out }
"[exit=$LASTEXITCODE]"
