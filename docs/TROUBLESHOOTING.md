# Troubleshooting — `@omegax/protocol-sdk`

This page maps common integration failures to likely causes and fixes.

## Fast triage

1. Confirm Node version is `>=20`.
2. Confirm ESM runtime (`"type": "module"`).
3. Confirm target `programId` matches deployed protocol on that cluster.
4. Run local checks:

```bash
npm run build
npm test
```

## Transaction/signing issues

### `invalid_transaction_base64`

Cause:
- `validateSignedClaimTx(...)` received malformed or truncated base64.

Fix:
- Ensure you encode bytes from `tx.serialize()` and do not re-encode JSON/text.

### `missing_fee_payer` or `missing_required_signature`

Cause:
- Transaction was not signed by the required signer.

Fix:
- Set fee payer correctly and ensure signer signs before serialize/send.

### `required_signer_mismatch`

Cause:
- Signed transaction fee payer does not equal `requiredSigner`.

Fix:
- Align signer wallet with expected claimant/delegate identity.

### `intent_message_mismatch`

Cause:
- Signed message bytes differ from prepared unsigned intent.

Fix:
- Do not mutate transaction fields after generating/handing off the unsigned intent.

## Builder validation errors

### `poolId exceeds 32 UTF-8 bytes`

Cause:
- `poolId` is too long for PDA seed constraints.

Fix:
- Use a short deterministic identifier (`<=32` UTF-8 bytes).

### `supported schema key hashes cannot exceed 16`

Cause:
- Too many schema hashes passed to oracle profile registration/update.

Fix:
- Limit to 16 entries per call.

### `protocolFeeBps must be an integer between 0 and 10000`

Cause:
- Invalid basis points for protocol fee params.

Fix:
- Use integer value in `[0, 10000]`.

### `poolAssetVault, poolVaultTokenAccount, and recipientTokenAccount must be provided together`

Cause:
- Reward/settlement SPL optional accounts were partially provided.

Fix:
- Provide all three for SPL payouts, or none for pure SOL flow.

### `invalid ISO timestamp`

Cause:
- ISO datetime parameter is malformed.

Fix:
- Use RFC 3339 / ISO-8601 format (`new Date(...).toISOString()`).

## Reader decode failures

### `account discriminator mismatch for ...`

Cause:
- Account bytes do not match expected type discriminator.

Likely reasons:
- Wrong account address for the reader type.
- Mismatched `programId`/cluster.
- Protocol version mismatch between SDK and deployed program.

Fix:
- Recompute PDA with SDK seed helpers and verify cluster/program alignment.
- Re-run parity checks if protocol changed:

```bash
npm run sync:idl-fixture
npm test
```

## RPC/broadcast failures

### Failure code `rpc_timeout`

Cause:
- RPC did not confirm before timeout or blockhash expired.

Fix:
- Refresh blockhash, retry submit, and check RPC health/latency.

### Failure code `rpc_rejected`

Cause:
- RPC endpoint rejected tx (simulation or network policy).

Fix:
- Run `simulateSignedTx(...)`, inspect logs, and retry with corrected accounts/signatures.

### Failure code `simulation_failed_insufficient_funds`

Cause:
- Insufficient pool liquidity / account funds.

Fix:
- Top up pool vault or use correct payout asset path.

### Failure code `simulation_failed_pool_paused`

Cause:
- Pool or protocol currently paused/inactive for requested action.

Fix:
- Check pool status/governance params and reactivate where authorized.

### Failure code `simulation_failed_membership_invalid`

Cause:
- Member record inactive, missing, or mismatched for pool.

Fix:
- Re-run enrollment and verify membership PDA/account state.

## If issues persist

- Capture tx signature, account inputs, and simulation logs.
- Record SDK version and program commit/version.
- Open an issue with reproducible steps and sanitized payloads.
