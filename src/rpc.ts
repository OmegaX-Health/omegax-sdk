import {
  Connection,
  type Commitment,
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
import {
  decodeSolanaTransaction,
  serializeSolanaTransaction,
  type SolanaTransaction,
} from './transactions.js';

function shouldRetrySignedSimulationWithoutSigVerify(params: {
  error: unknown;
  sigVerify: boolean;
}): boolean {
  const message = params.error instanceof Error ? params.error.message : String(params.error);
  return (
    params.sigVerify
    && /invalid arguments/i.test(message)
  );
}

async function simulateSignedTransaction(
  connection: Connection,
  transaction: SolanaTransaction,
  options: {
    commitment: 'processed' | 'confirmed' | 'finalized';
    replaceRecentBlockhash: boolean;
    sigVerify: boolean;
  },
): Promise<{
  value: {
    err: unknown | null;
    logs?: string[] | null;
    unitsConsumed?: number | null;
  };
}> {
  const rpcRequest = (connection as {
    _rpcRequest?: (methodName: string, args: unknown[]) => Promise<{
      error?: { message?: string };
      result?: {
        value: {
          err: unknown | null;
          logs?: string[] | null;
          unitsConsumed?: number | null;
        };
      };
    }>;
  })._rpcRequest;

  if (typeof rpcRequest !== 'function') {
    return await (connection as any).simulateTransaction(transaction, options);
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

export type OmegaXNetwork = 'devnet' | 'mainnet';
export type OmegaXNetworkInput = OmegaXNetwork | 'mainnet-beta';

export interface OmegaXConnectionOptions {
  network?: OmegaXNetworkInput;
  rpcUrl?: string;
  commitment?: Commitment;
  warnOnComingSoon?: boolean;
}

export interface OmegaXNetworkInfo {
  network: OmegaXNetwork;
  solanaCluster: 'devnet' | 'mainnet-beta';
  defaultRpcUrl: string;
  isAvailable: boolean;
  status: 'live' | 'coming_soon';
  statusMessage: string;
}

export const OMEGAX_NETWORKS: Record<OmegaXNetwork, OmegaXNetworkInfo> = {
  devnet: {
    network: 'devnet',
    solanaCluster: 'devnet',
    defaultRpcUrl: 'https://api.devnet.solana.com',
    isAvailable: true,
    status: 'live',
    statusMessage: 'OmegaX devnet beta is live.',
  },
  mainnet: {
    network: 'mainnet',
    solanaCluster: 'mainnet-beta',
    defaultRpcUrl: 'https://api.mainnet-beta.solana.com',
    isAvailable: false,
    status: 'coming_soon',
    statusMessage: 'OmegaX mainnet support is coming soon. Please use devnet beta for now.',
  },
};

function normalizeOmegaXNetwork(input: OmegaXNetworkInput | undefined): OmegaXNetwork {
  const normalized = String(input ?? 'devnet').trim().toLowerCase();
  if (normalized === 'devnet') return 'devnet';
  if (normalized === 'mainnet' || normalized === 'mainnet-beta') return 'mainnet';
  throw new Error(
    `Unsupported OmegaX network "${String(input)}". Supported networks: "devnet", "mainnet".`,
  );
}

export function getOmegaXNetworkInfo(input: OmegaXNetworkInput = 'devnet'): OmegaXNetworkInfo {
  const network = normalizeOmegaXNetwork(input);
  return { ...OMEGAX_NETWORKS[network] };
}

export function createConnection(rpcUrl: string, commitment?: Commitment): Connection;
export function createConnection(options?: OmegaXConnectionOptions): Connection;
export function createConnection(
  rpcUrlOrOptions: string | OmegaXConnectionOptions = { network: 'devnet' },
  commitment: Commitment = 'confirmed',
): Connection {
  if (typeof rpcUrlOrOptions === 'string') {
    return new Connection(rpcUrlOrOptions, commitment);
  }

  const options = rpcUrlOrOptions ?? {};
  const resolvedCommitment = options.commitment ?? 'confirmed';
  const networkInfo = getOmegaXNetworkInfo(options.network);

  if (!networkInfo.isAvailable && (options.warnOnComingSoon ?? true)) {
    console.warn(`[omegax-sdk] ${networkInfo.statusMessage}`);
  }

  const rpcUrl = options.rpcUrl ?? networkInfo.defaultRpcUrl;
  return new Connection(rpcUrl, resolvedCommitment);
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
      let tx: SolanaTransaction;
      try {
        tx = decodeSolanaTransaction(params.signedTxBase64);
      } catch (error) {
        return {
          ok: false,
          logs: [],
          unitsConsumed: null,
          err: error,
          failure: normalizeClaimSimulationFailure({ err: error, logs: [] }),
        };
      }

      const replaceRecentBlockhash = params.replaceRecentBlockhash ?? true;
      const sigVerify = params.sigVerify ?? true;
      const baseOptions = {
        commitment: params.commitment ?? 'confirmed',
        replaceRecentBlockhash,
        sigVerify,
      };

      let result;
      try {
        result = await simulateSignedTransaction(connection, tx, baseOptions);
      } catch (error) {
        if (
          !shouldRetrySignedSimulationWithoutSigVerify({
            error,
            sigVerify,
          })
        ) {
          return {
            ok: false,
            logs: [],
            unitsConsumed: null,
            err: error,
            failure: normalizeClaimSimulationFailure({ err: error, logs: [] }),
          };
        }

        try {
          result = await simulateSignedTransaction(connection, tx, {
            ...baseOptions,
            sigVerify: false,
          });
        } catch (retryError) {
          return {
            ok: false,
            logs: [],
            unitsConsumed: null,
            err: retryError,
            failure: normalizeClaimSimulationFailure({ err: retryError, logs: [] }),
          };
        }
      }

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
