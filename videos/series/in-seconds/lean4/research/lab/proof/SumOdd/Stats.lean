import Lean
import SumOdd.Proof
open Lean

/-!
量一量 `sumOdd_eq_sq` 的证明：
1. 证明项有多大（定理自己的值，加上策略为它生成的辅助声明 `sumOdd_eq_sq._proof_*`）；
2. 从这条定理出发，沿着「类型与值里引用到的常量」一路向下，一共碰到多少条声明，各是什么种类，最底下有哪些公理。
结果打印成一行 JSON，供 tools/gen_data.py 读取。
-/

namespace Stats

def kindOf : Expr → Char
  | .bvar ..    => 'b'   -- 约束变量
  | .fvar ..    => 'f'
  | .mvar ..    => 'm'
  | .sort ..    => 's'   -- Prop / Type
  | .const ..   => 'c'   -- 引用一条已有的声明
  | .app ..     => 'a'   -- 函数应用
  | .lam ..     => 'l'   -- λ
  | .forallE .. => 'p'   -- ∀ / →
  | .letE ..    => 't'
  | .lit ..     => 'n'   -- 数字或字符串字面量
  | .mdata ..   => 'd'
  | .proj ..    => 'j'

structure St where
  seen : Std.HashMap Expr Nat := {}   -- 结构相同的子项只记一次；值是把它按树展开后的节点数
  seq  : String := ""                 -- 各个不同子项的种类，按第一次遇到的先后

/-- 返回 e 按树展开的节点数；顺带登记所有不同的子项。 -/
partial def visit (e : Expr) : StateM St Nat := do
  if let some n := (← get).seen[e]? then return n
  modify fun s => { s with seq := s.seq.push (kindOf e) }
  let n ← match e with
    | .app f a          => do pure (1 + (← visit f) + (← visit a))
    | .lam _ t b _      => do pure (1 + (← visit t) + (← visit b))
    | .forallE _ t b _  => do pure (1 + (← visit t) + (← visit b))
    | .letE _ t v b _   => do pure (1 + (← visit t) + (← visit v) + (← visit b))
    | .mdata _ b        => visit b >>= fun k => pure (1 + k)
    | .proj _ _ b       => visit b >>= fun k => pure (1 + k)
    | _                 => pure 1
  modify fun s => { s with seen := s.seen.insert e n }
  return n

def declKind : ConstantInfo → String
  | .axiomInfo ..  => "axiom"
  | .defnInfo ..   => "def"
  | .thmInfo ..    => "theorem"
  | .opaqueInfo .. => "opaque"
  | .quotInfo ..   => "quot"
  | .inductInfo .. => "inductive"
  | .ctorInfo ..   => "constructor"
  | .recInfo ..    => "recursor"

/-- 一条声明直接引用到的常量：类型里的、值里的；归纳类型再加上它的构造子。 -/
def directDeps (ci : ConstantInfo) : Array Name :=
  let t := ci.type.getUsedConstants
  match ci with
  | .defnInfo v    => t ++ v.value.getUsedConstants
  | .thmInfo v     => t ++ v.value.getUsedConstants
  | .opaqueInfo v  => t ++ v.value.getUsedConstants
  | .inductInfo v  => t ++ v.ctors.toArray
  | _              => t

partial def closure (env : Environment) (n : Name) : StateM (Array Name × NameSet) Unit := do
  if (← get).2.contains n then return
  modify fun (a, s) => (a, s.insert n)
  if let some ci := env.find? n then
    for d in directDeps ci do closure env d
  modify fun (a, s) => (a.push n, s)        -- 后序：被依赖的排在前面

def jsonOfCounts (m : Std.HashMap String Nat) : Json :=
  Json.mkObj (m.toList.map fun (k, v) => (k, toJson v))

run_cmd Elab.Command.liftCoreM do
  let env ← getEnv
  let root := ``sumOdd_eq_sq
  -- 1. 证明项：定理的值 + 同前缀的辅助声明
  let aux := env.constants.fold (init := #[]) fun acc n _ =>
    if n != root && root.isPrefixOf n then acc.push n else acc
  let aux := aux.qsort (fun a b => a.toString < b.toString)
  let mut parts : Array Json := #[]
  let mut totalDag := 0
  let mut totalTree := 0
  let mut allSeq := ""
  for n in #[root] ++ aux do
    let some ci := env.find? n | continue
    let some v := ci.value? (allowOpaque := true) | continue
    let (tree, st) := (visit v).run {}
    let (ttree, tst) := (visit ci.type).run {}
    parts := parts.push <| Json.mkObj [("name", toJson n.toString), ("kind", toJson (declKind ci)),
      ("dag", toJson st.seen.size), ("tree", toJson tree), ("seq", toJson st.seq),
      ("typeDag", toJson tst.seen.size), ("typeTree", toJson ttree)]
    totalDag := totalDag + st.seen.size
    totalTree := totalTree + tree
    allSeq := allSeq ++ st.seq
  -- 2. 依赖闭包
  let ((), (order, _)) := (closure env root).run (#[], {})
  let mut byKind : Std.HashMap String Nat := {}
  let mut axioms : Array String := #[]
  let mut kinds := ""
  let mut mods : Std.HashMap String Nat := {}
  for n in order do
    let some ci := env.find? n | continue
    let k := declKind ci
    byKind := byKind.insert k (byKind.getD k 0 + 1)
    if k == "axiom" then axioms := axioms.push n.toString
    kinds := kinds.push (match k with
      | "axiom" => 'x' | "def" => 'd' | "theorem" => 't' | "opaque" => 'o' | "quot" => 'q'
      | "inductive" => 'i' | "constructor" => 'c' | _ => 'r')
    let m := match env.getModuleIdxFor? n with
      | some i => env.header.moduleNames[i.toNat]!.toString
      | none => "(this file)"
    let top := (m.splitOn ".").head!
    mods := mods.insert top (mods.getD top 0 + 1)
  let out := Json.mkObj [
    ("root", toJson root.toString),
    ("term", Json.mkObj [("parts", Json.arr parts), ("dag", toJson totalDag), ("tree", toJson totalTree), ("seq", toJson allSeq)]),
    ("closure", Json.mkObj [("total", toJson order.size), ("byKind", jsonOfCounts byKind), ("axioms", toJson axioms),
      ("kinds", toJson kinds), ("byTopModule", jsonOfCounts mods),
      ("first", toJson ((order.extract 0 12).map (·.toString))), ("last", toJson ((order.extract (order.size - 12) order.size).map (·.toString)))])]
  IO.println out.compress

end Stats
