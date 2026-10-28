const assert = require('node:assert/strict');
const { before, after, test } = require('node:test');
const { randomUUID } = require('node:crypto');
require('reflect-metadata');
const { Test } = require('@nestjs/testing');
const { DataSource } = require('typeorm');
const { AppModule } = require('../dist/app.module');
const { configureApp } = require('../dist/configure-app');

// Integration tests must explicitly target a disposable test database.
if (!process.env.DB_NAME?.endsWith('_test')) {
  throw new Error('Set DB_NAME to a dedicated database ending in _test before running npm test.');
}
process.env.NODE_ENV = 'test';

let app;
let baseUrl;
const accounts = [];
const password = 'LocalTestPassword123!';
const emailPrefix = randomUUID();

async function request(path, { token, body, method = 'GET' } = {}) {
  const response = await fetch(`${baseUrl}/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: response.status, body: await response.json() };
}

async function register(role, suffix) {
  const email = `${emailPrefix}-${suffix}@example.com`;
  const result = await request('/auth/register', {
    method: 'POST', body: { email, password, name: `Test ${suffix}`, role },
  });
  assert.equal(result.status, 201, JSON.stringify(result.body));
  accounts.push(result.body.user.id);
  assert.ok(result.body.access_token);
  assert.equal(result.body.user.password, undefined);
  return { ...result.body, email };
}

before(async () => {
  const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = module.createNestApplication({ logger: false });
  configureApp(app);
  await app.listen(0, '127.0.0.1');
  baseUrl = await app.getUrl();
});

after(async () => {
  if (!app) return;
  try {
    // Deleting only accounts created by this run cascades to their demo data.
    const database = app.get(DataSource);
    await database.query('DELETE FROM orders WHERE customer_id = ANY($1::uuid[])', [accounts]);
    for (const id of accounts) await database.query('DELETE FROM users WHERE id = $1', [id]);
  } finally {
    await app.close();
  }
});

test('registration, login, validation, and protected profile', async () => {
  const customer = await register('customer', 'auth');
  const duplicate = await request('/auth/register', { method: 'POST', body: {
    email: customer.email, password, name: 'Duplicate',
  } });
  assert.equal(duplicate.status, 409);
  assert.equal((await request('/auth/login', { method: 'POST', body: {
    email: customer.email, password: 'wrong-password',
  } })).status, 401);
  const login = await request('/auth/login', { method: 'POST', body: {
    email: customer.email, password,
  } });
  assert.equal(login.status, 200);
  assert.equal((await request('/auth/me')).status, 401);
  const me = await request('/auth/me', { token: login.body.access_token });
  assert.equal(me.status, 200);
  assert.equal(me.body.id, customer.user.id);
  assert.equal(me.body.password, undefined);
  assert.equal((await request('/auth/register', { method: 'POST', body: {
    email: `${emailPrefix}-admin@example.com`, password, name: 'Admin', role: 'admin',
  } })).status, 400);
  assert.equal((await request('/auth/register', { method: 'POST', body: {
    email: 'invalid', password: 'short', name: '',
  } })).status, 400);
});

test('ordering enforces roles, ownership, totals, and cancellation rules', async () => {
  const owner = await register('restaurant_owner', 'owner');
  const otherOwner = await register('restaurant_owner', 'other-owner');
  const customer = await register('customer', 'buyer');
  const outsider = await register('customer', 'outsider');
  const restaurantBody = { name: 'Demo Kitchen', address: '123 Demo Street', phone: '0900000000', category: 'Vietnamese' };
  assert.equal((await request('/restaurants', { method: 'POST', token: customer.access_token, body: restaurantBody })).status, 403);
  const restaurant = await request('/restaurants', { method: 'POST', token: owner.access_token, body: restaurantBody });
  assert.equal(restaurant.status, 201);
  const menu = await request(`/restaurants/${restaurant.body.id}/menu`, {
    method: 'POST', token: owner.access_token, body: { name: 'Noodle bowl', price: 55000, category: 'Lunch' },
  });
  assert.equal(menu.status, 201);
  assert.equal((await request(`/restaurants/${restaurant.body.id}/reviews`)).status, 200);
  const orderBody = { restaurantId: restaurant.body.id, deliveryAddress: '456 Demo Street', items: [{ menuItemId: menu.body.id, quantity: 2 }] };
  assert.equal((await request('/orders', { method: 'POST', token: owner.access_token, body: orderBody })).status, 403);
  const order = await request('/orders', { method: 'POST', token: customer.access_token, body: orderBody });
  assert.equal(order.status, 201, JSON.stringify(order.body));
  assert.equal(Number(order.body.subtotal), 110000);
  assert.equal(Number(order.body.total), 125000);
  assert.equal(order.body.customer.password, undefined);
  assert.equal((await request('/reviews', { method: 'POST', token: owner.access_token, body: {
    restaurantId: restaurant.body.id, rating: 5,
  } })).status, 403);
  assert.equal((await request('/reviews', { method: 'POST', token: customer.access_token, body: {
    restaurantId: restaurant.body.id, orderId: order.body.id, rating: 5, comment: 'Demo review',
  } })).status, 201);
  const reviews = await request(`/restaurants/${restaurant.body.id}/reviews`);
  assert.equal(reviews.status, 200);
  assert.equal(reviews.body[0].user.password, undefined);
  const path = `/orders/${order.body.id}`;
  assert.equal((await request(path, { token: outsider.access_token })).status, 403);
  assert.equal((await request(path, { token: otherOwner.access_token })).status, 403);
  assert.equal((await request(path, { token: owner.access_token })).status, 200);
  assert.equal((await request(`${path}/status`, { method: 'PATCH', token: customer.access_token, body: { status: 'confirmed' } })).status, 403);
  assert.equal((await request(`${path}/cancel`, { method: 'POST', token: outsider.access_token })).status, 403);
  assert.equal((await request(`${path}/status`, { method: 'PATCH', token: otherOwner.access_token, body: { status: 'confirmed' } })).status, 403);
  assert.equal((await request(`${path}/status`, { method: 'PATCH', token: owner.access_token, body: { status: 'confirmed' } })).status, 200);
  assert.equal((await request(`${path}/cancel`, { method: 'POST', token: customer.access_token })).status, 400);
  const pending = await request('/orders', { method: 'POST', token: customer.access_token, body: orderBody });
  assert.equal(pending.status, 201);
  const cancelled = await request(`/orders/${pending.body.id}/cancel`, { method: 'POST', token: customer.access_token });
  assert.equal(cancelled.status, 201);
  assert.equal(cancelled.body.status, 'cancelled');
  const invalidOrder = await request('/orders', { method: 'POST', token: customer.access_token, body: {
    ...orderBody, items: [{ menuItemId: randomUUID(), quantity: 1 }],
  } });
  assert.equal(invalidOrder.status, 400);
});
