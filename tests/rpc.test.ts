import test from 'node:test';
import assert from 'node:assert/strict';

import {
  OMEGAX_NETWORKS,
  createConnection,
  getOmegaXNetworkInfo,
} from '../src/index.js';

test('createConnection preserves legacy URL overload behavior', () => {
  const connection = createConnection('http://127.0.0.1:8899', 'processed');
  assert.equal(connection.rpcEndpoint, 'http://127.0.0.1:8899');
  assert.equal(connection.commitment, 'processed');
});

test('createConnection defaults to devnet when called with options or no args', () => {
  const defaultConnection = createConnection();
  assert.equal(defaultConnection.rpcEndpoint, OMEGAX_NETWORKS.devnet.defaultRpcUrl);
  assert.equal(defaultConnection.commitment, 'confirmed');

  const optionsConnection = createConnection({ network: 'devnet', commitment: 'finalized' });
  assert.equal(optionsConnection.rpcEndpoint, OMEGAX_NETWORKS.devnet.defaultRpcUrl);
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
    const connection = createConnection({ network: 'mainnet', warnOnComingSoon: false });
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
  assert.throws(
    () => getOmegaXNetworkInfo('testnet' as any),
    /Unsupported OmegaX network "testnet"/,
  );
  assert.throws(
    () => createConnection({ network: 'testnet' as any }),
    /Unsupported OmegaX network "testnet"/,
  );
});
