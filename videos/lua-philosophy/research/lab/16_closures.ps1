# 实验：闭包与 upvalue——函数和表一样是一等值，能被存进表、被返回、被共享。
# 观察点：每次循环各自持有一份局部变量；外层变量被多个闭包共享；
#         upvalue 是外部局部变量本身，不是拷贝。
# 在 Windows 11 + PowerShell 7 上执行，解释器为预装的 Lua 5.5.0。
# 回显存为 out_16_closures.txt。
$ErrorActionPreference = 'Continue'
$LAB = 'C:\ftlab'
$LUA = 'C:\SoftWare\lua\lua-5.5.0_Win64_bin\lua55.exe'
New-Item -ItemType Directory -Force -Path $LAB | Out-Null

$code = @'
-- 1) 循环里每次迭代各有一份 y，x 被所有闭包共享
local a = {}
local x = 20
for i = 1, 3 do
  local y = 0
  a[i] = function() y = y + 1; return x + y end
end
print("第 1 个闭包连续调用：" .. a[1]() .. " " .. a[1]() .. " " .. a[1]())
print("第 2 个闭包首次调用：" .. a[2]())
print("  两者共享 x，但各有一份 y")
print("")

-- 2) upvalue 是外部局部变量本身
local counter = 0
local function bump() counter = counter + 1 return counter end
print("bump() = " .. bump() .. "  " .. bump() .. "  " .. bump())
print("闭包外的 counter = " .. counter)
print("")

-- 3) 两个闭包共享同一个 upvalue
local shared = 0
local function inc() shared = shared + 1 end
local function get() return shared end
inc(); inc()
print("inc 两次后 get() = " .. get())
print("")

-- 4) upvalue 可以用 debug 库查看
local secret = 42
local function peek() return secret end
print("peek() = " .. peek())
print("debug.getupvalue(peek, 1) = " .. tostring(select(2, debug.getupvalue(peek, 1))))
print("")

-- 5) 函数是一等值：放进表、当参数传、当返回值
local ops = {
  add = function(a, b) return a + b end,
  sub = function(a, b) return a - b end,
}
print("ops.add(3, 4) = " .. ops.add(3, 4) .. "  ops.sub(3, 4) = " .. ops.sub(3, 4))
print("表里存函数后可以用冒号写法 self 传参：")
local obj = {n = 5}
function obj:double() return self.n * 2 end
print("  obj:double() = " .. obj:double())
print("  obj.double(obj) = " .. obj.double(obj))
print("")

-- 6) 高阶函数：把函数当参数
local function apply(f, v) return f(v) end
print("apply(math.floor, 3.7) = " .. apply(math.floor, 3.7))
print("")

-- 7) 递归也是普通函数调用
local function fact(n) if n <= 1 then return 1 end return n * fact(n - 1) end
print("fact(6) = " .. fact(6))
'@
$f = Join-Path $LAB 'closures.lua'
Set-Content -Path $f -Value $code -Encoding utf8NoBOM

"取证时刻（UTC+8）：" + (Get-Date).ToString('yyyy-MM-ddTHH:mm:sszzz')
"PS> & lua55.exe closures.lua"
$out = (& $LUA $f 2>&1 | Out-String).TrimEnd()
if ($out) { $out }
"[exit=$LASTEXITCODE]"
