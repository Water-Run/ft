-- 12 错误：错误可以是一张表；出错离开时，<close> 变量照样被关闭
local marker = {code = 7}
local ok, e = pcall(function() error(marker) end)
print(ok, e == marker, e.code)

print(pcall(function()
  local res <close> = setmetatable({}, {__close = function(_, err)
    print("closing", err)
  end})
  error("fail", 0)
end))
