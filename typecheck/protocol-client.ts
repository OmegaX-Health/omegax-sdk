import type { Connection } from '@solana/web3.js';

import { createProtocolClient } from '../src/protocol.js';
import type { ProtocolClient } from '../src/types.js';

declare const connection: Connection;
declare const programId: string;
declare const authority: string;
declare const recentBlockhash: string;
declare const protocolGovernance: string;
declare const reserveDomain: string;

function assertProtocolClient(protocol: ProtocolClient) {
  void protocol.buildCreateReserveDomainTx({
    args: {
      domain_id: 'typecheck-domain',
      display_name: 'Typecheck Domain',
      domain_admin: authority,
      settlement_mode: 0,
      legal_structure_hash: new Uint8Array(32),
      compliance_baseline_hash: new Uint8Array(32),
      allowed_rail_mask: 1,
      pause_flags: 0,
    },
    accounts: {
      authority,
      protocol_governance: protocolGovernance,
      reserve_domain: reserveDomain,
    },
    recentBlockhash,
  });
}

const inferredProtocol = createProtocolClient(connection, programId);
assertProtocolClient(inferredProtocol);

const annotatedProtocol: ProtocolClient = createProtocolClient(
  connection,
  programId,
);
assertProtocolClient(annotatedProtocol);
