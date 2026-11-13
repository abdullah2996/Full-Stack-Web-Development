# Nila Bazaar - Backend (NestJS)

Only **modules, controllers and services** (no guards, pipes, authentication or database).
Data is stored in memory, so it resets when the server restarts.

## Run

```bash
cd backend
npm install
npm run start:dev
```

API runs on http://localhost:3000

## Structure

```
src/
  main.ts
  app.module.ts
  app.controller.ts
  products/   controller + service + module
  cart/       controller + service + module
  orders/     controller + service + module
  reviews/    controller + service + module
```

## Endpoints

| Method | URL | What it does |
|---|---|---|
| GET | /products?category=Pottery | list products (category optional) |
| GET | /products/:id | one product |
| POST | /products | add product (Sell with us page) |
| PUT | /products/:id | edit product |
| DELETE | /products/:id | delete product |
| GET | /cart?coupon=NILA10 | cart with totals |
| POST | /cart/items | add item `{ productId, quantity }` |
| PATCH | /cart/items/:productId | change quantity `{ quantity }` |
| DELETE | /cart/items/:productId | remove item |
| DELETE | /cart | empty cart |
| POST | /orders | place order from the cart |
| GET | /orders | list orders |
| GET | /orders/:id | one order |
| GET | /reviews?productId=1 | list reviews |
| GET | /reviews/summary | average + count + star breakdown |
| POST | /reviews | add review |

## Quick test (Postman or curl)

```bash
curl http://localhost:3000/products
curl -X POST http://localhost:3000/cart/items -H "Content-Type: application/json" -d '{"productId":1,"quantity":2}'
curl "http://localhost:3000/cart?coupon=NILA10"
curl -X POST http://localhost:3000/orders -H "Content-Type: application/json" \
  -d '{"name":"Ali Raza","phone":"0300-1234567","address":"House 1, F-7","city":"Islamabad","payment":"cod"}'
```
