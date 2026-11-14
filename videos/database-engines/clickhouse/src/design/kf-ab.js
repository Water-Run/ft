// 关键帧 AB 融合用：一块有厚度的板（真 CSS 3D），中心在 (x, y, z)，y 向上；front 是贴在正面的 HTML；cls: '' | lit | hot | old
const box = ({ x = 0, y = 0, z = 0, w, h, d, front = '', cls = '', style = '' }) => `<div class="b ${cls}" style="width:${w}px;height:${h}px;margin-left:${-w / 2}px;margin-top:${-h / 2}px;transform:translate3d(${x}px,${-y}px,${z}px);${style}">
  <div class="f front" style="width:${w}px;height:${h}px;transform:translateZ(${d / 2}px)">${front}</div>
  <div class="f back" style="width:${w}px;height:${h}px;transform:rotateY(180deg) translateZ(${d / 2}px)"></div>
  <div class="f right" style="width:${d}px;height:${h}px;left:${(w - d) / 2}px;transform:rotateY(90deg) translateZ(${w / 2}px)"></div>
  <div class="f left" style="width:${d}px;height:${h}px;left:${(w - d) / 2}px;transform:rotateY(-90deg) translateZ(${w / 2}px)"></div>
  <div class="f top" style="width:${w}px;height:${d}px;top:${(h - d) / 2}px;transform:rotateX(90deg) translateZ(${h / 2}px)"></div></div>`;
const floor = (W, y = 0) => W.insertAdjacentHTML('beforeend', `<div class="floor" style="transform:translate3d(0,${-y}px,0) rotateX(90deg)"></div>`);
