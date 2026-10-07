import SumOdd.Def

-- 一个假命题：前 3 个奇数的和是 10（实际是 9）。交上去的「证明」是 rfl。
theorem wrong : sumOdd 3 = 10 := rfl
