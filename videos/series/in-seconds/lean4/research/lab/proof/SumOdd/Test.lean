import SumOdd.Def

-- 逐个计算：前 9 项与平方数并排
#eval (List.range 9).map sumOdd
#eval (List.range 9).map (· ^ 2)

/-- 从 0 试到 N − 1：按同一条递推边累加边比较，全部相等才返回 true。 -/
def testUpTo (N : Nat) : Bool := Id.run do
  let mut s := 0
  for n in [0:N] do
    if s != n ^ 2 then return false
    s := s + (2 * n + 1)
  return true

-- 试到一百万（n = 0 … 1 000 000）
#eval testUpTo 1000001

-- 画面右上角的读数：n = 0 … 200 的和，由 Lean 自己算出
#eval (List.range 201).map sumOdd
