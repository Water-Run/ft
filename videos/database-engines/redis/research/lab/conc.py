#!/usr/bin/env python3
"""事务与并发：几个客户端各开一条连接，按写死的先后发命令，看谁等谁、各自看到什么。
不依赖第三方库：一个几十行的 RESP 客户端。端口与 lab_common.sh 相同。"""
import socket, threading, time, sys

PORT = 7379

class Conn:
    def __init__(self, name):
        self.name = name
        self.s = socket.create_connection(('127.0.0.1', PORT))
        self.f = self.s.makefile('rb')
    def send(self, *args):
        out = b'*%d\r\n' % len(args)
        for a in args:
            a = str(a).encode()
            out += b'$%d\r\n%s\r\n' % (len(a), a)
        self.s.sendall(out)
    def read(self):
        line = self.f.readline().rstrip(b'\r\n')
        t, rest = line[:1], line[1:].decode()
        if t == b'+': return rest
        if t == b'-': return 'ERR:' + rest
        if t == b':': return int(rest)
        if t == b'$':
            n = int(rest)
            if n < 0: return None
            data = self.f.read(n + 2)[:-2]
            return data.decode()
        if t == b'*':
            n = int(rest)
            if n < 0: return None
            return [self.read() for _ in range(n)]
        if t == b'_': return None
        return 'UNKNOWN:' + line.decode()
    def cmd(self, *args, show=True):
        self.send(*args)
        r = self.read()
        if show: print(f'{self.name:6}> {" ".join(map(str, args))}\n        {r!r}')
        return r

def section(t): print(f'\n==== {t} ====', flush=True)

def main():
    alice, bob, carol = Conn('Alice'), Conn('Bob'), Conn('Carol')
    alice.cmd('HSET', 'user:2050', 'age', 42, show=False)

    section('一条慢命令挡住所有人：Carol 让服务端睡 0.5 秒（DEBUG SLEEP），0.1 秒后 Bob 来读')
    t0 = time.monotonic()
    carol.send('DEBUG', 'SLEEP', '0.5')
    time.sleep(0.1)
    t1 = time.monotonic()
    r = bob.cmd('HGET', 'user:2050', 'age')
    t2 = time.monotonic()
    carol.read()
    print(f'Bob 发出请求在第 {t1 - t0:.2f} 秒，拿到回复在第 {t2 - t0:.2f} 秒：等了 {t2 - t1:.2f} 秒')

    section('每条命令单独执行、不会被打断：Alice 与 Carol 各用一个线程，同时各做 10000 次 HINCRBY 加一')
    alice.cmd('HSET', 'user:2050', 'visits', 0)
    def worker(c):
        for _ in range(10000):
            c.cmd('HINCRBY', 'user:2050', 'visits', 1, show=False)
    ts = [threading.Thread(target=worker, args=(c,)) for c in (alice, carol)]
    [t.start() for t in ts]; [t.join() for t in ts]
    bob.cmd('HGET', 'user:2050', 'visits')
    alice.cmd('HDEL', 'user:2050', 'visits', show=False)

    section('先读后写分成两条命令，中间被别人插进来：两次加一只剩一次')
    a = alice.cmd('HGET', 'user:2050', 'age')
    c = carol.cmd('HGET', 'user:2050', 'age')
    alice.cmd('HSET', 'user:2050', 'age', int(a) + 1)
    carol.cmd('HSET', 'user:2050', 'age', int(c) + 1)
    bob.cmd('HGET', 'user:2050', 'age')
    alice.cmd('HSET', 'user:2050', 'age', 42, show=False)

    section('MULTI：命令先排队，EXEC 时一口气执行；排队期间 Bob 读到的仍是旧值')
    alice.cmd('MULTI')
    alice.cmd('HSET', 'user:2050', 'age', 43)
    alice.cmd('HGET', 'user:2050', 'age')
    bob.cmd('HGET', 'user:2050', 'age')
    alice.cmd('EXEC')
    bob.cmd('HGET', 'user:2050', 'age')
    alice.cmd('HSET', 'user:2050', 'age', 42, show=False)

    section('WATCH：Alice 盯住这个键；她 EXEC 之前 Carol 改了它，于是 Alice 的 EXEC 什么也不做，回复空')
    alice.cmd('WATCH', 'user:2050')
    a = alice.cmd('HGET', 'user:2050', 'age')
    carol.cmd('HSET', 'user:2050', 'age', 43)
    alice.cmd('MULTI')
    alice.cmd('HSET', 'user:2050', 'age', int(a) + 1)
    alice.cmd('EXEC')
    bob.cmd('HGET', 'user:2050', 'age')
    print('Alice 重新读一遍再做：')
    alice.cmd('WATCH', 'user:2050')
    a = alice.cmd('HGET', 'user:2050', 'age')
    alice.cmd('MULTI')
    alice.cmd('HSET', 'user:2050', 'age', int(a) + 1)
    alice.cmd('EXEC')
    bob.cmd('HGET', 'user:2050', 'age')
    alice.cmd('HSET', 'user:2050', 'age', 42, show=False)

    section('没有回滚：EXEC 里有一条执行时出错，前面那条照样生效')
    alice.cmd('MULTI')
    alice.cmd('HSET', 'user:2050', 'age', 43)
    alice.cmd('HINCRBY', 'user:2050', 'name', 1)
    alice.cmd('EXEC')
    bob.cmd('HGETALL', 'user:2050')

    section('命令写错（排队时就发现）：整个事务被丢弃')
    alice.cmd('HSET', 'user:2050', 'age', 42, show=False)
    alice.cmd('MULTI')
    alice.cmd('HSET', 'user:2050', 'age', 43)
    alice.cmd('HSET', 'user:2050')
    alice.cmd('EXEC')
    bob.cmd('HGET', 'user:2050', 'age')

if __name__ == '__main__':
    main()
