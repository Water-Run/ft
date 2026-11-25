# 每个键落在哪个桶：用 gdb 读出本次进程的哈希种子（dict.c 的 dict_hash_function_seed，启动时随机生成），
# 按 SipHash-1-2 算出 4096 个键的桶号（buckets.py），再与 DEBUG HTSTATS 的链长分布逐项对照。对得上，画面上的桶位置就是真实的。
source "$(dirname "$0")/lab_common.sh"
fresh; start; load
sleep 1
section "DEBUG HTSTATS 0 FULL（写完 1 秒后）"
c DEBUG HTSTATS 0 FULL
size=$(cq DEBUG HTSTATS 0 | tr -d '\r' | grep -m1 'table size' | awk '{print $3}')

section "本次进程的哈希种子（gdb 读 dict_hash_function_seed，16 字节）"
seed=$(gdb -p "$(pid)" -batch -ex 'p/x dict_hash_function_seed' 2>/dev/null | grep -E '^\$1 = ' | grep -oE '0x[0-9a-f]+' | sed 's/^0x//' | awk '{printf "%02s", $0}' | tr ' ' '0')
printf '%s\n' "$seed"

section "按 SipHash-1-2 自己算一遍：链长分布应与上面完全相同"
for i in $(seq 1 4096); do printf 'user:%d\n' "$i"; done | python3 "$(dirname "$0")/buckets.py" "$seed" "$size" "$LAB/buckets.json"
cp "$LAB/buckets.json" "$(dirname "$0")/buckets.json"
stop
