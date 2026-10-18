// Tracing collection in Go: most allocated nodes become unreachable; a root
// slice keeps every 200th node. Run with:
//   go run 02_go_trace.go
//   GODEBUG=gctrace=1 go run 02_go_trace.go
// The numbers are one run on one machine, not a benchmark.
package main

import (
	"fmt"
	"runtime"
)

type node struct {
	id      int
	payload [120]byte
}

var sink *node

//go:noinline
func touch(p *node) { sink = p }

//go:noinline
func build(n int) []*node {
	keep := make([]*node, 0, n/200)
	for i := 0; i < n; i++ {
		p := &node{id: i}
		touch(p) // force p to escape; without this the compiler can drop it
		if i%200 == 0 {
			keep = append(keep, p)
		}
	}
	return keep
}

func main() {
	var before, after runtime.MemStats

	runtime.ReadMemStats(&before)
	keep := build(200000)
	runtime.GC()
	runtime.ReadMemStats(&after)

	fmt.Printf("go=%s\n", runtime.Version())
	fmt.Printf("allocated_nodes=200000 kept_nodes=%d\n", len(keep))
	fmt.Printf("before: HeapAlloc=%d HeapObjects=%d NumGC=%d\n",
		before.HeapAlloc, before.HeapObjects, before.NumGC)
	fmt.Printf("after:  HeapAlloc=%d HeapObjects=%d NumGC=%d\n",
		after.HeapAlloc, after.HeapObjects, after.NumGC)
	fmt.Printf("gc_cycles_during_run=%d\n", after.NumGC-before.NumGC)
	runtime.KeepAlive(keep)
}
