/* SPDX-License-Identifier: GPL-3.0-or-later */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { captureFrames } = require('./capture');
const { snapshot } = require('../../../../kit/tools/script-review');
const project = require('../project.json');
const { layoutScript, strip, TOTAL } = require('../src/js/script');
const { directions, music, pending, previous, questions, sample, sections, voices } = require('../src/design/audition');

const film = path.resolve(__dirname, '..');
const design = path.join(film, 'src/design');
// 审片页只陈列最初供选择的关键帧；extra 为选定后补画的，进定稿陈列页。
const choices = directions.map(option => ({ ...option, shots: option.shots.filter(shot => !shot.extra) }));
const out = path.join(film, 'out/audition');
const layout = layoutScript();
const draft = snapshot(film, project, 'zh').hash;
const html = (value) => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);
const time = (s) => {
  const whole = Math.floor(s);
  return String(Math.floor(whole / 60)).padStart(2, '0') + ':' +
    String(whole % 60).padStart(2, '0') + (s > whole ? '.5' : '');
};
const radio = (group, id, title) => `
  <label class="select"><input type="radio" name="${group}" value="${id.toUpperCase()} · ${html(title)}">选 ${id.toUpperCase()}</label>`;
const shotTime = (shot) => Math.floor(layout.cues[shot.cue].start);

// 上一稿的逐句表来自工具导出的校对稿；按字幕原文比对，标出本稿新写或改写的句子。
async function previousDraft() {
  const text = await fs.readFile(path.join(film, 'review', `script.zh.${previous}.md`), 'utf8');
  const table = text.split('## 逐句校对')[1].split('## 多音字清单')[0];
  return [...table.matchAll(/^\| ([a-z]+\d*) \| (.+) \|$/gm)]
    .filter(([, id]) => id !== 'title' && !/^（无旁白/.test(id))
    .map(([, id, cap]) => ({ id, cap })).filter(({ cap }) => !cap.startsWith('（无旁白'));
}
let before = new Set();
let highlight = false;
const isNew = (id) => !before.has(layout.cues[id].cap);
const line = (id, mark = true) => `<span class="cue${mark && highlight && isNew(id) ? ' revised' : ''}"><span class="cue-id">${id}</span> ${html(strip(layout.cues[id].cap))}</span>`;

function story() {
  return layout.scenes.map(({ id, start, end }) => {
    const [title, detail] = sections[id];
    const cues = layout.order.filter(cue => layout.cues[cue].scene === id && !layout.cues[cue].silent);
    return `<article class="chapter" id="chapter-${id}">
      <p class="time">${time(start)}<span>—</span>${time(end)}</p>
      <div><h3>${html(title)}</h3><p class="chapter-detail">${html(detail)}</p>
      ${cues.length ? `<p class="reading">${cues.map(id => line(id)).join(' ')}</p>` : ''}</div>
    </article>`;
  }).join('');
}

function interrogation() {
  return `<ol class="questions">${questions.map(({ cues, q, a }) => `<li>
    <p class="where">${html(cues)}</p><p class="ask">${html(q)}</p><p class="answer">${html(a)}</p></li>`).join('')}</ol>`;
}

function removed(old) {
  const now = new Set(layout.order.map(id => layout.cues[id].cap));
  const gone = old.filter(({ cap }) => !now.has(cap));
  return `<details class="removed"><summary>第 1 稿中已删去或改写的 ${gone.length} 句</summary>
    <p class="reading">${gone.map(({ id, cap }) => `<span class="cue"><span class="cue-id">${id}</span> ${html(cap.replace(/\*/g, ''))}</span>`).join(' ')}</p></details>`;
}

function pictures() {
  return choices.map(option => `<article class="visual-option">
    <div class="choice-title"><span class="letter">${option.id.toUpperCase()}</span><h3>${html(option.name)}</h3>${radio('visual', option.id, option.name)}</div>
    <p>${html(option.description)}</p>
    <div class="screens">${option.shots.map(shot => `<figure>
      <button class="zoom" type="button" data-image="frames/${shot.id}.png" aria-label="放大${html(shot.name)}">
        <img src="frames/${shot.id}.png" width="1920" height="1080" alt="${html(shot.alt)}" loading="lazy">
      </button><figcaption><span>${html(shot.name)}</span><span class="time">${time(shotTime(shot))} · ${shot.cue}</span></figcaption>
    </figure>`).join('')}</div>
  </article>`).join('');
}

function audioOptions(options, group) {
  return options.map(option => `<article class="audio-option">
    <div class="choice-title"><span class="letter">${option.id.toUpperCase()}</span><h3>${html(option.name)}</h3>${radio(group, option.id, option.name)}</div>
    <p>${html(option.voice ?? option.detail)}</p>
    <audio controls preload="metadata" src="audio/${group}-${option.id}.mp3" aria-label="${html(option.name)}试听"></audio>
  </article>`).join('');
}

async function main() {
  assert.equal(layout.total, TOTAL);
  assert.deepEqual(layout.problems, []);
  await fs.mkdir(path.join(out, 'frames'), { recursive: true });
  const voiceManifest = JSON.parse(await fs.readFile(path.join(out, 'audio/voices.json'), 'utf8'));
  assert.deepEqual(voiceManifest.clips, voices, '音色已改变，请重做试听');
  assert.equal(voiceManifest.speech, sample.map(id => layout.cues[id].tts).join(' '), '试听台词已改变，请重做试听');
  for (const [group, options] of [['voice', voices], ['music', music]]) {
    for (const { id } of options) assert((await fs.stat(path.join(out, 'audio', `${group}-${id}.mp3`))).size > 1024);
  }
  const old = await previousDraft();
  before = new Set(old.map(({ cap }) => cap));
  await captureFrames(choices.flatMap(option => option.shots)
    .map(shot => ({ id: shot.id, left: TOTAL - shotTime(shot) })), path.join(out, 'frames'));
  const spoken = layout.order.filter(id => !layout.cues[id].silent);
  const revised = spoken.filter(isNew).length;
  // 全部重写时逐句高亮没有信息量，改为一句说明。
  highlight = revised < spoken.length;
  const values = {
    TITLE: html(project.titles.zh), DRAFT: draft.slice(0, 12),
    SCRIPT_LINK: `../../review/script.zh.${draft}.md`,
    STORY: story(), VISUALS: pictures(), SAMPLE: sample.map(id => line(id, false)).join(' '),
    PREVIOUS: previous.slice(0, 12), QUESTIONS: interrogation(), REMOVED: removed(old),
    PENDING: pending.map(item => `<li>${html(item)}</li>`).join(''),
    REVISION: highlight
      ? `${spoken.length} 句中 <mark class="revised-key">${revised} 句为新写或改写</mark>`
      : `${spoken.length} 句全部重写，第 1 稿原句无一照搬`, TERMS: new Set(spoken.flatMap(id => [...layout.cues[id].cap.matchAll(/\*([^*]+)\*/g)].map(m => m[1]))).size,
    VOICES: audioOptions(voices, 'voice'), MUSIC: audioOptions(music, 'music'),
  };
  const template = await fs.readFile(path.join(design, 'audition.html'), 'utf8');
  await fs.writeFile(path.join(out, 'index.html'), template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
    assert(Object.hasOwn(values, key), '未知审片页字段 ' + key);
    return values[key];
  }));
  for (const file of ['audition.css', 'review-ui.js']) await fs.copyFile(path.join(design, file), path.join(out, file));
  console.log(path.join(out, 'index.html'));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
