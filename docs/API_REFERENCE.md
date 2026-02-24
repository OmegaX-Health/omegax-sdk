# API Reference — `@omegax/protocol-sdk` v0.4.0

This is the complete public SDK surface for package consumers.

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

- `buildUnsignedClaimTx(...)`
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

### Legacy / v1 compatibility

- `buildInitializeProtocolTx(...)`
- `buildSetProtocolPauseTx(...)`
- `buildCreatePoolTx(...)`
- `buildSetPoolStatusTx(...)`
- `buildSetCycleWindowTx(...)`
- `buildFundPoolTx(...)`
- `buildRegisterOracleTx(...)`
- `buildSetPoolOracleTx(...)`
- `buildEnrollMemberTx(...)`
- `buildRevokeMemberTx(...)`
- `buildSubmitOutcomeAttestationTx(...)`
- `buildSubmitClaimTx(...)`

### v2 governance + protocol controls

- `buildInitializeProtocolV2Tx(...)`
- `buildSetProtocolParamsTx(...)`
- `buildRotateGovernanceAuthorityTx(...)`
- `buildRegisterOutcomeSchemaTx(...)`
- `buildVerifyOutcomeSchemaTx(...)`

### v2 oracle lifecycle

- `buildRegisterOracleV2Tx(...)`
- `buildClaimOracleV2Tx(...)`
- `buildUpdateOracleProfileV2Tx(...)`
- `buildUpdateOracleMetadataTx(...)`
- `buildStakeOracleTx(...)`
- `buildRequestUnstakeTx(...)`
- `buildFinalizeUnstakeTx(...)`
- `buildSlashOracleTx(...)`

### v2 pool + rule management

- `buildCreatePoolV2Tx(...)`
- `buildSetPoolOraclePolicyTx(...)`
- `buildSetPoolTermsHashTx(...)`
- `buildSetPoolOutcomeRuleTx(...)`
- `buildRegisterInviteIssuerTx(...)`
- `buildSetClaimDelegateTx(...)`
- `buildFundPoolSolTx(...)`
- `buildFundPoolSplTx(...)`
- `buildFinalizeCycleOutcomeTx(...)`
- `buildSubmitRewardClaimTx(...)`

### v2 member enrollment

- `buildEnrollMemberOpenTx(...)`
- `buildEnrollMemberTokenGateTx(...)`
- `buildEnrollMemberInvitePermitTx(...)`

### v2 attestation voting

- `buildSubmitOutcomeAttestationVoteTx(...)`

### v2 coverage + policy lifecycle

- `buildRegisterCoverageProductV2Tx(...)`
- `buildUpdateCoverageProductV2Tx(...)`
- `buildSubscribeCoverageProductV2Tx(...)`
- `buildIssueCoveragePolicyFromProductV2Tx(...)`
- `buildCreateCoveragePolicyTx(...)`
- `buildMintPolicyNftTx(...)`
- `buildPayPremiumOnchainTx(...)`
- `buildAttestPremiumPaidOffchainTx(...)`
- `buildSubmitCoverageClaimTx(...)`
- `buildSettleCoverageClaimTx(...)`

### Migrations

- `buildMigratePoolV1ToV2Tx(...)`
- `buildMigrateMembershipV1ToV2Tx(...)`

## Protocol account readers (`ProtocolClient`)

### Legacy / v1 compatibility

- `fetchProtocolConfig()`
- `fetchPool(poolAddress)`
- `fetchOracleRegistryEntry(oracle)`
- `fetchPoolOracleApproval({ poolAddress, oracle })`
- `fetchMembershipRecord({ poolAddress, member })`
- `fetchCycleOutcome({ poolAddress, member, cycleId })`
- `fetchCycleWindow({ poolAddress, cycleId })`
- `fetchClaimRecord({ poolAddress, member, cycleId })`

### v2 readers

- `fetchProtocolConfigV2()`
- `fetchOracleProfile(oracle)`
- `fetchOracleStakePosition({ oracle, staker })`
- `fetchPoolOraclePolicy(poolAddress)`
- `fetchPoolTerms(poolAddress)`
- `fetchPoolAssetVault({ poolAddress, payoutMint })`
- `fetchOutcomeSchema(schemaKeyHashHex)`
- `fetchPoolOutcomeRule({ poolAddress, ruleHashHex })`
- `fetchInviteIssuer(issuer)`
- `fetchCycleOutcomeAggregate({ poolAddress, member, cycleId, ruleHashHex })`
- `fetchEnrollmentPermitReplay({ poolAddress, member, nonceHashHex })`
- `fetchAttestationVote({ poolAddress, member, cycleId, ruleHashHex, oracle })`
- `fetchClaimDelegate({ poolAddress, member })`
- `fetchClaimRecordV2({ poolAddress, member, cycleId, ruleHashHex })`
- `fetchCoverageProduct({ poolAddress, productIdHashHex })`
- `fetchCoveragePolicy({ poolAddress, member })`
- `fetchCoveragePolicyPositionNft({ poolAddress, member })`
- `fetchPremiumLedger({ poolAddress, member })`
- `fetchPremiumAttestationReplay({ poolAddress, member, replayHashHex })`
- `fetchCoverageClaimRecord({ poolAddress, member, intentHashHex })`

## Seed/PDA helpers (`@omegax/protocol-sdk/protocol_seeds`)

Utilities:

- `asPubkey(...)`
- `ZERO_PUBKEY`

Legacy/v1 PDAs:

- `deriveConfigPda(...)`
- `derivePoolPda(...)`
- `deriveOraclePda(...)`
- `deriveOracleProfilePda(...)`
- `derivePoolOraclePda(...)`
- `deriveMembershipPda(...)`
- `deriveCycleOutcomePda(...)`
- `deriveCycleWindowPda(...)`
- `deriveReplayPda(...)`
- `deriveClaimPda(...)`

v2 PDAs:

- `deriveConfigV2Pda(...)`
- `deriveOracleStakePda(...)`
- `derivePoolOraclePolicyPda(...)`
- `derivePoolTermsPda(...)`
- `derivePoolAssetVaultPda(...)`
- `deriveSchemaPda(...)`
- `derivePoolRulePda(...)`
- `deriveInviteIssuerPda(...)`
- `deriveEnrollmentReplayPda(...)`
- `deriveAttestationVotePda(...)`
- `deriveClaimDelegatePda(...)`
- `deriveClaimV2Pda(...)`
- `deriveOutcomeAggregatePda(...)`
- `deriveCoveragePolicyPda(...)`
- `deriveCoverageProductPda(...)`
- `deriveCoverageNftPda(...)`
- `derivePremiumLedgerPda(...)`
- `derivePremiumReplayPda(...)`
- `deriveCoverageClaimPda(...)`

## Shared utilities (`@omegax/protocol-sdk/utils`)

Examples: `anchorDiscriminator(...)`, `hashStringTo32(...)`, `toHex(...)`, `fromHex(...)`.

## Packaging notes

- ESM-only package.
- Stable subpath exports: `claims`, `protocol`, `protocol_seeds`, `rpc`, `oracle`, `types`, `utils`.
- Builders are deterministic and unsigned; signing/sending is caller-managed.
- `programId` must be provided explicitly in protocol operations.
