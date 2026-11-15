-- Safe observations of two issues listed at https://www.lua.org/bugs.html#5.5.1
-- Record release behavior; do not patch the locked source or treat it as intent.
local iterations = 0
for i = 1, 0/0, -1 do
  iterations = iterations + 1
  if iterations > 10 then break end
end
local inverse = 1 / (-0.0 - 0)
print("5.5.1-2 NaN-loop-iterations", iterations)
print("5.5.1-3 negative-zero-preserved", inverse == -math.huge)
