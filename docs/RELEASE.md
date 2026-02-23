# Release Guide — `@omegax/protocol-sdk`

This is the maintainer flow for publishing a public release.

## Preconditions

- Repo is public and release workflows are enabled.
- npm scope access exists for `@omegax`.
- `NPM_TOKEN` is configured in GitHub Actions secrets.
- Version in `package.json` is final (example: `0.4.0`).

## 1) Local pre-release checks

```bash
npm ci
npm run build
npm test
npm run docs:check
npm run docs:sync:check
npm pack --dry-run
npm audit --omit=dev --audit-level=moderate
```

Expected:

- Tests pass, including strict IDL parity.
- No moderate+ production vulnerabilities.
- Pack output contains only expected public artifacts.

## 2) Sync to `omegax-docs`

Before tagging:

1. Sync public docs pages in `omegax-docs`.
2. Update `docs/OMEGAX_DOCS_SYNC.json` with:
   - `sdkVersion`
   - `omegaxDocsCommit`
   - `syncedAt`
   - `syncedBy`
   - Recommended helper:

```bash
npm run docs:sync:update -- --docs-repo=../omegax-docs --synced-by=<maintainer>
```

3. Run strict sync gate:

```bash
npm run docs:sync:check:strict
```

## 3) Version/tag alignment

Release workflow validates tag/version match:

- Tag format: `vX.Y.Z`
- `package.json` must be exactly `X.Y.Z`

Example:

- `package.json`: `0.4.0`
- git tag: `v0.4.0`

## 4) Publish via GitHub Actions

1. Merge release-ready changes to default branch.
2. Create and push tag:

```bash
git tag v0.4.0
git push origin v0.4.0
```

3. Watch `.github/workflows/release.yml`.

Workflow sequence:

- `npm ci`
- `npm run build`
- `npm test`
- tag/version guard
- `npm publish --access public --provenance`

## 5) Post-publish verification

```bash
npm view @omegax/protocol-sdk version
```

Then smoke test in a clean directory:

```bash
npm init -y
npm install @omegax/protocol-sdk@0.4.0
node --input-type=module -e "const m=await import('@omegax/protocol-sdk'); console.log(Object.keys(m).length)"
```

## 6) Protocol parity maintenance

When protocol IDL changes:

```bash
npm run sync:idl-fixture
npm test
```

Commit fixture updates and release only after parity is green.
