# 虚拟机的两条分类轴

取证于 2026-11-18。系统虚拟机看操作系统获得什么样的计算机接口。第一类和第二类描述提供该接口的虚拟机监控器位于哪一层。进程虚拟机看程序获得什么样的执行接口。全片用 Xen、VirtualBox 和 JVM 说明各自的典型架构。

## 取证环境

- Xen 采用项目手册和 Xen 4.16 管理指南描述的典型 Dom0 架构。结构图为原理示意。
- VirtualBox 采用 Oracle VirtualBox 7.2 用户手册描述的常规宿主式架构与 VDI 文件。磁盘写入为文档机制示意。
- JVM 依据 Java SE 21 虚拟机规范。Windows 上用 OpenJDK 27 的 `javac --release 21` 编译自写的 [Add.java](lab/Add.java)，再用 `javap -c` 反汇编并用 `java` 运行。完整命令及结果见 [add.txt](lab/add.txt)。

## 文案与画面依据

| 句号 | 已核对的陈述及边界 | 依据 |
| --- | --- | --- |
| o1–o7 | 一台物理机可以同时支撑多台系统虚拟机。客体操作系统看到虚拟 CPU、内存及设备等整机接口。虚拟机监控器协调使用真实资源。片中从客体操作系统视角看虚拟硬件。 | [Smith 与 Nair，§1.3、§1.4](https://jes.ece.wisc.edu/papers/vm.pdf)；[Oracle VirtualBox 7.2，Virtual Hardware](https://docs.oracle.com/en/virtualization/virtualbox/7.2/user/Introduction.html) |
| x1–x7 | Xen 是第一类监控器，直接运行于硬件。典型配置里，Xen 先启动并启动特权管理域 Dom0。Dom0 通常运行 Linux，承担管理及驱动等职责。普通客体和 Dom0 均在 Xen 上方。图里同时运行的两套 Linux 是可行配置的示意，CPU 调度和内存分配属于 Xen 的职责。 | [Xen 项目手册，What makes Xen different、Domains](https://handbook.xenproject.org/users/introduction.html)；[Xen 4.16 管理指南，Introduction](https://xenbits.xenproject.org/docs/4.16-testing/admin-guide/introduction.html) |
| v1–v6 | VirtualBox 是第二类监控器，需要现成的宿主操作系统。Windows 宿主与 Linux 客体是示例。选用 VDI 镜像时，VirtualBox 将客体的虚拟磁盘读写转到宿主上的镜像文件。物理落盘时机由宿主缓存等机制决定。 | [Oracle VirtualBox 7.2，Portability](https://docs.oracle.com/en/virtualization/virtualbox/7.2/user/Introduction.html)；[Oracle VirtualBox 7.2，Disk Image Files、Host Input/Output Caching](https://docs.oracle.com/en/virtualization/virtualbox/7.2/user/storage.html)；[Xen 项目手册，What makes Xen different](https://handbook.xenproject.org/users/introduction.html) |
| v7、c1–c3 | 第一类与第二类取决于监控器与硬件、宿主操作系统的关系。VirtualBox 使用处理器的虚拟化能力，体系位置与 CPU 执行方式是两个问题。分层图画依赖关系，磁盘图只画 VDI 写入路径。 | [Oracle VirtualBox 7.2，Portability](https://docs.oracle.com/en/virtualization/virtualbox/7.2/user/Introduction.html)；[Oracle VirtualBox 6.1，Hardware vs. Software Virtualization 与 Details About Hardware Virtualization](https://docs.oracle.com/en/virtualization/virtualbox/6.1/admin/TechnicalBackground.html)；[Xen 项目手册](https://handbook.xenproject.org/users/introduction.html) |
| j1–j4、j9–j10 | JVM 是进程虚拟机的一个例子。Java 源程序经过编译可得到含 JVM 字节码的类文件。兼容的 JVM 实现可执行同一份类文件。片中画的是仅依赖 Java 标准库的示例，实际应用还有类文件版本、依赖及平台相关代码等适用条件。进程虚拟机服务单个程序的运行环境，其中可以有多个线程。 | [Smith 与 Nair，§1.3.4](https://jes.ece.wisc.edu/papers/vm.pdf)；[JVMS 21，§2、§2.1](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html)；[JVMS 21，§5.2](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-5.html#jvms-5.2) |
| j5–j8 | `main` 调用 `add(2, 3)`。从底到顶，`add` 的操作数栈依次为 `[]`、`[2]`、`[2, 3]`、`[5]`。第四条指令返回整数，调用方打印 `5`。偏移 0–3 均取自 `javap -c`。栈的变化按规范推导，体现指令语义。JVM 实现可解释或将字节码编译为本机指令。 | [本片回显](lab/add.txt)；[JVMS 21，§2.6.2](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.6.2)；[JVMS 21，§6.5 的 iload、iadd、ireturn](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-6.html#jvms-6.5)；[Smith 与 Nair，§1.3.4](https://jes.ece.wisc.edu/papers/vm.pdf) |
| c4–c8 | 客体 Linux 也能运行 JVM，因为它提供进程所需的操作系统接口。这种组合说明两个分类维度可以叠用。传统架构分类无法单独推出具体工作负载的性能排名。 | [Smith 与 Nair，§1.2.1、§1.3.4、§1.4](https://jes.ece.wisc.edu/papers/vm.pdf)；[JVMS 21，§1.2](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-1.html#jvms-1.2)；[Oracle VirtualBox 7.2，Guest Operating Systems](https://docs.oracle.com/en/virtualization/virtualbox/7.2/user/Introduction.html) |

## 复核

本轮复查了两种架构的示意边界和 JVM 的数字、指令顺序。Java 实际编译、反汇编并运行。Xen 和 VirtualBox 使用官方文档与相关资料交叉核对，本轮没有启动两套环境实测。混合实现、跨指令集仿真与容器留在本片范围之外。
