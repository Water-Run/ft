-- 03 一个值：变量没有类型，值有；数字分整数与浮点两种子类型
local x = 1
print(type(x), math.type(x))
x = "one"
print(type(x))
x = {}
print(type(x))
print(math.type(3), math.type(3.0), 3 == 3.0)
print(math.maxinteger + 1 == math.mininteger)
print(2^53 + 1 == 2^53)
