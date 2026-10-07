import SumOdd.Def

-- 与 Proof.lean 同一份证明，只多出 trace_state：让 Lean 把每一步之前的目标打印出来。
theorem sumOdd_eq_sq_traced (n : Nat) : sumOdd n = n ^ 2 := by
  induction n with
  | zero =>
    trace_state
    rfl
  | succ k ih =>
    trace_state
    rw [sumOdd, ih]
    trace_state
    grind
