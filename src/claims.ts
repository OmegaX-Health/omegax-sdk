import nacl from 'tweetnacl';
import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

import type {
  BuildUnsignedClaimTxParams,
  BuildUnsignedRewardClaimTxParams,
  ClaimFailureCode,
  ClaimFailureDetail,
  ClaimIntent,
  RewardClaimIntent,
  ValidateSignedClaimTxReason,
  ValidateSignedClaimTxParams,
  ValidateSignedClaimTxResult,
} from './types.js';
import {
  anchorDiscriminator,
  encodeU64Le,
  fromHex,
  hashStringTo32,
} from './utils.js';
import {
  decodeSolanaTransaction,
  type SolanaTransaction,
  solanaTransactionFirstSignature,
  solanaTransactionIntentMessageBytes,
  solanaTransactionMessageBytes,
  solanaTransactionRequiredSigner,
  solanaTransactionSignerSignature,
} from './transactions.js';
import {
  deriveClaimDelegatePda,
  deriveClaimPda,
  deriveClaimV2Pda,
  deriveConfigV2Pda,
  deriveOutcomeAggregatePda,
  derivePoolOraclePolicyPda,
  derivePoolTermsPda,
  deriveCycleWindowPda,
  deriveCycleOutcomePda,
  deriveMembershipPda,
} from './protocol_seeds.js';

const SUBMIT_CLAIM_DISCRIMINATOR = anchorDiscriminator('global', 'submit_claim');
const SUBMIT_REWARD_CLAIM_DISCRIMINATOR = anchorDiscriminator('global', 'submit_reward_claim');

function bytesEqual(left: Uint8Array, right: Uint8Array): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function validateRewardClaimOptionalAccounts(params: {
  poolAssetVault?: string;
  poolVaultTokenAccount?: string;
  recipientTokenAccount?: string;
}): void {
  const providedCount = [
    params.poolAssetVault,
    params.poolVaultTokenAccount,
    params.recipientTokenAccount,
  ].filter((value) => typeof value === 'string' && value.length > 0).length;

  if (providedCount !== 0 && providedCount !== 3) {
    throw new Error(
      'poolAssetVault, poolVaultTokenAccount, and recipientTokenAccount must be provided together',
    );
  }
}

function serializeSubmitClaimPayload(params: BuildUnsignedClaimTxParams): Buffer {
  const cycleHash = hashStringTo32(params.cycleId);
  const intentHash = hashStringTo32(params.intentId);
  return Buffer.concat([
    SUBMIT_CLAIM_DISCRIMINATOR,
    Buffer.from(cycleHash),
    Buffer.from(intentHash),
  ]);
}

function serializeSubmitRewardClaimPayload(params: BuildUnsignedRewardClaimTxParams): Buffer {
  const cycleHash = hashStringTo32(params.cycleId);
  const ruleHash = fromHex(params.ruleHashHex, 32);
  const intentHash = fromHex(params.intentHashHex, 32);
  return Buffer.concat([
    SUBMIT_REWARD_CLAIM_DISCRIMINATOR,
    new PublicKey(params.member).toBuffer(),
    Buffer.from(cycleHash),
    Buffer.from(ruleHash),
    Buffer.from(intentHash),
    encodeU64Le(params.payoutAmount),
    new PublicKey(params.recipient).toBuffer(),
  ]);
}

export function buildUnsignedClaimTx(
  params: BuildUnsignedClaimTxParams,
): ClaimIntent {
  const claimant = new PublicKey(params.claimantWallet);
  const programId = new PublicKey(params.programId);
  const poolAddress = new PublicKey(params.poolAddress);

  const cycleHash = hashStringTo32(params.cycleId);
  const [membershipPda] = deriveMembershipPda({
    programId,
    poolAddress,
    member: claimant,
  });
  const [cycleOutcomePda] = deriveCycleOutcomePda({
    programId,
    poolAddress,
    member: claimant,
    cycleHash,
  });
  const [claimPda] = deriveClaimPda({
    programId,
    poolAddress,
    member: claimant,
    cycleHash,
  });
  const [cycleWindowPda] = deriveCycleWindowPda({
    programId,
    poolAddress,
    cycleHash,
  });

  const instruction = new TransactionInstruction({
    keys: [
      {
        pubkey: claimant,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: poolAddress,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: membershipPda,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: cycleOutcomePda,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: cycleWindowPda,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: claimPda,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    programId,
    data: serializeSubmitClaimPayload(params),
  });

  const tx = new Transaction({
    recentBlockhash: params.recentBlockhash,
    feePayer: claimant,
  }).add(instruction);

  const unsignedTxBase64 = tx
    .serialize({ requireAllSignatures: false, verifySignatures: false })
    .toString('base64');

  return {
    intentId: params.intentId,
    unsignedTxBase64,
    requiredSigner: claimant.toBase58(),
    expiresAtIso: params.expiresAtIso,
    attestationRefs: params.attestationRefs,
  };
}

export function buildUnsignedRewardClaimTx(
  params: BuildUnsignedRewardClaimTxParams,
): RewardClaimIntent {
  validateRewardClaimOptionalAccounts(params);
  const claimant = new PublicKey(params.claimantWallet);
  const member = new PublicKey(params.member);
  const programId = new PublicKey(params.programId);
  const poolAddress = new PublicKey(params.poolAddress);
  const cycleHash = hashStringTo32(params.cycleId);
  const ruleHash = fromHex(params.ruleHashHex, 32);

  const [configV2Pda] = deriveConfigV2Pda(programId);
  const [poolTermsPda] = derivePoolTermsPda({
    programId,
    poolAddress,
  });
  const [poolOraclePolicyPda] = derivePoolOraclePolicyPda({
    programId,
    poolAddress,
  });
  const [membershipPda] = deriveMembershipPda({
    programId,
    poolAddress,
    member,
  });
  const [aggregatePda] = deriveOutcomeAggregatePda({
    programId,
    poolAddress,
    member,
    cycleHash,
    ruleHash,
  });
  const [claimRecordV2Pda] = deriveClaimV2Pda({
    programId,
    poolAddress,
    member,
    cycleHash,
    ruleHash,
  });
  const [claimDelegatePda] = deriveClaimDelegatePda({
    programId,
    poolAddress,
    member,
  });

  const optionPlaceholder = programId;
  const claimDelegateAccount = params.claimDelegate ? claimDelegatePda : optionPlaceholder;
  const poolAssetVaultAccount = params.poolAssetVault
    ? new PublicKey(params.poolAssetVault)
    : optionPlaceholder;
  const poolVaultTokenAccount = params.poolVaultTokenAccount
    ? new PublicKey(params.poolVaultTokenAccount)
    : optionPlaceholder;
  const recipientTokenAccount = params.recipientTokenAccount
    ? new PublicKey(params.recipientTokenAccount)
    : optionPlaceholder;

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: claimant, isSigner: true, isWritable: true },
      { pubkey: configV2Pda, isSigner: false, isWritable: false },
      { pubkey: poolAddress, isSigner: false, isWritable: true },
      { pubkey: poolTermsPda, isSigner: false, isWritable: false },
      { pubkey: poolOraclePolicyPda, isSigner: false, isWritable: false },
      { pubkey: membershipPda, isSigner: false, isWritable: false },
      { pubkey: aggregatePda, isSigner: false, isWritable: true },
      { pubkey: new PublicKey(params.recipientSystemAccount), isSigner: false, isWritable: true },
      { pubkey: claimDelegateAccount, isSigner: false, isWritable: false },
      { pubkey: poolAssetVaultAccount, isSigner: false, isWritable: false },
      { pubkey: poolVaultTokenAccount, isSigner: false, isWritable: params.poolVaultTokenAccount != null },
      { pubkey: recipientTokenAccount, isSigner: false, isWritable: params.recipientTokenAccount != null },
      { pubkey: claimRecordV2Pda, isSigner: false, isWritable: true },
      { pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId,
    data: serializeSubmitRewardClaimPayload(params),
  });

  const tx = new Transaction({
    recentBlockhash: params.recentBlockhash,
    feePayer: claimant,
  }).add(instruction);

  const unsignedTxBase64 = tx
    .serialize({ requireAllSignatures: false, verifySignatures: false })
    .toString('base64');

  return {
    intentHashHex: Buffer.from(fromHex(params.intentHashHex, 32)).toString('hex'),
    unsignedTxBase64,
    requiredSigner: claimant.toBase58(),
  };
}

export function validateSignedClaimTx(
  params: ValidateSignedClaimTxParams,
): ValidateSignedClaimTxResult {
  let tx: SolanaTransaction;
  try {
    tx = decodeSolanaTransaction(params.signedTxBase64);
  } catch {
    return {
      valid: false,
      txSignature: null,
      reason: 'invalid_transaction_base64',
      signer: null,
    };
  }

  if (typeof params.expectedUnsignedTxBase64 === 'string' && params.expectedUnsignedTxBase64.length > 0) {
    try {
      const expectedUnsignedTx = decodeSolanaTransaction(
        params.expectedUnsignedTxBase64,
      );
      const signedMessageBytes = solanaTransactionMessageBytes(tx);
      const expectedMessageBytes = solanaTransactionMessageBytes(expectedUnsignedTx);

      if (!bytesEqual(signedMessageBytes, expectedMessageBytes)) {
        const signedIntentBytes = solanaTransactionIntentMessageBytes(tx);
        const expectedIntentBytes = solanaTransactionIntentMessageBytes(expectedUnsignedTx);

        if (!bytesEqual(signedIntentBytes, expectedIntentBytes)) {
          return {
            valid: false,
            txSignature: solanaTransactionFirstSignature(tx),
            reason: 'intent_message_mismatch',
            signer: solanaTransactionRequiredSigner(tx),
          };
        }
      }
    } catch {
      return {
        valid: false,
        txSignature: solanaTransactionFirstSignature(tx),
        reason: 'intent_message_mismatch',
        signer: solanaTransactionRequiredSigner(tx),
      };
    }
  }

  const expectedSigner = params.requiredSigner.trim();
  const signer = solanaTransactionRequiredSigner(tx);
  if (!signer) {
    return {
      valid: false,
      txSignature: null,
      reason: 'missing_fee_payer',
      signer: null,
    };
  }

  if (signer !== expectedSigner) {
    return {
      valid: false,
      txSignature: solanaTransactionFirstSignature(tx),
      reason: 'required_signer_mismatch',
      signer,
    };
  }

  const requiredSignature = solanaTransactionSignerSignature(tx, expectedSigner);
  if (!requiredSignature) {
    return {
      valid: false,
      txSignature: solanaTransactionFirstSignature(tx),
      reason: 'missing_required_signature',
      signer,
    };
  }

  const ok = nacl.sign.detached.verify(
    solanaTransactionMessageBytes(tx),
    requiredSignature,
    new PublicKey(expectedSigner).toBytes(),
  );

  if (!ok) {
    return {
      valid: false,
      txSignature: solanaTransactionFirstSignature(tx),
      reason: 'invalid_required_signature',
      signer,
    };
  }

  return {
    valid: true,
    txSignature: solanaTransactionFirstSignature(tx),
    reason: null,
    signer,
  };
}

function lower(value: string): string {
  return value.toLowerCase();
}

export function mapValidationReasonToClaimFailure(
  reason: ValidateSignedClaimTxReason | null,
): ClaimFailureCode | null {
  if (!reason) return null;
  if (reason === 'intent_message_mismatch') return 'intent_message_mismatch';
  if (reason === 'required_signer_mismatch') return 'required_signer_mismatch';
  return 'unknown';
}

export function normalizeClaimSimulationFailure(params: {
  err: unknown;
  logs?: string[] | null;
}): ClaimFailureDetail {
  const logs = params.logs ?? [];
  const logsText = lower(logs.join('\n'));
  const errText = lower(
    params.err == null
      ? ''
      : typeof params.err === 'string'
        ? params.err
        : JSON.stringify(params.err),
  );
  const haystack = `${logsText}\n${errText}`;

  if (
    haystack.includes('insufficientpoolliquidity')
    || haystack.includes('insufficient funds')
    || haystack.includes('insufficient lamports')
  ) {
    return {
      code: 'simulation_failed_insufficient_funds',
      message: 'Pool does not have sufficient liquidity for this claim.',
    };
  }
  if (haystack.includes('poolnotactive') || haystack.includes('pool is not active')) {
    return {
      code: 'simulation_failed_pool_paused',
      message: 'Pool is paused or not active for claims.',
    };
  }
  if (
    haystack.includes('membershipnotactive')
    || haystack.includes('membership member mismatch')
    || haystack.includes('membership')
  ) {
    return {
      code: 'simulation_failed_membership_invalid',
      message: 'Membership is not active for this pool.',
    };
  }

  return {
    code: 'simulation_failed_unknown',
    message: 'Claim simulation failed before broadcast.',
  };
}

export function normalizeClaimRpcFailure(error: unknown): ClaimFailureDetail {
  const message = error instanceof Error ? error.message : String(error);
  const normalized = lower(message);
  if (
    normalized.includes('timeout')
    || normalized.includes('timed out')
    || normalized.includes('blockhash not found')
  ) {
    return {
      code: 'rpc_timeout',
      message: message || 'RPC timeout while submitting claim transaction.',
    };
  }
  return {
    code: 'rpc_rejected',
    message: message || 'RPC rejected claim transaction.',
  };
}
