import type { Connection } from '@solana/web3.js';

import {
  serializeSolanaTransaction,
  type SolanaTransaction,
} from '../transactions.js';

export interface SignedSimulationOptions {
  commitment: 'processed' | 'confirmed' | 'finalized';
  replaceRecentBlockhash: boolean;
  sigVerify: boolean;
}

export interface SignedSimulationRpcResult {
  value: {
    err: unknown | null;
    logs?: string[] | null;
    unitsConsumed?: number | null;
  };
}

type ConnectionWithSimulationMethod = Connection & {
  simulateTransaction(
    transaction: SolanaTransaction,
    options: SignedSimulationOptions,
  ): Promise<SignedSimulationRpcResult>;
};

interface ConnectionWithPrivateRpcRequest extends Connection {
  _rpcRequest?: (
    methodName: string,
    args: unknown[],
  ) => Promise<{
    error?: { message?: string };
    result?: SignedSimulationRpcResult;
  }>;
}

function getPrivateRpcRequest(
  connection: Connection,
): ConnectionWithPrivateRpcRequest['_rpcRequest'] | null {
  const rpcRequest = (connection as ConnectionWithPrivateRpcRequest)
    ._rpcRequest;
  return typeof rpcRequest === 'function' ? rpcRequest : null;
}

export async function simulateSignedTransactionViaConnection(
  connection: Connection,
  transaction: SolanaTransaction,
  options: SignedSimulationOptions,
): Promise<SignedSimulationRpcResult> {
  const rpcRequest = getPrivateRpcRequest(connection);
  if (!rpcRequest) {
    return await (
      connection as ConnectionWithSimulationMethod
    ).simulateTransaction(transaction, options);
  }

  const unsafe = await rpcRequest.call(connection, 'simulateTransaction', [
    serializeSolanaTransaction(transaction).toString('base64'),
    {
      encoding: 'base64',
      ...options,
    },
  ]);

  if (unsafe?.error) {
    throw new Error(unsafe.error.message ?? 'failed to simulate transaction');
  }
  if (!unsafe?.result?.value) {
    throw new Error('failed to simulate transaction: missing RPC result');
  }

  return unsafe.result;
}
