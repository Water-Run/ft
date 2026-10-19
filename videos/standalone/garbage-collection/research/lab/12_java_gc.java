// 12_java_gc.java — Java（HotSpot，默认 G1）：分配速度与年轻代回收次数、-Xmx 堆上限的 OutOfMemoryError、G1 并发标记周期里的短暂停。
// 运行（单文件源码直接启动）：
//   java -Xlog:gc 12_java_gc.java churn      > out_12_java_churn.txt
//   java -Xmx64m -Xlog:gc 12_java_gc.java hoard > out_12_java_hoard.txt 2>&1
//   java -Xmx64m -Xlog:gc 12_java_gc.java mark  > out_12_java_mark.txt
import java.lang.management.*;
import java.util.*;

public class Main {
    static final class Node { long id; Node next; Node(long id) { this.id = id; } }
    static Node last;

    static long youngGcs() {
        long n = 0;
        for (GarbageCollectorMXBean b : ManagementFactory.getGarbageCollectorMXBeans())
            if (b.getName().contains("Young")) n += b.getCollectionCount();
        return n;
    }

    public static void main(String[] args) {
        String mode = args.length > 0 ? args[0] : "churn";
        System.out.println("java " + System.getProperty("java.version") + "; collectors = "
            + ManagementFactory.getGarbageCollectorMXBeans().stream().map(b -> b.getName()).toList());
        if (mode.equals("churn")) {
            long n = 0, g0 = youngGcs(), t0 = System.nanoTime();
            while (System.nanoTime() - t0 < 1_000_000_000L)
                for (int i = 0; i < 10000; i++) last = new Node(n++);
            long ms = (System.nanoTime() - t0) / 1_000_000;
            Runtime rt = Runtime.getRuntime();
            System.out.printf("churn: %,d objects created in %d ms; young GCs %d; used heap %.1f MB%n",
                n, ms, youngGcs() - g0, (rt.totalMemory() - rt.freeMemory()) / 1048576.0);
        } else if (mode.equals("hoard")) {
            List<Node> keep = new ArrayList<>();
            long n = 0, t0 = System.nanoTime();
            while (true) {
                keep.add(new Node(n++));
                if (n % 500000 == 0) {
                    Runtime rt = Runtime.getRuntime();
                    System.out.printf("hoard: kept %,d objects; used heap %.1f MB; %d ms%n", n,
                        (rt.totalMemory() - rt.freeMemory()) / 1048576.0, (System.nanoTime() - t0) / 1_000_000);
                }
            }
        } else {
            // mark：先留住约 30 MB 活对象，再不停制造垃圾，让 G1 启动一次并发标记周期
            List<Node> keep = new ArrayList<>();
            for (long i = 0; i < 700_000; i++) keep.add(new Node(i));
            long n = 0, t0 = System.nanoTime();
            while (System.nanoTime() - t0 < 1_500_000_000L)
                for (int i = 0; i < 10000; i++) last = new Node(n++);
            System.out.printf("mark: kept %,d live objects, created %,d temporary objects; young GCs %d%n", keep.size(), n, youngGcs());
        }
    }
}
