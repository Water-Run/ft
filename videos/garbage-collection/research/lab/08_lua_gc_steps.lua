-- 08_lua_gc_steps.lua — Lua 5.5.0：三色增量收集器把一轮回收切成多少个基本步，内存在哪一步开始下降。
-- 运行：lua 08_lua_gc_steps.lua > out_08_lua_gc_steps.txt
local function kb() return collectgarbage("count") end
print(_VERSION)
print("mode before switch:", collectgarbage("incremental"))   -- 切到增量模式；返回切换前的模式
collectgarbage("collect")                                      -- 先做一轮完整回收，清掉启动遗留
collectgarbage("stop")                                         -- 关掉自动触发，由本脚本手动推进
local live = {}
for i = 1, 200000 do live[i] = { i } end                       -- 活着的：20 万张小表，从根（局部变量 live）可达
local g = {}
for i = 1, 200000 do g[i] = { i } end                          -- 再 20 万张，然后放手
g = nil
print(string.format("before: %.0f KB (200000 live + 200000 unreachable tables)", kb()))
local steps, done = 0, false
repeat
  done = collectgarbage("step", 0)                             -- 一个基本步；返回 true 表示本轮周期结束
  steps = steps + 1
  if steps % 50 == 0 then print(string.format("  after step %3d: %8.0f KB", steps, kb())) end
until done
print(string.format("cycle finished after %d basic steps: %.0f KB", steps, kb()))
print("live[1][1] =", live[1][1], " #live =", #live)
