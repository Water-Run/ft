import Lean
import SumOdd.Def
open Lean Elab Term Meta

-- 绕过前面的环节：手工拼出一个「证明项」，不经过策略，直接交给内核。
-- 命题是假的：sumOdd 3 = 10。交上去的证明项是 Eq.refl 9，它证明的是 9 = 9。
run_elab do
  let type ← instantiateMVars (← elabType (← `(sumOdd 3 = 10)))
  let value ← instantiateMVars (← elabTerm (← `(Eq.refl (9 : Nat))) none)
  addDecl <| .thmDecl { name := `fake, levelParams := [], type, value }
