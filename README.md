# @omegax/protocol-sdk

TypeScript SDK for the canonical OmegaX health capital markets protocol on Solana.

## Release status

- SDK release target: `0.7.0`
- Protocol surface target: `omegax-protocol v0.3.0`
- Current public network target: Solana devnet beta
- Public docs: [docs.omegax.health](https://docs.omegax.health)

This package exposes the live canonical object model:

- protocol governance and scoped controls
- reserve domains and domain asset vaults
- health plans and policy series
- member positions
- funding lines, obligations, and claim cases
- liquidity pools, capital classes, LP positions, and allocation positions
- oracle profiles, pool oracle approvals, oracle policies, and permission sets
- outcome schemas and schema dependency ledgers
- reserve-aware read models for sponsors, members, and capital providers
- RPC helpers for unsigned transaction submission flows

No pool-first compatibility layer is kept in this release. If your integration still expects `create_pool`, `set_pool_status`, or `pool_type`, it needs to migrate to the canonical surface.

## Documentation map

- `/docs/INDEX.md` for the maintainer and integrator reading order
- `/docs/GETTING_STARTED.md` for installation, client setup, and the unsigned transaction pattern
- `/docs/WORKFLOWS.md` for canonical sponsor, claims, and capital flows
- `/docs/API_REFERENCE.md` for the exported package surface
- `/docs/TROUBLESHOOTING.md` for common failure modes and remediation
- `/docs/RELEASE.md` for the release checklist
- `/docs/DOCS_SYNC_WORKFLOW.md` for SDK to portal sync rules
- `/docs/CROSS_REPO_RELEASE_ORDER.md` for the coordinated protocol + docs + SDK publish order

## Install

```bash
npm install @omegax/protocol-sdk
```

## Runtime basics

- Node.js `>=20`
- ESM-only package
- Protocol builders are unsigned
- `programId` must be configured explicitly in runtime integrations
- Public integrations should stay on devnet until OmegaX announces mainnet availability

## Quickstart

```ts
import {
  createConnection,
  createProtocolClient,
  createRpcClient,
  deriveProtocolGovernancePda,
  deriveReserveDomainPda,
} from '@omegax/protocol-sdk';

const connection = createConnection({
  network: 'devnet',
  rpcUrl: process.env.SOLANA_RPC_URL,
  commitment: 'confirmed',
});

const programId = process.env.OMEGAX_PROGRAM_ID!;
const protocol = createProtocolClient(connection, programId);
const rpc = createRpcClient(connection);

const protocolGovernance = deriveProtocolGovernancePda(programId).toBase58();
const reserveDomain = deriveReserveDomainPda({
  domainId: 'open-usdc-domain',
  programId,
}).toBase58();

const tx = protocol.buildCreateReserveDomainTx({
  args: {
    domain_id: 'open-usdc-domain',
    display_name: 'Open USDC Domain',
    domain_admin: '<domain-admin-pubkey>',
    settlement_mode: 0,
    legal_structure_hash: new Uint8Array(32),
    compliance_baseline_hash: new Uint8Array(32),
    allowed_rail_mask: 1,
    pause_flags: 0,
  },
  accounts: {
    authority: '<governance-authority-pubkey>',
    protocol_governance: protocolGovernance,
    reserve_domain: reserveDomain,
  },
  recentBlockhash: await rpc.getRecentBlockhash(),
});
```

Sign and submit with your wallet or signer stack:

```ts
const signedTx = await wallet.signTransaction(tx);
const signedTxBase64 = Buffer.from(signedTx.serialize()).toString('base64');
const result = await rpc.broadcastSignedTx({
  signedTxBase64,
  commitment: 'confirmed',
});
```

## Canonical module map

- Root package: connection helpers, RPC helpers, protocol builders, PDA helpers, reserve-model helpers, shared types
- `@omegax/protocol-sdk/protocol`: IDL-backed builder and reader helpers such as `createProtocolClient(...)`, `listProtocolInstructionNames(...)`, `decodeProtocolAccount(...)`, and `compileTransactionToV0(...)`
- `@omegax/protocol-sdk/protocol_seeds`: deterministic PDA helpers such as `deriveReserveDomainPda(...)`, `deriveHealthPlanPda(...)`, `deriveFundingLinePda(...)`, and `deriveCapitalClassPda(...)`
- `@omegax/protocol-sdk/protocol_models`: constants and read-model helpers such as `recomputeReserveBalanceSheet(...)`, `buildSponsorReadModel(...)`, `buildCapitalReadModel(...)`, and `buildMemberReadModel(...)`
- `@omegax/protocol-sdk/claims`: claim and obligation failure normalization helpers such as `normalizeClaimSimulationFailure(...)`
- `@omegax/protocol-sdk/rpc`: `createConnection(...)`, `createRpcClient(...)`, and network metadata helpers
- `@omegax/protocol-sdk/utils`: hashing, binary encoding, and misc utilities
- `@omegax/protocol-sdk/types`: generated protocol contract types plus SDK RPC and failure types

## What the SDK is for

- Sponsors and operators can build reserve-domain, health-plan, policy-series, funding-line, obligation, and claim-case transactions directly.
- Capital providers can derive capital-class and allocation addresses, inspect ledgers, and build deposit and redemption flows against canonical pool and class objects.
- Wallet apps and members can inspect plan participation, obligations, claim state, and payout history with the read-model helpers.
- External integrators can enumerate the live instruction and account surface with `listProtocolInstructionNames(...)` and `listProtocolAccountNames(...)`.

## What the SDK does not do

- It does not keep legacy pool-first aliases.
- It does not hide settlement-critical accounting in offchain helpers.
- It does not invent a second protocol surface for wrappers or regulated participation.
- It does not sign transactions on your behalf.

## Local verification

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

To refresh checked-in protocol artifacts from a sibling `omegax-protocol` workspace:

```bash
npm run generate:protocol-bindings
```

## Release coordination

This package is released only when all three surfaces agree:

1. `omegax-protocol`
2. `omegax-docs`
3. `omegax-sdk`

Use `/docs/CROSS_REPO_RELEASE_ORDER.md` and `/docs/OMEGAX_DOCS_SYNC.json` to keep that publish train honest.
