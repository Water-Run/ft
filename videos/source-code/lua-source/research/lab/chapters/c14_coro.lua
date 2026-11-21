-- 13 协程：生产者交出单词，消费者逐个取用；跨过 C 函数不能让出
local producer = coroutine.wrap(function()
  for _, w in ipairs({"lua", "is", "small"}) do
    coroutine.yield(w)
  end
end)
local out = {}
for w in producer do out[#out + 1] = w:upper() end
print(table.concat(out, " "))

local co = coroutine.create(function()
  table.sort({3, 2, 1}, function(a, b) coroutine.yield() return a < b end)
end)
print(coroutine.resume(co))

local co2 = coroutine.create(function()
  local ok, v = pcall(function() return coroutine.yield("inside pcall") end)
  return ok, v
end)
print(coroutine.resume(co2))
print(coroutine.resume(co2, "resumed"))
