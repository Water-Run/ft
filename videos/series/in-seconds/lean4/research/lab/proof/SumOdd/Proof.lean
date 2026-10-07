import SumOdd.Def

theorem sumOdd_eq_sq (n : Nat) : sumOdd n = n ^ 2 := by
  induction n with
  | zero => rfl
  | succ k ih =>
    rw [sumOdd, ih]
    grind
