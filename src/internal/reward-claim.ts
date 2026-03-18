import { PublicKey } from '@solana/web3.js';

import { anchorDiscriminator, encodeU64Le, fromHex } from '../utils.js';

const SUBMIT_REWARD_CLAIM_DISCRIMINATOR = anchorDiscriminator(
  'global',
  'submit_reward_claim',
);

export interface RewardClaimOptionalAccounts {
  memberCycle?: string;
  cohortSettlementRoot?: string;
  poolAssetVault?: string;
  poolVaultTokenAccount?: string;
  recipientTokenAccount?: string;
}

export interface RewardClaimPayloadInput {
  member: string;
  cycleHashHex: string;
  ruleHashHex: string;
  intentHashHex: string;
  payoutAmount: bigint;
  recipient: string;
}

export function validateRewardClaimOptionalAccounts(
  params: RewardClaimOptionalAccounts,
): void {
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

export function encodeSubmitRewardClaimPayload(
  params: RewardClaimPayloadInput,
): Buffer {
  const cycleHash = fromHex(params.cycleHashHex, 32);
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
