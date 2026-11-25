/* SPDX-License-Identifier: GPL-3.0-or-later */
// 生成定稿陈列页 out/showcase/index.html：只陈列选定的方向与第 7 稿，不设选项。
// 先运行 tools/audition_audio.py 生成试听音频。
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { snapshot } = require('../../../../kit/tools/script-review');
const project = require('../project.json');
const { layoutScript, strip, TOTAL } = require('../src/js/script');
const { directions, final, music, questions, rounds, sample, sections, voices } = require('../src/design/audition');
const { captureFrames } = require('./capture');

const film = path.resolve(__dirname, '..');
const design = path.join(film, 'src/design');
const audition = path.join(film, 'out/audition');
const out = path.join(film, 'out/showcase');
const layout = layoutScript();
const draft = snapshot(film, project, 'zh').hash;

const html = (value) => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);
const time = (s) => {
  const whole = Math.floor(s);
  const tenth = Math.round((s - whole) * 10);
  return String(Math.floor(whole / 60)).padStart(2, '0') + ':' + String(whole % 60).padStart(2, '0') + (tenth ? '.' + tenth : '');
};
const line = (id) => `<span class="cue"><span class="cue-id">${id}</span> ${html(strip(layout.cues[id].cap))}</span>`;

const visual = directions.find(option => option.id === final.visual.id);
const voice = voices.find(option => option.id === final.voice.id);
const score = music.find(option => option.id === final.music.id);
const shots = visual.shots.map(shot => ({ ...shot, at: layout.cues[shot.cue].start, scene: layout.cues[shot.cue].scene }))
  .sort((a, b) => a.at - b.at);

function figure(shot) {
  return `<figure>
    <button class="zoom" type="button" data-image="frames/${shot.id}.png" aria-label="放大${html(shot.name)}">
      <img src="frames/${shot.id}.png" width="1920" height="1080" alt="${html(shot.alt)}" loading="lazy">
    </button><figcaption><span>${html(shot.name)}</span><span class="time">${time(Math.floor(shot.at))} · ${shot.cue}</span></figcaption>
  </figure>`;
}

function story() {
  return layout.scenes.map(({ id, start, end }) => {
    const [title, detail] = sections[id];
    const cues = layout.order.filter(cue => layout.cues[cue].scene === id && !layout.cues[cue].silent);
    const own = shots.filter(shot => shot.scene === id);
    return `<article class="chapter" id="chapter-${id}">
      <p class="time">${time(start)}<span>—</span>${time(end)}</p>
      <div><h3>${html(title)}</h3><p class="chapter-detail">${html(detail)}</p>
      ${cues.length ? `<p class="reading">${cues.map(line).join(' ')}</p>` : ''}
      ${own.length ? `<div class="frames${own.length === 1 ? ' one' : ''}">${own.map(figure).join('')}</div>` : ''}</div>
    </article>`;
  }).join('');
}

function plan() {
  const card = (kind, title, spec, why, extra) => `<article>
    <p class="kind">${kind}</p><h3>${html(title)}</h3><p class="spec">${html(spec)}</p>
    <p class="why">${html(why)}</p>${extra}</article>`;
  return [
    card('视觉', `${visual.id.toUpperCase()} · ${visual.name}`, `${shots.length} 张关键帧 · 1920×1080`, final.visual.why,
      `<p class="spec">${html(visual.description)}</p>`),
    card('配音', `${voice.name}`, `${voice.voice} · 语速 +6%`, final.voice.why,
      `<audio controls preload="metadata" src="audio/voice.mp3" aria-label="${html(voice.name)}试听"></audio>
      <details><summary>试听台词</summary><p class="reading">${sample.map(line).join(' ')}</p></details>`),
    card('配乐', `${score.name}`, '原创合成 · 约 60 秒小样', final.music.why,
      `<p class="spec">${html(score.detail)}</p>
      <audio controls preload="metadata" src="audio/music.mp3" aria-label="${html(score.name)}试听"></audio>`),
  ].join('');
}

function roundsHtml() {
  return rounds.map((round, index) => {
    const items = round.items === 'questions' ? questions : round.items;
    const last = index === rounds.length - 1;
    return `<details class="round"${last ? ' open' : ''}>
      <summary><span class="draft">${html(round.draft)}</span><span class="focus">${html(round.focus)}</span><span class="count">${items.length} 问</span></summary>
      <ol class="questions">${items.map(({ cues, q, a }) => `<li>
        <p class="where">${html(cues)}</p><p class="ask">${html(q)}</p><p class="answer">${html(a)}</p></li>`).join('')}</ol>
    </details>`;
  }).join('');
}

async function main() {
  assert.equal(layout.total, TOTAL);
  assert.deepEqual(layout.problems, []);
  const manifest = JSON.parse(await fs.readFile(path.join(audition, 'audio/voices.json'), 'utf8'));
  assert.equal(manifest.speech, sample.map(id => layout.cues[id].tts).join(' '), '试听台词已改变，请先运行 audition_audio.py');
  await fs.mkdir(path.join(out, 'audio'), { recursive: true });
  await fs.copyFile(path.join(audition, `audio/voice-${voice.id}.mp3`), path.join(out, 'audio/voice.mp3'));
  await fs.copyFile(path.join(audition, `audio/music-${score.id}.mp3`), path.join(out, 'audio/music.mp3'));
  await captureFrames(shots.map(shot => ({ id: shot.id, left: TOTAL - Math.floor(shot.at) })), path.join(out, 'frames'));

  const spoken = layout.order.filter(id => !layout.cues[id].silent);
  const narration = spoken.reduce((sum, id) => sum + layout.cues[id].d, 0);
  const terms = new Set(spoken.flatMap(id => [...layout.cues[id].cap.matchAll(/\*([^*]+)\*/g)].map(m => m[1])));
  const hero = shots.find(shot => shot.id === 'a-compare');
  const values = {
    TITLE: html(project.titles.zh), DRAFT: draft.slice(0, 12), SCRIPT_LINK: `../../review/script.zh.${draft}.md`,
    SPOKEN: spoken.length, NARRATION: Math.round(narration), TERMS: terms.size,
    HERO_TIME: `${time(Math.floor(hero.at))} · ${hero.cue}`,
    PLAN: plan(), STORY: story(), ROUNDS: roundsHtml(),
  };
  const template = await fs.readFile(path.join(design, 'showcase.html'), 'utf8');
  await fs.writeFile(path.join(out, 'index.html'), template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
    assert(Object.hasOwn(values, key), '未知陈列页字段 ' + key);
    return values[key];
  }));
  for (const file of ['audition.css', 'showcase.css', 'showcase.js']) await fs.copyFile(path.join(design, file), path.join(out, file));
  console.log(path.join(out, 'index.html'));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
