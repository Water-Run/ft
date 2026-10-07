/-- 前 n 个奇数的和：1 + 3 + 5 + … + (2n − 1)。 -/
def sumOdd : Nat → Nat
  | 0 => 0
  | n + 1 => sumOdd n + (2 * n + 1)
