// 由 research/lab/lab.json（research/lab/01_lab.js 实算）生成画面数据 src/js/data.js。画面上的令牌、哈希、签名与计数只从这里取。
// 用法：node tools/gen_data.js（在本片目录下运行）
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const lab = JSON.parse(fs.readFileSync(path.join(root, 'research', 'lab', 'lab.json'), 'utf8'));
const R = lab.rfc_examples, J = lab.jwt, I = lab.id_token, P = lab.password, K = lab.passkey;
const DATA = {
  sid: R.rfc6265_cookie.split('=')[1],
  setCookie: R.rfc6265_set_cookie,
  cookie: R.rfc6265_cookie,
  code: R.rfc6749_code, state: R.rfc6749_state,
  accessToken: R.rfc6749_access_token, refreshToken: R.rfc6749_refresh_token, expiresIn: R.rfc6749_expires_in,
  jwt: { h: J.header_b64, p: J.payload_b64, s: J.signature, header: JSON.stringify(J.header), payload: JSON.stringify(J.payload),
    tP: J.tampered.payload_b64, tPayload: JSON.stringify(J.tampered.payload), tExpected: J.tampered.expected_signature, tOk: J.tampered.verifies_with_old_signature },
  idt: { h: I.header_b64, p: I.payload_b64, s: I.signature, payload: I.payload },
  pw: { text: P.password, hash: P.scrypt.hash_hex, wrong: P.wrong_guess_scrypt_hex, shaPerSec: P.guesses_per_second.sha256, slowPerSec: P.guesses_per_second.scrypt },
  pk: { challenge: K.challenge, origin: K.client_data.origin, rp: K.rp_id, sig: K.signature_b64u, fakeOrigin: K.phishing_origin },
  sms: '482913',
};
const out = '// 由 tools/gen_data.js 从 research/lab/lab.json 生成，不要手改。\nwindow.DATA = ' + JSON.stringify(DATA, null, 1) + ';\n';
fs.writeFileSync(path.join(root, 'src', 'js', 'data.js'), out);
console.log('data.js', out.length, 'bytes');
