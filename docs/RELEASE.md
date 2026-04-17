# Release Guide — `@omegax/protocol-sdk`

This is the maintainer flow for publishing the canonical SDK release.

## Release targets

- Protocol: `omegax-protocol v0.3.0`
- SDK: `@omegax/protocol-sdk v0.8.1`
- Docs portal: `docs.omegax.health` content synced to the matching SDK surface

## Preconditions

- `package.json` version is final.
- `docs/RELEASE_NOTES.md` is updated for the version being published.
- `docs/OMEGAX_DOCS_SYNC.json` points at the merged docs commit.
- Local protocol parity is green against the intended sibling `omegax-protocol` workspace.
- SDK commits include `Signed-off-by` trailers because CI enforces DCO.

## Local release checks

```bash
npm ci
npm run typecheck
npm run lint
npm run format:check
npm run build
npm test
npm run docs:check
npm run docs:sync:check:strict
npm run verify:protocol:local
npm run test:protocol:localnet
npm pack --dry-run
npm audit --omit=dev --audit-level=moderate
```

## Protocol binding refresh

Whenever the protocol IDL or contract artifact changes:

```bash
npm run generate:protocol-bindings
```

Commit regenerated artifacts with the source change. Do not hand-edit generated protocol bindings.

## Release publish order

1. Finalize and push `omegax-protocol` `main`.
2. Finalize and push `omegax-docs` `main`.
3. Update `docs/OMEGAX_DOCS_SYNC.json` with the merged docs commit.
4. Finalize and push `omegax-sdk` `main`.
5. Tag SDK `v0.8.1`.
6. Confirm `npm publish` and import smoke pass.
7. Tag protocol `v0.3.0` as the final public release marker.

## Post-publish verification

```bash
npm view @omegax/protocol-sdk version
```

Then run a clean install/import smoke test:

```bash
npm init -y
npm install @omegax/protocol-sdk@0.8.1
node --input-type=module -e "const m = await import('@omegax/protocol-sdk'); console.log(Object.keys(m).length)"
```
