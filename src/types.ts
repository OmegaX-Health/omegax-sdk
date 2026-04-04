import type { Commitment } from '@solana/web3.js';

export * from './generated/protocol_contract.js';
export * from './generated/protocol_types.js';

export type ClaimFailureCode =
  | 'protocol_paused'
  | 'claim_intake_paused'
  | 'not_eligible'
  | 'funding_exhausted'
  | 'allocation_frozen'
  | 'queue_only'
  | 'invalid_claim_state'
  | 'rpc_timeout'
  | 'network_error'
  | 'unknown';

export interface ClaimFailureDetail {
  code: ClaimFailureCode;
  reason: string;
  logs: string[];
  retryable: boolean;
}

export interface BroadcastSignedTxParams {
  signedTxBase64: string;
  skipPreflight?: boolean;
  maxRetries?: number;
  commitment?: Commitment;
}

export interface BroadcastSignedTxResult {
  signature: string;
  status: 'submitted' | 'confirmed' | 'failed';
  slot: number | null;
}

export interface SimulateSignedTxParams {
  signedTxBase64: string;
  commitment?: Commitment;
  replaceRecentBlockhash?: boolean;
  sigVerify?: boolean;
}

export interface SimulateSignedTxResult {
  ok: boolean;
  logs: string[];
  unitsConsumed: number | null;
  err: unknown | null;
  failure: ClaimFailureDetail | null;
}

export interface GetSignatureStatusParams {
  signature: string;
  searchTransactionHistory?: boolean;
}

export interface GetSignatureStatusResult {
  signature: string;
  status: 'processed' | 'confirmed' | 'finalized' | 'failed' | 'unknown';
  confirmations: number | null;
  slot: number | null;
  err: unknown | null;
}

export interface RpcClient {
  getRecentBlockhash(): Promise<string>;
  broadcastSignedTx(
    params: BroadcastSignedTxParams,
  ): Promise<BroadcastSignedTxResult>;
  simulateSignedTx(
    params: SimulateSignedTxParams,
  ): Promise<SimulateSignedTxResult>;
  getSignatureStatus(
    params: GetSignatureStatusParams,
  ): Promise<GetSignatureStatusResult>;
}
