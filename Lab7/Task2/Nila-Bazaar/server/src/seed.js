// First run only: the same products and reviews that are shown on the HTML pages,
// plus one demo account (demo@nila.pk / nila123).
const { hashPassword } = require('./auth');

const PRODUCTS = [
  ['Multani Blue Pottery Vase', 'Pottery', 'Multan', 2800, 12, '🏺', 'Hand-painted vase glazed in classic cobalt.'],
  ['Ralli Patchwork Quilt', 'Home Decor', 'Hala (Sindh)', 7500, 5, '🛏️', 'Traditional ralli quilt stitched from recycled cloth scraps.'],
  ['Peshawari Chappal', 'Footwear', 'Peshawar', 3200, 20, '👞', 'Hand-stitched leather chappal with a sturdy sole.'],
  ['Truck Art Tea Tray', 'Home Decor', 'Other', 1800, 15, '🎨', 'Bright tray painted in the style of Pakistani truck art.'],
  ['Kashmiri Embroidered Shawl', 'Clothing', 'Srinagar / Kashmir', 9800, 4, '🧣', 'Soft wool shawl with fine needle embroidery on the border.'],
  ['Camel Skin Lamp', 'Lighting', 'Multan', 5400, 6, '💡', 'Painted table lamp that throws warm patterned light.'],
  ['Block Print Cushion Set', 'Home Decor', 'Other', 2200, 18, '🛋️', 'Set of two cotton cushion covers, block printed by hand.'],
  ['Sindhi Ajrak Stole', 'Clothing', 'Hala (Sindh)', 2600, 14, '🧵', 'Indigo and red ajrak stole with the traditional geometric print.'],
  ['Blue Pottery Mug Pair', 'Pottery', 'Multan', 1400, 25, '☕', 'Two glazed mugs, food safe and dishwasher friendly.'],
  ['Chinioti Jewellery Box', 'Home Decor', 'Other', 3900, 8, '📦', 'Carved sheesham wood box with a velvet-lined interior.']
];

const REVIEWS = [
  ['Ayesha Khan', 'Multani Blue Pottery Vase', 5, 'The colour is even better in person. Packed really well, nothing broke on the way to Lahore.'],
  ['Hamza Ali', 'Peshawari Chappal', 4, 'Very comfortable after a couple of days of wearing. Size ran slightly tight so order one up.'],
  ['Sana Malik', 'Kashmiri Embroidered Shawl', 5, 'Gifted this to my mother and she loved it. The embroidery is very neat.'],
  ['Bilal Ahmed', 'Truck Art Tea Tray', 4, 'Looks great in the drawing room. Paint is a little glossy but it suits the style.'],
  ['Maryam Iqbal', 'Ralli Patchwork Quilt', 5, 'Heavy, warm and every patch is different. Worth the price.'],
  ['Usman Raza', 'Camel Skin Lamp', 4, 'Gives a lovely warm pattern on the wall at night. Cable is a bit short.']
];

module.exports = function seed(db, nextId) {
  const now = new Date().toISOString();
  const idByName = {};

  for (const [name, category, madeIn, price, stock, emoji, description] of PRODUCTS) {
    const id = nextId('products');
    idByName[name] = id;
    db.products.push({ id, name, category, madeIn, price, stock, description, emoji, image: null, ownerId: null, createdAt: now });
  }
  for (const [who, product, rating, review] of REVIEWS) {
    db.reviews.push({ id: nextId('reviews'), productId: idByName[product], userId: null, name: who, rating, review, createdAt: now });
  }
  db.users.push({
    id: nextId('users'),
    fullname: 'Demo Student',
    email: 'demo@nila.pk',
    phone: '0300-1234567',
    passwordHash: hashPassword('nila123'),
    createdAt: now
  });
};
