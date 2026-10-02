// 探测无头 Chrome 的 WebGL 能力（决定能否用 three.js 之类的 3D 场景）。node kit/tools/glprobe.js <视频>
const { needVideo, startServer, openPage } = require('./lib');
(async () => {
  needVideo();
  const { server, base } = await startServer();
  for (const gpu of [false, true]) {
    const { browser, page } = await openPage(base, { gpu });
    const r = await page.evaluate(() => {
      const c = document.createElement('canvas'); const gl = c.getContext('webgl2') || c.getContext('webgl');
      if (!gl) return 'no webgl';
      const e = gl.getExtension('WEBGL_debug_renderer_info');
      return (gl instanceof WebGL2RenderingContext ? 'webgl2' : 'webgl1') + ' | ' + (e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)) + ' | maxTex ' + gl.getParameter(gl.MAX_TEXTURE_SIZE);
    });
    console.log('gpu=' + gpu + ':', r);
    await browser.close();
  }
  server.close();
})();
