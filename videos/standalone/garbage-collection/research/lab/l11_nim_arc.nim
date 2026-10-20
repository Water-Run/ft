# l11_nim_arc.nim — Nim 2.2：ARC 在编译期插入析构调用；环在 ARC 下泄漏、在 ORC 下被环收集器回收。
# 运行：nim c -d:release --mm:arc --hints:off -r l11_nim_arc.nim  > out_11_nim_arc.txt
#      nim c -d:release --mm:orc --hints:off -r l11_nim_arc.nim  > out_11_nim_orc.txt
#      nim c --mm:arc --compileOnly --hints:off --expandArc:scopeDemo l11_nim_arc.nim > out_11_nim_expandarc.txt
type
  NodeObj = object
    name: string
    next: Node
  Node = ref NodeObj

var destroyed = 0

proc `=destroy`(n: NodeObj) =
  inc destroyed
  echo "  =destroy ", n.name
  `=destroy`(n.name)
  `=destroy`(n.next)

proc scopeDemo() =
  let a = Node(name: "A")
  block:
    let b = Node(name: "B")
    echo "inner scope ends (b goes out of scope)"
  let c = a                       # 第二个引用，计数加一，不复制对象
  echo "scopeDemo ends (a, c go out of scope): ", a.name, " ", c.name

proc cycleDemo() =
  var x = Node(name: "X")
  var y = Node(name: "Y")
  x.next = y
  y.next = x                      # 环：X -> Y -> X
  x = nil
  y = nil
  echo "after x = nil, y = nil: destroyed = ", destroyed
  GC_fullCollect()                # ORC 在这里跑环收集器；ARC 没有环收集器
  echo "after GC_fullCollect(): destroyed = ", destroyed

echo "mm = ", (when defined(gcOrc): "orc" elif defined(gcArc): "arc" else: "other")
scopeDemo()
echo "scope demo done: destroyed = ", destroyed
cycleDemo()
