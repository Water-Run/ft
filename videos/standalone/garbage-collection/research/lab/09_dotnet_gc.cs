// 09_dotnet_gc.cs — .NET 10（C#）：分配速度与堆上限（开场）、对象升代、JIT 为一次引用赋值生成的写屏障调用。
// 运行（.NET 10 SDK 的单文件程序，不需要 csproj）：
//   dotnet run -c Release 09_dotnet_gc.cs -- churn                                        > out_09_dotnet_churn.txt
//   DOTNET_GCHeapHardLimit=0x4000000 dotnet run -c Release 09_dotnet_gc.cs -- hoard       > out_09_dotnet_hoard.txt
//   dotnet run -c Release 09_dotnet_gc.cs -- gen                                          > out_09_dotnet_gen.txt
//   DOTNET_TieredCompilation=0 DOTNET_JitDisasm="*Link*" dotnet run -c Release 09_dotnet_gc.cs -- wb > out_09_dotnet_wb.txt
using System.Runtime;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;

var mode = args.Length > 0 ? args[0] : "churn";
Console.WriteLine($"{RuntimeInformation.FrameworkDescription}; ServerGC={GCSettings.IsServerGC}; LatencyMode={GCSettings.LatencyMode}");

if (mode == "churn")
{
    // 一秒钟里不停创建小对象，每个用完即弃（存进静态字段，保证真的分配在堆上）
    long n = 0;
    int g0 = GC.CollectionCount(0), g1 = GC.CollectionCount(1), g2 = GC.CollectionCount(2);
    long m0 = GC.GetTotalMemory(false);
    var sw = System.Diagnostics.Stopwatch.StartNew();
    while (sw.ElapsedMilliseconds < 1000)
        for (int i = 0; i < 10000; i++) Lab.Last = new Node(n++);
    sw.Stop();
    long m1 = GC.GetTotalMemory(false);
    Console.WriteLine($"churn: {n:N0} objects created in {sw.ElapsedMilliseconds} ms; heap {m0 / 1048576.0:F1} MB -> {m1 / 1048576.0:F1} MB; " +
                      $"gen0 GCs {GC.CollectionCount(0) - g0}, gen1 {GC.CollectionCount(1) - g1}, gen2 {GC.CollectionCount(2) - g2}");
}
else if (mode == "hoard")
{
    // 同样的对象，一个都不放手，直到撞上 DOTNET_GCHeapHardLimit
    var keep = new List<Node>();
    long n = 0;
    var sw = System.Diagnostics.Stopwatch.StartNew();
    try
    {
        while (true)
        {
            keep.Add(new Node(n++));
            if (n % 500000 == 0) Console.WriteLine($"hoard: kept {n:N0} objects; heap {GC.GetTotalMemory(false) / 1048576.0:F1} MB; {sw.ElapsedMilliseconds} ms");
        }
    }
    catch (OutOfMemoryException e)
    {
        Console.WriteLine($"hoard: {e.GetType().FullName}: {e.Message} (after {n:N0} objects, {sw.ElapsedMilliseconds} ms; gen2 GCs {GC.CollectionCount(2)})");
    }
}
else if (mode == "gen")
{
    // 问一个对象它现在在第几代；每活过一次回收升一级，到第 2 代为止
    var o = new Node(0);
    Console.WriteLine($"gen: new object -> generation {GC.GetGeneration(o)}");
    GC.Collect(0); Console.WriteLine($"gen: after a gen0 collection -> generation {GC.GetGeneration(o)}");
    GC.Collect(1); Console.WriteLine($"gen: after a gen1 collection -> generation {GC.GetGeneration(o)}");
    GC.Collect(2); Console.WriteLine($"gen: after a gen2 collection -> generation {GC.GetGeneration(o)}");
    Console.WriteLine($"gen: GC.MaxGeneration = {GC.MaxGeneration}");
}
else if (mode == "wb")
{
    // 只为了让 JIT 编译 Lab.Link 并打印它的汇编（DOTNET_JitDisasm）
    var a = new Node(1); var b = new Node(2);
    Lab.Link(a, b);
    Console.WriteLine($"wb: linked {a.Id} -> {b.Id}");
}

sealed class Node { public long Id; public Node? Next; public Node(long id) { Id = id; } }

static class Lab
{
    public static Node? Last;
    [MethodImpl(MethodImplOptions.NoInlining)]
    public static void Link(Node a, Node b) { a.Next = b; }   // 一句引用赋值：a.Next = b
}
