-- moon: print the phase of the Moon for a date.
local phase = require("moon.phase")
local names = require("moon.names")

local date = arg[1] or os.date("!%Y-%m-%d")
local p = phase.of(date)

print(("%s  %s  %d%% lit"):format(date, names.of(p.angle), p.lit))
