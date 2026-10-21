// 最小 HTTP 服务：演示常见状态码，并区分「谁产生这个码」。
//   源站（origin）  —— 应用自己的处理结果：200 / 201 / 204 / 301 / 302 / 304 / 400 / 401 / 403 / 404 / 500 / 503
//   框架/中间件     —— 405（带 Allow）、429（带 Retry-After）
//   网关（gateway） —— 502（上游连不上）、504（上游超时）
// 监听 127.0.0.1 的临时端口；端口由内核分配，脚本从 stdout 读取。
const http = require('node:http');

const ETAG = '"demo-v1"';
const UPSTREAM_TIMEOUT_MS = 1000;

function originHandler(req, res) {
  const url = new URL(req.url, 'http://127.0.0.1');
  const p = url.pathname;
  const method = req.method;
  const send = (code, headers, body) => {
    res.writeHead(code, Object.assign({ 'Content-Type': 'text/plain; charset=utf-8' }, headers || {}));
    res.end(body === undefined ? '' : body);
  };

  // 条件 GET：带 If-None-Match 且命中 ETag 时，服务器不再重传内容。
  if (p === '/ok' || p === '/resource') {
    if (req.headers['if-none-match'] === ETAG) {
      res.writeHead(304, { ETag: ETAG, 'Cache-Control': 'max-age=60' });
      return res.end();
    }
    return send(200, { ETag: ETAG, 'Cache-Control': 'max-age=60' }, 'ok\n');
  }
  if (p === '/slow') return setTimeout(() => send(200, {}, 'slow\n'), 3000);
  if (p === '/created') return send(201, { Location: '/ok' }, 'created\n');
  if (p === '/nocontent') { res.writeHead(204); return res.end(); }
  if (p === '/moved') return send(301, { Location: '/ok' }, 'moved permanently\n');
  if (p === '/found') return send(302, { Location: '/ok' }, 'found\n');
  if (p === '/bad') return send(400, {}, 'bad request\n');
  // 同一个资源，带凭据时给出不同的码：凭据不足是 403，凭据不对仍是 401。
  // 401 必须带 WWW-Authenticate 挑战；403 不带（RFC 9110 §15.5.2 / §15.5.4）。
  if (p === '/private') {
    const auth = req.headers['authorization'];
    if (!auth) {
      return send(401, { 'WWW-Authenticate': 'Basic realm="demo"' }, 'unauthorized\n');
    }
    if (auth !== 'Bearer good-token') {
      return send(401, { 'WWW-Authenticate': 'Basic realm="demo"' }, 'unauthorized\n');
    }
    // 凭据有效但权限不够：服务器认得出你是谁，只是不让你看这一份。
    if (req.headers['x-demo-role'] !== 'admin') {
      return send(403, {}, 'forbidden\n');
    }
    return send(200, {}, 'secret\n');
  }
  if (p === '/forbidden') return send(403, {}, 'forbidden\n');
  if (p === '/missing') return send(404, {}, 'not found\n');
  if (p === '/post-only') {
    if (method === 'GET' || method === 'HEAD') return send(200, { Allow: 'GET, HEAD' }, 'read only\n');
    return send(405, { Allow: 'GET, HEAD' }, 'method not allowed\n');
  }
  if (p === '/limited') return send(429, { 'Retry-After': '3' }, 'too many requests\n');
  if (p === '/boom') return send(500, {}, 'internal server error\n');
  if (p === '/maintenance') return send(503, { 'Retry-After': '30' }, 'service unavailable\n');
  // 未在 IANA 注册表登记的码：471 在注册表里是 Unassigned（452–499 区间）。
  // RFC 9110 §15 要求客户端按该类的 x00 看待——即把 471 当成 400。
  if (p === '/unassigned') return send(471, {}, 'unassigned code\n');
  return send(404, {}, 'not found\n');
}

const origin = http.createServer(originHandler);

const gateway = http.createServer((req, res) => {
  const port = origin.address().port;
  let target;
  if (req.url.startsWith('/dead')) {
    // 指向一个没有服务在监听的端口：连接被拒绝。
    target = 'http://127.0.0.1:1' + req.url.slice('/dead'.length);
  } else {
    target = 'http://127.0.0.1:' + port + req.url;
  }
  let answered = false;
  const up = http.request(target, { method: req.method, headers: req.headers }, response => {
    // 网关自己加一个标记头：看到它就知道响应确实经过了网关；
    // 而状态码仍是上游给的那个，网关没有替换。
    res.writeHead(response.statusCode, Object.assign({ 'X-Gateway': 'demo-gateway' }, response.headers));
    response.pipe(res);
  });
  up.setTimeout(UPSTREAM_TIMEOUT_MS, () => {
    answered = true;
    res.writeHead(504, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('gateway timeout\n');
    up.destroy();
  });
  up.on('error', () => {
    if (answered) return;
    res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('bad gateway\n');
  });
  up.end();
});

origin.listen(0, '127.0.0.1', () => {
  gateway.listen(0, '127.0.0.1', () => {
    console.log('ORIGIN 127.0.0.1:' + origin.address().port);
    console.log('GATEWAY 127.0.0.1:' + gateway.address().port);
  });
});
