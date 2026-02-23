# Integration Workflows — `@omegax/protocol-sdk`

This guide provides practical, role-based call sequences for production integrations.

## Shared integration pattern

1. Create Solana connection and clients (`createConnection`, `createProtocolClient`, `createRpcClient`).
2. Build deterministic unsigned transaction via a protocol builder.
3. Sign with the required wallet/keypair(s).
4. Broadcast with `rpc.broadcastSignedTx(...)`.
5. Verify state with relevant `fetch...` readers.

> All protocol builders are unsigned. Signing and fee-payer handling are your responsibility.

---

## Workflow A: Pool creator/operator (reward pool)

### 1) One-time protocol initialization (governance/admin)

- `buildInitializeProtocolV2Tx(...)` (new deployments)
- `buildSetProtocolParamsTx(...)` (tune defaults/limits)

### 2) Create and configure pool

- `buildCreatePoolV2Tx(...)`
- `buildSetPoolTermsHashTx(...)` (terms/payout policy updates)
- `buildSetPoolOraclePolicyTx(...)` (quorum and claim policy)
- `buildSetPoolOutcomeRuleTx(...)` (schema/rule registration per outcome rule)
- `buildSetPoolStatusTx(...)` (activate/pause/close)

### 3) Add allowed oracle(s)

- `buildRegisterOracleV2Tx(...)` (if oracle not yet registered)
- `buildSetPoolOracleTx(...)` (approve/deactivate oracle for pool)

### 4) Fund payout liquidity

- SOL path: `buildFundPoolSolTx(...)`
- SPL path: `buildFundPoolSplTx(...)`

### 5) Verify state

- `fetchPool(...)`, `fetchPoolTerms(...)`, `fetchPoolOraclePolicy(...)`
- `fetchPoolOutcomeRule(...)`, `fetchPoolAssetVault(...)`

---

## Workflow B: Member participation + reward claim

### 1) Enroll member

Choose one enrollment mode:

- Open enrollment: `buildEnrollMemberOpenTx(...)`
- Token-gated enrollment: `buildEnrollMemberTokenGateTx(...)`
- Invite permit enrollment: `buildEnrollMemberInvitePermitTx(...)`

### 2) Optional delegation

- `buildSetClaimDelegateTx(...)` (if claims are submitted by a delegate)

### 3) Oracle attestation cycle

- Oracles submit votes: `buildSubmitOutcomeAttestationVoteTx(...)`
- Finalize aggregate: `buildFinalizeCycleOutcomeTx(...)`

### 4) Submit reward claim

- Preferred v2: `buildSubmitRewardClaimTx(...)`
- Legacy compatibility: `buildSubmitClaimTx(...)`

### 5) Verify

- `fetchMembershipRecord(...)`, `fetchClaimDelegate(...)`
- `fetchAttestationVote(...)`, `fetchCycleOutcomeAggregate(...)`
- `fetchClaimRecordV2(...)`

---

## Workflow C: Oracle operations

### 1) Register/update oracle profile

- `buildRegisterOracleV2Tx(...)`
- `buildUpdateOracleProfileV2Tx(...)`
- `buildUpdateOracleMetadataTx(...)`

### 2) Stake lifecycle

- Stake: `buildStakeOracleTx(...)`
- Request unstake: `buildRequestUnstakeTx(...)`
- Finalize unstake: `buildFinalizeUnstakeTx(...)`
- Governance slash path: `buildSlashOracleTx(...)`

### 3) Earn oracle rewards

- Submit outcome votes: `buildSubmitOutcomeAttestationVoteTx(...)`
- Claim oracle emissions: `buildClaimOracleV2Tx(...)`

### 4) Verify

- `fetchOracleProfile(...)`, `fetchOracleStakePosition(...)`
- `fetchAttestationVote(...)`

---

## Workflow D: Coverage product and policy lifecycle

### 1) Product management (authority)

- Register product: `buildRegisterCoverageProductV2Tx(...)`
- Update product: `buildUpdateCoverageProductV2Tx(...)`

### 2) Member policy lifecycle

- Subscribe to product: `buildSubscribeCoverageProductV2Tx(...)`
- Issue policy from product: `buildIssueCoveragePolicyFromProductV2Tx(...)`
- Manual policy creation path: `buildCreateCoveragePolicyTx(...)`
- Optional policy NFT: `buildMintPolicyNftTx(...)`

### 3) Premium operations

- Onchain premium: `buildPayPremiumOnchainTx(...)`
- Offchain premium attestation: `buildAttestPremiumPaidOffchainTx(...)`

### 4) Coverage claim lifecycle

- Submit claim: `buildSubmitCoverageClaimTx(...)`
- Settle claim: `buildSettleCoverageClaimTx(...)`

### 5) Verify

- `fetchCoverageProduct(...)`, `fetchCoveragePolicy(...)`
- `fetchPremiumLedger(...)`, `fetchPremiumAttestationReplay(...)`
- `fetchCoverageClaimRecord(...)`

---

## Claim-intent helper workflow (offchain signing controls)

For stricter signature binding and deterministic intent payloads:

1. Build unsigned intent:
   - `buildUnsignedClaimTx(...)` (legacy claim path), or
   - `buildUnsignedRewardClaimTx(...)` (v2 reward claim path)
2. Wallet signs transaction.
3. Validate signed payload and message binding with:
   - `validateSignedClaimTx(...)`
4. Optionally classify failures with:
   - `normalizeClaimSimulationFailure(...)`
   - `normalizeClaimRpcFailure(...)`
   - `mapValidationReasonToClaimFailure(...)`

---

## Recommended release/preflight checks

```bash
npm ci
npm run build
npm test
npm pack --dry-run
npm audit --omit=dev
```
