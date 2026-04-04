# OmegaX SDK

## Scope

- Treat `../omegax-protocol` as the active source of truth for protocol shape while the project is still devnet-first.
- Keep the SDK aligned to the current canonical protocol surface, not archived or parallel variants.
- Keep `README.md` and `docs/*.md` aligned with the exported SDK behavior and current release workflow.

## Layout

- `src/` contains the authored SDK surface: builders, readers, RPC helpers, and exports.
- `tests/` covers unit behavior, IDL parity, local protocol workspace parity, and fixtures.
- `scripts/` contains verification, fixture-sync, and docs-sync helpers used by local workflows and CI.
- `docs/` contains versioned SDK docs plus `OMEGAX_DOCS_SYNC.json` for `omegax-docs` parity.
- `dist/` and `artifacts/` are generated outputs; do not hand-edit them.

## Naming

- Do not introduce `v2` names, `legacy` labels, or parallel compatibility surfaces in exports, docs, tests, labels, or internal implementation names unless the live protocol still requires them.
- Prefer canonical names such as `policy series`, `policy position`, `claim record`, and `protocol config`.
- When a protocol rename lands, update the SDK surface in place instead of adding aliases by default.

## Workflow

- When protocol-facing builders, readers, seeds, or account fixtures change, update `src/`, parity tests, fixtures, and user-facing docs together.
- Refresh `tests/fixtures/omegax_protocol.idl.json` with `npm run sync:idl-fixture` when the canonical IDL changes.
- When exported symbols or public workflows change, keep `README.md`, `docs/API_REFERENCE.md`, `docs/GETTING_STARTED.md`, and `docs/WORKFLOWS.md` in sync.
- When release-facing docs or docs mappings change, validate `docs/OMEGAX_DOCS_SYNC.json` instead of leaving version or path drift behind.

## Validation

- Run `npm test` for normal SDK validation.
- Run `npm run verify:protocol:local` when protocol-facing builders, readers, seeds, fixtures, or workspace integration change.
- Run `npm run docs:check` when touching `README.md`, files under `docs/`, or exported SDK callables mentioned there.
- Run `npm run docs:sync:check` when touching `docs/OMEGAX_DOCS_SYNC.json`, release docs, or SDK-to-`omegax-docs` mappings.
- Run `npm run typecheck`, `npm run lint`, and `npm run format:check` before handing off broad or release-sensitive changes.

## Done

- No new `legacy` or `v2` compatibility surface exists unless the live protocol still requires it.
- Fixtures, parity tests, and docs reflect the current protocol-facing SDK surface.
- Generated outputs remain script-owned rather than manually edited.
