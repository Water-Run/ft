/* SPDX-License-Identifier: GPL-3.0-or-later */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer-core');
const { CHROME } = require('../../../../kit/tools/lib');
const { snapshot } = require('../../../../kit/tools/script-review');
const project = require('../project.json');
const { layoutScript, strip, TOTAL } = require('../src/js/script');
const { directions, music, sample, sections, voices } = require('../src/design/audition');

const film = path.resolve(__dirname, '..');
const design = path.join(film, 'src/design');
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
const line = (id) => `<span class="cue"><span class="cue-id">${id}</span> ${html(strip(layout.cues[id].cap))}</span>`;

function story() {
  return layout.scenes.map(({ id, start, end }) => {
    const [title, detail] = sections[id];
    const cues = layout.order.filter(cue => layout.cues[cue].scene === id && !layout.cues[cue].silent);
    return `<article class="chapter" id="chapter-${id}">
      <p class="time">${time(start)}<span>—</span>${time(end)}</p>
      <div><h3>${html(title)}</h3><p class="chapter-detail">${html(detail)}</p>
      ${cues.length ? `<p class="reading">${cues.map(line).join(' ')}</p>` : ''}</div>
    </article>`;
  }).join('');
}

function pictures() {
  return directions.map(option => `<article class="visual-option">
    <div class="choice-title"><span class="letter">${option.id.toUpperCase()}</span><h3>${html(option.name)}</h3>${radio('visual', option.id, option.name)}</div>
    <p>${html(option.description)}</p>
    <div class="screens">${option.shots.map(shot => `<figure>
      <button class="zoom" type="button" data-image="frames/${shot.id}.png" aria-label="放大${html(shot.name)}">
        <img src="frames/${shot.id}.png" width="1920" height="1080" alt="${html(shot.alt)}" loading="lazy">
      </button><figcaption><span>${html(shot.name)}</span><span class="time">${html(shot.time)}</span></figcaption>
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

async function captureFrames() {
  const browser = await puppeteer.launch({ executablePath: CHROME(), headless: true });
  try {
    const page = await browser.newPage();
    page.on('pageerror', error => { throw error; });
    await page.setViewport({ width: 1920, height: 1080 });
    for (const shot of directions.flatMap(option => option.shots)) {
      const url = pathToFileURL(path.join(design, 'frame.html'));
      url.searchParams.set('id', shot.id);
      await page.goto(url.href, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      const clipped = await page.evaluate(() =>
        Array.from(document.querySelectorAll('#frame h1,#frame h2,#frame span,#frame strong,#frame code'))
          .filter(node => {
            const rect = node.getBoundingClientRect();
            return rect.width && (rect.left < 116 || rect.right > 1804 || rect.top < 44 || rect.bottom > 968);
          }).map(node => node.textContent)
      );
      assert.deepEqual(clipped, [], `${shot.id} 内容越出安全区`);
      await page.screenshot({ path: path.join(out, 'frames', shot.id + '.png') });
    }
  } finally {
    await browser.close();
  }
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
  await captureFrames();
  const values = {
    TITLE: html(project.titles.zh), DRAFT: draft.slice(0, 12),
    SCRIPT_LINK: `../../review/script.zh.${draft}.md`,
    STORY: story(), VISUALS: pictures(), SAMPLE: sample.map(line).join(' '),
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
