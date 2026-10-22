const { db, save, nextId } = require('../store');
const { HttpError } = require('../lib');

function shape(r) {
  const product = db.products.find(p => p.id === r.productId);
  return {
    id: r.id,
    productId: r.productId,
    product: product ? product.name : null,
    name: r.name,
    rating: r.rating,
    review: r.review,
    createdAt: r.createdAt
  };
}

module.exports = function (add) {
  // GET /api/reviews?productId=1   (productId is optional)
  add('GET', '/api/reviews', {}, ({ query }) => {
    let list = db.reviews.slice().reverse();
    if (query.productId) list = list.filter(r => r.productId === Number(query.productId));
    const average = list.length ? Math.round((list.reduce((s, r) => s + r.rating, 0) / list.length) * 10) / 10 : 0;
    return [200, { count: list.length, average, reviews: list.map(shape) }];
  });

  // POST /api/reviews  { productId OR product (name), rating, review }  (login needed)
  add('POST', '/api/reviews', { auth: true }, ({ body, user }) => {
    let product;
    if (body.productId) product = db.products.find(p => p.id === Number(body.productId));
    else if (body.product) product = db.products.find(p => p.name === String(body.product));
    if (!product) throw new HttpError(400, 'Choose a valid product');

    const rating = Number(body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new HttpError(400, 'Rating must be 1 to 5');
    const text = String(body.review || '').trim();
    if (text.length < 10) throw new HttpError(400, 'Review must be at least 10 characters');

    const review = {
      id: nextId('reviews'),
      productId: product.id,
      userId: user.id,
      name: user.fullname,
      rating,
      review: text,
      createdAt: new Date().toISOString()
    };
    db.reviews.push(review);
    save();
    return [201, { message: 'Review posted', review: shape(review) }];
  });
};
