import {
  SystemProgram,
  type AccountInfo,
  type Commitment,
  type Connection,
  type PublicKey,
} from '@solana/web3.js';

function createAccountInfo(data: Buffer): AccountInfo<Buffer> {
  return {
    data,
    executable: false,
    lamports: 0,
    owner: SystemProgram.programId,
    rentEpoch: 0,
  };
}

export function createAccountReaderConnectionStub(
  accounts: ReadonlyMap<string, Buffer>,
): Connection {
  const connectionStub = {
    async getAccountInfo(pubkey: PublicKey, commitment?: Commitment) {
      void commitment;
      const data = accounts.get(pubkey.toBase58());
      return data ? createAccountInfo(data) : null;
    },
  };

  return connectionStub as unknown as Connection;
}
