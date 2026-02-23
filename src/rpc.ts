import {
  Connection,
  type Commitment,
  Transaction,
} from '@solana/web3.js';

import type {
  BroadcastSignedTxParams,
  BroadcastSignedTxResult,
  GetSignatureStatusParams,
  GetSignatureStatusResult,
  RpcClient,
  SimulateSignedTxParams,
  SimulateSignedTxResult,
} from './types.js';
import { normalizeClaimSimulationFailure } from './claims.js';

export function createConnection(rpcUrl: string, commitment: Commitment = 'confirmed'): Connection {
  return new Connection(rpcUrl, commitment);
}

export function createRpcClient(connection: Connection): RpcClient {
  return {
    async getRecentBlockhash() {
      const latest = await connection.getLatestBlockhash('confirmed');
      return latest.blockhash;
    },

    async broadcastSignedTx(params: BroadcastSignedTxParams): Promise<BroadcastSignedTxResult> {
      const raw = Buffer.from(params.signedTxBase64, 'base64');
      const signature = await connection.sendRawTransaction(raw, {
        skipPreflight: params.skipPreflight ?? false,
        maxRetries: params.maxRetries,
      });

      const commitment = params.commitment ?? 'confirmed';
      const confirmation = await connection.confirmTransaction(signature, commitment);

      if (confirmation.value.err) {
        return {
          signature,
          status: 'failed',
          slot: confirmation.context.slot,
        };
      }

      return {
        signature,
        status: commitment === 'processed' ? 'submitted' : 'confirmed',
        slot: confirmation.context.slot,
      };
    },

    async simulateSignedTx(params: SimulateSignedTxParams): Promise<SimulateSignedTxResult> {
      let tx: Transaction;
      try {
        tx = Transaction.from(Buffer.from(params.signedTxBase64, 'base64'));
      } catch (error) {
        return {
          ok: false,
          logs: [],
          unitsConsumed: null,
          err: error,
          failure: normalizeClaimSimulationFailure({ err: error, logs: [] }),
        };
      }

      const result = await (connection as any).simulateTransaction(tx, {
        commitment: params.commitment ?? 'confirmed',
        replaceRecentBlockhash: params.replaceRecentBlockhash ?? true,
        sigVerify: params.sigVerify ?? true,
      });

      const logs = result.value.logs ?? [];
      const unitsConsumed = typeof result.value.unitsConsumed === 'number'
        ? result.value.unitsConsumed
        : null;
      if (result.value.err) {
        return {
          ok: false,
          logs,
          unitsConsumed,
          err: result.value.err,
          failure: normalizeClaimSimulationFailure({
            err: result.value.err,
            logs,
          }),
        };
      }

      return {
        ok: true,
        logs,
        unitsConsumed,
        err: null,
        failure: null,
      };
    },

    async getSignatureStatus(params: GetSignatureStatusParams): Promise<GetSignatureStatusResult> {
      const response = await connection.getSignatureStatuses(
        [params.signature],
        {
          searchTransactionHistory: params.searchTransactionHistory ?? true,
        },
      );
      const info = response.value[0];
      if (!info) {
        return {
          signature: params.signature,
          status: 'unknown',
          confirmations: null,
          slot: null,
          err: null,
        };
      }

      if (info.err) {
        return {
          signature: params.signature,
          status: 'failed',
          confirmations: info.confirmations ?? null,
          slot: info.slot ?? null,
          err: info.err,
        };
      }

      const confirmationStatus = info.confirmationStatus ?? 'processed';
      return {
        signature: params.signature,
        status: confirmationStatus,
        confirmations: info.confirmations ?? null,
        slot: info.slot ?? null,
        err: null,
      };
    },
  };
}
