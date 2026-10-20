-- Julian day number of a calendar date at 00:00 UTC.
local M = {}

function M.day(date)
    local y, m, d = date:match("^(%d+)-(%d+)-(%d+)$")
    assert(y, "expected YYYY-MM-DD")
    y, m, d = tonumber(y), tonumber(m), tonumber(d)
    if m <= 2 then
        y, m = y - 1, m + 12
    end
    local a = math.floor(y / 100)
    local b = 2 - a + math.floor(a / 4)
    return math.floor(365.25 * (y + 4716))
        + math.floor(30.6001 * (m + 1)) + d + b - 1524.5
end

return M
