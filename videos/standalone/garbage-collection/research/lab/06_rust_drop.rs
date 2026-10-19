// No collector: the Rust compiler decides at compile time where each value
// is freed. Run (from this directory, so paths in the listing stay relative):
//   rustc --edition 2021 -o <build dir>/06_rust_drop.exe 06_rust_drop.rs && <build dir>/06_rust_drop.exe
//   rustc --edition 2021 --emit=mir -o <build dir>/06_rust_drop.mir 06_rust_drop.rs
// out_06_rust_drop.txt holds the program output followed by the lines of the
// MIR (the compiler's intermediate form) where `drop(...)` calls were inserted.
struct Node {
    name: &'static str,
}

impl Drop for Node {
    fn drop(&mut self) {
        println!("drop {}", self.name);
    }
}

fn main() {
    let a = Node { name: "A" };
    {
        let b = Node { name: "B" };
        println!("inner scope ends, b = {}", b.name);
    } // b is freed here, by code the compiler inserted
    let c = a; // ownership moves from a to c; nothing is freed
    println!("after move, c = {}", c.name);
    println!("main ends");
} // c is freed here
