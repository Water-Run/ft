-- 14 回收：互相引用的两张表，离开以后照样被回收
local function kb() return math.floor(collectgarbage("count")) end
local watch = setmetatable({}, {__mode = "v"})

local function make_cycle()
  local a, b = {}, {}
  a.other, b.other = b, a
  for i = 1, 100000 do a[i] = i end
  watch.cycle = a
end

collectgarbage("collect")
local base = kb()
make_cycle()
print("cycle made", kb() - base, watch.cycle ~= nil)
collectgarbage("collect")
print("after collect", kb() - base, watch.cycle == nil)
