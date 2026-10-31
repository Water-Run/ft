from cart import total

got = total([3, 5, 2])
if got == 10:
    print("通过：total([3, 5, 2]) = 10")
else:
    print(f"失败：total([3, 5, 2]) 应为 10，实际得到 {got}")
    raise SystemExit(1)
