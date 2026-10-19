"""The reference count as bytes in memory, and the cycle collector's own log.

Run: python 05_python_refcount_raw.py > out_05_python_refcount_raw.txt 2>&1
Companion to 01_python_refcount.py. Reads the ob_refcnt field directly
from the object header with ctypes (CPython, non-free-threaded build:
ob_refcnt is the first machine word of every object). The read is done
inline, so unlike sys.getrefcount() no extra reference is created for a
function argument: a single name really shows as 1.
Then turns on gc.DEBUG_STATS so the collector prints what it did.
Numbers are from this interpreter and this run.
"""
import ctypes
import gc
import sys
import sysconfig

RC = lambda addr: ctypes.c_ssize_t.from_address(addr).value  # noqa: E731

print("python", sys.version.split()[0], "| free-threaded build:", bool(sysconfig.get_config_var("Py_GIL_DISABLED")))
print("object header: sys.getsizeof(object()) =", sys.getsizeof(object()), "bytes; ob_refcnt is the first", ctypes.sizeof(ctypes.c_ssize_t), "bytes")


class Node:
    def __init__(self, name):
        self.name = name
        self.peer = None

    def __del__(self):
        print("  __del__", self.name)


print("\n## 1. ob_refcnt read from memory (inline) vs sys.getrefcount() (+1 for its argument)")
gc.disable()
a = Node("A")
A = id(a)
print("a = Node('A')      raw =", RC(A), " getrefcount =", sys.getrefcount(a))
b = a
print("b = a              raw =", RC(A), " getrefcount =", sys.getrefcount(a))
holder = [a]
print("holder = [a]       raw =", RC(A), " getrefcount =", sys.getrefcount(a))
del b
print("del b              raw =", RC(A), " getrefcount =", sys.getrefcount(a))
holder.clear()
print("holder.clear()     raw =", RC(A), " getrefcount =", sys.getrefcount(a))
print("del a  ->", end=" ")
del a
print("(finalized at this point)")

print("\n## 2. a cycle: both counts stay at 1 after the outside names are gone")
x = Node("X")
y = Node("Y")
x.peer = y
y.peer = x
X, Y = id(x), id(y)
print("with names:    raw X =", RC(X), " raw Y =", RC(Y))
del x, y
print("after del x,y: raw X =", RC(X), " raw Y =", RC(Y), "(each held only by the other)")

print("\n## 3. the cycle collector, with its own statistics turned on")
print("gc.get_threshold() =", gc.get_threshold())
gc.set_debug(gc.DEBUG_STATS)
n = gc.collect()
gc.set_debug(0)
print("gc.collect() returned", n, "(unreachable objects found in this run; X and Y are among them,")
print("  the rest are cycles left over from interpreter start-up because no collection ran before this one)")
