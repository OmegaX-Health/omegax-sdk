import type {
  Commitment,
  Connection,
  SendOptions,
  TransactionConfirmationStrategy,
} from '@solana/web3.js';

import type {
  SignedSimulationOptions,
  SignedSimulationRpcResult,
} from '../../src/internal/rpc.js';

interface ConfirmTransactionResult {
  context: {
    slot: number;
  };
  value: {
    err: unknown | null;
  };
}

interface SignatureStatusInfo {
  confirmationStatus: 'processed' | 'confirmed' | 'finalized' | null;
  confirmations: number | null;
  err: unknown | null;
  slot: number | null;
}

interface SignatureStatusesResult {
  context: {
    slot: number;
  };
  value: Array<SignatureStatusInfo | null>;
}

interface RpcConnectionStubHandlers {
  getLatestBlockhash?: (commitment?: Commitment) => Promise<{
    blockhash: string;
    lastValidBlockHeight: number;
  }>;
  simulateTransaction?: (
    transaction: unknown,
    options?: SignedSimulationOptions,
  ) => Promise<SignedSimulationRpcResult>;
  sendRawTransaction?: (
    rawTransaction: Buffer | Uint8Array,
    options?: SendOptions,
  ) => Promise<string>;
  confirmTransaction?: (
    strategy: string | TransactionConfirmationStrategy,
    commitment?: Commitment,
  ) => Promise<ConfirmTransactionResult>;
  getSignatureStatuses?: (
    signatures: string[],
    config?: { searchTransactionHistory?: boolean },
  ) => Promise<SignatureStatusesResult>;
}

export function createRpcConnectionStub(
  handlers: RpcConnectionStubHandlers = {},
): Connection {
  const connectionStub = {
    async getLatestBlockhash(commitment?: Commitment) {
      if (handlers.getLatestBlockhash) {
        return await handlers.getLatestBlockhash(commitment);
      }

      return {
        blockhash: '11111111111111111111111111111111',
        lastValidBlockHeight: 1,
      };
    },

    async simulateTransaction(
      transaction: unknown,
      options?: SignedSimulationOptions,
    ) {
      if (handlers.simulateTransaction) {
        return await handlers.simulateTransaction(transaction, options);
      }

      return {
        value: {
          err: null,
          logs: [],
          unitsConsumed: 0,
        },
      };
    },

    async sendRawTransaction(
      rawTransaction: Buffer | Uint8Array,
      options?: SendOptions,
    ) {
      if (handlers.sendRawTransaction) {
        return await handlers.sendRawTransaction(rawTransaction, options);
      }

      return '1111111111111111111111111111111111111111111111111111111111111111';
    },

    async confirmTransaction(
      strategy: string | TransactionConfirmationStrategy,
      commitment?: Commitment,
    ) {
      if (handlers.confirmTransaction) {
        return await handlers.confirmTransaction(strategy, commitment);
      }

      return {
        context: { slot: 0 },
        value: { err: null },
      };
    },

    async getSignatureStatuses(
      signatures: string[],
      config?: { searchTransactionHistory?: boolean },
    ) {
      if (handlers.getSignatureStatuses) {
        return await handlers.getSignatureStatuses(signatures, config);
      }

      return {
        context: { slot: 0 },
        value: signatures.map(() => null),
      };
    },
  };

  return connectionStub as unknown as Connection;
}
