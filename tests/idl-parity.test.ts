import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

import {
  anchorDiscriminator,
  createConnection,
  createProtocolClient,
  deriveAttestationVotePda,
  deriveClaimDelegatePda,
  deriveClaimV2Pda,
  deriveConfigV2Pda,
  deriveCoverageClaimPda,
  deriveCoverageNftPda,
  deriveCoveragePolicyPda,
  deriveCoverageProductPda,
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
  derivePoolOracleFeeVaultPda,
  derivePoolOraclePermissionSetPda,
  derivePoolOraclePolicyPda,
  derivePoolOraclePda,
  derivePoolPda,
  derivePoolRulePda,
  derivePoolTermsPda,
  derivePoolTreasuryReservePda,
  deriveProtocolFeeVaultPda,
  derivePremiumLedgerPda,
  derivePremiumReplayPda,
  deriveSchemaPda,
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

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

function deriveAssociatedTokenAddress(params: {
  owner: PublicKey;
  mint: PublicKey;
}): PublicKey {
  const [address] = PublicKey.findProgramAddressSync(
    [params.owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), params.mint.toBuffer()],
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

test('sdk builders stay in strict account-order parity with omegaxhealth_protocol idl', () => {
  const workspaceIdlPath = resolve(
    process.cwd(),
    '..',
    'omegaxhealth_protocol',
    'idl',
    'omegax_protocol.json',
  );
  const fixtureIdlPath = resolve(process.cwd(), 'tests/fixtures/omegax_protocol.idl.json');
  const idlPath = process.env.OMEGAX_PROTOCOL_IDL_PATH
    ?? (existsSync(workspaceIdlPath) ? workspaceIdlPath : fixtureIdlPath);
  assert.ok(
    existsSync(idlPath),
    `IDL not found at ${idlPath}. Commit tests/fixtures/omegax_protocol.idl.json or set OMEGAX_PROTOCOL_IDL_PATH.`,
  );

  const idl = JSON.parse(readFileSync(idlPath, 'utf8')) as { instructions: IdlInstruction[] };
  const idlByName = new Map(idl.instructions.map((instruction) => [instruction.name, instruction]));

  const recentBlockhash = '11111111111111111111111111111111';
  const programId = Keypair.generate().publicKey;

  const admin = Keypair.generate().publicKey;
  const authority = Keypair.generate().publicKey;
  const governanceAuthority = Keypair.generate().publicKey;
  const governanceRecovery = Keypair.generate().publicKey;
  const oracle = Keypair.generate().publicKey;
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
  const cycleId = 'idl-parity-cycle';
  const cycleHash = hashStringTo32(cycleId);
  const ruleHashHex = '11'.repeat(32);
  const ruleHash = Buffer.from(ruleHashHex, 'hex');
  const schemaKeyHashHex = '22'.repeat(32);
  const schemaKeyHash = Buffer.from(schemaKeyHashHex, 'hex');
  const productIdHashHex = '33'.repeat(32);
  const productIdHash = Buffer.from(productIdHashHex, 'hex');
  const nonceHashHex = '44'.repeat(32);
  const nonceHash = Buffer.from(nonceHashHex, 'hex');
  const replayHashHex = '55'.repeat(32);
  const replayHash = Buffer.from(replayHashHex, 'hex');
  const intentHashHex = '66'.repeat(32);
  const intentHash = Buffer.from(intentHashHex, 'hex');
  const eventHashHex = '77'.repeat(32);

  const [configV2] = deriveConfigV2Pda(programId);
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
  const [poolRule] = derivePoolRulePda({
    programId,
    poolAddress: pool,
    ruleHash,
  });
  const [schemaEntry] = deriveSchemaPda({
    programId,
    schemaKeyHash,
  });
  const [vote] = deriveAttestationVotePda({
    programId,
    poolAddress: pool,
    member,
    cycleHash,
    ruleHash,
    oracle,
  });
  const [aggregate] = deriveOutcomeAggregatePda({
    programId,
    poolAddress: pool,
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
  const [poolAssetVault] = derivePoolAssetVaultPda({
    programId,
    poolAddress: pool,
    payoutMint,
  });
  const derivedPoolVaultTokenAccount = deriveAssociatedTokenAddress({
    owner: poolAssetVault,
    mint: payoutMint,
  });
  const derivedMemberTokenAccount = deriveAssociatedTokenAddress({
    owner: member,
    mint: payoutMint,
  });
  const [claimRecordV2] = deriveClaimV2Pda({
    programId,
    poolAddress: pool,
    member,
    cycleHash,
    ruleHash,
  });
  const [coverageProduct] = deriveCoverageProductPda({
    programId,
    poolAddress: pool,
    productIdHash,
  });
  const [coveragePolicy] = deriveCoveragePolicyPda({
    programId,
    poolAddress: pool,
    member,
  });
  const [coveragePolicyNft] = deriveCoverageNftPda({
    programId,
    poolAddress: pool,
    member,
  });
  const [premiumLedger] = derivePremiumLedgerPda({
    programId,
    poolAddress: pool,
    member,
  });
  const [premiumReplay] = derivePremiumReplayPda({
    programId,
    poolAddress: pool,
    member,
    replayHash,
  });
  const [memberCycle] = deriveMemberCyclePda({
    programId,
    poolAddress: pool,
    member,
    periodIndex: 1n,
  });
  const [cycleQuoteReplay] = deriveCycleQuoteReplayPda({
    programId,
    poolAddress: pool,
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
    member,
    intentHash,
  });

  const accountByName: Record<string, PublicKey> = {
    admin,
    aggregate,
    associated_token_program: ASSOCIATED_TOKEN_PROGRAM_ID,
    authority,
    claim_delegate: claimDelegate,
    claim_record_v2: claimRecordV2,
    claimant,
    config_v2: configV2,
    coverage_claim: coverageClaim,
    coverage_policy: coveragePolicy,
    coverage_policy_nft: coveragePolicyNft,
    coverage_product: coverageProduct,
    cycle_quote_replay: cycleQuoteReplay,
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
    pool_asset_vault: poolAssetVault,
    pool_oracle: poolOracle,
    pool_oracle_fee_vault: poolOracleFeeVault,
    pool_oracle_fee_vault_token_account: poolOracleFeeVaultTokenAccount,
    pool_oracle_permissions: poolOraclePermissions,
    pool_rule: poolRule,
    pool_terms: poolTerms,
    pool_treasury_reserve: poolTreasuryReserve,
    pool_vault_token_account: poolVaultTokenAccount,
    premium_ledger: premiumLedger,
    premium_replay: premiumReplay,
    protocol_fee_vault: protocolFeeVault,
    protocol_fee_vault_token_account: protocolFeeVaultTokenAccount,
    publisher,
    recipient_system_account: recipientSystemAccount,
    recipient_token_account: recipientTokenAccount,
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
  };

  const connection = createConnection('http://127.0.0.1:8899', 'confirmed');
  const client = createProtocolClient(connection, programId.toBase58());

  const buildByInstruction: Record<string, () => Transaction> = {
    attest_premium_paid_offchain: () => client.buildAttestPremiumPaidOffchainTx!({
      oracle: oracle.toBase58(),
      poolAddress: pool.toBase58(),
      member: member.toBase58(),
      periodIndex: 1n,
      replayHashHex,
      amount: 10n,
      paidAtTs: 1_700_000_100,
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    claim_oracle_v2: () => client.buildClaimOracleV2Tx!({
      oracle: oracle.toBase58(),
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    create_coverage_policy: () => client.buildCreateCoveragePolicyTx!({
      authority: authority.toBase58(),
      poolAddress: pool.toBase58(),
      member: member.toBase58(),
      termsHashHex: '88'.repeat(32),
      startsAt: 1_700_000_000,
      endsAt: 1_700_086_400,
      premiumDueEverySecs: 86_400,
      premiumGraceSecs: 7_200,
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    create_pool_v2: () => client.buildCreatePoolV2Tx!({
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
    withdraw_pool_treasury_sol: () => client.buildWithdrawPoolTreasurySolTx!({
      payer: oracle.toBase58(),
      oracle: oracle.toBase58(),
      poolAddress: pool.toBase58(),
      amount: 5n,
      recipientSystemAccount: recipientSystemAccount.toBase58(),
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    withdraw_pool_treasury_spl: () => client.buildWithdrawPoolTreasurySplTx!({
      payer: oracle.toBase58(),
      oracle: oracle.toBase58(),
      poolAddress: pool.toBase58(),
      paymentMint: payoutMint.toBase58(),
      amount: 5n,
      recipientTokenAccount: recipientTokenAccount.toBase58(),
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    enroll_member_invite_permit: () => client.buildEnrollMemberInvitePermitTx!({
      member: member.toBase58(),
      poolAddress: pool.toBase58(),
      issuer: issuer.toBase58(),
      nonceHashHex,
      inviteIdHashHex: 'bb'.repeat(32),
      expiresAtTs: 1_800_000_000,
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    enroll_member_open: () => client.buildEnrollMemberOpenTx!({
      member: member.toBase58(),
      poolAddress: pool.toBase58(),
      subjectCommitmentHex: 'cc'.repeat(32),
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    enroll_member_token_gate: () => client.buildEnrollMemberTokenGateTx!({
      member: member.toBase58(),
      poolAddress: pool.toBase58(),
      tokenGateAccount: tokenGateAccount.toBase58(),
      subjectCommitmentHex: 'dd'.repeat(32),
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    finalize_cycle_outcome: () => client.buildFinalizeCycleOutcomeTx!({
      poolAddress: pool.toBase58(),
      member: member.toBase58(),
      cycleId,
      ruleHashHex,
      payoutMint: payoutMint.toBase58(),
      payer: payer.toBase58(),
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    finalize_unstake: () => client.buildFinalizeUnstakeTx!({
      staker: staker.toBase58(),
      oracle: oracle.toBase58(),
      stakeVault: poolVaultTokenAccount.toBase58(),
      destinationTokenAccount: destinationTokenAccount.toBase58(),
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    fund_pool_sol: () => client.buildFundPoolSolTx!({
      funder: funder.toBase58(),
      poolAddress: pool.toBase58(),
      lamports: 100n,
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    fund_pool_spl: () => client.buildFundPoolSplTx!({
      funder: funder.toBase58(),
      poolAddress: pool.toBase58(),
      payoutMint: payoutMint.toBase58(),
      poolVaultTokenAccount: poolVaultTokenAccount.toBase58(),
      funderTokenAccount: funderTokenAccount.toBase58(),
      amount: 100n,
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    initialize_protocol_v2: () => client.buildInitializeProtocolV2Tx!({
      admin: admin.toBase58(),
      protocolFeeBps: 10,
      governanceRealm: governanceAuthority.toBase58(),
      governanceConfig: governanceRecovery.toBase58(),
      defaultStakeMint: stakeMint.toBase58(),
      minOracleStake: 1n,
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    issue_coverage_policy_from_product_v2: () => client.buildIssueCoveragePolicyFromProductV2Tx!({
      authority: authority.toBase58(),
      poolAddress: pool.toBase58(),
      member: member.toBase58(),
      productIdHashHex,
      startsAt: 1_700_000_000,
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    mint_policy_nft: () => client.buildMintPolicyNftTx!({
      authority: authority.toBase58(),
      poolAddress: pool.toBase58(),
      member: member.toBase58(),
      nftMint: nftMint.toBase58(),
      metadataUri: 'https://omegax.health/nft',
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    pay_premium_onchain: () => client.buildPayPremiumOnchainTx!({
      payer: payer.toBase58(),
      poolAddress: pool.toBase58(),
      member: member.toBase58(),
      payoutMint: payoutMint.toBase58(),
      periodIndex: 1n,
      amount: 20n,
      payerTokenAccount: payerTokenAccount.toBase58(),
      poolVaultTokenAccount: poolVaultTokenAccount.toBase58(),
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    register_coverage_product_v2: () => client.buildRegisterCoverageProductV2Tx!({
      authority: authority.toBase58(),
      poolAddress: pool.toBase58(),
      productIdHashHex,
      displayName: 'Coverage Prime',
      metadataUri: 'https://omegax.health/coverage',
      termsHashHex: 'ee'.repeat(32),
      durationSecs: 86_400,
      premiumDueEverySecs: 3_600,
      premiumGraceSecs: 600,
      premiumAmount: 30n,
      active: true,
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    register_invite_issuer: () => client.buildRegisterInviteIssuerTx!({
      issuer: issuer.toBase58(),
      organizationRef: 'omega-org',
      metadataUri: 'https://omegax.health/invite',
      active: true,
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    register_oracle: () => client.buildRegisterOracleTx!({
      oracle: oracle.toBase58(),
      metadataUri: 'https://omegax.health/oracle',
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    register_oracle_v2: () => client.buildRegisterOracleV2Tx!({
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
    register_outcome_schema: () => client.buildRegisterOutcomeSchemaTx!({
      publisher: publisher.toBase58(),
      schemaKeyHashHex,
      schemaKey: 'goal.streak.days',
      version: 1,
      schemaHashHex: 'ff'.repeat(32),
      metadataUri: 'https://omegax.health/schema',
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    request_unstake: () => client.buildRequestUnstakeTx!({
      staker: staker.toBase58(),
      oracle: oracle.toBase58(),
      amount: 1n,
      cooldownSeconds: 60,
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    rotate_governance_authority: () => client.buildRotateGovernanceAuthorityTx!({
      governanceAuthority: governanceAuthority.toBase58(),
      newAuthority: governanceRecovery.toBase58(),
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    set_claim_delegate: () => client.buildSetClaimDelegateTx!({
      member: member.toBase58(),
      poolAddress: pool.toBase58(),
      delegate: claimant.toBase58(),
      active: true,
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    set_pool_oracle: () => client.buildSetPoolOracleTx!({
      authority: authority.toBase58(),
      poolAddress: pool.toBase58(),
      oracle: oracle.toBase58(),
      active: true,
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    set_pool_oracle_policy: () => client.buildSetPoolOraclePolicyTx!({
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
    set_pool_outcome_rule: () => client.buildSetPoolOutcomeRuleTx!({
      authority: authority.toBase58(),
      poolAddress: pool.toBase58(),
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
    set_pool_status: () => client.buildSetPoolStatusTx({
      authority: authority.toBase58(),
      poolAddress: pool.toBase58(),
      status: 1,
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    set_pool_terms_hash: () => client.buildSetPoolTermsHashTx!({
      authority: authority.toBase58(),
      poolAddress: pool.toBase58(),
      termsHashHex: '12'.repeat(32),
      payoutPolicyHashHex: '13'.repeat(32),
      cycleMode: 1,
      metadataUri: 'https://omegax.health/terms',
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    set_protocol_params: () => client.buildSetProtocolParamsTx!({
      governanceAuthority: governanceAuthority.toBase58(),
      protocolFeeBps: 50,
      allowedPayoutMintsHashHex: '14'.repeat(32),
      minOracleStake: 5n,
      emergencyPaused: false,
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    set_pool_coverage_reserve_floor: () => client.buildSetPoolCoverageReserveFloorTx!({
      authority: authority.toBase58(),
      poolAddress: pool.toBase58(),
      paymentMint: payoutMint.toBase58(),
      amount: 15n,
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    settle_coverage_claim: () => client.buildSettleCoverageClaimTx!({
      authority: authority.toBase58(),
      claimant: claimant.toBase58(),
      poolAddress: pool.toBase58(),
      member: member.toBase58(),
      intentHashHex,
      payoutAmount: 25n,
      recipientSystemAccount: recipientSystemAccount.toBase58(),
      poolAssetVault: poolAssetVault.toBase58(),
      poolVaultTokenAccount: poolVaultTokenAccount.toBase58(),
      recipientTokenAccount: recipientTokenAccount.toBase58(),
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    settle_cycle_commitment: () => client.buildSettleCycleCommitmentTx!({
      payer: oracle.toBase58(),
      oracle: oracle.toBase58(),
      member: member.toBase58(),
      poolAddress: pool.toBase58(),
      productIdHashHex,
      paymentMint: payoutMint.toBase58(),
      periodIndex: 1n,
      passed: true,
      shieldConsumed: false,
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    settle_cycle_commitment_sol: () => client.buildSettleCycleCommitmentSolTx!({
      payer: oracle.toBase58(),
      oracle: oracle.toBase58(),
      member: member.toBase58(),
      poolAddress: pool.toBase58(),
      productIdHashHex,
      periodIndex: 1n,
      passed: true,
      shieldConsumed: false,
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    slash_oracle: () => client.buildSlashOracleTx!({
      governanceAuthority: governanceAuthority.toBase58(),
      oracle: oracle.toBase58(),
      staker: staker.toBase58(),
      stakeVault: poolVaultTokenAccount.toBase58(),
      slashTreasuryTokenAccount: slashTreasuryTokenAccount.toBase58(),
      amount: 1n,
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    stake_oracle: () => client.buildStakeOracleTx!({
      staker: staker.toBase58(),
      oracle: oracle.toBase58(),
      stakeMint: stakeMint.toBase58(),
      stakeVault: poolVaultTokenAccount.toBase58(),
      stakerTokenAccount: stakerTokenAccount.toBase58(),
      amount: 1n,
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    submit_coverage_claim: () => client.buildSubmitCoverageClaimTx!({
      claimant: claimant.toBase58(),
      poolAddress: pool.toBase58(),
      member: member.toBase58(),
      intentHashHex,
      eventHashHex,
      claimDelegate: claimant.toBase58(),
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    submit_outcome_attestation_vote: () => client.buildSubmitOutcomeAttestationVoteTx!({
      oracle: oracle.toBase58(),
      poolAddress: pool.toBase58(),
      member: member.toBase58(),
      cycleId,
      ruleHashHex,
      schemaKeyHashHex,
      payoutMint: payoutMint.toBase58(),
      attestationDigestHex: '15'.repeat(32),
      observedValueHashHex: '16'.repeat(32),
      asOfTs: 1_700_000_300,
      passed: true,
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    submit_reward_claim: () => client.buildSubmitRewardClaimTx!({
      claimant: claimant.toBase58(),
      poolAddress: pool.toBase58(),
      member: member.toBase58(),
      cycleId,
      ruleHashHex,
      intentHashHex,
      payoutAmount: 10n,
      payoutMint: payoutMint.toBase58(),
      recipient: recipientSystemAccount.toBase58(),
      recipientSystemAccount: recipientSystemAccount.toBase58(),
      claimDelegate: claimant.toBase58(),
      poolAssetVault: poolAssetVault.toBase58(),
      poolVaultTokenAccount: poolVaultTokenAccount.toBase58(),
      recipientTokenAccount: recipientTokenAccount.toBase58(),
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    subscribe_coverage_product_v2: () => client.buildSubscribeCoverageProductV2Tx!({
      member: member.toBase58(),
      poolAddress: pool.toBase58(),
      productIdHashHex,
      startsAt: 1_700_000_000,
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    update_coverage_product_v2: () => client.buildUpdateCoverageProductV2Tx!({
      authority: authority.toBase58(),
      poolAddress: pool.toBase58(),
      productIdHashHex,
      displayName: 'Coverage Prime v2',
      metadataUri: 'https://omegax.health/coverage-v2',
      termsHashHex: '17'.repeat(32),
      durationSecs: 172_800,
      premiumDueEverySecs: 7_200,
      premiumGraceSecs: 900,
      premiumAmount: 35n,
      active: true,
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    update_oracle_metadata: () => client.buildUpdateOracleMetadataTx!({
      oracle: oracle.toBase58(),
      metadataUri: 'https://omegax.health/oracle-v2',
      active: true,
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    update_oracle_profile_v2: () => client.buildUpdateOracleProfileV2Tx!({
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
    verify_outcome_schema: () => client.buildVerifyOutcomeSchemaTx!({
      governanceAuthority: governanceAuthority.toBase58(),
      schemaKeyHashHex,
      verified: true,
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    withdraw_protocol_fee_sol: () => client.buildWithdrawProtocolFeeSolTx!({
      governanceAuthority: governanceAuthority.toBase58(),
      amount: 5n,
      recipientSystemAccount: recipientSystemAccount.toBase58(),
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    withdraw_protocol_fee_spl: () => client.buildWithdrawProtocolFeeSplTx!({
      governanceAuthority: governanceAuthority.toBase58(),
      paymentMint: payoutMint.toBase58(),
      amount: 5n,
      recipientTokenAccount: recipientTokenAccount.toBase58(),
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    withdraw_pool_oracle_fee_sol: () => client.buildWithdrawPoolOracleFeeSolTx!({
      oracle: oracle.toBase58(),
      poolAddress: pool.toBase58(),
      amount: 5n,
      recipientSystemAccount: recipientSystemAccount.toBase58(),
      recentBlockhash,
      programId: programId.toBase58(),
    }),
    withdraw_pool_oracle_fee_spl: () => client.buildWithdrawPoolOracleFeeSplTx!({
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
  const requiredInstructionNames = [
    'set_pool_coverage_reserve_floor',
    'settle_cycle_commitment',
    'settle_cycle_commitment_sol',
    'withdraw_pool_treasury_sol',
    'withdraw_pool_treasury_spl',
    'withdraw_protocol_fee_sol',
    'withdraw_protocol_fee_spl',
    'withdraw_pool_oracle_fee_sol',
    'withdraw_pool_oracle_fee_spl',
  ];
  for (const instructionName of requiredInstructionNames) {
    assert.ok(
      sdkInstructionNames.includes(instructionName),
      `Missing SDK parity builder for ${instructionName}`,
    );
  }

  const missingFromIdl = sdkInstructionNames.filter((instructionName) => !idlByName.has(instructionName));
  assert.deepEqual(missingFromIdl, [], 'SDK builder coverage diverges from protocol IDL instructions');

  const instructionAccountOverrides: Record<string, Record<string, PublicKey>> = {
    settle_cycle_commitment: {
      pool_vault_token_account: derivedPoolVaultTokenAccount,
      recipient_token_account: derivedMemberTokenAccount,
    },
    settle_cycle_commitment_sol: {
      pool_treasury_reserve: poolTreasuryReserveSol,
      recipient_system_account: member,
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

  for (const instructionName of sdkInstructionNames) {
    const idlInstruction = idlByName.get(instructionName);
    assert.ok(idlInstruction, `Missing ${instructionName} in IDL`);

    const tx = buildByInstruction[instructionName]();
    assert.equal(tx.instructions.length, 1, `${instructionName} should build exactly one instruction`);

    const ix = tx.instructions[0];
    assert.equal(
      Buffer.compare(ix.data.subarray(0, 8), anchorDiscriminator('global', instructionName)),
      0,
      `${instructionName} discriminator mismatch`,
    );

    const expectedAccounts = flattenIdlAccounts(idlInstruction.accounts).map((account) => {
      const pubkey = instructionAccountOverrides[instructionName]?.[account.name]
        ?? accountByName[account.name];
      assert.ok(pubkey, `No account mapping for ${account.name} (${instructionName})`);
      return {
        name: account.name,
        pubkey: pubkey.toBase58(),
        isSigner: Boolean(account.signer),
        isWritable: Boolean(account.writable),
      };
    });

    assert.equal(
      ix.keys.length,
      expectedAccounts.length,
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
  }
});
