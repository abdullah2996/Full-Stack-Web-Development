const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { db, save, nextId, uploadDir } = require('../store');
const { HttpError } = require('../lib');

const CATEGORIES = ['Pottery', 'Home Decor', 'Clothing', 'Footwear', 'Lighting', 'Jewellery'];
const IMAGE_TYPES = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };
const MAX_PHOTO = 2 * 1024 * 1024;

// adds average rating + review count to a product
function shape(p) {
  const reviews = db.reviews.filter(r => r.productId === p.id);
  const avg = reviews.length ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : 0;
  return { ...p, rating: avg, reviewCount: reviews.length };
}

function findProduct(id) {
  const product = db.products.find(p => p.id === id);
  if (!product) throw new HttpError(404, 'Product not found');
  return product;
}

// "photo" can be an image link (https://...) or a base64 data URL (data:image/png;base64,...)
function readPhoto(value) {
  const text = String(value || '').trim();
  if (!text) return null;
  if (/^https?:\/\/\S+$/.test(text)) return text;

  const match = text.match(/^data:(image\/[a-z]+);base64,([A-Za-z0-9+/=]+)$/);
  if (!match || !IMAGE_TYPES[match[1]]) throw new HttpError(400, 'Photo must be an image link or a base64 JPG, PNG, WEBP or GIF');
  const bytes = Buffer.from(match[2], 'base64');
  if (bytes.length > MAX_PHOTO) throw new HttpError(400, 'Photo must be smaller than 2 MB');

  const fileName = Date.now() + '-' + crypto.randomBytes(4).toString('hex') + IMAGE_TYPES[match[1]];
  fs.writeFileSync(path.join(uploadDir, fileName), bytes);
  return '/uploads/' + fileName;
}

// checks add/update data. partial = true for PUT (only the fields that were sent)
function validate(body, partial) {
  const data = {};
  const sent = key => body[key] !== undefined;

  if (!partial || sent('name')) {
    data.name = String(body.name || '').trim();
    if (data.name.length < 3 || data.name.length > 60) throw new HttpError(400, 'Product name must be 3 to 60 characters');
  }
  if (!partial || sent('category')) {
    data.category = String(body.category || '').trim();
    if (!CATEGORIES.includes(data.category)) throw new HttpError(400, 'Category must be one of: ' + CATEGORIES.join(', '));
  }
  if (!partial || sent('price')) {
    data.price = Number(body.price);
    if (!Number.isInteger(data.price) || data.price < 100) throw new HttpError(400, 'Price must be a whole number of at least 100');
  }
  if (!partial || sent('stock')) {
    data.stock = Number(body.stock);
    if (!Number.isInteger(data.stock) || data.stock < 0) throw new HttpError(400, 'Stock must be a whole number, 0 or more');
  }
  if (!partial || sent('description')) {
    data.description = String(body.description || '').trim();
    if (data.description.length < 10) throw new HttpError(400, 'Description must be at least 10 characters');
  }
  if (sent('city') || sent('madeIn')) data.madeIn = String(body.city || body.madeIn || '').trim() || null;
  if (sent('emoji')) data.emoji = String(body.emoji).trim() || '📦';
  return data;
}

module.exports = function (add) {
  // GET /api/products?category=Pottery&q=vase&sort=price_asc|price_desc|rating|newest
  add('GET', '/api/products', {}, ({ query }) => {
    let list = db.products.map(shape);
    if (query.category) list = list.filter(p => p.category === query.category);
    if (query.q) list = list.filter(p => p.name.toLowerCase().includes(query.q.toLowerCase()));

    const sorters = {
      price_asc: (a, b) => a.price - b.price,
      price_desc: (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
      newest: (a, b) => b.id - a.id
    };
    if (sorters[query.sort]) list.sort(sorters[query.sort]);
    return [200, { count: list.length, products: list }];
  });

  // GET /api/products/:id
  add('GET', '/api/products/:id', {}, ({ params }) => [200, { product: shape(findProduct(Number(params.id))) }]);

  // POST /api/products  (login needed)
  add('POST', '/api/products', { auth: true }, ({ body, user }) => {
    const data = validate(body, false);
    const image = readPhoto(body.photo);
    const product = {
      id: nextId('products'),
      name: data.name,
      category: data.category,
      madeIn: data.madeIn || null,
      price: data.price,
      stock: data.stock,
      description: data.description,
      emoji: data.emoji || '📦',
      image,
      ownerId: user.id,
      createdAt: new Date().toISOString()
    };
    db.products.push(product);
    save();
    return [201, { message: 'Product added', product: shape(product) }];
  });

  // PUT /api/products/:id  (only the user who added it)
  add('PUT', '/api/products/:id', { auth: true }, ({ params, body, user }) => {
    const product = findProduct(Number(params.id));
    if (product.ownerId !== user.id) throw new HttpError(403, 'You can only edit your own products');
    const data = validate(body, true);
    if (body.photo !== undefined) data.image = readPhoto(body.photo);
    Object.assign(product, data);
    save();
    return [200, { message: 'Product updated', product: shape(product) }];
  });

  // DELETE /api/products/:id  (only the user who added it)
  add('DELETE', '/api/products/:id', { auth: true }, ({ params, user }) => {
    const product = findProduct(Number(params.id));
    if (product.ownerId !== user.id) throw new HttpError(403, 'You can only delete your own products');
    db.products = db.products.filter(p => p.id !== product.id);
    db.reviews = db.reviews.filter(r => r.productId !== product.id);
    for (const userId of Object.keys(db.carts)) {
      db.carts[userId] = db.carts[userId].filter(i => i.productId !== product.id);
    }
    save();
    return [200, { message: 'Product deleted' }];
  });
};
