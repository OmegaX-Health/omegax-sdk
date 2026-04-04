# Integration Workflows — `@omegax/protocol-sdk`

These workflows map the canonical OmegaX economic model to the actual SDK builders and readers.

## Shared integration pattern

1. Create `connection`, `protocol`, and `rpc` clients.
2. Derive canonical addresses with PDA helpers.
3. Build unsigned transactions with `build...Tx(...)`.
4. Sign with your wallet or signer stack.
5. Broadcast with `broadcastSignedTx(...)`.
6. Verify state with `fetch...(...)` readers and reserve-model helpers.

## Workflow A: Governance and reserve-domain bootstrap

Use this when preparing the settlement boundary for a new domain and asset.

Builders:

- `buildInitializeProtocolGovernanceTx(...)`
- `buildSetProtocolEmergencyPauseTx(...)`
- `buildCreateReserveDomainTx(...)`
- `buildUpdateReserveDomainControlsTx(...)`
- `buildCreateDomainAssetVaultTx(...)`

Readers:

- `fetchProtocolGovernance(...)`
- `fetchReserveDomain(...)`
- `fetchDomainAssetVault(...)`
- `fetchDomainAssetLedger(...)`

## Workflow B: Sponsor-funded health plan

Use this for sponsor budgets, reward programs, or early-stage plans that do not need LP capital.

Builders:

- `buildCreateHealthPlanTx(...)`
- `buildUpdateHealthPlanControlsTx(...)`
- `buildCreatePolicySeriesTx(...)`
- `buildVersionPolicySeriesTx(...)`
- `buildOpenMemberPositionTx(...)`
- `buildUpdateMemberEligibilityTx(...)`
- `buildOpenFundingLineTx(...)`
- `buildFundSponsorBudgetTx(...)`
- `buildCreateObligationTx(...)`
- `buildReserveObligationTx(...)`
- `buildSettleObligationTx(...)`
- `buildReleaseReserveTx(...)`

Readers:

- `fetchHealthPlan(...)`
- `fetchPolicySeries(...)`
- `fetchMemberPosition(...)`
- `fetchFundingLine(...)`
- `fetchFundingLineLedger(...)`
- `fetchPlanReserveLedger(...)`
- `fetchSeriesReserveLedger(...)`
- `fetchObligation(...)`

Reserve helpers:

- `recomputeReserveBalanceSheet(...)`
- `buildSponsorReadModel(...)`

## Workflow C: Protection claims and premium flows

Use this when a policy series needs explicit premium intake, claim review, and settlement consequences.

Builders:

- `buildRecordPremiumPaymentTx(...)`
- `buildOpenClaimCaseTx(...)`
- `buildAttachClaimEvidenceRefTx(...)`
- `buildAdjudicateClaimCaseTx(...)`
- `buildSettleClaimCaseTx(...)`
- `buildCreateObligationTx(...)`
- `buildReserveObligationTx(...)`
- `buildSettleObligationTx(...)`

Readers:

- `fetchClaimCase(...)`
- `fetchObligation(...)`
- `fetchFundingLineLedger(...)`
- `fetchPlanReserveLedger(...)`
- `fetchSeriesReserveLedger(...)`

Failure helpers:

- `normalizeClaimSimulationFailure(...)`
- `normalizeClaimRpcFailure(...)`

## Workflow D: LP capital, classes, and redemptions

Use this when capital providers enter through canonical liquidity pools and capital classes.

Builders:

- `buildCreateLiquidityPoolTx(...)`
- `buildCreateCapitalClassTx(...)`
- `buildUpdateCapitalClassControlsTx(...)`
- `buildDepositIntoCapitalClassTx(...)`
- `buildRequestRedemptionTx(...)`
- `buildProcessRedemptionQueueTx(...)`

Readers:

- `fetchLiquidityPool(...)`
- `fetchCapitalClass(...)`
- `fetchPoolClassLedger(...)`
- `fetchLPPosition(...)`
- `fetchDomainAssetLedger(...)`

Reserve helpers:

- `recomputeReserveBalanceSheet(...)`
- `buildCapitalReadModel(...)`

## Workflow E: Allocation and impairment

Use this when LP capital is bridged into plan-side funding lines.

Builders:

- `buildCreateAllocationPositionTx(...)`
- `buildUpdateAllocationCapsTx(...)`
- `buildAllocateCapitalTx(...)`
- `buildDeallocateCapitalTx(...)`
- `buildMarkImpairmentTx(...)`

Readers:

- `fetchAllocationPosition(...)`
- `fetchAllocationLedger(...)`
- `fetchCapitalClass(...)`
- `fetchFundingLine(...)`
- `fetchObligation(...)`

## Workflow F: Member read models

Use this when you want wallet-facing views rather than raw account objects.

Helpers:

- `buildMemberReadModel(...)`
- `describeEligibilityStatus(...)`
- `describeClaimStatus(...)`
- `describeObligationStatus(...)`
- `shortenAddress(...)`

## Local release preflight

```bash
npm ci
npm run typecheck
npm run lint
npm run format:check
npm run build
npm test
npm run docs:check
npm run verify:protocol:local
```
