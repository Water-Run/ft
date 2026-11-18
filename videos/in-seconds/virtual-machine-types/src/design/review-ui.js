/* SPDX-License-Identifier: GPL-3.0-or-later */
const form = document.getElementById('review');
const notes = document.getElementById('notes');
const draft = document.body.dataset.draft;
const key = 'ft-vm-audition:' + draft;
const groups = { visual: '视觉', voice: '配音', music: '配乐' };
const choices = document.getElementById('choices');

function readChoices() {
  return Object.fromEntries(Object.keys(groups).map(name => [name, form.elements[name].value]));
}

function describe(selected) {
  return Object.entries(groups).map(([name, label]) => `${label} ${selected[name] || '待选'}`);
}

function update() {
  const selected = readChoices();
  choices.textContent = describe(selected).join('　/　');
  try {
    localStorage.setItem(key, JSON.stringify({ selected, notes: notes.value }));
  } catch {
    // The current session remains usable when a file URL has no persistent storage.
  }
}

try {
  const saved = JSON.parse(localStorage.getItem(key) || 'null');
  if (saved) {
    for (const name of Object.keys(groups)) form.elements[name].value = saved.selected[name] || '';
    notes.value = saved.notes || '';
  }
} catch {
  // Ignore preferences from an incompatible browser or an incomplete write.
}
form.addEventListener('input', update);
form.addEventListener('submit', event => event.preventDefault());
update();

document.getElementById('copy').addEventListener('click', async () => {
  const status = document.getElementById('copy-status');
  const field = document.getElementById('copy-fallback');
  field.value = [`《192 秒了解虚拟机》审片反馈 · 稿本 ${draft}`,
    ...describe(readChoices()), notes.value.trim()].filter(Boolean).join('\n');
  try {
    await navigator.clipboard.writeText(field.value);
    field.hidden = true;
    status.textContent = '已复制。';
  } catch {
    field.hidden = false;
    field.focus();
    field.select();
    if (document.execCommand('copy')) {
      field.hidden = true;
      status.textContent = '已复制。';
    } else {
      status.textContent = '请复制已选中的文字。';
    }
  }
});

const players = [...document.querySelectorAll('audio')];
for (const player of players) {
  player.addEventListener('play', () => {
    for (const other of players) if (player !== other) other.pause();
  });
}

const dialog = document.getElementById('lightbox');
const image = dialog.querySelector('img');
const close = document.getElementById('close-image');
for (const button of document.querySelectorAll('[data-image]')) {
  button.addEventListener('click', () => {
    image.src = button.dataset.image;
    image.alt = button.querySelector('img').alt;
    document.getElementById('image-label').textContent = button.getAttribute('aria-label').replace(/^放大/, '');
    dialog.showModal();
  });
}
close.addEventListener('click', () => dialog.close());
