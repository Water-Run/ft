#!/usr/bin/env python3
# 生成 05_big.sql：十万行的 users_big，用来看三层 B 树（见 ../FACTS.md「06 索引文件与 B 树」）。
# 数据是按公式造的，不是真实用户：name = 'u' + (id × 7919 mod 1000003) 补足六位，age = 18 + (id × 31 mod 60)。
# 用法：python gen_05_big.py > 05_big.sql      每条 INSERT 一千行，共一百条
head = """USE myisam_demo;
CREATE TABLE users_big (
  id   INT      NOT NULL,
  name CHAR(10) NOT NULL,
  age  TINYINT  NOT NULL,
  PRIMARY KEY (id),
  KEY idx_name (name)
) ENGINE=MyISAM;
"""
tail = """SHOW TABLE STATUS LIKE 'users_big';
EXPLAIN SELECT * FROM users_big WHERE id = 4242;
FLUSH TABLES;
"""
out = [head]
for b in range(100):
    rows = ",".join("(%d,'u%06d',%d)" % (i, i * 7919 % 1000003, 18 + i * 31 % 60) for i in range(b * 1000 + 1, b * 1000 + 1001))
    out.append("INSERT INTO users_big VALUES %s;\n" % rows)
out.append(tail)
import sys
sys.stdout.write("".join(out))
