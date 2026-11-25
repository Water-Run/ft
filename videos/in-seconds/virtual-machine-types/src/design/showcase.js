/* SPDX-License-Identifier: GPL-3.0-or-later */
// 定稿陈列页：放大关键帧，同一时刻只播放一段音频。
const players = [...document.querySelectorAll('audio')];
for (const player of players) {
  player.addEventListener('play', () => {
    for (const other of players) if (player !== other) other.pause();
  });
}

const dialog = document.getElementById('lightbox');
const image = dialog.querySelector('img');
for (const button of document.querySelectorAll('[data-image]')) {
  button.addEventListener('click', () => {
    image.src = button.dataset.image;
    image.alt = button.querySelector('img').alt;
    document.getElementById('image-label').textContent = button.getAttribute('aria-label').replace(/^放大/, '');
    dialog.showModal();
  });
}
document.getElementById('close-image').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
