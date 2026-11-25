# 虚拟机的两条分类轴

取证于 2026-11-18。系统虚拟机看操作系统获得什么样的计算机接口。第一类和第二类描述提供该接口的虚拟机监控器位于哪一层。进程虚拟机看程序获得什么样的执行接口。全片用 Xen、VirtualBox 和 JVM 说明各自的典型架构。

## 取证环境

- Xen 采用项目手册和 Xen 4.16 管理指南描述的典型 Dom0 架构。结构图为原理示意。
- VirtualBox 采用 Oracle VirtualBox 7.2 用户手册描述的常规宿主式架构与 VDI 文件。磁盘写入为文档机制示意。
- JVM 依据 Java SE 21 虚拟机规范。Windows 上用 OpenJDK 27 的 `javac --release 21` 编译自写的 [Add.java](lab/Add.java)，再用 `javap -c` 反汇编并用 `java` 运行。完整命令及结果见 [add.txt](lab/add.txt)。

## 文案与画面依据

本表对应第 7 稿（稿本 `a1a48b55…`）。更早各稿的句号与依据见 Git 历史。Smith 与 Nair 的页码为该 PDF 的页脚页码。

| 句号 | 已核对的陈述及边界 | 依据 |
| --- | --- | --- |
| o1–o3 | 在 Windows 上用 VirtualBox 开一台虚拟机运行 Linux，属于系统虚拟机。JVM 的全称是 Java 虚拟机。开头只提出两者是否同类的问题。 | [Oracle VirtualBox 7.2，Introduction](https://docs.oracle.com/en/virtualization/virtualbox/7.2/user/Introduction.html)；[JVMS 21，§1.2](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-1.html#jvms-1.2) |
| o4–o5 | 常规操作系统内含驱动、内存管理和调度，直接与硬件接口打交道（Smith 与 Nair 图 4）。系统虚拟机要解决的核心问题，是把一套硬件资源分给多个客体操作系统环境（§1.4 原文：“The central problem is that of dividing a single set of hardware resources among multiple guest operating system environments”）。 | Smith 与 Nair，第 5 页图 4、第 13 页 §1.4 |
| o6–o8 | 系统虚拟机由软件提供一整套系统环境，可在其上运行操作系统及其进程。在虚拟机中运行的软件称为客体（guest），下层平台称为宿主（host）。「虚拟电脑」是对「完整系统环境」的口语说法。 | Smith 与 Nair，第 8 页（host、guest 术语与 system virtual machine 定义）；[Oracle VirtualBox 7.2，Virtual Hardware](https://docs.oracle.com/en/virtualization/virtualbox/7.2/user/Introduction.html) |
| x1–x2 | 系统虚拟机中的虚拟化软件称为虚拟机监控器（VMM）；Xen 文档称之为 hypervisor。VMM 掌管全部硬件资源；客体执行涉及共享硬件的特权操作时，由 VMM 截获、检查并代为完成，客体软件察觉不到。 | Smith 与 Nair，第 8 页、第 13 页 §1.4；[Xen 项目手册，What makes Xen different](https://handbook.xenproject.org/users/introduction.html) |
| x3–x5 | 监控器的经典放法是直接装在裸机（bare hardware）上；另一种放法建在已有的宿主操作系统之上（hosted VM）。Xen 是开源的裸金属（bare metal）hypervisor，直接运行在硬件上，下面没有操作系统，是第一类。「裸金属」是 bare metal 的直译，指没有装操作系统的硬件本身；旁白用「没装操作系统、光秃秃的硬件」解释。 | Smith 与 Nair，第 14 页 §1.4.1；Xen 项目手册（“Xen is a Type 1 (bare-metal) hypervisor”“It runs directly on the hardware, without an underlying operating system”）；[Xen 4.16 管理指南，Introduction](https://xenbits.xenproject.org/docs/4.16-testing/admin-guide/introduction.html)（“Xen is an open source, bare metal hypervisor”“Xen manages RAM, schedules virtual CPUs on the available physical CPUs”） |
| x6–x8 | Xen 启动时自动启动 dom0；dom0 通常是 Linux，典型配置下担任管理域，负责创建和管理其他虚拟机。dom0 本身是一台虚拟机，与其他客体一样直接位于 Xen 之上。「负责管理的 Linux」是对 dom0 的口语说法，画面标 Dom0。x8 的「裸金属型」即 Type 1 (bare-metal)。 | Xen 4.16 管理指南（“When Xen boots, dom0 is automatically started as well. Dom0 is a virtual machine”）；Xen 项目手册（“All domains, dom0 included, sit directly on the hypervisor”） |
| v1–v3 | VirtualBox 是第二类（宿主型）监控器，需要先有宿主操作系统，以常规应用程序的方式安装。Windows 宿主与 Linux 客体是示例。 | Xen 项目手册（“Type 2 hypervisors like VirtualBox”）；Smith 与 Nair，第 14 页 §1.4.1（“the installation process is similar to installing a typical application program”）；[Oracle VirtualBox 7.2，Portability](https://docs.oracle.com/en/virtualization/virtualbox/7.2/user/Introduction.html) |
| v4–v6 | 例子中的客体使用 VDI 镜像：VirtualBox 把客体虚拟磁盘的读写转成宿主上镜像文件的读写。物理落盘时机由宿主缓存等机制决定。“比如”标明这是一次示例写入。 | [Oracle VirtualBox 7.2，Disk Image Files、Host Input/Output Caching](https://docs.oracle.com/en/virtualization/virtualbox/7.2/user/storage.html) |
| v7 | 宿主型监控器可以依靠宿主操作系统提供设备驱动和其他底层服务。“借它干活”指这种依赖，v4–v6 的文件写入是其中一例。 | Smith 与 Nair，第 14 页 §1.4.1（“virtualizing software can rely on the host OS to provide device drivers and other lower-level services”） |
| j1–j3 | 进程虚拟机的运行时软件运行在操作系统之上，为一个客体进程而创建，在该进程结束时停止支持。JVM 属于这一类（高级语言虚拟机）。 | Smith 与 Nair，第 8 页（“The runtime is created to support a guest process and runs on top of an operating system … terminates support when the guest process terminates”）、第 12 页 |
| j4–j5 | Java 源程序编译后得到含 JVM 字节码的类文件。字节码是一套虚拟指令集，不针对某款真实处理器，供各平台上实现的 JVM 执行。旁白省略“类文件”一词，画面保留。 | Smith 与 Nair，第 12 页（virtual ISA、bytecodes）；[JVMS 21，§2、§2.1](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html) |
| j6–j9 | `main` 调用 `add(2, 3)`。从底到顶，`add` 的操作数栈依次为 `[]`、`[2]`、`[2, 3]`、`[5]`。第四条指令返回整数，调用方打印 `5`。偏移 0–3 均取自 `javap -c`。栈的变化按规范推导，体现指令语义。旁白称“叠进一个栈”，画面标“操作数栈”。 | [本片回显](lab/add.txt)；[JVMS 21，§2.6.2](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.6.2)；[JVMS 21，§6.5 的 iload、iadd、ireturn](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-6.html#jvms-6.5) |
| j10–j11 | 虚拟指令集代码可分发到不同平台，由各平台上实现的 JVM 执行（实现可逐条解释，也可编译成宿主机器指令，旁白不展开）。片中示例只依赖 Java 标准库；实际应用还有类文件版本、依赖和平台相关代码等条件，旁白以「兼容的」概括。 | Smith 与 Nair，第 12 页；[JVMS 21，§5.2](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-5.html#jvms-5.2) |
| c1–c3、c5 | 系统虚拟机提供完整的系统环境，供操作系统使用；进程虚拟机为单个进程提供执行环境。这是 Smith 与 Nair 的两大类划分。系统虚拟机再按监控器直接在裸机上还是在宿主操作系统上分第一类、第二类。 | Smith 与 Nair，第 8–9 页、第 14 页 §1.4.1；Xen 项目手册 |
| c4 | VMware 官网把 ESX 列为第一类 hypervisor 的例子，把 VMware Fusion 列为第二类；Xen 项目手册把 VMware Workstation 与 VirtualBox 并列为第二类。第一类「直接运行在主机硬件上」，第二类「像其他程序一样运行在操作系统上」。 | [VMware，What is a hypervisor?](https://www.vmware.com/topics/hypervisor)（“Type 1 hypervisor examples: ESX. Hyper-V, Citrix, Xen, Linux KVM”“Type 2 hypervisor examples: VMware Fusion, Oracle VM, VirtualBox”）；[Xen 项目手册](https://handbook.xenproject.org/users/introduction.html)（Type 2 hypervisors like VirtualBox or VMware Workstation） |
| c6–c7 | 容器不模拟整台电脑，不启动自己的操作系统与内核；容器仍然是进程，同一台机器上的容器共用这台机器的内核，彼此由内核隔开。Docker 称容器「virtualize the operating system instead of hardware」，与系统虚拟机、进程虚拟机都不同类。「容器里就是程序本身」指容器中运行的是应用进程，而不是一台虚拟机。 | [Docker 文档，What is a container?](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/)（2026-10-21 核验版：“A virtual machine (VM) also isolates software, but it does so by pretending to be a whole computer. Every VM boots its own complete operating system, including its own kernel … A container doesn’t. It’s still a process, so every container on a machine shares that machine’s kernel.”）；[Docker，What is a Container?](https://www.docker.com/resources/what-container/)（“containers virtualize the operating system instead of hardware”“share the OS kernel with other containers, each running as isolated processes in user space”） |
| c8 | 虚拟化软件可以组合使用。客体 Linux 提供进程所需的操作系统接口，因此可以运行 JVM。 | Smith 与 Nair，第 9 页图 8c；[JVMS 21，§1.2](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-1.html#jvms-1.2)；[Oracle VirtualBox 7.2，Guest Operating Systems](https://docs.oracle.com/en/virtualization/virtualbox/7.2/user/Introduction.html) |

## 复核

2026-11-25 第 6–7 稿复核：按策划者要求加入 VMware 与 Docker。VMware 的分类取自 VMware 官网的 hypervisor 介绍页（该页未写日期）与 Xen 项目手册；Docker 取自 Docker 官方文档（页面标注 2026-10-21 核验）与 Docker 官网。页面原文存于本地 `research/_src/`（不入库）。KVM 归类存在争议，本片不提。

2026-11-25 第 3–5 稿复核：「裸金属」「开源」两处新说法分别对 Xen 项目手册与 Xen 4.16 管理指南的原话核对，见 x3–x5 行。本片不比较快慢，第 5 稿结尾也不涉及性能。

2026-11-25 第 2 稿复核：逐页读了 Smith 与 Nair 第 5、8、9、12–14 页的原文（PDF 文字层无法抽取，按页面图像核对），重新读了 Xen 项目手册与 Xen 4.16 管理指南的相关段落，原话摘录见上表。管理指南没有写 Xen 是引导器之后第一个运行的程序，旁白只说 Xen 直接在硬件上启动，下面没有操作系统。Smith 与 Nair 写到宿主型因多经一层软件可能损失效率，本片不比较快慢，第 1 稿 c3 删去。

本轮复查了两种架构的示意边界和 JVM 的数字、指令顺序。Java 实际编译、反汇编并运行。Xen 和 VirtualBox 使用官方文档与相关资料交叉核对，本轮没有启动两套环境实测。混合实现、跨指令集仿真与容器留在本片范围之外。
