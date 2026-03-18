# SDK ↔ `omegax-docs` Sync Workflow

This workflow keeps SDK docs and the public docs portal on parity without duplicating ownership.

## Ownership model

- SDK repo is the source of truth for versioned API/reference behavior.
- `omegax-docs` is the public documentation UX (guides, architecture, cross-product context).
- Every SDK release must have a matching docs sync record in `OMEGAX_DOCS_SYNC.json`.

## Required files in this repo

- `docs/API_REFERENCE.md`
- `docs/WORKFLOWS.md`
- `docs/GETTING_STARTED.md`
- `docs/TROUBLESHOOTING.md`
- `docs/OMEGAX_DOCS_SYNC.json` (machine-checkable sync manifest)

## Exact change workflow

1. Update SDK docs in this repo with any API/workflow changes.
2. Run local checks:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run docs:check
npm run docs:sync:check
```

3. Open/update matching pages in `omegax-docs` using `docs/OMEGAX_DOCS_SYNC.json` path mapping.
4. Merge `omegax-docs` change.
5. Update `docs/OMEGAX_DOCS_SYNC.json`:
   - `sdkVersion` to current `package.json` version
   - `omegaxDocsCommit` to merged commit SHA in `omegax-docs`
   - `syncedAt` in ISO-8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`)
   - `syncedBy` maintainer handle/name
   - Optional helper:

```bash
npm run docs:sync:update -- --docs-repo=../omegax-docs --synced-by=<maintainer>
```

6. Run strict sync gate:

```bash
npm run docs:sync:check:strict
```

7. Tag and release after strict gate passes.

## CI and release enforcement

- PR/CI gate:
  - `npm run typecheck`
  - `npm run lint`
  - `npm run format:check`
  - `npm run docs:check`
  - `npm run docs:sync:check` (structure/version parity; allows `PENDING` sync metadata)
- Release gate:
  - `npm run docs:sync:check:strict`
  - Requires non-placeholder commit/date/author and exact version match.

## Sync manifest schema

`docs/OMEGAX_DOCS_SYNC.json` must include:

- `sdkVersion`: must equal `package.json` version.
- `omegaxDocsRepo`: canonical portal repo URL.
- `omegaxDocsCommit`: merged commit SHA for synced docs.
- `syncedAt`: ISO timestamp when sync was completed.
- `syncedBy`: owner of sync verification.
- `pages[]`: `sdkDoc` → `omegaxDocsPath` mapping.

For Docusaurus in `omegax-docs`, target paths are expected under `website/docs/...`.
