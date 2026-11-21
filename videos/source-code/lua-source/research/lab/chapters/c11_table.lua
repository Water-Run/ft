-- 10 表：同一张表里既有下标也有字段；1 和 1.0 是同一个键；长度遇到空洞
local t = {10, 20, 30, name = "lua"}
print(t[1], t.name, t["name"], #t)
t[1.0] = 11
print(t[1])
local u = {}
u[1] = 1; u[2] = 2; u[4] = 4
print(#u)
local v = {1, 2, nil, 4}
print(#v)
