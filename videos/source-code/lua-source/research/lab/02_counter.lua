-- A single input for source-to-bytecode-to-result reconstruction (Lua 5.1+).
local function make_counter(start)
  local state = {value = start}
  return function(delta)
    state.value = state.value + delta
    return state.value
  end, state
end

local next_value, state = make_counter(40)
setmetatable(state, {
  __index = function(_, key)
    if key == "label" then return "counter" end
  end
})
print(state.label, next_value(2), next_value(3))

local co = coroutine.create(function()
  coroutine.yield(state.value)
  return next_value(1)
end)
local ok1, first = coroutine.resume(co)
print("yield", ok1, first, coroutine.status(co))
local ok2, last = coroutine.resume(co)
print("return", ok2, last, coroutine.status(co))
local ok3, err = pcall(function() error("counter-error", 0) end)
print("protected", ok3, err)
assert(first == 45 and last == 46 and ok1 and ok2 and not ok3)
