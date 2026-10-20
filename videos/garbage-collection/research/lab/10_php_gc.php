<?php
// 10_php_gc.php — PHP 8.5：引用计数看得见（debug_zval_dump）、析构立即发生、环要靠 gc_collect_cycles、memory_limit 撞上限。
// 运行：php 10_php_gc.php count > out_10_php_count.txt
//      php -d memory_limit=64M 10_php_gc.php hoard > out_10_php_hoard.txt 2>&1   （入库前把路径替换成文件名）
class Node {
    public ?Node $next = null;
    public function __construct(public string $name) {}
    public function __destruct() { echo "  __destruct {$this->name}\n"; }
}
$mode = $argv[1] ?? 'count';
echo "PHP ", PHP_VERSION, "\n";
if ($mode === 'count') {
    echo "a = new Node('A'):\n";      $a = new Node('A');   debug_zval_dump($a);
    echo "b = a:\n";                  $b = $a;              debug_zval_dump($a);
    echo "list = [a]:\n";             $list = [$a];         debug_zval_dump($a);
    echo "unset(b):\n";               unset($b);            debug_zval_dump($a);
    echo "list = []:\n";              $list = [];           debug_zval_dump($a);
    echo "unset(a):\n";               unset($a);
    echo "(after unset a)\n";
    echo "\ncycle: x.next = y, y.next = x, then unset(x, y):\n";
    gc_collect_cycles();                       // 基线：先清掉之前的环
    $x = new Node('X'); $y = new Node('Y'); $x->next = $y; $y->next = $x;
    unset($x, $y);
    echo "(after unset x, y: no destructor ran)\n";
    $s = gc_status(); echo "gc_status before: runs={$s['runs']} collected={$s['collected']} roots={$s['roots']}\n";
    $n = gc_collect_cycles();
    echo "gc_collect_cycles() = $n\n";
    $s = gc_status(); echo "gc_status after:  runs={$s['runs']} collected={$s['collected']} roots={$s['roots']}\n";
} else {
    // 同样的对象，一个都不放手，直到撞上 memory_limit
    $keep = [];
    $t0 = hrtime(true);
    for ($i = 1; ; $i++) {
        $keep[] = new Node("n$i");
        if ($i % 100000 === 0) printf("hoard: kept %s objects; memory_get_usage %.1f MB; %d ms\n", number_format($i), memory_get_usage() / 1048576, (hrtime(true) - $t0) / 1e6);
    }
}
