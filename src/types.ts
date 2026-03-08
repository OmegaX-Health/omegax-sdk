import type { PublicKey, Connection, Transaction } from '@solana/web3.js';

export type ClaimLifecycleStatus = 'prepared' | 'submitted' | 'confirmed' | 'failed' | 'expired';
export type ClaimFailureCode =
  | 'invalid_claimant_wallet'
  | 'wallet_mismatch'
  | 'pool_not_found'
  | 'pool_not_active'
  | 'membership_not_active'
  | 'claim_window_not_set'
  | 'claim_window_not_open'
  | 'claim_window_closed'
  | 'no_passing_outcomes'
  | 'seeker_rule_misconfigured'
  | 'seeker_commitment_disabled'
  | 'intent_expired'
  | 'intent_message_mismatch'
  | 'required_signer_mismatch'
  | 'simulation_failed_insufficient_funds'
  | 'simulation_failed_pool_paused'
  | 'simulation_failed_membership_invalid'
  | 'simulation_failed_unknown'
  | 'rpc_rejected'
  | 'rpc_timeout'
  | 'already_claimed'
  | 'unknown';

export interface ClaimFailureDetail {
  code: ClaimFailureCode;
  message: string;
}

export interface RewardSummary {
  wallet: {
    connected: boolean;
    address: string | null;
    provider: string | null;
  };
  cycle: {
    id: string;
    status: 'active' | 'completed' | 'abandoned' | 'paused';
    primaryGoalId: string | null;
    outcomesPassed: number;
    outcomesTotal: number;
    startIso: string;
    endIso: string;
  };
  rewards: {
    asset: string;
    claimableRaw: string;
    claimableUi: string;
    status: 'eligible' | 'not_eligible' | 'pending' | 'claimed' | 'failed';
    errorCode?: string | null;
    errorMessage?: string | null;
  };
}

export interface ClaimIntent {
  intentId: string;
  unsignedTxBase64: string;
  requiredSigner: string;
  expiresAtIso: string;
  attestationRefs: string[];
}

export interface RewardClaimIntent {
  intentHashHex: string;
  unsignedTxBase64: string;
  requiredSigner: string;
}

export interface OutcomeAttestation {
  id: string;
  userId: string;
  cycleId: string;
  outcomeId: string;
  asOfIso: string;
  issuedAtIso: string;
  payload: Record<string, unknown>;
  verifier: {
    keyId: string;
    publicKeyBase58: string;
    algorithm: 'ed25519';
  };
  signatureBase64: string;
  digestHex: string;
}

export interface OracleSigner {
  keyId: string;
  publicKeyBase58: string;
  sign: (message: Uint8Array) => Promise<Uint8Array>;
}

export interface OracleKmsSignerAdapter {
  keyId: string;
  publicKeyBase58: string;
  signWithKms: (message: Uint8Array) => Promise<Uint8Array>;
}

export interface BuildUnsignedClaimTxParams {
  intentId: string;
  claimantWallet: string;
  cycleId: string;
  outcomeId: string;
  attestationRefs: string[];
  recentBlockhash: string;
  expiresAtIso: string;
  programId: string;
  poolAddress: string;
}

export interface BuildUnsignedRewardClaimTxParams {
  claimantWallet: string;
  member: string;
  poolAddress: string;
  cycleId: string;
  ruleHashHex: string;
  intentHashHex: string;
  payoutAmount: bigint;
  recipient: string;
  recipientSystemAccount: string;
  claimDelegate?: string;
  poolAssetVault?: string;
  poolVaultTokenAccount?: string;
  recipientTokenAccount?: string;
  recentBlockhash: string;
  programId: string;
}

export interface ValidateSignedClaimTxParams {
  signedTxBase64: string;
  requiredSigner: string;
  expectedUnsignedTxBase64?: string;
}

export type ValidateSignedClaimTxReason =
  | 'invalid_transaction_base64'
  | 'missing_fee_payer'
  | 'required_signer_mismatch'
  | 'missing_required_signature'
  | 'invalid_required_signature'
  | 'intent_message_mismatch';

export interface ValidateSignedClaimTxResult {
  valid: boolean;
  txSignature: string | null;
  reason: ValidateSignedClaimTxReason | null;
  signer: string | null;
}

export interface BroadcastSignedTxParams {
  signedTxBase64: string;
  commitment?: 'processed' | 'confirmed' | 'finalized';
  skipPreflight?: boolean;
  maxRetries?: number;
}

export interface BroadcastSignedTxResult {
  signature: string;
  status: ClaimLifecycleStatus;
  slot: number | null;
}

export interface SimulateSignedTxParams {
  signedTxBase64: string;
  commitment?: 'processed' | 'confirmed' | 'finalized';
  replaceRecentBlockhash?: boolean;
  sigVerify?: boolean;
}

export interface SimulateSignedTxResult {
  ok: boolean;
  logs: string[];
  unitsConsumed: number | null;
  err: unknown | null;
  failure: ClaimFailureDetail | null;
}

export type SignatureLifecycleStatus =
  | 'processed'
  | 'confirmed'
  | 'finalized'
  | 'failed'
  | 'unknown';

export interface GetSignatureStatusParams {
  signature: string;
  searchTransactionHistory?: boolean;
}

export interface GetSignatureStatusResult {
  signature: string;
  status: SignatureLifecycleStatus;
  confirmations: number | null;
  slot: number | null;
  err: unknown | null;
}

export interface RpcClient {
  getRecentBlockhash: () => Promise<string>;
  broadcastSignedTx: (params: BroadcastSignedTxParams) => Promise<BroadcastSignedTxResult>;
  simulateSignedTx: (params: SimulateSignedTxParams) => Promise<SimulateSignedTxResult>;
  getSignatureStatus: (params: GetSignatureStatusParams) => Promise<GetSignatureStatusResult>;
}

export type ProgramAccountLike = {
  pubkey: string | PublicKey;
  isSigner?: boolean;
  isWritable?: boolean;
};

export type ProtocolPoolStatus = 'draft' | 'active' | 'paused' | 'closed' | 'unknown';
export type ProtocolMembershipStatus = 'active' | 'revoked' | 'unknown';

export interface ProtocolConfigAccount {
  address: string;
  admin: string;
  protocolFeeBps: number;
  emergencyPaused: boolean;
  bump: number;
}

export interface ProtocolPoolAccount {
  address: string;
  authority: string;
  poolId: string;
  organizationRef: string;
  payoutLamportsPerPass: bigint;
  membershipMode: number;
  tokenGateMint: string;
  tokenGateMinBalance: bigint;
  inviteIssuer: string;
  statusCode: number;
  status: ProtocolPoolStatus;
  bump: number;
}

export interface ProtocolOracleRegistryEntryAccount {
  address: string;
  oracle: string;
  active: boolean;
  bump: number;
  metadataUri: string;
}

export interface ProtocolOracleProfileAccount {
  address: string;
  oracle: string;
  admin: string;
  oracleType: number;
  displayName: string;
  legalName: string;
  websiteUrl: string;
  appUrl: string;
  logoUri: string;
  webhookUrl: string;
  supportedSchemaCount: number;
  supportedSchemaKeyHashesHex: string[];
  claimed: boolean;
  createdAtTs: number;
  updatedAtTs: number;
  bump: number;
}

export interface ProtocolPoolOracleApprovalAccount {
  address: string;
  pool: string;
  oracle: string;
  active: boolean;
  bump: number;
}

export interface ProtocolMembershipRecordAccount {
  address: string;
  pool: string;
  member: string;
  subjectCommitmentHex: string;
  statusCode: number;
  status: ProtocolMembershipStatus;
  enrolledAt: number;
  updatedAt: number;
  bump: number;
}

export interface ProtocolCycleOutcomeAccount {
  address: string;
  pool: string;
  member: string;
  cycleHashHex: string;
  passCount: number;
  attestationCount: number;
  latestAsOfTs: number;
  claimed: boolean;
  bump: number;
}

export interface ProtocolCycleWindowAccount {
  address: string;
  pool: string;
  cycleHashHex: string;
  authority: string;
  claimOpenTs: number;
  claimCloseTs: number;
  bump: number;
}

export interface ProtocolClaimRecordAccount {
  address: string;
  pool: string;
  member: string;
  cycleHashHex: string;
  claimIntentHex: string;
  payoutLamports: bigint;
  passCount: number;
  submittedAt: number;
  bump: number;
}

export interface BuildInitializeProtocolTxParams {
  admin: string;
  protocolFeeBps: number;
  recentBlockhash: string;
  programId: string;
}

export interface BuildSetProtocolPauseTxParams {
  admin: string;
  paused: boolean;
  recentBlockhash: string;
  programId: string;
}

export interface BuildCreatePoolTxParams {
  authority: string;
  poolId: string;
  organizationRef: string;
  payoutLamportsPerPass: bigint;
  membershipMode: number;
  tokenGateMint?: string;
  tokenGateMinBalance?: bigint;
  inviteIssuer?: string;
  recentBlockhash: string;
  programId: string;
}

export interface BuildSetPoolStatusTxParams {
  authority: string;
  poolAddress: string;
  status: number;
  recentBlockhash: string;
  programId: string;
}

export interface BuildSetCycleWindowTxParams {
  authority: string;
  poolAddress: string;
  cycleId: string;
  claimOpenTs: number;
  claimCloseTs: number;
  recentBlockhash: string;
  programId: string;
}

export interface BuildFundPoolTxParams {
  funder: string;
  poolAddress: string;
  lamports: bigint;
  recentBlockhash: string;
  programId: string;
}

export interface BuildRegisterOracleTxParams {
  oracle: string;
  metadataUri: string;
  recentBlockhash: string;
  programId: string;
}

export interface BuildSetPoolOracleTxParams {
  authority: string;
  poolAddress: string;
  oracle: string;
  active: boolean;
  recentBlockhash: string;
  programId: string;
}

export interface BuildEnrollMemberTxParams {
  member: string;
  poolAddress: string;
  subjectCommitmentHex?: string;
  inviteCodeHashHex?: string;
  tokenGateAccount?: string;
  inviteIssuer?: string;
  recentBlockhash: string;
  programId: string;
}

export interface BuildRevokeMemberTxParams {
  authority: string;
  poolAddress: string;
  member: string;
  recentBlockhash: string;
  programId: string;
}

export interface BuildSubmitOutcomeAttestationTxParams {
  oracle: string;
  member: string;
  poolAddress: string;
  cycleId: string;
  outcomeId: string;
  replayKey: string;
  asOfIso: string;
  passed: boolean;
  attestationDigestHex?: string;
  recentBlockhash: string;
  programId: string;
}

export interface BuildSubmitClaimTxParams {
  claimant: string;
  poolAddress: string;
  cycleId: string;
  intentId: string;
  recentBlockhash: string;
  programId: string;
}

export interface ProtocolCycleQuoteFields {
  poolAddress: string;
  member: string;
  productIdHashHex: string;
  paymentMint: string;
  premiumAmountRaw: bigint;
  canonicalPremiumAmount: bigint;
  periodIndex: bigint;
  commitmentEnabled: boolean;
  bondAmountRaw: bigint;
  shieldFeeRaw: bigint;
  protocolFeeRaw: bigint;
  oracleFeeRaw: bigint;
  netPoolPremiumRaw: bigint;
  totalAmountRaw: bigint;
  includedShieldCount: number;
  thresholdBps: number;
  expiresAtTs: bigint;
  nonceHashHex: string;
  quoteMetaHashHex: string;
}

export interface BuildActivateCycleWithQuoteSolTxParams {
  payer: string;
  member: string;
  poolAddress: string;
  oracle: string;
  productIdHashHex: string;
  premiumAmountRaw: bigint;
  canonicalPremiumAmount: bigint;
  periodIndex: bigint;
  commitmentEnabled: boolean;
  bondAmountRaw: bigint;
  shieldFeeRaw: bigint;
  protocolFeeRaw: bigint;
  oracleFeeRaw: bigint;
  netPoolPremiumRaw: bigint;
  totalAmountRaw: bigint;
  includedShieldCount: number;
  thresholdBps: number;
  expiresAtTs: bigint;
  nonceHashHex: string;
  quoteMetaHashHex: string;
  quoteMessage: Uint8Array;
  oracleSecretKey: Uint8Array;
  recentBlockhash: string;
  programId: string;
}

export interface BuildActivateCycleWithQuoteSplTxParams {
  payer: string;
  member: string;
  poolAddress: string;
  oracle: string;
  productIdHashHex: string;
  paymentMint: string;
  premiumAmountRaw: bigint;
  canonicalPremiumAmount: bigint;
  periodIndex: bigint;
  commitmentEnabled: boolean;
  bondAmountRaw: bigint;
  shieldFeeRaw: bigint;
  protocolFeeRaw: bigint;
  oracleFeeRaw: bigint;
  netPoolPremiumRaw: bigint;
  totalAmountRaw: bigint;
  includedShieldCount: number;
  thresholdBps: number;
  expiresAtTs: bigint;
  nonceHashHex: string;
  quoteMetaHashHex: string;
  quoteMessage: Uint8Array;
  oracleSecretKey: Uint8Array;
  recentBlockhash: string;
  programId: string;
}

export interface BuildSettleCycleCommitmentTxParams {
  payer: string;
  oracle: string;
  member: string;
  poolAddress: string;
  productIdHashHex: string;
  paymentMint: string;
  periodIndex: bigint;
  passed: boolean;
  shieldConsumed: boolean;
  recentBlockhash: string;
  programId: string;
}

export interface BuildSettleCycleCommitmentSolTxParams {
  payer: string;
  oracle: string;
  member: string;
  poolAddress: string;
  productIdHashHex: string;
  periodIndex: bigint;
  passed: boolean;
  shieldConsumed: boolean;
  recentBlockhash: string;
  programId: string;
}

export interface BuildWithdrawPoolTreasurySplTxParams {
  payer: string;
  oracle: string;
  poolAddress: string;
  paymentMint: string;
  amount: bigint;
  recipientTokenAccount: string;
  recentBlockhash: string;
  programId: string;
}

export interface BuildWithdrawPoolTreasurySolTxParams {
  payer: string;
  oracle: string;
  poolAddress: string;
  amount: bigint;
  recipientSystemAccount: string;
  recentBlockhash: string;
  programId: string;
}

export interface BuildSetPoolCoverageReserveFloorTxParams {
  authority: string;
  poolAddress: string;
  paymentMint: string;
  amount: bigint;
  recentBlockhash: string;
  programId: string;
}

export interface BuildWithdrawProtocolFeeSplTxParams {
  governanceAuthority: string;
  paymentMint: string;
  amount: bigint;
  recipientTokenAccount: string;
  recentBlockhash: string;
  programId: string;
}

export interface BuildWithdrawProtocolFeeSolTxParams {
  governanceAuthority: string;
  amount: bigint;
  recipientSystemAccount: string;
  recentBlockhash: string;
  programId: string;
}

export interface BuildWithdrawPoolOracleFeeSplTxParams {
  oracle: string;
  poolAddress: string;
  paymentMint: string;
  amount: bigint;
  recipientTokenAccount: string;
  recentBlockhash: string;
  programId: string;
}

export interface BuildWithdrawPoolOracleFeeSolTxParams {
  oracle: string;
  poolAddress: string;
  amount: bigint;
  recipientSystemAccount: string;
  recentBlockhash: string;
  programId: string;
}

export interface ProtocolClient {
  connection: Connection;
  programId: PublicKey;
  buildInitializeProtocolTx?: (params: BuildInitializeProtocolTxParams) => Transaction;
  buildSetProtocolPauseTx?: (params: BuildSetProtocolPauseTxParams) => Transaction;
  buildCreatePoolTx?: (params: BuildCreatePoolTxParams) => Transaction;
  buildSetPoolStatusTx?: (params: BuildSetPoolStatusTxParams) => Transaction;
  buildSetCycleWindowTx?: (params: BuildSetCycleWindowTxParams) => Transaction;
  buildFundPoolTx?: (params: BuildFundPoolTxParams) => Transaction;
  buildRegisterOracleTx?: (params: BuildRegisterOracleTxParams) => Transaction;
  buildSetPoolOracleTx?: (params: BuildSetPoolOracleTxParams) => Transaction;
  buildEnrollMemberTx?: (params: BuildEnrollMemberTxParams) => Transaction;
  buildRevokeMemberTx?: (params: BuildRevokeMemberTxParams) => Transaction;
  buildSubmitOutcomeAttestationTx?: (params: BuildSubmitOutcomeAttestationTxParams) => Transaction;
  buildSubmitClaimTx?: (params: BuildSubmitClaimTxParams) => Transaction;
  buildActivateCycleWithQuoteSolTx?: (params: BuildActivateCycleWithQuoteSolTxParams) => Transaction;
  buildActivateCycleWithQuoteSplTx?: (params: BuildActivateCycleWithQuoteSplTxParams) => Transaction;
  buildSettleCycleCommitmentTx?: (params: BuildSettleCycleCommitmentTxParams) => Transaction;
  buildSettleCycleCommitmentSolTx?: (params: BuildSettleCycleCommitmentSolTxParams) => Transaction;
  buildWithdrawPoolTreasurySplTx?: (params: BuildWithdrawPoolTreasurySplTxParams) => Transaction;
  buildWithdrawPoolTreasurySolTx?: (params: BuildWithdrawPoolTreasurySolTxParams) => Transaction;
  buildSetPoolCoverageReserveFloorTx?: (params: BuildSetPoolCoverageReserveFloorTxParams) => Transaction;
  buildWithdrawProtocolFeeSplTx?: (params: BuildWithdrawProtocolFeeSplTxParams) => Transaction;
  buildWithdrawProtocolFeeSolTx?: (params: BuildWithdrawProtocolFeeSolTxParams) => Transaction;
  buildWithdrawPoolOracleFeeSplTx?: (params: BuildWithdrawPoolOracleFeeSplTxParams) => Transaction;
  buildWithdrawPoolOracleFeeSolTx?: (params: BuildWithdrawPoolOracleFeeSolTxParams) => Transaction;
  fetchProtocolConfig?: () => Promise<ProtocolConfigAccount | null>;
  fetchPool?: (poolAddress: string) => Promise<ProtocolPoolAccount | null>;
  fetchOracleRegistryEntry?: (oracle: string) => Promise<ProtocolOracleRegistryEntryAccount | null>;
  fetchPoolOracleApproval?: (params: {
    poolAddress: string;
    oracle: string;
  }) => Promise<ProtocolPoolOracleApprovalAccount | null>;
  fetchMembershipRecord?: (params: {
    poolAddress: string;
    member: string;
  }) => Promise<ProtocolMembershipRecordAccount | null>;
  fetchCycleOutcome?: (params: {
    poolAddress: string;
    member: string;
    cycleId: string;
  }) => Promise<ProtocolCycleOutcomeAccount | null>;
  fetchCycleWindow?: (params: {
    poolAddress: string;
    cycleId: string;
  }) => Promise<ProtocolCycleWindowAccount | null>;
  fetchClaimRecord?: (params: {
    poolAddress: string;
    member: string;
    cycleId: string;
  }) => Promise<ProtocolClaimRecordAccount | null>;

  // v2 protocol surfaces
  buildInitializeProtocolV2Tx?: (params: BuildInitializeProtocolV2TxParams) => Transaction;
  buildSetProtocolParamsTx?: (params: BuildSetProtocolParamsTxParams) => Transaction;
  buildRotateGovernanceAuthorityTx?: (params: BuildRotateGovernanceAuthorityTxParams) => Transaction;
  buildRegisterOracleV2Tx?: (params: BuildRegisterOracleV2TxParams) => Transaction;
  buildClaimOracleV2Tx?: (params: BuildClaimOracleV2TxParams) => Transaction;
  buildUpdateOracleProfileV2Tx?: (params: BuildUpdateOracleProfileV2TxParams) => Transaction;
  buildUpdateOracleMetadataTx?: (params: BuildUpdateOracleMetadataTxParams) => Transaction;
  buildStakeOracleTx?: (params: BuildStakeOracleTxParams) => Transaction;
  buildRequestUnstakeTx?: (params: BuildRequestUnstakeTxParams) => Transaction;
  buildFinalizeUnstakeTx?: (params: BuildFinalizeUnstakeTxParams) => Transaction;
  buildSlashOracleTx?: (params: BuildSlashOracleTxParams) => Transaction;
  buildCreatePoolV2Tx?: (params: BuildCreatePoolV2TxParams) => Transaction;
  buildSetPoolOraclePolicyTx?: (params: BuildSetPoolOraclePolicyTxParams) => Transaction;
  buildSetPoolTermsHashTx?: (params: BuildSetPoolTermsHashTxParams) => Transaction;
  buildRegisterOutcomeSchemaTx?: (params: BuildRegisterOutcomeSchemaTxParams) => Transaction;
  buildVerifyOutcomeSchemaTx?: (params: BuildVerifyOutcomeSchemaTxParams) => Transaction;
  buildSetPoolOutcomeRuleTx?: (params: BuildSetPoolOutcomeRuleTxParams) => Transaction;
  buildRegisterInviteIssuerTx?: (params: BuildRegisterInviteIssuerTxParams) => Transaction;
  buildEnrollMemberOpenTx?: (params: BuildEnrollMemberOpenTxParams) => Transaction;
  buildEnrollMemberTokenGateTx?: (params: BuildEnrollMemberTokenGateTxParams) => Transaction;
  buildEnrollMemberInvitePermitTx?: (params: BuildEnrollMemberInvitePermitTxParams) => Transaction;
  buildSetClaimDelegateTx?: (params: BuildSetClaimDelegateTxParams) => Transaction;
  buildFundPoolSolTx?: (params: BuildFundPoolSolTxParams) => Transaction;
  buildFundPoolSplTx?: (params: BuildFundPoolSplTxParams) => Transaction;
  buildSubmitOutcomeAttestationVoteTx?: (params: BuildSubmitOutcomeAttestationVoteTxParams) => Transaction;
  buildFinalizeCycleOutcomeTx?: (params: BuildFinalizeCycleOutcomeTxParams) => Transaction;
  buildSubmitRewardClaimTx?: (params: BuildSubmitRewardClaimTxParams) => Transaction;
  buildRegisterCoverageProductV2Tx?: (params: BuildRegisterCoverageProductV2TxParams) => Transaction;
  buildUpdateCoverageProductV2Tx?: (params: BuildUpdateCoverageProductV2TxParams) => Transaction;
  buildSubscribeCoverageProductV2Tx?: (params: BuildSubscribeCoverageProductV2TxParams) => Transaction;
  buildIssueCoveragePolicyFromProductV2Tx?: (params: BuildIssueCoveragePolicyFromProductV2TxParams) => Transaction;
  buildCreateCoveragePolicyTx?: (params: BuildCreateCoveragePolicyTxParams) => Transaction;
  buildMintPolicyNftTx?: (params: BuildMintPolicyNftTxParams) => Transaction;
  buildPayPremiumOnchainTx?: (params: BuildPayPremiumOnchainTxParams) => Transaction;
  buildAttestPremiumPaidOffchainTx?: (params: BuildAttestPremiumPaidOffchainTxParams) => Transaction;
  buildSubmitCoverageClaimTx?: (params: BuildSubmitCoverageClaimTxParams) => Transaction;
  buildSettleCoverageClaimTx?: (params: BuildSettleCoverageClaimTxParams) => Transaction;
  buildMigratePoolV1ToV2Tx?: (params: BuildMigratePoolV1ToV2TxParams) => Transaction;
  buildMigrateMembershipV1ToV2Tx?: (params: BuildMigrateMembershipV1ToV2TxParams) => Transaction;

  fetchProtocolConfigV2?: () => Promise<ProtocolConfigV2Account | null>;
  fetchOracleProfile?: (oracle: string) => Promise<ProtocolOracleProfileAccount | null>;
  fetchOracleStakePosition?: (params: { oracle: string; staker: string }) => Promise<ProtocolOracleStakePositionAccount | null>;
  fetchPoolOraclePolicy?: (poolAddress: string) => Promise<ProtocolPoolOraclePolicyAccount | null>;
  fetchPoolTerms?: (poolAddress: string) => Promise<ProtocolPoolTermsAccount | null>;
  fetchPoolAssetVault?: (params: { poolAddress: string; payoutMint: string }) => Promise<ProtocolPoolAssetVaultAccount | null>;
  fetchProtocolFeeVault?: (paymentMint: string) => Promise<ProtocolFeeVaultAccount | null>;
  fetchPoolOracleFeeVault?: (params: {
    poolAddress: string;
    oracle: string;
    paymentMint: string;
  }) => Promise<ProtocolPoolOracleFeeVaultAccount | null>;
  fetchPoolOraclePermissionSet?: (params: {
    poolAddress: string;
    oracle: string;
  }) => Promise<ProtocolPoolOraclePermissionSetAccount | null>;
  fetchOutcomeSchema?: (schemaKeyHashHex: string) => Promise<ProtocolOutcomeSchemaRegistryEntryAccount | null>;
  fetchPoolOutcomeRule?: (params: { poolAddress: string; ruleHashHex: string }) => Promise<ProtocolPoolOutcomeRuleAccount | null>;
  fetchInviteIssuer?: (issuer: string) => Promise<ProtocolInviteIssuerRegistryEntryAccount | null>;
  fetchCycleOutcomeAggregate?: (params: {
    poolAddress: string;
    member: string;
    cycleId: string;
    ruleHashHex: string;
  }) => Promise<ProtocolCycleOutcomeAggregateAccount | null>;
  fetchEnrollmentPermitReplay?: (params: {
    poolAddress: string;
    member: string;
    nonceHashHex: string;
  }) => Promise<ProtocolEnrollmentPermitReplayAccount | null>;
  fetchAttestationVote?: (params: {
    poolAddress: string;
    member: string;
    cycleId: string;
    ruleHashHex: string;
    oracle: string;
  }) => Promise<ProtocolAttestationVoteAccount | null>;
  fetchClaimDelegate?: (params: { poolAddress: string; member: string }) => Promise<ProtocolClaimDelegateAuthorizationAccount | null>;
  fetchClaimRecordV2?: (params: {
    poolAddress: string;
    member: string;
    cycleId: string;
    ruleHashHex: string;
  }) => Promise<ProtocolClaimRecordV2Account | null>;
  fetchCoverageProduct?: (params: {
    poolAddress: string;
    productIdHashHex: string;
  }) => Promise<ProtocolCoverageProductAccount | null>;
  fetchCoveragePolicy?: (params: { poolAddress: string; member: string }) => Promise<ProtocolCoveragePolicyAccount | null>;
  fetchCoveragePolicyPositionNft?: (params: {
    poolAddress: string;
    member: string;
  }) => Promise<ProtocolCoveragePolicyPositionNftAccount | null>;
  fetchMemberCycle?: (params: {
    poolAddress: string;
    member: string;
    periodIndex: bigint | number;
  }) => Promise<ProtocolMemberCycleAccount | null>;
  fetchCycleQuoteReplay?: (params: {
    poolAddress: string;
    member: string;
    nonceHashHex: string;
  }) => Promise<ProtocolCycleQuoteReplayAccount | null>;
  fetchPoolTreasuryReserve?: (params: {
    poolAddress: string;
    paymentMint: string;
  }) => Promise<ProtocolPoolTreasuryReserveAccount | null>;
  fetchPremiumLedger?: (params: { poolAddress: string; member: string }) => Promise<ProtocolPremiumLedgerAccount | null>;
  fetchPremiumAttestationReplay?: (params: {
    poolAddress: string;
    member: string;
    replayHashHex: string;
  }) => Promise<ProtocolPremiumAttestationReplayAccount | null>;
  fetchCoverageClaimRecord?: (params: {
    poolAddress: string;
    member: string;
    intentHashHex: string;
  }) => Promise<ProtocolCoverageClaimRecordAccount | null>;
}

export type ProtocolPoolType = 'reward' | 'coverage' | 'unknown';

export interface ProtocolConfigV2Account {
  address: string;
  admin: string;
  governanceAuthority: string;
  governanceRealm: string;
  governanceConfig: string;
  defaultStakeMint: string;
  protocolFeeBps: number;
  minOracleStake: bigint;
  emergencyPaused: boolean;
  allowedPayoutMintsHashHex: string;
  bump: number;
}

export interface ProtocolOracleStakePositionAccount {
  address: string;
  oracle: string;
  staker: string;
  stakeMint: string;
  stakeVault: string;
  stakedAmount: bigint;
  pendingUnstakeAmount: bigint;
  canFinalizeUnstakeAt: number;
  slashPending: boolean;
  bump: number;
}

export interface ProtocolPoolOraclePolicyAccount {
  address: string;
  pool: string;
  quorumM: number;
  quorumN: number;
  requireVerifiedSchema: boolean;
  oracleFeeBps: number;
  allowDelegateClaim: boolean;
  bump: number;
}

export interface ProtocolPoolTermsAccount {
  address: string;
  pool: string;
  poolTypeCode: number;
  poolType: ProtocolPoolType;
  payoutAssetMint: string;
  termsHashHex: string;
  payoutPolicyHashHex: string;
  cycleMode: number;
  metadataUri: string;
  bump: number;
}

export interface ProtocolPoolAssetVaultAccount {
  address: string;
  pool: string;
  payoutMint: string;
  vaultTokenAccount: string;
  active: boolean;
  bump: number;
}

export interface ProtocolFeeVaultAccount {
  address: string;
  paymentMint: string;
  bump: number;
}

export interface ProtocolPoolOracleFeeVaultAccount {
  address: string;
  pool: string;
  oracle: string;
  paymentMint: string;
  bump: number;
}

export interface ProtocolPoolOraclePermissionSetAccount {
  address: string;
  pool: string;
  oracle: string;
  permissions: number;
  bump: number;
}

export type ProtocolMemberCycleStatus = 'active' | 'settled' | 'unknown';

export interface ProtocolMemberCycleAccount {
  address: string;
  pool: string;
  member: string;
  productIdHashHex: string;
  periodIndex: bigint;
  paymentMint: string;
  premiumAmountRaw: bigint;
  bondAmountRaw: bigint;
  shieldFeeRaw: bigint;
  protocolFeeRaw: bigint;
  oracleFeeRaw: bigint;
  netPoolPremiumRaw: bigint;
  totalAmountRaw: bigint;
  canonicalPremiumAmount: bigint;
  commitmentEnabled: boolean;
  thresholdBps: number;
  includedShieldCount: number;
  shieldConsumed: boolean;
  statusCode: number;
  status: ProtocolMemberCycleStatus;
  passed: boolean;
  activatedAt: number;
  settledAt: number;
  quoteHashHex: string;
  bump: number;
}

export interface ProtocolCycleQuoteReplayAccount {
  address: string;
  pool: string;
  member: string;
  nonceHashHex: string;
  quoteHashHex: string;
  createdAt: number;
  bump: number;
}

export interface ProtocolPoolTreasuryReserveAccount {
  address: string;
  pool: string;
  paymentMint: string;
  reservedRefundAmount: bigint;
  reservedRewardAmount: bigint;
  manualCoverageReserveAmount: bigint;
  bump: number;
}

export interface ProtocolOutcomeSchemaRegistryEntryAccount {
  address: string;
  schemaKeyHashHex: string;
  schemaKey: string;
  version: number;
  schemaHashHex: string;
  publisher: string;
  verified: boolean;
  metadataUri: string;
  bump: number;
}

export interface ProtocolPoolOutcomeRuleAccount {
  address: string;
  pool: string;
  ruleHashHex: string;
  schemaKeyHashHex: string;
  ruleId: string;
  schemaKey: string;
  schemaVersion: number;
  payoutHashHex: string;
  enabled: boolean;
  bump: number;
}

export interface ProtocolInviteIssuerRegistryEntryAccount {
  address: string;
  issuer: string;
  organizationRef: string;
  metadataUri: string;
  active: boolean;
  bump: number;
}

export interface ProtocolCycleOutcomeAggregateAccount {
  address: string;
  pool: string;
  member: string;
  cycleHashHex: string;
  ruleHashHex: string;
  passVotes: number;
  failVotes: number;
  quorumM: number;
  quorumN: number;
  finalized: boolean;
  passed: boolean;
  claimed: boolean;
  rewardLiabilityReserved: boolean;
  latestAsOfTs: number;
  bump: number;
}

export interface ProtocolClaimDelegateAuthorizationAccount {
  address: string;
  pool: string;
  member: string;
  delegate: string;
  active: boolean;
  updatedAt: number;
  bump: number;
}

export interface ProtocolCoveragePolicyAccount {
  address: string;
  pool: string;
  member: string;
  termsHashHex: string;
  status: number;
  startsAt: number;
  endsAt: number;
  premiumDueEverySecs: number;
  premiumGraceSecs: number;
  nextDueAt: number;
  nftMint: string;
  bump: number;
}

export interface ProtocolPremiumLedgerAccount {
  address: string;
  pool: string;
  member: string;
  periodIndex: bigint;
  amount: bigint;
  source: number;
  paidAt: number;
  bump: number;
}

export interface ProtocolEnrollmentPermitReplayAccount {
  address: string;
  pool: string;
  issuer: string;
  member: string;
  nonceHashHex: string;
  inviteIdHashHex: string;
  createdAt: number;
  bump: number;
}

export interface ProtocolAttestationVoteAccount {
  address: string;
  pool: string;
  member: string;
  cycleHashHex: string;
  ruleHashHex: string;
  oracle: string;
  passed: boolean;
  attestationDigestHex: string;
  observedValueHashHex: string;
  asOfTs: number;
  bump: number;
}

export interface ProtocolClaimRecordV2Account {
  address: string;
  pool: string;
  member: string;
  claimant: string;
  cycleHashHex: string;
  ruleHashHex: string;
  intentHashHex: string;
  payoutMint: string;
  payoutAmount: bigint;
  recipient: string;
  submittedAt: number;
  bump: number;
}

export interface ProtocolCoverageProductAccount {
  address: string;
  pool: string;
  admin: string;
  productIdHashHex: string;
  active: boolean;
  displayName: string;
  metadataUri: string;
  termsHashHex: string;
  durationSecs: number;
  premiumDueEverySecs: number;
  premiumGraceSecs: number;
  premiumAmount: bigint;
  createdAtTs: number;
  updatedAtTs: number;
  bump: number;
}

export interface ProtocolCoveragePolicyPositionNftAccount {
  address: string;
  pool: string;
  member: string;
  nftMint: string;
  metadataUri: string;
  bump: number;
}

export interface ProtocolPremiumAttestationReplayAccount {
  address: string;
  pool: string;
  member: string;
  periodIndex: bigint;
  replayHashHex: string;
  oracle: string;
  createdAt: number;
  bump: number;
}

export interface ProtocolCoverageClaimRecordAccount {
  address: string;
  pool: string;
  member: string;
  claimant: string;
  intentHashHex: string;
  eventHashHex: string;
  status: number;
  submittedAt: number;
  settledAt: number;
  bump: number;
}

export interface BuildInitializeProtocolV2TxParams {
  admin: string;
  protocolFeeBps: number;
  governanceRealm: string;
  governanceConfig: string;
  defaultStakeMint: string;
  minOracleStake: bigint;
  recentBlockhash: string;
  programId: string;
}

export interface BuildSetProtocolParamsTxParams {
  governanceAuthority: string;
  protocolFeeBps: number;
  allowedPayoutMintsHashHex: string;
  minOracleStake: bigint;
  emergencyPaused: boolean;
  recentBlockhash: string;
  programId: string;
}

export interface BuildUpdateOracleMetadataTxParams {
  oracle: string;
  metadataUri: string;
  active: boolean;
  recentBlockhash: string;
  programId: string;
}

export interface BuildStakeOracleTxParams {
  staker: string;
  oracle: string;
  stakeMint: string;
  stakeVault: string;
  stakerTokenAccount: string;
  amount: bigint;
  recentBlockhash: string;
  programId: string;
}

export interface BuildRequestUnstakeTxParams {
  staker: string;
  oracle: string;
  amount: bigint;
  cooldownSeconds: number;
  recentBlockhash: string;
  programId: string;
}

export interface BuildFinalizeUnstakeTxParams {
  staker: string;
  oracle: string;
  stakeVault: string;
  destinationTokenAccount: string;
  recentBlockhash: string;
  programId: string;
}

export interface BuildSlashOracleTxParams {
  governanceAuthority: string;
  oracle: string;
  staker: string;
  stakeVault: string;
  slashTreasuryTokenAccount: string;
  amount: bigint;
  recentBlockhash: string;
  programId: string;
}

export interface BuildCreatePoolV2TxParams {
  authority: string;
  poolId: string;
  organizationRef: string;
  payoutLamportsPerPass: bigint;
  membershipMode: number;
  tokenGateMint: string;
  tokenGateMinBalance: bigint;
  inviteIssuer: string;
  poolType: number;
  payoutAssetMint: string;
  termsHashHex: string;
  payoutPolicyHashHex: string;
  cycleMode: number;
  metadataUri: string;
  recentBlockhash: string;
  programId: string;
}

export interface BuildRegisterOracleV2TxParams {
  admin: string;
  oraclePubkey: string;
  oracleType: number;
  displayName: string;
  legalName: string;
  websiteUrl: string;
  appUrl: string;
  logoUri: string;
  webhookUrl: string;
  supportedSchemaKeyHashesHex: string[];
  recentBlockhash: string;
  programId: string;
}

export interface BuildClaimOracleV2TxParams {
  oracle: string;
  recentBlockhash: string;
  programId: string;
}

export interface BuildUpdateOracleProfileV2TxParams {
  authority: string;
  oracle: string;
  oracleType: number;
  displayName: string;
  legalName: string;
  websiteUrl: string;
  appUrl: string;
  logoUri: string;
  webhookUrl: string;
  supportedSchemaKeyHashesHex: string[];
  recentBlockhash: string;
  programId: string;
}

export interface BuildRotateGovernanceAuthorityTxParams {
  governanceAuthority: string;
  newAuthority: string;
  recentBlockhash: string;
  programId: string;
}

export interface BuildSetPoolOraclePolicyTxParams {
  authority: string;
  poolAddress: string;
  quorumM: number;
  quorumN: number;
  requireVerifiedSchema: boolean;
  oracleFeeBps: number;
  allowDelegateClaim: boolean;
  recentBlockhash: string;
  programId: string;
}

export interface BuildSetPoolTermsHashTxParams {
  authority: string;
  poolAddress: string;
  termsHashHex: string;
  payoutPolicyHashHex: string;
  cycleMode: number;
  metadataUri: string;
  recentBlockhash: string;
  programId: string;
}

export interface BuildRegisterOutcomeSchemaTxParams {
  publisher: string;
  schemaKeyHashHex: string;
  schemaKey: string;
  version: number;
  schemaHashHex: string;
  metadataUri: string;
  recentBlockhash: string;
  programId: string;
}

export interface BuildVerifyOutcomeSchemaTxParams {
  governanceAuthority: string;
  schemaKeyHashHex: string;
  verified: boolean;
  recentBlockhash: string;
  programId: string;
}

export interface BuildSetPoolOutcomeRuleTxParams {
  authority: string;
  poolAddress: string;
  ruleHashHex: string;
  schemaKeyHashHex: string;
  ruleId: string;
  schemaKey: string;
  schemaVersion: number;
  payoutHashHex: string;
  enabled: boolean;
  recentBlockhash: string;
  programId: string;
}

export interface BuildRegisterInviteIssuerTxParams {
  issuer: string;
  organizationRef: string;
  metadataUri: string;
  active: boolean;
  recentBlockhash: string;
  programId: string;
}

export interface BuildEnrollMemberOpenTxParams {
  member: string;
  poolAddress: string;
  subjectCommitmentHex?: string;
  recentBlockhash: string;
  programId: string;
}

export interface BuildEnrollMemberTokenGateTxParams {
  member: string;
  poolAddress: string;
  tokenGateAccount: string;
  subjectCommitmentHex?: string;
  recentBlockhash: string;
  programId: string;
}

export interface BuildEnrollMemberInvitePermitTxParams {
  member: string;
  poolAddress: string;
  issuer: string;
  subjectCommitmentHex?: string;
  nonceHashHex: string;
  inviteIdHashHex: string;
  expiresAtTs: number;
  recentBlockhash: string;
  programId: string;
}

export interface BuildSetClaimDelegateTxParams {
  member: string;
  poolAddress: string;
  delegate: string;
  active: boolean;
  recentBlockhash: string;
  programId: string;
}

export interface BuildFundPoolSolTxParams {
  funder: string;
  poolAddress: string;
  lamports: bigint;
  recentBlockhash: string;
  programId: string;
}

export interface BuildFundPoolSplTxParams {
  funder: string;
  poolAddress: string;
  payoutMint: string;
  poolVaultTokenAccount: string;
  funderTokenAccount: string;
  amount: bigint;
  recentBlockhash: string;
  programId: string;
}

export interface BuildSubmitOutcomeAttestationVoteTxParams {
  oracle: string;
  poolAddress: string;
  member: string;
  cycleId: string;
  ruleHashHex: string;
  schemaKeyHashHex: string;
  payoutMint: string;
  attestationDigestHex: string;
  observedValueHashHex: string;
  asOfTs: number;
  passed: boolean;
  recentBlockhash: string;
  programId: string;
}

export interface BuildFinalizeCycleOutcomeTxParams {
  poolAddress: string;
  member: string;
  cycleId: string;
  ruleHashHex: string;
  payoutMint: string;
  recentBlockhash: string;
  payer: string;
  programId: string;
}

export interface BuildSubmitRewardClaimTxParams {
  claimant: string;
  poolAddress: string;
  member: string;
  cycleId: string;
  ruleHashHex: string;
  intentHashHex: string;
  payoutAmount: bigint;
  payoutMint: string;
  recipient: string;
  recipientSystemAccount: string;
  claimDelegate?: string;
  poolAssetVault?: string;
  poolVaultTokenAccount?: string;
  recipientTokenAccount?: string;
  recentBlockhash: string;
  programId: string;
}

export interface BuildCreateCoveragePolicyTxParams {
  authority: string;
  poolAddress: string;
  member: string;
  termsHashHex: string;
  startsAt: number;
  endsAt: number;
  premiumDueEverySecs: number;
  premiumGraceSecs: number;
  recentBlockhash: string;
  programId: string;
}

export interface BuildMintPolicyNftTxParams {
  authority: string;
  poolAddress: string;
  member: string;
  nftMint: string;
  metadataUri: string;
  recentBlockhash: string;
  programId: string;
}

export interface BuildPayPremiumOnchainTxParams {
  payer: string;
  poolAddress: string;
  member: string;
  payoutMint: string;
  periodIndex: bigint;
  amount: bigint;
  payerTokenAccount: string;
  poolVaultTokenAccount: string;
  recentBlockhash: string;
  programId: string;
}

export interface BuildAttestPremiumPaidOffchainTxParams {
  oracle: string;
  poolAddress: string;
  member: string;
  periodIndex: bigint;
  replayHashHex: string;
  amount: bigint;
  paidAtTs: number;
  recentBlockhash: string;
  programId: string;
}

export interface BuildSubmitCoverageClaimTxParams {
  claimant: string;
  poolAddress: string;
  member: string;
  intentHashHex: string;
  eventHashHex: string;
  claimDelegate?: string;
  recentBlockhash: string;
  programId: string;
}

export interface BuildSettleCoverageClaimTxParams {
  authority: string;
  claimant: string;
  poolAddress: string;
  member: string;
  intentHashHex: string;
  payoutAmount: bigint;
  recipientSystemAccount: string;
  poolAssetVault: string;
  poolVaultTokenAccount: string;
  recipientTokenAccount: string;
  recentBlockhash: string;
  programId: string;
}

export interface BuildRegisterCoverageProductV2TxParams {
  authority: string;
  poolAddress: string;
  productIdHashHex: string;
  displayName: string;
  metadataUri: string;
  termsHashHex: string;
  durationSecs: number;
  premiumDueEverySecs: number;
  premiumGraceSecs: number;
  premiumAmount: bigint;
  active: boolean;
  recentBlockhash: string;
  programId: string;
}

export interface BuildUpdateCoverageProductV2TxParams {
  authority: string;
  poolAddress: string;
  productIdHashHex: string;
  displayName: string;
  metadataUri: string;
  termsHashHex: string;
  durationSecs: number;
  premiumDueEverySecs: number;
  premiumGraceSecs: number;
  premiumAmount: bigint;
  active: boolean;
  recentBlockhash: string;
  programId: string;
}

export interface BuildSubscribeCoverageProductV2TxParams {
  member: string;
  poolAddress: string;
  productIdHashHex: string;
  startsAt: number;
  recentBlockhash: string;
  programId: string;
}

export interface BuildIssueCoveragePolicyFromProductV2TxParams {
  authority: string;
  poolAddress: string;
  member: string;
  productIdHashHex: string;
  startsAt: number;
  recentBlockhash: string;
  programId: string;
}

export interface BuildMigratePoolV1ToV2TxParams {
  authority: string;
  poolAddress: string;
  poolType: number;
  payoutAssetMint: string;
  termsHashHex: string;
  payoutPolicyHashHex: string;
  cycleMode: number;
  metadataUri: string;
  recentBlockhash: string;
  programId: string;
}

export interface BuildMigrateMembershipV1ToV2TxParams {
  member: string;
  poolAddress: string;
  recentBlockhash: string;
  programId: string;
}
