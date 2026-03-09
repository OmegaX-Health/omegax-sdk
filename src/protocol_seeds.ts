import {
  PublicKey,
} from '@solana/web3.js';

export const SEED_CONFIG = 'config';
export const SEED_POOL = 'pool';
export const SEED_ORACLE = 'oracle';
export const SEED_ORACLE_PROFILE = 'oracle_profile';
export const SEED_POOL_ORACLE = 'pool_oracle';
export const SEED_MEMBERSHIP = 'membership';
export const SEED_CYCLE = 'cycle';
export const SEED_CYCLE_WINDOW = 'cycle_window';
export const SEED_REPLAY = 'replay';
export const SEED_CLAIM = 'claim';
export const SEED_CONFIG_V2 = 'config_v2';
export const SEED_ORACLE_STAKE = 'oracle_stake';
export const SEED_POOL_ORACLE_POLICY = 'pool_oracle_policy';
export const SEED_POOL_TERMS = 'pool_terms';
export const SEED_POOL_ASSET_VAULT = 'pool_asset_vault';
export const SEED_POOL_ORACLE_PERMISSIONS = 'pool_oracle_permissions';
export const SEED_MEMBER_CYCLE = 'member_cycle';
export const SEED_CYCLE_QUOTE_REPLAY = 'cycle_quote_replay';
export const SEED_POOL_TREASURY_RESERVE = 'pool_treasury_reserve';
export const SEED_PROTOCOL_FEE_VAULT = 'protocol_fee_vault';
export const SEED_POOL_ORACLE_FEE_VAULT = 'pool_oracle_fee_vault';
export const SEED_SCHEMA = 'schema';
export const SEED_POOL_RULE = 'pool_rule';
export const SEED_INVITE_ISSUER = 'invite_issuer';
export const SEED_ENROLLMENT_REPLAY = 'enrollment_replay';
export const SEED_ATTESTATION_VOTE = 'attestation_vote';
export const SEED_OUTCOME_AGGREGATE = 'outcome_agg';
export const SEED_CLAIM_DELEGATE = 'claim_delegate';
export const SEED_CLAIM_V2 = 'claim_v2';
export const SEED_COVERAGE_POLICY = 'coverage_policy';
export const SEED_COVERAGE_NFT = 'coverage_nft';
export const SEED_COVERAGE_PRODUCT = 'coverage_product';
export const SEED_COVERAGE_PRODUCT_PAYMENT_OPTION = 'coverage_product_payment_option';
export const SEED_PREMIUM_LEDGER = 'premium_ledger';
export const SEED_PREMIUM_REPLAY = 'premium_replay';
export const SEED_COVERAGE_CLAIM = 'coverage_claim';

export const ZERO_PUBKEY = '11111111111111111111111111111111';

export function asPubkey(value: string | PublicKey): PublicKey {
  if (value instanceof PublicKey) return value;
  return new PublicKey(value);
}

export function deriveConfigPda(programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from(SEED_CONFIG)], programId);
}

export function derivePoolPda(params: {
  programId: string | PublicKey;
  authority: string | PublicKey;
  poolId: string;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const authority = asPubkey(params.authority);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(SEED_POOL),
      authority.toBuffer(),
      Buffer.from(params.poolId, 'utf8'),
    ],
    program,
  );
}

export function deriveOraclePda(params: {
  programId: string | PublicKey;
  oracle: string | PublicKey;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const oracle = asPubkey(params.oracle);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_ORACLE), oracle.toBuffer()],
    program,
  );
}

export function deriveOracleProfilePda(params: {
  programId: string | PublicKey;
  oracle: string | PublicKey;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const oracle = asPubkey(params.oracle);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_ORACLE_PROFILE), oracle.toBuffer()],
    program,
  );
}

export function derivePoolOraclePda(params: {
  programId: string | PublicKey;
  poolAddress: string | PublicKey;
  oracle: string | PublicKey;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const pool = asPubkey(params.poolAddress);
  const oracle = asPubkey(params.oracle);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_POOL_ORACLE), pool.toBuffer(), oracle.toBuffer()],
    program,
  );
}

export function deriveMembershipPda(params: {
  programId: string | PublicKey;
  poolAddress: string | PublicKey;
  member: string | PublicKey;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const pool = asPubkey(params.poolAddress);
  const member = asPubkey(params.member);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_MEMBERSHIP), pool.toBuffer(), member.toBuffer()],
    program,
  );
}

export function deriveCycleOutcomePda(params: {
  programId: string | PublicKey;
  poolAddress: string | PublicKey;
  member: string | PublicKey;
  cycleHash: Uint8Array;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const pool = asPubkey(params.poolAddress);
  const member = asPubkey(params.member);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(SEED_CYCLE),
      pool.toBuffer(),
      member.toBuffer(),
      Buffer.from(params.cycleHash),
    ],
    program,
  );
}

export function deriveCycleWindowPda(params: {
  programId: string | PublicKey;
  poolAddress: string | PublicKey;
  cycleHash: Uint8Array;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const pool = asPubkey(params.poolAddress);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(SEED_CYCLE_WINDOW),
      pool.toBuffer(),
      Buffer.from(params.cycleHash),
    ],
    program,
  );
}

export function deriveReplayPda(params: {
  programId: string | PublicKey;
  poolAddress: string | PublicKey;
  replayHash: Uint8Array;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const pool = asPubkey(params.poolAddress);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_REPLAY), pool.toBuffer(), Buffer.from(params.replayHash)],
    program,
  );
}

export function deriveClaimPda(params: {
  programId: string | PublicKey;
  poolAddress: string | PublicKey;
  member: string | PublicKey;
  cycleHash: Uint8Array;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const pool = asPubkey(params.poolAddress);
  const member = asPubkey(params.member);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(SEED_CLAIM),
      pool.toBuffer(),
      member.toBuffer(),
      Buffer.from(params.cycleHash),
    ],
    program,
  );
}

export function deriveConfigV2Pda(programId: string | PublicKey): [PublicKey, number] {
  const program = asPubkey(programId);
  return PublicKey.findProgramAddressSync([Buffer.from(SEED_CONFIG_V2)], program);
}

export function deriveOracleStakePda(params: {
  programId: string | PublicKey;
  oracle: string | PublicKey;
  staker: string | PublicKey;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const oracle = asPubkey(params.oracle);
  const staker = asPubkey(params.staker);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_ORACLE_STAKE), oracle.toBuffer(), staker.toBuffer()],
    program,
  );
}

export function derivePoolOraclePolicyPda(params: {
  programId: string | PublicKey;
  poolAddress: string | PublicKey;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const pool = asPubkey(params.poolAddress);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_POOL_ORACLE_POLICY), pool.toBuffer()],
    program,
  );
}

export function derivePoolTermsPda(params: {
  programId: string | PublicKey;
  poolAddress: string | PublicKey;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const pool = asPubkey(params.poolAddress);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_POOL_TERMS), pool.toBuffer()],
    program,
  );
}

export function derivePoolAssetVaultPda(params: {
  programId: string | PublicKey;
  poolAddress: string | PublicKey;
  payoutMint: string | PublicKey;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const pool = asPubkey(params.poolAddress);
  const mint = asPubkey(params.payoutMint);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_POOL_ASSET_VAULT), pool.toBuffer(), mint.toBuffer()],
    program,
  );
}

export function deriveCoverageProductPaymentOptionPda(params: {
  programId: string | PublicKey;
  poolAddress: string | PublicKey;
  productIdHash: Uint8Array;
  paymentMint: string | PublicKey;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const pool = asPubkey(params.poolAddress);
  const mint = asPubkey(params.paymentMint);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(SEED_COVERAGE_PRODUCT_PAYMENT_OPTION),
      pool.toBuffer(),
      Buffer.from(params.productIdHash),
      mint.toBuffer(),
    ],
    program,
  );
}

function encodeU64Seed(value: bigint | number): Buffer {
  const out = Buffer.alloc(8);
  out.writeBigUInt64LE(typeof value === 'bigint' ? value : BigInt(value));
  return out;
}

export function derivePoolOraclePermissionSetPda(params: {
  programId: string | PublicKey;
  poolAddress: string | PublicKey;
  oracle: string | PublicKey;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const pool = asPubkey(params.poolAddress);
  const oracle = asPubkey(params.oracle);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_POOL_ORACLE_PERMISSIONS), pool.toBuffer(), oracle.toBuffer()],
    program,
  );
}

export function deriveMemberCyclePda(params: {
  programId: string | PublicKey;
  poolAddress: string | PublicKey;
  member: string | PublicKey;
  periodIndex: bigint | number;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const pool = asPubkey(params.poolAddress);
  const member = asPubkey(params.member);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(SEED_MEMBER_CYCLE),
      pool.toBuffer(),
      member.toBuffer(),
      encodeU64Seed(params.periodIndex),
    ],
    program,
  );
}

export function deriveCycleQuoteReplayPda(params: {
  programId: string | PublicKey;
  poolAddress: string | PublicKey;
  member: string | PublicKey;
  nonceHash: Uint8Array;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const pool = asPubkey(params.poolAddress);
  const member = asPubkey(params.member);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(SEED_CYCLE_QUOTE_REPLAY),
      pool.toBuffer(),
      member.toBuffer(),
      Buffer.from(params.nonceHash),
    ],
    program,
  );
}

export function derivePoolTreasuryReservePda(params: {
  programId: string | PublicKey;
  poolAddress: string | PublicKey;
  paymentMint: string | PublicKey;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const pool = asPubkey(params.poolAddress);
  const paymentMint = asPubkey(params.paymentMint);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(SEED_POOL_TREASURY_RESERVE),
      pool.toBuffer(),
      paymentMint.toBuffer(),
    ],
    program,
  );
}

export function deriveProtocolFeeVaultPda(params: {
  programId: string | PublicKey;
  paymentMint: string | PublicKey;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const paymentMint = asPubkey(params.paymentMint);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_PROTOCOL_FEE_VAULT), paymentMint.toBuffer()],
    program,
  );
}

export function derivePoolOracleFeeVaultPda(params: {
  programId: string | PublicKey;
  poolAddress: string | PublicKey;
  oracle: string | PublicKey;
  paymentMint: string | PublicKey;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const pool = asPubkey(params.poolAddress);
  const oracle = asPubkey(params.oracle);
  const paymentMint = asPubkey(params.paymentMint);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(SEED_POOL_ORACLE_FEE_VAULT),
      pool.toBuffer(),
      oracle.toBuffer(),
      paymentMint.toBuffer(),
    ],
    program,
  );
}

export function deriveSchemaPda(params: {
  programId: string | PublicKey;
  schemaKeyHash: Uint8Array;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_SCHEMA), Buffer.from(params.schemaKeyHash)],
    program,
  );
}

export function derivePoolRulePda(params: {
  programId: string | PublicKey;
  poolAddress: string | PublicKey;
  ruleHash: Uint8Array;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const pool = asPubkey(params.poolAddress);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_POOL_RULE), pool.toBuffer(), Buffer.from(params.ruleHash)],
    program,
  );
}

export function deriveInviteIssuerPda(params: {
  programId: string | PublicKey;
  issuer: string | PublicKey;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const issuer = asPubkey(params.issuer);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_INVITE_ISSUER), issuer.toBuffer()],
    program,
  );
}

export function deriveEnrollmentReplayPda(params: {
  programId: string | PublicKey;
  poolAddress: string | PublicKey;
  member: string | PublicKey;
  nonceHash: Uint8Array;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const pool = asPubkey(params.poolAddress);
  const member = asPubkey(params.member);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(SEED_ENROLLMENT_REPLAY),
      pool.toBuffer(),
      member.toBuffer(),
      Buffer.from(params.nonceHash),
    ],
    program,
  );
}

export function deriveAttestationVotePda(params: {
  programId: string | PublicKey;
  poolAddress: string | PublicKey;
  member: string | PublicKey;
  cycleHash: Uint8Array;
  ruleHash: Uint8Array;
  oracle: string | PublicKey;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const pool = asPubkey(params.poolAddress);
  const member = asPubkey(params.member);
  const oracle = asPubkey(params.oracle);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(SEED_ATTESTATION_VOTE),
      pool.toBuffer(),
      member.toBuffer(),
      Buffer.from(params.cycleHash),
      Buffer.from(params.ruleHash),
      oracle.toBuffer(),
    ],
    program,
  );
}

export function deriveClaimDelegatePda(params: {
  programId: string | PublicKey;
  poolAddress: string | PublicKey;
  member: string | PublicKey;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const pool = asPubkey(params.poolAddress);
  const member = asPubkey(params.member);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_CLAIM_DELEGATE), pool.toBuffer(), member.toBuffer()],
    program,
  );
}

export function deriveClaimV2Pda(params: {
  programId: string | PublicKey;
  poolAddress: string | PublicKey;
  member: string | PublicKey;
  cycleHash: Uint8Array;
  ruleHash: Uint8Array;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const pool = asPubkey(params.poolAddress);
  const member = asPubkey(params.member);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(SEED_CLAIM_V2),
      pool.toBuffer(),
      member.toBuffer(),
      Buffer.from(params.cycleHash),
      Buffer.from(params.ruleHash),
    ],
    program,
  );
}

export function deriveOutcomeAggregatePda(params: {
  programId: string | PublicKey;
  poolAddress: string | PublicKey;
  member: string | PublicKey;
  cycleHash: Uint8Array;
  ruleHash: Uint8Array;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const pool = asPubkey(params.poolAddress);
  const member = asPubkey(params.member);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(SEED_OUTCOME_AGGREGATE),
      pool.toBuffer(),
      member.toBuffer(),
      Buffer.from(params.cycleHash),
      Buffer.from(params.ruleHash),
    ],
    program,
  );
}

export function deriveCoveragePolicyPda(params: {
  programId: string | PublicKey;
  poolAddress: string | PublicKey;
  member: string | PublicKey;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const pool = asPubkey(params.poolAddress);
  const member = asPubkey(params.member);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_COVERAGE_POLICY), pool.toBuffer(), member.toBuffer()],
    program,
  );
}

export function deriveCoverageProductPda(params: {
  programId: string | PublicKey;
  poolAddress: string | PublicKey;
  productIdHash: Uint8Array;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const pool = asPubkey(params.poolAddress);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_COVERAGE_PRODUCT), pool.toBuffer(), Buffer.from(params.productIdHash)],
    program,
  );
}

export function deriveCoverageNftPda(params: {
  programId: string | PublicKey;
  poolAddress: string | PublicKey;
  member: string | PublicKey;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const pool = asPubkey(params.poolAddress);
  const member = asPubkey(params.member);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_COVERAGE_NFT), pool.toBuffer(), member.toBuffer()],
    program,
  );
}

export function derivePremiumLedgerPda(params: {
  programId: string | PublicKey;
  poolAddress: string | PublicKey;
  member: string | PublicKey;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const pool = asPubkey(params.poolAddress);
  const member = asPubkey(params.member);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_PREMIUM_LEDGER), pool.toBuffer(), member.toBuffer()],
    program,
  );
}

export function derivePremiumReplayPda(params: {
  programId: string | PublicKey;
  poolAddress: string | PublicKey;
  member: string | PublicKey;
  replayHash: Uint8Array;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const pool = asPubkey(params.poolAddress);
  const member = asPubkey(params.member);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(SEED_PREMIUM_REPLAY),
      pool.toBuffer(),
      member.toBuffer(),
      Buffer.from(params.replayHash),
    ],
    program,
  );
}

export function deriveCoverageClaimPda(params: {
  programId: string | PublicKey;
  poolAddress: string | PublicKey;
  member: string | PublicKey;
  intentHash: Uint8Array;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const pool = asPubkey(params.poolAddress);
  const member = asPubkey(params.member);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(SEED_COVERAGE_CLAIM),
      pool.toBuffer(),
      member.toBuffer(),
      Buffer.from(params.intentHash),
    ],
    program,
  );
}
