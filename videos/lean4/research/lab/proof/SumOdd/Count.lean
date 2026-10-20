import Lean
import SumOdd.Proof
open Lean

-- `leanchecker --fresh SumOdd.Proof` 重放的范围：SumOdd.Proof 的环境里全部常量（导入的 + 本文件定义的）。
-- 这里数一下有多少条；口径与 LeanChecker.lean 的 replayFromFresh 相同（env.constants.map₁）。
run_cmd Elab.Command.liftCoreM do
  let some mod := (← getEnv).header.moduleNames.find? (· == `SumOdd.Proof) | throwError "?"
  let env ← importModules #[{ module := mod }] {}
  let mut byKind : Std.HashMap String Nat := {}
  let mut total := 0
  for (_, ci) in env.constants.map₁.toList do
    let k := match ci with
      | .axiomInfo .. => "axiom" | .defnInfo .. => "def" | .thmInfo .. => "theorem" | .opaqueInfo .. => "opaque"
      | .quotInfo .. => "quot" | .inductInfo .. => "inductive" | .ctorInfo .. => "constructor" | .recInfo .. => "recursor"
    byKind := byKind.insert k (byKind.getD k 0 + 1)
    total := total + 1
  IO.println (Json.mkObj [("module", toJson mod.toString), ("total", toJson total),
    ("byKind", Json.mkObj (byKind.toList.map fun (k, v) => (k, toJson v))),
    ("modules", toJson env.header.moduleNames.size)]).compress
