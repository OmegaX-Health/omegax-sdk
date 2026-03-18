import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import * as sdk from '../src/index.js';

type ProtocolContract = {
  instructions: Array<{ name: string; discriminator: number[] }>;
  accountDiscriminators: Record<string, number[]>;
  pdaSeeds: Record<string, string[]>;
};

const protocolRepo = resolve(process.cwd(), process.env.OMEGAX_PROTOCOL_REPO ?? '../omegax-protocol');
const contractPath = resolve(protocolRepo, 'shared/protocol_contract.json');
const hasLiveProtocolContract = existsSync(contractPath);

function loadContract(): ProtocolContract {
  return JSON.parse(readFileSync(contractPath, 'utf8')) as ProtocolContract;
}

function instructionToBuilderName(name: string): string {
  return `build${name
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('')}Tx`;
}

const pdaSeedFunctionMap: Record<string, string> = {
  attestation_vote: 'deriveAttestationVotePda',
  claim_delegate: 'deriveClaimDelegatePda',
  claim: 'deriveClaimPda',
  cohort_settlement_root: 'deriveCohortSettlementRootPda',
  config: 'deriveConfigPda',
  coverage_claim: 'deriveCoverageClaimPda',
  cycle_quote_replay: 'deriveCycleQuoteReplayPda',
  enrollment_replay: 'deriveEnrollmentReplayPda',
  invite_issuer: 'deriveInviteIssuerPda',
  member_cycle: 'deriveMemberCyclePda',
  membership: 'deriveMembershipPda',
  oracle: 'deriveOraclePda',
  oracle_profile: 'deriveOracleProfilePda',
  oracle_stake: 'deriveOracleStakePda',
  outcome_aggregate: 'deriveOutcomeAggregatePda',
  pool: 'derivePoolPda',
  pool_asset_vault: 'derivePoolAssetVaultPda',
  pool_automation_policy: 'derivePoolAutomationPolicyPda',
  pool_capital_class: 'derivePoolCapitalClassPda',
  pool_compliance_policy: 'derivePoolCompliancePolicyPda',
  pool_control_authority: 'derivePoolControlAuthorityPda',
  pool_liquidity_config: 'derivePoolLiquidityConfigPda',
  pool_oracle: 'derivePoolOraclePda',
  pool_oracle_fee_vault: 'derivePoolOracleFeeVaultPda',
  pool_oracle_permissions: 'derivePoolOraclePermissionSetPda',
  pool_oracle_policy: 'derivePoolOraclePolicyPda',
  pool_risk_config: 'derivePoolRiskConfigPda',
  pool_rule: 'derivePoolRulePda',
  pool_share_mint: 'derivePoolShareMintPda',
  pool_terms: 'derivePoolTermsPda',
  pool_treasury_reserve: 'derivePoolTreasuryReservePda',
  policy_position: 'derivePolicyPositionPda',
  policy_position_nft: 'derivePolicyPositionNftPda',
  policy_series: 'derivePolicySeriesPda',
  policy_series_payment_option: 'derivePolicySeriesPaymentOptionPda',
  premium_ledger: 'derivePremiumLedgerPda',
  premium_replay: 'derivePremiumReplayPda',
  protocol_fee_vault: 'deriveProtocolFeeVaultPda',
  redemption_request: 'deriveRedemptionRequestPda',
  schema: 'deriveSchemaPda',
  schema_dependency: 'deriveSchemaDependencyPda',
};

const accountReaderMap: Record<string, string> = {
  AttestationVote: 'fetchAttestationVote',
  ClaimDelegateAuthorization: 'fetchClaimDelegate',
  ClaimRecord: 'fetchClaimRecord',
  CohortSettlementRoot: 'fetchCohortSettlementRoot',
  CoverageClaimRecord: 'fetchCoverageClaimRecord',
  PolicyPosition: 'fetchPolicyPosition',
  PolicyPositionNft: 'fetchPolicyPositionNft',
  PolicySeries: 'fetchPolicySeries',
  PolicySeriesPaymentOption: 'fetchPolicySeriesPaymentOption',
  CycleOutcomeAggregate: 'fetchCycleOutcomeAggregate',
  CycleQuoteReplay: 'fetchCycleQuoteReplay',
  EnrollmentPermitReplay: 'fetchEnrollmentPermitReplay',
  InviteIssuerRegistryEntry: 'fetchInviteIssuer',
  MemberCycleState: 'fetchMemberCycle',
  MembershipRecord: 'fetchMembershipRecord',
  OracleProfile: 'fetchOracleProfile',
  OracleRegistryEntry: 'fetchOracleRegistryEntry',
  OracleStakePosition: 'fetchOracleStakePosition',
  OutcomeSchemaRegistryEntry: 'fetchOutcomeSchema',
  Pool: 'fetchPool',
  PoolAssetVault: 'fetchPoolAssetVault',
  PoolAutomationPolicy: 'fetchPoolAutomationPolicy',
  PoolCapitalClass: 'fetchPoolCapitalClass',
  PoolCompliancePolicy: 'fetchPoolCompliancePolicy',
  PoolControlAuthority: 'fetchPoolControlAuthority',
  PoolLiquidityConfig: 'fetchPoolLiquidityConfig',
  PoolOracleApproval: 'fetchPoolOracleApproval',
  PoolOracleFeeVault: 'fetchPoolOracleFeeVault',
  PoolOraclePermissionSet: 'fetchPoolOraclePermissionSet',
  PoolOraclePolicy: 'fetchPoolOraclePolicy',
  PoolOutcomeRule: 'fetchPoolOutcomeRule',
  PoolRedemptionRequest: 'fetchRedemptionRequest',
  PoolRiskConfig: 'fetchPoolRiskConfig',
  PoolTerms: 'fetchPoolTerms',
  PoolTreasuryReserve: 'fetchPoolTreasuryReserve',
  PremiumAttestationReplay: 'fetchPremiumAttestationReplay',
  PremiumLedger: 'fetchPremiumLedger',
  ProtocolConfig: 'fetchProtocolConfig',
  ProtocolFeeVault: 'fetchProtocolFeeVault',
  SchemaDependencyLedger: 'fetchSchemaDependencyLedger',
};

test(
  'every live protocol contract instruction has an SDK transaction builder',
  { skip: !hasLiveProtocolContract },
  () => {
    const contract = loadContract();
    const client = sdk.createProtocolClient(
      sdk.createConnection('http://127.0.0.1:8899', 'confirmed'),
      sdk.PROTOCOL_PROGRAM_ID,
    ) as Record<string, unknown>;

    const missingBuilders = contract.instructions
      .map((instruction) => instructionToBuilderName(instruction.name))
      .filter((builderName) => typeof client[builderName] !== 'function');

    assert.deepEqual(missingBuilders, []);
  },
);

test(
  'live protocol contract instruction discriminators stay canonical',
  { skip: !hasLiveProtocolContract },
  () => {
    const contract = loadContract();
    for (const instruction of contract.instructions) {
      assert.deepEqual(
        instruction.discriminator,
        [...sdk.anchorDiscriminator('global', instruction.name)],
        `discriminator mismatch for ${instruction.name}`,
      );
    }
  },
);

test(
  'every live protocol PDA seed schema is mapped to an SDK derivation helper',
  { skip: !hasLiveProtocolContract },
  () => {
    const contract = loadContract();
    const missingMappings = Object.keys(contract.pdaSeeds)
      .sort()
      .filter((seedName) => !(seedName in pdaSeedFunctionMap));

    assert.deepEqual(missingMappings, []);

    for (const [seedName, functionName] of Object.entries(pdaSeedFunctionMap)) {
      assert.equal(
        typeof (sdk as Record<string, unknown>)[functionName],
        'function',
        `missing SDK derivation helper ${functionName} for ${seedName}`,
      );
    }
  },
);

test(
  'every live protocol account surface has an SDK reader entrypoint',
  { skip: !hasLiveProtocolContract },
  () => {
    const contract = loadContract();
    const client = sdk.createProtocolClient(
      sdk.createConnection('http://127.0.0.1:8899', 'confirmed'),
      sdk.PROTOCOL_PROGRAM_ID,
    ) as Record<string, unknown>;

    const missingReaderMappings = Object.keys(contract.accountDiscriminators)
      .sort()
      .filter((accountName) => !(accountName in accountReaderMap));

    assert.deepEqual(missingReaderMappings, []);

    for (const [accountName, readerName] of Object.entries(accountReaderMap)) {
      assert.equal(
        typeof client[readerName],
        'function',
        `missing SDK reader ${readerName} for ${accountName}`,
      );
    }
  },
);
