import bs58 from 'bs58';
import nacl from 'tweetnacl';

import {
  newId,
  nowIso,
  sha256Hex,
  stableStringify,
  toIsoString,
} from './utils.js';
import type {
  OracleKmsSignerAdapter,
  OracleSigner,
  OutcomeAttestation,
} from './types.js';

export type AttestOutcomeParams = {
  userId: string;
  cycleId: string;
  outcomeId: string;
  asOfIso: string;
  payload: Record<string, unknown>;
  signer: OracleSigner;
  submitAttestation?: (
    attestation: OutcomeAttestation,
  ) => Promise<{ txSignature?: string }>;
};

export type AttestOutcomeResult = {
  attestation: OutcomeAttestation;
  txSignature: string | null;
};

export function createOracleSignerFromEnv(params?: {
  keyIdEnv?: string;
  secretKeyBase58Env?: string;
}): OracleSigner {
  const keyIdEnv = params?.keyIdEnv ?? 'ORACLE_SIGNER_KEY_ID';
  const secretKeyEnv =
    params?.secretKeyBase58Env ?? 'ORACLE_SIGNER_SECRET_KEY_BASE58';
  const keyId = String(process.env[keyIdEnv] || '').trim();
  const secretKeyBase58 = String(process.env[secretKeyEnv] || '').trim();
  if (!keyId) {
    throw new Error(`Missing ${keyIdEnv}`);
  }
  if (!secretKeyBase58) {
    throw new Error(`Missing ${secretKeyEnv}`);
  }

  const secretKeyBytes = bs58.decode(secretKeyBase58);
  if (secretKeyBytes.length !== nacl.sign.secretKeyLength) {
    throw new Error(`Invalid secret key length for ${secretKeyEnv}`);
  }
  const publicKeyBytes = secretKeyBytes.slice(32);
  return {
    keyId,
    publicKeyBase58: bs58.encode(publicKeyBytes),
    sign: async (message) => nacl.sign.detached(message, secretKeyBytes),
  };
}

export function createOracleSignerFromKmsAdapter(
  adapter: OracleKmsSignerAdapter,
): OracleSigner {
  return {
    keyId: adapter.keyId,
    publicKeyBase58: adapter.publicKeyBase58,
    sign: (message) => adapter.signWithKms(message),
  };
}

function canonicalAttestationBody(params: {
  id: string;
  userId: string;
  cycleId: string;
  outcomeId: string;
  asOfIso: string;
  issuedAtIso: string;
  payload: Record<string, unknown>;
  verifierKeyId: string;
  verifierPublicKeyBase58: string;
}) {
  return {
    id: params.id,
    userId: params.userId,
    cycleId: params.cycleId,
    outcomeId: params.outcomeId,
    asOfIso: toIsoString(params.asOfIso),
    issuedAtIso: toIsoString(params.issuedAtIso),
    payload: params.payload,
    verifier: {
      keyId: params.verifierKeyId,
      publicKeyBase58: params.verifierPublicKeyBase58,
      algorithm: 'ed25519' as const,
    },
  };
}

export async function attestOutcome(
  params: AttestOutcomeParams,
): Promise<AttestOutcomeResult> {
  const id = newId('att');
  const issuedAtIso = nowIso();
  const body = canonicalAttestationBody({
    id,
    userId: params.userId,
    cycleId: params.cycleId,
    outcomeId: params.outcomeId,
    asOfIso: params.asOfIso,
    issuedAtIso,
    payload: params.payload,
    verifierKeyId: params.signer.keyId,
    verifierPublicKeyBase58: params.signer.publicKeyBase58,
  });
  const canonical = stableStringify(body);
  const message = new TextEncoder().encode(canonical);
  const signature = await params.signer.sign(message);
  const attestation: OutcomeAttestation = {
    ...body,
    signatureBase64: Buffer.from(signature).toString('base64'),
    digestHex: sha256Hex(message),
  };

  let txSignature: string | null = null;
  if (params.submitAttestation) {
    const result = await params.submitAttestation(attestation);
    txSignature =
      typeof result?.txSignature === 'string' ? result.txSignature : null;
  }

  return {
    attestation,
    txSignature,
  };
}
