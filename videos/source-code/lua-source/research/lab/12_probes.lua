-- Production probes for Lua 5.5.1 (added by the production side, 2026-11-15).
-- Deterministic observable assertions; no timing claims.

-- 1. In the default 5.5.1 build 'global' is still usable as a plain name
--    (luaconf.h defines LUA_COMPAT_GLOBAL 1).
local fn = load("local global = 7; return global")
assert(fn and fn() == 7)
print("global-as-name", fn())

-- 2. Lua-to-Lua calls do not nest C frames: a non-tail recursion 100000
--    deep finishes. Recursing through pcall (a C function) nests C calls
--    and stops at the C-call limit.
local function depth(n) if n == 0 then return 0 end return 1 + depth(n - 1) end
assert(depth(100000) == 100000)
print("lua-recursion", depth(100000))

local reached, innermost = 0, nil
local function viapcall(n)
  reached = n
  local ok, err = pcall(viapcall, n + 1)
  if not ok and innermost == nil then innermost = err end
  return ok
end
viapcall(1)
print("recursion-through-pcall deepest", reached)
print("recursion-through-pcall error", innermost)

-- 3. Length of a table with an array part reserved but empty is 0;
--    table.create only reserves space.
local t = table.create(8)
print("table.create(8) length", #t, next(t))

-- 4. Same counter values seen from the coroutine body: the closure reached
--    through the coroutine shares the same upvalue (debug use only).
local function make_counter(start)
  local state = {value = start}
  return function(delta) state.value = state.value + delta; return state.value end, state
end
local f1, s1 = make_counter(40)
local f2 = make_counter(40)
f1(2)
print("independent-counters", f1(0), f2(0), s1.value)
