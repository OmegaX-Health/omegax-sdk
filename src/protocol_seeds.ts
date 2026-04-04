import { PublicKey } from '@solana/web3.js';

import { PROTOCOL_PROGRAM_ID } from './generated/protocol_contract.js';
import type { PublicKeyish } from './generated/protocol_types.js';

const TEXT_ENCODER = new TextEncoder();
const PROGRAM_ID = new PublicKey(PROTOCOL_PROGRAM_ID);

export const ZERO_PUBKEY = '11111111111111111111111111111111';
export const ZERO_PUBKEY_KEY = new PublicKey(ZERO_PUBKEY);
export const MAX_ID_SEED_BYTES = 32;

export const SEED_PROTOCOL_GOVERNANCE = 'protocol_governance';
export const SEED_RESERVE_DOMAIN = 'reserve_domain';
export const SEED_DOMAIN_ASSET_VAULT = 'domain_asset_vault';
export const SEED_DOMAIN_ASSET_LEDGER = 'domain_asset_ledger';
export const SEED_HEALTH_PLAN = 'health_plan';
export const SEED_PLAN_RESERVE_LEDGER = 'plan_reserve_ledger';
export const SEED_POLICY_SERIES = 'policy_series';
export const SEED_SERIES_RESERVE_LEDGER = 'series_reserve_ledger';
export const SEED_MEMBER_POSITION = 'member_position';
export const SEED_FUNDING_LINE = 'funding_line';
export const SEED_FUNDING_LINE_LEDGER = 'funding_line_ledger';
export const SEED_CLAIM_CASE = 'claim_case';
export const SEED_OBLIGATION = 'obligation';
export const SEED_LIQUIDITY_POOL = 'liquidity_pool';
export const SEED_CAPITAL_CLASS = 'capital_class';
export const SEED_POOL_CLASS_LEDGER = 'pool_class_ledger';
export const SEED_LP_POSITION = 'lp_position';
export const SEED_ALLOCATION_POSITION = 'allocation_position';
export const SEED_ALLOCATION_LEDGER = 'allocation_ledger';

export function getProgramId(): PublicKey {
  return PROGRAM_ID;
}

export function utf8ByteLength(value: string): number {
  return TEXT_ENCODER.encode(value).length;
}

export function isSeedIdSafe(value: string): boolean {
  const length = utf8ByteLength(value);
  return length > 0 && length <= MAX_ID_SEED_BYTES;
}

export function assertSeedId(value: string, label = 'seed id'): void {
  if (!isSeedIdSafe(value)) {
    throw new Error(`${label} must be 1..${MAX_ID_SEED_BYTES} UTF-8 bytes.`);
  }
}

export function toPublicKey(value: PublicKeyish): PublicKey {
  return value instanceof PublicKey ? value : new PublicKey(value);
}

export function normalizeAddress(value: PublicKeyish): string {
  return toPublicKey(value).toBase58();
}

function derivePda(
  seeds: Uint8Array[],
  programId: PublicKeyish = PROGRAM_ID,
): PublicKey {
  return PublicKey.findProgramAddressSync(seeds, toPublicKey(programId))[0];
}

function stringSeed(value: string, label: string): Uint8Array {
  assertSeedId(value, label);
  return TEXT_ENCODER.encode(value);
}

export function deriveProtocolGovernancePda(
  programId: PublicKeyish = PROGRAM_ID,
): PublicKey {
  return derivePda([TEXT_ENCODER.encode(SEED_PROTOCOL_GOVERNANCE)], programId);
}

export function deriveReserveDomainPda(params: {
  domainId: string;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_RESERVE_DOMAIN),
      stringSeed(params.domainId, 'domain id'),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveDomainAssetVaultPda(params: {
  reserveDomain: PublicKeyish;
  assetMint: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_DOMAIN_ASSET_VAULT),
      toPublicKey(params.reserveDomain).toBytes(),
      toPublicKey(params.assetMint).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveDomainAssetLedgerPda(params: {
  reserveDomain: PublicKeyish;
  assetMint: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_DOMAIN_ASSET_LEDGER),
      toPublicKey(params.reserveDomain).toBytes(),
      toPublicKey(params.assetMint).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveHealthPlanPda(params: {
  reserveDomain: PublicKeyish;
  planId: string;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_HEALTH_PLAN),
      toPublicKey(params.reserveDomain).toBytes(),
      stringSeed(params.planId, 'plan id'),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function derivePlanReserveLedgerPda(params: {
  healthPlan: PublicKeyish;
  assetMint: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_PLAN_RESERVE_LEDGER),
      toPublicKey(params.healthPlan).toBytes(),
      toPublicKey(params.assetMint).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function derivePolicySeriesPda(params: {
  healthPlan: PublicKeyish;
  seriesId: string;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_POLICY_SERIES),
      toPublicKey(params.healthPlan).toBytes(),
      stringSeed(params.seriesId, 'series id'),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveSeriesReserveLedgerPda(params: {
  policySeries: PublicKeyish;
  assetMint: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_SERIES_RESERVE_LEDGER),
      toPublicKey(params.policySeries).toBytes(),
      toPublicKey(params.assetMint).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveMemberPositionPda(params: {
  healthPlan: PublicKeyish;
  wallet: PublicKeyish;
  seriesScope?: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_MEMBER_POSITION),
      toPublicKey(params.healthPlan).toBytes(),
      toPublicKey(params.wallet).toBytes(),
      toPublicKey(params.seriesScope ?? ZERO_PUBKEY_KEY).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveFundingLinePda(params: {
  healthPlan: PublicKeyish;
  lineId: string;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_FUNDING_LINE),
      toPublicKey(params.healthPlan).toBytes(),
      stringSeed(params.lineId, 'funding line id'),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveFundingLineLedgerPda(params: {
  fundingLine: PublicKeyish;
  assetMint: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_FUNDING_LINE_LEDGER),
      toPublicKey(params.fundingLine).toBytes(),
      toPublicKey(params.assetMint).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveClaimCasePda(params: {
  healthPlan: PublicKeyish;
  claimId: string;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_CLAIM_CASE),
      toPublicKey(params.healthPlan).toBytes(),
      stringSeed(params.claimId, 'claim id'),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveObligationPda(params: {
  fundingLine: PublicKeyish;
  obligationId: string;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_OBLIGATION),
      toPublicKey(params.fundingLine).toBytes(),
      stringSeed(params.obligationId, 'obligation id'),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveLiquidityPoolPda(params: {
  reserveDomain: PublicKeyish;
  poolId: string;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_LIQUIDITY_POOL),
      toPublicKey(params.reserveDomain).toBytes(),
      stringSeed(params.poolId, 'pool id'),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveCapitalClassPda(params: {
  liquidityPool: PublicKeyish;
  classId: string;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_CAPITAL_CLASS),
      toPublicKey(params.liquidityPool).toBytes(),
      stringSeed(params.classId, 'capital class id'),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function derivePoolClassLedgerPda(params: {
  capitalClass: PublicKeyish;
  assetMint: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_POOL_CLASS_LEDGER),
      toPublicKey(params.capitalClass).toBytes(),
      toPublicKey(params.assetMint).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveLpPositionPda(params: {
  capitalClass: PublicKeyish;
  owner: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_LP_POSITION),
      toPublicKey(params.capitalClass).toBytes(),
      toPublicKey(params.owner).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveAllocationPositionPda(params: {
  capitalClass: PublicKeyish;
  fundingLine: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_ALLOCATION_POSITION),
      toPublicKey(params.capitalClass).toBytes(),
      toPublicKey(params.fundingLine).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveAllocationLedgerPda(params: {
  allocationPosition: PublicKeyish;
  assetMint: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_ALLOCATION_LEDGER),
      toPublicKey(params.allocationPosition).toBytes(),
      toPublicKey(params.assetMint).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}
