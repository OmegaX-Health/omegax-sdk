import test from 'node:test';
import assert from 'node:assert/strict';
import { Keypair, Transaction } from '@solana/web3.js';

import {
  buildUnsignedRewardClaimTx,
  mapValidationReasonToClaimFailure,
  normalizeClaimRpcFailure,
  normalizeClaimSimulationFailure,
  validateSignedClaimTx,
} from '../src/claims.js';
import { compileTransactionToV0 } from '../src/protocol.js';
import {
  deriveClaimPda,
  deriveCohortSettlementRootPda,
  deriveConfigPda,
  deriveMemberCyclePda,
  deriveMembershipPda,
  deriveOutcomeAggregatePda,
  derivePoolCompliancePolicyPda,
  derivePoolOraclePolicyPda,
  derivePoolTermsPda,
  derivePoolTreasuryReservePda,
} from '../src/protocol_seeds.js';
import { hashStringTo32 } from '../src/utils.js';
import { ZERO_PUBKEY } from '../src/protocol_seeds.js';

function createBaseRewardClaimParams() {
  const claimant = Keypair.generate();
  const member = Keypair.generate();
  const recipient = Keypair.generate();
  const recipientSystem = Keypair.generate();
  const program = Keypair.generate();
  const pool = Keypair.generate();
  const payoutMint = Keypair.generate();

  return {
    claimant,
    member,
    recipient,
    recipientSystem,
    program,
    pool,
    payoutMint,
    params: {
      claimantWallet: claimant.publicKey.toBase58(),
      member: member.publicKey.toBase58(),
      poolAddress: pool.publicKey.toBase58(),
      seriesRefHashHex: 'aa'.repeat(32),
      cycleHashHex: Buffer.from(hashStringTo32('cycle-reward-1')).toString('hex'),
      ruleHashHex: 'ab'.repeat(32),
      intentHashHex: 'cd'.repeat(32),
      payoutAmount: 50n,
      payoutMint: payoutMint.publicKey.toBase58(),
      recipient: recipient.publicKey.toBase58(),
      recipientSystemAccount: recipientSystem.publicKey.toBase58(),
      recentBlockhash: '11111111111111111111111111111111',
      programId: program.publicKey.toBase58(),
    },
  };
}

test('buildUnsignedRewardClaimTx is deterministic for fixed inputs', () => {
  const { member, program, pool, payoutMint, params } = createBaseRewardClaimParams();

  const a = buildUnsignedRewardClaimTx(params);
  const b = buildUnsignedRewardClaimTx(params);
  assert.equal(a.unsignedTxBase64, b.unsignedTxBase64);
  assert.equal(a.requiredSigner, params.claimantWallet);
  assert.equal(a.intentHashHex, params.intentHashHex);

  const decoded = Transaction.from(Buffer.from(a.unsignedTxBase64, 'base64'));
  assert.equal(decoded.instructions.length, 1);
  const ix = decoded.instructions[0];
  assert.equal(ix.keys.length, 19);

  const cycleHash = Buffer.from(params.cycleHashHex, 'hex');
  const ruleHash = Buffer.from(params.ruleHashHex, 'hex');
  const seriesRefHash = Buffer.from(params.seriesRefHashHex, 'hex');
  const [config] = deriveConfigPda(program.publicKey);
  const [poolTerms] = derivePoolTermsPda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
  });
  const [oraclePolicy] = derivePoolOraclePolicyPda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
  });
  const [poolTreasuryReserve] = derivePoolTreasuryReservePda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
    paymentMint: payoutMint.publicKey,
  });
  const [membership] = deriveMembershipPda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
    member: member.publicKey,
  });
  const [aggregate] = deriveOutcomeAggregatePda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
    seriesRefHash,
    member: member.publicKey,
    cycleHash,
    ruleHash,
  });
  const [claimRecord] = deriveClaimPda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
    seriesRefHash,
    member: member.publicKey,
    cycleHash,
    ruleHash,
  });

  assert.equal(ix.keys[1].pubkey.toBase58(), config.toBase58());
  assert.equal(ix.keys[3].pubkey.toBase58(), poolTerms.toBase58());
  assert.equal(ix.keys[4].pubkey.toBase58(), oraclePolicy.toBase58());
  assert.equal(ix.keys[5].pubkey.toBase58(), poolTreasuryReserve.toBase58());
  assert.equal(ix.keys[6].pubkey.toBase58(), membership.toBase58());
  assert.equal(ix.keys[7].pubkey.toBase58(), aggregate.toBase58());
  assert.equal(ix.keys[8].pubkey.toBase58(), program.publicKey.toBase58());
  assert.equal(ix.keys[9].pubkey.toBase58(), program.publicKey.toBase58());
  assert.equal(ix.keys[11].pubkey.toBase58(), program.publicKey.toBase58());
  assert.equal(ix.keys[12].pubkey.toBase58(), program.publicKey.toBase58());
  assert.equal(ix.keys[13].pubkey.toBase58(), program.publicKey.toBase58());
  assert.equal(ix.keys[14].pubkey.toBase58(), program.publicKey.toBase58());
  assert.equal(ix.keys[15].pubkey.toBase58(), claimRecord.toBase58());
  assert.equal(ix.keys[17].pubkey.toBase58(), '11111111111111111111111111111111');
  assert.equal(ix.keys[18].pubkey.toBase58(), program.publicKey.toBase58());
});

test('buildUnsignedRewardClaimTx uses the canonical zero pubkey when payout mint is omitted', () => {
  const { program, pool, params } = createBaseRewardClaimParams();
  const intent = buildUnsignedRewardClaimTx({
    ...params,
    payoutMint: undefined,
  });

  const decoded = Transaction.from(Buffer.from(intent.unsignedTxBase64, 'base64'));
  const ix = decoded.instructions[0];
  const [poolTreasuryReserve] = derivePoolTreasuryReservePda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
    paymentMint: ZERO_PUBKEY,
  });

  assert.equal(ix.keys[5].pubkey.toBase58(), poolTreasuryReserve.toBase58());
});

test('buildUnsignedRewardClaimTx rejects partial SPL payout accounts', () => {
  const { params } = createBaseRewardClaimParams();

  assert.throws(() => {
    buildUnsignedRewardClaimTx({
      ...params,
      poolAssetVault: Keypair.generate().publicKey.toBase58(),
    });
  }, /poolAssetVault, poolVaultTokenAccount, and recipientTokenAccount must be provided together/);
});

test('buildUnsignedRewardClaimTx supports canonical optional reward accounts and compliance policy', () => {
  const { member, program, pool, params } = createBaseRewardClaimParams();
  const seriesRefHash = Buffer.from(params.seriesRefHashHex, 'hex');
  const cohortHashHex = 'ef'.repeat(32);
  const [memberCycle] = deriveMemberCyclePda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
    seriesRefHash,
    member: member.publicKey,
    periodIndex: 5n,
  });
  const [cohortSettlementRoot] = deriveCohortSettlementRootPda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
    seriesRefHash,
    cohortHash: Buffer.from(cohortHashHex, 'hex'),
  });
  const [poolCompliancePolicy] = derivePoolCompliancePolicyPda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
  });

  const intent = buildUnsignedRewardClaimTx({
    ...params,
    memberCycle: memberCycle.toBase58(),
    cohortSettlementRoot: cohortSettlementRoot.toBase58(),
    includePoolCompliancePolicy: true,
  });

  const decoded = Transaction.from(Buffer.from(intent.unsignedTxBase64, 'base64'));
  const ix = decoded.instructions[0];
  assert.equal(ix.keys.length, 19);
  assert.equal(ix.keys[8].pubkey.toBase58(), memberCycle.toBase58());
  assert.equal(ix.keys[9].pubkey.toBase58(), cohortSettlementRoot.toBase58());
  assert.equal(ix.keys[9].isWritable, true);
  assert.equal(ix.keys[18].pubkey.toBase58(), poolCompliancePolicy.toBase58());
});

test('validateSignedClaimTx validates required signer signature', () => {
  const { claimant, params } = createBaseRewardClaimParams();

  const intent = buildUnsignedRewardClaimTx(params);
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

test('validateSignedClaimTx accepts versioned signed tx when message matches prepared intent', () => {
  const { claimant, params } = createBaseRewardClaimParams();

  const intent = buildUnsignedRewardClaimTx(params);
  const unsignedLegacyTx = Transaction.from(Buffer.from(intent.unsignedTxBase64, 'base64'));
  const unsignedVersionedTx = compileTransactionToV0(unsignedLegacyTx, []);
  const expectedUnsignedTxBase64 = Buffer.from(unsignedVersionedTx.serialize()).toString('base64');

  const signedVersionedTx = compileTransactionToV0(unsignedLegacyTx, []);
  signedVersionedTx.sign([claimant]);
  const signedTxBase64 = Buffer.from(signedVersionedTx.serialize()).toString('base64');

  const result = validateSignedClaimTx({
    signedTxBase64,
    requiredSigner: claimant.publicKey.toBase58(),
    expectedUnsignedTxBase64,
  });

  assert.equal(result.valid, true);
  assert.equal(result.reason, null);
  assert.equal(result.signer, claimant.publicKey.toBase58());
  assert.ok(result.txSignature);
});

test('validateSignedClaimTx enforces signed tx message match with prepared intent', () => {
  const { claimant, params } = createBaseRewardClaimParams();

  const expectedIntent = buildUnsignedRewardClaimTx(params);
  const differentIntent = buildUnsignedRewardClaimTx({
    ...params,
    cycleHashHex: Buffer.from(hashStringTo32('cycle-reward-2')).toString('hex'),
    intentHashHex: 'de'.repeat(32),
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
  const { claimant, params } = createBaseRewardClaimParams();

  const intent = buildUnsignedRewardClaimTx(params);
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

test('validateSignedClaimTx accepts signed tx when only the recent blockhash changes', () => {
  const { claimant, params } = createBaseRewardClaimParams();

  const intent = buildUnsignedRewardClaimTx(params);
  const tx = Transaction.from(Buffer.from(intent.unsignedTxBase64, 'base64'));
  tx.recentBlockhash = Keypair.generate().publicKey.toBase58();
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
