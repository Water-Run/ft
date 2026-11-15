-- Lua 5.5 additions and important migration boundaries.
local function check_load(label, text, expected)
  local fn, err = load(text, label, "t", {})
  assert((fn ~= nil) == expected, tostring(err))
  print(label, fn and "compiled" or "rejected")
  return fn
end
check_load("implicit-global", "x = 1", true)()
check_load("declared-global", "global x; x = 1", true)()
check_load("undeclared-name", "global x; y = 1", false)
check_load("readonly-global", "global<const> *; x = 1", false)
check_load("readonly-for", "for i = 1, 3 do i = 2 end", false)
local env = {x = 9}
assert(load("global x; return x", "declaration-only", "t", env)() == 9)
local init = assert(load("global x = 10", "duplicate-initialization", "t", env))
local ok = pcall(init)
assert(not ok)
assert(load("global x <const>; _ENV.x = 12; return x", "syntactic-only", "t", env)() == 12)
print("global-semantics", "declaration-preserves-value", "duplicate-init-errors", "ENV-bypasses-const")

local function indexed(...args)
  return args.n, args[1], args[2], args[3]
end
local n, a, b, c = indexed(10, nil, 30)
assert(n == 3 and a == 10 and b == nil and c == 30)
local function escaped(...args) return args end
local actual = escaped(10, nil, 30)
assert(type(actual) == "table" and actual.n == 3 and actual[3] == 30)
local function changed(...args)
  args[1] = 99
  return ...
end
assert(changed(10) == 99)
print("named-varargs", n, a, tostring(b), c, type(actual), changed(10))

local capacity = table.create(1000, 20)
assert(type(capacity) == "table" and #capacity == 0 and next(capacity) == nil)
print("table.create", #capacity, next(capacity) == nil)
local first, last = utf8.offset("\195\169", 1)
assert(first == 1 and last == 2)
print("utf8.offset", first, last)
local ok2, err2 = pcall(error, nil)
assert(not ok2 and type(err2) == "string")
print("error-nil", ok2, type(err2))
