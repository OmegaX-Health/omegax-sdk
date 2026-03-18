import test from 'node:test';
import assert from 'node:assert/strict';

import {
  encodeI64Le,
  encodeString,
  encodeU16Le,
  encodeU32Le,
  encodeU64Le,
  fromHex,
  hashStringTo32,
  newId,
  readI64Le,
  readString,
  readU16Le,
  readU32Le,
  readU64Le,
  sha256Bytes,
  sha256Hex,
  stableStringify,
  toHex,
  toIsoString,
} from '../src/utils.js';

test('stableStringify sorts object keys recursively while preserving array order', () => {
  const canonical = stableStringify({
    zebra: 1,
    alpha: {
      beta: 2,
      alpha: 1,
    },
    list: [{ b: 2, a: 1 }, 'tail'],
  });

  assert.equal(
    canonical,
    '{"alpha":{"alpha":1,"beta":2},"list":[{"a":1,"b":2},"tail"],"zebra":1}',
  );
});

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

test('numeric and string encoding helpers roundtrip fixed-width values', () => {
  const encoded = Buffer.concat([
    encodeU16Le(65_500),
    encodeU32Le(4_000_000_000),
    encodeU64Le(9_876_543_210_123_456_789n),
    encodeI64Le(-123_456_789n),
    encodeString('OmegaX health'),
  ]);

  assert.equal(readU16Le(encoded, 0), 65_500);
  assert.equal(readU32Le(encoded, 2), 4_000_000_000);
  assert.equal(readU64Le(encoded, 6), 9_876_543_210_123_456_789n);
  assert.equal(readI64Le(encoded, 14), -123_456_789n);

  const decodedString = readString(encoded, 22);
  assert.equal(decodedString.value, 'OmegaX health');
  assert.equal(decodedString.offset, encoded.length);
});

test('hash helpers produce consistent 32-byte digests and canonical hex encoding', () => {
  const digestHex = sha256Hex('omega');
  const digestBytes = sha256Bytes('omega');

  assert.equal(
    digestHex,
    '304b4a90a76a1cbe4c112e074b30e75181f54df43d60f883597457844293b341',
  );
  assert.equal(toHex(digestBytes), digestHex);
  assert.equal(hashStringTo32('omega').length, 32);
  assert.deepEqual(hashStringTo32('omega'), digestBytes);
});

test('ID and ISO helpers expose stable prefixes and normalized timestamps', () => {
  const id = newId('claim');
  assert.match(id, /^claim_[0-9a-f-]{36}$/i);

  const iso = toIsoString('2026-03-10T10:30:00+01:00');
  assert.equal(iso, '2026-03-10T09:30:00.000Z');
  assert.equal(
    toIsoString(new Date('2026-03-10T09:30:00.000Z')),
    '2026-03-10T09:30:00.000Z',
  );
});
