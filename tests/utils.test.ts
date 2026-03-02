import test from 'node:test';
import assert from 'node:assert/strict';

import { fromHex } from '../src/utils.js';

test('fromHex parses valid hex with optional 0x prefix and mixed case', () => {
  const parsed = fromHex('  0xAbCd  ', 2);
  assert.deepEqual(Array.from(parsed), [0xab, 0xcd]);
});

test('fromHex rejects odd-length hex strings', () => {
  assert.throws(() => fromHex('abc'), /even number of characters/i);
});

test('fromHex rejects non-hex characters even when decoded length would match', () => {
  assert.throws(() => fromHex(`${'ab'.repeat(32)}xx`, 32), /non-hex/i);
  assert.throws(() => fromHex('00zz', 1), /non-hex/i);
});
