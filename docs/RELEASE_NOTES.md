# Release Notes — `@omegax/protocol-sdk`

## `0.8.1`

- Refreshed generated IDL, contract, and type bindings against the latest public `omegax-protocol v0.3.0` surface.
- Updated SDK parity for the linked protection-claim and obligation-settlement hardening, including the newer obligation lifecycle account metadata and tighter claim linkage invariants.
- Kept the package on the devnet-first public release track while preserving the current `omegax-protocol v0.3.0` contract target.

## `0.8.0`

- Added first-class SDK coverage for the current oracle and schema registry surface, including canonical builders and generated contract parity for oracle profiles, pool oracle controls, outcome schemas, and schema dependency ledgers.
- Exported the new `@omegax/protocol-sdk/oracle` module for attestation workflows, including `createOracleSignerFromEnv(...)`, `createOracleSignerFromKmsAdapter(...)`, and `attestOutcome(...)`.
- Added `buildAttestClaimCaseTx(...)` plus the supporting generated bindings and PDA helpers so oracle services can anchor schema-bound claim-case attestations on-chain without dropping to custom instruction packing.
- Refreshed protocol bindings, PDA helpers, and parity tests so the SDK matches the latest canonical `omegax-protocol` `main` surface and passes the local protocol verification gate.
- Kept the package on the devnet-first public release track while preserving the current `omegax-protocol v0.3.0` contract target.

## `0.7.0`

- Shipped the canonical health-capital-markets SDK surface for governance, reserve domains, health plans, claims, obligations, capital classes, allocations, and reserve-aware read models.
- Removed stale pool-first compatibility assumptions from the public SDK surface and docs.
