// Quick end-to-end check of every endpoint. Run with: npm test
// Uses a temporary data folder, so real data/db.json is not touched.
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nila-'));
process.env.DATA_DIR = tmp;

const server = require('../src/server');
server.listen(0, run);

async function call(method, url, body, token) {
  const headers = {};
  if (token) headers.Authorization = 'Bearer ' + token;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch('http://localhost:' + server.address().port + url, {
    method, headers, body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  return { status: res.status, data: text ? JSON.parse(text) : null, res };
}

const delivery = { name: 'Abdullah Khan', phone: '0301-1234567', address: 'House 1, Street 2', city: 'Islamabad', zip: '44000', payment: 'cod' };
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

async function run() {
  try {
    let r;
    r = await call('GET', '/api/health'); assert.strictEqual(r.data.status, 'ok');
    r = await call('GET', '/api/products');
    assert.strictEqual(r.status, 200); assert.strictEqual(r.data.count, 10);
    r = await call('GET', '/api/products?category=Pottery&sort=price_asc');
    assert.deepStrictEqual(r.data.products.map(p => p.price), [1400, 2800]);
    r = await call('GET', '/api/products?q=shawl');
    assert.strictEqual(r.data.count, 1); assert.strictEqual(r.data.products[0].rating, 5);
    r = await call('GET', '/api/products/999'); assert.strictEqual(r.status, 404);
    r = await call('DELETE', '/api/health'); assert.strictEqual(r.status, 404);
    r = await call('PUT', '/api/products', {}); assert.strictEqual(r.status, 405);

    // auth
    const acc = { fullname: 'Abdullah Khan', email: 'a@test.pk', phone: '0301-1234567', password: 'secret1' };
    r = await call('POST', '/api/auth/signup', acc); assert.strictEqual(r.status, 201); const token = r.data.token;
    assert.strictEqual(r.data.user.passwordHash, undefined);
    r = await call('POST', '/api/auth/signup', acc); assert.strictEqual(r.status, 409);
    r = await call('POST', '/api/auth/signup', { fullname: 'Ab', email: 'bad', phone: '1', password: '1' }); assert.strictEqual(r.status, 400);
    r = await call('POST', '/api/auth/login', { email: 'a@test.pk', password: 'wrong!!' }); assert.strictEqual(r.status, 401);
    r = await call('POST', '/api/auth/login', { email: 'demo@nila.pk', password: 'nila123' }); assert.strictEqual(r.status, 200);
    const demoToken = r.data.token;
    r = await call('GET', '/api/auth/me', null, token); assert.strictEqual(r.data.user.email, 'a@test.pk');
    r = await call('GET', '/api/auth/me'); assert.strictEqual(r.status, 401);
    r = await call('GET', '/api/auth/me', null, token.slice(0, -3) + 'abc'); assert.strictEqual(r.status, 401);
    r = await fetch('http://localhost:' + server.address().port + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{oops' });
    assert.strictEqual(r.status, 400);

    // cart
    r = await call('GET', '/api/cart'); assert.strictEqual(r.status, 401);
    r = await call('POST', '/api/cart', { productId: 1 }, token); assert.strictEqual(r.status, 201);
    r = await call('POST', '/api/cart', { productId: 1, quantity: 1 }, token); assert.strictEqual(r.data.items[0].quantity, 2);
    r = await call('POST', '/api/cart', { productId: 3, quantity: 2 }, token);
    assert.strictEqual(r.data.subtotal, 2800 * 2 + 3200 * 2); assert.strictEqual(r.data.itemCount, 4);
    r = await call('PUT', '/api/cart/3', { quantity: 1 }, token); assert.strictEqual(r.data.subtotal, 2800 * 2 + 3200);
    r = await call('PUT', '/api/cart/3', { quantity: 500 }, token); assert.strictEqual(r.status, 400);
    r = await call('POST', '/api/cart', { productId: 5, quantity: 5 }, token); assert.strictEqual(r.status, 400); // only 4 in stock
    r = await call('DELETE', '/api/cart/1', null, token); assert.strictEqual(r.data.items.length, 1);
    r = await call('DELETE', '/api/cart/1', null, token); assert.strictEqual(r.status, 404);

    // products: add (with base64 photo and with image link), edit, delete
    const pot = { name: 'Test Clay Pot', category: 'Pottery', city: 'Multan', price: 1500, stock: 3, description: 'A small test clay pot for the demo.' };
    r = await call('POST', '/api/products', { ...pot, photo: PNG }, token);
    assert.strictEqual(r.status, 201); assert.ok(r.data.product.image.startsWith('/uploads/')); const pid = r.data.product.id;
    const img = await fetch('http://localhost:' + server.address().port + r.data.product.image);
    assert.strictEqual(img.status, 200); assert.strictEqual(img.headers.get('content-type'), 'image/png');
    r = await call('POST', '/api/products', { ...pot, name: 'Linked Pot', photo: 'https://example.com/pot.jpg' }, token);
    assert.strictEqual(r.data.product.image, 'https://example.com/pot.jpg');
    r = await call('POST', '/api/products', { ...pot, photo: 'not-an-image' }, token); assert.strictEqual(r.status, 400);
    r = await call('POST', '/api/products', { name: 'x', category: 'Cars', price: 5 }, token); assert.strictEqual(r.status, 400);
    r = await call('POST', '/api/products', pot); assert.strictEqual(r.status, 401);
    r = await call('PUT', '/api/products/' + pid, { price: 1800 }, token); assert.strictEqual(r.data.product.price, 1800);
    r = await call('PUT', '/api/products/1', { price: 1 }, token); assert.strictEqual(r.status, 403);
    r = await call('DELETE', '/api/products/' + pid, null, demoToken); assert.strictEqual(r.status, 403);
    r = await call('DELETE', '/api/products/' + pid, null, token); assert.strictEqual(r.status, 200);
    r = await call('GET', '/api/products/' + pid); assert.strictEqual(r.status, 404);

    // reviews
    r = await call('GET', '/api/reviews'); assert.strictEqual(r.data.count, 6);
    r = await call('POST', '/api/reviews', { product: 'Camel Skin Lamp', rating: 5, review: 'Looks amazing in my room.' }, token);
    assert.strictEqual(r.status, 201); assert.strictEqual(r.data.review.name, 'Abdullah Khan');
    r = await call('POST', '/api/reviews', { productId: 1, rating: 9, review: 'Looks amazing in my room.' }, token); assert.strictEqual(r.status, 400);
    r = await call('POST', '/api/reviews', { productId: 1, rating: 5, review: 'short' }, token); assert.strictEqual(r.status, 400);
    r = await call('GET', '/api/reviews?productId=6'); assert.strictEqual(r.data.count, 2); assert.strictEqual(r.data.average, 4.5);

    // orders (cart now holds 1 x Peshawari Chappal)
    r = await call('POST', '/api/orders', { ...delivery, payment: 'bad' }, token); assert.strictEqual(r.status, 400);
    r = await call('POST', '/api/orders', { ...delivery, phone: '123' }, token); assert.strictEqual(r.status, 400);
    r = await call('POST', '/api/orders', delivery, token);
    assert.strictEqual(r.status, 201); assert.strictEqual(r.data.order.total, 3200); assert.match(r.data.order.orderNumber, /^NB-\d{6}$/);
    const oid = r.data.order.id;
    r = await call('GET', '/api/cart', null, token); assert.strictEqual(r.data.items.length, 0);
    r = await call('GET', '/api/products/3'); assert.strictEqual(r.data.product.stock, 19);
    r = await call('POST', '/api/orders', delivery, token); assert.strictEqual(r.status, 400); // empty cart
    r = await call('GET', '/api/orders', null, token); assert.strictEqual(r.data.count, 1);
    r = await call('GET', '/api/orders/' + oid, null, token); assert.strictEqual(r.data.order.items[0].name, 'Peshawari Chappal');
    r = await call('GET', '/api/orders/' + oid, null, demoToken); assert.strictEqual(r.status, 404);

    // persistence: data must be on disk in db.json
    const saved = JSON.parse(fs.readFileSync(path.join(tmp, 'db.json'), 'utf8'));
    assert.strictEqual(saved.orders.length, 1); assert.strictEqual(saved.users.length, 2);
    assert.ok(!JSON.stringify(saved).includes('secret1')); // password is hashed, not stored as text

    r = await call('GET', '/api/nothing'); assert.strictEqual(r.status, 404);
    console.log('All endpoint checks passed');
  } catch (e) {
    console.error('FAILED:', e.message, '\n', (e.stack.split('\n').find(l => l.includes('smoke.js')) || ''));
    process.exitCode = 1;
  } finally {
    server.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}
