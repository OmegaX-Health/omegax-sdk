import test from 'node:test';
import assert from 'node:assert/strict';

import { Keypair } from '@solana/web3.js';

import {
  ZERO_PUBKEY,
  createConnection,
  createProtocolClient,
  createRpcClient,
  derivePoolPda,
} from '../src/index.js';

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required for the SDK localnet smoke test`);
  }
  return value;
}

async function airdrop(connection, address, lamports) {
  const signature = await connection.requestAirdrop(address, lamports);
  const latest = await connection.getLatestBlockhash('confirmed');
  await connection.confirmTransaction(
    {
      signature,
      blockhash: latest.blockhash,
      lastValidBlockHeight: latest.lastValidBlockHeight,
    },
    'confirmed',
  );
}

function signToBase64(tx, signers) {
  tx.partialSign(...signers);
  return Buffer.from(tx.serialize({ requireAllSignatures: true, verifySignatures: true })).toString('base64');
}

async function simulateAndBroadcast(params) {
  const signedTxBase64 = signToBase64(params.tx, params.signers);
  const simulation = await params.rpc.simulateSignedTx({
    signedTxBase64,
    replaceRecentBlockhash: false,
    sigVerify: true,
  });
  assert.equal(
    simulation.ok,
    true,
    `${params.label} simulation failed\n${String(simulation.err)}\n${simulation.logs.join('\n')}`,
  );

  const broadcast = await params.rpc.broadcastSignedTx({ signedTxBase64 });
  assert.equal(broadcast.status, 'confirmed', `${params.label} did not confirm`);
}

test('sdk live localnet smoke exercises rpc helpers and readers', async () => {
  const rpcUrl = requiredEnv('SOLANA_RPC_URL');
  const programId = requiredEnv('PROTOCOL_PROGRAM_ID');
  const connection = createConnection({
    network: 'devnet',
    rpcUrl,
    commitment: 'confirmed',
    warnOnComingSoon: false,
  });
  const rpc = createRpcClient(connection);
  const protocol = createProtocolClient(connection, programId);

  const admin = Keypair.generate();
  const oracle = Keypair.generate();
  const poolAuthority = Keypair.generate();

  await airdrop(connection, admin.publicKey, 2_000_000_000);
  await airdrop(connection, oracle.publicKey, 2_000_000_000);
  await airdrop(connection, poolAuthority.publicKey, 2_000_000_000);

  const governanceRealm = Keypair.generate().publicKey.toBase58();
  const governanceConfig = Keypair.generate().publicKey.toBase58();
  const defaultStakeMint = Keypair.generate().publicKey.toBase58();
  const allowedPayoutMintsHashHex = 'ab'.repeat(32);
  const poolId = `sdk-smoke-${Date.now()}`;
  const [poolAddress] = derivePoolPda({
    programId,
    authority: poolAuthority.publicKey.toBase58(),
    poolId,
  });

  await simulateAndBroadcast({
    label: 'initialize_protocol',
    rpc,
    signers: [admin],
    tx: protocol.buildInitializeProtocolTx!({
      admin: admin.publicKey.toBase58(),
      protocolFeeBps: 300,
      governanceRealm,
      governanceConfig,
      defaultStakeMint,
      minOracleStake: 0n,
      recentBlockhash: await rpc.getRecentBlockhash(),
      programId,
    }),
  });

  await simulateAndBroadcast({
    label: 'set_protocol_params',
    rpc,
    signers: [admin],
    tx: protocol.buildSetProtocolParamsTx!({
      governanceAuthority: admin.publicKey.toBase58(),
      protocolFeeBps: 300,
      allowedPayoutMintsHashHex,
      minOracleStake: 0n,
      emergencyPaused: false,
      recentBlockhash: await rpc.getRecentBlockhash(),
      programId,
    }),
  });

  await simulateAndBroadcast({
    label: 'register_oracle',
    rpc,
    signers: [admin],
    tx: protocol.buildRegisterOracleTx!({
      admin: admin.publicKey.toBase58(),
      oraclePubkey: oracle.publicKey.toBase58(),
      oracleType: 4,
      displayName: 'SDK Smoke Oracle',
      legalName: 'SDK Smoke Oracle LLC',
      websiteUrl: 'https://sdk-smoke.oracle',
      appUrl: 'https://app.sdk-smoke.oracle',
      logoUri: 'https://sdk-smoke.oracle/logo.png',
      webhookUrl: 'https://sdk-smoke.oracle/hook',
      supportedSchemaKeyHashesHex: ['11'.repeat(32)],
      recentBlockhash: await rpc.getRecentBlockhash(),
      programId,
    }),
  });

  await simulateAndBroadcast({
    label: 'claim_oracle',
    rpc,
    signers: [oracle],
    tx: protocol.buildClaimOracleTx!({
      oracle: oracle.publicKey.toBase58(),
      recentBlockhash: await rpc.getRecentBlockhash(),
      programId,
    }),
  });

  await simulateAndBroadcast({
    label: 'create_pool',
    rpc,
    signers: [poolAuthority],
    tx: protocol.buildCreatePoolTx!({
      authority: poolAuthority.publicKey.toBase58(),
      poolId,
      organizationRef: 'sdk-smoke',
      payoutLamportsPerPass: 1_000_000n,
      membershipMode: 0,
      tokenGateMint: ZERO_PUBKEY,
      tokenGateMinBalance: 0n,
      inviteIssuer: ZERO_PUBKEY,
      poolType: 0,
      payoutAssetMint: ZERO_PUBKEY,
      termsHashHex: '12'.repeat(32),
      payoutPolicyHashHex: '34'.repeat(32),
      cycleMode: 0,
      metadataUri: `https://pool.sdk-smoke/${poolId}`,
      recentBlockhash: await rpc.getRecentBlockhash(),
      programId,
    }),
  });

  await simulateAndBroadcast({
    label: 'set_pool_status',
    rpc,
    signers: [poolAuthority],
    tx: protocol.buildSetPoolStatusTx({
      authority: poolAuthority.publicKey.toBase58(),
      poolAddress: poolAddress.toBase58(),
      status: 1,
      recentBlockhash: await rpc.getRecentBlockhash(),
      programId,
    }),
  });

  await simulateAndBroadcast({
    label: 'set_pool_oracle_policy',
    rpc,
    signers: [poolAuthority],
    tx: protocol.buildSetPoolOraclePolicyTx!({
      authority: poolAuthority.publicKey.toBase58(),
      poolAddress: poolAddress.toBase58(),
      quorumM: 1,
      quorumN: 1,
      requireVerifiedSchema: false,
      oracleFeeBps: 25,
      allowDelegateClaim: true,
      challengeWindowSecs: 0,
      recentBlockhash: await rpc.getRecentBlockhash(),
      programId,
    }),
  });

  const config = await protocol.fetchProtocolConfig!();
  assert.ok(config, 'expected live ProtocolConfig account');
  assert.equal(config.admin, admin.publicKey.toBase58());
  assert.equal(config.defaultStakeMint, defaultStakeMint);
  assert.equal(config.protocolFeeBps, 300);
  assert.equal(config.allowedPayoutMintsHashHex, allowedPayoutMintsHashHex);

  const oracleProfile = await protocol.fetchOracleProfile!(oracle.publicKey.toBase58());
  assert.ok(oracleProfile, 'expected live OracleProfile account');
  assert.equal(oracleProfile.oracle, oracle.publicKey.toBase58());
  assert.equal(oracleProfile.admin, admin.publicKey.toBase58());
  assert.equal(oracleProfile.displayName, 'SDK Smoke Oracle');
  assert.equal(oracleProfile.claimed, true);

  const oracleEntry = await protocol.fetchOracleRegistryEntry(oracle.publicKey.toBase58());
  assert.ok(oracleEntry, 'expected live OracleRegistryEntry account');
  assert.equal(oracleEntry.oracle, oracle.publicKey.toBase58());
  assert.equal(oracleEntry.active, true);

  const pool = await protocol.fetchPool(poolAddress.toBase58());
  assert.ok(pool, 'expected live Pool account');
  assert.equal(pool.authority, poolAuthority.publicKey.toBase58());
  assert.equal(pool.poolId, poolId);
  assert.equal(pool.organizationRef, 'sdk-smoke');
  assert.equal(pool.statusCode, 1);

  const poolTerms = await protocol.fetchPoolTerms!(poolAddress.toBase58());
  assert.ok(poolTerms, 'expected live PoolTerms account');
  assert.equal(poolTerms.pool, poolAddress.toBase58());
  assert.equal(poolTerms.metadataUri, `https://pool.sdk-smoke/${poolId}`);

  const poolPolicy = await protocol.fetchPoolOraclePolicy!(poolAddress.toBase58());
  assert.ok(poolPolicy, 'expected live PoolOraclePolicy account');
  assert.equal(poolPolicy.pool, poolAddress.toBase58());
  assert.equal(poolPolicy.quorumM, 1);
  assert.equal(poolPolicy.quorumN, 1);
  assert.equal(poolPolicy.oracleFeeBps, 25);
  assert.equal(poolPolicy.allowDelegateClaim, true);
});
