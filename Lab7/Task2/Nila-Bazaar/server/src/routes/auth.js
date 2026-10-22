const { db, save, nextId } = require('../store');
const { hashPassword, checkPassword, makeToken } = require('../auth');
const { HttpError } = require('../lib');

const PHONE = /^03\d{2}-?\d{7}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const publicUser = u => ({ id: u.id, fullname: u.fullname, email: u.email, phone: u.phone });

module.exports = function (add) {
  // POST /api/auth/signup  { fullname, email, phone, password }
  add('POST', '/api/auth/signup', {}, ({ body }) => {
    const fullname = String(body.fullname || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();
    const password = String(body.password || '');

    if (fullname.length < 3) throw new HttpError(400, 'Full name must be at least 3 characters');
    if (!EMAIL.test(email)) throw new HttpError(400, 'Enter a valid email address');
    if (!PHONE.test(phone)) throw new HttpError(400, 'Phone must look like 0300-1234567');
    if (password.length < 6) throw new HttpError(400, 'Password must be at least 6 characters');
    if (db.users.some(u => u.email === email)) throw new HttpError(409, 'An account with this email already exists');

    const user = {
      id: nextId('users'),
      fullname,
      email,
      phone,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    save();
    return [201, { message: 'Account created', user: publicUser(user), token: makeToken(user.id) }];
  });

  // POST /api/auth/login  { email, password }
  add('POST', '/api/auth/login', {}, ({ body }) => {
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const user = db.users.find(u => u.email === email);
    if (!user || !checkPassword(password, user.passwordHash)) throw new HttpError(401, 'Wrong email or password');
    return [200, { message: 'Logged in', user: publicUser(user), token: makeToken(user.id) }];
  });

  // GET /api/auth/me
  add('GET', '/api/auth/me', { auth: true }, ({ user }) => [200, { user: publicUser(user) }]);
};
