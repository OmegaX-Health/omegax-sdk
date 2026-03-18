import test from 'node:test';
import assert from 'node:assert/strict';
import {
  Keypair,
  SystemProgram,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js';

import {
  OMEGAX_NETWORKS,
  createConnection,
  createRpcClient,
  compileTransactionToV0,
  getOmegaXNetworkInfo,
  type OmegaXNetworkInput,
} from '../src/index.js';
import { createRpcConnectionStub } from './support/rpc-connection.js';

test('createConnection preserves URL overload behavior', () => {
  const connection = createConnection('http://127.0.0.1:8899', 'processed');
  assert.equal(connection.rpcEndpoint, 'http://127.0.0.1:8899');
  assert.equal(connection.commitment, 'processed');
});

test('createConnection defaults to devnet when called with options or no args', () => {
  const defaultConnection = createConnection();
  assert.equal(
    defaultConnection.rpcEndpoint,
    OMEGAX_NETWORKS.devnet.defaultRpcUrl,
  );
  assert.equal(defaultConnection.commitment, 'confirmed');

  const optionsConnection = createConnection({
    network: 'devnet',
    commitment: 'finalized',
  });
  assert.equal(
    optionsConnection.rpcEndpoint,
    OMEGAX_NETWORKS.devnet.defaultRpcUrl,
  );
  assert.equal(optionsConnection.commitment, 'finalized');
});

test('createConnection uses rpcUrl override when provided', () => {
  const connection = createConnection({
    network: 'devnet',
    rpcUrl: 'http://127.0.0.1:8899',
    commitment: 'finalized',
  });
  assert.equal(connection.rpcEndpoint, 'http://127.0.0.1:8899');
  assert.equal(connection.commitment, 'finalized');
});

test('createConnection warns once for mainnet selection while returning a valid connection', () => {
  const warnings: string[] = [];
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    warnings.push(args.map((value) => String(value)).join(' '));
  };

  try {
    const connection = createConnection({ network: 'mainnet' });
    assert.equal(connection.rpcEndpoint, OMEGAX_NETWORKS.mainnet.defaultRpcUrl);
    assert.equal(connection.commitment, 'confirmed');
  } finally {
    console.warn = originalWarn;
  }

  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /mainnet/i);
  assert.match(warnings[0], /coming soon/i);
});

test('createConnection can suppress mainnet coming-soon warnings', () => {
  const warnings: string[] = [];
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    warnings.push(args.map((value) => String(value)).join(' '));
  };

  try {
    const connection = createConnection({
      network: 'mainnet',
      warnOnComingSoon: false,
    });
    assert.equal(connection.rpcEndpoint, OMEGAX_NETWORKS.mainnet.defaultRpcUrl);
  } finally {
    console.warn = originalWarn;
  }

  assert.equal(warnings.length, 0);
});

test('getOmegaXNetworkInfo normalizes mainnet-beta alias', () => {
  const aliasInfo = getOmegaXNetworkInfo('mainnet-beta');
  const mainnetInfo = getOmegaXNetworkInfo('mainnet');

  assert.deepEqual(aliasInfo, mainnetInfo);
  assert.equal(aliasInfo.network, 'mainnet');
  assert.equal(aliasInfo.solanaCluster, 'mainnet-beta');
  assert.equal(aliasInfo.status, 'coming_soon');
});

test('network helpers throw explicit errors for unsupported network input', () => {
  const invalidNetwork = 'testnet' as unknown as OmegaXNetworkInput;

  assert.throws(
    () => getOmegaXNetworkInfo(invalidNetwork),
    /Unsupported OmegaX network "testnet"/,
  );
  assert.throws(
    () => createConnection({ network: invalidNetwork }),
    /Unsupported OmegaX network "testnet"/,
  );
});

test('createRpcClient simulates versioned transactions without stale decoding assumptions', async () => {
  const payer = Keypair.generate();
  const recipient = Keypair.generate();
  const sourceTx = new Transaction({
    feePayer: payer.publicKey,
    recentBlockhash: '11111111111111111111111111111111',
  }).add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: recipient.publicKey,
      lamports: 1,
    }),
  );
  const signedVersionedTx = compileTransactionToV0(sourceTx, []);
  signedVersionedTx.sign([payer]);

  let simulatedTx: unknown = null;
  const rpc = createRpcClient(
    createRpcConnectionStub({
      async simulateTransaction(transaction: unknown) {
        simulatedTx = transaction;
        return {
          value: {
            err: null,
            logs: ['ok'],
            unitsConsumed: 1234,
          },
        };
      },
    }),
  );

  const result = await rpc.simulateSignedTx({
    signedTxBase64: Buffer.from(signedVersionedTx.serialize()).toString(
      'base64',
    ),
    sigVerify: true,
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.logs, ['ok']);
  assert.equal(result.unitsConsumed, 1234);
  assert.ok(simulatedTx instanceof VersionedTransaction);
});

test('createRpcClient retries signed simulation without sigVerify when RPC rejects argument combination', async () => {
  const payer = Keypair.generate();
  const recipient = Keypair.generate();
  const tx = new Transaction({
    feePayer: payer.publicKey,
    recentBlockhash: '11111111111111111111111111111111',
  }).add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: recipient.publicKey,
      lamports: 1,
    }),
  );
  tx.sign(payer);

  const simulationOptions: unknown[] = [];
  const rpc = createRpcClient(
    createRpcConnectionStub({
      async simulateTransaction(_transaction: unknown, options: unknown) {
        simulationOptions.push(options);
        if (simulationOptions.length === 1) {
          throw new Error('Invalid arguments');
        }
        return {
          value: {
            err: null,
            logs: ['retry-ok'],
            unitsConsumed: 4321,
          },
        };
      },
    }),
  );

  const result = await rpc.simulateSignedTx({
    signedTxBase64: tx.serialize().toString('base64'),
    sigVerify: true,
    replaceRecentBlockhash: true,
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.logs, ['retry-ok']);
  assert.equal(result.unitsConsumed, 4321);
  assert.equal(simulationOptions.length, 2);
  assert.deepEqual(simulationOptions[0], {
    commitment: 'confirmed',
    replaceRecentBlockhash: true,
    sigVerify: true,
  });
  assert.deepEqual(simulationOptions[1], {
    commitment: 'confirmed',
    replaceRecentBlockhash: true,
    sigVerify: false,
  });
});

test('createRpcClient retries signed simulation without sigVerify when RPC rejects sigVerify alone', async () => {
  const payer = Keypair.generate();
  const recipient = Keypair.generate();
  const tx = new Transaction({
    feePayer: payer.publicKey,
    recentBlockhash: '11111111111111111111111111111111',
  }).add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: recipient.publicKey,
      lamports: 1,
    }),
  );
  tx.sign(payer);

  const simulationOptions: unknown[] = [];
  const rpc = createRpcClient(
    createRpcConnectionStub({
      async simulateTransaction(_transaction: unknown, options: unknown) {
        simulationOptions.push(options);
        if (simulationOptions.length === 1) {
          throw new Error('Invalid arguments');
        }
        return {
          value: {
            err: null,
            logs: ['retry-ok-no-blockhash-replace'],
            unitsConsumed: 2222,
          },
        };
      },
    }),
  );

  const result = await rpc.simulateSignedTx({
    signedTxBase64: tx.serialize().toString('base64'),
    sigVerify: true,
    replaceRecentBlockhash: false,
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.logs, ['retry-ok-no-blockhash-replace']);
  assert.equal(result.unitsConsumed, 2222);
  assert.equal(simulationOptions.length, 2);
  assert.deepEqual(simulationOptions[0], {
    commitment: 'confirmed',
    replaceRecentBlockhash: false,
    sigVerify: true,
  });
  assert.deepEqual(simulationOptions[1], {
    commitment: 'confirmed',
    replaceRecentBlockhash: false,
    sigVerify: false,
  });
});
