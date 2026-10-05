const test = require('node:test');
const assert = require('node:assert/strict');
const { registerSchema, adminPostSchema } = require('../middleware/validate');

test('registerSchema accepts valid registration payloads', () => {
  const result = registerSchema.safeParse({
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'StrongPass123!'
  });

  assert.equal(result.success, true);
  assert.deepEqual(result.data, {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'StrongPass123!'
  });
});

test('registerSchema rejects invalid email addresses', () => {
  const result = registerSchema.safeParse({
    name: 'Jane Doe',
    email: 'invalid-email',
    password: 'StrongPass123!'
  });

  assert.equal(result.success, false);
  assert.match(result.error.issues[0].message, /email/i);
});

test('adminPostSchema rejects invalid post status values', () => {
  const result = adminPostSchema.safeParse({
    title: 'My post',
    content: '<p>Body</p>',
    status: 'published-now'
  });

  assert.equal(result.success, false);
  assert.match(result.error.issues[0].message, /status/i);
});
