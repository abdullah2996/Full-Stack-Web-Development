# Nila Bazaar API

REST endpoints for the Nila Bazaar UI, written in plain Node.js (`http`, `fs`, `crypto`).
No Express and no npm packages, so there is nothing to install. Needs Node 20 or newer.

Data is saved in `server/data/db.json` (created automatically). It is read when the server
starts and written after every change, so everything is still there after a restart.

## Run it

```
cd server
npm start
```

Server starts on http://localhost:3000. Run `npm test` to check every endpoint.

The first start creates the 10 products and 6 reviews from the HTML pages and a demo account:
`demo@nila.pk` / `nila123`.

## Endpoints

Routes marked **login** need the header `Authorization: Bearer <token>` (the token is returned by signup and login).
Errors always look like `{ "error": "message" }` with status 400, 401, 403, 404, 405 or 409.
Bodies can be JSON or normal HTML form data.

| Method | URL | Login | Body / query | What it does |
|---|---|---|---|---|
| POST | /api/auth/signup | no | fullname, email, phone, password | create account, returns token |
| POST | /api/auth/login | no | email, password | returns token |
| GET | /api/auth/me | yes | | current user |
| GET | /api/products | no | `?category=` `?q=` `?sort=price_asc\|price_desc\|rating\|newest` | list products |
| GET | /api/products/:id | no | | one product |
| POST | /api/products | yes | name, category, city, price, stock, description, photo (optional) | add product |
| PUT | /api/products/:id | yes | any of the fields above | edit your own product |
| DELETE | /api/products/:id | yes | | delete your own product |
| GET | /api/reviews | no | `?productId=` | list reviews + average rating |
| POST | /api/reviews | yes | product (name) or productId, rating 1-5, review | post review |
| GET | /api/cart | yes | | show cart with totals |
| POST | /api/cart | yes | productId, quantity (default 1) | add item |
| PUT | /api/cart/:productId | yes | quantity | edit quantity |
| DELETE | /api/cart/:productId | yes | | remove one item |
| DELETE | /api/cart | yes | | empty cart |
| POST | /api/orders | yes | name, phone, address, city, zip, payment (cod, jazz, easy, card) | checkout: cart becomes an order, stock goes down, cart is emptied |
| GET | /api/orders | yes | | my orders |
| GET | /api/orders/:id | yes | | one of my orders |
| GET | /uploads/:file | no | | uploaded product photo |

Field names match the `name="..."` attributes already used in the HTML forms.

`photo` is either an image link (`https://...`) or a base64 data URL (`data:image/png;base64,...`, max 2 MB).
A base64 photo is saved in `data/uploads/` and the product gets the path `/uploads/<file>`.

## Quick try (curl)

```
curl -X POST localhost:3000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"demo@nila.pk","password":"nila123"}'

curl "localhost:3000/api/products?category=Pottery"

curl -X POST localhost:3000/api/cart -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" -d '{"productId":1,"quantity":2}'
```

## How the code is organised

- `src/server.js` - creates the server with `http.createServer`, small router, login check, error handling
- `src/lib.js` - `send()` (JSON.stringify + headers), `readBody()`, `HttpError`
- `src/auth.js` - password hashing (scrypt) and signed login tokens (HMAC) with `crypto`
- `src/store.js` - loads and saves `data/db.json`
- `src/seed.js` - first-run data
- `src/routes/` - auth, products, reviews, cart, orders
