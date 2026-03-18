import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const GENERATED_DIR_NAMES = new Set([
  '.cache',
  '.git',
  '.next',
  '.turbo',
  'artifacts',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'target',
]);

function gitOutput(repoRoot, args, options = {}) {
  try {
    return execFileSync('git', args, {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: options.encoding ?? 'utf8',
    });
  } catch {
    return null;
  }
}

function sha256Hex(input) {
  return createHash('sha256').update(input).digest('hex');
}

function splitNullDelimited(value) {
  if (!value) return [];
  const trimmed = value.endsWith('\0') ? value.slice(0, -1) : value;
  if (!trimmed) return [];
  return trimmed.split('\0').filter(Boolean);
}

function normalizeRelativePath(relativePath) {
  return relativePath.replaceAll('\\', '/');
}

function isGeneratedWorkspacePath(relativePath) {
  const normalized = normalizeRelativePath(relativePath);
  if (!normalized) return false;
  return normalized
    .split('/')
    .some((segment) => GENERATED_DIR_NAMES.has(segment));
}

function parsePorcelainPath(line) {
  const rawPath = line.slice(3).trim();
  if (!rawPath) return '';
  const renamedPath = rawPath.includes(' -> ')
    ? rawPath.slice(rawPath.lastIndexOf(' -> ') + 4)
    : rawPath;
  const unquotedPath = renamedPath.startsWith('"') && renamedPath.endsWith('"')
    ? renamedPath.slice(1, -1)
    : renamedPath;
  return normalizeRelativePath(unquotedPath);
}

function filterPorcelain(value) {
  return value
    .split('\n')
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .filter((line) => !isGeneratedWorkspacePath(parsePorcelainPath(line)))
    .join('\n');
}

function existingRegularFile(repoRoot, relativePath) {
  const absolutePath = resolve(repoRoot, relativePath);
  if (!existsSync(absolutePath)) return false;
  try {
    return statSync(absolutePath).isFile();
  } catch {
    return false;
  }
}

function gitPathList(repoRoot, args) {
  return splitNullDelimited(gitOutput(repoRoot, args, { encoding: 'utf8' }) ?? '')
    .map(normalizeRelativePath)
    .filter((relativePath) => relativePath.length > 0)
    .filter((relativePath) => !isGeneratedWorkspacePath(relativePath));
}

function trackedPathList(repoRoot, args) {
  return gitPathList(repoRoot, args);
}

function untrackedFileList(repoRoot, args) {
  return gitPathList(repoRoot, args)
    .filter((relativePath) => existingRegularFile(repoRoot, relativePath));
}

function summarizeWorkspaceChanges(repoRoot) {
  const stagedFiles = trackedPathList(repoRoot, ['diff', '--cached', '--name-only', '-z']);
  const unstagedFiles = trackedPathList(repoRoot, ['diff', '--name-only', '-z']);
  const untrackedFiles = untrackedFileList(repoRoot, ['ls-files', '--others', '--exclude-standard', '-z']);

  return {
    source: 'git',
    staged: stagedFiles.length,
    unstaged: unstagedFiles.length,
    untracked: untrackedFiles.length,
    tracked: new Set([...stagedFiles, ...unstagedFiles]).size,
  };
}

function computeTrackedDiff(repoRoot, commit) {
  if (!commit) return '';
  const changedTrackedFiles = Array.from(
    new Set(trackedPathList(repoRoot, ['diff', '--name-only', '-z', commit])),
  ).sort();
  if (changedTrackedFiles.length === 0) {
    return '';
  }

  return gitOutput(
    repoRoot,
    ['diff', '--no-ext-diff', '--binary', commit, '--', ...changedTrackedFiles],
    { encoding: 'utf8' },
  ) ?? '';
}

function computeUntrackedEntries(repoRoot) {
  return untrackedFileList(repoRoot, ['ls-files', '--others', '--exclude-standard', '-z'])
    .sort()
    .map((relativePath) => {
      const absolutePath = resolve(repoRoot, relativePath);
      const contentHash = sha256Hex(readFileSync(absolutePath));
      return `${relativePath}\0${contentHash}`;
    });
}

function fingerprintFromGitWorkspace(params) {
  const hash = createHash('sha256');
  hash.update('omegax-protocol-workspace-state-v1\0');
  hash.update(params.commit ?? 'unknown');
  hash.update('\0');
  hash.update(params.trackedDiff);
  hash.update('\0');
  for (const entry of params.untrackedEntries) {
    hash.update(entry);
    hash.update('\0');
  }
  return hash.digest('hex');
}

function fallbackWorkspaceFingerprint(repoRoot) {
  const paths = protocolWorkspacePaths(repoRoot);
  const consumedFiles = [
    ['idl/omegax_protocol.json', paths.idlPath],
    ['shared/protocol_contract.json', paths.contractPath],
    ['e2e/support/surface_manifest.ts', paths.manifestPath],
    ['e2e/localnet_protocol_surface.test.ts', paths.e2eTestPath],
  ]
    .filter(([, absolutePath]) => existsSync(absolutePath))
    .sort(([left], [right]) => left.localeCompare(right));

  const hash = createHash('sha256');
  hash.update('omegax-protocol-workspace-state-fallback-v1\0');
  for (const [relativePath, absolutePath] of consumedFiles) {
    hash.update(relativePath);
    hash.update('\0');
    hash.update(readFileSync(absolutePath));
    hash.update('\0');
  }
  return hash.digest('hex');
}

export function resolveProtocolRepo(cwd = process.cwd()) {
  return resolve(cwd, process.env.OMEGAX_PROTOCOL_REPO ?? '../omegax-protocol');
}

export function protocolWorkspacePaths(repoRoot) {
  return {
    repoRoot,
    idlPath: resolve(repoRoot, 'idl/omegax_protocol.json'),
    contractPath: resolve(repoRoot, 'shared/protocol_contract.json'),
    manifestPath: resolve(repoRoot, 'e2e/support/surface_manifest.ts'),
    e2eTestPath: resolve(repoRoot, 'e2e/localnet_protocol_surface.test.ts'),
    programSoPath: resolve(repoRoot, 'target/deploy/omegax_protocol.so'),
  };
}

export function ensureProtocolWorkspace(repoRoot) {
  const paths = protocolWorkspacePaths(repoRoot);
  if (!existsSync(paths.repoRoot)) {
    throw new Error(
      `Protocol repo not found at ${paths.repoRoot}. Set OMEGAX_PROTOCOL_REPO to your local omegax-protocol checkout.`,
    );
  }
  return paths;
}

export function readProtocolWorkspaceState(repoRoot) {
  const commit = (gitOutput(repoRoot, ['rev-parse', 'HEAD'], { encoding: 'utf8' }) ?? '').trim() || null;
  const branch = (gitOutput(repoRoot, ['rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8' }) ?? '').trim() || null;
  const porcelain = filterPorcelain(
    (gitOutput(repoRoot, ['status', '--short', '--untracked-files=all'], { encoding: 'utf8' }) ?? '').trim(),
  );

  if (commit || branch || porcelain) {
    const trackedDiff = computeTrackedDiff(repoRoot, commit);
    const untrackedEntries = computeUntrackedEntries(repoRoot);
    const changeSummary = summarizeWorkspaceChanges(repoRoot);

    return {
      branch,
      commit,
      hasLocalChanges: changeSummary.staged > 0 || changeSummary.unstaged > 0 || changeSummary.untracked > 0,
      workspaceFingerprint: fingerprintFromGitWorkspace({
        commit,
        trackedDiff,
        untrackedEntries,
      }),
      changeSummary,
      porcelain,
    };
  }

  return {
    branch: null,
    commit: null,
    hasLocalChanges: false,
    workspaceFingerprint: fallbackWorkspaceFingerprint(repoRoot),
    changeSummary: {
      source: 'fallback',
      staged: 0,
      unstaged: 0,
      untracked: 0,
      tracked: 0,
    },
    porcelain: '',
  };
}
