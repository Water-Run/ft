// 旁白脚本：每个 cue = [句号, 字幕, {tts, gap, pause}]
// - 字幕里 *词* 表示强调；tts 缺省时由字幕按 SAY 表换成读法（字幕写正式拼写，读法只放在 SAY 表或 tts 字段）
// - gap：该句结束到下一句开始的停顿（秒，缺省 0.3）；pause：无旁白的纯画面停顿（标题、转场）
// - 每章一个 scene：chap [编号, 标题]（null 表示没有章节卡）、lead 章节卡时长、tail 章末留白
// 语言：浏览器取 ?lang=，Node 取环境变量 VLANG；缺省为 zh。浏览器与 Node 共用本文件（工具读它排时间线）。
// 翻译以中文为底本：先定中文，再译其他语言；各语言的句号一一对应，时间轴各自排布。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh) => zh;            // 画面里的文字：tr('中文', 'English')

  // 中文稿 R8（2026-10-10，按策划者 2026-10-10 的意见重组，待审）。标题：一个数据库引擎是如何实现的？——事务性与现代化：InnoDB。
  // 定位：与第一集同一系列——「一个引擎怎样实现」。主线：MyISAM 的局限引出事务性 → 讲清事务性（约 4.5 分钟）→ InnoDB 怎样实现（约 9 分钟，
  //       沿「怎么放、怎么找、怎么改、锁、出错怎么办」展开，各章对照上一期 MyISAM 的做法）→ 回到三条局限。目标约 15 分钟，片尾只有画面名单、不配音。
  // 写法：每个术语第一次出现就用一句话讲清是什么、为什么需要；演示环境只在 y6 交代一次，正文不再说「本实验」。不涉及其他数据库。
  // 行尾编号是该句的依据：I 为 research/FACTS.md 的事实；D 为手册原文（research/_src/manual）；W 为 9.7 手册术语表原文（research/_src/web/glossary.html）；
  // G81、GLPT75、ARIES92、BG83、B95、T98、ACM 为事务史文献（见 FACTS I27–I32、I40 与核查表）；B95T1 为 1995 年论文的表 1；
  // C 为同版源码；B 为 research/lab/out_03_pages.json；P 为 research/lab/out_01_probe.txt 与恢复日志；M 为第一集脚本或 FACTS；示意 为未实测的概念图；「—」为叙述衔接。
  const RAW = [
    {
      id: 'intro', chap: null, lead: 1.2, tail: 0.9,
      cues: [
        ['i1', '上一期我们讲到 MyISAM：一张表', { gap: 0.3 }], // M s2 b5 b6
        ['i1b', '数据和索引各占一个文件', { gap: 0.4 }], // M s2 b5 b6
        ['i2', '索引是一棵 B 树，叶子里存的是行在数据文件里的位置', { gap: 0.5 }], // M s6 f14
        ['i3', '它很简单，也有三条局限', { gap: 0.4 }], // M s9 s10
        ['i4', '第一，没有事务：一组修改，不能整体撤销', { gap: 0.4 }], // M s9 m11
        ['i5', '第二，并发靠一把表锁：写入一多，整张表就成了瓶颈', { gap: 0.4 }], // M s8 k2 k9
        ['i6', '第三，没有日志：崩溃之后，只能检查和修复', { gap: 0.5 }], // M s9 m8–m10
      ],
    },
    {
      id: 's01', chap: ['01', '从 MyISAM 到 InnoDB'], lead: 2.6, tail: 0.7,
      cues: [
        ['y1', '这一期的主角，是 InnoDB', { gap: 0.3 }], // —
        ['y1b', '它和 MyISAM 一样，是 MySQL 的存储引擎', { gap: 0.3 }], // M s1 a4
        ['y1c', '也就是负责把数据写进磁盘、再读出来的那一层', { gap: 0.4 }], // M s1 a3
        ['y2', '它最早由芬兰的 Innobase 公司开发', { gap: 0.3 }], // I24
        ['y3', '2005 年 10 月，Oracle 宣布收购 Innobase', { gap: 0.3 }], // I24 O
        ['y5', '2010 年 7 月，从 MySQL 5.5.5 起', { gap: 0.3 }], // I39
        ['y5b', '它取代 MyISAM，成为默认的存储引擎', { gap: 0.4 }], // I39
        ['y6', '本期演示用的是 MySQL 9.7.2', { gap: 0.4 }], // I00 P environment
        ['y7', '它和 MyISAM 最根本的不同，是支持事务', { gap: 0.4 }], // I01 P engines
        ['y8', '所以先讲清什么是事务，再看 InnoDB 怎样把它做出来', { gap: 0.7 }], // —
      ],
    },
    {
      id: 's02', chap: ['02', '什么是事务'], lead: 2.6, tail: 0.7,
      cues: [
        ['t1', '还是上一期的两张表：users 和 notes', { gap: 0.3 }], // I00
        ['t2', '把 alice 的年龄改成 31', { gap: 0.3 }], // I06 P rollback
        ['t2b', '同时把 notes 的第 1 行改成 birthday', { gap: 0.4 }], // I06 P rollback
        ['t3', '这两处应该一起生效', { gap: 0.3 }], // —
        ['t3b', '改了一处、漏了另一处，数据就停在一半', { gap: 0.4 }], // —
        ['t4', '事务，就是把一组修改当成一个整体', { gap: 0.3 }], // G81
        ['t5', '全部完成，叫提交', { gap: 0.3 }], // G81 D12
        ['t5b', '中途放弃，把已经做的全部撤销，叫回滚', { gap: 0.5 }], // G81 D12
        ['t6', '换成上一期的 MyISAM 表，做同样的修改，再回滚', { gap: 0.3 }], // I06 P myisam_control
        ['t7', '年龄仍是 31：MyISAM 只给出 1196 号警告', { gap: 0.3 }], // I06 P
        ['t7b', '说这张表的修改撤不回来', { gap: 0.5 }], // I06 P
        ['t8', '事务的概念，来自 Jim Gray 1981 年的论文', { gap: 0.3 }], // I27 G81
        ['t9', '他把事务看成数据的一次状态变换', { gap: 0.3 }], // G81 摘要
        ['t9b', '归纳出三个性质：原子性、持久性、一致性', { gap: 0.4 }], // G81 摘要
        ['q1', '再加上隔离性，就是常说的 ACID', { gap: 0.4 }], // W ACID
        ['q2', 'A，原子性：提交时全部修改生效，回滚时全部撤销', { gap: 0.3 }], // W ACID
        ['q3', 'C，一致性：几张表同时修改', { gap: 0.3 }], // W ACID
        ['q3b', '查询只会看到全旧或全新，不会看到一半', { gap: 0.3 }], // W ACID
        ['q4', 'I，隔离性：同时进行的事务互不干扰', { gap: 0.3 }], // W ACID
        ['q4b', '看不到对方还没提交的数据', { gap: 0.3 }], // W ACID
        ['q5', 'D，持久性：按手册的说法', { gap: 0.3 }], // W ACID
        ['q5b', '提交成功之后，修改不怕崩溃与断电', { gap: 0.4 }], // W ACID
        ['q7', '1998 年，Gray 因数据库与事务处理的研究获得图灵奖', { gap: 0.7 }], // I27 T98
      ],
    },
    {
      id: 's03', chap: ['03', '并发：锁与版本'], lead: 2.6, tail: 0.7,
      cues: [
        ['l1', '要做到这几条，难在两件事：并发，和崩溃', { gap: 0.3 }], // I40 ACM
        ['l1b', '先看并发：许多事务同时读写同一批数据', { gap: 0.3 }], // I40
        ['l2', '最直接的办法是加锁：要用的数据先锁住，别人等你用完', { gap: 0.4 }], // W shared lock exclusive lock
        ['l3', '锁分两种：共享锁，大家可以同时读', { gap: 0.3 }], // W shared lock exclusive lock
        ['l3b', '排他锁，同一时间只有一个人能写', { gap: 0.4 }], // W shared lock exclusive lock
        ['l4', '锁住多大一块，叫锁的粒度', { gap: 0.3 }], // GLPT75 I28
        ['l4b', '可以是整张表，也可以只是其中一行', { gap: 0.4 }], // GLPT75 I28
        ['l5', '1975 年，Gray 等人提出', { gap: 0.3 }], // I28 GLPT75
        ['l5b', '同一个系统里，可以同时用大小不同的锁', { gap: 0.3 }], // I28 GLPT75
        ['l7', '为此还要另加锁模式；InnoDB 的意向锁就是一种', { gap: 0.3 }], // D05
        ['l7b', '锁一行之前，先在表上记一笔「这张表里有行要锁」', { gap: 0.5 }], // D05
        ['l8', '锁的代价是等待：别人正在写的行，你连读也要等', { gap: 0.5 }], // D05 D04
        ['m1', '另一种思路：写的人改出新版本', { gap: 0.3 }], // W MVCC
        ['m1b', '读的人先读旧版本，谁也不用等谁', { gap: 0.3 }], // W MVCC
        ['m2', '这叫多版本并发控制，简称 MVCC', { gap: 0.3 }], // W MVCC
        ['m3', '1983 年，Bernstein 与 Goodman', { gap: 0.3 }], // I31 BG83
        ['m3b', '给出了多版本并发控制的正确性理论', { gap: 0.5 }], // I31 BG83
        ['p0', '事务之间能互相看到多少，叫隔离级别', { gap: 0.3 }], // W isolation level
        ['p1', '看到得太多，就会读错；常见的有三种', { gap: 0.4 }], // B95 W
        ['p2', '脏读：读到了别人还没提交的数据，而它随后可能被回滚', { gap: 0.4 }], // W dirty read
        ['p3', '不可重复读：同一个事务里读两次', { gap: 0.3 }], // W non-repeatable read
        ['p3b', '中间别人提交了修改，两次结果不同', { gap: 0.4 }], // W non-repeatable read
        ['p4', '幻读：同一个查询做两次，第二次多出了别人新插入的行', { gap: 0.5 }], // W phantom
        ['p5', '1992 年的 SQL 标准，按这三种现象定出四个隔离级别', { gap: 0.3 }], // B95 D18
        ['p6', '读未提交，三种都可能；读已提交，不会脏读', { gap: 0.3 }], // B95T1
        ['p7', '可重复读，也不会不可重复读，但仍可能幻读', { gap: 0.3 }], // B95T1
        ['p7b', '可串行化，三种都不会', { gap: 0.5 }], // B95T1
        ['p9', '1995 年，Berenson、Gray 等人又定义了快照隔离', { gap: 0.3 }], // I32 B95 §4.2
        ['p9b', '事务读的，是某一时刻已提交数据的快照', { gap: 0.4 }], // I32 B95 §4.2
        ['p10', 'InnoDB 默认的隔离级别是可重复读', { gap: 0.3 }], // D18 D04
        ['p10b', '普通的读用版本，修改用锁', { gap: 0.7 }], // D18 D04
      ],
    },
    {
      id: 's04', chap: ['04', '崩溃：日志'], lead: 2.6, tail: 0.7,
      cues: [
        ['r1', '再看崩溃：原子性和持久性，靠的是日志', { gap: 0.3 }], // G81
        ['r2', 'Gray 在 1981 年的论文里写道', { gap: 0.3 }], // G81
        ['r3', '每个可撤销的动作', { gap: 0.3 }], // G81 原文
        ['r3b', '都要留下一条 undo 记录，用来把它撤销', { gap: 0.3 }], // G81 原文
        ['r4', '每个可重做的动作', { gap: 0.3 }], // G81 原文
        ['r4b', '都要留下一条 redo 记录，用来把它重做', { gap: 0.3 }], // G81 原文
        ['r5', '提交，就是往日志里写一条提交记录', { gap: 0.4 }], // G81 原文
        ['r6', '崩溃之后：已提交的按 redo 重做', { gap: 0.3 }], // G81 I19
        ['r6b', '没提交的按 undo 撤销，数据就回到一致的状态', { gap: 0.5 }], // G81 I19
        ['r7', '1992 年的 ARIES 恢复方法，标题里写着：预写日志', { gap: 0.3 }], // I30 ARIES92
        ['r8', '预写，就是日志写在数据之前', { gap: 0.3 }], // ARIES92 D06（「Logs are written and flushed to disk at each transaction commit」）
        ['r8b', '日志先写到磁盘上，数据可以晚一点写', { gap: 0.5 }], // ARIES92 D06（「Logs are written and flushed to disk at each transaction commit」）
        ['o1', '并发和恢复都做好了，数据库就能同时处理大量短小的事务', { gap: 0.3 }], // W OLTP
        ['o2', '这类负载有个专门的名字：OLTP，联机事务处理', { gap: 0.3 }], // W OLTP
        ['o3', '事务多，读写都频繁，每次只涉及少量数据', { gap: 0.3 }], // W OLTP
        ['o3b', '比如航班订座、银行存款', { gap: 0.4 }], // W OLTP
        ['o4', '手册说：凭行级锁和事务', { gap: 0.3 }], // W OLTP
        ['o4b', 'InnoDB 是 MySQL 里做 OLTP 的理想引擎', { gap: 0.4 }], // W OLTP
        ['o5', '下面看 InnoDB 具体怎么做', { gap: 0.7 }], // —
      ],
    },
    {
      id: 's05', chap: ['05', '数据怎么放'], lead: 2.6, tail: 0.7,
      cues: [
        ['a1', '上一期的第一个问题：数据怎么放', { gap: 0.4 }], // M s10 n3
        ['a2', 'MyISAM 把数据和索引分成两个文件', { gap: 0.3 }], // M s2 D11 I02
        ['a2b', 'InnoDB 默认每张表一个 .ibd 文件，两样都在里面', { gap: 0.4 }], // M s2 D11 I02
        ['a3', '文件被切成一页一页，每页 16 KiB', { gap: 0.3 }], // I02
        ['a4', '页是 InnoDB 读写磁盘的单位', { gap: 0.3 }], // W page
        ['a4b', '从磁盘搬进内存，一次就是一整页', { gap: 0.4 }], // W page
        ['a5', 'users.ibd 一共八页：前几页记着这个文件自身的信息', { gap: 0.3 }], // I02 B C fil0fil.h
        ['a6', '第 4、5 页是索引，最后两页还空着', { gap: 0.5 }], // I03 I05 B
        ['a7', '在 InnoDB 里，表本身就是主键索引', { gap: 0.3 }], // D01 W clustered index
        ['a7x', '也就是一棵按主键排好序的 B 树', { gap: 0.3 }], // D01 W clustered index
        ['a7c', '数据按顺序存在最底层的叶子页里，上面几层只记路标', { gap: 0.3 }], // D02 D01
        ['a7d', '查找时从根页开始，一层层往下，走到叶子', { gap: 0.4 }], // D02
        ['a7b', '表要是没有主键，就用第一个列都不为空的唯一索引', { gap: 0.3 }], // D01
        ['a7bb', '连这个也没有，就自己加一列隐藏的行号', { gap: 0.4 }], // D01
        ['a8', '和上一期不同：叶子里放的不是行的位置，而是整行数据', { gap: 0.3 }], // D01 M s6 f14
        ['a9', '所以按主键找到叶子，数据就拿到了，不必再去别处读', { gap: 0.4 }], // D01
        ['a10', 'users 只有八行，一页就放得下', { gap: 0.3 }], // I03
        ['a10b', '这棵树只有一层，根就是叶子', { gap: 0.4 }], // I03
        ['a11', '行多了，一页放不下，树就会长出更多层（示意）', { gap: 0.5 }], // D02 示意
        ['a12', '打开叶子，看 alice 这一行：一共 33 字节', { gap: 0.3 }], // I04
        ['a13', '三个列占 15 字节：id、名字和年龄', { gap: 0.3 }], // I04
        ['a14', '前面是 5 字节的记录头，记着下一条记录在哪里', { gap: 0.3 }], // I33 C rem0rec.ic
        ['a14b', '页里的记录就这样按主键连成一条链', { gap: 0.5 }], // I33 B
        ['a16', '剩下 13 字节，是 InnoDB 自己加的两个隐藏字段', { gap: 0.3 }], // D03 I04
        ['a17', '每个修改数据的事务都有一个编号，叫事务号', { gap: 0.3 }], // D03
        ['a17b', '第一个隐藏字段，记着最后修改这一行的事务号', { gap: 0.3 }], // D03 I16
        ['a18', '第二个是回滚指针：指向这一行改动之前的旧内容', { gap: 0.4 }], // D03 I16
        ['a20', '这两个字段，是后面回滚和多版本的关键', { gap: 0.7 }], // —
      ],
    },
    {
      id: 's06', chap: ['06', '怎么找'], lead: 2.6, tail: 0.7,
      cues: [
        ['b1', '上一期的第二个问题：怎么找', { gap: 0.4 }], // M s10 n4
        ['b2', '不管找什么，都要先把页读进内存', { gap: 0.3 }], // W page
        ['b3', 'InnoDB 在内存里留了一块缓冲池，存放读过的页', { gap: 0.3 }], // W buffer pool D09
        ['b4', '下次再用到同一页，直接在内存里取，不必再读磁盘', { gap: 0.4 }], // W buffer pool
        ['b5', '缓冲池满了，就淘汰很久没用的页', { gap: 0.3 }], // D09 W
        ['b6', '新读进来的页先放在中间；再被用到，才挪到前面', { gap: 0.3 }], // D09（midpoint insertion）
        ['b7', '这样，常用的页留在前面，不容易被挤走', { gap: 0.5 }], // D09（keeps frequently used pages in the new sublist）
        ['d1', '按主键找 id 为 3 的行：从根页开始', { gap: 0.3 }], // D01 I03
        ['d1b', '这一页在缓冲池里，就直接用；不在，先从磁盘读进来', { gap: 0.3 }], // W buffer pool D09
        ['d1c', '在页里按主键找到 3；users 的根就是叶子，整行就在这里', { gap: 0.5 }], // I03 D01
        ['d2', '按名字找，要用另一棵树：建在名字上的索引，叫二级索引', { gap: 0.3 }], // D01
        ['d3', '它的叶子里只有两样：名字，和这一行的主键', { gap: 0.4 }], // D01 I05 B
        ['d4', '查 carol 的年龄', { gap: 0.3 }], // I05 P secondary_lookup
        ['d4b', '先在二级索引里找到 carol，得到主键 3', { gap: 0.3 }], // I05 P secondary_lookup
        ['d5', '再拿 3 回到主键树，取出整行：年龄 41', { gap: 0.4 }], // I05 P
        ['d6', '上一期，MyISAM 的索引存的是行的位置', { gap: 0.3 }], // M s6 f14 D01
        ['d6b', 'InnoDB 的二级索引存的是主键', { gap: 0.3 }], // M s6 f14 D01
        ['d7', '所以按二级索引找，要多走一次主键树', { gap: 0.7 }], // D01
      ],
    },
    {
      id: 's07', chap: ['07', '怎么改：回滚与版本'], lead: 2.6, tail: 0.7,
      cues: [
        ['e1', '上一期的第三个问题是怎么并发；先看 InnoDB 怎么改数据', { gap: 0.4 }], // M s10 n5
        ['e2', '改数据时要照顾两件事：能回滚，也不挡住别人读', { gap: 0.4 }], // D03
        ['e3', '把 alice 的年龄改成 31：新值直接写在原来的位置', { gap: 0.3 }], // D03
        ['e4', '改之前的 30，写进 undo 日志', { gap: 0.3 }], // D03 D08
        ['e5', '行里的回滚指针，指向这条 undo 记录', { gap: 0.4 }], // D03 I16
        ['e6', '如果事务回滚，就按 undo 记录把 30 写回去', { gap: 0.3 }], // D08
        ['e7', '回滚之后，两张表都回到了 30 和 hello', { gap: 0.5 }], // I06 P rollback
        ['e8', '再看读：修改还没提交，另一个会话来读 alice', { gap: 0.3 }], // I06 P rollback
        ['e8b', '会话，就是一条连到数据库的连接，各自执行自己的事务', { gap: 0.3 }], // —
        ['e9', '它不该看到没提交的 31', { gap: 0.3 }], // W consistent read D04
        ['e9b', '于是顺着回滚指针，从 undo 里取出 30', { gap: 0.4 }], // W consistent read D04
        ['e10', '这叫一致性读：不加锁，读的是某一时刻的数据', { gap: 0.4 }], // W consistent read
        ['e11', '读哪一个版本，由读视图决定', { gap: 0.3 }], // D04 W read view
        ['e12', '读视图记下开始读的那一刻', { gap: 0.3 }], // I07 D04
        ['e12b', '哪些事务还没提交：它们的修改都看不见', { gap: 0.5 }], // I07 D04
        ['e13', '默认的可重复读', { gap: 0.3 }], // I08 W consistent read
        ['e13b', '事务第一次读时建立读视图，之后一直用它', { gap: 0.3 }], // I08 W consistent read
        ['e14', '另一个会话先提交了 31，这个事务第一次读，读到 31', { gap: 0.3 }], // I08 P rr_snapshot
        ['e15', '之后别人再提交 32，它再读，还是 31', { gap: 0.4 }], // I08 P
        ['e16', '要读最新的值、并且不让别人改', { gap: 0.3 }], // I08 D04 D05
        ['e16b', '就用 FOR UPDATE 加锁读：读到 32', { gap: 0.4 }], // I08 D04 D05
        ['e17', '读已提交则每次读都建立新的读视图', { gap: 0.3 }], // I08 D04
        ['e17b', '能读到别人刚提交的值', { gap: 0.4 }], // I08 D04
        ['e18', '同一行，不同的事务看到不同的版本：这就是多版本', { gap: 0.7 }], // W MVCC D03
      ],
    },
    {
      id: 's08', chap: ['08', '锁'], lead: 2.6, tail: 0.7,
      cues: [
        ['f1', '改数据时，防止别人同时改同一行，靠的是锁', { gap: 0.3 }], // M s8 k2 D05
        ['f1b', '上一期的 MyISAM，锁的是整张表', { gap: 0.4 }], // M s8 k2 D05
        ['f2', 'InnoDB 的锁，加在查询访问到的索引记录上', { gap: 0.3 }], // D05 D18
        ['f2b', '行就存在主键索引的叶子里，锁住一条记录，就是锁住一行', { gap: 0.4 }], // D05 W record lock D01
        ['f3', '会话 A 用 FOR UPDATE 读 id 为 1 的行，锁住这一行', { gap: 0.3 }], // I09 P record_locks
        ['f4', '同时，表上多了一把意向锁', { gap: 0.4 }], // I09 D05 P data_locks
        ['f5', '会话 B 改 id 为 2 的行，照常完成', { gap: 0.3 }], // I09 P
        ['f6', '会话 B 改 id 为 1 的行，就得等；等太久，就报超时错误', { gap: 0.5 }], // I09 P（1205）
        ['f7', '按主键查一个值，只锁这一行', { gap: 0.3 }], // I20 D18
        ['f8', '按范围查，除了锁住行', { gap: 0.3 }], // W gap lock D05
        ['f8b', '还要锁住行与行之间的空隙，叫间隙锁', { gap: 0.4 }], // W gap lock D05
        ['f9', '会话 A 加锁查询 id 大于 10、小于 30 的行：只有 20', { gap: 0.3 }], // I10 P gap_locks
        ['f10', '锁住的有：20 这一行和它前面的空隙', { gap: 0.3 }], // I10 P
        ['f10b', '还有 30 前面的空隙', { gap: 0.4 }], // I10 P
        ['f11', '会话 B 想插入 15，正好落在被锁的空隙里，只能等', { gap: 0.3 }], // I10 P
        ['f12', '要是让它插进来，会话 A 再查一次', { gap: 0.3 }], // W phantom gap lock
        ['f12b', '就会多出 15：这就是幻读', { gap: 0.3 }], // W phantom gap lock
        ['f13', '间隙锁挡住了幻读', { gap: 0.3 }], // D05 I10 D12
        ['f13b', '会话 A 一回滚，锁就释放，15 插入成功', { gap: 0.5 }], // D05 I10 D12
        ['f14', '锁多了，还会有死锁', { gap: 0.3 }], // W deadlock I11
        ['f14b', '两个事务各锁住一行，又去等对方那一行', { gap: 0.3 }], // W deadlock I11
        ['f15', 'InnoDB 发现死锁，就回滚其中一个，让另一个继续', { gap: 0.3 }], // I11 D13
        ['f16', '被回滚的那个收到死锁错误，由应用重新执行', { gap: 0.7 }], // I11 D13（1213）
      ],
    },
    {
      id: 's09', chap: ['09', '出错怎么办：日志与恢复'], lead: 2.6, tail: 0.8,
      cues: [
        ['g1', '上一期的第四个问题：出错怎么办', { gap: 0.3 }], // M s10 n6 s9
        ['g1b', 'MyISAM 只能事后检查和修复', { gap: 0.4 }], // M s10 n6 s9
        ['g2', 'InnoDB 改数据，先改的是缓冲池里的页', { gap: 0.3 }], // I12 D09
        ['g3', '改过、还没写回磁盘的页，叫脏页', { gap: 0.3 }], // W dirty page I12
        ['g3b', '它什么时候写回，另有安排', { gap: 0.4 }], // W dirty page I12
        ['g4', '那提交之后马上崩溃，修改不就丢了？', { gap: 0.4 }], // —
        ['g5', '所以 InnoDB 先把修改记进 redo 日志', { gap: 0.3 }], // W redo log I13
        ['g5b', '记的是数据被改成了什么，不是 SQL 语句', { gap: 0.4 }], // W redo log I13
        ['g6', '默认设置下，每次提交，redo 日志都写到磁盘上', { gap: 0.3 }], // 参数页（Default Value 1；Logs are written and flushed to disk at each transaction commit）I12
        ['g7', '有了日志，脏页晚一点写回也不怕：崩溃了，按日志补上', { gap: 0.4 }], // I12 I19
        ['g8', '日志一直往后写，每个位置有一个只增不减的编号，叫 LSN', { gap: 0.3 }], // W LSN
        ['g9', '写回的进度，用检查点记下', { gap: 0.3 }], // W checkpoint
        ['g9b', '检查点之前的修改，都已经写进了数据文件', { gap: 0.3 }], // W checkpoint
        ['g10', '所以恢复的时候，从最近的检查点开始', { gap: 0.5 }], // D06 I19
        ['h1', '来看一次崩溃：会话 A 插入 id 为 90 的行，并提交', { gap: 0.3 }], // I14 P crash
        ['h2', '会话 B 插入 id 为 91 的行，还没提交', { gap: 0.3 }], // I14 P
        ['h3', '这时，强行结束 MySQL 的进程', { gap: 0.3 }], // I14 P（SIGKILL）
        ['hT', null, { pause: 1.5 }], // 进程结束的瞬间
        ['h4', '重新启动，InnoDB 发现数据文件落后于日志', { gap: 0.3 }], // I37 P MY-012560 MY-012552
        ['h4b', '开始崩溃恢复', { gap: 0.3 }], // I37 P MY-012560 MY-012552
        ['h5', '先从检查点开始，按 redo 把没写进数据文件的修改补上', { gap: 0.3 }], // I37 P MY-013086 MY-012532
        ['h6', '再按 undo，撤销没有提交的事务', { gap: 0.4 }], // I37 P MY-013023 MY-013014
        ['h7', '结果：90 还在，91 不见了', { gap: 0.3 }], // I14 P crash_recovery
        ['h8', '已提交的保留，没提交的撤销：这正是原子性和持久性', { gap: 0.5 }], // I14 G81
        ['j1', '还有一种情况：一页正写到一半，进程就退出了', { gap: 0.3 }], // D10
        ['j2', '所以 InnoDB 写页要写两次', { gap: 0.3 }], // D10 W doublewrite buffer
        ['j2b', '先写进双写缓冲区，再写到数据文件的原位置', { gap: 0.3 }], // D10 W doublewrite buffer
        ['j3', '即使写到一半中断', { gap: 0.3 }], // D10
        ['j3b', '恢复时也能从双写缓冲区找回一份完好的页', { gap: 0.7 }], // D10
      ],
    },
    {
      id: 's10', chap: ['10', '回到三条局限'], lead: 2.6, tail: 0.8,
      cues: [
        ['w1', '把前面几章连起来，看一次修改从开始到提交（示意）', { gap: 0.3 }], // —
        ['w2', '先给要改的行加锁', { gap: 0.3 }], // D05 I09
        ['w3', '把旧值写进 undo，回滚指针指向它', { gap: 0.3 }], // D03 D08
        ['w4', '在缓冲池里改这一页，它成了脏页', { gap: 0.3 }], // I12 W dirty page
        ['w5', '把这次修改记进 redo', { gap: 0.3 }], // I13 D06
        ['w6', '提交：redo 写到磁盘上，锁随之释放', { gap: 0.3 }], // 参数页 D12
        ['w7', '脏页稍后再写回数据文件', { gap: 0.5 }], // I12
        ['k1', '再回到开头 MyISAM 的三条局限', { gap: 0.4 }], // M
        ['k2', '没有事务：InnoDB 用 undo 实现回滚，用读视图实现隔离', { gap: 0.3 }], // D03 D08 D04
        ['k3', '一把表锁：InnoDB 只锁访问到的行，普通的读不加锁', { gap: 0.3 }], // D05 D04
        ['k4', '没有日志：InnoDB 用 redo 补上没写完的修改', { gap: 0.3 }], // D06 D07
        ['k4b', '用 undo 撤销没提交的', { gap: 0.4 }], // D06 D07
        ['k5', '所以它适合 OLTP 这样的负载', { gap: 0.4 }], // W OLTP
        ['k6', '代价也在：每一行多出 13 字节的隐藏字段', { gap: 0.3 }], // I04 D03
        ['k7', '旧版本要一直留着，直到没有事务再需要它', { gap: 0.3 }], // D03
        ['k8', '锁会带来等待，死锁和超时都要由应用重新执行', { gap: 0.4 }], // D13
        ['k9', '下一集换一个引擎，看同一组问题，有怎样不同的实现', {}], // —
      ],
    },
    {
      id: 'end', chap: null, lead: 0.8, tail: 0.6,
      cues: [
        ['zT', null, { pause: 10.0 }], // 片尾名单（只在画面上，不配音；名单见 FACTS「制作署名」）
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。先用 kit/tools/tts_probe.js 试，再用 asr.js 回听。
  const SAY = {
    zh: [
      [/InnoDB/g, 'Inno D B'],
      [/MyISAM/g, 'My ISAM'],
      [/MySQL/g, 'My S Q L'],
      [/Innobase/g, 'Inno base'],
      [/Bernstein/g, 'Bernstein'],
      [/\bARIES\b/g, 'Aries'],
      [/\bMVCC\b/g, 'M V C C'],
      [/\bOLTP\b/g, 'O L T P'],
      [/\bLSN\b/g, 'L S N'],
      [/\bSDI\b/g, 'S D I'],
      [/\bIX\b/g, 'I X'],
      [/START TRANSACTION/g, 'start transaction'],
      [/CHECK TABLE/g, 'check table'],
      [/FOR UPDATE/g, 'for update'],
      [/\bSELECT\b/g, 'select'],
      [/\bROLLBACK\b/g, 'rollback'],
      [/\bACID\b/g, 'A C I D'],
      [/DB_TRX_ID/g, 'D B trx I D'],
      [/DB_ROLL_PTR/g, 'D B roll P T R'],
      [/idx_name/g, 'idx name'],
      [/\.ibd\b/g, ' 点 I B D'],
      [/\.MYD\b/g, ' 点 M Y D'],
      [/\.MYI\b/g, ' 点 M Y I'],
      [/\bRR\b/g, 'R R'],
      [/\bRC\b/g, 'R C'],
      [/\bid\b/g, 'I D'],
      [/\b1196\b/g, '一一九六'],
      [/\b1205\b/g, '一二零五'],
      [/\b1213\b/g, '一二一三'],
      [/KiB/g, 'K i B'],
      [/SQL/g, 'S Q L'],
      // 多音字换成同音的单音字：数据的「行」读 háng，送去合成时换成同音的「航」；执行、进行、串行、银行不换（回听时「整行」「一行」「行级锁」被读成 xíng）
      [/(?<![执进串银])行/g, '航'],
    ],
    en: [
      [/\bSAY\b/g, 'S A Y'],
    ],
  };
  const strip = (s) => s.replace(/\*/g, '');
  const ttsNorm = (s) => { for (const [re, to] of SAY[LANG] || []) s = s.replace(re, to); return s; };
  const SCRIPT = RAW.map((sc) => ({
    ...sc, chap: sc.chap ? [sc.chap[0], pick(sc.chap[1])] : null,
    cues: sc.cues.map(([id, cap, o = {}]) => [id, pick(cap), { ...o, tts: pick(o.tts), gap: pick(o.gap) }]),
  }));
  const ttsText = (c) => (c[2] && c[2].tts) || ttsNorm(strip(c[1]) + (LANG === 'zh' ? '。' : ''));

  // 没有实测时长时的估算（合成旁白之前的占位）
  const estimate = (text) => (LANG === 'zh' ? 0.35 + text.replace(/[，。：；、\s]/g, '').length / 5.2 : 0.3 + text.split(/\s+/).length / 2.7);

  // 由脚本与实测时长算出整条时间线；浏览器端排动画、Node 端混音与检查都用它
  function layoutScript(DUR) {
    DUR = DUR || {};
    let t = 0;
    const cues = {}, scenes = [], order = [];
    for (const sc of SCRIPT) {
      const s0 = t;
      t += sc.lead || 0;
      const first = t;
      for (const c of sc.cues) {
        const [id, cap, o = {}] = c;
        const meas = DUR[id];
        const d = o.pause != null ? o.pause : (meas ? meas.d : estimate(ttsText(c)));
        cues[id] = { id, scene: sc.id, cap, start: t, end: t + d, d, silent: o.pause != null, tts: o.pause != null ? null : ttsText(c), words: meas ? meas.words : null };
        order.push(id);
        t += d + (o.gap != null ? o.gap : 0.3);
      }
      t += sc.tail || 0.6;
      scenes.push({ id: sc.id, chap: sc.chap, start: s0, first, end: t, lead: sc.lead || 0 });
    }
    return { cues, scenes, order, total: t };
  }

  const api = { SCRIPT, LANG, pick, tr, layoutScript, ttsText, ttsNorm, strip };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { Object.assign(root, api); root.DUR = (root.DUR_ALL || {})[LANG] || {}; }
})(typeof window !== 'undefined' ? window : globalThis);
