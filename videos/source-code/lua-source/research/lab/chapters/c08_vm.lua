-- 07 解释循环："10" + 1 为什么等于 11
print("10" + 1, math.type("10" + 1))
print("3.0" + 1)
print(getmetatable("").__add ~= nil)
print(pcall(function() return {} + 1 end))
