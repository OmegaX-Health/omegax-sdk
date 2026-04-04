#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const DEFAULT_IDL_SOURCE = '../omegax-protocol/idl/omegax_protocol.json';
const DEFAULT_CONTRACT_JSON_SOURCE =
  '../omegax-protocol/shared/protocol_contract.json';
const DEFAULT_CONTRACT_TS_SOURCE =
  '../omegax-protocol/frontend/lib/generated/protocol-contract.ts';

const IDL_OUTPUTS = [
  'tests/fixtures/omegax_protocol.idl.json',
  'src/generated/omegax_protocol.idl.json',
];
const CONTRACT_TS_OUTPUT = 'src/generated/protocol_contract.ts';
const TYPES_OUTPUT = 'src/generated/protocol_types.ts';

function parseFlag(name, fallback = null) {
  const match = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  if (!match) return fallback;
  return match.slice(name.length + 3).trim();
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

function sha256Hex(value) {
  return createHash('sha256').update(value).digest('hex');
}

function pascalCase(value) {
  return String(value)
    .trim()
    .split('_')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');
}

function renderIdlType(type, mode) {
  if (typeof type === 'string') {
    switch (type) {
      case 'bool':
        return 'boolean';
      case 'pubkey':
        return mode === 'decoded' ? 'string' : 'PublicKeyish';
      case 'u8':
      case 'u16':
      case 'u32':
        return 'number';
      case 'u64':
      case 'i64':
        return 'BigNumberish';
      case 'string':
        return 'string';
      default:
        return 'unknown';
    }
  }

  if (type.array) {
    const [innerType] = type.array;
    if (innerType === 'u8') {
      return 'Uint8Array | number[]';
    }
    return `ReadonlyArray<${renderIdlType(innerType, mode)}>`;
  }

  if (type.option) {
    return `${renderIdlType(type.option, mode)} | null`;
  }

  if (type.vec) {
    return `Array<${renderIdlType(type.vec, mode)}>`;
  }

  if (type.defined?.name) {
    return type.defined.name;
  }

  return 'unknown';
}

function renderStructInterface(name, fields, mode) {
  const body = fields
    .map((field) => `  ${field.name}: ${renderIdlType(field.type, mode)};`)
    .join('\n');
  return `export interface ${name} {\n${body}\n}`;
}

function renderAccountInterface(instructionName, accounts) {
  const interfaceName = `${pascalCase(instructionName)}Accounts`;
  const body = accounts
    .map((account) => {
      const optional = Boolean(account.optional || account.address);
      return `  ${account.name}${optional ? '?' : ''}: PublicKeyish;`;
    })
    .join('\n');
  return `export interface ${interfaceName} {\n${body}\n}`;
}

function renderInstructionMethods(contract, idl) {
  const argsByInstruction = new Map(
    (idl.instructions ?? []).map((instruction) => [
      instruction.name,
      instruction.args?.[0]?.type?.defined?.name ?? 'Record<string, unknown>',
    ]),
  );

  return contract.instructions
    .map((instruction) => {
      const pascalName = pascalCase(instruction.name);
      const argsType =
        argsByInstruction.get(instruction.name) ?? 'Record<string, unknown>';
      const accountsType = `${pascalName}Accounts`;

      return [
        `  build${pascalName}Instruction(`,
        `    params: BuildInstructionParams<${argsType}, ${accountsType}>,`,
        '  ): TransactionInstruction;',
        `  build${pascalName}Tx(`,
        `    params: BuildTransactionParams<${argsType}, ${accountsType}>,`,
        '  ): Transaction;',
      ].join('\n');
    })
    .join('\n');
}

function renderReaderMethods(accountNames) {
  return accountNames
    .map((accountName) => {
      if (accountName === 'ProtocolGovernance') {
        return [
          '  fetchProtocolGovernance(',
          '    address?: PublicKeyish,',
          '  ): Promise<ProtocolGovernance | null>;',
        ].join('\n');
      }

      return [
        `  fetch${accountName}(`,
        '    address: PublicKeyish,',
        `  ): Promise<${accountName} | null>;`,
      ].join('\n');
    })
    .join('\n');
}

function renderGeneratedTypes(idl, contract) {
  const typeInterfaces = (idl.types ?? [])
    .map((entry) => {
      if (entry.type?.kind !== 'struct') {
        throw new Error(`Unsupported IDL type ${entry.name}: expected struct`);
      }
      return renderStructInterface(
        entry.name,
        entry.type.fields ?? [],
        entry.name.endsWith('Args') ? 'input' : 'decoded',
      );
    })
    .join('\n\n');

  const accountInterfaces = contract.instructions
    .map((instruction) =>
      renderAccountInterface(instruction.name, instruction.accounts ?? []),
    )
    .join('\n\n');

  const accountNames = Object.keys(contract.accountDiscriminators).sort();
  const accountNameUnion = accountNames
    .map((accountName) => `  | ${JSON.stringify(accountName)}`)
    .join('\n');

  return `// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// source: omegax_protocol idl + protocol contract

import type {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

import type { ProtocolInstructionName } from './protocol_contract.js';

export type PublicKeyish = PublicKey | string;
export type BigNumberish = bigint | number | string;

export type ProtocolAccountName =
${accountNameUnion};

export type GenericInstructionAccounts = Record<string, PublicKeyish | undefined>;

export interface BuildInstructionParams<Args, Accounts> {
  args: Args;
  accounts: Accounts;
  programId?: PublicKeyish;
}

export interface BuildTransactionParams<Args, Accounts>
  extends BuildInstructionParams<Args, Accounts> {
  recentBlockhash: string;
  feePayer?: PublicKeyish;
  prependInstructions?: TransactionInstruction[];
  appendInstructions?: TransactionInstruction[];
}

${typeInterfaces}

${accountInterfaces}

export interface ProtocolClient {
  readonly connection: Connection;
  readonly programId: PublicKey;
  getProgramId(): PublicKey;
  buildInstruction(
    params: BuildInstructionParams<Record<string, unknown>, GenericInstructionAccounts> & {
      instructionName: ProtocolInstructionName;
    },
  ): TransactionInstruction;
  buildTransaction(
    params: BuildTransactionParams<Record<string, unknown>, GenericInstructionAccounts> & {
      instructionName: ProtocolInstructionName;
    },
  ): Transaction;
  decodeAccount<T = Record<string, unknown>>(
    accountName: ProtocolAccountName,
    data: Buffer | Uint8Array,
  ): T;
  fetchAccount<T = Record<string, unknown>>(
    accountName: ProtocolAccountName,
    address: PublicKeyish,
  ): Promise<T | null>;
${renderInstructionMethods(contract, idl)}
${renderReaderMethods(accountNames)}
}
`;
}

async function writeNormalizedJson(destinationPath, value) {
  await mkdir(dirname(destinationPath), { recursive: true });
  await writeFile(
    destinationPath,
    `${JSON.stringify(value, null, 2)}\n`,
    'utf8',
  );
}

async function main() {
  const idlSourcePath = resolve(
    parseFlag(
      'source',
      process.env.OMEGAX_PROTOCOL_IDL_PATH ?? DEFAULT_IDL_SOURCE,
    ),
  );
  const contractJsonSourcePath = resolve(
    parseFlag(
      'contract-json',
      process.env.OMEGAX_PROTOCOL_CONTRACT_PATH ?? DEFAULT_CONTRACT_JSON_SOURCE,
    ),
  );
  const contractTsSourcePath = resolve(
    parseFlag(
      'contract-ts',
      process.env.OMEGAX_PROTOCOL_CONTRACT_TS_PATH ??
        DEFAULT_CONTRACT_TS_SOURCE,
    ),
  );

  if (!existsSync(idlSourcePath)) {
    throw new Error(`Source IDL not found at ${idlSourcePath}.`);
  }
  if (!existsSync(contractJsonSourcePath)) {
    throw new Error(
      `Source protocol contract JSON not found at ${contractJsonSourcePath}.`,
    );
  }
  if (!existsSync(contractTsSourcePath)) {
    throw new Error(
      `Source protocol contract TS not found at ${contractTsSourcePath}.`,
    );
  }

  const [idlRaw, contractJsonRaw, contractTsRaw] = await Promise.all([
    readFile(idlSourcePath, 'utf8'),
    readFile(contractJsonSourcePath, 'utf8'),
    readFile(contractTsSourcePath, 'utf8'),
  ]);

  const idl = JSON.parse(idlRaw);
  const contract = JSON.parse(contractJsonRaw);

  if (!Array.isArray(idl?.instructions)) {
    throw new Error(
      `Source file at ${idlSourcePath} is not a valid Anchor IDL.`,
    );
  }
  if (!Array.isArray(contract?.instructions)) {
    throw new Error(
      `Source file at ${contractJsonSourcePath} is not a valid protocol contract.`,
    );
  }

  for (const outputPath of IDL_OUTPUTS) {
    await writeNormalizedJson(resolve(outputPath), idl);
  }

  await mkdir(dirname(resolve(CONTRACT_TS_OUTPUT)), { recursive: true });
  await writeFile(resolve(CONTRACT_TS_OUTPUT), contractTsRaw, 'utf8');
  await writeFile(
    resolve(TYPES_OUTPUT),
    renderGeneratedTypes(idl, contract),
    'utf8',
  );

  const fixtureBuffer = await readFile(resolve(IDL_OUTPUTS[0]));
  const sourceRepoRoot = findGitRoot(dirname(idlSourcePath));
  const sourceCommit = readGitCommit(sourceRepoRoot);

  console.log(`Synced IDL outputs: ${IDL_OUTPUTS.join(', ')}`);
  console.log(`Synced protocol contract TS: ${CONTRACT_TS_OUTPUT}`);
  console.log(`Generated protocol types: ${TYPES_OUTPUT}`);
  console.log(`IDL source: ${idlSourcePath}`);
  console.log(`Contract source: ${contractJsonSourcePath}`);
  if (sourceCommit) {
    console.log(`Source commit: ${sourceCommit}`);
  }
  console.log(`Fixture sha256: ${sha256Hex(fixtureBuffer)}`);
  console.log(`Instructions: ${idl.instructions.length}`);
  console.log(`Accounts: ${idl.accounts?.length ?? 0}`);
  console.log(`Types: ${idl.types?.length ?? 0}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
