# API Reference — `@omegax/protocol-sdk`

This is the current canonical SDK surface for package consumers.

## Core entrypoints

- `createConnection(rpcUrl, commitment?)`
- `createConnection(options?)`
- `getOmegaXNetworkInfo(input?)`
- `OMEGAX_NETWORKS`
- `createRpcClient(connection)`
- `createProtocolClient(connection, programId)`
- `derivePoolAddress(...)`

Network types:

- `OmegaXNetwork` (`'devnet' | 'mainnet'`)
- `OmegaXNetworkInput` (`'devnet' | 'mainnet' | 'mainnet-beta'`)
- `OmegaXConnectionOptions`
- `OmegaXNetworkInfo`

## Claims module (`@omegax/protocol-sdk/claims`)

- `buildUnsignedRewardClaimTx(...)`
- `validateSignedClaimTx(...)`
- `mapValidationReasonToClaimFailure(...)`
- `normalizeClaimSimulationFailure(...)`
- `normalizeClaimRpcFailure(...)`

## Oracle module (`@omegax/protocol-sdk/oracle`)

- `createOracleSignerFromEnv(...)`
- `createOracleSignerFromKmsAdapter(...)`
- `attestOutcome(...)`

## RPC client (`createRpcClient`)

- `getRecentBlockhash()`
- `broadcastSignedTx(...)`
- `simulateSignedTx(...)`
- `getSignatureStatus(...)`

## Protocol transaction builders (`ProtocolClient`)

### Governance and protocol control

- `buildInitializeProtocolTx(...)`
- `buildSetProtocolParamsTx(...)`
- `buildRotateGovernanceAuthorityTx(...)`
- `buildCreatePoolTx(...)`
- `buildSetPoolStatusTx(...)`
- `buildSetPoolTermsHashTx(...)`
- `buildSetPoolOracleTx(...)`
- `buildSetPoolOraclePolicyTx(...)`
- `buildSetPoolOraclePermissionsTx(...)`
- `buildSetPoolRiskControlsTx(...)`
- `buildSetPoolLiquidityEnabledTx(...)`
- `buildSetPoolCoverageReserveFloorTx(...)`
- `buildSetPoolCompliancePolicyTx(...)`
- `buildSetPoolControlAuthoritiesTx(...)`
- `buildSetPoolAutomationPolicyTx(...)`

### Oracle, schema, and invite registry

- `buildRegisterOracleTx(...)`
- `buildClaimOracleTx(...)`
- `buildUpdateOracleProfileTx(...)`
- `buildUpdateOracleMetadataTx(...)`
- `buildStakeOracleTx(...)`
- `buildRequestUnstakeTx(...)`
- `buildFinalizeUnstakeTx(...)`
- `buildSlashOracleTx(...)`
- `buildRegisterOutcomeSchemaTx(...)`
- `buildVerifyOutcomeSchemaTx(...)`
- `buildCloseOutcomeSchemaTx(...)`
- `buildBackfillSchemaDependencyLedgerTx(...)`
- `buildRegisterInviteIssuerTx(...)`

### Enrollment, rules, and reward claims

- `buildEnrollMemberOpenTx(...)`
- `buildEnrollMemberTokenGateTx(...)`
- `buildEnrollMemberInvitePermitTx(...)`
- `buildSetClaimDelegateTx(...)`
- `buildSetPolicySeriesOutcomeRuleTx(...)`
- `buildSubmitOutcomeAttestationVoteTx(...)`
- `buildFinalizeCycleOutcomeTx(...)`
- `buildOpenCycleOutcomeDisputeTx(...)`
- `buildResolveCycleOutcomeDisputeTx(...)`
- `buildSubmitRewardClaimTx(...)`

Current canonical reward-attestation parameters use `seriesRefHashHex` and `cycleHashHex`.

### Policy series, premiums, and coverage claims

- `buildCreatePolicySeriesTx(...)`
- `buildUpdatePolicySeriesTx(...)`
- `buildUpsertPolicySeriesPaymentOptionTx(...)`
- `buildSubscribePolicySeriesTx(...)`
- `buildIssuePolicyPositionTx(...)`
- `buildMintPolicyNftTx(...)`
- `buildPayPremiumSolTx(...)`
- `buildPayPremiumSplTx(...)`
- `buildAttestPremiumPaidOffchainTx(...)`
- `buildSubmitCoverageClaimTx(...)`
- `buildReviewCoverageClaimTx(...)`
- `buildAttachCoverageClaimDecisionSupportTx(...)`
- `buildApproveCoverageClaimTx(...)`
- `buildDenyCoverageClaimTx(...)`
- `buildPayCoverageClaimTx(...)`
- `buildClaimApprovedCoveragePayoutTx(...)`
- `buildCloseCoverageClaimTx(...)`
- `buildSettleCoverageClaimTx(...)`

Current canonical policy/claim parameters use `seriesRefHashHex`.

### Liquidity, treasury, and cycle settlement

- `buildFundPoolSolTx(...)`
- `buildFundPoolSplTx(...)`
- `buildInitializePoolLiquiditySolTx(...)`
- `buildInitializePoolLiquiditySplTx(...)`
- `buildDepositPoolLiquiditySolTx(...)`
- `buildDepositPoolLiquiditySplTx(...)`
- `buildRedeemPoolLiquiditySolTx(...)`
- `buildRedeemPoolLiquiditySplTx(...)`
- `buildRequestPoolLiquidityRedemptionTx(...)`
- `buildSchedulePoolLiquidityRedemptionTx(...)`
- `buildCancelPoolLiquidityRedemptionTx(...)`
- `buildFulfillPoolLiquidityRedemptionSolTx(...)`
- `buildFulfillPoolLiquidityRedemptionSplTx(...)`
- `buildFailPoolLiquidityRedemptionTx(...)`
- `buildWithdrawProtocolFeeSolTx(...)`
- `buildWithdrawProtocolFeeSplTx(...)`
- `buildWithdrawPoolOracleFeeSolTx(...)`
- `buildWithdrawPoolOracleFeeSplTx(...)`
- `buildWithdrawPoolTreasurySolTx(...)`
- `buildWithdrawPoolTreasurySplTx(...)`
- `buildActivateCycleWithQuoteSolTx(...)`
- `buildActivateCycleWithQuoteSplTx(...)`
- `buildSettleCycleCommitmentTx(...)`
- `buildSettleCycleCommitmentSolTx(...)`
- `buildFinalizeCohortSettlementRootTx(...)`

## Protocol account readers (`ProtocolClient`)

- `fetchProtocolConfig()`
- `fetchPool(poolAddress)`
- `fetchOracleRegistryEntry(oracle)`
- `fetchOracleProfile(oracle)`
- `fetchOracleStakePosition({ oracle, staker })`
- `fetchPoolOracleApproval({ poolAddress, oracle })`
- `fetchPoolOraclePolicy(poolAddress)`
- `fetchPoolOraclePermissionSet({ poolAddress, oracle })`
- `fetchPoolOracleFeeVault({ poolAddress, oracle, paymentMint })`
- `fetchPoolTerms(poolAddress)`
- `fetchPoolAssetVault({ poolAddress, payoutMint })`
- `fetchPoolRiskConfig(poolAddress)`
- `fetchPoolLiquidityConfig(poolAddress)`
- `fetchPoolCapitalClass({ poolAddress, shareMint })`
- `fetchPoolCompliancePolicy(poolAddress)`
- `fetchPoolControlAuthority(poolAddress)`
- `fetchPoolAutomationPolicy(poolAddress)`
- `fetchProtocolFeeVault(paymentMint)`
- `fetchMembershipRecord({ poolAddress, member })`
- `fetchInviteIssuer(issuer)`
- `fetchOutcomeSchema(schemaKeyHashHex)`
- `fetchSchemaDependencyLedger(schemaKeyHashHex)`
- `fetchPoolOutcomeRule({ poolAddress, seriesRefHashHex, ruleHashHex })`
- `fetchCycleOutcomeAggregate({ poolAddress, seriesRefHashHex, member, cycleHashHex, ruleHashHex })`
- `fetchAttestationVote({ poolAddress, seriesRefHashHex, member, cycleHashHex, ruleHashHex, oracle })`
- `fetchClaimDelegate({ poolAddress, member })`
- `fetchClaimRecord({ poolAddress, seriesRefHashHex, member, cycleHashHex, ruleHashHex })`
- `fetchEnrollmentPermitReplay({ poolAddress, member, nonceHashHex })`
- `fetchCycleQuoteReplay({ poolAddress, seriesRefHashHex, member, nonceHashHex })`
- `fetchMemberCycle({ poolAddress, seriesRefHashHex, member, periodIndex })`
- `fetchMemberCycleByAddress(address)`
- `fetchCohortSettlementRoot({ poolAddress, seriesRefHashHex, cohortHashHex })`
- `fetchPolicySeries({ poolAddress, seriesRefHashHex })`
- `fetchPolicySeriesPaymentOption({ poolAddress, seriesRefHashHex, paymentMint })`
- `fetchPolicyPosition({ poolAddress, seriesRefHashHex, member })`
- `fetchPolicyPositionNft({ poolAddress, seriesRefHashHex, member })`
- `fetchPremiumLedger({ poolAddress, seriesRefHashHex, member })`
- `fetchPremiumAttestationReplay({ poolAddress, seriesRefHashHex, member, replayHashHex })`
- `fetchCoverageClaimRecord({ poolAddress, seriesRefHashHex, member, intentHashHex })`
- `fetchRedemptionRequest({ poolAddress, redeemer, requestHashHex })`

## Seed/PDA helpers (`@omegax/protocol-sdk/protocol_seeds`)

Utilities:

- `asPubkey(...)`
- `ZERO_PUBKEY`

Canonical protocol PDAs:

- `deriveConfigPda(...)`
- `derivePoolPda(...)`
- `deriveOraclePda(...)`
- `deriveOracleProfilePda(...)`
- `deriveOracleStakePda(...)`
- `derivePoolOraclePda(...)`
- `derivePoolOraclePolicyPda(...)`
- `derivePoolOraclePermissionSetPda(...)`
- `derivePoolOracleFeeVaultPda(...)`
- `deriveMembershipPda(...)`
- `deriveClaimDelegatePda(...)`
- `derivePoolRulePda(...)`
- `deriveAttestationVotePda(...)`
- `deriveOutcomeAggregatePda(...)`
- `deriveClaimPda(...)`
- `derivePolicySeriesPda(...)`
- `derivePolicySeriesPaymentOptionPda(...)`
- `derivePolicyPositionPda(...)`
- `derivePolicyPositionNftPda(...)`
- `derivePremiumLedgerPda(...)`
- `derivePremiumReplayPda(...)`
- `deriveCoverageClaimPda(...)`
- `deriveMemberCyclePda(...)`
- `deriveCohortSettlementRootPda(...)`
- `deriveCycleQuoteReplayPda(...)`
- `derivePoolAssetVaultPda(...)`
- `derivePoolTermsPda(...)`
- `derivePoolTreasuryReservePda(...)`
- `deriveProtocolFeeVaultPda(...)`
- `deriveInviteIssuerPda(...)`
- `deriveEnrollmentReplayPda(...)`
- `deriveSchemaPda(...)`
- `deriveSchemaDependencyPda(...)`
- `derivePoolShareMintPda(...)`
- `derivePoolCapitalClassPda(...)`
- `derivePoolCompliancePolicyPda(...)`
- `derivePoolControlAuthorityPda(...)`
- `derivePoolAutomationPolicyPda(...)`
- `derivePoolLiquidityConfigPda(...)`
- `derivePoolRiskConfigPda(...)`
- `deriveRedemptionRequestPda(...)`

## Shared utilities (`@omegax/protocol-sdk/utils`)

Examples: `anchorDiscriminator(...)`, `hashStringTo32(...)`, `toHex(...)`, `fromHex(...)`.

## Packaging notes

- ESM-only package.
- Stable subpath exports: `claims`, `protocol`, `protocol_seeds`, `rpc`, `oracle`, `types`, `utils`.
- Builders are deterministic and unsigned; signing and sending are caller-managed.
- `programId` must be provided explicitly in protocol operations.
