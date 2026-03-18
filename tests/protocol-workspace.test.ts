import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { readProtocolWorkspaceState } from '../scripts/protocol-workspace.mjs';

function git(repoRoot: string, args: string[]) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function writeProtocolWorkspaceFile(repoRoot: string, relativePath: string, contents: string) {
  const absolutePath = join(repoRoot, relativePath);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, contents, 'utf8');
}

function createTempProtocolRepo() {
  const repoRoot = mkdtempSync(join(tmpdir(), 'omegax-protocol-workspace-'));

  writeProtocolWorkspaceFile(repoRoot, 'idl/omegax_protocol.json', JSON.stringify({ version: '0.0.1' }));
  writeProtocolWorkspaceFile(
    repoRoot,
    'shared/protocol_contract.json',
    JSON.stringify({ instructions: [], accountDiscriminators: {}, pdaSeeds: {} }),
  );
  writeProtocolWorkspaceFile(repoRoot, 'e2e/support/surface_manifest.ts', 'export const manifest = [];');
  writeProtocolWorkspaceFile(repoRoot, 'e2e/localnet_protocol_surface.test.ts', 'export const smoke = true;');

  git(repoRoot, ['init']);
  git(repoRoot, ['config', 'user.email', 'codex@example.com']);
  git(repoRoot, ['config', 'user.name', 'OmegaX SDK Test']);
  git(repoRoot, ['add', '.']);
  git(repoRoot, ['commit', '-m', 'initial']);

  return repoRoot;
}

test('protocol workspace state is stable when the repo has no local changes', () => {
  const repoRoot = createTempProtocolRepo();

  try {
    const firstState = readProtocolWorkspaceState(repoRoot);
    const secondState = readProtocolWorkspaceState(repoRoot);

    assert.equal(firstState.hasLocalChanges, false);
    assert.equal(firstState.changeSummary.staged, 0);
    assert.equal(firstState.changeSummary.unstaged, 0);
    assert.equal(firstState.changeSummary.untracked, 0);
    assert.equal(firstState.workspaceFingerprint, secondState.workspaceFingerprint);
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

test('tracked staged and unstaged source changes update the workspace fingerprint', () => {
  const repoRoot = createTempProtocolRepo();

  try {
    const baseline = readProtocolWorkspaceState(repoRoot);

    writeProtocolWorkspaceFile(
      repoRoot,
      'shared/protocol_contract.json',
      JSON.stringify({ instructions: [{ name: 'set_pool_status' }], accountDiscriminators: {}, pdaSeeds: {} }),
    );
    const unstagedState = readProtocolWorkspaceState(repoRoot);
    assert.equal(unstagedState.hasLocalChanges, true);
    assert.ok(unstagedState.changeSummary.unstaged > 0);
    assert.notEqual(unstagedState.workspaceFingerprint, baseline.workspaceFingerprint);

    git(repoRoot, ['add', 'shared/protocol_contract.json']);
    const stagedState = readProtocolWorkspaceState(repoRoot);
    assert.equal(stagedState.hasLocalChanges, true);
    assert.ok(stagedState.changeSummary.staged > 0);
    assert.notEqual(stagedState.workspaceFingerprint, baseline.workspaceFingerprint);
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

test('untracked source files update the workspace fingerprint', () => {
  const repoRoot = createTempProtocolRepo();

  try {
    const baseline = readProtocolWorkspaceState(repoRoot);

    writeProtocolWorkspaceFile(repoRoot, 'e2e/support/new-scenario.ts', 'export const nextScenario = true;');
    const updatedState = readProtocolWorkspaceState(repoRoot);

    assert.equal(updatedState.hasLocalChanges, true);
    assert.ok(updatedState.changeSummary.untracked > 0);
    assert.notEqual(updatedState.workspaceFingerprint, baseline.workspaceFingerprint);
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

test('generated workspace directories do not affect the workspace fingerprint', () => {
  const repoRoot = createTempProtocolRepo();

  try {
    const baseline = readProtocolWorkspaceState(repoRoot);

    writeProtocolWorkspaceFile(repoRoot, 'target/deploy/omegax_protocol.so', 'generated-program-binary');
    writeProtocolWorkspaceFile(repoRoot, 'node_modules/mock-package/index.js', 'export default "generated";');
    const updatedState = readProtocolWorkspaceState(repoRoot);

    assert.equal(updatedState.hasLocalChanges, false);
    assert.equal(updatedState.changeSummary.untracked, 0);
    assert.equal(updatedState.porcelain, '');
    assert.equal(updatedState.workspaceFingerprint, baseline.workspaceFingerprint);
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

test('workspace fingerprint falls back to consumed protocol files when git metadata is unavailable', () => {
  const repoRoot = mkdtempSync(join(tmpdir(), 'omegax-protocol-fallback-'));

  try {
    writeProtocolWorkspaceFile(repoRoot, 'idl/omegax_protocol.json', JSON.stringify({ version: '0.0.1' }));
    writeProtocolWorkspaceFile(
      repoRoot,
      'shared/protocol_contract.json',
      JSON.stringify({ instructions: ['set_pool_status'] }),
    );
    writeProtocolWorkspaceFile(repoRoot, 'e2e/support/surface_manifest.ts', 'export const manifest = ["pool"];');
    writeProtocolWorkspaceFile(repoRoot, 'e2e/localnet_protocol_surface.test.ts', 'export const smoke = true;');

    const firstState = readProtocolWorkspaceState(repoRoot);
    const secondState = readProtocolWorkspaceState(repoRoot);

    assert.equal(firstState.branch, null);
    assert.equal(firstState.commit, null);
    assert.equal(firstState.changeSummary.source, 'fallback');
    assert.equal(firstState.workspaceFingerprint, secondState.workspaceFingerprint);
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});
