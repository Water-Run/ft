// 本片画面用到的真实数据：JWT 的三段与改一个字后的验签、两种哈希的实测耗时、passkey 签名的数据结构。
// 用法：node research/lab/01_lab.js（在本片目录下运行），结果写到 research/lab/lab.json；src/js/data.js 由 tools/gen_data.js 从它生成。
// 只用 Node 自带的 crypto。域名一律用保留域名 .example（RFC 2606），用户名、密码、密钥都是演示用的假值，不对应任何真实账号。
// Session ID、授权码与令牌的取值直接抄自 RFC 6265 §3.1 与 RFC 6749 §4.1.2、§4.1.4 的示例，见 FACTS.md「画面数据」。
'use strict';
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');

const b64u = (buf) => Buffer.from(buf).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
const json = (o) => JSON.stringify(o);

// ── 1. JWT（HS256 签名的 JWS Compact）：header.payload.signature ──
// 过期时间：2026-10-19 20:30 UTC+8（仅作演示的固定值）
const EXP = Date.UTC(2026, 9, 19, 12, 30, 0) / 1000;
const KEY = Buffer.from('shop.example demo signing key, not a real secret');
const header = { alg: 'HS256', typ: 'JWT' };
const payload = { sub: 'alice', exp: EXP };
const sign = (h, p) => b64u(crypto.createHmac('sha256', KEY).update(h + '.' + p).digest());
const h64 = b64u(json(header)), p64 = b64u(json(payload));
const sig = sign(h64, p64);
// 改一个字：exp 的第一位数字 1 → 2（有效期往后推了三十多年）
const expT = Number('2' + String(EXP).slice(1));
const pT = { sub: 'alice', exp: expT };
const p64T = b64u(json(pT));
const sigT = sign(h64, p64T);                      // 改过的内容应得的签名
const verify = (h, p, s) => sign(h, p) === s;
const jwt = {
  header, payload, header_b64: h64, payload_b64: p64, signature: sig,
  token: [h64, p64, sig].join('.'),
  tampered: { payload: pT, payload_b64: p64T, expected_signature: sigT, verifies_with_old_signature: verify(h64, p64T, sig) },
  verifies: verify(h64, p64, sig),
  exp_iso: new Date(EXP * 1000).toISOString(),
};

// ── 2. ID Token 的内容（OIDC Core §2 列出的 iss、sub、aud、exp、iat）：签名用临时生成的 RSA 密钥，用完即丢 ──
const IAT = EXP - 300;
const idHeader = { alg: 'RS256', typ: 'JWT' };
const idPayload = { iss: 'https://id.example', sub: '24400320', aud: 'shop.example', exp: IAT + 600, iat: IAT };
const { privateKey: rsaPriv } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const ih = b64u(json(idHeader)), ip = b64u(json(idPayload));
const isig = b64u(crypto.sign('sha256', Buffer.from(ih + '.' + ip), rsaPriv));
const idToken = { header: idHeader, payload: idPayload, header_b64: ih, payload_b64: ip, signature: isig, token: [ih, ip, isig].join('.') };

// ── 3. 密码的哈希：同一个密码，普通哈希（SHA-256）与故意算得慢的哈希（scrypt，OWASP 给的参数 N=2^17, r=8, p=1）各算一次要多久 ──
const PASSWORD = 'correct-horse-7';                 // 演示用的假密码
const salt = Buffer.from('b6c1f0e29a4d7c35', 'hex');
const time = (fn, n) => { const t0 = process.hrtime.bigint(); for (let i = 0; i < n; i++) fn(); return Number(process.hrtime.bigint() - t0) / 1e9 / n; };
const sha = () => crypto.createHash('sha256').update(PASSWORD).digest();
const SCRYPT = { N: 1 << 17, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };
const scr = () => crypto.scryptSync(PASSWORD, salt, 32, SCRYPT);
time(sha, 20000); scr();                            // 预热
const shaSec = time(sha, 200000);
const scrSec = time(scr, 8);
const pw = {
  password: PASSWORD,
  sha256_hex: sha().toString('hex'),
  scrypt: { params: { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p }, salt_hex: salt.toString('hex'), hash_hex: scr().toString('hex') },
  seconds_per_hash: { sha256: shaSec, scrypt: scrSec },
  guesses_per_second: { sha256: Math.round(1 / shaSec), scrypt: +(1 / scrSec).toFixed(2) },
  wrong_guess_scrypt_hex: crypto.scryptSync('correct-horse-8', salt, 32, SCRYPT).toString('hex'),
};

// ── 4. passkey：注册时设备生成一对 P-256 密钥，服务器只存公钥；登录时设备对「验证器数据 + 客户端数据的哈希」签名（WebAuthn §7.2） ──
const { privateKey: ecPriv, publicKey: ecPub } = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });
const challenge = b64u(crypto.randomBytes(32));
const clientData = { type: 'webauthn.get', challenge, origin: 'https://shop.example' };
const rpIdHash = crypto.createHash('sha256').update('shop.example').digest();
const authData = Buffer.concat([rpIdHash, Buffer.from([0x05]), Buffer.from([0, 0, 0, 1])]);   // flags UP|UV，计数 1
const signed = Buffer.concat([authData, crypto.createHash('sha256').update(json(clientData)).digest()]);
const esig = crypto.sign('sha256', signed, ecPriv);
const pubJwk = ecPub.export({ format: 'jwk' });
const passkey = {
  rp_id: 'shop.example', challenge, client_data: clientData, rp_id_hash_hex: rpIdHash.toString('hex'),
  signature_b64u: b64u(esig), public_key_x: pubJwk.x, public_key_y: pubJwk.y,
  verifies: crypto.verify('sha256', signed, ecPub, esig),
  // 钓鱼站：浏览器只会以页面的 origin 请求签名；假站点的 RP ID 与注册时不同，设备上没有为它创建的凭据
  phishing_origin: 'https://sh0p.example',
  phishing_rp_id_hash_hex: crypto.createHash('sha256').update('sh0p.example').digest('hex'),
};

const out = {
  generated: new Date().toISOString().slice(0, 10),
  env: { node: process.version, cpu: (os.cpus()[0] || {}).model || '' },
  rfc_examples: {
    rfc6265_set_cookie: 'Set-Cookie: SID=31d4d96e407aad42',
    rfc6265_cookie: 'Cookie: SID=31d4d96e407aad42',
    rfc6749_code: 'SplxlOBeZQQYbYS6WxSbIA', rfc6749_state: 'xyz',
    rfc6749_access_token: '2YotnFZFEjr1zCsicMWpAA', rfc6749_refresh_token: 'tGzv3JOkF0XG5Qx2TlKWIA', rfc6749_expires_in: 3600,
  },
  jwt, id_token: idToken, password: pw, passkey,
};
fs.writeFileSync(path.join(__dirname, 'lab.json'), JSON.stringify(out, null, 1) + '\n');
console.log('jwt verifies', jwt.verifies, '| tampered verifies with old sig', jwt.tampered.verifies_with_old_signature);
console.log('sha256 %s s/hash, scrypt %s s/hash', shaSec.toExponential(2), scrSec.toFixed(3));
console.log('passkey verifies', passkey.verifies);
