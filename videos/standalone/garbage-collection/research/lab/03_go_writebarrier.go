// The write barrier is code the Go compiler inserts in front of a pointer
// store into the heap. This file only exists to be compiled with the
// assembler listing turned on:
//   go build -trimpath -gcflags=-S -o <null device> 03_go_writebarrier.go
// The listing for main.link (see out_03_go_writebarrier.txt) shows the
// check of runtime.writeBarrier and the call to runtime.gcWriteBarrier2
// around the single store `a.next = b`. Nothing is executed.
package main

type node struct {
	next *node
	id   int
}

var global *node

//go:noinline
func link(a, b *node) { a.next = b } // one pointer store into a heap object

func main() {
	a := &node{id: 1}
	b := &node{id: 2}
	link(a, b)
	global = a
	println(global.next.id)
}
