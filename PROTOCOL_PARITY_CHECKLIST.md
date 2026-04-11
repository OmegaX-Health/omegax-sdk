# OmegaX SDK ↔ Canonical Protocol Parity Checklist

This checklist tracks the current public SDK surface against the canonical `omegax-protocol` workspace.

## Canonical instruction builders

- [x] `initialize_protocol_governance`
- [x] `set_protocol_emergency_pause`
- [x] `create_reserve_domain`
- [x] `update_reserve_domain_controls`
- [x] `create_domain_asset_vault`
- [x] `create_health_plan`
- [x] `update_health_plan_controls`
- [x] `create_policy_series`
- [x] `version_policy_series`
- [x] `open_member_position`
- [x] `update_member_eligibility`
- [x] `open_funding_line`
- [x] `fund_sponsor_budget`
- [x] `record_premium_payment`
- [x] `create_obligation`
- [x] `reserve_obligation`
- [x] `settle_obligation`
- [x] `release_reserve`
- [x] `open_claim_case`
- [x] `attach_claim_evidence_ref`
- [x] `adjudicate_claim_case`
- [x] `settle_claim_case`
- [x] `create_liquidity_pool`
- [x] `create_capital_class`
- [x] `update_capital_class_controls`
- [x] `deposit_into_capital_class`
- [x] `request_redemption`
- [x] `process_redemption_queue`
- [x] `create_allocation_position`
- [x] `update_allocation_caps`
- [x] `allocate_capital`
- [x] `deallocate_capital`
- [x] `mark_impairment`
- [x] `register_oracle`
- [x] `claim_oracle`
- [x] `update_oracle_profile`
- [x] `set_pool_oracle`
- [x] `set_pool_oracle_permissions`
- [x] `set_pool_oracle_policy`
- [x] `register_outcome_schema`
- [x] `verify_outcome_schema`
- [x] `backfill_schema_dependency_ledger`
- [x] `close_outcome_schema`

## Canonical account readers

- [x] `fetchProtocolGovernance`
- [x] `fetchReserveDomain`
- [x] `fetchDomainAssetVault`
- [x] `fetchDomainAssetLedger`
- [x] `fetchHealthPlan`
- [x] `fetchPlanReserveLedger`
- [x] `fetchPolicySeries`
- [x] `fetchSeriesReserveLedger`
- [x] `fetchMemberPosition`
- [x] `fetchFundingLine`
- [x] `fetchFundingLineLedger`
- [x] `fetchClaimCase`
- [x] `fetchObligation`
- [x] `fetchLiquidityPool`
- [x] `fetchCapitalClass`
- [x] `fetchPoolClassLedger`
- [x] `fetchLPPosition`
- [x] `fetchAllocationPosition`
- [x] `fetchAllocationLedger`
- [x] `fetchOracleProfile`
- [x] `fetchPoolOracleApproval`
- [x] `fetchPoolOraclePermissionSet`
- [x] `fetchPoolOraclePolicy`
- [x] `fetchOutcomeSchema`
- [x] `fetchSchemaDependencyLedger`

## Canonical PDA derivations

- [x] `deriveProtocolGovernancePda`
- [x] `deriveReserveDomainPda`
- [x] `deriveDomainAssetVaultPda`
- [x] `deriveDomainAssetLedgerPda`
- [x] `deriveHealthPlanPda`
- [x] `derivePlanReserveLedgerPda`
- [x] `derivePolicySeriesPda`
- [x] `deriveSeriesReserveLedgerPda`
- [x] `deriveMemberPositionPda`
- [x] `deriveMembershipAnchorSeatPda`
- [x] `deriveFundingLinePda`
- [x] `deriveFundingLineLedgerPda`
- [x] `deriveClaimCasePda`
- [x] `deriveObligationPda`
- [x] `deriveLiquidityPoolPda`
- [x] `deriveCapitalClassPda`
- [x] `derivePoolClassLedgerPda`
- [x] `deriveLpPositionPda`
- [x] `deriveAllocationPositionPda`
- [x] `deriveAllocationLedgerPda`
- [x] `deriveOracleProfilePda`
- [x] `derivePoolOracleApprovalPda`
- [x] `derivePoolOraclePolicyPda`
- [x] `derivePoolOraclePermissionSetPda`
- [x] `deriveOutcomeSchemaPda`
- [x] `deriveSchemaDependencyLedgerPda`

## Reserve-model helper parity

- [x] `recomputeReserveBalanceSheet(...)`
- [x] `sumReserveBalanceSheets(...)`
- [x] `buildSponsorReadModel(...)`
- [x] `buildCapitalReadModel(...)`
- [x] `buildMemberReadModel(...)`

## Legacy retirement assertions

- [x] `create_pool` is absent from the canonical surface
- [x] `set_pool_status` is absent from the canonical surface
- [x] `pool_type` is absent from the canonical public SDK
- [x] no legacy pool-first compatibility aliases remain in exports

## Verification gates

- [x] `npm run build`
- [x] `npm run test`
- [x] `tests/idl-parity.test.ts`
- [x] `tests/protocol-contract-parity.test.ts`
- [x] `npm run verify:protocol:local`
