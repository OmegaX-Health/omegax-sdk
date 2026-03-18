import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

import {
  PROTOCOL_PROGRAM_ID,
  ZERO_PUBKEY,
  anchorDiscriminator,
  asPubkey,
  createConnection,
  createProtocolClient,
  deriveAttestationVotePda,
  deriveClaimDelegatePda,
  deriveClaimPda,
  deriveCohortSettlementRootPda,
  deriveConfigPda,
  deriveCoverageClaimPda,
  derivePolicyPositionNftPda,
  derivePolicyPositionPda,
  derivePolicySeriesPda,
  derivePolicySeriesPaymentOptionPda,
  deriveCycleQuoteReplayPda,
  deriveEnrollmentReplayPda,
  deriveInviteIssuerPda,
  deriveMemberCyclePda,
  deriveMembershipPda,
  deriveOraclePda,
  deriveOracleProfilePda,
  deriveOracleStakePda,
  deriveOutcomeAggregatePda,
  derivePoolAssetVaultPda,
  derivePoolAutomationPolicyPda,
  derivePoolCapitalClassPda,
  derivePoolCompliancePolicyPda,
  derivePoolControlAuthorityPda,
  derivePoolLiquidityConfigPda,
  derivePoolOracleFeeVaultPda,
  derivePoolOraclePermissionSetPda,
  derivePoolOraclePolicyPda,
  derivePoolOraclePda,
  derivePoolPda,
  derivePoolRiskConfigPda,
  derivePoolRulePda,
  derivePoolShareMintPda,
  derivePoolTermsPda,
  derivePoolTreasuryReservePda,
  derivePremiumLedgerPda,
  derivePremiumReplayPda,
  deriveProtocolFeeVaultPda,
  deriveRedemptionRequestPda,
  deriveSchemaPda,
  deriveSchemaDependencyPda,
  encodeI64Le,
  encodeU16Le,
  encodeU64Le,
  fromHex,
} from '../src/index.js';

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
const ZERO_PUBKEY_KEY = new PublicKey(ZERO_PUBKEY);

const constants = {
  AI_ROLE_NONE: 0,
  AI_ROLE_UNDERWRITER: 1,
  AI_ROLE_PRICING_AGENT: 2,
  AI_ROLE_CLAIM_PROCESSOR: 3,
  AI_ROLE_SETTLEMENT_PLANNER: 4,
  AI_ROLE_ORACLE: 5,
  AI_ROLE_ALL_MASK: 0b0011_1110,
  AUTOMATION_MODE_DISABLED: 0,
  AUTOMATION_MODE_ADVISORY: 1,
  AUTOMATION_MODE_ATTESTED: 2,
  AUTOMATION_MODE_BOUNDED_AUTONOMOUS: 3,
  CAPITAL_CLASS_MODE_NAV: 0,
  CAPITAL_CLASS_MODE_DISTRIBUTION: 1,
  CAPITAL_CLASS_MODE_HYBRID: 2,
  CAPITAL_TRANSFER_MODE_PERMISSIONLESS: 0,
  CAPITAL_TRANSFER_MODE_RESTRICTED: 1,
  CAPITAL_TRANSFER_MODE_WRAPPER_ONLY: 2,
  COMPLIANCE_ACTION_ENROLL: 1 << 0,
  COMPLIANCE_ACTION_CLAIM: 1 << 1,
  COMPLIANCE_ACTION_REDEEM: 1 << 2,
  COMPLIANCE_ACTION_DEPOSIT: 1 << 3,
  COMPLIANCE_ACTION_PAYOUT: 1 << 4,
  COMPLIANCE_BINDING_MODE_NONE: 0,
  COMPLIANCE_BINDING_MODE_WALLET: 1,
  COMPLIANCE_BINDING_MODE_SUBJECT_COMMITMENT: 2,
  COMPLIANCE_BINDING_MODE_TOKEN_GATE: 3,
  COMPLIANCE_PROVIDER_MODE_NATIVE: 0,
  COMPLIANCE_PROVIDER_MODE_EXTERNAL: 1,
  COMPLIANCE_PROVIDER_MODE_SOLANA_ATTEST: 2,
  COVERAGE_CLAIM_FAMILY_FAST: 0,
  COVERAGE_CLAIM_FAMILY_REIMBURSEMENT: 1,
  COVERAGE_CLAIM_FAMILY_REGULATED: 2,
  COVERAGE_CLAIM_STATUS_SUBMITTED: 1,
  COVERAGE_CLAIM_STATUS_UNDER_REVIEW: 2,
  COVERAGE_CLAIM_STATUS_APPROVED: 3,
  COVERAGE_CLAIM_STATUS_PAID: 4,
  COVERAGE_CLAIM_STATUS_DENIED: 5,
  COVERAGE_CLAIM_STATUS_CLOSED: 6,
  COVERAGE_CLAIM_STATUS_PARTIALLY_PAID: 7,
  DEFAULT_LIQUIDITY_SLIPPAGE_BPS: 50,
  DEFAULT_DEV_GOVERNANCE: 'BGN6pVpuD9GPSsExtBi7pe4RLCJrkFVsQd9mw7ZdH8Ez',
  MEMBERSHIP_MODE_OPEN: 0,
  MEMBERSHIP_MODE_TOKEN_GATE: 1,
  MEMBERSHIP_MODE_INVITE_ONLY: 2,
  MEMBERSHIP_STATUS_ACTIVE: 1,
  ORACLE_TYPE_LAB: 0,
  ORACLE_TYPE_HOSPITAL_CLINIC: 1,
  ORACLE_TYPE_HEALTH_APP: 2,
  ORACLE_TYPE_OTHER: 4,
  ORACLE_TYPE_WEARABLE_DATA_PROVIDER: 3,
  ORACLE_ROLE_QUOTE_ATTESTER: 1,
  ORACLE_ROLE_OUTCOME_ATTESTER: 2,
  ORACLE_ROLE_PREMIUM_ATTESTER: 3,
  ORACLE_ROLE_CLAIM_ADJUDICATOR: 4,
  ORACLE_ROLE_TREASURY_OPERATOR: 5,
  OUTCOME_REVIEW_STATUS_CLEAR: 0,
  OUTCOME_REVIEW_STATUS_PENDING_CHALLENGE: 1,
  OUTCOME_REVIEW_STATUS_CHALLENGED: 2,
  OUTCOME_REVIEW_STATUS_OVERTURNED: 3,
  PLAN_MODE_REWARD: 0,
  PLAN_MODE_PROTECTION: 1,
  PLAN_MODE_REIMBURSEMENT: 2,
  PLAN_MODE_REGULATED: 3,
  POLICY_SERIES_STATUS_DRAFT: 0,
  POLICY_SERIES_STATUS_ACTIVE: 1,
  POLICY_SERIES_STATUS_PAUSED: 2,
  POLICY_SERIES_STATUS_CLOSED: 3,
  POOL_CLAIM_MODE_OPEN: 0,
  POOL_CLAIM_MODE_PAUSED: 1,
  POOL_REDEMPTION_MODE_OPEN: 0,
  POOL_REDEMPTION_MODE_QUEUE_ONLY: 1,
  POOL_REDEMPTION_MODE_PAUSED: 2,
  POOL_STATUS_DRAFT: 0,
  POOL_STATUS_ACTIVE: 1,
  POOL_STATUS_CLOSED: 3,
  POOL_TYPE_REWARD: 0,
  POOL_TYPE_COVERAGE: 1,
  RAIL_MODE_ANY: 0,
  RAIL_MODE_SPL_ONLY: 1,
  RAIL_MODE_PERMISSIONED_SPL: 2,
  REDEMPTION_REQUEST_STATUS_PENDING: 1,
  REDEMPTION_REQUEST_STATUS_SCHEDULED: 2,
  REDEMPTION_REQUEST_STATUS_FULFILLED: 3,
  REDEMPTION_REQUEST_STATUS_CANCELLED: 4,
  REDEMPTION_REQUEST_STATUS_FAILED: 5,
  REFERENCE_NAV_SCALE: 1_000_000_000n,
  SCHEMA_FAMILY_KERNEL: 0,
  SCHEMA_FAMILY_CLINICAL: 1,
  SCHEMA_FAMILY_CLAIMS_CODING: 2,
  SCHEMA_VISIBILITY_PUBLIC: 0,
  SCHEMA_VISIBILITY_PRIVATE: 1,
  SCHEMA_VISIBILITY_RESTRICTED: 2,
  SPONSOR_MODE_DIRECT: 0,
  SPONSOR_MODE_WRAPPER: 1,
  SPONSOR_MODE_CARRIER: 2,
  ZERO_PUBKEY,
};

function getProgramId() {
  const configured = process.env.NEXT_PUBLIC_PROTOCOL_PROGRAM_ID ?? process.env.PROTOCOL_PROGRAM_ID;
  return new PublicKey((configured && configured.trim()) || PROTOCOL_PROGRAM_ID);
}

let cachedClient = null;
let cachedProgramId = null;

function protocolClient() {
  const programId = getProgramId().toBase58();
  if (!cachedClient || cachedProgramId !== programId) {
    const connection = createConnection({
      network: 'devnet',
      rpcUrl: process.env.SOLANA_RPC_URL ?? 'http://127.0.0.1:8899',
      commitment: 'confirmed',
      warnOnComingSoon: false,
    });
    cachedClient = createProtocolClient(connection, programId);
    cachedProgramId = programId;
  }
  return cachedClient;
}

function isPlainObject(value) {
  if (value == null || typeof value !== 'object') return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function normalizeValue(value) {
  if (value instanceof PublicKey) return value.toBase58();
  if (Array.isArray(value)) return value.map((entry) => normalizeValue(entry));
  if (
    value instanceof Transaction
    || value instanceof TransactionInstruction
    || Buffer.isBuffer(value)
    || value instanceof Uint8Array
  ) {
    return value;
  }
  if (!isPlainObject(value)) return value;

  const normalized = {};
  for (const [key, entry] of Object.entries(value)) {
    normalized[key] = normalizeValue(entry);
  }
  return normalized;
}

function withProgramId(params, overrides = {}) {
  return {
    ...normalizeValue(params),
    programId: getProgramId().toBase58(),
    ...overrides,
  };
}

function toPublicKey(value) {
  return value instanceof PublicKey ? value : new PublicKey(value);
}

function deriveAta({ owner, mint, allowOwnerOffCurve = false }) {
  const ownerKey = toPublicKey(owner);
  const mintKey = toPublicKey(mint);
  return PublicKey.findProgramAddressSync(
    [ownerKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mintKey.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )[0];
}

function fixedInstructionData(name, ...chunks) {
  return Buffer.concat([anchorDiscriminator('global', name), ...chunks]);
}

function callClientBuilder(name, params) {
  const client = protocolClient();
  const builder = client[name];
  if (typeof builder !== 'function') {
    throw new Error(`SDK protocol client is missing ${name}`);
  }
  return builder.call(client, withProgramId(params));
}

function buildCreatePoolTx(params) {
  const programId = getProgramId();
  const authority = toPublicKey(params.authority);
  const poolId = String(params.poolId).trim();
  const [poolAddress] = derivePoolPda({
    programId,
    authority,
    poolId,
  });

  const tx = callClientBuilder('buildCreatePoolTx', {
    ...params,
    authority,
    poolId,
    inviteIssuer: params.inviteIssuer ?? ZERO_PUBKEY,
    payoutAssetMint: params.payoutAssetMint ?? ZERO_PUBKEY,
    poolType: params.poolType ?? constants.POOL_TYPE_REWARD,
    cycleMode: params.cycleMode ?? 0,
  });

  return { tx, poolAddress };
}

function buildRegisterOracleTx(params) {
  return callClientBuilder('buildRegisterOracleTx', {
    ...params,
    oraclePubkey: params.oracle,
  });
}

function buildSubscribePolicySeriesTx(params) {
  return callClientBuilder('buildSubscribePolicySeriesTx', {
    ...params,
  });
}

function buildIssuePolicyPositionTx(params) {
  return callClientBuilder('buildIssuePolicyPositionTx', {
    ...params,
  });
}

function buildWithdrawPoolTreasurySplTx(params) {
  return callClientBuilder('buildWithdrawPoolTreasurySplTx', {
    ...params,
    payer: params.oracle,
  });
}

function buildWithdrawPoolTreasurySolTx(params) {
  return callClientBuilder('buildWithdrawPoolTreasurySolTx', {
    ...params,
    payer: params.oracle,
  });
}

function buildSlashOracleTx(params) {
  const programId = getProgramId();
  const governanceAuthority = toPublicKey(params.governanceAuthority);
  const [config] = deriveConfigPda(programId);
  const instruction = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: governanceAuthority, isSigner: true, isWritable: false },
      { pubkey: config, isSigner: false, isWritable: false },
      { pubkey: toPublicKey(params.stakePosition), isSigner: false, isWritable: true },
      { pubkey: toPublicKey(params.stakeVault), isSigner: false, isWritable: true },
      { pubkey: toPublicKey(params.slashTreasuryTokenAccount), isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: fixedInstructionData('slash_oracle', encodeU64Le(params.amount)),
  });

  return new Transaction({
    feePayer: governanceAuthority,
    recentBlockhash: params.recentBlockhash,
  }).add(instruction);
}

function buildSettleCycleCommitmentTx(params) {
  const programId = getProgramId();
  const oracle = toPublicKey(params.oracle);
  const poolAddress = toPublicKey(params.poolAddress);
  const member = toPublicKey(params.member);
  const paymentMint = toPublicKey(params.paymentMint);
  const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
  const [config] = deriveConfigPda(programId);
  const [oracleEntry] = deriveOraclePda({ programId, oracle });
  const [poolOracle] = derivePoolOraclePda({ programId, poolAddress, oracle });
  const [poolOraclePermissions] = derivePoolOraclePermissionSetPda({
    programId,
    poolAddress,
    oracle,
  });
  const [poolTreasuryReserve] = derivePoolTreasuryReservePda({
    programId,
    poolAddress,
    paymentMint,
  });
  const [poolAssetVault] = derivePoolAssetVaultPda({
    programId,
    poolAddress,
    payoutMint: paymentMint,
  });
  const poolVaultTokenAccount = deriveAta({
    owner: poolAssetVault,
    mint: paymentMint,
    allowOwnerOffCurve: true,
  });
  const [memberCycle] = deriveMemberCyclePda({
    programId,
    poolAddress,
    seriesRefHash,
    member,
    periodIndex: params.periodIndex,
  });
  const cohortHash = params.cohortHashHex ? fromHex(params.cohortHashHex, 32) : new Uint8Array(32);
  const [cohortSettlementRoot] = deriveCohortSettlementRootPda({
    programId,
    poolAddress,
    seriesRefHash,
    cohortHash,
  });
  const instruction = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: oracle, isSigner: true, isWritable: true },
      { pubkey: config, isSigner: false, isWritable: false },
      { pubkey: poolAddress, isSigner: false, isWritable: false },
      { pubkey: member, isSigner: false, isWritable: false },
      { pubkey: oracleEntry, isSigner: false, isWritable: false },
      { pubkey: poolOracle, isSigner: false, isWritable: false },
      { pubkey: poolOraclePermissions, isSigner: false, isWritable: false },
      { pubkey: paymentMint, isSigner: false, isWritable: true },
      { pubkey: poolTreasuryReserve, isSigner: false, isWritable: true },
      { pubkey: poolAssetVault, isSigner: false, isWritable: false },
      { pubkey: poolVaultTokenAccount, isSigner: false, isWritable: true },
      { pubkey: toPublicKey(params.recipientTokenAccount), isSigner: false, isWritable: true },
      { pubkey: memberCycle, isSigner: false, isWritable: true },
      { pubkey: cohortSettlementRoot, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: fixedInstructionData(
      'settle_cycle_commitment',
      Buffer.from(seriesRefHash),
      encodeU64Le(params.periodIndex),
      Buffer.from([params.passed ? 1 : 0]),
      Buffer.from([params.shieldConsumed ? 1 : 0]),
      encodeU16Le(params.settledHealthAlphaScore),
    ),
  });

  return new Transaction({
    feePayer: oracle,
    recentBlockhash: params.recentBlockhash,
  }).add(instruction);
}

function buildSettleCycleCommitmentSolTx(params) {
  const programId = getProgramId();
  const oracle = toPublicKey(params.oracle);
  const poolAddress = toPublicKey(params.poolAddress);
  const member = toPublicKey(params.member);
  const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
  const [config] = deriveConfigPda(programId);
  const [oracleEntry] = deriveOraclePda({ programId, oracle });
  const [poolOracle] = derivePoolOraclePda({ programId, poolAddress, oracle });
  const [poolOraclePermissions] = derivePoolOraclePermissionSetPda({
    programId,
    poolAddress,
    oracle,
  });
  const [poolTreasuryReserve] = derivePoolTreasuryReservePda({
    programId,
    poolAddress,
    paymentMint: ZERO_PUBKEY_KEY,
  });
  const [memberCycle] = deriveMemberCyclePda({
    programId,
    poolAddress,
    seriesRefHash,
    member,
    periodIndex: params.periodIndex,
  });
  const cohortHash = params.cohortHashHex ? fromHex(params.cohortHashHex, 32) : new Uint8Array(32);
  const [cohortSettlementRoot] = deriveCohortSettlementRootPda({
    programId,
    poolAddress,
    seriesRefHash,
    cohortHash,
  });
  const instruction = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: oracle, isSigner: true, isWritable: true },
      { pubkey: config, isSigner: false, isWritable: false },
      { pubkey: poolAddress, isSigner: false, isWritable: true },
      { pubkey: member, isSigner: false, isWritable: false },
      { pubkey: oracleEntry, isSigner: false, isWritable: false },
      { pubkey: poolOracle, isSigner: false, isWritable: false },
      { pubkey: poolOraclePermissions, isSigner: false, isWritable: false },
      { pubkey: poolTreasuryReserve, isSigner: false, isWritable: true },
      { pubkey: toPublicKey(params.recipientSystemAccount), isSigner: false, isWritable: true },
      { pubkey: memberCycle, isSigner: false, isWritable: true },
      { pubkey: cohortSettlementRoot, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: fixedInstructionData(
      'settle_cycle_commitment_sol',
      Buffer.from(seriesRefHash),
      encodeU64Le(params.periodIndex),
      Buffer.from([params.passed ? 1 : 0]),
      Buffer.from([params.shieldConsumed ? 1 : 0]),
      encodeU16Le(params.settledHealthAlphaScore),
    ),
  });

  return new Transaction({
    feePayer: oracle,
    recentBlockhash: params.recentBlockhash,
  }).add(instruction);
}

function buildSubmitOutcomeAttestationVoteTx(params) {
  const programId = getProgramId();
  const oracle = toPublicKey(params.oracle);
  const poolAddress = toPublicKey(params.poolAddress);
  const payoutMint = toPublicKey(params.payoutMint);
  const member = toPublicKey(params.member);
  const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
  const cycleHash = fromHex(params.cycleHashHex, 32);
  const ruleHash = fromHex(params.ruleHashHex, 32);
  const [config] = deriveConfigPda(programId);
  const [oracleEntry] = deriveOraclePda({ programId, oracle });
  const [stakePosition] = deriveOracleStakePda({ programId, oracle, staker: oracle });
  const [poolTerms] = derivePoolTermsPda({ programId, poolAddress });
  const [oraclePolicy] = derivePoolOraclePolicyPda({ programId, poolAddress });
  const [poolTreasuryReserve] = derivePoolTreasuryReservePda({
    programId,
    poolAddress,
    paymentMint: payoutMint,
  });
  const [poolOracle] = derivePoolOraclePda({ programId, poolAddress, oracle });
  const [poolOraclePermissions] = derivePoolOraclePermissionSetPda({
    programId,
    poolAddress,
    oracle,
  });
  const [membership] = deriveMembershipPda({ programId, poolAddress, member });
  const [poolRule] = derivePoolRulePda({
    programId,
    poolAddress,
    seriesRefHash,
    ruleHash,
  });
  const [schemaEntry] = deriveSchemaPda({
    programId,
    schemaKeyHash: fromHex(params.schemaKeyHashHex, 32),
  });
  const [vote] = deriveAttestationVotePda({
    programId,
    poolAddress,
    seriesRefHash,
    member,
    cycleHash,
    ruleHash,
    oracle,
  });
  const [aggregate] = deriveOutcomeAggregatePda({
    programId,
    poolAddress,
    seriesRefHash,
    member,
    cycleHash,
    ruleHash,
  });
  const [poolAutomationPolicy] = derivePoolAutomationPolicyPda({
    programId,
    poolAddress,
  });

  const keys = [
    { pubkey: oracle, isSigner: true, isWritable: true },
    { pubkey: oracleEntry, isSigner: false, isWritable: false },
    { pubkey: config, isSigner: false, isWritable: false },
    { pubkey: stakePosition, isSigner: false, isWritable: false },
    { pubkey: poolAddress, isSigner: false, isWritable: false },
    { pubkey: poolTerms, isSigner: false, isWritable: false },
    { pubkey: oraclePolicy, isSigner: false, isWritable: false },
    { pubkey: poolTreasuryReserve, isSigner: false, isWritable: true },
    { pubkey: poolOracle, isSigner: false, isWritable: false },
    { pubkey: poolOraclePermissions, isSigner: false, isWritable: false },
    { pubkey: membership, isSigner: false, isWritable: false },
    { pubkey: poolRule, isSigner: false, isWritable: false },
    { pubkey: schemaEntry, isSigner: false, isWritable: false },
    { pubkey: vote, isSigner: false, isWritable: true },
    { pubkey: aggregate, isSigner: false, isWritable: true },
    {
      pubkey: params.includePoolAutomationPolicy ? poolAutomationPolicy : programId,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ];

  const instruction = new TransactionInstruction({
    programId,
    keys,
    data: fixedInstructionData(
      'submit_outcome_attestation_vote',
      member.toBuffer(),
      Buffer.from(cycleHash),
      Buffer.from(ruleHash),
      Buffer.from(fromHex(params.attestationDigestHex, 32)),
      Buffer.from(fromHex(params.observedValueHashHex, 32)),
      Buffer.from(fromHex(params.evidenceHashHex ?? '00'.repeat(32), 32)),
      Buffer.from(fromHex(params.externalAttestationRefHashHex ?? '00'.repeat(32), 32)),
      Buffer.from([(params.aiRole ?? constants.AI_ROLE_NONE) & 0xff]),
      Buffer.from([(params.automationMode ?? 0) & 0xff]),
      Buffer.from(fromHex(params.modelVersionHashHex ?? '00'.repeat(32), 32)),
      Buffer.from(fromHex(params.policyVersionHashHex ?? '00'.repeat(32), 32)),
      Buffer.from(fromHex(params.executionEnvironmentHashHex ?? '00'.repeat(32), 32)),
      Buffer.from(fromHex(params.attestationProviderRefHashHex ?? '00'.repeat(32), 32)),
      encodeI64Le(BigInt(params.asOfTs)),
      Buffer.from([params.passed ? 1 : 0]),
    ),
  });

  return new Transaction({
    feePayer: oracle,
    recentBlockhash: params.recentBlockhash,
  }).add(instruction);
}

function buildFinalizeCycleOutcomeTx(params) {
  const programId = getProgramId();
  const feePayer = toPublicKey(params.feePayer);
  const poolAddress = toPublicKey(params.poolAddress);
  const payoutMint = toPublicKey(params.payoutMint);
  const member = toPublicKey(params.member);
  const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
  const [poolTerms] = derivePoolTermsPda({ programId, poolAddress });
  const [oraclePolicy] = derivePoolOraclePolicyPda({ programId, poolAddress });
  const [poolTreasuryReserve] = derivePoolTreasuryReservePda({
    programId,
    poolAddress,
    paymentMint: payoutMint,
  });
  const [aggregate] = deriveOutcomeAggregatePda({
    programId,
    poolAddress,
    seriesRefHash,
    member,
    cycleHash: fromHex(params.cycleHashHex, 32),
    ruleHash: fromHex(params.ruleHashHex, 32),
  });
  const instruction = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: feePayer, isSigner: true, isWritable: true },
      { pubkey: poolAddress, isSigner: false, isWritable: false },
      { pubkey: poolTerms, isSigner: false, isWritable: false },
      { pubkey: oraclePolicy, isSigner: false, isWritable: false },
      { pubkey: poolTreasuryReserve, isSigner: false, isWritable: true },
      { pubkey: aggregate, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: anchorDiscriminator('global', 'finalize_cycle_outcome'),
  });

  return new Transaction({
    feePayer,
    recentBlockhash: params.recentBlockhash,
  }).add(instruction);
}

function buildSubmitRewardClaimTx(params) {
  const programId = getProgramId();
  const claimant = toPublicKey(params.claimant);
  const poolAddress = toPublicKey(params.poolAddress);
  const member = toPublicKey(params.member);
  const payoutMint = params.payoutMint ? toPublicKey(params.payoutMint) : ZERO_PUBKEY_KEY;
  const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
  const cycleHash = fromHex(params.cycleHashHex, 32);
  const ruleHash = fromHex(params.ruleHashHex, 32);
  const [config] = deriveConfigPda(programId);
  const [poolTerms] = derivePoolTermsPda({ programId, poolAddress });
  const [oraclePolicy] = derivePoolOraclePolicyPda({ programId, poolAddress });
  const [poolTreasuryReserve] = derivePoolTreasuryReservePda({
    programId,
    poolAddress,
    paymentMint: payoutMint,
  });
  const [membership] = deriveMembershipPda({ programId, poolAddress, member });
  const [aggregate] = deriveOutcomeAggregatePda({
    programId,
    poolAddress,
    seriesRefHash,
    member,
    cycleHash,
    ruleHash,
  });
  const [claimRecord] = deriveClaimPda({
    programId,
    poolAddress,
    seriesRefHash,
    member,
    cycleHash,
    ruleHash,
  });
  const [poolCompliancePolicy] = derivePoolCompliancePolicyPda({
    programId,
    poolAddress,
  });

  const keys = [
    { pubkey: claimant, isSigner: true, isWritable: true },
    { pubkey: config, isSigner: false, isWritable: false },
    { pubkey: poolAddress, isSigner: false, isWritable: true },
    { pubkey: poolTerms, isSigner: false, isWritable: false },
    { pubkey: oraclePolicy, isSigner: false, isWritable: false },
    { pubkey: poolTreasuryReserve, isSigner: false, isWritable: true },
    { pubkey: membership, isSigner: false, isWritable: false },
    { pubkey: aggregate, isSigner: false, isWritable: true },
    { pubkey: params.memberCycle ? toPublicKey(params.memberCycle) : programId, isSigner: false, isWritable: false },
    {
      pubkey: params.cohortSettlementRoot ? toPublicKey(params.cohortSettlementRoot) : poolAddress,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: toPublicKey(params.recipientSystemAccount), isSigner: false, isWritable: true },
    { pubkey: params.claimDelegate ? toPublicKey(params.claimDelegate) : programId, isSigner: false, isWritable: false },
    { pubkey: params.poolAssetVault ? toPublicKey(params.poolAssetVault) : programId, isSigner: false, isWritable: false },
    { pubkey: params.poolVaultTokenAccount ? toPublicKey(params.poolVaultTokenAccount) : programId, isSigner: false, isWritable: true },
    { pubkey: params.recipientTokenAccount ? toPublicKey(params.recipientTokenAccount) : programId, isSigner: false, isWritable: true },
    { pubkey: claimRecord, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    {
      pubkey: params.includePoolCompliancePolicy ? poolCompliancePolicy : programId,
      isSigner: false,
      isWritable: false,
    },
  ];

  const instruction = new TransactionInstruction({
    programId,
    keys,
    data: fixedInstructionData(
      'submit_reward_claim',
      member.toBuffer(),
      Buffer.from(cycleHash),
      Buffer.from(ruleHash),
      Buffer.from(fromHex(params.intentHashHex, 32)),
      encodeU64Le(params.payoutAmount),
      toPublicKey(params.recipient).toBuffer(),
    ),
  });

  return new Transaction({
    feePayer: claimant,
    recentBlockhash: params.recentBlockhash,
  }).add(instruction);
}

const passthroughBuilders = [
  'buildActivateCycleWithQuoteSolTx',
  'buildActivateCycleWithQuoteSplTx',
  'buildApproveCoverageClaimTx',
  'buildAttachCoverageClaimDecisionSupportTx',
  'buildAttestPremiumPaidOffchainTx',
  'buildBackfillSchemaDependencyLedgerTx',
  'buildCancelPoolLiquidityRedemptionTx',
  'buildClaimApprovedCoveragePayoutTx',
  'buildClaimOracleTx',
  'buildCloseCoverageClaimTx',
  'buildCloseOutcomeSchemaTx',
  'buildDenyCoverageClaimTx',
  'buildDepositPoolLiquiditySolTx',
  'buildDepositPoolLiquiditySplTx',
  'buildEnrollMemberInvitePermitTx',
  'buildEnrollMemberOpenTx',
  'buildEnrollMemberTokenGateTx',
  'buildFailPoolLiquidityRedemptionTx',
  'buildFinalizeCohortSettlementRootTx',
  'buildFinalizeUnstakeTx',
  'buildFulfillPoolLiquidityRedemptionSolTx',
  'buildFulfillPoolLiquidityRedemptionSplTx',
  'buildFundPoolSolTx',
  'buildFundPoolSplTx',
  'buildInitializePoolLiquiditySolTx',
  'buildInitializePoolLiquiditySplTx',
  'buildInitializeProtocolTx',
  'buildMintPolicyNftTx',
  'buildOpenCycleOutcomeDisputeTx',
  'buildPayCoverageClaimTx',
  'buildPayPremiumSolTx',
  'buildPayPremiumSplTx',
  'buildRedeemPoolLiquiditySolTx',
  'buildRedeemPoolLiquiditySplTx',
  'buildCreatePolicySeriesTx',
  'buildRegisterInviteIssuerTx',
  'buildRegisterOracleTx',
  'buildRegisterOutcomeSchemaTx',
  'buildRegisterPoolCapitalClassTx',
  'buildRequestPoolLiquidityRedemptionTx',
  'buildRequestUnstakeTx',
  'buildResolveCycleOutcomeDisputeTx',
  'buildReviewCoverageClaimTx',
  'buildRotateGovernanceAuthorityTx',
  'buildSchedulePoolLiquidityRedemptionTx',
  'buildSetClaimDelegateTx',
  'buildSetPoolAutomationPolicyTx',
  'buildSetPoolCompliancePolicyTx',
  'buildSetPoolControlAuthoritiesTx',
  'buildSetPoolCoverageReserveFloorTx',
  'buildSetPoolLiquidityEnabledTx',
  'buildSetPoolOraclePermissionsTx',
  'buildSetPoolOraclePolicyTx',
  'buildSetPoolOracleTx',
  'buildSetPolicySeriesOutcomeRuleTx',
  'buildSetPoolRiskControlsTx',
  'buildSetPoolStatusTx',
  'buildSetPoolTermsHashTx',
  'buildSetProtocolParamsTx',
  'buildSettleCoverageClaimTx',
  'buildStakeOracleTx',
  'buildSubmitCoverageClaimTx',
  'buildUpdatePolicySeriesTx',
  'buildUpdateOracleMetadataTx',
  'buildUpdateOracleProfileTx',
  'buildUpsertPolicySeriesPaymentOptionTx',
  'buildVerifyOutcomeSchemaTx',
  'buildWithdrawPoolOracleFeeSolTx',
  'buildWithdrawPoolOracleFeeSplTx',
  'buildWithdrawProtocolFeeSolTx',
  'buildWithdrawProtocolFeeSplTx',
];

const passthroughBuilds = Object.fromEntries(
  passthroughBuilders.map((name) => [name, (params) => callClientBuilder(name, params)]),
);

const adapter = {
  ...constants,
  getProgramId,
  deriveConfigPda: (programId) => deriveConfigPda(programId)[0],
  derivePoolPda: (params) => derivePoolPda(params)[0],
  deriveOraclePda: (params) => deriveOraclePda(params)[0],
  deriveOracleProfilePda: (params) => deriveOracleProfilePda(params)[0],
  derivePoolOraclePda: (params) => derivePoolOraclePda(params)[0],
  derivePoolOraclePolicyPda: (params) => derivePoolOraclePolicyPda(params)[0],
  derivePoolOraclePermissionsPda: (params) => derivePoolOraclePermissionSetPda(params)[0],
  derivePoolTermsPda: (params) => derivePoolTermsPda(params)[0],
  deriveMembershipPda: (params) => deriveMembershipPda(params)[0],
  deriveMemberCyclePda: (params) => deriveMemberCyclePda(params)[0],
  deriveSchemaPda: (params) => deriveSchemaPda(params)[0],
  derivePoolRulePda: (params) => derivePoolRulePda(params)[0],
  deriveOutcomeAggregatePda: (params) => deriveOutcomeAggregatePda(params)[0],
  deriveOracleStakePda: (params) => deriveOracleStakePda(params)[0],
  deriveInviteIssuerPda: (params) => deriveInviteIssuerPda(params)[0],
  deriveEnrollmentReplayPda: (params) => deriveEnrollmentReplayPda(params)[0],
  deriveCycleQuoteReplayPda: (params) => deriveCycleQuoteReplayPda(params)[0],
  deriveAttestationVotePda: (params) => deriveAttestationVotePda(params)[0],
  deriveClaimDelegatePda: (params) => deriveClaimDelegatePda(params)[0],
  deriveClaimPda: (params) => deriveClaimPda(params)[0],
  derivePoolAssetVaultPda: (params) => derivePoolAssetVaultPda(params)[0],
  derivePoolRiskConfigPda: (params) => derivePoolRiskConfigPda(params)[0],
  derivePoolLiquidityConfigPda: (params) => derivePoolLiquidityConfigPda(params)[0],
  derivePoolCapitalClassPda: (params) => derivePoolCapitalClassPda(params)[0],
  derivePoolCompliancePolicyPda: (params) => derivePoolCompliancePolicyPda(params)[0],
  derivePoolControlAuthorityPda: (params) => derivePoolControlAuthorityPda(params)[0],
  derivePoolAutomationPolicyPda: (params) => derivePoolAutomationPolicyPda(params)[0],
  derivePoolTreasuryReservePda: (params) => derivePoolTreasuryReservePda(params)[0],
  derivePoolShareMintPda: (params) => derivePoolShareMintPda(params)[0],
  deriveRedemptionRequestPda: (params) => deriveRedemptionRequestPda(params)[0],
  derivePolicyPositionPda: (params) => derivePolicyPositionPda(params)[0],
  derivePolicyPositionNftPda: (params) => derivePolicyPositionNftPda(params)[0],
  derivePolicySeriesPda: (params) => derivePolicySeriesPda(params)[0],
  derivePolicySeriesPaymentOptionPda: (params) => derivePolicySeriesPaymentOptionPda(params)[0],
  derivePremiumLedgerPda: (params) => derivePremiumLedgerPda(params)[0],
  derivePremiumReplayPda: (params) => derivePremiumReplayPda(params)[0],
  deriveCoverageClaimPda: (params) => deriveCoverageClaimPda(params)[0],
  deriveCohortSettlementRootPda: (params) => deriveCohortSettlementRootPda(params)[0],
  deriveProtocolFeeVaultPda: (params) => deriveProtocolFeeVaultPda(params)[0],
  derivePoolOracleFeeVaultPda: (params) => derivePoolOracleFeeVaultPda(params)[0],
  deriveSchemaDependencyPda: (params) => deriveSchemaDependencyPda(params)[0],
  ...passthroughBuilds,
  buildCreatePoolTx,
  buildFinalizeCycleOutcomeTx,
  buildIssuePolicyPositionTx,
  buildRegisterOracleTx,
  buildSettleCycleCommitmentSolTx,
  buildSettleCycleCommitmentTx,
  buildSlashOracleTx,
  buildSubmitOutcomeAttestationVoteTx,
  buildSubmitRewardClaimTx,
  buildSubscribePolicySeriesTx,
  buildWithdrawPoolTreasurySolTx,
  buildWithdrawPoolTreasurySplTx,
};

export default adapter;
