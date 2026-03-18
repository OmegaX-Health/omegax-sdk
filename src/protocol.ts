import {
  AddressLookupTableAccount,
  Connection,
  ComputeBudgetProgram,
  Ed25519Program,
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SystemProgram,
  Transaction,
  TransactionMessage,
  TransactionInstruction,
  VersionedTransaction,
} from '@solana/web3.js';
import { blake3 } from '@noble/hashes/blake3.js';

import type {
  BuildAttestPremiumPaidOffchainTxParams,
  BuildActivateCycleWithQuoteSolTxParams,
  BuildActivateCycleWithQuoteSplTxParams,
  BuildApproveCoverageClaimTxParams,
  BuildAttachCoverageClaimDecisionSupportTxParams,
  BuildCancelPoolLiquidityRedemptionTxParams,
  BuildClaimApprovedCoveragePayoutTxParams,
  BuildCloseCoverageClaimTxParams,
  BuildCloseOutcomeSchemaTxParams,
  BuildClaimOracleTxParams,
  BuildCreatePoolTxParams,
  BuildDenyCoverageClaimTxParams,
  BuildDepositPoolLiquiditySolTxParams,
  BuildDepositPoolLiquiditySplTxParams,
  BuildEnrollMemberInvitePermitTxParams,
  BuildEnrollMemberOpenTxParams,
  BuildEnrollMemberTokenGateTxParams,
  BuildFailPoolLiquidityRedemptionTxParams,
  BuildFinalizeCohortSettlementRootTxParams,
  BuildFulfillPoolLiquidityRedemptionSolTxParams,
  BuildFulfillPoolLiquidityRedemptionSplTxParams,
  BuildFinalizeUnstakeTxParams,
  BuildFundPoolSolTxParams,
  BuildFundPoolSplTxParams,
  BuildInitializePoolLiquiditySolTxParams,
  BuildInitializePoolLiquiditySplTxParams,
  BuildInitializeProtocolTxParams,
  BuildIssuePolicyPositionTxParams,
  BuildMintPolicyNftTxParams,
  BuildOpenCycleOutcomeDisputeTxParams,
  BuildPayCoverageClaimTxParams,
  BuildPayPremiumSolTxParams,
  BuildPayPremiumSplTxParams,
  BuildCreatePolicySeriesTxParams,
  BuildRegisterPoolCapitalClassTxParams,
  BuildUpsertPolicySeriesPaymentOptionTxParams,
  BuildRedeemPoolLiquiditySolTxParams,
  BuildRedeemPoolLiquiditySplTxParams,
  BuildRegisterInviteIssuerTxParams,
  BuildRegisterOutcomeSchemaTxParams,
  BuildRegisterOracleTxParams,
  BuildBackfillSchemaDependencyLedgerTxParams,
  BuildRequestPoolLiquidityRedemptionTxParams,
  BuildRequestUnstakeTxParams,
  BuildResolveCycleOutcomeDisputeTxParams,
  BuildReviewCoverageClaimTxParams,
  BuildRotateGovernanceAuthorityTxParams,
  BuildSchedulePoolLiquidityRedemptionTxParams,
  BuildSetClaimDelegateTxParams,
  BuildSetPoolAutomationPolicyTxParams,
  BuildSetPoolCompliancePolicyTxParams,
  BuildSetPoolOraclePolicyTxParams,
  BuildSetPoolOraclePermissionsTxParams,
  BuildSetPoolOracleTxParams,
  BuildSetPoolControlAuthoritiesTxParams,
  BuildSetPoolLiquidityEnabledTxParams,
  BuildSetPoolTermsHashTxParams,
  BuildSetPoolRiskControlsTxParams,
  BuildSetPoolStatusTxParams,
  BuildSetProtocolParamsTxParams,
  BuildSetPoolCoverageReserveFloorTxParams,
  BuildSettleCycleCommitmentSolTxParams,
  BuildSettleCycleCommitmentTxParams,
  BuildSettleCoverageClaimTxParams,
  BuildSlashOracleTxParams,
  BuildStakeOracleTxParams,
  BuildSubmitCoverageClaimTxParams,
  BuildSubscribePolicySeriesTxParams,
  BuildSubmitRewardClaimTxParams,
  BuildUpdatePolicySeriesTxParams,
  BuildUpdateOracleProfileTxParams,
  BuildVerifyOutcomeSchemaTxParams,
  BuildUpdateOracleMetadataTxParams,
  BuildSetPoolOutcomeRuleTxParams,
  BuildSubmitOutcomeAttestationVoteTxParams,
  BuildFinalizeCycleOutcomeTxParams,
  BuildWithdrawPoolTreasurySolTxParams,
  BuildWithdrawPoolTreasurySplTxParams,
  BuildWithdrawPoolOracleFeeSolTxParams,
  BuildWithdrawPoolOracleFeeSplTxParams,
  BuildWithdrawProtocolFeeSolTxParams,
  BuildWithdrawProtocolFeeSplTxParams,
  ProtocolClaimRecordAccount,
  ProtocolClaimDelegateAuthorizationAccount,
  ProtocolClient,
  ProtocolCoverageClaimRecordAccount,
  ProtocolPolicyPositionNftAccount,
  ProtocolPolicySeriesAccount,
  ProtocolPolicySeriesPaymentOptionAccount,
  ProtocolCohortSettlementRootAccount,
  ProtocolCycleQuoteReplayAccount,
  ProtocolAttestationVoteAccount,
  ProtocolConfigAccount,
  ProtocolPolicyPositionAccount,
  ProtocolCycleOutcomeAccount,
  ProtocolCycleOutcomeAggregateAccount,
  ProtocolInviteIssuerRegistryEntryAccount,
  ProtocolMembershipRecordAccount,
  ProtocolEnrollmentPermitReplayAccount,
  ProtocolMembershipStatus,
  ProtocolOracleProfileAccount,
  ProtocolOracleStakePositionAccount,
  ProtocolOracleRegistryEntryAccount,
  ProtocolPoolAccount,
  ProtocolPoolAssetVaultAccount,
  ProtocolPoolAutomationPolicyAccount,
  ProtocolPoolCapitalClassAccount,
  ProtocolPoolCompliancePolicyAccount,
  ProtocolPoolControlAuthorityAccount,
  ProtocolPoolLiquidityConfigAccount,
  ProtocolPoolOracleFeeVaultAccount,
  ProtocolPoolOraclePermissionSetAccount,
  ProtocolPoolOraclePolicyAccount,
  ProtocolPoolRedemptionRequestAccount,
  ProtocolPoolRiskConfigAccount,
  ProtocolPoolTreasuryReserveAccount,
  ProtocolFeeVaultAccount,
  ProtocolPoolTermsAccount,
  ProtocolPoolOracleApprovalAccount,
  ProtocolPoolType,
  ProtocolPoolOutcomeRuleAccount,
  ProtocolPremiumLedgerAccount,
  ProtocolPremiumAttestationReplayAccount,
  ProtocolOutcomeSchemaRegistryEntryAccount,
  ProtocolSchemaDependencyLedgerAccount,
  ProtocolPoolStatus,
  ProtocolCycleQuoteFields,
  ProtocolMemberCycleAccount,
  ProtocolMemberCycleStatus,
} from './types.js';
import {
  anchorDiscriminator,
  encodeI64Le,
  encodeString,
  encodeU16Le,
  encodeU64Le,
  fromHex,
  hashStringTo32,
  readI64Le,
  readString,
  readU16Le,
  readU64Le,
  toHex,
} from './utils.js';
import {
  asPubkey,
  deriveClaimPda,
  deriveCohortSettlementRootPda,
  deriveClaimDelegatePda,
  deriveConfigPda,
  deriveCoverageClaimPda,
  derivePolicySeriesPda,
  derivePolicySeriesPaymentOptionPda,
  derivePolicyPositionNftPda,
  derivePolicyPositionPda,
  deriveCycleOutcomePda,
  deriveEnrollmentReplayPda,
  deriveAttestationVotePda,
  deriveCycleQuoteReplayPda,
  deriveInviteIssuerPda,
  deriveMemberCyclePda,
  deriveMembershipPda,
  deriveOracleStakePda,
  deriveOracleProfilePda,
  deriveOutcomeAggregatePda,
  deriveOraclePda,
  derivePoolAssetVaultPda,
  derivePoolAutomationPolicyPda,
  derivePoolCapitalClassPda,
  derivePoolCompliancePolicyPda,
  derivePoolControlAuthorityPda,
  derivePoolLiquidityConfigPda,
  derivePoolOraclePermissionSetPda,
  derivePoolOracleFeeVaultPda,
  derivePoolRiskConfigPda,
  derivePoolShareMintPda,
  derivePoolTermsPda,
  derivePoolOraclePolicyPda,
  derivePoolOraclePda,
  derivePoolPda,
  derivePoolRulePda,
  deriveProtocolFeeVaultPda,
  derivePremiumLedgerPda,
  derivePremiumReplayPda,
  derivePoolTreasuryReservePda,
  deriveRedemptionRequestPda,
  deriveSchemaPda,
  deriveSchemaDependencyPda,
  ZERO_PUBKEY,
} from './protocol_seeds.js';

const MAX_POOL_ID_SEED_BYTES = 32;
const MAX_ORACLE_SUPPORTED_SCHEMAS = 16;
export const PROTOCOL_PROGRAM_ID = 'Bn6eixac1QEEVErGBvBjxAd6pgB9e2q4XHvAkinQ5y1B';

const IX_INITIALIZE_PROTOCOL = anchorDiscriminator('global', 'initialize_protocol');
const IX_CREATE_POOL = anchorDiscriminator('global', 'create_pool');
const IX_SET_POOL_STATUS = anchorDiscriminator('global', 'set_pool_status');
const IX_REGISTER_ORACLE = anchorDiscriminator('global', 'register_oracle');
const IX_CLAIM_ORACLE = anchorDiscriminator('global', 'claim_oracle');
const IX_UPDATE_ORACLE_PROFILE = anchorDiscriminator('global', 'update_oracle_profile');
const IX_SET_POOL_ORACLE = anchorDiscriminator('global', 'set_pool_oracle');
const IX_SUBMIT_OUTCOME_ATTESTATION_VOTE = anchorDiscriminator('global', 'submit_outcome_attestation_vote');
const IX_FINALIZE_CYCLE_OUTCOME = anchorDiscriminator('global', 'finalize_cycle_outcome');
const IX_FINALIZE_COHORT_SETTLEMENT_ROOT =
  anchorDiscriminator('global', 'finalize_cohort_settlement_root');
const IX_SET_PROTOCOL_PARAMS = anchorDiscriminator('global', 'set_protocol_params');
const IX_ROTATE_GOVERNANCE_AUTHORITY = anchorDiscriminator('global', 'rotate_governance_authority');
const IX_UPDATE_ORACLE_METADATA = anchorDiscriminator('global', 'update_oracle_metadata');
const IX_STAKE_ORACLE = anchorDiscriminator('global', 'stake_oracle');
const IX_REQUEST_UNSTAKE = anchorDiscriminator('global', 'request_unstake');
const IX_FINALIZE_UNSTAKE = anchorDiscriminator('global', 'finalize_unstake');
const IX_SLASH_ORACLE = anchorDiscriminator('global', 'slash_oracle');
const IX_SET_POOL_ORACLE_POLICY = anchorDiscriminator('global', 'set_pool_oracle_policy');
const IX_SET_POOL_RISK_CONTROLS = anchorDiscriminator('global', 'set_pool_risk_controls');
const IX_SET_POOL_COMPLIANCE_POLICY = anchorDiscriminator('global', 'set_pool_compliance_policy');
const IX_SET_POOL_CONTROL_AUTHORITIES = anchorDiscriminator('global', 'set_pool_control_authorities');
const IX_SET_POOL_AUTOMATION_POLICY = anchorDiscriminator('global', 'set_pool_automation_policy');
const IX_SET_POOL_ORACLE_PERMISSIONS = anchorDiscriminator('global', 'set_pool_oracle_permissions');
const IX_SET_POOL_COVERAGE_RESERVE_FLOOR = anchorDiscriminator('global', 'set_pool_coverage_reserve_floor');
const IX_SET_POOL_TERMS_HASH = anchorDiscriminator('global', 'set_pool_terms_hash');
const IX_REGISTER_OUTCOME_SCHEMA = anchorDiscriminator('global', 'register_outcome_schema');
const IX_VERIFY_OUTCOME_SCHEMA = anchorDiscriminator('global', 'verify_outcome_schema');
const IX_BACKFILL_SCHEMA_DEPENDENCY_LEDGER =
  anchorDiscriminator('global', 'backfill_schema_dependency_ledger');
const IX_CLOSE_OUTCOME_SCHEMA = anchorDiscriminator('global', 'close_outcome_schema');
const IX_SET_POOL_OUTCOME_RULE = anchorDiscriminator('global', 'set_policy_series_outcome_rule');
const IX_REGISTER_INVITE_ISSUER = anchorDiscriminator('global', 'register_invite_issuer');
const IX_ENROLL_MEMBER_OPEN = anchorDiscriminator('global', 'enroll_member_open');
const IX_ENROLL_MEMBER_TOKEN_GATE = anchorDiscriminator('global', 'enroll_member_token_gate');
const IX_ENROLL_MEMBER_INVITE_PERMIT = anchorDiscriminator('global', 'enroll_member_invite_permit');
const IX_SET_CLAIM_DELEGATE = anchorDiscriminator('global', 'set_claim_delegate');
const IX_FUND_POOL_SOL = anchorDiscriminator('global', 'fund_pool_sol');
const IX_FUND_POOL_SPL = anchorDiscriminator('global', 'fund_pool_spl');
const IX_INITIALIZE_POOL_LIQUIDITY_SOL = anchorDiscriminator('global', 'initialize_pool_liquidity_sol');
const IX_INITIALIZE_POOL_LIQUIDITY_SPL = anchorDiscriminator('global', 'initialize_pool_liquidity_spl');
const IX_SET_POOL_LIQUIDITY_ENABLED = anchorDiscriminator('global', 'set_pool_liquidity_enabled');
const IX_REGISTER_POOL_CAPITAL_CLASS = anchorDiscriminator('global', 'register_pool_capital_class');
const IX_DEPOSIT_POOL_LIQUIDITY_SOL = anchorDiscriminator('global', 'deposit_pool_liquidity_sol');
const IX_DEPOSIT_POOL_LIQUIDITY_SPL = anchorDiscriminator('global', 'deposit_pool_liquidity_spl');
const IX_REDEEM_POOL_LIQUIDITY_SOL = anchorDiscriminator('global', 'redeem_pool_liquidity_sol');
const IX_REDEEM_POOL_LIQUIDITY_SPL = anchorDiscriminator('global', 'redeem_pool_liquidity_spl');
const IX_REQUEST_POOL_LIQUIDITY_REDEMPTION =
  anchorDiscriminator('global', 'request_pool_liquidity_redemption');
const IX_SCHEDULE_POOL_LIQUIDITY_REDEMPTION =
  anchorDiscriminator('global', 'schedule_pool_liquidity_redemption');
const IX_CANCEL_POOL_LIQUIDITY_REDEMPTION =
  anchorDiscriminator('global', 'cancel_pool_liquidity_redemption');
const IX_FAIL_POOL_LIQUIDITY_REDEMPTION =
  anchorDiscriminator('global', 'fail_pool_liquidity_redemption');
const IX_FULFILL_POOL_LIQUIDITY_REDEMPTION_SOL =
  anchorDiscriminator('global', 'fulfill_pool_liquidity_redemption_sol');
const IX_FULFILL_POOL_LIQUIDITY_REDEMPTION_SPL =
  anchorDiscriminator('global', 'fulfill_pool_liquidity_redemption_spl');
const IX_SUBMIT_REWARD_CLAIM = anchorDiscriminator('global', 'submit_reward_claim');
const IX_OPEN_CYCLE_OUTCOME_DISPUTE = anchorDiscriminator('global', 'open_cycle_outcome_dispute');
const IX_RESOLVE_CYCLE_OUTCOME_DISPUTE =
  anchorDiscriminator('global', 'resolve_cycle_outcome_dispute');
const IX_CREATE_POLICY_SERIES = anchorDiscriminator('global', 'create_policy_series');
const IX_UPSERT_POLICY_SERIES_PAYMENT_OPTION =
  anchorDiscriminator('global', 'upsert_policy_series_payment_option');
const IX_UPDATE_POLICY_SERIES = anchorDiscriminator('global', 'update_policy_series');
const IX_SUBSCRIBE_POLICY_SERIES = anchorDiscriminator('global', 'subscribe_policy_series');
const IX_ISSUE_POLICY_POSITION = anchorDiscriminator('global', 'issue_policy_position');
const IX_MINT_POLICY_NFT = anchorDiscriminator('global', 'mint_policy_nft');
const IX_PAY_PREMIUM_SOL = anchorDiscriminator('global', 'pay_premium_sol');
const IX_PAY_PREMIUM_SPL = anchorDiscriminator('global', 'pay_premium_spl');
const IX_ATTEST_PREMIUM_PAID_OFFCHAIN = anchorDiscriminator('global', 'attest_premium_paid_offchain');
const IX_SUBMIT_COVERAGE_CLAIM = anchorDiscriminator('global', 'submit_coverage_claim');
const IX_REVIEW_COVERAGE_CLAIM = anchorDiscriminator('global', 'review_coverage_claim');
const IX_ATTACH_COVERAGE_CLAIM_DECISION_SUPPORT =
  anchorDiscriminator('global', 'attach_coverage_claim_decision_support');
const IX_APPROVE_COVERAGE_CLAIM = anchorDiscriminator('global', 'approve_coverage_claim');
const IX_DENY_COVERAGE_CLAIM = anchorDiscriminator('global', 'deny_coverage_claim');
const IX_PAY_COVERAGE_CLAIM = anchorDiscriminator('global', 'pay_coverage_claim');
const IX_CLAIM_APPROVED_COVERAGE_PAYOUT =
  anchorDiscriminator('global', 'claim_approved_coverage_payout');
const IX_CLOSE_COVERAGE_CLAIM = anchorDiscriminator('global', 'close_coverage_claim');
const IX_SETTLE_COVERAGE_CLAIM = anchorDiscriminator('global', 'settle_coverage_claim');
const IX_ACTIVATE_CYCLE_WITH_QUOTE_SOL = anchorDiscriminator('global', 'activate_cycle_with_quote_sol');
const IX_ACTIVATE_CYCLE_WITH_QUOTE_SPL = anchorDiscriminator('global', 'activate_cycle_with_quote_spl');
const IX_SETTLE_CYCLE_COMMITMENT = anchorDiscriminator('global', 'settle_cycle_commitment');
const IX_SETTLE_CYCLE_COMMITMENT_SOL = anchorDiscriminator('global', 'settle_cycle_commitment_sol');
const IX_WITHDRAW_POOL_TREASURY_SPL = anchorDiscriminator('global', 'withdraw_pool_treasury_spl');
const IX_WITHDRAW_POOL_TREASURY_SOL = anchorDiscriminator('global', 'withdraw_pool_treasury_sol');
const IX_WITHDRAW_PROTOCOL_FEE_SPL = anchorDiscriminator('global', 'withdraw_protocol_fee_spl');
const IX_WITHDRAW_PROTOCOL_FEE_SOL = anchorDiscriminator('global', 'withdraw_protocol_fee_sol');
const IX_WITHDRAW_POOL_ORACLE_FEE_SPL = anchorDiscriminator('global', 'withdraw_pool_oracle_fee_spl');
const IX_WITHDRAW_POOL_ORACLE_FEE_SOL = anchorDiscriminator('global', 'withdraw_pool_oracle_fee_sol');

const ACCOUNT_PROTOCOL_CONFIG = anchorDiscriminator('account', 'ProtocolConfig');
const ACCOUNT_POOL = anchorDiscriminator('account', 'Pool');
const ACCOUNT_ORACLE_REGISTRY = anchorDiscriminator('account', 'OracleRegistryEntry');
const ACCOUNT_ORACLE_PROFILE = anchorDiscriminator('account', 'OracleProfile');
const ACCOUNT_POOL_ORACLE_APPROVAL = anchorDiscriminator('account', 'PoolOracleApproval');
const ACCOUNT_MEMBERSHIP_RECORD = anchorDiscriminator('account', 'MembershipRecord');
const ACCOUNT_CYCLE_OUTCOME = anchorDiscriminator('account', 'CycleOutcomeState');
const ACCOUNT_CLAIM_RECORD = anchorDiscriminator('account', 'ClaimRecord');
const ACCOUNT_CYCLE_OUTCOME_AGGREGATE = anchorDiscriminator('account', 'CycleOutcomeAggregate');
const ACCOUNT_ORACLE_STAKE_POSITION = anchorDiscriminator('account', 'OracleStakePosition');
const ACCOUNT_POOL_ORACLE_POLICY = anchorDiscriminator('account', 'PoolOraclePolicy');
const ACCOUNT_POOL_TERMS = anchorDiscriminator('account', 'PoolTerms');
const ACCOUNT_POOL_ASSET_VAULT = anchorDiscriminator('account', 'PoolAssetVault');
const ACCOUNT_POOL_LIQUIDITY_CONFIG = anchorDiscriminator('account', 'PoolLiquidityConfig');
const ACCOUNT_POOL_RISK_CONFIG = anchorDiscriminator('account', 'PoolRiskConfig');
const ACCOUNT_POOL_CAPITAL_CLASS = anchorDiscriminator('account', 'PoolCapitalClass');
const ACCOUNT_POOL_COMPLIANCE_POLICY = anchorDiscriminator('account', 'PoolCompliancePolicy');
const ACCOUNT_POOL_CONTROL_AUTHORITY = anchorDiscriminator('account', 'PoolControlAuthority');
const ACCOUNT_POOL_AUTOMATION_POLICY = anchorDiscriminator('account', 'PoolAutomationPolicy');
const ACCOUNT_PROTOCOL_FEE_VAULT = anchorDiscriminator('account', 'ProtocolFeeVault');
const ACCOUNT_POOL_ORACLE_FEE_VAULT = anchorDiscriminator('account', 'PoolOracleFeeVault');
const ACCOUNT_OUTCOME_SCHEMA = anchorDiscriminator('account', 'OutcomeSchemaRegistryEntry');
const ACCOUNT_SCHEMA_DEPENDENCY_LEDGER = anchorDiscriminator('account', 'SchemaDependencyLedger');
const ACCOUNT_POOL_OUTCOME_RULE = anchorDiscriminator('account', 'PoolOutcomeRule');
const ACCOUNT_INVITE_ISSUER = anchorDiscriminator('account', 'InviteIssuerRegistryEntry');
const ACCOUNT_CLAIM_DELEGATE_AUTH = anchorDiscriminator('account', 'ClaimDelegateAuthorization');
const ACCOUNT_COVERAGE_CLAIM_RECORD = anchorDiscriminator('account', 'CoverageClaimRecord');
const ACCOUNT_COVERAGE_POLICY_POSITION_NFT = anchorDiscriminator('account', 'PolicyPositionNft');
const ACCOUNT_COVERAGE_PRODUCT = anchorDiscriminator('account', 'PolicySeries');
const ACCOUNT_COVERAGE_PRODUCT_PAYMENT_OPTION =
  anchorDiscriminator('account', 'PolicySeriesPaymentOption');
const ACCOUNT_ENROLLMENT_PERMIT_REPLAY = anchorDiscriminator('account', 'EnrollmentPermitReplay');
const ACCOUNT_ATTESTATION_VOTE = anchorDiscriminator('account', 'AttestationVote');
const ACCOUNT_COVERAGE_POLICY = anchorDiscriminator('account', 'PolicyPosition');
const ACCOUNT_PREMIUM_LEDGER = anchorDiscriminator('account', 'PremiumLedger');
const ACCOUNT_PREMIUM_ATTESTATION_REPLAY = anchorDiscriminator('account', 'PremiumAttestationReplay');
const ACCOUNT_POOL_ORACLE_PERMISSION_SET = anchorDiscriminator('account', 'PoolOraclePermissionSet');
const ACCOUNT_MEMBER_CYCLE = anchorDiscriminator('account', 'MemberCycleState');
const ACCOUNT_CYCLE_QUOTE_REPLAY = anchorDiscriminator('account', 'CycleQuoteReplay');
const ACCOUNT_POOL_TREASURY_RESERVE = anchorDiscriminator('account', 'PoolTreasuryReserve');
const ACCOUNT_COHORT_SETTLEMENT_ROOT =
  anchorDiscriminator('account', 'CohortSettlementRoot');
const ACCOUNT_POOL_REDEMPTION_REQUEST = anchorDiscriminator('account', 'PoolRedemptionRequest');

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

function pubkeyFromData(buffer: Buffer, offset: number): string {
  return new PublicKey(buffer.subarray(offset, offset + 32)).toBase58();
}

function parsePoolStatus(code: number): ProtocolPoolStatus {
  switch (code) {
    case 0:
      return 'draft';
    case 1:
      return 'active';
    case 2:
      return 'paused';
    case 3:
      return 'closed';
    default:
      return 'unknown';
  }
}

function parseMembershipStatus(code: number): ProtocolMembershipStatus {
  switch (code) {
    case 1:
      return 'active';
    case 2:
      return 'revoked';
    default:
      return 'unknown';
  }
}

function parsePoolType(code: number): ProtocolPoolType {
  switch (code) {
    case 0:
      return 'reward';
    case 1:
      return 'coverage';
    default:
      return 'unknown';
  }
}

function parseMemberCycleStatus(code: number): ProtocolMemberCycleStatus {
  switch (code) {
    case 1:
      return 'active';
    case 2:
      return 'settled';
    default:
      return 'unknown';
  }
}

function deriveAssociatedTokenAddress(params: {
  owner: string | PublicKey;
  mint: string | PublicKey;
  allowOwnerOffCurve?: boolean;
}): PublicKey {
  const owner = asPubkey(params.owner);
  const mint = asPubkey(params.mint);
  const [address] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  return address;
}

export function buildCycleQuoteMessage(fields: ProtocolCycleQuoteFields): Buffer {
  return Buffer.concat([
    Buffer.from('omegax:cycle_quote:v2', 'utf8'),
    asPubkey(fields.poolAddress).toBuffer(),
    asPubkey(fields.member).toBuffer(),
    Buffer.from(fromHex(fields.seriesRefHashHex, 32)),
    asPubkey(fields.paymentMint).toBuffer(),
    encodeU64Le(fields.premiumAmountRaw),
    encodeU64Le(fields.canonicalPremiumAmount),
    encodeU64Le(fields.periodIndex),
    Buffer.from([fields.commitmentEnabled ? 1 : 0]),
    encodeU64Le(fields.bondAmountRaw),
    encodeU64Le(fields.shieldFeeRaw),
    encodeU64Le(fields.protocolFeeRaw),
    encodeU64Le(fields.oracleFeeRaw),
    encodeU64Le(fields.netPoolPremiumRaw),
    encodeU64Le(fields.totalAmountRaw),
    Buffer.from([fields.includedShieldCount]),
    encodeU16Le(fields.thresholdBps),
    encodeU16Le(fields.outcomeThresholdScore),
    Buffer.from(fromHex(fields.cohortHashHex, 32)),
    encodeI64Le(fields.expiresAtTs),
    Buffer.from(fromHex(fields.nonceHashHex, 32)),
    Buffer.from(fromHex(fields.quoteMetaHashHex, 32)),
  ]);
}

function asCycleQuoteMessage(input: ProtocolCycleQuoteFields | Uint8Array): Buffer {
  if (input instanceof Uint8Array) {
    return Buffer.from(input);
  }
  return buildCycleQuoteMessage(input);
}

export function buildCycleQuoteHash(input: ProtocolCycleQuoteFields | Uint8Array): Buffer {
  return Buffer.from(blake3(asCycleQuoteMessage(input)));
}

export function buildCycleQuoteSignatureMessage(
  input: ProtocolCycleQuoteFields | Uint8Array,
): Buffer {
  return Buffer.concat([
    Buffer.from('omegax:cycle_quote_sig:v2', 'utf8'),
    buildCycleQuoteHash(input),
  ]);
}

export function compileTransactionToV0(
  transaction: Transaction,
  lookupTableAccounts: AddressLookupTableAccount[],
): VersionedTransaction {
  if (!transaction.feePayer) {
    throw new Error('transaction fee payer is required to compile a v0 transaction');
  }
  if (!transaction.recentBlockhash) {
    throw new Error('transaction recentBlockhash is required to compile a v0 transaction');
  }

  const message = new TransactionMessage({
    payerKey: transaction.feePayer,
    recentBlockhash: transaction.recentBlockhash,
    instructions: transaction.instructions,
  }).compileToV0Message(lookupTableAccounts);

  return new VersionedTransaction(message);
}

function hasDiscriminator(data: Buffer, discriminator: Buffer): boolean {
  if (data.length < 8) return false;
  return discriminator.equals(data.subarray(0, 8));
}

function decodePoolAccount(address: string, data: Buffer): ProtocolPoolAccount {
  if (!hasDiscriminator(data, ACCOUNT_POOL)) {
    throw new Error('account discriminator mismatch for Pool');
  }

  let offset = 8;
  const authority = pubkeyFromData(data, offset);
  offset += 32;

  const poolId = readString(data, offset);
  offset = poolId.offset;

  const organizationRef = readString(data, offset);
  offset = organizationRef.offset;

  const payoutLamportsPerPass = readU64Le(data, offset);
  offset += 8;

  const membershipMode = data.readUInt8(offset);
  offset += 1;

  const tokenGateMint = pubkeyFromData(data, offset);
  offset += 32;

  const tokenGateMinBalance = readU64Le(data, offset);
  offset += 8;

  const inviteIssuer = pubkeyFromData(data, offset);
  offset += 32;

  const statusCode = data.readUInt8(offset);
  offset += 1;

  const bump = data.readUInt8(offset);

  return {
    address,
    authority,
    poolId: poolId.value,
    organizationRef: organizationRef.value,
    payoutLamportsPerPass,
    membershipMode,
    tokenGateMint,
    tokenGateMinBalance,
    inviteIssuer,
    statusCode,
    status: parsePoolStatus(statusCode),
    bump,
  };
}

function decodeOracleRegistryEntryAccount(
  address: string,
  data: Buffer,
): ProtocolOracleRegistryEntryAccount {
  if (!hasDiscriminator(data, ACCOUNT_ORACLE_REGISTRY)) {
    throw new Error('account discriminator mismatch for OracleRegistryEntry');
  }

  let offset = 8;
  const oracle = pubkeyFromData(data, offset);
  offset += 32;
  const active = data.readUInt8(offset) === 1;
  offset += 1;
  const bump = data.readUInt8(offset);
  offset += 1;
  const metadataUri = readString(data, offset).value;

  return {
    address,
    oracle,
    active,
    bump,
    metadataUri,
  };
}

function decodeOracleProfileAccount(
  address: string,
  data: Buffer,
): ProtocolOracleProfileAccount {
  if (!hasDiscriminator(data, ACCOUNT_ORACLE_PROFILE)) {
    throw new Error('account discriminator mismatch for OracleProfile');
  }

  let offset = 8;
  const oracle = pubkeyFromData(data, offset);
  offset += 32;
  const admin = pubkeyFromData(data, offset);
  offset += 32;
  const oracleType = data.readUInt8(offset);
  offset += 1;
  const displayName = readString(data, offset);
  offset = displayName.offset;
  const legalName = readString(data, offset);
  offset = legalName.offset;
  const websiteUrl = readString(data, offset);
  offset = websiteUrl.offset;
  const appUrl = readString(data, offset);
  offset = appUrl.offset;
  const logoUri = readString(data, offset);
  offset = logoUri.offset;
  const webhookUrl = readString(data, offset);
  offset = webhookUrl.offset;
  const supportedSchemaCount = data.readUInt8(offset);
  offset += 1;
  const supportedSchemaKeyHashesHex: string[] = [];
  for (let index = 0; index < 16; index += 1) {
    const schemaHash = data.subarray(offset, offset + 32);
    offset += 32;
    if (index < supportedSchemaCount) {
      supportedSchemaKeyHashesHex.push(toHex(schemaHash));
    }
  }
  const claimed = data.readUInt8(offset) === 1;
  offset += 1;
  const createdAtTs = Number(readI64Le(data, offset));
  offset += 8;
  const updatedAtTs = Number(readI64Le(data, offset));
  offset += 8;
  const bump = data.readUInt8(offset);

  return {
    address,
    oracle,
    admin,
    oracleType,
    displayName: displayName.value,
    legalName: legalName.value,
    websiteUrl: websiteUrl.value,
    appUrl: appUrl.value,
    logoUri: logoUri.value,
    webhookUrl: webhookUrl.value,
    supportedSchemaCount,
    supportedSchemaKeyHashesHex,
    claimed,
    createdAtTs,
    updatedAtTs,
    bump,
  };
}

function decodePoolOracleApprovalAccount(
  address: string,
  data: Buffer,
): ProtocolPoolOracleApprovalAccount {
  if (!hasDiscriminator(data, ACCOUNT_POOL_ORACLE_APPROVAL)) {
    throw new Error('account discriminator mismatch for PoolOracleApproval');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const oracle = pubkeyFromData(data, offset);
  offset += 32;
  const active = data.readUInt8(offset) === 1;
  offset += 1;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    oracle,
    active,
    bump,
  };
}

function decodeMembershipRecordAccount(
  address: string,
  data: Buffer,
): ProtocolMembershipRecordAccount {
  if (!hasDiscriminator(data, ACCOUNT_MEMBERSHIP_RECORD)) {
    throw new Error('account discriminator mismatch for MembershipRecord');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const member = pubkeyFromData(data, offset);
  offset += 32;
  const subjectCommitment = data.subarray(offset, offset + 32);
  offset += 32;
  const statusCode = data.readUInt8(offset);
  offset += 1;
  const enrolledAt = Number(readI64Le(data, offset));
  offset += 8;
  const updatedAt = Number(readI64Le(data, offset));
  offset += 8;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    member,
    subjectCommitmentHex: toHex(subjectCommitment),
    statusCode,
    status: parseMembershipStatus(statusCode),
    enrolledAt,
    updatedAt,
    bump,
  };
}

function decodeCycleOutcomeAccount(address: string, data: Buffer): ProtocolCycleOutcomeAccount {
  if (!hasDiscriminator(data, ACCOUNT_CYCLE_OUTCOME)) {
    throw new Error('account discriminator mismatch for CycleOutcomeState');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;

  const member = pubkeyFromData(data, offset);
  offset += 32;

  const cycleHash = data.subarray(offset, offset + 32);
  offset += 32;

  const passCount = data.readUInt32LE(offset);
  offset += 4;

  const attestationCount = data.readUInt32LE(offset);
  offset += 4;

  const latestAsOfTs = Number(readI64Le(data, offset));
  offset += 8;

  const claimed = data.readUInt8(offset) === 1;
  offset += 1;

  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    member,
    cycleHashHex: toHex(cycleHash),
    passCount,
    attestationCount,
    latestAsOfTs,
    claimed,
    bump,
  };
}

function decodeCycleOutcomeAggregateAccount(
  address: string,
  data: Buffer,
): ProtocolCycleOutcomeAggregateAccount {
  if (!hasDiscriminator(data, ACCOUNT_CYCLE_OUTCOME_AGGREGATE)) {
    throw new Error('account discriminator mismatch for CycleOutcomeAggregate');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const seriesRefHash = data.subarray(offset, offset + 32);
  offset += 32;
  const member = pubkeyFromData(data, offset);
  offset += 32;
  const cycleHash = data.subarray(offset, offset + 32);
  offset += 32;
  const ruleHash = data.subarray(offset, offset + 32);
  offset += 32;
  const passVotes = data.readUInt16LE(offset);
  offset += 2;
  const failVotes = data.readUInt16LE(offset);
  offset += 2;
  const quorumM = data.readUInt8(offset);
  offset += 1;
  const quorumN = data.readUInt8(offset);
  offset += 1;
  const finalized = data.readUInt8(offset) === 1;
  offset += 1;
  const passed = data.readUInt8(offset) === 1;
  offset += 1;
  const claimed = data.readUInt8(offset) === 1;
  offset += 1;
  const rewardLiabilityReserved = data.readUInt8(offset) === 1;
  offset += 1;
  const evidenceHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const externalAttestationRefHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const reviewStatus = data.readUInt8(offset);
  offset += 1;
  const challengeWindowEndsAt = Number(readI64Le(data, offset));
  offset += 8;
  const disputeReasonHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const disputedBy = pubkeyFromData(data, offset);
  offset += 32;
  const resolvedBy = pubkeyFromData(data, offset);
  offset += 32;
  const resolvedAt = Number(readI64Le(data, offset));
  offset += 8;
  const aiRole = data.readUInt8(offset);
  offset += 1;
  const automationMode = data.readUInt8(offset);
  offset += 1;
  const modelVersionHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const policyVersionHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const executionEnvironmentHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const attestationProviderRefHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const latestAsOfTs = Number(readI64Le(data, offset));
  offset += 8;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    seriesRefHashHex: toHex(seriesRefHash),
    member,
    cycleHashHex: toHex(cycleHash),
    ruleHashHex: toHex(ruleHash),
    passVotes,
    failVotes,
    quorumM,
    quorumN,
    finalized,
    passed,
    claimed,
    rewardLiabilityReserved,
    evidenceHashHex,
    externalAttestationRefHashHex,
    reviewStatus,
    challengeWindowEndsAt,
    disputeReasonHashHex,
    disputedBy,
    resolvedBy,
    resolvedAt,
    aiRole,
    automationMode,
    modelVersionHashHex,
    policyVersionHashHex,
    executionEnvironmentHashHex,
    attestationProviderRefHashHex,
    latestAsOfTs,
    bump,
  };
}

function decodeProtocolConfigAccount(address: string, data: Buffer): ProtocolConfigAccount {
  if (!hasDiscriminator(data, ACCOUNT_PROTOCOL_CONFIG)) {
    throw new Error('account discriminator mismatch for ProtocolConfig');
  }

  let offset = 8;
  const admin = pubkeyFromData(data, offset);
  offset += 32;
  const governanceAuthority = pubkeyFromData(data, offset);
  offset += 32;
  const governanceRealm = pubkeyFromData(data, offset);
  offset += 32;
  const governanceConfig = pubkeyFromData(data, offset);
  offset += 32;
  const defaultStakeMint = pubkeyFromData(data, offset);
  offset += 32;
  const protocolFeeBps = readU16Le(data, offset);
  offset += 2;
  const minOracleStake = readU64Le(data, offset);
  offset += 8;
  const emergencyPaused = data.readUInt8(offset) === 1;
  offset += 1;
  const allowedPayoutMintsHash = data.subarray(offset, offset + 32);
  offset += 32;
  const bump = data.readUInt8(offset);

  return {
    address,
    admin,
    governanceAuthority,
    governanceRealm,
    governanceConfig,
    defaultStakeMint,
    protocolFeeBps,
    minOracleStake,
    emergencyPaused,
    allowedPayoutMintsHashHex: toHex(allowedPayoutMintsHash),
    bump,
  };
}

function decodeOracleStakePositionAccount(
  address: string,
  data: Buffer,
): ProtocolOracleStakePositionAccount {
  if (!hasDiscriminator(data, ACCOUNT_ORACLE_STAKE_POSITION)) {
    throw new Error('account discriminator mismatch for OracleStakePosition');
  }

  let offset = 8;
  const oracle = pubkeyFromData(data, offset);
  offset += 32;
  const staker = pubkeyFromData(data, offset);
  offset += 32;
  const stakeMint = pubkeyFromData(data, offset);
  offset += 32;
  const stakeVault = pubkeyFromData(data, offset);
  offset += 32;
  const stakedAmount = readU64Le(data, offset);
  offset += 8;
  const pendingUnstakeAmount = readU64Le(data, offset);
  offset += 8;
  const canFinalizeUnstakeAt = Number(readI64Le(data, offset));
  offset += 8;
  const slashPending = data.readUInt8(offset) === 1;
  offset += 1;
  const bump = data.readUInt8(offset);

  return {
    address,
    oracle,
    staker,
    stakeMint,
    stakeVault,
    stakedAmount,
    pendingUnstakeAmount,
    canFinalizeUnstakeAt,
    slashPending,
    bump,
  };
}

function decodePoolOraclePolicyAccount(
  address: string,
  data: Buffer,
): ProtocolPoolOraclePolicyAccount {
  if (!hasDiscriminator(data, ACCOUNT_POOL_ORACLE_POLICY)) {
    throw new Error('account discriminator mismatch for PoolOraclePolicy');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const quorumM = data.readUInt8(offset);
  offset += 1;
  const quorumN = data.readUInt8(offset);
  offset += 1;
  const requireVerifiedSchema = data.readUInt8(offset) === 1;
  offset += 1;
  const oracleFeeBps = readU16Le(data, offset);
  offset += 2;
  const allowDelegateClaim = data.readUInt8(offset) === 1;
  offset += 1;
  const challengeWindowSecs = Number(readI64Le(data, offset));
  offset += 8;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    quorumM,
    quorumN,
    requireVerifiedSchema,
    oracleFeeBps,
    allowDelegateClaim,
    challengeWindowSecs,
    bump,
  };
}

function decodePoolTermsAccount(address: string, data: Buffer): ProtocolPoolTermsAccount {
  if (!hasDiscriminator(data, ACCOUNT_POOL_TERMS)) {
    throw new Error('account discriminator mismatch for PoolTerms');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const poolTypeCode = data.readUInt8(offset);
  offset += 1;
  const payoutAssetMint = pubkeyFromData(data, offset);
  offset += 32;
  const termsHash = data.subarray(offset, offset + 32);
  offset += 32;
  const payoutPolicyHash = data.subarray(offset, offset + 32);
  offset += 32;
  const cycleMode = data.readUInt8(offset);
  offset += 1;
  const metadataUri = readString(data, offset);
  offset = metadataUri.offset;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    poolTypeCode,
    poolType: parsePoolType(poolTypeCode),
    payoutAssetMint,
    termsHashHex: toHex(termsHash),
    payoutPolicyHashHex: toHex(payoutPolicyHash),
    cycleMode,
    metadataUri: metadataUri.value,
    bump,
  };
}

function decodePoolAssetVaultAccount(
  address: string,
  data: Buffer,
): ProtocolPoolAssetVaultAccount {
  if (!hasDiscriminator(data, ACCOUNT_POOL_ASSET_VAULT)) {
    throw new Error('account discriminator mismatch for PoolAssetVault');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const payoutMint = pubkeyFromData(data, offset);
  offset += 32;
  const vaultTokenAccount = pubkeyFromData(data, offset);
  offset += 32;
  const active = data.readUInt8(offset) === 1;
  offset += 1;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    payoutMint,
    vaultTokenAccount,
    active,
    bump,
  };
}

function decodePoolLiquidityConfigAccount(
  address: string,
  data: Buffer,
): ProtocolPoolLiquidityConfigAccount {
  if (!hasDiscriminator(data, ACCOUNT_POOL_LIQUIDITY_CONFIG)) {
    throw new Error('account discriminator mismatch for PoolLiquidityConfig');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const payoutMint = pubkeyFromData(data, offset);
  offset += 32;
  const shareMint = pubkeyFromData(data, offset);
  offset += 32;
  const depositsEnabled = data.readUInt8(offset) === 1;
  offset += 1;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    payoutMint,
    shareMint,
    depositsEnabled,
    bump,
  };
}

function decodePoolRiskConfigAccount(
  address: string,
  data: Buffer,
): ProtocolPoolRiskConfigAccount {
  if (!hasDiscriminator(data, ACCOUNT_POOL_RISK_CONFIG)) {
    throw new Error('account discriminator mismatch for PoolRiskConfig');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const redemptionMode = data.readUInt8(offset);
  offset += 1;
  const claimMode = data.readUInt8(offset);
  offset += 1;
  const impaired = data.readUInt8(offset) === 1;
  offset += 1;
  const updatedBy = pubkeyFromData(data, offset);
  offset += 32;
  const updatedAt = Number(readI64Le(data, offset));
  offset += 8;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    redemptionMode,
    claimMode,
    impaired,
    updatedBy,
    updatedAt,
    bump,
  };
}

function decodePoolCapitalClassAccount(
  address: string,
  data: Buffer,
): ProtocolPoolCapitalClassAccount {
  if (!hasDiscriminator(data, ACCOUNT_POOL_CAPITAL_CLASS)) {
    throw new Error('account discriminator mismatch for PoolCapitalClass');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const shareMint = pubkeyFromData(data, offset);
  offset += 32;
  const payoutMint = pubkeyFromData(data, offset);
  offset += 32;
  const classIdHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const seriesRefHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const complianceProfileHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const classMode = data.readUInt8(offset);
  offset += 1;
  const classPriority = data.readUInt8(offset);
  offset += 1;
  const transferMode = data.readUInt8(offset);
  offset += 1;
  const restricted = data.readUInt8(offset) === 1;
  offset += 1;
  const redemptionQueueEnabled = data.readUInt8(offset) === 1;
  offset += 1;
  const ringFenced = data.readUInt8(offset) === 1;
  offset += 1;
  const lockupSecs = Number(readI64Le(data, offset));
  offset += 8;
  const redemptionNoticeSecs = Number(readI64Le(data, offset));
  offset += 8;
  const vintageIndex = readU16Le(data, offset);
  offset += 2;
  const issuedAt = Number(readI64Le(data, offset));
  offset += 8;
  const updatedAt = Number(readI64Le(data, offset));
  offset += 8;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    shareMint,
    payoutMint,
    classIdHashHex,
    seriesRefHashHex,
    complianceProfileHashHex,
    classMode,
    classPriority,
    transferMode,
    restricted,
    redemptionQueueEnabled,
    ringFenced,
    lockupSecs,
    redemptionNoticeSecs,
    vintageIndex,
    issuedAt,
    updatedAt,
    bump,
  };
}

function decodePoolCompliancePolicyAccount(
  address: string,
  data: Buffer,
): ProtocolPoolCompliancePolicyAccount {
  if (!hasDiscriminator(data, ACCOUNT_POOL_COMPLIANCE_POLICY)) {
    throw new Error('account discriminator mismatch for PoolCompliancePolicy');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const providerRefHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const credentialTypeHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const revocationListHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const actionsMask = readU16Le(data, offset);
  offset += 2;
  const bindingMode = data.readUInt8(offset);
  offset += 1;
  const providerMode = data.readUInt8(offset);
  offset += 1;
  const capitalRailMode = data.readUInt8(offset);
  offset += 1;
  const payoutRailMode = data.readUInt8(offset);
  offset += 1;
  const active = data.readUInt8(offset) === 1;
  offset += 1;
  const updatedBy = pubkeyFromData(data, offset);
  offset += 32;
  const updatedAt = Number(readI64Le(data, offset));
  offset += 8;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    providerRefHashHex,
    credentialTypeHashHex,
    revocationListHashHex,
    actionsMask,
    bindingMode,
    providerMode,
    capitalRailMode,
    payoutRailMode,
    active,
    updatedBy,
    updatedAt,
    bump,
  };
}

function decodePoolControlAuthorityAccount(
  address: string,
  data: Buffer,
): ProtocolPoolControlAuthorityAccount {
  if (!hasDiscriminator(data, ACCOUNT_POOL_CONTROL_AUTHORITY)) {
    throw new Error('account discriminator mismatch for PoolControlAuthority');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const operatorAuthority = pubkeyFromData(data, offset);
  offset += 32;
  const riskManagerAuthority = pubkeyFromData(data, offset);
  offset += 32;
  const complianceAuthority = pubkeyFromData(data, offset);
  offset += 32;
  const guardianAuthority = pubkeyFromData(data, offset);
  offset += 32;
  const updatedAt = Number(readI64Le(data, offset));
  offset += 8;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    operatorAuthority,
    riskManagerAuthority,
    complianceAuthority,
    guardianAuthority,
    updatedAt,
    bump,
  };
}

function decodePoolAutomationPolicyAccount(
  address: string,
  data: Buffer,
): ProtocolPoolAutomationPolicyAccount {
  if (!hasDiscriminator(data, ACCOUNT_POOL_AUTOMATION_POLICY)) {
    throw new Error('account discriminator mismatch for PoolAutomationPolicy');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const oracleAutomationMode = data.readUInt8(offset);
  offset += 1;
  const claimAutomationMode = data.readUInt8(offset);
  offset += 1;
  const allowedAiRolesMask = readU16Le(data, offset);
  offset += 2;
  const maxAutoClaimAmount = readU64Le(data, offset);
  offset += 8;
  const requiredAttestationProviderRefHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const updatedBy = pubkeyFromData(data, offset);
  offset += 32;
  const updatedAt = Number(readI64Le(data, offset));
  offset += 8;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    oracleAutomationMode,
    claimAutomationMode,
    allowedAiRolesMask,
    maxAutoClaimAmount,
    requiredAttestationProviderRefHashHex,
    updatedBy,
    updatedAt,
    bump,
  };
}

function decodeProtocolFeeVaultAccount(
  address: string,
  data: Buffer,
): ProtocolFeeVaultAccount {
  if (!hasDiscriminator(data, ACCOUNT_PROTOCOL_FEE_VAULT)) {
    throw new Error('account discriminator mismatch for ProtocolFeeVault');
  }

  let offset = 8;
  const paymentMint = pubkeyFromData(data, offset);
  offset += 32;
  const bump = data.readUInt8(offset);

  return {
    address,
    paymentMint,
    bump,
  };
}

function decodePoolOracleFeeVaultAccount(
  address: string,
  data: Buffer,
): ProtocolPoolOracleFeeVaultAccount {
  if (!hasDiscriminator(data, ACCOUNT_POOL_ORACLE_FEE_VAULT)) {
    throw new Error('account discriminator mismatch for PoolOracleFeeVault');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const oracle = pubkeyFromData(data, offset);
  offset += 32;
  const paymentMint = pubkeyFromData(data, offset);
  offset += 32;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    oracle,
    paymentMint,
    bump,
  };
}

function decodePoolOraclePermissionSetAccount(
  address: string,
  data: Buffer,
): ProtocolPoolOraclePermissionSetAccount {
  if (!hasDiscriminator(data, ACCOUNT_POOL_ORACLE_PERMISSION_SET)) {
    throw new Error('account discriminator mismatch for PoolOraclePermissionSet');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const oracle = pubkeyFromData(data, offset);
  offset += 32;
  const permissions = data.readUInt32LE(offset);
  offset += 4;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    oracle,
    permissions,
    bump,
  };
}

function decodeMemberCycleAccount(
  address: string,
  data: Buffer,
): ProtocolMemberCycleAccount {
  if (!hasDiscriminator(data, ACCOUNT_MEMBER_CYCLE)) {
    throw new Error('account discriminator mismatch for MemberCycleState');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const member = pubkeyFromData(data, offset);
  offset += 32;
  const seriesRefHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const periodIndex = readU64Le(data, offset);
  offset += 8;
  const paymentMint = pubkeyFromData(data, offset);
  offset += 32;
  const premiumAmountRaw = readU64Le(data, offset);
  offset += 8;
  const bondAmountRaw = readU64Le(data, offset);
  offset += 8;
  const shieldFeeRaw = readU64Le(data, offset);
  offset += 8;
  const protocolFeeRaw = readU64Le(data, offset);
  offset += 8;
  const oracleFeeRaw = readU64Le(data, offset);
  offset += 8;
  const netPoolPremiumRaw = readU64Le(data, offset);
  offset += 8;
  const totalAmountRaw = readU64Le(data, offset);
  offset += 8;
  const canonicalPremiumAmount = readU64Le(data, offset);
  offset += 8;
  const commitmentEnabled = data.readUInt8(offset) === 1;
  offset += 1;
  const thresholdBps = readU16Le(data, offset);
  offset += 2;
  const outcomeThresholdScore = readU16Le(data, offset);
  offset += 2;
  const cohortHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const settledHealthAlphaScore = readU16Le(data, offset);
  offset += 2;
  const includedShieldCount = data.readUInt8(offset);
  offset += 1;
  const shieldConsumed = data.readUInt8(offset) === 1;
  offset += 1;
  const statusCode = data.readUInt8(offset);
  offset += 1;
  const passed = data.readUInt8(offset) === 1;
  offset += 1;
  const activatedAt = Number(readI64Le(data, offset));
  offset += 8;
  const settledAt = Number(readI64Le(data, offset));
  offset += 8;
  const quoteHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    member,
    seriesRefHashHex,
    periodIndex,
    paymentMint,
    premiumAmountRaw,
    bondAmountRaw,
    shieldFeeRaw,
    protocolFeeRaw,
    oracleFeeRaw,
    netPoolPremiumRaw,
    totalAmountRaw,
    canonicalPremiumAmount,
    commitmentEnabled,
    thresholdBps,
    outcomeThresholdScore,
    cohortHashHex,
    settledHealthAlphaScore,
    includedShieldCount,
    shieldConsumed,
    statusCode,
    status: parseMemberCycleStatus(statusCode),
    passed,
    activatedAt,
    settledAt,
    quoteHashHex,
    bump,
  };
}

function decodeCycleQuoteReplayAccount(
  address: string,
  data: Buffer,
): ProtocolCycleQuoteReplayAccount {
  if (!hasDiscriminator(data, ACCOUNT_CYCLE_QUOTE_REPLAY)) {
    throw new Error('account discriminator mismatch for CycleQuoteReplay');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const seriesRefHash = data.subarray(offset, offset + 32);
  offset += 32;
  const member = pubkeyFromData(data, offset);
  offset += 32;
  const nonceHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const quoteHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const createdAt = Number(readI64Le(data, offset));
  offset += 8;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    seriesRefHashHex: toHex(seriesRefHash),
    member,
    nonceHashHex,
    quoteHashHex,
    createdAt,
    bump,
  };
}

function decodePoolTreasuryReserveAccount(
  address: string,
  data: Buffer,
): ProtocolPoolTreasuryReserveAccount {
  if (!hasDiscriminator(data, ACCOUNT_POOL_TREASURY_RESERVE)) {
    throw new Error('account discriminator mismatch for PoolTreasuryReserve');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const paymentMint = pubkeyFromData(data, offset);
  offset += 32;
  const reservedRefundAmount = readU64Le(data, offset);
  offset += 8;
  const reservedRewardAmount = readU64Le(data, offset);
  offset += 8;
  const reservedRedistributionAmount = readU64Le(data, offset);
  offset += 8;
  const manualCoverageReserveAmount = readU64Le(data, offset);
  offset += 8;
  const reservedCoverageClaimAmount = readU64Le(data, offset);
  offset += 8;
  const paidCoverageClaimAmount = readU64Le(data, offset);
  offset += 8;
  const recoveredCoverageClaimAmount = readU64Le(data, offset);
  offset += 8;
  const impairedAmount = readU64Le(data, offset);
  offset += 8;
  const lastLiabilityUpdateTs = Number(readI64Le(data, offset));
  offset += 8;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    paymentMint,
    reservedRefundAmount,
    reservedRewardAmount,
    reservedRedistributionAmount,
    manualCoverageReserveAmount,
    reservedCoverageClaimAmount,
    paidCoverageClaimAmount,
    recoveredCoverageClaimAmount,
    impairedAmount,
    lastLiabilityUpdateTs,
    bump,
  };
}

function decodeCohortSettlementRootAccount(
  address: string,
  data: Buffer,
): ProtocolCohortSettlementRootAccount {
  if (!hasDiscriminator(data, ACCOUNT_COHORT_SETTLEMENT_ROOT)) {
    throw new Error('account discriminator mismatch for CohortSettlementRoot');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const seriesRefHash = data.subarray(offset, offset + 32);
  offset += 32;
  const paymentMint = pubkeyFromData(data, offset);
  offset += 32;
  const cohortHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const outcomeThresholdScore = readU16Le(data, offset);
  offset += 2;
  const successfulMemberCount = data.readUInt32LE(offset);
  offset += 4;
  const successfulHealthAlphaScoreSum = readU64Le(data, offset);
  offset += 8;
  const redistributableFailedBondsTotal = readU64Le(data, offset);
  offset += 8;
  const redistributionClaimedAmount = readU64Le(data, offset);
  offset += 8;
  const successfulClaimCount = data.readUInt32LE(offset);
  offset += 4;
  const finalized = data.readUInt8(offset) === 1;
  offset += 1;
  const zeroSuccessReleased = data.readUInt8(offset) === 1;
  offset += 1;
  const finalizedAt = Number(readI64Le(data, offset));
  offset += 8;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    seriesRefHashHex: toHex(seriesRefHash),
    paymentMint,
    cohortHashHex,
    outcomeThresholdScore,
    successfulMemberCount,
    successfulHealthAlphaScoreSum,
    redistributableFailedBondsTotal,
    redistributionClaimedAmount,
    successfulClaimCount,
    finalized,
    zeroSuccessReleased,
    finalizedAt,
    bump,
  };
}

function decodeOutcomeSchemaAccount(
  address: string,
  data: Buffer,
): ProtocolOutcomeSchemaRegistryEntryAccount {
  if (!hasDiscriminator(data, ACCOUNT_OUTCOME_SCHEMA)) {
    throw new Error('account discriminator mismatch for OutcomeSchemaRegistryEntry');
  }

  let offset = 8;
  const schemaKeyHash = data.subarray(offset, offset + 32);
  offset += 32;
  const schemaKey = readString(data, offset);
  offset = schemaKey.offset;
  const version = readU16Le(data, offset);
  offset += 2;
  const schemaHash = data.subarray(offset, offset + 32);
  offset += 32;
  const publisher = pubkeyFromData(data, offset);
  offset += 32;
  const verified = data.readUInt8(offset) === 1;
  offset += 1;
  const schemaFamily = data.readUInt8(offset);
  offset += 1;
  const visibility = data.readUInt8(offset);
  offset += 1;
  const interopProfileHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const codeSystemFamilyHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const mappingVersion = readU16Le(data, offset);
  offset += 2;
  const metadataUri = readString(data, offset);
  offset = metadataUri.offset;
  const bump = data.readUInt8(offset);

  return {
    address,
    schemaKeyHashHex: toHex(schemaKeyHash),
    schemaKey: schemaKey.value,
    version,
    schemaHashHex: toHex(schemaHash),
    publisher,
    verified,
    schemaFamily,
    visibility,
    interopProfileHashHex,
    codeSystemFamilyHashHex,
    mappingVersion,
    metadataUri: metadataUri.value,
    bump,
  };
}

function decodeSchemaDependencyLedgerAccount(
  address: string,
  data: Buffer,
): ProtocolSchemaDependencyLedgerAccount {
  if (!hasDiscriminator(data, ACCOUNT_SCHEMA_DEPENDENCY_LEDGER)) {
    throw new Error('account discriminator mismatch for SchemaDependencyLedger');
  }

  let offset = 8;
  const schemaKeyHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const activeRuleRefcount = data.readUInt32LE(offset);
  offset += 4;
  const bump = data.readUInt8(offset);

  return {
    address,
    schemaKeyHashHex,
    activeRuleRefcount,
    bump,
  };
}

function decodePoolOutcomeRuleAccount(
  address: string,
  data: Buffer,
): ProtocolPoolOutcomeRuleAccount {
  if (!hasDiscriminator(data, ACCOUNT_POOL_OUTCOME_RULE)) {
    throw new Error('account discriminator mismatch for PoolOutcomeRule');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const seriesRefHash = data.subarray(offset, offset + 32);
  offset += 32;
  const ruleHash = data.subarray(offset, offset + 32);
  offset += 32;
  const schemaKeyHash = data.subarray(offset, offset + 32);
  offset += 32;
  const ruleId = readString(data, offset);
  offset = ruleId.offset;
  const schemaKey = readString(data, offset);
  offset = schemaKey.offset;
  const schemaVersion = readU16Le(data, offset);
  offset += 2;
  const interopProfileHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const codeSystemFamilyHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const mappingVersion = readU16Le(data, offset);
  offset += 2;
  const payoutHash = data.subarray(offset, offset + 32);
  offset += 32;
  const enabled = data.readUInt8(offset) === 1;
  offset += 1;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    seriesRefHashHex: toHex(seriesRefHash),
    ruleHashHex: toHex(ruleHash),
    schemaKeyHashHex: toHex(schemaKeyHash),
    ruleId: ruleId.value,
    schemaKey: schemaKey.value,
    schemaVersion,
    interopProfileHashHex,
    codeSystemFamilyHashHex,
    mappingVersion,
    payoutHashHex: toHex(payoutHash),
    enabled,
    bump,
  };
}

function decodeInviteIssuerAccount(
  address: string,
  data: Buffer,
): ProtocolInviteIssuerRegistryEntryAccount {
  if (!hasDiscriminator(data, ACCOUNT_INVITE_ISSUER)) {
    throw new Error('account discriminator mismatch for InviteIssuerRegistryEntry');
  }

  let offset = 8;
  const issuer = pubkeyFromData(data, offset);
  offset += 32;
  const organizationRef = readString(data, offset);
  offset = organizationRef.offset;
  const metadataUri = readString(data, offset);
  offset = metadataUri.offset;
  const active = data.readUInt8(offset) === 1;
  offset += 1;
  const bump = data.readUInt8(offset);

  return {
    address,
    issuer,
    organizationRef: organizationRef.value,
    metadataUri: metadataUri.value,
    active,
    bump,
  };
}

function decodeEnrollmentPermitReplayAccount(
  address: string,
  data: Buffer,
): ProtocolEnrollmentPermitReplayAccount {
  if (!hasDiscriminator(data, ACCOUNT_ENROLLMENT_PERMIT_REPLAY)) {
    throw new Error('account discriminator mismatch for EnrollmentPermitReplay');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const issuer = pubkeyFromData(data, offset);
  offset += 32;
  const member = pubkeyFromData(data, offset);
  offset += 32;
  const nonceHash = data.subarray(offset, offset + 32);
  offset += 32;
  const inviteIdHash = data.subarray(offset, offset + 32);
  offset += 32;
  const createdAt = Number(readI64Le(data, offset));
  offset += 8;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    issuer,
    member,
    nonceHashHex: toHex(nonceHash),
    inviteIdHashHex: toHex(inviteIdHash),
    createdAt,
    bump,
  };
}

function decodeAttestationVoteAccount(
  address: string,
  data: Buffer,
): ProtocolAttestationVoteAccount {
  if (!hasDiscriminator(data, ACCOUNT_ATTESTATION_VOTE)) {
    throw new Error('account discriminator mismatch for AttestationVote');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const seriesRefHash = data.subarray(offset, offset + 32);
  offset += 32;
  const member = pubkeyFromData(data, offset);
  offset += 32;
  const cycleHash = data.subarray(offset, offset + 32);
  offset += 32;
  const ruleHash = data.subarray(offset, offset + 32);
  offset += 32;
  const oracle = pubkeyFromData(data, offset);
  offset += 32;
  const passed = data.readUInt8(offset) === 1;
  offset += 1;
  const attestationDigest = data.subarray(offset, offset + 32);
  offset += 32;
  const observedValueHash = data.subarray(offset, offset + 32);
  offset += 32;
  const evidenceHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const externalAttestationRefHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const aiRole = data.readUInt8(offset);
  offset += 1;
  const automationMode = data.readUInt8(offset);
  offset += 1;
  const modelVersionHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const policyVersionHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const executionEnvironmentHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const attestationProviderRefHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const asOfTs = Number(readI64Le(data, offset));
  offset += 8;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    seriesRefHashHex: toHex(seriesRefHash),
    member,
    cycleHashHex: toHex(cycleHash),
    ruleHashHex: toHex(ruleHash),
    oracle,
    passed,
    attestationDigestHex: toHex(attestationDigest),
    observedValueHashHex: toHex(observedValueHash),
    evidenceHashHex,
    externalAttestationRefHashHex,
    aiRole,
    automationMode,
    modelVersionHashHex,
    policyVersionHashHex,
    executionEnvironmentHashHex,
    attestationProviderRefHashHex,
    asOfTs,
    bump,
  };
}

function decodeClaimDelegateAccount(
  address: string,
  data: Buffer,
): ProtocolClaimDelegateAuthorizationAccount {
  if (!hasDiscriminator(data, ACCOUNT_CLAIM_DELEGATE_AUTH)) {
    throw new Error('account discriminator mismatch for ClaimDelegateAuthorization');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const member = pubkeyFromData(data, offset);
  offset += 32;
  const delegate = pubkeyFromData(data, offset);
  offset += 32;
  const active = data.readUInt8(offset) === 1;
  offset += 1;
  const updatedAt = Number(readI64Le(data, offset));
  offset += 8;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    member,
    delegate,
    active,
    updatedAt,
    bump,
  };
}

function decodePolicyPositionAccount(
  address: string,
  data: Buffer,
): ProtocolPolicyPositionAccount {
  if (!hasDiscriminator(data, ACCOUNT_COVERAGE_POLICY)) {
    throw new Error('account discriminator mismatch for PolicyPosition');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const member = pubkeyFromData(data, offset);
  offset += 32;
  const seriesRefHash = data.subarray(offset, offset + 32);
  offset += 32;
  const termsHash = data.subarray(offset, offset + 32);
  offset += 32;
  const status = data.readUInt8(offset);
  offset += 1;
  const startsAt = Number(readI64Le(data, offset));
  offset += 8;
  const endsAt = Number(readI64Le(data, offset));
  offset += 8;
  const premiumDueEverySecs = Number(readI64Le(data, offset));
  offset += 8;
  const premiumGraceSecs = Number(readI64Le(data, offset));
  offset += 8;
  const nextDueAt = Number(readI64Le(data, offset));
  offset += 8;
  const nftMint = pubkeyFromData(data, offset);
  offset += 32;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    member,
    seriesRefHashHex: toHex(seriesRefHash),
    termsHashHex: toHex(termsHash),
    status,
    startsAt,
    endsAt,
    premiumDueEverySecs,
    premiumGraceSecs,
    nextDueAt,
    nftMint,
    bump,
  };
}

function decodePremiumLedgerAccount(
  address: string,
  data: Buffer,
): ProtocolPremiumLedgerAccount {
  if (!hasDiscriminator(data, ACCOUNT_PREMIUM_LEDGER)) {
    throw new Error('account discriminator mismatch for PremiumLedger');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const seriesRefHash = data.subarray(offset, offset + 32);
  offset += 32;
  const member = pubkeyFromData(data, offset);
  offset += 32;
  const periodIndex = readU64Le(data, offset);
  offset += 8;
  const amount = readU64Le(data, offset);
  offset += 8;
  const source = data.readUInt8(offset);
  offset += 1;
  const paidAt = Number(readI64Le(data, offset));
  offset += 8;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    seriesRefHashHex: toHex(seriesRefHash),
    member,
    periodIndex,
    amount,
    source,
    paidAt,
    bump,
  };
}

function decodeClaimRecordAccount(address: string, data: Buffer): ProtocolClaimRecordAccount {
  if (!hasDiscriminator(data, ACCOUNT_CLAIM_RECORD)) {
    throw new Error('account discriminator mismatch for ClaimRecord');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const seriesRefHash = data.subarray(offset, offset + 32);
  offset += 32;
  const member = pubkeyFromData(data, offset);
  offset += 32;
  const claimant = pubkeyFromData(data, offset);
  offset += 32;
  const cycleHash = data.subarray(offset, offset + 32);
  offset += 32;
  const ruleHash = data.subarray(offset, offset + 32);
  offset += 32;
  const intentHash = data.subarray(offset, offset + 32);
  offset += 32;
  const payoutMint = pubkeyFromData(data, offset);
  offset += 32;
  const payoutAmount = readU64Le(data, offset);
  offset += 8;
  const recipient = pubkeyFromData(data, offset);
  offset += 32;
  const submittedAt = Number(readI64Le(data, offset));
  offset += 8;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    seriesRefHashHex: toHex(seriesRefHash),
    member,
    claimant,
    cycleHashHex: toHex(cycleHash),
    ruleHashHex: toHex(ruleHash),
    intentHashHex: toHex(intentHash),
    payoutMint,
    payoutAmount,
    recipient,
    submittedAt,
    bump,
  };
}

function decodePolicySeriesAccount(
  address: string,
  data: Buffer,
): ProtocolPolicySeriesAccount {
  if (!hasDiscriminator(data, ACCOUNT_COVERAGE_PRODUCT)) {
    throw new Error('account discriminator mismatch for PolicySeries');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const seriesRefHash = data.subarray(offset, offset + 32);
  offset += 32;
  const status = data.readUInt8(offset);
  offset += 1;
  const planMode = data.readUInt8(offset);
  offset += 1;
  const sponsorMode = data.readUInt8(offset);
  offset += 1;
  const displayName = readString(data, offset);
  offset = displayName.offset;
  const metadataUri = readString(data, offset);
  offset = metadataUri.offset;
  const termsHash = data.subarray(offset, offset + 32);
  offset += 32;
  const durationSecs = readI64Le(data, offset);
  offset += 8;
  const premiumDueEverySecs = readI64Le(data, offset);
  offset += 8;
  const premiumGraceSecs = readI64Le(data, offset);
  offset += 8;
  const premiumAmount = readU64Le(data, offset);
  offset += 8;
  const interopProfileHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const oracleProfileHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const riskFamilyHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const issuanceTemplateHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const comparabilityHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const renewalOfHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const termsVersion = readU16Le(data, offset);
  offset += 2;
  const mappingVersion = readU16Le(data, offset);
  offset += 2;
  const createdAtTs = readI64Le(data, offset);
  offset += 8;
  const updatedAtTs = readI64Le(data, offset);
  offset += 8;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    seriesRefHashHex: toHex(seriesRefHash),
    status,
    planMode,
    sponsorMode,
    displayName: displayName.value,
    metadataUri: metadataUri.value,
    termsHashHex: toHex(termsHash),
    durationSecs,
    premiumDueEverySecs,
    premiumGraceSecs,
    premiumAmount,
    interopProfileHashHex,
    oracleProfileHashHex,
    riskFamilyHashHex,
    issuanceTemplateHashHex,
    comparabilityHashHex,
    renewalOfHashHex,
    termsVersion,
    mappingVersion,
    createdAtTs,
    updatedAtTs,
    bump,
  };
}

function decodePolicySeriesPaymentOptionAccount(
  address: string,
  data: Buffer,
): ProtocolPolicySeriesPaymentOptionAccount {
  if (!hasDiscriminator(data, ACCOUNT_COVERAGE_PRODUCT_PAYMENT_OPTION)) {
    throw new Error('account discriminator mismatch for PolicySeriesPaymentOption');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const productIdHash = data.subarray(offset, offset + 32);
  offset += 32;
  const paymentMint = pubkeyFromData(data, offset);
  offset += 32;
  const paymentAmount = readU64Le(data, offset);
  offset += 8;
  const active = data.readUInt8(offset) === 1;
  offset += 1;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    seriesRefHashHex: toHex(productIdHash),
    paymentMint,
    paymentAmount,
    active,
    bump,
  };
}

function decodePolicyPositionNftAccount(
  address: string,
  data: Buffer,
): ProtocolPolicyPositionNftAccount {
  if (!hasDiscriminator(data, ACCOUNT_COVERAGE_POLICY_POSITION_NFT)) {
    throw new Error('account discriminator mismatch for PolicyPositionNft');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const member = pubkeyFromData(data, offset);
  offset += 32;
  const seriesRefHash = data.subarray(offset, offset + 32);
  offset += 32;
  const nftMint = pubkeyFromData(data, offset);
  offset += 32;
  const metadataUri = readString(data, offset);
  offset = metadataUri.offset;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    member,
    seriesRefHashHex: toHex(seriesRefHash),
    nftMint,
    metadataUri: metadataUri.value,
    bump,
  };
}

function decodePremiumAttestationReplayAccount(
  address: string,
  data: Buffer,
): ProtocolPremiumAttestationReplayAccount {
  if (!hasDiscriminator(data, ACCOUNT_PREMIUM_ATTESTATION_REPLAY)) {
    throw new Error('account discriminator mismatch for PremiumAttestationReplay');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const seriesRefHash = data.subarray(offset, offset + 32);
  offset += 32;
  const member = pubkeyFromData(data, offset);
  offset += 32;
  const replayHash = data.subarray(offset, offset + 32);
  offset += 32;
  const oracle = pubkeyFromData(data, offset);
  offset += 32;
  const createdAt = Number(readI64Le(data, offset));
  offset += 8;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    seriesRefHashHex: toHex(seriesRefHash),
    member,
    replayHashHex: toHex(replayHash),
    oracle,
    createdAt,
    bump,
  };
}

function decodeCoverageClaimRecordAccount(
  address: string,
  data: Buffer,
): ProtocolCoverageClaimRecordAccount {
  if (!hasDiscriminator(data, ACCOUNT_COVERAGE_CLAIM_RECORD)) {
    throw new Error('account discriminator mismatch for CoverageClaimRecord');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const seriesRefHash = data.subarray(offset, offset + 32);
  offset += 32;
  const member = pubkeyFromData(data, offset);
  offset += 32;
  const claimant = pubkeyFromData(data, offset);
  offset += 32;
  const intentHash = data.subarray(offset, offset + 32);
  offset += 32;
  const eventHash = data.subarray(offset, offset + 32);
  offset += 32;
  const evidenceHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const interopRefHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const interopProfileHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const codeSystemFamilyHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const decisionReasonHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const adjudicationRefHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const status = data.readUInt8(offset);
  offset += 1;
  const claimFamily = data.readUInt8(offset);
  offset += 1;
  const appealCount = readU16Le(data, offset);
  offset += 2;
  const requestedAmount = readU64Le(data, offset);
  offset += 8;
  const approvedAmount = readU64Le(data, offset);
  offset += 8;
  const paidAmount = readU64Le(data, offset);
  offset += 8;
  const reservedAmount = readU64Le(data, offset);
  offset += 8;
  const recoveryAmount = readU64Le(data, offset);
  offset += 8;
  const aiDecisionHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const aiPolicyHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const aiExecutionEnvironmentHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const aiAttestationRefHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const aiAutomationMode = data.readUInt8(offset);
  offset += 1;
  const submittedAt = Number(readI64Le(data, offset));
  offset += 8;
  const reviewedAt = Number(readI64Le(data, offset));
  offset += 8;
  const settledAt = Number(readI64Le(data, offset));
  offset += 8;
  const closedAt = Number(readI64Le(data, offset));
  offset += 8;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    seriesRefHashHex: toHex(seriesRefHash),
    member,
    claimant,
    intentHashHex: toHex(intentHash),
    eventHashHex: toHex(eventHash),
    evidenceHashHex,
    interopRefHashHex,
    interopProfileHashHex,
    codeSystemFamilyHashHex,
    decisionReasonHashHex,
    adjudicationRefHashHex,
    status,
    claimFamily,
    appealCount,
    requestedAmount,
    approvedAmount,
    paidAmount,
    reservedAmount,
    recoveryAmount,
    aiDecisionHashHex,
    aiPolicyHashHex,
    aiExecutionEnvironmentHashHex,
    aiAttestationRefHashHex,
    aiAutomationMode,
    submittedAt,
    reviewedAt,
    settledAt,
    closedAt,
    bump,
  };
}

function decodePoolRedemptionRequestAccount(
  address: string,
  data: Buffer,
): ProtocolPoolRedemptionRequestAccount {
  if (!hasDiscriminator(data, ACCOUNT_POOL_REDEMPTION_REQUEST)) {
    throw new Error('account discriminator mismatch for PoolRedemptionRequest');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const redeemer = pubkeyFromData(data, offset);
  offset += 32;
  const shareMint = pubkeyFromData(data, offset);
  offset += 32;
  const payoutMint = pubkeyFromData(data, offset);
  offset += 32;
  const requestHashHex = toHex(data.subarray(offset, offset + 32));
  offset += 32;
  const shareEscrow = pubkeyFromData(data, offset);
  offset += 32;
  const status = data.readUInt8(offset);
  offset += 1;
  const sharesRequested = readU64Le(data, offset);
  offset += 8;
  const minAmountOut = readU64Le(data, offset);
  offset += 8;
  const expectedAmountOut = readU64Le(data, offset);
  offset += 8;
  const noticeMaturesAt = Number(readI64Le(data, offset));
  offset += 8;
  const requestedAt = Number(readI64Le(data, offset));
  offset += 8;
  const scheduledAt = Number(readI64Le(data, offset));
  offset += 8;
  const fulfilledAt = Number(readI64Le(data, offset));
  offset += 8;
  const cancelledAt = Number(readI64Le(data, offset));
  offset += 8;
  const failedAt = Number(readI64Le(data, offset));
  offset += 8;
  const failureCode = readU16Le(data, offset);
  offset += 2;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    redeemer,
    shareMint,
    payoutMint,
    requestHashHex,
    shareEscrow,
    status,
    sharesRequested,
    minAmountOut,
    expectedAmountOut,
    noticeMaturesAt,
    requestedAt,
    scheduledAt,
    fulfilledAt,
    cancelledAt,
    failedAt,
    failureCode,
    bump,
  };
}

function assertPoolIdSeedLength(poolId: string): void {
  const length = Buffer.byteLength(poolId, 'utf8');
  if (length > MAX_POOL_ID_SEED_BYTES) {
    throw new Error(`poolId exceeds ${MAX_POOL_ID_SEED_BYTES} UTF-8 bytes`);
  }
}

function normalize32ByteHexOrHash(value: string | undefined, fallbackInput: string): Uint8Array {
  if (typeof value === 'string' && value.trim().length > 0) {
    return fromHex(value, 32);
  }
  return hashStringTo32(fallbackInput);
}

function optional32ByteHex(value: string | undefined): Buffer {
  return Buffer.from(fromHex(value ?? '00'.repeat(32), 32));
}

function buildCycleQuoteVerificationInstruction(params: {
  quoteVerificationInstruction?: TransactionInstruction;
  quoteMessage?: Uint8Array;
  oracleSecretKey?: Uint8Array;
}): TransactionInstruction {
  if (params.quoteVerificationInstruction) {
    return params.quoteVerificationInstruction;
  }
  if (params.quoteMessage && params.oracleSecretKey) {
    return Ed25519Program.createInstructionWithPrivateKey({
      privateKey: params.oracleSecretKey,
      message: buildCycleQuoteSignatureMessage(params.quoteMessage),
    });
  }
  if (params.quoteMessage || params.oracleSecretKey) {
    throw new Error(
      'quoteMessage and oracleSecretKey must both be provided when quoteVerificationInstruction is not supplied',
    );
  }
  throw new Error(
    'quoteVerificationInstruction or quoteMessage + oracleSecretKey is required for cycle quote activation',
  );
}

function asI64BigInt(value: bigint | number): bigint {
  return typeof value === 'bigint' ? value : BigInt(Math.trunc(value));
}

function encodeSetPoolStatusData(params: BuildSetPoolStatusTxParams): Buffer {
  return Buffer.concat([IX_SET_POOL_STATUS, Buffer.from([params.status & 0xff])]);
}

function encodeFixed32Vec(valuesHex: string[]): Buffer {
  const count = valuesHex.length >>> 0;
  if (count > MAX_ORACLE_SUPPORTED_SCHEMAS) {
    throw new Error(`supported schema key hashes cannot exceed ${MAX_ORACLE_SUPPORTED_SCHEMAS}`);
  }
  const encoded = [Buffer.alloc(4)];
  encoded[0].writeUInt32LE(count, 0);
  for (const value of valuesHex) {
    encoded.push(Buffer.from(fromHex(value, 32)));
  }
  return Buffer.concat(encoded);
}

function validateRewardClaimOptionalAccounts(params: {
  memberCycle?: string;
  cohortSettlementRoot?: string;
  poolAssetVault?: string;
  poolVaultTokenAccount?: string;
  recipientTokenAccount?: string;
}): void {
  const providedCount = [
    params.poolAssetVault,
    params.poolVaultTokenAccount,
    params.recipientTokenAccount,
  ].filter((value) => typeof value === 'string' && value.length > 0).length;

  if (providedCount !== 0 && providedCount !== 3) {
    throw new Error(
      'poolAssetVault, poolVaultTokenAccount, and recipientTokenAccount must be provided together',
    );
  }
}

function encodeRegisterOracleData(params: BuildRegisterOracleTxParams): Buffer {
  return Buffer.concat([
    IX_REGISTER_ORACLE,
    asPubkey(params.oraclePubkey).toBuffer(),
    Buffer.from([params.oracleType & 0xff]),
    encodeString(params.displayName),
    encodeString(params.legalName),
    encodeString(params.websiteUrl),
    encodeString(params.appUrl),
    encodeString(params.logoUri),
    encodeString(params.webhookUrl),
    encodeFixed32Vec(params.supportedSchemaKeyHashesHex),
  ]);
}

function encodeUpdateOracleProfileData(params: BuildUpdateOracleProfileTxParams): Buffer {
  return Buffer.concat([
    IX_UPDATE_ORACLE_PROFILE,
    Buffer.from([params.oracleType & 0xff]),
    encodeString(params.displayName),
    encodeString(params.legalName),
    encodeString(params.websiteUrl),
    encodeString(params.appUrl),
    encodeString(params.logoUri),
    encodeString(params.webhookUrl),
    encodeFixed32Vec(params.supportedSchemaKeyHashesHex),
  ]);
}

function encodeSetPoolOracleData(params: BuildSetPoolOracleTxParams): Buffer {
  return Buffer.concat([IX_SET_POOL_ORACLE, Buffer.from([params.active ? 1 : 0])]);
}

function encodeSubmitOutcomeAttestationVoteData(
  params: BuildSubmitOutcomeAttestationVoteTxParams,
): Buffer {
  const cycleHash = fromHex(params.cycleHashHex, 32);
  const ruleHash = fromHex(params.ruleHashHex, 32);
  const digest = fromHex(params.attestationDigestHex, 32);
  const observedValueHash = fromHex(params.observedValueHashHex, 32);
  const asOfTs = asI64BigInt(params.asOfTs);

  return Buffer.concat([
    IX_SUBMIT_OUTCOME_ATTESTATION_VOTE,
    asPubkey(params.member).toBuffer(),
    Buffer.from(cycleHash),
    Buffer.from(ruleHash),
    Buffer.from(digest),
    Buffer.from(observedValueHash),
    optional32ByteHex(params.evidenceHashHex),
    optional32ByteHex(params.externalAttestationRefHashHex),
    Buffer.from([(params.aiRole ?? 0) & 0xff]),
    Buffer.from([(params.automationMode ?? 0) & 0xff]),
    optional32ByteHex(params.modelVersionHashHex),
    optional32ByteHex(params.policyVersionHashHex),
    optional32ByteHex(params.executionEnvironmentHashHex),
    optional32ByteHex(params.attestationProviderRefHashHex),
    encodeI64Le(asOfTs),
    Buffer.from([params.passed ? 1 : 0]),
  ]);
}

function encodeInitializeProtocolData(params: BuildInitializeProtocolTxParams): Buffer {
  if (!Number.isInteger(params.protocolFeeBps) || params.protocolFeeBps < 0 || params.protocolFeeBps > 10_000) {
    throw new Error('protocolFeeBps must be an integer between 0 and 10000');
  }
  return Buffer.concat([
    IX_INITIALIZE_PROTOCOL,
    encodeU16Le(params.protocolFeeBps),
    asPubkey(params.governanceRealm).toBuffer(),
    asPubkey(params.governanceConfig).toBuffer(),
    asPubkey(params.defaultStakeMint).toBuffer(),
    encodeU64Le(params.minOracleStake),
  ]);
}

function encodeSetProtocolParamsData(params: BuildSetProtocolParamsTxParams): Buffer {
  if (!Number.isInteger(params.protocolFeeBps) || params.protocolFeeBps < 0 || params.protocolFeeBps > 10_000) {
    throw new Error('protocolFeeBps must be an integer between 0 and 10000');
  }
  return Buffer.concat([
    IX_SET_PROTOCOL_PARAMS,
    encodeU16Le(params.protocolFeeBps),
    Buffer.from(fromHex(params.allowedPayoutMintsHashHex, 32)),
    encodeU64Le(params.minOracleStake),
    Buffer.from([params.emergencyPaused ? 1 : 0]),
  ]);
}

function encodeRotateGovernanceAuthorityData(params: BuildRotateGovernanceAuthorityTxParams): Buffer {
  return Buffer.concat([
    IX_ROTATE_GOVERNANCE_AUTHORITY,
    asPubkey(params.newAuthority).toBuffer(),
  ]);
}

function encodeUpdateOracleMetadataData(params: BuildUpdateOracleMetadataTxParams): Buffer {
  return Buffer.concat([
    IX_UPDATE_ORACLE_METADATA,
    encodeString(params.metadataUri),
    Buffer.from([params.active ? 1 : 0]),
  ]);
}

function encodeStakeOracleData(params: BuildStakeOracleTxParams): Buffer {
  return Buffer.concat([IX_STAKE_ORACLE, encodeU64Le(params.amount)]);
}

function encodeRequestUnstakeData(params: BuildRequestUnstakeTxParams): Buffer {
  return Buffer.concat([
    IX_REQUEST_UNSTAKE,
    encodeU64Le(params.amount),
    encodeI64Le(asI64BigInt(params.cooldownSeconds)),
  ]);
}

function encodeSlashOracleData(params: BuildSlashOracleTxParams): Buffer {
  return Buffer.concat([IX_SLASH_ORACLE, encodeU64Le(params.amount)]);
}

function encodeCreatePoolData(params: BuildCreatePoolTxParams): Buffer {
  assertPoolIdSeedLength(params.poolId);
  return Buffer.concat([
    IX_CREATE_POOL,
    encodeString(params.poolId),
    encodeString(params.organizationRef),
    encodeU64Le(params.payoutLamportsPerPass),
    Buffer.from([params.membershipMode & 0xff]),
    asPubkey(params.tokenGateMint).toBuffer(),
    encodeU64Le(params.tokenGateMinBalance),
    asPubkey(params.inviteIssuer).toBuffer(),
    Buffer.from([params.poolType & 0xff]),
    asPubkey(params.payoutAssetMint).toBuffer(),
    Buffer.from(fromHex(params.termsHashHex, 32)),
    Buffer.from(fromHex(params.payoutPolicyHashHex, 32)),
    Buffer.from([params.cycleMode & 0xff]),
    encodeString(params.metadataUri),
  ]);
}

function encodeSetPoolOraclePolicyData(params: BuildSetPoolOraclePolicyTxParams): Buffer {
  return Buffer.concat([
    IX_SET_POOL_ORACLE_POLICY,
    Buffer.from([params.quorumM & 0xff]),
    Buffer.from([params.quorumN & 0xff]),
    Buffer.from([params.requireVerifiedSchema ? 1 : 0]),
    encodeU16Le(params.oracleFeeBps),
    Buffer.from([params.allowDelegateClaim ? 1 : 0]),
    encodeI64Le(asI64BigInt(params.challengeWindowSecs ?? 0)),
  ]);
}

function encodeSetPoolRiskControlsData(params: BuildSetPoolRiskControlsTxParams): Buffer {
  return Buffer.concat([
    IX_SET_POOL_RISK_CONTROLS,
    Buffer.from([params.redemptionMode & 0xff]),
    Buffer.from([params.claimMode & 0xff]),
    Buffer.from([params.impaired ? 1 : 0]),
    encodeU64Le(params.impairmentAmount),
  ]);
}

function encodeSetPoolCompliancePolicyData(
  params: BuildSetPoolCompliancePolicyTxParams,
): Buffer {
  return Buffer.concat([
    IX_SET_POOL_COMPLIANCE_POLICY,
    optional32ByteHex(params.providerRefHashHex),
    optional32ByteHex(params.credentialTypeHashHex),
    optional32ByteHex(params.revocationListHashHex),
    encodeU16Le(params.actionsMask),
    Buffer.from([params.bindingMode & 0xff]),
    Buffer.from([params.providerMode & 0xff]),
    Buffer.from([params.capitalRailMode & 0xff]),
    Buffer.from([params.payoutRailMode & 0xff]),
    Buffer.from([params.active ? 1 : 0]),
  ]);
}

function encodeSetPoolControlAuthoritiesData(
  params: BuildSetPoolControlAuthoritiesTxParams,
): Buffer {
  return Buffer.concat([
    IX_SET_POOL_CONTROL_AUTHORITIES,
    asPubkey(params.operatorAuthority).toBuffer(),
    asPubkey(params.riskManagerAuthority).toBuffer(),
    asPubkey(params.complianceAuthority).toBuffer(),
    asPubkey(params.guardianAuthority).toBuffer(),
  ]);
}

function encodeSetPoolAutomationPolicyData(
  params: BuildSetPoolAutomationPolicyTxParams,
): Buffer {
  return Buffer.concat([
    IX_SET_POOL_AUTOMATION_POLICY,
    Buffer.from([params.oracleAutomationMode & 0xff]),
    Buffer.from([params.claimAutomationMode & 0xff]),
    encodeU16Le(params.allowedAiRolesMask),
    encodeU64Le(params.maxAutoClaimAmount),
    optional32ByteHex(params.requiredAttestationProviderRefHashHex),
  ]);
}

function encodeSetPoolOraclePermissionsData(
  params: BuildSetPoolOraclePermissionsTxParams,
): Buffer {
  const permissions = params.permissions >>> 0;
  const out = Buffer.alloc(4);
  out.writeUInt32LE(permissions, 0);
  return Buffer.concat([IX_SET_POOL_ORACLE_PERMISSIONS, out]);
}

function encodeSetPoolCoverageReserveFloorData(
  params: BuildSetPoolCoverageReserveFloorTxParams,
): Buffer {
  return Buffer.concat([
    IX_SET_POOL_COVERAGE_RESERVE_FLOOR,
    asPubkey(params.paymentMint).toBuffer(),
    encodeU64Le(params.amount),
  ]);
}

function encodeWithdrawProtocolFeeSplData(params: BuildWithdrawProtocolFeeSplTxParams): Buffer {
  return Buffer.concat([IX_WITHDRAW_PROTOCOL_FEE_SPL, encodeU64Le(params.amount)]);
}

function encodeWithdrawProtocolFeeSolData(params: BuildWithdrawProtocolFeeSolTxParams): Buffer {
  return Buffer.concat([IX_WITHDRAW_PROTOCOL_FEE_SOL, encodeU64Le(params.amount)]);
}

function encodeWithdrawPoolOracleFeeSplData(
  params: BuildWithdrawPoolOracleFeeSplTxParams,
): Buffer {
  return Buffer.concat([IX_WITHDRAW_POOL_ORACLE_FEE_SPL, encodeU64Le(params.amount)]);
}

function encodeWithdrawPoolOracleFeeSolData(
  params: BuildWithdrawPoolOracleFeeSolTxParams,
): Buffer {
  return Buffer.concat([IX_WITHDRAW_POOL_ORACLE_FEE_SOL, encodeU64Le(params.amount)]);
}

function encodeSetPoolTermsHashData(params: BuildSetPoolTermsHashTxParams): Buffer {
  return Buffer.concat([
    IX_SET_POOL_TERMS_HASH,
    Buffer.from(fromHex(params.termsHashHex, 32)),
    Buffer.from(fromHex(params.payoutPolicyHashHex, 32)),
    Buffer.from([params.cycleMode & 0xff]),
    encodeString(params.metadataUri),
  ]);
}

function encodeRegisterOutcomeSchemaData(params: BuildRegisterOutcomeSchemaTxParams): Buffer {
  return Buffer.concat([
    IX_REGISTER_OUTCOME_SCHEMA,
    Buffer.from(fromHex(params.schemaKeyHashHex, 32)),
    encodeString(params.schemaKey),
    encodeU16Le(params.version),
    Buffer.from(fromHex(params.schemaHashHex, 32)),
    Buffer.from([(params.schemaFamily ?? 0) & 0xff]),
    Buffer.from([(params.visibility ?? 0) & 0xff]),
    optional32ByteHex(params.interopProfileHashHex),
    optional32ByteHex(params.codeSystemFamilyHashHex),
    encodeU16Le(params.mappingVersion ?? 0),
    encodeString(params.metadataUri),
  ]);
}

function encodeVerifyOutcomeSchemaData(params: BuildVerifyOutcomeSchemaTxParams): Buffer {
  return Buffer.concat([
    IX_VERIFY_OUTCOME_SCHEMA,
    Buffer.from([params.verified ? 1 : 0]),
  ]);
}

function encodeBackfillSchemaDependencyLedgerData(
  params: BuildBackfillSchemaDependencyLedgerTxParams,
): Buffer {
  return Buffer.concat([
    IX_BACKFILL_SCHEMA_DEPENDENCY_LEDGER,
    Buffer.from(fromHex(params.schemaKeyHashHex, 32)),
  ]);
}

function encodeCloseOutcomeSchemaData(): Buffer {
  return Buffer.from(IX_CLOSE_OUTCOME_SCHEMA);
}

function encodeSetPoolOutcomeRuleData(params: BuildSetPoolOutcomeRuleTxParams): Buffer {
  return Buffer.concat([
    IX_SET_POOL_OUTCOME_RULE,
    Buffer.from(fromHex(params.seriesRefHashHex, 32)),
    Buffer.from(fromHex(params.ruleHashHex, 32)),
    Buffer.from(fromHex(params.schemaKeyHashHex, 32)),
    encodeString(params.ruleId),
    encodeString(params.schemaKey),
    encodeU16Le(params.schemaVersion),
    optional32ByteHex(params.interopProfileHashHex),
    optional32ByteHex(params.codeSystemFamilyHashHex),
    encodeU16Le(params.mappingVersion ?? 0),
    Buffer.from(fromHex(params.payoutHashHex, 32)),
    Buffer.from([params.enabled ? 1 : 0]),
  ]);
}

function encodeRegisterInviteIssuerData(params: BuildRegisterInviteIssuerTxParams): Buffer {
  return Buffer.concat([
    IX_REGISTER_INVITE_ISSUER,
    encodeString(params.organizationRef),
    encodeString(params.metadataUri),
    Buffer.from([params.active ? 1 : 0]),
  ]);
}

function encodeEnrollMemberOpenData(params: BuildEnrollMemberOpenTxParams): Buffer {
  const subjectCommitment = normalize32ByteHexOrHash(
    params.subjectCommitmentHex,
    `subject:${params.member}`,
  );
  return Buffer.concat([IX_ENROLL_MEMBER_OPEN, Buffer.from(subjectCommitment)]);
}

function encodeEnrollMemberTokenGateData(params: BuildEnrollMemberTokenGateTxParams): Buffer {
  const subjectCommitment = normalize32ByteHexOrHash(
    params.subjectCommitmentHex,
    `subject:${params.member}`,
  );
  return Buffer.concat([IX_ENROLL_MEMBER_TOKEN_GATE, Buffer.from(subjectCommitment)]);
}

function encodeEnrollMemberInvitePermitData(
  params: BuildEnrollMemberInvitePermitTxParams,
): Buffer {
  const subjectCommitment = normalize32ByteHexOrHash(
    params.subjectCommitmentHex,
    `subject:${params.member}`,
  );
  return Buffer.concat([
    IX_ENROLL_MEMBER_INVITE_PERMIT,
    Buffer.from(subjectCommitment),
    Buffer.from(fromHex(params.nonceHashHex, 32)),
    Buffer.from(fromHex(params.inviteIdHashHex, 32)),
    encodeI64Le(asI64BigInt(params.expiresAtTs)),
  ]);
}

function encodeSetClaimDelegateData(params: BuildSetClaimDelegateTxParams): Buffer {
  return Buffer.concat([
    IX_SET_CLAIM_DELEGATE,
    asPubkey(params.delegate).toBuffer(),
    Buffer.from([params.active ? 1 : 0]),
  ]);
}

function encodeFundPoolSolData(params: BuildFundPoolSolTxParams): Buffer {
  return Buffer.concat([IX_FUND_POOL_SOL, encodeU64Le(params.lamports)]);
}

function encodeFundPoolSplData(params: BuildFundPoolSplTxParams): Buffer {
  return Buffer.concat([IX_FUND_POOL_SPL, encodeU64Le(params.amount)]);
}

function encodeInitializePoolLiquiditySolData(
  params: BuildInitializePoolLiquiditySolTxParams,
): Buffer {
  return Buffer.concat([IX_INITIALIZE_POOL_LIQUIDITY_SOL, encodeU64Le(params.initialLamports)]);
}

function encodeInitializePoolLiquiditySplData(
  params: BuildInitializePoolLiquiditySplTxParams,
): Buffer {
  return Buffer.concat([IX_INITIALIZE_POOL_LIQUIDITY_SPL, encodeU64Le(params.initialAmount)]);
}

function encodeSetPoolLiquidityEnabledData(
  params: BuildSetPoolLiquidityEnabledTxParams,
): Buffer {
  return Buffer.concat([IX_SET_POOL_LIQUIDITY_ENABLED, Buffer.from([params.enabled ? 1 : 0])]);
}

function encodeRegisterPoolCapitalClassData(
  params: BuildRegisterPoolCapitalClassTxParams,
): Buffer {
  return Buffer.concat([
    IX_REGISTER_POOL_CAPITAL_CLASS,
    Buffer.from(fromHex(params.classIdHashHex, 32)),
    Buffer.from([params.classMode & 0xff]),
    Buffer.from([params.classPriority & 0xff]),
    Buffer.from([params.transferMode & 0xff]),
    Buffer.from([params.restricted ? 1 : 0]),
    Buffer.from([params.redemptionQueueEnabled ? 1 : 0]),
    Buffer.from([params.ringFenced ? 1 : 0]),
    encodeI64Le(asI64BigInt(params.lockupSecs)),
    encodeI64Le(asI64BigInt(params.redemptionNoticeSecs)),
    optional32ByteHex(params.complianceProfileHashHex),
    optional32ByteHex(params.seriesRefHashHex),
    encodeU16Le(params.vintageIndex),
  ]);
}

function encodeDepositPoolLiquiditySolData(
  params: BuildDepositPoolLiquiditySolTxParams,
): Buffer {
  return Buffer.concat([
    IX_DEPOSIT_POOL_LIQUIDITY_SOL,
    encodeU64Le(params.amountIn),
    encodeU64Le(params.minSharesOut),
  ]);
}

function encodeDepositPoolLiquiditySplData(
  params: BuildDepositPoolLiquiditySplTxParams,
): Buffer {
  return Buffer.concat([
    IX_DEPOSIT_POOL_LIQUIDITY_SPL,
    encodeU64Le(params.amountIn),
    encodeU64Le(params.minSharesOut),
  ]);
}

function encodeRedeemPoolLiquiditySolData(
  params: BuildRedeemPoolLiquiditySolTxParams,
): Buffer {
  return Buffer.concat([
    IX_REDEEM_POOL_LIQUIDITY_SOL,
    encodeU64Le(params.sharesIn),
    encodeU64Le(params.minAmountOut),
  ]);
}

function encodeRedeemPoolLiquiditySplData(
  params: BuildRedeemPoolLiquiditySplTxParams,
): Buffer {
  return Buffer.concat([
    IX_REDEEM_POOL_LIQUIDITY_SPL,
    encodeU64Le(params.sharesIn),
    encodeU64Le(params.minAmountOut),
  ]);
}

function encodeRequestPoolLiquidityRedemptionData(
  params: BuildRequestPoolLiquidityRedemptionTxParams,
): Buffer {
  return Buffer.concat([
    IX_REQUEST_POOL_LIQUIDITY_REDEMPTION,
    Buffer.from(fromHex(params.requestHashHex, 32)),
    encodeU64Le(params.sharesIn),
    encodeU64Le(params.minAmountOut),
  ]);
}

function encodeFailPoolLiquidityRedemptionData(
  params: BuildFailPoolLiquidityRedemptionTxParams,
): Buffer {
  return Buffer.concat([
    IX_FAIL_POOL_LIQUIDITY_REDEMPTION,
    encodeU16Le(params.failureCode),
  ]);
}

function encodeSubmitRewardClaimData(params: BuildSubmitRewardClaimTxParams): Buffer {
  return Buffer.concat([
    IX_SUBMIT_REWARD_CLAIM,
    asPubkey(params.member).toBuffer(),
    Buffer.from(fromHex(params.cycleHashHex, 32)),
    Buffer.from(fromHex(params.ruleHashHex, 32)),
    Buffer.from(fromHex(params.intentHashHex, 32)),
    encodeU64Le(params.payoutAmount),
    asPubkey(params.recipient).toBuffer(),
  ]);
}

function encodeCreatePolicySeriesData(params: BuildCreatePolicySeriesTxParams): Buffer {
  return Buffer.concat([
    IX_CREATE_POLICY_SERIES,
    Buffer.from(fromHex(params.seriesRefHashHex, 32)),
    Buffer.from([params.status & 0xff]),
    Buffer.from([params.planMode & 0xff]),
    Buffer.from([params.sponsorMode & 0xff]),
    encodeString(params.displayName),
    encodeString(params.metadataUri),
    Buffer.from(fromHex(params.termsHashHex, 32)),
    encodeI64Le(asI64BigInt(params.durationSecs)),
    encodeI64Le(asI64BigInt(params.premiumDueEverySecs)),
    encodeI64Le(asI64BigInt(params.premiumGraceSecs)),
    encodeU64Le(params.premiumAmount),
    optional32ByteHex(params.interopProfileHashHex),
    optional32ByteHex(params.oracleProfileHashHex),
    optional32ByteHex(params.riskFamilyHashHex),
    optional32ByteHex(params.issuanceTemplateHashHex),
    optional32ByteHex(params.comparabilityHashHex),
    optional32ByteHex(params.renewalOfHashHex),
    encodeU16Le(params.termsVersion),
    encodeU16Le(params.mappingVersion),
  ]);
}

function encodeUpsertPolicySeriesPaymentOptionData(
  params: BuildUpsertPolicySeriesPaymentOptionTxParams,
): Buffer {
  return Buffer.concat([
    IX_UPSERT_POLICY_SERIES_PAYMENT_OPTION,
    asPubkey(params.paymentMint).toBuffer(),
    encodeU64Le(params.paymentAmount),
    Buffer.from([params.active ? 1 : 0]),
  ]);
}

function encodeUpdatePolicySeriesData(params: BuildUpdatePolicySeriesTxParams): Buffer {
  return Buffer.concat([
    IX_UPDATE_POLICY_SERIES,
    Buffer.from([params.status & 0xff]),
    Buffer.from([params.planMode & 0xff]),
    Buffer.from([params.sponsorMode & 0xff]),
    encodeString(params.displayName),
    encodeString(params.metadataUri),
    Buffer.from(fromHex(params.termsHashHex, 32)),
    encodeI64Le(asI64BigInt(params.durationSecs)),
    encodeI64Le(asI64BigInt(params.premiumDueEverySecs)),
    encodeI64Le(asI64BigInt(params.premiumGraceSecs)),
    encodeU64Le(params.premiumAmount),
    optional32ByteHex(params.interopProfileHashHex),
    optional32ByteHex(params.oracleProfileHashHex),
    optional32ByteHex(params.riskFamilyHashHex),
    optional32ByteHex(params.issuanceTemplateHashHex),
    optional32ByteHex(params.comparabilityHashHex),
    optional32ByteHex(params.renewalOfHashHex),
    encodeU16Le(params.termsVersion),
    encodeU16Le(params.mappingVersion),
  ]);
}

function encodeSubscribePolicySeriesData(params: BuildSubscribePolicySeriesTxParams): Buffer {
  return Buffer.concat([
    IX_SUBSCRIBE_POLICY_SERIES,
    Buffer.from(fromHex(params.seriesRefHashHex, 32)),
    encodeI64Le(asI64BigInt(params.startsAtTs)),
  ]);
}

function encodeIssuePolicyPositionData(
  params: BuildIssuePolicyPositionTxParams,
): Buffer {
  return Buffer.concat([
    IX_ISSUE_POLICY_POSITION,
    asPubkey(params.member).toBuffer(),
    Buffer.from(fromHex(params.seriesRefHashHex, 32)),
    encodeI64Le(asI64BigInt(params.startsAtTs)),
  ]);
}

function encodeMintPolicyNftData(params: BuildMintPolicyNftTxParams): Buffer {
  return Buffer.concat([
    IX_MINT_POLICY_NFT,
    asPubkey(params.nftMint).toBuffer(),
    encodeString(params.metadataUri),
  ]);
}

function encodePayPremiumSolData(params: BuildPayPremiumSolTxParams): Buffer {
  return Buffer.concat([IX_PAY_PREMIUM_SOL, encodeU64Le(params.periodIndex)]);
}

function encodePayPremiumSplData(params: BuildPayPremiumSplTxParams): Buffer {
  return Buffer.concat([IX_PAY_PREMIUM_SPL, encodeU64Le(params.periodIndex)]);
}

function encodeAttestPremiumPaidOffchainData(
  params: BuildAttestPremiumPaidOffchainTxParams,
): Buffer {
  return Buffer.concat([
    IX_ATTEST_PREMIUM_PAID_OFFCHAIN,
    asPubkey(params.member).toBuffer(),
    Buffer.from(fromHex(params.seriesRefHashHex, 32)),
    encodeU64Le(params.periodIndex),
    Buffer.from(fromHex(params.replayHashHex, 32)),
    encodeU64Le(params.amount),
    encodeI64Le(asI64BigInt(params.paidAtTs)),
  ]);
}

function encodeSubmitCoverageClaimData(params: BuildSubmitCoverageClaimTxParams): Buffer {
  return Buffer.concat([
    IX_SUBMIT_COVERAGE_CLAIM,
    asPubkey(params.member).toBuffer(),
    Buffer.from(fromHex(params.seriesRefHashHex, 32)),
    Buffer.from(fromHex(params.intentHashHex, 32)),
    Buffer.from(fromHex(params.eventHashHex, 32)),
  ]);
}

function encodeReviewCoverageClaimData(params: BuildReviewCoverageClaimTxParams): Buffer {
  return Buffer.concat([
    IX_REVIEW_COVERAGE_CLAIM,
    encodeU64Le(params.requestedAmount),
    Buffer.from(fromHex(params.evidenceHashHex, 32)),
    Buffer.from(fromHex(params.interopRefHashHex, 32)),
    Buffer.from([params.claimFamily & 0xff]),
    optional32ByteHex(params.interopProfileHashHex),
    optional32ByteHex(params.codeSystemFamilyHashHex),
  ]);
}

function encodeAttachCoverageClaimDecisionSupportData(
  params: BuildAttachCoverageClaimDecisionSupportTxParams,
): Buffer {
  return Buffer.concat([
    IX_ATTACH_COVERAGE_CLAIM_DECISION_SUPPORT,
    optional32ByteHex(params.aiDecisionHashHex),
    optional32ByteHex(params.aiPolicyHashHex),
    optional32ByteHex(params.aiExecutionEnvironmentHashHex),
    optional32ByteHex(params.aiAttestationRefHashHex),
    Buffer.from([(params.aiRole ?? 0) & 0xff]),
    Buffer.from([(params.automationMode ?? 0) & 0xff]),
  ]);
}

function encodeApproveCoverageClaimData(params: BuildApproveCoverageClaimTxParams): Buffer {
  return Buffer.concat([
    IX_APPROVE_COVERAGE_CLAIM,
    encodeU64Le(params.approvedAmount),
    Buffer.from(fromHex(params.decisionReasonHashHex, 32)),
    optional32ByteHex(params.adjudicationRefHashHex),
  ]);
}

function encodeDenyCoverageClaimData(params: BuildDenyCoverageClaimTxParams): Buffer {
  return Buffer.concat([
    IX_DENY_COVERAGE_CLAIM,
    Buffer.from(fromHex(params.decisionReasonHashHex, 32)),
    optional32ByteHex(params.adjudicationRefHashHex),
  ]);
}

function encodePayCoverageClaimData(params: BuildPayCoverageClaimTxParams): Buffer {
  return Buffer.concat([IX_PAY_COVERAGE_CLAIM, encodeU64Le(params.payoutAmount)]);
}

function encodeClaimApprovedCoveragePayoutData(
  params: BuildClaimApprovedCoveragePayoutTxParams,
): Buffer {
  return Buffer.concat([
    IX_CLAIM_APPROVED_COVERAGE_PAYOUT,
    encodeU64Le(params.payoutAmount),
  ]);
}

function encodeCloseCoverageClaimData(params: BuildCloseCoverageClaimTxParams): Buffer {
  return Buffer.concat([IX_CLOSE_COVERAGE_CLAIM, encodeU64Le(params.recoveryAmount)]);
}

function encodeOpenCycleOutcomeDisputeData(
  params: BuildOpenCycleOutcomeDisputeTxParams,
): Buffer {
  return Buffer.concat([
    IX_OPEN_CYCLE_OUTCOME_DISPUTE,
    Buffer.from(fromHex(params.disputeReasonHashHex, 32)),
  ]);
}

function encodeResolveCycleOutcomeDisputeData(
  params: BuildResolveCycleOutcomeDisputeTxParams,
): Buffer {
  return Buffer.concat([
    IX_RESOLVE_CYCLE_OUTCOME_DISPUTE,
    Buffer.from([params.sustainOriginalOutcome ? 1 : 0]),
  ]);
}

function encodeSettleCoverageClaimData(params: BuildSettleCoverageClaimTxParams): Buffer {
  return Buffer.concat([
    IX_SETTLE_COVERAGE_CLAIM,
    encodeU64Le(params.payoutAmount),
  ]);
}

function buildActivateCycleWithQuoteSolTransaction(
  params: BuildActivateCycleWithQuoteSolTxParams,
): Transaction {
  const programId = asPubkey(params.programId);
  const payer = asPubkey(params.payer);
  const member = asPubkey(params.member ?? params.payer);
  const poolAddress = asPubkey(params.poolAddress);
  const oracle = asPubkey(params.oracle);
  const zeroPubkey = asPubkey(ZERO_PUBKEY);
  const instructionsSysvar = params.instructionsSysvar
    ? asPubkey(params.instructionsSysvar)
    : SYSVAR_INSTRUCTIONS_PUBKEY;
  const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
  const [config] = deriveConfigPda(programId);
  const [oracleEntry] = deriveOraclePda({ programId, oracle });
  const [poolOracle] = derivePoolOraclePda({ programId, poolAddress, oracle });
  const [poolOraclePermissions] = derivePoolOraclePermissionSetPda({
    programId,
    poolAddress,
    oracle,
  });
  const [oraclePolicy] = derivePoolOraclePolicyPda({
    programId,
    poolAddress,
  });
  const [membership] = deriveMembershipPda({ programId, poolAddress, member });
  const [coverageProduct] = derivePolicySeriesPda({
    programId,
    poolAddress,
    seriesRefHash,
  });
  const [coverageProductPaymentOption] = derivePolicySeriesPaymentOptionPda({
    programId,
    poolAddress,
    seriesRefHash,
    paymentMint: zeroPubkey,
  });
  const [coveragePolicy] = derivePolicyPositionPda({ programId, poolAddress, seriesRefHash, member });
  const [coveragePolicyNft] = derivePolicyPositionNftPda({ programId, poolAddress, seriesRefHash, member });
  const [premiumLedger] = derivePremiumLedgerPda({ programId, poolAddress, seriesRefHash, member });
  const [protocolFeeVault] = deriveProtocolFeeVaultPda({
    programId,
    paymentMint: zeroPubkey,
  });
  const [poolOracleFeeVault] = derivePoolOracleFeeVaultPda({
    programId,
    poolAddress,
    oracle,
    paymentMint: zeroPubkey,
  });
  const [poolTreasuryReserve] = derivePoolTreasuryReservePda({
    programId,
    poolAddress,
    paymentMint: zeroPubkey,
  });
  const [memberCycle] = deriveMemberCyclePda({
    programId,
    poolAddress,
    seriesRefHash,
    member,
    periodIndex: params.periodIndex,
  });
  const [cycleQuoteReplay] = deriveCycleQuoteReplayPda({
    programId,
    poolAddress,
    seriesRefHash,
    member,
    nonceHash: fromHex(params.nonceHashHex, 32),
  });
  const quoteVerificationInstruction = buildCycleQuoteVerificationInstruction(params);
  const instruction = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: config, isSigner: false, isWritable: false },
      { pubkey: poolAddress, isSigner: false, isWritable: true },
      { pubkey: member, isSigner: false, isWritable: false },
      { pubkey: oracle, isSigner: false, isWritable: false },
      { pubkey: oracleEntry, isSigner: false, isWritable: false },
      { pubkey: poolOracle, isSigner: false, isWritable: false },
      { pubkey: poolOraclePermissions, isSigner: false, isWritable: false },
      { pubkey: oraclePolicy, isSigner: false, isWritable: false },
      { pubkey: membership, isSigner: false, isWritable: true },
      { pubkey: coverageProduct, isSigner: false, isWritable: false },
      { pubkey: coverageProductPaymentOption, isSigner: false, isWritable: false },
      { pubkey: coveragePolicy, isSigner: false, isWritable: true },
      { pubkey: coveragePolicyNft, isSigner: false, isWritable: true },
      { pubkey: premiumLedger, isSigner: false, isWritable: true },
      { pubkey: protocolFeeVault, isSigner: false, isWritable: true },
      { pubkey: poolOracleFeeVault, isSigner: false, isWritable: true },
      { pubkey: poolTreasuryReserve, isSigner: false, isWritable: true },
      { pubkey: memberCycle, isSigner: false, isWritable: true },
      { pubkey: cycleQuoteReplay, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: instructionsSysvar, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([
      IX_ACTIVATE_CYCLE_WITH_QUOTE_SOL,
      Buffer.from(fromHex(params.seriesRefHashHex, 32)),
      encodeU64Le(params.periodIndex),
      Buffer.from(fromHex(params.nonceHashHex, 32)),
      encodeU64Le(params.premiumAmountRaw),
      encodeU64Le(params.canonicalPremiumAmount),
      Buffer.from([params.commitmentEnabled ? 1 : 0]),
      encodeU64Le(params.bondAmountRaw),
      encodeU64Le(params.shieldFeeRaw),
      encodeU64Le(params.protocolFeeRaw),
      encodeU64Le(params.oracleFeeRaw),
      encodeU64Le(params.netPoolPremiumRaw),
      encodeU64Le(params.totalAmountRaw),
      Buffer.from([params.includedShieldCount]),
      encodeU16Le(params.thresholdBps),
      encodeU16Le(params.outcomeThresholdScore),
      optional32ByteHex(params.cohortHashHex),
      encodeI64Le(params.expiresAtTs),
      Buffer.from(fromHex(params.quoteMetaHashHex, 32)),
    ]),
  });
  const transaction = new Transaction({
    feePayer: payer,
    recentBlockhash: params.recentBlockhash,
  });
  if (typeof params.computeUnitLimit === 'number') {
    transaction.add(
      ComputeBudgetProgram.setComputeUnitLimit({
        units: params.computeUnitLimit,
      }),
    );
  }
  return transaction.add(quoteVerificationInstruction, instruction);
}

function buildActivateCycleWithQuoteSplTransaction(
  params: BuildActivateCycleWithQuoteSplTxParams,
): Transaction {
  const programId = asPubkey(params.programId);
  const payer = asPubkey(params.payer);
  const member = asPubkey(params.member ?? params.payer);
  const poolAddress = asPubkey(params.poolAddress);
  const oracle = asPubkey(params.oracle);
  const paymentMint = asPubkey(params.paymentMint);
  const instructionsSysvar = params.instructionsSysvar
    ? asPubkey(params.instructionsSysvar)
    : SYSVAR_INSTRUCTIONS_PUBKEY;
  const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
  const [config] = deriveConfigPda(programId);
  const [oracleEntry] = deriveOraclePda({ programId, oracle });
  const [poolOracle] = derivePoolOraclePda({ programId, poolAddress, oracle });
  const [poolOraclePermissions] = derivePoolOraclePermissionSetPda({
    programId,
    poolAddress,
    oracle,
  });
  const [oraclePolicy] = derivePoolOraclePolicyPda({
    programId,
    poolAddress,
  });
  const [membership] = deriveMembershipPda({ programId, poolAddress, member });
  const [coverageProduct] = derivePolicySeriesPda({
    programId,
    poolAddress,
    seriesRefHash,
  });
  const [coverageProductPaymentOption] = derivePolicySeriesPaymentOptionPda({
    programId,
    poolAddress,
    seriesRefHash,
    paymentMint,
  });
  const [coveragePolicy] = derivePolicyPositionPda({ programId, poolAddress, seriesRefHash, member });
  const [coveragePolicyNft] = derivePolicyPositionNftPda({ programId, poolAddress, seriesRefHash, member });
  const [premiumLedger] = derivePremiumLedgerPda({ programId, poolAddress, seriesRefHash, member });
  const [poolAssetVault] = derivePoolAssetVaultPda({
    programId,
    poolAddress,
    payoutMint: paymentMint,
  });
  const poolVaultTokenAccount = deriveAssociatedTokenAddress({
    owner: poolAssetVault,
    mint: paymentMint,
  });
  const payerTokenAccount = params.payerTokenAccount
    ? asPubkey(params.payerTokenAccount)
    : deriveAssociatedTokenAddress({
        owner: payer,
        mint: paymentMint,
      });
  const [protocolFeeVault] = deriveProtocolFeeVaultPda({
    programId,
    paymentMint,
  });
  const protocolFeeVaultTokenAccount = deriveAssociatedTokenAddress({
    owner: protocolFeeVault,
    mint: paymentMint,
    allowOwnerOffCurve: true,
  });
  const [poolOracleFeeVault] = derivePoolOracleFeeVaultPda({
    programId,
    poolAddress,
    oracle,
    paymentMint,
  });
  const poolOracleFeeVaultTokenAccount = deriveAssociatedTokenAddress({
    owner: poolOracleFeeVault,
    mint: paymentMint,
    allowOwnerOffCurve: true,
  });
  const [poolTreasuryReserve] = derivePoolTreasuryReservePda({
    programId,
    poolAddress,
    paymentMint,
  });
  const [memberCycle] = deriveMemberCyclePda({
    programId,
    poolAddress,
    seriesRefHash,
    member,
    periodIndex: params.periodIndex,
  });
  const [cycleQuoteReplay] = deriveCycleQuoteReplayPda({
    programId,
    poolAddress,
    seriesRefHash,
    member,
    nonceHash: fromHex(params.nonceHashHex, 32),
  });
  const quoteVerificationInstruction = buildCycleQuoteVerificationInstruction(params);
  const instruction = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: config, isSigner: false, isWritable: false },
      { pubkey: poolAddress, isSigner: false, isWritable: false },
      { pubkey: member, isSigner: false, isWritable: false },
      { pubkey: oracle, isSigner: false, isWritable: false },
      { pubkey: oracleEntry, isSigner: false, isWritable: false },
      { pubkey: poolOracle, isSigner: false, isWritable: false },
      { pubkey: poolOraclePermissions, isSigner: false, isWritable: false },
      { pubkey: oraclePolicy, isSigner: false, isWritable: false },
      { pubkey: membership, isSigner: false, isWritable: true },
      { pubkey: coverageProduct, isSigner: false, isWritable: false },
      { pubkey: coverageProductPaymentOption, isSigner: false, isWritable: false },
      { pubkey: paymentMint, isSigner: false, isWritable: false },
      { pubkey: coveragePolicy, isSigner: false, isWritable: true },
      { pubkey: coveragePolicyNft, isSigner: false, isWritable: true },
      { pubkey: premiumLedger, isSigner: false, isWritable: true },
      { pubkey: poolAssetVault, isSigner: false, isWritable: true },
      { pubkey: poolVaultTokenAccount, isSigner: false, isWritable: true },
      { pubkey: payerTokenAccount, isSigner: false, isWritable: true },
      { pubkey: protocolFeeVault, isSigner: false, isWritable: true },
      { pubkey: protocolFeeVaultTokenAccount, isSigner: false, isWritable: true },
      { pubkey: poolOracleFeeVault, isSigner: false, isWritable: true },
      { pubkey: poolOracleFeeVaultTokenAccount, isSigner: false, isWritable: true },
      { pubkey: poolTreasuryReserve, isSigner: false, isWritable: true },
      { pubkey: memberCycle, isSigner: false, isWritable: true },
      { pubkey: cycleQuoteReplay, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: instructionsSysvar, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([
      IX_ACTIVATE_CYCLE_WITH_QUOTE_SPL,
      Buffer.from(fromHex(params.seriesRefHashHex, 32)),
      encodeU64Le(params.periodIndex),
      Buffer.from(fromHex(params.nonceHashHex, 32)),
      encodeU64Le(params.premiumAmountRaw),
      encodeU64Le(params.canonicalPremiumAmount),
      Buffer.from([params.commitmentEnabled ? 1 : 0]),
      encodeU64Le(params.bondAmountRaw),
      encodeU64Le(params.shieldFeeRaw),
      encodeU64Le(params.protocolFeeRaw),
      encodeU64Le(params.oracleFeeRaw),
      encodeU64Le(params.netPoolPremiumRaw),
      encodeU64Le(params.totalAmountRaw),
      Buffer.from([params.includedShieldCount]),
      encodeU16Le(params.thresholdBps),
      encodeU16Le(params.outcomeThresholdScore),
      optional32ByteHex(params.cohortHashHex),
      encodeI64Le(params.expiresAtTs),
      Buffer.from(fromHex(params.quoteMetaHashHex, 32)),
    ]),
  });
  const transaction = new Transaction({
    feePayer: payer,
    recentBlockhash: params.recentBlockhash,
  });
  const injectedComputeUnitLimit = params.quoteVerificationInstruction
    ? params.computeUnitLimit
    : (params.computeUnitLimit ?? 400_000);
  if (typeof injectedComputeUnitLimit === 'number') {
    transaction.add(
      ComputeBudgetProgram.setComputeUnitLimit({
        units: injectedComputeUnitLimit,
      }),
    );
  }
  return transaction.add(quoteVerificationInstruction, instruction);
}

function buildSettleCycleCommitmentTransaction(
  params: BuildSettleCycleCommitmentTxParams,
): Transaction {
  const programId = asPubkey(params.programId);
  const oracle = asPubkey(params.oracle);
  const member = asPubkey(params.member);
  const poolAddress = asPubkey(params.poolAddress);
  const paymentMint = asPubkey(params.paymentMint);
  const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
  const [config] = deriveConfigPda(programId);
  const [oracleEntry] = deriveOraclePda({ programId, oracle });
  const [poolOracle] = derivePoolOraclePda({ programId, poolAddress, oracle });
  const [poolOraclePermissions] = derivePoolOraclePermissionSetPda({
    programId,
    poolAddress,
    oracle,
  });
  const [poolAssetVault] = derivePoolAssetVaultPda({
    programId,
    poolAddress,
    payoutMint: paymentMint,
  });
  const poolVaultTokenAccount = deriveAssociatedTokenAddress({
    owner: poolAssetVault,
    mint: paymentMint,
  });
  const [poolTreasuryReserve] = derivePoolTreasuryReservePda({
    programId,
    poolAddress,
    paymentMint,
  });
  const [memberCycle] = deriveMemberCyclePda({
    programId,
    poolAddress,
    seriesRefHash,
    member,
    periodIndex: params.periodIndex,
  });
  const cohortHash =
    params.cohortHashHex != null
      ? fromHex(params.cohortHashHex, 32)
      : new Uint8Array(32);
  const [cohortSettlementRoot] = deriveCohortSettlementRootPda({
    programId,
    poolAddress,
    seriesRefHash,
    cohortHash,
  });
  const recipientTokenAccount = deriveAssociatedTokenAddress({
    owner: member,
    mint: paymentMint,
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
      { pubkey: recipientTokenAccount, isSigner: false, isWritable: true },
      { pubkey: memberCycle, isSigner: false, isWritable: true },
      { pubkey: cohortSettlementRoot, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([
      IX_SETTLE_CYCLE_COMMITMENT,
      Buffer.from(fromHex(params.seriesRefHashHex, 32)),
      encodeU64Le(params.periodIndex),
      Buffer.from([params.passed ? 1 : 0]),
      Buffer.from([params.shieldConsumed ? 1 : 0]),
      encodeU16Le(params.settledHealthAlphaScore),
    ]),
  });
  return new Transaction({
    feePayer: oracle,
    recentBlockhash: params.recentBlockhash,
  }).add(instruction);
}

function buildSettleCycleCommitmentSolTransaction(
  params: BuildSettleCycleCommitmentSolTxParams,
): Transaction {
  const programId = asPubkey(params.programId);
  const oracle = asPubkey(params.oracle);
  const member = asPubkey(params.member);
  const poolAddress = asPubkey(params.poolAddress);
  const zeroPubkey = asPubkey(ZERO_PUBKEY);
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
    paymentMint: zeroPubkey,
  });
  const [memberCycle] = deriveMemberCyclePda({
    programId,
    poolAddress,
    seriesRefHash,
    member,
    periodIndex: params.periodIndex,
  });
  const cohortHash =
    params.cohortHashHex != null
      ? fromHex(params.cohortHashHex, 32)
      : new Uint8Array(32);
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
      { pubkey: member, isSigner: false, isWritable: true },
      { pubkey: memberCycle, isSigner: false, isWritable: true },
      { pubkey: cohortSettlementRoot, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([
      IX_SETTLE_CYCLE_COMMITMENT_SOL,
      Buffer.from(fromHex(params.seriesRefHashHex, 32)),
      encodeU64Le(params.periodIndex),
      Buffer.from([params.passed ? 1 : 0]),
      Buffer.from([params.shieldConsumed ? 1 : 0]),
      encodeU16Le(params.settledHealthAlphaScore),
    ]),
  });
  return new Transaction({
    feePayer: oracle,
    recentBlockhash: params.recentBlockhash,
  }).add(instruction);
}

function buildFinalizeCohortSettlementRootTransaction(
  params: BuildFinalizeCohortSettlementRootTxParams,
): Transaction {
  const programId = asPubkey(params.programId);
  const oracle = asPubkey(params.oracle);
  const poolAddress = asPubkey(params.poolAddress);
  const payoutMint = asPubkey(params.payoutMint);
  const cohortHash = fromHex(params.cohortHashHex, 32);
  const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
  const [config] = deriveConfigPda(programId);
  const [oracleEntry] = deriveOraclePda({ programId, oracle });
  const [poolOracle] = derivePoolOraclePda({ programId, poolAddress, oracle });
  const [poolOraclePermissions] = derivePoolOraclePermissionSetPda({
    programId,
    poolAddress,
    oracle,
  });
  const [poolTerms] = derivePoolTermsPda({
    programId,
    poolAddress,
  });
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
      { pubkey: oracleEntry, isSigner: false, isWritable: false },
      { pubkey: poolOracle, isSigner: false, isWritable: false },
      { pubkey: poolOraclePermissions, isSigner: false, isWritable: false },
      { pubkey: poolTerms, isSigner: false, isWritable: false },
      {
        pubkey: derivePoolTreasuryReservePda({
          programId,
          poolAddress,
          paymentMint: payoutMint,
        })[0],
        isSigner: false,
        isWritable: true,
      },
      { pubkey: cohortSettlementRoot, isSigner: false, isWritable: true },
    ],
    data: Buffer.concat([
      IX_FINALIZE_COHORT_SETTLEMENT_ROOT,
      Buffer.from(seriesRefHash),
      Buffer.from(cohortHash),
    ]),
  });

  return new Transaction({
    feePayer: oracle,
    recentBlockhash: params.recentBlockhash,
  }).add(instruction);
}

function buildWithdrawPoolTreasurySplTransaction(
  params: BuildWithdrawPoolTreasurySplTxParams,
): Transaction {
  const programId = asPubkey(params.programId);
  const payer = asPubkey(params.payer);
  const oracle = asPubkey(params.oracle);
  const poolAddress = asPubkey(params.poolAddress);
  const paymentMint = asPubkey(params.paymentMint);
  const recipientTokenAccount = asPubkey(params.recipientTokenAccount);
  const [config] = deriveConfigPda(programId);
  const [oracleEntry] = deriveOraclePda({ programId, oracle });
  const [poolOracle] = derivePoolOraclePda({ programId, poolAddress, oracle });
  const [poolOraclePermissions] = derivePoolOraclePermissionSetPda({
    programId,
    poolAddress,
    oracle,
  });
  const [poolAssetVault] = derivePoolAssetVaultPda({
    programId,
    poolAddress,
    payoutMint: paymentMint,
  });
  const poolVaultTokenAccount = deriveAssociatedTokenAddress({
    owner: poolAssetVault,
    mint: paymentMint,
  });
  const [poolTreasuryReserve] = derivePoolTreasuryReservePda({
    programId,
    poolAddress,
    paymentMint,
  });
  const instruction = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: oracle, isSigner: true, isWritable: true },
      { pubkey: config, isSigner: false, isWritable: false },
      { pubkey: poolAddress, isSigner: false, isWritable: false },
      { pubkey: oracleEntry, isSigner: false, isWritable: false },
      { pubkey: poolOracle, isSigner: false, isWritable: false },
      { pubkey: poolOraclePermissions, isSigner: false, isWritable: false },
      { pubkey: paymentMint, isSigner: false, isWritable: true },
      { pubkey: poolTreasuryReserve, isSigner: false, isWritable: true },
      { pubkey: poolAssetVault, isSigner: false, isWritable: false },
      { pubkey: poolVaultTokenAccount, isSigner: false, isWritable: true },
      { pubkey: recipientTokenAccount, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([IX_WITHDRAW_POOL_TREASURY_SPL, encodeU64Le(params.amount)]),
  });
  return new Transaction({
    feePayer: payer,
    recentBlockhash: params.recentBlockhash,
  }).add(instruction);
}

function buildWithdrawPoolTreasurySolTransaction(
  params: BuildWithdrawPoolTreasurySolTxParams,
): Transaction {
  const programId = asPubkey(params.programId);
  const payer = asPubkey(params.payer);
  const oracle = asPubkey(params.oracle);
  const poolAddress = asPubkey(params.poolAddress);
  const recipientSystemAccount = asPubkey(params.recipientSystemAccount);
  const zeroPubkey = asPubkey(ZERO_PUBKEY);
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
    paymentMint: zeroPubkey,
  });
  const instruction = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: oracle, isSigner: true, isWritable: true },
      { pubkey: config, isSigner: false, isWritable: false },
      { pubkey: poolAddress, isSigner: false, isWritable: true },
      { pubkey: oracleEntry, isSigner: false, isWritable: false },
      { pubkey: poolOracle, isSigner: false, isWritable: false },
      { pubkey: poolOraclePermissions, isSigner: false, isWritable: false },
      { pubkey: poolTreasuryReserve, isSigner: false, isWritable: true },
      { pubkey: recipientSystemAccount, isSigner: false, isWritable: true },
    ],
    data: Buffer.concat([IX_WITHDRAW_POOL_TREASURY_SOL, encodeU64Le(params.amount)]),
  });
  return new Transaction({
    feePayer: payer,
    recentBlockhash: params.recentBlockhash,
  }).add(instruction);
}

function buildWithdrawProtocolFeeSplTransaction(
  params: BuildWithdrawProtocolFeeSplTxParams,
): Transaction {
  const programId = asPubkey(params.programId);
  const governanceAuthority = asPubkey(params.governanceAuthority);
  const paymentMint = asPubkey(params.paymentMint);
  const recipientTokenAccount = asPubkey(params.recipientTokenAccount);
  const [config] = deriveConfigPda(programId);
  const [protocolFeeVault] = deriveProtocolFeeVaultPda({
    programId,
    paymentMint,
  });
  const protocolFeeVaultTokenAccount = deriveAssociatedTokenAddress({
    owner: protocolFeeVault,
    mint: paymentMint,
    allowOwnerOffCurve: true,
  });
  const instruction = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: governanceAuthority, isSigner: true, isWritable: true },
      { pubkey: config, isSigner: false, isWritable: false },
      { pubkey: paymentMint, isSigner: false, isWritable: true },
      { pubkey: protocolFeeVault, isSigner: false, isWritable: true },
      { pubkey: protocolFeeVaultTokenAccount, isSigner: false, isWritable: true },
      { pubkey: recipientTokenAccount, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: encodeWithdrawProtocolFeeSplData(params),
  });
  return new Transaction({
    feePayer: governanceAuthority,
    recentBlockhash: params.recentBlockhash,
  }).add(instruction);
}

function buildWithdrawProtocolFeeSolTransaction(
  params: BuildWithdrawProtocolFeeSolTxParams,
): Transaction {
  const programId = asPubkey(params.programId);
  const governanceAuthority = asPubkey(params.governanceAuthority);
  const recipientSystemAccount = asPubkey(params.recipientSystemAccount);
  const zeroPubkey = asPubkey(ZERO_PUBKEY);
  const [config] = deriveConfigPda(programId);
  const [protocolFeeVault] = deriveProtocolFeeVaultPda({
    programId,
    paymentMint: zeroPubkey,
  });
  const instruction = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: governanceAuthority, isSigner: true, isWritable: true },
      { pubkey: config, isSigner: false, isWritable: false },
      { pubkey: protocolFeeVault, isSigner: false, isWritable: true },
      { pubkey: recipientSystemAccount, isSigner: false, isWritable: true },
    ],
    data: encodeWithdrawProtocolFeeSolData(params),
  });
  return new Transaction({
    feePayer: governanceAuthority,
    recentBlockhash: params.recentBlockhash,
  }).add(instruction);
}

function buildWithdrawPoolOracleFeeSplTransaction(
  params: BuildWithdrawPoolOracleFeeSplTxParams,
): Transaction {
  const programId = asPubkey(params.programId);
  const oracle = asPubkey(params.oracle);
  const poolAddress = asPubkey(params.poolAddress);
  const paymentMint = asPubkey(params.paymentMint);
  const recipientTokenAccount = asPubkey(params.recipientTokenAccount);
  const [config] = deriveConfigPda(programId);
  const [oracleEntry] = deriveOraclePda({ programId, oracle });
  const [poolOraclePermissions] = derivePoolOraclePermissionSetPda({
    programId,
    poolAddress,
    oracle,
  });
  const [poolOracleFeeVault] = derivePoolOracleFeeVaultPda({
    programId,
    poolAddress,
    oracle,
    paymentMint,
  });
  const poolOracleFeeVaultTokenAccount = deriveAssociatedTokenAddress({
    owner: poolOracleFeeVault,
    mint: paymentMint,
    allowOwnerOffCurve: true,
  });
  const instruction = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: oracle, isSigner: true, isWritable: true },
      { pubkey: config, isSigner: false, isWritable: false },
      { pubkey: poolAddress, isSigner: false, isWritable: false },
      { pubkey: oracleEntry, isSigner: false, isWritable: false },
      { pubkey: poolOraclePermissions, isSigner: false, isWritable: false },
      { pubkey: paymentMint, isSigner: false, isWritable: true },
      { pubkey: poolOracleFeeVault, isSigner: false, isWritable: true },
      { pubkey: poolOracleFeeVaultTokenAccount, isSigner: false, isWritable: true },
      { pubkey: recipientTokenAccount, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: encodeWithdrawPoolOracleFeeSplData(params),
  });
  return new Transaction({
    feePayer: oracle,
    recentBlockhash: params.recentBlockhash,
  }).add(instruction);
}

function buildWithdrawPoolOracleFeeSolTransaction(
  params: BuildWithdrawPoolOracleFeeSolTxParams,
): Transaction {
  const programId = asPubkey(params.programId);
  const oracle = asPubkey(params.oracle);
  const poolAddress = asPubkey(params.poolAddress);
  const recipientSystemAccount = asPubkey(params.recipientSystemAccount);
  const zeroPubkey = asPubkey(ZERO_PUBKEY);
  const [config] = deriveConfigPda(programId);
  const [oracleEntry] = deriveOraclePda({ programId, oracle });
  const [poolOraclePermissions] = derivePoolOraclePermissionSetPda({
    programId,
    poolAddress,
    oracle,
  });
  const [poolOracleFeeVault] = derivePoolOracleFeeVaultPda({
    programId,
    poolAddress,
    oracle,
    paymentMint: zeroPubkey,
  });
  const instruction = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: oracle, isSigner: true, isWritable: true },
      { pubkey: config, isSigner: false, isWritable: false },
      { pubkey: poolAddress, isSigner: false, isWritable: false },
      { pubkey: oracleEntry, isSigner: false, isWritable: false },
      { pubkey: poolOraclePermissions, isSigner: false, isWritable: false },
      { pubkey: poolOracleFeeVault, isSigner: false, isWritable: true },
      { pubkey: recipientSystemAccount, isSigner: false, isWritable: true },
    ],
    data: encodeWithdrawPoolOracleFeeSolData(params),
  });
  return new Transaction({
    feePayer: oracle,
    recentBlockhash: params.recentBlockhash,
  }).add(instruction);
}

export function createProtocolClient(connection: Connection, programIdInput: string): ProtocolClient {
  const programId = new PublicKey(programIdInput);

  return {
    connection,
    programId,

    buildSubmitOutcomeAttestationVoteTx(
      params: BuildSubmitOutcomeAttestationVoteTxParams,
    ): Transaction {
      const oracle = new PublicKey(params.oracle);
      const poolAddress = new PublicKey(params.poolAddress);
      const member = new PublicKey(params.member);
      const payoutMint = new PublicKey(params.payoutMint);
      const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
      const cycleHash = fromHex(params.cycleHashHex, 32);
      const ruleHash = fromHex(params.ruleHashHex, 32);
      const schemaKeyHash = fromHex(params.schemaKeyHashHex, 32);

      const [oracleEntryPda] = deriveOraclePda({
        programId,
        oracle,
      });
      const [configPda] = deriveConfigPda(programId);
      const [stakePositionPda] = deriveOracleStakePda({
        programId,
        oracle,
        staker: oracle,
      });
      const [poolOraclePolicyPda] = derivePoolOraclePolicyPda({
        programId,
        poolAddress,
      });
      const [poolTermsPda] = derivePoolTermsPda({
        programId,
        poolAddress,
      });
      const [poolTreasuryReservePda] = derivePoolTreasuryReservePda({
        programId,
        poolAddress,
        paymentMint: payoutMint,
      });
      const [poolOraclePda] = derivePoolOraclePda({
        programId,
        poolAddress,
        oracle,
      });
      const [poolOraclePermissionsPda] = derivePoolOraclePermissionSetPda({
        programId,
        poolAddress,
        oracle,
      });
      const [membershipPda] = deriveMembershipPda({
        programId,
        poolAddress,
        member,
      });
      const [poolRulePda] = derivePoolRulePda({
        programId,
        poolAddress,
        seriesRefHash,
        ruleHash,
      });
      const [schemaPda] = deriveSchemaPda({
        programId,
        schemaKeyHash,
      });
      const [votePda] = deriveAttestationVotePda({
        programId,
        poolAddress,
        seriesRefHash,
        member,
        cycleHash,
        ruleHash,
        oracle,
      });
      const [aggregatePda] = deriveOutcomeAggregatePda({
        programId,
        poolAddress,
        seriesRefHash,
        member,
        cycleHash,
        ruleHash,
      });
      const [poolAutomationPolicyPda] = derivePoolAutomationPolicyPda({
        programId,
        poolAddress,
      });
      const keys = [
        { pubkey: oracle, isSigner: true, isWritable: true },
        { pubkey: oracleEntryPda, isSigner: false, isWritable: false },
        { pubkey: configPda, isSigner: false, isWritable: false },
        { pubkey: stakePositionPda, isSigner: false, isWritable: false },
        { pubkey: poolAddress, isSigner: false, isWritable: false },
        { pubkey: poolTermsPda, isSigner: false, isWritable: false },
        { pubkey: poolOraclePolicyPda, isSigner: false, isWritable: false },
        { pubkey: poolTreasuryReservePda, isSigner: false, isWritable: true },
        { pubkey: poolOraclePda, isSigner: false, isWritable: false },
        { pubkey: poolOraclePermissionsPda, isSigner: false, isWritable: false },
        { pubkey: membershipPda, isSigner: false, isWritable: false },
        { pubkey: poolRulePda, isSigner: false, isWritable: false },
        { pubkey: schemaPda, isSigner: false, isWritable: false },
        { pubkey: votePda, isSigner: false, isWritable: true },
        { pubkey: aggregatePda, isSigner: false, isWritable: true },
      ];
      keys.push({
        pubkey: params.includePoolAutomationPolicy ? poolAutomationPolicyPda : programId,
        isSigner: false,
        isWritable: false,
      });
      keys.push({ pubkey: SystemProgram.programId, isSigner: false, isWritable: false });

      const instruction = new TransactionInstruction({
        programId,
        keys,
        data: encodeSubmitOutcomeAttestationVoteData(params),
      });

      return new Transaction({
        feePayer: oracle,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildFinalizeCycleOutcomeTx(params: BuildFinalizeCycleOutcomeTxParams): Transaction {
      const feePayer = new PublicKey(params.feePayer);
      const poolAddress = new PublicKey(params.poolAddress);
      const member = new PublicKey(params.member);
      const payoutMint = new PublicKey(params.payoutMint);
      const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
      const cycleHash = fromHex(params.cycleHashHex, 32);
      const ruleHash = fromHex(params.ruleHashHex, 32);
      const [poolTermsPda] = derivePoolTermsPda({
        programId,
        poolAddress,
      });
      const [oraclePolicyPda] = derivePoolOraclePolicyPda({
        programId,
        poolAddress,
      });
      const [poolTreasuryReservePda] = derivePoolTreasuryReservePda({
        programId,
        poolAddress,
        paymentMint: payoutMint,
      });

      const [aggregatePda] = deriveOutcomeAggregatePda({
        programId,
        poolAddress,
        seriesRefHash,
        member,
        cycleHash,
        ruleHash,
      });

      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: feePayer, isSigner: true, isWritable: true },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: poolTermsPda, isSigner: false, isWritable: false },
          { pubkey: oraclePolicyPda, isSigner: false, isWritable: false },
          { pubkey: poolTreasuryReservePda, isSigner: false, isWritable: true },
          { pubkey: aggregatePda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: IX_FINALIZE_CYCLE_OUTCOME,
      });

      return new Transaction({
        feePayer: feePayer,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildOpenCycleOutcomeDisputeTx(
      params: BuildOpenCycleOutcomeDisputeTxParams,
    ): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const aggregate = new PublicKey(params.aggregate);
      const [configPda] = deriveConfigPda(programId);
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: aggregate, isSigner: false, isWritable: true },
        ],
        data: encodeOpenCycleOutcomeDisputeData(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildResolveCycleOutcomeDisputeTx(
      params: BuildResolveCycleOutcomeDisputeTxParams,
    ): Transaction {
      const governanceAuthority = new PublicKey(params.governanceAuthority);
      const poolAddress = new PublicKey(params.poolAddress);
      const payoutMint = new PublicKey(params.payoutMint);
      const aggregate = new PublicKey(params.aggregate);
      const [configPda] = deriveConfigPda(programId);
      const [poolTermsPda] = derivePoolTermsPda({ programId, poolAddress });
      const [poolTreasuryReservePda] = derivePoolTreasuryReservePda({
        programId,
        poolAddress,
        paymentMint: payoutMint,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: governanceAuthority, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: poolTermsPda, isSigner: false, isWritable: true },
          { pubkey: poolTreasuryReservePda, isSigner: false, isWritable: true },
          { pubkey: aggregate, isSigner: false, isWritable: true },
        ],
        data: encodeResolveCycleOutcomeDisputeData(params),
      });

      return new Transaction({
        feePayer: governanceAuthority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildInitializeProtocolTx(params: BuildInitializeProtocolTxParams): Transaction {
      const admin = new PublicKey(params.admin);
      const [configPda] = deriveConfigPda(programId);
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: admin, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeInitializeProtocolData(params),
      });

      return new Transaction({
        feePayer: admin,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildSetProtocolParamsTx(params: BuildSetProtocolParamsTxParams): Transaction {
      const governanceAuthority = new PublicKey(params.governanceAuthority);
      const [configPda] = deriveConfigPda(programId);
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: governanceAuthority, isSigner: true, isWritable: false },
          { pubkey: configPda, isSigner: false, isWritable: true },
        ],
        data: encodeSetProtocolParamsData(params),
      });

      return new Transaction({
        feePayer: governanceAuthority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildRotateGovernanceAuthorityTx(
      params: BuildRotateGovernanceAuthorityTxParams,
    ): Transaction {
      const governanceAuthority = new PublicKey(params.governanceAuthority);
      const [configPda] = deriveConfigPda(programId);
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: governanceAuthority, isSigner: true, isWritable: false },
          { pubkey: configPda, isSigner: false, isWritable: true },
        ],
        data: encodeRotateGovernanceAuthorityData(params),
      });

      return new Transaction({
        feePayer: governanceAuthority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildRegisterOracleTx(params: BuildRegisterOracleTxParams): Transaction {
      const admin = new PublicKey(params.admin);
      const oraclePubkey = new PublicKey(params.oraclePubkey);
      const [oracleEntryPda] = deriveOraclePda({
        programId,
        oracle: oraclePubkey,
      });
      const [oracleProfilePda] = deriveOracleProfilePda({
        programId,
        oracle: oraclePubkey,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: admin, isSigner: true, isWritable: true },
          { pubkey: oracleEntryPda, isSigner: false, isWritable: true },
          { pubkey: oracleProfilePda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeRegisterOracleData(params),
      });

      return new Transaction({
        feePayer: admin,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildClaimOracleTx(params: BuildClaimOracleTxParams): Transaction {
      const oracle = new PublicKey(params.oracle);
      const [oracleEntryPda] = deriveOraclePda({
        programId,
        oracle,
      });
      const [oracleProfilePda] = deriveOracleProfilePda({
        programId,
        oracle,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: oracle, isSigner: true, isWritable: false },
          { pubkey: oracleEntryPda, isSigner: false, isWritable: true },
          { pubkey: oracleProfilePda, isSigner: false, isWritable: true },
        ],
        data: IX_CLAIM_ORACLE,
      });

      return new Transaction({
        feePayer: oracle,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildUpdateOracleProfileTx(params: BuildUpdateOracleProfileTxParams): Transaction {
      const authority = new PublicKey(params.authority);
      const [oracleProfilePda] = deriveOracleProfilePda({
        programId,
        oracle: params.oracle,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: false },
          { pubkey: oracleProfilePda, isSigner: false, isWritable: true },
        ],
        data: encodeUpdateOracleProfileData(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildUpdateOracleMetadataTx(params: BuildUpdateOracleMetadataTxParams): Transaction {
      const oracle = new PublicKey(params.oracle);
      const [oracleEntryPda] = deriveOraclePda({
        programId,
        oracle,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: oracle, isSigner: true, isWritable: false },
          { pubkey: oracleEntryPda, isSigner: false, isWritable: true },
        ],
        data: encodeUpdateOracleMetadataData(params),
      });

      return new Transaction({
        feePayer: oracle,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildStakeOracleTx(params: BuildStakeOracleTxParams): Transaction {
      const staker = new PublicKey(params.staker);
      const oracle = new PublicKey(params.oracle);
      const [configPda] = deriveConfigPda(programId);
      const [oracleEntryPda] = deriveOraclePda({
        programId,
        oracle,
      });
      const [stakePositionPda] = deriveOracleStakePda({
        programId,
        oracle,
        staker,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: staker, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: oracleEntryPda, isSigner: false, isWritable: false },
          { pubkey: stakePositionPda, isSigner: false, isWritable: true },
          { pubkey: new PublicKey(params.stakeMint), isSigner: false, isWritable: true },
          { pubkey: new PublicKey(params.stakeVault), isSigner: true, isWritable: true },
          { pubkey: new PublicKey(params.stakerTokenAccount), isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeStakeOracleData(params),
      });

      return new Transaction({
        feePayer: staker,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildRequestUnstakeTx(params: BuildRequestUnstakeTxParams): Transaction {
      const staker = new PublicKey(params.staker);
      const oracle = new PublicKey(params.oracle);
      const [stakePositionPda] = deriveOracleStakePda({
        programId,
        oracle,
        staker,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: staker, isSigner: true, isWritable: false },
          { pubkey: stakePositionPda, isSigner: false, isWritable: true },
        ],
        data: encodeRequestUnstakeData(params),
      });

      return new Transaction({
        feePayer: staker,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildFinalizeUnstakeTx(params: BuildFinalizeUnstakeTxParams): Transaction {
      const staker = new PublicKey(params.staker);
      const oracle = new PublicKey(params.oracle);
      const [stakePositionPda] = deriveOracleStakePda({
        programId,
        oracle,
        staker,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: staker, isSigner: true, isWritable: false },
          { pubkey: stakePositionPda, isSigner: false, isWritable: true },
          { pubkey: new PublicKey(params.stakeVault), isSigner: false, isWritable: true },
          { pubkey: new PublicKey(params.destinationTokenAccount), isSigner: false, isWritable: true },
          { pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false },
        ],
        data: IX_FINALIZE_UNSTAKE,
      });

      return new Transaction({
        feePayer: staker,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildSlashOracleTx(params: BuildSlashOracleTxParams): Transaction {
      const governanceAuthority = new PublicKey(params.governanceAuthority);
      const oracle = new PublicKey(params.oracle);
      const staker = new PublicKey(params.staker);
      const [configPda] = deriveConfigPda(programId);
      const [stakePositionPda] = deriveOracleStakePda({
        programId,
        oracle,
        staker,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: governanceAuthority, isSigner: true, isWritable: false },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: stakePositionPda, isSigner: false, isWritable: true },
          { pubkey: new PublicKey(params.stakeVault), isSigner: false, isWritable: true },
          { pubkey: new PublicKey(params.slashTreasuryTokenAccount), isSigner: false, isWritable: true },
          { pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false },
        ],
        data: encodeSlashOracleData(params),
      });

      return new Transaction({
        feePayer: governanceAuthority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildCreatePoolTx(params: BuildCreatePoolTxParams): Transaction {
      const authority = new PublicKey(params.authority);
      const [configPda] = deriveConfigPda(programId);
      const [poolAddress] = derivePoolPda({
        programId,
        authority,
        poolId: params.poolId,
      });
      const [poolTermsPda] = derivePoolTermsPda({
        programId,
        poolAddress,
      });
      const [oraclePolicyPda] = derivePoolOraclePolicyPda({
        programId,
        poolAddress,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: true },
          { pubkey: poolTermsPda, isSigner: false, isWritable: true },
          { pubkey: oraclePolicyPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeCreatePoolData(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildSetPoolStatusTx(params: BuildSetPoolStatusTxParams): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: true },
        ],
        data: encodeSetPoolStatusData(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildSetPoolOracleTx(params: BuildSetPoolOracleTxParams): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const oracle = new PublicKey(params.oracle);
      const [oracleEntryPda] = deriveOraclePda({
        programId,
        oracle,
      });
      const [poolOraclePda] = derivePoolOraclePda({
        programId,
        poolAddress,
        oracle,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: true },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: oracleEntryPda, isSigner: false, isWritable: false },
          { pubkey: poolOraclePda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeSetPoolOracleData(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildSetPoolOraclePolicyTx(params: BuildSetPoolOraclePolicyTxParams): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const [configPda] = deriveConfigPda(programId);
      const [oraclePolicyPda] = derivePoolOraclePolicyPda({
        programId,
        poolAddress,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: false },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: oraclePolicyPda, isSigner: false, isWritable: true },
        ],
        data: encodeSetPoolOraclePolicyData(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildSetPoolRiskControlsTx(params: BuildSetPoolRiskControlsTxParams): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const payoutMint = new PublicKey(params.payoutMint);
      const [configPda] = deriveConfigPda(programId);
      const [poolTermsPda] = derivePoolTermsPda({ programId, poolAddress });
      const [poolRiskConfigPda] = derivePoolRiskConfigPda({ programId, poolAddress });
      const [poolTreasuryReservePda] = derivePoolTreasuryReservePda({
        programId,
        poolAddress,
        paymentMint: payoutMint,
      });
      const [poolControlAuthorityPda] = derivePoolControlAuthorityPda({ programId, poolAddress });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: poolTermsPda, isSigner: false, isWritable: false },
          { pubkey: poolRiskConfigPda, isSigner: false, isWritable: true },
          { pubkey: poolTreasuryReservePda, isSigner: false, isWritable: true },
          {
            pubkey: params.includePoolControlAuthority ? poolControlAuthorityPda : programId,
            isSigner: false,
            isWritable: false,
          },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeSetPoolRiskControlsData(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildSetPoolCompliancePolicyTx(params: BuildSetPoolCompliancePolicyTxParams): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const [configPda] = deriveConfigPda(programId);
      const [poolCompliancePolicyPda] = derivePoolCompliancePolicyPda({ programId, poolAddress });
      const [poolControlAuthorityPda] = derivePoolControlAuthorityPda({ programId, poolAddress });
      const keys = [
        { pubkey: authority, isSigner: true, isWritable: true },
        { pubkey: configPda, isSigner: false, isWritable: false },
        { pubkey: poolAddress, isSigner: false, isWritable: false },
        { pubkey: poolCompliancePolicyPda, isSigner: false, isWritable: true },
        {
          pubkey: params.includePoolControlAuthority ? poolControlAuthorityPda : programId,
          isSigner: false,
          isWritable: false,
        },
      ];
      keys.push({ pubkey: SystemProgram.programId, isSigner: false, isWritable: false });
      const instruction = new TransactionInstruction({
        programId,
        keys,
        data: encodeSetPoolCompliancePolicyData(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildSetPoolControlAuthoritiesTx(
      params: BuildSetPoolControlAuthoritiesTxParams,
    ): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const [configPda] = deriveConfigPda(programId);
      const [poolControlAuthorityPda] = derivePoolControlAuthorityPda({ programId, poolAddress });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: poolControlAuthorityPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeSetPoolControlAuthoritiesData(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildSetPoolAutomationPolicyTx(
      params: BuildSetPoolAutomationPolicyTxParams,
    ): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const [configPda] = deriveConfigPda(programId);
      const [poolAutomationPolicyPda] = derivePoolAutomationPolicyPda({ programId, poolAddress });
      const [poolControlAuthorityPda] = derivePoolControlAuthorityPda({ programId, poolAddress });
      const keys = [
        { pubkey: authority, isSigner: true, isWritable: true },
        { pubkey: configPda, isSigner: false, isWritable: false },
        { pubkey: poolAddress, isSigner: false, isWritable: false },
        { pubkey: poolAutomationPolicyPda, isSigner: false, isWritable: true },
        {
          pubkey: params.includePoolControlAuthority ? poolControlAuthorityPda : programId,
          isSigner: false,
          isWritable: false,
        },
      ];
      keys.push({ pubkey: SystemProgram.programId, isSigner: false, isWritable: false });
      const instruction = new TransactionInstruction({
        programId,
        keys,
        data: encodeSetPoolAutomationPolicyData(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildSetPoolOraclePermissionsTx(
      params: BuildSetPoolOraclePermissionsTxParams,
    ): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const oracle = new PublicKey(params.oracle);
      const [oracleEntryPda] = deriveOraclePda({
        programId,
        oracle,
      });
      const [poolOraclePda] = derivePoolOraclePda({
        programId,
        poolAddress,
        oracle,
      });
      const [poolOraclePermissionsPda] = derivePoolOraclePermissionSetPda({
        programId,
        poolAddress,
        oracle,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: true },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: oracle, isSigner: false, isWritable: false },
          { pubkey: oracleEntryPda, isSigner: false, isWritable: false },
          { pubkey: poolOraclePda, isSigner: false, isWritable: false },
          { pubkey: poolOraclePermissionsPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeSetPoolOraclePermissionsData(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildSetPoolCoverageReserveFloorTx(
      params: BuildSetPoolCoverageReserveFloorTxParams,
    ): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const paymentMint = new PublicKey(params.paymentMint);
      const [configPda] = deriveConfigPda(programId);
      const [poolTreasuryReservePda] = derivePoolTreasuryReservePda({
        programId,
        poolAddress,
        paymentMint,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: poolTreasuryReservePda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeSetPoolCoverageReserveFloorData(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildSetPoolTermsHashTx(params: BuildSetPoolTermsHashTxParams): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const [poolTermsPda] = derivePoolTermsPda({
        programId,
        poolAddress,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: poolTermsPda, isSigner: false, isWritable: true },
        ],
        data: encodeSetPoolTermsHashData(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildRegisterOutcomeSchemaTx(params: BuildRegisterOutcomeSchemaTxParams): Transaction {
      const publisher = new PublicKey(params.publisher);
      const schemaKeyHash = fromHex(params.schemaKeyHashHex, 32);
      const [schemaPda] = deriveSchemaPda({
        programId,
        schemaKeyHash,
      });
      const [schemaDependencyPda] = deriveSchemaDependencyPda({
        programId,
        schemaKeyHash,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: publisher, isSigner: true, isWritable: true },
          { pubkey: schemaPda, isSigner: false, isWritable: true },
          { pubkey: schemaDependencyPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeRegisterOutcomeSchemaData(params),
      });

      return new Transaction({
        feePayer: publisher,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildVerifyOutcomeSchemaTx(params: BuildVerifyOutcomeSchemaTxParams): Transaction {
      const governanceAuthority = new PublicKey(params.governanceAuthority);
      const schemaKeyHash = fromHex(params.schemaKeyHashHex, 32);
      const [configPda] = deriveConfigPda(programId);
      const [schemaPda] = deriveSchemaPda({
        programId,
        schemaKeyHash,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: governanceAuthority, isSigner: true, isWritable: false },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: schemaPda, isSigner: false, isWritable: true },
        ],
        data: encodeVerifyOutcomeSchemaData(params),
      });

      return new Transaction({
        feePayer: governanceAuthority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildBackfillSchemaDependencyLedgerTx(
      params: BuildBackfillSchemaDependencyLedgerTxParams,
    ): Transaction {
      const governanceAuthority = new PublicKey(params.governanceAuthority);
      const schemaKeyHash = fromHex(params.schemaKeyHashHex, 32);
      const [configPda] = deriveConfigPda(programId);
      const [schemaPda] = deriveSchemaPda({
        programId,
        schemaKeyHash,
      });
      const [schemaDependencyPda] = deriveSchemaDependencyPda({
        programId,
        schemaKeyHash,
      });
      const remainingAccounts = (params.poolRuleAddresses ?? []).map((address) => ({
        pubkey: new PublicKey(address),
        isSigner: false,
        isWritable: false,
      }));
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: governanceAuthority, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: schemaPda, isSigner: false, isWritable: false },
          { pubkey: schemaDependencyPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          ...remainingAccounts,
        ],
        data: encodeBackfillSchemaDependencyLedgerData(params),
      });

      return new Transaction({
        feePayer: governanceAuthority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildCloseOutcomeSchemaTx(params: BuildCloseOutcomeSchemaTxParams): Transaction {
      const governanceAuthority = new PublicKey(params.governanceAuthority);
      const recipientSystemAccount = new PublicKey(params.recipientSystemAccount);
      const schemaKeyHash = fromHex(params.schemaKeyHashHex, 32);
      const [configPda] = deriveConfigPda(programId);
      const [schemaPda] = deriveSchemaPda({ programId, schemaKeyHash });
      const [schemaDependencyPda] = deriveSchemaDependencyPda({ programId, schemaKeyHash });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: governanceAuthority, isSigner: true, isWritable: false },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: schemaPda, isSigner: false, isWritable: true },
          { pubkey: schemaDependencyPda, isSigner: false, isWritable: true },
          { pubkey: recipientSystemAccount, isSigner: false, isWritable: true },
        ],
        data: encodeCloseOutcomeSchemaData(),
      });

      return new Transaction({
        feePayer: governanceAuthority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildSetPolicySeriesOutcomeRuleTx(params: BuildSetPoolOutcomeRuleTxParams): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
      const ruleHash = fromHex(params.ruleHashHex, 32);
      const schemaKeyHash = fromHex(params.schemaKeyHashHex, 32);
      const [schemaPda] = deriveSchemaPda({
        programId,
        schemaKeyHash,
      });
      const [schemaDependencyPda] = deriveSchemaDependencyPda({
        programId,
        schemaKeyHash,
      });
      const [coverageProductPda] = derivePolicySeriesPda({
        programId,
        poolAddress,
        seriesRefHash,
      });
      const [poolRulePda] = derivePoolRulePda({
        programId,
        poolAddress,
        seriesRefHash,
        ruleHash,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: true },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: coverageProductPda, isSigner: false, isWritable: false },
          { pubkey: schemaPda, isSigner: false, isWritable: false },
          { pubkey: schemaDependencyPda, isSigner: false, isWritable: true },
          { pubkey: poolRulePda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeSetPoolOutcomeRuleData(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildRegisterInviteIssuerTx(params: BuildRegisterInviteIssuerTxParams): Transaction {
      const issuer = new PublicKey(params.issuer);
      const [inviteIssuerPda] = deriveInviteIssuerPda({
        programId,
        issuer,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: issuer, isSigner: true, isWritable: true },
          { pubkey: inviteIssuerPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeRegisterInviteIssuerData(params),
      });

      return new Transaction({
        feePayer: issuer,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildEnrollMemberOpenTx(params: BuildEnrollMemberOpenTxParams): Transaction {
      const member = new PublicKey(params.member);
      const poolAddress = new PublicKey(params.poolAddress);
      const [membershipPda] = deriveMembershipPda({
        programId,
        poolAddress,
        member,
      });
      const keys = [
        { pubkey: member, isSigner: true, isWritable: true },
        { pubkey: poolAddress, isSigner: false, isWritable: false },
        { pubkey: membershipPda, isSigner: false, isWritable: true },
      ];
      const [poolCompliancePolicyPda] = derivePoolCompliancePolicyPda({ programId, poolAddress });
      keys.push({
        pubkey: params.includePoolCompliancePolicy ? poolCompliancePolicyPda : programId,
        isSigner: false,
        isWritable: false,
      });
      keys.push({ pubkey: SystemProgram.programId, isSigner: false, isWritable: false });
      const instruction = new TransactionInstruction({
        programId,
        keys,
        data: encodeEnrollMemberOpenData(params),
      });

      return new Transaction({
        feePayer: member,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildEnrollMemberTokenGateTx(params: BuildEnrollMemberTokenGateTxParams): Transaction {
      const member = new PublicKey(params.member);
      const poolAddress = new PublicKey(params.poolAddress);
      const [membershipPda] = deriveMembershipPda({
        programId,
        poolAddress,
        member,
      });
      const keys = [
        { pubkey: member, isSigner: true, isWritable: true },
        { pubkey: poolAddress, isSigner: false, isWritable: false },
        { pubkey: membershipPda, isSigner: false, isWritable: true },
        { pubkey: new PublicKey(params.tokenGateAccount), isSigner: false, isWritable: false },
      ];
      const [poolCompliancePolicyPda] = derivePoolCompliancePolicyPda({ programId, poolAddress });
      keys.push({
        pubkey: params.includePoolCompliancePolicy ? poolCompliancePolicyPda : programId,
        isSigner: false,
        isWritable: false,
      });
      keys.push({ pubkey: SystemProgram.programId, isSigner: false, isWritable: false });
      const instruction = new TransactionInstruction({
        programId,
        keys,
        data: encodeEnrollMemberTokenGateData(params),
      });

      return new Transaction({
        feePayer: member,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildEnrollMemberInvitePermitTx(params: BuildEnrollMemberInvitePermitTxParams): Transaction {
      const member = new PublicKey(params.member);
      const poolAddress = new PublicKey(params.poolAddress);
      const issuer = new PublicKey(params.issuer);
      const nonceHash = fromHex(params.nonceHashHex, 32);
      const [membershipPda] = deriveMembershipPda({
        programId,
        poolAddress,
        member,
      });
      const [inviteIssuerPda] = deriveInviteIssuerPda({
        programId,
        issuer,
      });
      const [replayPda] = deriveEnrollmentReplayPda({
        programId,
        poolAddress,
        member,
        nonceHash,
      });
      const keys = [
        { pubkey: member, isSigner: true, isWritable: true },
        { pubkey: poolAddress, isSigner: false, isWritable: false },
        { pubkey: membershipPda, isSigner: false, isWritable: true },
        { pubkey: issuer, isSigner: true, isWritable: false },
        { pubkey: inviteIssuerPda, isSigner: false, isWritable: false },
      ];
      const [poolCompliancePolicyPda] = derivePoolCompliancePolicyPda({ programId, poolAddress });
      keys.push({
        pubkey: params.includePoolCompliancePolicy ? poolCompliancePolicyPda : programId,
        isSigner: false,
        isWritable: false,
      });
      keys.push(
        { pubkey: replayPda, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      );
      const instruction = new TransactionInstruction({
        programId,
        keys,
        data: encodeEnrollMemberInvitePermitData(params),
      });

      return new Transaction({
        feePayer: member,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildSetClaimDelegateTx(params: BuildSetClaimDelegateTxParams): Transaction {
      const member = new PublicKey(params.member);
      const poolAddress = new PublicKey(params.poolAddress);
      const [membershipPda] = deriveMembershipPda({
        programId,
        poolAddress,
        member,
      });
      const [claimDelegatePda] = deriveClaimDelegatePda({
        programId,
        poolAddress,
        member,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: member, isSigner: true, isWritable: true },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: membershipPda, isSigner: false, isWritable: false },
          { pubkey: claimDelegatePda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeSetClaimDelegateData(params),
      });

      return new Transaction({
        feePayer: member,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildFundPoolSolTx(params: BuildFundPoolSolTxParams): Transaction {
      const funder = new PublicKey(params.funder);
      const poolAddress = new PublicKey(params.poolAddress);
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: funder, isSigner: true, isWritable: true },
          { pubkey: poolAddress, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeFundPoolSolData(params),
      });

      return new Transaction({
        feePayer: funder,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildFundPoolSplTx(params: BuildFundPoolSplTxParams): Transaction {
      const funder = new PublicKey(params.funder);
      const poolAddress = new PublicKey(params.poolAddress);
      const payoutMint = new PublicKey(params.payoutMint);
      const [poolTermsPda] = derivePoolTermsPda({
        programId,
        poolAddress,
      });
      const [poolAssetVaultPda] = derivePoolAssetVaultPda({
        programId,
        poolAddress,
        payoutMint,
      });
      const poolVaultTokenAccount = deriveAssociatedTokenAddress({
        owner: poolAssetVaultPda,
        mint: payoutMint,
        allowOwnerOffCurve: true,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: funder, isSigner: true, isWritable: true },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: poolTermsPda, isSigner: false, isWritable: false },
          { pubkey: payoutMint, isSigner: false, isWritable: true },
          { pubkey: poolAssetVaultPda, isSigner: false, isWritable: true },
          { pubkey: poolVaultTokenAccount, isSigner: false, isWritable: true },
          { pubkey: new PublicKey(params.funderTokenAccount), isSigner: false, isWritable: true },
          { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeFundPoolSplData(params),
      });

      return new Transaction({
        feePayer: funder,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildInitializePoolLiquiditySolTx(
      params: BuildInitializePoolLiquiditySolTxParams,
    ): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const [poolTermsPda] = derivePoolTermsPda({ programId, poolAddress });
      const [poolLiquidityConfigPda] = derivePoolLiquidityConfigPda({ programId, poolAddress });
      const [poolShareMintPda] = derivePoolShareMintPda({ programId, poolAddress });
      const authorityShareTokenAccount = deriveAssociatedTokenAddress({
        owner: authority,
        mint: poolShareMintPda,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: true },
          { pubkey: poolAddress, isSigner: false, isWritable: true },
          { pubkey: poolTermsPda, isSigner: false, isWritable: false },
          { pubkey: poolLiquidityConfigPda, isSigner: false, isWritable: true },
          { pubkey: poolShareMintPda, isSigner: false, isWritable: true },
          { pubkey: authorityShareTokenAccount, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeInitializePoolLiquiditySolData(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildInitializePoolLiquiditySplTx(
      params: BuildInitializePoolLiquiditySplTxParams,
    ): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const payoutMint = new PublicKey(params.payoutMint);
      const authorityPayoutTokenAccount = new PublicKey(params.authorityPayoutTokenAccount);
      const [poolTermsPda] = derivePoolTermsPda({ programId, poolAddress });
      const [poolAssetVaultPda] = derivePoolAssetVaultPda({ programId, poolAddress, payoutMint });
      const poolVaultTokenAccount = deriveAssociatedTokenAddress({
        owner: poolAssetVaultPda,
        mint: payoutMint,
        allowOwnerOffCurve: true,
      });
      const [poolLiquidityConfigPda] = derivePoolLiquidityConfigPda({ programId, poolAddress });
      const [poolShareMintPda] = derivePoolShareMintPda({ programId, poolAddress });
      const authorityShareTokenAccount = deriveAssociatedTokenAddress({
        owner: authority,
        mint: poolShareMintPda,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: true },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: poolTermsPda, isSigner: false, isWritable: false },
          { pubkey: payoutMint, isSigner: false, isWritable: true },
          { pubkey: poolAssetVaultPda, isSigner: false, isWritable: true },
          { pubkey: poolVaultTokenAccount, isSigner: false, isWritable: true },
          { pubkey: authorityPayoutTokenAccount, isSigner: false, isWritable: true },
          { pubkey: poolLiquidityConfigPda, isSigner: false, isWritable: true },
          { pubkey: poolShareMintPda, isSigner: false, isWritable: true },
          { pubkey: authorityShareTokenAccount, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeInitializePoolLiquiditySplData(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildSetPoolLiquidityEnabledTx(params: BuildSetPoolLiquidityEnabledTxParams): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const [poolLiquidityConfigPda] = derivePoolLiquidityConfigPda({ programId, poolAddress });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: poolLiquidityConfigPda, isSigner: false, isWritable: true },
        ],
        data: encodeSetPoolLiquidityEnabledData(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildRegisterPoolCapitalClassTx(
      params: BuildRegisterPoolCapitalClassTxParams,
    ): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const [configPda] = deriveConfigPda(programId);
      const [poolTermsPda] = derivePoolTermsPda({ programId, poolAddress });
      const [poolLiquidityConfigPda] = derivePoolLiquidityConfigPda({ programId, poolAddress });
      const [poolShareMintPda] = derivePoolShareMintPda({ programId, poolAddress });
      const [poolCapitalClassPda] = derivePoolCapitalClassPda({
        programId,
        poolAddress,
        shareMint: poolShareMintPda,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: poolTermsPda, isSigner: false, isWritable: false },
          { pubkey: poolLiquidityConfigPda, isSigner: false, isWritable: false },
          { pubkey: poolShareMintPda, isSigner: false, isWritable: true },
          { pubkey: poolCapitalClassPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeRegisterPoolCapitalClassData(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildDepositPoolLiquiditySolTx(params: BuildDepositPoolLiquiditySolTxParams): Transaction {
      const depositor = new PublicKey(params.depositor);
      const poolAddress = new PublicKey(params.poolAddress);
      const [configPda] = deriveConfigPda(programId);
      const [poolTermsPda] = derivePoolTermsPda({ programId, poolAddress });
      const [poolLiquidityConfigPda] = derivePoolLiquidityConfigPda({ programId, poolAddress });
      const [poolShareMintPda] = derivePoolShareMintPda({ programId, poolAddress });
      const depositorShareTokenAccount = deriveAssociatedTokenAddress({
        owner: depositor,
        mint: poolShareMintPda,
      });
      const keys = [
        { pubkey: depositor, isSigner: true, isWritable: true },
        { pubkey: configPda, isSigner: false, isWritable: false },
        { pubkey: poolAddress, isSigner: false, isWritable: true },
        { pubkey: poolTermsPda, isSigner: false, isWritable: false },
        { pubkey: poolLiquidityConfigPda, isSigner: false, isWritable: true },
        { pubkey: poolShareMintPda, isSigner: false, isWritable: true },
        { pubkey: depositorShareTokenAccount, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ];
      const [poolCapitalClassPda] = derivePoolCapitalClassPda({
        programId,
        poolAddress,
        shareMint: poolShareMintPda,
      });
      const [poolCompliancePolicyPda] = derivePoolCompliancePolicyPda({ programId, poolAddress });
      const [membershipPda] = deriveMembershipPda({ programId, poolAddress, member: depositor });
      keys.push({
        pubkey: params.includePoolCapitalClass ? poolCapitalClassPda : programId,
        isSigner: false,
        isWritable: false,
      });
      keys.push({
        pubkey: params.includePoolCompliancePolicy ? poolCompliancePolicyPda : programId,
        isSigner: false,
        isWritable: false,
      });
      keys.push({
        pubkey: params.includeMembership ? membershipPda : programId,
        isSigner: false,
        isWritable: false,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys,
        data: encodeDepositPoolLiquiditySolData(params),
      });

      return new Transaction({
        feePayer: depositor,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildDepositPoolLiquiditySplTx(params: BuildDepositPoolLiquiditySplTxParams): Transaction {
      const depositor = new PublicKey(params.depositor);
      const poolAddress = new PublicKey(params.poolAddress);
      const payoutMint = new PublicKey(params.payoutMint);
      const depositorPayoutTokenAccount = new PublicKey(params.depositorPayoutTokenAccount);
      const [configPda] = deriveConfigPda(programId);
      const [poolTermsPda] = derivePoolTermsPda({ programId, poolAddress });
      const [poolAssetVaultPda] = derivePoolAssetVaultPda({ programId, poolAddress, payoutMint });
      const poolVaultTokenAccount = deriveAssociatedTokenAddress({
        owner: poolAssetVaultPda,
        mint: payoutMint,
        allowOwnerOffCurve: true,
      });
      const [poolLiquidityConfigPda] = derivePoolLiquidityConfigPda({ programId, poolAddress });
      const [poolShareMintPda] = derivePoolShareMintPda({ programId, poolAddress });
      const depositorShareTokenAccount = deriveAssociatedTokenAddress({
        owner: depositor,
        mint: poolShareMintPda,
      });
      const keys = [
        { pubkey: depositor, isSigner: true, isWritable: true },
        { pubkey: configPda, isSigner: false, isWritable: false },
        { pubkey: poolAddress, isSigner: false, isWritable: false },
        { pubkey: poolTermsPda, isSigner: false, isWritable: false },
        { pubkey: payoutMint, isSigner: false, isWritable: true },
        { pubkey: poolAssetVaultPda, isSigner: false, isWritable: false },
        { pubkey: poolVaultTokenAccount, isSigner: false, isWritable: true },
        { pubkey: depositorPayoutTokenAccount, isSigner: false, isWritable: true },
        { pubkey: poolLiquidityConfigPda, isSigner: false, isWritable: true },
        { pubkey: poolShareMintPda, isSigner: false, isWritable: true },
        { pubkey: depositorShareTokenAccount, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ];
      const [poolCapitalClassPda] = derivePoolCapitalClassPda({
        programId,
        poolAddress,
        shareMint: poolShareMintPda,
      });
      const [poolCompliancePolicyPda] = derivePoolCompliancePolicyPda({ programId, poolAddress });
      const [membershipPda] = deriveMembershipPda({ programId, poolAddress, member: depositor });
      keys.push({
        pubkey: params.includePoolCapitalClass ? poolCapitalClassPda : programId,
        isSigner: false,
        isWritable: false,
      });
      keys.push({
        pubkey: params.includePoolCompliancePolicy ? poolCompliancePolicyPda : programId,
        isSigner: false,
        isWritable: false,
      });
      keys.push({
        pubkey: params.includeMembership ? membershipPda : programId,
        isSigner: false,
        isWritable: false,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys,
        data: encodeDepositPoolLiquiditySplData(params),
      });

      return new Transaction({
        feePayer: depositor,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildRedeemPoolLiquiditySolTx(params: BuildRedeemPoolLiquiditySolTxParams): Transaction {
      const redeemer = new PublicKey(params.redeemer);
      const poolAddress = new PublicKey(params.poolAddress);
      const [configPda] = deriveConfigPda(programId);
      const [poolTermsPda] = derivePoolTermsPda({ programId, poolAddress });
      const [poolLiquidityConfigPda] = derivePoolLiquidityConfigPda({ programId, poolAddress });
      const [poolRiskConfigPda] = derivePoolRiskConfigPda({ programId, poolAddress });
      const [poolTreasuryReservePda] = derivePoolTreasuryReservePda({
        programId,
        poolAddress,
        paymentMint: ZERO_PUBKEY,
      });
      const [poolShareMintPda] = derivePoolShareMintPda({ programId, poolAddress });
      const redeemerShareTokenAccount = deriveAssociatedTokenAddress({
        owner: redeemer,
        mint: poolShareMintPda,
      });
      const keys = [
        { pubkey: redeemer, isSigner: true, isWritable: true },
        { pubkey: configPda, isSigner: false, isWritable: false },
        { pubkey: poolAddress, isSigner: false, isWritable: true },
        { pubkey: poolTermsPda, isSigner: false, isWritable: false },
        { pubkey: poolLiquidityConfigPda, isSigner: false, isWritable: true },
        { pubkey: poolRiskConfigPda, isSigner: false, isWritable: true },
        { pubkey: poolTreasuryReservePda, isSigner: false, isWritable: true },
        { pubkey: poolShareMintPda, isSigner: false, isWritable: true },
        { pubkey: redeemerShareTokenAccount, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ];
      const [poolCapitalClassPda] = derivePoolCapitalClassPda({
        programId,
        poolAddress,
        shareMint: poolShareMintPda,
      });
      const [poolCompliancePolicyPda] = derivePoolCompliancePolicyPda({ programId, poolAddress });
      const [membershipPda] = deriveMembershipPda({ programId, poolAddress, member: redeemer });
      keys.push({
        pubkey: params.includePoolCapitalClass ? poolCapitalClassPda : programId,
        isSigner: false,
        isWritable: false,
      });
      keys.push({
        pubkey: params.includePoolCompliancePolicy ? poolCompliancePolicyPda : programId,
        isSigner: false,
        isWritable: false,
      });
      keys.push({
        pubkey: params.includeMembership ? membershipPda : programId,
        isSigner: false,
        isWritable: false,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys,
        data: encodeRedeemPoolLiquiditySolData(params),
      });

      return new Transaction({
        feePayer: redeemer,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildRedeemPoolLiquiditySplTx(params: BuildRedeemPoolLiquiditySplTxParams): Transaction {
      const redeemer = new PublicKey(params.redeemer);
      const poolAddress = new PublicKey(params.poolAddress);
      const payoutMint = new PublicKey(params.payoutMint);
      const redeemerPayoutTokenAccount = new PublicKey(params.redeemerPayoutTokenAccount);
      const [configPda] = deriveConfigPda(programId);
      const [poolTermsPda] = derivePoolTermsPda({ programId, poolAddress });
      const [poolAssetVaultPda] = derivePoolAssetVaultPda({ programId, poolAddress, payoutMint });
      const poolVaultTokenAccount = deriveAssociatedTokenAddress({
        owner: poolAssetVaultPda,
        mint: payoutMint,
        allowOwnerOffCurve: true,
      });
      const [poolLiquidityConfigPda] = derivePoolLiquidityConfigPda({ programId, poolAddress });
      const [poolRiskConfigPda] = derivePoolRiskConfigPda({ programId, poolAddress });
      const [poolTreasuryReservePda] = derivePoolTreasuryReservePda({
        programId,
        poolAddress,
        paymentMint: payoutMint,
      });
      const [poolShareMintPda] = derivePoolShareMintPda({ programId, poolAddress });
      const redeemerShareTokenAccount = deriveAssociatedTokenAddress({
        owner: redeemer,
        mint: poolShareMintPda,
      });
      const keys = [
        { pubkey: redeemer, isSigner: true, isWritable: true },
        { pubkey: configPda, isSigner: false, isWritable: false },
        { pubkey: poolAddress, isSigner: false, isWritable: false },
        { pubkey: poolTermsPda, isSigner: false, isWritable: false },
        { pubkey: payoutMint, isSigner: false, isWritable: true },
        { pubkey: poolAssetVaultPda, isSigner: false, isWritable: false },
        { pubkey: poolVaultTokenAccount, isSigner: false, isWritable: true },
        { pubkey: redeemerPayoutTokenAccount, isSigner: false, isWritable: true },
        { pubkey: poolLiquidityConfigPda, isSigner: false, isWritable: true },
        { pubkey: poolRiskConfigPda, isSigner: false, isWritable: true },
        { pubkey: poolTreasuryReservePda, isSigner: false, isWritable: true },
        { pubkey: poolShareMintPda, isSigner: false, isWritable: true },
        { pubkey: redeemerShareTokenAccount, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ];
      const [poolCapitalClassPda] = derivePoolCapitalClassPda({
        programId,
        poolAddress,
        shareMint: poolShareMintPda,
      });
      const [poolCompliancePolicyPda] = derivePoolCompliancePolicyPda({ programId, poolAddress });
      const [membershipPda] = deriveMembershipPda({ programId, poolAddress, member: redeemer });
      keys.push({
        pubkey: params.includePoolCapitalClass ? poolCapitalClassPda : programId,
        isSigner: false,
        isWritable: false,
      });
      keys.push({
        pubkey: params.includePoolCompliancePolicy ? poolCompliancePolicyPda : programId,
        isSigner: false,
        isWritable: false,
      });
      keys.push({
        pubkey: params.includeMembership ? membershipPda : programId,
        isSigner: false,
        isWritable: false,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys,
        data: encodeRedeemPoolLiquiditySplData(params),
      });

      return new Transaction({
        feePayer: redeemer,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildRequestPoolLiquidityRedemptionTx(
      params: BuildRequestPoolLiquidityRedemptionTxParams,
    ): Transaction {
      const redeemer = new PublicKey(params.redeemer);
      const poolAddress = new PublicKey(params.poolAddress);
      const payoutMint = params.payoutMint ? new PublicKey(params.payoutMint) : new PublicKey(ZERO_PUBKEY);
      const [configPda] = deriveConfigPda(programId);
      const [poolTermsPda] = derivePoolTermsPda({ programId, poolAddress });
      const [poolLiquidityConfigPda] = derivePoolLiquidityConfigPda({ programId, poolAddress });
      const [poolRiskConfigPda] = derivePoolRiskConfigPda({ programId, poolAddress });
      const [poolTreasuryReservePda] = derivePoolTreasuryReservePda({
        programId,
        poolAddress,
        paymentMint: payoutMint,
      });
      const [poolShareMintPda] = derivePoolShareMintPda({ programId, poolAddress });
      const redeemerShareTokenAccount = params.redeemerShareTokenAccount
        ? new PublicKey(params.redeemerShareTokenAccount)
        : deriveAssociatedTokenAddress({ owner: redeemer, mint: poolShareMintPda });
      const requestHash = fromHex(params.requestHashHex, 32);
      const [redemptionRequestPda] = deriveRedemptionRequestPda({
        programId,
        poolAddress,
        redeemer,
        requestHash,
      });
      const redemptionRequestShareEscrow = deriveAssociatedTokenAddress({
        owner: redemptionRequestPda,
        mint: poolShareMintPda,
        allowOwnerOffCurve: true,
      });
      const keys = [
        { pubkey: redeemer, isSigner: true, isWritable: true },
        { pubkey: configPda, isSigner: false, isWritable: false },
        { pubkey: poolAddress, isSigner: false, isWritable: false },
        { pubkey: poolTermsPda, isSigner: false, isWritable: false },
        { pubkey: poolLiquidityConfigPda, isSigner: false, isWritable: false },
        { pubkey: poolRiskConfigPda, isSigner: false, isWritable: true },
        { pubkey: poolTreasuryReservePda, isSigner: false, isWritable: true },
        { pubkey: poolShareMintPda, isSigner: false, isWritable: true },
        { pubkey: redeemerShareTokenAccount, isSigner: false, isWritable: true },
        { pubkey: redemptionRequestPda, isSigner: false, isWritable: true },
        { pubkey: redemptionRequestShareEscrow, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ];
      const [poolCapitalClassPda] = derivePoolCapitalClassPda({
        programId,
        poolAddress,
        shareMint: poolShareMintPda,
      });
      const [poolCompliancePolicyPda] = derivePoolCompliancePolicyPda({ programId, poolAddress });
      const [membershipPda] = deriveMembershipPda({ programId, poolAddress, member: redeemer });
      keys.push({
        pubkey: params.includePoolCapitalClass ? poolCapitalClassPda : programId,
        isSigner: false,
        isWritable: false,
      });
      keys.push({
        pubkey: params.includePoolCompliancePolicy ? poolCompliancePolicyPda : programId,
        isSigner: false,
        isWritable: false,
      });
      keys.push({
        pubkey: params.includeMembership ? membershipPda : programId,
        isSigner: false,
        isWritable: false,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys,
        data: encodeRequestPoolLiquidityRedemptionData(params),
      });

      return new Transaction({
        feePayer: redeemer,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildSchedulePoolLiquidityRedemptionTx(
      params: BuildSchedulePoolLiquidityRedemptionTxParams,
    ): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const redemptionRequest = new PublicKey(params.redemptionRequest);
      const [configPda] = deriveConfigPda(programId);
      const [poolControlAuthorityPda] = derivePoolControlAuthorityPda({ programId, poolAddress });
      const keys = [
        { pubkey: authority, isSigner: true, isWritable: true },
        { pubkey: configPda, isSigner: false, isWritable: false },
        { pubkey: poolAddress, isSigner: false, isWritable: false },
        { pubkey: redemptionRequest, isSigner: false, isWritable: true },
        {
          pubkey: params.includePoolControlAuthority ? poolControlAuthorityPda : programId,
          isSigner: false,
          isWritable: false,
        },
      ];
      const instruction = new TransactionInstruction({
        programId,
        keys,
        data: IX_SCHEDULE_POOL_LIQUIDITY_REDEMPTION,
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildCancelPoolLiquidityRedemptionTx(
      params: BuildCancelPoolLiquidityRedemptionTxParams,
    ): Transaction {
      const redeemer = new PublicKey(params.redeemer);
      const poolAddress = new PublicKey(params.poolAddress);
      const redemptionRequest = new PublicKey(params.redemptionRequest);
      const [poolShareMintPda] = derivePoolShareMintPda({ programId, poolAddress });
      const redemptionRequestShareEscrow = deriveAssociatedTokenAddress({
        owner: redemptionRequest,
        mint: poolShareMintPda,
        allowOwnerOffCurve: true,
      });
      const redeemerShareTokenAccount = params.redeemerShareTokenAccount
        ? new PublicKey(params.redeemerShareTokenAccount)
        : deriveAssociatedTokenAddress({ owner: redeemer, mint: poolShareMintPda });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: redeemer, isSigner: true, isWritable: true },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: redemptionRequest, isSigner: false, isWritable: true },
          { pubkey: poolShareMintPda, isSigner: false, isWritable: true },
          { pubkey: redemptionRequestShareEscrow, isSigner: false, isWritable: true },
          { pubkey: redeemerShareTokenAccount, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        data: IX_CANCEL_POOL_LIQUIDITY_REDEMPTION,
      });

      return new Transaction({
        feePayer: redeemer,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildFailPoolLiquidityRedemptionTx(
      params: BuildFailPoolLiquidityRedemptionTxParams,
    ): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const redemptionRequest = new PublicKey(params.redemptionRequest);
      const redeemer = new PublicKey(params.redeemer);
      const [configPda] = deriveConfigPda(programId);
      const [poolShareMintPda] = derivePoolShareMintPda({ programId, poolAddress });
      const redemptionRequestShareEscrow = deriveAssociatedTokenAddress({
        owner: redemptionRequest,
        mint: poolShareMintPda,
        allowOwnerOffCurve: true,
      });
      const [poolControlAuthorityPda] = derivePoolControlAuthorityPda({ programId, poolAddress });
      const redeemerShareTokenAccount = params.redeemerShareTokenAccount
        ? new PublicKey(params.redeemerShareTokenAccount)
        : deriveAssociatedTokenAddress({ owner: redeemer, mint: poolShareMintPda });
      const keys = [
        { pubkey: authority, isSigner: true, isWritable: true },
        { pubkey: configPda, isSigner: false, isWritable: false },
        { pubkey: poolAddress, isSigner: false, isWritable: false },
        { pubkey: redemptionRequest, isSigner: false, isWritable: true },
        { pubkey: poolShareMintPda, isSigner: false, isWritable: true },
        { pubkey: redemptionRequestShareEscrow, isSigner: false, isWritable: true },
        { pubkey: redeemerShareTokenAccount, isSigner: false, isWritable: true },
        {
          pubkey: params.includePoolControlAuthority ? poolControlAuthorityPda : programId,
          isSigner: false,
          isWritable: false,
        },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ];
      const instruction = new TransactionInstruction({
        programId,
        keys,
        data: encodeFailPoolLiquidityRedemptionData(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildFulfillPoolLiquidityRedemptionSolTx(
      params: BuildFulfillPoolLiquidityRedemptionSolTxParams,
    ): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const redemptionRequest = new PublicKey(params.redemptionRequest);
      const redeemerSystemAccount = new PublicKey(params.redeemerSystemAccount);
      const [configPda] = deriveConfigPda(programId);
      const [poolTermsPda] = derivePoolTermsPda({ programId, poolAddress });
      const [poolTreasuryReservePda] = derivePoolTreasuryReservePda({
        programId,
        poolAddress,
        paymentMint: ZERO_PUBKEY,
      });
      const [poolShareMintPda] = derivePoolShareMintPda({ programId, poolAddress });
      const redemptionRequestShareEscrow = deriveAssociatedTokenAddress({
        owner: redemptionRequest,
        mint: poolShareMintPda,
        allowOwnerOffCurve: true,
      });
      const [poolControlAuthorityPda] = derivePoolControlAuthorityPda({ programId, poolAddress });
      const keys = [
        { pubkey: authority, isSigner: true, isWritable: true },
        { pubkey: configPda, isSigner: false, isWritable: false },
        { pubkey: poolAddress, isSigner: false, isWritable: true },
        { pubkey: poolTermsPda, isSigner: false, isWritable: false },
        { pubkey: poolTreasuryReservePda, isSigner: false, isWritable: true },
        { pubkey: redemptionRequest, isSigner: false, isWritable: true },
        { pubkey: poolShareMintPda, isSigner: false, isWritable: true },
        { pubkey: redemptionRequestShareEscrow, isSigner: false, isWritable: true },
        { pubkey: redeemerSystemAccount, isSigner: false, isWritable: true },
        {
          pubkey: params.includePoolControlAuthority ? poolControlAuthorityPda : programId,
          isSigner: false,
          isWritable: false,
        },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ];
      const instruction = new TransactionInstruction({
        programId,
        keys,
        data: IX_FULFILL_POOL_LIQUIDITY_REDEMPTION_SOL,
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildFulfillPoolLiquidityRedemptionSplTx(
      params: BuildFulfillPoolLiquidityRedemptionSplTxParams,
    ): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const payoutMint = new PublicKey(params.payoutMint);
      const redemptionRequest = new PublicKey(params.redemptionRequest);
      const redeemerPayoutTokenAccount = new PublicKey(params.redeemerPayoutTokenAccount);
      const [configPda] = deriveConfigPda(programId);
      const [poolTermsPda] = derivePoolTermsPda({ programId, poolAddress });
      const [poolAssetVaultPda] = derivePoolAssetVaultPda({ programId, poolAddress, payoutMint });
      const poolVaultTokenAccount = deriveAssociatedTokenAddress({
        owner: poolAssetVaultPda,
        mint: payoutMint,
        allowOwnerOffCurve: true,
      });
      const [poolTreasuryReservePda] = derivePoolTreasuryReservePda({
        programId,
        poolAddress,
        paymentMint: payoutMint,
      });
      const [poolShareMintPda] = derivePoolShareMintPda({ programId, poolAddress });
      const redemptionRequestShareEscrow = deriveAssociatedTokenAddress({
        owner: redemptionRequest,
        mint: poolShareMintPda,
        allowOwnerOffCurve: true,
      });
      const [poolControlAuthorityPda] = derivePoolControlAuthorityPda({ programId, poolAddress });
      const keys = [
        { pubkey: authority, isSigner: true, isWritable: true },
        { pubkey: configPda, isSigner: false, isWritable: false },
        { pubkey: poolAddress, isSigner: false, isWritable: false },
        { pubkey: poolTermsPda, isSigner: false, isWritable: false },
        { pubkey: payoutMint, isSigner: false, isWritable: true },
        { pubkey: poolAssetVaultPda, isSigner: false, isWritable: false },
        { pubkey: poolVaultTokenAccount, isSigner: false, isWritable: true },
        { pubkey: poolTreasuryReservePda, isSigner: false, isWritable: true },
        { pubkey: redemptionRequest, isSigner: false, isWritable: true },
        { pubkey: poolShareMintPda, isSigner: false, isWritable: true },
        { pubkey: redemptionRequestShareEscrow, isSigner: false, isWritable: true },
        { pubkey: redeemerPayoutTokenAccount, isSigner: false, isWritable: true },
        {
          pubkey: params.includePoolControlAuthority ? poolControlAuthorityPda : programId,
          isSigner: false,
          isWritable: false,
        },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ];
      const instruction = new TransactionInstruction({
        programId,
        keys,
        data: IX_FULFILL_POOL_LIQUIDITY_REDEMPTION_SPL,
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildSubmitRewardClaimTx(params: BuildSubmitRewardClaimTxParams): Transaction {
      validateRewardClaimOptionalAccounts(params);
      const claimant = new PublicKey(params.claimant);
      const poolAddress = new PublicKey(params.poolAddress);
      const member = new PublicKey(params.member);
      const payoutMint = new PublicKey(params.payoutMint ?? ZERO_PUBKEY);
      const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
      const cycleHash = fromHex(params.cycleHashHex, 32);
      const ruleHash = fromHex(params.ruleHashHex, 32);
      const [configPda] = deriveConfigPda(programId);
      const [poolTermsPda] = derivePoolTermsPda({
        programId,
        poolAddress,
      });
      const [oraclePolicyPda] = derivePoolOraclePolicyPda({
        programId,
        poolAddress,
      });
      const [poolTreasuryReservePda] = derivePoolTreasuryReservePda({
        programId,
        poolAddress,
        paymentMint: payoutMint,
      });
      const [membershipPda] = deriveMembershipPda({
        programId,
        poolAddress,
        member,
      });
      const [aggregatePda] = deriveOutcomeAggregatePda({
        programId,
        poolAddress,
        seriesRefHash,
        member,
        cycleHash,
        ruleHash,
      });
      const [claimRecordPda] = deriveClaimPda({
        programId,
        poolAddress,
        seriesRefHash,
        member,
        cycleHash,
        ruleHash,
      });

      const optionPlaceholder = programId;
      const memberCycleAccount = params.memberCycle
        ? new PublicKey(params.memberCycle)
        : optionPlaceholder;
      const cohortSettlementRootAccount = params.cohortSettlementRoot
        ? new PublicKey(params.cohortSettlementRoot)
        : optionPlaceholder;
      const claimDelegateAccount = params.claimDelegate
        ? new PublicKey(params.claimDelegate)
        : optionPlaceholder;
      const poolAssetVaultAccount = params.poolAssetVault
        ? new PublicKey(params.poolAssetVault)
        : optionPlaceholder;
      const poolVaultTokenAccount = params.poolVaultTokenAccount
        ? new PublicKey(params.poolVaultTokenAccount)
        : optionPlaceholder;
      const recipientTokenAccount = params.recipientTokenAccount
        ? new PublicKey(params.recipientTokenAccount)
        : optionPlaceholder;
      const keys = [
        { pubkey: claimant, isSigner: true, isWritable: true },
        { pubkey: configPda, isSigner: false, isWritable: false },
        { pubkey: poolAddress, isSigner: false, isWritable: true },
        { pubkey: poolTermsPda, isSigner: false, isWritable: false },
        { pubkey: oraclePolicyPda, isSigner: false, isWritable: false },
        { pubkey: poolTreasuryReservePda, isSigner: false, isWritable: true },
        { pubkey: membershipPda, isSigner: false, isWritable: false },
        { pubkey: aggregatePda, isSigner: false, isWritable: true },
        { pubkey: memberCycleAccount, isSigner: false, isWritable: false },
        {
          pubkey: cohortSettlementRootAccount,
          isSigner: false,
          isWritable: params.cohortSettlementRoot != null,
        },
        { pubkey: new PublicKey(params.recipientSystemAccount), isSigner: false, isWritable: true },
        { pubkey: claimDelegateAccount, isSigner: false, isWritable: false },
        { pubkey: poolAssetVaultAccount, isSigner: false, isWritable: false },
        { pubkey: poolVaultTokenAccount, isSigner: false, isWritable: params.poolVaultTokenAccount != null },
        { pubkey: recipientTokenAccount, isSigner: false, isWritable: params.recipientTokenAccount != null },
        { pubkey: claimRecordPda, isSigner: false, isWritable: true },
        { pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ];
      keys.push({
        pubkey: params.includePoolCompliancePolicy
          ? derivePoolCompliancePolicyPda({ programId, poolAddress })[0]
          : programId,
        isSigner: false,
        isWritable: false,
      });

      const instruction = new TransactionInstruction({
        programId,
        keys,
        data: encodeSubmitRewardClaimData(params),
      });

      return new Transaction({
        feePayer: claimant,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildCreatePolicySeriesTx(
      params: BuildCreatePolicySeriesTxParams,
    ): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
      const [configPda] = deriveConfigPda(programId);
      const [coverageProductPda] = derivePolicySeriesPda({
        programId,
        poolAddress,
        seriesRefHash,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: coverageProductPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeCreatePolicySeriesData(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildUpsertPolicySeriesPaymentOptionTx(
      params: BuildUpsertPolicySeriesPaymentOptionTxParams,
    ): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const paymentMint = new PublicKey(params.paymentMint);
      const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
      const [configPda] = deriveConfigPda(programId);
      const [coverageProductPda] = derivePolicySeriesPda({
        programId,
        poolAddress,
        seriesRefHash,
      });
      const [coverageProductPaymentOptionPda] = derivePolicySeriesPaymentOptionPda({
        programId,
        poolAddress,
        seriesRefHash,
        paymentMint,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: coverageProductPda, isSigner: false, isWritable: true },
          { pubkey: paymentMint, isSigner: false, isWritable: false },
          { pubkey: coverageProductPaymentOptionPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeUpsertPolicySeriesPaymentOptionData(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildUpdatePolicySeriesTx(
      params: BuildUpdatePolicySeriesTxParams,
    ): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
      const [configPda] = deriveConfigPda(programId);
      const [coverageProductPda] = derivePolicySeriesPda({
        programId,
        poolAddress,
        seriesRefHash,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: false },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: coverageProductPda, isSigner: false, isWritable: true },
        ],
        data: encodeUpdatePolicySeriesData(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildSubscribePolicySeriesTx(
      params: BuildSubscribePolicySeriesTxParams,
    ): Transaction {
      const member = new PublicKey(params.member);
      const poolAddress = new PublicKey(params.poolAddress);
      const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
      const [configPda] = deriveConfigPda(programId);
      const [membershipPda] = deriveMembershipPda({
        programId,
        poolAddress,
        member,
      });
      const [coverageProductPda] = derivePolicySeriesPda({
        programId,
        poolAddress,
        seriesRefHash,
      });
      const [coveragePolicyPda] = derivePolicyPositionPda({
        programId,
        poolAddress,
        seriesRefHash,
        member,
      });
      const [coverageNftPda] = derivePolicyPositionNftPda({
        programId,
        poolAddress,
        seriesRefHash,
        member,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: member, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: membershipPda, isSigner: false, isWritable: false },
          { pubkey: coverageProductPda, isSigner: false, isWritable: false },
          { pubkey: coveragePolicyPda, isSigner: false, isWritable: true },
          { pubkey: coverageNftPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeSubscribePolicySeriesData(params),
      });

      return new Transaction({
        feePayer: member,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildIssuePolicyPositionTx(
      params: BuildIssuePolicyPositionTxParams,
    ): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const member = new PublicKey(params.member);
      const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
      const [configPda] = deriveConfigPda(programId);
      const [membershipPda] = deriveMembershipPda({
        programId,
        poolAddress,
        member,
      });
      const [coverageProductPda] = derivePolicySeriesPda({
        programId,
        poolAddress,
        seriesRefHash,
      });
      const [coveragePolicyPda] = derivePolicyPositionPda({
        programId,
        poolAddress,
        seriesRefHash,
        member,
      });
      const [coverageNftPda] = derivePolicyPositionNftPda({
        programId,
        poolAddress,
        seriesRefHash,
        member,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: membershipPda, isSigner: false, isWritable: false },
          { pubkey: coverageProductPda, isSigner: false, isWritable: false },
          { pubkey: coveragePolicyPda, isSigner: false, isWritable: true },
          { pubkey: coverageNftPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeIssuePolicyPositionData(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildMintPolicyNftTx(params: BuildMintPolicyNftTxParams): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const member = new PublicKey(params.member);
      const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
      const [configPda] = deriveConfigPda(programId);
      const [coveragePolicyPda] = derivePolicyPositionPda({
        programId,
        poolAddress,
        seriesRefHash,
        member,
      });
      const [coverageNftPda] = derivePolicyPositionNftPda({
        programId,
        poolAddress,
        seriesRefHash,
        member,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: false },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: coveragePolicyPda, isSigner: false, isWritable: true },
          { pubkey: coverageNftPda, isSigner: false, isWritable: true },
        ],
        data: encodeMintPolicyNftData(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildPayPremiumSolTx(params: BuildPayPremiumSolTxParams): Transaction {
      const payer = new PublicKey(params.payer);
      const poolAddress = new PublicKey(params.poolAddress);
      const member = new PublicKey(params.member);
      const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
      const [configPda] = deriveConfigPda(programId);
      const [coveragePolicyPda] = derivePolicyPositionPda({ programId, poolAddress, seriesRefHash, member });
      const [coverageProductPda] = derivePolicySeriesPda({
        programId,
        poolAddress,
        seriesRefHash,
      });
      const [coverageProductPaymentOptionPda] = derivePolicySeriesPaymentOptionPda({
        programId,
        poolAddress,
        seriesRefHash,
        paymentMint: ZERO_PUBKEY,
      });
      const [premiumLedgerPda] = derivePremiumLedgerPda({ programId, poolAddress, seriesRefHash, member });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: payer, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: true },
          { pubkey: coveragePolicyPda, isSigner: false, isWritable: true },
          { pubkey: member, isSigner: false, isWritable: false },
          { pubkey: coverageProductPda, isSigner: false, isWritable: false },
          { pubkey: coverageProductPaymentOptionPda, isSigner: false, isWritable: false },
          { pubkey: premiumLedgerPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodePayPremiumSolData(params),
      });

      return new Transaction({
        feePayer: payer,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildPayPremiumSplTx(params: BuildPayPremiumSplTxParams): Transaction {
      const payer = new PublicKey(params.payer);
      const poolAddress = new PublicKey(params.poolAddress);
      const member = new PublicKey(params.member);
      const paymentMint = new PublicKey(params.paymentMint);
      const payerTokenAccount = new PublicKey(params.payerTokenAccount);
      const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
      const [configPda] = deriveConfigPda(programId);
      const [coveragePolicyPda] = derivePolicyPositionPda({ programId, poolAddress, seriesRefHash, member });
      const [coverageProductPda] = derivePolicySeriesPda({
        programId,
        poolAddress,
        seriesRefHash,
      });
      const [coverageProductPaymentOptionPda] = derivePolicySeriesPaymentOptionPda({
        programId,
        poolAddress,
        seriesRefHash,
        paymentMint,
      });
      const [premiumLedgerPda] = derivePremiumLedgerPda({ programId, poolAddress, seriesRefHash, member });
      const [poolAssetVaultPda] = derivePoolAssetVaultPda({ programId, poolAddress, payoutMint: paymentMint });
      const poolVaultTokenAccount = deriveAssociatedTokenAddress({
        owner: poolAssetVaultPda,
        mint: paymentMint,
        allowOwnerOffCurve: true,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: payer, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: coveragePolicyPda, isSigner: false, isWritable: true },
          { pubkey: member, isSigner: false, isWritable: false },
          { pubkey: coverageProductPda, isSigner: false, isWritable: false },
          { pubkey: coverageProductPaymentOptionPda, isSigner: false, isWritable: false },
          { pubkey: paymentMint, isSigner: false, isWritable: true },
          { pubkey: premiumLedgerPda, isSigner: false, isWritable: true },
          { pubkey: poolAssetVaultPda, isSigner: false, isWritable: true },
          { pubkey: poolVaultTokenAccount, isSigner: false, isWritable: true },
          { pubkey: payerTokenAccount, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodePayPremiumSplData(params),
      });

      return new Transaction({
        feePayer: payer,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildAttestPremiumPaidOffchainTx(
      params: BuildAttestPremiumPaidOffchainTxParams,
    ): Transaction {
      const oracle = new PublicKey(params.oracle);
      const poolAddress = new PublicKey(params.poolAddress);
      const member = new PublicKey(params.member);
      const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
      const replayHash = fromHex(params.replayHashHex, 32);
      const [configPda] = deriveConfigPda(programId);
      const [oracleEntryPda] = deriveOraclePda({
        programId,
        oracle,
      });
      const [poolOraclePda] = derivePoolOraclePda({
        programId,
        poolAddress,
        oracle,
      });
      const [poolOraclePermissionsPda] = derivePoolOraclePermissionSetPda({
        programId,
        poolAddress,
        oracle,
      });
      const [coverageProductPda] = derivePolicySeriesPda({
        programId,
        poolAddress,
        seriesRefHash,
      });
      const [coveragePolicyPda] = derivePolicyPositionPda({
        programId,
        poolAddress,
        seriesRefHash,
        member,
      });
      const [premiumLedgerPda] = derivePremiumLedgerPda({
        programId,
        poolAddress,
        seriesRefHash,
        member,
      });
      const [premiumReplayPda] = derivePremiumReplayPda({
        programId,
        poolAddress,
        seriesRefHash,
        member,
        replayHash,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: oracle, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: oracleEntryPda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: poolOraclePda, isSigner: false, isWritable: false },
          { pubkey: poolOraclePermissionsPda, isSigner: false, isWritable: false },
          { pubkey: coverageProductPda, isSigner: false, isWritable: false },
          { pubkey: coveragePolicyPda, isSigner: false, isWritable: true },
          { pubkey: premiumLedgerPda, isSigner: false, isWritable: true },
          { pubkey: premiumReplayPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeAttestPremiumPaidOffchainData(params),
      });

      return new Transaction({
        feePayer: oracle,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildSubmitCoverageClaimTx(params: BuildSubmitCoverageClaimTxParams): Transaction {
      const claimant = new PublicKey(params.claimant);
      const poolAddress = new PublicKey(params.poolAddress);
      const member = new PublicKey(params.member);
      const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
      const intentHash = fromHex(params.intentHashHex, 32);
      const [configPda] = deriveConfigPda(programId);
      const [coverageProductPda] = derivePolicySeriesPda({
        programId,
        poolAddress,
        seriesRefHash,
      });
      const [coveragePolicyPda] = derivePolicyPositionPda({
        programId,
        poolAddress,
        seriesRefHash,
        member,
      });
      const [poolRiskConfigPda] = derivePoolRiskConfigPda({ programId, poolAddress });
      const [claimDelegatePda] = deriveClaimDelegatePda({
        programId,
        poolAddress,
        member,
      });
      const [coverageClaimPda] = deriveCoverageClaimPda({
        programId,
        poolAddress,
        seriesRefHash,
        member,
        intentHash,
      });
      const claimDelegateAccount = params.claimDelegate ? claimDelegatePda : programId;
      const keys = [
        { pubkey: claimant, isSigner: true, isWritable: true },
        { pubkey: configPda, isSigner: false, isWritable: false },
        { pubkey: poolAddress, isSigner: false, isWritable: false },
        { pubkey: coverageProductPda, isSigner: false, isWritable: false },
        { pubkey: coveragePolicyPda, isSigner: false, isWritable: true },
        { pubkey: poolRiskConfigPda, isSigner: false, isWritable: true },
        { pubkey: claimDelegateAccount, isSigner: false, isWritable: false },
        { pubkey: coverageClaimPda, isSigner: false, isWritable: true },
      ];
      const [poolCompliancePolicyPda] = derivePoolCompliancePolicyPda({ programId, poolAddress });
      keys.push({
        pubkey: params.includePoolCompliancePolicy ? poolCompliancePolicyPda : programId,
        isSigner: false,
        isWritable: false,
      });
      keys.push({ pubkey: SystemProgram.programId, isSigner: false, isWritable: false });
      const instruction = new TransactionInstruction({
        programId,
        keys,
        data: encodeSubmitCoverageClaimData(params),
      });

      return new Transaction({
        feePayer: claimant,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildReviewCoverageClaimTx(params: BuildReviewCoverageClaimTxParams): Transaction {
      const oracle = new PublicKey(params.oracle);
      const poolAddress = new PublicKey(params.poolAddress);
      const member = new PublicKey(params.member);
      const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
      const [configPda] = deriveConfigPda(programId);
      const [oracleEntryPda] = deriveOraclePda({ programId, oracle });
      const [poolOraclePda] = derivePoolOraclePda({
        programId,
        poolAddress,
        oracle,
      });
      const [poolOraclePermissionsPda] = derivePoolOraclePermissionSetPda({
        programId,
        poolAddress,
        oracle,
      });
      const [coverageClaimPda] = deriveCoverageClaimPda({
        programId,
        poolAddress,
        seriesRefHash,
        member,
        intentHash: fromHex(params.intentHashHex, 32),
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: oracle, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: oracleEntryPda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: poolOraclePda, isSigner: false, isWritable: false },
          { pubkey: poolOraclePermissionsPda, isSigner: false, isWritable: false },
          { pubkey: coverageClaimPda, isSigner: false, isWritable: true },
        ],
        data: encodeReviewCoverageClaimData(params),
      });

      return new Transaction({
        feePayer: oracle,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildAttachCoverageClaimDecisionSupportTx(
      params: BuildAttachCoverageClaimDecisionSupportTxParams,
    ): Transaction {
      const oracle = new PublicKey(params.oracle);
      const poolAddress = new PublicKey(params.poolAddress);
      const member = new PublicKey(params.member);
      const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
      const [configPda] = deriveConfigPda(programId);
      const [oracleEntryPda] = deriveOraclePda({ programId, oracle });
      const [poolOraclePda] = derivePoolOraclePda({
        programId,
        poolAddress,
        oracle,
      });
      const [poolOraclePermissionsPda] = derivePoolOraclePermissionSetPda({
        programId,
        poolAddress,
        oracle,
      });
      const [coverageClaimPda] = deriveCoverageClaimPda({
        programId,
        poolAddress,
        seriesRefHash,
        member,
        intentHash: fromHex(params.intentHashHex, 32),
      });
      const [poolAutomationPolicyPda] = derivePoolAutomationPolicyPda({ programId, poolAddress });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: oracle, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: oracleEntryPda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: poolOraclePda, isSigner: false, isWritable: false },
          { pubkey: poolOraclePermissionsPda, isSigner: false, isWritable: false },
          { pubkey: coverageClaimPda, isSigner: false, isWritable: true },
          { pubkey: poolAutomationPolicyPda, isSigner: false, isWritable: false },
        ],
        data: encodeAttachCoverageClaimDecisionSupportData(params),
      });

      return new Transaction({
        feePayer: oracle,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildApproveCoverageClaimTx(params: BuildApproveCoverageClaimTxParams): Transaction {
      const oracle = new PublicKey(params.oracle);
      const poolAddress = new PublicKey(params.poolAddress);
      const member = new PublicKey(params.member);
      const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
      const payoutMint = new PublicKey(params.payoutMint);
      const poolAssetVault = new PublicKey(params.poolAssetVault);
      const poolVaultTokenAccount = new PublicKey(params.poolVaultTokenAccount);
      const [configPda] = deriveConfigPda(programId);
      const [oracleEntryPda] = deriveOraclePda({ programId, oracle });
      const [poolOraclePda] = derivePoolOraclePda({
        programId,
        poolAddress,
        oracle,
      });
      const [poolOraclePermissionsPda] = derivePoolOraclePermissionSetPda({
        programId,
        poolAddress,
        oracle,
      });
      const [poolTermsPda] = derivePoolTermsPda({ programId, poolAddress });
      const [coverageClaimPda] = deriveCoverageClaimPda({
        programId,
        poolAddress,
        seriesRefHash,
        member,
        intentHash: fromHex(params.intentHashHex, 32),
      });
      const [poolTreasuryReservePda] = derivePoolTreasuryReservePda({
        programId,
        poolAddress,
        paymentMint: payoutMint,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: oracle, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: oracleEntryPda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: poolOraclePda, isSigner: false, isWritable: false },
          { pubkey: poolOraclePermissionsPda, isSigner: false, isWritable: false },
          { pubkey: poolTermsPda, isSigner: false, isWritable: false },
          { pubkey: coverageClaimPda, isSigner: false, isWritable: true },
          { pubkey: poolTreasuryReservePda, isSigner: false, isWritable: true },
          { pubkey: poolAssetVault, isSigner: false, isWritable: false },
          { pubkey: poolVaultTokenAccount, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeApproveCoverageClaimData(params),
      });

      return new Transaction({
        feePayer: oracle,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildDenyCoverageClaimTx(params: BuildDenyCoverageClaimTxParams): Transaction {
      const oracle = new PublicKey(params.oracle);
      const poolAddress = new PublicKey(params.poolAddress);
      const member = new PublicKey(params.member);
      const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
      const payoutMint = new PublicKey(params.payoutMint);
      const [configPda] = deriveConfigPda(programId);
      const [oracleEntryPda] = deriveOraclePda({ programId, oracle });
      const [poolOraclePda] = derivePoolOraclePda({
        programId,
        poolAddress,
        oracle,
      });
      const [poolOraclePermissionsPda] = derivePoolOraclePermissionSetPda({
        programId,
        poolAddress,
        oracle,
      });
      const [poolTermsPda] = derivePoolTermsPda({ programId, poolAddress });
      const [coverageClaimPda] = deriveCoverageClaimPda({
        programId,
        poolAddress,
        seriesRefHash,
        member,
        intentHash: fromHex(params.intentHashHex, 32),
      });
      const [poolTreasuryReservePda] = derivePoolTreasuryReservePda({
        programId,
        poolAddress,
        paymentMint: payoutMint,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: oracle, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: oracleEntryPda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: poolOraclePda, isSigner: false, isWritable: false },
          { pubkey: poolOraclePermissionsPda, isSigner: false, isWritable: false },
          { pubkey: poolTermsPda, isSigner: false, isWritable: false },
          { pubkey: coverageClaimPda, isSigner: false, isWritable: true },
          { pubkey: poolTreasuryReservePda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeDenyCoverageClaimData(params),
      });

      return new Transaction({
        feePayer: oracle,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildPayCoverageClaimTx(params: BuildPayCoverageClaimTxParams): Transaction {
      const authority = new PublicKey(params.authority);
      const claimant = new PublicKey(params.claimant);
      const poolAddress = new PublicKey(params.poolAddress);
      const member = new PublicKey(params.member);
      const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
      const payoutMint = new PublicKey(params.payoutMint);
      const recipientSystemAccount = new PublicKey(params.recipientSystemAccount);
      const poolAssetVault = new PublicKey(params.poolAssetVault);
      const poolVaultTokenAccount = new PublicKey(params.poolVaultTokenAccount);
      const recipientTokenAccount = new PublicKey(params.recipientTokenAccount);
      const [configPda] = deriveConfigPda(programId);
      const [poolTermsPda] = derivePoolTermsPda({ programId, poolAddress });
      const [coverageClaimPda] = deriveCoverageClaimPda({
        programId,
        poolAddress,
        seriesRefHash,
        member,
        intentHash: fromHex(params.intentHashHex, 32),
      });
      const [poolTreasuryReservePda] = derivePoolTreasuryReservePda({
        programId,
        poolAddress,
        paymentMint: payoutMint,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: true },
          { pubkey: poolTermsPda, isSigner: false, isWritable: false },
          { pubkey: coverageClaimPda, isSigner: false, isWritable: true },
          { pubkey: claimant, isSigner: false, isWritable: false },
          { pubkey: poolTreasuryReservePda, isSigner: false, isWritable: true },
          { pubkey: recipientSystemAccount, isSigner: false, isWritable: true },
          { pubkey: poolAssetVault, isSigner: false, isWritable: false },
          { pubkey: poolVaultTokenAccount, isSigner: false, isWritable: true },
          { pubkey: recipientTokenAccount, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodePayCoverageClaimData(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildClaimApprovedCoveragePayoutTx(
      params: BuildClaimApprovedCoveragePayoutTxParams,
    ): Transaction {
      const claimSigner = new PublicKey(params.claimSigner);
      const claimant = new PublicKey(params.claimant);
      const poolAddress = new PublicKey(params.poolAddress);
      const member = new PublicKey(params.member);
      const payoutMint = new PublicKey(params.payoutMint);
      const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
      const [configPda] = deriveConfigPda(programId);
      const [poolTermsPda] = derivePoolTermsPda({ programId, poolAddress });
      const [coverageClaimPda] = deriveCoverageClaimPda({
        programId,
        poolAddress,
        seriesRefHash,
        member,
        intentHash: fromHex(params.intentHashHex, 32),
      });
      const [poolTreasuryReservePda] = derivePoolTreasuryReservePda({
        programId,
        poolAddress,
        paymentMint: payoutMint,
      });
      const [derivedClaimDelegatePda] = deriveClaimDelegatePda({
        programId,
        poolAddress,
        member: claimant,
      });
      const claimDelegateAccount = claimSigner.equals(claimant)
        ? programId
        : params.claimDelegate
          ? new PublicKey(params.claimDelegate)
          : derivedClaimDelegatePda;
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: claimSigner, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: true },
          { pubkey: poolTermsPda, isSigner: false, isWritable: false },
          { pubkey: coverageClaimPda, isSigner: false, isWritable: true },
          { pubkey: claimant, isSigner: false, isWritable: false },
          { pubkey: claimDelegateAccount, isSigner: false, isWritable: false },
          { pubkey: poolTreasuryReservePda, isSigner: false, isWritable: true },
          { pubkey: new PublicKey(params.recipientSystemAccount), isSigner: false, isWritable: true },
          { pubkey: new PublicKey(params.poolAssetVault), isSigner: false, isWritable: false },
          { pubkey: new PublicKey(params.poolVaultTokenAccount), isSigner: false, isWritable: true },
          { pubkey: new PublicKey(params.recipientTokenAccount), isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeClaimApprovedCoveragePayoutData(params),
      });

      return new Transaction({
        feePayer: claimSigner,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildCloseCoverageClaimTx(params: BuildCloseCoverageClaimTxParams): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const member = new PublicKey(params.member);
      const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
      const payoutMint = new PublicKey(params.payoutMint);
      const [configPda] = deriveConfigPda(programId);
      const [poolTermsPda] = derivePoolTermsPda({ programId, poolAddress });
      const [coverageClaimPda] = deriveCoverageClaimPda({
        programId,
        poolAddress,
        seriesRefHash,
        member,
        intentHash: fromHex(params.intentHashHex, 32),
      });
      const [poolTreasuryReservePda] = derivePoolTreasuryReservePda({
        programId,
        poolAddress,
        paymentMint: payoutMint,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: true },
          { pubkey: poolTermsPda, isSigner: false, isWritable: false },
          { pubkey: coverageClaimPda, isSigner: false, isWritable: true },
          { pubkey: poolTreasuryReservePda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeCloseCoverageClaimData(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildSettleCoverageClaimTx(params: BuildSettleCoverageClaimTxParams): Transaction {
      const oracle = new PublicKey(params.oracle);
      const claimant = new PublicKey(params.claimant);
      const poolAddress = new PublicKey(params.poolAddress);
      const member = new PublicKey(params.member);
      const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
      const payoutMint = new PublicKey(params.payoutMint);
      const intentHash = fromHex(params.intentHashHex, 32);
      const [configPda] = deriveConfigPda(programId);
      const [oracleEntryPda] = deriveOraclePda({ programId, oracle });
      const [poolOraclePda] = derivePoolOraclePda({
        programId,
        poolAddress,
        oracle,
      });
      const [poolOraclePermissionsPda] = derivePoolOraclePermissionSetPda({
        programId,
        poolAddress,
        oracle,
      });
      const [poolTermsPda] = derivePoolTermsPda({
        programId,
        poolAddress,
      });
      const [coveragePolicyPda] = derivePolicyPositionPda({
        programId,
        poolAddress,
        seriesRefHash,
        member,
      });
      const [coverageClaimPda] = deriveCoverageClaimPda({
        programId,
        poolAddress,
        seriesRefHash,
        member,
        intentHash,
      });
      const [poolTreasuryReservePda] = derivePoolTreasuryReservePda({
        programId,
        poolAddress,
        paymentMint: payoutMint,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: oracle, isSigner: true, isWritable: true },
          { pubkey: claimant, isSigner: true, isWritable: false },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: oracleEntryPda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: true },
          { pubkey: poolOraclePda, isSigner: false, isWritable: false },
          { pubkey: poolOraclePermissionsPda, isSigner: false, isWritable: false },
          { pubkey: poolTermsPda, isSigner: false, isWritable: false },
          { pubkey: coverageClaimPda, isSigner: false, isWritable: true },
          { pubkey: coveragePolicyPda, isSigner: false, isWritable: true },
          { pubkey: poolTreasuryReservePda, isSigner: false, isWritable: true },
          { pubkey: new PublicKey(params.recipientSystemAccount), isSigner: false, isWritable: true },
          { pubkey: new PublicKey(params.poolAssetVault), isSigner: false, isWritable: false },
          { pubkey: new PublicKey(params.poolVaultTokenAccount), isSigner: false, isWritable: true },
          { pubkey: new PublicKey(params.recipientTokenAccount), isSigner: false, isWritable: true },
          { pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeSettleCoverageClaimData(params),
      });

      return new Transaction({
        feePayer: oracle,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildActivateCycleWithQuoteSolTx(params: BuildActivateCycleWithQuoteSolTxParams): Transaction {
      return buildActivateCycleWithQuoteSolTransaction(params);
    },

    buildActivateCycleWithQuoteSplTx(params: BuildActivateCycleWithQuoteSplTxParams): Transaction {
      return buildActivateCycleWithQuoteSplTransaction(params);
    },

    buildSettleCycleCommitmentTx(params: BuildSettleCycleCommitmentTxParams): Transaction {
      return buildSettleCycleCommitmentTransaction(params);
    },

    buildSettleCycleCommitmentSolTx(
      params: BuildSettleCycleCommitmentSolTxParams,
    ): Transaction {
      return buildSettleCycleCommitmentSolTransaction(params);
    },

    buildFinalizeCohortSettlementRootTx(
      params: BuildFinalizeCohortSettlementRootTxParams,
    ): Transaction {
      return buildFinalizeCohortSettlementRootTransaction(params);
    },

    buildWithdrawPoolTreasurySplTx(
      params: BuildWithdrawPoolTreasurySplTxParams,
    ): Transaction {
      return buildWithdrawPoolTreasurySplTransaction(params);
    },

    buildWithdrawPoolTreasurySolTx(
      params: BuildWithdrawPoolTreasurySolTxParams,
    ): Transaction {
      return buildWithdrawPoolTreasurySolTransaction(params);
    },

    buildWithdrawProtocolFeeSplTx(
      params: BuildWithdrawProtocolFeeSplTxParams,
    ): Transaction {
      return buildWithdrawProtocolFeeSplTransaction(params);
    },

    buildWithdrawProtocolFeeSolTx(
      params: BuildWithdrawProtocolFeeSolTxParams,
    ): Transaction {
      return buildWithdrawProtocolFeeSolTransaction(params);
    },

    buildWithdrawPoolOracleFeeSplTx(
      params: BuildWithdrawPoolOracleFeeSplTxParams,
    ): Transaction {
      return buildWithdrawPoolOracleFeeSplTransaction(params);
    },

    buildWithdrawPoolOracleFeeSolTx(
      params: BuildWithdrawPoolOracleFeeSolTxParams,
    ): Transaction {
      return buildWithdrawPoolOracleFeeSolTransaction(params);
    },

    async fetchProtocolConfig(): Promise<ProtocolConfigAccount | null> {
      const [configPda] = deriveConfigPda(programId);
      const account = await connection.getAccountInfo(configPda, 'confirmed');
      if (!account) return null;
      return decodeProtocolConfigAccount(configPda.toBase58(), account.data);
    },

    async fetchPool(poolAddress: string): Promise<ProtocolPoolAccount | null> {
      const address = new PublicKey(poolAddress);
      const account = await connection.getAccountInfo(address, 'confirmed');
      if (!account) return null;
      return decodePoolAccount(address.toBase58(), account.data);
    },

    async fetchOracleRegistryEntry(oracle: string): Promise<ProtocolOracleRegistryEntryAccount | null> {
      const [pda] = deriveOraclePda({
        programId,
        oracle,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodeOracleRegistryEntryAccount(pda.toBase58(), account.data);
    },

    async fetchPoolOracleApproval(params: {
      poolAddress: string;
      oracle: string;
    }): Promise<ProtocolPoolOracleApprovalAccount | null> {
      const [pda] = derivePoolOraclePda({
        programId,
        poolAddress: params.poolAddress,
        oracle: params.oracle,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodePoolOracleApprovalAccount(pda.toBase58(), account.data);
    },

    async fetchMembershipRecord(params: {
      poolAddress: string;
      member: string;
    }): Promise<ProtocolMembershipRecordAccount | null> {
      const [pda] = deriveMembershipPda({
        programId,
        poolAddress: params.poolAddress,
        member: params.member,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodeMembershipRecordAccount(pda.toBase58(), account.data);
    },

    async fetchCycleOutcomeAggregate(params: {
      poolAddress: string;
      seriesRefHashHex: string;
      member: string;
      cycleHashHex: string;
      ruleHashHex: string;
    }): Promise<ProtocolCycleOutcomeAggregateAccount | null> {
      const seriesRefHash = fromHex(params.seriesRefHashHex, 32);
      const cycleHash = fromHex(params.cycleHashHex, 32);
      const ruleHash = fromHex(params.ruleHashHex, 32);
      const [pda] = deriveOutcomeAggregatePda({
        programId,
        poolAddress: params.poolAddress,
        seriesRefHash,
        member: params.member,
        cycleHash,
        ruleHash,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodeCycleOutcomeAggregateAccount(pda.toBase58(), account.data);
    },

    async fetchOracleProfile(oracle: string): Promise<ProtocolOracleProfileAccount | null> {
      const [pda] = deriveOracleProfilePda({
        programId,
        oracle,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodeOracleProfileAccount(pda.toBase58(), account.data);
    },

    async fetchOracleStakePosition(params: {
      oracle: string;
      staker: string;
    }): Promise<ProtocolOracleStakePositionAccount | null> {
      const [pda] = deriveOracleStakePda({
        programId,
        oracle: params.oracle,
        staker: params.staker,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodeOracleStakePositionAccount(pda.toBase58(), account.data);
    },

    async fetchPoolOraclePolicy(
      poolAddress: string,
    ): Promise<ProtocolPoolOraclePolicyAccount | null> {
      const [pda] = derivePoolOraclePolicyPda({
        programId,
        poolAddress,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodePoolOraclePolicyAccount(pda.toBase58(), account.data);
    },

    async fetchPoolTerms(poolAddress: string): Promise<ProtocolPoolTermsAccount | null> {
      const [pda] = derivePoolTermsPda({
        programId,
        poolAddress,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodePoolTermsAccount(pda.toBase58(), account.data);
    },

    async fetchPoolAssetVault(params: {
      poolAddress: string;
      payoutMint: string;
    }): Promise<ProtocolPoolAssetVaultAccount | null> {
      const [pda] = derivePoolAssetVaultPda({
        programId,
        poolAddress: params.poolAddress,
        payoutMint: params.payoutMint,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodePoolAssetVaultAccount(pda.toBase58(), account.data);
    },

    async fetchPoolLiquidityConfig(
      poolAddress: string,
    ): Promise<ProtocolPoolLiquidityConfigAccount | null> {
      const [pda] = derivePoolLiquidityConfigPda({
        programId,
        poolAddress,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodePoolLiquidityConfigAccount(pda.toBase58(), account.data);
    },

    async fetchPoolRiskConfig(
      poolAddress: string,
    ): Promise<ProtocolPoolRiskConfigAccount | null> {
      const [pda] = derivePoolRiskConfigPda({
        programId,
        poolAddress,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodePoolRiskConfigAccount(pda.toBase58(), account.data);
    },

    async fetchPoolCapitalClass(params: {
      poolAddress: string;
      shareMint: string;
    }): Promise<ProtocolPoolCapitalClassAccount | null> {
      const [pda] = derivePoolCapitalClassPda({
        programId,
        poolAddress: params.poolAddress,
        shareMint: params.shareMint,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodePoolCapitalClassAccount(pda.toBase58(), account.data);
    },

    async fetchPoolCompliancePolicy(
      poolAddress: string,
    ): Promise<ProtocolPoolCompliancePolicyAccount | null> {
      const [pda] = derivePoolCompliancePolicyPda({
        programId,
        poolAddress,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodePoolCompliancePolicyAccount(pda.toBase58(), account.data);
    },

    async fetchPoolControlAuthority(
      poolAddress: string,
    ): Promise<ProtocolPoolControlAuthorityAccount | null> {
      const [pda] = derivePoolControlAuthorityPda({
        programId,
        poolAddress,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodePoolControlAuthorityAccount(pda.toBase58(), account.data);
    },

    async fetchPoolAutomationPolicy(
      poolAddress: string,
    ): Promise<ProtocolPoolAutomationPolicyAccount | null> {
      const [pda] = derivePoolAutomationPolicyPda({
        programId,
        poolAddress,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodePoolAutomationPolicyAccount(pda.toBase58(), account.data);
    },

    async fetchProtocolFeeVault(
      paymentMint: string,
    ): Promise<ProtocolFeeVaultAccount | null> {
      const [pda] = deriveProtocolFeeVaultPda({
        programId,
        paymentMint,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodeProtocolFeeVaultAccount(pda.toBase58(), account.data);
    },

    async fetchPoolOracleFeeVault(params: {
      poolAddress: string;
      oracle: string;
      paymentMint: string;
    }): Promise<ProtocolPoolOracleFeeVaultAccount | null> {
      const [pda] = derivePoolOracleFeeVaultPda({
        programId,
        poolAddress: params.poolAddress,
        oracle: params.oracle,
        paymentMint: params.paymentMint,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodePoolOracleFeeVaultAccount(pda.toBase58(), account.data);
    },

    async fetchPoolOraclePermissionSet(params: {
      poolAddress: string;
      oracle: string;
    }): Promise<ProtocolPoolOraclePermissionSetAccount | null> {
      const [pda] = derivePoolOraclePermissionSetPda({
        programId,
        poolAddress: params.poolAddress,
        oracle: params.oracle,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodePoolOraclePermissionSetAccount(pda.toBase58(), account.data);
    },

    async fetchOutcomeSchema(
      schemaKeyHashHex: string,
    ): Promise<ProtocolOutcomeSchemaRegistryEntryAccount | null> {
      const [pda] = deriveSchemaPda({
        programId,
        schemaKeyHash: fromHex(schemaKeyHashHex, 32),
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodeOutcomeSchemaAccount(pda.toBase58(), account.data);
    },

    async fetchSchemaDependencyLedger(
      schemaKeyHashHex: string,
    ): Promise<ProtocolSchemaDependencyLedgerAccount | null> {
      const [pda] = deriveSchemaDependencyPda({
        programId,
        schemaKeyHash: fromHex(schemaKeyHashHex, 32),
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodeSchemaDependencyLedgerAccount(pda.toBase58(), account.data);
    },

    async fetchPoolOutcomeRule(params: {
      poolAddress: string;
      seriesRefHashHex: string;
      ruleHashHex: string;
    }): Promise<ProtocolPoolOutcomeRuleAccount | null> {
      const [pda] = derivePoolRulePda({
        programId,
        poolAddress: params.poolAddress,
        seriesRefHash: fromHex(params.seriesRefHashHex, 32),
        ruleHash: fromHex(params.ruleHashHex, 32),
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodePoolOutcomeRuleAccount(pda.toBase58(), account.data);
    },

    async fetchInviteIssuer(
      issuer: string,
    ): Promise<ProtocolInviteIssuerRegistryEntryAccount | null> {
      const [pda] = deriveInviteIssuerPda({
        programId,
        issuer,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodeInviteIssuerAccount(pda.toBase58(), account.data);
    },

    async fetchEnrollmentPermitReplay(params: {
      poolAddress: string;
      member: string;
      nonceHashHex: string;
    }): Promise<ProtocolEnrollmentPermitReplayAccount | null> {
      const [pda] = deriveEnrollmentReplayPda({
        programId,
        poolAddress: params.poolAddress,
        member: params.member,
        nonceHash: fromHex(params.nonceHashHex, 32),
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodeEnrollmentPermitReplayAccount(pda.toBase58(), account.data);
    },

    async fetchAttestationVote(params: {
      poolAddress: string;
      seriesRefHashHex: string;
      member: string;
      cycleHashHex: string;
      ruleHashHex: string;
      oracle: string;
    }): Promise<ProtocolAttestationVoteAccount | null> {
      const [pda] = deriveAttestationVotePda({
        programId,
        poolAddress: params.poolAddress,
        seriesRefHash: fromHex(params.seriesRefHashHex, 32),
        member: params.member,
        cycleHash: fromHex(params.cycleHashHex, 32),
        ruleHash: fromHex(params.ruleHashHex, 32),
        oracle: params.oracle,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodeAttestationVoteAccount(pda.toBase58(), account.data);
    },

    async fetchClaimDelegate(params: {
      poolAddress: string;
      member: string;
    }): Promise<ProtocolClaimDelegateAuthorizationAccount | null> {
      const [pda] = deriveClaimDelegatePda({
        programId,
        poolAddress: params.poolAddress,
        member: params.member,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodeClaimDelegateAccount(pda.toBase58(), account.data);
    },

    async fetchClaimRecord(params: {
      poolAddress: string;
      seriesRefHashHex: string;
      member: string;
      cycleHashHex: string;
      ruleHashHex: string;
    }): Promise<ProtocolClaimRecordAccount | null> {
      const [pda] = deriveClaimPda({
        programId,
        poolAddress: params.poolAddress,
        seriesRefHash: fromHex(params.seriesRefHashHex, 32),
        member: params.member,
        cycleHash: fromHex(params.cycleHashHex, 32),
        ruleHash: fromHex(params.ruleHashHex, 32),
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodeClaimRecordAccount(pda.toBase58(), account.data);
    },

    async fetchPolicySeries(params: {
      poolAddress: string;
      seriesRefHashHex: string;
    }): Promise<ProtocolPolicySeriesAccount | null> {
      const [pda] = derivePolicySeriesPda({
        programId,
        poolAddress: params.poolAddress,
        seriesRefHash: fromHex(params.seriesRefHashHex, 32),
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodePolicySeriesAccount(pda.toBase58(), account.data);
    },

    async fetchPolicySeriesPaymentOption(params: {
      poolAddress: string;
      seriesRefHashHex: string;
      paymentMint: string;
    }): Promise<ProtocolPolicySeriesPaymentOptionAccount | null> {
      const [pda] = derivePolicySeriesPaymentOptionPda({
        programId,
        poolAddress: params.poolAddress,
        seriesRefHash: fromHex(params.seriesRefHashHex, 32),
        paymentMint: params.paymentMint,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodePolicySeriesPaymentOptionAccount(pda.toBase58(), account.data);
    },

    async fetchPolicyPosition(params: {
      poolAddress: string;
      seriesRefHashHex: string;
      member: string;
    }): Promise<ProtocolPolicyPositionAccount | null> {
      const [pda] = derivePolicyPositionPda({
        programId,
        poolAddress: params.poolAddress,
        seriesRefHash: fromHex(params.seriesRefHashHex, 32),
        member: params.member,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodePolicyPositionAccount(pda.toBase58(), account.data);
    },

    async fetchPolicyPositionNft(params: {
      poolAddress: string;
      seriesRefHashHex: string;
      member: string;
    }): Promise<ProtocolPolicyPositionNftAccount | null> {
      const [pda] = derivePolicyPositionNftPda({
        programId,
        poolAddress: params.poolAddress,
        seriesRefHash: fromHex(params.seriesRefHashHex, 32),
        member: params.member,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodePolicyPositionNftAccount(pda.toBase58(), account.data);
    },

    async fetchPremiumLedger(params: {
      poolAddress: string;
      seriesRefHashHex: string;
      member: string;
    }): Promise<ProtocolPremiumLedgerAccount | null> {
      const [pda] = derivePremiumLedgerPda({
        programId,
        poolAddress: params.poolAddress,
        seriesRefHash: fromHex(params.seriesRefHashHex, 32),
        member: params.member,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodePremiumLedgerAccount(pda.toBase58(), account.data);
    },

    async fetchPremiumAttestationReplay(params: {
      poolAddress: string;
      seriesRefHashHex: string;
      member: string;
      replayHashHex: string;
    }): Promise<ProtocolPremiumAttestationReplayAccount | null> {
      const [pda] = derivePremiumReplayPda({
        programId,
        poolAddress: params.poolAddress,
        seriesRefHash: fromHex(params.seriesRefHashHex, 32),
        member: params.member,
        replayHash: fromHex(params.replayHashHex, 32),
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodePremiumAttestationReplayAccount(pda.toBase58(), account.data);
    },

    async fetchMemberCycle(params: {
      poolAddress: string;
      seriesRefHashHex: string;
      member: string;
      periodIndex: bigint | number;
    }): Promise<ProtocolMemberCycleAccount | null> {
      const [pda] = deriveMemberCyclePda({
        programId,
        poolAddress: params.poolAddress,
        seriesRefHash: fromHex(params.seriesRefHashHex, 32),
        member: params.member,
        periodIndex: typeof params.periodIndex === 'bigint'
          ? params.periodIndex
          : BigInt(params.periodIndex),
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodeMemberCycleAccount(pda.toBase58(), account.data);
    },

    async fetchMemberCycleByAddress(
      address: string,
    ): Promise<ProtocolMemberCycleAccount | null> {
      const key = new PublicKey(address);
      const account = await connection.getAccountInfo(key, 'confirmed');
      if (!account) return null;
      return decodeMemberCycleAccount(key.toBase58(), account.data);
    },

    async fetchCycleQuoteReplay(params: {
      poolAddress: string;
      seriesRefHashHex: string;
      member: string;
      nonceHashHex: string;
    }): Promise<ProtocolCycleQuoteReplayAccount | null> {
      const [pda] = deriveCycleQuoteReplayPda({
        programId,
        poolAddress: params.poolAddress,
        seriesRefHash: fromHex(params.seriesRefHashHex, 32),
        member: params.member,
        nonceHash: fromHex(params.nonceHashHex, 32),
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodeCycleQuoteReplayAccount(pda.toBase58(), account.data);
    },

    async fetchPoolTreasuryReserve(params: {
      poolAddress: string;
      paymentMint: string;
    }): Promise<ProtocolPoolTreasuryReserveAccount | null> {
      const [pda] = derivePoolTreasuryReservePda({
        programId,
        poolAddress: params.poolAddress,
        paymentMint: params.paymentMint,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodePoolTreasuryReserveAccount(pda.toBase58(), account.data);
    },

    async fetchRedemptionRequest(params: {
      poolAddress: string;
      redeemer: string;
      requestHashHex: string;
    }): Promise<ProtocolPoolRedemptionRequestAccount | null> {
      const [pda] = deriveRedemptionRequestPda({
        programId,
        poolAddress: params.poolAddress,
        redeemer: params.redeemer,
        requestHash: fromHex(params.requestHashHex, 32),
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodePoolRedemptionRequestAccount(pda.toBase58(), account.data);
    },

    async fetchCohortSettlementRoot(params: {
      poolAddress: string;
      seriesRefHashHex: string;
      cohortHashHex: string;
    }): Promise<ProtocolCohortSettlementRootAccount | null> {
      const [pda] = deriveCohortSettlementRootPda({
        programId,
        poolAddress: params.poolAddress,
        seriesRefHash: fromHex(params.seriesRefHashHex, 32),
        cohortHash: fromHex(params.cohortHashHex, 32),
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodeCohortSettlementRootAccount(pda.toBase58(), account.data);
    },

    async fetchCoverageClaimRecord(params: {
      poolAddress: string;
      seriesRefHashHex: string;
      member: string;
      intentHashHex: string;
    }): Promise<ProtocolCoverageClaimRecordAccount | null> {
      const [pda] = deriveCoverageClaimPda({
        programId,
        poolAddress: params.poolAddress,
        seriesRefHash: fromHex(params.seriesRefHashHex, 32),
        member: params.member,
        intentHash: fromHex(params.intentHashHex, 32),
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodeCoverageClaimRecordAccount(pda.toBase58(), account.data);
    },
  };
}

export function derivePoolAddress(params: {
  programId: string;
  authority: string;
  poolId: string;
}): string {
  const [pool] = derivePoolPda({
    programId: params.programId,
    authority: params.authority,
    poolId: params.poolId,
  });
  return pool.toBase58();
}
