-- 07 解释循环：字符串加数字，为什么 5.3 与 5.5 结果不同（放进局部变量，编出 ADD 与 MMBIN）
local s, n = "10", 1
local r = s + n
print(r, math.type(r))
print("3.0" + n)
print(pcall(function() return {} + n end))
