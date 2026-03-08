import {
  Connection,
  Ed25519Program,
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

import type {
  BuildAttestPremiumPaidOffchainTxParams,
  BuildActivateCycleWithQuoteSolTxParams,
  BuildActivateCycleWithQuoteSplTxParams,
  BuildCreateCoveragePolicyTxParams,
  BuildClaimOracleV2TxParams,
  BuildCreatePoolTxParams,
  BuildCreatePoolV2TxParams,
  BuildEnrollMemberTxParams,
  BuildEnrollMemberInvitePermitTxParams,
  BuildEnrollMemberOpenTxParams,
  BuildEnrollMemberTokenGateTxParams,
  BuildFinalizeUnstakeTxParams,
  BuildFundPoolSolTxParams,
  BuildFundPoolSplTxParams,
  BuildFundPoolTxParams,
  BuildInitializeProtocolV2TxParams,
  BuildInitializeProtocolTxParams,
  BuildIssueCoveragePolicyFromProductV2TxParams,
  BuildMintPolicyNftTxParams,
  BuildMigrateMembershipV1ToV2TxParams,
  BuildMigratePoolV1ToV2TxParams,
  BuildPayPremiumOnchainTxParams,
  BuildRegisterCoverageProductV2TxParams,
  BuildRegisterInviteIssuerTxParams,
  BuildRegisterOutcomeSchemaTxParams,
  BuildRegisterOracleTxParams,
  BuildRegisterOracleV2TxParams,
  BuildRequestUnstakeTxParams,
  BuildRotateGovernanceAuthorityTxParams,
  BuildRevokeMemberTxParams,
  BuildSetClaimDelegateTxParams,
  BuildSetCycleWindowTxParams,
  BuildSetPoolOraclePolicyTxParams,
  BuildSetPoolOracleTxParams,
  BuildSetPoolTermsHashTxParams,
  BuildSetPoolStatusTxParams,
  BuildSetProtocolParamsTxParams,
  BuildSetProtocolPauseTxParams,
  BuildSetPoolCoverageReserveFloorTxParams,
  BuildSettleCycleCommitmentSolTxParams,
  BuildSettleCycleCommitmentTxParams,
  BuildSettleCoverageClaimTxParams,
  BuildSlashOracleTxParams,
  BuildStakeOracleTxParams,
  BuildSubmitCoverageClaimTxParams,
  BuildSubscribeCoverageProductV2TxParams,
  BuildSubmitRewardClaimTxParams,
  BuildUpdateCoverageProductV2TxParams,
  BuildUpdateOracleProfileV2TxParams,
  BuildVerifyOutcomeSchemaTxParams,
  BuildUpdateOracleMetadataTxParams,
  BuildSetPoolOutcomeRuleTxParams,
  BuildSubmitClaimTxParams,
  BuildSubmitOutcomeAttestationVoteTxParams,
  BuildFinalizeCycleOutcomeTxParams,
  BuildSubmitOutcomeAttestationTxParams,
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
  ProtocolCoveragePolicyPositionNftAccount,
  ProtocolCoverageProductAccount,
  ProtocolCycleQuoteReplayAccount,
  ProtocolAttestationVoteAccount,
  ProtocolClaimRecordV2Account,
  ProtocolConfigAccount,
  ProtocolConfigV2Account,
  ProtocolCoveragePolicyAccount,
  ProtocolCycleOutcomeAccount,
  ProtocolCycleWindowAccount,
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
  ProtocolPoolOracleFeeVaultAccount,
  ProtocolPoolOraclePermissionSetAccount,
  ProtocolPoolOraclePolicyAccount,
  ProtocolPoolTreasuryReserveAccount,
  ProtocolFeeVaultAccount,
  ProtocolPoolTermsAccount,
  ProtocolPoolOracleApprovalAccount,
  ProtocolPoolType,
  ProtocolPoolOutcomeRuleAccount,
  ProtocolPremiumLedgerAccount,
  ProtocolPremiumAttestationReplayAccount,
  ProtocolOutcomeSchemaRegistryEntryAccount,
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
  deriveClaimDelegatePda,
  deriveClaimV2Pda,
  deriveConfigPda,
  deriveConfigV2Pda,
  deriveCoverageClaimPda,
  deriveCoverageProductPda,
  deriveCoverageNftPda,
  deriveCoveragePolicyPda,
  deriveCycleOutcomePda,
  deriveCycleWindowPda,
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
  derivePoolOraclePermissionSetPda,
  derivePoolOracleFeeVaultPda,
  derivePoolTermsPda,
  derivePoolOraclePolicyPda,
  derivePoolOraclePda,
  derivePoolPda,
  derivePoolRulePda,
  deriveProtocolFeeVaultPda,
  derivePremiumLedgerPda,
  derivePremiumReplayPda,
  derivePoolTreasuryReservePda,
  deriveReplayPda,
  deriveSchemaPda,
  ZERO_PUBKEY,
} from './protocol_seeds.js';

const MAX_POOL_ID_SEED_BYTES = 32;
const MAX_ORACLE_SUPPORTED_SCHEMAS = 16;
export const PROTOCOL_PROGRAM_ID = 'Bn6eixac1QEEVErGBvBjxAd6pgB9e2q4XHvAkinQ5y1B';

const IX_INITIALIZE_PROTOCOL = anchorDiscriminator('global', 'initialize_protocol');
const IX_SET_PROTOCOL_PAUSE = anchorDiscriminator('global', 'set_protocol_pause');
const IX_CREATE_POOL = anchorDiscriminator('global', 'create_pool');
const IX_SET_POOL_STATUS = anchorDiscriminator('global', 'set_pool_status');
const IX_SET_CYCLE_WINDOW = anchorDiscriminator('global', 'set_cycle_window');
const IX_FUND_POOL = anchorDiscriminator('global', 'fund_pool');
const IX_REGISTER_ORACLE = anchorDiscriminator('global', 'register_oracle');
const IX_REGISTER_ORACLE_V2 = anchorDiscriminator('global', 'register_oracle_v2');
const IX_CLAIM_ORACLE_V2 = anchorDiscriminator('global', 'claim_oracle_v2');
const IX_UPDATE_ORACLE_PROFILE_V2 = anchorDiscriminator('global', 'update_oracle_profile_v2');
const IX_SET_POOL_ORACLE = anchorDiscriminator('global', 'set_pool_oracle');
const IX_ENROLL_MEMBER = anchorDiscriminator('global', 'enroll_member');
const IX_REVOKE_MEMBER = anchorDiscriminator('global', 'revoke_member');
const IX_SUBMIT_OUTCOME_ATTESTATION = anchorDiscriminator('global', 'submit_outcome_attestation');
const IX_SUBMIT_CLAIM = anchorDiscriminator('global', 'submit_claim');
const IX_SUBMIT_OUTCOME_ATTESTATION_VOTE = anchorDiscriminator('global', 'submit_outcome_attestation_vote');
const IX_FINALIZE_CYCLE_OUTCOME = anchorDiscriminator('global', 'finalize_cycle_outcome');
const IX_INITIALIZE_PROTOCOL_V2 = anchorDiscriminator('global', 'initialize_protocol_v2');
const IX_SET_PROTOCOL_PARAMS = anchorDiscriminator('global', 'set_protocol_params');
const IX_ROTATE_GOVERNANCE_AUTHORITY = anchorDiscriminator('global', 'rotate_governance_authority');
const IX_UPDATE_ORACLE_METADATA = anchorDiscriminator('global', 'update_oracle_metadata');
const IX_STAKE_ORACLE = anchorDiscriminator('global', 'stake_oracle');
const IX_REQUEST_UNSTAKE = anchorDiscriminator('global', 'request_unstake');
const IX_FINALIZE_UNSTAKE = anchorDiscriminator('global', 'finalize_unstake');
const IX_SLASH_ORACLE = anchorDiscriminator('global', 'slash_oracle');
const IX_CREATE_POOL_V2 = anchorDiscriminator('global', 'create_pool_v2');
const IX_SET_POOL_ORACLE_POLICY = anchorDiscriminator('global', 'set_pool_oracle_policy');
const IX_SET_POOL_COVERAGE_RESERVE_FLOOR = anchorDiscriminator('global', 'set_pool_coverage_reserve_floor');
const IX_SET_POOL_TERMS_HASH = anchorDiscriminator('global', 'set_pool_terms_hash');
const IX_REGISTER_OUTCOME_SCHEMA = anchorDiscriminator('global', 'register_outcome_schema');
const IX_VERIFY_OUTCOME_SCHEMA = anchorDiscriminator('global', 'verify_outcome_schema');
const IX_SET_POOL_OUTCOME_RULE = anchorDiscriminator('global', 'set_pool_outcome_rule');
const IX_REGISTER_INVITE_ISSUER = anchorDiscriminator('global', 'register_invite_issuer');
const IX_ENROLL_MEMBER_OPEN = anchorDiscriminator('global', 'enroll_member_open');
const IX_ENROLL_MEMBER_TOKEN_GATE = anchorDiscriminator('global', 'enroll_member_token_gate');
const IX_ENROLL_MEMBER_INVITE_PERMIT = anchorDiscriminator('global', 'enroll_member_invite_permit');
const IX_SET_CLAIM_DELEGATE = anchorDiscriminator('global', 'set_claim_delegate');
const IX_FUND_POOL_SOL = anchorDiscriminator('global', 'fund_pool_sol');
const IX_FUND_POOL_SPL = anchorDiscriminator('global', 'fund_pool_spl');
const IX_SUBMIT_REWARD_CLAIM = anchorDiscriminator('global', 'submit_reward_claim');
const IX_REGISTER_COVERAGE_PRODUCT_V2 = anchorDiscriminator('global', 'register_coverage_product_v2');
const IX_UPDATE_COVERAGE_PRODUCT_V2 = anchorDiscriminator('global', 'update_coverage_product_v2');
const IX_SUBSCRIBE_COVERAGE_PRODUCT_V2 = anchorDiscriminator('global', 'subscribe_coverage_product_v2');
const IX_ISSUE_COVERAGE_POLICY_FROM_PRODUCT_V2 = anchorDiscriminator('global', 'issue_coverage_policy_from_product_v2');
const IX_CREATE_COVERAGE_POLICY = anchorDiscriminator('global', 'create_coverage_policy');
const IX_MINT_POLICY_NFT = anchorDiscriminator('global', 'mint_policy_nft');
const IX_PAY_PREMIUM_ONCHAIN = anchorDiscriminator('global', 'pay_premium_onchain');
const IX_ATTEST_PREMIUM_PAID_OFFCHAIN = anchorDiscriminator('global', 'attest_premium_paid_offchain');
const IX_SUBMIT_COVERAGE_CLAIM = anchorDiscriminator('global', 'submit_coverage_claim');
const IX_SETTLE_COVERAGE_CLAIM = anchorDiscriminator('global', 'settle_coverage_claim');
const IX_MIGRATE_POOL_V1_TO_V2 = anchorDiscriminator('global', 'migrate_pool_v1_to_v2');
const IX_MIGRATE_MEMBERSHIP_V1_TO_V2 = anchorDiscriminator('global', 'migrate_membership_v1_to_v2');
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
const ACCOUNT_CYCLE_WINDOW = anchorDiscriminator('account', 'CycleWindow');
const ACCOUNT_CLAIM_RECORD = anchorDiscriminator('account', 'ClaimRecord');
const ACCOUNT_CYCLE_OUTCOME_AGGREGATE = anchorDiscriminator('account', 'CycleOutcomeAggregate');
const ACCOUNT_PROTOCOL_CONFIG_V2 = anchorDiscriminator('account', 'ProtocolConfigV2');
const ACCOUNT_ORACLE_STAKE_POSITION = anchorDiscriminator('account', 'OracleStakePosition');
const ACCOUNT_POOL_ORACLE_POLICY = anchorDiscriminator('account', 'PoolOraclePolicy');
const ACCOUNT_POOL_TERMS = anchorDiscriminator('account', 'PoolTerms');
const ACCOUNT_POOL_ASSET_VAULT = anchorDiscriminator('account', 'PoolAssetVault');
const ACCOUNT_PROTOCOL_FEE_VAULT = anchorDiscriminator('account', 'ProtocolFeeVault');
const ACCOUNT_POOL_ORACLE_FEE_VAULT = anchorDiscriminator('account', 'PoolOracleFeeVault');
const ACCOUNT_OUTCOME_SCHEMA = anchorDiscriminator('account', 'OutcomeSchemaRegistryEntry');
const ACCOUNT_POOL_OUTCOME_RULE = anchorDiscriminator('account', 'PoolOutcomeRule');
const ACCOUNT_INVITE_ISSUER = anchorDiscriminator('account', 'InviteIssuerRegistryEntry');
const ACCOUNT_CLAIM_DELEGATE_AUTH = anchorDiscriminator('account', 'ClaimDelegateAuthorization');
const ACCOUNT_CLAIM_RECORD_V2 = anchorDiscriminator('account', 'ClaimRecordV2');
const ACCOUNT_COVERAGE_CLAIM_RECORD = anchorDiscriminator('account', 'CoverageClaimRecord');
const ACCOUNT_COVERAGE_POLICY_POSITION_NFT = anchorDiscriminator('account', 'CoveragePolicyPositionNft');
const ACCOUNT_COVERAGE_PRODUCT = anchorDiscriminator('account', 'CoverageProduct');
const ACCOUNT_ENROLLMENT_PERMIT_REPLAY = anchorDiscriminator('account', 'EnrollmentPermitReplay');
const ACCOUNT_ATTESTATION_VOTE = anchorDiscriminator('account', 'AttestationVote');
const ACCOUNT_COVERAGE_POLICY = anchorDiscriminator('account', 'CoveragePolicy');
const ACCOUNT_PREMIUM_LEDGER = anchorDiscriminator('account', 'PremiumLedger');
const ACCOUNT_PREMIUM_ATTESTATION_REPLAY = anchorDiscriminator('account', 'PremiumAttestationReplay');
const ACCOUNT_POOL_ORACLE_PERMISSION_SET = anchorDiscriminator('account', 'PoolOraclePermissionSet');
const ACCOUNT_MEMBER_CYCLE = anchorDiscriminator('account', 'MemberCycleState');
const ACCOUNT_CYCLE_QUOTE_REPLAY = anchorDiscriminator('account', 'CycleQuoteReplay');
const ACCOUNT_POOL_TREASURY_RESERVE = anchorDiscriminator('account', 'PoolTreasuryReserve');

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
    Buffer.from('omegax:cycle_quote:v1', 'utf8'),
    asPubkey(fields.poolAddress).toBuffer(),
    asPubkey(fields.member).toBuffer(),
    Buffer.from(fromHex(fields.productIdHashHex, 32)),
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
    encodeI64Le(fields.expiresAtTs),
    Buffer.from(fromHex(fields.nonceHashHex, 32)),
    Buffer.from(fromHex(fields.quoteMetaHashHex, 32)),
  ]);
}

function hasDiscriminator(data: Buffer, discriminator: Buffer): boolean {
  if (data.length < 8) return false;
  return discriminator.equals(data.subarray(0, 8));
}

function decodeProtocolConfigAccount(address: string, data: Buffer): ProtocolConfigAccount {
  if (!hasDiscriminator(data, ACCOUNT_PROTOCOL_CONFIG)) {
    throw new Error('account discriminator mismatch for ProtocolConfig');
  }

  let offset = 8;
  const admin = pubkeyFromData(data, offset);
  offset += 32;
  const protocolFeeBps = readU16Le(data, offset);
  offset += 2;
  const emergencyPaused = data.readUInt8(offset) === 1;
  offset += 1;
  const bump = data.readUInt8(offset);

  return {
    address,
    admin,
    protocolFeeBps,
    emergencyPaused,
    bump,
  };
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

function decodeCycleWindowAccount(address: string, data: Buffer): ProtocolCycleWindowAccount {
  if (!hasDiscriminator(data, ACCOUNT_CYCLE_WINDOW)) {
    throw new Error('account discriminator mismatch for CycleWindow');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;

  const cycleHash = data.subarray(offset, offset + 32);
  offset += 32;

  const authority = pubkeyFromData(data, offset);
  offset += 32;

  const claimOpenTs = Number(readI64Le(data, offset));
  offset += 8;
  const claimCloseTs = Number(readI64Le(data, offset));
  offset += 8;

  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    cycleHashHex: toHex(cycleHash),
    authority,
    claimOpenTs,
    claimCloseTs,
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

  const member = pubkeyFromData(data, offset);
  offset += 32;

  const cycleHash = data.subarray(offset, offset + 32);
  offset += 32;

  const claimIntent = data.subarray(offset, offset + 32);
  offset += 32;

  const payoutLamports = readU64Le(data, offset);
  offset += 8;

  const passCount = data.readUInt32LE(offset);
  offset += 4;

  const submittedAt = Number(readI64Le(data, offset));
  offset += 8;

  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    member,
    cycleHashHex: toHex(cycleHash),
    claimIntentHex: toHex(claimIntent),
    payoutLamports,
    passCount,
    submittedAt,
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
  const latestAsOfTs = Number(readI64Le(data, offset));
  offset += 8;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
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
    latestAsOfTs,
    bump,
  };
}

function decodeProtocolConfigV2Account(address: string, data: Buffer): ProtocolConfigV2Account {
  if (!hasDiscriminator(data, ACCOUNT_PROTOCOL_CONFIG_V2)) {
    throw new Error('account discriminator mismatch for ProtocolConfigV2');
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
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    quorumM,
    quorumN,
    requireVerifiedSchema,
    oracleFeeBps,
    allowDelegateClaim,
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
  const productIdHashHex = toHex(data.subarray(offset, offset + 32));
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
    productIdHashHex,
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
  const manualCoverageReserveAmount = readU64Le(data, offset);
  offset += 8;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    paymentMint,
    reservedRefundAmount,
    reservedRewardAmount,
    manualCoverageReserveAmount,
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
    metadataUri: metadataUri.value,
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
  const payoutHash = data.subarray(offset, offset + 32);
  offset += 32;
  const enabled = data.readUInt8(offset) === 1;
  offset += 1;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    ruleHashHex: toHex(ruleHash),
    schemaKeyHashHex: toHex(schemaKeyHash),
    ruleId: ruleId.value,
    schemaKey: schemaKey.value,
    schemaVersion,
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
  const asOfTs = Number(readI64Le(data, offset));
  offset += 8;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    member,
    cycleHashHex: toHex(cycleHash),
    ruleHashHex: toHex(ruleHash),
    oracle,
    passed,
    attestationDigestHex: toHex(attestationDigest),
    observedValueHashHex: toHex(observedValueHash),
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

function decodeCoveragePolicyAccount(
  address: string,
  data: Buffer,
): ProtocolCoveragePolicyAccount {
  if (!hasDiscriminator(data, ACCOUNT_COVERAGE_POLICY)) {
    throw new Error('account discriminator mismatch for CoveragePolicy');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const member = pubkeyFromData(data, offset);
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
    member,
    periodIndex,
    amount,
    source,
    paidAt,
    bump,
  };
}

function decodeClaimRecordV2Account(address: string, data: Buffer): ProtocolClaimRecordV2Account {
  if (!hasDiscriminator(data, ACCOUNT_CLAIM_RECORD_V2)) {
    throw new Error('account discriminator mismatch for ClaimRecordV2');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
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

function decodeCoverageProductAccount(
  address: string,
  data: Buffer,
): ProtocolCoverageProductAccount {
  if (!hasDiscriminator(data, ACCOUNT_COVERAGE_PRODUCT)) {
    throw new Error('account discriminator mismatch for CoverageProduct');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const admin = pubkeyFromData(data, offset);
  offset += 32;
  const productIdHash = data.subarray(offset, offset + 32);
  offset += 32;
  const active = data.readUInt8(offset) === 1;
  offset += 1;
  const displayName = readString(data, offset);
  offset = displayName.offset;
  const metadataUri = readString(data, offset);
  offset = metadataUri.offset;
  const termsHash = data.subarray(offset, offset + 32);
  offset += 32;
  const durationSecs = Number(readI64Le(data, offset));
  offset += 8;
  const premiumDueEverySecs = Number(readI64Le(data, offset));
  offset += 8;
  const premiumGraceSecs = Number(readI64Le(data, offset));
  offset += 8;
  const premiumAmount = readU64Le(data, offset);
  offset += 8;
  const createdAtTs = Number(readI64Le(data, offset));
  offset += 8;
  const updatedAtTs = Number(readI64Le(data, offset));
  offset += 8;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    admin,
    productIdHashHex: toHex(productIdHash),
    active,
    displayName: displayName.value,
    metadataUri: metadataUri.value,
    termsHashHex: toHex(termsHash),
    durationSecs,
    premiumDueEverySecs,
    premiumGraceSecs,
    premiumAmount,
    createdAtTs,
    updatedAtTs,
    bump,
  };
}

function decodeCoveragePolicyPositionNftAccount(
  address: string,
  data: Buffer,
): ProtocolCoveragePolicyPositionNftAccount {
  if (!hasDiscriminator(data, ACCOUNT_COVERAGE_POLICY_POSITION_NFT)) {
    throw new Error('account discriminator mismatch for CoveragePolicyPositionNft');
  }

  let offset = 8;
  const pool = pubkeyFromData(data, offset);
  offset += 32;
  const member = pubkeyFromData(data, offset);
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
  const member = pubkeyFromData(data, offset);
  offset += 32;
  const periodIndex = readU64Le(data, offset);
  offset += 8;
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
    member,
    periodIndex,
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
  const member = pubkeyFromData(data, offset);
  offset += 32;
  const claimant = pubkeyFromData(data, offset);
  offset += 32;
  const intentHash = data.subarray(offset, offset + 32);
  offset += 32;
  const eventHash = data.subarray(offset, offset + 32);
  offset += 32;
  const status = data.readUInt8(offset);
  offset += 1;
  const submittedAt = Number(readI64Le(data, offset));
  offset += 8;
  const settledAt = Number(readI64Le(data, offset));
  offset += 8;
  const bump = data.readUInt8(offset);

  return {
    address,
    pool,
    member,
    claimant,
    intentHashHex: toHex(intentHash),
    eventHashHex: toHex(eventHash),
    status,
    submittedAt,
    settledAt,
    bump,
  };
}

function toUnixTimestamp(value: string): bigint {
  const millis = new Date(value).getTime();
  if (!Number.isFinite(millis) || Number.isNaN(millis)) {
    throw new Error('invalid ISO timestamp');
  }
  return BigInt(Math.floor(millis / 1000));
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

function encodeInitializeProtocolData(params: BuildInitializeProtocolTxParams): Buffer {
  if (!Number.isInteger(params.protocolFeeBps) || params.protocolFeeBps < 0 || params.protocolFeeBps > 10_000) {
    throw new Error('protocolFeeBps must be an integer between 0 and 10000');
  }
  return Buffer.concat([IX_INITIALIZE_PROTOCOL, encodeU16Le(params.protocolFeeBps)]);
}

function encodeSetProtocolPauseData(params: BuildSetProtocolPauseTxParams): Buffer {
  return Buffer.concat([IX_SET_PROTOCOL_PAUSE, Buffer.from([params.paused ? 1 : 0])]);
}

function encodeCreatePoolData(params: BuildCreatePoolTxParams): Buffer {
  assertPoolIdSeedLength(params.poolId);
  const tokenGateMint = params.tokenGateMint ? asPubkey(params.tokenGateMint) : new PublicKey(ZERO_PUBKEY);
  const inviteIssuer = params.inviteIssuer ? asPubkey(params.inviteIssuer) : new PublicKey(ZERO_PUBKEY);

  return Buffer.concat([
    IX_CREATE_POOL,
    encodeString(params.poolId),
    encodeString(params.organizationRef),
    encodeU64Le(params.payoutLamportsPerPass),
    Buffer.from([params.membershipMode & 0xff]),
    tokenGateMint.toBuffer(),
    encodeU64Le(params.tokenGateMinBalance ?? 0n),
    inviteIssuer.toBuffer(),
  ]);
}

function encodeSetPoolStatusData(params: BuildSetPoolStatusTxParams): Buffer {
  return Buffer.concat([IX_SET_POOL_STATUS, Buffer.from([params.status & 0xff])]);
}

function encodeSetCycleWindowData(params: BuildSetCycleWindowTxParams): Buffer {
  if (!Number.isFinite(params.claimOpenTs) || !Number.isFinite(params.claimCloseTs)) {
    throw new Error('claim window timestamps must be finite numbers');
  }
  const claimOpenTs = BigInt(Math.trunc(params.claimOpenTs));
  const claimCloseTs = BigInt(Math.trunc(params.claimCloseTs));
  if (claimCloseTs <= claimOpenTs) {
    throw new Error('claimCloseTs must be greater than claimOpenTs');
  }
  return Buffer.concat([
    IX_SET_CYCLE_WINDOW,
    Buffer.from(hashStringTo32(params.cycleId)),
    encodeI64Le(claimOpenTs),
    encodeI64Le(claimCloseTs),
  ]);
}

function encodeFundPoolData(params: BuildFundPoolTxParams): Buffer {
  return Buffer.concat([IX_FUND_POOL, encodeU64Le(params.lamports)]);
}

function encodeRegisterOracleData(params: BuildRegisterOracleTxParams): Buffer {
  return Buffer.concat([IX_REGISTER_ORACLE, encodeString(params.metadataUri)]);
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

function encodeRegisterOracleV2Data(params: BuildRegisterOracleV2TxParams): Buffer {
  return Buffer.concat([
    IX_REGISTER_ORACLE_V2,
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

function encodeUpdateOracleProfileV2Data(params: BuildUpdateOracleProfileV2TxParams): Buffer {
  return Buffer.concat([
    IX_UPDATE_ORACLE_PROFILE_V2,
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

function encodeEnrollMemberData(params: BuildEnrollMemberTxParams): Buffer {
  const subjectCommitment = normalize32ByteHexOrHash(params.subjectCommitmentHex, `subject:${params.member}`);
  const inviteCodeHash = params.inviteCodeHashHex
    ? fromHex(params.inviteCodeHashHex, 32)
    : new Uint8Array(32);

  return Buffer.concat([
    IX_ENROLL_MEMBER,
    Buffer.from(subjectCommitment),
    Buffer.from(inviteCodeHash),
  ]);
}

function encodeSubmitOutcomeAttestationData(params: BuildSubmitOutcomeAttestationTxParams): Buffer {
  const cycleHash = hashStringTo32(params.cycleId);
  const outcomeHash = hashStringTo32(params.outcomeId);
  const replayHash = hashStringTo32(params.replayKey);
  const digest = params.attestationDigestHex
    ? Buffer.from(fromHex(params.attestationDigestHex, 32))
    : Buffer.from(hashStringTo32(`${params.cycleId}:${params.outcomeId}:${params.replayKey}`));
  if (digest.length !== 32) {
    throw new Error('attestation digest must be 32 bytes');
  }

  return Buffer.concat([
    IX_SUBMIT_OUTCOME_ATTESTATION,
    asPubkey(params.member).toBuffer(),
    Buffer.from(cycleHash),
    Buffer.from(outcomeHash),
    Buffer.from(replayHash),
    encodeI64Le(toUnixTimestamp(params.asOfIso)),
    Buffer.from([params.passed ? 1 : 0]),
    digest,
  ]);
}

function encodeSubmitClaimData(params: BuildSubmitClaimTxParams): Buffer {
  return Buffer.concat([
    IX_SUBMIT_CLAIM,
    Buffer.from(hashStringTo32(params.cycleId)),
    Buffer.from(hashStringTo32(params.intentId)),
  ]);
}

function encodeSubmitOutcomeAttestationVoteData(
  params: BuildSubmitOutcomeAttestationVoteTxParams,
): Buffer {
  const cycleHash = hashStringTo32(params.cycleId);
  const ruleHash = fromHex(params.ruleHashHex, 32);
  const digest = fromHex(params.attestationDigestHex, 32);
  const observedValueHash = fromHex(params.observedValueHashHex, 32);
  const asOfTs = BigInt(Math.trunc(params.asOfTs));

  return Buffer.concat([
    IX_SUBMIT_OUTCOME_ATTESTATION_VOTE,
    asPubkey(params.member).toBuffer(),
    Buffer.from(cycleHash),
    Buffer.from(ruleHash),
    Buffer.from(digest),
    Buffer.from(observedValueHash),
    encodeI64Le(asOfTs),
    Buffer.from([params.passed ? 1 : 0]),
  ]);
}

function encodeInitializeProtocolV2Data(params: BuildInitializeProtocolV2TxParams): Buffer {
  if (!Number.isInteger(params.protocolFeeBps) || params.protocolFeeBps < 0 || params.protocolFeeBps > 10_000) {
    throw new Error('protocolFeeBps must be an integer between 0 and 10000');
  }
  return Buffer.concat([
    IX_INITIALIZE_PROTOCOL_V2,
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
    encodeI64Le(BigInt(Math.trunc(params.cooldownSeconds))),
  ]);
}

function encodeSlashOracleData(params: BuildSlashOracleTxParams): Buffer {
  return Buffer.concat([IX_SLASH_ORACLE, encodeU64Le(params.amount)]);
}

function encodeCreatePoolV2Data(params: BuildCreatePoolV2TxParams): Buffer {
  assertPoolIdSeedLength(params.poolId);
  return Buffer.concat([
    IX_CREATE_POOL_V2,
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
  ]);
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
    encodeString(params.metadataUri),
  ]);
}

function encodeVerifyOutcomeSchemaData(params: BuildVerifyOutcomeSchemaTxParams): Buffer {
  return Buffer.concat([
    IX_VERIFY_OUTCOME_SCHEMA,
    Buffer.from([params.verified ? 1 : 0]),
  ]);
}

function encodeSetPoolOutcomeRuleData(params: BuildSetPoolOutcomeRuleTxParams): Buffer {
  return Buffer.concat([
    IX_SET_POOL_OUTCOME_RULE,
    Buffer.from(fromHex(params.ruleHashHex, 32)),
    Buffer.from(fromHex(params.schemaKeyHashHex, 32)),
    encodeString(params.ruleId),
    encodeString(params.schemaKey),
    encodeU16Le(params.schemaVersion),
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
    encodeI64Le(BigInt(Math.trunc(params.expiresAtTs))),
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

function encodeSubmitRewardClaimData(params: BuildSubmitRewardClaimTxParams): Buffer {
  return Buffer.concat([
    IX_SUBMIT_REWARD_CLAIM,
    asPubkey(params.member).toBuffer(),
    Buffer.from(hashStringTo32(params.cycleId)),
    Buffer.from(fromHex(params.ruleHashHex, 32)),
    Buffer.from(fromHex(params.intentHashHex, 32)),
    encodeU64Le(params.payoutAmount),
    asPubkey(params.recipient).toBuffer(),
  ]);
}

function encodeRegisterCoverageProductV2Data(params: BuildRegisterCoverageProductV2TxParams): Buffer {
  return Buffer.concat([
    IX_REGISTER_COVERAGE_PRODUCT_V2,
    Buffer.from(fromHex(params.productIdHashHex, 32)),
    encodeString(params.displayName),
    encodeString(params.metadataUri),
    Buffer.from(fromHex(params.termsHashHex, 32)),
    encodeI64Le(BigInt(Math.trunc(params.durationSecs))),
    encodeI64Le(BigInt(Math.trunc(params.premiumDueEverySecs))),
    encodeI64Le(BigInt(Math.trunc(params.premiumGraceSecs))),
    encodeU64Le(params.premiumAmount),
    Buffer.from([params.active ? 1 : 0]),
  ]);
}

function encodeUpdateCoverageProductV2Data(params: BuildUpdateCoverageProductV2TxParams): Buffer {
  return Buffer.concat([
    IX_UPDATE_COVERAGE_PRODUCT_V2,
    encodeString(params.displayName),
    encodeString(params.metadataUri),
    Buffer.from(fromHex(params.termsHashHex, 32)),
    encodeI64Le(BigInt(Math.trunc(params.durationSecs))),
    encodeI64Le(BigInt(Math.trunc(params.premiumDueEverySecs))),
    encodeI64Le(BigInt(Math.trunc(params.premiumGraceSecs))),
    encodeU64Le(params.premiumAmount),
    Buffer.from([params.active ? 1 : 0]),
  ]);
}

function encodeSubscribeCoverageProductV2Data(params: BuildSubscribeCoverageProductV2TxParams): Buffer {
  return Buffer.concat([
    IX_SUBSCRIBE_COVERAGE_PRODUCT_V2,
    Buffer.from(fromHex(params.productIdHashHex, 32)),
    encodeI64Le(BigInt(Math.trunc(params.startsAt))),
  ]);
}

function encodeIssueCoveragePolicyFromProductV2Data(
  params: BuildIssueCoveragePolicyFromProductV2TxParams,
): Buffer {
  return Buffer.concat([
    IX_ISSUE_COVERAGE_POLICY_FROM_PRODUCT_V2,
    asPubkey(params.member).toBuffer(),
    Buffer.from(fromHex(params.productIdHashHex, 32)),
    encodeI64Le(BigInt(Math.trunc(params.startsAt))),
  ]);
}

function encodeCreateCoveragePolicyData(params: BuildCreateCoveragePolicyTxParams): Buffer {
  return Buffer.concat([
    IX_CREATE_COVERAGE_POLICY,
    asPubkey(params.member).toBuffer(),
    Buffer.from(fromHex(params.termsHashHex, 32)),
    encodeI64Le(BigInt(Math.trunc(params.startsAt))),
    encodeI64Le(BigInt(Math.trunc(params.endsAt))),
    encodeI64Le(BigInt(Math.trunc(params.premiumDueEverySecs))),
    encodeI64Le(BigInt(Math.trunc(params.premiumGraceSecs))),
  ]);
}

function encodeMintPolicyNftData(params: BuildMintPolicyNftTxParams): Buffer {
  return Buffer.concat([
    IX_MINT_POLICY_NFT,
    asPubkey(params.nftMint).toBuffer(),
    encodeString(params.metadataUri),
  ]);
}

function encodePayPremiumOnchainData(params: BuildPayPremiumOnchainTxParams): Buffer {
  return Buffer.concat([
    IX_PAY_PREMIUM_ONCHAIN,
    encodeU64Le(params.periodIndex),
    encodeU64Le(params.amount),
  ]);
}

function encodeAttestPremiumPaidOffchainData(
  params: BuildAttestPremiumPaidOffchainTxParams,
): Buffer {
  return Buffer.concat([
    IX_ATTEST_PREMIUM_PAID_OFFCHAIN,
    asPubkey(params.member).toBuffer(),
    encodeU64Le(params.periodIndex),
    Buffer.from(fromHex(params.replayHashHex, 32)),
    encodeU64Le(params.amount),
    encodeI64Le(BigInt(Math.trunc(params.paidAtTs))),
  ]);
}

function encodeSubmitCoverageClaimData(params: BuildSubmitCoverageClaimTxParams): Buffer {
  return Buffer.concat([
    IX_SUBMIT_COVERAGE_CLAIM,
    asPubkey(params.member).toBuffer(),
    Buffer.from(fromHex(params.intentHashHex, 32)),
    Buffer.from(fromHex(params.eventHashHex, 32)),
  ]);
}

function encodeSettleCoverageClaimData(params: BuildSettleCoverageClaimTxParams): Buffer {
  return Buffer.concat([
    IX_SETTLE_COVERAGE_CLAIM,
    encodeU64Le(params.payoutAmount),
  ]);
}

function encodeMigratePoolV1ToV2Data(params: BuildMigratePoolV1ToV2TxParams): Buffer {
  return Buffer.concat([
    IX_MIGRATE_POOL_V1_TO_V2,
    Buffer.from([params.poolType & 0xff]),
    asPubkey(params.payoutAssetMint).toBuffer(),
    Buffer.from(fromHex(params.termsHashHex, 32)),
    Buffer.from(fromHex(params.payoutPolicyHashHex, 32)),
    Buffer.from([params.cycleMode & 0xff]),
    encodeString(params.metadataUri),
  ]);
}

function deriveCoverageProductPaymentOptionPda(params: {
  programId: string | PublicKey;
  poolAddress: string | PublicKey;
  productIdHashHex: string;
  paymentMint: string | PublicKey;
}): [PublicKey, number] {
  const program = asPubkey(params.programId);
  const pool = asPubkey(params.poolAddress);
  const paymentMint = asPubkey(params.paymentMint);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('coverage_product_payment_option'),
      pool.toBuffer(),
      Buffer.from(fromHex(params.productIdHashHex, 32)),
      paymentMint.toBuffer(),
    ],
    program,
  );
}

function buildActivateCycleWithQuoteSolTransaction(
  params: BuildActivateCycleWithQuoteSolTxParams,
): Transaction {
  const programId = asPubkey(params.programId);
  const payer = asPubkey(params.payer);
  const member = asPubkey(params.member);
  const poolAddress = asPubkey(params.poolAddress);
  const oracle = asPubkey(params.oracle);
  const zeroPubkey = asPubkey(ZERO_PUBKEY);
  const [configV2] = deriveConfigV2Pda(programId);
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
  const [coverageProduct] = deriveCoverageProductPda({
    programId,
    poolAddress,
    productIdHash: fromHex(params.productIdHashHex, 32),
  });
  const [coverageProductPaymentOption] = deriveCoverageProductPaymentOptionPda({
    programId,
    poolAddress,
    productIdHashHex: params.productIdHashHex,
    paymentMint: zeroPubkey,
  });
  const [coveragePolicy] = deriveCoveragePolicyPda({ programId, poolAddress, member });
  const [coveragePolicyNft] = deriveCoverageNftPda({ programId, poolAddress, member });
  const [premiumLedger] = derivePremiumLedgerPda({ programId, poolAddress, member });
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
    member,
    periodIndex: params.periodIndex,
  });
  const [cycleQuoteReplay] = deriveCycleQuoteReplayPda({
    programId,
    poolAddress,
    member,
    nonceHash: fromHex(params.nonceHashHex, 32),
  });
  const ed25519Instruction = Ed25519Program.createInstructionWithPrivateKey({
    privateKey: params.oracleSecretKey,
    message: params.quoteMessage,
  });
  const instruction = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: configV2, isSigner: false, isWritable: false },
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
      { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([
      IX_ACTIVATE_CYCLE_WITH_QUOTE_SOL,
      Buffer.from(fromHex(params.productIdHashHex, 32)),
      encodeU64Le(params.periodIndex),
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
      encodeI64Le(params.expiresAtTs),
      Buffer.from(fromHex(params.nonceHashHex, 32)),
      Buffer.from(fromHex(params.quoteMetaHashHex, 32)),
    ]),
  });
  return new Transaction({
    feePayer: payer,
    recentBlockhash: params.recentBlockhash,
  }).add(ed25519Instruction, instruction);
}

function buildActivateCycleWithQuoteSplTransaction(
  params: BuildActivateCycleWithQuoteSplTxParams,
): Transaction {
  const programId = asPubkey(params.programId);
  const payer = asPubkey(params.payer);
  const member = asPubkey(params.member);
  const poolAddress = asPubkey(params.poolAddress);
  const oracle = asPubkey(params.oracle);
  const paymentMint = asPubkey(params.paymentMint);
  const [configV2] = deriveConfigV2Pda(programId);
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
  const [coverageProduct] = deriveCoverageProductPda({
    programId,
    poolAddress,
    productIdHash: fromHex(params.productIdHashHex, 32),
  });
  const [coverageProductPaymentOption] = deriveCoverageProductPaymentOptionPda({
    programId,
    poolAddress,
    productIdHashHex: params.productIdHashHex,
    paymentMint,
  });
  const [coveragePolicy] = deriveCoveragePolicyPda({ programId, poolAddress, member });
  const [coveragePolicyNft] = deriveCoverageNftPda({ programId, poolAddress, member });
  const [premiumLedger] = derivePremiumLedgerPda({ programId, poolAddress, member });
  const [poolAssetVault] = derivePoolAssetVaultPda({
    programId,
    poolAddress,
    payoutMint: paymentMint,
  });
  const poolVaultTokenAccount = deriveAssociatedTokenAddress({
    owner: poolAssetVault,
    mint: paymentMint,
  });
  const payerTokenAccount = deriveAssociatedTokenAddress({
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
    member,
    periodIndex: params.periodIndex,
  });
  const [cycleQuoteReplay] = deriveCycleQuoteReplayPda({
    programId,
    poolAddress,
    member,
    nonceHash: fromHex(params.nonceHashHex, 32),
  });
  const ed25519Instruction = Ed25519Program.createInstructionWithPrivateKey({
    privateKey: params.oracleSecretKey,
    message: params.quoteMessage,
  });
  const instruction = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: configV2, isSigner: false, isWritable: false },
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
      { pubkey: paymentMint, isSigner: false, isWritable: true },
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
      { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([
      IX_ACTIVATE_CYCLE_WITH_QUOTE_SPL,
      Buffer.from(fromHex(params.productIdHashHex, 32)),
      encodeU64Le(params.periodIndex),
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
      encodeI64Le(params.expiresAtTs),
      Buffer.from(fromHex(params.nonceHashHex, 32)),
      Buffer.from(fromHex(params.quoteMetaHashHex, 32)),
    ]),
  });
  return new Transaction({
    feePayer: payer,
    recentBlockhash: params.recentBlockhash,
  }).add(ed25519Instruction, instruction);
}

function buildSettleCycleCommitmentTransaction(
  params: BuildSettleCycleCommitmentTxParams,
): Transaction {
  const programId = asPubkey(params.programId);
  const payer = asPubkey(params.payer);
  const oracle = asPubkey(params.oracle);
  const member = asPubkey(params.member);
  const poolAddress = asPubkey(params.poolAddress);
  const paymentMint = asPubkey(params.paymentMint);
  const [configV2] = deriveConfigV2Pda(programId);
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
    member,
    periodIndex: params.periodIndex,
  });
  const recipientTokenAccount = deriveAssociatedTokenAddress({
    owner: member,
    mint: paymentMint,
  });
  const instruction = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: oracle, isSigner: true, isWritable: true },
      { pubkey: configV2, isSigner: false, isWritable: false },
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
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([
      IX_SETTLE_CYCLE_COMMITMENT,
      Buffer.from(fromHex(params.productIdHashHex, 32)),
      encodeU64Le(params.periodIndex),
      Buffer.from([params.passed ? 1 : 0]),
      Buffer.from([params.shieldConsumed ? 1 : 0]),
    ]),
  });
  return new Transaction({
    feePayer: payer,
    recentBlockhash: params.recentBlockhash,
  }).add(instruction);
}

function buildSettleCycleCommitmentSolTransaction(
  params: BuildSettleCycleCommitmentSolTxParams,
): Transaction {
  const programId = asPubkey(params.programId);
  const payer = asPubkey(params.payer);
  const oracle = asPubkey(params.oracle);
  const member = asPubkey(params.member);
  const poolAddress = asPubkey(params.poolAddress);
  const zeroPubkey = asPubkey(ZERO_PUBKEY);
  const [configV2] = deriveConfigV2Pda(programId);
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
    member,
    periodIndex: params.periodIndex,
  });
  const instruction = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: oracle, isSigner: true, isWritable: true },
      { pubkey: configV2, isSigner: false, isWritable: false },
      { pubkey: poolAddress, isSigner: false, isWritable: true },
      { pubkey: member, isSigner: false, isWritable: false },
      { pubkey: oracleEntry, isSigner: false, isWritable: false },
      { pubkey: poolOracle, isSigner: false, isWritable: false },
      { pubkey: poolOraclePermissions, isSigner: false, isWritable: false },
      { pubkey: poolTreasuryReserve, isSigner: false, isWritable: true },
      { pubkey: member, isSigner: false, isWritable: true },
      { pubkey: memberCycle, isSigner: false, isWritable: true },
    ],
    data: Buffer.concat([
      IX_SETTLE_CYCLE_COMMITMENT_SOL,
      Buffer.from(fromHex(params.productIdHashHex, 32)),
      encodeU64Le(params.periodIndex),
      Buffer.from([params.passed ? 1 : 0]),
      Buffer.from([params.shieldConsumed ? 1 : 0]),
    ]),
  });
  return new Transaction({
    feePayer: payer,
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
  const [configV2] = deriveConfigV2Pda(programId);
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
      { pubkey: configV2, isSigner: false, isWritable: false },
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
  const [configV2] = deriveConfigV2Pda(programId);
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
      { pubkey: configV2, isSigner: false, isWritable: false },
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
  const [configV2] = deriveConfigV2Pda(programId);
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
      { pubkey: configV2, isSigner: false, isWritable: false },
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
  const [configV2] = deriveConfigV2Pda(programId);
  const [protocolFeeVault] = deriveProtocolFeeVaultPda({
    programId,
    paymentMint: zeroPubkey,
  });
  const instruction = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: governanceAuthority, isSigner: true, isWritable: true },
      { pubkey: configV2, isSigner: false, isWritable: false },
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
  const [configV2] = deriveConfigV2Pda(programId);
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
      { pubkey: configV2, isSigner: false, isWritable: false },
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
  const [configV2] = deriveConfigV2Pda(programId);
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
      { pubkey: configV2, isSigner: false, isWritable: false },
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

    buildSetProtocolPauseTx(params: BuildSetProtocolPauseTxParams): Transaction {
      const admin = new PublicKey(params.admin);
      const [configPda] = deriveConfigPda(programId);
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: admin, isSigner: true, isWritable: false },
          { pubkey: configPda, isSigner: false, isWritable: true },
        ],
        data: encodeSetProtocolPauseData(params),
      });

      return new Transaction({
        feePayer: admin,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildCreatePoolTx(params: BuildCreatePoolTxParams): Transaction {
      assertPoolIdSeedLength(params.poolId);
      const authority = new PublicKey(params.authority);
      const [configPda] = deriveConfigPda(programId);
      const [poolPda] = derivePoolPda({
        programId,
        authority,
        poolId: params.poolId,
      });

      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: poolPda, isSigner: false, isWritable: true },
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

    buildSetCycleWindowTx(params: BuildSetCycleWindowTxParams): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const cycleHash = hashStringTo32(params.cycleId);
      const [cycleWindowPda] = deriveCycleWindowPda({
        programId,
        poolAddress,
        cycleHash,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: true },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: cycleWindowPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeSetCycleWindowData(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildFundPoolTx(params: BuildFundPoolTxParams): Transaction {
      const funder = new PublicKey(params.funder);
      const poolAddress = new PublicKey(params.poolAddress);
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: funder, isSigner: true, isWritable: true },
          { pubkey: poolAddress, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeFundPoolData(params),
      });

      return new Transaction({
        feePayer: funder,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildRegisterOracleTx(params: BuildRegisterOracleTxParams): Transaction {
      const oracle = new PublicKey(params.oracle);
      const [oracleEntryPda] = deriveOraclePda({
        programId,
        oracle,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: oracle, isSigner: true, isWritable: true },
          { pubkey: oracleEntryPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeRegisterOracleData(params),
      });

      return new Transaction({
        feePayer: oracle,
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

    buildEnrollMemberTx(params: BuildEnrollMemberTxParams): Transaction {
      const member = new PublicKey(params.member);
      const poolAddress = new PublicKey(params.poolAddress);
      const [membershipPda] = deriveMembershipPda({
        programId,
        poolAddress,
        member,
      });

      const keys: Array<{ pubkey: PublicKey; isSigner: boolean; isWritable: boolean }> = [
        { pubkey: member, isSigner: true, isWritable: true },
        { pubkey: poolAddress, isSigner: false, isWritable: false },
        { pubkey: membershipPda, isSigner: false, isWritable: true },
      ];

      if (params.tokenGateAccount) {
        keys.push({
          pubkey: new PublicKey(params.tokenGateAccount),
          isSigner: false,
          isWritable: false,
        });
      }

      if (params.inviteIssuer) {
        keys.push({
          pubkey: new PublicKey(params.inviteIssuer),
          isSigner: true,
          isWritable: false,
        });
      }

      keys.push({
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      });

      const instruction = new TransactionInstruction({
        programId,
        keys,
        data: encodeEnrollMemberData(params),
      });

      return new Transaction({
        feePayer: member,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildRevokeMemberTx(params: BuildRevokeMemberTxParams): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const member = new PublicKey(params.member);
      const [membershipPda] = deriveMembershipPda({
        programId,
        poolAddress,
        member,
      });

      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: membershipPda, isSigner: false, isWritable: true },
        ],
        data: IX_REVOKE_MEMBER,
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildSubmitOutcomeAttestationTx(params: BuildSubmitOutcomeAttestationTxParams): Transaction {
      const oracle = new PublicKey(params.oracle);
      const member = new PublicKey(params.member);
      const poolAddress = new PublicKey(params.poolAddress);
      const cycleHash = hashStringTo32(params.cycleId);
      const replayHash = hashStringTo32(params.replayKey);

      const [poolOraclePda] = derivePoolOraclePda({
        programId,
        poolAddress,
        oracle,
      });
      const [membershipPda] = deriveMembershipPda({
        programId,
        poolAddress,
        member,
      });
      const [cycleOutcomePda] = deriveCycleOutcomePda({
        programId,
        poolAddress,
        member,
        cycleHash,
      });
      const [replayPda] = deriveReplayPda({
        programId,
        poolAddress,
        replayHash,
      });

      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: oracle, isSigner: true, isWritable: true },
          { pubkey: poolAddress, isSigner: false, isWritable: true },
          { pubkey: poolOraclePda, isSigner: false, isWritable: false },
          { pubkey: membershipPda, isSigner: false, isWritable: false },
          { pubkey: cycleOutcomePda, isSigner: false, isWritable: true },
          { pubkey: replayPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeSubmitOutcomeAttestationData(params),
      });

      return new Transaction({
        feePayer: oracle,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildSubmitClaimTx(params: BuildSubmitClaimTxParams): Transaction {
      const claimant = new PublicKey(params.claimant);
      const poolAddress = new PublicKey(params.poolAddress);
      const cycleHash = hashStringTo32(params.cycleId);

      const [membershipPda] = deriveMembershipPda({
        programId,
        poolAddress,
        member: claimant,
      });
      const [cycleOutcomePda] = deriveCycleOutcomePda({
        programId,
        poolAddress,
        member: claimant,
        cycleHash,
      });
      const [claimPda] = deriveClaimPda({
        programId,
        poolAddress,
        member: claimant,
        cycleHash,
      });
      const [cycleWindowPda] = deriveCycleWindowPda({
        programId,
        poolAddress,
        cycleHash,
      });

      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: claimant, isSigner: true, isWritable: true },
          { pubkey: poolAddress, isSigner: false, isWritable: true },
          { pubkey: membershipPda, isSigner: false, isWritable: false },
          { pubkey: cycleOutcomePda, isSigner: false, isWritable: true },
          { pubkey: cycleWindowPda, isSigner: false, isWritable: false },
          { pubkey: claimPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeSubmitClaimData(params),
      });

      return new Transaction({
        feePayer: claimant,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildSubmitOutcomeAttestationVoteTx(
      params: BuildSubmitOutcomeAttestationVoteTxParams,
    ): Transaction {
      const oracle = new PublicKey(params.oracle);
      const poolAddress = new PublicKey(params.poolAddress);
      const member = new PublicKey(params.member);
      const payoutMint = new PublicKey(params.payoutMint);
      const cycleHash = hashStringTo32(params.cycleId);
      const ruleHash = fromHex(params.ruleHashHex, 32);
      const schemaKeyHash = fromHex(params.schemaKeyHashHex, 32);

      const [oracleEntryPda] = deriveOraclePda({
        programId,
        oracle,
      });
      const [configV2Pda] = deriveConfigV2Pda(programId);
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
      const [membershipPda] = deriveMembershipPda({
        programId,
        poolAddress,
        member,
      });
      const [poolRulePda] = derivePoolRulePda({
        programId,
        poolAddress,
        ruleHash,
      });
      const [schemaPda] = deriveSchemaPda({
        programId,
        schemaKeyHash,
      });
      const [votePda] = deriveAttestationVotePda({
        programId,
        poolAddress,
        member,
        cycleHash,
        ruleHash,
        oracle,
      });
      const [aggregatePda] = deriveOutcomeAggregatePda({
        programId,
        poolAddress,
        member,
        cycleHash,
        ruleHash,
      });

      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: oracle, isSigner: true, isWritable: true },
          { pubkey: oracleEntryPda, isSigner: false, isWritable: false },
          { pubkey: configV2Pda, isSigner: false, isWritable: false },
          { pubkey: stakePositionPda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: poolTermsPda, isSigner: false, isWritable: false },
          { pubkey: poolOraclePolicyPda, isSigner: false, isWritable: false },
          { pubkey: poolTreasuryReservePda, isSigner: false, isWritable: true },
          { pubkey: poolOraclePda, isSigner: false, isWritable: false },
          { pubkey: membershipPda, isSigner: false, isWritable: false },
          { pubkey: poolRulePda, isSigner: false, isWritable: false },
          { pubkey: schemaPda, isSigner: false, isWritable: false },
          { pubkey: votePda, isSigner: false, isWritable: true },
          { pubkey: aggregatePda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeSubmitOutcomeAttestationVoteData(params),
      });

      return new Transaction({
        feePayer: oracle,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildFinalizeCycleOutcomeTx(params: BuildFinalizeCycleOutcomeTxParams): Transaction {
      const payer = new PublicKey(params.payer);
      const poolAddress = new PublicKey(params.poolAddress);
      const member = new PublicKey(params.member);
      const payoutMint = new PublicKey(params.payoutMint);
      const cycleHash = hashStringTo32(params.cycleId);
      const ruleHash = fromHex(params.ruleHashHex, 32);
      const [poolTermsPda] = derivePoolTermsPda({
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
        member,
        cycleHash,
        ruleHash,
      });

      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: payer, isSigner: true, isWritable: true },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: poolTermsPda, isSigner: false, isWritable: false },
          { pubkey: poolTreasuryReservePda, isSigner: false, isWritable: true },
          { pubkey: aggregatePda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: IX_FINALIZE_CYCLE_OUTCOME,
      });

      return new Transaction({
        feePayer: payer,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildInitializeProtocolV2Tx(params: BuildInitializeProtocolV2TxParams): Transaction {
      const admin = new PublicKey(params.admin);
      const [configPda] = deriveConfigV2Pda(programId);
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: admin, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeInitializeProtocolV2Data(params),
      });

      return new Transaction({
        feePayer: admin,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildSetProtocolParamsTx(params: BuildSetProtocolParamsTxParams): Transaction {
      const governanceAuthority = new PublicKey(params.governanceAuthority);
      const [configPda] = deriveConfigV2Pda(programId);
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
      const [configPda] = deriveConfigV2Pda(programId);
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

    buildRegisterOracleV2Tx(params: BuildRegisterOracleV2TxParams): Transaction {
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
        data: encodeRegisterOracleV2Data(params),
      });

      return new Transaction({
        feePayer: admin,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildClaimOracleV2Tx(params: BuildClaimOracleV2TxParams): Transaction {
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
        data: IX_CLAIM_ORACLE_V2,
      });

      return new Transaction({
        feePayer: oracle,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildUpdateOracleProfileV2Tx(params: BuildUpdateOracleProfileV2TxParams): Transaction {
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
        data: encodeUpdateOracleProfileV2Data(params),
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
      const [configV2Pda] = deriveConfigV2Pda(programId);
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
          { pubkey: configV2Pda, isSigner: false, isWritable: false },
          { pubkey: oracleEntryPda, isSigner: false, isWritable: false },
          { pubkey: stakePositionPda, isSigner: false, isWritable: true },
          { pubkey: new PublicKey(params.stakeMint), isSigner: false, isWritable: true },
          { pubkey: new PublicKey(params.stakeVault), isSigner: true, isWritable: true },
          { pubkey: new PublicKey(params.stakerTokenAccount), isSigner: false, isWritable: true },
          { pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false },
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
      const [configV2Pda] = deriveConfigV2Pda(programId);
      const [stakePositionPda] = deriveOracleStakePda({
        programId,
        oracle,
        staker,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: governanceAuthority, isSigner: true, isWritable: false },
          { pubkey: configV2Pda, isSigner: false, isWritable: false },
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

    buildCreatePoolV2Tx(params: BuildCreatePoolV2TxParams): Transaction {
      const authority = new PublicKey(params.authority);
      const [configV2Pda] = deriveConfigV2Pda(programId);
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
          { pubkey: configV2Pda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: true },
          { pubkey: poolTermsPda, isSigner: false, isWritable: true },
          { pubkey: oraclePolicyPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeCreatePoolV2Data(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildSetPoolOraclePolicyTx(params: BuildSetPoolOraclePolicyTxParams): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const [configV2Pda] = deriveConfigV2Pda(programId);
      const [oraclePolicyPda] = derivePoolOraclePolicyPda({
        programId,
        poolAddress,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: false },
          { pubkey: configV2Pda, isSigner: false, isWritable: false },
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

    buildSetPoolCoverageReserveFloorTx(
      params: BuildSetPoolCoverageReserveFloorTxParams,
    ): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const paymentMint = new PublicKey(params.paymentMint);
      const [configV2Pda] = deriveConfigV2Pda(programId);
      const [poolTreasuryReservePda] = derivePoolTreasuryReservePda({
        programId,
        poolAddress,
        paymentMint,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: true },
          { pubkey: configV2Pda, isSigner: false, isWritable: false },
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
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: publisher, isSigner: true, isWritable: true },
          { pubkey: schemaPda, isSigner: false, isWritable: true },
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
      const [configV2Pda] = deriveConfigV2Pda(programId);
      const [schemaPda] = deriveSchemaPda({
        programId,
        schemaKeyHash,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: governanceAuthority, isSigner: true, isWritable: false },
          { pubkey: configV2Pda, isSigner: false, isWritable: false },
          { pubkey: schemaPda, isSigner: false, isWritable: true },
        ],
        data: encodeVerifyOutcomeSchemaData(params),
      });

      return new Transaction({
        feePayer: governanceAuthority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildSetPoolOutcomeRuleTx(params: BuildSetPoolOutcomeRuleTxParams): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const ruleHash = fromHex(params.ruleHashHex, 32);
      const schemaKeyHash = fromHex(params.schemaKeyHashHex, 32);
      const [schemaPda] = deriveSchemaPda({
        programId,
        schemaKeyHash,
      });
      const [poolRulePda] = derivePoolRulePda({
        programId,
        poolAddress,
        ruleHash,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: true },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: schemaPda, isSigner: false, isWritable: false },
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
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: member, isSigner: true, isWritable: true },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: membershipPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
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
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: member, isSigner: true, isWritable: true },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: membershipPda, isSigner: false, isWritable: true },
          { pubkey: new PublicKey(params.tokenGateAccount), isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
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
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: member, isSigner: true, isWritable: true },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: membershipPda, isSigner: false, isWritable: true },
          { pubkey: issuer, isSigner: true, isWritable: false },
          { pubkey: inviteIssuerPda, isSigner: false, isWritable: false },
          { pubkey: replayPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
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
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: funder, isSigner: true, isWritable: true },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: poolTermsPda, isSigner: false, isWritable: false },
          { pubkey: payoutMint, isSigner: false, isWritable: true },
          { pubkey: poolAssetVaultPda, isSigner: false, isWritable: true },
          { pubkey: new PublicKey(params.poolVaultTokenAccount), isSigner: true, isWritable: true },
          { pubkey: new PublicKey(params.funderTokenAccount), isSigner: false, isWritable: true },
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

    buildSubmitRewardClaimTx(params: BuildSubmitRewardClaimTxParams): Transaction {
      validateRewardClaimOptionalAccounts(params);
      const claimant = new PublicKey(params.claimant);
      const poolAddress = new PublicKey(params.poolAddress);
      const member = new PublicKey(params.member);
      const payoutMint = new PublicKey(params.payoutMint);
      const cycleHash = hashStringTo32(params.cycleId);
      const ruleHash = fromHex(params.ruleHashHex, 32);
      const [configV2Pda] = deriveConfigV2Pda(programId);
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
        member,
        cycleHash,
        ruleHash,
      });
      const [claimRecordPda] = deriveClaimV2Pda({
        programId,
        poolAddress,
        member,
        cycleHash,
        ruleHash,
      });
      const [claimDelegatePda] = deriveClaimDelegatePda({
        programId,
        poolAddress,
        member,
      });

      const optionPlaceholder = programId;
      const claimDelegateAccount = params.claimDelegate ? claimDelegatePda : optionPlaceholder;
      const poolAssetVaultAccount = params.poolAssetVault
        ? new PublicKey(params.poolAssetVault)
        : optionPlaceholder;
      const poolVaultTokenAccount = params.poolVaultTokenAccount
        ? new PublicKey(params.poolVaultTokenAccount)
        : optionPlaceholder;
      const recipientTokenAccount = params.recipientTokenAccount
        ? new PublicKey(params.recipientTokenAccount)
        : optionPlaceholder;

      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: claimant, isSigner: true, isWritable: true },
          { pubkey: configV2Pda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: true },
          { pubkey: poolTermsPda, isSigner: false, isWritable: false },
          { pubkey: oraclePolicyPda, isSigner: false, isWritable: false },
          { pubkey: poolTreasuryReservePda, isSigner: false, isWritable: true },
          { pubkey: membershipPda, isSigner: false, isWritable: false },
          { pubkey: aggregatePda, isSigner: false, isWritable: true },
          { pubkey: new PublicKey(params.recipientSystemAccount), isSigner: false, isWritable: true },
          { pubkey: claimDelegateAccount, isSigner: false, isWritable: false },
          { pubkey: poolAssetVaultAccount, isSigner: false, isWritable: false },
          { pubkey: poolVaultTokenAccount, isSigner: false, isWritable: params.poolVaultTokenAccount != null },
          { pubkey: recipientTokenAccount, isSigner: false, isWritable: params.recipientTokenAccount != null },
          { pubkey: claimRecordPda, isSigner: false, isWritable: true },
          { pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeSubmitRewardClaimData(params),
      });

      return new Transaction({
        feePayer: claimant,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildRegisterCoverageProductV2Tx(
      params: BuildRegisterCoverageProductV2TxParams,
    ): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const productIdHash = fromHex(params.productIdHashHex, 32);
      const [configV2Pda] = deriveConfigV2Pda(programId);
      const [coverageProductPda] = deriveCoverageProductPda({
        programId,
        poolAddress,
        productIdHash,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: true },
          { pubkey: configV2Pda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: coverageProductPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeRegisterCoverageProductV2Data(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildUpdateCoverageProductV2Tx(
      params: BuildUpdateCoverageProductV2TxParams,
    ): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const productIdHash = fromHex(params.productIdHashHex, 32);
      const [configV2Pda] = deriveConfigV2Pda(programId);
      const [coverageProductPda] = deriveCoverageProductPda({
        programId,
        poolAddress,
        productIdHash,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: false },
          { pubkey: configV2Pda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: coverageProductPda, isSigner: false, isWritable: true },
        ],
        data: encodeUpdateCoverageProductV2Data(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildSubscribeCoverageProductV2Tx(
      params: BuildSubscribeCoverageProductV2TxParams,
    ): Transaction {
      const member = new PublicKey(params.member);
      const poolAddress = new PublicKey(params.poolAddress);
      const productIdHash = fromHex(params.productIdHashHex, 32);
      const [configV2Pda] = deriveConfigV2Pda(programId);
      const [membershipPda] = deriveMembershipPda({
        programId,
        poolAddress,
        member,
      });
      const [coverageProductPda] = deriveCoverageProductPda({
        programId,
        poolAddress,
        productIdHash,
      });
      const [coveragePolicyPda] = deriveCoveragePolicyPda({
        programId,
        poolAddress,
        member,
      });
      const [coverageNftPda] = deriveCoverageNftPda({
        programId,
        poolAddress,
        member,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: member, isSigner: true, isWritable: true },
          { pubkey: configV2Pda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: membershipPda, isSigner: false, isWritable: false },
          { pubkey: coverageProductPda, isSigner: false, isWritable: false },
          { pubkey: coveragePolicyPda, isSigner: false, isWritable: true },
          { pubkey: coverageNftPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeSubscribeCoverageProductV2Data(params),
      });

      return new Transaction({
        feePayer: member,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildIssueCoveragePolicyFromProductV2Tx(
      params: BuildIssueCoveragePolicyFromProductV2TxParams,
    ): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const member = new PublicKey(params.member);
      const productIdHash = fromHex(params.productIdHashHex, 32);
      const [configV2Pda] = deriveConfigV2Pda(programId);
      const [membershipPda] = deriveMembershipPda({
        programId,
        poolAddress,
        member,
      });
      const [coverageProductPda] = deriveCoverageProductPda({
        programId,
        poolAddress,
        productIdHash,
      });
      const [coveragePolicyPda] = deriveCoveragePolicyPda({
        programId,
        poolAddress,
        member,
      });
      const [coverageNftPda] = deriveCoverageNftPda({
        programId,
        poolAddress,
        member,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: true },
          { pubkey: configV2Pda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: membershipPda, isSigner: false, isWritable: false },
          { pubkey: coverageProductPda, isSigner: false, isWritable: false },
          { pubkey: coveragePolicyPda, isSigner: false, isWritable: true },
          { pubkey: coverageNftPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeIssueCoveragePolicyFromProductV2Data(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildCreateCoveragePolicyTx(params: BuildCreateCoveragePolicyTxParams): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
      const member = new PublicKey(params.member);
      const [configV2Pda] = deriveConfigV2Pda(programId);
      const [coveragePolicyPda] = deriveCoveragePolicyPda({
        programId,
        poolAddress,
        member,
      });
      const [coverageNftPda] = deriveCoverageNftPda({
        programId,
        poolAddress,
        member,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: true },
          { pubkey: configV2Pda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: coveragePolicyPda, isSigner: false, isWritable: true },
          { pubkey: coverageNftPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeCreateCoveragePolicyData(params),
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
      const [configV2Pda] = deriveConfigV2Pda(programId);
      const [coveragePolicyPda] = deriveCoveragePolicyPda({
        programId,
        poolAddress,
        member,
      });
      const [coverageNftPda] = deriveCoverageNftPda({
        programId,
        poolAddress,
        member,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: false },
          { pubkey: configV2Pda, isSigner: false, isWritable: false },
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

    buildPayPremiumOnchainTx(params: BuildPayPremiumOnchainTxParams): Transaction {
      const payer = new PublicKey(params.payer);
      const poolAddress = new PublicKey(params.poolAddress);
      const member = new PublicKey(params.member);
      const payoutMint = new PublicKey(params.payoutMint);
      const [configV2Pda] = deriveConfigV2Pda(programId);
      const [poolTermsPda] = derivePoolTermsPda({
        programId,
        poolAddress,
      });
      const [coveragePolicyPda] = deriveCoveragePolicyPda({
        programId,
        poolAddress,
        member,
      });
      const [premiumLedgerPda] = derivePremiumLedgerPda({
        programId,
        poolAddress,
        member,
      });
      const [poolAssetVaultPda] = derivePoolAssetVaultPda({
        programId,
        poolAddress,
        payoutMint,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: payer, isSigner: true, isWritable: true },
          { pubkey: configV2Pda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: poolTermsPda, isSigner: false, isWritable: false },
          { pubkey: coveragePolicyPda, isSigner: false, isWritable: true },
          { pubkey: member, isSigner: false, isWritable: false },
          { pubkey: premiumLedgerPda, isSigner: false, isWritable: true },
          { pubkey: poolAssetVaultPda, isSigner: false, isWritable: false },
          { pubkey: new PublicKey(params.payerTokenAccount), isSigner: false, isWritable: true },
          { pubkey: new PublicKey(params.poolVaultTokenAccount), isSigner: false, isWritable: true },
          { pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodePayPremiumOnchainData(params),
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
      const replayHash = fromHex(params.replayHashHex, 32);
      const [configV2Pda] = deriveConfigV2Pda(programId);
      const [oracleEntryPda] = deriveOraclePda({
        programId,
        oracle,
      });
      const [poolOraclePda] = derivePoolOraclePda({
        programId,
        poolAddress,
        oracle,
      });
      const [coveragePolicyPda] = deriveCoveragePolicyPda({
        programId,
        poolAddress,
        member,
      });
      const [premiumLedgerPda] = derivePremiumLedgerPda({
        programId,
        poolAddress,
        member,
      });
      const [premiumReplayPda] = derivePremiumReplayPda({
        programId,
        poolAddress,
        member,
        replayHash,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: oracle, isSigner: true, isWritable: true },
          { pubkey: configV2Pda, isSigner: false, isWritable: false },
          { pubkey: oracleEntryPda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: poolOraclePda, isSigner: false, isWritable: false },
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
      const intentHash = fromHex(params.intentHashHex, 32);
      const [configV2Pda] = deriveConfigV2Pda(programId);
      const [coveragePolicyPda] = deriveCoveragePolicyPda({
        programId,
        poolAddress,
        member,
      });
      const [claimDelegatePda] = deriveClaimDelegatePda({
        programId,
        poolAddress,
        member,
      });
      const [coverageClaimPda] = deriveCoverageClaimPda({
        programId,
        poolAddress,
        member,
        intentHash,
      });
      const claimDelegateAccount = params.claimDelegate ? claimDelegatePda : programId;
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: claimant, isSigner: true, isWritable: true },
          { pubkey: configV2Pda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: coveragePolicyPda, isSigner: false, isWritable: true },
          { pubkey: claimDelegateAccount, isSigner: false, isWritable: false },
          { pubkey: coverageClaimPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeSubmitCoverageClaimData(params),
      });

      return new Transaction({
        feePayer: claimant,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildSettleCoverageClaimTx(params: BuildSettleCoverageClaimTxParams): Transaction {
      const authority = new PublicKey(params.authority);
      const claimant = new PublicKey(params.claimant);
      const poolAddress = new PublicKey(params.poolAddress);
      const member = new PublicKey(params.member);
      const intentHash = fromHex(params.intentHashHex, 32);
      const [configV2Pda] = deriveConfigV2Pda(programId);
      const [poolTermsPda] = derivePoolTermsPda({
        programId,
        poolAddress,
      });
      const [coveragePolicyPda] = deriveCoveragePolicyPda({
        programId,
        poolAddress,
        member,
      });
      const [coverageClaimPda] = deriveCoverageClaimPda({
        programId,
        poolAddress,
        member,
        intentHash,
      });
      const instruction = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: authority, isSigner: true, isWritable: false },
          { pubkey: claimant, isSigner: true, isWritable: false },
          { pubkey: configV2Pda, isSigner: false, isWritable: false },
          { pubkey: poolAddress, isSigner: false, isWritable: true },
          { pubkey: poolTermsPda, isSigner: false, isWritable: false },
          { pubkey: coveragePolicyPda, isSigner: false, isWritable: true },
          { pubkey: coverageClaimPda, isSigner: false, isWritable: true },
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
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildMigratePoolV1ToV2Tx(params: BuildMigratePoolV1ToV2TxParams): Transaction {
      const authority = new PublicKey(params.authority);
      const poolAddress = new PublicKey(params.poolAddress);
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
          { pubkey: poolAddress, isSigner: false, isWritable: false },
          { pubkey: poolTermsPda, isSigner: false, isWritable: true },
          { pubkey: oraclePolicyPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeMigratePoolV1ToV2Data(params),
      });

      return new Transaction({
        feePayer: authority,
        recentBlockhash: params.recentBlockhash,
      }).add(instruction);
    },

    buildMigrateMembershipV1ToV2Tx(params: BuildMigrateMembershipV1ToV2TxParams): Transaction {
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
        data: IX_MIGRATE_MEMBERSHIP_V1_TO_V2,
      });

      return new Transaction({
        feePayer: member,
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

    async fetchCycleOutcome(params: {
      poolAddress: string;
      member: string;
      cycleId: string;
    }): Promise<ProtocolCycleOutcomeAccount | null> {
      const cycleHash = hashStringTo32(params.cycleId);
      const [pda] = deriveCycleOutcomePda({
        programId,
        poolAddress: params.poolAddress,
        member: params.member,
        cycleHash,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodeCycleOutcomeAccount(pda.toBase58(), account.data);
    },

    async fetchCycleWindow(params: {
      poolAddress: string;
      cycleId: string;
    }): Promise<ProtocolCycleWindowAccount | null> {
      const cycleHash = hashStringTo32(params.cycleId);
      const [pda] = deriveCycleWindowPda({
        programId,
        poolAddress: params.poolAddress,
        cycleHash,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodeCycleWindowAccount(pda.toBase58(), account.data);
    },

    async fetchClaimRecord(params: {
      poolAddress: string;
      member: string;
      cycleId: string;
    }): Promise<ProtocolClaimRecordAccount | null> {
      const cycleHash = hashStringTo32(params.cycleId);
      const [pda] = deriveClaimPda({
        programId,
        poolAddress: params.poolAddress,
        member: params.member,
        cycleHash,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodeClaimRecordAccount(pda.toBase58(), account.data);
    },

    async fetchCycleOutcomeAggregate(params: {
      poolAddress: string;
      member: string;
      cycleId: string;
      ruleHashHex: string;
    }): Promise<ProtocolCycleOutcomeAggregateAccount | null> {
      const cycleHash = hashStringTo32(params.cycleId);
      const ruleHash = fromHex(params.ruleHashHex, 32);
      const [pda] = deriveOutcomeAggregatePda({
        programId,
        poolAddress: params.poolAddress,
        member: params.member,
        cycleHash,
        ruleHash,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodeCycleOutcomeAggregateAccount(pda.toBase58(), account.data);
    },

    async fetchProtocolConfigV2(): Promise<ProtocolConfigV2Account | null> {
      const [configV2Pda] = deriveConfigV2Pda(programId);
      const account = await connection.getAccountInfo(configV2Pda, 'confirmed');
      if (!account) return null;
      return decodeProtocolConfigV2Account(configV2Pda.toBase58(), account.data);
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

    async fetchPoolOutcomeRule(params: {
      poolAddress: string;
      ruleHashHex: string;
    }): Promise<ProtocolPoolOutcomeRuleAccount | null> {
      const [pda] = derivePoolRulePda({
        programId,
        poolAddress: params.poolAddress,
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
      member: string;
      cycleId: string;
      ruleHashHex: string;
      oracle: string;
    }): Promise<ProtocolAttestationVoteAccount | null> {
      const [pda] = deriveAttestationVotePda({
        programId,
        poolAddress: params.poolAddress,
        member: params.member,
        cycleHash: hashStringTo32(params.cycleId),
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

    async fetchClaimRecordV2(params: {
      poolAddress: string;
      member: string;
      cycleId: string;
      ruleHashHex: string;
    }): Promise<ProtocolClaimRecordV2Account | null> {
      const cycleHash = hashStringTo32(params.cycleId);
      const [pda] = deriveClaimV2Pda({
        programId,
        poolAddress: params.poolAddress,
        member: params.member,
        cycleHash,
        ruleHash: fromHex(params.ruleHashHex, 32),
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodeClaimRecordV2Account(pda.toBase58(), account.data);
    },

    async fetchCoverageProduct(params: {
      poolAddress: string;
      productIdHashHex: string;
    }): Promise<ProtocolCoverageProductAccount | null> {
      const [pda] = deriveCoverageProductPda({
        programId,
        poolAddress: params.poolAddress,
        productIdHash: fromHex(params.productIdHashHex, 32),
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodeCoverageProductAccount(pda.toBase58(), account.data);
    },

    async fetchCoveragePolicy(params: {
      poolAddress: string;
      member: string;
    }): Promise<ProtocolCoveragePolicyAccount | null> {
      const [pda] = deriveCoveragePolicyPda({
        programId,
        poolAddress: params.poolAddress,
        member: params.member,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodeCoveragePolicyAccount(pda.toBase58(), account.data);
    },

    async fetchCoveragePolicyPositionNft(params: {
      poolAddress: string;
      member: string;
    }): Promise<ProtocolCoveragePolicyPositionNftAccount | null> {
      const [pda] = deriveCoverageNftPda({
        programId,
        poolAddress: params.poolAddress,
        member: params.member,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodeCoveragePolicyPositionNftAccount(pda.toBase58(), account.data);
    },

    async fetchPremiumLedger(params: {
      poolAddress: string;
      member: string;
    }): Promise<ProtocolPremiumLedgerAccount | null> {
      const [pda] = derivePremiumLedgerPda({
        programId,
        poolAddress: params.poolAddress,
        member: params.member,
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodePremiumLedgerAccount(pda.toBase58(), account.data);
    },

    async fetchPremiumAttestationReplay(params: {
      poolAddress: string;
      member: string;
      replayHashHex: string;
    }): Promise<ProtocolPremiumAttestationReplayAccount | null> {
      const [pda] = derivePremiumReplayPda({
        programId,
        poolAddress: params.poolAddress,
        member: params.member,
        replayHash: fromHex(params.replayHashHex, 32),
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodePremiumAttestationReplayAccount(pda.toBase58(), account.data);
    },

    async fetchMemberCycle(params: {
      poolAddress: string;
      member: string;
      periodIndex: bigint | number;
    }): Promise<ProtocolMemberCycleAccount | null> {
      const [pda] = deriveMemberCyclePda({
        programId,
        poolAddress: params.poolAddress,
        member: params.member,
        periodIndex: typeof params.periodIndex === 'bigint'
          ? params.periodIndex
          : BigInt(params.periodIndex),
      });
      const account = await connection.getAccountInfo(pda, 'confirmed');
      if (!account) return null;
      return decodeMemberCycleAccount(pda.toBase58(), account.data);
    },

    async fetchCycleQuoteReplay(params: {
      poolAddress: string;
      member: string;
      nonceHashHex: string;
    }): Promise<ProtocolCycleQuoteReplayAccount | null> {
      const [pda] = deriveCycleQuoteReplayPda({
        programId,
        poolAddress: params.poolAddress,
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

    async fetchCoverageClaimRecord(params: {
      poolAddress: string;
      member: string;
      intentHashHex: string;
    }): Promise<ProtocolCoverageClaimRecordAccount | null> {
      const [pda] = deriveCoverageClaimPda({
        programId,
        poolAddress: params.poolAddress,
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
