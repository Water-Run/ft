-- Identical language feature strings fed to Lua 5.1 / 5.2 / 5.3 / 5.4 / 5.5.
local compile = loadstring or load
local probes = {
  {"global-declaration", "global x; x = 1"},
  {"named-vararg", "return function(...args) return args.n end"},
  {"bitwise-floor", "return (5 & 3), 5 // 2"},
  {"const-local", "local x <const> = 1; return x"},
  {"close-local", "local x <close> = nil"},
  {"for-assignment", "for i = 1, 3 do i = 2 end"},
}
print(_VERSION)
for _, probe in ipairs(probes) do
  print(probe[1], compile(probe[2]) ~= nil)
end
print("environment-api", type(getfenv), type(setfenv))
print("integer-subtype", type(math.type) == "function" and math.type(1) or "absent")
print("table.create", type(table.create))
local ok, err = pcall(error, nil)
print("nil-error-object", ok, type(err))
