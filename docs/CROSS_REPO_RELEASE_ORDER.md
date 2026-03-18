# Cross-Repo Release Order (SDK + `omegax-docs`)

Use this sequence to publish without SDK/docs drift.

## 1) Merge docs portal changes first (`omegax-docs`)

Create branch:

```bash
git checkout -b codex/docs-sdk-v0.6.0
```

Commit message (recommended):

- `docs(sdk): publish v0.6.0 canonical sdk surface`

Scope to include:

- `website/docs/sdk/*`
- `website/docs/changelog.md`
- `website/sidebars.ts` only if doc ids or paths change

After merge, capture merged commit SHA:

```bash
git rev-parse HEAD
```

## 2) Update SDK sync manifest and pass strict checks (`omegax-sdk`)

Create branch:

```bash
git checkout -b codex/sdk-release-v0.6.0
```

Update sync metadata from merged docs repo commit:

```bash
npm run docs:sync:update -- --docs-repo=../omegax-docs --synced-by=<maintainer>
```

Run release gates:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run docs:check
npm run docs:sync:check:strict
npm run build
npm test
npm pack --dry-run
npm audit --omit=dev --audit-level=moderate
```

Commit message (recommended):

- `release(v0.6.0): finalize canonical sdk docs parity and publish gates`

## 3) Merge SDK PR, then tag

Once SDK PR is merged to default branch:

```bash
git checkout <default-branch>
git pull
git tag v0.6.0
git push origin v0.6.0
```

This triggers the release workflow that validates:

- tag/version match
- docs parity strict gate
- typecheck/lint/format gates
- tests/build
- npm publish with provenance

## 4) Post-publish verification

```bash
npm view @omegax/protocol-sdk version
```

Then run an install/import smoke test in a clean project.
