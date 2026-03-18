import test from 'node:test';
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import {
  Keypair,
  PublicKey,
  SystemProgram,
  type TransactionInstruction,
} from '@solana/web3.js';

import {
  anchorDiscriminator,
  createConnection,
  createProtocolClient,
  deriveConfigPda,
  deriveMembershipPda,
  deriveOraclePda,
  deriveOracleProfilePda,
  derivePoolAddress,
  derivePoolOraclePda,
  derivePoolPda,
  derivePolicyPositionNftPda,
  derivePolicyPositionPda,
  derivePolicySeriesPda,
  encodeI64Le,
  encodeString,
  encodeU16Le,
  encodeU64Le,
} from '../src/index.js';

function toMeta(ix: TransactionInstruction) {
  return ix.keys.map((key) => ({
    pubkey: key.pubkey.toBase58(),
    isSigner: key.isSigner,
    isWritable: key.isWritable,
  }));
}

test('derivePoolAddress matches PDA derivation', () => {
  const authority = Keypair.generate();
  const program = Keypair.generate();
  const poolId = 'omega-holder-pool';

  const derived = derivePoolAddress({
    programId: program.publicKey.toBase58(),
    authority: authority.publicKey.toBase58(),
    poolId,
  });

  const [pda] = derivePoolPda({
    programId: program.publicKey,
    authority: authority.publicKey,
    poolId,
  });

  assert.equal(derived, pda.toBase58());
});

test('buildCreatePoolTx rejects poolId values above 32 UTF-8 bytes', () => {
  const authority = Keypair.generate();
  const program = Keypair.generate();
  const connection = createConnection('http://127.0.0.1:8899', 'confirmed');
  const client = createProtocolClient(connection, program.publicKey.toBase58());

  assert.throws(() => {
    client.buildCreatePoolTx({
      authority: authority.publicKey.toBase58(),
      poolId: 'x'.repeat(33),
      organizationRef: 'org-1',
      payoutLamportsPerPass: 1n,
      membershipMode: 0,
      recentBlockhash: '11111111111111111111111111111111',
      programId: program.publicKey.toBase58(),
    });
  });
});

test('buildRegisterOracleTx rejects more than 16 schema hashes', () => {
  const admin = Keypair.generate();
  const oracle = Keypair.generate();
  const program = Keypair.generate();
  const connection = createConnection('http://127.0.0.1:8899', 'confirmed');
  const client = createProtocolClient(connection, program.publicKey.toBase58());

  assert.throws(() => {
    client.buildRegisterOracleTx!({
      admin: admin.publicKey.toBase58(),
      oraclePubkey: oracle.publicKey.toBase58(),
      oracleType: 1,
      displayName: 'Oracle One',
      legalName: 'Oracle One LLC',
      websiteUrl: 'https://oracle.one',
      appUrl: 'https://app.oracle.one',
      logoUri: 'https://oracle.one/logo.png',
      webhookUrl: 'https://oracle.one/webhook',
      supportedSchemaKeyHashesHex: Array.from({ length: 17 }, () => '11'.repeat(32)),
      recentBlockhash: '11111111111111111111111111111111',
      programId: program.publicKey.toBase58(),
    });
  });
});

test('buildSubmitRewardClaimTx rejects partial SPL payout accounts', () => {
  const claimant = Keypair.generate();
  const member = Keypair.generate();
  const pool = Keypair.generate();
  const program = Keypair.generate();
  const connection = createConnection('http://127.0.0.1:8899', 'confirmed');
  const client = createProtocolClient(connection, program.publicKey.toBase58());

  assert.throws(() => {
    client.buildSubmitRewardClaimTx!({
      claimant: claimant.publicKey.toBase58(),
      poolAddress: pool.publicKey.toBase58(),
      member: member.publicKey.toBase58(),
      seriesRefHashHex: '11'.repeat(32),
      cycleHashHex: '22'.repeat(32),
      ruleHashHex: '33'.repeat(32),
      intentHashHex: '44'.repeat(32),
      payoutAmount: 10n,
      payoutMint: Keypair.generate().publicKey.toBase58(),
      recipient: claimant.publicKey.toBase58(),
      recipientSystemAccount: claimant.publicKey.toBase58(),
      poolAssetVault: Keypair.generate().publicKey.toBase58(),
      recentBlockhash: '11111111111111111111111111111111',
      programId: program.publicKey.toBase58(),
    });
  });
});

test('buildSubmitOutcomeAttestationVoteTx validates attestation digest hex strictly', () => {
  const oracle = Keypair.generate();
  const member = Keypair.generate();
  const pool = Keypair.generate();
  const program = Keypair.generate();
  const connection = createConnection('http://127.0.0.1:8899', 'confirmed');
  const client = createProtocolClient(connection, program.publicKey.toBase58());

  const tx = client.buildSubmitOutcomeAttestationVoteTx!({
    oracle: oracle.publicKey.toBase58(),
    poolAddress: pool.publicKey.toBase58(),
    seriesRefHashHex: '11'.repeat(32),
    member: member.publicKey.toBase58(),
    cycleHashHex: '22'.repeat(32),
    ruleHashHex: '33'.repeat(32),
    schemaKeyHashHex: '44'.repeat(32),
    payoutMint: Keypair.generate().publicKey.toBase58(),
    attestationDigestHex: `0x${'aa'.repeat(32)}`,
    observedValueHashHex: 'bb'.repeat(32),
    asOfTs: 1_700_000_000,
    passed: true,
    recentBlockhash: '11111111111111111111111111111111',
    programId: program.publicKey.toBase58(),
  });
  assert.equal(
    tx.instructions[0].data.subarray(104, 136).toString('hex'),
    'aa'.repeat(32),
  );

  assert.throws(() => {
    client.buildSubmitOutcomeAttestationVoteTx!({
      oracle: oracle.publicKey.toBase58(),
      poolAddress: pool.publicKey.toBase58(),
      seriesRefHashHex: '11'.repeat(32),
      member: member.publicKey.toBase58(),
      cycleHashHex: '22'.repeat(32),
      ruleHashHex: '33'.repeat(32),
      schemaKeyHashHex: '44'.repeat(32),
      payoutMint: Keypair.generate().publicKey.toBase58(),
      attestationDigestHex: `${'aa'.repeat(31)}zz`,
      observedValueHashHex: 'bb'.repeat(32),
      asOfTs: 1_700_000_000,
      passed: true,
      recentBlockhash: '11111111111111111111111111111111',
      programId: program.publicKey.toBase58(),
    });
  });
});

test('protocol account readers decode current setup accounts', async () => {
  const program = Keypair.generate().publicKey;
  const admin = Keypair.generate().publicKey;
  const governanceAuthority = Keypair.generate().publicKey;
  const governanceRealm = Keypair.generate().publicKey;
  const governanceConfig = Keypair.generate().publicKey;
  const defaultStakeMint = Keypair.generate().publicKey;
  const oracle = Keypair.generate().publicKey;
  const authority = Keypair.generate().publicKey;
  const member = Keypair.generate().publicKey;

  const [configPda] = deriveConfigPda(program);
  const [poolPda] = derivePoolPda({
    programId: program,
    authority,
    poolId: 'pool-1',
  });
  const [oraclePda] = deriveOraclePda({
    programId: program,
    oracle,
  });
  const [poolOraclePda] = derivePoolOraclePda({
    programId: program,
    poolAddress: poolPda,
    oracle,
  });
  const [membershipPda] = deriveMembershipPda({
    programId: program,
    poolAddress: poolPda,
    member,
  });

  const accounts = new Map<string, Buffer>();
  accounts.set(
    configPda.toBase58(),
    Buffer.concat([
      anchorDiscriminator('account', 'ProtocolConfig'),
      admin.toBuffer(),
      governanceAuthority.toBuffer(),
      governanceRealm.toBuffer(),
      governanceConfig.toBuffer(),
      defaultStakeMint.toBuffer(),
      encodeU16Le(25),
      encodeU64Le(500n),
      Buffer.from([0]),
      Buffer.alloc(32, 9),
      Buffer.from([1]),
    ]),
  );
  accounts.set(
    poolPda.toBase58(),
    Buffer.concat([
      anchorDiscriminator('account', 'Pool'),
      authority.toBuffer(),
      encodeString('pool-1'),
      encodeString('org-1'),
      encodeU64Le(10n),
      Buffer.from([0]),
      new PublicKey('11111111111111111111111111111111').toBuffer(),
      encodeU64Le(0n),
      new PublicKey('11111111111111111111111111111111').toBuffer(),
      Buffer.from([1]),
      Buffer.from([255]),
    ]),
  );
  accounts.set(
    oraclePda.toBase58(),
    Buffer.concat([
      anchorDiscriminator('account', 'OracleRegistryEntry'),
      oracle.toBuffer(),
      Buffer.from([1]),
      Buffer.from([2]),
      encodeString('https://oracle.example/metadata'),
    ]),
  );
  accounts.set(
    poolOraclePda.toBase58(),
    Buffer.concat([
      anchorDiscriminator('account', 'PoolOracleApproval'),
      poolPda.toBuffer(),
      oracle.toBuffer(),
      Buffer.from([1]),
      Buffer.from([3]),
    ]),
  );
  accounts.set(
    membershipPda.toBase58(),
    Buffer.concat([
      anchorDiscriminator('account', 'MembershipRecord'),
      poolPda.toBuffer(),
      member.toBuffer(),
      Buffer.alloc(32, 7),
      Buffer.from([1]),
      encodeI64Le(111n),
      encodeI64Le(222n),
      Buffer.from([4]),
    ]),
  );

  const connection = {
    async getAccountInfo(pubkey: PublicKey) {
      const data = accounts.get(pubkey.toBase58());
      if (!data) return null;
      return { data } as any;
    },
  } as any;

  const client = createProtocolClient(connection, program.toBase58());

  const config = await client.fetchProtocolConfig();
  assert.equal(config?.admin, admin.toBase58());
  assert.equal(config?.governanceAuthority, governanceAuthority.toBase58());
  assert.equal(config?.protocolFeeBps, 25);

  const pool = await client.fetchPool(poolPda.toBase58());
  assert.equal(pool?.poolId, 'pool-1');
  assert.equal(pool?.status, 'active');

  const entry = await client.fetchOracleRegistryEntry(oracle.toBase58());
  assert.equal(entry?.metadataUri, 'https://oracle.example/metadata');
  assert.equal(entry?.active, true);

  const approval = await client.fetchPoolOracleApproval({
    poolAddress: poolPda.toBase58(),
    oracle: oracle.toBase58(),
  });
  assert.equal(approval?.active, true);

  const membership = await client.fetchMembershipRecord({
    poolAddress: poolPda.toBase58(),
    member: member.toBase58(),
  });
  assert.equal(membership?.status, 'active');
  assert.equal(membership?.subjectCommitmentHex, Buffer.alloc(32, 7).toString('hex'));
});

test('protocol client canonical oracle and pool-admin builders match protocol metas', () => {
  const admin = Keypair.generate();
  const authority = Keypair.generate();
  const oracle = Keypair.generate();
  const program = Keypair.generate();
  const poolAddress = Keypair.generate().publicKey;
  const connection = createConnection('http://127.0.0.1:8899', 'confirmed');
  const client = createProtocolClient(connection, program.publicKey.toBase58());
  const recentBlockhash = '11111111111111111111111111111111';

  const [oracleEntryPda] = deriveOraclePda({
    programId: program.publicKey,
    oracle: oracle.publicKey,
  });
  const [oracleProfilePda] = deriveOracleProfilePda({
    programId: program.publicKey,
    oracle: oracle.publicKey,
  });
  const [poolOraclePda] = derivePoolOraclePda({
    programId: program.publicKey,
    poolAddress,
    oracle: oracle.publicKey,
  });

  const registerTx = client.buildRegisterOracleTx!({
    admin: admin.publicKey.toBase58(),
    oraclePubkey: oracle.publicKey.toBase58(),
    oracleType: 1,
    displayName: 'Oracle One',
    legalName: 'Oracle One LLC',
    websiteUrl: 'https://oracle.one',
    appUrl: 'https://app.oracle.one',
    logoUri: 'https://oracle.one/logo.png',
    webhookUrl: 'https://oracle.one/webhook',
    supportedSchemaKeyHashesHex: ['11'.repeat(32)],
    recentBlockhash,
    programId: program.publicKey.toBase58(),
  });
  assert.deepEqual(toMeta(registerTx.instructions[0]), [
    { pubkey: admin.publicKey.toBase58(), isSigner: true, isWritable: true },
    { pubkey: oracleEntryPda.toBase58(), isSigner: false, isWritable: true },
    { pubkey: oracleProfilePda.toBase58(), isSigner: false, isWritable: true },
    { pubkey: SystemProgram.programId.toBase58(), isSigner: false, isWritable: false },
  ]);
  assert.equal(
    Buffer.compare(
      registerTx.instructions[0].data.subarray(0, 8),
      anchorDiscriminator('global', 'register_oracle'),
    ),
    0,
  );

  const claimTx = client.buildClaimOracleTx!({
    oracle: oracle.publicKey.toBase58(),
    recentBlockhash,
    programId: program.publicKey.toBase58(),
  });
  assert.deepEqual(toMeta(claimTx.instructions[0]), [
    { pubkey: oracle.publicKey.toBase58(), isSigner: true, isWritable: false },
    { pubkey: oracleEntryPda.toBase58(), isSigner: false, isWritable: true },
    { pubkey: oracleProfilePda.toBase58(), isSigner: false, isWritable: true },
  ]);

  const updateTx = client.buildUpdateOracleProfileTx!({
    authority: admin.publicKey.toBase58(),
    oracle: oracle.publicKey.toBase58(),
    oracleType: 2,
    displayName: 'Oracle Updated',
    legalName: 'Oracle Updated LLC',
    websiteUrl: 'https://oracle.updated',
    appUrl: 'https://app.oracle.updated',
    logoUri: 'https://oracle.updated/logo.png',
    webhookUrl: 'https://oracle.updated/webhook',
    supportedSchemaKeyHashesHex: ['22'.repeat(32)],
    recentBlockhash,
    programId: program.publicKey.toBase58(),
  });
  assert.deepEqual(toMeta(updateTx.instructions[0]), [
    { pubkey: admin.publicKey.toBase58(), isSigner: true, isWritable: false },
    { pubkey: oracleProfilePda.toBase58(), isSigner: false, isWritable: true },
  ]);
  assert.equal(
    Buffer.compare(
      updateTx.instructions[0].data.subarray(0, 8),
      anchorDiscriminator('global', 'update_oracle_profile'),
    ),
    0,
  );

  const setPoolStatusTx = client.buildSetPoolStatusTx!({
    authority: authority.publicKey.toBase58(),
    poolAddress: poolAddress.toBase58(),
    status: 1,
    recentBlockhash,
    programId: program.publicKey.toBase58(),
  });
  assert.deepEqual(toMeta(setPoolStatusTx.instructions[0]), [
    { pubkey: authority.publicKey.toBase58(), isSigner: true, isWritable: false },
    { pubkey: poolAddress.toBase58(), isSigner: false, isWritable: true },
  ]);
  assert.equal(
    Buffer.compare(
      setPoolStatusTx.instructions[0].data.subarray(0, 8),
      anchorDiscriminator('global', 'set_pool_status'),
    ),
    0,
  );

  const setPoolOracleTx = client.buildSetPoolOracleTx!({
    authority: authority.publicKey.toBase58(),
    poolAddress: poolAddress.toBase58(),
    oracle: oracle.publicKey.toBase58(),
    active: true,
    recentBlockhash,
    programId: program.publicKey.toBase58(),
  });
  assert.deepEqual(toMeta(setPoolOracleTx.instructions[0]), [
    { pubkey: authority.publicKey.toBase58(), isSigner: true, isWritable: true },
    { pubkey: poolAddress.toBase58(), isSigner: false, isWritable: false },
    { pubkey: oracleEntryPda.toBase58(), isSigner: false, isWritable: false },
    { pubkey: poolOraclePda.toBase58(), isSigner: false, isWritable: true },
    { pubkey: SystemProgram.programId.toBase58(), isSigner: false, isWritable: false },
  ]);
  assert.equal(
    Buffer.compare(
      setPoolOracleTx.instructions[0].data.subarray(0, 8),
      anchorDiscriminator('global', 'set_pool_oracle'),
    ),
    0,
  );
});

test('policy series builders use canonical naming and current PDAs', () => {
  const authority = Keypair.generate();
  const member = Keypair.generate();
  const pool = Keypair.generate().publicKey;
  const program = Keypair.generate();
  const connection = createConnection('http://127.0.0.1:8899', 'confirmed');
  const client = createProtocolClient(connection, program.publicKey.toBase58());
  const recentBlockhash = '11111111111111111111111111111111';
  const seriesRefHashHex = '11'.repeat(32);
  const seriesRefHash = Buffer.from(seriesRefHashHex, 'hex');

  const [configPda] = deriveConfigPda(program.publicKey);
  const [policySeriesPda] = derivePolicySeriesPda({
    programId: program.publicKey,
    poolAddress: pool,
    seriesRefHash,
  });
  const [membershipPda] = deriveMembershipPda({
    programId: program.publicKey,
    poolAddress: pool,
    member: member.publicKey,
  });
  const [policyPositionPda] = derivePolicyPositionPda({
    programId: program.publicKey,
    poolAddress: pool,
    seriesRefHash,
    member: member.publicKey,
  });
  const [policyPositionNftPda] = derivePolicyPositionNftPda({
    programId: program.publicKey,
    poolAddress: pool,
    seriesRefHash,
    member: member.publicKey,
  });

  const createTx = client.buildCreatePolicySeriesTx!({
    authority: authority.publicKey.toBase58(),
    poolAddress: pool.toBase58(),
    seriesRefHashHex,
    status: 1,
    planMode: 1,
    sponsorMode: 2,
    displayName: 'Coverage Prime',
    metadataUri: 'https://omegax.health/coverage',
    termsHashHex: '22'.repeat(32),
    durationSecs: 86_400,
    premiumDueEverySecs: 3_600,
    premiumGraceSecs: 600,
    premiumAmount: 30n,
    interopProfileHashHex: '33'.repeat(32),
    oracleProfileHashHex: '44'.repeat(32),
    riskFamilyHashHex: '55'.repeat(32),
    issuanceTemplateHashHex: '66'.repeat(32),
    comparabilityHashHex: '77'.repeat(32),
    renewalOfHashHex: '88'.repeat(32),
    termsVersion: 1,
    mappingVersion: 1,
    recentBlockhash,
    programId: program.publicKey.toBase58(),
  });
  assert.deepEqual(toMeta(createTx.instructions[0]), [
    { pubkey: authority.publicKey.toBase58(), isSigner: true, isWritable: true },
    { pubkey: configPda.toBase58(), isSigner: false, isWritable: false },
    { pubkey: pool.toBase58(), isSigner: false, isWritable: false },
    { pubkey: policySeriesPda.toBase58(), isSigner: false, isWritable: true },
    { pubkey: SystemProgram.programId.toBase58(), isSigner: false, isWritable: false },
  ]);
  assert.equal(
    Buffer.compare(
      createTx.instructions[0].data.subarray(0, 8),
      anchorDiscriminator('global', 'create_policy_series'),
    ),
    0,
  );

  const subscribeTx = client.buildSubscribePolicySeriesTx!({
    member: member.publicKey.toBase58(),
    poolAddress: pool.toBase58(),
    seriesRefHashHex,
    startsAtTs: 1_700_000_000,
    recentBlockhash,
    programId: program.publicKey.toBase58(),
  });
  assert.deepEqual(toMeta(subscribeTx.instructions[0]), [
    { pubkey: member.publicKey.toBase58(), isSigner: true, isWritable: true },
    { pubkey: configPda.toBase58(), isSigner: false, isWritable: false },
    { pubkey: pool.toBase58(), isSigner: false, isWritable: false },
    { pubkey: membershipPda.toBase58(), isSigner: false, isWritable: false },
    { pubkey: policySeriesPda.toBase58(), isSigner: false, isWritable: false },
    { pubkey: policyPositionPda.toBase58(), isSigner: false, isWritable: true },
    { pubkey: policyPositionNftPda.toBase58(), isSigner: false, isWritable: true },
    { pubkey: SystemProgram.programId.toBase58(), isSigner: false, isWritable: false },
  ]);
  assert.equal(
    Buffer.compare(
      subscribeTx.instructions[0].data.subarray(0, 8),
      anchorDiscriminator('global', 'subscribe_policy_series'),
    ),
    0,
  );
});
