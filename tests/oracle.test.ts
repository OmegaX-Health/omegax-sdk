import test from 'node:test';
import assert from 'node:assert/strict';
import bs58 from 'bs58';
import nacl from 'tweetnacl';

import { attestOutcome } from '../src/oracle.js';
import { stableStringify } from '../src/utils.js';

test('attestOutcome produces verifiable signature', async () => {
  const kp = nacl.sign.keyPair();
  const signer = {
    keyId: 'oracle-test-key',
    publicKeyBase58: bs58.encode(kp.publicKey),
    sign: async (message: Uint8Array) => nacl.sign.detached(message, kp.secretKey),
  };

  const { attestation } = await attestOutcome({
    userId: 'u1',
    cycleId: 'c1',
    outcomeId: 'o1',
    asOfIso: '2026-01-01T00:00:00.000Z',
    payload: { status: 'pass', score: 1 },
    signer,
  });

  const canonicalBody = {
    id: attestation.id,
    userId: attestation.userId,
    cycleId: attestation.cycleId,
    outcomeId: attestation.outcomeId,
    asOfIso: attestation.asOfIso,
    issuedAtIso: attestation.issuedAtIso,
    payload: attestation.payload,
    verifier: attestation.verifier,
  };

  const message = new TextEncoder().encode(stableStringify(canonicalBody));
  const signature = Buffer.from(attestation.signatureBase64, 'base64');

  const ok = nacl.sign.detached.verify(
    message,
    new Uint8Array(signature),
    bs58.decode(attestation.verifier.publicKeyBase58),
  );

  assert.equal(ok, true);
  assert.equal(attestation.verifier.algorithm, 'ed25519');
});
