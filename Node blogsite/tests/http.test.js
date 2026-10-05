const test = require('node:test');
const assert = require('node:assert/strict');
const { buildErrorResponse, buildSuccessResponse } = require('../utils/http');

test('buildErrorResponse returns a consistent error payload', () => {
  const payload = buildErrorResponse('Validation failed', { field: 'email' }, 400);

  assert.deepEqual(payload, {
    success: false,
    message: 'Validation failed',
    error: { field: 'email' }
  });
});

test('buildSuccessResponse returns a consistent success payload', () => {
  const payload = buildSuccessResponse({ ok: true }, 'Saved successfully', 200);

  assert.deepEqual(payload, {
    success: true,
    message: 'Saved successfully',
    data: { ok: true }
  });
});
