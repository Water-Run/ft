# 实验：字符串是 intern 的——内容相同的短字符串在内部是同一个对象。
# 观察点：等值与恒等对短字符串同时成立；表按键查找按内容进行；
#         同样数量的表项，内容相同的短字符串几乎不额外占内存，
#         内容不同的字符串则每个都要一份，这正是 intern 的直接后果；
#         5.5 源码里短字符串（长度 <= 40 字节）走 internshrstr，长字符串不 intern。
# 在 Windows 11 + PowerShell 7 上执行，解释器为预装的 Lua 5.5.0。
# 回显存为 out_17_strings.txt。
$ErrorActionPreference = 'Continue'
$LAB = 'C:\ftlab'
$LUA = 'C:\SoftWare\lua\lua-5.5.0_Win64_bin\lua55.exe'
New-Item -ItemType Directory -Force -Path $LAB | Out-Null

$code = @'
-- 1) 内容相同的短字符串：等值与恒等同时成立
local a = "hello"
local b = "hel" .. "lo"
print("a == b            : " .. tostring(a == b))
print("rawequal(a, b)    : " .. tostring(rawequal(a, b)))
print("a == \"hello\"       : " .. tostring(a == "hello"))
print("")

-- 2) 表按键查找按内容进行（intern 的直接后果）
local t = {}
t["k"] = "v"
print('t["k"]            : ' .. tostring(t["k"]))
print('t[("k")]          : ' .. tostring(t[("k")]))
print('t["k" .. ""]      : ' .. tostring(t["k" .. ""]))
print("")

-- 3) 内存：同样大小的表，字符串内容相同还是不同
local N = 100000
local function measure(fill)
  local t = {}
  for i = 1, N do t[i] = fill(i) end
  collectgarbage("collect")
  return collectgarbage("count"), t
end
local m0 = collectgarbage("count")
local _, base = measure(function() return nil end)
collectgarbage("collect")
local m1 = collectgarbage("count")
local _, same = measure(function() return "key" end)
collectgarbage("collect")
local m2 = collectgarbage("count")
local _, diff = measure(function(i) return "key" .. i end)
collectgarbage("collect")
local m3 = collectgarbage("count")
local _, long = measure(function(i) return "key" .. i .. string.rep("x", 80) end)
collectgarbage("collect")
local m4 = collectgarbage("count")
print(string.format("N = %d，collectgarbage(\"count\") 单位 KB", N))
print(string.format("  只有 nil 的表            : %8.1f KB", m1 - m0))
print(string.format("  全部是同一串 \"key\"       : %8.1f KB", m2 - m1))
print(string.format("  全部是互不相同的短字符串 : %8.1f KB", m3 - m2))
print(string.format("  互不相同的长字符串(约90B): %8.1f KB", m4 - m3))
print("  同样的表项数，内容相同的字符串几乎不额外占内存：")
print(string.format("  互不相同的短字符串比同一串多占 %.1f KB", (m3 - m2) - (m2 - m1)))
print("")

-- 4) 短字符串与长字符串的差别（5.5 源码里 40 字节以内走 intern）
local short1, short2 = "abc", "abc"
local long1 = string.rep("x", 100)
local long2 = string.rep("x", 100)
print("短字符串长度 " .. #short1 .. "：rawequal = " .. tostring(rawequal(short1, short2)))
print("长字符串长度 " .. #long1 .. "：rawequal = " .. tostring(rawequal(long1, long2)))
print("长字符串内容相等：== = " .. tostring(long1 == long2))
print("")

-- 5) 字符串类型共享一个元表，方法就是挂在元表上的函数
print('("abc"):upper()   : ' .. ("abc"):upper())
print('string.upper("abc"): ' .. string.upper("abc"))
print('("abc") == "abc"  : ' .. tostring(("abc") == "abc"))
'@
$f = Join-Path $LAB 'strings.lua'
Set-Content -Path $f -Value $code -Encoding utf8NoBOM

"取证时刻（UTC+8）：" + (Get-Date).ToString('yyyy-MM-ddTHH:mm:sszzz')
"PS> & lua55.exe strings.lua"
$out = (& $LUA $f 2>&1 | Out-String).TrimEnd()
if ($out) { $out }
"[exit=$LASTEXITCODE]"
