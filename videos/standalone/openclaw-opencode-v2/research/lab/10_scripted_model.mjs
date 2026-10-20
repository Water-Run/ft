// 按脚本应答的模型服务（OpenAI Chat Completions 兼容，流式）。
// 用途：在真实的 harness 外面放一个可预测的「模型」，观察 harness 自己写了什么、崩溃后做了什么。
// 规则：
//   - 标题、摘要一类没有工具的请求：回一句固定文字。
//   - 对话里最后一条是用户消息：要求调用 shell/bash 工具，执行一条慢命令（先睡 SLEEP 秒，再写文件）。
//   - 最后一条是工具结果：结果里带「中断、出错、取消」等字样时再要求调用一次（不再睡眠）；否则回一句收尾文字。
// 每个请求的完整请求体按顺序写进 LOG 目录（req_0001.json …），便于事后比对。
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const PORT = Number(process.env.PORT || 18555)
const LOG = process.env.LOG || './log'
const SLEEP = Number(process.env.SLEEP || 30)
fs.mkdirSync(LOG, { recursive: true })
let n = 0

function sse(res, chunks) {
  res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' })
  for (const c of chunks) res.write('data: ' + JSON.stringify(c) + '\n\n')
  res.write('data: [DONE]\n\n')
  res.end()
}

function chunk(id, delta, finish, usage) {
  const c = { id, object: 'chat.completion.chunk', created: 1, model: 'scripted', choices: [{ index: 0, delta, finish_reason: finish ?? null }] }
  if (usage) c.usage = usage
  return c
}

const server = http.createServer((req, res) => {
  let body = ''
  req.on('data', (d) => (body += d))
  req.on('end', () => {
    n += 1
    const tag = String(n).padStart(4, '0')
    fs.writeFileSync(path.join(LOG, `req_${tag}.json`), JSON.stringify({ n, method: req.method, url: req.url, body: safeParse(body) }, null, 2))
    if (!req.url.includes('/chat/completions')) {
      res.writeHead(200, { 'content-type': 'application/json' })
      return res.end(JSON.stringify({ object: 'list', data: [{ id: 'scripted', object: 'model' }] }))
    }
    const b = safeParse(body) || {}
    const msgs = b.messages || []
    const tools = (b.tools || []).map((t) => t.function?.name).filter(Boolean)
    const last = msgs[msgs.length - 1] || {}
    const id = 'resp_' + tag
    const usage = { prompt_tokens: 100, completion_tokens: 10, total_tokens: 110 }
    const shellName = tools.find((t) => t === 'shell') || tools.find((t) => t === 'bash')
    const log = (what) => fs.appendFileSync(path.join(LOG, 'decisions.txt'), `${tag} stream=${!!b.stream} tools=${tools.length} last=${last.role} -> ${what}\n`)
    if (!shellName || b.tool_choice === 'none') {
      log('text')
      return reply(res, b.stream, id, 'Scripted reply.', usage)
    }
    if (last.role === 'tool') {
      const text = JSON.stringify(last.content || '')
      if (/interrupt|abort|error|fail|cancel/i.test(text)) {
        log('tool-again:' + shellName)
        const again = { index: 0, id: 'call_' + tag, type: 'function', function: { name: shellName, arguments: JSON.stringify({ command: 'echo written >> note.txt', description: 'Write the note again' }) } }
        if (!b.stream) {
          res.writeHead(200, { 'content-type': 'application/json' })
          return res.end(JSON.stringify({ id, object: 'chat.completion', created: 1, model: 'scripted', choices: [{ index: 0, message: { role: 'assistant', content: null, tool_calls: [again] }, finish_reason: 'tool_calls' }], usage }))
        }
        return sse(res, [chunk(id, { role: 'assistant', content: 'The previous command did not finish. Running it again.' }), chunk(id, { tool_calls: [again] }), chunk(id, {}, 'tool_calls'), { ...chunk(id, {}, null), choices: [], usage }])
      }
      log('final')
      return reply(res, b.stream, id, 'The note has been written.', usage)
    }
    log('tool:' + shellName)
    const args = JSON.stringify({ command: `sleep ${SLEEP} && echo written >> note.txt`, description: 'Write a note slowly' })
    const call = { index: 0, id: 'call_' + tag, type: 'function', function: { name: shellName, arguments: args } }
    if (!b.stream) {
      res.writeHead(200, { 'content-type': 'application/json' })
      return res.end(JSON.stringify({ id, object: 'chat.completion', created: 1, model: 'scripted', choices: [{ index: 0, message: { role: 'assistant', content: null, tool_calls: [call] }, finish_reason: 'tool_calls' }], usage }))
    }
    sse(res, [chunk(id, { role: 'assistant', tool_calls: [call] }), chunk(id, {}, 'tool_calls'), { ...chunk(id, {}, null), choices: [], usage }])
  })
})

function reply(res, stream, id, text, usage) {
  if (!stream) {
    res.writeHead(200, { 'content-type': 'application/json' })
    return res.end(JSON.stringify({ id, object: 'chat.completion', created: 1, model: 'scripted', choices: [{ index: 0, message: { role: 'assistant', content: text }, finish_reason: 'stop' }], usage }))
  }
  sse(res, [chunk(id, { role: 'assistant', content: text }), chunk(id, {}, 'stop'), { ...chunk(id, {}, null), choices: [], usage }])
}

function safeParse(s) {
  try { return JSON.parse(s) } catch { return s }
}

server.listen(PORT, '127.0.0.1', () => console.log('scripted model on', PORT))
