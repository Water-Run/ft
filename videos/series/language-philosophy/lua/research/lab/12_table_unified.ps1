# 实验：Lua 的表把「数组」和「字典」合为一个数据结构。
# 观察点：同一个表既能按整数下标顺序存放序列，也能按任意非 nil 值作键；
#         下标从 1 开始是约定而不是限制；pairs 与 ipairs 看到的范围不同。
# 在 Windows 11 + PowerShell 7 上执行，解释器为预装的 Lua 5.5.0。
# 回显存为 out_12_table_unified.txt。
$ErrorActionPreference = 'Continue'
$LAB = 'C:\ftlab'
$LUA = 'C:\SoftWare\lua\lua-5.5.0_Win64_bin\lua55.exe'
New-Item -ItemType Directory -Force -Path $LAB | Out-Null

$code = @'
-- 一张表同时当数组和字典用
local t = { "Mon", "Tue", "Wed" }        -- 构造器里的位置项按下标 1,2,3 存放
t.name = "week"                          -- 字段名写法等价于 t["name"]
t[10] = "远端"                            -- 下标可以跳跃，也可以是任意值
t[true] = "布尔键"

print("t[1]      =", t[1])
print("t[3]      =", t[3])
print("t.name    =", t.name)
print("t[10]     =", t[10])
print("t[true]   =", t[true])
print("t[4]      =", t[4])                 -- 没写过的键读出 nil
print("")

print("遍历这张表（pairs，键的顺序不保证）：")
local keys = {}
for k, v in pairs(t) do keys[#keys + 1] = tostring(k) end
table.sort(keys, function(a, b) return tostring(a) < tostring(b) end)
print("  键共 " .. #keys .. " 个：" .. table.concat(keys, "  "))
print("")

print("ipairs 只看 1..n 的连续整数下标：")
for i, v in ipairs(t) do print("  i=" .. i .. "  v=" .. tostring(v)) end
print("")

print("表的键类型互不相同，键可以是任意值：")
for _, k in ipairs({1, 1.5, "s", true, {}, print}) do
  print("  type = " .. type(k))
end
print("")

print("把表当数组用（table.insert / table.concat / table.remove）：")
local a = {}
for i = 1, 5 do table.insert(a, i * 10) end
print("  a = " .. table.concat(a, ","))
print("  #a = " .. #a)
table.remove(a, 1)
print("  删掉首元素后 a = " .. table.concat(a, ",") .. "  #a = " .. #a)
print("")

print("表既是对象也是值：")
local u = {}
local v = u
v.x = 1
print("  u.x = " .. u.x .. "（赋值传的是引用）")
local w = {x = 1}
print("  w.x = " .. w.x .. "（构造器是独立的一份）")
print("  rawequal(u, v) = " .. tostring(rawequal(u, v)) .. "  rawequal(u, w) = " .. tostring(rawequal(u, w)))
print("")

print("浮点整数值的下标会被转成整数：")
local k = {}
k[2.0] = "二"
print("  k[2] = " .. k[2] .. "  k[2.0] = " .. k[2.0])
'@
$f = Join-Path $LAB 'table_unified.lua'
Set-Content -Path $f -Value $code -Encoding utf8NoBOM

"取证时刻（UTC+8）：" + (Get-Date).ToString('yyyy-MM-ddTHH:mm:sszzz')
"PS> & lua55.exe table_unified.lua"
$out = (& $LUA $f 2>&1 | Out-String).TrimEnd()
if ($out) { $out }
"[exit=$LASTEXITCODE]"
