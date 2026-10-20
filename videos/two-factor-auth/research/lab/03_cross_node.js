// 独立实现（Node.js 的 crypto 模块）核对：先过 RFC 6238 附录 B 的 SHA-1 测试向量，再重算本片四个窗口的验证码，
// 与 film_values.json（Python 参考实现的结果）逐项比较。
const crypto = require('crypto'), fs = require('fs'), path = require('path');
function totp(key, unix, digits = 6, period = 30) {
  const c = Buffer.alloc(8); c.writeBigUInt64BE(BigInt(Math.floor(unix / period)));
  const hs = crypto.createHmac('sha1', key).update(c).digest();
  const o = hs[19] & 0x0f;
  const n = ((hs[o] & 0x7f) << 24) | (hs[o + 1] << 16) | (hs[o + 2] << 8) | hs[o + 3];
  return { hs: hs.toString('hex'), offset: o, snum: n, code: String(n % 10 ** digits).padStart(digits, '0') };
}
let ok = true;
const RFC = [[59, '94287082'], [1111111109, '07081804'], [1111111111, '14050471'], [1234567890, '89005924'], [2000000000, '69279037'], [20000000000, '65353130']];
console.log('RFC 6238 附录 B（SHA-1，8 位）');
for (const [t, want] of RFC) { const got = totp(Buffer.from('12345678901234567890'), t, 8).code; ok = ok && got === want; console.log(`  时间 ${t}  TOTP ${got}  ${got === want ? '一致' : '不一致'}`); }
const film = JSON.parse(fs.readFileSync(path.join(__dirname, 'film_values.json'), 'utf8'));
console.log('本片四个窗口（与 Python 参考实现比较）');
for (const w of film.windows) {
  const r = totp(Buffer.from(film.key_hex, 'hex'), w.unix, film.digits, film.period);
  const same = r.hs === w.hs && r.offset === w.offset && r.snum === w.snum && r.code === w.code; ok = ok && same;
  console.log(`  窗口 ${w.k}  Unix ${w.unix}  HMAC ${r.hs}  偏移 ${r.offset}  整数 ${r.snum}  验证码 ${r.code}  ${same ? '一致' : '不一致'}`);
}
console.log('结论：' + (ok ? '全部一致' : '有不一致'));
process.exit(ok ? 0 : 1);
