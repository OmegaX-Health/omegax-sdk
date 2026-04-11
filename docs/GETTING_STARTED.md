# Getting Started — `@omegax/protocol-sdk`

This guide gets you from install to a signed canonical OmegaX transaction.

## Prerequisites

- Node.js `>=20`
- ESM runtime
- A Solana RPC endpoint
- The deployed OmegaX `programId` for your target cluster

Public integrations should target devnet beta until OmegaX announces public mainnet availability.

## Install

```bash
npm install @omegax/protocol-sdk
```

## Create clients

```ts
import {
  PROTOCOL_PROGRAM_ID,
  createConnection,
  createProtocolClient,
  createRpcClient,
  getOmegaXNetworkInfo,
} from '@omegax/protocol-sdk';

const network =
  (process.env.OMEGAX_NETWORK as 'devnet' | 'mainnet' | undefined) ?? 'devnet';
const networkInfo = getOmegaXNetworkInfo(network);

const connection = createConnection({
  network,
  rpcUrl: process.env.SOLANA_RPC_URL ?? networkInfo.defaultRpcUrl,
  commitment: 'confirmed',
});

const programId = process.env.OMEGAX_PROGRAM_ID ?? PROTOCOL_PROGRAM_ID;
const protocol = createProtocolClient(connection, programId);
const rpc = createRpcClient(connection);
```

## Derive canonical addresses

Use PDA helpers from `@omegax/protocol-sdk/protocol_seeds` or the root package to keep runtime state deterministic.

```ts
import {
  deriveProtocolGovernancePda,
  deriveReserveDomainPda,
  deriveHealthPlanPda,
} from '@omegax/protocol-sdk';

const protocolGovernance = deriveProtocolGovernancePda(programId).toBase58();
const reserveDomain = deriveReserveDomainPda({
  domainId: 'open-usdc-domain',
  programId,
}).toBase58();
const healthPlan = deriveHealthPlanPda({
  reserveDomain,
  planId: 'nexus-seeker-rewards',
  programId,
}).toBase58();
```

## Build an unsigned transaction

The canonical SDK uses the live IDL-backed builder surface. Every instruction follows the same shape:

- `args`: instruction arguments
- `accounts`: non-static accounts in the order implied by the IDL
- `recentBlockhash`: fresh blockhash

Example: `buildCreateReserveDomainTx(...)`.

```ts
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

## Sign and broadcast

### Wallet adapter / browser signer

```ts
const signedTx = await wallet.signTransaction(tx);
const signedTxBase64 = Buffer.from(signedTx.serialize()).toString('base64');
const broadcast = await rpc.broadcastSignedTx({
  signedTxBase64,
  commitment: 'confirmed',
});
```

### Backend signer

```ts
tx.sign(serverKeypair);
const signedTxBase64 = Buffer.from(tx.serialize()).toString('base64');
const broadcast = await rpc.broadcastSignedTx({
  signedTxBase64,
  commitment: 'confirmed',
});
```

## Simulate before sending

```ts
const signedTxBase64 = Buffer.from(tx.serialize()).toString('base64');
const simulation = await rpc.simulateSignedTx({
  signedTxBase64,
  sigVerify: true,
});

if (!simulation.ok) {
  console.error(simulation.failure);
}
```

## Verify resulting state

Use canonical reader helpers rather than ad hoc account decoding.

```ts
const domain = await protocol.fetchReserveDomain(reserveDomain);
const plan = await protocol.fetchHealthPlan(healthPlan);
```

You can also inspect the live contract shape programmatically:

```ts
const instructions = protocol.listProtocolInstructionNames?.() ?? [];
```

or from the root module:

```ts
import { listProtocolInstructionNames } from '@omegax/protocol-sdk';

const instructions = listProtocolInstructionNames();
```

## Optional v0 transaction compilation

If your runtime uses lookup tables, compile a built transaction with `compileTransactionToV0(...)`.

```ts
import { compileTransactionToV0 } from '@omegax/protocol-sdk';

const versioned = compileTransactionToV0(tx, lookupTableAccounts);
```

## Practical next steps

1. Use `WORKFLOWS.md` to map sponsor, claim, or capital flows to exact builders.
2. Use `API_REFERENCE.md` to see the exported reader, PDA helper, and oracle helper surface.
3. Use `RELEASE_NOTES.md` to confirm the package version and newly added modules you expect to consume.
4. Run `npm run generate:protocol-bindings` whenever the sibling protocol repo changes.
5. Run `npm run verify:protocol:local` before shipping SDK changes that affect runtime parity.
