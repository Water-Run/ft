// 由 tools/gen_data.py 从 research/lab/out_11_status_codes.txt 生成，不要手改。
window.ECHO = {
 "200": {
  "title": "200 成功：内容就在响应里",
  "cmd": "curl -i http://127.0.0.1:53440/ok",
  "status": [
   "HTTP/1.1 200 OK"
  ],
  "head": [
   "Content-Type: text/plain; charset=utf-8",
   "ETag: \"demo-v1\"",
   "Cache-Control: max-age=60",
   "Date: Wed, 21 Oct 2026 01:31:49 GMT",
   "Connection: keep-alive",
   "Keep-Alive: timeout=5",
   "Transfer-Encoding: chunked"
  ],
  "body": [
   "ok"
  ]
 },
 "201": {
  "title": "201 成功：新建了资源，Location 指向它",
  "cmd": "curl -i -X POST http://127.0.0.1:53440/created",
  "status": [
   "HTTP/1.1 201 Created"
  ],
  "head": [
   "Content-Type: text/plain; charset=utf-8",
   "Location: /ok",
   "Date: Wed, 21 Oct 2026 01:31:49 GMT",
   "Connection: keep-alive",
   "Keep-Alive: timeout=5",
   "Transfer-Encoding: chunked"
  ],
  "body": [
   "created"
  ]
 },
 "204": {
  "title": "204 成功：动作生效，但没有内容要回",
  "cmd": "curl -i http://127.0.0.1:53440/nocontent",
  "status": [
   "HTTP/1.1 204 No Content"
  ],
  "head": [
   "Date: Wed, 21 Oct 2026 01:31:49 GMT",
   "Connection: keep-alive",
   "Keep-Alive: timeout=5"
  ],
  "body": []
 },
 "301": {
  "title": "301 重定向：这个地址永久换了地方",
  "cmd": "curl -i http://127.0.0.1:53440/moved",
  "status": [
   "HTTP/1.1 301 Moved Permanently"
  ],
  "head": [
   "Content-Type: text/plain; charset=utf-8",
   "Location: /ok",
   "Date: Wed, 21 Oct 2026 01:31:49 GMT",
   "Connection: keep-alive",
   "Keep-Alive: timeout=5",
   "Transfer-Encoding: chunked"
  ],
  "body": [
   "moved permanently"
  ]
 },
 "302": {
  "title": "302 重定向：这次临时换地方",
  "cmd": "curl -i http://127.0.0.1:53440/found",
  "status": [
   "HTTP/1.1 302 Found"
  ],
  "head": [
   "Content-Type: text/plain; charset=utf-8",
   "Location: /ok",
   "Date: Wed, 21 Oct 2026 01:31:49 GMT",
   "Connection: keep-alive",
   "Keep-Alive: timeout=5",
   "Transfer-Encoding: chunked"
  ],
  "body": [
   "found"
  ]
 },
 "304": {
  "title": "304 重定向：内容没变，缓存里的副本仍然有效",
  "cmd": "curl -i -H 'If-None-Match: \"demo-v1\"' http://127.0.0.1:53440/ok",
  "status": [
   "HTTP/1.1 304 Not Modified"
  ],
  "head": [
   "ETag: \"demo-v1\"",
   "Cache-Control: max-age=60",
   "Date: Wed, 21 Oct 2026 01:31:49 GMT",
   "Connection: keep-alive",
   "Keep-Alive: timeout=5"
  ],
  "body": []
 },
 "400": {
  "title": "400 客户端错误：请求本身不合法",
  "cmd": "curl -i http://127.0.0.1:53440/bad",
  "status": [
   "HTTP/1.1 400 Bad Request"
  ],
  "head": [
   "Content-Type: text/plain; charset=utf-8",
   "Date: Wed, 21 Oct 2026 01:31:49 GMT",
   "Connection: keep-alive",
   "Keep-Alive: timeout=5",
   "Transfer-Encoding: chunked"
  ],
  "body": [
   "bad request"
  ]
 },
 "401": {
  "title": "401 客户端错误：缺少凭据，服务器给出挑战",
  "cmd": "curl -i http://127.0.0.1:53440/private",
  "status": [
   "HTTP/1.1 401 Unauthorized"
  ],
  "head": [
   "Content-Type: text/plain; charset=utf-8",
   "WWW-Authenticate: Basic realm=\"demo\"",
   "Date: Wed, 21 Oct 2026 01:31:49 GMT",
   "Connection: keep-alive",
   "Keep-Alive: timeout=5",
   "Transfer-Encoding: chunked"
  ],
  "body": [
   "unauthorized"
  ]
 },
 "403": {
  "title": "403 客户端错误：认得出你，但不给你看",
  "cmd": "curl -i http://127.0.0.1:53440/forbidden",
  "status": [
   "HTTP/1.1 403 Forbidden"
  ],
  "head": [
   "Content-Type: text/plain; charset=utf-8",
   "Date: Wed, 21 Oct 2026 01:31:49 GMT",
   "Connection: keep-alive",
   "Keep-Alive: timeout=5",
   "Transfer-Encoding: chunked"
  ],
  "body": [
   "forbidden"
  ]
 },
 "403b": {
  "title": "401 与 403 的分界：同一个资源，凭据不对是 401，凭据有效但权限不够是 403",
  "cmd": "curl -i -H 'Authorization: Bearer good-token' http://127.0.0.1:53440/private",
  "status": [
   "HTTP/1.1 403 Forbidden"
  ],
  "head": [
   "Content-Type: text/plain; charset=utf-8",
   "Date: Wed, 21 Oct 2026 01:31:49 GMT",
   "Connection: keep-alive",
   "Keep-Alive: timeout=5",
   "Transfer-Encoding: chunked"
  ],
  "body": [
   "forbidden"
  ]
 },
 "200b": {
  "title": "401 与 403 的分界：凭据有效、权限也够，这次是 200",
  "cmd": "curl -i -H 'Authorization: Bearer good-token' -H 'X-Demo-Role: admin' http://127.0.0.1:53440/private",
  "status": [
   "HTTP/1.1 200 OK"
  ],
  "head": [
   "Content-Type: text/plain; charset=utf-8",
   "Date: Wed, 21 Oct 2026 01:31:49 GMT",
   "Connection: keep-alive",
   "Keep-Alive: timeout=5",
   "Transfer-Encoding: chunked"
  ],
  "body": [
   "secret"
  ]
 },
 "404": {
  "title": "404 客户端错误：源站没有这个资源",
  "cmd": "curl -i http://127.0.0.1:53440/missing",
  "status": [
   "HTTP/1.1 404 Not Found"
  ],
  "head": [
   "Content-Type: text/plain; charset=utf-8",
   "Date: Wed, 21 Oct 2026 01:31:49 GMT",
   "Connection: keep-alive",
   "Keep-Alive: timeout=5",
   "Transfer-Encoding: chunked"
  ],
  "body": [
   "not found"
  ]
 },
 "405": {
  "title": "405 客户端错误：方法不支持，Allow 列出支持的方法",
  "cmd": "curl -i -X POST http://127.0.0.1:53440/post-only",
  "status": [
   "HTTP/1.1 405 Method Not Allowed"
  ],
  "head": [
   "Content-Type: text/plain; charset=utf-8",
   "Allow: GET, HEAD",
   "Date: Wed, 21 Oct 2026 01:31:49 GMT",
   "Connection: keep-alive",
   "Keep-Alive: timeout=5",
   "Transfer-Encoding: chunked"
  ],
  "body": [
   "method not allowed"
  ]
 },
 "429": {
  "title": "429 客户端错误：请求太多，告诉你等多久",
  "cmd": "curl -i http://127.0.0.1:53440/limited",
  "status": [
   "HTTP/1.1 429 Too Many Requests"
  ],
  "head": [
   "Content-Type: text/plain; charset=utf-8",
   "Retry-After: 3",
   "Date: Wed, 21 Oct 2026 01:31:49 GMT",
   "Connection: keep-alive",
   "Keep-Alive: timeout=5",
   "Transfer-Encoding: chunked"
  ],
  "body": [
   "too many requests"
  ]
 },
 "500": {
  "title": "500 服务器错误：服务器自己出了问题",
  "cmd": "curl -i http://127.0.0.1:53440/boom",
  "status": [
   "HTTP/1.1 500 Internal Server Error"
  ],
  "head": [
   "Content-Type: text/plain; charset=utf-8",
   "Date: Wed, 21 Oct 2026 01:31:49 GMT",
   "Connection: keep-alive",
   "Keep-Alive: timeout=5",
   "Transfer-Encoding: chunked"
  ],
  "body": [
   "internal server error"
  ]
 },
 "503": {
  "title": "503 服务器错误：临时不可用，Retry-After 给出恢复时间",
  "cmd": "curl -i http://127.0.0.1:53440/maintenance",
  "status": [
   "HTTP/1.1 503 Service Unavailable"
  ],
  "head": [
   "Content-Type: text/plain; charset=utf-8",
   "Retry-After: 30",
   "Date: Wed, 21 Oct 2026 01:31:49 GMT",
   "Connection: keep-alive",
   "Keep-Alive: timeout=5",
   "Transfer-Encoding: chunked"
  ],
  "body": [
   "service unavailable"
  ]
 },
 "471": {
  "title": "未登记的码：服务器回了 471，首位数字仍是 4，按同类 x00 看待就是当成 400",
  "cmd": "curl -i http://127.0.0.1:53440/unassigned",
  "status": [
   "HTTP/1.1 471 unknown"
  ],
  "head": [
   "Content-Type: text/plain; charset=utf-8",
   "Date: Wed, 21 Oct 2026 01:31:49 GMT",
   "Connection: keep-alive",
   "Keep-Alive: timeout=5",
   "Transfer-Encoding: chunked"
  ],
  "body": [
   "unassigned code"
  ]
 },
 "502": {
  "title": "502 服务器错误（网关产生）：网关连不上上游",
  "cmd": "curl -i http://127.0.0.1:53441/dead",
  "status": [
   "HTTP/1.1 502 Bad Gateway"
  ],
  "head": [
   "Content-Type: text/plain; charset=utf-8",
   "Date: Wed, 21 Oct 2026 01:31:49 GMT",
   "Connection: keep-alive",
   "Keep-Alive: timeout=5",
   "Transfer-Encoding: chunked"
  ],
  "body": [
   "bad gateway"
  ]
 },
 "504": {
  "title": "504 服务器错误（网关产生）：网关等上游等太久",
  "cmd": "curl -i http://127.0.0.1:53441/slow",
  "status": [
   "HTTP/1.1 504 Gateway Timeout"
  ],
  "head": [
   "Content-Type: text/plain; charset=utf-8",
   "Date: Wed, 21 Oct 2026 01:31:50 GMT",
   "Connection: keep-alive",
   "Keep-Alive: timeout=5",
   "Transfer-Encoding: chunked"
  ],
  "body": [
   "gateway timeout"
  ]
 },
 "404b": {
  "title": "同一个 404，经过网关时仍然是源站产生的那个码",
  "cmd": "curl -i http://127.0.0.1:53441/missing",
  "status": [
   "HTTP/1.1 404 Not Found"
  ],
  "head": [
   "X-Gateway: demo-gateway",
   "content-type: text/plain; charset=utf-8",
   "date: Wed, 21 Oct 2026 01:31:50 GMT",
   "connection: keep-alive",
   "keep-alive: timeout=5",
   "transfer-encoding: chunked"
  ],
  "body": [
   "not found"
  ]
 },
 "201b": {
  "title": "1xx 中间响应：Expect: 100-continue 之后还有一个最终响应",
  "cmd": "curl -i -X POST -H 'Expect: 100-continue' -d 'x=1' http://127.0.0.1:53440/created",
  "status": [
   "HTTP/1.1 100 Continue",
   "HTTP/1.1 201 Created"
  ],
  "head": [
   "Content-Type: text/plain; charset=utf-8",
   "Location: /ok",
   "Date: Wed, 21 Oct 2026 01:31:50 GMT",
   "Connection: keep-alive",
   "Keep-Alive: timeout=5",
   "Transfer-Encoding: chunked"
  ],
  "body": [
   "created"
  ]
 }
};
