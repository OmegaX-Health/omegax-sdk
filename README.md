# @omegax/protocol-sdk

TypeScript SDK for OmegaX protocol integrations on Solana.

## Network status

- Current live network: **devnet beta**
- Public integration target: **devnet beta**
- Protocol UI: https://protocol.omegax.health
- Protocol repository: `omegax-protocol`
- Governance token:
  - Mainnet CA: `4Aar9R14YMbEie6yh8WcH1gWXrBtfucoFjw6SpjXpump`
  - Devnet: governance token distribution is via the protocol faucet

It supports:

- Oracle lifecycle, staking, attestation voting, and reward claims
- Pool creation, configuration, enrollment, funding, and reward claims
- Policy series and policy position lifecycle (subscribe, premium, claim, settlement)
- Deterministic PDA/seed derivation and account readers
- Unsigned claim-intent building + signed message validation
- RPC helpers for send/simulate/status workflows

## Documentation map

- `/docs/INDEX.md` — start here (guide to all docs)
- `/docs/GETTING_STARTED.md` — setup, signing, send/simulate patterns
- `/docs/WORKFLOWS.md` — role-based integration checklists
- `/docs/API_REFERENCE.md` — complete exported surface
- `/docs/TROUBLESHOOTING.md` — common failures and fixes
- `/docs/RELEASE.md` — maintainer release/publish process
- `/docs/DOCS_SYNC_WORKFLOW.md` — SDK ↔ `omegax-docs` parity workflow and gates
- `/docs/CROSS_REPO_RELEASE_ORDER.md` — exact merge/tag order for zero-drift releases

## Install

```bash
npm install @omegax/protocol-sdk
```

## Breaking change in `0.5.0`

- Legacy and `V2` exported names were removed from the public SDK surface.
- Use the current canonical protocol builders, readers, and PDA helpers only.

## Support matrix

- Node.js `>=20`
- ESM-only package (`"type": "module"`)
- Solana dependency: `@solana/web3.js`

## Important behavior

- Builders create **unsigned** transactions. Your app signs and submits them.
- `programId` is explicit in SDK flows and should be passed from your runtime config.
- Use `createProtocolClient(connection, programId)` for protocol operations.
- Keep integrations pointed at `devnet` until OmegaX announces public mainnet availability.

## Quickstart

### 1) Create clients

```ts
import { createConnection, createProtocolClient, createRpcClient } from '@omegax/protocol-sdk';

const connection = createConnection({
  network: 'devnet',
  rpcUrl: process.env.SOLANA_RPC_URL,
  commitment: 'confirmed',
});
const programId = 'Bn6eixac1QEEVErGBvBjxAd6pgB9e2q4XHvAkinQ5y1B';

const protocol = createProtocolClient(connection, programId);
const rpc = createRpcClient(connection);
```

### 2) Build an unsigned reward-claim transaction

```ts
const tx = protocol.buildSubmitRewardClaimTx!({
  claimant: '<claimant-pubkey>',
  poolAddress: '<pool-pubkey>',
  member: '<member-pubkey>',
  seriesRefHashHex: '<32-byte-hex>',
  cycleHashHex: '<32-byte-hex>',
  ruleHashHex: '<32-byte-hex>',
  intentHashHex: '<32-byte-hex>',
  payoutAmount: 1n,
  recipient: '<recipient-pubkey>',
  recipientSystemAccount: '<recipient-system-pubkey>',
  recentBlockhash: await rpc.getRecentBlockhash(),
  programId,
});
```

### 3) Sign + broadcast

```ts
const signed = tx.serialize({ requireAllSignatures: false }).toString('base64');
const result = await rpc.broadcastSignedTx({ signedTxBase64: signed });
```

## What this SDK covers (by role)

### Pool creator / operator

- Create and configure pools: `buildCreatePoolTx`, `buildSetPoolStatusTx`, `buildSetPoolTermsHashTx`
- Configure oracle policy/rules: `buildSetPoolOraclePolicyTx`, `buildSetPolicySeriesOutcomeRuleTx`, `buildSetPoolOracleTx`
- Fund payout liquidity: `buildFundPoolSolTx`, `buildFundPoolSplTx`
- Manage policy series: `buildCreatePolicySeriesTx`, `buildUpdatePolicySeriesTx`

### Pool participant / member

- Enroll: `buildEnrollMemberOpenTx`, `buildEnrollMemberTokenGateTx`, `buildEnrollMemberInvitePermitTx`
- Authorize claim delegation: `buildSetClaimDelegateTx`
- Claim rewards: `buildSubmitRewardClaimTx`
- Participate in policy series: `buildSubscribePolicySeriesTx`, `buildIssuePolicyPositionTx`, `buildPayPremiumSolTx`, `buildPayPremiumSplTx`

### Oracle operator

- Register/update oracle: `buildRegisterOracleTx`, `buildUpdateOracleProfileTx`, `buildUpdateOracleMetadataTx`
- Stake lifecycle: `buildStakeOracleTx`, `buildRequestUnstakeTx`, `buildFinalizeUnstakeTx`, `buildSlashOracleTx`
- Outcome + premium attestations: `buildSubmitOutcomeAttestationVoteTx`, `buildAttestPremiumPaidOffchainTx`
- Claim oracle rewards: `buildClaimOracleTx`

### Coverage claims

- Submit claim: `buildSubmitCoverageClaimTx`
- Claim approved payout: `buildClaimApprovedCoveragePayoutTx`
- Settle claim: `buildSettleCoverageClaimTx`
- Premium payment: `buildPayPremiumSolTx`, `buildPayPremiumSplTx`
- Optional policy NFT mint: `buildMintPolicyNftTx`

## Module imports

Use root package or stable subpaths:

```ts
import { createProtocolClient } from '@omegax/protocol-sdk';
import { buildUnsignedRewardClaimTx } from '@omegax/protocol-sdk/claims';
import { derivePoolPda } from '@omegax/protocol-sdk/protocol_seeds';
```

Available subpaths: `claims`, `protocol`, `protocol_seeds`, `rpc`, `oracle`, `types`, `utils`.

## Comprehensive docs

- `/docs/INDEX.md` — docs navigation and recommended reading order
- `/docs/GETTING_STARTED.md` — installation + end-to-end transaction flow
- `/docs/API_REFERENCE.md` — full client surface (builders, readers, helpers)
- `/docs/WORKFLOWS.md` — role-based integration checklists (pool, member, oracle, coverage)
- `/docs/TROUBLESHOOTING.md` — integration failures, validation reasons, operational fixes
- `/docs/RELEASE.md` — versioning, CI gates, tag/publish flow
- `/docs/DOCS_SYNC_WORKFLOW.md` — exact cross-repo docs sync workflow (`omegax-docs`)
- `/docs/CROSS_REPO_RELEASE_ORDER.md` — commit message templates and release ordering
- `/PROTOCOL_PARITY_CHECKLIST.md` — protocol parity checklist

## Protocol parity

The SDK includes:

- a strict instruction-account parity test against an Anchor IDL
- a live protocol-contract parity check when a local `omegax-protocol` workspace is present
- a local protocol compatibility gate that runs an SDK smoke test plus the full protocol surface matrix through an SDK adapter

- Default fixture path: `tests/fixtures/omegax_protocol.idl.json`
- Optional local override:

```bash
OMEGAX_PROTOCOL_IDL_PATH=/path/to/omegax_protocol.json npm test
```

Refresh the fixture:

```bash
npm run sync:idl-fixture
```

For the normal local workspace layout, this reads from:

- `../omegax-protocol/idl/omegax_protocol.json`

Run the full local compatibility gate before pushing SDK changes that may affect protocol behavior:

```bash
npm run verify:protocol:local
```

This verifies the current local `omegax-protocol` workspace state, including staged, unstaged, and untracked source changes, and records the exact workspace fingerprint it tested.

For targeted localnet-only verification:

```bash
npm run test:protocol:localnet
```

If you changed SDK builders that are consumed by the oracle service, refresh the local dependency there after rebuilding the SDK:

```bash
cd ../omegaxhealth_services/services/protocol-oracle-service
npm run sdk:refresh
npm run sdk:check
```

Latest fixture sync metadata:

- Source commit: `e32313b5c49fb06a609252f845845fcf2d49e98d`
- Fixture SHA-256: `da54336ff190407d1dfa89ae8ca976c1f025cf3c53ffdabb853b661c157e4ee9`

## Development commands

```bash
npm run build
npm test
npm pack --dry-run
npm audit --omit=dev
```

## Cross-repo sync

Keep the repos aligned in this order:

1. `omegax-protocol`
2. `omegax-sdk`
3. `protocol-oracle-service`
4. `omegaxhealth_flutter` if the service DTO changed

Practical rule:

- protocol interface changes start in `omegax-protocol`
- SDK mirrors the protocol interface and exposes the supported client surface
- the oracle service refreshes the local SDK package and owns the app-facing Seeker DTO
- Flutter only follows the service contract

## OSS docs

- `CONTRIBUTING.md`
- `SECURITY.md`
- `CODE_OF_CONDUCT.md`
- `AUTHORS.md`

## License

This SDK is licensed under Apache-2.0.

The on-chain OmegaX protocol program lives in the separate `omegax-protocol` repository and is licensed independently under AGPL-3.0-or-later.

Maintained by OMEGAX HEALTH FZCO with open-source contributors. Project initiated by Marino Sabijan, MD.
