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
  deriveAttestationVotePda,
  deriveClaimV2Pda,
  deriveConfigPda,
  deriveConfigV2Pda,
  deriveCoverageClaimPda,
  deriveCoverageNftPda,
  deriveCoverageProductPda,
  deriveCoveragePolicyPda,
  deriveCycleWindowPda,
  deriveEnrollmentReplayPda,
  deriveMembershipPda,
  deriveOraclePda,
  deriveOracleProfilePda,
  deriveOracleStakePda,
  deriveOutcomeAggregatePda,
  derivePoolAddress,
  derivePoolAssetVaultPda,
  derivePoolOraclePolicyPda,
  derivePoolOraclePda,
  derivePoolPda,
  derivePoolRulePda,
  derivePoolTermsPda,
  derivePremiumLedgerPda,
  derivePremiumReplayPda,
  deriveSchemaPda,
  encodeI64Le,
  encodeString,
  encodeU16Le,
  encodeU64Le,
  hashStringTo32,
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

test('buildRegisterOracleV2Tx rejects more than 16 schema hashes', () => {
  const admin = Keypair.generate();
  const oracle = Keypair.generate();
  const program = Keypair.generate();
  const connection = createConnection('http://127.0.0.1:8899', 'confirmed');
  const client = createProtocolClient(connection, program.publicKey.toBase58());

  assert.throws(() => {
    client.buildRegisterOracleV2Tx!({
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
      cycleId: 'cycle-1',
      ruleHashHex: '22'.repeat(32),
      intentHashHex: '33'.repeat(32),
      payoutAmount: 10n,
      recipient: claimant.publicKey.toBase58(),
      recipientSystemAccount: claimant.publicKey.toBase58(),
      poolAssetVault: Keypair.generate().publicKey.toBase58(),
      recentBlockhash: '11111111111111111111111111111111',
      programId: program.publicKey.toBase58(),
    });
  });
});

test('protocol client builds deterministic lifecycle transactions', () => {
  const admin = Keypair.generate();
  const authority = Keypair.generate();
  const program = Keypair.generate();
  const tokenGateMint = Keypair.generate().publicKey.toBase58();
  const connection = createConnection('http://127.0.0.1:8899', 'confirmed');
  const client = createProtocolClient(connection, program.publicKey.toBase58());

  const initA = client.buildInitializeProtocolTx({
    admin: admin.publicKey.toBase58(),
    protocolFeeBps: 50,
    recentBlockhash: '11111111111111111111111111111111',
    programId: program.publicKey.toBase58(),
  });

  const initB = client.buildInitializeProtocolTx({
    admin: admin.publicKey.toBase58(),
    protocolFeeBps: 50,
    recentBlockhash: '11111111111111111111111111111111',
    programId: program.publicKey.toBase58(),
  });

  assert.equal(
    initA.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64'),
    initB.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64'),
  );

  const createA = client.buildCreatePoolTx({
    authority: authority.publicKey.toBase58(),
    poolId: 'omega-holder-pool',
    organizationRef: 'omegax',
    payoutLamportsPerPass: 1_000_000n,
    membershipMode: 1,
    tokenGateMint,
    tokenGateMinBalance: 1n,
    recentBlockhash: '11111111111111111111111111111111',
    programId: program.publicKey.toBase58(),
  });

  const createB = client.buildCreatePoolTx({
    authority: authority.publicKey.toBase58(),
    poolId: 'omega-holder-pool',
    organizationRef: 'omegax',
    payoutLamportsPerPass: 1_000_000n,
    membershipMode: 1,
    tokenGateMint,
    tokenGateMinBalance: 1n,
    recentBlockhash: '11111111111111111111111111111111',
    programId: program.publicKey.toBase58(),
  });
  assert.equal(
    createA.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64'),
    createB.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64'),
  );

  const [poolPda] = derivePoolPda({
    programId: program.publicKey,
    authority: authority.publicKey,
    poolId: 'omega-holder-pool',
  });
  const windowA = client.buildSetCycleWindowTx({
    authority: authority.publicKey.toBase58(),
    poolAddress: poolPda.toBase58(),
    cycleId: 'cycle-2026-01',
    claimOpenTs: 1_700_000_000,
    claimCloseTs: 1_700_086_400,
    recentBlockhash: '11111111111111111111111111111111',
    programId: program.publicKey.toBase58(),
  });
  const windowB = client.buildSetCycleWindowTx({
    authority: authority.publicKey.toBase58(),
    poolAddress: poolPda.toBase58(),
    cycleId: 'cycle-2026-01',
    claimOpenTs: 1_700_000_000,
    claimCloseTs: 1_700_086_400,
    recentBlockhash: '11111111111111111111111111111111',
    programId: program.publicKey.toBase58(),
  });
  assert.equal(
    windowA.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64'),
    windowB.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64'),
  );
});

test('protocol client builds deterministic submit-claim transaction', () => {
  const claimant = Keypair.generate();
  const program = Keypair.generate();
  const pool = Keypair.generate();

  const connection = createConnection('http://127.0.0.1:8899', 'confirmed');
  const client = createProtocolClient(connection, program.publicKey.toBase58());

  const txA = client.buildSubmitClaimTx({
    claimant: claimant.publicKey.toBase58(),
    poolAddress: pool.publicKey.toBase58(),
    cycleId: 'cycle-2026-01',
    intentId: 'intent-1',
    recentBlockhash: '11111111111111111111111111111111',
    programId: program.publicKey.toBase58(),
  });

  const txB = client.buildSubmitClaimTx({
    claimant: claimant.publicKey.toBase58(),
    poolAddress: pool.publicKey.toBase58(),
    cycleId: 'cycle-2026-01',
    intentId: 'intent-1',
    recentBlockhash: '11111111111111111111111111111111',
    programId: program.publicKey.toBase58(),
  });

  const a = txA.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64');
  const b = txB.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64');

  assert.equal(a, b);
});

test('protocol account readers decode protocol setup accounts', async () => {
  const program = Keypair.generate().publicKey;
  const admin = Keypair.generate().publicKey;
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
  const cycleHash = hashStringTo32('cycle-window-1');
  const [cycleWindowPda] = deriveCycleWindowPda({
    programId: program,
    poolAddress: poolPda,
    cycleHash,
  });

  const accounts = new Map<string, Buffer>();
  accounts.set(
    configPda.toBase58(),
    Buffer.concat([
      anchorDiscriminator('account', 'ProtocolConfig'),
      admin.toBuffer(),
      encodeU16Le(25),
      Buffer.from([0]),
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
  accounts.set(
    cycleWindowPda.toBase58(),
    Buffer.concat([
      anchorDiscriminator('account', 'CycleWindow'),
      poolPda.toBuffer(),
      Buffer.from(cycleHash),
      authority.toBuffer(),
      encodeI64Le(1_700_000_000n),
      encodeI64Le(1_700_086_400n),
      Buffer.from([9]),
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

  const cycleWindow = await client.fetchCycleWindow({
    poolAddress: poolPda.toBase58(),
    cycleId: 'cycle-window-1',
  });
  assert.equal(cycleWindow?.authority, authority.toBase58());
  assert.equal(cycleWindow?.claimOpenTs, 1_700_000_000);
  assert.equal(cycleWindow?.claimCloseTs, 1_700_086_400);
});

test('protocol client builds deterministic v2 lifecycle transactions', () => {
  const authority = Keypair.generate();
  const publisher = Keypair.generate();
  const member = Keypair.generate();
  const pool = Keypair.generate();
  const program = Keypair.generate();
  const connection = createConnection('http://127.0.0.1:8899', 'confirmed');
  const client = createProtocolClient(connection, program.publicKey.toBase58());
  const recentBlockhash = '11111111111111111111111111111111';

  const policyA = client.buildSetPoolOraclePolicyTx!({
    authority: authority.publicKey.toBase58(),
    poolAddress: pool.publicKey.toBase58(),
    quorumM: 2,
    quorumN: 3,
    requireVerifiedSchema: true,
    allowDelegateClaim: false,
    recentBlockhash,
    programId: program.publicKey.toBase58(),
  });
  const policyB = client.buildSetPoolOraclePolicyTx!({
    authority: authority.publicKey.toBase58(),
    poolAddress: pool.publicKey.toBase58(),
    quorumM: 2,
    quorumN: 3,
    requireVerifiedSchema: true,
    allowDelegateClaim: false,
    recentBlockhash,
    programId: program.publicKey.toBase58(),
  });
  assert.equal(
    policyA.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64'),
    policyB.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64'),
  );

  const schemaA = client.buildRegisterOutcomeSchemaTx!({
    publisher: publisher.publicKey.toBase58(),
    schemaKeyHashHex: '11'.repeat(32),
    schemaKey: 'goal.streak.days',
    version: 1,
    schemaHashHex: '22'.repeat(32),
    metadataUri: 'https://omegax.health/schema/goal-streak-v1.json',
    recentBlockhash,
    programId: program.publicKey.toBase58(),
  });
  const schemaB = client.buildRegisterOutcomeSchemaTx!({
    publisher: publisher.publicKey.toBase58(),
    schemaKeyHashHex: '11'.repeat(32),
    schemaKey: 'goal.streak.days',
    version: 1,
    schemaHashHex: '22'.repeat(32),
    metadataUri: 'https://omegax.health/schema/goal-streak-v1.json',
    recentBlockhash,
    programId: program.publicKey.toBase58(),
  });
  assert.equal(
    schemaA.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64'),
    schemaB.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64'),
  );

  const coverageA = client.buildCreateCoveragePolicyTx!({
    authority: authority.publicKey.toBase58(),
    poolAddress: pool.publicKey.toBase58(),
    member: member.publicKey.toBase58(),
    termsHashHex: '33'.repeat(32),
    startsAt: 1_700_000_000,
    endsAt: 1_700_086_400,
    premiumDueEverySecs: 86_400,
    premiumGraceSecs: 7_200,
    recentBlockhash,
    programId: program.publicKey.toBase58(),
  });
  const coverageB = client.buildCreateCoveragePolicyTx!({
    authority: authority.publicKey.toBase58(),
    poolAddress: pool.publicKey.toBase58(),
    member: member.publicKey.toBase58(),
    termsHashHex: '33'.repeat(32),
    startsAt: 1_700_000_000,
    endsAt: 1_700_086_400,
    premiumDueEverySecs: 86_400,
    premiumGraceSecs: 7_200,
    recentBlockhash,
    programId: program.publicKey.toBase58(),
  });
  assert.equal(
    coverageA.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64'),
    coverageB.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64'),
  );
});

test('protocol client v2 readers decode policy and coverage accounts', async () => {
  const program = Keypair.generate().publicKey;
  const admin = Keypair.generate().publicKey;
  const governanceAuthority = Keypair.generate().publicKey;
  const governanceRealm = Keypair.generate().publicKey;
  const governanceConfig = Keypair.generate().publicKey;
  const defaultStakeMint = Keypair.generate().publicKey;
  const pool = Keypair.generate().publicKey;
  const member = Keypair.generate().publicKey;
  const nftMint = Keypair.generate().publicKey;

  const [configV2Pda] = deriveConfigV2Pda(program);
  const [policyPda] = derivePoolOraclePolicyPda({
    programId: program,
    poolAddress: pool,
  });
  const [coveragePolicyPda] = deriveCoveragePolicyPda({
    programId: program,
    poolAddress: pool,
    member,
  });
  const [premiumLedgerPda] = derivePremiumLedgerPda({
    programId: program,
    poolAddress: pool,
    member,
  });

  const accounts = new Map<string, Buffer>();
  accounts.set(
    configV2Pda.toBase58(),
    Buffer.concat([
      anchorDiscriminator('account', 'ProtocolConfigV2'),
      admin.toBuffer(),
      governanceAuthority.toBuffer(),
      governanceRealm.toBuffer(),
      governanceConfig.toBuffer(),
      defaultStakeMint.toBuffer(),
      encodeU16Le(20),
      encodeU64Le(500n),
      Buffer.from([1]),
      Buffer.alloc(32, 9),
      Buffer.from([7]),
    ]),
  );
  accounts.set(
    policyPda.toBase58(),
    Buffer.concat([
      anchorDiscriminator('account', 'PoolOraclePolicy'),
      pool.toBuffer(),
      Buffer.from([2]),
      Buffer.from([3]),
      Buffer.from([1]),
      Buffer.from([0]),
      Buffer.from([8]),
    ]),
  );
  accounts.set(
    coveragePolicyPda.toBase58(),
    Buffer.concat([
      anchorDiscriminator('account', 'CoveragePolicy'),
      pool.toBuffer(),
      member.toBuffer(),
      Buffer.alloc(32, 10),
      Buffer.from([1]),
      encodeI64Le(1_700_000_000n),
      encodeI64Le(1_701_000_000n),
      encodeI64Le(86_400n),
      encodeI64Le(7_200n),
      encodeI64Le(1_700_086_400n),
      nftMint.toBuffer(),
      Buffer.from([9]),
    ]),
  );
  accounts.set(
    premiumLedgerPda.toBase58(),
    Buffer.concat([
      anchorDiscriminator('account', 'PremiumLedger'),
      pool.toBuffer(),
      member.toBuffer(),
      encodeU64Le(3n),
      encodeU64Le(1_000_000n),
      Buffer.from([2]),
      encodeI64Le(1_700_050_000n),
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

  const config = await client.fetchProtocolConfigV2!();
  assert.equal(config?.admin, admin.toBase58());
  assert.equal(config?.governanceAuthority, governanceAuthority.toBase58());
  assert.equal(config?.protocolFeeBps, 20);

  const policy = await client.fetchPoolOraclePolicy!(pool.toBase58());
  assert.equal(policy?.quorumM, 2);
  assert.equal(policy?.quorumN, 3);
  assert.equal(policy?.requireVerifiedSchema, true);
  assert.equal(policy?.allowDelegateClaim, false);

  const coverage = await client.fetchCoveragePolicy!({
    poolAddress: pool.toBase58(),
    member: member.toBase58(),
  });
  assert.equal(coverage?.nftMint, nftMint.toBase58());
  assert.equal(coverage?.premiumDueEverySecs, 86_400);

  const premium = await client.fetchPremiumLedger!({
    poolAddress: pool.toBase58(),
    member: member.toBase58(),
  });
  assert.equal(premium?.periodIndex, 3n);
  assert.equal(premium?.source, 2);
});

test('protocol client v2 oracle/governance builders match protocol metas', () => {
  const admin = Keypair.generate();
  const governanceAuthority = Keypair.generate();
  const newAuthority = Keypair.generate();
  const oracle = Keypair.generate();
  const program = Keypair.generate();
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
  const [configV2Pda] = deriveConfigV2Pda(program.publicKey);

  const registerTx = client.buildRegisterOracleV2Tx!({
    admin: admin.publicKey.toBase58(),
    oraclePubkey: oracle.publicKey.toBase58(),
    oracleType: 1,
    displayName: 'Oracle One',
    legalName: 'Oracle One LLC',
    websiteUrl: 'https://oracle.one',
    appUrl: 'https://app.oracle.one',
    logoUri: 'https://oracle.one/logo.png',
    webhookUrl: 'https://oracle.one/webhook',
    supportedSchemaKeyHashesHex: ['11'.repeat(32), '22'.repeat(32)],
    recentBlockhash,
    programId: program.publicKey.toBase58(),
  });
  assert.deepEqual(
    toMeta(registerTx.instructions[0]),
    [
      { pubkey: admin.publicKey.toBase58(), isSigner: true, isWritable: true },
      { pubkey: oracleEntryPda.toBase58(), isSigner: false, isWritable: true },
      { pubkey: oracleProfilePda.toBase58(), isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId.toBase58(), isSigner: false, isWritable: false },
    ],
  );
  assert.equal(
    Buffer.compare(
      registerTx.instructions[0].data.subarray(0, 8),
      anchorDiscriminator('global', 'register_oracle_v2'),
    ),
    0,
  );

  const claimTx = client.buildClaimOracleV2Tx!({
    oracle: oracle.publicKey.toBase58(),
    recentBlockhash,
    programId: program.publicKey.toBase58(),
  });
  assert.deepEqual(
    toMeta(claimTx.instructions[0]),
    [
      { pubkey: oracle.publicKey.toBase58(), isSigner: true, isWritable: false },
      { pubkey: oracleEntryPda.toBase58(), isSigner: false, isWritable: true },
      { pubkey: oracleProfilePda.toBase58(), isSigner: false, isWritable: true },
    ],
  );
  assert.equal(
    Buffer.compare(
      claimTx.instructions[0].data.subarray(0, 8),
      anchorDiscriminator('global', 'claim_oracle_v2'),
    ),
    0,
  );

  const updateTx = client.buildUpdateOracleProfileV2Tx!({
    authority: admin.publicKey.toBase58(),
    oracle: oracle.publicKey.toBase58(),
    oracleType: 2,
    displayName: 'Oracle Updated',
    legalName: 'Oracle Updated LLC',
    websiteUrl: 'https://oracle.updated',
    appUrl: 'https://app.oracle.updated',
    logoUri: 'https://oracle.updated/logo.png',
    webhookUrl: 'https://oracle.updated/webhook',
    supportedSchemaKeyHashesHex: ['33'.repeat(32)],
    recentBlockhash,
    programId: program.publicKey.toBase58(),
  });
  assert.deepEqual(
    toMeta(updateTx.instructions[0]),
    [
      { pubkey: admin.publicKey.toBase58(), isSigner: true, isWritable: false },
      { pubkey: oracleProfilePda.toBase58(), isSigner: false, isWritable: true },
    ],
  );
  assert.equal(
    Buffer.compare(
      updateTx.instructions[0].data.subarray(0, 8),
      anchorDiscriminator('global', 'update_oracle_profile_v2'),
    ),
    0,
  );

  const rotateTx = client.buildRotateGovernanceAuthorityTx!({
    governanceAuthority: governanceAuthority.publicKey.toBase58(),
    newAuthority: newAuthority.publicKey.toBase58(),
    recentBlockhash,
    programId: program.publicKey.toBase58(),
  });
  assert.deepEqual(
    toMeta(rotateTx.instructions[0]),
    [
      { pubkey: governanceAuthority.publicKey.toBase58(), isSigner: true, isWritable: false },
      { pubkey: configV2Pda.toBase58(), isSigner: false, isWritable: true },
    ],
  );
  assert.equal(
    Buffer.compare(
      rotateTx.instructions[0].data.subarray(0, 8),
      anchorDiscriminator('global', 'rotate_governance_authority'),
    ),
    0,
  );
});

test('protocol client v2 reward/coverage builders match protocol metas', () => {
  const oracle = Keypair.generate();
  const authority = Keypair.generate();
  const claimant = Keypair.generate();
  const member = Keypair.generate();
  const pool = Keypair.generate();
  const program = Keypair.generate();
  const payoutMint = Keypair.generate();
  const payerTokenAccount = Keypair.generate();
  const poolVaultTokenAccount = Keypair.generate();
  const recipientTokenAccount = Keypair.generate();
  const recipientSystemAccount = Keypair.generate();
  const connection = createConnection('http://127.0.0.1:8899', 'confirmed');
  const client = createProtocolClient(connection, program.publicKey.toBase58());
  const recentBlockhash = '11111111111111111111111111111111';
  const tokenProgram = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

  const cycleId = 'cycle-42';
  const cycleHash = hashStringTo32(cycleId);
  const ruleHashHex = '66'.repeat(32);
  const ruleHash = Buffer.from(ruleHashHex, 'hex');
  const schemaKeyHashHex = '77'.repeat(32);
  const productIdHashHex = '88'.repeat(32);
  const productIdHash = Buffer.from(productIdHashHex, 'hex');
  const intentHashHex = '99'.repeat(32);
  const intentHash = Buffer.from(intentHashHex, 'hex');
  const replayHashHex = 'ab'.repeat(32);
  const replayHash = Buffer.from(replayHashHex, 'hex');

  const [oracleEntryPda] = deriveOraclePda({
    programId: program.publicKey,
    oracle: oracle.publicKey,
  });
  const [configV2Pda] = deriveConfigV2Pda(program.publicKey);
  const [stakePositionPda] = deriveOracleStakePda({
    programId: program.publicKey,
    oracle: oracle.publicKey,
    staker: oracle.publicKey,
  });
  const [poolOraclePolicyPda] = derivePoolOraclePolicyPda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
  });
  const [poolOraclePda] = derivePoolOraclePda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
    oracle: oracle.publicKey,
  });
  const [membershipPda] = deriveMembershipPda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
    member: member.publicKey,
  });
  const [poolRulePda] = derivePoolRulePda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
    ruleHash,
  });
  const [schemaPda] = deriveSchemaPda({
    programId: program.publicKey,
    schemaKeyHash: Buffer.from(schemaKeyHashHex, 'hex'),
  });
  const [votePda] = deriveAttestationVotePda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
    member: member.publicKey,
    cycleHash,
    ruleHash,
    oracle: oracle.publicKey,
  });
  const [aggregatePda] = deriveOutcomeAggregatePda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
    member: member.publicKey,
    cycleHash,
    ruleHash,
  });
  const [poolTermsPda] = derivePoolTermsPda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
  });
  const [claimRecordV2Pda] = deriveClaimV2Pda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
    member: member.publicKey,
    cycleHash,
    ruleHash,
  });
  const [coverageProductPda] = deriveCoverageProductPda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
    productIdHash,
  });
  const [coveragePolicyPda] = deriveCoveragePolicyPda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
    member: member.publicKey,
  });
  const [coverageNftPda] = deriveCoverageNftPda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
    member: member.publicKey,
  });
  const [premiumLedgerPda] = derivePremiumLedgerPda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
    member: member.publicKey,
  });
  const [poolAssetVaultPda] = derivePoolAssetVaultPda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
    payoutMint: payoutMint.publicKey,
  });
  const [premiumReplayPda] = derivePremiumReplayPda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
    member: member.publicKey,
    replayHash,
  });
  const [coverageClaimPda] = deriveCoverageClaimPda({
    programId: program.publicKey,
    poolAddress: pool.publicKey,
    member: member.publicKey,
    intentHash,
  });

  const voteTx = client.buildSubmitOutcomeAttestationVoteTx!({
    oracle: oracle.publicKey.toBase58(),
    poolAddress: pool.publicKey.toBase58(),
    member: member.publicKey.toBase58(),
    cycleId,
    ruleHashHex,
    schemaKeyHashHex,
    attestationDigestHex: 'aa'.repeat(32),
    observedValueHashHex: 'bb'.repeat(32),
    asOfTs: 1234,
    passed: true,
    recentBlockhash,
    programId: program.publicKey.toBase58(),
  });
  assert.deepEqual(toMeta(voteTx.instructions[0]).slice(0, 5), [
    { pubkey: oracle.publicKey.toBase58(), isSigner: true, isWritable: true },
    { pubkey: oracleEntryPda.toBase58(), isSigner: false, isWritable: false },
    { pubkey: configV2Pda.toBase58(), isSigner: false, isWritable: false },
    { pubkey: stakePositionPda.toBase58(), isSigner: false, isWritable: false },
    { pubkey: pool.publicKey.toBase58(), isSigner: false, isWritable: false },
  ]);
  assert.equal(voteTx.instructions[0].keys.length, 13);
  assert.equal(voteTx.instructions[0].keys[5].pubkey.toBase58(), poolOraclePolicyPda.toBase58());
  assert.equal(voteTx.instructions[0].keys[6].pubkey.toBase58(), poolOraclePda.toBase58());
  assert.equal(voteTx.instructions[0].keys[7].pubkey.toBase58(), membershipPda.toBase58());
  assert.equal(voteTx.instructions[0].keys[8].pubkey.toBase58(), poolRulePda.toBase58());
  assert.equal(voteTx.instructions[0].keys[9].pubkey.toBase58(), schemaPda.toBase58());
  assert.equal(voteTx.instructions[0].keys[10].pubkey.toBase58(), votePda.toBase58());
  assert.equal(voteTx.instructions[0].keys[11].pubkey.toBase58(), aggregatePda.toBase58());
  assert.equal(voteTx.instructions[0].keys[12].pubkey.toBase58(), SystemProgram.programId.toBase58());

  const rewardTx = client.buildSubmitRewardClaimTx!({
    claimant: claimant.publicKey.toBase58(),
    poolAddress: pool.publicKey.toBase58(),
    member: member.publicKey.toBase58(),
    cycleId,
    ruleHashHex,
    intentHashHex,
    payoutAmount: 10n,
    recipient: claimant.publicKey.toBase58(),
    recipientSystemAccount: recipientSystemAccount.publicKey.toBase58(),
    recentBlockhash,
    programId: program.publicKey.toBase58(),
  });
  assert.equal(rewardTx.instructions[0].keys.length, 15);
  assert.equal(rewardTx.instructions[0].keys[1].pubkey.toBase58(), configV2Pda.toBase58());
  assert.equal(rewardTx.instructions[0].keys[3].pubkey.toBase58(), poolTermsPda.toBase58());
  assert.equal(rewardTx.instructions[0].keys[4].pubkey.toBase58(), poolOraclePolicyPda.toBase58());
  assert.equal(rewardTx.instructions[0].keys[5].pubkey.toBase58(), membershipPda.toBase58());
  assert.equal(rewardTx.instructions[0].keys[6].pubkey.toBase58(), aggregatePda.toBase58());
  assert.equal(rewardTx.instructions[0].keys[8].pubkey.toBase58(), program.publicKey.toBase58());
  assert.equal(rewardTx.instructions[0].keys[9].pubkey.toBase58(), program.publicKey.toBase58());
  assert.equal(rewardTx.instructions[0].keys[10].pubkey.toBase58(), program.publicKey.toBase58());
  assert.equal(rewardTx.instructions[0].keys[12].pubkey.toBase58(), claimRecordV2Pda.toBase58());
  assert.equal(rewardTx.instructions[0].keys[13].pubkey.toBase58(), tokenProgram);
  assert.equal(rewardTx.instructions[0].keys[14].pubkey.toBase58(), SystemProgram.programId.toBase58());

  const registerProductTx = client.buildRegisterCoverageProductV2Tx!({
    authority: authority.publicKey.toBase58(),
    poolAddress: pool.publicKey.toBase58(),
    productIdHashHex,
    displayName: 'Coverage Plus',
    metadataUri: 'https://coverage.example/product',
    termsHashHex: 'cd'.repeat(32),
    durationSecs: 86400,
    premiumDueEverySecs: 3600,
    premiumGraceSecs: 600,
    premiumAmount: 50n,
    active: true,
    recentBlockhash,
    programId: program.publicKey.toBase58(),
  });
  assert.deepEqual(
    toMeta(registerProductTx.instructions[0]),
    [
      { pubkey: authority.publicKey.toBase58(), isSigner: true, isWritable: true },
      { pubkey: configV2Pda.toBase58(), isSigner: false, isWritable: false },
      { pubkey: pool.publicKey.toBase58(), isSigner: false, isWritable: false },
      { pubkey: coverageProductPda.toBase58(), isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId.toBase58(), isSigner: false, isWritable: false },
    ],
  );

  const subscribeProductTx = client.buildSubscribeCoverageProductV2Tx!({
    member: member.publicKey.toBase58(),
    poolAddress: pool.publicKey.toBase58(),
    productIdHashHex,
    startsAt: 123456,
    recentBlockhash,
    programId: program.publicKey.toBase58(),
  });
  assert.deepEqual(toMeta(subscribeProductTx.instructions[0]), [
    { pubkey: member.publicKey.toBase58(), isSigner: true, isWritable: true },
    { pubkey: configV2Pda.toBase58(), isSigner: false, isWritable: false },
    { pubkey: pool.publicKey.toBase58(), isSigner: false, isWritable: false },
    { pubkey: membershipPda.toBase58(), isSigner: false, isWritable: false },
    { pubkey: coverageProductPda.toBase58(), isSigner: false, isWritable: false },
    { pubkey: coveragePolicyPda.toBase58(), isSigner: false, isWritable: true },
    { pubkey: coverageNftPda.toBase58(), isSigner: false, isWritable: true },
    { pubkey: SystemProgram.programId.toBase58(), isSigner: false, isWritable: false },
  ]);

  const payPremiumTx = client.buildPayPremiumOnchainTx!({
    payer: claimant.publicKey.toBase58(),
    poolAddress: pool.publicKey.toBase58(),
    member: member.publicKey.toBase58(),
    payoutMint: payoutMint.publicKey.toBase58(),
    periodIndex: 1n,
    amount: 20n,
    payerTokenAccount: payerTokenAccount.publicKey.toBase58(),
    poolVaultTokenAccount: poolVaultTokenAccount.publicKey.toBase58(),
    recentBlockhash,
    programId: program.publicKey.toBase58(),
  });
  assert.equal(payPremiumTx.instructions[0].keys.length, 12);
  assert.equal(payPremiumTx.instructions[0].keys[1].pubkey.toBase58(), configV2Pda.toBase58());
  assert.equal(payPremiumTx.instructions[0].keys[3].pubkey.toBase58(), poolTermsPda.toBase58());
  assert.equal(payPremiumTx.instructions[0].keys[7].pubkey.toBase58(), poolAssetVaultPda.toBase58());

  const attestPremiumTx = client.buildAttestPremiumPaidOffchainTx!({
    oracle: oracle.publicKey.toBase58(),
    poolAddress: pool.publicKey.toBase58(),
    member: member.publicKey.toBase58(),
    periodIndex: 1n,
    replayHashHex,
    amount: 20n,
    paidAtTs: 2222,
    recentBlockhash,
    programId: program.publicKey.toBase58(),
  });
  assert.deepEqual(toMeta(attestPremiumTx.instructions[0]).slice(0, 4), [
    { pubkey: oracle.publicKey.toBase58(), isSigner: true, isWritable: true },
    { pubkey: configV2Pda.toBase58(), isSigner: false, isWritable: false },
    { pubkey: oracleEntryPda.toBase58(), isSigner: false, isWritable: false },
    { pubkey: pool.publicKey.toBase58(), isSigner: false, isWritable: false },
  ]);
  assert.equal(attestPremiumTx.instructions[0].keys[6].pubkey.toBase58(), premiumLedgerPda.toBase58());
  assert.equal(attestPremiumTx.instructions[0].keys[7].pubkey.toBase58(), premiumReplayPda.toBase58());

  const submitCoverageTx = client.buildSubmitCoverageClaimTx!({
    claimant: claimant.publicKey.toBase58(),
    poolAddress: pool.publicKey.toBase58(),
    member: member.publicKey.toBase58(),
    intentHashHex,
    eventHashHex: 'ef'.repeat(32),
    recentBlockhash,
    programId: program.publicKey.toBase58(),
  });
  assert.deepEqual(toMeta(submitCoverageTx.instructions[0]).slice(0, 4), [
    { pubkey: claimant.publicKey.toBase58(), isSigner: true, isWritable: true },
    { pubkey: configV2Pda.toBase58(), isSigner: false, isWritable: false },
    { pubkey: pool.publicKey.toBase58(), isSigner: false, isWritable: false },
    { pubkey: coveragePolicyPda.toBase58(), isSigner: false, isWritable: true },
  ]);
  assert.equal(submitCoverageTx.instructions[0].keys[5].pubkey.toBase58(), coverageClaimPda.toBase58());

  const settleCoverageTx = client.buildSettleCoverageClaimTx!({
    authority: authority.publicKey.toBase58(),
    claimant: claimant.publicKey.toBase58(),
    poolAddress: pool.publicKey.toBase58(),
    member: member.publicKey.toBase58(),
    intentHashHex,
    payoutAmount: 30n,
    recipientSystemAccount: claimant.publicKey.toBase58(),
    poolAssetVault: poolAssetVaultPda.toBase58(),
    poolVaultTokenAccount: poolVaultTokenAccount.publicKey.toBase58(),
    recipientTokenAccount: recipientTokenAccount.publicKey.toBase58(),
    recentBlockhash,
    programId: program.publicKey.toBase58(),
  });
  assert.equal(settleCoverageTx.instructions[0].keys.length, 13);
  assert.equal(settleCoverageTx.instructions[0].keys[0].pubkey.toBase58(), authority.publicKey.toBase58());
  assert.equal(settleCoverageTx.instructions[0].keys[1].pubkey.toBase58(), claimant.publicKey.toBase58());
  assert.equal(settleCoverageTx.instructions[0].keys[2].pubkey.toBase58(), configV2Pda.toBase58());
  assert.equal(settleCoverageTx.instructions[0].keys[6].pubkey.toBase58(), coverageClaimPda.toBase58());
  assert.equal(settleCoverageTx.instructions[0].keys[11].pubkey.toBase58(), tokenProgram);
});

test('protocol client v2 readers decode extended parity accounts', async () => {
  const program = Keypair.generate().publicKey;
  const pool = Keypair.generate().publicKey;
  const oracle = Keypair.generate().publicKey;
  const admin = Keypair.generate().publicKey;
  const issuer = Keypair.generate().publicKey;
  const member = Keypair.generate().publicKey;
  const claimant = Keypair.generate().publicKey;
  const recipient = Keypair.generate().publicKey;
  const payoutMint = Keypair.generate().publicKey;
  const nftMint = Keypair.generate().publicKey;

  const cycleId = 'cycle-parity-read';
  const cycleHash = hashStringTo32(cycleId);
  const ruleHash = Buffer.alloc(32, 7);
  const ruleHashHex = ruleHash.toString('hex');
  const nonceHash = Buffer.alloc(32, 8);
  const nonceHashHex = nonceHash.toString('hex');
  const inviteIdHash = Buffer.alloc(32, 9);
  const productIdHash = Buffer.alloc(32, 10);
  const productIdHashHex = productIdHash.toString('hex');
  const replayHash = Buffer.alloc(32, 11);
  const replayHashHex = replayHash.toString('hex');
  const intentHash = Buffer.alloc(32, 12);
  const intentHashHex = intentHash.toString('hex');
  const eventHash = Buffer.alloc(32, 13);
  const digestHash = Buffer.alloc(32, 14);
  const observedHash = Buffer.alloc(32, 15);

  const [oracleProfilePda] = deriveOracleProfilePda({
    programId: program,
    oracle,
  });
  const [enrollmentReplayPda] = deriveEnrollmentReplayPda({
    programId: program,
    poolAddress: pool,
    member,
    nonceHash,
  });
  const [attestationVotePda] = deriveAttestationVotePda({
    programId: program,
    poolAddress: pool,
    member,
    cycleHash,
    ruleHash,
    oracle,
  });
  const [claimRecordV2Pda] = deriveClaimV2Pda({
    programId: program,
    poolAddress: pool,
    member,
    cycleHash,
    ruleHash,
  });
  const [coverageProductPda] = deriveCoverageProductPda({
    programId: program,
    poolAddress: pool,
    productIdHash,
  });
  const [coverageNftPda] = deriveCoverageNftPda({
    programId: program,
    poolAddress: pool,
    member,
  });
  const [premiumReplayPda] = derivePremiumReplayPda({
    programId: program,
    poolAddress: pool,
    member,
    replayHash,
  });
  const [coverageClaimPda] = deriveCoverageClaimPda({
    programId: program,
    poolAddress: pool,
    member,
    intentHash,
  });

  const accounts = new Map<string, Buffer>();
  accounts.set(
    oracleProfilePda.toBase58(),
    Buffer.concat([
      anchorDiscriminator('account', 'OracleProfile'),
      oracle.toBuffer(),
      admin.toBuffer(),
      Buffer.from([3]),
      encodeString('Oracle Prime'),
      encodeString('Oracle Prime LLC'),
      encodeString('https://oracle.prime'),
      encodeString('https://app.oracle.prime'),
      encodeString('https://oracle.prime/logo.png'),
      encodeString('https://oracle.prime/webhook'),
      Buffer.from([2]),
      Buffer.alloc(32, 1),
      Buffer.alloc(32, 2),
      ...Array.from({ length: 14 }, () => Buffer.alloc(32)),
      Buffer.from([1]),
      encodeI64Le(111n),
      encodeI64Le(222n),
      Buffer.from([5]),
    ]),
  );
  accounts.set(
    enrollmentReplayPda.toBase58(),
    Buffer.concat([
      anchorDiscriminator('account', 'EnrollmentPermitReplay'),
      pool.toBuffer(),
      issuer.toBuffer(),
      member.toBuffer(),
      nonceHash,
      inviteIdHash,
      encodeI64Le(333n),
      Buffer.from([6]),
    ]),
  );
  accounts.set(
    attestationVotePda.toBase58(),
    Buffer.concat([
      anchorDiscriminator('account', 'AttestationVote'),
      pool.toBuffer(),
      member.toBuffer(),
      Buffer.from(cycleHash),
      ruleHash,
      oracle.toBuffer(),
      Buffer.from([1]),
      digestHash,
      observedHash,
      encodeI64Le(444n),
      Buffer.from([7]),
    ]),
  );
  accounts.set(
    claimRecordV2Pda.toBase58(),
    Buffer.concat([
      anchorDiscriminator('account', 'ClaimRecordV2'),
      pool.toBuffer(),
      member.toBuffer(),
      claimant.toBuffer(),
      Buffer.from(cycleHash),
      ruleHash,
      intentHash,
      payoutMint.toBuffer(),
      encodeU64Le(12n),
      recipient.toBuffer(),
      encodeI64Le(555n),
      Buffer.from([8]),
    ]),
  );
  accounts.set(
    coverageProductPda.toBase58(),
    Buffer.concat([
      anchorDiscriminator('account', 'CoverageProduct'),
      pool.toBuffer(),
      admin.toBuffer(),
      productIdHash,
      Buffer.from([1]),
      encodeString('Coverage Prime'),
      encodeString('https://coverage.prime/product'),
      Buffer.alloc(32, 3),
      encodeI64Le(86_400n),
      encodeI64Le(3_600n),
      encodeI64Le(600n),
      encodeU64Le(99n),
      encodeI64Le(666n),
      encodeI64Le(777n),
      Buffer.from([9]),
    ]),
  );
  accounts.set(
    coverageNftPda.toBase58(),
    Buffer.concat([
      anchorDiscriminator('account', 'CoveragePolicyPositionNft'),
      pool.toBuffer(),
      member.toBuffer(),
      nftMint.toBuffer(),
      encodeString('https://coverage.prime/nft'),
      Buffer.from([10]),
    ]),
  );
  accounts.set(
    premiumReplayPda.toBase58(),
    Buffer.concat([
      anchorDiscriminator('account', 'PremiumAttestationReplay'),
      pool.toBuffer(),
      member.toBuffer(),
      encodeU64Le(5n),
      replayHash,
      oracle.toBuffer(),
      encodeI64Le(888n),
      Buffer.from([11]),
    ]),
  );
  accounts.set(
    coverageClaimPda.toBase58(),
    Buffer.concat([
      anchorDiscriminator('account', 'CoverageClaimRecord'),
      pool.toBuffer(),
      member.toBuffer(),
      claimant.toBuffer(),
      intentHash,
      eventHash,
      Buffer.from([1]),
      encodeI64Le(999n),
      encodeI64Le(1_111n),
      Buffer.from([12]),
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

  const oracleProfile = await client.fetchOracleProfile!(oracle.toBase58());
  assert.equal(oracleProfile?.admin, admin.toBase58());
  assert.equal(oracleProfile?.supportedSchemaCount, 2);
  assert.deepEqual(oracleProfile?.supportedSchemaKeyHashesHex, [
    Buffer.alloc(32, 1).toString('hex'),
    Buffer.alloc(32, 2).toString('hex'),
  ]);

  const enrollmentReplay = await client.fetchEnrollmentPermitReplay!({
    poolAddress: pool.toBase58(),
    member: member.toBase58(),
    nonceHashHex,
  });
  assert.equal(enrollmentReplay?.issuer, issuer.toBase58());
  assert.equal(enrollmentReplay?.inviteIdHashHex, inviteIdHash.toString('hex'));

  const vote = await client.fetchAttestationVote!({
    poolAddress: pool.toBase58(),
    member: member.toBase58(),
    cycleId,
    ruleHashHex,
    oracle: oracle.toBase58(),
  });
  assert.equal(vote?.passed, true);
  assert.equal(vote?.attestationDigestHex, digestHash.toString('hex'));

  const claimRecordV2 = await client.fetchClaimRecordV2!({
    poolAddress: pool.toBase58(),
    member: member.toBase58(),
    cycleId,
    ruleHashHex,
  });
  assert.equal(claimRecordV2?.claimant, claimant.toBase58());
  assert.equal(claimRecordV2?.recipient, recipient.toBase58());

  const coverageProduct = await client.fetchCoverageProduct!({
    poolAddress: pool.toBase58(),
    productIdHashHex,
  });
  assert.equal(coverageProduct?.displayName, 'Coverage Prime');
  assert.equal(coverageProduct?.premiumAmount, 99n);

  const coverageNft = await client.fetchCoveragePolicyPositionNft!({
    poolAddress: pool.toBase58(),
    member: member.toBase58(),
  });
  assert.equal(coverageNft?.nftMint, nftMint.toBase58());

  const premiumReplay = await client.fetchPremiumAttestationReplay!({
    poolAddress: pool.toBase58(),
    member: member.toBase58(),
    replayHashHex,
  });
  assert.equal(premiumReplay?.periodIndex, 5n);
  assert.equal(premiumReplay?.oracle, oracle.toBase58());

  const coverageClaim = await client.fetchCoverageClaimRecord!({
    poolAddress: pool.toBase58(),
    member: member.toBase58(),
    intentHashHex,
  });
  assert.equal(coverageClaim?.claimant, claimant.toBase58());
  assert.equal(coverageClaim?.eventHashHex, eventHash.toString('hex'));
});
