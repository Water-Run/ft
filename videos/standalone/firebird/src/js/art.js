// 本片的插画：等距视角（2.5D）的小场景与人物。全部是 SVG 字符串，按调用参数生成，不读外部图片。
// 坐标：等距投影 P(x, y, z) → 屏幕 (ox + (x − y)·0.866, oy + (x + y)·0.5 − z)。x 往右下，y 往左下，z 往上。
// 盒子可见的三面：顶面、左前面（y 最大处）、右前面（x 最大处）。画的时候由远到近排。
let ART_SEQ = 0;
const artId = (p) => p + (++ART_SEQ);
const f1 = (v) => (+v).toFixed(1);
function shade(hex, k) {
  const n = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const m = n.map((v) => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k)));
  return '#' + m.map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}
const isoP = (o, x, y, z) => [o[0] + (x - y) * 0.866, o[1] + (x + y) * 0.5 - z];
const isoPts = (o, pts) => pts.map((p) => isoP(o, ...p).map(f1).join(' ')).join(' L');
const isoPoly = (o, pts, fill, extra = '') => `<path d="M${isoPts(o, pts)} Z" fill="${fill}" ${extra}/>`;
const isoLine = (o, a, b, stroke, w = 2, extra = '') => `<path d="M${isoPts(o, [a, b])}" stroke="${stroke}" stroke-width="${w}" fill="none" stroke-linecap="round" ${extra}/>`;
function isoBox(o, x, y, z, w, d, hh, base, k = {}) {
  const top = k.top || shade(base, 0.28), left = k.left || base, right = k.right || shade(base, -0.18);
  return isoPoly(o, [[x, y, z + hh], [x + w, y, z + hh], [x + w, y + d, z + hh], [x, y + d, z + hh]], top)
    + isoPoly(o, [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + hh], [x, y + d, z + hh]], left)
    + isoPoly(o, [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + hh], [x + w, y, z + hh]], right);
}
// 地面上的软影
const isoShadow = (o, x, y, w, d, a = 0.13) => isoPoly(o, [[x - 6, y - 6, 0], [x + w + 10, y - 6, 0], [x + w + 10, y + d + 10, 0], [x - 6, y + d + 10, 0]], `rgba(40,30,20,${a})`);

// ───── 人物：正面、无五官的扁平小人，右半边略暗，显出体积 ─────
// o: { shirt, pants, skin, hair, style: short|long|bald|bun|cap, beard, glasses, tie, coat, w }
function artHuman(o = {}) {
  const w = o.w || 100, sk = o.skin || '#efc39e', sh = o.shirt || '#2156a5', pa = o.pants || '#3b3f4a', hr = o.hair || '#3b2a20';
  const st = o.style || 'short', id = artId('hm');
  let hair = '';
  if (st === 'short') hair = `<path fill="${hr}" d="M29 36 C27 16 40 9 50 9 C62 9 73 16 71 36 C67 26 60 22 50 23 C40 22 33 26 29 36 Z"/>`;
  if (st === 'long') hair = `<path fill="${hr}" d="M27 40 C24 14 40 8 50 8 C61 8 76 14 73 40 L76 70 C70 74 66 72 64 66 L66 34 C60 26 40 26 34 34 L36 66 C34 72 30 74 24 70 Z"/>`;
  if (st === 'bun') hair = `<circle cx="50" cy="8" r="9" fill="${hr}"/><path fill="${hr}" d="M29 36 C27 16 40 11 50 11 C62 11 73 16 71 36 C67 27 60 23 50 24 C40 23 33 27 29 36 Z"/>`;
  if (st === 'bald') hair = `<path fill="${hr}" d="M29 38 C28 31 30 28 32 27 L33 40 Z M71 38 C72 31 70 28 68 27 L67 40 Z"/>`;
  if (st === 'cap') hair = `<path fill="${o.capColor || '#2156a5'}" d="M28 32 C28 14 40 9 50 9 C62 9 72 14 72 32 Z"/><path fill="${shade(o.capColor || '#2156a5', -0.2)}" d="M50 30 H86 C86 34 80 36 72 36 H50 Z"/>`;
  const beard = o.beard ? `<path fill="${o.beardColor || hr}" d="M31 40 C32 58 42 64 50 64 C58 64 68 58 69 40 C66 50 60 53 50 53 C40 53 34 50 31 40 Z"/>` : '';
  const glasses = o.glasses ? `<g fill="none" stroke="#1c1c1c" stroke-width="2.6"><circle cx="41" cy="37" r="6.5"/><circle cx="59" cy="37" r="6.5"/><path d="M47.5 37 H52.5"/></g>` : '';
  const coat = o.coat ? `<path fill="${o.coat}" d="M22 74 C26 66 38 64 50 66 C62 64 74 66 78 74 L82 128 H18 Z"/><path fill="${sh}" d="M42 66 L50 90 L58 66 Z"/>` : '';
  const tie = o.tie ? `<path fill="${o.tie}" d="M47 68 H53 L55 74 L52 100 L50 104 L48 100 L45 74 Z"/>` : '';
  return `<svg width="${w}" height="${w * 2}" viewBox="0 0 100 200"><ellipse cx="50" cy="194" rx="30" ry="5" fill="rgba(40,30,20,.16)"/>
  <rect x="34" y="124" width="14" height="64" rx="5" fill="${pa}"/><rect x="52" y="124" width="14" height="64" rx="5" fill="${pa}"/>
  <path fill="#2a2a2a" d="M30 186 H48 V194 H28 C27 190 28 187 30 186 Z M52 186 H70 C72 187 73 190 72 194 H52 Z"/>
  <path fill="${sh}" d="M24 76 C28 66 38 63 50 64 C62 63 72 66 76 76 L74 130 H26 Z"/>
  <path fill="${shade(sh, -0.14)}" d="M24 78 C18 84 16 98 15 118 L17 128 L26 128 L28 96 Z M76 78 C82 84 84 98 85 118 L83 128 L74 128 L72 96 Z"/>
  ${coat}${tie}
  <circle cx="21" cy="130" r="6" fill="${sk}"/><circle cx="79" cy="130" r="6" fill="${sk}"/>
  <rect x="44" y="52" width="12" height="14" fill="${shade(sk, -0.12)}"/>
  <circle cx="50" cy="36" r="21" fill="${sk}"/><circle cx="29" cy="38" r="4" fill="${shade(sk, -0.08)}"/><circle cx="71" cy="38" r="4" fill="${shade(sk, -0.08)}"/>
  ${hair}${beard}${glasses}
  <path fill="rgba(0,0,0,.10)" d="M50 64 C62 63 72 66 76 76 L74 130 H50 Z"/>
</svg>`;
}
// 常用的几位：颜色固定，全片同一人同一身打扮
const PEOPLE = {
  jim: { shirt: '#2156a5', pants: '#3b3f4a', hair: '#6b4a2f', beard: true, glasses: true },
  p2: { shirt: '#c2410c', pants: '#4a4036', hair: '#2b2b2b', style: 'long' },
  p3: { shirt: '#54BC4B', pants: '#3b3f4a', hair: '#c9a26b' },
  boss: { shirt: '#ffffff', coat: '#3b3f4a', tie: '#bf0000', pants: '#3b3f4a', hair: '#8a8a8a', style: 'bald' },
  fixer: { shirt: '#2156a5', pants: '#2b3a55', hair: '#3b2a20', style: 'cap', capColor: '#F68A21' },
  dev: { shirt: '#6f6f6f', pants: '#3b3f4a', hair: '#3b2a20', glasses: true },
};
const CROWD = [
  { shirt: '#2156a5', hair: '#3b2a20' }, { shirt: '#c2410c', hair: '#2b2b2b', style: 'long' }, { shirt: '#54BC4B', hair: '#c9a26b', style: 'bun' },
  { shirt: '#6f6f6f', hair: '#6b4a2f', beard: true }, { shirt: '#e0a43a', hair: '#2b2b2b', glasses: true }, { shirt: '#7a5ea8', hair: '#8a5a3a', style: 'long' },
  { shirt: '#2b7a78', hair: '#3b2a20', style: 'cap', capColor: '#c2410c' }, { shirt: '#b5463c', hair: '#c9a26b' }, { shirt: '#3d5a80', hair: '#2b2b2b', style: 'bald' },
];
function artCrowd(n, w = 70, gap = -14, seed = 3) {
  let s = '';
  for (let i = 0; i < n; i++) s += `<div style="display:inline-block;margin-right:${gap}px;vertical-align:bottom">${artHuman({ ...CROWD[(i + seed) % CROWD.length], skin: ['#efc39e', '#d9a27a', '#a86f4c', '#f3d2b5'][(i * 3 + seed) % 4], w })}</div>`;
  return `<div style="white-space:nowrap">${s}</div>`;
}

// ───── 猫：蜷着睡的虎斑猫 ─────
function artCat(w = 170) {
  return `<svg width="${w}" height="${w * 0.62}" viewBox="0 0 170 106">
  <ellipse cx="88" cy="100" rx="70" ry="6" fill="rgba(40,30,20,.16)"/>
  <path fill="#8d8a84" d="M30 92 C14 88 12 64 30 50 C48 34 92 28 122 38 C150 48 160 70 152 86 C146 98 124 100 98 99 L44 98 Z"/>
  <path fill="#a7a49e" d="M40 94 C58 84 96 82 132 88 C120 98 70 100 40 94 Z"/>
  <g fill="none" stroke="#6e6b65" stroke-width="5" stroke-linecap="round"><path d="M70 36 C74 44 74 50 70 56"/><path d="M90 33 C95 42 95 50 91 58"/><path d="M110 36 C116 44 116 52 112 60"/><path d="M128 44 C134 50 135 58 132 64"/></g>
  <path fill="none" stroke="#7c7973" stroke-width="13" stroke-linecap="round" d="M146 80 C150 96 120 104 84 102 C64 101 50 100 42 96"/>
  <path fill="none" stroke="#c9c6bf" stroke-width="13" stroke-linecap="round" d="M50 98 C46 97 43 96 42 96"/>
  <circle cx="40" cy="64" r="25" fill="#9a9791"/>
  <path fill="#9a9791" d="M20 52 L18 26 L38 42 Z M48 40 L62 22 L62 50 Z"/><path fill="#e2b3a6" d="M23 47 L22 33 L33 43 Z M52 41 L59 31 L59 47 Z"/>
  <g fill="none" stroke="#3a3836" stroke-width="2.6" stroke-linecap="round"><path d="M27 64 Q31 68 35 64"/><path d="M45 64 Q49 68 53 64"/></g>
  <path fill="#d98f86" d="M37 72 L43 72 L40 75 Z"/>
  <g stroke="#e8e6e0" stroke-width="1.6" stroke-linecap="round"><path d="M28 74 H12"/><path d="M28 77 L13 81"/><path d="M52 74 H68"/><path d="M52 77 L67 81"/></g>
</svg>`;
}

// ───── 等距小场景 ─────
// 浴室：蓝瓷砖的步入式淋浴，窗外是树林（官方历史页 Ann Harrison 的回忆）
function artBathroom(w = 640) {
  const o = [330, 290], W = 300, D = 300, H = 260;
  let s = '';
  s += isoPoly(o, [[0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0]], '#cfdcea');
  for (let i = 1; i < 6; i++) { s += isoLine(o, [i * 50, 0, 0], [i * 50, D, 0], '#b6c8dc', 2); s += isoLine(o, [0, i * 50, 0], [W, i * 50, 0], '#b6c8dc', 2); }
  s += isoPoly(o, [[0, 0, 0], [0, D, 0], [0, D, H], [0, 0, H]], '#7fa3cf');
  s += isoPoly(o, [[0, 0, 0], [W, 0, 0], [W, 0, H], [0, 0, H]], '#9bbbe0');
  for (let i = 1; i < 6; i++) { s += isoLine(o, [0, i * 50, 0], [0, i * 50, H], '#6d92c0', 2); s += isoLine(o, [i * 50, 0, 0], [i * 50, 0, H], '#88aad3', 2); }
  for (let j = 1; j < 6; j++) { s += isoLine(o, [0, 0, j * 46], [0, D, j * 46], '#6d92c0', 2); s += isoLine(o, [0, 0, j * 46], [W, 0, j * 46], '#88aad3', 2); }
  // 窗与窗外的树
  s += isoPoly(o, [[120, 0, 110], [250, 0, 110], [250, 0, 230], [120, 0, 230]], '#e9f2e4');
  const tree = (x, z, hh, c) => isoPoly(o, [[x, 0, z], [x + 22, 0, z + hh], [x + 44, 0, z]], c);
  s += tree(124, 112, 70, '#6fa35f') + tree(150, 112, 96, '#4f8a45') + tree(186, 112, 80, '#5e9a52') + tree(212, 112, 60, '#6fa35f');
  s += isoPoly(o, [[120, 0, 110], [250, 0, 110], [250, 0, 230], [120, 0, 230]], 'none', 'stroke="#f4f4f2" stroke-width="7"');
  s += isoLine(o, [185, 0, 110], [185, 0, 230], '#f4f4f2', 5);
  // 花洒：从左墙伸出
  s += isoLine(o, [0, 150, 236], [60, 150, 236], '#a9a6a0', 8);
  s += isoPoly(o, [[50, 128, 226], [86, 128, 226], [86, 172, 226], [50, 172, 226]], '#8e8c86');
  s += isoPoly(o, [[50, 128, 226], [86, 128, 226], [86, 128, 232], [50, 128, 232]], '#a9a6a0');
  // 毛巾杆与毛巾
  s += isoLine(o, [30, 0, 170], [100, 0, 170], '#d8d6cf', 5);
  s += isoPoly(o, [[40, 0, 170], [90, 0, 170], [90, 0, 104], [40, 0, 104]], '#F68A21');
  s += isoPoly(o, [[40, 0, 116], [90, 0, 116], [90, 0, 110], [40, 0, 110]], '#ffffff', 'opacity=".6"');
  return `<svg width="${w}" height="${w * 0.94}" viewBox="0 0 660 620">${s}</svg>`;
}
// 花洒的水：由时间直接算位置（返回 [x1,y1,x2,y2] 列表，场景里用 F() 写进一层 SVG）
function waterLines(t, n = 14) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const ph = (t * 1.7 + i * 0.137) % 1, x = 352 + (i % 7) * 7 - 18 + ((i * 37) % 11), y = 370 + ph * 190;
    out.push([x + ph * (i % 2 ? 5 : -5), y, x + ph * (i % 2 ? 5 : -5) + (i % 2 ? 1 : -1), y + 20]);
  }
  return out;
}
// 房子：两层，二楼的窗可点亮
function artHouse(w = 520) {
  const o = [260, 300], W = 240, D = 200, H = 230;
  let s = isoShadow(o, 0, 0, W, D, 0.12);
  s += isoBox(o, 0, 0, 0, W, D, H, '#e9e3d6', { top: '#f4efe6', right: '#d2c9b8' });
  // 坡屋顶
  s += isoPoly(o, [[0, D / 2, H + 110], [W, D / 2, H + 110], [W, D + 14, H - 6], [0, D + 14, H - 6]], '#b5463c');
  s += isoPoly(o, [[W, -14, H - 6], [W, D + 14, H - 6], [W, D / 2, H + 110]], '#d8cdb9');
  s += isoPoly(o, [[0, -14, H - 6], [W, -14, H - 6], [W, D / 2, H + 110], [0, D / 2, H + 110]], '#9c3a31');
  // 门与窗（左前面 y = D）
  const winL = (x, z, ww, hh, c, id = '') => isoPoly(o, [[x, D, z], [x + ww, D, z], [x + ww, D, z + hh], [x, D, z + hh]], c, id);
  s += winL(30, 0, 52, 96, '#8a5a3a') + `<circle cx="${f1(isoP(o, 74, D, 48)[0])}" cy="${f1(isoP(o, 74, D, 48)[1])}" r="3.5" fill="#FAAC19"/>`;
  s += winL(120, 40, 70, 60, '#9fb6cf') + winL(30, 140, 60, 56, '#9fb6cf');
  s += winL(130, 136, 70, 62, '#9fb6cf', 'data-win="1"');
  // 右前面（x = W）的窗
  const winR = (y, z, dd, hh, c) => isoPoly(o, [[W, y, z], [W, y + dd, z], [W, y + dd, z + hh], [W, y, z + hh]], c);
  s += winR(40, 40, 60, 60, '#8ea6c0') + winR(120, 40, 50, 60, '#8ea6c0') + winR(60, 140, 70, 58, '#8ea6c0');
  return `<svg width="${w}" height="${w * 1.1}" viewBox="0 0 520 570">${s}</svg>`;
}
// 客房：地板和两面墙
function artRoom(w = 1100) {
  const o = [560, 330], W = 600, D = 560, H = 300;
  let s = '';
  s += isoPoly(o, [[0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0]], '#e7d8bf');
  for (let i = 1; i < 12; i++) s += isoLine(o, [0, i * 47, 0], [W, i * 47, 0], '#d9c7a8', 2);
  s += isoPoly(o, [[0, 0, 0], [0, D, 0], [0, D, H], [0, 0, H]], '#efece5');
  s += isoPoly(o, [[0, 0, 0], [W, 0, 0], [W, 0, H], [0, 0, H]], '#f6f3ed');
  s += isoPoly(o, [[0, 0, 0], [0, D, 0], [0, D, 16], [0, 0, 16]], '#d8d1c3') + isoPoly(o, [[0, 0, 0], [W, 0, 0], [W, 0, 16], [0, 0, 16]], '#e2dccf');
  // 窗（右后墙）
  s += isoPoly(o, [[330, 0, 120], [480, 0, 120], [480, 0, 250], [330, 0, 250]], '#cfe0ef');
  s += isoPoly(o, [[330, 0, 120], [480, 0, 120], [480, 0, 250], [330, 0, 250]], 'none', 'stroke="#ffffff" stroke-width="8"');
  s += isoLine(o, [405, 0, 120], [405, 0, 250], '#ffffff', 5);
  // 墙上的挂钩（名牌挂这里）
  s += isoLine(o, [0, 250, 250], [0, 250, 262], '#8e8c86', 4);
  return `<svg width="${w}" height="${w * 0.84}" viewBox="0 0 1120 940">${s}</svg>`;
}
// 房间里的家具：各自一张 SVG，坐标与 artRoom 同一投影原点，叠在房间上
const ROOM_O = [560, 330];
const ROOM_VB = 'viewBox="0 0 1120 940"';
function artRoomPiece(kind) {
  const o = ROOM_O;
  let s = '';
  if (kind === 'cabL' || kind === 'cabR') {
    const y = kind === 'cabL' ? 150 : 400, x = 120, w = 130, d = 110, hh = 150;
    s += isoShadow(o, x, y, w, d);
    s += isoBox(o, x, y, 0, w, d, hh, '#b9bcc0', { top: '#d4d6d8', right: '#9ea2a7' });
    for (let k = 1; k < 3; k++) s += isoLine(o, [x + w, y + 6, k * 50], [x + w, y + d - 6, k * 50], '#8a8e93', 3);
    for (let k = 0; k < 3; k++) s += isoLine(o, [x + w, y + 40, k * 50 + 30], [x + w, y + 70, k * 50 + 30], '#5d6166', 5);
  }
  if (kind === 'door') {
    const x = 105, y = 130, w = 165, d = 410, z = 150, th = 14;
    s += isoBox(o, x, y, z, w, d, th, '#c98d4e', { top: '#dba366', right: '#a8713a', left: '#b97f43' });
    s += isoPoly(o, [[x + 18, y + 22, z + th], [x + w - 18, y + 22, z + th], [x + w - 18, y + 190, z + th], [x + 18, y + 190, z + th]], 'none', 'stroke="#b97f43" stroke-width="5"');
    s += isoPoly(o, [[x + 18, y + 220, z + th], [x + w - 18, y + 220, z + th], [x + w - 18, y + d - 22, z + th], [x + 18, y + d - 22, z + th]], 'none', 'stroke="#b97f43" stroke-width="5"');
    const k = isoP(o, x + w / 2, y + 205, z + th);
    s += `<ellipse cx="${f1(k[0])}" cy="${f1(k[1])}" rx="9" ry="5" fill="#FAAC19"/>`;
  }
  if (kind === 'chair') {
    const x = 330, y = 300;
    s += isoShadow(o, x, y, 90, 90);
    s += isoLine(o, [x + 45, y + 45, 0], [x + 45, y + 45, 70], '#3a3a3a', 7);
    s += isoLine(o, [x + 10, y + 45, 4], [x + 80, y + 45, 4], '#3a3a3a', 6) + isoLine(o, [x + 45, y + 10, 4], [x + 45, y + 80, 4], '#3a3a3a', 6);
    s += isoBox(o, x, y, 70, 90, 90, 14, '#3e6f9e');
    s += isoBox(o, x + 76, y, 84, 14, 90, 96, '#3e6f9e', { right: '#2f5a85' });
  }
  if (kind === 'pc') {
    const x = 130, y = 270, z = 164;
    s += isoBox(o, x, y, z, 110, 150, 34, '#e3dccb', { top: '#efe9db', right: '#c9c1ae' });
    s += isoBox(o, x + 10, y + 20, z + 34, 92, 110, 92, '#e3dccb', { top: '#efe9db', right: '#c9c1ae' });
    s += isoPoly(o, [[x + 102, y + 32, z + 46], [x + 102, y + 118, z + 46], [x + 102, y + 118, z + 116], [x + 102, y + 32, z + 116]], '#1f3b33', 'data-screen="1"');
    for (let k = 0; k < 4; k++) s += isoLine(o, [x + 102, y + 44, z + 100 - k * 14], [x + 102, y + 70 + (k % 2) * 22, z + 100 - k * 14], '#54BC4B', 3);
    s += isoBox(o, x + 140, y + 30, z, 40, 100, 7, '#d6cfbd');
  }
  if (kind === 'vac') {
    const x = 470, y = 420;
    s += isoShadow(o, x, y, 70, 50);
    s += isoBox(o, x, y, 0, 70, 50, 44, '#c2410c', { top: '#d8693b' });
    s += `<path d="M${isoPts(o, [[x, y + 25, 30], [x - 70, y - 10, 90], [x - 150, y - 60, 150]])}" stroke="#4a4a4a" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  return `<svg width="100%" height="100%" ${ROOM_VB} style="position:absolute;left:0;top:0">${s}</svg>`;
}
// 等距的数据库：白色圆柱，正面印标志（读得清：浅底配彩色标志）
function artDb(w = 220, label = '', o = {}) {
  const id = artId('db'), top = o.top || '#ffffff', body = o.body || '#f1efea', rim = o.rim || '#d8d4ca';
  const band = o.band ? `<path d="M10 52 a90 26 0 0 0 180 0 v14 a90 26 0 0 1 -180 0 z" fill="${o.band}"/>` : '';
  return `<svg width="${w}" height="${w * 1.2}" viewBox="0 0 200 240"><defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="${shade(body, -0.04)}"/><stop offset=".45" stop-color="${body}"/><stop offset="1" stop-color="${shade(body, -0.16)}"/></linearGradient></defs>
  <ellipse cx="100" cy="222" rx="100" ry="16" fill="rgba(40,30,20,.14)"/>
  <path d="M10 36 V196 a90 26 0 0 0 180 0 V36 z" fill="url(#${id})"/>
  ${band}
  <path d="M10 104 a90 26 0 0 0 180 0 M10 156 a90 26 0 0 0 180 0" fill="none" stroke="${rim}" stroke-width="3"/>
  <ellipse cx="100" cy="36" rx="90" ry="26" fill="${top}" stroke="${rim}" stroke-width="3"/>
  ${label}
</svg>`;
}
// 应用程序窗口
function artApp(w = 360, hh = 260, title = '') {
  return `<div class="app-w" style="width:${w}px;height:${hh}px"><div class="app-b"><i></i><i></i><i></i><span>${title}</span></div></div>`;
}

// ───── 物件 ─────
const ART = {
  phone: `<svg width="190" height="150" viewBox="0 0 190 150"><ellipse cx="95" cy="140" rx="80" ry="8" fill="rgba(40,30,20,.15)"/><path fill="#5a5a5a" d="M28 128 L42 70 H148 L162 128 Z"/><path fill="#6e6e6e" d="M42 70 H148 L140 58 H50 Z"/><rect x="48" y="44" width="16" height="20" rx="4" fill="#444"/><rect x="126" y="44" width="16" height="20" rx="4" fill="#444"/><path d="M28 128 H162" stroke="#3f3f3f" stroke-width="5"/><circle cx="95" cy="98" r="22" fill="#e8e6e0"/><circle cx="95" cy="98" r="8" fill="#5a5a5a"/><g fill="#5a5a5a">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => { const a = -2.4 + i * 0.5; return `<circle cx="${f1(95 + Math.cos(a) * 15)}" cy="${f1(98 + Math.sin(a) * 15)}" r="2.6"/>`; }).join('')}</g></svg>`,
  receiver: `<svg width="200" height="70" viewBox="0 0 200 70"><path fill="#3e3e3e" d="M8 34 C8 10 30 2 52 10 L62 20 H138 L148 10 C170 2 192 10 192 34 C192 54 176 64 156 60 L144 46 H56 L44 60 C24 64 8 54 8 34 Z"/><path fill="#555" d="M62 20 H138 L144 30 H56 Z"/><ellipse cx="36" cy="40" rx="20" ry="9" fill="#2b2b2b"/><ellipse cx="164" cy="40" rx="20" ry="9" fill="#2b2b2b"/></svg>`,
  wallet: `<svg width="190" height="150" viewBox="0 0 190 150"><path fill="#7a4e2c" d="M14 40 H164 C172 40 178 46 178 54 V128 C178 136 172 142 164 142 H22 C16 142 12 138 12 132 V48 Z"/><path fill="#8f5d36" d="M12 48 C12 36 20 28 32 28 H150 L156 40 H24 C18 40 14 44 12 48 Z"/><rect x="128" y="72" width="54" height="40" rx="10" fill="#a8713a"/><circle cx="148" cy="92" r="7" fill="#e3c38a"/><path d="M40 100 C60 92 80 92 100 100" stroke="#5e3b21" stroke-width="4" fill="none" stroke-dasharray="8 6"/></svg>`,
  moth: `<svg width="60" height="40" viewBox="0 0 60 40"><path fill="#b9b2a4" d="M30 20 C20 4 4 4 6 16 C8 26 20 26 30 20 Z M30 20 C40 4 56 4 54 16 C52 26 40 26 30 20 Z"/><rect x="28" y="12" width="4" height="18" rx="2" fill="#6f6a60"/></svg>`,
  envelope: `<svg width="130" height="92" viewBox="0 0 130 92"><rect x="3" y="3" width="124" height="86" rx="4" fill="#fbf8f1" stroke="#c9c2b2" stroke-width="3"/><path d="M5 6 L65 52 L125 6" fill="none" stroke="#c9c2b2" stroke-width="3"/><rect x="96" y="12" width="20" height="24" fill="#EE2B24"/><rect x="99" y="15" width="14" height="18" fill="none" stroke="#fff" stroke-width="1.5"/></svg>`,
  bulb: `<svg width="120" height="150" viewBox="0 0 120 150"><g stroke="#FAAC19" stroke-width="7" stroke-linecap="round"><path d="M60 4 V18"/><path d="M14 22 L24 32"/><path d="M106 22 L96 32"/><path d="M2 66 H16"/><path d="M104 66 H118"/></g><path fill="#FFD66B" d="M60 30 C82 30 96 46 96 66 C96 82 86 90 80 100 V112 H40 V100 C34 90 24 82 24 66 C24 46 38 30 60 30 Z"/><path fill="#ffe9a8" d="M44 52 C48 44 56 40 64 40 C58 46 52 54 50 64 Z"/><rect x="40" y="112" width="40" height="10" fill="#b5b2ab"/><rect x="42" y="124" width="36" height="9" fill="#9a978f"/><rect x="48" y="135" width="24" height="8" rx="4" fill="#6f6f6f"/></svg>`,
  magnifier: `<svg width="190" height="190" viewBox="0 0 100 100"><path d="M62 62 L92 92" stroke="#3a3a3a" stroke-width="13" stroke-linecap="round"/><circle cx="40" cy="40" r="29" fill="rgba(180,210,240,.35)" stroke="#2156a5" stroke-width="8"/><path d="M24 30 C28 22 36 18 44 18" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`,
  hourglass: `<svg width="120" height="170" viewBox="0 0 120 170"><rect x="10" y="4" width="100" height="14" rx="4" fill="#a8713a"/><rect x="10" y="152" width="100" height="14" rx="4" fill="#a8713a"/><path d="M22 18 H98 C98 58 66 70 66 85 C66 100 98 112 98 152 H22 C22 112 54 100 54 85 C54 70 22 58 22 18 Z" fill="#e9f0f7" stroke="#b9c6d4" stroke-width="3"/><path data-sand-top="1" d="M34 40 H86 C80 60 64 70 60 80 C56 70 40 60 34 40 Z" fill="#FAAC19"/><path data-sand-bot="1" d="M60 100 L84 146 H36 Z" fill="#FAAC19"/></svg>`,
  scissors: `<svg width="240" height="150" viewBox="0 0 240 150"><g fill="none" stroke="#2156a5" stroke-width="12"><circle cx="38" cy="38" r="24"/><circle cx="38" cy="112" r="24"/></g><path fill="#b8bec6" d="M56 50 L230 112 L224 120 L50 64 Z"/><path fill="#9aa1aa" d="M56 100 L230 38 L224 30 L50 86 Z"/><circle cx="118" cy="75" r="7" fill="#6f747b"/></svg>`,
  stop: `<svg width="150" height="150" viewBox="0 0 100 100"><path fill="#bf0000" stroke="#fff" stroke-width="4" d="M30 3 H70 L97 30 V70 L70 97 H30 L3 70 V30 Z"/><text x="50" y="64" text-anchor="middle" font-family="Sans SC" font-weight="900" font-size="40" fill="#fff">停</text></svg>`,
  building: `<svg width="240" height="300" viewBox="0 0 240 300"><ellipse cx="120" cy="292" rx="110" ry="8" fill="rgba(40,30,20,.14)"/><path fill="#c9cfd6" d="M30 40 L120 10 L120 290 L30 280 Z"/><path fill="#aab2bc" d="M120 10 L210 40 L210 280 L120 290 Z"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((r) => [0, 1, 2].map((c) => `<path fill="#e9eef3" d="M${42 + c * 26} ${f1(64 + r * 28 - c * 8.6)} l18 -6 v16 l-18 6 z"/><path fill="#8e98a4" d="M${134 + c * 26} ${f1(44 + r * 28 + c * 8.6)} l18 6 v16 l-18 -6 z"/>`).join('')).join('')}</svg>`,
  handvac: `<svg width="220" height="120" viewBox="0 0 220 120"><path d="M40 60 H190" stroke="#4a4a4a" stroke-width="10" stroke-linecap="round"/><path fill="#3a3a3a" d="M186 44 H214 L210 76 H190 Z"/><rect x="4" y="36" width="70" height="48" rx="14" fill="#c2410c"/><rect x="14" y="46" width="30" height="28" rx="6" fill="#e8a07a"/><path d="M60 36 C60 18 30 14 22 30" stroke="#3a3a3a" stroke-width="8" fill="none"/></svg>`,
  coin: `<svg width="90" height="60" viewBox="0 0 90 60"><ellipse cx="45" cy="38" rx="40" ry="16" fill="#c27a12"/><rect x="5" y="26" width="80" height="12" fill="#c27a12"/><ellipse cx="45" cy="26" rx="40" ry="16" fill="#FAAC19"/><ellipse cx="45" cy="26" rx="28" ry="10" fill="none" stroke="#e3920f" stroke-width="3"/></svg>`,
  wrench: `<svg width="120" height="120" viewBox="0 0 100 100"><path fill="#8e98a4" d="M70 8 C58 6 48 16 50 28 L12 66 C6 72 6 82 12 88 C18 94 28 94 34 88 L72 50 C84 52 94 42 92 30 L80 42 L64 36 L58 20 Z"/><circle cx="22" cy="78" r="5" fill="#fff"/></svg>`,
  holly: `<svg width="120" height="80" viewBox="0 0 120 80"><path fill="#2f7a3a" d="M60 40 C46 30 30 34 14 22 C20 36 12 44 24 52 C34 44 48 48 60 40 Z M60 40 C74 30 90 34 106 22 C100 36 108 44 96 52 C86 44 72 48 60 40 Z"/><circle cx="54" cy="44" r="8" fill="#bf0000"/><circle cx="66" cy="46" r="8" fill="#d42020"/><circle cx="60" cy="34" r="8" fill="#bf0000"/></svg>`,
  lock: `<svg width="170" height="210" viewBox="0 0 120 150"><path data-shackle="1" d="M32 72 V42 a28 28 0 0 1 56 0 V72" fill="none" stroke="#8e98a4" stroke-width="13" stroke-linecap="round"/><path data-open="1" d="M88 72 V26 a28 28 0 0 0 -56 0 V40" fill="none" stroke="#8e98a4" stroke-width="13" stroke-linecap="round" opacity="0"/><rect x="12" y="66" width="96" height="78" rx="12" fill="#e0a43a"/><rect x="12" y="66" width="96" height="16" rx="8" fill="#f0bd5c"/><circle cx="60" cy="100" r="10" fill="#7a5410"/><rect x="55" y="104" width="10" height="22" rx="4" fill="#7a5410"/></svg>`,
  server: `<svg width="180" height="230" viewBox="0 0 180 230"><ellipse cx="90" cy="222" rx="84" ry="8" fill="rgba(40,30,20,.15)"/><rect x="18" y="10" width="144" height="206" rx="10" fill="#3b3f4a"/>${[0, 1, 2, 3].map((i) => `<rect x="30" y="${24 + i * 48}" width="120" height="38" rx="5" fill="#4d5361"/><circle cx="134" cy="${43 + i * 48}" r="5" fill="#54BC4B"/><rect x="42" y="${38 + i * 48}" width="60" height="8" rx="3" fill="#6b7280"/>`).join('')}</svg>`,
  box: `<svg width="200" height="190" viewBox="0 0 200 190"><ellipse cx="100" cy="178" rx="90" ry="10" fill="rgba(40,30,20,.14)"/><path fill="#d8a15f" d="M14 60 L100 92 V178 L14 146 Z"/><path fill="#c08744" d="M186 60 L100 92 V178 L186 146 Z"/><path fill="#e6b97d" d="M14 60 L100 28 L186 60 L100 92 Z"/><path d="M57 44 L143 76" stroke="#f3d6a8" stroke-width="12"/></svg>`,
  gear: `<svg width="170" height="170" viewBox="0 0 100 100"><path fill="#8e98a4" d="${(() => { let d = ''; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; const p = (r, da) => `${f1(50 + Math.cos(a + da) * r)} ${f1(50 + Math.sin(a + da) * r)}`; d += (i ? 'L' : 'M') + p(34, -0.2) + ' L' + p(44, -0.14) + ' L' + p(44, 0.14) + ' L' + p(34, 0.2) + ' '; } return d + 'Z'; })()}"/><circle cx="50" cy="50" r="14" fill="#fff"/></svg>`,
  zz: `<svg width="90" height="70" viewBox="0 0 90 70"><g fill="none" stroke="#2156a5" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"><path d="M6 40 H32 L6 66 H32"/><path d="M42 20 H62 L42 40 H62"/><path d="M70 4 H84 L70 18 H84"/></g></svg>`,
  arrowDown: `<svg width="70" height="90" viewBox="0 0 70 90"><path fill="#2156a5" d="M24 0 H46 V50 H66 L35 88 L4 50 H24 Z"/></svg>`,
  pencil: `<svg width="90" height="90" viewBox="0 0 100 100"><path fill="#F68A21" d="M70 10 L90 30 L38 82 L18 62 Z"/><path fill="#EE2B24" d="M70 10 L80 0 L100 20 L90 30 Z"/><path fill="#f1d3a8" d="M18 62 L38 82 L8 92 Z"/><path fill="#1c1c1c" d="M8 92 L13 77 L23 87 Z"/></svg>`,
  eye: `<svg width="100" height="64" viewBox="0 0 100 64"><path fill="#fff" stroke="#2156a5" stroke-width="6" d="M4 32 C24 4 76 4 96 32 C76 60 24 60 4 32 Z"/><circle cx="50" cy="32" r="15" fill="#2156a5"/><circle cx="55" cy="27" r="5" fill="#fff"/></svg>`,
  tree24: `<svg width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="92" fill="#fff" stroke="#1c1c1c" stroke-width="8"/>${[...Array(24)].map((_, i) => { const a = i / 24 * Math.PI * 2 - Math.PI / 2, r1 = i % 6 ? 80 : 72; return `<path d="M${f1(100 + Math.cos(a) * r1)} ${f1(100 + Math.sin(a) * r1)} L${f1(100 + Math.cos(a) * 86)} ${f1(100 + Math.sin(a) * 86)}" stroke="#1c1c1c" stroke-width="${i % 6 ? 3 : 6}"/>`; }).join('')}<path data-sweep="1" d="M100 100 V18 A82 82 0 0 1 100 18 Z" fill="rgba(250,172,25,.45)"/><path data-hand="1" d="M100 100 V26" stroke="#bf0000" stroke-width="7" stroke-linecap="round"/><circle cx="100" cy="100" r="8" fill="#1c1c1c"/></svg>`,
};
const flagDE = `<svg width="120" height="72" viewBox="0 0 5 3"><rect width="5" height="1" fill="#000"/><rect y="1" width="5" height="1" fill="#DD0000"/><rect y="2" width="5" height="1" fill="#FFCE00"/></svg>`;
function star(cx, cy, r, n = 7) { let d = ''; for (let i = 0; i < n * 2; i++) { const a = i * Math.PI / n - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; d += (i ? 'L' : 'M') + f1(cx + Math.cos(a) * rr) + ' ' + f1(cy + Math.sin(a) * rr); } return d + 'Z'; }
const flagAU = `<svg width="120" height="60" viewBox="0 0 60 30"><rect width="60" height="30" fill="#012169"/><path d="M0 0 L30 15 M30 0 L0 15" stroke="#fff" stroke-width="3"/><path d="M0 0 L30 15 M30 0 L0 15" stroke="#C8102E" stroke-width="1.2"/><path d="M15 0 V15 M0 7.5 H30" stroke="#fff" stroke-width="5"/><path d="M15 0 V15 M0 7.5 H30" stroke="#C8102E" stroke-width="3"/><path fill="#fff" d="${star(15, 22.5, 3.6)} ${star(45, 24.5, 1.6)} ${star(39, 13.5, 1.6)} ${star(45, 5, 1.6)} ${star(51, 11.5, 1.6)} ${star(48, 17, 0.9, 5)}"/></svg>`;

// ───── M1 坦克：斜视（侧面正对，顶面与远侧往右上退），和等距的场景一样看得到顶 ─────
// 退深方向 D = (64, −38)：每个箱形部件画「近侧面 + 顶面 + 前斜面」，由远到近叠
function artTank(w = 1000) {
  const D = [64, -38];
  const sh = (pts) => pts.map(([x, y]) => `${x + D[0]} ${y + D[1]}`).join(' L');
  let wheels = '';
  for (let i = 0; i < 7; i++) { const x = 214 + i * 88; wheels += `<circle cx="${x}" cy="356" r="31" fill="#4d4c45"/><circle cx="${x}" cy="356" r="21" fill="#6d6b61"/><circle cx="${x}" cy="356" r="7" fill="#3a3934"/>`; }
  let tread = '';
  for (let i = 0; i < 46; i++) tread += `<rect x="${130 + i * 15.4}" y="384" width="9" height="9" fill="#24231f"/>`;
  let skirt = '';
  for (let i = 1; i < 9; i++) skirt += `<path d="M${118 + i * 82} 276 V336" stroke="#a3906a" stroke-width="3"/>`;
  let grille = '';
  for (let i = 0; i < 7; i++) grille += `<path d="M${170 + i * 18} 222 L${206 + i * 18} 201" stroke="#c4b285" stroke-width="5"/>`;
  const track = 'M150 300 H812 Q858 302 866 336 L842 386 Q836 396 818 396 H160 Q144 396 136 386 L104 336 Q114 302 150 300 Z';
  return `<svg width="${w * 1.06}" height="${w * 0.42}" viewBox="0 0 1060 420">
  <ellipse cx="530" cy="402" rx="480" ry="16" fill="rgba(40,30,20,.16)"/>
  <path fill="#2a2925" transform="translate(${D[0]} ${D[1]})" d="${track}"/>
  <path fill="#dccb9f" d="M128 230 L808 230 L902 262 L${sh([[902, 262], [808, 230], [128, 230]])} Z"/>
  ${grille}
  <path fill="#c8b386" d="M226 166 L306 166 L${sh([[306, 166], [226, 166]])} Z"/>
  <path fill="#bba477" d="M232 166 H306 V224 H226 Z"/>
  <g stroke="#8f7c56" stroke-width="3"><path d="M232 182 H306 M232 198 H306 M232 212 H306 M252 166 V224 M278 166 V224"/></g>
  <path fill="#d9c79b" d="M300 178 L792 178 L${sh([[792, 178], [300, 178]])} Z"/>
  <path fill="#b39d6f" d="M792 178 L${sh([[792, 178], [776, 228]])} L776 228 Z"/>
  <path fill="#c0a97b" d="M300 178 H792 L776 228 H286 L270 200 Z"/>
  <path fill="#ad9668" d="M270 200 L286 228 H776 L782 210 H276 Z"/>
  <ellipse cx="470" cy="156" rx="30" ry="9" fill="#bfa97c"/>
  <rect x="556" y="132" width="68" height="22" fill="#b39d6f"/><ellipse cx="590" cy="154" rx="34" ry="10" fill="#b39d6f"/><ellipse cx="590" cy="132" rx="34" ry="11" fill="#cdb98e"/>
  <path d="M612 128 H702" stroke="#4a4a44" stroke-width="7" stroke-linecap="round"/>
  <path d="M342 158 L304 40 M366 152 L352 62" stroke="#55534c" stroke-width="3"/>
  <path fill="#cdb88d" d="M128 230 H808 L902 262 L872 274 H112 Z"/>
  <rect x="868" y="258" width="16" height="8" fill="#f6efd8"/>
  <path fill="#33322d" d="${track}"/>
  ${tread}
  <circle cx="142" cy="334" r="27" fill="#4d4c45"/><circle cx="142" cy="334" r="12" fill="#2b2a26"/>
  <circle cx="836" cy="334" r="25" fill="#4d4c45"/><circle cx="836" cy="334" r="10" fill="#2b2a26"/>
  ${wheels}
  <path fill="#c3ad81" d="M112 270 H846 L872 302 L852 340 H124 L106 302 Z"/>
  <path fill="#a8936a" d="M106 302 H872 L852 340 H124 Z"/>
  ${skirt}
  <circle cx="700" cy="204" r="9" fill="#55534c"/>
  <rect x="818" y="164" width="36" height="42" rx="4" fill="#a38d61"/>
  <rect x="852" y="176" width="70" height="16" fill="#a28c5f"/>
  <rect x="920" y="172" width="40" height="24" rx="5" fill="#968155"/>
  <rect x="958" y="179" width="74" height="12" fill="#a28c5f"/>
  <rect x="1030" y="177" width="12" height="16" rx="2" fill="#7f6c46"/>
</svg>`;
}
// 车载电脑的小屏（放在坦克旁的引出框里）
function artCrt(w = 300) {
  return `<svg width="${w}" height="${w * 0.86}" viewBox="0 0 300 258"><rect x="10" y="10" width="280" height="210" rx="18" fill="#5a5f55"/><rect x="34" y="32" width="232" height="164" rx="10" fill="#122019"/><rect x="100" y="220" width="100" height="20" fill="#4a4f46"/><rect x="60" y="238" width="180" height="14" rx="5" fill="#4a4f46"/></svg>`;
}
