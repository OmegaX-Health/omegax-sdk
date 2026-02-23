import test from 'node:test';
import assert from 'node:assert/strict';
import { Keypair, PublicKey, Transaction } from '@solana/web3.js';

import {
  buildUnsignedClaimTx,
  buildUnsignedRewardClaimTx,
  mapValidationReasonToClaimFailure,
  normalizeClaimRpcFailure,
  normalizeClaimSimulationFailure,
  validateSignedClaimTx,
} from '../src/claims.js';
import {
  deriveClaimV2Pda,
  deriveConfigV2Pda,
  deriveCycleWindowPda,
  deriveMembershipPda,
  deriveOutcomeAggregatePda,
  derivePoolOraclePolicyPda,
  derivePoolTermsPda,
} from '../src/protocol_seeds.js';
import { hashStringTo32 } from '../src/utils.js';

test('buildUnsignedClaimTx is deterministic for fixed inputs', () => {
  const claimant = Keypair.generate();
  const program = Keypair.generate();
  const pool = Keypair.generate();

  const baseParams = {
    intentId: 'intent-fixed',
    claimantWallet: claimant.publicKey.toBase58(),
    cycleId: 'cycle-123',
    outcomeId: 'outcome-aaa',
    attestationRefs: ['att-1'],
    recentBlockhash: '11111111111111111111111111111111',
    expiresAtIso: '2026-12-31T00:00:00.000Z',
    programId: program.publicKey.toBase58(),
    poolAddress: pool.publicKey.toBase58(),
  };

  const a = buildUnsignedClaimTx(baseParams);
  const b = buildUnsignedClaimTx(baseParams);

  assert.equal(a.unsignedTxBase64, b.unsignedTxBase64);
  assert.equal(a.requiredSigner, claimant.publicKey.toBase58());

  const decoded = Transaction.from(Buffer.from(a.unsignedTxBase64, 'base64'));
  assert.equal(decoded.instructions.length, 1);
  const ix = decoded.instructions[0];
  assert.equal(ix.keys.length, 7);

  const [expectedCycleWindow] = deriveCycleWindowPda({
    programId: new PublicKey(baseParams.programId),
    poolAddress: new PublicKey(baseParams.poolAddress),
    cycleHash: hashStringTo32(baseParams.cycleId),
  });
  assert.equal(ix.keys[4].pubkey.toBase58(), expectedCycleWindow.toBase58());
});

test('buildUnsignedRewardClaimTx is deterministic for fixed inputs', () => {
  const claimant = Keypair.generate();
  const member = Keypair.generate();
  const recipient = Keypair.generate();
  const recipientSystem = Keypair.generate();
  const program = Keypair.generate();
  const pool = Keypair.generate();
  const ruleHashHex = 'ab'.repeat(32);

  const baseParams = {
    claimantWallet: claimant.publicKey.toBase58(),
    member: member.publicKey.toBase58(),
    poolAddress: pool.publicKey.toBase58(),
    cycleId: 'cycle-reward-1',
    ruleHashHex,
    intentHashHex: 'cd'.repeat(32),
    payoutAmount: 50n,
    recipient: recipient.publicKey.toBase58(),
    recipientSystemAccount: recipientSystem.publicKey.toBase58(),
    recentBlockhash: '11111111111111111111111111111111',
    programId: program.publicKey.toBase58(),
  };

  const a = buildUnsignedRewardClaimTx(baseParams);
  const b = buildUnsignedRewardClaimTx(baseParams);
  assert.equal(a.unsignedTxBase64, b.unsignedTxBase64);
  assert.equal(a.requiredSigner, claimant.publicKey.toBase58());
  assert.equal(a.intentHashHex, baseParams.intentHashHex);

  const decoded = Transaction.from(Buffer.from(a.unsignedTxBase64, 'base64'));
  assert.equal(decoded.instructions.length, 1);
  const ix = decoded.instructions[0];
  assert.equal(ix.keys.length, 15);

  const cycleHash = hashStringTo32(baseParams.cycleId);
  const ruleHash = Buffer.from(ruleHashHex, 'hex');
  const [configV2] = deriveConfigV2Pda(program.publicKey);
  const [poolTerms] = derivePoolTermsPda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
  });
  const [oraclePolicy] = derivePoolOraclePolicyPda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
  });
  const [membership] = deriveMembershipPda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
    member: member.publicKey,
  });
  const [aggregate] = deriveOutcomeAggregatePda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
    member: member.publicKey,
    cycleHash,
    ruleHash,
  });
  const [claimRecordV2] = deriveClaimV2Pda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
    member: member.publicKey,
    cycleHash,
    ruleHash,
  });

  assert.equal(ix.keys[1].pubkey.toBase58(), configV2.toBase58());
  assert.equal(ix.keys[3].pubkey.toBase58(), poolTerms.toBase58());
  assert.equal(ix.keys[4].pubkey.toBase58(), oraclePolicy.toBase58());
  assert.equal(ix.keys[5].pubkey.toBase58(), membership.toBase58());
  assert.equal(ix.keys[6].pubkey.toBase58(), aggregate.toBase58());
  assert.equal(ix.keys[12].pubkey.toBase58(), claimRecordV2.toBase58());
  assert.equal(ix.keys[14].pubkey.toBase58(), '11111111111111111111111111111111');
});

test('buildUnsignedRewardClaimTx rejects partial SPL payout accounts', () => {
  const claimant = Keypair.generate();
  const member = Keypair.generate();
  const recipient = Keypair.generate();
  const recipientSystem = Keypair.generate();
  const program = Keypair.generate();
  const pool = Keypair.generate();

  assert.throws(() => {
    buildUnsignedRewardClaimTx({
      claimantWallet: claimant.publicKey.toBase58(),
      member: member.publicKey.toBase58(),
      poolAddress: pool.publicKey.toBase58(),
      cycleId: 'cycle-reward-2',
      ruleHashHex: 'ab'.repeat(32),
      intentHashHex: 'cd'.repeat(32),
      payoutAmount: 10n,
      recipient: recipient.publicKey.toBase58(),
      recipientSystemAccount: recipientSystem.publicKey.toBase58(),
      poolAssetVault: Keypair.generate().publicKey.toBase58(),
      recentBlockhash: '11111111111111111111111111111111',
      programId: program.publicKey.toBase58(),
    });
  });
});

test('validateSignedClaimTx validates required signer signature', () => {
  const claimant = Keypair.generate();
  const program = Keypair.generate();
  const pool = Keypair.generate();

  const intent = buildUnsignedClaimTx({
    intentId: 'intent-signed',
    claimantWallet: claimant.publicKey.toBase58(),
    cycleId: 'cycle-xyz',
    outcomeId: 'outcome-1',
    attestationRefs: ['att-x'],
    recentBlockhash: '11111111111111111111111111111111',
    expiresAtIso: '2026-12-31T00:00:00.000Z',
    programId: program.publicKey.toBase58(),
    poolAddress: pool.publicKey.toBase58(),
  });

  const tx = Transaction.from(Buffer.from(intent.unsignedTxBase64, 'base64'));
  tx.sign(claimant);
  const signedTxBase64 = tx.serialize().toString('base64');

  const valid = validateSignedClaimTx({
    signedTxBase64,
    requiredSigner: claimant.publicKey.toBase58(),
  });

  assert.equal(valid.valid, true);
  assert.equal(valid.reason, null);
  assert.ok(valid.txSignature);
});

test('validateSignedClaimTx enforces signed tx message match with prepared intent', () => {
  const claimant = Keypair.generate();
  const program = Keypair.generate();
  const pool = Keypair.generate();

  const expectedIntent = buildUnsignedClaimTx({
    intentId: 'intent-expected',
    claimantWallet: claimant.publicKey.toBase58(),
    cycleId: 'cycle-a',
    outcomeId: 'outcome-a',
    attestationRefs: ['att-a'],
    recentBlockhash: '11111111111111111111111111111111',
    expiresAtIso: '2026-12-31T00:00:00.000Z',
    programId: program.publicKey.toBase58(),
    poolAddress: pool.publicKey.toBase58(),
  });

  const differentIntent = buildUnsignedClaimTx({
    intentId: 'intent-different',
    claimantWallet: claimant.publicKey.toBase58(),
    cycleId: 'cycle-b',
    outcomeId: 'outcome-b',
    attestationRefs: ['att-b'],
    recentBlockhash: '11111111111111111111111111111111',
    expiresAtIso: '2026-12-31T00:00:00.000Z',
    programId: program.publicKey.toBase58(),
    poolAddress: pool.publicKey.toBase58(),
  });

  const tx = Transaction.from(Buffer.from(differentIntent.unsignedTxBase64, 'base64'));
  tx.sign(claimant);
  const signedTxBase64 = tx.serialize().toString('base64');

  const result = validateSignedClaimTx({
    signedTxBase64,
    requiredSigner: claimant.publicKey.toBase58(),
    expectedUnsignedTxBase64: expectedIntent.unsignedTxBase64,
  });

  assert.equal(result.valid, false);
  assert.equal(result.reason, 'intent_message_mismatch');
});

test('validateSignedClaimTx accepts signed tx when message matches prepared intent', () => {
  const claimant = Keypair.generate();
  const program = Keypair.generate();
  const pool = Keypair.generate();

  const intent = buildUnsignedClaimTx({
    intentId: 'intent-match',
    claimantWallet: claimant.publicKey.toBase58(),
    cycleId: 'cycle-c',
    outcomeId: 'outcome-c',
    attestationRefs: ['att-c'],
    recentBlockhash: '11111111111111111111111111111111',
    expiresAtIso: '2026-12-31T00:00:00.000Z',
    programId: program.publicKey.toBase58(),
    poolAddress: pool.publicKey.toBase58(),
  });

  const tx = Transaction.from(Buffer.from(intent.unsignedTxBase64, 'base64'));
  tx.sign(claimant);
  const signedTxBase64 = tx.serialize().toString('base64');

  const result = validateSignedClaimTx({
    signedTxBase64,
    requiredSigner: claimant.publicKey.toBase58(),
    expectedUnsignedTxBase64: intent.unsignedTxBase64,
  });

  assert.equal(result.valid, true);
  assert.equal(result.reason, null);
});

test('normalizeClaimSimulationFailure maps liquidity failures', () => {
  const mapped = normalizeClaimSimulationFailure({
    err: { InstructionError: [0, 'Custom'] },
    logs: ['Program log: InsufficientPoolLiquidity'],
  });

  assert.equal(mapped.code, 'simulation_failed_insufficient_funds');
});

test('normalizeClaimSimulationFailure maps membership failures', () => {
  const mapped = normalizeClaimSimulationFailure({
    err: 'membership not active',
    logs: ['Program log: MembershipNotActive'],
  });

  assert.equal(mapped.code, 'simulation_failed_membership_invalid');
});

test('normalizeClaimRpcFailure maps timeout errors', () => {
  const mapped = normalizeClaimRpcFailure(new Error('request timed out'));
  assert.equal(mapped.code, 'rpc_timeout');
});

test('mapValidationReasonToClaimFailure maps signer mismatch', () => {
  assert.equal(
    mapValidationReasonToClaimFailure('required_signer_mismatch'),
    'required_signer_mismatch',
  );
});
