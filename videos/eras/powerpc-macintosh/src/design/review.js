'use strict';
const data = JSON.parse(document.querySelector('#review-data').textContent);
const assets = data.assets;
const byId = id => document.getElementById(id);
const selectAll = selector => [...document.querySelectorAll(selector)];
let track = 'A', frameIndex = 0;
function renderFrame() {
  const group = data.frames[track], current = group[frameIndex];
  const tag = track + (frameIndex + 1);
  for (const button of selectAll('[data-track]')) button.setAttribute('aria-pressed', button.dataset.track === track);
  byId('frame-image').src = assets['frames/' + tag.toLowerCase() + '.jpg'];
  byId('frame-image').alt = current.title + '。' + current.desc;
  byId('frame-context').textContent = tag + '  /  ' + current.date;
  byId('frame-title').textContent = current.title;
  byId('frame-desc').textContent = current.desc;
  byId('thumbs').replaceChildren(...group.map((item, i) => {
    const button = document.createElement('button');
    const img = document.createElement('img');
    img.src = assets['frames/' + track.toLowerCase() + (i+1) + '.jpg'];
    img.alt = '';
    const index = document.createElement('i');
    index.textContent = track + (i+1) + ' ';
    button.append(img, index, document.createTextNode(item.title));
    button.setAttribute('aria-pressed', i === frameIndex);
    button.addEventListener('click', () => { frameIndex = i; renderFrame(); byId('thumbs').children[i].focus({preventScroll:true}); });
    return button;
  }));
  byId('full-frame').src = byId('frame-image').src;
  byId('full-frame').alt = byId('frame-image').alt;
  byId('full-caption').textContent = tag + ' · ' + current.title;
}
for (const button of selectAll('[data-track]')) button.onclick = () => {track = button.dataset.track; frameIndex = 0; renderFrame();};
for (const button of selectAll('[data-view]')) button.onclick = () => {
  byId('product').src = assets['photos/' + button.dataset.view + '.webp'];
  byId('product').alt = '1998 年邦迪蓝 iMac ' + button.textContent + '实物照片';
  for (const other of selectAll('[data-view]')) other.setAttribute('aria-pressed', other === button);
};
function move(step) {
  const position = ((track === 'A' ? 0 : 3) + frameIndex + step + 6) % 6;
  track = position < 3 ? 'A' : 'B'; frameIndex = position % 3; renderFrame();
}
const dialog = byId('lightbox');
byId('open-frame').onclick = () => dialog.showModal();
byId('close-dialog').onclick = () => dialog.close();
byId('previous').onclick = () => move(-1); byId('next').onclick = () => move(1);
dialog.addEventListener('click', e => { if(e.target === dialog) dialog.close(); });
dialog.addEventListener('keydown', e => { if(e.key === 'ArrowRight') {e.preventDefault();move(1);} if(e.key === 'ArrowLeft') {e.preventDefault();move(-1);} });
byId('cue-toggle').onclick = () => {
  const active = document.querySelector('.manuscript').classList.toggle('ids');
  byId('cue-toggle').setAttribute('aria-pressed', active);
  byId('cue-toggle').textContent = active ? '隐藏句号' : '显示句号';
};
for (const player of selectAll('audio')) {
  player.addEventListener('play', () => { for(const other of selectAll('audio')) if(other !== player) other.pause(); });
}
const choices = ['visual','voice','music'], storageKey = 'ppc-review-' + data.hash;
let saved = {};
try { saved = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch {}
for (const radio of selectAll('input[type=radio]')) radio.checked = saved[radio.name] === radio.value;
byId('notes').value = typeof saved.notes === 'string' ? saved.notes : '';
function update(save) {
  const result = {notes:byId('notes').value};
  for (const key of choices) {
    result[key] = document.querySelector('input[name="'+key+'"]:checked')?.value || '';
    byId('chosen-'+key).textContent = result[key] || '待选';
  }
  if (save) {
    byId('copy-status').textContent = '';
    try {localStorage.setItem(storageKey, JSON.stringify(result));} catch {document.querySelector('.save-note').textContent = '此浏览器未保存选择。可直接复制意见。';}
  }
  return result;
}
selectAll('input[type=radio]').forEach(radio => radio.addEventListener('change',() => update(true)));
byId('notes').addEventListener('input', () => update(true));
byId('copy').onclick = async () => {
  const v = update(false);
  const text = ['《PowerPC 时代的麦金塔》· 中文稿 '+data.hash.slice(0,8),'画面　'+(v.visual || '待选'),'配音　'+(v.voice || '待选'),'配乐　'+(v.music || '待选'),'文案与修改意见　'+(v.notes.trim() || '待填写')].join('\n');
  try { await navigator.clipboard.writeText(text); }
  catch {
    const box = document.createElement('textarea'); box.value = text;
    byId('feedback').append(box); box.select();
    if (!document.execCommand('copy')) {byId('copy-status').textContent = '请复制下方已选中的文字。';return;}
    box.remove(); byId('copy').focus();
  }
  byId('copy-status').textContent = '已复制，可贴回会话。';
};
byId('product').src = assets['photos/profile.webp'];
renderFrame(); update(false);
