import BN from 'bn.js';
import { BorshCoder } from '@coral-xyz/anchor';
import {
  AddressLookupTableAccount,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';

import protocolIdl from './generated/omegax_protocol.idl.json' with { type: 'json' };
import {
  PROTOCOL_ACCOUNT_DISCRIMINATORS,
  PROTOCOL_INSTRUCTION_ACCOUNTS,
  PROTOCOL_INSTRUCTION_DISCRIMINATORS,
  PROTOCOL_PROGRAM_ID,
  type ProtocolInstructionAccount,
  type ProtocolInstructionName,
} from './generated/protocol_contract.js';
import type {
  BuildInstructionParams,
  BuildTransactionParams,
  GenericInstructionAccounts,
  ProtocolAccountName,
  ProtocolClient,
  PublicKeyish,
} from './generated/protocol_types.js';
import {
  deriveProtocolGovernancePda,
  getProgramId,
  toPublicKey,
} from './protocol_seeds.js';

type IdlField = { name: string; type: IdlType };
type IdlType =
  | string
  | { option: IdlType }
  | { vec: IdlType }
  | { array: [IdlType, number] }
  | { defined: { name: string } };

type IdlStruct = {
  kind: 'struct';
  fields?: IdlField[];
};

type IdlTypeEntry = {
  name: string;
  type: IdlStruct;
};

type IdlInstructionEntry = {
  name: string;
  args?: Array<{
    name: string;
    type: IdlType;
  }>;
};

const CODER = new BorshCoder(protocolIdl as never);
const TYPE_BY_NAME = new Map<string, IdlStruct>(
  ((protocolIdl as { types?: IdlTypeEntry[] }).types ?? []).map((entry) => [
    entry.name,
    entry.type,
  ]),
);
const ARG_TYPE_BY_INSTRUCTION = new Map<string, IdlType | null>(
  (
    (protocolIdl as { instructions?: IdlInstructionEntry[] }).instructions ?? []
  ).map((instruction) => [
    instruction.name,
    instruction.args?.[0]?.type ?? null,
  ]),
);

export const PROTOCOL_IDL_VERSION = ((
  protocolIdl as { metadata?: { version?: string }; version?: string }
).metadata?.version ??
  (protocolIdl as { version?: string }).version ??
  'unknown') as string;

function pascalCase(value: string): string {
  return value
    .split('_')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');
}

function snakeToCamel(value: string): string {
  return value.replace(/_([a-z])/g, (_match, letter: string) =>
    letter.toUpperCase(),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isBnLike(
  value: unknown,
): value is { toString: (radix?: number) => string } {
  return (
    value !== null &&
    typeof value === 'object' &&
    (value as { constructor?: { name?: string } }).constructor?.name === 'BN' &&
    typeof (value as { toString?: unknown }).toString === 'function'
  );
}

function readFieldValue(
  record: Record<string, unknown>,
  fieldName: string,
): unknown {
  if (fieldName in record) {
    return record[fieldName];
  }

  const camelName = snakeToCamel(fieldName);
  if (camelName in record) {
    return record[camelName];
  }

  return undefined;
}

function requireStruct(typeName: string): IdlStruct {
  const type = TYPE_BY_NAME.get(typeName);
  if (!type || type.kind !== 'struct') {
    throw new Error(
      `Unsupported or missing IDL struct definition for ${typeName}`,
    );
  }
  return type;
}

function normalizeInputValue(type: IdlType, value: unknown): unknown {
  if (typeof type === 'string') {
    switch (type) {
      case 'pubkey':
        return toPublicKey(value as PublicKeyish);
      case 'u64':
      case 'i64':
        if (value instanceof BN) return value;
        if (typeof value === 'bigint') return new BN(value.toString());
        if (typeof value === 'number')
          return new BN(Math.trunc(value).toString());
        return new BN(String(value ?? 0));
      case 'u8':
      case 'u16':
      case 'u32':
        return Number(value ?? 0);
      case 'bool':
        return Boolean(value);
      case 'string':
        return String(value ?? '');
      default:
        return value;
    }
  }

  if ('array' in type) {
    const [innerType] = type.array;
    const raw =
      value instanceof Uint8Array
        ? [...value]
        : Array.from((value ?? []) as Iterable<number>);
    if (innerType === 'u8') {
      return raw.map((entry) => Number(entry));
    }
    return raw.map((entry) => normalizeInputValue(innerType, entry));
  }

  if ('option' in type) {
    if (value === null || value === undefined) return null;
    return normalizeInputValue(type.option, value);
  }

  if ('vec' in type) {
    return Array.from((value ?? []) as Iterable<unknown>).map((entry) =>
      normalizeInputValue(type.vec, entry),
    );
  }

  if ('defined' in type) {
    const struct = requireStruct(type.defined.name);
    const record = isRecord(value) ? value : {};
    const normalized: Record<string, unknown> = {};

    for (const field of struct.fields ?? []) {
      normalized[field.name] = normalizeInputValue(
        field.type,
        readFieldValue(record, field.name),
      );
    }

    return normalized;
  }

  return value;
}

function normalizeDecodedValue(type: IdlType, value: unknown): unknown {
  if (typeof type === 'string') {
    switch (type) {
      case 'pubkey':
        return value instanceof PublicKey
          ? value.toBase58()
          : String(value ?? '');
      case 'u64':
      case 'i64':
        if (typeof value === 'bigint') return value;
        if (typeof value === 'number') return BigInt(Math.trunc(value));
        if (typeof value === 'string') return BigInt(value);
        if (isBnLike(value)) return BigInt(value.toString(10));
        return 0n;
      default:
        return value;
    }
  }

  if ('array' in type) {
    if (value instanceof Uint8Array) {
      return value;
    }
    if (Array.isArray(value)) {
      return Uint8Array.from(
        value.map((entry) =>
          typeof entry === 'number'
            ? entry
            : Number(normalizeDecodedValue(type.array[0], entry)),
        ),
      );
    }
    return new Uint8Array();
  }

  if ('option' in type) {
    if (value === null || value === undefined) return null;
    return normalizeDecodedValue(type.option, value);
  }

  if ('vec' in type) {
    return Array.isArray(value)
      ? value.map((entry) => normalizeDecodedValue(type.vec, entry))
      : [];
  }

  if ('defined' in type) {
    const struct = requireStruct(type.defined.name);
    const record = isRecord(value) ? value : {};
    const normalized: Record<string, unknown> = {};

    for (const field of struct.fields ?? []) {
      normalized[field.name] = normalizeDecodedValue(
        field.type,
        readFieldValue(record, field.name),
      );
    }

    return normalized;
  }

  return value;
}

function resolveInstructionAccounts(
  instructionName: ProtocolInstructionName,
  accounts: GenericInstructionAccounts,
): Array<{ pubkey: PublicKey; isSigner: boolean; isWritable: boolean }> {
  return (PROTOCOL_INSTRUCTION_ACCOUNTS[instructionName] ?? []).flatMap(
    (
      account,
    ): Array<{ pubkey: PublicKey; isSigner: boolean; isWritable: boolean }> => {
      if (account.address) {
        return [
          {
            pubkey: new PublicKey(account.address),
            isSigner: account.signer,
            isWritable: account.writable,
          },
        ];
      }

      const value = accounts[account.name];
      if (value === undefined || value === null) {
        if (account.optional) {
          return [
            {
              pubkey: toPublicKey(PROTOCOL_PROGRAM_ID),
              isSigner: false,
              isWritable: false,
            },
          ];
        }
        throw new Error(
          `Missing required account "${account.name}" for instruction ${instructionName}`,
        );
      }

      return [
        {
          pubkey: toPublicKey(value),
          isSigner: account.signer,
          isWritable: account.writable,
        },
      ];
    },
  );
}

function inferFeePayer(
  instructionName: ProtocolInstructionName,
  accounts: GenericInstructionAccounts,
): PublicKey {
  const signer = (PROTOCOL_INSTRUCTION_ACCOUNTS[instructionName] ?? []).find(
    (account) => account.signer && !account.address,
  );
  if (!signer) {
    throw new Error(
      `Unable to infer fee payer for ${instructionName}. Pass feePayer explicitly.`,
    );
  }

  const signerAddress = accounts[signer.name];
  if (!signerAddress) {
    throw new Error(
      `Unable to infer fee payer for ${instructionName}: signer account "${signer.name}" is missing.`,
    );
  }

  return toPublicKey(signerAddress);
}

export function getProtocolIdl() {
  return protocolIdl;
}

export function listProtocolInstructionNames(): ProtocolInstructionName[] {
  return Object.keys(
    PROTOCOL_INSTRUCTION_DISCRIMINATORS,
  ) as ProtocolInstructionName[];
}

export function listProtocolInstructionAccounts(
  instructionName: ProtocolInstructionName,
): ProtocolInstructionAccount[] {
  return PROTOCOL_INSTRUCTION_ACCOUNTS[instructionName] ?? [];
}

export function listProtocolAccountNames(): ProtocolAccountName[] {
  return Object.keys(
    PROTOCOL_ACCOUNT_DISCRIMINATORS,
  ).sort() as ProtocolAccountName[];
}

export async function accountExists(
  connection: Connection,
  address: PublicKeyish,
): Promise<boolean> {
  const info = await connection.getAccountInfo(
    toPublicKey(address),
    'confirmed',
  );
  return info !== null;
}

export function decodeProtocolAccount<T = Record<string, unknown>>(
  accountName: ProtocolAccountName,
  data: Buffer | Uint8Array,
): T {
  const decoded = CODER.accounts.decode(
    accountName,
    Buffer.from(data),
  ) as unknown;
  const normalized = normalizeDecodedValue(
    { defined: { name: accountName } },
    decoded,
  );
  return normalized as T;
}

export function buildProtocolInstruction(
  params: BuildInstructionParams<
    Record<string, unknown>,
    GenericInstructionAccounts
  > & {
    instructionName: ProtocolInstructionName;
  },
): TransactionInstruction {
  const instructionArgsType = ARG_TYPE_BY_INSTRUCTION.get(
    params.instructionName,
  );
  const normalizedArgs = instructionArgsType
    ? { args: normalizeInputValue(instructionArgsType, params.args) }
    : {};

  const encoded = CODER.instruction.encode(
    params.instructionName,
    normalizedArgs,
  );

  return new TransactionInstruction({
    programId: toPublicKey(params.programId ?? PROTOCOL_PROGRAM_ID),
    keys: resolveInstructionAccounts(params.instructionName, params.accounts),
    data: Buffer.from(encoded),
  });
}

export function buildProtocolTransaction(
  params: BuildTransactionParams<
    Record<string, unknown>,
    GenericInstructionAccounts
  > & {
    instructionName: ProtocolInstructionName;
  },
): Transaction {
  const transaction = new Transaction({
    feePayer: params.feePayer
      ? toPublicKey(params.feePayer)
      : inferFeePayer(params.instructionName, params.accounts),
    recentBlockhash: params.recentBlockhash,
  });

  for (const instruction of params.prependInstructions ?? []) {
    transaction.add(instruction);
  }

  transaction.add(
    buildProtocolInstruction({
      instructionName: params.instructionName,
      args: params.args,
      accounts: params.accounts,
      programId: params.programId,
    }),
  );

  for (const instruction of params.appendInstructions ?? []) {
    transaction.add(instruction);
  }

  return transaction;
}

export function compileTransactionToV0(
  transaction: Transaction,
  lookupTableAccounts: AddressLookupTableAccount[],
): VersionedTransaction {
  if (!transaction.feePayer) {
    throw new Error(
      'transaction fee payer is required to compile a v0 transaction',
    );
  }
  if (!transaction.recentBlockhash) {
    throw new Error(
      'transaction recentBlockhash is required to compile a v0 transaction',
    );
  }

  const message = new TransactionMessage({
    payerKey: transaction.feePayer,
    recentBlockhash: transaction.recentBlockhash,
    instructions: transaction.instructions,
  }).compileToV0Message(lookupTableAccounts);

  return new VersionedTransaction(message);
}

export function createProtocolClient(
  connection: Connection,
  programId: PublicKeyish = PROTOCOL_PROGRAM_ID,
): ProtocolClient {
  const resolvedProgramId = toPublicKey(programId);

  const client: Record<string, unknown> = {
    connection,
    programId: resolvedProgramId,
    getProgramId: () => resolvedProgramId,
    buildInstruction: (
      params: BuildInstructionParams<
        Record<string, unknown>,
        GenericInstructionAccounts
      > & {
        instructionName: ProtocolInstructionName;
      },
    ) =>
      buildProtocolInstruction({
        ...params,
        programId: params.programId ?? resolvedProgramId,
      }),
    buildTransaction: (
      params: BuildTransactionParams<
        Record<string, unknown>,
        GenericInstructionAccounts
      > & {
        instructionName: ProtocolInstructionName;
      },
    ) =>
      buildProtocolTransaction({
        ...params,
        programId: params.programId ?? resolvedProgramId,
      }),
    decodeAccount: <T = Record<string, unknown>>(
      accountName: ProtocolAccountName,
      data: Buffer | Uint8Array,
    ): T => decodeProtocolAccount<T>(accountName, data),
    async fetchAccount<T = Record<string, unknown>>(
      accountName: ProtocolAccountName,
      address: PublicKeyish,
    ): Promise<T | null> {
      const info = await connection.getAccountInfo(
        toPublicKey(address),
        'confirmed',
      );
      if (!info) return null;
      return decodeProtocolAccount<T>(accountName, info.data);
    },
  };

  for (const instructionName of listProtocolInstructionNames()) {
    const pascalName = pascalCase(instructionName);
    client[`build${pascalName}Instruction`] = (
      params: BuildInstructionParams<
        Record<string, unknown>,
        GenericInstructionAccounts
      >,
    ) =>
      buildProtocolInstruction({
        ...params,
        instructionName,
        programId: params.programId ?? resolvedProgramId,
      });

    client[`build${pascalName}Tx`] = (
      params: BuildTransactionParams<
        Record<string, unknown>,
        GenericInstructionAccounts
      >,
    ) =>
      buildProtocolTransaction({
        ...params,
        instructionName,
        programId: params.programId ?? resolvedProgramId,
      });
  }

  for (const accountName of listProtocolAccountNames()) {
    if (accountName === 'ProtocolGovernance') {
      client.fetchProtocolGovernance = async (
        address?: PublicKeyish,
      ): Promise<Record<string, unknown> | null> => {
        const resolvedAddress =
          address ?? deriveProtocolGovernancePda(resolvedProgramId);
        const info = await connection.getAccountInfo(
          toPublicKey(resolvedAddress),
          'confirmed',
        );
        if (!info) return null;
        return decodeProtocolAccount('ProtocolGovernance', info.data);
      };
      continue;
    }

    client[`fetch${accountName}`] = async (
      address: PublicKeyish,
    ): Promise<Record<string, unknown> | null> => {
      const info = await connection.getAccountInfo(
        toPublicKey(address),
        'confirmed',
      );
      if (!info) return null;
      return decodeProtocolAccount(accountName, info.data);
    };
  }

  return client as unknown as ProtocolClient;
}

export {
  PROTOCOL_ACCOUNT_DISCRIMINATORS,
  PROTOCOL_INSTRUCTION_ACCOUNTS,
  PROTOCOL_INSTRUCTION_DISCRIMINATORS,
  PROTOCOL_PROGRAM_ID,
  getProgramId,
};
