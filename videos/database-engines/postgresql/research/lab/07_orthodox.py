"""07 标题「正统」的实测部分：事务里的 DDL 可以回滚；约束在库内强制执行。

同一张表（pglab.build）：
1. 一个事务里建一张新表、给 users 加一列、插一行，然后回滚：新表不存在，users 没有那一列，那一行也不在。
2. 约束：加 CHECK（年龄 0–150）后插入 200 岁；外键指向不存在的用户；主键重复；NOT NULL。记下各自的报错（SQLSTATE 与原文）。
用法：python 07_orthodox.py
"""
import psycopg
from pglab import Lab, build

with Lab('07_orthodox') as lab:
    a = lab.conn('admin'); q = lab.q
    build(lab, a)
    S = lab.r['steps'] = {}

    q(a, 'BEGIN')
    q(a, 'CREATE TABLE orders (id int PRIMARY KEY, user_id int NOT NULL REFERENCES users (id), amount numeric(10, 2) NOT NULL)', tag='ddl in tx: create table')
    q(a, 'ALTER TABLE users ADD COLUMN email text', tag='ddl in tx: add column')
    q(a, "INSERT INTO users VALUES (5000, 'Mallory', 30, 'mallory@example.com')", tag='dml in tx')
    inside = q(a, "SELECT count(*) AS cols FROM information_schema.columns WHERE table_name = 'users'", tag='columns inside tx')[0]['cols']
    q(a, 'ROLLBACK', tag='rollback ddl')
    S['1_ddl_rollback'] = {'columns_inside_tx': inside,
                           'columns_after': q(a, "SELECT count(*) AS cols FROM information_schema.columns WHERE table_name = 'users'", tag='columns after rollback')[0]['cols'],
                           'orders_exists_after': q(a, "SELECT to_regclass('orders') IS NOT NULL AS e", tag='orders after rollback')[0]['e'],
                           'mallory_after': q(a, 'SELECT count(*) AS n FROM users WHERE id = 5000', tag='row after rollback')[0]['n']}

    q(a, 'ALTER TABLE users ADD CONSTRAINT age_range CHECK (age BETWEEN 0 AND 150)', tag='add check')
    q(a, 'CREATE TABLE orders (id int PRIMARY KEY, user_id int NOT NULL REFERENCES users (id), amount numeric(10, 2) NOT NULL)', tag='create orders')
    errs = {}
    for k, sql in {'check': "INSERT INTO users VALUES (5001, 'Judy', 200)",
                   'foreign_key': 'INSERT INTO orders VALUES (1, 9999, 9.90)',
                   'primary_key': "INSERT INTO users VALUES (2050, 'Ivan', 30)",
                   'not_null': 'INSERT INTO users VALUES (5002, NULL, 30)',
                   'delete_referenced': None}.items():
        if k == 'delete_referenced':
            q(a, 'INSERT INTO orders VALUES (1, 2050, 9.90)', tag='alice places an order')
            sql = 'DELETE FROM users WHERE id = 2050'
        try:
            q(a, sql, tag='constraint ' + k)
            errs[k] = 'accepted'
        except psycopg.Error as e:
            errs[k] = {'sqlstate': e.sqlstate, 'message': e.diag.message_primary, 'detail': e.diag.message_detail}
    S['2_constraints'] = errs
    for k, v in S.items():
        print('==', k)
        for kk, vv in v.items():
            print('  ', kk, vv)
