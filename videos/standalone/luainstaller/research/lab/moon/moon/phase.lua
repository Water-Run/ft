-- Phase angle and illuminated fraction of the Moon (Meeus, ch. 48, low accuracy).
local julian = require("moon.julian")

local M = {}

local rad, sin, cos = math.rad, math.sin, math.cos

function M.of(date)
    local jd = julian.day(date)
    local T = (jd - 2451545.0) / 36525

    -- mean elongation, Sun's anomaly, Moon's anomaly (degrees)
    local D  = 297.8501921 + 445267.1114034 * T
    local Ms = 357.5291092 + 35999.0502909 * T
    local Mm = 134.9633964 + 477198.8675055 * T

    local i = 180 - D
        - 6.289 * sin(rad(Mm))
        + 2.100 * sin(rad(Ms))
        - 1.274 * sin(rad(2 * D - Mm))
        - 0.658 * sin(rad(2 * D))
        - 0.214 * sin(rad(2 * Mm))
        - 0.110 * sin(rad(D))

    local lit = (1 + cos(rad(i))) / 2
    return {
        angle = (180 - i) % 360,              -- 0 new, 180 full
        lit = math.floor(lit * 100 + 0.5),
    }
end

return M
