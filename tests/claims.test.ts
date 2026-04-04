import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CLAIM_INTAKE_APPROVED,
  OBLIGATION_STATUS_RESERVED,
  describeClaimStatus,
  describeObligationStatus,
  normalizeClaimRpcFailure,
  normalizeClaimSimulationFailure,
} from '../src/index.js';

test('normalizeClaimSimulationFailure maps scoped protocol pause errors', () => {
  const failure = normalizeClaimSimulationFailure({
    err: new Error('Protocol emergency pause is active'),
    logs: ['Program log: protocol paused'],
  });

  assert.equal(failure.code, 'protocol_paused');
  assert.equal(failure.retryable, true);
});

test('normalizeClaimSimulationFailure maps exhausted funding lines', () => {
  const failure = normalizeClaimSimulationFailure({
    err: 'budget exhausted',
    logs: ['Program log: funding line reserve exhausted'],
  });

  assert.equal(failure.code, 'funding_exhausted');
  assert.equal(failure.retryable, false);
});

test('normalizeClaimRpcFailure maps timeout and transport failures', () => {
  assert.equal(
    normalizeClaimRpcFailure(new Error('request timed out')).code,
    'rpc_timeout',
  );
  assert.equal(
    normalizeClaimRpcFailure(new Error('fetch failed: socket hang up')).code,
    'network_error',
  );
});

test('claim and obligation status descriptors follow the canonical model', () => {
  assert.equal(describeClaimStatus(CLAIM_INTAKE_APPROVED), 'approved');
  assert.equal(
    describeObligationStatus(OBLIGATION_STATUS_RESERVED),
    'reserved',
  );
});
