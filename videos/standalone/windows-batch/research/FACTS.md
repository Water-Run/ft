# 事实清单

本片旁白与画面中的每一项事实陈述，及其出处。画面上出现的终端回显、数字、引文，必须与这里逐字一致；这里没有的事实不能出现在片中。

出处的可靠程度从高到低：亲手实验（`lab/`）、源码（`src/`）、官方文档与官方博客、其他。取证日期 2026-10-01。

## 来源

| 代号 | 来源 | 位置 |
|---|---|---|
| S1 | MS-DOS 1.25 的 `COMMAND.ASM`（COMMAND version 1.17），微软 2018 年以 MIT 许可公开 | `src/v1.25_source_COMMAND.ASM`；取自 github.com/microsoft/MS-DOS |
| S2 | MS-DOS 2.0 的 COMMAND 源码（`TDATA.ASM` 等） | `src/v2.0_source_*.ASM`；同上 |
| L1 | 在 Windows 11（10.0.26220，cmd.exe 文件版本 10.0.26100.8875）上的实验 | `lab/run_lab.ps1`、`lab/lab_output.txt`；`lab/run_lab2.ps1`、`lab/lab_output2.txt`；脚本原件 `lab/bat/` |
| L2 | 在 Windows Server 2008 SP2（6.0.6003）上用同一组脚本重做的实验 | `lab/lab_output_win2008.txt` |
| L3 | Windows 11 开发机上 `.bat` / `.cmd` 文件的数量统计（C:、D: 两个盘） | `lab/count_bat.ps1`、`lab/count_bat_output.txt`、`lab/count_bat2.ps1`、`lab/count_bat2_output.txt` |
| D1 | `set /?` 的帮助原文（Windows 11） | `lab/lab_output.txt` 末尾一节 |
| W1 | OS/2 Museum，《DOS 1.0 and 1.1》 | os2museum.com/wp/dos/dos-1-0-and-1-1/ |
| W2 | Wikipedia，Timeline of DOS operating systems | en.wikipedia.org/wiki/Timeline_of_DOS_operating_systems |
| W3 | Wikipedia，Windows 1.0x | en.wikipedia.org/wiki/Windows_1.0x |
| W4 | Wikipedia，Windows NT 3.1 | en.wikipedia.org/wiki/Windows_NT_3.1 |
| W5 | Wikipedia，PowerShell | en.wikipedia.org/wiki/PowerShell |
| M1 | 微软官方博客，Rich Turner（Sr. Program Manager），《Rumors of Cmd's death have been greatly exaggerated》，2017-01-04 | devblogs.microsoft.com/commandline/rumors-of-cmds-death-have-been-greatly-exaggerated/ |
| M2 | 微软 Windows 2000 FAQ「What is delayed environment variable expansion?」（经微软存档博客转录） | learn.microsoft.com/en-us/archive/blogs/msdn/ben/delayed-environment-variable-expansion |
| C1 | StatCounter Global Stats，桌面 Windows 版本份额，2026 年 9 月 | `statcounter/win-version-desktop-CN.csv`、`statcounter/win-version-desktop-ww.csv` |

## 开场

| 句 | 陈述 | 依据 |
|---|---|---|
| o1–o3 | 在 Windows 11 上，内容为一行 `echo hello` 的文本文件改名为 `.bat` 后可以运行 | L1：`hello.bat` 的回显是一个空行、`D:\batlab>echo hello `、`hello` |
| o4 | 批处理文件 1981 年已经存在 | W1：「In August 1981, IBM released its Personal Computer … and DOS 1.0」「DOS 1.0 could … process batch (.BAT) files」 |
| o5 | 比 Windows 的第一个版本早四年 | W3：Windows 1.0 于 1985-11-20 发布。1981-08 → 1985-11，四年零三个月 |

## 01 来历

| 句 | 陈述 | 依据 |
|---|---|---|
| a1 | 1981 年 8 月 IBM 发布 IBM PC | W1 |
| a2 | 随机的操作系统是 PC DOS 1.0 | W1、W2（同时可选的还有 CP/M-86 与 UCSD p-System；片中不展开） |
| a3 | 命令解释器叫 COMMAND.COM | W1、S1 |
| a4 | 批处理文件是逐行写着命令的文本文件，扩展名 `.BAT` | W1；S1 第 135 行 `BATFCB DB 1,"AUTOEXECBAT"` |
| a5 | 解释器逐条读入并执行 | S1 `READBAT` / `RDBAT` 一段（第 722–745 行附近） |
| a6 | 当时为批处理准备的命令是 REM（注释）和 PAUSE（暂停） | W1：DOS 1.0 的 COMMAND.COM 只有七条内部命令「DIR, COPY, ERASE, PAUSE, REM, RENAME, and TYPE」；S1 命令表中有 `"REM"`、`"PAUSE"` |
| a7 | 条件判断与循环（IF、FOR、GOTO）以及 ECHO、SHIFT 是 1983 年的 DOS 2.0 加入的 | W2：MS-DOS 2.0（1983 年 3 月）「New batch file commands are ECHO, FOR, GOTO, IF and SHIFT」；S2 `TDATA.ASM` 命令表中有 `"ECHO"`、`"GOTO"`、`"SHIFT"`、`"IF"`、`"FOR"`，S1 中没有 |

画面可用的原文（S1，IBM 版）：提示符是盘符加 `>`（`SYM EQU ">"`），每次提示符之前先输出一个换行（`CALL CRLF2`）；`PAUSE` 的提示语是 `Strike a key when ready . . . `。

早期 DOS 的屏幕内容没有实机可拍，凡是出现 `A>` 提示符的终端画面都是按 S1 源码行为重建的，画面上必须标注「示意」。可用的重建内容（批处理文件 `DEMO.BAT` 有两行：`REM CHANGE DISK IN B:`、`PAUSE`）：

```

A>DEMO

A>REM CHANGE DISK IN B:

A>PAUSE
Strike a key when ready . . . 
```

## 02 回显

| 句 | 陈述 | 依据 |
|---|---|---|
| b1–b2 | 今天的 cmd.exe 在执行批处理里的每条命令之前，会先把这条命令显示一遍 | L1：`echo_on.bat`（只有一行 `echo hello`）输出空行、`D:\batlab>echo hello `、`hello` |
| b3 | 早期 DOS 把读入的批处理行原样输出到屏幕 | S1 第 737–740 行：`SAVBATBYT:` / `STOSB` / `CALL OUT ;Display batched command line` |
| b4 | 批处理做的事是替人逐条输入命令 | 对 b3、a5 的归纳，不是引文 |
| b5 | 批处理的第一行常常是 `@echo off`，用来关闭回显 | L1：`echo_off.bat`（`@echo off`、`echo hello`）只输出 `hello`。ECHO 命令是 DOS 2.0 加入的（见 a7） |

片中不提 `@` 前缀是哪个版本加入的（未取证）。

## 03 逐行读盘

| 句 | 陈述 | 依据 |
|---|---|---|
| c1–c2 | 早期 DOS 不把脚本整个读进内存，每执行一条命令都重新打开批处理文件，再读下一行 | S1 `READBAT:`：`MOV DX,OFFSET RESGROUP:BATFCB` / `MOV AH,OPEN` / `INT 33 ;Make sure batch file still exists`，随后 `GETBATBYT` 逐字节读（「Get one more byte from batch file」） |
| c3 | 打不开文件时提示「Insert disk with batch file」 | S1 第 132 行 `NEEDBAT DB 13,10,"Insert disk with batch file$"`，由 `PROMPTBAT` 在 OPEN 失败时输出，随后输出 `and strike any key when ready` |
| c4 | 原因是软盘可能已被换掉 | 对 c3 的解释：这条提示语本身就是请用户把带有批处理文件的盘插回去。W1：DOS 1.0 用 160 KB 的软盘 |
| c5 | 今天的 cmd.exe 仍然执行一条、读一条 | L1：见 c6–c7 |
| c6–c7 | 脚本在运行途中往自己末尾追加一行，追加的这一行随后也被执行 | L1：`selfmod.bat` 四行，输出 `1`、`2`、`3 `；运行后文件多出第五行 `echo 3 `。另有 `rewrite.bat`：运行途中把还没执行到的 `echo C` 改成 `echo X`，输出 `A`、`X` |

`selfmod.bat` 原文（`lab/bat/selfmod.bat`）：

```
@echo off
echo 1
echo echo 3 >> selfmod.bat
echo 2
```

## 04 读入即替换

| 句 | 陈述 | 依据 |
|---|---|---|
| d1 | `%变量%` 在语句被读入时替换成值，而不是在执行时 | D1：「the current expansion which happens when a line of text is read, not when it is executed」 |
| d2 | 括号里的整个代码块算作一条语句 | D1：「…substituted when the first IF statement is read, since it logically includes the body of the IF, which is a compound statement」 |
| d3 | 块里先 `set n=2` 再 `echo %n%`，输出的是 1 | L1：`expand6.bat` 输出 `1`。`expand_echo_on.bat`（不关回显）的回显里，这个块被显示成 `set n=2` / `echo 1`：`%n%` 在读入时已经变成了 `1` |
| d4 | 读入这个块时 n 还是 1 | 同上 |
| d5 | Windows 2000 加入延迟展开，变量改用感叹号 | M2：「Windows 2000 supports delayed environment variable expansion … you can use the ! instead of the %」。L1：`delayed.bat` 输出 `2` |
| d6 | 延迟展开默认关闭 | D1：「This support is always disabled by default」 |

`expand6.bat` 原文与输出：

```
@echo off
set n=1
(
  set n=2
  echo %n%
)
```
输出：`1`

`delayed.bat` 原文与输出：

```
@echo off
setlocal enabledelayedexpansion
set n=1
(
  set n=2
  echo !n!
)
```
输出：`2`

## 05 今天

| 句 | 陈述 | 依据 |
|---|---|---|
| e1 | 1993 年 Windows NT 带来了 cmd.exe | W4：Windows NT 3.1 于 1993 年 7 月发布；「a new 32-bit command-line processor, called CMD.EXE was included which was compatible with MS-DOS 5.0」 |
| e2 | 2006 年 PowerShell 发布 | W5：PowerShell 1.0 于 2006-11-14 发布 |
| e3 | 批处理没有被 PowerShell 取代 | 由 e4–e10 支撑 |
| e4 | 这台 Windows 11 开发机上有 3164 个批处理文件 | L3 第二次统计（2026-10-01）：C:、D: 两个盘上 `.bat` 与 `.cmd` 共 3164 个。第一次统计（约八分钟前）为 3157 个，差值来自机器上文件的增减；片中用第二次的数 |
| e5 | 其中近六成是 npm 为命令行工具生成的入口 | L3：`node_modules\.bin\*.cmd` 1812 个，全局前缀目录下 `*.cmd` 12 个，合计 1824 个，占 57.6%。这类文件由 npm 安装带命令行入口的包时生成，开头是 `@ECHO off` |
| e6 | 中国约 4% 的桌面 Windows 是 Windows 7 | C1：2026 年 9 月，中国，Win11 53.89%、Win10 41.14%、Win7 4.45%、WinXP 0.35%。同期全球 Win7 为 0.55%。StatCounter 按网页访问量统计，不联网的机器不在其中 |
| e7 | 同一个脚本在 2008 年的系统上输出完全相同 | L2：Windows Server 2008 SP2（6.0.6003）上，`echo_on` / `echo_off` / `selfmod` / `expand` / `expand_echo_on` / `delayed` 六个脚本的输出与 L1 逐行相同（提示符里的盘符与目录不同） |
| e8 | 那台机器上的 PowerShell 是 1.0 版 | L2：`$host.Version` 为 `1.0.0.0`，`$PSVersionTable` 未定义（该变量自 2.0 起才有）。对照：Windows 11 自带 Windows PowerShell 5.1，另装有 PowerShell 7.6.6 |
| e9 | 2017 年微软说明 cmd 不会从 Windows 中移除 | M1：「The Windows Cmd / Command-Line shell is NOT being removed from Windows in the near or distant future!」 |
| e10 | 构建和测试 Windows 的系统本身是大量 cmd 脚本 | M1：「Much of the automated system that builds and tests Windows itself is a collection of many Cmd scripts that have been created over many years」 |

L3 中可上画面的其他数字：`activate.bat`（Python 虚拟环境）86 个，`gradlew.bat`（Gradle Wrapper）8 个，`vcvarsall.bat`（Visual Studio）2 个，`C:\Windows` 目录下 55 个；文件名出现最多的有 `tsc.cmd`（78）、`vite.cmd`（46）、`eslint.cmd`（24）、`npm.cmd`（15）。统计记录里不含目录结构，画面上也不要出现任何本机路径、主机名或用户名（实验目录 `D:\batlab` 除外）。

## 结尾

| 句 | 陈述 | 依据 |
|---|---|---|
| f1 | 四十五年 | 1981 → 2026 |
| f2 | 为软盘时代设计 | c3、c4；W1（160 KB 软盘） |
| f3 | 仍能在最新的 Windows 上双击运行 | L1（Windows 11，10.0.26220） |

## 片中没有采用的说法

以下内容没有取证，不要写进画面或旁白：`@` 前缀与 `CALL` 命令的加入版本；CP/M 的 SUBMIT 与批处理的渊源；OS/2 上的 cmd.exe；「cmd 处于维护模式」的原话；PowerShell 取代 Win+X 菜单里的命令提示符；任何关于「多少人习惯用 cmd」的数字；Windows 7 的用户数或装机量的绝对数字。

画面里的强调色（琥珀）是设计用色，不表示 IBM PC 的显示器颜色。

## 复核

成片之后逐句、逐画面对照上面的表复核。方法：`node tools/look.js --cue <句号>` 看每一句说完那一刻画面上的每一段文字，
`node tools/scan.js` 的逐句清单（全片 45 句，本文件存档于 `out/scan_full.txt`）通读一遍，
再用脚本把画面上的关键字符串与本文档逐字比对（终端回显、代码、数字、年份、版本号、引文、出处）。

| 句号 | 核对了哪些文字 | 结果 |
|---|---|---|
| o1 | `新建文本文档.txt` | 一致（L1 的文件名） |
| o2 | `echo hello`、`hello.bat` | 一致（L1 的文件内容与改名后的文件名） |
| o3 | `D:\batlab>echo hello`、`hello`、`实测：Windows 11（10.0.26220）` | 一致（L1：空行 + 回显 + 输出） |
| o4 | `1981` | 一致（W1：1981 年 8 月） |
| o5 | `1985`、`Windows 1.0`、`4 年`、`1981 年 8 月 — 1985 年 11 月` | 一致（W3：1985-11-20 发布；「4 年」与旁白「还早四年」一致，注脚给出精确月份） |
| oT | `古代来的`、`Shell`、`Windows 批处理（.bat）`、像素 `A>` | 一致（片名；`A>` 是 S1 里 `SYM EQU ">"` 的盘符提示符） |
| a1 | `1981`、`IBM PC`、`1981 年 8 月` | 一致（W1） |
| a2 | `PC DOS 1.0` | 一致（W1、W2） |
| a3 | `COMMAND.COM 的屏幕（示意）`、`A>` | 一致（W1、S1；屏幕标「示意」） |
| a4 | `DEMO.BAT`、`REM CHANGE DISK IN B:`、`PAUSE` | 一致（S1；文件名与两行代码） |
| a5 | `A>DEMO`、`A>REM CHANGE DISK IN B:`、`A>PAUSE`、`Strike a key when ready . . . `、`批处理` | 一致（与本文档「画面可用的重建内容」逐字相同；含行间空行） |
| a6 | `注释`、`暂停`、`REM`、`PAUSE` | 一致（W1：DOS 1.0 的七条内部命令含 REM、PAUSE） |
| a7 | `1983`、`DOS 2.0`、`MS-DOS 2.0 · 1983 年 3 月`、`ECHO` `IF` `FOR` `GOTO` `SHIFT` | 一致（W2、S2） |
| b1 | `echo_on.bat`、`echo hello`、`Windows 11 · cmd.exe`、`实测：Windows 11（10.0.26220）` | 一致（L1） |
| b2 | `D:\batlab>echo hello`、`hello`、`回显`、`输出` | 一致（L1；「回显」「输出」是机制图的标注，不是回显内容） |
| b3 | `MS-DOS 1.25 · COMMAND.ASM`、`SAVBATBYT:`、`STOSB`、`CALL    OUT             ;Display batched command line` | 一致（S1 第 737–739 行原文，缩进与空格照抄） |
| b4 | `替人敲命令` | 一致（对 b3、a5 的归纳，本文档已注明不是引文） |
| b5 | `echo_off.bat`、`@echo off`、`echo hello`、`hello` | 一致（L1：只输出 `hello`；文件内容与 `lab/bat/echo_off.bat` 相同） |
| c1 | `DEMO.BAT` | 一致（S1） |
| c2 | `INT 33 ;Make sure batch file still exists`、`MS-DOS 1.25 · COMMAND.ASM`、两轮回显 | 一致（S1 第 725 行注释原文，按分镜写成一行） |
| c3 | `Insert disk with batch file`、`and strike any key when ready` | 一致（S1 第 132 行 `NEEDBAT` 与 `PROMPTBAT` 的输出） |
| c4 | `160 KB 软盘` | 一致（W1：DOS 1.0 用 160 KB 软盘） |
| c5 | `selfmod.bat`、`执行一条，读一条`、`D:\batlab>selfmod.bat` | 一致（L1） |
| c6 | `echo echo 3 >> selfmod.bat`、`运行途中追加`、第 5 行 `echo 3` | 一致（L1：运行后文件多出第五行） |
| c7 | 屏幕 `1` `2` `3`、`实测：Windows 11（10.0.26220）` | 一致（L1：追加的那一行随后也被执行） |
| d1 | `expand6.bat` 六行、`%n%`、`D:\batlab>expand6.bat` | 一致（D1、L1；文件内容照抄本文档） |
| d2 | `一条语句`、括号块四行 | 一致（D1：「is a compound statement」） |
| d3 | 「读入后的样子」四行含 `echo 1`、屏幕输出 `1` | 一致（L1：`expand6.bat` 输出 1；`expand_echo_on.bat` 的回显里块被显示成 `echo 1`） |
| d4 | `读入时 n = 1` | 一致（D1、L1：读入这个块时 n 还是 1） |
| d5 | `delayed.bat` 七行、`!n!`、屏幕输出 `2`、`Windows 2000：延迟展开` | 一致（M2、L1） |
| d6 | `默认关闭`、`This support is always disabled by default`、`set /?，Windows 11` | 一致（D1 原文） |
| e1 | `1981`、`1993`、`Windows NT 3.1`、`cmd.exe`、`1993 年 7 月` | 一致（W4） |
| e2 | `2006`、`PowerShell 1.0`、`2006 年 11 月` | 一致（W5） |
| e3 | `2026`、琥珀条与墨色条都延伸到 2026 | 一致（时间轴是设计图形，不是数据） |
| e4 | `3164`、`一台 Windows 11 开发机 · .bat 与 .cmd`、`2026-10-01 实测`、`个批处理文件` | 一致（L3 第二次统计） |
| e5 | `npm 生成的入口 1824 · 57.6%`、`其余 1340`、`tsc.cmd` `vite.cmd` `eslint.cmd` `npm.cmd`、`activate.bat · gradlew.bat · vcvarsall.bat` | 一致（L3；1340 = 3164 − 1824） |
| e6 | `4.45%`、`Windows 7`、`Windows 11 53.89%`、`Windows 10 41.14%`、`Windows 7 4.45%`、`StatCounter · 2026 年 9 月 · 中国 · 桌面 Windows 版本份额（按网页访问量）` | 一致（C1；口径「按网页访问量」未省） |
| e7 | `Windows Server 2008 · 6.0.6003`、`Windows 11 · 10.0.26220`、两边各三行 `1` `2` `3`、`同一个脚本，同样的输出` | 一致（L2；为不出现 `C:\batlab` 以外的路径，两边只显示输出，不显示提示符行） |
| e8 | `PowerShell 1.0`、`PowerShell 5.1 / 7.6` | 一致（L2：`$host.Version` 为 1.0.0.0；L1 机器自带 5.1、另装 7.6.6） |
| e9 | `不会移除`、`The Windows Cmd / Command-Line shell is NOT being removed from Windows in the near or distant future!`、`微软官方博客 · Rich Turner · 2017-01-04` | 一致（M1 原文，未改一字） |
| e10 | `Much of the automated system that builds and tests Windows itself is a collection of many Cmd scripts`、`Cmd scripts` | 一致（M1 原文） |
| f1 | `1981`、`2026`、`45`、`年` | 一致（1981 → 2026，四十五年） |
| f2 | `软盘`、`为软盘时代设计`、软盘图形 | 一致（c3、c4、W1） |
| f3 | `hello.bat`、`echo hello`、`Windows 11 · cmd.exe`、`hello` | 一致（L1；与开场同一组画面） |
| fT | `古代来的`、`Shell`、`Windows 批处理（.bat）`、`A>`、`旁白为合成语音` | 一致（片尾说明不是事实陈述） |

其他核对：

1. **画面文字是否都出自本文档**：脚本里写死的字符串共 70 余条，逐条与本文档比对，没有发现本文档没有的事实。两处补充说明：
   - 时间轴上的 `4 年` 与旁白「还早四年」一致，旁注 `1981 年 8 月 — 1985 年 11 月` 给出本文档里的两个日期；
   - `其余 1340` 是 `3164 − 1824`，`个批处理文件`、`一台 Windows 11 开发机`、「回显」「输出」「一条语句」等是画面上的功能标注，不对应新的事实。
2. **早期 DOS 的终端画面**：s1 站点一、s1 站点二、s3 站点一的三块「当年」屏幕，`.hd` 都是 `COMMAND.COM 的屏幕（示意）`。s2 站点二的 `MS-DOS 1.25 · COMMAND.ASM` 面板是**源码清单**（有汇编缩进、不是屏幕回显），按 `brief/04-storyboard.md` 的要求标出处、不标「示意」。
3. **本机信息**：画面与封面里出现的路径只有 `D:\batlab`（L1 的实验目录，本文档允许）。2008 那台机器只显示输出 `1` `2` `3`，未显示 `C:\batlab` 之类的路径。没有主机名、用户名、IP。封面与片尾只有片名与两行说明。
4. **未发现偏差**：本轮复核没有发现需要更正的事实错误；`research/` 下的原始回显与源码未做任何修改。
