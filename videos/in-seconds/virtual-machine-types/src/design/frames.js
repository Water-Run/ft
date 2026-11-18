/* SPDX-License-Identifier: GPL-3.0-or-later */
const frame = document.querySelector('#frame');
const projectFrames = {
  'a-title': [187, '整机 / 程序'],
  'a-compare': [36, '监控器位置'],
  'a-storage': [105, '磁盘写入'],
  'b-title': [187, '整机 / 程序'],
  'b-boot': [36, '启动顺序'],
  'b-jvm': [67, '栈状态'],
};
const id = new URLSearchParams(location.search).get('id') || 'a-title';
const [remaining, instrument] = projectFrames[id];
const layer = (name, detail, kind = '') => `
  <div class="layer ${kind}"><strong>${name}</strong><span>${detail}</span></div>`;
const guest = (suffix = '') => layer('Linux' + suffix, '客体系统', 'guest');
const hardware = layer('物理硬件', 'CPU　/　RAM　/　磁盘', 'hardware');
const path = '<div class="bus" aria-hidden="true"></div>';

function cabinetTitle() {
  return `<div class="cabinet-title">
    <div><p class="number">192<span>秒</span></p><h1>了解虚拟机</h1><p class="subtitle">第一类、第二类与进程虚拟机</p></div>
    <div class="exploded-rack">
      <div class="rack-pair">${guest(' A')}${guest(' B')}</div>${path}
      ${layer('虚拟硬件', 'vCPU　/　内存　/　设备', 'virtual')}${path}
      ${layer('虚拟机监控器', '协调真实资源', 'monitor')}${path}${hardware}
    </div>
  </div>`;
}

function compareCabinets() {
  return `<header class="heading"><p class="kicker">系统虚拟机</p><h1>监控器插在哪一层？</h1></header>
  <div class="pair">
    <section class="rack"><h2>第一类 <span>裸机型</span></h2>
    <div class="rack-pair">${layer('Dom0', '管理域', 'management')}${guest()}</div>
    ${path}${layer('Xen', '监控器', 'monitor')}${path}${hardware}</section>
    <section class="rack"><h2>第二类 <span>宿主型</span></h2>
    ${guest()}${path}${layer('VirtualBox', '监控器', 'monitor')}${path}
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
    <div class="trace-row"><h2>第一类 <small>裸机型</small></h2><div><strong>Xen</strong></div><div><strong>Dom0</strong><span>管理域</span></div><div><strong>Linux</strong><span>客体系统</span></div></div>
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

const designs = {
  'a-title': cabinetTitle, 'a-compare': compareCabinets, 'a-storage': cabinetStorage,
  'b-title': analyzerTitle, 'b-boot': bootTrack, 'b-jvm': javaTrack,
};
frame.className = id.startsWith('a-') ? 'cabinet' : 'analyzer';
frame.innerHTML = `<div class="hud"><span>剩余 <b>${remaining}s</b></span><span>${instrument}</span></div>
  ${designs[id]()}<div class="runtime" aria-hidden="true"><div style="width:${(192 - remaining) / 192 * 100}%"></div></div>`;
