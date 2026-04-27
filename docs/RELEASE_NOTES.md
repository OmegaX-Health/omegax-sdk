# Release Notes — `@omegax/protocol-sdk`

## Unreleased

- Hardened `simulateSignedTx(...)` so signature-verification downgrades fail closed by default and require explicit `allowSigVerifyFallback: true`.
- Added simulation metadata fields so integrations can reject unverified preflight results before claim or intake processing.
- Documented the current dependency-audit posture: production high advisories block release, while no-fix Solana-chain moderate advisories are reviewed and tracked.

## `0.8.3`

- Refreshed generated IDL, contract, and type bindings against `omegax-protocol v0.3.1`.
- Updated reserve-domain bootstrap ergonomics so `buildCreateDomainAssetVaultTx(...)` requires a concrete vault token account instead of allowing a zero placeholder.
- Reflected the new custody-aware inflow surface: sponsor funding, premium payments, and LP capital deposits require source token account, vault token account, mint, and token program accounts.
- Reflected the redemption hardening: `request_redemption` and `process_redemption_queue` take shares only, while asset payout is derived on-chain from NAV and queued redemption state.

## `0.8.2`

- Fixed `buildOpenMemberPositionTx(...)` so invite-only enrollment keeps `inviteAuthorityAddress` as an optional signer account, matching the canonical `open_member_position` contract.
- Added regression coverage for invite-authority account metas so token/invite-gated member builders do not silently degrade back to open-member posture.
- Kept the package on the devnet-first public release track while preserving the current `omegax-protocol v0.3.0` contract target.

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
