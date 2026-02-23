# @omegax/protocol-sdk

TypeScript SDK for OmegaX protocol integrations on Solana.

It supports:

- Oracle lifecycle, staking, attestation voting, and reward claims
- Pool creation, configuration, enrollment, funding, and reward claims
- Coverage product and policy lifecycle (subscribe, premium, claim, settlement)
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

## Support matrix

- Node.js `>=20`
- ESM-only package (`"type": "module"`)
- Solana dependency: `@solana/web3.js`

## Important behavior

- Builders create **unsigned** transactions. Your app signs and submits them.
- `programId` is explicit in SDK flows and should be passed from your runtime config.
- Use `createProtocolClient(connection, programId)` for protocol operations.

## Quickstart

### 1) Create clients

```ts
import { createConnection, createProtocolClient, createRpcClient } from '@omegax/protocol-sdk';

const connection = createConnection('https://api.mainnet-beta.solana.com', 'confirmed');
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
  cycleId: 'cycle-2026-01',
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

- Create and configure pools: `buildCreatePoolV2Tx`, `buildSetPoolStatusTx`, `buildSetPoolTermsHashTx`
- Configure oracle policy/rules: `buildSetPoolOraclePolicyTx`, `buildSetPoolOutcomeRuleTx`, `buildSetPoolOracleTx`
- Fund payout liquidity: `buildFundPoolSolTx`, `buildFundPoolSplTx`
- Manage coverage products: `buildRegisterCoverageProductV2Tx`, `buildUpdateCoverageProductV2Tx`

### Pool participant / member

- Enroll: `buildEnrollMemberOpenTx`, `buildEnrollMemberTokenGateTx`, `buildEnrollMemberInvitePermitTx`
- Authorize claim delegation: `buildSetClaimDelegateTx`
- Claim rewards: `buildSubmitRewardClaimTx` (and legacy `buildSubmitClaimTx`)
- Participate in coverage: `buildSubscribeCoverageProductV2Tx`, `buildCreateCoveragePolicyTx`, `buildIssueCoveragePolicyFromProductV2Tx`

### Oracle operator

- Register/update oracle: `buildRegisterOracleV2Tx`, `buildUpdateOracleProfileV2Tx`, `buildUpdateOracleMetadataTx`
- Stake lifecycle: `buildStakeOracleTx`, `buildRequestUnstakeTx`, `buildFinalizeUnstakeTx`, `buildSlashOracleTx`
- Outcome + premium attestations: `buildSubmitOutcomeAttestationVoteTx`, `buildAttestPremiumPaidOffchainTx`
- Claim oracle rewards: `buildClaimOracleV2Tx`

### Coverage claims

- Submit claim: `buildSubmitCoverageClaimTx`
- Settle claim: `buildSettleCoverageClaimTx`
- Premium payment: `buildPayPremiumOnchainTx`
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
- `/PROTOCOL_V2_PARITY_CHECKLIST.md` — protocol parity checklist

## Protocol parity

The SDK includes a strict instruction-account parity test against an Anchor IDL.

- Default fixture path: `tests/fixtures/omegax_protocol.idl.json`
- Optional local override:

```bash
OMEGAX_PROTOCOL_IDL_PATH=/path/to/omegax_protocol.json npm test
```

Refresh the fixture:

```bash
npm run sync:idl-fixture
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

## OSS docs

- `CONTRIBUTING.md`
- `SECURITY.md`
- `CODE_OF_CONDUCT.md`

## License

Apache-2.0
