# Getting Started — `@omegax/protocol-sdk`

This guide gets you from install to a signed and broadcast transaction.

## 1) Prerequisites

- Node.js `>=20`
- ESM runtime (`"type": "module"`)
- A Solana RPC endpoint (optional when using SDK network defaults)
- The OmegaX protocol `programId` for your target cluster

> OmegaX is currently live on devnet beta. Mainnet support is coming soon.

## 2) Install

```bash
npm install @omegax/protocol-sdk
```

## 3) Create clients

```ts
import {
  createConnection,
  createProtocolClient,
  createRpcClient,
  getOmegaXNetworkInfo,
  PROTOCOL_PROGRAM_ID,
} from '@omegax/protocol-sdk';

const network = (process.env.OMEGAX_NETWORK as 'devnet' | 'mainnet' | undefined) ?? 'devnet';
const networkInfo = getOmegaXNetworkInfo(network);

const connection = createConnection({
  network,
  rpcUrl: process.env.SOLANA_RPC_URL,
  commitment: 'confirmed',
});
const programId = process.env.OMEGAX_PROGRAM_ID ?? PROTOCOL_PROGRAM_ID;

const protocol = createProtocolClient(connection, programId);
const rpc = createRpcClient(connection);
```

> `createProtocolClient(connection, programId)` always requires an explicit `programId` argument.

## 4) Build an unsigned transaction

Example: open enrollment.

```ts
const recentBlockhash = await rpc.getRecentBlockhash();

const tx = protocol.buildEnrollMemberOpenTx!({
  member: '<member-pubkey>',
  poolAddress: '<pool-pubkey>',
  subjectCommitmentHex: '<32-byte-hex>',
  recentBlockhash,
  programId,
});
```

## 5) Sign and submit

### Option A: wallet adapter/browser signer

```ts
const signedTx = await wallet.signTransaction(tx);
const signedTxBase64 = Buffer.from(signedTx.serialize()).toString('base64');
const broadcast = await rpc.broadcastSignedTx({ signedTxBase64, commitment: 'confirmed' });
```

### Option B: backend signer (`Keypair`)

```ts
tx.sign(serverKeypair);
const signedTxBase64 = tx.serialize().toString('base64');
const broadcast = await rpc.broadcastSignedTx({ signedTxBase64, commitment: 'confirmed' });
```

## 6) Optional simulation before broadcast

```ts
const signedTxBase64 = tx.serialize().toString('base64');
const simulation = await rpc.simulateSignedTx({ signedTxBase64, sigVerify: true });
if (!simulation.ok) {
  console.error(simulation.failure);
}
```

## 7) Verify resulting state

```ts
const membership = await protocol.fetchMembershipRecord!({
  poolAddress: '<pool-pubkey>',
  member: '<member-pubkey>',
});
```

## Claim-intent helper pattern

For explicit message binding in client/server claim handoffs:

1. Build intent with `buildUnsignedRewardClaimTx(...)` or `buildUnsignedClaimTx(...)`.
2. Have wallet sign the unsigned transaction.
3. Validate with `validateSignedClaimTx(...)`, passing `expectedUnsignedTxBase64`.
4. Submit with `broadcastSignedTx(...)`.

## Production checklist

- Configure `programId` and RPC URL per environment.
- Default network selection should be `devnet` until mainnet launch is announced.
- Ensure transaction recent blockhash is fresh before signing.
- Persist emitted signatures and poll `getSignatureStatus(...)`.
- Use reader calls (`fetch...`) to verify authoritative onchain outcomes.
