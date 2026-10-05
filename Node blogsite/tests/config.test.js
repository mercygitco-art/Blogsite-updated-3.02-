const test = require('node:test');
const assert = require('node:assert/strict');

const { validateEnv, normalizeConfig } = require('../config/env');

test('validateEnv accepts a complete production config', () => {
  const config = validateEnv({
    NODE_ENV: 'production',
    PORT: '4000',
    JWT_SECRET: 'abcdefghijklmnopqrstuvwxyz123456',
    MONGODB_URI: 'mongodb://localhost:27017/blogsite',
    FRONTEND_URL: 'https://example.com',
    SESSION_SECRET: 'abcdefghijklmnopqrstuvwxyz123456'
  });

  assert.equal(config.NODE_ENV, 'production');
  assert.equal(config.PORT, 4000);
  assert.equal(config.JWT_SECRET.length >= 32, true);
  assert.equal(config.MONGODB_URI, 'mongodb://localhost:27017/blogsite');
});

test('validateEnv rejects missing required production values', () => {
  assert.throws(() => {
    validateEnv({
      NODE_ENV: 'production',
      PORT: '4000',
      JWT_SECRET: 'short',
      FRONTEND_URL: 'https://example.com'
    });
  }, /JWT_SECRET|MONGODB_URI/);
});

test('normalizeConfig resolves secure cookie settings for production', () => {
  const config = normalizeConfig({
    NODE_ENV: 'production',
    PORT: '4000',
    JWT_SECRET: 'abcdefghijklmnopqrstuvwxyz123456',
    MONGODB_URI: 'mongodb://localhost:27017/blogsite',
    FRONTEND_URL: 'https://example.com'
  });

  assert.equal(config.cookieSecure, true);
  assert.equal(config.corsOrigin, 'https://example.com');
});
