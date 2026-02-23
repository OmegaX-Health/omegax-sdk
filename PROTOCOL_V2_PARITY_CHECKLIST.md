# OmegaX SDK ↔ Protocol v2 parity checklist

This checklist tracks the SDK surface that must stay aligned with `omegaxhealth_protocol` (public beta v2 entrypoint).

## Instruction builders (IDL parity)

- [x] `initialize_protocol_v2`
- [x] `set_protocol_params`
- [x] `rotate_governance_authority`
- [x] `register_oracle_v2`
- [x] `claim_oracle_v2`
- [x] `update_oracle_profile_v2`
- [x] `update_oracle_metadata`
- [x] `stake_oracle`
- [x] `request_unstake`
- [x] `finalize_unstake`
- [x] `slash_oracle`
- [x] `create_pool_v2`
- [x] `set_pool_oracle_policy`
- [x] `set_pool_terms_hash`
- [x] `register_outcome_schema`
- [x] `verify_outcome_schema`
- [x] `set_pool_outcome_rule`
- [x] `register_invite_issuer`
- [x] `enroll_member_open`
- [x] `enroll_member_token_gate`
- [x] `enroll_member_invite_permit`
- [x] `set_claim_delegate`
- [x] `fund_pool_sol`
- [x] `fund_pool_spl`
- [x] `submit_outcome_attestation_vote`
- [x] `finalize_cycle_outcome`
- [x] `submit_reward_claim`
- [x] `register_coverage_product_v2`
- [x] `update_coverage_product_v2`
- [x] `subscribe_coverage_product_v2`
- [x] `issue_coverage_policy_from_product_v2`
- [x] `create_coverage_policy`
- [x] `mint_policy_nft`
- [x] `pay_premium_onchain`
- [x] `attest_premium_paid_offchain`
- [x] `submit_coverage_claim`
- [x] `settle_coverage_claim`

## Account readers (v2)

- [x] `ProtocolConfigV2`
- [x] `OracleProfile`
- [x] `OracleStakePosition`
- [x] `PoolOraclePolicy`
- [x] `PoolTerms`
- [x] `PoolAssetVault`
- [x] `OutcomeSchemaRegistryEntry`
- [x] `PoolOutcomeRule`
- [x] `InviteIssuerRegistryEntry`
- [x] `CycleOutcomeAggregate`
- [x] `EnrollmentPermitReplay`
- [x] `AttestationVote`
- [x] `ClaimDelegateAuthorization`
- [x] `ClaimRecordV2`
- [x] `CoverageProduct`
- [x] `CoveragePolicy`
- [x] `CoveragePolicyPositionNft`
- [x] `PremiumLedger`
- [x] `PremiumAttestationReplay`
- [x] `CoverageClaimRecord`

## Seed derivations (v2-specific)

- [x] `oracle_profile`
- [x] `attestation_vote`
- [x] `coverage_product`

## Claims helper parity

- [x] Reward-claim unsigned transaction helper added: `buildUnsignedRewardClaimTx(...)`.
- [x] Helper account meta order and PDA derivations aligned with `submit_reward_claim`.

## Verification status

- [x] TypeScript build passes (`npm run build`)
- [x] Test suite passes (`npm test`)
- [x] Dedicated parity tests added for v2 builders/readers
