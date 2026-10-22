// Each user's cart is saved in db.json, so it is still there after logout or a restart.
const { db, save } = require('../store');
const { HttpError } = require('../lib');

const MAX_QTY = 99;

function myItems(userId) {
  if (!db.carts[userId]) db.carts[userId] = [];
  return db.carts[userId];
}

function cartView(userId) {
  const items = myItems(userId)
    .map(i => {
      const p = db.products.find(x => x.id === i.productId);
      return p && {
        productId: p.id,
        name: p.name,
        category: p.category,
        emoji: p.emoji,
        image: p.image,
        price: p.price,
        stock: p.stock,
        quantity: i.quantity,
        lineTotal: p.price * i.quantity
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  // the UI shows "Rs. 0" discount and "Free" delivery
  return { items, itemCount: items.reduce((s, i) => s + i.quantity, 0), subtotal, discount: 0, delivery: 0, total: subtotal };
}

function checkQuantity(value) {
  const q = Number(value);
  if (!Number.isInteger(q) || q < 1 || q > MAX_QTY) throw new HttpError(400, 'Quantity must be a whole number from 1 to ' + MAX_QTY);
  return q;
}

module.exports = function (add) {
  // GET /api/cart
  add('GET', '/api/cart', { auth: true }, ({ user }) => [200, cartView(user.id)]);

  // POST /api/cart  { productId, quantity }  -> adds to what is already in the cart
  add('POST', '/api/cart', { auth: true }, ({ body, user }) => {
    const product = db.products.find(p => p.id === Number(body.productId));
    if (!product) throw new HttpError(404, 'Product not found');
    const quantity = body.quantity === undefined ? 1 : checkQuantity(body.quantity);

    const items = myItems(user.id);
    const line = items.find(i => i.productId === product.id);
    const newQty = (line ? line.quantity : 0) + quantity;
    if (newQty > product.stock) throw new HttpError(400, 'Only ' + product.stock + ' in stock');

    if (line) line.quantity = newQty;
    else items.push({ productId: product.id, quantity: newQty });
    save();
    return [201, cartView(user.id)];
  });

  // PUT /api/cart/:productId  { quantity }  -> sets the quantity (the "update cart" button)
  add('PUT', '/api/cart/:productId', { auth: true }, ({ params, body, user }) => {
    const productId = Number(params.productId);
    const line = myItems(user.id).find(i => i.productId === productId);
    if (!line) throw new HttpError(404, 'That item is not in your cart');

    const quantity = checkQuantity(body.quantity);
    const product = db.products.find(p => p.id === productId);
    if (quantity > product.stock) throw new HttpError(400, 'Only ' + product.stock + ' in stock');

    line.quantity = quantity;
    save();
    return [200, cartView(user.id)];
  });

  // DELETE /api/cart/:productId  -> remove one item (the X button)
  add('DELETE', '/api/cart/:productId', { auth: true }, ({ params, user }) => {
    const productId = Number(params.productId);
    const items = myItems(user.id);
    if (!items.some(i => i.productId === productId)) throw new HttpError(404, 'That item is not in your cart');
    db.carts[user.id] = items.filter(i => i.productId !== productId);
    save();
    return [200, cartView(user.id)];
  });

  // DELETE /api/cart  -> empty the cart
  add('DELETE', '/api/cart', { auth: true }, ({ user }) => {
    db.carts[user.id] = [];
    save();
    return [200, cartView(user.id)];
  });
};
