/* SPDX-License-Identifier: GPL-3.0-or-later */
module.exports = {
  sections: {
    open: ['一台电脑，两套系统', '从操作系统所见的虚拟硬件讲起。'],
    type1: ['第一类 · 裸机型', 'Xen 接管硬件，管理域与客体位于同一层。'],
    type2: ['第二类 · 宿主型', '跟随一次虚拟磁盘写入，看到宿主上的镜像文件。'],
    process: ['进程虚拟机 · JVM', '跟随真实字节码逐步完成 2 + 3。'],
    compare: ['比较与合用', '把 JVM 放进 Linux 客体，用同一套结构收束两条分类轴。'],
    outro: ['片尾署名', '仅画面，留 7.5 秒。'],
  },
  sample: ['x3', 'x4', 'v2', 'j3', 'j6'],
  voices: [
    { id: 'a', name: 'Xiaoxiao', voice: 'zh-CN-XiaoxiaoNeural' },
    { id: 'b', name: 'Yunxi', voice: 'zh-CN-YunxiNeural' },
    { id: 'c', name: 'Xiaoyi', voice: 'zh-CN-XiaoyiNeural' },
    { id: 'd', name: 'Yunjian', voice: 'zh-CN-YunjianNeural' },
    { id: 'e', name: 'Yunyang', voice: 'zh-CN-YunyangNeural' },
  ],
  music: [
    { id: 'a', name: '背板时钟', detail: '120 BPM · 短促的低频钟脉冲，双音动机逐步露出。' },
    { id: 'b', name: '机房长音', detail: '60 BPM · 稳定低音、缓慢的和声换层，给旁白留出空间。' },
    { id: 'c', name: '指令步进', detail: '120 BPM · 干燥的步进节奏与三音序列，适合指令与栈同步推进。' },
  ],
  directions: [
    {
      id: 'a', name: '机柜剖面',
      description: '石墨黑与磷绿。镜头固定，像从机架正面抽出板卡。先看物理底座，再看监控器和客体各插在哪一层。讲磁盘时沿总线追踪写入，最后停在盘和文件两个视角。',
      shots: [
        { id: 'a-title', time: '00:05', name: '片名卡', alt: '石墨黑片名卡，右侧是一台由虚拟硬件、监控器和物理底座组成的机柜。' },
        { id: 'a-compare', time: '02:36', name: '两种系统架构', alt: '并排的 Xen 与 VirtualBox 剖面，Windows 宿主只出现在 VirtualBox 的下方。' },
        { id: 'a-storage', time: '01:27', name: '客体磁盘写入', alt: '客体 Linux 的虚拟磁盘沿 VirtualBox 路径写到宿主 Windows 上的 disk.vdi。' },
      ],
    },
    {
      id: 'b', name: '逻辑分析仪',
      description: '琥珀单色与纸本指令表。从左往右读启动顺序，游标沿实际事件推进。进入 JVM 后沿用同一个游标，观察数字入栈、合并、返回，再看终端输出。',
      shots: [
        { id: 'b-title', time: '00:05', name: '片名卡', alt: '米色纸本片名与琥珀色执行轨迹，区分系统虚拟机和进程虚拟机。' },
        { id: 'b-boot', time: '02:36', name: '两条启动轨迹', alt: 'Xen 先于管理域和客体启动，Windows 则先于 VirtualBox 与客体启动。' },
        { id: 'b-jvm', time: '02:05', name: '字节码与栈', alt: '真实反汇编的四条指令和对应的栈状态，最后终端打印 5。' },
      ],
    },
  ],
};
