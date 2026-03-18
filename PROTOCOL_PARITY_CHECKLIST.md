# OmegaX SDK ↔ Current Protocol Parity Checklist

This checklist tracks the canonical SDK surface that must stay aligned with the current `omegax-protocol` workspace and live protocol contract.

## Canonical instruction builders

- [x] `initialize_protocol`
- [x] `create_pool`
- [x] `register_oracle`
- [x] `claim_oracle`
- [x] `update_oracle_profile`
- [x] `set_pool_status`
- [x] `set_pool_oracle`
- [x] `set_policy_series_outcome_rule`
- [x] `create_policy_series`
- [x] `update_policy_series`
- [x] `upsert_policy_series_payment_option`
- [x] `subscribe_policy_series`
- [x] `issue_policy_position`
- [x] `pay_premium_sol`
- [x] `pay_premium_spl`
- [x] `submit_outcome_attestation_vote`
- [x] `finalize_cycle_outcome`
- [x] `submit_reward_claim`
- [x] `attest_premium_paid_offchain`
- [x] `submit_coverage_claim`
- [x] `review_coverage_claim`
- [x] `approve_coverage_claim`
- [x] `deny_coverage_claim`
- [x] `pay_coverage_claim`
- [x] `claim_approved_coverage_payout`
- [x] `close_coverage_claim`
- [x] `settle_coverage_claim`

## Canonical account readers

- [x] `fetchProtocolConfig`
- [x] `fetchClaimRecord`
- [x] `fetchPolicySeries`
- [x] `fetchPolicySeriesPaymentOption`
- [x] `fetchPolicyPosition`
- [x] `fetchPolicyPositionNft`
- [x] `fetchCycleOutcomeAggregate`
- [x] `fetchAttestationVote`
- [x] `fetchPremiumLedger`
- [x] `fetchPremiumAttestationReplay`
- [x] `fetchCoverageClaimRecord`
- [x] `fetchCohortSettlementRoot`

## Canonical seed derivations

- [x] `config`
- [x] `claim`
- [x] `policy_series`
- [x] `policy_series_payment_option`
- [x] `policy_position`
- [x] `policy_position_nft`
- [x] `member_cycle`
- [x] `cohort_settlement_root`

## Claims helper parity

- [x] `buildUnsignedRewardClaimTx(...)` matches `submit_reward_claim`
- [x] Signed-intent validation stays aligned with the reward-claim message layout

## Verification gates

- [x] `npm run build`
- [x] `tests/protocol-contract-parity.test.ts`
- [x] `tests/idl-parity.test.ts`
- [x] `npm run verify:protocol:local`
