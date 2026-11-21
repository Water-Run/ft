-- 08 调用：Lua 调 Lua 不占 C 栈；经过 C 函数就占；尾调用不占新帧
local function deep(n)
  if n == 0 then return 0 end
  return 1 + deep(n - 1)
end
print(deep(100000))

local function probe(lo, hi)            -- 找出非尾递归能走多深
  while lo < hi do
    local mid = (lo + hi + 1) // 2
    if pcall(deep, mid) then lo = mid else hi = mid - 1 end
  end
  return lo
end
local max = probe(100000, 1000000)
print("deepest", max)
print(select(2, pcall(deep, max + 1)))

local level = 0
local function viapcall()
  level = level + 1
  local ok, err = pcall(viapcall)
  if not ok then error(err, 0) end
end
print(pcall(viapcall))
print("level", level)

local function loop(n)
  if n == 0 then return "done" end
  return loop(n - 1)
end
print(loop(10000000))
