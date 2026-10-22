const { db, save, nextId } = require('../store');
const { HttpError } = require('../lib');

const PHONE = /^03\d{2}-?\d{7}$/;
const PAYMENTS = ['cod', 'jazz', 'easy', 'card'];

const orderNumber = id => 'NB-' + (100000 + id);

function shape(o) {
  return {
    id: o.id,
    orderNumber: orderNumber(o.id),
    status: o.status,
    delivery: o.delivery,
    payment: o.payment,
    items: o.items.map(i => ({ ...i, lineTotal: i.price * i.quantity })),
    subtotal: o.subtotal,
    discount: o.discount,
    deliveryCharge: o.deliveryCharge,
    total: o.total,
    createdAt: o.createdAt
  };
}

module.exports = function (add) {
  // POST /api/orders  { name, phone, address, city, zip, payment }
  // Turns the logged-in user's cart into an order, lowers stock and empties the cart.
  add('POST', '/api/orders', { auth: true }, ({ body, user }) => {
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const address = String(body.address || '').trim();
    const city = String(body.city || '').trim();
    const zip = String(body.zip || '').trim();
    const payment = String(body.payment || 'cod').trim();

    if (name.length < 3) throw new HttpError(400, 'Enter your full name');
    if (!PHONE.test(phone)) throw new HttpError(400, 'Phone must look like 0300-1234567');
    if (address.length < 8) throw new HttpError(400, 'Enter your full street address');
    if (!city) throw new HttpError(400, 'Select your city');
    if (!/^\d{5}$/.test(zip)) throw new HttpError(400, 'Postal code must be 5 digits');
    if (!PAYMENTS.includes(payment)) throw new HttpError(400, 'Payment must be one of: ' + PAYMENTS.join(', '));

    const cart = (db.carts[user.id] || []).map(line => ({ line, product: db.products.find(p => p.id === line.productId) })).filter(x => x.product);
    if (!cart.length) throw new HttpError(400, 'Your cart is empty');

    // check everything first, change data only after all checks pass
    for (const { line, product } of cart) {
      if (line.quantity > product.stock) throw new HttpError(400, product.name + ': only ' + product.stock + ' left in stock');
    }

    const items = cart.map(({ line, product }) => ({ productId: product.id, name: product.name, price: product.price, quantity: line.quantity }));
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const order = {
      id: nextId('orders'),
      userId: user.id,
      delivery: { name, phone, address, city, zip },
      payment,
      items,
      subtotal,
      discount: 0,
      deliveryCharge: 0,
      total: subtotal,
      status: 'placed',
      createdAt: new Date().toISOString()
    };

    for (const { line, product } of cart) product.stock -= line.quantity;
    db.carts[user.id] = [];
    db.orders.push(order);
    save();
    return [201, { message: 'Order placed', order: shape(order) }];
  });

  // GET /api/orders  -> my orders, newest first
  add('GET', '/api/orders', { auth: true }, ({ user }) => {
    const mine = db.orders.filter(o => o.userId === user.id).reverse();
    return [200, { count: mine.length, orders: mine.map(shape) }];
  });

  // GET /api/orders/:id
  add('GET', '/api/orders/:id', { auth: true }, ({ params, user }) => {
    const order = db.orders.find(o => o.id === Number(params.id) && o.userId === user.id);
    if (!order) throw new HttpError(404, 'Order not found');
    return [200, { order: shape(order) }];
  });
};
