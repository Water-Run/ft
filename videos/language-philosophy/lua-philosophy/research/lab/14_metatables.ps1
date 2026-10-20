# 实验：元表把「行为」挂到值上；表本身没有类型，行为由元表里的元方法决定。
# 观察点：__index / __newindex / __call / __tostring / __eq / __lt / __add；
#         索引类元方法与算术类元方法走的是两条不同的路径；
#         元表本身也是普通表，可以再被元表化；字符串等共享类型的元表是每类型一个。
# 在 Windows 11 + PowerShell 7 上执行，解释器为预装的 Lua 5.5.0。
# 回显存为 out_14_metatables.txt。
$ErrorActionPreference = 'Continue'
$LAB = 'C:\ftlab'
$LUA = 'C:\SoftWare\lua\lua-5.5.0_Win64_bin\lua55.exe'
New-Item -ItemType Directory -Force -Path $LAB | Out-Null

$code = @'
-- 1) __index 既可以是表，也可以是函数
local base = {greet = function(self) return "hi" end}
local obj = setmetatable({}, {__index = base})
print("obj.greet() = " .. obj.greet())
print("obj.missing = " .. tostring(obj.missing))

local function fallback(t, k)
  return "由函数补出的 " .. tostring(k)
end
local obj2 = setmetatable({}, {__index = fallback})
print("obj2.anything = " .. obj2.anything)
print("")

-- 2) __index 链：找不到就继续向上找
local l3 = {deep = "found"}
local l2 = setmetatable({}, {__index = l3})
local l1 = setmetatable({}, {__index = l2})
print("三级 __index 链 l1.deep = " .. l1.deep)
print("")

-- 3) __newindex：写入被拦下，改走函数
local log = {}
local guarded = setmetatable({}, {__newindex = function(t, k, v) log[#log + 1] = k; rawset(t, k, v) end})
guarded.x = 1
print("guarded.x = " .. guarded.x .. "，被记录的新键：" .. table.concat(log, ","))
print("  __newindex 只在键原先不存在时触发；rawset 之后该键存在，再写就不触发")
guarded.x = 2
print("  再次写入后 guarded.x = " .. guarded.x .. "，记录条数 = " .. #log)
print("")

-- 4) __call：让非函数的值可以像函数一样调用
local callable = setmetatable({}, {__call = function(self, a, b) return a + b end})
print("callable(3, 4) = " .. callable(3, 4))
print("")

-- 5) __tostring / __eq / __lt / __add：算术与比较走元方法
local A = setmetatable({}, {__tostring = function() return "A!" end,
                           __eq = function() return true end,
                           __lt = function() return true end,
                           __add = function(x, y) return "A+B" end})
local B = setmetatable({}, {__tostring = function() return "B!" end,
                           __eq = function() return true end,
                           __lt = function() return false end,
                           __add = function(x, y) return "A+B" end})
print("tostring(A) = " .. tostring(A))
print("A == B = " .. tostring(A == B))
print("A < B  = " .. tostring(A < B))
print("A + B  = " .. tostring(A + B))
print("  没有 __add 的表相加会报错：")
local ok, err = pcall(function() return {} + {} end)
print("  " .. tostring(ok) .. "  " .. tostring(err))
print("")

-- 6) rawget / rawset / rawequal 绕过元方法
print("rawget(obj, 'missing') = " .. tostring(rawget(obj, "missing")))
print("obj.missing（走 __index）= " .. tostring(obj.missing))
print("rawequal(A, B) = " .. tostring(rawequal(A, B)) .. "，A == B = " .. tostring(A == B))
print("")

-- 7) 元表本身是普通表，可以再被元表化；元方法在元表里是 raw 查找，
--    所以「元表的元表」不会参与元方法的查找
local base = {greet = function(self) return "hi" end}
local meta = {__index = base}
local metaMeta = {__index = function(t, k) return "由 metaMeta 提供：" .. tostring(k) end}
setmetatable(meta, metaMeta)
local deep = setmetatable({}, meta)
print("rawget(meta, '__index') = " .. type(rawget(meta, "__index")) .. "（raw 读到的原值）")
print("meta.__index（普通访问）= " .. type(meta.__index) .. "（meta 里有 raw 键，普通访问直接命中）")
print("deep.greet = " .. tostring(deep.greet) .. "（Lua 取的是 raw 的 __index，命中 base）")
print("")

local bare = setmetatable({}, metaMeta)   -- 直接把 metaMeta 当元表
print("对照：把 metaMeta 直接当元表时 bare.anything = " .. tostring(bare.anything))
local naked = {}
setmetatable(naked, metaMeta)
print("  而 meta 自己若没有 raw 的 __index，它的 __index 元方法不会作用于 deep")
print("")

-- 8) 每种类型共享一个元表；字符串类型已有一个元表
print("getmetatable('') ~= nil : " .. tostring(getmetatable("") ~= nil))
print("字符串元表的 __index 指向 string 表：getmetatable('').__index == string -> " ..
      tostring(getmetatable("").__index == string))
print("getmetatable(1) = " .. tostring(getmetatable(1)))
print("")

-- 9) debug 库可以越过限制给别的类型装元表
debug.setmetatable(0, {__tostring = function() return "零!" end})
print("tostring(0)（装过元表后）= " .. tostring(0))
'@
$f = Join-Path $LAB 'metatables.lua'
Set-Content -Path $f -Value $code -Encoding utf8NoBOM

"取证时刻（UTC+8）：" + (Get-Date).ToString('yyyy-MM-ddTHH:mm:sszzz')
"PS> & lua55.exe metatables.lua"
$out = (& $LUA $f 2>&1 | Out-String).TrimEnd()
if ($out) { $out }
"[exit=$LASTEXITCODE]"
