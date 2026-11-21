-- 11 元表：__add 让两张表能相加；__index 串成一条查找链
local V = {}
V.__add = function(p, q) return setmetatable({x = p.x + q.x, y = p.y + q.y}, V) end
local r = setmetatable({x = 1, y = 2}, V) + setmetatable({x = 10, y = 20}, V)
print(r.x, r.y)

local Animal = {}
Animal.__index = Animal
function Animal.speak(self) return self.name .. " makes a sound" end

local Dog = setmetatable({}, Animal)
Dog.__index = Dog
function Dog.fetch(self) return self.name .. " fetches" end

local rex = setmetatable({name = "Rex"}, Dog)
print(rex:fetch())
print(rex:speak())
print(rawget(rex, "speak"), rawget(Dog, "speak"), rawget(Animal, "speak") ~= nil)
