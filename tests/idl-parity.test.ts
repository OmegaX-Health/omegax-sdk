import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  Keypair,
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';

import {
  anchorDiscriminator,
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
  derivePoolOracleFeeVaultPda,
  derivePoolLiquidityConfigPda,
  derivePoolOraclePermissionSetPda,
  derivePoolOraclePolicyPda,
  derivePoolOraclePda,
  derivePoolPda,
  derivePoolRiskConfigPda,
  derivePoolRulePda,
  derivePoolShareMintPda,
  derivePoolTermsPda,
  derivePoolTreasuryReservePda,
  deriveProtocolFeeVaultPda,
  derivePremiumLedgerPda,
  derivePremiumReplayPda,
  deriveRedemptionRequestPda,
  deriveSchemaPda,
  deriveSchemaDependencyPda,
  hashStringTo32,
  ZERO_PUBKEY,
} from '../src/index.js';

type IdlAccountMeta = {
  name: string;
  signer?: boolean;
  writable?: boolean;
  accounts?: IdlAccountMeta[];
};

type IdlInstruction = {
  name: string;
  accounts: IdlAccountMeta[];
};

const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
);
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

function deriveAssociatedTokenAddress(params: {
  owner: PublicKey;
  mint: PublicKey;
}): PublicKey {
  const [address] = PublicKey.findProgramAddressSync(
    [
      params.owner.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      params.mint.toBuffer(),
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  return address;
}

function flattenIdlAccounts(accounts: IdlAccountMeta[]): IdlAccountMeta[] {
  const flattened: IdlAccountMeta[] = [];
  for (const account of accounts) {
    if (account.accounts?.length) {
      flattened.push(...flattenIdlAccounts(account.accounts));
      continue;
    }
    flattened.push(account);
  }
  return flattened;
}

test('sdk builders stay in strict account-order parity with the workspace protocol idl', () => {
  const publicWorkspaceIdlPath = resolve(
    process.cwd(),
    '..',
    'omegax-protocol',
    'idl',
    'omegax_protocol.json',
  );
  const fixtureIdlPath = resolve(
    process.cwd(),
    'tests/fixtures/omegax_protocol.idl.json',
  );
  const idlPath =
    process.env.OMEGAX_PROTOCOL_IDL_PATH ??
    (existsSync(publicWorkspaceIdlPath)
      ? publicWorkspaceIdlPath
      : fixtureIdlPath);
  assert.ok(
    existsSync(idlPath),
    `IDL not found at ${idlPath}. Commit tests/fixtures/omegax_protocol.idl.json or set OMEGAX_PROTOCOL_IDL_PATH.`,
  );

  const idl = JSON.parse(readFileSync(idlPath, 'utf8')) as {
    instructions: IdlInstruction[];
  };
  const idlByName = new Map(
    idl.instructions.map((instruction) => [instruction.name, instruction]),
  );

  const recentBlockhash = '11111111111111111111111111111111';
  const programId = Keypair.generate().publicKey;

  const admin = Keypair.generate().publicKey;
  const authority = Keypair.generate().publicKey;
  const governanceAuthority = Keypair.generate().publicKey;
  const governanceRecovery = Keypair.generate().publicKey;
  const oracleSigner = Keypair.generate();
  const oracle = oracleSigner.publicKey;
  const staker = oracle;
  const claimant = Keypair.generate().publicKey;
  const payer = Keypair.generate().publicKey;
  const member = Keypair.generate().publicKey;
  const publisher = Keypair.generate().publicKey;
  const issuer = Keypair.generate().publicKey;
  const funder = Keypair.generate().publicKey;
  const recipientSystemAccount = Keypair.generate().publicKey;
  const recipientTokenAccount = Keypair.generate().publicKey;
  const funderTokenAccount = Keypair.generate().publicKey;
  const authorityPayoutTokenAccount = Keypair.generate().publicKey;
  const stakerTokenAccount = Keypair.generate().publicKey;
  const destinationTokenAccount = Keypair.generate().publicKey;
  const slashTreasuryTokenAccount = Keypair.generate().publicKey;
  const payerTokenAccount = Keypair.generate().publicKey;
  const poolVaultTokenAccount = Keypair.generate().publicKey;
  const tokenGateAccount = Keypair.generate().publicKey;
  const payoutMint = Keypair.generate().publicKey;
  const stakeMint = Keypair.generate().publicKey;
  const nftMint = Keypair.generate().publicKey;

  const poolId = 'idl-parity-pool';
  const cycleHash = hashStringTo32('idl-parity-cycle');
  const cycleHashHex = Buffer.from(cycleHash).toString('hex');
  const ruleHashHex = '11'.repeat(32);
  const ruleHash = Buffer.from(ruleHashHex, 'hex');
  const schemaKeyHashHex = '22'.repeat(32);
  const schemaKeyHash = Buffer.from(schemaKeyHashHex, 'hex');
  const seriesRefHashHex = '33'.repeat(32);
  const seriesRefHash = Buffer.from(seriesRefHashHex, 'hex');
  const nonceHashHex = '44'.repeat(32);
  const nonceHash = Buffer.from(nonceHashHex, 'hex');
  const replayHashHex = '55'.repeat(32);
  const replayHash = Buffer.from(replayHashHex, 'hex');
  const intentHashHex = '66'.repeat(32);
  const intentHash = Buffer.from(intentHashHex, 'hex');
  const eventHashHex = '77'.repeat(32);
  const cohortHashHex = '88'.repeat(32);
  const cohortHash = Buffer.from(cohortHashHex, 'hex');
  const requestHashHex = '99'.repeat(32);
  const requestHash = Buffer.from(requestHashHex, 'hex');

  const [config] = deriveConfigPda(programId);
  const [pool] = derivePoolPda({
    programId,
    authority,
    poolId,
  });
  const [oracleEntry] = deriveOraclePda({
    programId,
    oracle,
  });
  const [oracleProfile] = deriveOracleProfilePda({
    programId,
    oracle,
  });
  const [stakePosition] = deriveOracleStakePda({
    programId,
    oracle,
    staker,
  });
  const [poolTerms] = derivePoolTermsPda({
    programId,
    poolAddress: pool,
  });
  const [oraclePolicy] = derivePoolOraclePolicyPda({
    programId,
    poolAddress: pool,
  });
  const [poolOracle] = derivePoolOraclePda({
    programId,
    poolAddress: pool,
    oracle,
  });
  const [poolOraclePermissions] = derivePoolOraclePermissionSetPda({
    programId,
    poolAddress: pool,
    oracle,
  });
  const [membership] = deriveMembershipPda({
    programId,
    poolAddress: pool,
    member,
  });
  const [depositorMembership] = deriveMembershipPda({
    programId,
    poolAddress: pool,
    member: funder,
  });
  const [poolRule] = derivePoolRulePda({
    programId,
    poolAddress: pool,
    seriesRefHash,
    ruleHash,
  });
  const [schemaEntry] = deriveSchemaPda({
    programId,
    schemaKeyHash,
  });
  const [schemaDependency] = deriveSchemaDependencyPda({
    programId,
    schemaKeyHash,
  });
  const [vote] = deriveAttestationVotePda({
    programId,
    poolAddress: pool,
    seriesRefHash,
    member,
    cycleHash,
    ruleHash,
    oracle,
  });
  const [aggregate] = deriveOutcomeAggregatePda({
    programId,
    poolAddress: pool,
    seriesRefHash,
    member,
    cycleHash,
    ruleHash,
  });
  const [inviteIssuerEntry] = deriveInviteIssuerPda({
    programId,
    issuer,
  });
  const [enrollmentReplay] = deriveEnrollmentReplayPda({
    programId,
    poolAddress: pool,
    member,
    nonceHash,
  });
  const [claimDelegate] = deriveClaimDelegatePda({
    programId,
    poolAddress: pool,
    member,
  });
  const [claimantClaimDelegate] = deriveClaimDelegatePda({
    programId,
    poolAddress: pool,
    member: claimant,
  });
  const [poolAssetVault] = derivePoolAssetVaultPda({
    programId,
    poolAddress: pool,
    payoutMint,
  });
  const [poolRiskConfig] = derivePoolRiskConfigPda({
    programId,
    poolAddress: pool,
  });
  const [poolLiquidityConfig] = derivePoolLiquidityConfigPda({
    programId,
    poolAddress: pool,
  });
  const [poolShareMint] = derivePoolShareMintPda({
    programId,
    poolAddress: pool,
  });
  const [poolCapitalClass] = derivePoolCapitalClassPda({
    programId,
    poolAddress: pool,
    shareMint: poolShareMint,
  });
  const [poolCompliancePolicy] = derivePoolCompliancePolicyPda({
    programId,
    poolAddress: pool,
  });
  const [poolControlAuthority] = derivePoolControlAuthorityPda({
    programId,
    poolAddress: pool,
  });
  const [poolAutomationPolicy] = derivePoolAutomationPolicyPda({
    programId,
    poolAddress: pool,
  });
  const derivedPoolVaultTokenAccount = deriveAssociatedTokenAddress({
    owner: poolAssetVault,
    mint: payoutMint,
  });
  const authorityShareTokenAccount = deriveAssociatedTokenAddress({
    owner: authority,
    mint: poolShareMint,
  });
  const derivedPayerTokenAccount = deriveAssociatedTokenAddress({
    owner: payer,
    mint: payoutMint,
  });
  const depositorShareTokenAccount = deriveAssociatedTokenAddress({
    owner: funder,
    mint: poolShareMint,
  });
  const redeemerShareTokenAccount = deriveAssociatedTokenAddress({
    owner: member,
    mint: poolShareMint,
  });
  const derivedMemberTokenAccount = deriveAssociatedTokenAddress({
    owner: member,
    mint: payoutMint,
  });
  const [claimRecord] = deriveClaimPda({
    programId,
    poolAddress: pool,
    seriesRefHash,
    member,
    cycleHash,
    ruleHash,
  });
  const [policySeries] = derivePolicySeriesPda({
    programId,
    poolAddress: pool,
    seriesRefHash,
  });
  const [policySeriesPaymentOption] = derivePolicySeriesPaymentOptionPda({
    programId,
    poolAddress: pool,
    seriesRefHash,
    paymentMint: payoutMint,
  });
  const [policySeriesPaymentOptionSol] = derivePolicySeriesPaymentOptionPda({
    programId,
    poolAddress: pool,
    seriesRefHash,
    paymentMint: ZERO_PUBKEY,
  });
  const [policyPosition] = derivePolicyPositionPda({
    programId,
    poolAddress: pool,
    seriesRefHash,
    member,
  });
  const [policyPositionNft] = derivePolicyPositionNftPda({
    programId,
    poolAddress: pool,
    seriesRefHash,
    member,
  });
  const [premiumLedger] = derivePremiumLedgerPda({
    programId,
    poolAddress: pool,
    seriesRefHash,
    member,
  });
  const [premiumReplay] = derivePremiumReplayPda({
    programId,
    poolAddress: pool,
    seriesRefHash,
    member,
    replayHash,
  });
  const [memberCycle] = deriveMemberCyclePda({
    programId,
    poolAddress: pool,
    seriesRefHash,
    member,
    periodIndex: 1n,
  });
  const [cohortSettlementRoot] = deriveCohortSettlementRootPda({
    programId,
    poolAddress: pool,
    seriesRefHash,
    cohortHash,
  });
  const [cycleQuoteReplay] = deriveCycleQuoteReplayPda({
    programId,
    poolAddress: pool,
    seriesRefHash,
    member,
    nonceHash,
  });
  const [poolTreasuryReserve] = derivePoolTreasuryReservePda({
    programId,
    poolAddress: pool,
    paymentMint: payoutMint,
  });
  const [poolTreasuryReserveSol] = derivePoolTreasuryReservePda({
    programId,
    poolAddress: pool,
    paymentMint: ZERO_PUBKEY,
  });
  const [protocolFeeVault] = deriveProtocolFeeVaultPda({
    programId,
    paymentMint: payoutMint,
  });
  const [protocolFeeVaultSol] = deriveProtocolFeeVaultPda({
    programId,
    paymentMint: ZERO_PUBKEY,
  });
  const protocolFeeVaultTokenAccount = deriveAssociatedTokenAddress({
    owner: protocolFeeVault,
    mint: payoutMint,
  });
  const [poolOracleFeeVault] = derivePoolOracleFeeVaultPda({
    programId,
    poolAddress: pool,
    oracle,
    paymentMint: payoutMint,
  });
  const [poolOracleFeeVaultSol] = derivePoolOracleFeeVaultPda({
    programId,
    poolAddress: pool,
    oracle,
    paymentMint: ZERO_PUBKEY,
  });
  const poolOracleFeeVaultTokenAccount = deriveAssociatedTokenAddress({
    owner: poolOracleFeeVault,
    mint: payoutMint,
  });
  const [coverageClaim] = deriveCoverageClaimPda({
    programId,
    poolAddress: pool,
    seriesRefHash,
    member,
    intentHash,
  });
  const [redemptionRequest] = deriveRedemptionRequestPda({
    programId,
    poolAddress: pool,
    redeemer: member,
    requestHash,
  });
  const redemptionRequestShareEscrow = deriveAssociatedTokenAddress({
    owner: redemptionRequest,
    mint: poolShareMint,
  });

  const accountByName: Record<string, PublicKey> = {
    admin,
    aggregate,
    associated_token_program: ASSOCIATED_TOKEN_PROGRAM_ID,
    authority,
    claim_delegate: claimDelegate,
    claim_record: claimRecord,
    claimant,
    claim_signer: payer,
    config,
    coverage_claim: coverageClaim,
    cycle_quote_replay: cycleQuoteReplay,
    depositor: funder,
    depositor_payout_token_account: funderTokenAccount,
    depositor_share_token_account: depositorShareTokenAccount,
    destination_token_account: destinationTokenAccount,
    enrollment_replay: enrollmentReplay,
    funder,
    funder_token_account: funderTokenAccount,
    governance_authority: governanceAuthority,
    invite_issuer_entry: inviteIssuerEntry,
    issuer,
    member,
    membership,
    oracle,
    oracle_entry: oracleEntry,
    oracle_policy: oraclePolicy,
    oracle_profile: oracleProfile,
    payer,
    payer_token_account: payerTokenAccount,
    payment_mint: payoutMint,
    payout_mint: payoutMint,
    pool,
    pool_automation_policy: poolAutomationPolicy,
    pool_asset_vault: poolAssetVault,
    pool_capital_class: poolCapitalClass,
    pool_compliance_policy: poolCompliancePolicy,
    pool_control_authority: poolControlAuthority,
    pool_liquidity_config: poolLiquidityConfig,
    pool_oracle: poolOracle,
    pool_oracle_fee_vault: poolOracleFeeVault,
    pool_oracle_fee_vault_token_account: poolOracleFeeVaultTokenAccount,
    pool_oracle_permissions: poolOraclePermissions,
    pool_risk_config: poolRiskConfig,
    pool_rule: poolRule,
    pool_share_mint: poolShareMint,
    pool_terms: poolTerms,
    pool_treasury_reserve: poolTreasuryReserve,
    policy_position: policyPosition,
    policy_position_nft: policyPositionNft,
    policy_series: policySeries,
    policy_series_payment_option: policySeriesPaymentOption,
    pool_vault_token_account: poolVaultTokenAccount,
    premium_ledger: premiumLedger,
    premium_replay: premiumReplay,
    protocol_fee_vault: protocolFeeVault,
    protocol_fee_vault_token_account: protocolFeeVaultTokenAccount,
    publisher,
    recipient_system_account: recipientSystemAccount,
    recipient_token_account: recipientTokenAccount,
    redemption_request: redemptionRequest,
    redemption_request_share_escrow: redemptionRequestShareEscrow,
    redeemer: member,
    redeemer_payout_token_account: recipientTokenAccount,
    redeemer_share_token_account: redeemerShareTokenAccount,
    redeemer_system_account: recipientSystemAccount,
    schema_dependency: schemaDependency,
    schema_entry: schemaEntry,
    slash_treasury_token_account: slashTreasuryTokenAccount,
    stake_mint: stakeMint,
    stake_position: stakePosition,
    stake_vault: poolVaultTokenAccount,
    staker,
    staker_token_account: stakerTokenAccount,
    system_program: SystemProgram.programId,
    token_gate_account: tokenGateAccount,
    token_program: TOKEN_PROGRAM_ID,
    vote,
    member_cycle: memberCycle,
    cohort_settlement_root: cohortSettlementRoot,
    authority_payout_token_account: authorityPayoutTokenAccount,
    authority_share_token_account: authorityShareTokenAccount,
  };

  const connection = createConnection('http://127.0.0.1:8899', 'confirmed');
  const client = createProtocolClient(connection, programId.toBase58());

  const buildByInstruction: Record<string, () => Transaction> = {
    activate_cycle_with_quote_sol: () =>
      client.buildActivateCycleWithQuoteSolTx({
        payer: payer.toBase58(),
        member: member.toBase58(),
        poolAddress: pool.toBase58(),
        oracle: oracle.toBase58(),
        seriesRefHashHex,
        premiumAmountRaw: 20n,
        canonicalPremiumAmount: 20n,
        periodIndex: 1n,
        commitmentEnabled: true,
        bondAmountRaw: 1n,
        shieldFeeRaw: 2n,
        protocolFeeRaw: 3n,
        oracleFeeRaw: 4n,
        netPoolPremiumRaw: 10n,
        totalAmountRaw: 20n,
        includedShieldCount: 1,
        thresholdBps: 500,
        outcomeThresholdScore: 80,
        cohortHashHex,
        expiresAtTs: 1_700_000_500n,
        nonceHashHex,
        quoteMetaHashHex: '18'.repeat(32),
        quoteMessage: new Uint8Array([1, 2, 3, 4]),
        oracleSecretKey: oracleSigner.secretKey,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    activate_cycle_with_quote_spl: () =>
      client.buildActivateCycleWithQuoteSplTx({
        payer: payer.toBase58(),
        member: member.toBase58(),
        poolAddress: pool.toBase58(),
        oracle: oracle.toBase58(),
        seriesRefHashHex,
        paymentMint: payoutMint.toBase58(),
        premiumAmountRaw: 20n,
        canonicalPremiumAmount: 20n,
        periodIndex: 1n,
        commitmentEnabled: true,
        bondAmountRaw: 1n,
        shieldFeeRaw: 2n,
        protocolFeeRaw: 3n,
        oracleFeeRaw: 4n,
        netPoolPremiumRaw: 10n,
        totalAmountRaw: 20n,
        includedShieldCount: 1,
        thresholdBps: 500,
        outcomeThresholdScore: 80,
        cohortHashHex,
        expiresAtTs: 1_700_000_500n,
        nonceHashHex,
        quoteMetaHashHex: '19'.repeat(32),
        quoteMessage: new Uint8Array([5, 6, 7, 8]),
        oracleSecretKey: oracleSigner.secretKey,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    approve_coverage_claim: () =>
      client.buildApproveCoverageClaimTx({
        oracle: oracle.toBase58(),
        poolAddress: pool.toBase58(),
        member: member.toBase58(),
        seriesRefHashHex,
        intentHashHex,
        approvedAmount: 25n,
        payoutMint: payoutMint.toBase58(),
        poolAssetVault: poolAssetVault.toBase58(),
        poolVaultTokenAccount: derivedPoolVaultTokenAccount.toBase58(),
        decisionReasonHashHex: '1a'.repeat(32),
        adjudicationRefHashHex: '1b'.repeat(32),
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    attach_coverage_claim_decision_support: () =>
      client.buildAttachCoverageClaimDecisionSupportTx({
        oracle: oracle.toBase58(),
        poolAddress: pool.toBase58(),
        member: member.toBase58(),
        seriesRefHashHex,
        intentHashHex,
        aiDecisionHashHex: '1c'.repeat(32),
        aiPolicyHashHex: '1d'.repeat(32),
        aiExecutionEnvironmentHashHex: '1e'.repeat(32),
        aiAttestationRefHashHex: '1f'.repeat(32),
        aiRole: 2,
        automationMode: 1,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    attest_premium_paid_offchain: () =>
      client.buildAttestPremiumPaidOffchainTx({
        oracle: oracle.toBase58(),
        poolAddress: pool.toBase58(),
        member: member.toBase58(),
        seriesRefHashHex,
        periodIndex: 1n,
        replayHashHex,
        amount: 10n,
        paidAtTs: 1_700_000_100,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    claim_oracle: () =>
      client.buildClaimOracleTx({
        oracle: oracle.toBase58(),
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    cancel_pool_liquidity_redemption: () =>
      client.buildCancelPoolLiquidityRedemptionTx({
        redeemer: member.toBase58(),
        poolAddress: pool.toBase58(),
        redemptionRequest: redemptionRequest.toBase58(),
        redeemerShareTokenAccount: redeemerShareTokenAccount.toBase58(),
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    claim_approved_coverage_payout: () =>
      client.buildClaimApprovedCoveragePayoutTx({
        claimSigner: payer.toBase58(),
        claimant: claimant.toBase58(),
        poolAddress: pool.toBase58(),
        member: member.toBase58(),
        seriesRefHashHex,
        intentHashHex,
        payoutAmount: 25n,
        payoutMint: payoutMint.toBase58(),
        recipientSystemAccount: recipientSystemAccount.toBase58(),
        poolAssetVault: poolAssetVault.toBase58(),
        poolVaultTokenAccount: derivedPoolVaultTokenAccount.toBase58(),
        recipientTokenAccount: recipientTokenAccount.toBase58(),
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    backfill_schema_dependency_ledger: () =>
      client.buildBackfillSchemaDependencyLedgerTx({
        governanceAuthority: governanceAuthority.toBase58(),
        schemaKeyHashHex,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    close_coverage_claim: () =>
      client.buildCloseCoverageClaimTx({
        authority: authority.toBase58(),
        poolAddress: pool.toBase58(),
        member: member.toBase58(),
        seriesRefHashHex,
        intentHashHex,
        payoutMint: payoutMint.toBase58(),
        recoveryAmount: 5n,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    close_outcome_schema: () =>
      client.buildCloseOutcomeSchemaTx({
        governanceAuthority: governanceAuthority.toBase58(),
        schemaKeyHashHex,
        recipientSystemAccount: recipientSystemAccount.toBase58(),
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    create_pool: () =>
      client.buildCreatePoolTx({
        authority: authority.toBase58(),
        poolId,
        organizationRef: 'omega-org',
        payoutLamportsPerPass: 10n,
        membershipMode: 1,
        tokenGateMint: payoutMint.toBase58(),
        tokenGateMinBalance: 1n,
        inviteIssuer: issuer.toBase58(),
        poolType: 1,
        payoutAssetMint: payoutMint.toBase58(),
        termsHashHex: '99'.repeat(32),
        payoutPolicyHashHex: 'aa'.repeat(32),
        cycleMode: 1,
        metadataUri: 'https://omegax.health/pool',
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    withdraw_pool_treasury_sol: () =>
      client.buildWithdrawPoolTreasurySolTx({
        payer: oracle.toBase58(),
        oracle: oracle.toBase58(),
        poolAddress: pool.toBase58(),
        amount: 5n,
        recipientSystemAccount: recipientSystemAccount.toBase58(),
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    withdraw_pool_treasury_spl: () =>
      client.buildWithdrawPoolTreasurySplTx({
        payer: oracle.toBase58(),
        oracle: oracle.toBase58(),
        poolAddress: pool.toBase58(),
        paymentMint: payoutMint.toBase58(),
        amount: 5n,
        recipientTokenAccount: recipientTokenAccount.toBase58(),
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    deny_coverage_claim: () =>
      client.buildDenyCoverageClaimTx({
        oracle: oracle.toBase58(),
        poolAddress: pool.toBase58(),
        member: member.toBase58(),
        seriesRefHashHex,
        intentHashHex,
        payoutMint: payoutMint.toBase58(),
        decisionReasonHashHex: '20'.repeat(32),
        adjudicationRefHashHex: '21'.repeat(32),
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    deposit_pool_liquidity_sol: () =>
      client.buildDepositPoolLiquiditySolTx({
        depositor: funder.toBase58(),
        poolAddress: pool.toBase58(),
        amountIn: 100n,
        minSharesOut: 90n,
        includePoolCapitalClass: true,
        includePoolCompliancePolicy: true,
        includeMembership: true,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    deposit_pool_liquidity_spl: () =>
      client.buildDepositPoolLiquiditySplTx({
        depositor: funder.toBase58(),
        poolAddress: pool.toBase58(),
        payoutMint: payoutMint.toBase58(),
        depositorPayoutTokenAccount: funderTokenAccount.toBase58(),
        amountIn: 100n,
        minSharesOut: 90n,
        includePoolCapitalClass: true,
        includePoolCompliancePolicy: true,
        includeMembership: true,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    enroll_member_invite_permit: () =>
      client.buildEnrollMemberInvitePermitTx({
        member: member.toBase58(),
        poolAddress: pool.toBase58(),
        issuer: issuer.toBase58(),
        nonceHashHex,
        inviteIdHashHex: 'bb'.repeat(32),
        expiresAtTs: 1_800_000_000,
        includePoolCompliancePolicy: true,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    enroll_member_open: () =>
      client.buildEnrollMemberOpenTx({
        member: member.toBase58(),
        poolAddress: pool.toBase58(),
        subjectCommitmentHex: 'cc'.repeat(32),
        includePoolCompliancePolicy: true,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    enroll_member_token_gate: () =>
      client.buildEnrollMemberTokenGateTx({
        member: member.toBase58(),
        poolAddress: pool.toBase58(),
        tokenGateAccount: tokenGateAccount.toBase58(),
        subjectCommitmentHex: 'dd'.repeat(32),
        includePoolCompliancePolicy: true,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    fail_pool_liquidity_redemption: () =>
      client.buildFailPoolLiquidityRedemptionTx({
        authority: authority.toBase58(),
        poolAddress: pool.toBase58(),
        redemptionRequest: redemptionRequest.toBase58(),
        redeemer: member.toBase58(),
        failureCode: 3,
        redeemerShareTokenAccount: redeemerShareTokenAccount.toBase58(),
        includePoolControlAuthority: true,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    finalize_cohort_settlement_root: () =>
      client.buildFinalizeCohortSettlementRootTx({
        oracle: oracle.toBase58(),
        poolAddress: pool.toBase58(),
        seriesRefHashHex,
        payoutMint: payoutMint.toBase58(),
        cohortHashHex,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    finalize_cycle_outcome: () =>
      client.buildFinalizeCycleOutcomeTx({
        feePayer: payer.toBase58(),
        poolAddress: pool.toBase58(),
        seriesRefHashHex,
        member: member.toBase58(),
        cycleHashHex,
        ruleHashHex,
        payoutMint: payoutMint.toBase58(),
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    finalize_unstake: () =>
      client.buildFinalizeUnstakeTx({
        staker: staker.toBase58(),
        oracle: oracle.toBase58(),
        stakeVault: poolVaultTokenAccount.toBase58(),
        destinationTokenAccount: destinationTokenAccount.toBase58(),
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    fulfill_pool_liquidity_redemption_sol: () =>
      client.buildFulfillPoolLiquidityRedemptionSolTx({
        authority: authority.toBase58(),
        poolAddress: pool.toBase58(),
        redemptionRequest: redemptionRequest.toBase58(),
        redeemerSystemAccount: recipientSystemAccount.toBase58(),
        includePoolControlAuthority: true,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    fulfill_pool_liquidity_redemption_spl: () =>
      client.buildFulfillPoolLiquidityRedemptionSplTx({
        authority: authority.toBase58(),
        poolAddress: pool.toBase58(),
        payoutMint: payoutMint.toBase58(),
        redemptionRequest: redemptionRequest.toBase58(),
        redeemerPayoutTokenAccount: recipientTokenAccount.toBase58(),
        includePoolControlAuthority: true,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    fund_pool_sol: () =>
      client.buildFundPoolSolTx({
        funder: funder.toBase58(),
        poolAddress: pool.toBase58(),
        lamports: 100n,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    fund_pool_spl: () =>
      client.buildFundPoolSplTx({
        funder: funder.toBase58(),
        poolAddress: pool.toBase58(),
        payoutMint: payoutMint.toBase58(),
        funderTokenAccount: funderTokenAccount.toBase58(),
        amount: 100n,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    initialize_pool_liquidity_sol: () =>
      client.buildInitializePoolLiquiditySolTx({
        authority: authority.toBase58(),
        poolAddress: pool.toBase58(),
        initialLamports: 50n,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    initialize_pool_liquidity_spl: () =>
      client.buildInitializePoolLiquiditySplTx({
        authority: authority.toBase58(),
        poolAddress: pool.toBase58(),
        payoutMint: payoutMint.toBase58(),
        authorityPayoutTokenAccount: authorityPayoutTokenAccount.toBase58(),
        initialAmount: 50n,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    initialize_protocol: () =>
      client.buildInitializeProtocolTx({
        admin: admin.toBase58(),
        protocolFeeBps: 10,
        governanceRealm: governanceAuthority.toBase58(),
        governanceConfig: governanceRecovery.toBase58(),
        defaultStakeMint: stakeMint.toBase58(),
        minOracleStake: 1n,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    issue_policy_position: () =>
      client.buildIssuePolicyPositionTx({
        authority: authority.toBase58(),
        poolAddress: pool.toBase58(),
        member: member.toBase58(),
        seriesRefHashHex,
        startsAtTs: 1_700_000_000,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    mint_policy_nft: () =>
      client.buildMintPolicyNftTx({
        authority: authority.toBase58(),
        poolAddress: pool.toBase58(),
        member: member.toBase58(),
        seriesRefHashHex,
        nftMint: nftMint.toBase58(),
        metadataUri: 'https://omegax.health/nft',
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    open_cycle_outcome_dispute: () =>
      client.buildOpenCycleOutcomeDisputeTx({
        authority: authority.toBase58(),
        poolAddress: pool.toBase58(),
        aggregate: aggregate.toBase58(),
        disputeReasonHashHex: '22'.repeat(32),
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    pay_coverage_claim: () =>
      client.buildPayCoverageClaimTx({
        authority: authority.toBase58(),
        claimant: claimant.toBase58(),
        poolAddress: pool.toBase58(),
        member: member.toBase58(),
        seriesRefHashHex,
        intentHashHex,
        payoutAmount: 25n,
        payoutMint: payoutMint.toBase58(),
        recipientSystemAccount: recipientSystemAccount.toBase58(),
        poolAssetVault: poolAssetVault.toBase58(),
        poolVaultTokenAccount: derivedPoolVaultTokenAccount.toBase58(),
        recipientTokenAccount: recipientTokenAccount.toBase58(),
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    pay_premium_sol: () =>
      client.buildPayPremiumSolTx({
        payer: payer.toBase58(),
        poolAddress: pool.toBase58(),
        member: member.toBase58(),
        seriesRefHashHex,
        periodIndex: 1n,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    pay_premium_spl: () =>
      client.buildPayPremiumSplTx({
        payer: payer.toBase58(),
        poolAddress: pool.toBase58(),
        member: member.toBase58(),
        seriesRefHashHex,
        paymentMint: payoutMint.toBase58(),
        payerTokenAccount: payerTokenAccount.toBase58(),
        periodIndex: 1n,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    create_policy_series: () =>
      client.buildCreatePolicySeriesTx({
        authority: authority.toBase58(),
        poolAddress: pool.toBase58(),
        seriesRefHashHex,
        status: 1,
        planMode: 1,
        sponsorMode: 2,
        displayName: 'Coverage Prime',
        metadataUri: 'https://omegax.health/coverage',
        termsHashHex: 'ee'.repeat(32),
        durationSecs: 86_400,
        premiumDueEverySecs: 3_600,
        premiumGraceSecs: 600,
        premiumAmount: 30n,
        interopProfileHashHex: '40'.repeat(32),
        oracleProfileHashHex: '41'.repeat(32),
        riskFamilyHashHex: '42'.repeat(32),
        issuanceTemplateHashHex: '43'.repeat(32),
        comparabilityHashHex: '44'.repeat(32),
        renewalOfHashHex: '45'.repeat(32),
        termsVersion: 1,
        mappingVersion: 1,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    upsert_policy_series_payment_option: () =>
      client.buildUpsertPolicySeriesPaymentOptionTx({
        authority: authority.toBase58(),
        poolAddress: pool.toBase58(),
        seriesRefHashHex,
        paymentMint: payoutMint.toBase58(),
        paymentAmount: 30n,
        active: true,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    register_invite_issuer: () =>
      client.buildRegisterInviteIssuerTx({
        issuer: issuer.toBase58(),
        organizationRef: 'omega-org',
        metadataUri: 'https://omegax.health/invite',
        active: true,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    register_oracle: () =>
      client.buildRegisterOracleTx({
        admin: admin.toBase58(),
        oraclePubkey: oracle.toBase58(),
        oracleType: 1,
        displayName: 'Omega Oracle',
        legalName: 'Omega Oracle LLC',
        websiteUrl: 'https://oracle.omegax.health',
        appUrl: 'https://app.oracle.omegax.health',
        logoUri: 'https://oracle.omegax.health/logo.png',
        webhookUrl: 'https://oracle.omegax.health/webhook',
        supportedSchemaKeyHashesHex: [schemaKeyHashHex],
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    register_outcome_schema: () =>
      client.buildRegisterOutcomeSchemaTx({
        publisher: publisher.toBase58(),
        schemaKeyHashHex,
        schemaKey: 'goal.streak.days',
        version: 1,
        schemaHashHex: 'ff'.repeat(32),
        metadataUri: 'https://omegax.health/schema',
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    register_pool_capital_class: () =>
      client.buildRegisterPoolCapitalClassTx({
        authority: authority.toBase58(),
        poolAddress: pool.toBase58(),
        classIdHashHex: '23'.repeat(32),
        classMode: 1,
        classPriority: 1,
        transferMode: 1,
        restricted: false,
        redemptionQueueEnabled: true,
        ringFenced: false,
        lockupSecs: 0,
        redemptionNoticeSecs: 3600,
        complianceProfileHashHex: '24'.repeat(32),
        seriesRefHashHex: '25'.repeat(32),
        vintageIndex: 1,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    request_unstake: () =>
      client.buildRequestUnstakeTx({
        staker: staker.toBase58(),
        oracle: oracle.toBase58(),
        amount: 1n,
        cooldownSeconds: 60,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    request_pool_liquidity_redemption: () =>
      client.buildRequestPoolLiquidityRedemptionTx({
        redeemer: member.toBase58(),
        poolAddress: pool.toBase58(),
        requestHashHex,
        sharesIn: 10n,
        minAmountOut: 9n,
        redeemerShareTokenAccount: redeemerShareTokenAccount.toBase58(),
        includePoolCapitalClass: true,
        includePoolCompliancePolicy: true,
        includeMembership: true,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    resolve_cycle_outcome_dispute: () =>
      client.buildResolveCycleOutcomeDisputeTx({
        governanceAuthority: governanceAuthority.toBase58(),
        poolAddress: pool.toBase58(),
        payoutMint: payoutMint.toBase58(),
        aggregate: aggregate.toBase58(),
        sustainOriginalOutcome: true,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    review_coverage_claim: () =>
      client.buildReviewCoverageClaimTx({
        oracle: oracle.toBase58(),
        poolAddress: pool.toBase58(),
        member: member.toBase58(),
        seriesRefHashHex,
        intentHashHex,
        requestedAmount: 25n,
        evidenceHashHex: '26'.repeat(32),
        interopRefHashHex: '27'.repeat(32),
        claimFamily: 1,
        interopProfileHashHex: '28'.repeat(32),
        codeSystemFamilyHashHex: '29'.repeat(32),
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    schedule_pool_liquidity_redemption: () =>
      client.buildSchedulePoolLiquidityRedemptionTx({
        authority: authority.toBase58(),
        poolAddress: pool.toBase58(),
        redemptionRequest: redemptionRequest.toBase58(),
        includePoolControlAuthority: true,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    rotate_governance_authority: () =>
      client.buildRotateGovernanceAuthorityTx({
        governanceAuthority: governanceAuthority.toBase58(),
        newAuthority: governanceRecovery.toBase58(),
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    set_claim_delegate: () =>
      client.buildSetClaimDelegateTx({
        member: member.toBase58(),
        poolAddress: pool.toBase58(),
        delegate: claimant.toBase58(),
        active: true,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    set_pool_oracle: () =>
      client.buildSetPoolOracleTx({
        authority: authority.toBase58(),
        poolAddress: pool.toBase58(),
        oracle: oracle.toBase58(),
        active: true,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    set_pool_automation_policy: () =>
      client.buildSetPoolAutomationPolicyTx({
        authority: authority.toBase58(),
        poolAddress: pool.toBase58(),
        oracleAutomationMode: 1,
        claimAutomationMode: 2,
        allowedAiRolesMask: 7,
        maxAutoClaimAmount: 100n,
        requiredAttestationProviderRefHashHex: '2a'.repeat(32),
        includePoolControlAuthority: true,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    set_pool_compliance_policy: () =>
      client.buildSetPoolCompliancePolicyTx({
        authority: authority.toBase58(),
        poolAddress: pool.toBase58(),
        providerRefHashHex: '2b'.repeat(32),
        credentialTypeHashHex: '2c'.repeat(32),
        revocationListHashHex: '2d'.repeat(32),
        actionsMask: 0xff,
        bindingMode: 1,
        providerMode: 2,
        capitalRailMode: 1,
        payoutRailMode: 2,
        active: true,
        includePoolControlAuthority: true,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    set_pool_control_authorities: () =>
      client.buildSetPoolControlAuthoritiesTx({
        authority: authority.toBase58(),
        poolAddress: pool.toBase58(),
        operatorAuthority: authority.toBase58(),
        riskManagerAuthority: governanceAuthority.toBase58(),
        complianceAuthority: governanceRecovery.toBase58(),
        guardianAuthority: publisher.toBase58(),
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    set_pool_oracle_policy: () =>
      client.buildSetPoolOraclePolicyTx({
        authority: authority.toBase58(),
        poolAddress: pool.toBase58(),
        quorumM: 2,
        quorumN: 3,
        requireVerifiedSchema: true,
        oracleFeeBps: 15,
        allowDelegateClaim: true,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    set_pool_liquidity_enabled: () =>
      client.buildSetPoolLiquidityEnabledTx({
        authority: authority.toBase58(),
        poolAddress: pool.toBase58(),
        enabled: true,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    set_pool_oracle_permissions: () =>
      client.buildSetPoolOraclePermissionsTx({
        authority: authority.toBase58(),
        poolAddress: pool.toBase58(),
        oracle: oracle.toBase58(),
        permissions: 63,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    set_policy_series_outcome_rule: () =>
      client.buildSetPolicySeriesOutcomeRuleTx({
        authority: authority.toBase58(),
        poolAddress: pool.toBase58(),
        seriesRefHashHex,
        ruleHashHex,
        schemaKeyHashHex,
        ruleId: 'rule-1',
        schemaKey: 'goal.streak.days',
        schemaVersion: 1,
        payoutHashHex: '10'.repeat(32),
        enabled: true,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    set_pool_status: () =>
      client.buildSetPoolStatusTx({
        authority: authority.toBase58(),
        poolAddress: pool.toBase58(),
        status: 1,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    set_pool_terms_hash: () =>
      client.buildSetPoolTermsHashTx({
        authority: authority.toBase58(),
        poolAddress: pool.toBase58(),
        termsHashHex: '12'.repeat(32),
        payoutPolicyHashHex: '13'.repeat(32),
        cycleMode: 1,
        metadataUri: 'https://omegax.health/terms',
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    set_pool_risk_controls: () =>
      client.buildSetPoolRiskControlsTx({
        authority: authority.toBase58(),
        poolAddress: pool.toBase58(),
        payoutMint: payoutMint.toBase58(),
        redemptionMode: 2,
        claimMode: 1,
        impaired: false,
        impairmentAmount: 0n,
        includePoolControlAuthority: true,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    set_protocol_params: () =>
      client.buildSetProtocolParamsTx({
        governanceAuthority: governanceAuthority.toBase58(),
        protocolFeeBps: 50,
        allowedPayoutMintsHashHex: '14'.repeat(32),
        defaultStakeMint: stakeMint.toBase58(),
        minOracleStake: 5n,
        emergencyPaused: false,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    set_pool_coverage_reserve_floor: () =>
      client.buildSetPoolCoverageReserveFloorTx({
        authority: authority.toBase58(),
        poolAddress: pool.toBase58(),
        paymentMint: payoutMint.toBase58(),
        amount: 15n,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    settle_coverage_claim: () =>
      client.buildSettleCoverageClaimTx({
        oracle: oracle.toBase58(),
        claimant: claimant.toBase58(),
        poolAddress: pool.toBase58(),
        member: member.toBase58(),
        seriesRefHashHex,
        intentHashHex,
        payoutAmount: 25n,
        payoutMint: payoutMint.toBase58(),
        recipientSystemAccount: recipientSystemAccount.toBase58(),
        poolAssetVault: poolAssetVault.toBase58(),
        poolVaultTokenAccount: derivedPoolVaultTokenAccount.toBase58(),
        recipientTokenAccount: recipientTokenAccount.toBase58(),
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    settle_cycle_commitment: () =>
      client.buildSettleCycleCommitmentTx({
        payer: oracle.toBase58(),
        oracle: oracle.toBase58(),
        member: member.toBase58(),
        poolAddress: pool.toBase58(),
        seriesRefHashHex,
        paymentMint: payoutMint.toBase58(),
        periodIndex: 1n,
        passed: true,
        shieldConsumed: false,
        settledHealthAlphaScore: 82,
        cohortHashHex,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    settle_cycle_commitment_sol: () =>
      client.buildSettleCycleCommitmentSolTx({
        payer: oracle.toBase58(),
        oracle: oracle.toBase58(),
        member: member.toBase58(),
        poolAddress: pool.toBase58(),
        seriesRefHashHex,
        periodIndex: 1n,
        passed: true,
        shieldConsumed: false,
        settledHealthAlphaScore: 82,
        cohortHashHex,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    slash_oracle: () =>
      client.buildSlashOracleTx({
        governanceAuthority: governanceAuthority.toBase58(),
        oracle: oracle.toBase58(),
        staker: staker.toBase58(),
        stakeVault: poolVaultTokenAccount.toBase58(),
        slashTreasuryTokenAccount: slashTreasuryTokenAccount.toBase58(),
        amount: 1n,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    stake_oracle: () =>
      client.buildStakeOracleTx({
        staker: staker.toBase58(),
        oracle: oracle.toBase58(),
        stakeMint: stakeMint.toBase58(),
        stakeVault: poolVaultTokenAccount.toBase58(),
        stakerTokenAccount: stakerTokenAccount.toBase58(),
        amount: 1n,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    submit_coverage_claim: () =>
      client.buildSubmitCoverageClaimTx({
        claimant: claimant.toBase58(),
        poolAddress: pool.toBase58(),
        member: member.toBase58(),
        seriesRefHashHex,
        intentHashHex,
        eventHashHex,
        claimDelegate: claimant.toBase58(),
        includePoolCompliancePolicy: true,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    submit_outcome_attestation_vote: () =>
      client.buildSubmitOutcomeAttestationVoteTx({
        oracle: oracle.toBase58(),
        poolAddress: pool.toBase58(),
        seriesRefHashHex,
        member: member.toBase58(),
        cycleHashHex,
        ruleHashHex,
        schemaKeyHashHex,
        payoutMint: payoutMint.toBase58(),
        attestationDigestHex: '15'.repeat(32),
        observedValueHashHex: '16'.repeat(32),
        evidenceHashHex: '35'.repeat(32),
        externalAttestationRefHashHex: '36'.repeat(32),
        aiRole: 1,
        automationMode: 2,
        modelVersionHashHex: '37'.repeat(32),
        policyVersionHashHex: '38'.repeat(32),
        executionEnvironmentHashHex: '39'.repeat(32),
        attestationProviderRefHashHex: '3a'.repeat(32),
        includePoolAutomationPolicy: true,
        asOfTs: 1_700_000_300,
        passed: true,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    submit_reward_claim: () =>
      client.buildSubmitRewardClaimTx({
        claimant: claimant.toBase58(),
        poolAddress: pool.toBase58(),
        member: member.toBase58(),
        seriesRefHashHex,
        cycleHashHex,
        ruleHashHex,
        intentHashHex,
        payoutAmount: 10n,
        payoutMint: payoutMint.toBase58(),
        recipient: recipientSystemAccount.toBase58(),
        recipientSystemAccount: recipientSystemAccount.toBase58(),
        memberCycle: memberCycle.toBase58(),
        cohortSettlementRoot: cohortSettlementRoot.toBase58(),
        claimDelegate: claimant.toBase58(),
        poolAssetVault: poolAssetVault.toBase58(),
        poolVaultTokenAccount: poolVaultTokenAccount.toBase58(),
        recipientTokenAccount: recipientTokenAccount.toBase58(),
        includePoolCompliancePolicy: true,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    subscribe_policy_series: () =>
      client.buildSubscribePolicySeriesTx({
        member: member.toBase58(),
        poolAddress: pool.toBase58(),
        seriesRefHashHex,
        startsAtTs: 1_700_000_000,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    update_policy_series: () =>
      client.buildUpdatePolicySeriesTx({
        authority: authority.toBase58(),
        poolAddress: pool.toBase58(),
        seriesRefHashHex,
        status: 1,
        planMode: 1,
        sponsorMode: 2,
        displayName: 'Coverage Prime Updated',
        metadataUri: 'https://omegax.health/coverage-updated',
        termsHashHex: '17'.repeat(32),
        durationSecs: 172_800,
        premiumDueEverySecs: 7_200,
        premiumGraceSecs: 900,
        premiumAmount: 35n,
        interopProfileHashHex: '46'.repeat(32),
        oracleProfileHashHex: '47'.repeat(32),
        riskFamilyHashHex: '48'.repeat(32),
        issuanceTemplateHashHex: '49'.repeat(32),
        comparabilityHashHex: '4a'.repeat(32),
        renewalOfHashHex: '4b'.repeat(32),
        termsVersion: 2,
        mappingVersion: 3,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    redeem_pool_liquidity_sol: () =>
      client.buildRedeemPoolLiquiditySolTx({
        redeemer: member.toBase58(),
        poolAddress: pool.toBase58(),
        sharesIn: 10n,
        minAmountOut: 9n,
        includePoolCapitalClass: true,
        includePoolCompliancePolicy: true,
        includeMembership: true,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    redeem_pool_liquidity_spl: () =>
      client.buildRedeemPoolLiquiditySplTx({
        redeemer: member.toBase58(),
        poolAddress: pool.toBase58(),
        payoutMint: payoutMint.toBase58(),
        redeemerPayoutTokenAccount: recipientTokenAccount.toBase58(),
        sharesIn: 10n,
        minAmountOut: 9n,
        includePoolCapitalClass: true,
        includePoolCompliancePolicy: true,
        includeMembership: true,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    update_oracle_metadata: () =>
      client.buildUpdateOracleMetadataTx({
        oracle: oracle.toBase58(),
        metadataUri: 'https://omegax.health/oracle-updated',
        active: true,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    update_oracle_profile: () =>
      client.buildUpdateOracleProfileTx({
        authority: authority.toBase58(),
        oracle: oracle.toBase58(),
        oracleType: 1,
        displayName: 'Omega Oracle Updated',
        legalName: 'Omega Oracle Updated LLC',
        websiteUrl: 'https://oracle-updated.omegax.health',
        appUrl: 'https://app.oracle-updated.omegax.health',
        logoUri: 'https://oracle-updated.omegax.health/logo.png',
        webhookUrl: 'https://oracle-updated.omegax.health/webhook',
        supportedSchemaKeyHashesHex: [schemaKeyHashHex],
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    verify_outcome_schema: () =>
      client.buildVerifyOutcomeSchemaTx({
        governanceAuthority: governanceAuthority.toBase58(),
        schemaKeyHashHex,
        verified: true,
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    withdraw_protocol_fee_sol: () =>
      client.buildWithdrawProtocolFeeSolTx({
        governanceAuthority: governanceAuthority.toBase58(),
        amount: 5n,
        recipientSystemAccount: recipientSystemAccount.toBase58(),
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    withdraw_protocol_fee_spl: () =>
      client.buildWithdrawProtocolFeeSplTx({
        governanceAuthority: governanceAuthority.toBase58(),
        paymentMint: payoutMint.toBase58(),
        amount: 5n,
        recipientTokenAccount: recipientTokenAccount.toBase58(),
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    withdraw_pool_oracle_fee_sol: () =>
      client.buildWithdrawPoolOracleFeeSolTx({
        oracle: oracle.toBase58(),
        poolAddress: pool.toBase58(),
        amount: 5n,
        recipientSystemAccount: recipientSystemAccount.toBase58(),
        recentBlockhash,
        programId: programId.toBase58(),
      }),
    withdraw_pool_oracle_fee_spl: () =>
      client.buildWithdrawPoolOracleFeeSplTx({
        oracle: oracle.toBase58(),
        poolAddress: pool.toBase58(),
        paymentMint: payoutMint.toBase58(),
        amount: 5n,
        recipientTokenAccount: recipientTokenAccount.toBase58(),
        recentBlockhash,
        programId: programId.toBase58(),
      }),
  };

  const sdkInstructionNames = Object.keys(buildByInstruction).sort();
  const idlInstructionNames = [...idlByName.keys()].sort();
  assert.deepEqual(
    sdkInstructionNames,
    idlInstructionNames,
    'SDK builder coverage diverges from protocol IDL instructions',
  );

  const instructionAccountOverrides: Record<
    string,
    Record<string, PublicKey>
  > = {
    activate_cycle_with_quote_sol: {
      policy_series_payment_option: policySeriesPaymentOptionSol,
      protocol_fee_vault: protocolFeeVaultSol,
      pool_oracle_fee_vault: poolOracleFeeVaultSol,
      pool_treasury_reserve: poolTreasuryReserveSol,
    },
    activate_cycle_with_quote_spl: {
      payer_token_account: derivedPayerTokenAccount,
      pool_vault_token_account: derivedPoolVaultTokenAccount,
    },
    approve_coverage_claim: {
      pool_vault_token_account: derivedPoolVaultTokenAccount,
    },
    claim_approved_coverage_payout: {
      claim_delegate: claimantClaimDelegate,
      pool_vault_token_account: derivedPoolVaultTokenAccount,
    },
    deposit_pool_liquidity_spl: {
      membership: depositorMembership,
      pool_vault_token_account: derivedPoolVaultTokenAccount,
    },
    deposit_pool_liquidity_sol: {
      membership: depositorMembership,
    },
    fund_pool_spl: {
      pool_vault_token_account: derivedPoolVaultTokenAccount,
    },
    fulfill_pool_liquidity_redemption_sol: {
      pool_treasury_reserve: poolTreasuryReserveSol,
    },
    fulfill_pool_liquidity_redemption_spl: {
      pool_vault_token_account: derivedPoolVaultTokenAccount,
    },
    initialize_pool_liquidity_spl: {
      pool_vault_token_account: derivedPoolVaultTokenAccount,
    },
    pay_coverage_claim: {
      pool_vault_token_account: derivedPoolVaultTokenAccount,
    },
    pay_premium_sol: {
      policy_series_payment_option: policySeriesPaymentOptionSol,
    },
    pay_premium_spl: {
      pool_vault_token_account: derivedPoolVaultTokenAccount,
    },
    redeem_pool_liquidity_sol: {
      pool_treasury_reserve: poolTreasuryReserveSol,
    },
    redeem_pool_liquidity_spl: {
      pool_vault_token_account: derivedPoolVaultTokenAccount,
    },
    settle_cycle_commitment: {
      pool_vault_token_account: derivedPoolVaultTokenAccount,
      recipient_token_account: derivedMemberTokenAccount,
    },
    settle_cycle_commitment_sol: {
      pool_treasury_reserve: poolTreasuryReserveSol,
      recipient_system_account: member,
    },
    settle_coverage_claim: {
      pool_vault_token_account: derivedPoolVaultTokenAccount,
    },
    submit_reward_claim: {
      claim_delegate: claimant,
    },
    request_pool_liquidity_redemption: {
      pool_treasury_reserve: poolTreasuryReserveSol,
    },
    withdraw_pool_treasury_sol: {
      pool_treasury_reserve: poolTreasuryReserveSol,
    },
    withdraw_pool_treasury_spl: {
      pool_vault_token_account: derivedPoolVaultTokenAccount,
    },
    withdraw_protocol_fee_sol: {
      protocol_fee_vault: protocolFeeVaultSol,
    },
    withdraw_pool_oracle_fee_sol: {
      pool_oracle_fee_vault: poolOracleFeeVaultSol,
    },
  };
  const instructionTrailingAccounts: Record<string, PublicKey[]> = {
    activate_cycle_with_quote_sol: [SYSVAR_INSTRUCTIONS_PUBKEY],
    activate_cycle_with_quote_spl: [SYSVAR_INSTRUCTIONS_PUBKEY],
  };

  for (const instructionName of sdkInstructionNames) {
    const idlInstruction = idlByName.get(instructionName);
    assert.ok(idlInstruction, `Missing ${instructionName} in IDL`);

    const tx = buildByInstruction[instructionName]();
    const protocolInstructions = tx.instructions.filter((instruction) =>
      instruction.programId.equals(programId),
    );
    assert.equal(
      protocolInstructions.length,
      1,
      `${instructionName} should build exactly one protocol instruction`,
    );
    const ix = protocolInstructions[0];
    assert.equal(
      Buffer.compare(
        ix.data.subarray(0, 8),
        anchorDiscriminator('global', instructionName),
      ),
      0,
      `${instructionName} discriminator mismatch`,
    );

    const expectedAccounts = flattenIdlAccounts(idlInstruction.accounts).map(
      (account) => {
        const pubkey =
          instructionAccountOverrides[instructionName]?.[account.name] ??
          accountByName[account.name];
        assert.ok(
          pubkey,
          `No account mapping for ${account.name} (${instructionName})`,
        );
        return {
          name: account.name,
          pubkey: pubkey.toBase58(),
          isSigner: Boolean(account.signer),
          isWritable: Boolean(account.writable),
        };
      },
    );

    const trailingAccounts = instructionTrailingAccounts[instructionName] ?? [];
    assert.equal(
      ix.keys.length,
      expectedAccounts.length + trailingAccounts.length,
      `${instructionName} account count mismatch`,
    );

    for (let index = 0; index < expectedAccounts.length; index += 1) {
      const actual = ix.keys[index];
      const expected = expectedAccounts[index];
      assert.equal(
        actual.pubkey.toBase58(),
        expected.pubkey,
        `${instructionName} account mismatch at [${index}] (${expected.name})`,
      );
      assert.equal(
        actual.isSigner,
        expected.isSigner,
        `${instructionName} signer mismatch at [${index}] (${expected.name})`,
      );
      assert.equal(
        actual.isWritable,
        expected.isWritable,
        `${instructionName} writable mismatch at [${index}] (${expected.name})`,
      );
    }

    for (let index = 0; index < trailingAccounts.length; index += 1) {
      const actual = ix.keys[expectedAccounts.length + index];
      const expected = trailingAccounts[index];
      assert.equal(
        actual.pubkey.toBase58(),
        expected.toBase58(),
        `${instructionName} trailing account mismatch at [${expectedAccounts.length + index}]`,
      );
    }
  }
});
