-- Mechanism probes; deterministic observable assertions, no timing claims.
print("numbers", math.type(1), math.type(1.0), 5 // 2, 5 & 3)
local bytes = "a\0b"
assert(#bytes == 3)
print("bytes", #bytes, string.byte(bytes, 2))
local t = {[1.0] = "same", [1000000] = "sparse", name = "hash"}
assert(t[1] == t[1.0])
local alias = t
alias.name = "shared"
print("table", t[1], t[1000000], t.name)

local function pair()
  local x = 0
  return function() x = x + 1; return x end, function() return x end
end
local inc, get = pair()
assert(debug.upvalueid(inc, 1) == debug.upvalueid(get, 1))
print("upvalue", inc(), get(), inc(), get())

local misses, writes = 0, 0
local proxy = setmetatable({present = 1}, {
  __index = function(_, k) misses = misses + 1; return "missing:" .. k end,
  __newindex = function(self, k, v) writes = writes + 1; rawset(self, k, v) end,
})
assert(proxy.present == 1 and proxy.absent == "missing:absent")
assert(rawget(proxy, "absent") == nil)
proxy.present = 2
proxy.new = 3
rawset(proxy, "raw", 4)
print("metamethod", misses, writes, proxy.present, proxy.new, proxy.raw)

local marker = {}
local ok, err = pcall(function() error(marker) end)
assert(not ok and err == marker)
print("error-object", ok, err == marker)

local co = coroutine.create(function()
  local ok2, v = pcall(function() return coroutine.yield("inside-pcall") end)
  return ok2, v
end)
local a, b = coroutine.resume(co)
assert(a and b == "inside-pcall")
local c, d, e = coroutine.resume(co, "resumed")
assert(c and d and e == "resumed")
print("yieldable-pcall", a, b, c, d, e)

local closed = {}
local mt = {__close = function(self, reason)
  closed[#closed + 1] = self.tag .. ":" .. tostring(reason)
end}
do local resource <close> = setmetatable({tag = "normal"}, mt) end
local ok3 = pcall(function()
  local resource <close> = setmetatable({tag = "error"}, mt)
  error("sentinel", 0)
end)
assert(not ok3 and closed[1] == "normal:nil" and closed[2] == "error:sentinel")
print("close", closed[1], closed[2])

for _, mode in ipairs({"incremental", "generational"}) do
  collectgarbage(mode)
  local weak = setmetatable({}, {__mode = "v"})
  do local cycle = {}; cycle.self = cycle; weak[1] = cycle end
  collectgarbage("collect")
  assert(weak[1] == nil)
  local eph = setmetatable({}, {__mode = "k"})
  do local key = {}; eph[key] = {back = key} end
  collectgarbage("collect")
  assert(next(eph) == nil)
  print("gc", mode, "cycle-collected", "ephemeron-cleared")
end
local function tail(n, acc)
  if n == 0 then return acc end
  return tail(n - 1, acc + 1)
end
assert(tail(100000, 0) == 100000)
print("tailcall", 100000)
