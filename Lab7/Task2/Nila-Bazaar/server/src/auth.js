const crypto = require('node:crypto');

const SECRET = process.env.JWT_SECRET || 'nila-dev-secret';
const WEEK = 7 * 24 * 60 * 60 * 1000;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return salt + ':' + hash;
}

function checkPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const attempt = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(attempt, Buffer.from(hash, 'hex'));
}

function sign(text) {
  return crypto.createHmac('sha256', SECRET).update(text).digest('base64url');
}

// token = base64(payload) + "." + signature. Nobody can change the payload without the secret.
function makeToken(userId) {
  const payload = Buffer.from(JSON.stringify({ id: userId, exp: Date.now() + WEEK })).toString('base64url');
  return payload + '.' + sign(payload);
}

function readToken(token) {
  if (!token || !token.includes('.')) return null;
  const [payload, signature] = token.split('.');
  const a = Buffer.from(signature);
  const b = Buffer.from(sign(payload));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.exp > Date.now() ? data : null;
  } catch (e) {
    return null;
  }
}

module.exports = { hashPassword, checkPassword, makeToken, readToken };
