/* SPDX-License-Identifier: GPL-3.0-or-later */
const frame = document.querySelector('#frame');
const instruments = {
  'a-title': '整机 / 程序', 'a-compare': '监控器位置', 'a-storage': '磁盘写入',
  'a-baremetal': '裸金属', 'a-jvm': '栈状态', 'a-docker': '共用内核', 'a-nest': '套用层数',
  'b-title': '整机 / 程序', 'b-boot': '启动顺序', 'b-jvm': '栈状态',
};
const params = new URLSearchParams(location.search);
const id = params.get('id') || 'a-title';
// 剩余秒数由审片页构建脚本按该帧对应的句子算出后传入。
const remaining = Number(params.get('left') || 192);
const instrument = instruments[id];
const layer = (name, detail, kind = '') => `
  <div class="layer ${kind}"><strong>${name}</strong><span>${detail}</span></div>`;
const guest = (suffix = '') => layer('Linux' + suffix, '客体系统', 'guest');
const hardware = layer('物理硬件', 'CPU　/　RAM　/　磁盘', 'hardware');
const path = '<div class="bus" aria-hidden="true"></div>';
const metal = `<div class="layer hardware metal"><strong>裸金属</strong><span><em>bare metal</em>　CPU　/　RAM　/　磁盘</span></div>`;

function cabinetTitle() {
  return `<div class="cabinet-title">
    <div><p class="number">192<span>秒</span></p><h1>了解虚拟机</h1><p class="subtitle">第一类、第二类与进程虚拟机</p></div>
    <div class="exploded-rack">
      <div class="rack-pair">${guest(' A')}${guest(' B')}</div>${path}
      ${layer('虚拟硬件', 'vCPU　/　内存　/　设备', 'virtual')}${path}
      ${layer('虚拟机监控器', 'Hypervisor', 'monitor')}${path}${hardware}
    </div>
  </div>`;
}

function compareCabinets() {
  return `<header class="heading"><p class="kicker">系统虚拟机</p><h1>监控器插在哪一层？</h1></header>
  <div class="pair">
    <section class="rack"><h2>第一类 <span>裸金属型</span><em class="also">同类：VMware ESX</em></h2>
    <div class="rack-pair">${layer('Dom0', '管理域', 'management')}${guest()}</div>
    ${path}${layer('Xen', '监控器 · Hypervisor', 'monitor')}${path}${metal}</section>
    <section class="rack"><h2>第二类 <span>宿主型</span><em class="also">同类：VMware Workstation</em></h2>
    ${guest()}${path}${layer('VirtualBox', '监控器 · Hypervisor', 'monitor')}${path}
    ${layer('Windows', '宿主系统', 'host')}${path}${hardware}</section>
  </div>`;
}

function cabinetStorage() {
  return `<header class="heading"><p class="kicker">第二类 · VirtualBox</p><h1>一次虚拟磁盘写入</h1></header>
  <div class="storage">
    <section><h2>Linux <span>客体系统</span></h2><div class="disk-device"><i aria-hidden="true"></i><strong>虚拟磁盘</strong></div></section>
    <div class="bridge"><span>写入请求</span><div class="arrow" aria-hidden="true"></div><strong>VirtualBox</strong></div>
    <section><h2>Windows <span>宿主系统</span></h2><div class="disk-file"><i aria-hidden="true"></i><strong>disk.vdi</strong><span>磁盘镜像文件</span></div></section>
  </div>`;
}

function analyzerTitle() {
  return `<div class="analyzer-title">
    <div><p class="number">192<span>秒</span></p><h1>了解虚拟机</h1>
    <p class="subtitle">第一类、第二类与进程虚拟机</p></div>
    <section class="instrument" aria-label="从输入到执行">
      <div class="instrument-head"><span>INPUT</span><span>执行接口</span><span>RUN</span></div>
      <div class="instrument-row"><span>系统</span><i aria-hidden="true"></i><strong>虚拟硬件</strong></div>
      <div class="instrument-row"><span>程序</span><i aria-hidden="true"></i><strong>虚拟指令</strong></div>
    </section>
  </div>`;
}

function bootTrack() {
  return `<header class="heading"><p class="kicker">系统虚拟机</p><h1>谁先启动？</h1></header>
  <div class="trace boot-trace">
    <div class="trace-ruler"><span></span><span>开机</span><span>服务就绪</span><span>启动客体</span></div>
    <div class="trace-row"><h2>第一类 <small>裸金属型</small></h2><div><strong>Xen</strong></div><div><strong>Dom0</strong><span>管理域</span></div><div><strong>Linux</strong><span>客体系统</span></div></div>
    <div class="trace-row"><h2>第二类 <small>宿主型</small></h2><div><strong>Windows</strong><span>宿主系统</span></div><div><strong>VirtualBox</strong></div><div><strong>Linux</strong><span>客体系统</span></div></div>
  </div>`;
}

function javaTrack() {
  const { instructions, arguments: [a, b], output } = JAVA_DEMO;
  const states = [[a], [a, b], [output], []];
  const verbs = ['取第一个参数', '取第二个参数', '两个数相加', '返回整数'];
  return `<header class="heading"><p class="kicker">进程虚拟机 · JVM</p><h1>一段字节码，一次加法</h1></header>
  <div class="java-run">
    <section class="trace">
      <div class="stack-head"><code>add(${a}, ${b})</code><span>指令执行后的操作数栈</span></div>
      <ol class="stack-table">${instructions.map(([offset, name], step) => `
        <li><code class="offset">${offset}</code><code>${name}</code><span>${verbs[step]}</span>
        <div class="values">${states[step].map(value => `<b>${value}</b>`).join('') || '<span>空</span>'}</div></li>`).join('')}</ol>
    </section>
    <section class="instrument stdout"><p>终端输出</p><code>&gt; java Add</code><strong>${output}</strong></section>
  </div>`;
}

function cabinetBareMetal() {
  return `<header class="heading tight"><p class="kicker">第一类 · Xen</p><h1>裸金属：没装操作系统的硬件</h1></header>
  <div class="bare">
    <section class="rack">
      <div class="rack-pair">${layer('Dom0', '负责管理的 Linux', 'management')}${guest()}</div>
      ${path}${layer('Xen', '开机直接启动', 'monitor')}${path}
      <div class="empty-slot">这里没有操作系统</div>${path}${metal}
    </section>
    <aside class="definition">
      <p class="term">bare metal</p><p class="gloss">裸金属</p>
      <ol><li>光秃秃的硬件</li><li>上面没装任何操作系统</li><li>监控器直接装在它上面</li></ol>
      <p class="verdict">第一类 · 裸金属型</p>
    </aside>
  </div>`;
}

function cabinetJava() {
  const { instructions, arguments: [a, b], output } = JAVA_DEMO;
  const states = [[a], [a, b], [output], []];
  return `<header class="heading tight"><p class="kicker">进程虚拟机 · JVM</p><h1>JVM 只是一个程序</h1></header>
  <div class="java-cabinet">
    <section class="rack">
      <div class="rack-pair">${layer('JVM', 'java Add', 'monitor')}${layer('其他程序', '浏览器 / 编辑器')}</div>
      ${path}${layer('操作系统', 'Windows 或 Linux', 'host')}${path}${hardware}
    </section>
    <section class="bytecode">
      <div class="bytecode-head"><code>add(${a}, ${b})</code><span>每条指令之后的栈</span></div>
      ${instructions.map(([offset, name], step) => `<div class="op${step === 2 ? ' now' : ''}">
        <code class="offset">${offset}</code><code>${name}</code>
        <div class="cells">${states[step].map(value => `<b>${value}</b>`).join('') || '<span>空</span>'}</div></div>`).join('')}
      <div class="op out"><span>程序打印</span><strong>${output}</strong></div>
    </section>
  </div>`;
}

function cabinetDocker() {
  const vm = (name) => `<div class="layer stacked"><strong>${name}</strong><span>自己的操作系统与内核</span></div>`;
  const box = (name) => `<div class="layer stacked"><strong>${name}</strong><span>程序本身</span></div>`;
  return `<header class="heading tight"><p class="kicker">边界 · Docker</p><h1>容器不是虚拟机</h1></header>
  <div class="pair">
    <section class="rack"><h2>虚拟机 <span>造一台虚拟电脑</span></h2>
    <div class="rack-pair">${vm('客体 A')}${vm('客体 B')}</div>
    ${path}${layer('监控器', 'Hypervisor', 'monitor')}${path}${hardware}</section>
    <section class="rack"><h2>容器 <span>被隔开的进程</span></h2>
    <div class="rack-pair">${box('容器 A')}${box('容器 B')}</div>
    ${path}${layer('宿主系统', '共用这一个内核', 'monitor')}${path}${hardware}</section>
  </div>`;
}

function cabinetNest() {
  const tag = (text, rows) => `<div class="tag" style="grid-row:span ${rows}">${text}</div>`;
  return `<header class="heading tight"><p class="kicker">套着用</p><h1>Linux 客体里，照样能跑 JVM</h1></header>
  <div class="nest">
    <div class="nest-stack">
      ${layer('JVM', 'add(2, 3) → 5', 'monitor')}
      ${layer('Linux', '客体系统', 'guest')}
      ${layer('VirtualBox', '监控器', 'management')}
      ${layer('Windows', '宿主系统', 'host')}
      ${hardware}
    </div>
    <div class="nest-tags">${tag('进程虚拟机', 1)}${tag('系统虚拟机 · 第二类', 2)}${tag('真实的电脑', 2)}</div>
  </div>`;
}

const designs = {
  'a-title': cabinetTitle, 'a-compare': compareCabinets, 'a-storage': cabinetStorage,
  'a-baremetal': cabinetBareMetal, 'a-jvm': cabinetJava, 'a-docker': cabinetDocker, 'a-nest': cabinetNest,
  'b-title': analyzerTitle, 'b-boot': bootTrack, 'b-jvm': javaTrack,
};
frame.className = id.startsWith('a-') ? 'cabinet' : 'analyzer';
frame.innerHTML = `<div class="hud"><span>剩余 <b>${remaining}s</b></span><span>${instrument}</span></div>
  ${designs[id]()}<div class="runtime" aria-hidden="true"><div style="width:${(192 - remaining) / 192 * 100}%"></div></div>`;
