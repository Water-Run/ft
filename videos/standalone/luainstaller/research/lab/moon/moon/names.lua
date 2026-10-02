-- Name of the phase for an elongation angle (0 new, 180 full).
local M = {}

local list = {
    "new moon", "waxing crescent", "first quarter", "waxing gibbous",
    "full moon", "waning gibbous", "last quarter", "waning crescent",
}

function M.of(angle)
    return list[math.floor((angle + 22.5) / 45) % 8 + 1]
end

return M
