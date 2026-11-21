-- 04 读入与记号：保留字不能当名字；global 在默认构建里仍可以
print(load("local while = 1"))
local global = 5
print(global)
local a = 1--[[ 注释 ]]+2
print(a)
print(0x10, 1e2, 7 // 2)
