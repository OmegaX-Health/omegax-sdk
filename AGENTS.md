# OmegaX SDK

## Scope

- Treat `../omegax-protocol` as the active source of truth for protocol shape while the project is still devnet-first.
- Keep the SDK aligned to the current canonical protocol surface, not archived or parallel variants.

## Naming

- Do not introduce `v2` names, `legacy` labels, or parallel compatibility surfaces in exports, docs, tests, labels, or internal implementation names unless the live protocol still requires them.
- Prefer canonical names such as `policy series`, `policy position`, `claim record`, and `protocol config`.
- When a protocol rename lands, update the SDK surface in place instead of adding aliases by default.

## Validation

- Update fixtures, parity tests, and docs together when the protocol surface changes.
- Run `npm test` for normal SDK validation.
- Run `npm run verify:protocol:local` when protocol-facing builders, readers, seeds, or workspace integration change.
