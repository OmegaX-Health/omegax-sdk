#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { execSync } from 'node:child_process';

function parseSourceFromArgs() {
  const sourceFlag = process.argv.find((arg) => arg.startsWith('--source='));
  if (!sourceFlag) return null;
  return sourceFlag.slice('--source='.length).trim();
}

function findGitRoot(startPath) {
  let current = resolve(startPath);
  while (current !== dirname(current)) {
    if (existsSync(resolve(current, '.git'))) {
      return current;
    }
    current = dirname(current);
  }
  return null;
}

function readGitCommit(repoRoot) {
  if (!repoRoot) return null;
  try {
    return execSync('git rev-parse HEAD', {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
    }).trim();
  } catch {
    return null;
  }
}

async function main() {
  const sourcePath = resolve(
    parseSourceFromArgs()
      ?? process.env.OMEGAX_PROTOCOL_IDL_PATH
      ?? '../omegax-protocol/idl/omegax_protocol.json',
  );
  const destinationPath = resolve('tests/fixtures/omegax_protocol.idl.json');

  if (!existsSync(sourcePath)) {
    throw new Error(
      `Source IDL not found at ${sourcePath}. Pass --source=<path> or set OMEGAX_PROTOCOL_IDL_PATH.`,
    );
  }

  const sourceBuffer = await readFile(sourcePath);
  const parsed = JSON.parse(sourceBuffer.toString('utf8'));
  if (!Array.isArray(parsed?.instructions)) {
    throw new Error(`Source file at ${sourcePath} is not a valid Anchor IDL (missing instructions array).`);
  }

  await mkdir(dirname(destinationPath), { recursive: true });
  await writeFile(destinationPath, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8');

  const fixtureBuffer = await readFile(destinationPath);
  const sha256 = createHash('sha256').update(fixtureBuffer).digest('hex');
  const sourceRepoRoot = findGitRoot(dirname(sourcePath));
  const sourceCommit = readGitCommit(sourceRepoRoot);

  console.log(`Synced IDL fixture: ${destinationPath}`);
  console.log(`Source: ${sourcePath}`);
  if (sourceCommit) {
    console.log(`Source commit: ${sourceCommit}`);
  }
  console.log(`Fixture sha256: ${sha256}`);
  console.log(`Instructions: ${parsed.instructions.length}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
