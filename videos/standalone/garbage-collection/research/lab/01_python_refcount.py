"""Reference counting, cycles and the cycle collector in CPython.

Run: python 01_python_refcount.py > out_01_python_refcount.txt 2>&1
The numbers are from this interpreter and this run; they are evidence of
behaviour, not a benchmark.
"""
import gc
import sys
import weakref

print("python", sys.version.replace("\n", " "))
print("gc enabled at start:", gc.isenabled())
print("baseline gc.collect() ->", gc.collect())


class Node:
    def __init__(self, name):
        self.name = name
        self.peer = None

    def __del__(self):
        print("  __del__", self.name)


print("\n## 1. a reference count goes up and down")
gc.disable()
a = Node("A")
print("sys.getrefcount(a) after a = Node('A'):", sys.getrefcount(a))
b = a
print("sys.getrefcount(a) after b = a:", sys.getrefcount(a))
del b
print("sys.getrefcount(a) after del b:", sys.getrefcount(a))
print("note: getrefcount() itself adds one temporary reference")

print("\n## 2. last reference dropped: object is finalized immediately")
r = weakref.ref(a)
print("weakref before del a:", r() is a)
del a
print("weakref after del a:", r())

print("\n## 3. two objects pointing at each other")
x = Node("X")
y = Node("Y")
x.peer = y
y.peer = x
rx = weakref.ref(x)
print("refcount X with cycle:", sys.getrefcount(x))
print("refcount Y with cycle:", sys.getrefcount(y))
del x, y
print("weakref after dropping the outside names:", rx())
print("gc.collect() ->", gc.collect())
print("weakref after gc.collect():", rx())
print("gc.garbage:", gc.garbage)

print("\n## 4. counters after the run")
print("gc.get_count():", gc.get_count())
print("note: gc.collect() also visits unrelated cycle-tracked objects")
print("gc.get_stats():")
for i, row in enumerate(gc.get_stats()):
    print("  generation", i, row)
