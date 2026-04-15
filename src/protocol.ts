import BN from 'bn.js';
import { BorshCoder } from '@coral-xyz/anchor';
import {
  AddressLookupTableAccount,
  Connection,
  PublicKey,
  SystemProgram,
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
  deriveClaimAttestationPda,
  deriveOracleProfilePda,
  deriveOutcomeSchemaPda,
  derivePoolOracleApprovalPda,
  derivePoolOraclePermissionSetPda,
  derivePoolOraclePolicyPda,
  deriveSchemaDependencyLedgerPda,
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

function normalizeHex32(value: string, label: string): string {
  const normalized = value.trim().toLowerCase().replace(/^0x/, '');
  if (!/^[0-9a-f]{64}$/.test(normalized)) {
    throw new Error(`${label} must be a 32-byte hex string`);
  }
  return normalized;
}

function hexToFixedBytes(value: string, label: string): Uint8Array {
  return Uint8Array.from(Buffer.from(normalizeHex32(value, label), 'hex'));
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

function buildConvenienceTransaction(params: {
  instructionName: ProtocolInstructionName;
  feePayer: PublicKeyish;
  recentBlockhash: string;
  args: Record<string, unknown>;
  accounts: GenericInstructionAccounts;
  programId?: PublicKeyish;
}): Transaction {
  return buildProtocolTransaction({
    instructionName: params.instructionName,
    args: params.args,
    accounts: params.accounts,
    feePayer: params.feePayer,
    recentBlockhash: params.recentBlockhash,
    programId: params.programId,
  });
}

export function buildRegisterOracleTx(params: {
  admin: PublicKeyish;
  oracle: PublicKeyish;
  recentBlockhash: string;
  oracleType: number;
  displayName: string;
  legalName: string;
  websiteUrl: string;
  appUrl: string;
  logoUri: string;
  webhookUrl: string;
  supportedSchemaKeyHashesHex: string[];
  programId?: PublicKeyish;
}): Transaction {
  const admin = toPublicKey(params.admin);
  const oracle = toPublicKey(params.oracle);
  return buildConvenienceTransaction({
    instructionName: 'register_oracle',
    feePayer: admin,
    recentBlockhash: params.recentBlockhash,
    programId: params.programId,
    args: {
      oracle,
      oracle_type: params.oracleType,
      display_name: params.displayName,
      legal_name: params.legalName,
      website_url: params.websiteUrl,
      app_url: params.appUrl,
      logo_uri: params.logoUri,
      webhook_url: params.webhookUrl,
      supported_schema_key_hashes: params.supportedSchemaKeyHashesHex.map(
        (value) => Array.from(hexToFixedBytes(value, 'schema key hash')),
      ),
    },
    accounts: {
      admin,
      oracle_profile: deriveOracleProfilePda({
        oracle,
        programId: params.programId,
      }),
      system_program: SystemProgram.programId,
    },
  });
}

export function buildClaimOracleTx(params: {
  oracle: PublicKeyish;
  recentBlockhash: string;
  programId?: PublicKeyish;
}): Transaction {
  const oracle = toPublicKey(params.oracle);
  return buildConvenienceTransaction({
    instructionName: 'claim_oracle',
    feePayer: oracle,
    recentBlockhash: params.recentBlockhash,
    programId: params.programId,
    args: {},
    accounts: {
      oracle,
      oracle_profile: deriveOracleProfilePda({
        oracle,
        programId: params.programId,
      }),
    },
  });
}

export function buildUpdateOracleProfileTx(params: {
  authority: PublicKeyish;
  oracle: PublicKeyish;
  recentBlockhash: string;
  oracleType: number;
  displayName: string;
  legalName: string;
  websiteUrl: string;
  appUrl: string;
  logoUri: string;
  webhookUrl: string;
  supportedSchemaKeyHashesHex: string[];
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const oracle = toPublicKey(params.oracle);
  return buildConvenienceTransaction({
    instructionName: 'update_oracle_profile',
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    programId: params.programId,
    args: {
      oracle_type: params.oracleType,
      display_name: params.displayName,
      legal_name: params.legalName,
      website_url: params.websiteUrl,
      app_url: params.appUrl,
      logo_uri: params.logoUri,
      webhook_url: params.webhookUrl,
      supported_schema_key_hashes: params.supportedSchemaKeyHashesHex.map(
        (value) => Array.from(hexToFixedBytes(value, 'schema key hash')),
      ),
    },
    accounts: {
      authority,
      protocol_governance: deriveProtocolGovernancePda(
        params.programId ?? getProgramId(),
      ),
      oracle_profile: deriveOracleProfilePda({
        oracle,
        programId: params.programId,
      }),
    },
  });
}

export function buildSetPoolOracleTx(params: {
  authority: PublicKeyish;
  poolAddress: PublicKeyish;
  oracle: PublicKeyish;
  recentBlockhash: string;
  active: boolean;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const liquidityPool = toPublicKey(params.poolAddress);
  const oracle = toPublicKey(params.oracle);
  return buildConvenienceTransaction({
    instructionName: 'set_pool_oracle',
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    programId: params.programId,
    args: { active: params.active },
    accounts: {
      authority,
      protocol_governance: deriveProtocolGovernancePda(
        params.programId ?? getProgramId(),
      ),
      liquidity_pool: liquidityPool,
      oracle_profile: deriveOracleProfilePda({
        oracle,
        programId: params.programId,
      }),
      pool_oracle_approval: derivePoolOracleApprovalPda({
        liquidityPool,
        oracle,
        programId: params.programId,
      }),
      system_program: SystemProgram.programId,
    },
  });
}

export function buildSetPoolOraclePermissionsTx(params: {
  authority: PublicKeyish;
  poolAddress: PublicKeyish;
  oracle: PublicKeyish;
  permissions: number;
  recentBlockhash: string;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const liquidityPool = toPublicKey(params.poolAddress);
  const oracle = toPublicKey(params.oracle);
  return buildConvenienceTransaction({
    instructionName: 'set_pool_oracle_permissions',
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    programId: params.programId,
    args: { permissions: params.permissions },
    accounts: {
      authority,
      protocol_governance: deriveProtocolGovernancePda(
        params.programId ?? getProgramId(),
      ),
      liquidity_pool: liquidityPool,
      oracle_profile: deriveOracleProfilePda({
        oracle,
        programId: params.programId,
      }),
      pool_oracle_approval: derivePoolOracleApprovalPda({
        liquidityPool,
        oracle,
        programId: params.programId,
      }),
      pool_oracle_permission_set: derivePoolOraclePermissionSetPda({
        liquidityPool,
        oracle,
        programId: params.programId,
      }),
      system_program: SystemProgram.programId,
    },
  });
}

export function buildSetPoolOraclePolicyTx(params: {
  authority: PublicKeyish;
  poolAddress: PublicKeyish;
  recentBlockhash: string;
  quorumM: number;
  quorumN: number;
  requireVerifiedSchema: boolean;
  oracleFeeBps: number;
  allowDelegateClaim: boolean;
  challengeWindowSecs: number;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const liquidityPool = toPublicKey(params.poolAddress);
  return buildConvenienceTransaction({
    instructionName: 'set_pool_oracle_policy',
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    programId: params.programId,
    args: {
      quorum_m: params.quorumM,
      quorum_n: params.quorumN,
      require_verified_schema: params.requireVerifiedSchema,
      oracle_fee_bps: params.oracleFeeBps,
      allow_delegate_claim: params.allowDelegateClaim,
      challenge_window_secs: params.challengeWindowSecs,
    },
    accounts: {
      authority,
      protocol_governance: deriveProtocolGovernancePda(
        params.programId ?? getProgramId(),
      ),
      liquidity_pool: liquidityPool,
      pool_oracle_policy: derivePoolOraclePolicyPda({
        liquidityPool,
        programId: params.programId,
      }),
      system_program: SystemProgram.programId,
    },
  });
}

export function buildRegisterOutcomeSchemaTx(params: {
  publisher: PublicKeyish;
  recentBlockhash: string;
  schemaKeyHashHex: string;
  schemaKey: string;
  version: number;
  schemaHashHex: string;
  schemaFamily: number;
  visibility: number;
  metadataUri: string;
  programId?: PublicKeyish;
}): Transaction {
  const publisher = toPublicKey(params.publisher);
  const normalizedSchemaKeyHash = normalizeHex32(
    params.schemaKeyHashHex,
    'schema key hash',
  );
  return buildConvenienceTransaction({
    instructionName: 'register_outcome_schema',
    feePayer: publisher,
    recentBlockhash: params.recentBlockhash,
    programId: params.programId,
    args: {
      schema_key_hash: Array.from(
        hexToFixedBytes(normalizedSchemaKeyHash, 'schema key hash'),
      ),
      schema_key: params.schemaKey,
      version: params.version,
      schema_hash: Array.from(
        hexToFixedBytes(params.schemaHashHex, 'schema hash'),
      ),
      schema_family: params.schemaFamily,
      visibility: params.visibility,
      metadata_uri: params.metadataUri,
    },
    accounts: {
      publisher,
      outcome_schema: deriveOutcomeSchemaPda({
        schemaKeyHashHex: normalizedSchemaKeyHash,
        programId: params.programId,
      }),
      schema_dependency_ledger: deriveSchemaDependencyLedgerPda({
        schemaKeyHashHex: normalizedSchemaKeyHash,
        programId: params.programId,
      }),
      system_program: SystemProgram.programId,
    },
  });
}

export function buildVerifyOutcomeSchemaTx(params: {
  governanceAuthority: PublicKeyish;
  recentBlockhash: string;
  schemaKeyHashHex: string;
  verified: boolean;
  programId?: PublicKeyish;
}): Transaction {
  const governanceAuthority = toPublicKey(params.governanceAuthority);
  const normalizedSchemaKeyHash = normalizeHex32(
    params.schemaKeyHashHex,
    'schema key hash',
  );
  return buildConvenienceTransaction({
    instructionName: 'verify_outcome_schema',
    feePayer: governanceAuthority,
    recentBlockhash: params.recentBlockhash,
    programId: params.programId,
    args: {
      verified: params.verified,
    },
    accounts: {
      governance_authority: governanceAuthority,
      protocol_governance: deriveProtocolGovernancePda(
        params.programId ?? getProgramId(),
      ),
      outcome_schema: deriveOutcomeSchemaPda({
        schemaKeyHashHex: normalizedSchemaKeyHash,
        programId: params.programId,
      }),
    },
  });
}

export function buildBackfillSchemaDependencyLedgerTx(params: {
  governanceAuthority: PublicKeyish;
  recentBlockhash: string;
  schemaKeyHashHex: string;
  poolRuleAddresses: PublicKeyish[];
  programId?: PublicKeyish;
}): Transaction {
  const governanceAuthority = toPublicKey(params.governanceAuthority);
  const normalizedSchemaKeyHash = normalizeHex32(
    params.schemaKeyHashHex,
    'schema key hash',
  );
  return buildConvenienceTransaction({
    instructionName: 'backfill_schema_dependency_ledger',
    feePayer: governanceAuthority,
    recentBlockhash: params.recentBlockhash,
    programId: params.programId,
    args: {
      schema_key_hash: Array.from(
        hexToFixedBytes(normalizedSchemaKeyHash, 'schema key hash'),
      ),
      pool_rule_addresses: params.poolRuleAddresses.map((value) =>
        toPublicKey(value),
      ),
    },
    accounts: {
      governance_authority: governanceAuthority,
      protocol_governance: deriveProtocolGovernancePda(
        params.programId ?? getProgramId(),
      ),
      outcome_schema: deriveOutcomeSchemaPda({
        schemaKeyHashHex: normalizedSchemaKeyHash,
        programId: params.programId,
      }),
      schema_dependency_ledger: deriveSchemaDependencyLedgerPda({
        schemaKeyHashHex: normalizedSchemaKeyHash,
        programId: params.programId,
      }),
      system_program: SystemProgram.programId,
    },
  });
}

export function buildCloseOutcomeSchemaTx(params: {
  governanceAuthority: PublicKeyish;
  recipientSystemAccount: PublicKeyish;
  recentBlockhash: string;
  schemaKeyHashHex: string;
  programId?: PublicKeyish;
}): Transaction {
  const governanceAuthority = toPublicKey(params.governanceAuthority);
  const normalizedSchemaKeyHash = normalizeHex32(
    params.schemaKeyHashHex,
    'schema key hash',
  );
  return buildConvenienceTransaction({
    instructionName: 'close_outcome_schema',
    feePayer: governanceAuthority,
    recentBlockhash: params.recentBlockhash,
    programId: params.programId,
    args: {},
    accounts: {
      governance_authority: governanceAuthority,
      protocol_governance: deriveProtocolGovernancePda(
        params.programId ?? getProgramId(),
      ),
      outcome_schema: deriveOutcomeSchemaPda({
        schemaKeyHashHex: normalizedSchemaKeyHash,
        programId: params.programId,
      }),
      schema_dependency_ledger: deriveSchemaDependencyLedgerPda({
        schemaKeyHashHex: normalizedSchemaKeyHash,
        programId: params.programId,
      }),
      recipient_system_account: toPublicKey(params.recipientSystemAccount),
    },
  });
}

export const CLAIM_ATTESTATION_DECISION_SUPPORT_APPROVE = 0;
export const CLAIM_ATTESTATION_DECISION_SUPPORT_DENY = 1;
export const CLAIM_ATTESTATION_DECISION_REQUEST_REVIEW = 2;
export const CLAIM_ATTESTATION_DECISION_ABSTAIN = 3;

function assertValidClaimAttestationDecision(decision: number): void {
  if (
    decision !== CLAIM_ATTESTATION_DECISION_SUPPORT_APPROVE &&
    decision !== CLAIM_ATTESTATION_DECISION_SUPPORT_DENY &&
    decision !== CLAIM_ATTESTATION_DECISION_REQUEST_REVIEW &&
    decision !== CLAIM_ATTESTATION_DECISION_ABSTAIN
  ) {
    throw new Error(
      'claim attestation decision must be one of 0 (approve), 1 (deny), 2 (review), or 3 (abstain)',
    );
  }
}

export function buildAttestClaimCaseTx(params: {
  oracle: PublicKeyish;
  claimCaseAddress: PublicKeyish;
  recentBlockhash: string;
  decision: number;
  attestationHashHex: string;
  attestationRefHashHex?: string | null;
  schemaKeyHashHex: string;
  programId?: PublicKeyish;
}): Transaction {
  const oracle = toPublicKey(params.oracle);
  const claimCase = toPublicKey(params.claimCaseAddress);
  assertValidClaimAttestationDecision(params.decision);
  const attestationHash = normalizeHex32(
    params.attestationHashHex,
    'attestation hash',
  );
  const attestationRefHash = normalizeHex32(
    params.attestationRefHashHex ?? '0'.repeat(64),
    'attestation ref hash',
  );
  const schemaKeyHash = normalizeHex32(
    params.schemaKeyHashHex,
    'schema key hash',
  );
  return buildConvenienceTransaction({
    instructionName: 'attest_claim_case',
    feePayer: oracle,
    recentBlockhash: params.recentBlockhash,
    programId: params.programId,
    args: {
      decision: params.decision,
      attestation_hash: Array.from(hexToFixedBytes(attestationHash, 'attestation hash')),
      attestation_ref_hash: Array.from(
        hexToFixedBytes(attestationRefHash, 'attestation ref hash'),
      ),
      schema_key_hash: Array.from(hexToFixedBytes(schemaKeyHash, 'schema key hash')),
    },
    accounts: {
      oracle,
      oracle_profile: deriveOracleProfilePda({
        oracle,
        programId: params.programId,
      }),
      claim_case: claimCase,
      outcome_schema: deriveOutcomeSchemaPda({
        schemaKeyHashHex: schemaKeyHash,
        programId: params.programId,
      }),
      claim_attestation: deriveClaimAttestationPda({
        claimCase,
        oracle,
        programId: params.programId,
      }),
      system_program: SystemProgram.programId,
    },
  });
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
