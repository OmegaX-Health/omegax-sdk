import type { Connection } from '@solana/web3.js';

import { createProtocolClient } from '../src/protocol.js';
import type { ProtocolClient } from '../src/types.js';

declare const connection: Connection;
declare const programId: string;
declare const authority: string;
declare const recentBlockhash: string;

function assertProtocolClient(protocol: ProtocolClient) {
  void protocol.buildCreatePoolTx({
    authority,
    poolId: 'typecheck-pool',
    organizationRef: 'typecheck-org',
    payoutLamportsPerPass: 1n,
    membershipMode: 0,
    tokenGateMint: '11111111111111111111111111111111',
    tokenGateMinBalance: 0n,
    inviteIssuer: '11111111111111111111111111111111',
    poolType: 0,
    payoutAssetMint: '11111111111111111111111111111111',
    termsHashHex: '11'.repeat(32),
    payoutPolicyHashHex: '22'.repeat(32),
    cycleMode: 0,
    metadataUri: 'https://example.com/pool/typecheck',
    recentBlockhash,
    programId,
  });
}

const inferredProtocol = createProtocolClient(connection, programId);
assertProtocolClient(inferredProtocol);

const annotatedProtocol: ProtocolClient = createProtocolClient(
  connection,
  programId,
);
assertProtocolClient(annotatedProtocol);
