-- 09 闭包：函数是值；for 循环每一轮都有新的 i；while 循环共用同一个 j
local function twice(f, x) return f(f(x)) end
local add3 = function(n) return n + 3 end
print(twice(add3, 1))

local fs = {}
for i = 1, 3 do
  fs[i] = function() return i end
end
print(fs[1](), fs[2](), fs[3]())

local gs = {}
local j = 0
while j < 3 do
  j = j + 1
  gs[j] = function() return j end
end
print(gs[1](), gs[2](), gs[3]())
