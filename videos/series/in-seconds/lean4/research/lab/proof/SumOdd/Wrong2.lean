import SumOdd.Def

-- 同一个假命题，换成让 Lean 自己去算。
theorem wrong : sumOdd 3 = 10 := by decide
