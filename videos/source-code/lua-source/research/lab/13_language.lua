-- Language-level behaviour the film explains before each implementation chapter
-- (added by the production side, 2026-11-16). Deterministic assertions only.

-- 1. Functions are values: stored, passed, returned.
local function twice(f, x) return f(f(x)) end
local add3 = function(n) return n + 3 end
assert(twice(add3, 1) == 7)
print("function-as-value", twice(add3, 1))

-- 2. A coroutine as a generator: each resume continues after the last yield.
local gen = coroutine.wrap(function()
  for i = 1, 3 do coroutine.yield(i) end
end)
local a, b, c = gen(), gen(), gen()
assert(a == 1 and b == 2 and c == 3)
print("generator", a, b, c)

-- 3. Coroutine states, as seen from outside and from inside.
local inside
local co = coroutine.create(function(x)
  inside = coroutine.status(coroutine.running())
  local y = coroutine.yield(x + 1)
  return y * 2
end)
local s0 = coroutine.status(co)
local ok1, v1 = coroutine.resume(co, 10)
local s1 = coroutine.status(co)
local ok2, v2 = coroutine.resume(co, 21)
local s2 = coroutine.status(co)
assert(s0 == "suspended" and inside == "running" and s1 == "suspended" and s2 == "dead")
assert(ok1 and v1 == 11 and ok2 and v2 == 42)
print("coroutine-states", s0, inside, s1, s2)
print("values-exchanged", v1, v2)

-- 4. A metatable with __add: two tables can be added.
local calls = 0
local V = {}
V.__add = function(p, q)
  calls = calls + 1
  return setmetatable({x = p.x + q.x, y = p.y + q.y}, V)
end
local p = setmetatable({x = 1, y = 2}, V)
local q = setmetatable({x = 10, y = 20}, V)
local r = p + q
assert(r.x == 11 and r.y == 22 and calls == 1)
print("metamethod-add", r.x, r.y, "calls", calls)
local okplain = pcall(function() return {} + {} end)
assert(not okplain)
print("plain-tables-add", okplain)

-- 5. Error objects and pcall, like try/catch.
local ok, err = pcall(function() error({code = 7}) end)
assert(not ok and type(err) == "table" and err.code == 7)
print("error-table", ok, err.code)

-- 6. t.name is sugar for t["name"]; one table holds array items and fields.
local t = {10, 20, 30, name = "x"}
assert(t.name == t["name"] and t[2] == 20 and #t == 3)
print("table-mixed", t[1], t[2], t[3], t.name, #t)

-- 7. A finalizer runs after the object becomes unreachable.
local log = {}
do
  setmetatable({}, {__gc = function() log[#log + 1] = "finalized" end})
end
collectgarbage("collect")
assert(log[1] == "finalized")
print("gc-finalizer", log[1])
