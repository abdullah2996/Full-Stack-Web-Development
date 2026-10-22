// Persistence: everything lives in one JSON file (data/db.json) that is read when the
// server starts and written back after every change. So data survives a restart.
const fs = require('node:fs');
const path = require('node:path');

const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const uploadDir = path.join(dataDir, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const file = path.join(dataDir, 'db.json');

function emptyDb() {
  return {
    lastId: { users: 0, products: 0, reviews: 0, orders: 0 },
    users: [],
    products: [],
    reviews: [],
    carts: {}, // userId -> [{ productId, quantity }]
    orders: []
  };
}

const db = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : emptyDb();

function save() {
  const temp = file + '.tmp';
  fs.writeFileSync(temp, JSON.stringify(db, null, 2));
  fs.renameSync(temp, file); // swap in one step so a crash cannot leave a half-written file
}

function nextId(table) {
  db.lastId[table] += 1;
  return db.lastId[table];
}

if (db.products.length === 0) {
  require('./seed')(db, nextId);
  save();
}

module.exports = { db, save, nextId, uploadDir };
